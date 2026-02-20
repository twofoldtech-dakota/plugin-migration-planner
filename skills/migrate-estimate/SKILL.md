# /migrate estimate — Phased Effort Estimation

Generate phased migration effort estimates with optimistic/expected/pessimistic ranges and role-based breakdowns.

## Instructions

### 1. Load Data

1. Read `.migration/assessment.json` — verify assessment exists
2. Read ALL files in `.migration/discovery/` for discovery data
3. Read `.migration/analysis.json` — if it doesn't exist, suggest running `/migrate analyze` first but proceed anyway using discovery data directly
4. Read from `skills/migrate-knowledge/`:
   - `heuristics/base-effort-hours.json`
   - `heuristics/complexity-multipliers.json`
   - `heuristics/gotcha-patterns.json`
   - `heuristics/dependency-chains.json`

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

### 6. Calculate Three-Point Estimates

For each component, calculate:
- **Optimistic**: base_hours × 0.8 (best case, everything goes smoothly)
- **Expected**: base_hours × 1.0 (with multipliers and gotcha hours already applied)
- **Pessimistic**: base_hours × 1.5 (unexpected issues, learning curve, environment problems)

### 7. Organize into Phases

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

### 8. Calculate Role Totals

Aggregate hours by role across all phases:
- Infrastructure Engineer
- DBA
- Sitecore Developer
- QA Engineer
- Project Manager

### 9. Document Assumptions and Exclusions

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

### 10. Write Estimate

Write `.migration/estimate.json`:
```json
{
  "generated_at": "ISO date",
  "based_on_analysis": "ISO date of analysis.json or null",
  "discovery_completeness": 0.85,
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
          "by_role": {"infrastructure_engineer": 20.8}
        }
      ],
      "hours": {"optimistic": 0, "expected": 0, "pessimistic": 0},
      "by_role": {"infrastructure_engineer": 0, "dba": 0, "sitecore_developer": 0},
      "dependencies": ["none — this phase starts first"],
      "risks": ["risk IDs from analysis"]
    }
  ],
  "total": {"optimistic": 0, "expected": 0, "pessimistic": 0},
  "total_by_role": {
    "infrastructure_engineer": {"optimistic": 0, "expected": 0, "pessimistic": 0},
    "dba": {"optimistic": 0, "expected": 0, "pessimistic": 0},
    "sitecore_developer": {"optimistic": 0, "expected": 0, "pessimistic": 0},
    "qa_engineer": {"optimistic": 0, "expected": 0, "pessimistic": 0},
    "project_manager": {"optimistic": 0, "expected": 0, "pessimistic": 0}
  },
  "multipliers_applied": [],
  "gotcha_patterns_matched": [],
  "assumptions": [],
  "exclusions": [],
  "confidence_notes": "Discovery is 85% complete. Estimate accuracy is moderate — networking and backup dimensions are missing."
}
```

### 11. Present Results

Present the estimate conversationally:

1. **Headline numbers** — Total expected hours with optimistic/pessimistic range
2. **Phase breakdown** — Hours per phase with key components
3. **Role requirements** — Hours by role
4. **Key drivers** — What's driving the bulk of the effort
5. **Risk adjustments** — Which gotcha patterns added hours and why
6. **Multiplier effects** — Which multipliers are inflating the base estimate
7. **Confidence statement** — How complete the discovery is and what gaps affect accuracy
8. **Caveats** — Key assumptions and exclusions

Example summary format:
```
Estimated Total Effort: 380 hours (expected)
  Range: 304 hours (optimistic) — 570 hours (pessimistic)

Phase Breakdown:
  Phase 1 — Infrastructure:   64 hrs
  Phase 2 — Data Migration:   96 hrs
  Phase 3 — Application:     108 hrs
  Phase 4 — Validation:       60 hrs
  Phase 5 — Cutover:          52 hrs

Role Breakdown:
  Infrastructure Engineer:   148 hrs
  DBA:                        52 hrs
  Sitecore Developer:        108 hrs
  QA Engineer:                40 hrs
  Project Manager:            32 hrs
```

### 12. Update Assessment Status

Update `.migration/assessment.json`:
- Set `"status": "estimation"` (if not already past this stage)
- Update `"updated"` timestamp
