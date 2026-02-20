# /migrate compare — Compare Migration Approaches

Compare migration approaches side-by-side. The user provides a comparison topic as an argument (e.g., `/migrate compare PaaS vs IaaS`, `/migrate compare SQL MI vs SQL VM`).

## Instructions

### 1. Parse the Comparison Topic

The user's argument describes what to compare. Common comparisons include:
- **PaaS vs IaaS** — Azure App Service vs Azure VMs for Sitecore hosting
- **SQL MI vs SQL VM** — Azure SQL Managed Instance vs SQL Server on Azure VM
- **Solr vs Azure Search** — Solr on VM/AKS vs Azure Cognitive Search
- **Front Door vs App Gateway** — Azure Front Door vs Application Gateway for CD traffic
- **Redis tiers** — Basic vs Standard vs Premium vs Enterprise Azure Cache
- **VM vs AKS** — VM-based deployment vs containerized on AKS
- **ExpressRoute vs VPN** — Private connectivity options
- **Blob vs DB media** — Azure Blob Storage vs database for Sitecore media

If the comparison topic is unclear, ask the user to clarify.

### 2. Load Context

1. Read `.migration/assessment.json` for project context
2. Read relevant discovery data from `.migration/discovery/`
3. Read relevant knowledge files from `skills/migrate-knowledge/knowledge/`
4. Read `skills/migrate-knowledge/heuristics/base-effort-hours.json` for effort differences

### 3. Build Comparison

For each approach being compared, evaluate:

#### Migration Effort
- Base hours for each approach
- Additional complexity or simplification
- Skills required (different role mix?)

#### Operational Cost
- Estimated monthly Azure cost range
- Cost scaling characteristics (linear vs step)
- Reserved instance / savings plan applicability

#### Risk
- Migration risk (what can go wrong during migration)
- Operational risk (what can go wrong in steady state)
- Vendor lock-in considerations

#### Sitecore Compatibility
- Official support status
- Known limitations or workarounds
- Community experience and documentation

#### Timeline Impact
- Does this approach change the critical path?
- Setup/provisioning lead time
- Learning curve for the team

#### Operational Complexity
- Day-to-day management overhead
- Monitoring and alerting differences
- Patching and update responsibilities
- Scaling behavior

### 4. Generate Recommendation

Based on the project's specific context (topology, scale, requirements):
- Identify which approach best fits THIS migration
- Explain why, referencing specific discovery data
- Note any conditions that would change the recommendation
- Present trade-offs honestly — there's rarely a universally "right" answer

### 5. Write Comparison File

Write `.migration/comparisons/<comparison-name>.json`:
```json
{
  "generated_at": "ISO date",
  "topic": "SQL MI vs SQL VM",
  "options": [
    {
      "name": "Azure SQL Managed Instance",
      "migration_effort": { "hours_delta": 0, "notes": "Baseline approach" },
      "monthly_cost_range": "$X - $Y",
      "risk_level": "medium",
      "sitecore_compatibility": "Full — near-100% SQL Server compatibility",
      "timeline_impact": "Standard",
      "pros": ["Managed service", "Built-in HA", "Automated backups", "No OS patching"],
      "cons": ["Higher base cost", "Some SQL features unavailable", "Dedicated subnet required"],
      "best_when": "Standard Sitecore deployment without exotic SQL features"
    },
    {
      "name": "SQL Server on Azure VM",
      "migration_effort": { "hours_delta": 16, "notes": "Additional OS-level DB management setup" },
      "monthly_cost_range": "$X - $Y",
      "risk_level": "medium",
      "sitecore_compatibility": "Full — identical to on-prem SQL Server",
      "timeline_impact": "Slightly longer due to OS-level setup",
      "pros": ["Full SQL Server feature set", "Lower base cost at small scale", "Full control"],
      "cons": ["OS patching responsibility", "Manual HA setup", "Manual backup config"],
      "best_when": "Requires SQL features not in MI, or team prefers full control"
    }
  ],
  "recommendation": {
    "preferred": "Azure SQL Managed Instance",
    "rationale": "For this deployment with...",
    "conditions": "Would change to SQL VM if..."
  },
  "context_factors": {
    "database_count": 12,
    "ha_required": true,
    "total_size_gb": 150
  }
}
```

### 6. Present Results

Display as a side-by-side comparison:

```
Comparison: SQL MI vs SQL Server on Azure VM
════════════════════════════════════════════

                    SQL Managed Instance    SQL Server on VM
─────────────────   ────────────────────    ────────────────
Migration Effort    Baseline               +16 hours
Monthly Cost        $X–$Y/mo               $X–$Y/mo
Risk Level          Medium                  Medium
Sitecore Compat.    Full (near-100%)        Full (100%)
HA Approach         Built-in (BC tier)      Manual Always On AG
Patching            Automated               Manual
Timeline Impact     Standard                +1 week

Recommendation: SQL Managed Instance
Rationale: ...
```

If the user didn't specify a comparison topic or the argument is empty, show available comparison topics and ask them to choose.
