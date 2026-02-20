# Migration Planner Plugin for Claude Code

A Claude Code plugin that guides architects through **Sitecore XP on AWS to Sitecore XP on Azure** infrastructure migrations. Provides structured discovery, cross-reference analysis, phased estimation, and client-ready deliverable generation.

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
| `/migrate analyze` | Run cross-reference analysis on discovery data |
| `/migrate estimate` | Generate phased effort estimates |
| `/migrate plan` | Generate client-ready migration plan document |
| `/migrate gaps` | Show unanswered questions and their impact |
| `/migrate compare <topic>` | Compare approaches (e.g., "SQL MI vs SQL VM") |
| `/migrate calibrate` | Feed back actuals to compare against estimates |

## Typical Workflow

```
/migrate new          → Initialize assessment, set project metadata
/migrate discover     → Walk through 17-dimension infrastructure interview
/migrate gaps         → Review what's missing and its impact
/migrate discover     → Fill in gaps from previous session
/migrate analyze      → Cross-reference risks, dependencies, multipliers
/migrate estimate     → Generate phased effort estimates
/migrate plan         → Generate migration plan, risk register, and runbook
```

After migration execution:
```
/migrate calibrate    → Feed back actuals to improve future estimates
```

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
- **Risk identification** from known gotcha patterns specific to Sitecore AWS→Azure migrations
- **Complexity multipliers** that adjust estimates based on environment characteristics
- **Dependency chain mapping** to identify the critical path
- **Gap impact analysis** showing how unknowns affect estimate accuracy

### Estimation
- Base effort hours per component with role breakdowns
- Three-point estimates (optimistic / expected / pessimistic)
- 5-phase breakdown: Infrastructure → Data → Application → Validation → Cutover
- Role-based hours: Infrastructure Engineer, DBA, Sitecore Developer, QA, PM

### Deliverables
- Migration plan document (markdown)
- Risk register
- Cutover runbook with step-by-step checklists

## State Management

All assessment data is stored in `.migration/` in the project directory:

```
.migration/
├── assessment.json          # Project metadata and status
├── discovery/               # Per-dimension discovery data
│   ├── compute.json
│   ├── database.json
│   └── ...
├── analysis.json            # Cross-reference analysis results
├── estimate.json            # Phased effort estimates
├── comparisons/             # Approach comparison reports
├── calibration/             # Actuals feedback data
└── deliverables/            # Generated documents
    ├── migration-plan.md
    ├── risk-register.md
    └── runbook.md
```

Discovery can be interrupted and resumed — progress is saved per dimension.

## Scope

- **Source**: Sitecore XP on AWS (EC2, RDS, ElastiCache, S3, etc.)
- **Target**: Sitecore XP on Azure (VMs, SQL MI, Azure Cache, Blob Storage, etc.)
- **Migration type**: Infrastructure replatforming (no Sitecore version upgrade)
- **Topologies**: XM Single, XM Scaled, XP Scaled, XP + EXM
