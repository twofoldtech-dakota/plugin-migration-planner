# /migrate analyze — Cross-Reference Analysis

Run cross-reference analysis on all collected discovery data to identify risks, dependency chains, active complexity multipliers, and discovery gaps.

## Instructions

### 1. Load Data

1. Call the MCP tool `get_assessment` with `project_path` set to the current working directory. If it returns null, fall back to reading `.migration/assessment.json`. Verify an assessment exists.
2. Call the MCP tool `get_discovery` with the assessment ID (no dimension filter) to get all discovery data. If it returns null, fall back to reading ALL files in `.migration/discovery/`.
3. Load knowledge heuristics and migration path data using a cascading fallback:
   - **Primary**: Call `get_composed_heuristics` with the `assessment_id`. This automatically resolves all knowledge packs from the assessment's `source_stack`/`target_stack`, flattens and merges all heuristic types (effort hours, multipliers, gotcha patterns, dependency chains, phase mappings, roles), and overlays migration path gotchas and effort adjustments. The response includes `migration_path_id` and `packs_used`. No separate `get_migration_path` call is needed for incompatibilities — the composed result already includes path gotchas.
   - **Fallback 1**: Call `get_heuristics` with `pack_ids` derived from the assessment (e.g., `["sitecore-xp"]` from `source_stack.platform`). If `source_stack` is empty, fall back to `["sitecore-xp"]`. Also call `get_migration_path` separately for incompatibilities.
   - **Fallback 2**: Read the files from `skills/migrate-knowledge/`:
     - `heuristics/gotcha-patterns.json`
     - `heuristics/complexity-multipliers.json`
     - `heuristics/dependency-chains.json`
     - `knowledge/known-incompatibilities.md`
     - `knowledge/aws-to-azure-service-map.json`

### 2. Evaluate Gotcha Patterns

For each pattern in `gotcha-patterns.json`:
- Check if the pattern's condition matches the discovery data
- If it matches, add it to the risk list with the documented hours impact and mitigation
- If a pattern can't be evaluated (missing data), note it as a gap

### 3. Evaluate Complexity Multipliers

For each multiplier in `complexity-multipliers.json`:
- Check if the condition matches the discovery data
- If a multiplier has a `supersedes` field, only apply the highest-matching multiplier
- Track which multipliers are active and what components they affect
- Calculate the total multiplier effect on each component

### 4. Map Dependency Chains

Using `dependency-chains.json`:
- Determine which components are in scope based on discovery data
- Build the dependency graph for in-scope components
- Identify the critical path (longest chain of hard dependencies)
- Identify parallel tracks that can run concurrently
- Flag any dependency that seems at risk based on discovery data

### 5. Identify Risk Clusters

Look for combinations of factors that amplify risk:
- **Data migration risk cluster**: Large databases + custom shard maps + HA requirements
- **Session/caching risk cluster**: Multiple CD instances + no Redis + CDN caching
- **Email risk cluster**: EXM enabled + dedicated IPs + high volume
- **Integration risk cluster**: Many custom integrations + AWS SDK dependencies
- **Compliance risk cluster**: PCI/HIPAA + multi-region + custom encryption

Rate each risk as:
- **Critical**: Will block migration if not addressed. Immediate action required.
- **High**: Significant impact on timeline or success probability. Plan mitigation.
- **Medium**: Moderate impact, manageable with planning. Include in estimate.
- **Low**: Minor impact, addressed through standard process.

### 6. Identify Gaps

For each discovery dimension:
- If `not_started`: Flag as high-impact gap
- If `partial`: List specific unanswered questions and their impact
- If any answer has `"confidence": "unknown"` or `"assumed"`: Flag as assumption needing validation

Prioritize gaps by their impact on estimate accuracy.

### 7. Calculate Discovery Completeness

```
completeness = (complete_dimensions + 0.5 * partial_dimensions) / total_dimensions
```

### 8. Write Analysis Results

**Step 1 — Save to MCP (primary):** Call the `save_analysis` MCP tool with the assessment ID and all analysis data (risks, active_multipliers, dependency_chains, risk_clusters, assumptions, and gaps). This performs an atomic replace of all analysis data for this assessment.

**Step 2 — Write JSON snapshot:** Write `.migration/analysis.json`:
```json
{
  "generated_at": "ISO date",
  "discovery_completeness": 0.85,
  "risks": [
    {
      "id": "risk-1",
      "source": "gotcha:exm_ip_warming",
      "severity": "high",
      "category": "email",
      "description": "New Azure IPs have no sending reputation...",
      "affected_components": ["exm_dispatch"],
      "mitigation": "Plan 2-4 week IP warming ramp...",
      "estimated_hours_impact": 40
    }
  ],
  "dependency_chains": [
    {
      "chain": ["networking_vnet", "compute_single_role", "database_single", "identity_server", "testing_validation", "cutover_execution", "dns_cutover"],
      "critical_path": true,
      "estimated_total_hours": 0
    }
  ],
  "parallel_tracks": [
    {
      "name": "Search Track",
      "chain": ["solr_standalone"],
      "starts_after": "networking_vnet"
    }
  ],
  "complexity_multipliers_active": [
    {
      "id": "multi_cd",
      "multiplier": 1.3,
      "reason": "4 CD instances detected",
      "applies_to": ["compute_single_role", "networking_vnet", "cdn_setup", "testing_validation"],
      "evidence": "discovery.compute.cd_instances = 4"
    }
  ],
  "risk_clusters": [
    {
      "name": "Email Deliverability",
      "severity": "high",
      "contributing_factors": ["EXM enabled", "Dedicated IPs", "100K+ monthly volume"],
      "combined_hours_impact": 52,
      "description": "..."
    }
  ],
  "gaps": [
    {
      "dimension": "networking",
      "status": "not_started",
      "impact": "high",
      "impact_description": "Cannot accurately estimate VPN/ExpressRoute complexity or networking effort"
    }
  ],
  "assumptions": [
    {
      "dimension": "compute",
      "question": "compute_os_version",
      "assumed_value": "Windows Server 2019",
      "basis": "Inferred from Sitecore 10.3",
      "impact_if_wrong": "low"
    }
  ]
}
```

### 9. Generate Assumptions Registry

After writing analysis.json, generate `.migration/assumptions-registry.json` — a formal registry linking every assumption to its impact on estimates.

#### 9a. Scan for Assumptions

Scan ALL discovery files for:
- Answers with `"confidence": "assumed"` → create assumption with `confidence: "assumed"`
- Answers with `"confidence": "unknown"` → create assumption with `confidence: "unknown"`
- Inferred values (where an inference rule was applied instead of user input) → create assumption with `confidence: "assumed"` and note the inference rule as basis
- Missing dimensions (gaps identified in step 6) → create assumptions for the default values that the estimator would use

#### 9b. Determine Impact per Assumption

For each assumption:

1. **Identify affected components** — which `base-effort-hours.json` components does this answer influence? Cross-reference with `complexity-multipliers.json` to find multipliers triggered by this assumed data.

2. **Calculate `hours_if_wrong`** — estimate the effort impact if the assumed value turns out to be wrong:
   - `low`: Minimal rework (e.g., assumed Windows Server 2019, actually 2022 — similar effort)
   - `expected`: Moderate rework (e.g., assumed 2 CD instances, actually 4 — triggers multiplier)
   - `high`: Significant rework (e.g., assumed no custom shard map, actually has one — 24hr gotcha)

3. **Calculate `pessimistic_widening_hours`** — the hours added to the pessimistic estimate for this unvalidated assumption. Use the `expected` value from `hours_if_wrong` as the default widening.

#### 9c. Assign IDs and Metadata

Each assumption gets:
- `id`: `ASMP-001` through `ASMP-NNN` (sequential)
- `source`: File path and question ID (e.g., `discovery/compute.json#compute_cm_instance_count`)
- `dimension`: Which discovery dimension this belongs to
- `question_id`: The specific question from the discovery tree
- `assumed_value`: The current assumed or inferred value
- `basis`: Why this value was assumed (inference rule, default, user said "I don't know")
- `confidence`: `"assumed"` or `"unknown"`
- `validation_status`: Initially `"unvalidated"` for all
- `validation_method`: Suggested way to confirm (e.g., "Check AWS EC2 console", "Ask client DBA")
- `affected_components`: Array of component IDs from base-effort-hours.json
- `hours_if_wrong`: `{ "low": N, "expected": N, "high": N }`
- `pessimistic_widening_hours`: Number (the expected hours_if_wrong value)

#### 9d. Calculate Confidence Score

```
confidence_score = (validated_assumptions + confirmed_discovery_answers) / total_data_points × 100
```

Where `total_data_points` = all discovery answers (confirmed + assumed + unknown) + all registered assumptions.

Since this is the initial generation, `validated_assumptions` starts at 0. The score reflects the current state of confirmed discovery data.

#### 9e. Write Assumptions Registry

The assumptions are already saved to SQLite as part of the `save_analysis` call in step 8. Now write the JSON snapshot.

Write `.migration/assumptions-registry.json`:
```json
{
  "generated_at": "ISO date",
  "summary": {
    "total_assumptions": 12,
    "validated": 0,
    "unvalidated": 12,
    "by_confidence": {
      "assumed": 7,
      "unknown": 5
    },
    "total_hours_at_risk": 96,
    "total_pessimistic_widening": 72,
    "confidence_score": 65
  },
  "assumptions": [
    {
      "id": "ASMP-001",
      "source": "discovery/compute.json#compute_cm_instance_count",
      "dimension": "compute",
      "question_id": "compute_cm_instance_count",
      "assumed_value": "1",
      "basis": "Inferred from XP Scaled topology default",
      "confidence": "assumed",
      "validation_status": "unvalidated",
      "validation_method": "Confirm with client's AWS admin — check EC2 console for CM instance count",
      "affected_components": ["compute_single_role"],
      "hours_if_wrong": { "low": 4, "expected": 8, "high": 16 },
      "pessimistic_widening_hours": 8
    }
  ]
}
```

### 10. Present Findings

Present the analysis conversationally, organized by severity:

1. **Discovery completeness** — percentage and what's missing
2. **Critical/High risks** — with specific mitigations
3. **Active complexity multipliers** — and their impact on effort
4. **Critical path** — the dependency chain that determines minimum timeline
5. **Gaps** — what information would most improve estimate accuracy
6. **Risk clusters** — emergent risks from factor combinations
7. **Assumptions summary** — total assumptions registered, confidence score, top assumptions by impact

Include the confidence score prominently:
> **Estimate Confidence: {score}%** — {N} assumptions registered, {M} validated. Validate the top {K} assumptions to improve confidence to ~{target}%.

End with recommendations:
- What to investigate before estimating
- Suggest `/migrate gaps` for detailed gap analysis and assumption validation
- Suggest `/migrate estimate` if completeness is sufficient (>70%)
- Suggest revisiting specific discovery dimensions if critical gaps exist
- List the top 3 assumptions to validate first (highest `pessimistic_widening_hours`)

### 11. Update Assessment Status

Update `.migration/assessment.json`:
- Set `"status": "analysis"` (if not already past this stage)
- Update `"updated"` timestamp

### 12. Post-Completion Suggestion

After analysis is saved, suggest running a challenge review:

> Analysis complete! Before moving to estimation, consider running `/migrate challenge analysis` to validate risk coverage, check assumption consistency, and verify mitigation strategies against current Azure capabilities. This is optional but recommended.

### Gate Check (Pre-Step)

Before starting analysis, check if the assessment has `challenge_required: true`. If so, call `get_challenge_reviews` for the `discovery` step. If no review exists with status `passed` or `conditional_pass`, inform the user:

> This assessment requires challenge reviews before advancing. Run `/migrate challenge discovery` first to validate discovery data quality, then re-run `/migrate analyze`.
