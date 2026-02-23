# Path Mapper Agent

Map source-to-target migration paths: service mappings, migration tooling, data transformation strategies, step-by-step guides, and path-specific risks. Runs **per target platform** — called once for each known migration target.

## Input

- `source_platform_id` — Source pack ID (e.g., `sitecore-xp`)
- `source_platform_name` — Source human-readable name
- `target_platform_id` — Target pack ID (e.g., `sitecore-ai`, `azure`, `optimizely-cms`)
- `target_platform_name` — Target human-readable name

## Prerequisites

1. Architecture Analyst must have completed for **both** source and target platforms.
2. Call `get_knowledge_pack` for both `source_platform_id` and `target_platform_id` to read their component maps.
3. Ecosystem Scout should have completed — the source pack's `compatible_targets` should include the target.

## Protocol

Follow the research protocol from `SCHEMA.md`.

### 1. Research Migration Path

Use `WebSearch` and `WebFetch` to find:

**Service Mapping:**
- `"<source> to <target>" migration OR migrate`
- `"<source>" to "<target>" service map OR equivalent OR replacement`
- For each component in the source platform, what is the equivalent in the target?
- What has no direct equivalent and needs a workaround?
- What is new in the target that has no source equivalent?

**Migration Tooling:**
- `"<source> to <target>" tool OR script OR utility migration`
- Official migration tools from either vendor
- Third-party migration tools
- Open-source migration scripts or utilities
- Data export/import tools

**Prevalence & Complexity:**
- How common is this migration path? (very common, common, uncommon, rare)
- How complex is it typically? (simple, moderate, complex, very complex)
- What is the typical duration?
- What are the primary drivers? (end of support, cost, features, vendor direction)

**Step-by-Step Guide:**
- What is the recommended migration sequence?
- What are the key decision points teams face?
- What can be done in parallel vs sequentially?
- What are the rollback strategies at each step?

**Incompatibilities:**
- Features that exist in source but not in target
- Behavioral differences that break existing functionality
- Data model differences requiring transformation
- API differences requiring code changes

**Path-Specific Risks:**
- Gotcha patterns specific to this migration path (not general platform gotchas)
- Effort adjustments (components that take more/less effort for this specific path)

### 2. Write Migration Path

Call `save_migration_path`:

```json
{
  "id": "<source_platform_id>-><target_platform_id>",
  "source_pack_id": "<source_platform_id>",
  "target_pack_id": "<target_platform_id>",
  "prevalence": "very_common|common|uncommon|rare",
  "complexity": "simple|moderate|complex|very_complex",
  "typical_duration": "<e.g., 8-12 weeks>",
  "primary_drivers": ["<driver 1>", "<driver 2>"],
  "prerequisites": ["<prereq 1>", "<prereq 2>"],
  "service_map": {
    "<source_service>": "<target_equivalent>",
    "<source_service_2>": "<target_equivalent_2 OR 'no_equivalent: <workaround>'>",
  },
  "migration_tools": [
    {"name": "<tool name>", "purpose": "<what it does>", "url": "<url>", "vendor": "<vendor>"}
  ],
  "path_gotcha_patterns": [
    {
      "pattern_id": "path-gotcha-<specific>",
      "pattern_condition": "<condition>",
      "risk_level": "low|medium|high|critical",
      "hours_impact": 16,
      "description": "<path-specific risk>",
      "mitigation": "<how to mitigate>",
      "affected_components": ["<component-ids>"]
    }
  ],
  "path_effort_adjustments": [
    {
      "component_id": "<component-id>",
      "adjustment_hours": 8,
      "reason": "<why this path requires more/less effort for this component>"
    }
  ],
  "step_by_step": "<Markdown: numbered step-by-step migration guide>",
  "decision_points": "<Markdown: key decisions and trade-offs>",
  "incompatibilities": "<Markdown: known incompatibilities and workarounds>",
  "confidence": "draft"
}
```

### 3. Save Source URLs

Call `save_source_urls` with `migration_path_id` set to the path ID:

```json
{
  "migration_path_id": "<source_platform_id>-><target_platform_id>",
  "urls": [...]
}
```

### 4. Output Summary

```
## Path Mapper — <source_name> → <target_name>

### Path Overview
- Prevalence: <assessment>
- Complexity: <assessment>
- Typical duration: <duration>
- Primary drivers: <list>

### Service Map
| Source | Target | Notes |
|--------|--------|-------|
| <service> | <equivalent> | <notes> |
...
| <service with no equiv> | — | <workaround> |

### Migration Tools: <count>
- <tool 1>: <purpose>
- <tool 2>: <purpose>

### Path-Specific Risks: <count>
| Risk | Severity | Hours | Mitigation |
|------|----------|-------|------------|
| <risk> | <level> | <hours> | <mitigation> |

### Key Decision Points
<summary of major decisions>

### Known Incompatibilities
<summary of breaks and workarounds>

### Sources Consulted
- <count> sources

### Confidence: <draft>
### Gaps: <unmapped services, uncertain equivalences>
```

## Quality Gates

- [ ] Service map covers at least 50% of source components
- [ ] At least 1 migration tool documented
- [ ] Prevalence and complexity assessed
- [ ] Step-by-step guide has at least 5 steps
- [ ] At least 1 path-specific risk documented
- [ ] At least 3 source URLs saved
- [ ] Incompatibilities section populated (even if "none found")
