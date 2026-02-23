# Risk Register — MCK - AWS to Azure

## AWS to Azure Migration

| Field | Value |
|-------|-------|
| **Client** | MCK |
| **Date** | February 21, 2026 |
| **Last Updated** | February 21, 2026 |
| **Total Risks** | 9 |
| **High Risks** | 3 |
| **Medium Risks** | 5 |
| **Low Risks** | 1 |

---

## Risk Severity Matrix

|  | **Low Impact** | **Medium Impact** | **High Impact** |
|--|---------------|-------------------|-----------------|
| **High Likelihood** | Medium | High | Critical |
| **Medium Likelihood** | Low | Medium | High |
| **Low Likelihood** | Low | Low | Medium |

---

## Risk Register

| ID | Category | Description | Likelihood | Impact | Severity | Hours Impact | Linked Assumptions | Mitigation Strategy | Contingency | Owner | Status | Date Identified |
|----|----------|-------------|-----------|--------|----------|-------------|-------------------|---------------------|-------------|-------|--------|----------------|
| RISK-001 | Database | 250GB database exceeds 200GB threshold. Network transfer and index rebuild can take 6-12 hours, exceeding standard maintenance windows. | High | High | High | 16 | ASMP-003 | Use Azure Database Migration Service with continuous sync. Pre-copy bulk data during business hours, then delta sync at cutover. | If DMS sync fails, fall back to backup/restore with extended downtime window (12-16 hrs). | Migration Lead | Open | 2026-02-21 |
| RISK-002 | Storage | Media stored in SQL DB (~50GB+) inflates database size, increases migration time, and causes ongoing performance and cost concerns on Azure SQL. | Medium | Medium | Medium | 16 | ASMP-004 | Consider migrating to Azure Blob Storage during replatform. If keeping in DB, plan for larger migration window and increased Azure SQL storage costs. | Keep media in SQL initially, plan post-migration media externalization as phase 2. | Migration Lead | Open | 2026-02-21 |
| RISK-003 | Integration | AWS Secrets Manager to Azure Key Vault migration requires code changes. Different API, naming conventions, SDK, and access patterns. | Medium | Medium | Medium | 8 | — | Audit all code for AWS SDK usage. Replace with Azure Key Vault SDK. Update connection string references and access patterns. | Use environment variables as temporary bridge during migration. | Dev Lead | Open | 2026-02-21 |
| RISK-004 | Deployment | Unicorn has documented issues on Azure App Service — path length bugs, physicalRootPath issues, transparent sync problems. In maintenance mode since 2020. | High | High | High | 12 | — | Deploy on Azure VMs (not App Service) to avoid path issues. Validate Unicorn sync on target VMs early. Consider SCS migration for long-term Azure strategy. | If Unicorn fails on Azure VMs, use database backup/restore for initial content population. | Dev Lead | Open | 2026-02-21 |
| RISK-005 | Database | Database HA configuration unknown. If Always On AG or mirroring exists, migration approach changes — SQL MI Business Critical tier required instead of General Purpose. | Medium | High | High | 16 | ASMP-001 | Verify HA configuration with client DBA before estimating. Plan for SQL MI Business Critical if HA required. | Default to General Purpose tier, upgrade to Business Critical post-migration if needed. | Migration Lead | Open | 2026-02-21 |
| RISK-006 | Search | 30+ custom Solr indexes require individual schema review, config migration, and rebuild validation. 1.6x effort multiplier on search migration. | Medium | Medium | Medium | 12 | — | Inventory all indexes and custom schema configs. Deploy Solr on Azure VM. Plan parallel index rebuild. Validate search results post-rebuild. | If index rebuild fails, restore Solr data directory from backup. | Dev Lead | Open | 2026-02-21 |
| RISK-007 | CDN | 20 CloudFront distributions need mapping to Azure Front Door Premium. WAF rules need rewriting. Custom error pages need porting. | Medium | Medium | Medium | 16 | ASMP-006 | Consolidate into Front Door Premium (~$330/mo). Map each distribution's origin, rules, and behaviors. Rewrite WAF rules for Azure WAF. | Migrate distributions in batches, keeping CloudFront active as fallback. | Infra Lead | Open | 2026-02-21 |
| RISK-008 | CI/CD | ~30 TeamCity build configs need migration to Azure Pipelines. Includes Unicorn builds, npm builds, Snyk scans, and deployment automation. | Medium | Medium | Medium | 24 | — | Source already on Azure DevOps Repos — simplifies migration. Plan phased migration by repo group. Template common pipeline patterns. | Keep TeamCity operational in parallel during pipeline migration. | DevOps Lead | Open | 2026-02-21 |
| RISK-009 | Compliance | Compliance requirements unknown. If PCI/HIPAA/GDPR applies, could trigger 1.2-1.5x multiplier across all components. | Low | Medium | Medium | 0 | ASMP-002 | Verify compliance requirements with client legal/security team before finalizing estimate. | If compliance discovered late, add compliance remediation phase post-migration. | Project Manager | Open | 2026-02-21 |

---

## Risk Categories

- **Infrastructure**: Risks related to Azure resource provisioning, networking, compute
- **Data**: Risks related to database migration, data integrity, data loss
- **Application**: Risks related to Sitecore configuration, custom code, integrations
- **Performance**: Risks related to performance degradation after migration
- **Security**: Risks related to access control, certificates, compliance
- **Operational**: Risks related to team readiness, process, coordination
- **Timeline**: Risks related to schedule delays, dependency bottlenecks
- **Email/SMTP**: Risks related to transactional email delivery and SMTP relay configuration

---

## Risk Trend

| Review Date | Critical | High | Medium | Low | New | Closed | Notes |
|------------|----------|------|--------|-----|-----|--------|-------|
| 2026-02-21 | 0 | 3 | 5 | 1 | 9 | 0 | Initial risk assessment. 25 assumptions unvalidated; confidence score 52%. Discovery completeness at 91%. |

---

## Risk Interdependencies

Risks that amplify or trigger each other when they co-occur.

| Risk A | Risk B | Relationship | Combined Effect |
|--------|--------|-------------|----------------|
| RISK-001 (250GB DB migration) | RISK-002 (Media blobs in SQL) | Amplifies | Media stored in SQL inflates the total database size, directly increasing transfer time and migration window. If media accounts for ~50GB of the 250GB total, migration duration increases proportionally. Combined effect adds 8-12 hours beyond individual estimates. |
| RISK-001 (250GB DB migration) | RISK-005 (HA config unknown) | Triggers | If Always On Availability Groups or mirroring are discovered, the migration approach must shift from standard DMS to a more complex HA-aware strategy. This changes the target from Azure SQL MI General Purpose to Business Critical tier, adding infrastructure complexity and potentially doubling the cutover coordination effort. Combined effect adds 12-16 hours. |
| RISK-003 (Secrets Manager to Key Vault) | RISK-004 (Unicorn Azure compatibility) | Shares root cause | Both risks stem from code-level incompatibilities between AWS and Azure platforms. The same codebase that references AWS Secrets Manager SDK calls may also contain Unicorn serialization paths that fail on Azure. Development teams must audit and remediate both in a coordinated code refactoring effort. Combined effect adds 6-8 hours of additional integration testing. |
| RISK-006 (30+ custom Solr indexes) | RISK-007 (20 CloudFront distributions) | Amplifies | In a multi-site architecture, search indexes and CDN distributions are often site-specific. Complexity compounds when each site requires both search validation and CDN rule migration. If index rebuild issues arise alongside CDN routing changes, end-to-end site testing becomes significantly more complex. Combined effect adds 8-12 hours of cross-cutting validation effort. |

### How to Read This Table
- **Amplifies**: If Risk A materializes, it increases the likelihood or impact of Risk B
- **Triggers**: If Risk A materializes, Risk B becomes nearly certain
- **Shares root cause**: Both risks stem from the same underlying gap or assumption
- **Combined Effect**: The additional hours or severity increase when both risks co-occur (beyond their individual impacts)

---

## Residual Risk Assessment

After applying mitigations, track the remaining risk level.

| ID | Original Severity | Mitigation Applied | Residual Likelihood | Residual Impact | Residual Severity | Residual Hours | Accepted By |
|----|-------------------|--------------------|--------------------|-----------------|--------------------|----------------|-------------|
| RISK-001 | High | Azure DMS continuous sync with pre-copy during business hours | Medium | Medium | Medium | 8 | Migration Lead |
| RISK-002 | Medium | Plan for larger migration window; evaluate Blob Storage externalization | Low | Medium | Low | 6 | Migration Lead |
| RISK-003 | Medium | Full AWS SDK audit and Key Vault SDK replacement | Low | Low | Low | 3 | Dev Lead |
| RISK-004 | High | Deploy on Azure VMs; early Unicorn sync validation | Medium | Medium | Medium | 6 | Dev Lead |
| RISK-005 | High | Verify HA config with client DBA before finalizing plan | Low | High | Medium | 8 | Migration Lead |
| RISK-006 | Medium | Solr index inventory, parallel rebuild, and post-rebuild validation | Low | Medium | Low | 4 | Dev Lead |
| RISK-007 | Medium | Front Door Premium consolidation with batched migration | Low | Medium | Low | 6 | Infra Lead |
| RISK-008 | Medium | Phased pipeline migration with common templates | Medium | Low | Low | 8 | DevOps Lead |
| RISK-009 | Medium | Early compliance verification with client legal/security | Low | Low | Low | 0 | Project Manager |

### Residual Risk Summary
- **Total residual hours**: 49 hours
- **Residual risks accepted**: 6
- **Residual risks requiring monitoring**: 3

### Risk Acceptance Criteria
- Residual risks with **Low** severity are accepted by the Migration Lead
- Residual risks with **Medium** severity require Client Stakeholder acceptance
- Residual risks with **High/Critical** severity must have documented contingency plans and executive sign-off

---

## Key Risk Details

### RISK-001: Large Database Migration Window

**Severity**: High | **Category**: Database | **Hours Impact**: 16 | **Linked Assumptions**: ASMP-003

The MCK Sitecore 10.4 XP Scaled environment operates on a SQL Server database estimated at 250GB. This exceeds the 200GB threshold where standard backup/restore migration approaches become impractical within a typical 4-6 hour maintenance window. At 250GB, a full database migration involving network transfer from AWS to Azure, followed by index rebuilds and integrity checks, is expected to require 6-12 hours under favorable conditions. The database includes Sitecore Core, Master, Web, and xDB Collection databases, each of which must be migrated and validated independently.

The recommended mitigation uses Azure Database Migration Service (DMS) in continuous sync mode. This approach allows the bulk of the data to be copied during normal business hours with minimal impact, maintaining a continuous replication stream. At cutover time, only the delta changes need to be applied, reducing the actual downtime window to minutes rather than hours. However, DMS introduces its own complexity: it requires network connectivity between source and target, correct firewall rules, and careful monitoring of replication lag. If DMS fails or replication lag becomes unacceptable, the contingency plan calls for a traditional backup/restore with an extended downtime window of 12-16 hours, which must be communicated to and approved by the client well in advance.

This risk is directly linked to assumption ASMP-003, which records the 250GB database size as an estimate from the client. The actual size could be larger if media blobs (see RISK-002) or xDB interaction data are larger than anticipated.

---

### RISK-002: Media Blobs Stored in SQL Database

**Severity**: Medium | **Category**: Storage | **Hours Impact**: 16 | **Linked Assumptions**: ASMP-004

The MCK Sitecore instance stores media library assets as binary blobs within the SQL Server database rather than on the filesystem or an external blob store. The estimated media volume is approximately 50GB, which represents a significant portion of the total 250GB database size. This architectural pattern, while common in older Sitecore deployments, creates several compounding concerns for the Azure migration.

First, it directly inflates the database migration duration (amplifying RISK-001). Second, it increases ongoing Azure SQL storage costs, as blob storage within a relational database is significantly more expensive per gigabyte than Azure Blob Storage. Third, it creates performance concerns: Azure SQL elastic pools handle large binary data less efficiently than purpose-built object storage, and the I/O patterns for media serving differ from transactional database workloads.

The ideal mitigation is to externalize media to Azure Blob Storage as part of the migration, using Sitecore's built-in Azure Blob Storage provider or a community module such as the Sitecore Azure Blob Storage provider. However, this adds scope and testing effort to the migration. The pragmatic contingency is to keep media in SQL for the initial migration and plan a post-migration media externalization phase. This defers the effort but accepts the ongoing cost and performance implications until remediated.

---

### RISK-003: AWS Secrets Manager to Azure Key Vault Migration

**Severity**: Medium | **Category**: Integration | **Hours Impact**: 8

The MCK Sitecore application currently retrieves sensitive configuration values — database connection strings, API keys, and service credentials — from AWS Secrets Manager. Migrating to Azure requires replacing this integration with Azure Key Vault, which has a fundamentally different API surface, SDK, authentication model, and naming convention.

AWS Secrets Manager uses IAM role-based access with the AWS SDK, while Azure Key Vault uses Managed Identity or service principal authentication with the Azure SDK. Secret names in AWS follow a path-based convention (e.g., `/prod/sitecore/db-connection`), while Key Vault uses flat names with hyphens. Any custom code, configuration transforms, or helper libraries that reference the AWS Secrets Manager SDK must be identified, refactored, and tested.

The mitigation requires a thorough audit of all code repositories (~30 repos) for AWS SDK usage patterns, particularly `AmazonSecretsManagerClient` calls and `AWSSDK.SecretsManager` NuGet references. Each reference must be replaced with the equivalent `Azure.Security.KeyVault.Secrets` SDK call, and authentication must be configured using Azure Managed Identity. The contingency allows for a temporary bridge using environment variables during migration, which simplifies the cutover but introduces a security concern that must be remediated promptly after go-live.

---

### RISK-004: Unicorn Content Serialization Azure Compatibility

**Severity**: High | **Category**: Deployment | **Hours Impact**: 12

Unicorn, the content serialization and deployment framework used by MCK, has well-documented compatibility issues with Azure App Service. These include path length limitations that cause serialization failures with deeply nested Sitecore items, `physicalRootPath` resolution bugs that prevent Unicorn from locating its serialized item files, and transparent sync problems that fail silently in Azure's sandboxed file system. Critically, Unicorn has been in maintenance mode since 2020, meaning no active development is addressing these platform-specific issues.

This risk is rated high because Unicorn is integral to the MCK deployment pipeline — the ~30 TeamCity build configurations include Unicorn sync steps that push serialized content items to target environments. If Unicorn fails on Azure, it blocks not only content deployment but the entire CI/CD workflow.

The primary mitigation is to deploy Sitecore on Azure Virtual Machines rather than Azure App Service. VMs provide a traditional Windows file system without the sandboxing restrictions that cause Unicorn failures, and they allow full control over path lengths and root path configuration. The team should validate Unicorn sync operations on the target Azure VMs as an early proof-of-concept, ideally in the first sprint of migration work. If validation reveals issues even on VMs, the contingency falls back to database backup/restore for initial content population, bypassing Unicorn entirely for the migration event. Long-term, the client should consider migrating to Sitecore Content Serialization (SCS), the vendor-supported replacement for Unicorn introduced in Sitecore 10.0.

---

### RISK-005: Unknown Database High Availability Configuration

**Severity**: High | **Category**: Database | **Hours Impact**: 16 | **Linked Assumptions**: ASMP-001

The current high availability configuration of the MCK SQL Server databases is unknown. This is one of the most significant information gaps in the assessment, as the presence of Always On Availability Groups, database mirroring, or log shipping fundamentally changes both the migration approach and the target Azure architecture.

If the source SQL Server uses Always On Availability Groups — which is common for production Sitecore XP Scaled deployments handling 1 million monthly page views — the target Azure SQL Managed Instance must use the Business Critical tier rather than General Purpose. Business Critical tier provides built-in HA with synchronous replicas, but costs approximately 2-3x more than General Purpose. Additionally, the migration approach must account for AG-specific considerations: DMS handles AG source databases differently, and the cutover sequence must include AG failover steps.

If no HA configuration exists, the migration is simpler and the General Purpose tier is appropriate, but this raises a separate concern about the production environment's resilience posture on AWS. Either answer has significant implications.

The mitigation is straightforward: verify the HA configuration with the client's DBA team before finalizing the migration plan. This should be treated as a priority-one validation item. The contingency defaults to General Purpose tier, with a planned upgrade path to Business Critical post-migration if HA is subsequently confirmed as a requirement.

---

### RISK-006: High Volume of Custom Solr Indexes

**Severity**: Medium | **Category**: Search | **Hours Impact**: 12

The MCK Sitecore environment contains 30 or more custom Solr indexes beyond the standard Sitecore indexes. This significantly exceeds the typical 3-5 custom indexes seen in most Sitecore deployments and triggers a 1.6x effort multiplier on search migration activities.

Each custom index potentially has its own schema configuration, field definitions, computed fields, custom analyzers, and index update strategies. During migration to an Azure-hosted Solr instance, every index configuration must be reviewed for compatibility, the schema files must be transferred, and index rebuilds must be executed and validated. With 30+ indexes, a full rebuild cycle can take several hours and must be carefully sequenced to avoid overwhelming the Solr instance or the Sitecore indexing infrastructure.

The mitigation begins with a complete inventory of all custom indexes, documenting their schema configurations, approximate sizes, and rebuild dependencies. Solr should be deployed on an appropriately sized Azure VM with sufficient disk I/O for parallel index rebuilds. The rebuild process should be parallelized where possible, and search result accuracy should be validated against the source environment for each index. The contingency allows for restoring the Solr data directory directly from a backup of the source Solr instance, which preserves index data without requiring a rebuild but may mask configuration issues.

---

### RISK-007: CloudFront to Azure Front Door Distribution Migration

**Severity**: Medium | **Category**: CDN | **Hours Impact**: 16 | **Linked Assumptions**: ASMP-006

The MCK infrastructure includes an estimated 20 Amazon CloudFront distributions, reflecting the multi-site architecture that serves multiple global brands and regional sites. Each distribution has its own origin configuration, caching behaviors, custom error pages, and potentially WAF rule associations. Migrating these to Azure Front Door Premium requires mapping each distribution's configuration to the Azure equivalent.

Azure Front Door Premium is the recommended target because it combines CDN, WAF, and global load balancing into a single service, at approximately $330 per month base cost. However, the mapping is not one-to-one: CloudFront behaviors translate to Front Door routing rules, CloudFront custom error pages translate to Front Door custom error responses, and CloudFront WAF rules must be completely rewritten for Azure WAF's rule syntax and capabilities.

The 20-distribution count also means 20 sets of SSL/TLS certificates to provision or migrate, 20 origin configurations to validate, and 20 sets of caching rules to verify. The mitigation recommends consolidating distributions where possible — multi-site architectures on Azure Front Door can often use a single Front Door instance with multiple routing rules rather than separate instances per site. The migration should proceed in batches, keeping CloudFront active as a fallback for distributions not yet migrated, enabling a gradual cutover with rollback capability.

---

### RISK-008: TeamCity to Azure Pipelines Migration

**Severity**: Medium | **Category**: CI/CD | **Hours Impact**: 24

The MCK build and deployment infrastructure consists of approximately 30 TeamCity build configurations spanning multiple repositories. These configurations handle Sitecore solution builds, Unicorn content serialization packaging, npm-based front-end builds, Snyk security scans, NuGet package restoration, and automated deployment to AWS infrastructure.

Each TeamCity build configuration must be analyzed and recreated as an Azure Pipeline YAML definition. While the source code is already hosted on Azure DevOps Repos — which significantly reduces migration friction — the build configurations themselves contain substantial logic: build steps, artifact handling, deployment triggers, environment variables, and inter-build dependencies.

The mitigation leverages the existing Azure DevOps Repos presence to simplify the migration. Pipeline migration should proceed in phases, grouped by repository or functional area. Common patterns across the 30 configurations should be extracted into YAML templates to reduce duplication and simplify future maintenance. The contingency keeps TeamCity operational in parallel during the pipeline migration, allowing teams to continue deploying through the existing system while new pipelines are validated. This parallel operation period should be time-boxed to avoid indefinite dual maintenance.

---

### RISK-009: Unknown Compliance Requirements

**Severity**: Medium | **Category**: Compliance | **Hours Impact**: 0 | **Linked Assumptions**: ASMP-002

Compliance requirements for the MCK Sitecore environment have not been established during discovery. If the environment processes, stores, or transmits data subject to PCI DSS, HIPAA, GDPR, or SOC 2 requirements, the migration scope could expand significantly. Compliance-driven requirements typically add a 1.2-1.5x multiplier across all infrastructure components due to additional controls, encryption requirements, network segmentation, audit logging, and documentation obligations.

The hours impact is currently recorded as zero because this risk represents a potential scope multiplier rather than a discrete work item. If compliance requirements are confirmed, the impact would cascade across networking (VNet segmentation and NSG rules), compute (hardened VM configurations), database (encryption at rest and in transit, audit logging), and backup/DR (retention policies, geographic redundancy).

The mitigation is to verify compliance requirements with the client's legal and security teams as early as possible in the engagement. This should be treated as a priority-two validation item, immediately after HA configuration verification. The contingency accepts that if compliance requirements are discovered late in the migration, a separate compliance remediation phase can be added post-migration, though this is suboptimal as it may require rearchitecting components that were already migrated.

---

*Generated by Migration Planner Plugin v2.0*
*Assessment ID: cb15ed5c-9d1e-4103-ae5a-34b7aab5fb9b*
