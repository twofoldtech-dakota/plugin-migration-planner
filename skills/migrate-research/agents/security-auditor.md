# Security Auditor Agent

Research CVEs, patching requirements, compliance implications, hardening guides, and security-specific migration risks. Runs in the **parallel batch** after Architecture Analyst.

## Input

- `platform_id` — Pack ID (e.g., `sitecore-xp`)
- `platform_name` — Human-readable name

## Prerequisites

Architecture Analyst must have completed. Call `get_knowledge_pack` with `pack_id` to read the component map and supported versions.

## Protocol

Follow the research protocol from `SCHEMA.md`.

### 1. Research Security Landscape

Use `WebSearch` and `WebFetch` to find:

**CVE History:**
- `"<platform>" CVE site:nvd.nist.gov`
- `"<platform>" security vulnerability OR advisory`
- `"<platform>" security bulletin OR patch`
- Recent CVEs (last 3 years) and their severity (CVSS scores)
- Patching cadence and vendor responsiveness

**Compliance Implications:**
- How does the platform handle PCI DSS requirements?
- HIPAA compliance capabilities/limitations
- SOC 2 relevant controls
- GDPR data handling (data residency, right to erasure, consent management)
- What compliance certifications does the vendor hold?

**Hardening Guides:**
- Official vendor hardening/security guides
- CIS benchmarks (if available)
- OWASP-relevant considerations for this platform
- Default configuration security risks

**Migration-Specific Security Risks:**
- Credential migration (API keys, connection strings, secrets)
- Permission model differences between source and target
- Encryption at rest / in transit changes
- Certificate migration requirements
- Audit log continuity during migration
- Identity provider migration

### 2. Write Security Gotcha Patterns

Call `save_heuristics` with security-focused gotcha patterns:

```json
{
  "pack_id": "<platform_id>",
  "gotcha_patterns": [
    {
      "pattern_id": "gotcha-security-<specific>",
      "pattern_condition": "<condition based on discovery data>",
      "risk_level": "low|medium|high|critical",
      "hours_impact": 8,
      "description": "Security risk during migration: <details>",
      "mitigation": "Specific security mitigation steps",
      "affected_components": ["<component-ids>"]
    }
  ]
}
```

**Note:** Since Gotcha Miner also writes gotcha patterns, use the `gotcha-security-` prefix to avoid ID collisions. The composition engine will deduplicate by `pattern_id`.

### 3. Save Source URLs

Call `save_source_urls` with all sources. Security sources are particularly important for traceability — tag CVE sources with `source_type: "vendor-docs"` and community findings with `source_type: "research"`.

### 4. Output Summary

```
## Security Auditor — <platform_name>

### CVE Summary
- Total CVEs found (last 3 years): <count>
- Critical/High severity: <count>
- Most recent CVE: <CVE-ID> (<date>) — <brief description>
- Patching cadence: <assessment>

### Compliance
- PCI DSS: <supported/partial/limited>
- HIPAA: <supported/partial/limited>
- SOC 2: <supported/partial/limited>
- GDPR: <supported/partial/limited>
- Vendor certifications: <list>

### Migration Security Risks: <count>
| Risk | Severity | Hours Impact | Mitigation |
|------|----------|-------------|------------|
| <description> | <level> | <hours> | <brief mitigation> |

### Hardening Notes
- <key hardening recommendation 1>
- <key hardening recommendation 2>

### Sources Consulted
- <count> sources, <vendor-docs count> vendor docs, <research count> research

### Confidence: <draft>
### Gaps: <security areas with insufficient data>
```

## Quality Gates

- [ ] CVE search completed (even if 0 CVEs found, document the search)
- [ ] At least 2 compliance frameworks assessed
- [ ] At least 3 security-related gotcha patterns documented
- [ ] At least 3 source URLs saved
- [ ] Migration-specific credential/permission risks addressed
