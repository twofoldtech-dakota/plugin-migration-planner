# MCK - AWS to Azure -- Sitecore XP Migration Plan

## AWS to Azure Infrastructure Migration

| Field | Value |
|-------|-------|
| **Client** | MCK |
| **Prepared By** | Dakota Smith |
| **Date** | February 21, 2026 |
| **Version** | 6.0 |
| **Status** | Planning |
| **Sitecore Version** | 10.4 |
| **Target Timeline** | 10-12 weeks |

---

## 1. Executive Summary

MCK operates a Sitecore XP 10.4 platform on AWS using an XP Scaled topology across three environments (Development, QA, and Production). The current deployment runs on IaaS infrastructure -- EC2 instances behind Application and Network Load Balancers, RDS SQL Server with Multi-AZ failover, ElastiCache Redis for session state, self-managed Solr on EC2 with 30+ custom indexes, and a full AWS service ecosystem including CloudFront (20 distributions), SES for transactional email, Cognito for user authentication, DynamoDB for supplemental data storage, and comprehensive CloudWatch monitoring. Monthly AWS spend is $9,222.

This document presents a plan to migrate the entire MCK Sitecore XP platform from AWS IaaS to Azure PaaS. The migration is an infrastructure replatform -- Sitecore 10.4 remains unchanged. Every AWS service will be replaced with an Azure equivalent, application code referencing AWS SDKs will be refactored, and the CI/CD pipeline will move from TeamCity to Azure DevOps Pipelines (source control is already on Azure DevOps Repos). The recommended AI-assisted estimate is 582 hours (range: 419-1,195 hours), representing a 29% reduction from the 815-hour manual estimate through targeted use of Terraform/OpenTofu for IaC templating, GitHub Copilot and Claude Code for SDK refactoring, and automated testing tools. The engagement carries 14 identified risks and 49 unvalidated assumptions that contribute 138 hours of pessimistic widening, resulting in a confidence score of 57%.

The migration will be executed in five phases over approximately 10-12 weeks: Infrastructure Foundation, Data Migration, Application and Services, Validation and Testing, and Cutover and Go-Live. A parallel-build strategy will be used -- the Azure environment will be fully constructed and validated before any traffic is redirected, preserving rollback capability throughout.

### Migration Scope
- **Source**: Sitecore XP 10.4 on AWS (XP Scaled -- CM, CD, xConnect, Identity Server, Solr, Redis)
- **Target**: Sitecore XP 10.4 on Azure (XP Scaled -- Azure App Service / VMs, SQL MI, Azure Managed Redis, Solr on AKS, Azure Front Door)
- **Migration Type**: Infrastructure replatforming (no version upgrade)

### Key Metrics
| Metric | Value |
|--------|-------|
| Recommended Estimate | 582 hours (AI-assisted) |
| Estimate Range | 419-1,195 hours |
| Estimate Confidence | 57% |
| Estimated Duration | 10-12 weeks |
| Number of Environments | 3 (dev, qa, prod) |
| Risk Items | 14 (1 high, 8 medium, 5 low) |
| Unvalidated Assumptions | 49 |

---

## 2. Current State Architecture

### 2.1 Topology Overview

MCK runs Sitecore XP 10.4 in the XP Scaled topology, the most common enterprise Sitecore configuration. The platform includes dedicated Content Management (CM), Content Delivery (CD), xConnect Collection, xConnect Search Indexer, Processing, Reporting, and Identity Server roles. The environment is hosted entirely on AWS, with infrastructure provisioned across at least two Availability Zones for database high availability.

Three environments are maintained: Development (single-server), QA (mirrors production topology at reduced scale), and Production (full XP Scaled with auto-scaling CD instances). Content is authored in Production CM and down-synced to QA and Development via Unicorn serialization.

### 2.2 Infrastructure Components

#### Compute
- **Hosting Model**: IIS directly on EC2 instances (Windows Server 2019)
- **CM Instances**: 1 per environment (Identity Server co-hosted on CM)
- **CD Instances**: 2 (1 QA + 1 Prod), auto-scaling enabled in Production
- **xConnect Instances**: 1 per environment (estimated)
- **Monthly AWS Cost**: $4,204.50 (EC2 Compute $3,871.29 + EBS Surcharge + Data Transfer $114.73 + NAT Gateway $218.48)
- **EBS Storage**: $492.21/month; EBS Snapshots: $301.21/month
- **EC2 Instance Types**: Unknown (flagged as a validation gap -- affects Azure SKU sizing by +/-15%)

#### Database
- **Engine**: SQL Server 2019 on Amazon RDS
- **Total Size**: 150 GB (confirmed)
- **HA Configuration**: Multi-AZ (active-passive failover)
- **Databases**: Core, Master, Web, Reporting, Experience Forms, Marketing Automation, Processing Pools, Processing Tasks, Reference Data, xDB Collection Shards (0, 1), Shard Map Manager
- **Encryption**: At rest enabled
- **Compliance**: No specific compliance requirements (PCI, HIPAA, SOC2)
- **Monthly AWS Cost**: $821.02 (Compute $577.82 + Multi-AZ GP3 $114.90 + GP3 Storage $121.61 + I/O $6.69)

#### Search
- **Provider**: Apache Solr 8.8 (standalone, self-managed on EC2)
- **Node Count**: 1 per environment
- **Custom Indexes**: 30+ (confirmed -- significant migration complexity)
- **Total Index Size**: Large (exact GB unknown -- flagged for validation)
- **SSL**: Enabled (standard for Sitecore 10.4)

#### Caching
- **Redis**: Amazon ElastiCache, non-cluster mode, estimated 2 GB memory allocation
- **Purpose**: Private session state, shared session state
- **DynamoDB**: In use ($56.09/month) for supplemental session or analytics data
- **Monthly AWS Cost**: $150.50 (ElastiCache $94.41 + DynamoDB $56.09)

#### CDN & Load Balancing
- **CDN**: Amazon CloudFront with 20 distributions, full-page caching for anonymous users, custom error pages
- **WAF**: AWS WAF enabled on CloudFront ($100.86/month)
- **Load Balancers**: ALB ($73.70/month) for Layer 7 routing + NLB ($40.52/month) for Layer 4
- **SSL Termination**: Dual -- CloudFront edge and ALB re-encrypt to origin
- **Certificates**: Single wildcard certificate via AWS Certificate Manager (auto-renewal, DNS validation)
- **Global Accelerator**: Active ($18.70/month)
- **Monthly AWS CDN/LB Cost**: $284.01 (Load Balancing) + $169.79 (CloudFront)

#### Storage
- **Media Strategy**: SQL Server database (default blob storage) -- media library estimated at 50 GB, approximately 25,000 items
- **S3**: In use ($4.19/month), bucket count unknown
- **Image Resizing**: Enabled
- **Media Cache**: Estimated 10 GB
- **Shared Filesystem**: None
- **Monthly AWS Cost**: $797.61 (EBS $492.21 + Snapshots $301.21 + S3 $4.19)

#### Email / SMTP
- **Provider**: Amazon SES with dedicated IP ($29.37/month)
- **Usage**: Sitecore Forms transactional email only (no EXM)
- **Custom Sending Code**: None (standard SMTP relay)
- **SMTP Config Location**: Unknown (flagged for validation)

#### xConnect / xDB
- **xConnect Enabled**: Yes (full XP)
- **Collection DB**: SQL Server on RDS
- **Processing**: Enabled; Marketing Automation: Disabled
- **Instance Count**: 1 per environment (estimated)
- **Contact Count**: 100,000-500,000 (estimated)
- **Custom Facets**: None
- **xConnect Search Indexer**: Enabled (assumed)

#### Networking
- **VPC**: 1 (flat topology), 3-tier subnet architecture (public, app, database)
- **Availability Zones**: 2 (confirmed by Multi-AZ RDS)
- **VPN**: Active site-to-site connection ($149.60/month)
- **NAT Gateway**: Active ($218.48/month -- eliminated in PaaS migration)
- **VPC Endpoints**: Active ($22.50/month)
- **Environment Isolation**: Same VPC, separate subnets
- **Bastion Access**: Bastion host / jump box (assumed)
- **Monthly AWS Networking Cost**: $671.78

#### Monitoring
- **APM**: New Relic (continues unchanged post-migration)
- **Log Aggregation**: New Relic Logs
- **AWS Monitoring**: CloudWatch Alarms, Metrics, Logs, Metric Streams ($568.65/month web layer) + CloudTrail ($94.76/month)
- **Alerting**: Configured with custom metrics and health check endpoints
- **SLA**: No formal uptime SLA defined
- **Monthly AWS Cost**: $1,005.64

#### CI/CD
- **Build Platform**: TeamCity (~30 build configurations for ~30 repositories)
- **Source Control**: Azure DevOps Repos (already on Azure)
- **Serialization**: Unicorn (pipelines include Unicorn builds + npm front-end builds + Snyk security scans)
- **Deployment Strategy**: Rolling update (one instance at a time), automated
- **Artifact Storage**: Amazon S3 (assumed, needs verification)
- **Environment Parity**: Full parity (QA mirrors production topology)
- **Approval Gates**: PR approval + build success

### 2.3 Integration Points

| Integration | Type | Migration Impact |
|-------------|------|------------------|
| OneTrust | SaaS (client-side) | Cloud-agnostic -- no migration impact |
| SiteImprove | SaaS (client-side) | Cloud-agnostic -- no migration impact |
| Klaviyo | SaaS (client-side) | Cloud-agnostic -- no migration impact |
| AWS Cognito | AWS-native auth | Migrate to Azure AD B2C |
| AWS Secrets Manager | AWS-native secrets | Migrate to Azure Key Vault + Managed Identity |
| AWS SES | AWS-native email | Replace with SendGrid or Azure Communication Services |
| AWS KMS | AWS-native encryption | Migrate to Azure Key Vault HSM |
| Unicorn | Sitecore module | No change -- serialization format is cloud-agnostic |
| Sitecore Forms | Sitecore module | SMTP config update required |

---

## 3. Target State Architecture

### 3.1 Azure Topology

The target architecture maintains the XP Scaled topology on Azure PaaS services. CM, CD, xConnect, and Identity Server will run on Azure App Service (Windows) or Azure Virtual Machines depending on final SKU decisions. SQL Server databases will migrate to Azure SQL Managed Instance (Business Critical tier for HA parity with Multi-AZ RDS). Solr will run on Azure Kubernetes Service (AKS) to support the 30+ custom indexes while providing managed orchestration. Session state will use Azure Managed Redis (port 10000, TLS required). CDN and WAF functions will consolidate into Azure Front Door. CI/CD will move to Azure DevOps Pipelines, completing the Azure DevOps ecosystem (repos are already there).

All three environments (dev, qa, prod) will be provisioned using Terraform/OpenTofu IaC templates, ensuring consistency and enabling rapid environment rebuilds.

### 3.2 Service Mapping

| AWS Service | Azure Equivalent | Notes |
|-------------|-----------------|-------|
| EC2 (Windows Server 2019) | Azure App Service (Windows) / Azure VMs | PaaS preferred; VMs if App Service constraints emerge |
| Auto Scaling Groups | App Service Autoscale / VM Scale Sets | Autoscale rules migrate to Azure-native scaling |
| RDS SQL Server (Multi-AZ) | Azure SQL Managed Instance (Business Critical) | Near-100% SQL Server compatibility; Business Critical for HA |
| ElastiCache Redis | Azure Managed Redis (port 10000) | Azure Cache for Redis Premium blocked Oct 2026; use Azure Managed Redis |
| DynamoDB | Azure Managed Redis / Cosmos DB | Depends on data patterns -- Redis for session-like, Cosmos for document |
| EC2 (Solr standalone) | Solr on AKS | Managed orchestration for 30+ custom indexes |
| CloudFront (20 distributions) | Azure Front Door | Global LB + CDN + WAF consolidated |
| ALB | Azure Application Gateway v2 | Layer 7 routing, SSL offloading |
| NLB | Azure Load Balancer (Standard) | Layer 4 load balancing |
| AWS WAF | Azure WAF on Front Door | WAF rules require complete rewrite |
| Route 53 | Azure DNS / Cloudflare (consolidate) | Consolidating to Cloudflare recommended |
| AWS VPN Gateway | Azure VPN Gateway (VpnGw2) | Site-to-site tunnel reconfiguration |
| VPC / Subnets | Azure VNet / Subnets | 3-tier subnet architecture preserved |
| Security Groups | Network Security Groups (NSGs) | Priority-based rules at subnet and NIC level |
| NAT Gateway | N/A (eliminated) | PaaS services have native outbound connectivity |
| AWS Secrets Manager | Azure Key Vault | Managed Identity replaces IAM for access |
| AWS KMS | Azure Key Vault HSM | Key management consolidated |
| AWS Cognito | Azure AD B2C | User pool migration required |
| Amazon SES | SendGrid / Azure Communication Services | SMTP relay update in Sitecore config |
| CloudWatch (Metrics/Logs/Alarms) | Azure Monitor + Log Analytics | KQL replaces CloudWatch Insights |
| CloudTrail | Azure Activity Log | Included free with Azure subscription |
| AWS Security Hub + GuardDuty | Microsoft Defender for Cloud | Consolidated security posture management |
| AWS Config | Azure Policy | Compliance enforcement |
| S3 | Azure Blob Storage | SDK/code changes required |
| EBS | Azure Managed Disks / App Service storage | Eliminated if moving to PaaS |
| ACM (SSL certificates) | App Service Managed Certificates / Key Vault | Auto-renewal supported |
| TeamCity | Azure DevOps Pipelines | Source repos already on Azure DevOps |
| Global Accelerator | Azure Front Door | Consolidated with CDN |
| VPC Endpoints | Azure Private Endpoints | Private connectivity to PaaS services |

### 3.3 Azure Resource Summary

| Resource | SKU/Tier | Count | Purpose |
|----------|----------|-------|---------|
| Azure SQL Managed Instance | Business Critical, Gen5, 8 vCores | 1 per env (3 total) | All Sitecore databases (150 GB prod) |
| Azure App Service Plan | P2v3 (Windows) | 1 per env (3 total) | CM, Identity Server |
| Azure App Service Plan (CD) | P2v3 (Windows), autoscale | 1 per env (3 total) | CD instances with autoscale |
| Azure App Service (xConnect) | P1v3 (Windows) | 1 per env (3 total) | xConnect Collection + Search Indexer |
| Azure Managed Redis | Standard C2 or Enterprise E10 | 1 per env (3 total) | Session state (port 10000, TLS) |
| AKS Cluster (Solr) | Standard_D4s_v5 node pool | 1 per env (3 total) | Solr 8.8 with 30+ custom indexes |
| Azure Front Door | Premium | 1 (global) | CDN + WAF + global load balancing (20 origins) |
| Azure Application Gateway | WAF_v2 | 1 per env (3 total) | Layer 7 routing, SSL offload |
| Azure VPN Gateway | VpnGw2 | 1 | Site-to-site VPN connectivity |
| Azure Virtual Network | Standard | 1 per env (3 total) | 3-tier subnet architecture |
| Azure Key Vault | Standard | 1 per env (3 total) | Secrets, keys, certificates |
| Azure Blob Storage | Hot tier, GRS | 1 per env (3 total) | Media library, artifacts |
| Azure Monitor / Log Analytics | Per-GB pricing | 1 workspace | Monitoring, alerting, diagnostics |
| Azure DevOps Pipelines | Basic | 1 organization | CI/CD for all environments |
| Microsoft Defender for Cloud | Enhanced (Servers + SQL) | 1 subscription | Security posture management |
| SendGrid | Pro 100K | 1 | Transactional email (replacing SES) |
| Azure AD B2C | Standard | 1 tenant | User authentication (replacing Cognito) |

---

## 4. Migration Approach

### 4.1 Strategy

The migration will follow a **parallel-build replatform** strategy. The complete Azure environment will be provisioned, configured, and validated alongside the running AWS environment. Data will be bulk-loaded and then continuously synced via MI Link until cutover. At cutover, AWS services will be stopped, a final delta sync performed, applications started on Azure, and DNS redirected. AWS infrastructure will remain available for rollback during a 2-week hypercare period before decommissioning.

This approach was chosen over a lift-and-shift because the AWS deployment is IaaS (EC2 + RDS) and the target is Azure PaaS (App Service + SQL MI), making in-place migration impossible. The parallel-build approach also eliminates production risk during the build phases.

### 4.2 Guiding Principles
- Minimize downtime through parallel environment build
- Validate each component independently before integration
- Maintain rollback capability until DNS cutover is confirmed stable
- No Sitecore version changes during migration to reduce variables
- Use Infrastructure as Code (Terraform/OpenTofu) for all Azure provisioning
- Tiered testing: full validation for Production, reduced for QA, smoke-only for Development

---

## 5. Phase Breakdown

### Phase 1: Infrastructure Foundation
**Duration**: Weeks 1-3
**Effort**: 209.5 hours (manual) / 130.8 hours (AI-assisted)

| Component | Hours (Manual) | Hours (AI-Assisted) | Multipliers | Notes |
|-----------|---------------|---------------------|-------------|-------|
| VNet & Networking | 113.1 | 65.6 | vpn_connectivity 1.3x, multi_environment 1.3x | 3-tier subnets, VPN Gateway, NSGs per env |
| Compute Provisioning (CM/CD/xConnect) | 62.4 | 31.2 | multi_environment 1.3x | App Service plans, autoscale config per env |
| Managed Identity & Key Vault | 30.0 | 30.0 | -- | Service principals, secret migration |
| SSL/TLS Certificates | 4.0 | 4.0 | -- | Wildcard cert to Key Vault / App Service |

#### Key Deliverables
- Azure VNets provisioned across 3 environments with 3-tier subnet architecture
- VPN Gateway (VpnGw2) configured with site-to-site tunnel to client network
- NSG rules implemented and validated
- App Service Plans provisioned for CM, CD, and xConnect roles per environment
- Azure Key Vault provisioned with all secrets migrated from AWS Secrets Manager
- Managed Identities configured for service-to-service authentication
- SSL wildcard certificate imported to Key Vault
- Terraform/OpenTofu modules created and tested for all infrastructure

#### Exit Criteria
- All Azure networking resources deployed and validated (VNet, subnets, NSGs, VPN)
- VPN tunnel established and traffic flowing between Azure and client network
- App Service Plans responding to health probes
- Key Vault accessible via Managed Identity from all App Services
- SSL/TLS configuration verified with correct certificates
- Infrastructure as Code committed and peer-reviewed

---

### Phase 2: Data Migration
**Duration**: Weeks 3-5
**Effort**: 183.9 hours (manual) / 149.3 hours (AI-assisted)

| Component | Hours (Manual) | Hours (AI-Assisted) | Multipliers | Notes |
|-----------|---------------|---------------------|-------------|-------|
| Database Migration (RDS to SQL MI) | 77.5 | 56.7 | ha_database 1.4x, multi_environment 1.3x | 150 GB, MI Link for online sync |
| Solr Search Migration (30+ indexes) | 38.4 | 38.4 | many_custom_solr_indexes 1.6x | AKS deployment, all custom index configs |
| Blob Storage & Media Migration | 28.0 | 24.2 | -- | 50 GB media library, SQL blob to Azure Blob |
| Redis & DynamoDB Migration | 20.0 | 10.0 | -- | ElastiCache to Azure Managed Redis (port 10000) |
| Unicorn Serialization Sync | 20.0 | 20.0 | -- | Sync Unicorn items to Azure file system |

**IMPORTANT -- Azure DMS Classic Retirement**: Azure Database Migration Service (classic) retires March 15, 2026. This migration will use **MI Link** (Managed Instance Link) for online database migration, which provides continuous data replication from RDS SQL Server to Azure SQL MI with minimal downtime at cutover.

**IMPORTANT -- Azure Managed Redis**: Azure Cache for Redis Premium tier is blocked for new instances effective October 2026. This migration will provision **Azure Managed Redis** (the next-generation service) which uses **port 10000** instead of port 6380. All Sitecore Redis connection strings must reference port 10000 with TLS enabled.

#### Key Deliverables
- Azure SQL Managed Instance (Business Critical) provisioned per environment
- MI Link established for continuous replication from RDS to SQL MI
- Database compatibility assessment completed via DMA (Database Migration Assistant)
- Solr 8.8 deployed on AKS with all 30+ custom index configurations
- Solr indexes rebuilt and validated on Azure
- Media library migrated to Azure Blob Storage (or confirmed in SQL MI)
- Azure Managed Redis provisioned and session state configuration tested
- DynamoDB data analyzed and migrated to appropriate Azure service
- Unicorn serialization files synced to Azure file shares

#### Exit Criteria
- All Sitecore databases synced via MI Link with less than 5-second replication lag
- Row counts validated within 0.1% between RDS and SQL MI
- Collation verified as SQL_Latin1_General_CP1_CI_AS on all SQL MI databases
- Solr index item counts within 5% of source for all 30+ indexes
- Azure Managed Redis responding on port 10000 with TLS
- Media library accessible and rendering correctly from Azure storage

---

### Phase 3: Application & Services
**Duration**: Weeks 5-8
**Effort**: 217.6 hours (manual) / 125.5 hours (AI-assisted)

| Component | Hours (Manual) | Hours (AI-Assisted) | Multipliers | Notes |
|-----------|---------------|---------------------|-------------|-------|
| CDN / Front Door (20 dists, IaC templated) | 58.0 | 42.8 | -- | 20 CloudFront distributions to Front Door origins |
| Monitoring Migration (CloudWatch to Azure Monitor) | 54.8 | 27.4 | multi_environment 1.3x | Alarms, dashboards, Log Analytics per env |
| CI/CD Migration (TeamCity to Azure Pipelines) | 36.8 | 18.4 | multi_environment 1.3x | ~30 build configs, repos already on Azure DevOps |
| Custom Integrations (3 SaaS + AWS SDK refactor) | 28.0 | 14.0 | -- | SDK replacement: Secrets Manager, SES, Cognito |
| xConnect & xDB Migration | 24.0 | 14.9 | -- | xConnect roles, collection DB, search indexer |
| Identity Server & Cognito Migration | 16.0 | 8.0 | -- | Identity Server config, Cognito to Azure AD B2C |

#### Key Deliverables
- Azure Front Door configured with 20 origin groups (one per CloudFront distribution)
- WAF rules rewritten for Azure WAF on Front Door
- Azure Monitor workspace configured with alerts, dashboards, and diagnostic settings
- Application Insights enabled on all Sitecore App Services
- Azure DevOps Pipelines created for all ~30 build configurations
- Pipeline stages: build, Unicorn sync, npm build, Snyk scan, deploy (per environment)
- AWS SDK dependencies replaced with Azure SDK equivalents (Key Vault, Communication Services)
- Sitecore SMTP configuration updated for SendGrid / Azure Communication Services
- xConnect deployed on Azure App Service with correct connection strings
- Identity Server deployed and configured on CM App Service
- Azure AD B2C tenant provisioned (replacing Cognito)

#### Exit Criteria
- Front Door routing traffic correctly to all 20 origin groups
- WAF rules validated with no false positives on Sitecore pages
- All CloudWatch alarms recreated as Azure Monitor alerts
- CI/CD pipelines successfully building and deploying to dev environment
- AWS SDK references removed from application code (verified by code scan)
- Transactional email delivery verified via new SMTP provider
- xConnect collecting analytics data on Azure
- Identity Server authentication working for CM login
- Azure AD B2C user authentication functional

---

### Phase 4: Validation & Testing
**Duration**: Weeks 8-10
**Effort**: 100.0 hours (manual) / 72.2 hours (AI-assisted)

| Component | Hours (Manual) | Hours (AI-Assisted) | Multipliers | Notes |
|-----------|---------------|---------------------|-------------|-------|
| Testing (tiered: 40h prod + 16h QA + 8h dev) | 64.0 | 54.0 | -- | Smoke, functional, integration, performance, security, UAT |
| Backup & DR Configuration | 36.0 | 18.2 | -- | Azure Backup policies, recovery testing per env |

**Testing is tiered by environment**: Production receives full validation (40 hours), QA receives functional and integration testing (16 hours), and Development receives smoke testing only (8 hours).

#### Key Deliverables
- Smoke test suite executed across all 3 environments
- Full functional regression test suite executed on Production Azure environment
- Integration tests validated for all third-party systems (OneTrust, SiteImprove, Klaviyo, SendGrid)
- Performance load test completed and compared against AWS baseline
- Security vulnerability scan completed on Azure environment
- UAT sign-off obtained from client stakeholders
- Azure Backup policies configured (RPO: 1 hour, RTO: 4 hours)
- Backup restore test completed successfully
- Disaster recovery runbook created and tested

#### Exit Criteria
- All smoke tests passing across 3 environments
- Functional regression: zero critical/high defects, fewer than 5 medium defects
- Performance baseline: response times within 10% of AWS baseline
- Load test: Azure environment handling equivalent peak traffic without degradation
- Security scan: no critical or high vulnerabilities
- UAT: client sign-off obtained
- Backup restore test: successful restore within 4-hour RTO target
- All monitoring alerts verified (trigger test alert, confirm notification)

---

### Phase 5: Cutover & Go-Live
**Duration**: Weeks 10-12
**Effort**: 104.0 hours (manual) / 104.0 hours (AI-assisted)

| Component | Hours (Manual) | Hours (AI-Assisted) | Multipliers | Notes |
|-----------|---------------|---------------------|-------------|-------|
| Cutover Execution | 56.0 | 56.0 | -- | Final sync, app startup, validation per env |
| Project Management | 40.0 | 40.0 | -- | Coordination, stakeholder communication, hypercare |
| DNS Migration & Cutover | 8.0 | 8.0 | -- | Cloudflare DNS record updates |

#### Key Deliverables
- Cutover runbook finalized and rehearsed
- DNS TTL lowered to 300 seconds 48 hours prior to cutover
- Final database delta sync completed via MI Link (estimated 30-45 minutes for 150 GB)
- All Sitecore roles started and validated on Azure
- DNS records updated in Cloudflare to point to Azure Front Door endpoints
- DNS propagation verified from multiple geographic locations
- Post-cutover monitoring active for minimum 30 minutes before declaring success
- Hypercare period initiated (2 weeks)

#### Exit Criteria
- All Sitecore roles operational on Azure (CM, CD, xConnect, Identity Server)
- DNS resolving to Azure endpoints globally
- Error rate below 1% for 30 minutes post-cutover
- Client stakeholders notified of successful migration
- Hypercare monitoring schedule published
- AWS environment isolated but preserved for 2-week rollback window

---

## 6. Timeline

```
Week        1    2    3    4    5    6    7    8    9   10   11   12
            |    |    |    |    |    |    |    |    |    |    |    |
Phase 1     [==========]                                          Infrastructure Foundation
 VNet/Net   [======]                                              (113h manual / 66h AI)
 Compute       [====]                                             (62h / 31h)
 KeyVault      [====]                                             (30h / 30h)
 SSL/TLS      [==]                                                (4h / 4h)

Phase 2          [=========]                                      Data Migration
 Database        [=======]                                        (78h / 57h)
 Solr              [=====]                                        (38h / 38h)
 Blob/Media        [====]                                         (28h / 24h)
 Redis/Dynamo      [===]                                          (20h / 10h)
 Unicorn           [===]                                          (20h / 20h)

Phase 3                   [==============]                        Application & Services
 Front Door               [=====]                                 (58h / 43h)
 Monitoring                  [=====]                              (55h / 27h)
 CI/CD                          [====]                            (37h / 18h)
 Integrations                   [===]                             (28h / 14h)
 xConnect                       [===]                             (24h / 15h)
 Identity                       [==]                              (16h / 8h)

Phase 4                                   [=======]               Validation & Testing
 Testing                                  [======]                (64h / 54h)
 Backup/DR                                [====]                  (36h / 18h)

Phase 5                                            [=======]      Cutover & Go-Live
 Dev cutover                                       [==]
 QA cutover                                          [==]
 Prod cutover                                           [===]
 Hypercare                                              [====...] (continues 2 weeks)
```

---

## 7. Resource Requirements

### 7.1 Team Composition

| Role | Hours (AI-Assisted) | Hours (Manual) | Rate | Responsibilities |
|------|---------------------|----------------|------|------------------|
| Infrastructure Engineer | 290 | 428 | $150/hr | Azure provisioning, networking, IaC, monitoring, CDN, DR |
| Sitecore Developer | 170 | 226 | $165/hr | Application deployment, config updates, SDK refactoring, xConnect |
| DBA | 55 | 75 | $150/hr | Database migration, MI Link, validation, cutover sync |
| Project Manager | 40 | 47 | $160/hr | Coordination, communication, go/no-go decisions |
| QA Engineer | 30 | 38 | $145/hr | Test execution, regression, UAT coordination |
| **Total** | **582** | **815** | | |

### 7.2 Resource Loading by Phase

| Role | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 |
|------|---------|---------|---------|---------|---------|
| Infrastructure Engineer | 181.9 | 53.0 | 87.6 | 36.4 | 29.0 |
| Sitecore Developer | 28.6 | 64.5 | 75.0 | 19.2 | 14.0 |
| DBA | -- | 51.7 | 4.0 | 6.0 | 14.0 |
| Project Manager | -- | -- | -- | -- | 47.0 |
| QA Engineer | -- | -- | -- | 38.4 | -- |

---

## 8. Risk Register

| ID | Risk | Likelihood | Impact | Severity | Mitigation | Owner |
|----|------|-----------|--------|----------|------------|-------|
| RISK-001 | Large database migration window (150 GB, Multi-AZ complexity) | Likely | High | High | Use MI Link for continuous sync; pre-migration bulk copy + delta sync at cutover | DBA Lead |
| RISK-002 | Media blob stored in SQL (50 GB) increases DB migration time | Likely | Medium | Medium | Consider Azure Blob Storage provider migration; plan for larger DB window | DBA Lead |
| RISK-003 | RDS collation mismatch with Azure SQL MI | Possible | Medium | Medium | Verify collation matches SQL_Latin1_General_CP1_CI_AS pre-migration | DBA Lead |
| RISK-004 | AWS SDK dependencies in application code | Likely | Medium | Medium | Audit all code for AWS SDK usage; refactor to Azure SDK equivalents | Dev Lead |
| RISK-005 | Redis SSL/port migration (ElastiCache to Azure Managed Redis port 10000) | Possible | Low | Low | Update Redis connection strings to port 10000 with TLS; test session behavior | Dev Lead |
| RISK-006 | VPN Gateway migration coordination | Certain | Medium | Medium | Provision Azure VPN Gateway in parallel; coordinate with client network team | Infra Lead |
| RISK-007 | Dual load balancer mapping (ALB + NLB) | Certain | Medium | Medium | Map ALB to Application Gateway, NLB to Azure LB Standard; consider Front Door consolidation | Infra Lead |
| RISK-008 | AWS Secrets Manager migration to Key Vault | Certain | Medium | Medium | Inventory all secrets; create Key Vault equivalents; update all references to Managed Identity | Infra Lead |
| RISK-009 | Cognito user pool migration to Azure AD B2C | Certain | Low | Low | Export user pool; configure Azure AD B2C tenant with matching attributes | Dev Lead |
| RISK-010 | DynamoDB data migration (session/analytics) | Certain | Medium | Medium | Analyze table schemas and access patterns; choose Redis or Cosmos DB | Dev Lead |
| RISK-011 | Route 53 DNS migration alongside Cloudflare | Certain | Low | Low | Inventory all hosted zones; consolidate to Cloudflare or migrate to Azure DNS | Infra Lead |
| RISK-012 | SES email migration (dedicated IP, SMTP relay) | Certain | Low | Low | Set up SendGrid or Azure Communication Services; plan IP warming if needed | Dev Lead |
| RISK-013 | CloudWatch monitoring migration ($1,006/month complexity) | Certain | Medium | Medium | Inventory all alarms and dashboards; recreate in Azure Monitor; New Relic continues unchanged | Infra Lead |
| RISK-014 | Security tooling migration (WAF, Security Hub, GuardDuty, Config) | Certain | Medium | Medium | Map WAF rules to Azure WAF; enable Defender for Cloud; configure Azure Policy | Infra Lead |

---

## 9. Dependency Map

### 9.1 Critical Path

The critical path runs through the following sequence:

1. **VNet & Networking** (113.1h) -- all other infrastructure depends on network being ready
2. **Database Migration** (77.5h) -- application startup requires databases
3. **Identity Server** (16h) -- CM and xConnect depend on Identity Server
4. **Testing & Validation** (64h) -- cutover requires validated environment
5. **Cutover Execution** (56h) -- DNS cutover is the final step

**Critical path total**: approximately 327 hours (serialized). With parallel work and AI-assisted delivery, the calendar timeline compresses to 10-12 weeks.

### 9.2 Dependency Chain

| From | To | Type |
|------|----|------|
| VNet & Networking | Key Vault, Compute, Database, Solr, Redis, Blob Storage | Hard |
| Managed Identity & Key Vault | Identity Server, xConnect, Compute | Hard |
| SSL/TLS Certificates | Compute, CDN/Front Door | Hard |
| Compute Provisioning | Identity Server, xConnect, Monitoring, CI/CD | Hard |
| Database Migration | Identity Server, xConnect, Unicorn Sync, Testing | Hard |
| Identity Server | Testing | Hard |
| Solr Migration | Testing | Hard |
| Redis Migration | Testing | Soft |
| CDN/Front Door | DNS Cutover | Hard |
| Testing & Validation | Cutover Execution | Hard |
| Backup & DR | Cutover Execution | Hard |
| Cutover Execution | DNS Cutover | Hard |

---

## 10. Assumptions

The following assumptions underpin this migration plan. Each assumption is assigned a formal ID (ASMP-xxx), a confidence level, and a pessimistic widening value representing the additional hours that could materialize if the assumption proves incorrect. Assumptions are sorted by widening hours (highest impact first).

**Assumption Summary**: 49 unvalidated assumptions contributing 138 hours of pessimistic widening. 2 assumptions have been validated during discovery.

| Status | Count |
|--------|-------|
| Confirmed (from discovery) | 119 |
| Assumed (unvalidated) | 43 |
| Unknown (unvalidated) | 10 |
| Validated | 2 |
| **Total Discovery Answers** | **172** |

---

## 10.5 Assumption Sensitivity Analysis

### Confidence Score

**Current Confidence: 57%** -- Moderate confidence. The estimate is directionally sound but carries material uncertainty from 49 unvalidated assumptions, particularly around compute instance sizing (16h widening), DNS/networking details (22h widening), and database features (8h widening). Validating the top 10 assumptions would increase confidence to approximately 72% and reduce the pessimistic range by approximately 40 hours.

### Assumption Impact Table

| ID | Assumption | Current Value | Confidence | Affected Components | Widening (hrs) | Validation Method |
|----|-----------|---------------|------------|---------------------|----------------|-------------------|
| ASMP-compute-cm | EC2 instance type (CM) | Unknown | Unknown | Compute Provisioning | 4 | Check AWS EC2 console |
| ASMP-compute-cd | EC2 instance type (CD) | Unknown | Unknown | Compute Provisioning | 4 | Check AWS EC2 console |
| ASMP-compute-asg-min | ASG min/max configuration | Unknown | Unknown | Compute Provisioning | 4 | Check AWS Auto Scaling console |
| ASMP-compute-asg-metric | ASG scaling metric | Unknown | Unknown | Compute Provisioning | 4 | Check AWS Auto Scaling policies |
| ASMP-session-peak | Peak concurrent sessions | Unknown | Unknown | Redis, Compute | 4 | Check CloudWatch/New Relic |
| ASMP-search-size | Total Solr index size (GB) | Large (unknown) | Unknown | Solr Migration | 4 | Check Solr admin UI |
| ASMP-storage-s3 | S3 bucket count | Unknown | Unknown | Blob Storage | 4 | Check AWS S3 console |
| ASMP-dns-zones | DNS zone count | Unknown | Unknown | DNS Cutover | 4 | Check Route 53 console |
| ASMP-dns-records | Total DNS record count | Unknown | Unknown | DNS Cutover | 4 | Check Route 53 console |
| ASMP-db-compliance | Compliance requirements | None (validated) | Validated | Database, VNet, Blob | 0 | Confirmed by client |
| ASMP-db-size | Database total size | 150 GB (validated) | Validated | Database, Cutover | 0 | Confirmed by client |
| ASMP-email-smtp | SMTP config location | Unknown | Unknown | Custom Integrations | 2 | Search Sitecore config |
| ASMP-db-clr | CLR assemblies in use | false (assumed) | Assumed | Database Migration | 2 | Query sys.assemblies |
| ASMP-db-linked | Linked servers in use | false (assumed) | Assumed | Database Migration | 2 | Query sys.servers |
| ASMP-db-crossdb | Cross-database queries | false (assumed) | Assumed | Database Migration | 2 | Search stored procedures |
| ASMP-db-residency | Data residency requirements | false (assumed) | Assumed | Database, VNet, Blob | 2 | Client confirmation |
| ASMP-cdn-count | CloudFront distribution count | 20 (assumed) | Assumed | CDN/Front Door | 2 | Check AWS CloudFront console |
| ASMP-xconn-count | xConnect instance count | 1 per env | Assumed | xConnect & xDB | 2 | Check EC2 instances |
| ASMP-xconn-contacts | xDB contact count | 100K-500K | Assumed | xConnect, Database | 2 | Query xDB collection DB |
| ASMP-xconn-indexer | xConnect indexer enabled | true | Assumed | xConnect & xDB | 2 | Check xConnect config |
| ASMP-identity-claims | Custom claims in Identity Server | false | Assumed | Identity Server | 2 | Check Identity Server config |
| ASMP-identity-sso | SSO enabled | false | Assumed | Identity Server | 2 | Client confirmation |
| ASMP-monitoring-sla | Formal uptime SLA | None defined | Assumed | Monitoring | 2 | Client confirmation |
| ASMP-session-private | Private session provider | Redis | Assumed | Compute | 2 | Check Sitecore config |
| ASMP-session-shared | Shared session provider | Redis | Assumed | Redis, Compute | 2 | Check Sitecore config |
| ASMP-session-sticky | Sticky sessions | false | Assumed | Redis, Compute | 2 | Check ALB target group |
| ASMP-redis-cluster | Redis cluster mode | false | Assumed | Redis | 2 | Check ElastiCache config |
| ASMP-redis-purpose | Redis purpose | Session state | Assumed | Redis | 2 | Check Sitecore config |
| ASMP-redis-memory | Redis memory allocation | 2 GB | Assumed | Redis | 2 | Check ElastiCache node type |
| ASMP-storage-media-size | Media library size | 50 GB | Assumed | Blob Storage | 2 | Query media library table |
| ASMP-storage-media-count | Media item count | 25,000 | Assumed | Blob Storage | 2 | Query Sitecore media library |
| ASMP-storage-cache | Media cache size | 10 GB | Assumed | Blob Storage | 1 | Check disk usage |
| ASMP-email-code | Custom email sending code | false | Assumed | Custom Integrations | 2 | Search codebase for SES SDK |
| ASMP-net-vpc | VPC count | 1 | Assumed | Networking | 2 | Check AWS VPC console |
| ASMP-net-subnets | Subnet tiers | 3-tier | Assumed | Networking | 2 | Check VPC subnets |
| ASMP-net-bastion | Bastion host access | Jump box | Assumed | Networking | 2 | Check EC2 instances |
| ASMP-net-topology | Network topology pattern | Flat (single VPC) | Assumed | Networking | 2 | Check VPC peering |
| ASMP-net-isolation | Environment isolation | Same VPC, separate subnets | Assumed | Networking | 2 | Check subnet tagging |
| ASMP-backup-strategy | Database backup strategy | RDS automated | Assumed | Backup & DR | 2 | Check RDS backup config |
| ASMP-backup-retention | Backup retention | 7 days | Assumed | Backup & DR | 1 | Check RDS retention setting |
| ASMP-backup-rpo | RPO target | 1 hour | Assumed | Backup & DR | 2 | Client confirmation |
| ASMP-backup-rto | RTO target | 4 hours | Assumed | Backup & DR, Compute, DB | 2 | Client confirmation |
| ASMP-backup-dr-region | Cross-region DR | false | Assumed | Backup & DR | 2 | Check cross-region replicas |
| ASMP-backup-ami | EC2 AMI backups | true | Assumed | Backup & DR | 1 | Check AWS Backup schedules |
| ASMP-backup-dr-docs | DR plan documented | false | Assumed | Backup & DR | 2 | Ask client for DR runbook |
| ASMP-cicd-artifacts | CI/CD artifact storage | Amazon S3 | Assumed | CI/CD, Unicorn | 2 | Check TeamCity config |
| ASMP-dns-routing | DNS routing policy | Simple | Assumed | DNS Cutover | 2 | Check Route 53 policies |
| ASMP-dns-ttl | DNS TTL | 300s | Assumed | DNS Cutover | 1 | Check Route 53 record TTLs |
| ASMP-dns-health | DNS health checks | false | Assumed | DNS Cutover | 2 | Check Route 53 health checks |
| ASMP-session-avg | Average session size | 50 KB | Assumed | Redis | 1 | Monitor ElastiCache keys |
| ASMP-session-timeout | Session timeout | 20 min | Assumed | Redis | 1 | Check web.config |

### Scenario Comparison

| Scenario | Optimistic | Expected | Pessimistic |
|----------|-----------|----------|-------------|
| Current (2 validated) | 419 hrs | 582 hrs | 1,096 hrs |
| All assumptions validated | 419 hrs | 582 hrs | 958 hrs |
| Range reduction | -- | -- | -138 hrs |

### Top Assumptions to Validate

The following assumptions have the highest impact on estimate accuracy. Validating these first will provide the largest confidence improvement:

1. **EC2 Instance Types (CM + CD)** -- 8h combined widening. Determines Azure App Service SKU sizing. Check AWS EC2 console.
2. **ASG Configuration (min/max + scaling metric)** -- 8h combined widening. Affects autoscale configuration. Check AWS Auto Scaling console.
3. **Peak Concurrent Sessions** -- 4h widening. Affects Redis and compute sizing. Check CloudWatch or New Relic.
4. **Total Solr Index Size** -- 4h widening. Affects AKS node sizing and migration window. Check Solr admin UI.
5. **DNS Zone and Record Counts** -- 8h combined widening. Affects DNS cutover complexity. Check Route 53 console.
6. **S3 Bucket Count** -- 4h widening. Affects blob storage migration scope. Check S3 console.
7. **SMTP Config Location** -- 2h widening. Affects email integration effort. Search Sitecore config.
8. **Database Features (CLR, Linked Servers, Cross-DB)** -- 6h combined widening. Could block SQL MI migration. Query system tables.

---

## 11. Known Constraints & Limitations

### 11.1 Technical Constraints
- **Azure DMS Classic retirement (March 15, 2026)**: Database migration must use MI Link instead of Azure DMS Classic. MI Link supports online migration with continuous replication.
- **Azure Data Studio retired (February 28, 2026)**: Database management and queries must use SQL Server Management Studio (SSMS), Azure Portal, or Azure CLI.
- **Azure Cache for Redis Premium blocked (October 2026)**: New Redis instances must use Azure Managed Redis, which requires port 10000 and TLS. All Sitecore Redis connection strings must be updated accordingly.
- **30+ custom Solr indexes**: Increases search migration complexity by 1.6x. Each custom index configuration must be individually validated.
- **Media in SQL database**: The 50 GB media library stored in SQL increases database migration time and Azure SQL MI storage costs. Consider migrating to Azure Blob Storage as a parallel effort.

### 11.2 Organizational Constraints
- **VPN coordination**: Azure VPN Gateway setup requires coordination with the client network team for tunnel reconfiguration. Lead time should be factored into Phase 1 scheduling.
- **Source control already on Azure DevOps**: This is an advantage -- only build/deploy pipelines need migration from TeamCity. No repository migration required.
- **Client network team availability**: VPN tunnel cutover requires coordinated action from the client network team. Schedule during business hours.

### 11.3 Timeline Constraints
- **Azure DMS Classic deadline**: If database migration is planned after March 15, 2026, MI Link is the only supported path. This migration plan already assumes MI Link.
- **Cutover window**: A maintenance window of 4-6 hours is recommended for production cutover (includes 30-45 minute final database sync, application startup, validation, and DNS propagation).
- **Hypercare period**: 2 weeks of enhanced monitoring post-cutover before AWS decommissioning.

---

## 12. Testing Strategy

### 12.1 Test Environments

| Environment | Testing Scope | Hours Allocated |
|-------------|---------------|-----------------|
| Production (Azure) | Full validation: smoke, functional, integration, performance, security, UAT | 40 hours |
| QA (Azure) | Functional and integration testing | 16 hours |
| Development (Azure) | Smoke testing only | 8 hours |

Development and QA environments are migrated and validated first, providing a rehearsal for the production migration.

### 12.2 Testing Phases

| Phase | Test Type | Scope | Entry Criteria | Exit Criteria |
|-------|-----------|-------|----------------|---------------|
| 1 | Smoke Testing | Core Sitecore functionality across all 3 envs | Azure environment deployed, all roles started | CM login, CD rendering, publish cycle, search returns results |
| 2 | Functional Regression | All features validated against existing behavior | Smoke tests passed | Zero critical/high defects, fewer than 5 medium |
| 3 | Integration Testing | Third-party systems, APIs, email delivery | Functional tests passed | All integrations responding, data flowing correctly |
| 4 | Performance Testing | Load testing against AWS baseline metrics | Integration tests passed | Response times within 10% of AWS baseline |
| 5 | Security Testing | Vulnerability scanning, access control, certificates | Performance tests passed | No critical or high vulnerabilities |
| 6 | UAT | Business stakeholder validation of key user journeys | Security tests passed | Client sign-off obtained |

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
| Homepage TTFB | Measure pre-migration | Match or improve | +/- 10% |
| CM Page Load (Experience Editor) | Measure pre-migration | Match or improve | +/- 15% |
| CD Page Load (anonymous, cached) | Measure pre-migration | Match or improve | +/- 10% |
| Publish time (full site) | Measure pre-migration | Match or improve | +/- 20% |
| Search query response time | Measure pre-migration | Match or improve | +/- 15% |
| xConnect contact lookup | Measure pre-migration | Match or improve | +/- 15% |
| Concurrent user capacity | Measure pre-migration | Match or exceed | Must meet or exceed |

---

## 13. Exclusions

The following items are explicitly out of scope for this migration engagement:

- **Sitecore version upgrade**: The migration maintains Sitecore XP 10.4. Upgrading to Sitecore XP 10.5 or migrating to XM Cloud is a separate engagement.
- **Content authoring or content migration**: All content migrates with the database. No content restructuring or content authoring is included.
- **Custom feature development**: No new features will be developed during the migration.
- **Third-party license procurement**: Azure subscription costs, SendGrid licenses, and any other third-party licenses are the client's responsibility.
- **Client network infrastructure changes**: Changes to the client's on-premises network beyond VPN tunnel reconfiguration are excluded.
- **Performance optimization**: The target is performance parity with AWS. Performance improvements beyond parity are a separate engagement.
- **Media library restructuring**: Media items migrate as-is. Reorganizing or deduplicating the media library is excluded.
- **Sitecore module upgrades or additions**: Unicorn and other modules remain at current versions.
- **Training**: End-user training on Azure portal or infrastructure management is excluded.
- **AWS cost optimization**: Reducing AWS costs during the migration period is not in scope.
- **Multi-region deployment**: The Azure deployment is single-region. Expanding to multi-region DR is a separate engagement.

---

## 13.5 AI Tools & Automation Opportunities

### Effort Comparison

| Approach | Optimistic | Expected | Pessimistic |
|----------|-----------|----------|-------------|
| Manual Only | 652 hrs | 815 hrs | 1,195 hrs |
| AI-Assisted (Recommended) | 419 hrs | 582 hrs | 1,096 hrs |
| **Savings** | **233 hrs** | **233 hrs** | **99 hrs** |

### Recommended AI Tools

| Tool | Category | Applicable Phase | Expected Savings | Cost | Status |
|------|----------|-----------------|-----------------|------|--------|
| Terraform / OpenTofu | Infrastructure Automation | Phases 1-4 | 16 hrs | Free (open source) | Recommended |
| Azure Migrate | Discovery & Assessment | Phase 1 | 8 hrs | Free | Recommended |
| Claude Code | Code Assistance | Phases 1, 3 | 12 hrs | Usage-based | Recommended |
| GitHub Copilot | Code Assistance | Phase 3 | 10 hrs | $19-39/user/month | Recommended |
| Playwright AI Test Gen | Testing & Validation | Phase 4 | 8 hrs | Free (open source) | Recommended |
| Azure DMS / MI Link | Data Migration | Phase 2 | 5 hrs | Included with SQL MI | Recommended |
| K6 Performance Testing | Testing & Validation | Phase 4 | 5 hrs | Free (open source) | Recommended |
| Azure DevOps Pipelines | CI/CD & DevOps | Phase 3 | 5 hrs | Free tier available | Recommended |
| Azure Monitor AI Insights | Monitoring | Phases 3-4 | 4 hrs | Included with Azure Monitor | Recommended |
| AzCopy | Storage Migration | Phase 2 | 4 hrs | Free | Recommended |
| DMA (Database Migration Assistant) | Data Migration | Phase 2 | 3 hrs | Free | Recommended |
| Azure Backup Smart Tiering | Backup & DR | Phase 4 | 3 hrs | Pay per use | Recommended |
| Microsoft Defender for Cloud | Security & Compliance | Phases 1, 4 | 5 hrs | Free tier + enhanced plans | Recommended |
| Azure Advisor | Monitoring | Phase 4 | 3 hrs | Free | Recommended |
| Azure Network Watcher | Network & DNS | Phases 1, 4 | 3 hrs | Included | Recommended |

### Tool Details

**Terraform / OpenTofu** -- The single highest-impact automation tool for this engagement. With 3 environments to provision, IaC templates created for the first environment are reused for QA and dev, saving approximately 16 hours of manual configuration. Terraform modules will cover VNet, App Service, SQL MI, AKS (Solr), Redis, Front Door, Key Vault, and monitoring. The 3-environment multiplier makes IaC essential rather than optional.

**Azure Migrate** -- Automated discovery and assessment of the AWS environment to generate Azure sizing recommendations and cost estimates. Particularly valuable for determining the correct App Service SKU given that EC2 instance types are currently unknown.

**Claude Code + GitHub Copilot** -- Combined AI coding assistance for the largest code-change tasks: refactoring AWS SDK references (Secrets Manager, SES, Cognito, DynamoDB) to Azure SDK equivalents, generating Azure DevOps pipeline YAML from TeamCity configurations, and writing Terraform modules. Expected combined savings of 22 hours.

**MI Link** -- Replaces the retired Azure DMS Classic for database migration. Provides continuous replication from RDS SQL Server to Azure SQL MI, enabling minimal-downtime cutover with a final delta sync of approximately 30-45 minutes for the 150 GB database.

---

## 14. Success Criteria

The migration will be considered successful when all of the following criteria are met:

1. **Functional Parity**: All Sitecore features operational on Azure match AWS behavior exactly -- content authoring, publishing, search, forms, xConnect analytics, and all integrations.
2. **Performance Parity**: Azure response times within 10% of AWS baseline for all key metrics (TTFB, page load, search, publish).
3. **Zero Data Loss**: All databases, media, configuration, and content items migrated with verified integrity.
4. **Availability**: Post-cutover uptime of 99.9% during the 2-week hypercare period.
5. **Security**: No critical or high vulnerabilities on Azure environment; all security controls (WAF, Defender, NSGs) operational.
6. **Monitoring**: All CloudWatch alarms recreated in Azure Monitor and firing correctly; Application Insights collecting telemetry.
7. **CI/CD**: Azure DevOps Pipelines successfully building and deploying to all 3 environments with equivalent gates (PR approval, build success, Snyk scan).
8. **Cost Target**: Azure monthly run cost within 20% of the $9,222 AWS baseline (exclusive of migration engagement costs).
9. **Team Readiness**: Client team able to operate the Azure environment independently (infrastructure management, deployments, monitoring).

---

## 15. Rollback Plan

### 15.1 Rollback Triggers
Rollback will be initiated if any of the following occur during production cutover:
- Database sync fails or data corruption is detected after final delta sync
- Sitecore CM or CD fails to start on Azure after 3 restart attempts
- Critical functionality is broken and cannot be resolved within 90 minutes
- Cumulative delay exceeds 3 hours and remaining cutover steps cannot complete before the rollback deadline
- Migration Lead declares rollback based on any other critical issue

### 15.2 Rollback Procedure
1. **Declare Rollback** (Migration Lead, 5 min): Announce rollback decision to all team members and stakeholders
2. **Revert DNS** (Infrastructure, 10 min): Update Cloudflare DNS records to point back to AWS endpoints
3. **Verify DNS Propagation** (Infrastructure, 15 min): Confirm DNS resolves to AWS from multiple geographic locations
4. **Restart AWS Services** (Sitecore Dev, 15 min): Start Sitecore CM, CD, xConnect, Identity Server on AWS
5. **Verify AWS Health** (QA, 15 min): Run smoke tests against AWS environment
6. **Send Notification** (Migration Lead, 5 min): Notify all stakeholders of rollback completion
7. **Schedule Post-Mortem** (Migration Lead): Conduct root cause analysis within 48 hours

**Estimated rollback time**: 65 minutes from decision to site operational on AWS.

### 15.3 Point of No Return
The point of no return occurs when **content changes are made on the Azure CM after DNS cutover**. Once authors begin editing content on the Azure environment, rolling back to AWS would cause content loss. During the cutover window, content editing will be disabled until the Migration Lead declares cutover success (approximately 30 minutes after DNS propagation is verified).

For this engagement, AWS infrastructure will remain intact for 2 weeks post-cutover to provide a fallback option. After the 2-week hypercare period, AWS resources will be scheduled for decommissioning.

---

## 16. Post-Migration

### 16.1 Hypercare Period
A 2-week hypercare period follows production cutover. During this period:
- **Week 1**: Daily monitoring review (15 min), on-call rotation for migration team, 4-hour SLA for reported issues
- **Week 2**: Reduced monitoring (every other day), 8-hour SLA, focus on knowledge transfer
- **Monitoring Focus**: Error rates, response times, database performance, Redis hit rates, xConnect collection, search accuracy, form submissions, email delivery
- **Escalation**: Any issue impacting end users is escalated to the migration team within 30 minutes during business hours

### 16.2 Decommissioning
AWS infrastructure decommissioning will proceed after hypercare completion:
1. **Week 3 post-cutover**: Final data backup from AWS (archival)
2. **Week 4 post-cutover**: Terminate EC2 instances, delete RDS instances (after confirming Azure SQL MI has complete data)
3. **Week 5 post-cutover**: Delete VPC, subnets, security groups, VPN connection
4. **Week 6 post-cutover**: Cancel S3 buckets (after confirming all artifacts migrated), remove CloudFront distributions, cancel SES
5. **Final**: Cancel AWS support contract and close account (if fully vacating AWS)

**Estimated monthly savings after decommissioning**: $9,222/month (full AWS spend eliminated, offset by new Azure costs).

### 16.3 Knowledge Transfer
Knowledge transfer sessions will be conducted during Week 2 of hypercare:
- **Azure Portal Navigation**: Resource groups, monitoring dashboards, App Service management
- **Azure DevOps Pipelines**: Build/deploy process, pipeline editing, approval gates
- **Monitoring and Alerting**: Azure Monitor, Log Analytics queries (KQL), Application Insights
- **Incident Response**: Updated runbooks for Azure environment, escalation procedures
- **Backup and DR**: Azure Backup policies, restore procedures, SQL MI point-in-time recovery
- **Infrastructure as Code**: Terraform/OpenTofu module overview, how to apply changes

---

## Appendices

### A. Discovery Summary

Discovery covered 16 dimensions with 172 total data points:
- **119 confirmed** answers (69%) from client interviews and the RBA proposal PowerPoint
- **43 assumed** answers (25%) based on domain knowledge and standard Sitecore practices
- **10 unknown** answers (6%) requiring further validation

Key discovery sources:
- Client interviews (CI/CD, xConnect, session state, integrations, identity, search)
- RBA proposal PowerPoint (all AWS cost data, networking, security, monitoring, email, CDN, caching, compute, storage, database, identity)
- Domain knowledge (backup/DR, DNS, networking topology, session state configuration)

### B. Detailed Estimate Breakdown

| Phase | Component | Base Hours | Gotcha Hours | Multipliers | Final Hours | AI-Assisted |
|-------|-----------|-----------|-------------|-------------|-------------|-------------|
| 1 - Infrastructure | VNet & Networking | 48 | 32 | VPN 1.3x, Multi-env 1.3x | 113.1 | 65.6 |
| 1 - Infrastructure | Compute Provisioning | 48 | 0 | Multi-env 1.3x | 62.4 | 31.2 |
| 1 - Infrastructure | Managed Identity & Key Vault | 30 | 0 | -- | 30.0 | 30.0 |
| 1 - Infrastructure | SSL/TLS | 4 | 0 | -- | 4.0 | 4.0 |
| 2 - Data | Database (RDS to SQL MI) | 36 | 12 | HA DB 1.4x, Multi-env 1.3x | 77.5 | 56.7 |
| 2 - Data | Solr Search (30+ indexes) | 24 | 0 | Custom indexes 1.6x | 38.4 | 38.4 |
| 2 - Data | Blob Storage & Media | 12 | 16 | -- | 28.0 | 24.2 |
| 2 - Data | Redis & DynamoDB | 8 | 12 | -- | 20.0 | 10.0 |
| 2 - Data | Unicorn Sync | 20 | 0 | -- | 20.0 | 20.0 |
| 3 - Application | CDN / Front Door (20 dists) | 58 | 0 | -- | 58.0 | 42.8 |
| 3 - Application | Monitoring Migration | 36 | 8 | Multi-env 1.3x | 54.8 | 27.4 |
| 3 - Application | CI/CD (TeamCity to Pipelines) | 16 | 16 | Multi-env 1.3x | 36.8 | 18.4 |
| 3 - Application | Custom Integrations (3 SaaS + SDK) | 12 | 16 | -- | 28.0 | 14.0 |
| 3 - Application | xConnect & xDB | 24 | 0 | -- | 24.0 | 14.9 |
| 3 - Application | Identity Server & Cognito | 8 | 8 | -- | 16.0 | 8.0 |
| 4 - Validation | Testing (tiered) | 64 | 0 | -- | 64.0 | 54.0 |
| 4 - Validation | Backup & DR | 36 | 0 | -- | 36.0 | 18.2 |
| 5 - Cutover | Cutover Execution | 48 | 8 | -- | 56.0 | 56.0 |
| 5 - Cutover | DNS Migration & Cutover | 4 | 4 | -- | 8.0 | 8.0 |
| 5 - Cutover | Project Management | 40 | 0 | -- | 40.0 | 40.0 |
| | **TOTALS** | **576** | **132** | | **815.0** | **582.0** |

### C. Interactive Dashboard
An interactive HTML dashboard is available at `.migration/deliverables/dashboard.html`. The dashboard allows toggling AI tools, validating assumptions, and comparing scenarios in real time.

### D. Azure Resource Naming Convention

| Resource Type | Pattern | Example |
|---------------|---------|---------|
| Resource Group | rg-mck-sitecore-{env} | rg-mck-sitecore-prod |
| Virtual Network | vnet-mck-{env} | vnet-mck-prod |
| Subnet | snet-mck-{tier}-{env} | snet-mck-app-prod |
| App Service Plan | asp-mck-{role}-{env} | asp-mck-cm-prod |
| App Service | app-mck-{role}-{env} | app-mck-cd-prod |
| SQL Managed Instance | sqlmi-mck-{env} | sqlmi-mck-prod |
| Azure Managed Redis | redis-mck-{env} | redis-mck-prod |
| AKS Cluster | aks-mck-solr-{env} | aks-mck-solr-prod |
| Key Vault | kv-mck-{env} | kv-mck-prod |
| Front Door | fd-mck | fd-mck |
| Application Gateway | agw-mck-{env} | agw-mck-prod |
| VPN Gateway | vpng-mck | vpng-mck |
| Storage Account | stmck{env} | stmckprod |
| Log Analytics Workspace | law-mck-{env} | law-mck-prod |
| NSG | nsg-mck-{tier}-{env} | nsg-mck-app-prod |

---

*Generated by Migration Planner Plugin v2.0*
*Assessment ID: cb15ed5c-9d1e-4103-ae5a-34b7aab5fb9b*
