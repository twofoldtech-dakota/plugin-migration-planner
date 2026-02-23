# Risk Register -- MCK - AWS to Azure

## AWS to Azure Migration

| Field | Value |
|-------|-------|
| **Client** | MCK |
| **Date** | February 21, 2026 |
| **Last Updated** | February 21, 2026 |
| **Total Risks** | 14 |
| **High Risks** | 1 |
| **Medium Risks** | 8 |
| **Low Risks** | 5 |

---

## Risk Severity Matrix

|  | **Low Impact** | **Medium Impact** | **High Impact** |
|--|---------------|-------------------|-----------------|
| **Certain** | Medium | Medium | Critical |
| **Likely** | Low | Medium | High |
| **Possible** | Low | Low | Medium |

Applied to MCK risk portfolio:

|  | **Low Impact** | **Medium Impact** | **High Impact** |
|--|---------------|-------------------|-----------------|
| **Certain** | RISK-009, RISK-011, RISK-012 | RISK-006, RISK-007, RISK-008, RISK-010, RISK-013, RISK-014 | -- |
| **Likely** | -- | RISK-002, RISK-004 | RISK-001 |
| **Possible** | RISK-005 | RISK-003 | -- |

---

## Risk Register

| ID | Category | Description | Likelihood | Impact | Severity | Hours Impact | Linked Assumptions | Mitigation Strategy | Contingency | Owner | Status | Date Identified |
|----|----------|-------------|-----------|--------|----------|-------------|-------------------|---------------------|-------------|-------|--------|----------------|
| RISK-001 | Data | Large database migration window: 150 GB database with Multi-AZ RDS adds replication complexity. MI Link delta sync at cutover may exceed maintenance window. | Likely | High | High | 16 | ASMP-db-size | Use MI Link for continuous replication from RDS to SQL MI. Pre-migration bulk copy followed by delta sync at cutover. Use RDS read replica as migration source to minimize production impact. | Extend cutover window to 8+ hours if delta sync is slow. Consider weekend maintenance window. | DBA Lead | Open | 2026-02-21 |
| RISK-002 | Data | Media blob stored in SQL database (~50 GB estimated) significantly increases DB migration time, database size, and backup complexity. SQL blob storage is suboptimal on Azure SQL MI. | Likely | Medium | Medium | 16 | ASMP-storage-media-size, ASMP-storage-media-count | Consider migrating media to Azure Blob Storage using Sitecore Azure Blob provider during replatform. If keeping in DB, plan for larger migration window and increased SQL MI storage costs. | Keep media in SQL for initial migration; plan post-migration blob extraction project. | DBA Lead | Open | 2026-02-21 |
| RISK-003 | Data | RDS SQL Server collation mismatch risk. Default collation (SQL_Latin1_General_CP1_CI_AS) usually matches Sitecore requirements, but non-default RDS configs may have mismatches surfacing on Azure SQL MI. | Possible | Medium | Medium | 8 | -- | Verify collation on all RDS databases matches SQL_Latin1_General_CP1_CI_AS before migration. Test Sitecore on Azure SQL MI with verified collation settings. | If mismatch found: ALTER DATABASE COLLATE or data export/reimport (adds 8-16 hours). | DBA Lead | Open | 2026-02-21 |
| RISK-004 | Application | Multiple AWS-native services in use: Secrets Manager ($62.44/month), SES, Cognito, DynamoDB, CloudWatch. Application code likely has AWS SDK dependencies requiring Azure SDK replacement. | Likely | Medium | Medium | 12 | -- | Audit all application code for AWS SDK usage (S3, SES, Secrets Manager, DynamoDB, Cognito). Plan code changes to Azure SDK equivalents (Key Vault, Communication Services, Azure AD B2C, Redis/Cosmos DB). Use GitHub Copilot and Claude Code for accelerated refactoring. | Use Azure SDK compatibility shims or wrapper abstractions if direct migration is complex. | Dev Lead | Open | 2026-02-21 |
| RISK-005 | Application | Azure Managed Redis requires TLS on port 10000 (not port 6380). ElastiCache may be using non-SSL port 6379. Sitecore Redis session provider configuration must change. Azure Cache for Redis Premium is blocked for new instances as of October 2026. | Possible | Low | Low | 4 | -- | Update Sitecore Redis connection strings to use Azure Managed Redis on port 10000 with TLS enabled. Test session state behavior over new connection parameters. | Minimal -- configuration change with straightforward testing. | Dev Lead | Open | 2026-02-21 |
| RISK-006 | Infrastructure | Active VPN connection confirmed at $149.60/month. Requires Azure VPN Gateway (VpnGw2) provisioning and coordination with client network team for site-to-site tunnel reconfiguration. | Certain | Medium | Medium | 12 | -- | Provision Azure VPN Gateway (VpnGw2 or higher) early in Phase 1. Coordinate with client network team for tunnel setup. Establish parallel VPN connectivity before cutover so both tunnels are active during transition. | Maintain AWS VPN connection during transition period for fallback. If client network team delays, escalate to project sponsor. | Infra Lead | Open | 2026-02-21 |
| RISK-007 | Infrastructure | Both ALB ($73.70/month) and NLB ($40.52/month) in use. Need to map both to Azure equivalents: ALB to Application Gateway v2, NLB to Azure Load Balancer Standard. Routing rules and health probes must be recreated. | Certain | Medium | Medium | 8 | -- | Map ALB listener rules and target groups to Application Gateway routing rules and backend pools. Map NLB listeners to Azure Load Balancer frontend/backend configurations. Consider consolidating to Azure Front Door if routing complexity allows. | Deploy both Application Gateway and Load Balancer Standard. If consolidation fails, maintain separate L7/L4 load balancers as on AWS. | Infra Lead | Open | 2026-02-21 |
| RISK-008 | Infrastructure | AWS Secrets Manager at $62.44/month with application-level references throughout codebase. All secrets must be migrated to Azure Key Vault, and all access patterns must change from IAM to Managed Identity. | Certain | Medium | Medium | 8 | -- | Inventory all secrets in AWS Secrets Manager. Create Azure Key Vault with equivalent secrets. Update all application references from AWS SDK (GetSecretValue) to Key Vault SDK or Managed Identity (DefaultAzureCredential). Run code scan to verify all references updated. | Phased approach: migrate critical secrets first, use environment variables as temporary bridge during transition. | Infra Lead | Open | 2026-02-21 |
| RISK-009 | Infrastructure | AWS Cognito in use ($0.35/month indicates small user base). User pool and any custom auth flows must migrate to Azure AD B2C. Low cost suggests limited users but migration still requires planning. | Certain | Low | Low | 8 | -- | Export Cognito user pool. Set up Azure AD B2C tenant with matching user attributes and custom policies. Coordinate auth flow cutover with application team. | If user count is very small (< 100), manual recreation may be faster than automated export/import. | Dev Lead | Open | 2026-02-21 |
| RISK-010 | Infrastructure | DynamoDB in use ($56.09/month) for session or analytics data. Data model and access patterns must be analyzed to choose the correct Azure equivalent (Redis for key-value/session, Cosmos DB for document/analytics). | Certain | Medium | Medium | 8 | -- | Analyze DynamoDB table schemas, access patterns, and throughput requirements. Choose Azure equivalent: Azure Managed Redis for session-like key-value data, Cosmos DB for document/analytics data. Plan data migration scripts and application code updates. | If analysis is complex, migrate DynamoDB data to Cosmos DB (NoSQL API provides closest compatibility with DynamoDB). | Dev Lead | Open | 2026-02-21 |
| RISK-011 | Infrastructure | Route 53 in use ($92.67/month) alongside Cloudflare DNS. Hosted zones and DNS records need migration to Azure DNS or consolidation into Cloudflare. Dual DNS management adds operational overhead. | Certain | Low | Low | 4 | ASMP-dns-zones, ASMP-dns-records | Inventory all Route 53 hosted zones and records. Decision: migrate to Azure DNS or consolidate into Cloudflare (recommended since Cloudflare is already primary). Export and recreate records. Validate DNS resolution before cutover. | Maintain Route 53 during transition. Consolidate to Cloudflare post-migration during hypercare. | Infra Lead | Open | 2026-02-21 |
| RISK-012 | Infrastructure | Amazon SES at $29.37/month with dedicated IP and SMTP relay. SES SMTP endpoint must be replaced with SendGrid or Azure Communication Services. Dedicated IP means IP warming will be required on new provider. | Certain | Low | Low | 4 | ASMP-email-smtp | Set up SendGrid or Azure Communication Services account. Configure SMTP relay credentials. Update Sitecore SMTP configuration (web.config or Sitecore config patches). If SES dedicated IP is in use, plan 2-4 week IP warming period on new provider before cutover. | Start IP warming early (Phase 2) so warm IP is ready by cutover. If warming is not complete, use shared IP pool initially with monitoring for deliverability issues. | Dev Lead | Open | 2026-02-21 |
| RISK-013 | Infrastructure | Heavy CloudWatch usage ($1,005.64/month total across web and additional services). All alarms, custom metrics, dashboards, and log queries must be recreated in Azure Monitor and Log Analytics. Metric Streams ($256.13/month) adds complexity. | Certain | Medium | Medium | 12 | -- | Inventory all CloudWatch alarms (count, thresholds, actions), dashboards, and Metric Streams. Recreate in Azure Monitor using alert rules, action groups, and Log Analytics workbooks. Existing New Relic APM continues unchanged -- only AWS-native monitoring needs migration. CloudTrail ($94.76/month) is eliminated as Azure Activity Log is free. | Phase monitoring migration: start with critical production alerts in Phase 3, add dashboards and advanced queries during hypercare. | Infra Lead | Open | 2026-02-21 |
| RISK-014 | Infrastructure | Full AWS security stack: WAF ($100.86), Security Hub ($24.18), GuardDuty ($66.34), AWS Config ($29.36). All need Azure equivalents: Azure WAF on Front Door, Defender for Cloud, Azure Policy. Custom WAF rules require complete rewrite. | Certain | Medium | Medium | 12 | -- | Map WAF rules to Azure WAF rule sets on Front Door (custom rules need full rewrite). Enable Defender for Cloud to replace Security Hub + GuardDuty. Configure Azure Policy to replace AWS Config for compliance enforcement. Test WAF rules against Sitecore traffic for false positives. | Phase security migration: enable Defender for Cloud (detection mode) in Phase 1, WAF rules in Phase 3, Azure Policy in Phase 4. | Infra Lead | Open | 2026-02-21 |

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
| 2026-02-21 | 0 | 1 | 8 | 5 | 14 | 0 | Initial risk identification during discovery and analysis |

---

## Risk Interdependencies

Risks that amplify or trigger each other when they co-occur.

| Risk A | Risk B | Relationship | Combined Effect |
|--------|--------|-------------|----------------|
| RISK-001 (Large DB migration) | RISK-002 (Media in SQL) | Amplifies | Media stored in SQL increases DB size by ~50 GB, extending migration window by 25-33%. Combined: 20+ hours additional if both materialize. |
| RISK-001 (Large DB migration) | RISK-003 (Collation mismatch) | Triggers | A collation mismatch discovered during migration would require re-import, doubling the migration window. Combined: 24+ hours. |
| RISK-004 (AWS SDK dependencies) | RISK-008 (Secrets Manager migration) | Shares root cause | Both involve AWS SDK code references. SDK audit covers both; resolving one partially resolves the other. Combined: 16 hours (not additive). |
| RISK-004 (AWS SDK dependencies) | RISK-010 (DynamoDB migration) | Shares root cause | DynamoDB SDK calls are part of the broader AWS SDK dependency. Both require code refactoring to Azure equivalents. Combined: 16 hours. |
| RISK-006 (VPN migration) | RISK-001 (Large DB migration) | Amplifies | MI Link requires stable network connectivity between AWS RDS and Azure SQL MI. VPN instability during migration directly impacts database sync reliability. Combined: 20+ hours. |
| RISK-007 (Dual LB migration) | RISK-014 (Security tooling) | Amplifies | WAF rules are attached to load balancers. Changing both LB architecture and WAF rules simultaneously increases the risk of misrouted or unprotected traffic. Combined: 16 hours. |
| RISK-012 (SES email migration) | RISK-004 (AWS SDK dependencies) | Shares root cause | If SES is accessed via AWS SDK (rather than SMTP relay), email migration becomes part of the SDK refactoring effort. Combined: 12 hours. |
| RISK-013 (CloudWatch migration) | RISK-014 (Security tooling) | Amplifies | Security events from GuardDuty/Security Hub flow into CloudWatch. Migrating both monitoring and security simultaneously risks losing visibility during transition. Combined: 20 hours. |

### How to Read This Table
- **Amplifies**: If Risk A materializes, it increases the likelihood or impact of Risk B
- **Triggers**: If Risk A materializes, Risk B becomes nearly certain
- **Shares root cause**: Both risks stem from the same underlying gap or assumption
- **Combined Effect**: The additional hours or severity increase when both risks co-occur (beyond their individual impacts)

---

## Risk Clusters

Risk clusters group related risks that share common assumptions, root causes, or affected components. When multiple risks in a cluster materialize simultaneously, the combined impact is typically greater than the sum of individual impacts.

### Cluster 1: Data Migration (28 hours combined widening)

| Risk ID | Description | Hours Impact |
|---------|-------------|-------------|
| RISK-001 | Large database migration window (150 GB, Multi-AZ) | 16 |
| RISK-002 | Media blob stored in SQL (~50 GB) | 16 |
| RISK-003 | RDS collation mismatch | 8 |

**Linked Assumptions**: ASMP-db-size, ASMP-storage-media-size, ASMP-storage-media-count, ASMP-db-clr, ASMP-db-linked, ASMP-db-crossdb

**Cluster Mitigation**: Run DMA (Database Migration Assistant) assessment against all RDS databases before migration. Verify collation, CLR assemblies, linked servers, and cross-database queries. Establish MI Link replication early to measure actual sync performance with real data volumes. Decision on media-to-blob migration should be made by end of Phase 1.

---

### Cluster 2: AWS Service Dependencies (18 hours combined widening)

| Risk ID | Description | Hours Impact |
|---------|-------------|-------------|
| RISK-004 | AWS SDK dependencies in application code | 12 |
| RISK-008 | Secrets Manager migration to Key Vault | 8 |
| RISK-009 | Cognito user pool migration to Azure AD B2C | 8 |
| RISK-010 | DynamoDB data migration | 8 |
| RISK-012 | SES email migration (dedicated IP) | 4 |

**Linked Assumptions**: ASMP-email-smtp, ASMP-email-code

**Cluster Mitigation**: Conduct a comprehensive AWS SDK audit across the entire codebase at the start of Phase 3. Catalog every AWS service reference (Secrets Manager, SES, Cognito, DynamoDB, S3, CloudWatch). Create a service-by-service migration checklist. Use GitHub Copilot and Claude Code to accelerate SDK refactoring. Start SES replacement and IP warming in Phase 2 to ensure email deliverability by cutover.

---

### Cluster 3: Networking Complexity (22 hours combined widening)

| Risk ID | Description | Hours Impact |
|---------|-------------|-------------|
| RISK-006 | VPN Gateway migration coordination | 12 |
| RISK-007 | Dual load balancer mapping (ALB + NLB) | 8 |
| RISK-011 | Route 53 DNS alongside Cloudflare | 4 |

**Linked Assumptions**: ASMP-net-vpc, ASMP-net-subnets, ASMP-net-bastion, ASMP-net-topology, ASMP-net-isolation, ASMP-dns-zones, ASMP-dns-records

**Cluster Mitigation**: Validate all networking assumptions (VPC topology, subnet tiers, environment isolation) before starting Phase 1 infrastructure provisioning. Engage client network team early for VPN coordination. Document current ALB + NLB routing rules completely before designing Azure equivalents. Decide on DNS consolidation strategy (Azure DNS vs. Cloudflare) before Phase 5.

---

### Cluster 4: Compute & Session (30 hours combined widening)

| Risk ID | Description | Hours Impact |
|---------|-------------|-------------|
| RISK-005 | Redis SSL/port migration | 4 |

**Linked Assumptions**: ASMP-compute-cm, ASMP-compute-cd, ASMP-compute-asg-min, ASMP-compute-asg-metric, ASMP-session-peak, ASMP-session-private, ASMP-session-shared

**Cluster Mitigation**: Validate EC2 instance types and ASG configuration to determine correct Azure App Service SKU sizing. Check CloudWatch or New Relic for peak concurrent session counts to size Azure Managed Redis correctly. Verify Redis session provider configuration (private and shared) before migration.

---

### Cluster 5: Monitoring & Security (6 hours combined widening)

| Risk ID | Description | Hours Impact |
|---------|-------------|-------------|
| RISK-013 | CloudWatch monitoring migration ($1,006/month) | 12 |
| RISK-014 | Security tooling migration (WAF, Security Hub, GuardDuty, Config) | 12 |

**Linked Assumptions**: ASMP-monitoring-sla

**Cluster Mitigation**: Inventory all CloudWatch alarms and Security Hub findings before migration. Deploy Defender for Cloud in detection mode during Phase 1 to establish Azure security baseline. Migrate monitoring and security incrementally -- critical alerts first, dashboards second, compliance policies third.

---

### Cluster 6: Backup & DR (16 hours combined widening)

| Risk ID | Description | Hours Impact |
|---------|-------------|-------------|
| (no direct risk -- assumption-driven widening) | -- | -- |

**Linked Assumptions**: ASMP-backup-strategy, ASMP-backup-retention, ASMP-backup-rpo, ASMP-backup-rto, ASMP-backup-dr-region, ASMP-backup-ami, ASMP-backup-dr-docs

**Cluster Mitigation**: Confirm backup strategy, RPO (1 hour assumed), and RTO (4 hours assumed) with client before configuring Azure Backup policies. Verify whether cross-region DR is required. Request existing DR documentation from client.

---

### Cluster 7: Search Migration (8 hours combined widening)

| Risk ID | Description | Hours Impact |
|---------|-------------|-------------|
| (no direct risk -- multiplier-driven) | 30+ custom Solr indexes drive 1.6x multiplier | -- |

**Linked Assumptions**: ASMP-search-size

**Cluster Mitigation**: Determine total Solr index size on disk. Document all 30+ custom index configurations (schema.xml, solrconfig.xml). Plan AKS node sizing based on actual index sizes. Validate search results post-migration against source environment.

---

## Residual Risk Assessment

After applying mitigations, track the remaining risk level.

| ID | Original Severity | Mitigation Applied | Residual Likelihood | Residual Impact | Residual Severity | Residual Hours | Accepted By |
|----|-------------------|--------------------|--------------------|-----------------|--------------------|----------------|-------------|
| RISK-001 | High | MI Link continuous sync, read replica as source | Possible | Medium | Medium | 8 | [Pending] |
| RISK-002 | Medium | Plan for larger migration window | Possible | Low | Low | 4 | [Pending] |
| RISK-003 | Medium | Pre-migration collation verification | Unlikely | Medium | Low | 2 | Migration Lead |
| RISK-004 | Medium | Comprehensive SDK audit + AI-assisted refactoring | Possible | Low | Low | 4 | Migration Lead |
| RISK-005 | Low | Connection string update + testing | Unlikely | Low | Low | 1 | Migration Lead |
| RISK-006 | Medium | Parallel VPN connectivity | Possible | Low | Low | 4 | [Pending] |
| RISK-007 | Medium | Documented routing rule mapping | Possible | Low | Low | 4 | Migration Lead |
| RISK-008 | Medium | Secret inventory + Managed Identity | Unlikely | Low | Low | 2 | Migration Lead |
| RISK-009 | Low | User pool export/import | Unlikely | Low | Low | 2 | Migration Lead |
| RISK-010 | Medium | Access pattern analysis + appropriate Azure service | Possible | Low | Low | 4 | [Pending] |
| RISK-011 | Low | DNS inventory + Cloudflare consolidation | Unlikely | Low | Low | 1 | Migration Lead |
| RISK-012 | Low | Early IP warming + SMTP config update | Unlikely | Low | Low | 1 | Migration Lead |
| RISK-013 | Medium | Phased monitoring migration | Possible | Low | Low | 4 | Migration Lead |
| RISK-014 | Medium | Phased security migration + Defender detection mode | Possible | Low | Low | 4 | Migration Lead |

### Residual Risk Summary
- **Total residual hours**: 45 hours
- **Residual risks accepted**: 9 (accepted by Migration Lead)
- **Residual risks requiring monitoring**: 5 (pending client acceptance for RISK-001, RISK-002, RISK-006, RISK-010)

### Risk Acceptance Criteria
- Residual risks with **Low** severity are accepted by the Migration Lead
- Residual risks with **Medium** severity require Client Stakeholder acceptance
- Residual risks with **High/Critical** severity must have documented contingency plans and executive sign-off

---

## Key Risk Details

### RISK-001: Large Database Migration Window

**Category**: Data
**Severity**: High (Likely x High Impact)
**Hours Impact**: 16 hours
**Linked Assumptions**: ASMP-db-size (validated at 150 GB)

**Description**: The 150 GB database with Multi-AZ RDS configuration creates an extended migration window. While the database size has been validated (reduced from the original 250 GB estimate), the Multi-AZ configuration adds replication complexity during migration. MI Link requires stable cross-cloud network connectivity (via VPN) for the duration of the continuous sync period.

**Root Cause**: Large data volume combined with HA configuration and cross-cloud network requirements.

**Mitigation Plan**:
1. Establish MI Link replication 1-2 weeks before cutover to complete initial bulk sync
2. Use RDS read replica as the migration source to eliminate production impact
3. Monitor replication lag daily; target < 5 seconds sustained lag
4. Plan cutover during low-traffic window (weekend or evening)
5. Final delta sync estimated at 30-45 minutes for 150 GB database

**Contingency**: If delta sync exceeds 60 minutes, extend the cutover window to 8+ hours. If MI Link cannot maintain acceptable replication lag, fall back to offline migration with extended maintenance window.

**Decision Point**: If MI Link replication lag cannot be brought below 30 seconds after 48 hours of continuous sync, escalate to Migration Lead for re-planning.

---

### RISK-002: Media Blob Stored in SQL Database

**Category**: Data
**Severity**: Medium (Likely x Medium Impact)
**Hours Impact**: 16 hours
**Linked Assumptions**: ASMP-storage-media-size (50 GB assumed), ASMP-storage-media-count (25,000 assumed)

**Description**: The Sitecore media library (approximately 50 GB, 25,000 items) is stored as BLOBs in the SQL Server database rather than externalized to S3/Blob Storage. This increases the effective database migration size, extends migration windows, and is suboptimal for Azure SQL MI performance and cost.

**Mitigation Plan**:
1. Decision needed: migrate media to Azure Blob Storage using Sitecore Azure Blob provider, or keep in SQL MI
2. If migrating to Blob Storage: add 16 hours for provider implementation and testing
3. If keeping in SQL MI: plan for larger SQL MI storage tier and extended migration window

**Recommendation**: Keep media in SQL MI for the initial migration to minimize risk. Plan a post-migration project to externalize media to Azure Blob Storage for improved performance and reduced SQL MI costs.

---

### RISK-004: AWS SDK Dependencies in Application Code

**Category**: Application
**Severity**: Medium (Likely x Medium Impact)
**Hours Impact**: 12 hours

**Description**: The MCK Sitecore deployment uses multiple AWS-native services: Secrets Manager ($62.44/month), SES ($29.37/month), Cognito ($0.35/month), DynamoDB ($56.09/month), and CloudWatch. Application code likely contains AWS SDK references (AWSSDK.SecretsManager, AWSSDK.SimpleEmail, AWSSDK.DynamoDBv2, etc.) that must be replaced with Azure SDK equivalents.

**Mitigation Plan**:
1. Run automated code scan for AWS SDK NuGet packages and namespace references
2. Catalog all AWS service calls with file locations and call patterns
3. Design Azure SDK replacement for each: Key Vault (DefaultAzureCredential), SendGrid/ACS (SMTP relay), Azure AD B2C (MSAL), Redis/Cosmos (respective SDKs)
4. Use GitHub Copilot and Claude Code to accelerate refactoring
5. Unit test all replaced service calls before integration testing

**Contingency**: If direct SDK replacement is complex for certain services, implement wrapper/adapter pattern to abstract cloud provider behind an interface. This adds 4-8 hours but provides a cleaner architecture.

---

### RISK-006: VPN Gateway Migration

**Category**: Infrastructure
**Severity**: Medium (Certain x Medium Impact)
**Hours Impact**: 12 hours

**Description**: An active VPN connection ($149.60/month) links the AWS VPC to the client's on-premises network. The Azure VPN Gateway (VpnGw2) must be provisioned, and the client network team must reconfigure the site-to-site tunnel. This is a coordination-heavy task with external dependencies.

**Mitigation Plan**:
1. Engage client network team during Phase 1 planning (Week 1)
2. Provision Azure VPN Gateway (VpnGw2 SKU) in Week 1
3. Configure parallel VPN: both AWS and Azure tunnels active simultaneously
4. Test connectivity from Azure to on-premises resources before proceeding
5. Maintain AWS VPN throughout transition for fallback

**Contingency**: If client network team cannot complete tunnel configuration within 2 weeks, escalate to project sponsor. If VPN is not critical for day-to-day operations (only for admin access), proceed with migration and configure VPN in parallel.

---

### RISK-013: CloudWatch Monitoring Migration

**Category**: Infrastructure
**Severity**: Medium (Certain x Medium Impact)
**Hours Impact**: 12 hours

**Description**: MCK has significant CloudWatch investment at $1,005.64/month: custom alarms, metrics, dashboards, log queries, and Metric Streams ($256.13/month). All must be recreated in Azure Monitor and Log Analytics. The New Relic APM integration continues unchanged, but all AWS-native monitoring must be rebuilt.

**Mitigation Plan**:
1. Export inventory of all CloudWatch alarms (metric, threshold, action, state)
2. Export all CloudWatch dashboards and Metric Stream configurations
3. Recreate critical production alerts in Azure Monitor during Phase 3
4. Build Azure Monitor workbooks (replacing CloudWatch dashboards)
5. Configure Log Analytics workspace with KQL queries replacing CloudWatch Insights
6. CloudTrail ($94.76/month) is eliminated -- Azure Activity Log is free

**Contingency**: Phase the migration: critical alerts first (Week 5-6), dashboards second (Week 7-8), advanced queries during hypercare. If full parity is not achieved by cutover, maintain read-only CloudWatch access for reference during hypercare.

---

### RISK-014: Security Tooling Migration

**Category**: Infrastructure
**Severity**: Medium (Certain x Medium Impact)
**Hours Impact**: 12 hours

**Description**: MCK runs a full AWS security stack: WAF ($100.86/month), Security Hub ($24.18/month), GuardDuty ($66.34/month), and AWS Config ($29.36/month). Each requires an Azure equivalent with different configuration approaches.

**Mitigation Plan**:
1. **WAF**: Export AWS WAF rule sets. Rewrite for Azure WAF on Front Door. Custom rules need complete rewrite -- managed rule sets provide baseline. Test against Sitecore traffic for false positives.
2. **Security Hub + GuardDuty**: Enable Microsoft Defender for Cloud (Enhanced). Provides equivalent threat detection and security posture scoring.
3. **AWS Config**: Configure Azure Policy for compliance enforcement. Apply built-in policy initiatives (CIS, SOC2) as applicable.
4. Phase deployment: Defender in detection mode during Phase 1, WAF rules during Phase 3, Azure Policy during Phase 4.

**Contingency**: Deploy Azure security tooling in detection/audit mode initially (no enforcement). Tune false positives during hypercare. Enable enforcement after 1 week of stable operation.

---

*Generated by Migration Planner Plugin v2.0*
*Assessment ID: cb15ed5c-9d1e-4103-ae5a-34b7aab5fb9b*
