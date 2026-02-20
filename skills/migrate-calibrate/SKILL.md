# /migrate calibrate — Feed Back Actuals

Feed back actual hours from a completed (or in-progress) migration to compare against estimates and improve future accuracy.

## Instructions

### 1. Load Existing Data

1. Read `.migration/assessment.json` — verify assessment exists
2. Read `.migration/estimate.json` — the original estimates to compare against
3. Read existing calibration files in `.migration/calibration/` if any

### 2. Gather Actuals

Ask the user for actual hours spent, organized by component or phase. Be flexible about the format — accept:

- **By phase**: "Phase 1 took 80 hours, Phase 2 took 120 hours..."
- **By component**: "Database migration was 60 hours, networking was 24 hours..."
- **By role**: "Infrastructure engineer spent 200 hours total, DBA spent 80 hours..."
- **Mixed**: Whatever data the user has available
- **Partial**: If the migration is still in progress, accept completed phases only

For each data point, also ask:
- Were there any surprises or unexpected issues? (helps identify new gotcha patterns)
- What went smoother than expected? (helps calibrate overestimates)
- What took longer than expected and why?

### 3. Calculate Variance

For each component/phase where actuals are available:

```
variance = (actual - estimated) / estimated × 100%

If variance > 20%: Flag as significant overestimate
If variance < -20%: Flag as significant underestimate
If -20% <= variance <= 20%: Within acceptable range
```

### 4. Analyze Patterns

Look for systemic patterns:
- **Consistent overestimate**: Heuristics may be too high for this type of environment
- **Consistent underestimate**: Complexity may be higher than heuristics assume
- **Specific component variance**: Some components reliably over/under
- **Multiplier accuracy**: Were the complexity multipliers accurate?
- **Gotcha pattern accuracy**: Did the predicted gotchas actually materialize?
- **Unpredicted issues**: What happened that wasn't in the gotcha patterns?

### 5. Generate Calibration Insights

For each significant variance:
- Identify the root cause (wrong base hours, missing multiplier, new gotcha, scope change)
- Suggest heuristic adjustments with specific numbers
- Flag new gotcha patterns discovered during execution

### 6. Write Calibration Data

Write `.migration/calibration/<engagement-name>.json`:
```json
{
  "generated_at": "ISO date",
  "engagement": "Project Name",
  "estimate_date": "date of original estimate",
  "calibration_date": "ISO date",
  "status": "complete|in_progress",
  "actuals": {
    "phases": [
      {
        "id": "phase_1",
        "name": "Infrastructure Foundation",
        "estimated_hours": 64,
        "actual_hours": 80,
        "variance_percent": 25,
        "variance_direction": "under",
        "notes": "VPN setup took longer than expected due to partner coordination"
      }
    ],
    "components": [
      {
        "id": "networking_vnet",
        "estimated_hours": 20.8,
        "actual_hours": 32,
        "variance_percent": 54,
        "notes": "ExpressRoute partner circuit provisioning delayed by 2 weeks"
      }
    ],
    "by_role": {
      "infrastructure_engineer": { "estimated": 148, "actual": 172 },
      "dba": { "estimated": 52, "actual": 48 }
    },
    "total": {
      "estimated": { "optimistic": 304, "expected": 380, "pessimistic": 570 },
      "actual": 420
    }
  },
  "surprises": [
    {
      "description": "Azure SQL MI subnet delegation required existing resources to be moved",
      "hours_impact": 8,
      "should_be_gotcha": true,
      "suggested_pattern": "sql_mi_subnet_delegation"
    }
  ],
  "smoother_than_expected": [
    {
      "component": "solr_standalone",
      "reason": "Index rebuild was faster than estimated on Premium SSD",
      "hours_saved": 8
    }
  ],
  "suggested_heuristic_adjustments": [
    {
      "type": "base_hours",
      "component": "networking_vnet",
      "current_value": 16,
      "suggested_value": 20,
      "reason": "VPN/ExpressRoute coordination consistently takes longer than base estimate"
    },
    {
      "type": "multiplier",
      "id": "vpn_connectivity",
      "current_value": 1.3,
      "suggested_value": 1.5,
      "reason": "Partner circuit provisioning adds more delay than current multiplier accounts for"
    },
    {
      "type": "new_gotcha",
      "suggested_pattern": {
        "id": "sql_mi_subnet_prep",
        "pattern": "database.target == 'sql_mi'",
        "risk": "medium",
        "hours_impact": 8,
        "description": "SQL MI requires a dedicated subnet with no other resources. Existing resources may need migration.",
        "mitigation": "Verify target subnet is empty or plan resource relocation before SQL MI deployment"
      }
    }
  ]
}
```

### 7. Present Results

Display a clear variance report:

```
Calibration Report: Contoso Migration
═════════════════════════════════════

Overall: Estimated 380 hrs, Actual 420 hrs (+10.5%)
  Within pessimistic range (570 hrs) ✓

Phase Variance:
  Phase 1 — Infrastructure:   Estimated 64 → Actual 80 (+25%) ⚠
  Phase 2 — Data Migration:   Estimated 96 → Actual 88 (-8%) ✓
  Phase 3 — Application:      Estimated 108 → Actual 128 (+19%) ⚠
  Phase 4 — Validation:       Estimated 60 → Actual 72 (+20%) ⚠
  Phase 5 — Cutover:          Estimated 52 → Actual 52 (0%) ✓

Key Insights:
  1. Networking consistently underestimated when ExpressRoute is involved
  2. Database migration was faster than expected (Premium SSD performance)
  3. New gotcha discovered: SQL MI subnet delegation conflicts

Suggested Heuristic Updates:
  - networking_vnet base hours: 16 → 20
  - vpn_connectivity multiplier: 1.3 → 1.5
  - New gotcha pattern: sql_mi_subnet_prep (+8 hrs)
```

### 8. Update Assessment Status

Update `.migration/assessment.json`:
- Set `"status": "complete"`
- Update `"updated"` timestamp

## Notes

- Calibration data accumulates — multiple calibration files can exist for different engagements or time points
- The suggested heuristic adjustments are recommendations, not automatic changes — the knowledge files themselves are static reference material
- Encourage users to calibrate even partial data — early calibration during execution helps course-correct
