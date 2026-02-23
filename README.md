# Migration Planner Plugin for Claude Code

A Claude Code plugin that guides architects through **Sitecore XP on AWS to Sitecore XP on Azure** infrastructure migrations. Provides structured discovery, cross-reference analysis, phased estimation with AI alternatives, formal assumption tracking, confidence scoring, and an interactive HTML dashboard for client presentations.

## Installation

```bash
claude plugin add /path/to/plugin-migration-planner
```

Or reference it directly:

```bash
claude --plugin-dir ./plugin-migration-planner
```

## Commands

| Command | Description |
|---------|-------------|
| `/migrate new` | Start a new migration assessment |
| `/migrate discover` | Conduct or resume the discovery interview |
| `/migrate analyze` | Run cross-reference analysis and generate assumptions registry |
| `/migrate estimate` | Generate phased estimates with AI alternatives and confidence scoring |
| `/migrate plan` | Generate client-ready migration plan document |
| `/migrate gaps` | Show assumptions, gaps, and estimate tightening projections |
| `/migrate compare <topic>` | Compare approaches (e.g., "SQL MI vs SQL VM") |
| `/migrate calibrate` | Feed back actuals (including AI tool performance) |
| `/migrate dashboard` | Generate interactive HTML dashboard |

## Typical Workflow

```
/migrate new          → Initialize assessment, set project metadata
/migrate discover     → Walk through 17-dimension infrastructure interview
/migrate gaps         → Review what's missing and its impact
/migrate discover     → Fill in gaps from previous session
/migrate analyze      → Cross-reference risks, dependencies, and generate assumptions registry
/migrate estimate     → Generate phased estimates with AI alternatives and confidence score
/migrate gaps         → Validate assumptions to tighten the estimate range
/migrate plan         → Generate migration plan, risk register, and runbook
/migrate dashboard    → Generate interactive HTML dashboard for client presentations
```

After migration execution:
```
/migrate calibrate    → Feed back actuals and AI tool performance to improve future estimates
```

## v2.0 Features

### Assumptions Tracking

Every assumed or unknown discovery answer is formally registered by `/migrate analyze` with:
- Unique ID (`ASMP-001` through `ASMP-NNN`)
- Impact assessment: affected components, hours at risk, pessimistic widening
- Validation method: how to confirm the assumption
- Validation status: unvalidated / validated / invalidated

Use `/migrate gaps` to see all assumptions ranked by impact, and validate them to tighten the estimate range.

### AI Alternatives

A catalog of 27 AI and automation tools across 12 categories is built in. Each tool includes:
- Estimated hours saved (3-point: optimistic / expected / pessimistic)
- Cost information and prerequisites
- Applicability conditions and mutual exclusion groups (e.g., Terraform vs Bicep)

The estimate always shows both **Manual-Only** and **AI-Assisted** numbers side by side. AI savings are capped at 50% per component to keep estimates credible.

### Confidence Score

The confidence score measures how much of the estimate is based on confirmed data:

```
confidence = (validated_assumptions + confirmed_answers) / total_data_points × 100
```

As assumptions are validated, the pessimistic range shrinks and confidence increases. The estimate includes a narrative showing how many assumptions to validate to reach a target confidence level.

### Interactive Dashboard

`/migrate dashboard` generates a self-contained HTML file (no external dependencies) with:
- **Summary cards**: Recommended Estimate, Range, Confidence %, AI Savings
- **Confidence meter**: Visual indicator with improvement narrative
- **Phase breakdown**: Expandable tables with firm vs assumption-dependent hours
- **Component toggles**: Include/exclude scope items with real-time recalculation
- **AI tools panel**: Toggle AI tools on/off, see savings update instantly
- **Assumptions panel**: Sorted by impact, color-coded by confidence level
- **Scenario comparison**: Manual Only / AI-Assisted / Best Case
- **Role breakdown**: Hours by role with rate ranges
- **Risk summary**: From analysis, linked to assumptions
- **Print/PDF mode**: Clean client-ready layout via browser print

### Client-Facing Estimate Presentation

Every estimate presents three key numbers:
- **Recommended Estimate**: Expected hours with AI tools enabled
- **Low Estimate**: Optimistic with AI (best case)
- **High Estimate**: Pessimistic without AI + assumption widening (worst case)

## What It Covers

### 17 Discovery Dimensions
1. Compute/Hosting
2. Database (SQL Server)
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

### Analysis Capabilities
- **Risk identification** from known gotcha patterns specific to Sitecore AWS-to-Azure migrations
- **Complexity multipliers** that adjust estimates based on environment characteristics
- **Dependency chain mapping** to identify the critical path
- **Gap impact analysis** showing how unknowns affect estimate accuracy
- **Formal assumptions registry** linking every assumption to its impact on estimates

### Estimation
- Base effort hours per component with role breakdowns
- Three-point estimates (optimistic / expected / pessimistic)
- Firm vs assumption-dependent hour split per component
- AI-assisted and manual-only dual estimates
- Confidence score with range narrative
- 5-phase breakdown: Infrastructure → Data → Application → Validation → Cutover
- Role-based hours: Infrastructure Engineer, DBA, Sitecore Developer, QA, PM

### Deliverables
- Migration plan document (markdown) with assumption sensitivity analysis and AI recommendations
- Risk register with linked assumptions
- Cutover runbook with step-by-step checklists
- Interactive HTML dashboard

## State Management

All assessment data is stored in `.migration/` in the project directory:

```
.migration/
├── assessment.json              # Project metadata and status
├── discovery/                   # Per-dimension discovery data
│   ├── compute.json
│   ├── database.json
│   └── ...
├── analysis.json                # Cross-reference analysis results
├── assumptions-registry.json    # Formal assumption tracking
├── estimate.json                # Phased effort estimates with AI alternatives
├── ai-alternatives-selection.json  # AI tool toggle states
├── comparisons/                 # Approach comparison reports
├── calibration/                 # Actuals feedback data
└── deliverables/                # Generated documents
    ├── migration-plan.md
    ├── risk-register.md
    ├── runbook.md
    └── dashboard.html           # Interactive estimate dashboard
```

Discovery can be interrupted and resumed — progress is saved per dimension.

## AI Alternatives Customization

The AI tools catalog is at `skills/migrate-knowledge/heuristics/ai-alternatives.json`. To customize:

- **Add a tool**: Add an entry to the `alternatives` array with required fields (id, name, vendor, category, hours_saved, applicable_components, etc.)
- **Adjust savings**: Modify the `hours_saved` 3-point estimates based on your team's experience
- **Set defaults**: Change `recommendation` to `"recommended"` or `"conditional"` to control which tools are enabled by default
- **Mutual exclusion**: Add `mutual_exclusion` field to prevent incompatible tools from both being selected

After running `/migrate calibrate`, compare estimated vs actual AI savings to refine the catalog for future engagements.

## Scope

- **Source**: Sitecore XP on AWS (EC2, RDS, ElastiCache, S3, etc.)
- **Target**: Sitecore XP on Azure (VMs, SQL MI, Azure Cache, Blob Storage, etc.)
- **Migration type**: Infrastructure replatforming (no Sitecore version upgrade)
- **Topologies**: XM Single, XM Scaled, XP Scaled, XP + EXM
