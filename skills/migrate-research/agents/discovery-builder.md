# Discovery Builder Agent

Synthesize all research agent outputs into a structured discovery question tree. Runs **after the parallel batch** — reads pack metadata, heuristics, and gotcha patterns to generate targeted discovery questions.

## Input

- `platform_id` — Pack ID (e.g., `sitecore-xp`)
- `platform_name` — Human-readable name

## Prerequisites

All other agents should have completed (or at least Architecture Analyst + Gotcha Miner). Call `get_knowledge_pack` with `pack_id` and `include: ["heuristics", "discovery"]` to read:
- Component map (from Architecture Analyst) → informs which dimensions to create
- Gotcha patterns (from Gotcha Miner) → informs what conditions need discovery questions
- Multiplier conditions (from Effort Calibrator, if available) → informs what data needs collecting
- Supported versions (from Version Historian) → informs version-related questions

## Protocol

Follow the research protocol from `SCHEMA.md`.

### 0. Determine Scope from Pack Category

**Before designing any dimensions**, check the pack's `category` field. The layered composition model requires strict separation of concerns — the composition engine merges trees from multiple packs at assessment time.

Refer to the **Dimension Ownership** table in `SCHEMA.md` for the authoritative mapping of which dimension categories belong to which pack categories.

**For `category: "cms"` (or `commerce`, `martech`, etc.) — Platform packs:**
- Generate ONLY platform-specific dimensions: architecture, modules/features, customizations, content model, integrations, versioning, licensing, personalization, search configuration (platform-level), workflows, user/role model
- Do NOT generate infrastructure dimensions (compute sizing, instance types, database engine/hosting, networking, storage/CDN, caching infrastructure, CI/CD, monitoring, backup/DR, OS, SSL/TLS, DNS, email relay)
- Infrastructure questions will come from the infrastructure pack (e.g., `aws`, `azure`) and be merged by the composition engine

**For `category: "infrastructure"` — Infrastructure packs:**
- Generate ONLY infrastructure dimensions: compute/hosting, database engine & hosting, storage, networking, caching, CDN, SSL/TLS, DNS, email/SMTP, CI/CD pipelines, monitoring/observability, backup/DR, OS/runtime
- Do NOT generate platform-specific dimensions (CMS features, content model, customizations, modules, personalization, workflows)
- Platform questions will come from the platform pack (e.g., `sitecore-xp`) and be merged by the composition engine

**For `category: "services"` — Service packs:**
- Generate only dimensions specific to that service (e.g., a `solr` pack covers Solr topology, index configuration, ZooKeeper setup — NOT the CMS or cloud hosting around it)

### 1. Design Discovery Dimensions

Map the platform's components to discovery dimensions. Each dimension covers a logical area **within the pack's scope** (see Step 0):

**Dimension Design Rules:**
- One dimension per major component or component group
- Dimension ID format: `kebab-case` matching the component area (e.g., `compute`, `database`, `search`, `caching`)
- Order dimensions infrastructure-up: networking → compute → data → application → services → operations
- Each dimension should have 3-10 required questions (enough to capture the key facts, not so many it becomes tedious)
- **Respect pack category boundaries** — never generate dimensions outside the pack's scope

**Question Design Rules:**
- Question ID format: `dimension_specific_name` (e.g., `compute_instance_count`, `database_engine_type`)
- Every gotcha pattern condition key MUST have a corresponding discovery question
- Every multiplier condition key MUST have a corresponding discovery question
- Questions should be answerable from infrastructure documentation or by talking to the ops team
- Include `impact` description explaining why the question matters for the estimate
- Types: `text`, `number`, `boolean`, `select` (with `options`), `multi-select`

**Conditional Questions:**
- Add follow-up questions that only apply when a specific answer is given
- Condition format: `question_id == 'value'` or `question_id > N`
- Common patterns: "If HA is enabled, ask about HA configuration details"

**Inference Rules:**
- Add rules that can derive answers from other answers
- Common patterns: "If platform version is X, infer OS requirement is Y"
- Always set confidence to `"medium"` for inferences — they need user confirmation

### 2. Cross-Reference with Heuristics

Read the heuristics already saved for this pack and verify coverage:

1. **Extract condition keys** from all `multipliers[].condition` and `gotcha_patterns[].pattern_condition`
2. **Parse each condition** to find referenced discovery keys (e.g., `instance_count > 2` → needs `instance_count` question)
3. **Check coverage** — every extracted key should have a corresponding question in the discovery tree
4. **Add missing questions** for any uncovered keys

### 3. Write Discovery Tree

Call `save_discovery_tree`:

```json
{
  "pack_id": "<platform_id>",
  "dimensions": [
    {
      "id": "compute",
      "name": "Compute/Hosting",
      "order": 1,
      "description": "Server infrastructure, instance types, scaling configuration",
      "required_questions": [
        {
          "id": "compute_instance_count",
          "text": "How many application server instances are running?",
          "type": "number",
          "default": 1,
          "impact": "Drives compute provisioning effort and scaling complexity multipliers"
        },
        {
          "id": "compute_instance_type",
          "text": "What instance type/size are the servers?",
          "type": "text",
          "impact": "Affects target sizing and cost estimation"
        }
      ],
      "conditional_questions": [
        {
          "id": "compute_ha_config",
          "text": "What is the HA configuration?",
          "condition": "compute_instance_count > 1",
          "type": "select",
          "options": ["active-passive", "active-active", "load-balanced"]
        }
      ],
      "inference_rules": [
        {
          "id": "infer-os-from-version",
          "condition": "platform_version >= '10.0'",
          "infers": "compute_os_version",
          "value": "Windows Server 2019+",
          "confidence": "medium",
          "basis": "<Platform> <version>+ requires Windows Server 2019 or later"
        }
      ]
    }
  ]
}
```

### 4. Output Summary

```
## Discovery Builder — <platform_name>

### Dimensions: <count>
| # | Dimension | Required Qs | Conditional Qs | Inference Rules |
|---|-----------|------------|----------------|-----------------|
| 1 | <name> | <count> | <count> | <count> |
| 2 | <name> | <count> | <count> | <count> |
...

### Total Questions: <required + conditional count>
### Heuristic Coverage: <covered keys / total condition keys> × 100%

### Uncovered Condition Keys
<list any heuristic condition keys that don't have corresponding questions, or "None — full coverage">

### Dimension Order
1. <dimension 1> — <brief rationale for ordering>
2. <dimension 2>
...

### Confidence: <draft>
### Gaps: <components without dimensions, questions that are hard to answer>
```

## Quality Gates

- [ ] At least 5 dimensions
- [ ] At least 3 required questions per dimension
- [ ] 100% coverage of heuristic condition keys (every multiplier/gotcha condition has a question)
- [ ] At least 3 conditional questions across the tree
- [ ] At least 2 inference rules across the tree
- [ ] Dimensions ordered logically (infrastructure-up)
- [ ] Every question has an `impact` description
