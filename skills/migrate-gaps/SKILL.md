# /migrate gaps — Show Discovery Gaps & Assumption Validation

Show unanswered questions, formal assumptions with validation status, and missing discovery dimensions, ranked by their impact on estimate accuracy and confidence score.

## Instructions

### 1. Load Data

1. Call the MCP tool `get_assessment` with `project_path` set to the current working directory. If it returns null, fall back to reading `.migration/assessment.json`. Verify an assessment exists.
2. Call the MCP tool `get_discovery` with the assessment ID to get all discovery data. If it returns null, fall back to reading ALL files in `.migration/discovery/`.
3. Read `skills/migrate-knowledge/discovery/discovery-tree.json` — the full question set
4. Read `skills/migrate-knowledge/discovery/dimension-descriptions.md` — for context on each dimension
5. Call the MCP tool `get_analysis` with the assessment ID. If it returns null, fall back to reading `.migration/analysis.json`. The analysis response includes assumptions data.
6. Call the MCP tool `get_estimate` with the assessment ID. If it returns null, fall back to reading `.migration/estimate.json`.

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

### 3. Show Formal Assumptions (if registry exists)

If `assumptions-registry.json` is available, present assumptions with their formal tracking data:

For each assumption, show:
- **ID**: `ASMP-NNN`
- **Value**: What's currently assumed
- **Basis**: Why this value was assumed
- **Confidence**: `assumed` or `unknown`
- **Validation Status**: `unvalidated` / `validated` / `invalidated`
- **Affected Components**: Which estimate components this impacts
- **Pessimistic Widening**: How many hours this adds to the pessimistic range
- **Validation Method**: How to confirm this assumption

Sort assumptions by `pessimistic_widening_hours` (highest impact first).

### 4. Impact Assessment

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

### 5. Calculate Estimate Tightening Effect

If both `assumptions-registry.json` and `estimate.json` exist, calculate the effect of validating assumptions:

For each unvalidated assumption (sorted by impact):
1. Calculate the pessimistic range reduction: `pessimistic_widening_hours` would be removed
2. Calculate the new confidence score if this assumption were validated
3. Show cumulative effect of validating the top N assumptions

Present as:
```
ESTIMATE TIGHTENING PROJECTIONS
═══════════════════════════════

Current Confidence: 72% | Pessimistic Range: 612 hrs

Validate these assumptions to tighten the estimate:

 #  | Assumption ID | Description                  | Range Reduction | New Confidence
----|---------------|------------------------------|-----------------|---------------
 1  | ASMP-003      | Database size (<50GB)         | -16 hrs         | 76%
 2  | ASMP-007      | xDB contact count (<100K)     | -12 hrs         | 79%
 3  | ASMP-011      | Custom integration count (3)   | -8 hrs          | 82%
    |               |                              |                 |
    | CUMULATIVE    | Validate all 3 above          | -36 hrs         | 82%

Validating these 3 assumptions reduces pessimistic range by 36 hours
and improves confidence from 72% to 82%.
```

### 6. Present Results

Display gaps organized by impact, incorporating formal assumption IDs:

```
Discovery Gaps & Assumptions Analysis
═════════════════════════════════════

Completeness: 12 of 17 dimensions complete (71%)
Confidence Score: 72% (12 assumptions, 3 validated)

HIGH IMPACT GAPS (affect estimate by >20%)
──────────────────────────────────────────

1. [ASMP-007] xConnect contact volume [assumed: <100K]
   Basis: Inferred from XP Scaled default
   Validation: Query xDB collection database for contact count
   If wrong: +36-48 hrs | Pessimistic widening: +12 hrs
   Affects: xconnect_xdb, database_single

2. Networking/Firewall [not started]
   Related: ASMP-009, ASMP-010, ASMP-011
   Missing: VPC layout, subnet design, VPN/ExpressRoute needs
   Impact: Cannot size networking phase. Could add 20-60 hours.

MEDIUM IMPACT GAPS
──────────────────
...

VALIDATED ASSUMPTIONS (confirmed)
─────────────────────────────────
✓ ASMP-001: CM instance count = 1 (confirmed by client)
✓ ASMP-004: SQL collation = SQL_Latin1_General_CP1_CI_AS
...
```

### 7. Assumption Validation Workflow

When the user wants to validate an assumption, follow this workflow:

1. **User provides confirmed value** — e.g., "ASMP-007 is actually 2.5M contacts"
2. **Update via MCP (primary):** Call the `update_assumption` MCP tool with the assessment ID, assumption ID, validation_status (`"validated"` or `"invalidated"`), and optionally `actual_value`. The tool returns the updated confidence score and remaining widening hours.
3. **Update JSON snapshot:** Also update `.migration/assumptions-registry.json`:
   - Set `validation_status: "validated"` (if confirmed as assumed) or `validation_status: "invalidated"` (if different)
   - If invalidated, record `actual_value` and update `assumed_value`
   - Recalculate `confidence_score` in summary
   - Remove `pessimistic_widening_hours` for validated assumptions
4. **If invalidated**, warn about estimate impact:
   - "ASMP-007 invalidated: assumed <100K contacts, actual is 2.5M. This triggers the xdb_very_large multiplier (2.0×) — re-run `/migrate estimate` to recalculate."
5. **Update discovery file** — update the corresponding discovery answer with `confidence: "confirmed"` and the actual value (both via `save_discovery` MCP tool and `.migration/discovery/<dim>.json`)

### 8. Suggest Next Steps

Based on the gaps found:
- If high-impact gaps exist: Suggest specific questions to ask the client, specific things to check in the AWS environment
- If formal assumptions exist: Highlight the top 3 assumptions to validate for maximum confidence improvement
- If only medium/low gaps: Suggest proceeding with `/migrate estimate` with noted assumptions
- If no gaps: Congratulate the user on thorough discovery and suggest `/migrate estimate` or `/migrate plan`
- If estimate exists: Show the tightening projections and suggest validating specific assumptions

Offer to:
- Re-enter discovery mode for specific dimensions: "Want me to run through the networking questions? Run `/migrate discover`"
- Validate specific assumptions: "Tell me the confirmed value for any assumption ID and I'll update the registry"
- Re-run estimate after validation: "After validating assumptions, run `/migrate estimate` to see the tightened range"
