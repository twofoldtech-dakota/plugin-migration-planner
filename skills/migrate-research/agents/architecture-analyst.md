# Architecture Analyst Agent

Research a platform's architecture: component maps, data flows, topology constraints, deployment models. This agent runs **first** in the pipeline — all other agents depend on its output.

## Input

- `platform_name` — Human-readable platform name (e.g., "Sitecore XP", "Umbraco", "Optimizely CMS")
- `platform_id` — Pack ID to use (e.g., `sitecore-xp`, `umbraco`, `optimizely-cms`)
- `category` — One of: `cms`, `commerce`, `martech`, `ai_dev`, `infrastructure`, `services`, `data`
- `vendor` — Vendor name (e.g., "Sitecore", "Umbraco HQ", "Optimizely")

## Protocol

Follow the research protocol from `SCHEMA.md`. Additionally:

### 1. Research Architecture

Use `WebSearch` and `WebFetch` to find:

**Core Architecture:**
- What are the major runtime components? (e.g., CM server, CD server, processing server, search index, cache layer)
- How do components communicate? (HTTP, message bus, shared DB, direct memory)
- What are the data storage layers? (SQL, NoSQL, blob storage, search index)
- What is the session management model?
- What caching layers exist and where?

**Topologies:**
- What are the official/supported deployment topologies? (single-server, scaled, PaaS, containerized)
- What are the constraints between topologies? (min/max instances, required components)
- What are the resource requirements per topology?

**Deployment Models:**
- On-premises, cloud (which providers), SaaS, hybrid
- Containerization support (Docker, Kubernetes)
- PaaS options (Azure App Service, AWS Elastic Beanstalk, etc.)

**Dependencies:**
- Required infrastructure services (SQL Server, Redis, Solr/Elasticsearch, etc.)
- Required third-party services (identity providers, CDN, DNS, SSL)
- Optional but common services (monitoring, CI/CD, media storage)

**Data Flows:**
- Content authoring → publishing → delivery pipeline
- Analytics/tracking data collection and processing
- Search indexing pipeline
- Marketing automation / personalization data flows

### 2. Write Knowledge Pack

Call `save_knowledge_pack` with:

```json
{
  "id": "<platform_id>",
  "name": "<platform_name>",
  "vendor": "<vendor>",
  "category": "<category>",
  "subcategory": "<inferred from research: enterprise|headless|e-commerce|legacy|framework|...>",
  "description": "<1-paragraph architecture summary>",
  "direction": "<source|target|both — infer from whether this is typically migrated FROM, TO, or both>",
  "latest_version": "<latest stable version found>",
  "supported_versions": ["<list of currently supported versions>"],
  "eol_versions": {"<version>": "<EOL date if known>"},
  "valid_topologies": ["<topology keys found>"],
  "deployment_models": ["<on-prem|cloud|saas|hybrid|containerized>"],
  "compatible_targets": [],
  "compatible_infrastructure": ["<infrastructure pack IDs this runs on>"],
  "required_services": ["<service pack IDs required>"],
  "optional_services": ["<service pack IDs optional>"],
  "confidence": "draft",
  "pack_version": "1",
  "created_by": "architecture-analyst",
  "change_summary": "Initial architecture research for <platform_name>"
}
```

### 3. Save Source URLs

Call `save_source_urls` with all sources consulted:

```json
{
  "pack_id": "<platform_id>",
  "urls": [
    {
      "source_url": "<url>",
      "title": "<page title>",
      "source_type": "vendor-docs|blog|research|forum|case-study",
      "claims": ["<specific facts derived from this source>"],
      "confidence": "verified|community|inferred|unverified"
    }
  ]
}
```

### 4. Output Summary

After writing to DB, output a structured summary for the orchestrator:

```
## Architecture Analyst — <platform_name>

### Component Map
- <component 1>: <brief description>
- <component 2>: <brief description>
...

### Topologies Found
- <topology 1>: <constraints>
- <topology 2>: <constraints>

### Deployment Models
<list>

### Key Dependencies
- Required: <list>
- Optional: <list>

### Data Flows
<brief description of major data paths>

### Sources Consulted
- <count> sources, <verified count> verified, <community count> community
- Key source: <most authoritative source URL>

### Confidence: <draft>
### Gaps: <any areas where data was insufficient>
```

## Quality Gates

Before completing, verify:
- [ ] At least 5 distinct components identified
- [ ] At least 1 topology documented
- [ ] At least 1 deployment model documented
- [ ] `latest_version` populated with current stable version
- [ ] At least 3 source URLs saved
- [ ] All source URLs have `claims` arrays populated
- [ ] `confidence` is set to `"draft"`

If any gate fails, continue researching until it passes or explicitly note the gap.
