# Discovery Dimensions Reference

This document describes each of the 17 discovery dimensions used by the Sitecore XP AWS-to-Azure migration planner. For every dimension it explains what is covered, why it matters during migration, what to look for, and how gaps in discovery data affect estimation accuracy.

---

## 1. Compute/Hosting

**What it covers.** This dimension captures the full picture of the current AWS compute layer: EC2 instance types and counts broken down by Sitecore role (Content Management, Content Delivery, Processing/xConnect), operating system versions, any custom software installed on instances, and auto-scaling group configurations. It also includes reserved instance commitments and Spot usage patterns.

**Why it matters for AWS-to-Azure migration.** Every EC2 instance type must be mapped to an equivalent Azure VM SKU or App Service plan, and the mapping is rarely one-to-one. Auto-scaling rules written against CloudWatch metrics need to be re-expressed as Azure Autoscale rules or VMSS policies. OS version mismatches (e.g., Windows Server 2016 on AWS but only 2019/2022 images readily available on Azure) can force unplanned upgrade work.

**Key things to look for / red flags.**
- Instances running unsupported or end-of-life OS versions that will require an upgrade before or during migration.
- Custom software or agents (antivirus, monitoring, hardening scripts) that have AWS-specific dependencies.
- Auto-scaling policies that rely on custom CloudWatch metrics with no direct Azure Monitor equivalent.
- Oversized or undersized instances that should be right-sized during migration rather than carried over.
- GPU or high-memory instance families that have limited Azure equivalents in certain regions.

**Impact of incomplete information.** Without accurate instance counts and types, Azure cost estimates will be unreliable. Missing auto-scaling details can lead to under-provisioning in production, causing performance incidents shortly after go-live. Unknown custom software dependencies surface late in the project as blockers.

---

## 2. Database

**What it covers.** This dimension inventories every SQL Server database supporting the Sitecore platform: the SQL Server version and edition, whether databases run on Amazon RDS or self-managed EC2 instances, high-availability configuration (Multi-AZ, Always On, log shipping), the complete list of databases (core, master, web, reporting, EXM, xDB shards, custom), their sizes, custom stored procedures or CLR objects, and collation settings.

**Why it matters for AWS-to-Azure migration.** The database tier is typically the highest-risk component. RDS-managed databases cannot be lifted and shifted; they must be migrated via backup/restore, DMS, or export/import into Azure SQL Database, Azure SQL Managed Instance, or SQL Server on Azure VMs. Collation mismatches between source and target can cause silent data corruption. HA topology must be rebuilt using Azure-native constructs such as failover groups or availability groups.

**Key things to look for / red flags.**
- SQL Server versions that are not supported on the target Azure SQL platform (e.g., SQL 2014 targeting Azure SQL Database).
- Custom CLR assemblies, linked servers, or cross-database queries that are not supported on Azure SQL Database and require Managed Instance or IaaS.
- Very large databases (over 500 GB) that will have extended migration windows and may exceed Azure SQL Database size limits.
- Non-standard collation settings that differ from Sitecore defaults (`SQL_Latin1_General_CP1_CI_AS`).
- RDS parameter group customizations that need equivalents in Azure.

**Impact of incomplete information.** Unknown database sizes make it impossible to estimate migration window duration. Missing custom object inventories guarantee late-stage blockers when stored procedures or CLR assemblies fail on the target platform. Without HA configuration details, the Azure architecture may not meet the same availability SLA.

---

## 3. Search (Solr)

**What it covers.** This dimension documents the Solr deployment model (standalone, SolrCloud, managed service), the Solr version, the list of all indexes (standard Sitecore indexes plus any custom ones), whether SXA search components are in use, total index sizes on disk, and typical full rebuild times.

**Why it matters for AWS-to-Azure migration.** Solr is not an Azure-native service. The migration team must decide between running Solr on Azure VMs, using a managed Solr offering such as SearchStax, or switching to Azure Cognitive Search (which requires configuration changes and testing). Index rebuild times directly affect cutover window planning because indexes typically must be rebuilt after migration.

**Key things to look for / red flags.**
- Solr versions that are end-of-life or not supported by the target Sitecore version.
- Custom computed index fields or complex query logic that may not translate cleanly to Azure Cognitive Search.
- Very large indexes (tens of gigabytes) with rebuild times exceeding the planned maintenance window.
- SolrCloud configurations with custom sharding or replication factors that must be replicated on the target.
- Switchable indexes (Sitecore's SwitchOnRebuild) not being used, which would require downtime during rebuilds.

**Impact of incomplete information.** If index sizes and rebuild times are unknown, the cutover plan cannot be accurately time-boxed. Undiscovered custom index configurations will cause search failures in the target environment that may only surface during UAT or production.

---

## 4. Caching (Redis)

**What it covers.** This dimension covers how Redis is used in the current Sitecore deployment: whether it handles session state, output caching, custom application caching, or a combination. It also records the ElastiCache cluster configuration (node types, number of nodes, cluster mode), data persistence settings, eviction policies, and any custom key-naming conventions.

**Why it matters for AWS-to-Azure migration.** Amazon ElastiCache for Redis must be replaced with Azure Cache for Redis, which has different tier structures, clustering models, and networking options. Session state stored in Redis is critical path; any misconfiguration causes user-facing failures immediately. Persistence and eviction policy differences between the two platforms can lead to unexpected data loss during failovers.

**Key things to look for / red flags.**
- Cluster-mode enabled configurations on ElastiCache, which require the Premium or Enterprise tier on Azure Cache for Redis.
- Custom Lua scripts running inside Redis that need compatibility testing on Azure Cache for Redis.
- Large memory footprints (over 50 GB) that limit available Azure Cache tier options.
- Applications connecting to Redis using ElastiCache-specific endpoints or discovery mechanisms.
- No data persistence configured when the application assumes data survives restarts.

**Impact of incomplete information.** Missing Redis configuration details lead to incorrect tier selection on Azure, causing either cost overruns (over-provisioned) or session drops and cache evictions under load (under-provisioned). Unknown custom caching logic may silently break, degrading performance without clear error signals.

---

## 5. CDN

**What it covers.** This dimension captures the CDN configuration in front of the Sitecore delivery tier: the CDN provider (CloudFront, third-party), custom cache behaviors and rules, origin server definitions, TTL overrides, geo-restriction policies, and any integrated WAF (Web Application Firewall) rulesets.

**Why it matters for AWS-to-Azure migration.** CloudFront must be replaced with Azure Front Door or Azure CDN, and the rule engines differ significantly. Custom Lambda@Edge functions have no direct Azure equivalent and must be rewritten as Azure Front Door Rules Engine rules or Azure Functions. WAF rulesets must be rebuilt using Azure WAF policies with potentially different rule syntax and managed rule sets.

**Key things to look for / red flags.**
- Lambda@Edge or CloudFront Functions that implement business logic (A/B testing, header manipulation, authentication).
- Complex cache key policies based on cookies, headers, or query strings that may behave differently on Azure Front Door.
- WAF rules that block bot traffic or enforce geo-restrictions with custom rule logic.
- Multiple origins with failover configurations that must be replicated in Azure Front Door origin groups.
- Cache invalidation automation tied to CloudFront APIs that must be rewritten for the Azure CDN invalidation API.

**Impact of incomplete information.** Undocumented CDN rules lead to broken caching behavior post-migration, causing either stale content delivery or origin overload from cache misses. Missing WAF rules leave the application exposed to threats that were previously blocked, creating security risk during and after cutover.

---

## 6. DNS

**What it covers.** This dimension inventories all DNS zones and records associated with the Sitecore platform: the number of hosted zones, total record count, TTL settings for critical records, whether DNSSEC is enabled, and any Route 53 health checks or routing policies (weighted, latency-based, failover).

**Why it matters for AWS-to-Azure migration.** DNS changes are the final step in a migration cutover and are on the critical path. Route 53 health checks and routing policies must be recreated using Azure DNS or Azure Traffic Manager. Short TTLs are essential for fast cutover; long TTLs discovered late in the project can force extended parallel-run periods or risky cache-wait windows.

**Key things to look for / red flags.**
- TTLs set very high (over 3600 seconds) on production A/CNAME records, which delay cutover propagation.
- DNSSEC-signed zones, which require careful key migration or re-signing on Azure DNS.
- Route 53 alias records pointing to AWS resources (ALB, CloudFront) that have no direct Azure DNS equivalent.
- Health-check-driven failover routing policies that must be rebuilt with Azure Traffic Manager or Front Door.
- Third-party DNS providers with automation tied to Route 53 APIs.

**Impact of incomplete information.** Unknown TTL values make cutover timing unpredictable. Missing health check configurations can result in no automatic failover in the Azure environment. Undiscovered DNSSEC configurations may cause resolution failures if signing keys are not properly handled during migration.

---

## 7. SSL/TLS

**What it covers.** This dimension documents every SSL/TLS certificate in the environment: certificate types (DV, OV, EV, wildcard, SAN), issuing providers (ACM, third-party CA), total certificate count, any certificate pinning in client applications, and whether auto-renewal is configured through AWS Certificate Manager or a manual process.

**Why it matters for AWS-to-Azure migration.** AWS Certificate Manager certificates cannot be exported and are not transferable to Azure. Every ACM-issued certificate must be re-issued or replaced with an equivalent from Azure Key Vault managed certificates, App Service managed certificates, or a third-party CA. Certificate pinning in mobile apps or partner integrations can cause hard failures if not addressed before cutover.

**Key things to look for / red flags.**
- Certificates pinned in mobile applications or third-party clients that will break when certificates change.
- Extended Validation (EV) certificates that require lengthy re-issuance processes with manual verification.
- Large numbers of certificates (over 20) that increase the coordination burden and risk of missed renewals.
- Short-expiry certificates that may expire during the migration window.
- Private CA-issued certificates used for internal service-to-service communication.

**Impact of incomplete information.** An incomplete certificate inventory virtually guarantees TLS errors during or after cutover. Undiscovered pinning configurations cause outages in client applications that are difficult to diagnose under production pressure. Missing auto-renewal details lead to certificate expiry incidents in the months following migration.

---

## 8. Storage/Media

**What it covers.** This dimension covers all file and media storage: S3 bucket configurations (versioning, encryption, replication), how the Sitecore media library stores assets (blob storage vs. database), total media library size, access patterns (read-heavy, write-heavy), and lifecycle policies that age out or tier content.

**Why it matters for AWS-to-Azure migration.** S3 buckets must be migrated to Azure Blob Storage, and the two services have different API surfaces, access control models (IAM policies vs. SAS tokens and Azure RBAC), and event notification mechanisms. If the Sitecore media library stores blobs in S3 via a custom provider, that provider must be replaced or reconfigured for Azure Blob Storage. Large media libraries (hundreds of gigabytes or more) require dedicated data transfer planning.

**Key things to look for / red flags.**
- Custom media providers that interact directly with S3 APIs and must be rewritten for Azure Blob Storage.
- Very large media libraries (over 100 GB) that require tools like AzCopy or Azure Data Box for efficient transfer.
- S3 event notifications (Lambda triggers on upload) that must be rebuilt using Azure Blob Storage events and Azure Functions.
- Cross-region replication configurations that must be replicated with Azure Blob geo-redundant storage.
- Lifecycle policies that automatically tier or delete content, which need to be recreated using Azure Blob lifecycle management rules.

**Impact of incomplete information.** Unknown media library sizes make data transfer time estimates unreliable, directly threatening cutover window feasibility. Undocumented custom media providers will fail at runtime in the Azure environment. Missing lifecycle policy details lead to unchecked storage growth and unexpected costs post-migration.

---

## 9. Email (EXM)

**What it covers.** This dimension assesses the Sitecore Email Experience Manager deployment: whether EXM is actively used, monthly and peak dispatch volumes, the mail transfer agent type (Sitecore's built-in MTA, Amazon SES, third-party ESP), dedicated sending IP addresses, email template count and complexity, and suppression/bounce list management.

**Why it matters for AWS-to-Azure migration.** Amazon SES is not available on Azure, so the sending infrastructure must move to a third-party ESP (SendGrid, Mailgun, etc.) or Azure Communication Services. Dedicated IP addresses and their sending reputation cannot be transferred; new IPs require a warm-up period that can take weeks. EXM dispatch configuration changes must be tested thoroughly to avoid deliverability regressions.

**Key things to look for / red flags.**
- High dispatch volumes (over 100,000 emails/month) that require careful IP warm-up planning on the new provider.
- Dedicated sending IPs with established reputation that will be lost during migration.
- Custom dispatch logic or MTA configurations that are tightly coupled to Amazon SES APIs.
- SPF, DKIM, and DMARC records that must be updated for the new sending infrastructure.
- Large suppression lists that must be exported and imported to the new provider to avoid sending to bad addresses.

**Impact of incomplete information.** Unknown dispatch volumes prevent proper IP warm-up planning, risking deliverability drops and domain blacklisting. Missing suppression list data causes compliance violations and reputation damage. Undocumented SES integrations silently fail, and marketing emails stop flowing without alerts.

---

## 10. xConnect/xDB

**What it covers.** This dimension evaluates the Sitecore Experience Database and xConnect service layer: whether xDB collection and reporting are enabled, total contact volume, the number and configuration of collection database shards, custom contact facets and interaction definitions, processing and aggregation role configurations, and any Sitecore Cortex machine learning models in use.

**Why it matters for AWS-to-Azure migration.** xConnect is one of the most architecturally complex parts of Sitecore XP. Its sharded MongoDB or SQL databases, dedicated processing roles, and search indexer must all be migrated in coordination. Custom facets require schema changes on the target. Large contact databases (millions of contacts) have significant migration time requirements and may benefit from a data cleanup exercise before migration rather than carrying stale data to Azure.

**Key things to look for / red flags.**
- Very large contact databases (over 10 million contacts) that extend migration timelines and storage costs.
- Custom contact facets and interaction events that require model registration on the target xConnect instance.
- MongoDB-backed xDB installations that add an additional database platform to migrate.
- Cortex ML models and processing agents that depend on specific role topology.
- xConnect client certificate authentication configurations that must be re-established on Azure.

**Impact of incomplete information.** Unknown contact volumes make xDB migration time estimates guesswork. Missing custom facet definitions cause xConnect runtime errors that break personalization and analytics. Undiscovered processing role dependencies lead to broken aggregation pipelines on Azure.

---

## 11. Identity

**What it covers.** This dimension documents the Sitecore Identity Server configuration and all related authentication integrations: Identity Server deployment details, SSO integrations with enterprise identity providers (Azure AD, Okta, ADFS, Ping), any custom identity providers, Federated Authentication configurations, and token/session lifetime settings.

**Why it matters for AWS-to-Azure migration.** Identity Server must be redeployed on Azure infrastructure with updated endpoint URLs, and every SSO integration must be reconfigured to trust the new endpoints. Federated Authentication callback URLs embedded in third-party IdP configurations must be updated, which often requires coordination with external teams that have their own change management processes and lead times.

**Key things to look for / red flags.**
- Multiple SSO integrations with external partners where URL changes require cross-organization coordination.
- Custom Identity Server plugins or middleware that may have AWS-specific dependencies.
- Hard-coded callback URLs in third-party IdP configurations that must be updated before cutover.
- Short token lifetimes that could cause authentication failures during a parallel-run period if clocks or configs drift.
- Client secret rotation schedules that may coincide with the migration window.

**Impact of incomplete information.** Undiscovered SSO integrations break at cutover, locking users out of the CMS or personalized site experiences. Missing IdP coordination lead times push out the migration schedule. Unknown custom Identity Server components fail silently on Azure, causing intermittent authentication issues that are difficult to diagnose.

---

## 12. Session State

**What it covers.** This dimension identifies how user session state is managed across the Sitecore deployment: the session state provider in use (InProc, Redis, SQL Server, or a custom provider), whether sticky sessions (session affinity) are configured on the load balancer, session timeout values, and session serialization formats.

**Why it matters for AWS-to-Azure migration.** Session state handling directly affects user experience during and after cutover. If sessions are stored in-process, they are lost on every deployment or instance recycle, which is more frequent in Azure App Service than on EC2. Load balancer sticky session configurations from AWS ALB/NLB must be recreated on Azure Application Gateway or Front Door, each with different affinity mechanisms.

**Key things to look for / red flags.**
- InProc session state on multi-instance deployments, which is fragile and loses sessions on any instance recycle.
- Custom session state providers with serialization logic that may not be compatible with Azure-hosted Redis.
- Sticky session reliance without a fallback, which breaks if Azure load balancer affinity behaves differently.
- Very large session objects that strain Redis memory or SQL storage.
- Session timeout mismatches between application config and infrastructure-level idle timeout settings.

**Impact of incomplete information.** Incorrect session state migration causes users to lose sessions intermittently, resulting in dropped shopping carts, lost form data, and authentication loops. These issues are difficult to reproduce and diagnose, often requiring production-level traffic to surface.

---

## 13. Custom Integrations

**What it covers.** This dimension catalogs every external system integration connected to the Sitecore platform: the total count of integrations, their types (REST APIs, SOAP services, message queues, file transfers), authentication mechanisms (API keys, OAuth, certificates, IP whitelisting), and any dependencies on AWS-specific services (SQS, SNS, Lambda, S3 events, Secrets Manager).

**Why it matters for AWS-to-Azure migration.** Custom integrations are the most common source of unexpected migration work. Every integration that calls an AWS service directly must be refactored to use the Azure equivalent. Integrations authenticated by IP whitelisting must be updated with new Azure IP ranges, which often requires coordination with third-party system owners who have their own change windows.

**Key things to look for / red flags.**
- Integrations that use AWS SDK calls directly (SQS, SNS, S3, Secrets Manager, Parameter Store).
- IP-whitelisted integrations where the third party must update their firewall rules before cutover.
- Integrations with no documentation, no identified owner, or no test environment.
- Message queue consumers (SQS) that must be replaced with Azure Service Bus or Storage Queues.
- Integrations that assume low-latency connectivity to other AWS services co-located in the same region.

**Impact of incomplete information.** Every undiscovered integration is a potential cutover-day failure. Missing integration inventories are the single most common reason for migration timeline overruns. Unknown AWS service dependencies surface as runtime errors that require emergency refactoring under production pressure.

---

## 14. CI/CD

**What it covers.** This dimension documents the current build and deployment pipeline: the CI/CD tooling in use (Jenkins, AWS CodePipeline, GitHub Actions, Azure DevOps, Octopus Deploy), deployment targets and strategies (blue-green, rolling, direct), artifact storage locations (S3, Artifactory), the number of environments in the pipeline (dev, QA, staging, production), and any infrastructure-as-code tooling (CloudFormation, Terraform).

**Why it matters for AWS-to-Azure migration.** The CI/CD pipeline must be functional on Azure before the first deployment to the target environment. AWS-native pipeline tools (CodePipeline, CodeBuild, CodeDeploy) must be replaced entirely. CloudFormation templates must be rewritten as ARM templates, Bicep, or Terraform. Deployment scripts that reference AWS CLI commands, EC2 metadata endpoints, or S3 artifact buckets must be updated.

**Key things to look for / red flags.**
- AWS-native CI/CD tools (CodePipeline, CodeBuild) that require full replacement rather than reconfiguration.
- CloudFormation templates that must be rewritten for Azure Resource Manager.
- Deployment scripts with hard-coded AWS account IDs, region names, or resource ARNs.
- Artifact storage on S3 that must move to Azure Blob Storage or Azure Artifacts.
- Complex multi-environment promotion workflows with approval gates that must be rebuilt.

**Impact of incomplete information.** An incomplete CI/CD picture means the team cannot deploy to Azure environments during the migration project, blocking testing and cutover preparation. Undocumented deployment steps become tribal knowledge gaps that cause failed deployments at the worst possible time.

---

## 15. Monitoring

**What it covers.** This dimension records the current observability stack: monitoring and alerting tools (CloudWatch, Datadog, New Relic, Dynatrace), custom dashboards and their key metrics, alert definitions and escalation policies, application performance monitoring (APM) instrumentation, and log aggregation infrastructure (CloudWatch Logs, ELK, Splunk).

**Why it matters for AWS-to-Azure migration.** CloudWatch metrics and alarms do not transfer to Azure and must be rebuilt using Azure Monitor, Application Insights, or a third-party tool. Without monitoring in place on the Azure environment before cutover, the team is flying blind during the most critical phase of the project. Existing alert thresholds may also need recalibration because Azure infrastructure metrics have different baselines.

**Key things to look for / red flags.**
- Heavy reliance on CloudWatch custom metrics and dashboards that must be entirely rebuilt.
- CloudWatch Logs-based alerting with custom metric filters that have no direct Azure Monitor equivalent.
- APM agents that require reconfiguration or replacement for Azure compatibility (e.g., X-Ray to Application Insights).
- Alert escalation workflows integrated with PagerDuty or Opsgenie via CloudWatch SNS topics.
- Custom log parsing or analysis pipelines built on AWS services (Kinesis, Lambda, Elasticsearch Service).

**Impact of incomplete information.** If the monitoring dimension is poorly understood, the Azure environment will lack adequate observability at go-live. Issues that would have been caught by alerts in AWS will go undetected, potentially for days. Historical baseline metrics needed for Azure threshold calibration will be unavailable.

---

## 16. Networking/Firewall

**What it covers.** This dimension maps the full network topology supporting the Sitecore deployment: VPC configuration (CIDR ranges, subnets, availability zones), security group and NACL rules, VPN or AWS Direct Connect links to corporate networks, IP restrictions for CMS access, NAT gateway configurations, and any third-party firewall appliances or AWS Network Firewall rules.

**Why it matters for AWS-to-Azure migration.** The network architecture must be rebuilt from scratch using Azure Virtual Networks, NSGs, Azure Firewall, and ExpressRoute or VPN Gateway. CIDR range conflicts between the existing AWS VPC and the target Azure VNet can prevent hybrid connectivity during parallel-run periods. Security group rules must be manually translated to NSG rules, and the two have different evaluation semantics (especially around stateful vs. stateless behavior and rule priority).

**Key things to look for / red flags.**
- Overlapping CIDR ranges between the AWS VPC and existing Azure VNets or on-premises networks.
- Direct Connect circuits that must be replaced with or supplemented by ExpressRoute, which has different provisioning lead times.
- Complex security group chains with hundreds of rules that are difficult to audit and translate.
- IP whitelisting for CMS access that must be updated to Azure's egress IP ranges.
- Third-party virtual appliances (firewalls, IDS/IPS) that may not be available or licensed on Azure.

**Impact of incomplete information.** Network misconfiguration is the most common cause of day-one outages. Missing firewall rules leave the application either inaccessible (rules too strict) or exposed (rules too permissive). Unknown VPN or Direct Connect dependencies cause corporate network connectivity failures that block content authors and internal users.

---

## 17. Backup/DR

**What it covers.** This dimension evaluates the current data protection and disaster recovery posture: backup strategy and tooling (AWS Backup, RDS snapshots, custom scripts), recovery point objectives (RPO) and recovery time objectives (RTO) commitments, DR topology (pilot light, warm standby, multi-site active-active), cross-region replication configurations, and the cadence and results of failover testing.

**Why it matters for AWS-to-Azure migration.** RPO and RTO commitments made to the business must be maintained or improved on Azure, and the mechanisms to achieve them are entirely different. AWS Backup policies do not transfer; they must be rebuilt using Azure Backup, Azure Site Recovery, or custom automation. DR topology decisions affect Azure architecture choices (e.g., geo-redundant storage, Azure paired regions, Traffic Manager failover).

**Key things to look for / red flags.**
- Aggressive RPO/RTO targets (RPO under 1 hour, RTO under 4 hours) that require hot standby or continuous replication on Azure.
- DR configurations that have never been tested or whose last test failed.
- Cross-region replication of databases or storage that must be re-established between Azure regions.
- Custom backup scripts that reference AWS APIs and resource identifiers.
- Compliance or regulatory requirements that mandate specific backup retention periods or geographic storage constraints.

**Impact of incomplete information.** Without clear RPO/RTO requirements, the Azure architecture may be designed to a lower resilience standard than the business expects. Undocumented backup dependencies can lead to data loss if Azure-side backups are not configured before the AWS environment is decommissioned. Missing DR topology details result in an Azure deployment with no disaster recovery, creating unacceptable business risk.
