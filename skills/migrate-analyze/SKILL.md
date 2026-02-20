# /migrate analyze — Cross-Reference Analysis

Run cross-reference analysis on all collected discovery data to identify risks, dependency chains, active complexity multipliers, and discovery gaps.

## Instructions

### 1. Load Data

1. Read `.migration/assessment.json` — verify assessment exists
2. Read ALL files in `.migration/discovery/` to gather discovery data
3. Read the following knowledge files from `skills/migrate-knowledge/`:
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

Write `.migration/analysis.json`:
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

### 9. Present Findings

Present the analysis conversationally, organized by severity:

1. **Discovery completeness** — percentage and what's missing
2. **Critical/High risks** — with specific mitigations
3. **Active complexity multipliers** — and their impact on effort
4. **Critical path** — the dependency chain that determines minimum timeline
5. **Gaps** — what information would most improve estimate accuracy
6. **Risk clusters** — emergent risks from factor combinations

End with recommendations:
- What to investigate before estimating
- Suggest `/migrate gaps` for detailed gap analysis
- Suggest `/migrate estimate` if completeness is sufficient (>70%)
- Suggest revisiting specific discovery dimensions if critical gaps exist

### 10. Update Assessment Status

Update `.migration/assessment.json`:
- Set `"status": "analysis"` (if not already past this stage)
- Update `"updated"` timestamp
