# /migrate research — Platform Research Pipeline

Deep-research any platform and build a complete knowledge pack by running a coordinated team of research agents. Each agent writes structured data directly to the database via MCP tools.

## Usage

```
/migrate research <platform_name>
```

Where `<platform_name>` is the platform to research (e.g., "Sitecore XP", "Umbraco", "Optimizely CMS", "AWS", "Azure").

## Instructions

### 1. Parse Input & Initialize

1. Parse the platform name from the user's command argument.
2. Generate a `platform_id` from the name: lowercase, replace spaces with hyphens, remove special characters (e.g., "Sitecore XP" → `sitecore-xp`, "Optimizely CMS" → `optimizely-cms`).
3. Determine the `category` by asking the user if unclear:
   - `cms` — Content management systems and DXPs
   - `commerce` — E-commerce platforms
   - `martech` — Marketing technology tools
   - `ai_dev` — AI and development tools
   - `infrastructure` — Cloud providers and hosting
   - `services` — Supporting services (databases, search, cache)
   - `data` — Data infrastructure and ETL
4. Determine the `vendor` from the platform name.
5. Check if this pack already exists: call `get_knowledge_pack` with `pack_id`. If it exists, ask the user if they want to update the existing pack or start fresh.

### 2. Read Research Agent Definitions

Read the shared schema and all agent definitions:
- `skills/migrate-research/SCHEMA.md` — shared protocol, formats, quality gates
- `skills/migrate-research/agents/architecture-analyst.md`
- `skills/migrate-research/agents/version-historian.md`
- `skills/migrate-research/agents/ecosystem-scout.md`
- `skills/migrate-research/agents/gotcha-miner.md`
- `skills/migrate-research/agents/effort-calibrator.md`
- `skills/migrate-research/agents/security-auditor.md`
- `skills/migrate-research/agents/licensing-analyst.md`
- `skills/migrate-research/agents/path-mapper.md`
- `skills/migrate-research/agents/discovery-builder.md`

### 3. Run Architecture Analyst (Stage 1)

This agent runs **first** — all others depend on its output.

1. Follow the instructions in `agents/architecture-analyst.md`
2. Pass: `platform_name`, `platform_id`, `category`, `vendor`
3. Execute the full research protocol: web search, cross-reference, structure, save
4. Call `save_knowledge_pack` with the architecture findings
5. Call `save_source_urls` with all sources consulted
6. Present the Architecture Analyst summary to the user

**Checkpoint:** Show the user the component map and ask: "Architecture research complete. Does this look right before I continue with the deep-dive agents?"

If the user wants corrections, update the pack accordingly before proceeding.

### 4. Run Parallel Agent Batch (Stage 2)

Run these 5 agents sequentially (but each operates independently on the pack):

1. **Version Historian** — follow `agents/version-historian.md`
   - Update `supported_versions`, `eol_versions`, `latest_version` on the pack
   - Show summary when complete

2. **Ecosystem Scout** — follow `agents/ecosystem-scout.md`
   - Update `compatible_targets`, `compatible_infrastructure`, `required_services`, `optional_services`
   - Show summary when complete

3. **Gotcha Miner** — follow `agents/gotcha-miner.md`
   - Write gotcha patterns to `save_heuristics`
   - Show summary with pattern counts by severity

4. **Security Auditor** — follow `agents/security-auditor.md`
   - Write security-specific gotcha patterns to `save_heuristics`
   - Show summary with CVE and compliance findings

5. **Licensing Analyst** — follow `agents/licensing-analyst.md`
   - Save source URLs with licensing data
   - Show summary with pricing model and lock-in factors

After each agent completes, show a brief progress update:
```
[2/5] Version Historian complete — 4 supported versions, 2 EOL
[3/5] Ecosystem Scout complete — 6 compatible targets found
...
```

### 5. Run Discovery Builder (Stage 3)

1. Follow `agents/discovery-builder.md`
2. Reads the pack metadata, gotcha patterns, and multipliers already saved
3. Generates discovery dimensions with questions that cover all heuristic condition keys
4. Calls `save_discovery_tree`
5. Show summary with dimension/question counts and heuristic coverage %

### 6. Run Effort Calibrator (Stage 3, after Discovery Builder)

1. Follow `agents/effort-calibrator.md`
2. Reads the pack, gotcha patterns, and discovery tree
3. Generates effort hours, multipliers, dependency chains, phase mappings, and roles
4. Calls `save_heuristics` (this merges with existing gotcha patterns from Stage 2)
5. Show summary with component/phase counts and total base hours

### 7. Run Path Mapper (Stage 4, optional)

If the Ecosystem Scout found `compatible_targets`:

1. Ask the user: "Found <N> common migration targets: <list>. Which should I map migration paths for? (all / specific ones / skip)"
2. For each selected target:
   - Check if the target pack exists in the DB via `get_knowledge_pack`. If not, note it as a gap.
   - Follow `agents/path-mapper.md` with the source and target
   - Call `save_migration_path`
   - Show summary

If no compatible targets or user skips, note this as a gap.

### 8. Validate — Pack-Level Quality Gates

Run the pack-level quality gates from `SCHEMA.md`:

```
Pack Quality Report — <platform_name>
─────────────────────────────────────
Component coverage:    <count>/5 minimum   [PASS/FAIL]
Discovery coverage:    <dims>/5 minimum    [PASS/FAIL]
  Questions per dim:   <min>-<max> (need ≥3 each)
Gotcha coverage:       <count>/10 minimum  [PASS/FAIL]
Multiplier coverage:   <count>/3 minimum   [PASS/FAIL]
Version coverage:      <count>/2 minimum   [PASS/FAIL]
Heuristic key coverage: <pct>%             [PASS/FAIL if <100%]

Source URLs:           <count> total
  Verified:            <count>
  Community:           <count>
  Unverified:          <count> (<pct>%, threshold ≤30%)

Overall: [PASS / FAIL — <reasons>]
```

If any gate fails:
- Identify which agent needs to re-run
- Re-run that agent's research protocol with a focus on the gap
- Re-validate

### 9. Present Final Summary

```
## Knowledge Pack Complete: <platform_name>

### Pack Metadata
- ID: <platform_id>
- Category: <category>
- Latest version: <version>
- Confidence: draft (awaiting human review)

### Research Coverage
- Components: <count>
- Discovery dimensions: <count> (<question count> questions)
- Gotcha patterns: <count> (<total hours at risk>h at risk)
- Complexity multipliers: <count>
- Effort components: <count> (<total base hours>h base)
- Dependency chains: <count>
- Migration paths: <count>
- Source URLs: <count>

### Quality Score: <PASS/FAIL>

### Next Steps
- Review the generated knowledge pack for accuracy
- Run `/migrate research <target_platform>` for target platforms that don't have packs yet
- Create a test assessment with `/migrate new` to verify the pack works end-to-end
- Promote pack confidence from `draft` to `preliminary` after review
```

### 10. Pin Version

After all research is complete and validated, the pack is at version 1. Future research re-runs will auto-increment the version. Existing assessments pinned to version 1 won't be affected by future updates.

## Notes

- Each agent uses `WebSearch` and `WebFetch` for live research. This takes time — set expectations with the user.
- All data is saved incrementally. If the pipeline is interrupted, progress is preserved and can be resumed.
- The pack starts with `confidence: "draft"`. It should be reviewed by a human before being promoted to `"preliminary"` or `"verified"`.
- Re-running `/migrate research <platform>` on an existing pack will update it — `save_knowledge_pack` uses upsert and `save_heuristics` atomically replaces.
