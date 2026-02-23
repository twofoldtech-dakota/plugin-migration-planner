# /migrate plan — Generate Migration Plan Document

Generate a comprehensive, client-ready migration plan document from all accumulated assessment data.

## Instructions

### 1. Load All Data

Load data from MCP tools first, falling back to JSON files:

1. Call `get_assessment` with `project_path` (current working directory). Fall back to `.migration/assessment.json`.
2. Call `get_discovery` with the assessment ID (all dimensions). Fall back to reading `.migration/discovery/` files.
3. Call `get_analysis` with the assessment ID. Fall back to `.migration/analysis.json`. This includes risks, multipliers, and assumptions.
4. Call `get_estimate` with the assessment ID. Fall back to `.migration/estimate.json`.
5. Read `skills/migrate-knowledge/templates/migration-plan-template.md` — document template
6. Read `skills/migrate-knowledge/templates/risk-register-template.md` — risk register template
7. Read `skills/migrate-knowledge/templates/runbook-template.md` — runbook template
8. Load migration path data via MCP: Call `get_migration_path` with the source/target from the assessment's `source_stack`/`target_stack` (e.g., `id: "sitecore-xp-aws->azure"`). This returns the service map (`service_map`), incompatibilities, and decision points. Fall back to reading `skills/migrate-knowledge/knowledge/aws-to-azure-service-map.json`.
9. Load platform pack data via MCP: Call `get_knowledge_pack` with the source platform pack ID and `include: ["ai_alternatives"]`. This returns topology info (`valid_topologies`) and AI alternatives. Fall back to reading `skills/migrate-knowledge/knowledge/sitecore-xp-topologies.json` and `skills/migrate-knowledge/heuristics/ai-alternatives.json`.

If analysis or estimate data is unavailable from both MCP and JSON, inform the user and suggest running `/migrate analyze` and `/migrate estimate` first. You can still generate a partial plan but warn about missing sections.

### 2. Generate the Migration Plan

Use the `migration-plan-template.md` as the structural guide. Replace ALL `{{PLACEHOLDER}}` tokens with real data from the assessment.

#### Section-by-Section Guidance

**Executive Summary**: Write a concise 2-3 paragraph summary covering what's being migrated, why, the high-level approach, and key numbers. Include:
- **Recommended Estimate** (AI-assisted expected hours) as the headline number
- **Range** (low to high)
- **Confidence Score** with brief narrative about what drives it
- Risk count and unvalidated assumption count

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

**Assumptions & Exclusions**: List from estimate.json plus any additional assumptions discovered during planning. Reference formal assumption IDs from assumptions-registry.json where applicable.

**Assumption Sensitivity Analysis** (Section 10.5): Populate from assumptions-registry.json and estimate.json:
- Confidence score with narrative
- Assumption impact table (all assumptions sorted by pessimistic widening hours)
- Scenario comparison table (current vs all-validated)
- Top 3-5 assumptions to validate with specific validation methods

**AI Tools & Automation Opportunities** (Section 11.5): Populate from estimate.json ai_alternatives_summary and ai-alternatives.json:
- Effort comparison table (Manual Only vs AI-Assisted)
- Recommended tool table with savings, cost, and status
- Expanded details for each recommended tool including pros, cons, and prerequisites

**Success Criteria**: Define measurable criteria for migration success (e.g., all functional tests pass, response times within 10% of baseline, zero data loss).

**Rollback Plan**: Describe the rollback strategy, triggers, and point of no return.

**Post-Migration**: Cover hypercare period, AWS decommissioning timeline, and knowledge transfer.

### 3. Generate Supporting Documents

Also generate:

**Risk Register** (`.migration/deliverables/risk-register.md`):
- Use the risk register template
- Populate with all risks from analysis
- Include severity matrix and trend tracking structure
- Fill in the "Linked Assumptions" column — for each risk, identify assumptions from the registry that are related (e.g., a database risk links to ASMP-003 about assumed database size)

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
- Suggest `/migrate dashboard` to generate the interactive HTML dashboard for client presentations

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

## Gate Check (Pre-Step)

Before generating the plan, check if the assessment has `challenge_required: true`. If so, call `get_challenge_reviews` for the `estimate` step. If no review exists with status `passed` or `conditional_pass`, inform the user:

> This assessment requires challenge reviews before advancing. Run `/migrate challenge estimate` first to validate estimate quality, then re-run `/migrate plan`.
