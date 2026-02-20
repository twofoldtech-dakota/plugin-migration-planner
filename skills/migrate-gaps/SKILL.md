# /migrate gaps — Show Discovery Gaps

Show unanswered questions, unvalidated assumptions, and missing discovery dimensions, ranked by their impact on estimate accuracy.

## Instructions

### 1. Load Data

1. Read `.migration/assessment.json` — verify assessment exists
2. Read ALL files in `.migration/discovery/` — gather all discovery data
3. Read `skills/migrate-knowledge/discovery/discovery-tree.json` — the full question set
4. Read `skills/migrate-knowledge/discovery/dimension-descriptions.md` — for context on each dimension
5. Read `.migration/analysis.json` if it exists — for gap analysis already performed

### 2. Identify Gaps

Categorize gaps into three types:

#### Missing Dimensions
Dimensions with no discovery file at all (status: `not_started`).
For each, describe:
- What the dimension covers
- Why it matters for estimation
- Default assumptions that will be used if it remains unanswered
- Impact on estimate accuracy (high/medium/low)

#### Partial Dimensions
Dimensions where `status` is `partial`. For each:
- List the specific unanswered required questions
- List any conditional questions that couldn't be evaluated
- Impact on estimate accuracy

#### Low-Confidence Answers
Answers where `confidence` is `"unknown"` or `"assumed"`. For each:
- What was assumed or marked unknown
- What impact the wrong assumption would have
- How to validate (who to ask, what to check)

### 3. Impact Assessment

Rate each gap's impact on estimate accuracy:

**High Impact** — Could change the total estimate by >20%:
- Database HA configuration unknown
- xConnect/xDB scope unclear
- EXM enablement unknown
- Number of custom integrations unknown
- Networking/VPN requirements unknown

**Medium Impact** — Could change the estimate by 10-20%:
- Exact database sizes unknown
- Solr configuration details missing
- CDN complexity unknown
- Monitoring requirements unspecified
- Backup/DR requirements unclear

**Low Impact** — Changes estimate by <10%:
- Exact certificate count unknown
- DNS record count unknown
- Specific CI/CD tooling unknown
- Monitoring dashboard details missing

### 4. Calculate What Would Change

For each high-impact gap, estimate the range of impact:
- "If xConnect is enabled with >1M contacts, the estimate increases by approximately 36-48 hours"
- "If VPN/ExpressRoute is required, networking effort increases by 30%"
- "If there are >5 custom integrations, add 80+ hours to the estimate"

### 5. Present Results

Display gaps organized by impact:

```
Discovery Gaps Analysis
═══════════════════════

Completeness: 12 of 17 dimensions complete (71%)
Confidence: 85% of answered questions are confirmed

HIGH IMPACT GAPS (affect estimate by >20%)
──────────────────────────────────────────

1. Networking/Firewall [not started]
   Missing: VPC layout, subnet design, VPN/ExpressRoute needs, firewall rules
   Impact: Cannot size networking phase. Could add 20-60 hours.
   To resolve: Ask infrastructure team for VPC/network architecture diagram

2. xConnect contact volume [assumed: <100K]
   Current assumption: Small xDB deployment
   If actually >1M contacts: Adds 36-48 hours + shard migration complexity
   To resolve: Query xDB collection database for contact count

MEDIUM IMPACT GAPS (affect estimate by 10-20%)
───────────────────────────────────────────────
...

LOW IMPACT GAPS (affect estimate by <10%)
─────────────────────────────────────────
...

ASSUMPTIONS NEEDING VALIDATION
──────────────────────────────
- OS Version: Assumed Windows Server 2019 (from Sitecore 10.3)
- Collation: Assumed SQL_Latin1_General_CP1_CI_AS (Sitecore default)
...
```

### 6. Suggest Next Steps

Based on the gaps found:
- If high-impact gaps exist: Suggest specific questions to ask the client, specific things to check in the AWS environment
- If only medium/low gaps: Suggest proceeding with `/migrate analyze` or `/migrate estimate` with noted assumptions
- If no gaps: Congratulate the user on thorough discovery and suggest `/migrate analyze`

Offer to re-enter discovery mode for specific dimensions: "Want me to run through the networking questions now? Run `/migrate discover` and I'll pick up where we left off."
