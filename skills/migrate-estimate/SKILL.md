# /migrate estimate — Phased Effort Estimation

Generate phased migration effort estimates with AI-assisted and manual-only comparisons, assumption-driven confidence scoring, and client-ready summary output.

## Instructions

### 1. Load Data

1. Call the MCP tool `get_assessment` with `project_path` set to the current working directory. If it returns null, fall back to reading `.migration/assessment.json`. Verify an assessment exists.
2. Call the MCP tool `get_discovery` with the assessment ID to get all discovery data. If it returns null, fall back to reading ALL files in `.migration/discovery/`.
3. Call the MCP tool `get_analysis` with the assessment ID. If it returns null, fall back to reading `.migration/analysis.json`. If neither exists, suggest running `/migrate analyze` first but proceed using discovery data directly.
4. Call the MCP tool `get_estimate` with the assessment ID to check for previous estimate versions. If it returns data, note the current version number (the new estimate will auto-increment). Fall back to reading `.migration/estimate.json` if MCP returns null.
5. Read AI selections from the `get_analysis` response or fall back to `.migration/ai-alternatives-selection.json`. If neither exists, use default recommendations from the catalog.
6. Load knowledge heuristics using a cascading fallback:
   - **Primary**: Call `get_composed_heuristics` with the `assessment_id`. This automatically resolves all knowledge packs from the assessment's `source_stack`/`target_stack`, returns fully merged `effort_hours`, `multipliers`, `gotcha_patterns`, `dependency_chains`, `phase_mappings`, and `roles` as flat arrays (each tagged with `source_pack_id`), and overlays migration path adjustments. The response includes `migration_path_id` and `packs_used`.
   - Also call `get_knowledge_pack` with the source platform pack ID and `include: ["ai_alternatives"]` to get the AI alternatives catalog.
   - **Fallback 1**: Call `get_heuristics` with `pack_ids` derived from the assessment (e.g., `["sitecore-xp"]` from `source_stack.platform`). If `source_stack` is empty, fall back to `["sitecore-xp"]`. The response is keyed by pack ID and contains `effort_hours`, `multipliers`, `gotcha_patterns`, `dependency_chains`, `phase_mappings`, and `roles`.
   - **Fallback 2**: Read the files from `skills/migrate-knowledge/`:
     - `heuristics/base-effort-hours.json`
     - `heuristics/complexity-multipliers.json`
     - `heuristics/gotcha-patterns.json`
     - `heuristics/dependency-chains.json`
     - `heuristics/ai-alternatives.json`
     - `heuristics/tech-proficiency-catalog.json`
   - If proficiency catalog data is needed beyond what `get_client_proficiencies` returns, it's embedded in the heuristics response or can be read from the DB directly.
7. **Load client proficiency data**: Check if the assessment has a `client_profile` (returned by `get_assessment` when a `client_id` is linked). If present, extract the proficiency map. If not, check if the assessment has a `client_id` and call `get_client_proficiencies`. This data is used in Step 8 to calculate adoption overhead.

### 2. Determine Components in Scope

Based on discovery data, determine which components are in scope:

| Component | In Scope When |
|-----------|---------------|
| `networking_vnet` | Always |
| `compute_single_role` | Always (multiply by role count: CM, CD, xConnect, etc.) |
| `database_single` | Always (multiply by database count) |
| `solr_standalone` | When search.type is standalone |
| `solr_cloud` | When search.type is solr_cloud |
| `redis_session` | When caching is in scope |
| `cdn_setup` | When CDN is used |
| `dns_cutover` | Always |
| `ssl_tls` | Always (multiply by certificate count) |
| `blob_storage` | When S3/blob storage is used |
| `exm_dispatch` | When EXM is enabled |
| `xconnect_xdb` | When xConnect is enabled |
| `identity_server` | When topology is XP (has Identity Server) |
| `custom_integration` | Multiply by integration count |
| `cicd_pipeline` | When CI/CD migration is in scope |
| `monitoring_setup` | Always |
| `backup_dr` | Always |
| `project_management` | Always |
| `testing_validation` | Always |
| `cutover_execution` | Always |

### 3. Calculate Base Hours

For each in-scope component:
1. Look up base hours from `base-effort-hours.json`
2. Multiply by unit count (e.g., 4 CD instances × 16 hours = 64 hours for CD compute)
3. Record the role breakdown from the base hours

### 4. Apply Complexity Multipliers

For each active multiplier (from analysis or recalculated from discovery data):
1. If the multiplier `applies_to` includes a component, multiply that component's hours
2. If a multiplier has `supersedes`, only apply the highest matching one
3. If `applies_to` contains `"all"`, apply to every component
4. Track which multipliers were applied to which components

### 5. Add Gotcha Pattern Hours

For each matching gotcha pattern:
1. Add the `hours_impact` to the relevant components
2. These are additive (not multiplicative) — they represent additional scope

### 6. Split Firm vs Assumption-Dependent Hours

If `assumptions-registry.json` is available, for each component:

1. **Identify affecting assumptions** — find all assumptions in the registry where `affected_components` includes this component's ID. Record these as `assumptions_affecting[]`.

2. **Calculate `firm_hours`** — hours based entirely on confirmed discovery data (answers with `confidence: "confirmed"`). If all inputs to a component are confirmed, `firm_hours = final_hours`.

3. **Calculate `assumption_dependent_hours`** — the portion of hours that depends on unvalidated assumptions. This is the difference: `final_hours - firm_hours`. If a component's unit count is based on an assumed value, the hours above the minimum confirmed count are assumption-dependent.

4. **Tag each component** with its `assumptions_affecting[]` array listing the assumption IDs (e.g., `["ASMP-001", "ASMP-005"]`).

### 7. Calculate Three-Point Estimates (Without AI)

For each component, calculate the **manual-only** (without_ai) estimate:
- **Optimistic**: `final_hours × 0.8` (best case, everything goes smoothly)
- **Expected**: `final_hours × 1.0` (with multipliers and gotcha hours already applied)
- **Pessimistic**: `expected × 1.3 + SUM(pessimistic_widening_hours for unvalidated assumptions affecting this component)`

The pessimistic formula replaces the old flat 1.5× multiplier. The widening is **additive per-assumption** (not multiplicative) to avoid exponential blowup. Each unvalidated assumption's `pessimistic_widening_hours` is added once.

### 8. Calculate AI-Assisted Estimates

For each component:

1. **Identify applicable AI alternatives** — from `ai-alternatives.json`, find tools where `applicable_components` includes this component.

2. **Check user selections** — if `ai-alternatives-selection.json` exists, use the user's toggle states. Otherwise, default to tools with `recommendation: "recommended"` being enabled.

3. **Handle mutual exclusions** — if two tools in a mutual exclusion group are both selected, only apply the first one found. Warn in the output.

4. **Calculate gross savings** — for each enabled tool applicable to this component, sum the `hours_saved` (3-point: optimistic/expected/pessimistic).

5. **Calculate adoption overhead** — if client proficiency data is available (from Step 1.7), for each enabled tool:
   - Look up the tool's category using `maps_to_tools` in `tech-proficiency-catalog.json`
   - Look up the team's proficiency level for that category
   - Calculate overhead: `adoption_base_hours × adoption_overhead_factors[proficiency_level]`
   - Subtract overhead from gross savings to get net savings: `net_savings = max(gross_savings - overhead, 0)`
   - If overhead exceeds gross savings, flag the tool as "low ROI" in the output

   If no proficiency data is available, skip this step (backward compatible — all savings pass through unchanged).

6. **Apply 50% cap** — total AI savings (net of adoption overhead) per component cannot exceed 50% of the without-AI hours for that component. If the sum exceeds this, cap it and note the cap was applied.

7. **Calculate with_ai estimates**:
   - `with_ai.optimistic = without_ai.optimistic - total_ai_savings.optimistic` (floored at `without_ai.optimistic × 0.5`)
   - `with_ai.expected = without_ai.expected - total_ai_savings.expected` (floored at `without_ai.expected × 0.5`)
   - `with_ai.pessimistic = without_ai.pessimistic - total_ai_savings.pessimistic` (floored at `without_ai.pessimistic × 0.5`)

8. **Record AI alternatives per component** — list of `{ "id": "tool_id", "name": "Tool Name", "hours_saved": { ... }, "adoption_overhead": N, "net_savings": N, "capped": false }`.

### 9. Calculate Confidence Score

If `assumptions-registry.json` is available:

```
confidence_score = (validated_assumptions + confirmed_discovery_answers) / total_data_points × 100
```

Where:
- `validated_assumptions` = assumptions with `validation_status: "validated"`
- `confirmed_discovery_answers` = discovery answers with `confidence: "confirmed"`
- `total_data_points` = all discovery answers + all registered assumptions

Generate a **range narrative**:
> "Estimate confidence: {score}% — validate {N} more assumptions to reach {target}% confidence with a ±{hours}hr narrower range"

Calculate the `target` by simulating validation of the top N assumptions (by `pessimistic_widening_hours`).

### 10. Organize into Phases

Group components into 5 phases per `base-effort-hours.json` phase_mapping:

**Phase 1: Infrastructure Foundation**
- Networking, compute provisioning, SSL certificates
- Duration: Typically 1-2 weeks

**Phase 2: Data Migration**
- Database migration, blob storage, Solr, Redis
- Duration: Typically 1-3 weeks (depends on data volume)

**Phase 3: Application & Services**
- Identity Server, xConnect, EXM, integrations, CDN, CI/CD, monitoring
- Duration: Typically 2-4 weeks

**Phase 4: Validation & Testing**
- Functional testing, performance testing, security validation, backup/DR setup
- Duration: Typically 1-2 weeks

**Phase 5: Cutover & Go-Live**
- DNS cutover, final data sync, production switch
- Duration: Typically 1-3 days (plus hypercare)

### 11. Calculate Role Totals

Aggregate hours by role across all phases (both without_ai and with_ai):
- Infrastructure Engineer
- DBA
- Sitecore Developer
- QA Engineer
- Project Manager

### 12. Build Client Summary

Generate the client-facing summary with three key numbers:
- **Recommended Estimate**: Total `with_ai.expected` hours (expected hours with enabled AI tools)
- **Low Estimate**: Total `with_ai.optimistic` hours (best case with AI)
- **High Estimate**: Total `without_ai.pessimistic` hours (worst case without AI + assumption widening)
- **Confidence Score**: The calculated confidence percentage

### 13. Document Assumptions and Exclusions

**Standard Assumptions** (always include):
- Single production environment (multiply for additional environments)
- Standard Sitecore XP configuration without major customizations beyond what was discovered
- Client provides timely access to AWS environment documentation
- No Sitecore version upgrade included
- Azure subscription and permissions available at project start

**Standard Exclusions** (always include):
- Application code changes (unless integration updates are in scope)
- Content migration or content restructuring
- Sitecore version upgrades
- End-user training
- Azure subscription costs
- Third-party license costs

### 14. Write Estimate

**Step 1 — Save to MCP (primary):** Call the `save_estimate` MCP tool with the assessment ID and full estimate data (phases, components, totals, client_summary, confidence_score, etc.). This automatically creates a new versioned snapshot — each `/migrate estimate` run increments the version number.

**Step 2 — Write JSON snapshot:** Write `.migration/estimate.json`:
```json
{
  "generated_at": "ISO date",
  "based_on_analysis": "ISO date of analysis.json or null",
  "discovery_completeness": 0.85,
  "confidence_score": 72,
  "client_summary": {
    "recommended_hours": 320,
    "low_hours": 256,
    "high_hours": 612,
    "confidence_percent": 72,
    "range_narrative": "Estimate confidence: 72% — validate 3 more assumptions to reach 85% confidence with a ±52hr narrower range"
  },
  "phases": [
    {
      "id": "phase_1",
      "name": "Phase 1: Infrastructure Foundation",
      "components": [
        {
          "id": "networking_vnet",
          "name": "VNet & Networking",
          "base_hours": 16,
          "multipliers_applied": [{"id": "vpn_connectivity", "multiplier": 1.3}],
          "gotcha_hours": 0,
          "final_hours": 20.8,
          "firm_hours": 20.8,
          "assumption_dependent_hours": 0,
          "assumptions_affecting": [],
          "hours": {
            "without_ai": {"optimistic": 16.6, "expected": 20.8, "pessimistic": 27.0},
            "with_ai": {"optimistic": 12.6, "expected": 16.8, "pessimistic": 23.0}
          },
          "ai_alternatives": [
            {"id": "terraform_opentofu", "name": "Terraform / OpenTofu", "hours_saved": {"optimistic": 6, "expected": 4, "pessimistic": 2}, "capped": false}
          ],
          "by_role": {"infrastructure_engineer": 20.8}
        }
      ],
      "hours": {
        "without_ai": {"optimistic": 0, "expected": 0, "pessimistic": 0},
        "with_ai": {"optimistic": 0, "expected": 0, "pessimistic": 0}
      },
      "by_role": {"infrastructure_engineer": 0, "dba": 0, "sitecore_developer": 0},
      "dependencies": ["none — this phase starts first"],
      "risks": ["risk IDs from analysis"]
    }
  ],
  "total": {
    "without_ai": {"optimistic": 0, "expected": 0, "pessimistic": 0},
    "with_ai": {"optimistic": 0, "expected": 0, "pessimistic": 0}
  },
  "total_by_role": {
    "infrastructure_engineer": {
      "without_ai": {"optimistic": 0, "expected": 0, "pessimistic": 0},
      "with_ai": {"optimistic": 0, "expected": 0, "pessimistic": 0}
    },
    "dba": {
      "without_ai": {"optimistic": 0, "expected": 0, "pessimistic": 0},
      "with_ai": {"optimistic": 0, "expected": 0, "pessimistic": 0}
    },
    "sitecore_developer": {
      "without_ai": {"optimistic": 0, "expected": 0, "pessimistic": 0},
      "with_ai": {"optimistic": 0, "expected": 0, "pessimistic": 0}
    },
    "qa_engineer": {
      "without_ai": {"optimistic": 0, "expected": 0, "pessimistic": 0},
      "with_ai": {"optimistic": 0, "expected": 0, "pessimistic": 0}
    },
    "project_manager": {
      "without_ai": {"optimistic": 0, "expected": 0, "pessimistic": 0},
      "with_ai": {"optimistic": 0, "expected": 0, "pessimistic": 0}
    }
  },
  "assumption_sensitivity": {
    "total_assumptions": 12,
    "validated": 3,
    "unvalidated": 9,
    "total_pessimistic_widening_hours": 72,
    "top_assumptions": [
      {
        "id": "ASMP-003",
        "description": "Database size assumed <50GB",
        "pessimistic_widening_hours": 16,
        "affected_components": ["database_single", "backup_dr"]
      }
    ]
  },
  "ai_alternatives_summary": {
    "total_tools_enabled": 12,
    "total_savings_hours": {"optimistic": 80, "expected": 55, "pessimistic": 28},
    "savings_capped_components": [],
    "mutual_exclusion_warnings": []
  },
  "multipliers_applied": [],
  "gotcha_patterns_matched": [],
  "assumptions": [],
  "exclusions": []
}
```

### 15. Present Results

Present the estimate with the **client-facing summary first**, then detailed breakdowns:

1. **Client Summary** — Recommended Estimate, Low/High Range, Confidence Score

   ```
   RECOMMENDED ESTIMATE: 320 hours (AI-assisted)
     Range: 256 hrs (low) — 612 hrs (high)
     Confidence: 72%

   "Estimate confidence: 72% — validate 3 more assumptions
    to reach 85% confidence with a ±52hr narrower range"
   ```

2. **Side-by-side comparison** — Manual-Only vs AI-Assisted totals

   ```
   Approach          | Optimistic | Expected | Pessimistic
   ------------------|------------|----------|------------
   Manual Only       |    304 hrs |  380 hrs |     612 hrs
   AI-Assisted       |    256 hrs |  320 hrs |     552 hrs
   Savings           |     48 hrs |   60 hrs |      60 hrs
   ```

3. **Phase breakdown** — Hours per phase with key components (showing with_ai expected)
4. **Role requirements** — Hours by role (both with/without AI)
5. **AI alternatives summary** — Which tools are enabled, total savings, any caps applied
6. **AI Adoption Overhead** (if proficiency data available) — Show a breakdown per tool:
   - Gross savings, adoption overhead, and net savings
   - Flag any tools where adoption cost exceeds savings as "Low ROI"
   - Show a summary: "Team proficiency adjustments reduced total AI savings by Xh (Y%)"
7. **Assumption sensitivity** — Top assumptions driving the pessimistic range
8. **Key drivers** — What's driving the bulk of the effort
9. **Risk adjustments** — Which gotcha patterns added hours and why
10. **Multiplier effects** — Which multipliers are inflating the base estimate
11. **Confidence statement** — Discovery completeness and confidence score with improvement path
12. **Caveats** — Key assumptions and exclusions

Suggest next steps:
- `/migrate gaps` to validate assumptions and tighten the range
- `/migrate plan` to generate client-ready documents
- `/migrate dashboard` to generate the interactive HTML dashboard

### 16. Write AI Alternatives Selection

**Step 1 — Save to MCP (primary):** Call the `save_ai_selections` MCP tool with the assessment ID, the selections object (tool_id → boolean), and disabled_reasons for any disabled tools.

**Step 2 — Write JSON snapshot:** Write `.migration/ai-alternatives-selection.json`:
```json
{
  "generated_at": "ISO date",
  "selections": {
    "azure_migrate": true,
    "aws_app_discovery": true,
    "terraform_opentofu": true,
    "azure_bicep": false,
    "github_copilot": true
  }
}
```

This captures which AI tools are "enabled" for the estimate. Users can toggle these in the dashboard or by re-running `/migrate estimate` with different selections.

### 17. Update Assessment Status

Update `.migration/assessment.json`:
- Set `"status": "estimation"` (if not already past this stage)
- Update `"updated"` timestamp

### 18. Post-Completion Suggestion

After the estimate is saved, suggest running a challenge review:

> Estimate complete! Before refining scope or generating deliverables, consider running `/migrate challenge estimate` to validate hours plausibility, check AI tool savings against current capabilities, and verify estimate consistency. This is optional but recommended.

### Gate Check (Pre-Step)

Before starting estimation, check if the assessment has `challenge_required: true`. If so, call `get_challenge_reviews` for the `analysis` step. If no review exists with status `passed` or `conditional_pass`, inform the user:

> This assessment requires challenge reviews before advancing. Run `/migrate challenge analysis` first to validate analysis quality, then re-run `/migrate estimate`.
