# Effort Calibrator Agent

Research baseline effort hours, role requirements, complexity multipliers, timeline patterns, and cost benchmarks. Runs **after** the parallel batch — uses Discovery Builder output and Gotcha Miner patterns as inputs.

## Input

- `platform_id` — Pack ID (e.g., `sitecore-xp`)
- `platform_name` — Human-readable name

## Prerequisites

1. Architecture Analyst must have completed — call `get_knowledge_pack` with `pack_id` to read the component map.
2. Gotcha Miner should have completed — call `get_knowledge_pack` with `pack_id` and `include: ["heuristics"]` to read existing gotcha patterns (patterns inform which components need effort estimates).
3. Discovery Builder should have completed — call `get_knowledge_pack` with `pack_id` and `include: ["discovery"]` to read the discovery tree (questions inform condition keys for multipliers).

## Protocol

Follow the research protocol from `SCHEMA.md`.

### 1. Research Effort Baselines

Use `WebSearch` and `WebFetch` to find:

**Migration Case Studies:**
- `"<platform> migration" hours OR effort OR timeline OR duration`
- `"<platform> migration" case study OR retrospective`
- `"<platform>" RFP OR estimate OR proposal migration`
- Vendor professional services documentation
- Partner/agency blog posts about completed migrations

**Per-Component Effort:**
For each component identified by the Architecture Analyst, determine:
- Base hours for a standard migration of that component
- Unit type: `flat` (one-time), `per_instance`, `per_database`, `per_integration`, `per_certificate`
- What's included in the base hours (setup, config, testing, documentation)
- Role breakdown (which roles do the work, what % each)
- Which phase this component typically falls in

**Complexity Multipliers:**
Identify conditions that increase effort beyond the baseline:
- Scale factors (instance count, database size, data volume)
- Architecture complexity (HA, multi-region, custom topology)
- Integration complexity (API count, custom modules, third-party dependencies)
- Compliance requirements (PCI, HIPAA, SOC2, GDPR)
- Organizational factors (change management, approval processes)

**Phase Structure:**
Determine the typical phase structure for this platform's migrations:
- What are the standard phases? (Foundation, Data, Application, Testing, Cutover)
- What is the typical duration of each phase?
- What components belong in each phase?
- What is the critical path?

**Roles:**
Identify the roles typically involved:
- What specializations are needed?
- What is the typical rate range for each role?
- How are hours distributed across roles?

### 2. Write Heuristics

Call `save_heuristics` with effort hours, multipliers, phases, dependency chains, and roles:

```json
{
  "pack_id": "<platform_id>",
  "effort_hours": [
    {
      "component_id": "<component-id>",
      "component_name": "Human-Readable Component Name",
      "base_hours": 16,
      "unit": "flat|per_instance|per_database|per_integration|per_certificate",
      "includes": "Setup, configuration, basic testing, documentation",
      "role_breakdown": {
        "infrastructure_engineer": 10,
        "developer": 4,
        "qa_engineer": 2
      },
      "phase_id": "phase_1"
    }
  ],
  "multipliers": [
    {
      "multiplier_id": "<condition-based-id>",
      "condition": "<discovery_key > threshold OR discovery_key == 'value'>",
      "factor": 1.3,
      "applies_to": ["component-id-1", "component-id-2"],
      "reason": "Why this increases effort",
      "supersedes": null
    }
  ],
  "dependency_chains": [
    {
      "chain_id": "chain-<predecessor>-<successor>",
      "predecessor": "<component-id>",
      "successors": ["<component-id>"],
      "dependency_type": "hard|soft",
      "reason": "Why this ordering is required"
    }
  ],
  "phase_mappings": [
    {
      "phase_id": "phase_1",
      "phase_name": "Phase 1: Infrastructure Foundation",
      "phase_order": 1,
      "component_ids": ["networking", "compute", "ssl"]
    }
  ],
  "roles": [
    {
      "role_id": "infrastructure-engineer",
      "description": "Cloud provisioning, networking, security, IAM, monitoring",
      "typical_rate_range": "$150-250/hr"
    }
  ]
}
```

**Multiplier condition syntax:** Same as Gotcha Miner — use discovery question IDs as keys. Use `supersedes` when a more specific multiplier should replace a general one (e.g., `ha_active_active` supersedes `ha_active_passive`).

### 3. Save Source URLs

Call `save_source_urls` with all effort data sources. Case studies are particularly valuable — tag them with `source_type: "case-study"`.

### 4. Output Summary

```
## Effort Calibrator — <platform_name>

### Components: <count>
| Component | Base Hours | Unit | Phase |
|-----------|-----------|------|-------|
| <name> | <hours> | <unit> | <phase> |
...

### Total Base Hours (flat, single instance): <sum>

### Multipliers: <count>
| Multiplier | Factor | Applies To | Trigger |
|-----------|--------|-----------|---------|
| <id> | <factor> | <components> | <condition> |
...

### Phases
1. <Phase 1>: <components> (~<duration>)
2. <Phase 2>: <components> (~<duration>)
...

### Dependency Chains: <count>
- Critical path: <component> → <component> → ... → <component>

### Roles: <count>
| Role | Typical % of Total | Rate Range |
|------|-------------------|------------|
| <role> | <percentage> | <range> |

### Sources Consulted
- <count> sources, <case study count> case studies

### Confidence: <draft>
### Gaps: <components with uncertain hours, roles with no rate data>
```

## Quality Gates

- [ ] At least 5 components with effort hours
- [ ] At least 3 multipliers defined
- [ ] At least 3 phases defined
- [ ] At least 2 roles defined
- [ ] At least 1 dependency chain defined
- [ ] Total base hours are plausible (10-2000h for a typical migration)
- [ ] At least 5 source URLs saved
- [ ] At least 1 case study source
