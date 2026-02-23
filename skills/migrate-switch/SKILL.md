# /migrate switch — Switch Active Assessment

Switch between multiple migration assessments in the same project directory. Lists all assessments and lets the user pick which one to work on.

## Instructions

When the user runs `/migrate switch`, do the following:

### 1. Load Assessments

Call the MCP tool `list_assessments` with `project_path` set to the current working directory.

- If **no assessments** are found, tell the user:
  > No assessments found for this project. Run `/migrate new` to create one.
- If **exactly one assessment** is found, tell the user:
  > Only one assessment exists for this project — it's already active. Run `/migrate new` to create another.
- If **two or more assessments** are found, proceed to Step 2.

### 2. Display Assessment List

Show a numbered list of all assessments with key metadata. Mark the currently active one:

```
Migration Assessments for this project
───────────────────────────────────────

  # │ Project Name              │ Status      │ Created        │ Active
 ───┼───────────────────────────┼─────────────┼────────────────┼────────
  1 │ Contoso Phase 1           │ estimate    │ 2026-01-15     │   *
  2 │ Contoso Phase 2 (PaaS)    │ discovery   │ 2026-02-01     │
  3 │ Contoso Phase 2 (IaaS)    │ discovery   │ 2026-02-01     │

Currently active: #1 — Contoso Phase 1
```

### 3. Ask User to Pick

Ask the user which assessment to switch to. Accept a number from the list.

If the user picks the already-active assessment, confirm it's already active and do nothing.

### 4. Set Active Assessment

Call the MCP tool `set_active_assessment` with:
```json
{
  "project_path": "<current working directory>",
  "assessment_id": "<selected assessment ID>"
}
```

### 5. Confirm Switch

Display a confirmation:

```
Switched active assessment.

  Now working on: Contoso Phase 2 (PaaS)
  Status: discovery
  Assessment ID: <id>
```

Then suggest the logical next step based on the assessment's status:
- `discovery` → "Run `/migrate discover` to continue the discovery interview."
- `analysis` → "Run `/migrate analyze` to review or re-run analysis."
- `estimate` → "Run `/migrate estimate` to review or refine the estimate."
- `complete` → "Run `/migrate plan` to generate deliverables, or `/migrate calibrate` to feed back actuals."

### 6. Update `.migration/.active` File

Write the selected assessment ID to `.migration/.active` (plain text file) so that the filesystem reflects the active assessment. Create the file if it doesn't exist.
