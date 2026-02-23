# /migrate discover — Discovery Interview

Conduct or resume the infrastructure discovery interview for the current migration assessment. Walks through the discovered dimensions of infrastructure discovery with branching questions. Supports confirmation-first mode for dimensions pre-filled by `/migrate new`.

## Instructions

### 1. Load State

1. Call the MCP tool `get_assessment` with `project_path` set to the current working directory. If it returns null, fall back to reading `.migration/assessment.json`. If neither exists, tell the user to run `/migrate new` first.
2. Call the MCP tool `get_discovery` with the assessment ID (no dimension filter) to get all existing discovery data. If it returns null, fall back to scanning `.migration/discovery/` for existing dimension files.
3. Load the discovery tree using a cascading fallback:
   - **Primary**: Call the MCP tool `get_composed_discovery_tree` with the `assessment_id`. This automatically resolves all knowledge packs from the assessment's `source_stack`/`target_stack`, merges dimensions by ID (higher-priority packs win), and returns a single deduplicated dimensions array with `packs_used` metadata.
   - **Fallback 1**: If the composed tree returns empty or fails, call `get_discovery_tree` with `pack_ids` derived from the assessment's `source_stack.platform` (e.g., `["sitecore-xp"]`). If `source_stack` is empty, use `["sitecore-xp"]` as default.
   - **Fallback 2**: If MCP tools return null or empty dimensions, fall back to reading `skills/migrate-knowledge/discovery/discovery-tree.json`.
4. Read dimension descriptions from `skills/migrate-knowledge/discovery/dimension-descriptions.md` for context.

### 2. Show Progress

Display the current discovery progress using four dimension states (use the actual count of dimensions from the loaded discovery tree):

```
Discovery Progress: 3 of N dimensions complete, 5 pre-filled

  [x] Compute/Hosting       5/7 confirmed
  [~] Database               6/8 assumed (from overview — needs review)
  [~] Search                 4/7 assumed (from overview — needs review)
  [~] Caching                3/6 assumed (from overview — needs review)
  [~] CDN                    2/6 assumed (from overview — needs review)
  [ ] DNS
  [/] SSL/TLS                1/5 partial (interview started)
  [ ] Storage/Media
  ...
```

**Dimension state markers:**
- `[x]` **Complete** — All required questions have `confidence: "confirmed"` answers
- `[~]` **Pre-filled** — Has assumed answers from overview extraction, needs user review. Detected when: the JSON snapshot has `"source": "overview_extraction"`, OR all answers have `confidence: "assumed"` with basis values starting with "extracted from", "inferred:", or "domain knowledge:"
- `[/]` **Partial** — Interview was started but not finished (mix of confirmed and unanswered questions, or user interrupted mid-dimension)
- `[ ]` **Not started** — No answers recorded

For pre-filled `[~]` dimensions, show the count annotation with "(from overview — needs review)" to make it clear these need confirmation. For `[x]` and `[/]` dimensions, show the count of answered questions.

**Recommended order:** Suggest starting with `[~]` pre-filled dimensions first (confirmation is faster than fresh interviews), then `[/]` partial dimensions, then `[ ]` not-started dimensions.

### 3. Conduct Interview

For each incomplete dimension, in order:

#### Detecting Pre-filled Dimensions
Before starting a dimension, check if it has pre-filled answers. A dimension is pre-filled if:
- The JSON snapshot contains `"source": "overview_extraction"`, OR
- All existing answers have `confidence: "assumed"` with basis values matching extraction patterns ("extracted from initial overview", "inferred: ...", "domain knowledge: ...")

If pre-filled, use **Confirmation-First Mode** (below). Otherwise, use the standard interview flow.

#### Confirmation-First Mode (for pre-filled dimensions)

When entering a dimension with pre-filled answers:

**Step 1 — Present summary of what's captured.** Show a compact list of all assumed answers for this dimension:

```
Database — 6 of 8 required questions pre-filled from your overview:

  Engine:           Amazon RDS for SQL Server  (assumed)
  SQL Version:      SQL Server 2019            (assumed)
  Instance Class:   db.m5.xlarge               (assumed — not in overview, inferred from instance sizing)
  HA Config:        RDS Multi-AZ               (assumed)
  Encryption:       Yes                        (assumed — domain knowledge: standard for production RDS)
  Separate xDB:     No                         (assumed)

  Still needed:
  - Total database size (GB)
  - Custom databases beyond standard Sitecore DBs
```

**Step 2 — Accept bulk confirmation.** Ask: "Does this look right, or do you want to correct anything?"

- If the user says **"looks good"**, **"yes"**, **"correct"**, or similar → promote ALL assumed answers in this dimension to `confidence: "confirmed"`, update their basis to `"confirmed by user (originally: <original basis>)"`, then proceed to ask only the gap questions (Step 4)
- If the user says **"looks good except..."** or provides partial corrections → handle corrections first (Step 3), then bulk-confirm the rest

**Step 3 — Handle corrections.** If the user corrects a value:
- Update the corrected answer with `confidence: "confirmed"` and `basis: "corrected by user"`
- Check if the correction invalidates any inferred values in this or other dimensions. For example, if the user corrects the database engine from RDS to "SQL Server on EC2", re-evaluate inferences that depended on RDS (like `database_ha_config: "RDS Multi-AZ"`)
- If dependent inferences are invalidated, remove them and add those questions to the gap list
- After corrections, bulk-confirm remaining uncorrected assumed answers

**Step 4 — Ask only about gaps.** Transition to asking only the unanswered required questions and any newly-ungated conditional questions. Use the same conversational style as the standard interview flow.

**Step 5 — Save with mixed confidence.** When saving:
- Confirmed answers (bulk or individual) get `confidence: "confirmed"`
- Corrected answers get `confidence: "confirmed"` with `basis: "corrected by user"`
- Any assumed answers the user explicitly left alone get `confidence: "confirmed"` (they reviewed and accepted them)
- Answers to gap questions get `confidence: "confirmed"`

#### Standard Interview Flow (for non-pre-filled dimensions)

##### Starting a Dimension
- Announce which dimension you're starting and briefly explain what it covers (use dimension-descriptions.md)
- Ask the required questions for that dimension conversationally
- You don't have to ask questions one-by-one — group related questions naturally
- Accept partial answers; mark unknown items with `"confidence": "unknown"`

##### Branching Logic
- After getting answers to required questions, check conditional questions
- Only ask conditional questions whose conditions are met based on previous answers
- Example: If `search.type == 'solr_cloud'`, ask about ZooKeeper configuration

##### Inference Rules
- Apply inference rules from the discovery tree when answers aren't provided
- Tell the user what you're inferring: "Since you're on Sitecore 10.3, I'll assume Windows Server 2019 or 2022 — correct?"
- Record inferences with their confidence level

##### Handling "I Don't Know"
- Accept "I don't know" gracefully — record as `"confidence": "unknown"`
- Note what impact this gap has: "No problem — I'll flag this as a gap. It affects estimate accuracy for the database phase by approximately ±20%."
- Let the user know that assumed and unknown answers will be formally tracked: "I'll record this as an assumption. When you run `/migrate analyze`, it'll be registered in the assumptions tracker with its impact on the estimate range and a suggested way to validate it."

#### Saving Progress
After completing each dimension (or when the user wants to stop):

**Step 1 — Save to MCP (primary):** Call the `save_discovery` MCP tool with the assessment ID, dimension name, status, and all answers (including inferred values with their basis). Inferred values should be included in the answers object with `confidence` set to `"assumed"` and the `basis` field explaining the inference rule.

**Step 2 — Write JSON snapshot:** Write `.migration/discovery/<dimension>.json` with the same data:
```json
{
  "dimension": "compute",
  "status": "complete",
  "completed_at": "2026-02-20T...",
  "answers": {
    "compute_cm_instances": {
      "value": 1,
      "notes": "",
      "confidence": "confirmed"
    },
    "compute_cd_instances": {
      "value": 4,
      "notes": "Auto-scales to 6 during peaks",
      "confidence": "confirmed"
    }
  },
  "inferred": {
    "infer_os_version": {
      "value": "Windows Server 2019",
      "basis": "Sitecore 10.3 requires Windows Server 2019+",
      "confidence": "medium"
    }
  }
}
```

Set `"status": "partial"` if not all required questions were answered.

**When saving a previously pre-filled dimension:**
- Remove the `"source": "overview_extraction"` field from the JSON snapshot (the dimension has now been reviewed)
- Set `status` to `"complete"` only when ALL required questions have `confidence: "confirmed"` answers
- If the user reviewed and confirmed everything, all answers should be `"confirmed"` and status should be `"complete"`
- If the user skipped some gap questions, status remains `"partial"`

### 4. Interruption Handling

The user can interrupt at any time. When they do:
- Save progress for the current dimension (even if partial)
- Update `.migration/assessment.json` with `"updated": "<now>"`
- Show progress summary
- Tell them they can resume with `/migrate discover`

### 5. Completion

When all dimensions are complete (or the user indicates they're done):
- Show a summary of discovery completeness
- Highlight any dimensions marked as `partial` or `not_started`

**Call out dimensions that still have only assumed answers** (pre-filled but never reviewed by the user):
```
Note: 3 dimensions have only assumed answers (never reviewed):
  [~] DNS           — 4 assumed answers from overview extraction
  [~] SSL/TLS       — 2 assumed answers from overview extraction
  [~] Monitoring    — 1 assumed answer from overview extraction

These will be treated as assumptions in the estimate, widening the
confidence range. Run /migrate discover again to review them.
```

- Update `.migration/assessment.json` status to `"analysis"` if all dimensions are at least `partial`
- Suggest next step: `/migrate analyze` for cross-reference analysis, or `/migrate gaps` to review unknowns

## Interview Style

- Be conversational but efficient — don't read questions robotically
- Group related questions: "Let's talk about your database setup. What SQL Server version is running, and is it RDS or self-managed on EC2? How many databases do you have roughly?"
- Acknowledge answers and provide context: "4 CD instances with auto-scaling to 6 — that's a moderately scaled deployment. This will trigger some complexity multipliers in the estimate."
- When you spot risk patterns emerging, mention them casually: "Interesting — SolrCloud with SXA. I'll flag a potential caching interaction risk when we get to analysis."
- If the user provides information out of order, accept it and file it in the right dimension
- If the user dumps a lot of info at once (like pasting infrastructure docs), parse it all and fill in multiple dimensions
- In confirmation-first mode, be concise — the user has already provided this info once, don't make them re-read lengthy explanations

## Dimension Order

Process dimensions in this order (infrastructure-up):
1. Compute/Hosting
2. Database
3. Search (Solr)
4. Caching (Redis)
5. CDN
6. DNS
7. SSL/TLS
8. Storage/Media
9. Email (EXM)
10. xConnect/xDB
11. Identity
12. Session State
13. Custom Integrations
14. CI/CD
15. Monitoring
16. Networking/Firewall
17. Backup/DR

The user can request to skip to a specific dimension or do them out of order.

When pre-filled dimensions exist, suggest reviewing `[~]` dimensions first (faster confirmation flow), then `[/]` partial dimensions, then `[ ]` not-started dimensions.

## Post-Completion Suggestion

After all dimensions are complete and data is saved, suggest running a challenge review:

> Discovery complete! Before moving to analysis, consider running `/migrate challenge discovery` to validate data quality, check for inconsistencies across dimensions, and verify Azure target services are still current. This is optional but recommended for high-confidence estimates.
