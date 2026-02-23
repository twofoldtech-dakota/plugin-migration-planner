# Data Flow Reference

## Table of Contents
- [Full Pipeline Overview](#full-pipeline-overview)
- [DB Query Patterns](#db-query-patterns)
- [Server Load Patterns](#server-load-patterns)
- [API Mutation Patterns](#api-mutation-patterns)
- [Reactive Recomputation](#reactive-recomputation)
- [Composition Engine](#composition-engine)
- [Fallback Cascade](#fallback-cascade)
- [MCP Tool Data Flow](#mcp-tool-data-flow)

## Full Pipeline Overview

```
MCP Tools (Claude skills)
  ↓ save_discovery, save_analysis, etc.
PostgreSQL (packages/db/)
  ↓ Drizzle queries
+page.server.ts (server loads)
  ↓ returns { assessment, discovery, analysis, estimate }
+page.svelte (components)
  ↓ let { data } = $props()
  ↓ $derived() for reactive computations
UI renders

Mutations:
  Component → fetch('/api/...') → API route → DB write → json response
  Component → invalidateAll() → server loads re-run → UI updates
```

## DB Query Patterns

### Single row fetch
```typescript
export async function getAssessmentById(db: Database, id: string) {
  const result = await db.select().from(assessments).where(eq(assessments.id, id));
  return result[0] ?? null;
}
```

### Multi-row fetch
```typescript
export async function getRisks(db: Database, assessmentId: string) {
  return db.select().from(risks).where(eq(risks.assessment_id, assessmentId));
}
```

### Upsert pattern (discovery answers)
```typescript
export async function saveDiscovery(db: Database, input: DiscoveryInput) {
  return db.transaction(async (tx) => {
    // Delete existing for this dimension, then re-insert
    await tx.delete(discoveryAnswers)
      .where(and(
        eq(discoveryAnswers.assessment_id, input.assessment_id),
        eq(discoveryAnswers.dimension, input.dimension)
      ));
    if (Object.keys(input.answers).length > 0) {
      await tx.insert(discoveryAnswers).values(
        Object.entries(input.answers).map(([qid, answer]) => ({
          assessment_id: input.assessment_id,
          dimension: input.dimension,
          question_id: qid,
          ...answer
        }))
      );
    }
    return { success: true };
  });
}
```

### Transaction for multi-table writes
```typescript
export async function saveAnalysis(db: Database, input: AnalysisInput) {
  return db.transaction(async (tx) => {
    await tx.delete(risks).where(eq(risks.assessment_id, input.assessment_id));
    await tx.delete(assumptions).where(eq(assumptions.assessment_id, input.assessment_id));
    if (input.risks.length) await tx.insert(risks).values(input.risks);
    if (input.assumptions.length) await tx.insert(assumptions).values(input.assumptions);
    return { success: true };
  });
}
```

## Server Load Patterns

### Parallel loading (standard)
```typescript
export const load: PageServerLoad = async ({ params }) => {
  const [assessment, discovery, analysis, estimate] = await Promise.all([
    getAssessmentById(db(), params.id),
    getDiscovery(db(), params.id),
    getAnalysis(db(), params.id),
    getEstimate(db(), params.id),
  ]);
  return { assessment, discovery, analysis, estimate };
};
```

### With computed summary
```typescript
export const load: PageServerLoad = async ({ params }) => {
  const [assessment, discovery] = await Promise.all([...]);

  // Compute server-side summaries
  const discoveryPercent = computeDiscoveryCompletion(discovery);
  return { assessment, discovery, summary: { discoveryPercent } };
};
```

### With fallback knowledge loading
```typescript
// Try DB first, fall back to JSON files
let aiAlternatives: any[] = [];
try {
  const knowledge = await import('$lib/server/knowledge');
  aiAlternatives = knowledge.getAiAlternatives();
} catch (e) {
  console.error('Failed to load AI alternatives:', e);
}
```

## API Mutation Patterns

### Standard PATCH
```typescript
// routes/api/assessments/[id]/assumptions/[assumptionId]/+server.ts
export const PATCH: RequestHandler = async ({ params, request }) => {
  const body = await request.json();
  await updateAssumption(db(), {
    assessment_id: params.id,
    assumption_id: params.assumptionId,
    validation_status: body.validation_status
  });
  return json({ success: true });
};
```

### With recomputation trigger
```typescript
export const PATCH: RequestHandler = async ({ params, request }) => {
  const body = await request.json();
  await updateThing(db(), params.id, body);

  // Trigger reactive recomputation of analysis + estimate
  const result = await recomputeAll(params.id);
  return json({ success: true, ...result });
};
```

### Client-side mutation call
```typescript
async function validateAssumption(id: string) {
  const res = await fetch(`/api/assessments/${$page.params.id}/assumptions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ validation_status: 'validated' })
  });
  if (res.ok) {
    await invalidateAll(); // Re-runs all +page.server.ts loads
  }
}
```

## Reactive Recomputation

`apps/web/src/lib/server/recompute.ts` — triggered after discovery, assumption, or scope changes:

1. Load current assessment + discovery + existing analysis from DB
2. Try DB composition engine (resolves all knowledge packs from stacks)
3. Fall back to JSON files in `skills/migrate-knowledge/` if composition unavailable
4. Run analysis engine (detect multipliers, gotchas, compute risks)
5. Run estimate engine (phase effort + role breakdown + AI scenarios)
6. Save results back to DB
7. Frontend calls `invalidateAll()` to pick up new data

## Composition Engine

`packages/db/src/queries/composition.ts`:

### resolvePackIds
Reads assessment's `source_stack` and `target_stack` JSONB. Extracts all pack IDs with priority:
- Infrastructure packs: priority 10 (highest — wins conflicts)
- Platform packs: priority 20
- Service packs: priority 30 (lowest)

Also finds the relevant migration path (e.g., `aws` -> `azure`).

### composeDiscoveryTree
Fetches discovery trees for all resolved packs. Merges dimensions by ID — higher-priority pack wins on conflict. Returns flat `dimensions[]` array.

### composeHeuristics
Merges across packs:
- **Effort hours**: additive (all packs contribute)
- **Multipliers**: deduplicated by ID, higher-priority wins
- **Gotchas**: deduplicated by ID, higher-priority wins
- **Dependency chains**: merged, deduplicated
- **Phase mappings**: merged with ordering
- **Roles**: merged, deduplicated

Then overlays migration path adjustments (path-specific effort overrides, additional gotchas).

## Fallback Cascade

Multi-level fallbacks ensure the app works even without full DB composition:

| Data | Level 1 (preferred) | Level 2 | Level 3 (last resort) |
|------|---------------------|---------|----------------------|
| Discovery tree | `get_composed_discovery_tree` | `get_discovery_tree` (single pack) | JSON: `skills/migrate-knowledge/discovery/discovery-tree.json` |
| Heuristics | `get_composed_heuristics` | `get_heuristics` (single pack) | JSON files in `skills/migrate-knowledge/heuristics/` |
| Assessments | DB query | — | Auto-import from `.migration/*.json` |

## MCP Tool Data Flow

Skills (running in Claude) communicate exclusively through MCP tools:

```
Skill (SKILL.md instructions)
  → calls MCP tool (e.g., save_discovery)
    → MCP server handler
      → Drizzle query → PostgreSQL
        → returns result
      ← JSON response
    ← MCP tool result
  ← Skill processes result, may call more tools
```

Skills also write to `.migration/` directory for portability:
- `.migration/assessment.json` — assessment metadata
- `.migration/discovery.json` — discovery answers
- `.migration/analysis.json` — risks, assumptions, multipliers
- `.migration/estimate.json` — phased effort breakdown
