# MCK - AWS to Azure — Sitecore XP Migration Plan

## AWS to Azure Infrastructure Migration

| Field | Value |
|-------|-------|
| **Client** | MCK |
| **Prepared By** | Dakota Smith |
| **Date** | February 21, 2026 |
| **Version** | 1.0 |
| **Status** | Draft |
| **Sitecore Version** | 10.4 |
| **Target Timeline** | Q2 2026 |

---

## 1. Executive Summary

This document presents the migration plan for MCK's Sitecore XP 10.4 platform from Amazon Web Services (AWS) to Microsoft Azure. The migration is an infrastructure replatforming — the Sitecore application version remains at 10.4, and no application code changes are in scope beyond integration endpoint updates (e.g., AWS Secrets Manager to Azure Key Vault).

The current environment is an XP Scaled topology hosted on EC2 instances with self-managed SQL Server, Solr, and Redis, serving a global multi-site deployment with approximately 20 CDN distributions, 30+ repositories, and 3 environments (Dev, QA, Production). The target state provisions equivalent Azure IaaS resources — Azure VMs for Sitecore roles, Azure SQL Managed Instance for databases, Solr on Azure VM, Azure Managed Redis for session state, and Azure Front Door for CDN/WAF — maintaining feature parity while leveraging Azure-native services for monitoring, backup, and CI/CD.

The recommended estimate is **496 hours** (AI-assisted, expected), with a range of **369–823 hours** depending on assumption validation outcomes and AI tool adoption. Estimate confidence stands at **52%** due to 25 unvalidated assumptions, 13 of which are unknown values. Validating the top 3 assumptions (database HA configuration, compliance requirements, and actual database size) would reduce the pessimistic range by approximately 40 hours and raise confidence to ~65%. The plan identifies 9 risks (3 high severity), 3 active complexity multipliers, and recommends 17 AI/automation tools projected to save ~90 hours of manual effort.

### Migration Scope
- **Source**: Sitecore XP 10.4 on AWS (XP Scaled)
- **Target**: Sitecore XP 10.4 on Azure (XP Scaled — IaaS)
- **Migration Type**: Infrastructure replatforming (no version upgrade)

### Key Metrics
| Metric | Value |
|--------|-------|
| Recommended Estimate | 496 hours (AI-assisted) |
| Estimate Range | 369–823 hours |
| Estimate Confidence | 52% |
| Estimated Duration | 8–12 weeks |
| Number of Environments | 3 (Dev, QA, Prod) |
| Risk Items | 9 (3 high) |
| Unvalidated Assumptions | 25 |

---

## 2. Current State Architecture

### 2.1 Topology Overview

MCK operates a Sitecore XP 10.4 Scaled topology on AWS, the most common enterprise Sitecore deployment pattern. The XP Scaled topology separates Content Management (CM), Content Delivery (CD), and xConnect roles onto dedicated infrastructure, enabling independent scaling of front-end delivery capacity. The platform supports a global multi-site instance with an estimated 10+ websites served through approximately 20 CloudFront CDN distributions, backed by 30+ source code repositories managed in Azure DevOps.

### 2.2 Infrastructure Components

#### Compute
- **Content Management (CM)**: 1 EC2 instance per environment running Windows Server 2019 with IIS
- **Content Delivery (CD)**: 1+ EC2 instances per environment with Auto Scaling Group enabled for production
- **xConnect**: 1 EC2 instance per environment handling collection, processing, and search indexing
- **Identity Server**: Co-located on CM instance
- **Instance types**: Unknown (ASMP-007, ASMP-008) — requires validation for accurate Azure VM sizing

#### Database
- **Engine**: SQL Server 2019 on EC2 (self-managed)
- **Total size**: ~250 GB (assumed, ASMP-003)
- **Databases**: Core, Master, Web, xDB Collection (sharded), Reporting, Experience Forms, Marketing Automation, Processing Pools/Tasks, Reference Data
- **Encryption**: At-rest encryption enabled
- **HA**: Unknown (ASMP-001) — critical gap for migration approach
- **xDB**: On same SQL Server instance (not separated)

#### Search
- **Provider**: Solr 8.8 standalone on EC2 (self-managed)
- **Configuration**: 1 node per environment, SSL enabled
- **Custom indexes**: 30+ confirmed — triggers 1.6x complexity multiplier
- **Index size**: Unknown (ASMP-009)
- **Note**: Solr 8.x is EOL since June 2024. Sitecore 10.4 supports Solr 8.11.2; consider 10.4.1 upgrade path for Solr 9.8.1 support.

#### Caching
- **Provider**: Redis on EC2 (self-managed), single node
- **Purpose**: Session state (private and shared), potential output caching
- **Memory**: ~2 GB (assumed, ASMP-023)
- **Cluster mode**: Disabled

#### CDN & Load Balancing
- **CDN**: Amazon CloudFront with ~20 distributions (assumed, ASMP-006)
- **WAF**: Enabled (assumed, ASMP-013)
- **Caching strategy**: Full page caching for anonymous users
- **Custom error pages**: Yes
- **Load balancing**: Application Load Balancer (ALB)

#### Storage
- **Media strategy**: SQL Server database blob storage (default)
- **Media size**: ~50 GB (assumed, ASMP-004)
- **Media item count**: ~25,000 (assumed, ASMP-021)
- **Image resizing**: Enabled
- **Shared filesystem**: None

#### Email / SMTP
- **Transactional email**: Yes — Sitecore Forms submissions via SMTP
- **EXM**: Not in use
- **SMTP provider**: Unknown (ASMP-012)
- **Marketing Automation**: Disabled

#### xConnect / xDB
- **Status**: Enabled (XP Scaled topology)
- **Collection DB**: SQL Server (on same EC2 instance)
- **Contact count**: 100,000–500,000 (assumed, ASMP-005)
- **Processing**: Enabled
- **Marketing Automation**: Disabled
- **Custom facets**: None

#### Networking
- **VPC**: 1 VPC (assumed), flat topology
- **Subnets**: 3-tier (public LB, private app, private DB)
- **Availability zones**: 2 (assumed)
- **VPN**: None (assumed, ASMP-019)
- **NAT Gateway**: Yes
- **Bastion**: Jump box for EC2 access
- **Environment isolation**: Same VPC, separate subnets

#### Monitoring
- **APM**: New Relic (metrics, alerts, logs, custom metrics)
- **Health checks**: Configured
- **Log aggregation**: New Relic Logs
- **SLA**: No formal SLA defined

#### CI/CD
- **Build platform**: TeamCity (~30 build configurations)
- **Source control**: Azure DevOps Repos (already on Azure DevOps)
- **Pipeline includes**: Unicorn serialization builds, npm/front-end builds, Snyk security scans
- **Deployment strategy**: Rolling update (one instance at a time)
- **Environments**: Dev → QA → Prod with content down-sync
- **Approval gates**: PR approval + build success required
- **Artifact storage**: Amazon S3 (assumed, ASMP-015)

### 2.3 Integration Points

| Integration | Type | Migration Impact |
|------------|------|-----------------|
| AWS Secrets Manager | Cloud-native | **High** — requires code changes to Azure Key Vault SDK |
| Azure AD | Identity provider | **None** — already Azure-based for editor authentication |
| Sitecore Forms | Built-in module | **Low** — SMTP config update only |
| Unicorn | Serialization | **Medium** — documented Azure issues; VM deployment avoids App Service path bugs |
| OneTrust | SaaS (client-side) | **None** — cloud-agnostic |
| SiteImprove | SaaS (client-side) | **None** — cloud-agnostic |
| Klaviyo | SaaS (client-side) | **None** — cloud-agnostic |
| Cognito Forms | SaaS (client-side) | **None** — cloud-agnostic |

---

## 3. Target State Architecture

### 3.1 Azure Topology

The target state replicates the XP Scaled topology on Azure IaaS, using Azure VMs for all Sitecore roles. This approach was selected over Azure App Service to ensure full Unicorn compatibility and maintain operational familiarity. Key architectural changes include:

- **Database**: Migrates from self-managed SQL Server on EC2 to Azure SQL Managed Instance (General Purpose tier, upgradeable to Business Critical if HA is required)
- **Caching**: Migrates from self-managed Redis on EC2 to Azure Managed Redis (Redis Enterprise-based) — note: Azure Cache for Redis is retiring in 2026; Azure Managed Redis is the mandatory replacement
- **CDN**: Consolidates ~20 CloudFront distributions into Azure Front Door Premium with integrated WAF
- **Search**: Deploys Solr on Azure VM (Azure AI Search unsuitable due to 30+ custom index requirement)
- **CI/CD**: Migrates ~30 TeamCity build configs to Azure DevOps Pipelines (repos already on Azure DevOps)
- **Monitoring**: Replaces New Relic with Azure Monitor + Application Insights
- **Identity**: Azure Key Vault replaces AWS Secrets Manager; Azure AD authentication unchanged
- **DNS**: Cloudflare remains as DNS provider — record updates only

### 3.2 Service Mapping

| AWS Service | Azure Equivalent | Notes |
|-------------|-----------------|-------|
| EC2 (Windows Server 2019) | Azure Virtual Machines (D8s_v5) | Match CPU/RAM per role; VMSS for CD auto-scaling |
| Auto Scaling Groups | VM Scale Sets | Review scaling metrics (ASMP-025) |
| SQL Server on EC2 | Azure SQL Managed Instance | General Purpose tier; Business Critical if HA required |
| Redis on EC2 | Azure Managed Redis | Redis Enterprise-based; replaces retiring Azure Cache for Redis |
| Solr on EC2 | Solr on Azure VM | Single node per env; 30+ custom indexes |
| CloudFront (20 distributions) | Azure Front Door Premium | Consolidated CDN + WAF |
| ALB | Azure Application Gateway v2 | Layer 7 with WAF and SSL offload |
| VPC | Azure Virtual Network (VNet) | 3-tier subnet architecture |
| Security Groups | Network Security Groups (NSGs) | Priority-based stateful rules |
| NAT Gateway | Azure NAT Gateway | Outbound internet for private subnets |
| AWS Secrets Manager | Azure Key Vault | Managed identity access; SDK code changes |
| S3 (artifacts) | Azure Blob Storage | AzCopy for migration |
| TeamCity | Azure DevOps Pipelines | Repos already on Azure DevOps |
| New Relic | Azure Monitor + App Insights | AI-powered anomaly detection |
| Cloudflare DNS | Cloudflare DNS (unchanged) | DNS record updates at cutover only |

### 3.3 Azure Resource Summary

| Resource | SKU/Tier | Count | Purpose |
|----------|----------|-------|---------|
| Azure VM (D8s_v5) | Standard | 3/env (CM, CD, xConnect) | Sitecore application roles |
| Azure VM (D4s_v5) | Standard | 1/env | Solr standalone |
| Azure SQL MI | General Purpose (8 vCore) | 1 | All Sitecore databases (~250 GB) |
| Azure Managed Redis | Balanced B1 | 1 | Session state + caching |
| Azure Front Door | Premium | 1 | CDN + WAF (20 origins) |
| Azure Application Gateway | WAF_v2 | 1/env | Internal load balancing |
| Azure Key Vault | Standard | 1 | Secrets + certificates |
| Azure Blob Storage | Hot (GPv2) | 1 | Media library + artifacts |
| Azure Monitor | — | 1 | Metrics + logs + alerts |
| Application Insights | — | 1/env | APM + distributed tracing |
| Azure Backup | Recovery Services Vault | 1 | VM + SQL backup policies |
| Azure VNet | — | 1/env | Network foundation |

---

## 4. Migration Approach

### 4.1 Strategy

The migration follows a **parallel build + phased cutover** approach:

1. **Parallel build**: Provision the complete Azure environment alongside the existing AWS infrastructure. Both environments run simultaneously during migration, enabling thorough testing without impacting production.

2. **Phased migration**: Data migration occurs in waves — bulk data is transferred first (databases, media), followed by continuous delta sync leading up to cutover. This minimizes the cutover window to final delta sync + validation only.

3. **Big-bang cutover**: Production traffic switches from AWS to Azure in a single maintenance window via DNS update. Gradual traffic shifting was considered but rejected due to session state complexity across dual environments.

This approach was selected because:
- **Low risk**: AWS remains fully operational until DNS cutover, enabling clean rollback
- **Thorough validation**: The parallel Azure environment supports full functional, performance, and UAT testing before any production impact
- **Minimized downtime**: Continuous data sync (via MI Link for databases) reduces the cutover window to minutes for database synchronization
- **Familiar pattern**: Standard approach for Sitecore infrastructure migrations with established runbook procedures

### 4.2 Guiding Principles
- Minimize downtime through parallel environment build
- Validate each component independently before integration
- Maintain rollback capability until DNS cutover is confirmed stable
- No Sitecore version changes during migration to reduce variables

---

## 5. Phase Breakdown

### Phase 1: Infrastructure Foundation
**Duration**: 2–3 weeks
**Effort**: 130 hours (AI-assisted expected)

| Component | Hours | Key Activities |
|-----------|-------|---------------|
| VNet & Networking | 20.8 | Provision VNet, subnets, NSGs, NAT Gateway, peering (3 envs) |
| Compute (CM + CD + xConnect) | 93.6 | Provision VMs, configure IIS, install prerequisites, set up VMSS for CD |
| Managed Identity & Key Vault | 10.0 | Configure managed identities, migrate secrets from AWS Secrets Manager |
| SSL/TLS Certificates | 30.0 | Provision/transfer 10 SSL certificates, configure Key Vault certificate store |

#### Key Deliverables
- Fully provisioned Azure VNet with 3-tier subnet architecture across all environments
- VM images for CM, CD, and xConnect roles with IIS and .NET Framework
- Azure Key Vault populated with all secrets from AWS Secrets Manager
- SSL certificates installed and bound
- Terraform/OpenTofu IaC modules for repeatable provisioning

#### Exit Criteria
- All VMs accessible via bastion/jump box
- NSG rules validated (inter-role connectivity, database access, outbound internet)
- Key Vault accessible via managed identity from all application VMs
- SSL certificates valid and bound in IIS
- Infrastructure passes security scan (Defender for Cloud)

---

### Phase 2: Data Migration
**Duration**: 2–3 weeks
**Effort**: 144 hours (AI-assisted expected)

| Component | Hours | Key Activities |
|-----------|-------|---------------|
| SQL Server Databases | 86.4 | Provision SQL MI, DMA assessment, MI Link setup, bulk sync, delta replication |
| Media / Blob Storage | 12.0 | AzCopy bulk transfer from SQL blob → Azure Blob Storage |
| Solr Standalone | 38.4 | Provision Solr VM, migrate configs for 30+ indexes, rebuild indexes |
| Redis Session & Caching | 12.0 | Provision Azure Managed Redis, configure session state provider, test failover |
| Unicorn Serialization Sync | 12.0 | Validate Unicorn sync on Azure VMs, resolve path issues, test round-trip |

#### Key Deliverables
- Azure SQL MI with all Sitecore databases synchronized via MI Link
- Continuous replication established (database delta sync running)
- Media library migrated to Azure Blob Storage
- Solr indexes rebuilt and validated on Azure VM
- Azure Managed Redis configured with Sitecore session state provider
- Unicorn serialization verified on Azure VMs

#### Exit Criteria
- Database row counts match within 0.1% (continuous sync active)
- All 30+ Solr custom indexes rebuilt and returning results
- Redis session persistence verified across CM and CD roles
- Unicorn sync/serialize round-trip successful
- Media library item count matches source

---

### Phase 3: Application & Services
**Duration**: 2–4 weeks
**Effort**: 73 hours (AI-assisted expected)

| Component | Hours | Key Activities |
|-----------|-------|---------------|
| Identity Server | 8.0 | Deploy Identity Server, configure Azure AD integration |
| xConnect & xDB | 24.0 | Deploy xConnect roles, validate collection and processing pipelines |
| Integrations (Secrets Manager → Key Vault) | 24.0 | Update connection strings, refactor AWS SDK → Azure SDK calls |
| Azure Front Door (20 Distributions) | 12.0 | Configure Front Door Premium origins, rules, WAF policies |
| CI/CD (TeamCity → Azure Pipelines) | 20.8 | Migrate ~30 build configs to YAML pipelines, configure agents |
| Monitoring (New Relic → Azure Monitor) | 15.6 | Configure Azure Monitor, App Insights, alerts, dashboards |

#### Key Deliverables
- Identity Server deployed and authenticating via Azure AD
- xConnect collecting analytics data and processing contacts
- All integration endpoints updated for Azure services
- Azure Front Door serving all sites with WAF enabled
- Azure DevOps Pipelines building and deploying to all environments
- Azure Monitor dashboards replicating New Relic visibility

#### Exit Criteria
- CM login successful via Identity Server + Azure AD
- xConnect health endpoint returns 200, contacts being collected
- All 4 SaaS integrations (OneTrust, SiteImprove, Klaviyo, Cognito) verified
- Azure Front Door routing traffic to all CD instances correctly
- CI/CD pipeline successfully builds and deploys to Dev environment
- Monitoring alerts firing for CPU, memory, and response time thresholds

---

### Phase 4: Validation & Testing
**Duration**: 1–2 weeks
**Effort**: 52 hours (AI-assisted expected)

| Component | Hours | Key Activities |
|-----------|-------|---------------|
| Testing & Validation | 60.0 | Smoke tests, functional tests, performance baseline, load testing, security scan, UAT |
| Backup & DR Configuration | 12.0 | Configure Azure Backup policies, test restore procedures, validate RPO/RTO |

#### Key Deliverables
- Complete test report covering all test categories
- Performance baseline comparison (AWS vs Azure)
- Security scan report (Defender for Cloud)
- Backup and restore procedure validated
- UAT sign-off from client stakeholders

#### Exit Criteria
- All smoke tests pass (CM login, page rendering, publish cycle)
- Functional test suite 100% pass rate
- Response times within 10% of AWS baseline
- Load test sustains expected concurrent user load
- Zero critical or high vulnerabilities in security scan
- Client UAT sign-off obtained
- Backup restore tested successfully (RPO < 1 hour, RTO < 4 hours)

---

### Phase 5: Cutover & Go-Live
**Duration**: 1–3 days + hypercare
**Effort**: 54 hours (AI-assisted expected)

| Component | Hours | Key Activities |
|-----------|-------|---------------|
| Cutover Execution | 24.0 | Final delta sync, application startup, validation, go/no-go decisions |
| DNS Cutover (Cloudflare) | 30.0 | Update DNS records across 5 zones, verify propagation, monitor traffic shift |

#### Key Deliverables
- Production traffic serving from Azure infrastructure
- DNS records pointing to Azure endpoints
- Hypercare monitoring established
- Rollback procedure tested and documented
- Cutover runbook executed with timestamps

#### Exit Criteria
- All production URLs resolving to Azure endpoints
- Error rates below 1% for 30 minutes post-cutover
- No data loss during cutover window
- Monitoring alerts stable (no false positives or missed alerts)
- Client confirmation of successful go-live

---

### Cross-Cutting: Project Management
**Effort**: 43 hours (expected)

Covers sprint planning, stakeholder communication, status reporting, risk management, assumption validation coordination, and cutover scheduling across all phases.

---

## 6. Timeline

```
Week    1    2    3    4    5    6    7    8    9   10   11   12
       ├────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┤
Phase 1 ████████████████                                        Infrastructure
Phase 2      ████████████████                                   Data Migration
Phase 3                ████████████████████                     App & Services
Phase 4                               ████████████              Validation
Phase 5                                         ███             Cutover
PM      ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓    Continuous

Critical Path:
  VNet → Compute → Database → xConnect → Testing → Cutover → DNS

Parallel Tracks:
  ├─ Solr (during Phase 2, after VNet)
  ├─ Redis (during Phase 2, after VNet)
  ├─ Front Door / CDN (during Phase 3, after SSL)
  ├─ CI/CD Pipelines (during Phase 3, after Compute)
  ├─ Monitoring (during Phase 3, after Compute)
  └─ Backup/DR (during Phase 4, independent)
```

**Notes**:
- Phases overlap intentionally — Phase 2 starts in Week 2 once VNet is ready
- CI/CD migration runs in parallel with application deployment
- Total elapsed time: 8–12 weeks depending on assumption validation and client availability
- Cutover scheduled for a weekend maintenance window

---

## 7. Resource Requirements

### 7.1 Team Composition

| Role | Hours (Expected) | Hours (Range) | Responsibilities |
|------|------------------|---------------|------------------|
| Infrastructure Engineer | 215 | 164–358 | Azure provisioning, networking, IaC, monitoring, DNS |
| Sitecore Developer | 130 | 101–212 | Application deployment, config, integrations, Unicorn |
| DBA | 62 | 48–101 | SQL MI migration, MI Link, backup/restore, performance |
| QA Engineer | 27 | 20–38 | Functional testing, load testing, UAT coordination |
| Project Manager | 43 | 34–56 | Planning, coordination, stakeholder management |
| **Total** | **496** | **369–823** | |

### 7.2 Resource Loading by Phase

| Role | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | PM |
|------|---------|---------|---------|---------|---------|-----|
| Infrastructure Engineer | 97 | 40 | 44 | 10 | 39 | — |
| Sitecore Developer | 12 | 29 | 48 | 18 | 6 | — |
| DBA | — | 58 | 4 | 2 | 6 | — |
| QA Engineer | — | — | — | 36 | — | — |
| Project Manager | — | — | — | — | 3 | 40 |

---

## 8. Risk Register

| ID | Risk | Likelihood | Impact | Severity | Hours Impact | Mitigation | Owner |
|----|------|-----------|--------|----------|-------------|------------|-------|
| RISK-001 | 250GB DB exceeds migration window | High | High | **High** | 16 | MI Link continuous sync; delta-only at cutover | DBA |
| RISK-002 | Media blobs in SQL inflate DB size | High | Medium | Medium | 16 | Consider Azure Blob externalization | Dev |
| RISK-003 | AWS Secrets Manager → Key Vault code changes | High | Medium | Medium | 8 | Audit AWS SDK usage; replace with Azure SDK | Dev |
| RISK-004 | Unicorn path issues on Azure | Medium | High | **High** | 12 | Deploy on VMs (not App Service); validate early | Dev |
| RISK-005 | Unknown DB HA config changes approach | Medium | High | **High** | 16 | Verify HA config before estimating MI tier | DBA |
| RISK-006 | 30+ Solr custom indexes increase complexity | High | Medium | Medium | 12 | Inventory indexes; deploy Solr on Azure VM | Dev |
| RISK-007 | 20 CloudFront → Front Door mapping | High | Medium | Medium | 16 | Consolidate to Front Door Premium; batch migrate | Infra |
| RISK-008 | 30 TeamCity configs → Azure Pipelines | High | Medium | Medium | 24 | Template common patterns; phase by repo group | Infra |
| RISK-009 | Unknown compliance requirements | Low | High | Medium | 0 | Verify with client legal/security team | PM |

See the detailed **Risk Register** document (`.migration/deliverables/risk-register.md`) for full risk analysis including interdependencies, residual risk assessment, and mitigation details.

---

## 9. Dependency Map

### 9.1 Critical Path

The critical path determines the minimum timeline for the migration:

```
VNet & Networking
  → Compute (CM + CD + xConnect)
    → SQL Server Databases (MI Link setup)
      → Identity Server
        → xConnect & xDB
          → Testing & Validation
            → Cutover Execution
              → DNS Cutover
```

Any delay on the critical path directly extends the overall timeline. The longest single component on the critical path is SQL Server Databases (86.4 hours) due to the 250GB database size, MI Link setup, and gotcha patterns for large database migration and media blob references.

### 9.2 Dependency Chain

| Component | Depends On (Hard) | Depends On (Soft) |
|-----------|-------------------|-------------------|
| Compute (CM/CD/xConnect) | VNet, SSL/TLS | — |
| SQL Server Databases | VNet | — |
| Solr Standalone | VNet | — |
| Redis Session | VNet | — |
| Identity Server | Managed Identity, Compute, Database | — |
| xConnect & xDB | Compute, Database | — |
| Content Serialization | Database | — |
| Azure Front Door | SSL/TLS | — |
| CI/CD Pipelines | Compute | — |
| Monitoring | Compute | — |
| Testing & Validation | Identity Server, Solr, Database | Redis |
| Cutover Execution | Testing, Backup/DR | — |
| DNS Cutover | Front Door, Cutover Execution | — |

---

## 10. Assumptions

The following assumptions are built into this migration plan:

1. Single production environment with Dev and QA (3 total)
2. Standard Sitecore XP 10.4 configuration with Unicorn serialization
3. Client provides timely access to AWS environment documentation
4. No Sitecore version upgrade included (staying on 10.4)
5. Azure subscription and permissions available at project start
6. Azure VMs (IaaS) for Sitecore roles — not App Service
7. Solr on Azure VM — not Azure AI Search
8. SQL Managed Instance for databases
9. No formal compliance requirements (PCI, HIPAA, GDPR) — to be verified
10. Media library remains in SQL initially (Blob externalization is optional optimization)

---

## 10.5 Assumption Sensitivity Analysis

### Confidence Score

**Current Confidence: 52%** — Confidence is low because all 25 formal assumptions remain unvalidated. Of 119 total discovery data points, 60 are confirmed, 46 are assumed, and 13 are unknown. The most impactful unknowns are database HA configuration, compliance requirements, and exact database/media sizes. Validating just the top 3 assumptions would raise confidence to approximately 65% and narrow the pessimistic range by ~40 hours.

### Assumption Impact Table

| ID | Assumption | Current Value | Confidence | Affected Components | Pessimistic Widening | Validation Method |
|----|-----------|---------------|------------|--------------------|--------------------|-------------------|
| ASMP-001 | Database HA config | unknown | unknown | database_single | +16 hrs | Check SQL Server for Always On AG, mirroring, or log shipping |
| ASMP-002 | Compliance requirements | unknown | unknown | database, networking, compute, backup | +16 hrs | Verify with client legal/security team |
| ASMP-003 | Database total size | 250 GB | assumed | database_single, cutover | +8 hrs | Run sp_spaceused on each database |
| ASMP-004 | Media total size | 50 GB | assumed | blob_storage, database | +8 hrs | Query Sitecore media library blob sizes |
| ASMP-005 | xDB contact count | 100K–500K | assumed | xconnect_xdb, database | +8 hrs | Query xDB collection database |
| ASMP-006 | CDN distribution count | 20 | assumed | cdn_setup, ssl_tls, dns_cutover | +8 hrs | Check AWS CloudFront console |
| ASMP-016 | No CLR assemblies | false | assumed | database_single | +8 hrs | Query sys.assemblies on SQL Server |
| ASMP-019 | No VPN connection | false | assumed | networking_vnet | +8 hrs | Check AWS VPC for VPN/Direct Connect |
| ASMP-007 | CM instance type | unknown | unknown | compute_single_role | +4 hrs | Check AWS EC2 console |
| ASMP-008 | CD instance type | unknown | unknown | compute_single_role | +4 hrs | Check AWS EC2 console |
| ASMP-009 | Solr index size | unknown | unknown | solr_standalone | +4 hrs | Check Solr data directory size |
| ASMP-010 | Peak concurrent sessions | unknown | unknown | redis_session, compute | +4 hrs | Check New Relic/load balancer metrics |
| ASMP-011 | ASG min/max config | unknown | unknown | compute_single_role | +4 hrs | Check AWS ASG configuration |
| ASMP-012 | SMTP provider | unknown | unknown | custom_integration | +4 hrs | Check Sitecore web.config SMTP settings |
| ASMP-013 | WAF enabled | true | assumed | cdn_setup | +4 hrs | Check CloudFront WAF associations |
| ASMP-014 | RTO target | 4 hours | assumed | backup_dr | +4 hrs | Verify with client SLA documents |
| ASMP-017 | No linked servers | false | assumed | database_single | +4 hrs | Query sys.servers on SQL Server |
| ASMP-018 | Session provider is Redis | Redis | assumed | redis_session, compute | +4 hrs | Check Sitecore web.config session config |
| ASMP-020 | DNS zone count | unknown | unknown | dns_cutover | +4 hrs | Check Cloudflare dashboard |
| ASMP-015 | Artifact storage | S3 | assumed | cicd_pipeline | +2 hrs | Check TeamCity artifact config |
| ASMP-021 | Media item count | 25,000 | assumed | blob_storage | +2 hrs | Query Sitecore media library |
| ASMP-022 | xConnect instances | 1 per env | assumed | xconnect_xdb | +2 hrs | Verify in AWS |
| ASMP-023 | Redis memory | 2 GB | assumed | redis_session | +2 hrs | Check Redis INFO memory |
| ASMP-024 | CDN provider | CloudFront | assumed | cdn_setup | +2 hrs | Verify in AWS console |
| ASMP-025 | ASG scaling metric | unknown | unknown | compute_single_role | +2 hrs | Check ASG scaling policies |

**Total pessimistic widening from unvalidated assumptions: 152 hours**

### Scenario Comparison

| Scenario | Optimistic | Expected | Pessimistic |
|----------|-----------|----------|-------------|
| Current (0 validated) | 369 hrs | 496 hrs | 823 hrs |
| All assumptions validated | 369 hrs | 496 hrs | 671 hrs |
| Range reduction | — | — | **-152 hrs** |

### Top Assumptions to Validate

1. **ASMP-001 — Database HA configuration** (+16 hrs widening)
   - **Why it matters**: If Always On AG exists, Azure SQL MI must use Business Critical tier (2x cost), and migration tooling changes significantly
   - **How to validate**: Check SQL Server configuration for Always On AG, mirroring, or log shipping
   - **Effort to validate**: 15 minutes with DBA access

2. **ASMP-002 — Compliance requirements** (+16 hrs widening)
   - **Why it matters**: PCI/HIPAA/GDPR triggers a 1.2x–1.5x multiplier across all components plus documentation overhead
   - **How to validate**: Ask client legal/security team about regulatory requirements
   - **Effort to validate**: Single stakeholder conversation

3. **ASMP-003 — Database total size** (+8 hrs widening)
   - **Why it matters**: Actual size affects migration window, MI Link initial seeding time, and cutover duration
   - **How to validate**: Run `sp_spaceused` on each database and sum totals
   - **Effort to validate**: 5 minutes with database access

---

## 11. Known Constraints & Limitations

### 11.1 Technical Constraints
- Sitecore 10.4 requires Windows Server for IIS hosting — Linux VMs not supported
- Solr on Azure VM required due to 30+ custom indexes exceeding Azure AI Search limits
- Azure Managed Redis is mandatory for new deployments (Azure Cache for Redis retiring April 2026)
- Unicorn serialization has known issues on Azure App Service — VM deployment required
- SQL Managed Instance required for full SQL Server compatibility (Azure SQL Database has feature gaps)

### 11.2 Organizational Constraints
- Source repos already on Azure DevOps, easing CI/CD migration
- Client team availability for UAT and assumption validation may affect timeline
- AWS access required throughout migration for data sync and rollback capability

### 11.3 Timeline Constraints
- Azure Cache for Redis creation blocked for new customers April 1, 2026 — must provision Azure Managed Redis before this date if Azure Cache for Redis was planned
- Cutover requires weekend maintenance window — scheduling dependent on client approval
- Parallel build approach requires Azure subscription costs during overlap period

---

## 12. Testing Strategy

### 12.1 Test Environments
- **Dev (Azure)**: Continuous deployment target for pipeline validation
- **QA (Azure)**: Full regression testing, performance baseline
- **Prod (Azure)**: Cutover target — validated in Pre-Prod state before live traffic

### 12.2 Testing Phases

| Phase | Test Type | Scope | Entry Criteria | Exit Criteria |
|-------|-----------|-------|----------------|---------------|
| Unit Validation | Smoke tests | CM login, CD rendering, publish | All roles deployed and accessible | Core functionality confirmed |
| Functional | Full regression | All features across all sites | Smoke tests passed | 100% pass rate on test suite |
| Integration | API and data flow | OneTrust, SiteImprove, Klaviyo, Cognito, Forms SMTP | Functional tests passed | All integrations responding |
| Performance | Load testing | Concurrent users, response times | Integration tests passed | Within 10% of AWS baseline |
| Security | Vulnerability scan | All Azure resources | Infrastructure provisioned | Zero critical/high findings |
| UAT | Business validation | Key user journeys | Performance tests passed | Client sign-off |

### 12.3 Test Categories
- **Smoke Tests**: Core Sitecore functionality (CM login, page rendering, publish)
- **Functional Tests**: All features validated against existing behavior
- **Integration Tests**: Third-party systems, APIs, and data flows
- **Performance Tests**: Load testing against AWS baseline metrics
- **Security Tests**: Vulnerability scanning, access control, certificate validation
- **UAT**: Business stakeholder validation of key user journeys

### 12.4 Performance Baseline Comparison

| Metric | AWS Baseline | Azure Target | Acceptable Variance |
|--------|-------------|-------------|-------------------|
| Page load time (cold) | TBD (from New Relic) | Match or improve | ≤ +10% |
| Page load time (cached) | TBD (from New Relic) | Match or improve | ≤ +5% |
| CM publish time (full) | TBD | Match or improve | ≤ +15% |
| Search query response | TBD (Solr) | Match or improve | ≤ +10% |
| Concurrent users (peak) | TBD (from New Relic) | Match capacity | Equal or greater |
| Database query response | TBD | Match or improve | ≤ +10% |

---

## 13. Exclusions

The following items are explicitly excluded from this migration scope:

1. Application code changes (except integration updates for Key Vault)
2. Content migration or content restructuring
3. Sitecore version upgrades
4. End-user training
5. Azure subscription and infrastructure costs
6. Third-party license costs (Sitecore, Solr, etc.)
7. Post-migration performance optimization beyond baseline validation
8. Custom SXA theme or rendering modifications
9. Media library externalization to Azure Blob Storage (recommended but not in scope)
10. Solr version upgrade (recommend 9.8.1 with Sitecore 10.4.1 as follow-up)

---

## 13.5 AI Tools & Automation Opportunities

### Effort Comparison

| Approach | Optimistic | Expected | Pessimistic |
|----------|-----------|----------|-------------|
| Manual Only | 469 hrs | 586 hrs | 913 hrs |
| AI-Assisted (Recommended) | 369 hrs | 496 hrs | 823 hrs |
| **Savings** | **100 hrs** | **90 hrs** | **90 hrs** |

### Recommended AI Tools

| Tool | Category | Applicable Phase | Expected Savings | Cost | Status |
|------|----------|-----------------|-----------------|------|--------|
| Terraform/OpenTofu | Infrastructure Automation | All phases | 16 hrs | Free (OSS) | Enabled |
| Azure Migrate | Discovery & Assessment | Phase 1 | 8 hrs | Free | Enabled |
| GitHub Copilot | Code Assistance | Phase 3 | 10 hrs | $19–39/user/mo | Enabled |
| Claude Code | Code Assistance | Phase 1, 3 | 12 hrs | Usage-based | Enabled |
| Playwright AI Test Gen | Testing & Validation | Phase 4 | 8 hrs | Free (OSS) | Enabled |
| Azure DevOps Pipelines | CI/CD & DevOps | Phase 3 | 5 hrs | Free tier | Enabled |
| Azure DMS / MI Link | Data Migration | Phase 2 | 5 hrs | Included | Enabled |
| K6 Performance Testing | Testing & Validation | Phase 4 | 5 hrs | Free (OSS) | Enabled |
| Defender for Cloud | Security & Compliance | Phase 1, 4 | 5 hrs | Pay/use | Enabled |
| AWS App Discovery | Discovery & Assessment | Phase 1 | 5 hrs | Free | Enabled |
| Azure Monitor AI Insights | Monitoring | Phase 3, 4 | 4 hrs | Included | Enabled |
| AzCopy | Storage Migration | Phase 2 | 4 hrs | Free | Enabled |
| DMA | Data Migration | Phase 2 | 3 hrs | Free | Enabled |
| App Insights Smart Detection | Monitoring | Phase 3, 4 | 3 hrs | Included | Enabled |
| Azure Backup Smart Tiering | Backup & DR | Phase 4 | 3 hrs | Pay/use | Enabled |
| Azure Network Watcher | Network & DNS | Phase 1, 4 | 3 hrs | Included | Enabled |
| Azure Advisor | Monitoring | Phase 4 | 3 hrs | Free | Enabled |

**Disabled tools** (with rationale):
- SSMA: SQL Server → SQL Server migration — DMA is more appropriate
- Azure Storage Mover: Media library < 100 GB — AzCopy is simpler
- Azure Bicep: Mutual exclusion — Terraform/OpenTofu selected as IaC tool
- Azure Load Testing: K6 selected as primary load testing tool
- Azure Policy: No confirmed compliance requirements
- GitHub Actions: Mutual exclusion — Azure DevOps Pipelines selected
- Azure Site Recovery: IaaS replatform approach — not using lift-and-shift
- Azure Traffic Manager: Standard DNS cutover planned

### Tool Details

**Terraform / OpenTofu** — Infrastructure as Code for provisioning all Azure resources. Provides repeatable deployments across 3 environments (Dev, QA, Prod), drift detection, and state management. The team's existing IaC familiarity should be verified. Expected 16 hours savings across networking, compute, Redis, CDN, monitoring, and backup provisioning.

**Azure Migrate + AWS App Discovery** — Combined discovery tools for automated VM inventory, dependency mapping, and Azure sizing recommendations. Azure Migrate provides readiness reports while AWS App Discovery captures utilization metrics. Expected 13 hours combined savings in Phase 1 infrastructure planning.

**MI Link (Managed Instance Link)** — Uses Always On availability group technology for near-real-time database replication from AWS SQL Server to Azure SQL MI. The only truly online migration option — continuous replication means cutover downtime is seconds, not hours. Confirmed via research as the recommended approach for 250 GB+ databases after Azure DMS classic retirement (March 2026).

**Playwright AI Test Gen** — AI-assisted test generation using Playwright's Test Agents (new 2025) and codegen capabilities. Generates test scripts from recorded user interactions for cross-browser validation of Sitecore rendering consistency. Expected 8 hours savings in Phase 4 testing, with a pessimistic floor of 3 hours.

---

## 14. Success Criteria

The migration is considered successful when all of the following criteria are met:

1. **Functional parity**: All features available on AWS are working on Azure — CM authoring, CD delivery, search, forms, integrations, and analytics
2. **Performance parity**: Response times within 10% of AWS baseline for page loads, search queries, and publish operations
3. **Zero data loss**: All database records, media items, and xDB contacts accounted for with no corruption
4. **Security compliance**: Defender for Cloud security scan shows no critical or high findings
5. **Monitoring operational**: Azure Monitor alerts configured and validated for all critical metrics
6. **Backup validated**: Azure Backup policies active, restore tested within RPO (< 1 hour) and RTO (< 4 hours)
7. **CI/CD functional**: All ~30 build configurations migrated and successfully deploying to Azure environments
8. **Client acceptance**: UAT sign-off from client stakeholders on key user journeys
9. **Stability**: 72 hours of stable operation post-cutover with error rates below 1%

---

## 15. Rollback Plan

### 15.1 Rollback Triggers
Execute rollback if any of the following occur during cutover:
- Database migration fails or data corruption detected
- Sitecore CM or CD fails to start after 3 attempts
- Critical functionality broken and unfixable within 30 minutes
- Cumulative delay exceeds 2 hours and remaining steps cannot complete before rollback deadline
- Migration Lead declares rollback

### 15.2 Rollback Procedure
1. **Declare rollback** — Migration Lead makes the call and notifies all team members
2. **Revert DNS** — Update Cloudflare DNS records back to AWS endpoints (~10 minutes)
3. **Verify DNS propagation** — Confirm resolution from multiple regions (~15 minutes)
4. **Restart AWS services** — Start Sitecore CM, CD, and xConnect on AWS (~15 minutes)
5. **Verify AWS health** — Run smoke tests against AWS environment (~15 minutes)
6. **Send notification** — Inform all stakeholders of rollback and schedule post-mortem
7. **Total rollback time**: ~60 minutes

### 15.3 Point of No Return
The point of no return is when DNS records are updated and production traffic begins flowing to Azure (Step 26 in the runbook). Before this point, rollback is a clean DNS revert to AWS.

After DNS cutover, rollback is still possible but carries data reconciliation risk:
- User sessions created on Azure must be considered lost
- Any content published to Azure databases during the transition needs manual reconciliation
- DNS propagation delays mean some users may continue hitting Azure for up to TTL duration

**Mitigation**: DNS TTL is lowered to 300 seconds 24–48 hours before cutover, minimizing the propagation window.

---

## 16. Post-Migration

### 16.1 Hypercare Period
- **Duration**: 5 business days (1 week) post-cutover
- **Coverage**: Infrastructure Engineer and Sitecore Developer on-call during business hours
- **Monitoring**: Heightened alert thresholds — 50% of normal thresholds for the first 48 hours
- **Daily check-ins**: 15-minute standup each morning during hypercare to review overnight metrics
- **Escalation**: Any P1 issue escalated to Migration Lead within 15 minutes

### 16.2 Decommissioning
- **Week 1–2**: AWS environment remains fully operational as rollback target
- **Week 3–4**: AWS environment placed in reduced state (stop non-essential instances)
- **Week 5–8**: Final data validation, AWS resource inventory, cost analysis
- **Week 8+**: Decommission AWS resources (after client sign-off)
- **Retain**: AWS CloudWatch logs and database backups for 90 days per retention policy

### 16.3 Knowledge Transfer
- Azure infrastructure documentation (architecture diagrams, resource inventory)
- Runbook for common operational tasks (scaling, restart, backup restore)
- Monitoring dashboard walkthrough
- CI/CD pipeline documentation for Azure DevOps
- Handoff to client operations team or managed services provider

---

## Appendices

### A. Discovery Summary

Discovery covered 16 dimensions across the Sitecore XP 10.4 infrastructure:

| Dimension | Status | Confirmed | Assumed | Unknown |
|-----------|--------|-----------|---------|---------|
| Compute | Partial | 6 | 0 | 4 |
| CI/CD | Complete | 9 | 1 | 0 |
| Database | Partial | 7 | 4 | 2 |
| xConnect | Complete | 5 | 3 | 0 |
| Monitoring | Complete | 5 | 1 | 0 |
| Identity | Complete | 4 | 2 | 0 |
| Search | Complete | 5 | 0 | 1 |
| Session State | Complete | 0 | 5 | 1 |
| Caching | Complete | 3 | 3 | 0 |
| CDN | Complete | 3 | 3 | 0 |
| Storage | Complete | 3 | 3 | 1 |
| Email | Complete | 1 | 1 | 2 |
| DNS | Partial | 1 | 2 | 2 |
| Networking | Complete | 0 | 8 | 0 |
| Backup/DR | Complete | 1 | 7 | 0 |
| Custom Integrations | Complete | 7 | 0 | 0 |
| **Total** | — | **60** | **46** | **13** |

Discovery completeness: 91% (119 of ~130 questions answered)

### B. Detailed Estimate Breakdown

| Phase | Component | Base Hours | Multipliers | Gotcha Hours | Final Hours | With AI |
|-------|-----------|-----------|-------------|-------------|-------------|---------|
| 1 | VNet & Networking | 16 | 1.3x (multi-env) | 0 | 20.8 | 10.4 |
| 1 | Compute (CM+CD+xConnect) | 48 | 1.5x × 1.3x | 0 | 93.6 | 83.3 |
| 1 | Managed Identity & Key Vault | 10 | — | 0 | 10.0 | 8.0 |
| 1 | SSL/TLS Certificates | 40 | — | 0 | 30.0 | 28.0 |
| 2 | SQL Server Databases | 48 | 1.3x (multi-env) | 24 | 86.4 | 75.9 |
| 2 | Media / Blob Storage | 12 | — | 0 | 12.0 | 8.0 |
| 2 | Solr Standalone | 24 | 1.6x (30+ indexes) | 0 | 38.4 | 38.4 |
| 2 | Redis Session & Caching | 8 | — | 4 | 12.0 | 9.3 |
| 2 | Unicorn Serialization Sync | 12 | — | 0 | 12.0 | 12.0 |
| 3 | Identity Server | 8 | — | 0 | 8.0 | 5.5 |
| 3 | xConnect & xDB | 24 | — | 0 | 24.0 | 21.5 |
| 3 | Integrations (Key Vault) | 16 | — | 8 | 24.0 | 18.5 |
| 3 | Azure Front Door | 8 | 1.5x (many sites) | 0 | 12.0 | 9.3 |
| 3 | CI/CD (Azure Pipelines) | 16 | 1.3x (multi-env) | 0 | 20.8 | 10.4 |
| 3 | Monitoring (Azure Monitor) | 12 | 1.3x (multi-env) | 0 | 15.6 | 7.8 |
| 4 | Testing & Validation | 40 | 1.5x (many sites) | 0 | 60.0 | 45.5 |
| 4 | Backup & DR | 12 | — | 0 | 12.0 | 6.3 |
| 5 | Cutover Execution | 16 | — | 8 | 24.0 | 24.0 |
| 5 | DNS Cutover (Cloudflare) | 20 | 1.5x (many sites) | 0 | 30.0 | 30.0 |
| — | Project Management | 40 | — | 0 | 40.0 | 40.0 |

### C. Interactive Dashboard
An interactive HTML dashboard is available at `.migration/deliverables/dashboard.html`. The dashboard allows toggling AI tools, validating assumptions, and comparing scenarios in real time.

### D. Azure Resource Naming Convention

| Resource Type | Convention | Example |
|--------------|-----------|---------|
| Resource Group | `rg-{project}-{env}` | `rg-mck-sitecore-prod` |
| Virtual Network | `vnet-{project}-{env}` | `vnet-mck-sitecore-prod` |
| Subnet | `snet-{tier}-{env}` | `snet-app-prod` |
| VM | `vm-{role}-{env}-{n}` | `vm-cd-prod-01` |
| SQL MI | `sqlmi-{project}-{env}` | `sqlmi-mck-sitecore-prod` |
| Key Vault | `kv-{project}-{env}` | `kv-mck-sc-prod` |
| Storage Account | `st{project}{env}` | `stmckscprod` |
| Front Door | `afd-{project}` | `afd-mck-sitecore` |
| NSG | `nsg-{subnet}-{env}` | `nsg-app-prod` |
| App Insights | `appi-{project}-{env}` | `appi-mck-sitecore-prod` |

---

*Generated by Migration Planner Plugin v2.0*
*Assessment ID: cb15ed5c-9d1e-4103-ae5a-34b7aab5fb9b*
