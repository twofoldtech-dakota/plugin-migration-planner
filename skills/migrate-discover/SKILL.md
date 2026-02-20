# /migrate discover — Discovery Interview

Conduct or resume the infrastructure discovery interview for the current migration assessment. Walks through 17 dimensions of infrastructure discovery with branching questions.

## Instructions

### 1. Load State

1. Read `.migration/assessment.json` — if it doesn't exist, tell the user to run `/migrate new` first.
2. Read the discovery tree from `discovery/discovery-tree.json` (in this skill's parent directory: `skills/migrate-knowledge/discovery/discovery-tree.json`).
3. Read dimension descriptions from `skills/migrate-knowledge/discovery/dimension-descriptions.md` for context.
4. Scan `.migration/discovery/` for existing dimension files to determine progress.

### 2. Show Progress

Display the current discovery progress:
```
Discovery Progress: 3 of 17 dimensions complete

  [x] Compute/Hosting
  [x] Database
  [x] Search
  [ ] Caching
  [ ] CDN
  ...
```

### 3. Conduct Interview

For each incomplete dimension, in order:

#### Starting a Dimension
- Announce which dimension you're starting and briefly explain what it covers (use dimension-descriptions.md)
- Ask the required questions for that dimension conversationally
- You don't have to ask questions one-by-one — group related questions naturally
- Accept partial answers; mark unknown items with `"confidence": "unknown"`

#### Branching Logic
- After getting answers to required questions, check conditional questions
- Only ask conditional questions whose conditions are met based on previous answers
- Example: If `search.type == 'solr_cloud'`, ask about ZooKeeper configuration

#### Inference Rules
- Apply inference rules from the discovery tree when answers aren't provided
- Tell the user what you're inferring: "Since you're on Sitecore 10.3, I'll assume Windows Server 2019 or 2022 — correct?"
- Record inferences with their confidence level

#### Handling "I Don't Know"
- Accept "I don't know" gracefully — record as `"confidence": "unknown"`
- Note what impact this gap has: "No problem — I'll flag this as a gap. It affects estimate accuracy for the database phase by approximately ±20%."

#### Saving Progress
After completing each dimension (or when the user wants to stop):

Write `.migration/discovery/<dimension>.json`:
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

### 4. Interruption Handling

The user can interrupt at any time. When they do:
- Save progress for the current dimension (even if partial)
- Update `.migration/assessment.json` with `"updated": "<now>"`
- Show progress summary
- Tell them they can resume with `/migrate discover`

### 5. Completion

When all 17 dimensions are complete (or the user indicates they're done):
- Show a summary of discovery completeness
- Highlight any dimensions marked as `partial` or `not_started`
- Update `.migration/assessment.json` status to `"analysis"` if all dimensions are at least `partial`
- Suggest next step: `/migrate analyze` for cross-reference analysis, or `/migrate gaps` to review unknowns

## Interview Style

- Be conversational but efficient — don't read questions robotically
- Group related questions: "Let's talk about your database setup. What SQL Server version is running, and is it RDS or self-managed on EC2? How many databases do you have roughly?"
- Acknowledge answers and provide context: "4 CD instances with auto-scaling to 6 — that's a moderately scaled deployment. This will trigger some complexity multipliers in the estimate."
- When you spot risk patterns emerging, mention them casually: "Interesting — SolrCloud with SXA. I'll flag a potential caching interaction risk when we get to analysis."
- If the user provides information out of order, accept it and file it in the right dimension
- If the user dumps a lot of info at once (like pasting infrastructure docs), parse it all and fill in multiple dimensions

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
