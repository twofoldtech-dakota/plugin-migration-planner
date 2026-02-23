# /migrate team — Generate Team Composition

Recommend team composition (roles, headcount, allocation, cost projections) based on the migration estimate, complexity, and timeline.

## Instructions

### 1. Load All Data

Load data from MCP tools first, falling back to JSON files:

1. Call `get_assessment` with `project_path` (current working directory). Fall back to `.migration/assessment.json`.
2. Call `get_estimate` with the assessment ID. Fall back to `.migration/estimate.json`.
3. Call `get_composed_heuristics` with assessment ID and `type: "roles"`. Fall back to reading `skills/migrate-knowledge/heuristics/base-effort-hours.json` for role definitions.
4. Call `get_analysis` with the assessment ID. Fall back to `.migration/analysis.json`. Needed for active multipliers and risk data.
5. Optionally call `get_client_proficiencies` with the client ID (if assessment has `client_id`). Used to flag skill gaps and estimate adoption hours.

If estimate data is unavailable from both MCP and JSON, inform the user and suggest running `/migrate estimate` first.

### 2. Generate Team Recommendation

#### Role Aggregation

For each role referenced in the estimate's `by_role` breakdowns:
1. Sum total hours across all components and phases
2. Look up role definition from heuristics (description, typical rate range)
3. Calculate per-phase hours from the phase breakdown

#### Headcount Calculation

Per role, per phase:
- `headcount = ceil(rolePhaseHours / (40 * 0.8 * phaseWeeks))`
- 0.8 factor accounts for meetings, context switching, etc.
- Phase duration derived from estimate phase data

#### Allocation & Seniority

| Condition | Allocation |
|-----------|------------|
| < 80h total | Contractor |
| < 160h total | Part-time |
| >= 160h total | Full-time |

| Condition | Seniority |
|-----------|-----------|
| High complexity multipliers active | Senior |
| < 40h total | Junior |
| Default | Mid |

#### Cost Projection

For each role:
- Parse rate range from heuristic definitions (e.g., "$150-200/hr")
- Low = min_rate * hours
- Expected = midpoint_rate * hours
- High = max_rate * hours

Aggregate across all roles for total cost projection.

#### Phase Staffing

Build a per-phase view showing:
- Which roles are active in each phase
- Headcount per role per phase
- Total team size per phase

#### Hiring Notes

Flag:
- Roles needed for < 4 weeks (contractor candidates)
- Skill gaps identified from client proficiencies
- Roles with high multiplier complexity (may need senior hire)
- Roles that span all phases (core team candidates)

### 3. Save to Database

Call `save_team_snapshot` with:
- `assessment_id`: The assessment ID
- `estimate_version`: The estimate version used as input
- `roles`: Array of team role recommendations
- `assumptions`: Key assumptions about team availability, rates, etc.
- `cost_projection`: `{ low, expected, high, byRole }`
- `phase_staffing`: Per-phase headcount breakdown
- `hiring_notes`: Flagged observations

The MCP tool handles versioning automatically.

### 4. Write Output File

Create `.migration/deliverables/team-composition.json` with the full team recommendation:

```json
{
  "assessment_id": "...",
  "estimate_version": 1,
  "generated_at": "ISO timestamp",
  "roles": [...],
  "cost_projection": { "low": 0, "expected": 0, "high": 0, "byRole": {} },
  "phase_staffing": [...],
  "hiring_notes": [...],
  "assumptions": {}
}
```

### 5. Present Results

Display a formatted team summary:

```
Team Composition Recommendation
═══════════════════════════════════
Based on estimate v1 | {total_hours}h total effort

Role                  Hours   HC  Allocation  Seniority  Rate Range
─────────────────────────────────────────────────────────────────────
Cloud Architect        320h    1  Full-time   Senior     $175-225/hr
DevOps Engineer        240h    1  Full-time   Mid        $150-200/hr
Sitecore Developer     480h    2  Full-time   Senior     $150-200/hr
QA Engineer            160h    1  Part-time   Mid        $100-150/hr
Project Manager        120h    1  Part-time   Senior     $125-175/hr
─────────────────────────────────────────────────────────────────────
Total                1,320h    6

Cost Projection
───────────────
Low:      $180,000
Expected: $225,000
High:     $275,000

Phase Staffing
──────────────
Phase 1 (Assessment):  3 people — Architect, PM, DevOps
Phase 2 (Build):       5 people — +2 Sitecore Devs
Phase 3 (Migration):   6 people — +QA
Phase 4 (Validation):  4 people — -1 Dev, -DevOps
Phase 5 (Cutover):     3 people — Core team only

Hiring Notes
────────────
⚠ QA Engineer needed for only 4 weeks — consider contractor
⚠ Client team has no Azure experience — budget for ramp-up
✓ Cloud Architect spans all phases — recommend dedicated hire
```

Include:
- Suggest viewing in the web UI at `/planning/?assessment={id}&tab=team`
- Note that rates are estimates and should be adjusted for the specific market/region

## Gate Check (Pre-Step)

Before generating the team recommendation, check if the assessment has `challenge_required: true`. If so, call `get_challenge_reviews` for the `estimate` step. If no review exists with status `passed` or `conditional_pass`, inform the user:

> This assessment requires challenge reviews before advancing. Run `/migrate challenge estimate` first to validate estimate quality, then re-run `/migrate team`.
