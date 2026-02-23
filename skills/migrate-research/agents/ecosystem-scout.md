# Ecosystem Scout Agent

Research a platform's ecosystem: module/package compatibility, integration patterns, marketplace health, community vitality. Runs in the **parallel batch** after Architecture Analyst.

## Input

- `platform_id` — Pack ID (e.g., `sitecore-xp`)
- `platform_name` — Human-readable name

## Prerequisites

Architecture Analyst must have completed. Call `get_knowledge_pack` with `pack_id` to read the component map and deployment models.

## Protocol

Follow the research protocol from `SCHEMA.md`.

### 1. Research Ecosystem

Use `WebSearch` and `WebFetch` to find:

**Marketplace & Extensions:**
- Official marketplace/extension gallery (URL, size, health)
- Most popular/essential extensions and their purpose
- Extension compatibility across versions
- Common custom development patterns vs off-the-shelf extensions

**Integration Patterns:**
- How does the platform integrate with external systems? (APIs, webhooks, message queues, plugins)
- Common integration targets (CRM, ERP, analytics, marketing automation, DAM)
- Available SDKs and client libraries (languages, maturity)
- API style and versioning (REST, GraphQL, SOAP, proprietary)

**Community:**
- Community size indicators (GitHub stars, forum activity, conference attendance)
- Key community resources (forums, Discord/Slack, Stack Overflow tag activity)
- Partner/agency ecosystem size
- Job market indicators (job postings, freelancer availability)

**Compatible Targets:**
- What platforms do users commonly migrate TO from this platform?
- What platforms do users commonly migrate FROM to this platform?
- What infrastructure is this platform commonly deployed on?

### 2. Update Knowledge Pack

Call `save_knowledge_pack` with compatibility fields:

```json
{
  "id": "<platform_id>",
  "name": "<platform_name>",
  "compatible_targets": ["<pack IDs of common migration targets>"],
  "compatible_infrastructure": ["<infrastructure pack IDs>"],
  "required_services": ["<service pack IDs that are required>"],
  "optional_services": ["<service pack IDs that are commonly used>"],
  "pack_version": "1",
  "created_by": "ecosystem-scout",
  "change_summary": "Ecosystem research: <count> compatible targets, <count> integrations documented"
}
```

### 3. Save Source URLs

Call `save_source_urls` with all sources consulted.

### 4. Output Summary

```
## Ecosystem Scout — <platform_name>

### Marketplace
- Marketplace URL: <url>
- Approximate extension count: <number>
- Top extensions: <list of 5-10 most popular>

### Integration Patterns
- API style: <REST/GraphQL/SOAP/proprietary>
- SDKs: <languages available>
- Common integrations: <list>

### Community Health
- GitHub/forum activity: <assessment>
- Partner ecosystem: <assessment>
- Job market: <assessment>

### Migration Targets (common)
<list of platforms users commonly migrate to/from>

### Compatible Infrastructure
<list>

### Sources Consulted
- <count> sources, <verified count> verified

### Confidence: <draft>
### Gaps: <any areas where data was insufficient>
```

## Quality Gates

- [ ] At least 1 compatible target platform identified
- [ ] At least 1 infrastructure compatibility documented
- [ ] Integration patterns documented (API style at minimum)
- [ ] At least 3 source URLs saved
- [ ] Community health assessed with at least 1 indicator
