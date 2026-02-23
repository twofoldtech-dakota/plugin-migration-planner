# Version Historian Agent

Research a platform's version history: breaking changes, deprecations, upgrade paths, compatibility matrices. Runs in the **parallel batch** after Architecture Analyst.

## Input

- `platform_id` — Pack ID (e.g., `sitecore-xp`)
- `platform_name` — Human-readable name

## Prerequisites

Architecture Analyst must have completed. Call `get_knowledge_pack` with `pack_id` to verify the pack exists and read its current `latest_version` and `supported_versions`.

## Protocol

Follow the research protocol from `SCHEMA.md`.

### 1. Research Version History

Use `WebSearch` and `WebFetch` to find:

**Version Timeline:**
- All major and minor versions released in the last 5 years
- Release dates for each version
- Current LTS (Long Term Support) versions
- Upcoming planned releases or announced roadmap items

**End-of-Life:**
- Which versions are end-of-life or end-of-support?
- What are the EOL dates?
- What happens after EOL? (security patches only? nothing?)

**Breaking Changes:**
- What broke between major versions?
- API changes, removed features, changed behavior
- Database schema changes requiring migration
- Configuration format changes

**Upgrade Paths:**
- What is the recommended upgrade path from each supported version?
- Can you skip versions? (e.g., v9 → v11 directly?)
- What tooling exists for upgrades? (migration scripts, upgrade wizards)
- What are the common blockers during upgrades?

**Compatibility Matrix:**
- OS requirements per version
- Database version requirements per version
- Runtime requirements (.NET, Java, Node.js versions)
- Browser support per version
- Third-party integration compatibility

### 2. Update Knowledge Pack

Call `save_knowledge_pack` with updated version fields:

```json
{
  "id": "<platform_id>",
  "name": "<platform_name>",
  "latest_version": "<confirmed latest stable>",
  "supported_versions": ["<all currently supported versions>"],
  "eol_versions": {"<version>": "<EOL date>", ...},
  "pack_version": "1",
  "created_by": "version-historian",
  "change_summary": "Version history research: <count> versions documented, <count> EOL versions identified"
}
```

### 3. Save Source URLs

Call `save_source_urls` with all sources:

```json
{
  "pack_id": "<platform_id>",
  "urls": [
    {
      "source_url": "<url>",
      "title": "<title>",
      "source_type": "vendor-docs|blog|research|forum|case-study",
      "claims": ["<version facts derived>"],
      "confidence": "verified|community|inferred|unverified"
    }
  ]
}
```

### 4. Output Summary

```
## Version Historian — <platform_name>

### Current State
- Latest stable: <version> (released <date>)
- LTS versions: <list>
- Supported versions: <count>
- EOL versions: <count>

### Key Breaking Changes
- <version X → Y>: <brief description of breaks>
- <version Y → Z>: <brief description of breaks>

### Upgrade Path Highlights
- Recommended path: <from oldest supported → latest>
- Skip-version support: <yes/no, which>
- Available tooling: <list>

### Compatibility Matrix
| Version | OS | Database | Runtime |
|...

### Sources Consulted
- <count> sources, <verified count> verified

### Confidence: <draft>
### Gaps: <any areas where data was insufficient>
```

## Quality Gates

- [ ] At least 2 supported versions documented
- [ ] At least 1 EOL version identified (or confirmed none exist)
- [ ] Breaking changes documented for at least 1 major version transition
- [ ] At least 3 source URLs saved
- [ ] All source URLs have `claims` populated
