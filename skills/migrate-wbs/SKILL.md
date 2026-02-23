# /migrate wbs — Generate Work Breakdown Structure

Generate an actionable work breakdown structure (Epics/Stories/Tasks) from the refined migration estimate. Output is suitable for import into Jira, Azure DevOps, or other project management tools.

## Instructions

### 1. Load All Data

Load data from MCP tools first, falling back to JSON files:

1. Call `get_assessment` with `project_path` (current working directory). Fall back to `.migration/assessment.json`.
2. Call `get_estimate` with the assessment ID. Fall back to `.migration/estimate.json`.
3. Call `get_analysis` with the assessment ID. Fall back to `.migration/analysis.json`. This includes risks, assumptions, and dependency chains.
4. Optionally load scope exclusions if available (for filtering out excluded components).

If estimate data is unavailable from both MCP and JSON, inform the user and suggest running `/migrate estimate` first.

### 2. Generate the Work Breakdown

Map the estimate data into a hierarchical work item tree:

#### Mapping Rules

| Source | Work Item Type | Details |
|--------|---------------|---------|
| Phase | **Epic** | Title = phase name, hours = sum of component hours |
| In-scope component | **Story** under Epic | Title = component name, hours = final_hours, acceptance criteria from component description |
| Role task (from refinements) | **Task** under Story | hours from role breakdown, assigned role |
| Auto-generated role split | **Task** under Story | If no explicit role tasks, split component hours by `by_role` breakdown |
| Unvalidated assumption | **Spike** under relevant Epic | Title = "Validate: {assumed_value}", priority = high, confidence = low |
| High/critical risk with mitigation | **Story** under relevant Epic | Title = "Mitigate: {description}", hours = estimated_hours_impact |
| Dependency chain | **blocked_by/blocks** | Cross-reference between dependent items |

#### Item Fields

Each work item includes:
- **type**: epic, story, task, or spike
- **title**: Descriptive, actionable title
- **description**: What needs to be done, context
- **hours**: Estimated effort
- **role**: Required role (for tasks)
- **priority**: critical, high, medium, low
- **confidence**: firm (from validated data) or assumption-dependent
- **labels**: Tags for filtering (phase name, component type, etc.)
- **acceptance_criteria**: Definition of done (for stories)
- **sort_order**: Sequential ordering within parent
- **source**: "generated" for auto-created items

### 3. Save to Database

Call `save_wbs_snapshot` with:
- `assessment_id`: The assessment ID
- `estimate_version`: The estimate version used as input
- `items`: The flat array of work items with temporary parent references

The MCP tool handles versioning automatically (auto-increments).

### 4. Write Output File

Create `.migration/deliverables/work-breakdown.json` with the full WBS tree structure:

```json
{
  "assessment_id": "...",
  "estimate_version": 1,
  "generated_at": "ISO timestamp",
  "summary": {
    "total_items": 0,
    "total_hours": 0,
    "by_type": { "epic": 0, "story": 0, "task": 0, "spike": 0 }
  },
  "items": [...]
}
```

### 5. Present Results

Display a summary tree to the user:

```
Work Breakdown Structure (v1)
═══════════════════════════════
Total: {count} items | {hours}h estimated

Epic: Phase 1 — Assessment & Planning (120h)
  ├─ Story: Azure Environment Setup (40h) [firm]
  │   ├─ Task: Provision resource groups (8h) — Cloud Architect
  │   ├─ Task: Configure networking (16h) — Cloud Architect
  │   └─ Task: Set up monitoring (16h) — DevOps Engineer
  ├─ Story: Discovery Documentation (32h) [firm]
  ├─ Spike: Validate database size assumption (8h) [HIGH]
  └─ Story: Mitigate: Legacy API incompatibility (40h)
...
```

Include:
- Total item count and hours
- Breakdown by type (epics, stories, tasks, spikes)
- High-priority spikes that should be addressed first
- Risk mitigation stories with their hour impact
- Suggest viewing in the web UI at `/planning/?assessment={id}&tab=wbs`
- Mention export options (CSV for Jira, JSON for Azure DevOps)

### 6. Export Guidance

Tell the user about export formats:
- **CSV**: Jira-compatible import format with hierarchy via indentation
- **JSON**: Structured format for Azure DevOps or custom tooling
- **Markdown**: Human-readable for documentation or review

Exports are available via the web UI or API at `/api/planning/wbs/export?assessment={id}&format=csv`.

## Gate Check (Pre-Step)

Before generating the WBS, check if the assessment has `challenge_required: true`. If so, call `get_challenge_reviews` for the `estimate` step. If no review exists with status `passed` or `conditional_pass`, inform the user:

> This assessment requires challenge reviews before advancing. Run `/migrate challenge estimate` first to validate estimate quality, then re-run `/migrate wbs`.
