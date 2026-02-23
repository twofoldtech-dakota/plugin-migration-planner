# Architecture Reference

## Table of Contents
- [Monorepo Structure](#monorepo-structure)
- [SvelteKit Route Patterns](#sveltekit-route-patterns)
- [Component Patterns](#component-patterns)
- [TypeScript Conventions](#typescript-conventions)
- [Naming Rules](#naming-rules)
- [DB Schema Patterns](#db-schema-patterns)
- [MCP Server Patterns](#mcp-server-patterns)
- [Skill Structure](#skill-structure)

## Monorepo Structure

npm workspaces: `packages/*` and `apps/*`. Scoped names: `@migration-planner/db`, `@migration-planner/web`.

```
packages/db/
  src/
    schema.ts             — All Drizzle table definitions
    connection.ts         — DB connection factory
    queries/              — Query modules (one per domain)
      composition.ts      — resolvePackIds, composeDiscoveryTree, composeHeuristics
      knowledge-*.ts      — Knowledge pack CRUD
    seed-sitecore-knowledge.ts — Seeds MVP knowledge into DB
  drizzle/                — Migration files

apps/web/
  src/
    app.css               — Tailwind v4 @theme + global styles
    app.html              — HTML shell, meta tags, fonts
    lib/
      components/         — Feature components (PascalCase)
        ui/               — Primitives: Card, Badge, Modal, Tabs, Tooltip, InlineEdit
      server/             — Server-only: db.ts, recompute.ts, knowledge loaders
      utils/              — Shared logic: scenario-engine.ts, condition-evaluator.ts
    routes/               — File-based routing (see below)

apps/mcp-server/
  src/
    index.ts              — Server setup + tool registration
    tools/                — Tool handlers grouped by domain

skills/migrate-*/         — One dir per skill, each has SKILL.md
```

## SvelteKit Route Patterns

### Route tree
```
routes/
  +layout.svelte            — Root: AppHeader, NavigationProgress, View Transitions
  +page.svelte              — Home/landing
  assessments/
    +page.svelte            — Assessment list
    [id]/
      +layout.svelte        — Assessment layout (sidebar + WorkflowProgress)
      +layout.server.ts     — Loads assessment for all child routes
      +page.svelte           — Assessment dashboard
      +page.server.ts       — Loads discovery, analysis, estimate, AI selections
      discovery/+page.svelte  — Discovery answers view
      analysis/+page.svelte   — Risk/assumption view
      estimate/+page.svelte   — Phase breakdown, scenarios
      refine/+page.svelte     — Assumption validation, scope exclusions
      deliverables/+page.svelte — Generated documents
      dashboard/+page.svelte   — KPI overview
      gaps/+page.svelte        — Gap analysis view
      */review/+page.svelte    — Challenge review pages
  api/assessments/[id]/       — REST mutation endpoints
  clients/                    — Client management
  knowledge/                  — Knowledge pack browser
  analytics/                  — Cross-project analytics
  new/                        — New assessment wizard
```

### Server load pattern
```typescript
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { getAssessmentById, getDiscovery } from '@migration-planner/db';

export const load: PageServerLoad = async ({ params }) => {
  const [assessment, discovery] = await Promise.all([
    getAssessmentById(db(), params.id),
    getDiscovery(db(), params.id),
  ]);
  return { assessment, discovery };
};
```

### API route pattern
```typescript
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

export const PATCH: RequestHandler = async ({ params, request }) => {
  const body = await request.json();
  await updateSomething(db(), params.id, body);
  return json({ success: true });
};
```

## Component Patterns

### Svelte 5 runes — required patterns

**Props:** Always use `interface Props` + `$props()`:
```svelte
<script lang="ts">
  interface Props {
    score: number;
    size?: 'sm' | 'md';
  }
  let { score, size = 'md' }: Props = $props();
</script>
```

**Derived state:** Use `$derived()` instead of reactive statements:
```typescript
const angle = $derived((score / 100) * 180);
const color = $derived(score >= 70 ? 'var(--color-success)' : 'var(--color-danger)');
```

**Local mutable state:** Use `$state()`:
```typescript
let isOpen = $state(false);
let aiToggles = $state<Record<string, boolean>>({});
```

**Children:** Use `Snippet` type:
```typescript
import type { Snippet } from 'svelte';
interface Props { children: Snippet; }
let { children }: Props = $props();
// In template: {@render children()}
```

### Page component pattern
```svelte
<script lang="ts">
  import { page } from '$app/stores';
  import { invalidateAll } from '$app/navigation';

  let { data } = $props();

  // Derived from server data
  const assessment = $derived(data.assessment);
  const risks = $derived((data.analysis?.risks ?? []) as any[]);

  // Local UI state
  let scenario = $state<'manual' | 'ai_assisted' | 'best_case'>('ai_assisted');

  // Mutation via API route
  async function handleUpdate(id: string, value: string) {
    await fetch(`/api/assessments/${$page.params.id}/thing/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value })
    });
    await invalidateAll();
  }
</script>
```

## TypeScript Conventions

- **Strict mode** enabled everywhere (`strict: true`, `isolatedModules: true`)
- **Target:** ES2022, Module: Node16
- Props: always `interface Props {}` — no `type Props =`
- Shared types exported from the module that defines them
- `any` allowed at serialization boundaries (MCP JSON, JSONB columns) but guard at use
- Prefer union literals over enums: `type Scenario = 'manual' | 'ai_assisted' | 'best_case'`

## Naming Rules

| Category | Convention | Examples |
|----------|-----------|----------|
| Components | PascalCase `.svelte` | `AppHeader.svelte`, `PhaseBarChart.svelte` |
| UI primitives | PascalCase in `ui/` | `ui/Card.svelte`, `ui/Modal.svelte` |
| Route dirs | kebab-case | `assessments/[id]/discovery/` |
| Utilities | kebab-case `.ts` | `scenario-engine.ts`, `condition-evaluator.ts` |
| DB queries | kebab-case `.ts` | `composition.ts`, `knowledge-discovery.ts` |
| Server files | SvelteKit convention | `+page.server.ts`, `+layout.server.ts` |
| API routes | HTTP verb exports | `export const GET`, `export const PATCH` |
| Skills | `migrate-*` prefix | `skills/migrate-discover/` |
| DB tables | camelCase in Drizzle | `discoveryAnswers`, `activeMultipliers` |
| DB columns | snake_case in SQL | `assessment_id`, `created_at` |

## DB Schema Patterns

```typescript
// Table definition
export const assessments = pgTable("assessments", {
  id: text("id").primaryKey(),
  project_name: text("project_name").notNull(),
  source_stack: jsonb("source_stack").default({}),
  target_stack: jsonb("target_stack").default({}),
  status: text("status").default("discovery"),
  created_at: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

// Foreign key with cascade
export const risks = pgTable("risks", {
  id: text("id").primaryKey(),
  assessment_id: text("assessment_id").notNull()
    .references(() => assessments.id, { onDelete: "cascade" }),
  severity: text("severity").default(""),
});

// Composite primary key
export const discoveryAnswers = pgTable("discovery_answers", {
  assessment_id: text("assessment_id").notNull()
    .references(() => assessments.id, { onDelete: "cascade" }),
  dimension: text("dimension").notNull(),
  question_id: text("question_id").notNull(),
}, (t) => [primaryKey({ columns: [t.assessment_id, t.dimension, t.question_id] })]);
```

## MCP Server Patterns

Tools follow a consistent shape:
```typescript
server.tool(
  "tool_name",
  "Human-readable description",
  { /* Zod-like input schema */ },
  async (input) => {
    const result = await someQuery(db, input);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);
```

Conventions:
- Tool names: `snake_case` (e.g., `save_discovery`, `get_composed_heuristics`)
- Return JSON in text content blocks
- Error responses: `{ isError: true, content: [{ type: "text", text: errorMessage }] }`

## Skill Structure

```
skills/migrate-discover/
  SKILL.md             — Full instructions, discovery workflow, branching logic
  (optional files)     — Fallback data, templates, context
```

Skills invoke MCP tools via the Claude tool-calling interface. They never:
- Import from `packages/db` directly
- Connect to the database
- Modify files outside `.migration/`
