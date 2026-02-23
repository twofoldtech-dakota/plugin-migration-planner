# /migrate new — Start New Migration Assessment

Start a new migration assessment. Supports any platform and infrastructure combination available in the knowledge base (Sitecore XP, AWS, Azure, etc.). This creates the `.migration/` directory and initializes project metadata. Optionally accepts a high-level environment overview to pre-fill discovery answers.

Multiple assessments can coexist in the same project directory. Creating a new assessment does NOT affect existing ones — it simply becomes the new active assessment.

## Instructions

When the user runs `/migrate new`, do the following:

### 1. Check for Existing Assessments

Call the MCP tool `list_assessments` with `project_path` set to the current working directory.

- If **one or more assessments** already exist, show them briefly and note:
  > "Creating a new assessment will NOT affect these existing ones. The new assessment will become active. You can switch back any time with `/migrate switch`."
- If **no assessments** exist, also check for a legacy `.migration/assessment.json` file. If found, mention it will be auto-imported when accessed.
- Proceed to Step 2 regardless — there is no archive/overwrite workflow.

### 2. Gather Client Information

Before gathering project details, check for an existing client profile:

1. Call the MCP tool `list_clients` to see if any clients exist.
2. Ask the user: "Is this for an existing client or a new one?"
   - **Existing client**: Show the list and let them pick. Load proficiencies with `get_client_proficiencies`.
   - **New client**: Ask for client name and industry. Generate a client ID and call `save_client`.

3. **Tech proficiency**: For new clients (or existing clients without proficiency data), briefly ask about the team's technology experience. Read the proficiency categories from `skills/migrate-knowledge/heuristics/tech-proficiency-catalog.json` and ask something like:

   > "How experienced is your team with these areas? Rate each as none/beginner/intermediate/advanced/expert, or I'll default to 'beginner'."
   >
   > - Infrastructure as Code (Terraform, Bicep)
   > - Azure Platform
   > - Database Administration
   > - AI Coding Tools (Copilot, Claude Code)
   > - CI/CD & DevOps
   > - Monitoring
   > - Security & Compliance
   > - Testing (Playwright, K6)
   > - Networking
   > - Storage & Data Transfer

   Accept whatever detail they provide — even "we're mostly beginners except expert in Azure" is fine. Map to the category IDs and save with `save_client_proficiencies`.

### 3. Gather Project Information

First, load available knowledge packs by calling `list_knowledge_packs` to get the available platforms and infrastructure options.

Ask the user for the following information conversationally. Accept whatever they provide and use sensible defaults for anything they skip:

- **Project name** — A short name for this migration engagement
- **Client name** — The client organization (pre-fill from client profile if available)
- **Architect name** — Who is conducting this assessment (default: skip)
- **Target timeline** — When does the client want to complete the migration? (e.g., "Q3 2026", "6 months", "end of year")
- **Source platform** — What platform is currently running? Show available platforms from knowledge packs (e.g., "Sitecore XP"). If they mention a platform not in the DB, record it as-is.
- **Platform version** — What version? (populate options from the selected pack's `supported_versions`)
- **Topology** — If the selected platform has `valid_topologies`, ask which one applies (e.g., "Is this a single server, scaled with separate CM/CD, full XP with xConnect, or XP with EXM email?")
- **Source infrastructure** — Where is it hosted? Show available infrastructure packs (e.g., "AWS", "Azure")
- **Target infrastructure** — Where should it go? Show compatible targets from the source platform pack's `compatible_infrastructure`

You can ask these in a natural conversational flow, gathering multiple answers at once if the user provides them.

### 4. Offer Environment Overview

After gathering basic metadata, prompt the user:

> "Would you like to give me a high-level overview of your current environment and what you want to migrate to? This can be anything — a few bullet points, prose, pasted config snippets, Terraform output, architecture diagrams described in text, etc. I'll use it to pre-fill the discovery interview so you don't have to answer everything from scratch."

- Accept **any format**: prose paragraphs, bullet lists, pasted config files, Terraform snippets, CloudFormation excerpts, architecture doc fragments, or even rough notes
- This step is **entirely optional** — if the user declines or says "skip", proceed directly to Step 6 (directory creation) with no pre-fill
- If the user provides an overview, proceed to Step 4

### 5. Parse Overview Against Discovery Tree

Load the discovery tree by calling `get_discovery_tree` with the pack IDs from the source stack (e.g., `pack_ids: ["sitecore-xp"]`). If the MCP tool returns null, fall back to reading `skills/migrate-knowledge/discovery/discovery-tree.json`. Run a three-pass extraction against it:

#### Pass 1: Direct Extraction
Scan the overview text for answers to required and conditional questions across all dimensions. Also incorporate metadata already gathered in Step 3:

- Platform version from Step 3 → `compute_sitecore_version` (or equivalent for the platform)
- Topology from Step 3 → CM/CD instance counts, xConnect flags, EXM flags (platform-specific)
- Any infrastructure details mentioned (instance types, database engines, CDN providers, etc.) → map to the corresponding question IDs

For each extracted answer, record:
```json
{
  "value": "<extracted value>",
  "confidence": "assumed",
  "basis": "extracted from initial overview",
  "notes": ""
}
```

#### Pass 2: Inference Cascade
Apply inference rules from the discovery tree, processing dimensions in order (1-17). After each pass through all dimensions, check if any new inferences became possible. Repeat until no new inferences are produced.

Examples of inference chains:
- Sitecore 10.3 → Windows Server 2019, Solr 8.8, TLS 1.2, Identity Server present, SCS serialization
- 4 CD instances → auto-scaling likely, Redis for session state likely
- RDS SQL Server → RDS Multi-AZ HA likely, ElastiCache for Redis likely
- CloudFront mentioned → Route 53 DNS likely

For each inferred answer, record:
```json
{
  "value": "<inferred value>",
  "confidence": "assumed",
  "basis": "inferred: <rule ID or plain-English explanation>",
  "notes": ""
}
```

#### Pass 3: Domain Knowledge Defaults
Apply conservative Sitecore-specific defaults **only** for values that are overwhelmingly common in real deployments and have not been set by Pass 1 or 2. Examples:

- `database_encryption_at_rest`: `true` (virtually all production RDS instances)
- `search_solr_ssl`: `true` (required since Sitecore 9.1)
- `ssl_tls_version`: `"TLS 1.2"` (Sitecore 10.x default)

For each default, record:
```json
{
  "value": "<default value>",
  "confidence": "assumed",
  "basis": "domain knowledge: <reason>",
  "notes": ""
}
```

**Important:** Do NOT set defaults for values that vary significantly across deployments (database sizes, instance types, custom integration counts, etc.). Only use defaults where 90%+ of Sitecore deployments share the same value.

### 6. Create Directory Structure

Create a namespaced directory under `.migration/` using the assessment ID:
```
.migration/
.migration/<assessment-id>/
.migration/<assessment-id>/discovery/
.migration/<assessment-id>/calibration/
.migration/<assessment-id>/comparisons/
.migration/<assessment-id>/deliverables/
```

Also ensure `.migration/` itself exists (it may already if other assessments are present).

### 7. Save Assessment

Generate a UUID using a bash command: `python -c "import uuid; print(uuid.uuid4())"` or `uuidgen` if available.

**Step 1 — Save to MCP (primary):** Call the `save_assessment` MCP tool with:
```json
{
  "id": "<generated UUID>",
  "project_name": "<project name>",
  "client_name": "<client name>",
  "client_id": "<client ID from Step 2>",
  "architect": "<architect name or empty>",
  "project_path": "<current working directory absolute path>",
  "source_stack": {
    "platform": "<platform pack ID, e.g. sitecore-xp>",
    "platform_version": "<version>",
    "topology": "<topology key if applicable>",
    "infrastructure": "<infrastructure pack ID, e.g. aws>",
    "services": []
  },
  "target_stack": {
    "platform": "<target platform pack ID if different>",
    "infrastructure": "<target infrastructure pack ID, e.g. azure>",
    "services": []
  },
  "migration_scope": {
    "type": "<cloud-migration|re-platform|upgrade|de-platform>",
    "layers_affected": ["<infrastructure>", "<services>", "<data>", "<platform>"],
    "complexity": "<minor|moderate|major|transformational>"
  },
  "sitecore_version": "<version (legacy, populate for backward compat)>",
  "topology": "<topology (legacy)>",
  "source_cloud": "<source infrastructure (legacy)>",
  "target_cloud": "<target infrastructure (legacy)>",
  "target_timeline": "<target>",
  "environment_count": 1,
  "environments": [],
  "status": "discovery"
}
```

**Step 2 — Set active:** Call the `set_active_assessment` MCP tool with:
```json
{
  "project_path": "<current working directory absolute path>",
  "assessment_id": "<generated UUID>"
}
```

**Step 3 — Write JSON snapshot:** Write `.migration/<assessment-id>/assessment.json` with the same data for portability.

**Step 4 — Write active pointer:** Write the assessment ID to `.migration/.active` (plain text file, overwriting if it exists).

### 8. Save Pre-filled Discovery Data

**Skip this step entirely if no overview was provided in Step 4.**

For each dimension that has at least one extracted/inferred/defaulted answer from Step 5:

**Step 1 — Save to MCP (primary):** Call the `save_discovery` MCP tool with:
```json
{
  "assessment_id": "<assessment UUID>",
  "dimension": "<dimension id>",
  "status": "partial",
  "answers": {
    "<question_id>": {
      "value": "<extracted/inferred/default value>",
      "confidence": "assumed",
      "basis": "<source description>",
      "notes": ""
    }
  }
}
```

**Step 2 — Write JSON snapshot:** Write `.migration/<assessment-id>/discovery/<dimension>.json` with the same data plus a `"source"` field:
```json
{
  "dimension": "<dimension id>",
  "status": "partial",
  "source": "overview_extraction",
  "answers": {
    "<question_id>": {
      "value": "<value>",
      "confidence": "assumed",
      "basis": "<source description>",
      "notes": ""
    }
  }
}
```

**Critical rules:**
- ALL pre-filled dimensions get `status: "partial"` — never `"complete"` until the user explicitly reviews them in `/migrate discover`
- ALL pre-filled answers get `confidence: "assumed"` regardless of how certain the extraction seems
- The `"source": "overview_extraction"` field in JSON snapshots is used by `/migrate discover` to detect pre-filled dimensions

### 9. Show Extraction Summary

**Skip this step entirely if no overview was provided in Step 4.**

Display a summary of what was extracted. Format:

```
Overview Extraction Summary
───────────────────────────

Extracted X answers across Y dimensions:

  Pass 1 (direct extraction):   N answers
  Pass 2 (inference cascade):   N answers
  Pass 3 (domain defaults):     N answers

Per-dimension breakdown:

  [~] Compute / Hosting      — 5/7 required questions (assumed)
  [~] Database               — 6/8 required questions (assumed)
  [~] Search (Solr)          — 4/7 required questions (assumed)
  [~] Caching (Redis)        — 3/6 required questions (assumed)
  [~] CDN                    — 2/6 required questions (assumed)
  [ ] DNS                    — 0 questions
  [~] SSL / TLS              — 1/5 required questions (assumed)
  ...

Key extractions:
  - 4 CD instances on m5.large behind CloudFront
  - RDS SQL Server 2019 Multi-AZ
  - SolrCloud with 3 nodes on EC2
  - Redis ElastiCache for session state
  - Target: Azure PaaS

All answers are marked "assumed" until you confirm them in /migrate discover.
```

Use the `[~]` marker for dimensions with pre-filled answers and `[ ]` for dimensions with nothing extracted. Show the count of required questions answered out of total required questions for each dimension.

After the per-dimension breakdown, list the most notable extractions in plain English so the user can quickly sanity-check.

### 10. Confirm and Guide

After creating the assessment, display:
- A summary of what was created
- The assessment ID
- Current status: **Discovery**
- If other assessments exist: "This is now the active assessment (N total). Use `/migrate switch` to change."

If an overview was provided:
- Mention the pre-filled count: "Pre-filled **X answers** across **Y dimensions** from your overview."
- Emphasize that `/migrate discover` will be shorter: "Run `/migrate discover` to review pre-filled answers and fill in the gaps — it'll be much shorter than starting from scratch."
- Note that all pre-filled answers are assumptions: "Everything extracted is marked as 'assumed' until you confirm it during discovery."

If no overview was provided:
- Next step: Suggest running `/migrate discover` to begin the discovery interview

## Example Output (with overview, multiple assessments)

```
Migration assessment initialized.

  Project:    Contoso Digital Platform Migration
  Client:     Contoso Corp
  Source:     Sitecore XP 10.3 (XP Scaled) on AWS
  Target:     Azure
  Timeline:   Q3 2026
  Status:     Discovery

  Assessment ID: a1b2c3d4-...
  State directory: .migration/a1b2c3d4-.../

This is now the active assessment (2 total). Use /migrate switch to change.

Pre-filled 28 answers across 12 dimensions from your overview.

Next step: Run /migrate discover to review pre-filled answers and fill in the gaps.
All pre-filled answers are marked "assumed" until you confirm them during discovery.
You can also run /migrate gaps at any time to see what information is still needed.
```

## Example Output (without overview)

```
Migration assessment initialized.

  Project:    Contoso Digital Platform Migration
  Client:     Contoso Corp
  Source:     Sitecore XP 10.3 (XP Scaled) on AWS
  Target:     Azure
  Timeline:   Q3 2026
  Status:     Discovery

  Assessment ID: a1b2c3d4-...
  State directory: .migration/a1b2c3d4-.../

Next step: Run /migrate discover to begin the infrastructure discovery interview.
You can also run /migrate gaps at any time to see what information is still needed.
```
