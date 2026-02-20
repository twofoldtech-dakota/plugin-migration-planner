# /migrate plan — Generate Migration Plan Document

Generate a comprehensive, client-ready migration plan document from all accumulated assessment data.

## Instructions

### 1. Load All Data

Read the following files:
1. `.migration/assessment.json` — project metadata
2. All files in `.migration/discovery/` — discovery data
3. `.migration/analysis.json` — risk and dependency analysis
4. `.migration/estimate.json` — phased estimates
5. `skills/migrate-knowledge/templates/migration-plan-template.md` — document template
6. `skills/migrate-knowledge/templates/risk-register-template.md` — risk register template
7. `skills/migrate-knowledge/templates/runbook-template.md` — runbook template
8. `skills/migrate-knowledge/knowledge/aws-to-azure-service-map.json` — for service mapping table
9. `skills/migrate-knowledge/knowledge/sitecore-xp-topologies.json` — for topology descriptions

If `analysis.json` or `estimate.json` don't exist, inform the user and suggest running `/migrate analyze` and `/migrate estimate` first. You can still generate a partial plan but warn about missing sections.

### 2. Generate the Migration Plan

Use the `migration-plan-template.md` as the structural guide. Replace ALL `{{PLACEHOLDER}}` tokens with real data from the assessment.

#### Section-by-Section Guidance

**Executive Summary**: Write a concise 2-3 paragraph summary covering what's being migrated, why, the high-level approach, and key numbers (effort, timeline, risk count).

**Current State Architecture**: Synthesize discovery data into a readable description of the current AWS infrastructure. Include specific instance types, counts, database sizes, and integration points. Use tables where they improve clarity.

**Target State Architecture**: Map each current AWS service to its Azure equivalent. Describe the target topology. Include a service mapping table from the aws-to-azure-service-map.json. List all Azure resources that will be provisioned with recommended SKUs/tiers.

**Migration Approach**: Describe the overall strategy (parallel build, phased migration, big-bang cutover). Explain why this approach was chosen based on the specific environment.

**Phase Breakdown**: For each phase, include:
- Duration estimate
- Component list with hours
- Key activities
- Deliverables
- Exit criteria (what must be true before moving to the next phase)

**Timeline**: Create a text-based timeline or Gantt-style representation showing phase overlap and critical path.

**Resource Requirements**: Hours by role, per phase. Include the role descriptions from the heuristics.

**Risk Register**: Format all risks from analysis.json into the risk register template format. Include severity, mitigation, and hours impact.

**Assumptions & Exclusions**: List from estimate.json plus any additional assumptions discovered during planning.

**Success Criteria**: Define measurable criteria for migration success (e.g., all functional tests pass, response times within 10% of baseline, zero data loss).

**Rollback Plan**: Describe the rollback strategy, triggers, and point of no return.

**Post-Migration**: Cover hypercare period, AWS decommissioning timeline, and knowledge transfer.

### 3. Generate Supporting Documents

Also generate:

**Risk Register** (`.migration/deliverables/risk-register.md`):
- Use the risk register template
- Populate with all risks from analysis
- Include severity matrix and trend tracking structure

**Runbook** (`.migration/deliverables/runbook.md`):
- Use the runbook template
- Fill in realistic time estimates for each cutover step based on the environment
- Customize validation checks based on what's in scope (EXM, xConnect, etc.)
- Leave contact information as placeholders for the client to fill in

### 4. Write Output Files

Create the `.migration/deliverables/` directory if it doesn't exist.

Write:
- `.migration/deliverables/migration-plan.md`
- `.migration/deliverables/risk-register.md`
- `.migration/deliverables/runbook.md`

### 5. Present Results

Tell the user:
- Which documents were generated and their paths
- A brief summary of each document
- Any sections that are incomplete due to missing data
- Suggest they review and customize before presenting to the client
- Note that placeholder fields (contacts, exact dates) need to be filled in

### 6. Update Assessment Status

Update `.migration/assessment.json`:
- Set `"status": "planning"` (if not already past this stage)
- Update `"updated"` timestamp

## Quality Standards

- Write in professional, third-person tone suitable for client delivery
- Use specific numbers, not vague language
- Every risk should have a concrete mitigation
- Every phase should have clear entry and exit criteria
- Tables should be properly formatted markdown
- The plan should be self-contained — a reader shouldn't need access to the state files to understand it
