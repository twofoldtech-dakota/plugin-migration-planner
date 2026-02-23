# /migrate challenge — Skeptical Review Half-Step

Run an autonomous quality review on a completed workflow step. Three coordinated agent personas (Orchestrator, Challenger, Researcher) loop through structured review rounds until a confidence score algorithm determines the data meets threshold.

## Usage

```
/migrate challenge [step]
```

Where `[step]` is one of: `discovery`, `analysis`, `estimate`, `refine`. If omitted, auto-detect the most recently completed step from the assessment status.

## Instructions

### 1. Load State

1. Call `get_assessment` with `project_path` set to the current working directory. Fall back to `.migration/assessment.json`. If neither exists, tell the user to run `/migrate new` first.
2. Determine the target step:
   - If the user specified a step, use it.
   - Otherwise, auto-detect from assessment status: `discovery` → challenge discovery, `analysis` → challenge analysis, `estimation` → challenge estimate, `refinement` → challenge refine.
3. Load all data relevant to the target step:
   - **Discovery**: Call `get_discovery` (all dimensions). Read `skills/migrate-knowledge/discovery/discovery-tree.json` for the full question set.
   - **Analysis**: Call `get_analysis`. Read `skills/migrate-knowledge/heuristics/gotcha-patterns.json`, `complexity-multipliers.json`, `dependency-chains.json`.
   - **Estimate**: Call `get_estimate`. Read `skills/migrate-knowledge/heuristics/base-effort-hours.json`, `ai-alternatives.json`.
   - **Refine**: Call `get_estimate`. Load scope exclusions via the refine page API or `.migration/scope-exclusions.json`.
4. Call `get_challenge_reviews` with the assessment ID and step to load any prior challenge review rounds.
5. Read relevant knowledge files from `skills/migrate-knowledge/knowledge/` for cross-referencing.

### 2. Orchestrator: Compute Baseline Score

Adopt the **Orchestrator persona**. You are the control loop — systematic, precise, data-driven.

Calculate the initial **review confidence score** using a weighted average of five dimensions:

```
review_confidence = Σ(dimension_weight × dimension_score) / Σ(dimension_weight)
```

**Dimension weights (all steps):**

| Dimension | Weight |
|-----------|--------|
| Completeness | 25 |
| Consistency | 25 |
| Plausibility | 20 |
| Currency | 15 |
| Risk Coverage | 15 |

**Scoring per step:**

#### Post-Discovery
| Dimension | Measurement |
|-----------|-------------|
| Completeness | (answered_questions / total_required_questions) across all 17 dimensions × 100 |
| Consistency | Cross-dimension references align: topology matches component counts, DB count matches connection strings, instance counts match across dimensions |
| Plausibility | Values within reasonable ranges: instance counts 1-50, DB sizes 1GB-10TB, cache sizes 256MB-128GB |
| Currency | Azure target services listed in discovery are still available/recommended (verify via web search) |
| Risk Coverage | Known risk patterns for this topology type have sufficient data to evaluate |

#### Post-Analysis
| Dimension | Measurement |
|-----------|-------------|
| Completeness | Every in-scope complex dimension has >= 1 risk identified |
| Consistency | Assumptions don't contradict each other or contradict discovery answers |
| Plausibility | Risk severity ratings proportional to estimated hours impact (critical >= 16h, high >= 8h, medium >= 4h) |
| Currency | Mitigation strategies reference current Azure capabilities (verify via web search) |
| Risk Coverage | All gotcha patterns evaluated, all multiplier conditions checked, risk clusters identified for known combinations |

#### Post-Estimate
| Dimension | Measurement |
|-----------|-------------|
| Completeness | All in-scope components have hours assigned, role breakdowns present, AI alternatives evaluated |
| Consistency | Phase ordering respects dependency chains, role hours sum to phase totals, component hours sum to totals |
| Plausibility | Total hours within expected range for topology type, no single component > 30% of total, optimistic/pessimistic ratio between 1.5x and 3x |
| Currency | AI tool savings reflect current tool capabilities (verify via web search for latest versions) |
| Risk Coverage | Pessimistic range covers all identified risks, gotcha patterns add appropriate buffer, assumption widening present for unvalidated assumptions |

#### Post-Refine
| Dimension | Measurement |
|-----------|-------------|
| Completeness | Cascade impacts fully propagated for all exclusions, dependent components flagged |
| Consistency | No in-scope component depends on an excluded component without acknowledgment |
| Plausibility | Less than 40% of total scope excluded (otherwise the scope may be too narrow), remaining scope is coherent |
| Currency | Excluded items are not critical for current Azure deployment requirements (verify via web search) |
| Risk Coverage | Out-of-scope risks and assumptions are properly flagged, excluded component risks noted |

Present the baseline score:

```
CHALLENGE REVIEW: Post-{Step}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Baseline Confidence Score: {score}%

  Completeness     {score}%  ████████░░
  Consistency      {score}%  ██████████
  Plausibility     {score}%  ███████░░░
  Currency         {score}%  ██░░░░░░░░  (needs web verification)
  Risk Coverage    {score}%  █████████░

Focus areas: {lowest 2 dimensions}
```

### 3. Challenger Pass

Switch to the **Challenger persona**. You are skeptical, curious, and thorough. Your job is to find what's missing, inconsistent, or implausible. You push back on every assumption and look for gaps others would miss.

Generate **5-15 structured challenges** targeting the lowest-scoring dimensions. Each challenge must include:

```typescript
{
  id: "CHK-001",           // Sequential within this round
  category: string,        // completeness | consistency | plausibility | currency | risk_coverage
  severity: string,        // critical | high | medium | low
  description: string,     // What's wrong or suspicious
  data_reference: string,  // Specific data point or file referenced
  status: "open",
  resolution: null,
  researcher_needed: boolean,  // true if web search could help resolve
  score_impact: number     // Estimated confidence score improvement if resolved (1-10)
}
```

**Challenge generation rules:**
- At least 1 challenge per dimension scoring below 80
- At least 2 challenges tagged `researcher_needed: true` for currency verification
- Critical severity: Could invalidate the entire step's output
- High severity: Missing data that significantly affects accuracy
- Medium severity: Inconsistency that should be addressed
- Low severity: Minor gap or suggestion for improvement

Present challenges grouped by severity:

```
CHALLENGER FINDINGS — Round {N}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 CRITICAL ({count})
  CHK-001 [completeness] No database sizing data — cannot validate migration approach
  CHK-002 [currency] Azure SQL Managed Instance pricing model changed in 2024

🟠 HIGH ({count})
  CHK-003 [consistency] Discovery says 4 CD instances but analysis only models 2
  ...

🟡 MEDIUM ({count})
  ...

⚪ LOW ({count})
  ...

{count} challenges need researcher investigation.
```

### 4. Researcher Pass

Switch to the **Researcher persona**. You are methodical and evidence-driven. You investigate challenges using live web search and cross-reference against local knowledge files.

For each challenge tagged `researcher_needed: true`:

1. **Use WebSearch** to find current information:
   - Azure service changes: pricing, SKU availability, region support, deprecation notices
   - Sitecore compatibility: supported Azure services, known issues, version constraints
   - Migration tooling: current Terraform, Azure Migrate, DMS versions and capabilities
   - Best practices: latest Microsoft and Sitecore migration guidance

2. **Cross-reference** findings against local knowledge files in `skills/migrate-knowledge/knowledge/`

3. **Produce a finding** for each investigated challenge:

```typescript
{
  challenge_id: "CHK-002",
  finding: string,           // What was discovered
  source: string,            // Knowledge file path OR "web search"
  source_url: string | null, // URL if from web search
  verified_date: string,     // Today's ISO date
  recommendation: string,    // What to do with this information
  data_update_suggested: boolean  // Should knowledge files be updated?
}
```

For **non-researcher challenges**, attempt to resolve from existing data:
- Check if the data exists elsewhere in the assessment
- Cross-reference between discovery dimensions
- Apply domain knowledge to resolve plausibility concerns

Present findings:

```
RESEARCHER FINDINGS — Round {N}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHK-002: Azure SQL MI Pricing Update
  Finding: Azure SQL MI pricing was restructured in November 2024. The
  vCore-based purchasing model now includes a "Next-gen" tier.
  Source: https://learn.microsoft.com/en-us/azure/azure-sql/...
  Verified: {today}
  Recommendation: Update estimate to reflect current pricing tier options.
  ⚠️ Suggests updating knowledge file: azure-sitecore-requirements.md

CHK-005: Sitecore 10.3 Azure Compatibility
  Finding: Sitecore 10.3 officially supports Azure SQL MI with specific
  configuration requirements documented in KB1001489.
  Source: https://support.sitecore.com/...
  Verified: {today}
  Recommendation: No changes needed — current data is accurate.
```

### 5. Orchestrator: Recompute Score

Switch back to the **Orchestrator persona**.

1. **Update dimension scores** based on challenge resolutions and researcher findings:
   - Resolved challenges: improve the relevant dimension score
   - Findings confirming current data: improve currency score
   - Findings suggesting updates: note but don't penalize (these are improvements)

2. **Resolve challenges** where possible:
   - If a finding directly addresses a challenge, mark it `resolved` with the finding as resolution
   - If the data was found elsewhere in the assessment, mark it `resolved`
   - Challenges that need user input remain `open`

3. **Recompute the confidence score** with updated dimension values

4. **Check convergence:**

   **Pass conditions (stop looping):**
   - Score >= 80 → Status: `passed`
   - Score >= 65 AND no critical/high challenges remain open → Status: `conditional_pass`

   **Continue condition:**
   - Score improved by >= 5 points since last round AND threshold not met → loop back to Step 3

   **Plateau condition (engage user):**
   - Score < 80 AND score improved by < 5 points → go to Step 6

Present updated score:

```
SCORE UPDATE — Round {N}
━━━━━━━━━━━━━━━━━━━━━━━

Previous: {prev_score}% → Current: {new_score}% (+{delta})

  Completeness     {score}% (+{delta})
  Consistency      {score}% (+{delta})
  Plausibility     {score}% (+{delta})
  Currency         {score}% (+{delta})  ← improved by web verification
  Risk Coverage    {score}% (+{delta})

Challenges: {resolved}/{total} resolved
Open critical/high: {count}

Decision: {PASS | CONDITIONAL_PASS | CONTINUE | PLATEAU}
```

### 6. Save Round Results

After each round (regardless of outcome), save the results:

**Step 1 — Save to MCP:** Call `save_challenge_review` with:
- `assessment_id`, `step`, `round` (auto-increments)
- `status`: current round status
- `confidence_score`: computed score
- `score_breakdown`: per-dimension scores
- `acceptance_criteria_met`: boolean map of criteria
- `challenges`: full challenge array with updated statuses
- `findings`: all researcher findings with source URLs
- `summary`: narrative summary of this round
- `completed_at`: ISO timestamp if round is final

**Step 2 — Write JSON snapshot:** Write `.migration/challenge-reviews/{step}-round-{N}.json`:
```json
{
  "step": "discovery",
  "round": 1,
  "status": "failed",
  "confidence_score": 62,
  "score_breakdown": {
    "completeness": 85,
    "consistency": 72,
    "plausibility": 68,
    "currency": 30,
    "risk_coverage": 55
  },
  "challenges": [],
  "findings": [],
  "summary": "..."
}
```

### 7. User Engagement (Plateau Only)

If the score has plateaued (improved < 5 points) and is below threshold:

1. **Present unresolved items** — only the critical and high challenges that remain open
2. **Ask targeted questions** — not a barrage. Focus on items that genuinely need human knowledge:
   - Internal infrastructure details not findable via web search
   - Business constraints and priorities
   - Organizational decisions (e.g., timeline flexibility, budget constraints)
3. **Wait for user input** on each question
4. **Recompute score** after user provides answers
5. If score now meets threshold, proceed to finalize. Otherwise, note remaining gaps.

```
REVIEW PLATEAU — Need Your Input
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Score: {score}% (target: 80%, improved only {delta}pts last round)

{count} items need information only you can provide:

1. CHK-007 [critical] Database sizing: How large is the production SQL
   Server database? (Current assumption: <50GB)
   → This affects migration approach choice and timeline.

2. CHK-011 [high] VPN connectivity: Does the current AWS environment
   use Site-to-Site VPN or Direct Connect?
   → This determines networking phase complexity.

Please answer what you can — any input helps improve the review.
```

### 8. Finalize and Present Report

Once the review terminates (pass, conditional pass, or plateau with user engagement):

```
CHALLENGE REVIEW COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━

Step: {step} | Rounds: {N} | Status: {PASSED ✓ | CONDITIONAL PASS ⚠ | PLATEAU ◆}

Final Confidence Score: {score}%

  Completeness     {score}%  ████████░░
  Consistency      {score}%  ██████████
  Plausibility     {score}%  ███████░░░
  Currency         {score}%  ████████░░  (verified {date})
  Risk Coverage    {score}%  █████████░

Round History:
  Round 1: 52% → 62% (+10)
  Round 2: 62% → 74% (+12)
  Round 3: 74% → 82% (+8) ← PASSED

Challenges: {resolved}/{total} resolved
  Critical: {count} ({open} open)
  High: {count} ({open} open)
  Medium: {count} ({open} open)
  Low: {count} ({open} open)

Research Findings: {count} web-verified items
  {count} confirmed current data
  {count} suggested knowledge updates

{#if conditional_pass}
⚠ Conditional pass — the following items should be addressed before proceeding:
  - CHK-xxx: ...
  - CHK-xxx: ...
{/if}

{#if plateau}
◆ Review plateaued — unresolved items documented. Consider addressing
  before proceeding to the next step.
{/if}

Recommendations:
- {next step suggestion}
- {if challenge_required is false} Consider enabling challenge gates:
  set challenge_required on the assessment for mandatory quality checks
```

Suggest the appropriate next step:
- After discovery review: `/migrate analyze`
- After analysis review: `/migrate estimate`
- After estimate review: proceed to refine step in the web UI
- After refine review: `/migrate plan`

### Important Notes

- **Maximum rounds**: Cap at 5 rounds to prevent infinite loops. After 5 rounds, force-present remaining items to user regardless of score.
- **WebSearch usage**: Always use WebSearch for currency dimension checks. This is a key differentiator of the challenge review — bringing in live data.
- **JSON snapshots**: Always write to `.migration/challenge-reviews/` directory, creating it if needed.
- **Autonomous operation**: The loop between Challenger and Researcher should proceed without user interaction unless a plateau is reached. Keep the user informed of progress between rounds with the score update display.
- **No destructive changes**: The challenge review reads data but does NOT modify discovery, analysis, estimate, or scope data. It only writes challenge review records. Any suggested changes are noted as recommendations.
