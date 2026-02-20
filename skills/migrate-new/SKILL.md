# /migrate new — Start New Migration Assessment

Start a new Sitecore XP AWS-to-Azure migration assessment. This creates the `.migration/` directory and initializes project metadata.

## Instructions

When the user runs `/migrate new`, do the following:

### 1. Check for Existing Assessment

Read `.migration/assessment.json` to see if an assessment already exists.
- If it exists, warn the user and ask if they want to:
  - **Continue** the existing assessment (abort this command, suggest `/migrate discover`)
  - **Archive** the existing assessment (rename `.migration/` to `.migration-archive-<date>/`) and start fresh
  - **Overwrite** the existing assessment (delete and recreate)

### 2. Gather Project Information

Ask the user for the following information conversationally. Accept whatever they provide and use sensible defaults for anything they skip:

- **Project name** — A short name for this migration engagement
- **Client name** — The client organization
- **Architect name** — Who is conducting this assessment (default: skip)
- **Target timeline** — When does the client want to complete the migration? (e.g., "Q3 2026", "6 months", "end of year")
- **Sitecore version** — What version of Sitecore XP is running? (e.g., "10.3", "10.2", "10.1")
- **Current topology** — Best guess at current topology (ask: "Is this a single server, scaled with separate CM/CD, full XP with xConnect, or XP with EXM email?")

You can ask these in a natural conversational flow, gathering multiple answers at once if the user provides them.

### 3. Create Directory Structure

Create the following directories:
```
.migration/
.migration/discovery/
.migration/calibration/
.migration/comparisons/
.migration/deliverables/
```

### 4. Write assessment.json

Write `.migration/assessment.json` with this structure:

```json
{
  "id": "<generate a UUID>",
  "name": "<project name>",
  "client": "<client name>",
  "architect": "<architect name or empty>",
  "created": "<ISO date>",
  "updated": "<ISO date>",
  "status": "discovery",
  "target_timeline": "<target>",
  "migration_path": "aws-to-azure",
  "sitecore_version": "<version>",
  "topology": "<topology key: xm_single|xm_scaled|xp_scaled|xp_exm>"
}
```

Generate the UUID using a bash command: `python -c "import uuid; print(uuid.uuid4())"` or `uuidgen` if available.

### 5. Confirm and Guide

After creating the assessment, display:
- A summary of what was created
- The assessment ID
- Current status: **Discovery**
- Next step: Suggest running `/migrate discover` to begin the discovery interview

## Example Output

```
Migration assessment initialized.

  Project:    Contoso Digital Platform Migration
  Client:     Contoso Corp
  Sitecore:   10.3 (XP Scaled)
  Target:     Q3 2026
  Status:     Discovery

  Assessment ID: a1b2c3d4-...
  State directory: .migration/

Next step: Run /migrate discover to begin the infrastructure discovery interview.
You can also run /migrate gaps at any time to see what information is still needed.
```
