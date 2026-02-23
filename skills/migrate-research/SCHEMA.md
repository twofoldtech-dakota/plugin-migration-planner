# Research Agent Schema

Shared schema, protocols, and quality gates for all research agents in the MigrateIQ platform research pipeline. Every agent skill in `agents/` references this file for standardized behavior.

## Research Protocol

Every research agent follows this protocol:

### 1. Gather
- Search vendor documentation, official guides, release notes
- Search community sources: Stack Overflow, GitHub issues, forums, blog posts
- Search case studies, migration guides, consultant writeups
- Search marketplace/package registries (NuGet, npm, PyPI, Docker Hub)
- Use `WebSearch` and `WebFetch` tools for live data

### 2. Cross-Reference
- Verify every claim across **at least 2 independent sources** before marking `verified`
- Note conflicts between sources explicitly
- Prefer official vendor docs over community sources
- Prefer recent sources (< 2 years old) over older ones
- Flag stale information that may have changed

### 3. Structure
- Output data in the MCP tool schema format (see Output Formats below)
- Use consistent IDs: `kebab-case`, prefixed by category (e.g., `gotcha-solr-zk-quorum-loss`)
- Include descriptions that are actionable, not just informational

### 4. Confidence Tag
Every fact, pattern, or data point gets a confidence level:

| Level | Criteria | Use When |
|-------|----------|----------|
| `verified` | Confirmed in official vendor documentation | Vendor docs, official guides, release notes |
| `community` | Multiple independent community sources agree | Forums, blogs, SO answers with high votes |
| `inferred` | Logical deduction from related verified facts | Derived from architecture constraints, version compatibility |
| `unverified` | Single source, or source quality uncertain | Single blog post, old forum thread, personal experience |

### 5. Source Citation
Every claim must be saved with its source URL via `save_source_urls`:

```json
{
  "pack_id": "<pack-id>",
  "urls": [
    {
      "source_url": "https://...",
      "title": "Descriptive title of the source",
      "source_type": "vendor-docs|blog|research|forum|case-study",
      "claims": ["Claim 1 derived from this source", "Claim 2..."],
      "confidence": "verified|community|inferred|unverified"
    }
  ]
}
```

### 6. Review Gate
- Agent outputs are **draft** until human review
- Set `confidence: "draft"` on the knowledge pack until reviewed
- The orchestrator presents a summary for human approval before promoting to `"preliminary"`

---

## Output Formats

### Knowledge Pack Metadata (`save_knowledge_pack`)
```json
{
  "id": "platform-id",
  "name": "Human-Readable Platform Name",
  "vendor": "Vendor Name",
  "category": "cms|commerce|martech|ai_dev|infrastructure|services|data",
  "subcategory": "enterprise|headless|e-commerce|legacy|framework|hyperscaler|edge|paas|...",
  "description": "One-paragraph description of the platform and its role",
  "direction": "source|target|both",
  "latest_version": "X.Y",
  "supported_versions": ["X.Y", "X.Z"],
  "eol_versions": {"X.W": "2025-12-31"},
  "valid_topologies": ["topology-key-1", "topology-key-2"],
  "deployment_models": ["on-prem", "cloud", "saas", "hybrid"],
  "compatible_targets": ["pack-id-1", "pack-id-2"],
  "compatible_infrastructure": ["azure", "aws", "gcp"],
  "required_services": [],
  "optional_services": [],
  "confidence": "draft",
  "pack_version": "1"
}
```

### Heuristics (`save_heuristics`)
```json
{
  "pack_id": "platform-id",
  "effort_hours": [
    {
      "component_id": "component-kebab-id",
      "component_name": "Human Name",
      "base_hours": 16,
      "unit": "per_instance|flat|per_database|per_integration",
      "includes": "What this covers",
      "role_breakdown": {"infrastructure_engineer": 12, "developer": 4},
      "phase_id": "phase_1"
    }
  ],
  "multipliers": [
    {
      "multiplier_id": "multiplier-kebab-id",
      "condition": "condition_key > threshold",
      "factor": 1.3,
      "applies_to": ["component-id-1", "component-id-2"],
      "reason": "Why this multiplier exists",
      "supersedes": null
    }
  ],
  "gotcha_patterns": [
    {
      "pattern_id": "gotcha-kebab-id",
      "pattern_condition": "condition_key == 'value'",
      "risk_level": "low|medium|high|critical",
      "hours_impact": 24,
      "description": "What happens and why it's a problem",
      "mitigation": "How to mitigate or avoid this",
      "affected_components": ["component-id-1"]
    }
  ],
  "dependency_chains": [
    {
      "chain_id": "chain-kebab-id",
      "predecessor": "component-id-before",
      "successors": ["component-id-after-1", "component-id-after-2"],
      "dependency_type": "hard|soft",
      "reason": "Why this ordering is required"
    }
  ],
  "phase_mappings": [
    {
      "phase_id": "phase_1",
      "phase_name": "Phase 1: Foundation",
      "phase_order": 1,
      "component_ids": ["component-id-1", "component-id-2"]
    }
  ],
  "roles": [
    {
      "role_id": "infrastructure-engineer",
      "description": "Handles cloud provisioning, networking, security groups, IAM",
      "typical_rate_range": "$150-250/hr"
    }
  ]
}
```

### Discovery Tree (`save_discovery_tree`)
```json
{
  "pack_id": "platform-id",
  "dimensions": [
    {
      "id": "dimension-id",
      "name": "Dimension Name",
      "order": 1,
      "description": "What this dimension covers and why it matters for migration",
      "required_questions": [
        {
          "id": "dimension_question_id",
          "text": "Question text",
          "type": "text|number|boolean|select|multi-select",
          "options": ["opt1", "opt2"],
          "default": null,
          "impact": "Why this matters for the estimate"
        }
      ],
      "conditional_questions": [
        {
          "id": "dimension_conditional_id",
          "text": "Follow-up question text",
          "condition": "dimension_question_id == 'value'",
          "type": "text|number|boolean|select|multi-select"
        }
      ],
      "inference_rules": [
        {
          "id": "infer-rule-id",
          "condition": "other_question_id == 'value'",
          "infers": "target_question_id",
          "value": "inferred value",
          "confidence": "medium",
          "basis": "Why this inference is reasonable"
        }
      ]
    }
  ]
}
```

### Migration Path (`save_migration_path`)
```json
{
  "id": "source-id->target-id",
  "source_pack_id": "source-platform-id",
  "target_pack_id": "target-platform-id",
  "prevalence": "very_common|common|uncommon|rare",
  "complexity": "simple|moderate|complex|very_complex",
  "typical_duration": "4-8 weeks",
  "primary_drivers": ["End of support", "Cost reduction", "Feature gaps"],
  "prerequisites": ["Target environment provisioned", "Access credentials available"],
  "service_map": {"source_service": "target_equivalent"},
  "migration_tools": [{"name": "Tool", "purpose": "What it does", "url": "https://..."}],
  "path_gotcha_patterns": [],
  "path_effort_adjustments": [],
  "step_by_step": "Markdown step-by-step migration guide",
  "decision_points": "Markdown: key decisions teams face during this migration",
  "incompatibilities": "Markdown: known incompatibilities and workarounds",
  "confidence": "draft"
}
```

---

## Dimension Ownership

The layered composition model requires that discovery dimensions live in the correct pack. The composition engine merges trees from multiple packs at assessment time, so each pack should only contain dimensions within its scope.

### By Pack Category

| Pack Category | Owns These Dimension Categories | Does NOT Own |
|---------------|-------------------------------|-------------|
| `cms` / `commerce` / `martech` | Architecture & topology, modules/features, customizations & custom code, content model & structure, integrations (platform-level), versioning & licensing, personalization & analytics, search config (platform-level), workflows & publishing, user/role model, multi-site/multi-language | Compute/hosting, database engine & hosting, storage/CDN, networking, caching infra, CI/CD, monitoring, backup/DR, OS, SSL/TLS, DNS, email relay |
| `infrastructure` | Compute/hosting (instance types, sizing, scaling), database engine & hosting (RDS, SQL MI, etc.), storage (S3, Blob, etc.), networking (VPC/VNet, subnets, security groups/NSGs), caching infrastructure (ElastiCache, Redis), CDN, SSL/TLS & certificates, DNS, email/SMTP relay, CI/CD pipelines, monitoring & observability, backup & disaster recovery, OS & runtime | CMS features, content model, customizations, modules, personalization, workflows |
| `services` | Only the service-specific dimensions (e.g., Solr: index config, ZooKeeper, replicas) | Everything outside the service boundary |

### Boundary Examples

| Question | Belongs In | NOT In |
|----------|-----------|--------|
| "How many CM instances are running?" | `cms` pack (Sitecore architecture) | `infrastructure` pack |
| "What EC2 instance type for CM servers?" | `infrastructure` pack (compute sizing) | `cms` pack |
| "What Solr version is running?" | `cms` pack (search config) or `services` pack | `infrastructure` pack |
| "How many RDS instances?" | `infrastructure` pack | `cms` pack |
| "Are custom Sitecore processors in the pipeline?" | `cms` pack (customizations) | `infrastructure` pack |
| "What CI/CD tool deploys the application?" | `infrastructure` pack | `cms` pack |
| "What Sitecore modules are installed?" | `cms` pack (modules/features) | `infrastructure` pack |
| "Is auto-scaling configured?" | `infrastructure` pack | `cms` pack |

### Edge Cases

- **Search**: Split between platform and infrastructure. "Which Sitecore search provider?" → `cms`. "How many Solr nodes? What instance type?" → `infrastructure` or `services`.
- **Caching**: "Is Sitecore HTML cache enabled?" → `cms`. "What ElastiCache node type?" → `infrastructure`.
- **Database**: "How many Sitecore databases (core, master, web)?" → `cms`. "What SQL Server version? RDS Multi-AZ?" → `infrastructure`.

---

## Quality Gates

### Per-Agent Gates
Each agent must meet these criteria before its output is accepted:

| Gate | Threshold | Action if Failed |
|------|-----------|-----------------|
| Source count | >= 3 unique sources per major claim | Agent must search more broadly |
| Confidence distribution | <= 30% `unverified` claims | Agent must cross-reference more |
| Recency | >= 50% of sources < 2 years old | Agent must find current sources |
| Completeness | All required schema fields populated | Agent must fill gaps |

### Pack-Level Gates (Orchestrator)
After all agents complete, the orchestrator checks:

| Gate | Threshold | Action if Failed |
|------|-----------|-----------------|
| Component coverage | >= 5 components with effort hours | Effort Calibrator re-runs |
| Discovery coverage | >= 5 dimensions with >= 3 questions each | Discovery Builder re-runs |
| Gotcha coverage | >= 10 gotcha patterns | Gotcha Miner re-runs |
| Multiplier coverage | >= 3 multipliers | Effort Calibrator re-runs |
| Version coverage | >= 2 supported versions documented | Version Historian re-runs |

---

## Naming Conventions

| Entity | Pattern | Example |
|--------|---------|---------|
| Pack ID | `vendor-product` or `product` | `sitecore-xp`, `umbraco`, `azure`, `aws` |
| Component ID | `category_specific_name` | `compute_app_service`, `database_sql_mi`, `search_elastic` |
| Multiplier ID | `trigger_description` | `multi_instance_scaling`, `ha_active_passive` |
| Gotcha ID | `gotcha_category_specific` | `gotcha_solr_zk_quorum`, `gotcha_exm_ip_warming` |
| Chain ID | `chain_predecessor_successor` | `chain_networking_compute`, `chain_database_identity` |
| Phase ID | `phase_N` | `phase_1`, `phase_2` |
| Role ID | `role_name` | `infrastructure_engineer`, `dba`, `developer` |
| Migration Path ID | `source->target` | `sitecore-xp->sitecore-ai`, `aws->azure` |

---

## Agent Communication

Agents do not communicate directly. They share state through the database:

1. **Architecture Analyst** writes pack metadata → other agents read it via `get_knowledge_pack`
2. **Parallel agents** write to their specific tables → Discovery Builder reads all via `get_knowledge_pack` with `include: ["heuristics", "discovery"]`
3. **Effort Calibrator** reads gotcha patterns + discovery tree → writes effort hours informed by them
4. **Path Mapper** reads both source and target packs → writes migration path
5. **Orchestrator** reads everything via `get_knowledge_pack` with all includes → validates completeness
