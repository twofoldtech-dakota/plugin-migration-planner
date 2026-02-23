# Migration Runbook — MCK - AWS to Azure

## AWS to Azure Cutover Execution Guide

| Field | Value |
|-------|-------|
| **Client** | MCK |
| **Date** | February 21, 2026 |
| **Sitecore Version** | 10.4 |
| **Topology** | XP Scaled |
| **Cutover Window** | Weekend maintenance window (Saturday 10 PM -- Sunday 10 AM ET) |
| **Maintenance Window Start** | TBD (Saturday 10:00 PM ET) |
| **Expected Duration** | 8-12 hours |
| **Rollback Deadline** | Sunday 6:00 AM ET (8 hours after start) |
| **Environments** | Dev, QA, Prod (3 total) |

---

## Contacts & Escalation

| Role | Name | Phone | Email | Availability |
|------|------|-------|-------|-------------|
| Migration Lead | [TBD - Migration Lead Name] | [TBD - Migration Lead Phone] | [TBD - Migration Lead Email] | On-site |
| Infrastructure Engineer | [TBD - Infrastructure Lead Name] | [TBD - Infrastructure Lead Phone] | [TBD - Infrastructure Lead Email] | On-call |
| DBA | [TBD - DBA Name] | [TBD - DBA Phone] | [TBD - DBA Email] | On-call |
| Sitecore Developer | [TBD - Sitecore Dev Name] | [TBD - Sitecore Dev Phone] | [TBD - Sitecore Dev Email] | On-call |
| QA Engineer | [TBD - QA Engineer Name] | [TBD - QA Engineer Phone] | [TBD - QA Engineer Email] | On-call |
| Client Stakeholder (MCK) | [TBD - Client Stakeholder Name] | [TBD - Client Stakeholder Phone] | [TBD - Client Stakeholder Email] | On-call |

### Escalation Path

1. **Level 1** -- Technical team resolves within step time estimate.
2. **Level 2** -- Migration Lead notified if step exceeds 2x time estimate.
3. **Level 3** -- Client Stakeholder notified if cumulative delay exceeds 30 minutes.
4. **Level 4** -- Executive escalation if rollback is triggered.

---

## Pre-Migration Checklist

Complete ALL items before starting cutover. Each item must be signed off by the designated owner.

### Infrastructure Readiness

- [ ] Azure VNet and subnets provisioned and validated (3-tier: public, application, database)
- [ ] NSG rules configured and tested for all tiers
- [ ] Azure VMs provisioned with correct sizing for CM, CD, and xConnect roles
- [ ] Azure SQL Managed Instance provisioned (General Purpose tier; upgrade to Business Critical if HA validation confirms Always On AG requirement)
- [ ] MI Link continuous replication established and running against AWS SQL Server databases (Core, Master, Web, xDB)
- [ ] Solr cluster deployed on Azure VM with verified version (confirm 8.11.2 or 9.8.1 if upgrading to Sitecore 10.4.1)
- [ ] All 30+ custom Solr indexes rebuilt and validated on Azure Solr instance
- [ ] Azure Managed Redis provisioned with TLS enabled (note: Azure Cache for Redis Premium is retiring -- new instances blocked April 2026)
- [ ] Azure Front Door Premium configured (consolidating 20 CloudFront distributions into single profile)
- [ ] Azure WAF rules configured on Front Door Premium (rewritten from CloudFront WAF rules)
- [ ] SSL certificates uploaded to Azure Key Vault for all sites
- [ ] Azure Monitor and Application Insights configured (replacing New Relic or running in parallel)
- [ ] Azure Backup policies configured (SQL MI automated backups, VM backup vaults)
- [ ] Managed Identity configured for Key Vault access (replacing AWS Secrets Manager)
- [ ] Temporary hybrid connectivity between AWS and Azure verified (VPN or public endpoints for MI Link replication)

### Application Readiness

- [ ] Sitecore CM role deployed to Azure VM and verified
- [ ] Sitecore CD role(s) deployed to Azure VM(s) with auto-scaling configured
- [ ] xConnect Collection service deployed to Azure VM and verified
- [ ] xConnect Search Indexer service deployed and verified
- [ ] xConnect Marketing Automation Engine confirmed as not in scope (not used)
- [ ] Sitecore Identity Server deployed on CM VM and tested
- [ ] Connection strings updated for Azure SQL MI, Azure Managed Redis, Azure Solr, and Azure Key Vault
- [ ] Azure AD authentication for Sitecore editors tested and confirmed working
- [ ] Visitor authentication (custom membership provider) tested against Azure SQL MI
- [ ] Unicorn serialization validated on Azure VMs (confirm no path length issues on target VMs)
- [ ] Unicorn sync tested: all serialized items deserialize cleanly on Azure environment
- [ ] SMTP relay configured and tested for Sitecore Forms transactional email
- [ ] All custom integrations tested against Azure endpoints (OneTrust, SiteImprove, Klaviyo, Cognito)
- [ ] AWS Secrets Manager references replaced with Azure Key Vault SDK calls (code deployed and verified)
- [ ] CI/CD pipelines updated for Azure targets (Azure Pipelines replacing TeamCity, or TeamCity reconfigured)
- [ ] Sitecore license file validated for Azure IaaS deployment

### Data Readiness

- [ ] Initial bulk database migration completed via MI Link (Core, Master, Web databases)
- [ ] xDB collection and shard databases replicated to Azure SQL MI
- [ ] MI Link continuous replication running and in sync (verify replication lag < 5 seconds)
- [ ] Delta sync mechanism tested end-to-end with MI Link cutover procedure
- [ ] Media library migration staged (AzCopy incremental sync of ~50GB media content from SQL blob export)
- [ ] Solr indexes fully rebuilt on Azure VM from Azure SQL MI data
- [ ] Solr index item counts validated against source (within 5% tolerance for each of 30+ indexes)
- [ ] xDB contact count validated (expected range: 100,000-500,000 contacts)

### Validation Complete

- [ ] Smoke tests passed on Azure environment (CM login, CD rendering, publish cycle)
- [ ] Functional test suite passed across all sites
- [ ] xConnect data collection verified (interactions recording to Azure SQL MI)
- [ ] Sitecore Forms submission tested end-to-end (form submit, data storage, email notification)
- [ ] Unicorn serialization sync verified (publish and sync operations functional)
- [ ] Solr search validated across all 30+ custom indexes (query results match source)
- [ ] Redis session state verified (sessions persist across CD instances)
- [ ] Azure AD authentication tested (editor login, role-based access)
- [ ] Performance baseline established on Azure (response times within acceptable range)
- [ ] Load test completed and results within acceptable range (~1M views/month equivalent load)
- [ ] Security scan completed on Azure environment
- [ ] UAT sign-off obtained from MCK stakeholder

### Operational Readiness

- [ ] This runbook reviewed by all team members (sign-off required)
- [ ] Rollback procedure tested in QA environment
- [ ] Communication plan sent to all stakeholders
- [ ] Maintenance page ready and tested (will be served from AWS during cutover)
- [ ] DNS TTL lowered to 300 seconds (or lower) on Cloudflare 24-48 hours prior to cutover
- [ ] DNS TTL propagation verified from multiple geographic locations
- [ ] New Relic monitoring confirmed operational on both AWS and Azure during transition
- [ ] Azure Monitor alerts configured and verified (trigger test alert)
- [ ] War room / Microsoft Teams channel set up for real-time communication during cutover

---

## Cutover Execution Steps

### T-60 min: Final Preparation

| # | Step | Owner | Est. Time | Status | Notes |
|---|------|-------|-----------|--------|-------|
| 1 | Confirm all team members available and connected on Microsoft Teams | Migration Lead | 5 min | [ ] | Roll call all roles listed in Contacts table |
| 2 | Verify Azure environment health (all VMs running, SQL MI accessible, Solr responsive, Redis connected) | Infrastructure | 10 min | [ ] | Check Azure Monitor dashboard |
| 3 | Verify MI Link replication status and lag (must be < 5 seconds) | DBA | 10 min | [ ] | Query MI Link replication status DMV |
| 4 | Verify DNS TTL has propagated to 300s or lower from multiple regions | Infrastructure | 5 min | [ ] | Test from US East, US West, EU at minimum |
| 5 | Take final backup of AWS databases (Core, Master, Web, xDB) | DBA | 15 min | [ ] | Safety backup -- retain for 30 days |
| 6 | Confirm go/no-go decision with MCK stakeholder | Migration Lead | 5 min | [ ] | **GO / NO-GO CHECKPOINT** |

### T-0: Cutover Start (Saturday 10:00 PM ET)

| # | Step | Owner | Est. Time | Status | Notes |
|---|------|-------|-----------|--------|-------|
| 7 | Send "Maintenance Started" notification to all stakeholders | Migration Lead | 5 min | [ ] | Email + Microsoft Teams |
| 8 | Enable maintenance page on AWS (all CD instances) | Infrastructure | 5 min | [ ] | Verify maintenance page renders correctly |
| 9 | Stop Sitecore CD services on AWS | Sitecore Dev | 5 min | [ ] | Stop IIS application pools on all CD instances |
| 10 | Stop Sitecore CM service on AWS | Sitecore Dev | 5 min | [ ] | Stop IIS application pool on CM |
| 11 | Stop xConnect services on AWS (Collection, Search Indexer) | Sitecore Dev | 5 min | [ ] | Verify no active processing tasks |
| 12 | Execute MI Link cutover -- switch replication mode to online (final delta sync) | DBA | 30-45 min | [ ] | 250GB database final delta sync via MI Link -- near-instant cutover after continuous replication |
| 13 | Verify database consistency on Azure SQL MI (row counts, key table checksums) | DBA | 15 min | [ ] | Compare Core, Master, Web, xDB row counts within 0.1% |
| 14 | Execute final incremental AzCopy sync of media content to Azure | Infrastructure | 15-20 min | [ ] | Final incremental AzCopy sync of ~50GB media |

### T+60 min: Application Startup

| # | Step | Owner | Est. Time | Status | Notes |
|---|------|-------|-----------|--------|-------|
| 15 | Start Sitecore Identity Server on Azure | Sitecore Dev | 5 min | [ ] | Start IIS application pool on CM VM |
| 16 | Verify Identity Server health endpoint returns 200 | Sitecore Dev | 5 min | [ ] | `GET /identity/.well-known/openid-configuration` |
| 17 | Start Sitecore CM on Azure | Sitecore Dev | 10 min | [ ] | Start IIS application pool; monitor startup logs |
| 18 | Verify CM login and basic content authoring functionality | Sitecore Dev | 10 min | [ ] | Login with Azure AD credentials, navigate content tree, verify Experience Editor |
| 19 | Run Unicorn sync on CM to verify serialization integrity | Sitecore Dev | 10 min | [ ] | Navigate to `/unicorn.aspx`, verify all configurations show "Up to date" |
| 20 | Start xConnect Collection service on Azure | Sitecore Dev | 5 min | [ ] | Start IIS application pool on xConnect VM |
| 21 | Verify xConnect Collection health endpoint | Sitecore Dev | 5 min | [ ] | `GET /xconnect/healthz` -- expect 200 |
| 22 | Start xConnect Search Indexer service on Azure | Sitecore Dev | 5 min | [ ] | Verify indexer connects to Solr and xDB |
| 23 | Start Sitecore CD instance(s) on Azure | Sitecore Dev | 10 min | [ ] | Start IIS application pools; verify startup in logs |
| 24 | Verify CD site rendering for primary site | Sitecore Dev | 5 min | [ ] | Load homepage and key landing pages via direct IP/hosts file |

### T+90 min: Validation

| # | Step | Owner | Est. Time | Status | Notes |
|---|------|-------|-----------|--------|-------|
| 25 | Run smoke test suite (CM login, CD rendering, publish cycle, multi-site) | QA | 15 min | [ ] | Must pass for all sites |
| 26 | Verify Solr search functionality across all 30+ custom indexes | Sitecore Dev | 10 min | [ ] | Execute standard search queries, verify result counts match baseline |
| 27 | Verify Sitecore Forms submission (submit, data storage, email delivery) | QA | 5 min | [ ] | Submit test form, verify data in Forms database, verify email received |
| 28 | Verify xConnect data collection (trigger page visit, confirm interaction recorded) | Sitecore Dev | 10 min | [ ] | Browse CD site, check xDB for new interaction within 60 seconds |
| 29 | Verify Redis session state (login on CD, verify session persists across requests) | Sitecore Dev | 5 min | [ ] | Verify session data in Azure Managed Redis |
| 30 | Verify Azure AD authentication (editor login, role assignment, content access) | Sitecore Dev | 5 min | [ ] | Login with 2+ test accounts with different roles |
| 31 | Test publish workflow (CM full publish, verify CD receives updates) | Sitecore Dev | 10 min | [ ] | Publish a test item, verify on CD within 30 seconds |
| 32 | Verify custom integrations (OneTrust, SiteImprove, Klaviyo, Cognito) | Sitecore Dev | 10 min | [ ] | Confirm scripts load, data flows, no console errors |
| 33 | Verify monitoring and alerts operational in Azure Monitor | Infrastructure | 5 min | [ ] | Trigger test alert, confirm notification received |
| 34 | **GO / NO-GO for DNS cutover** | Migration Lead | 5 min | [ ] | **DECISION POINT -- requires MCK stakeholder approval** |

### T+120 min: DNS Cutover

| # | Step | Owner | Est. Time | Status | Notes |
|---|------|-------|-----------|--------|-------|
| 35 | Update DNS records in Cloudflare to point to Azure Front Door endpoints | Infrastructure | 10 min | [ ] | Update A/CNAME records for all production domains |
| 36 | Verify DNS propagation from multiple geographic regions | Infrastructure | 15 min | [ ] | Check US East, US West, EU, APAC -- must resolve to Azure |
| 37 | Remove maintenance page | Infrastructure | 5 min | [ ] | Azure Front Door should now serve live traffic |
| 38 | Monitor traffic shift in Azure Monitor and Front Door analytics | Infrastructure | 15 min | [ ] | Verify traffic flowing through Azure, not AWS |
| 39 | Verify site accessible via all production URLs (all sites, all languages) | QA | 10 min | [ ] | Test primary and secondary domains |

### T+150 min: Post-Cutover Monitoring

| # | Step | Owner | Est. Time | Status | Notes |
|---|------|-------|-----------|--------|-------|
| 40 | Monitor error rates in Azure Monitor for 30 minutes | Infrastructure | 30 min | [ ] | Error rate must remain below 1% |
| 41 | Verify xConnect analytics/tracking data flowing under live traffic | Sitecore Dev | 10 min | [ ] | Confirm interactions being recorded in xDB |
| 42 | Verify Solr indexing operational under live traffic (new content indexes correctly) | Sitecore Dev | 10 min | [ ] | Publish new item, verify it appears in search results |
| 43 | Send "Cutover Complete" notification to all stakeholders | Migration Lead | 5 min | [ ] | Email + Microsoft Teams |
| 44 | Begin hypercare monitoring period | All | Ongoing | [ ] | 24/7 monitoring for first 72 hours |

---

## Go/No-Go Decision Criteria

### Per-Step Success/Failure Criteria

Each cutover step must pass its success criteria before proceeding. If a step fails, follow the action column.

| Step Group | Success Criteria | Failure Action |
|-----------|-----------------|----------------|
| MI Link Cutover (Steps 12-13) | All databases synced via MI Link, row counts match within 0.1%, no orphaned records, replication completed cleanly | Retry MI Link cutover once. If second attempt fails, rollback to AWS |
| Media Sync (Step 14) | AzCopy incremental sync completes, file counts match source, spot-check media renders correctly | Re-run AzCopy. If persistent failures, proceed with known limitation and schedule post-cutover remediation |
| Application Startup (Steps 15-24) | All roles start within 5 minutes, health endpoints return 200, no critical errors in application logs | Restart failed role. Check connection strings and Key Vault access. After 3 failures on any role, rollback to AWS |
| Unicorn Sync (Step 19) | All Unicorn configurations report "Up to date" or sync successfully with no errors | Investigate serialization conflicts. If unresolvable in 30 minutes, rollback to AWS |
| Smoke Tests (Step 25) | All smoke tests pass -- CM login, CD rendering, publish cycle functional across all sites | Investigate and fix. If unresolvable in 30 minutes, rollback to AWS |
| Search Validation (Step 26) | Solr returns results for standard queries across all 30+ custom indexes; index item counts within 5% of source | Trigger full re-index. If re-index time exceeds remaining window, proceed with known limitation and schedule post-cutover re-index |
| xConnect Validation (Step 28) | Interactions recording to xDB within 60 seconds of page visit; no errors in xConnect logs | Restart xConnect services. Check xConnect connection strings. If unresolvable in 30 minutes, proceed with xConnect disabled and remediate post-cutover |
| Integration Tests (Step 32) | All critical integrations (OneTrust, SiteImprove, Klaviyo, Cognito) responding; no JavaScript console errors | Fix or disable non-critical integrations. Critical failure affecting site functionality, rollback to AWS |
| DNS Cutover (Steps 35-39) | DNS resolves to Azure Front Door endpoints from multiple geographic locations within 30 minutes | Wait for propagation. If still failing after 60 minutes, rollback DNS records to AWS in Cloudflare |

### Go/No-Go Checkpoints

| Checkpoint | Timing | Decision Maker | Go Criteria | No-Go Criteria |
|-----------|--------|----------------|-------------|----------------|
| Pre-cutover | T-60 min | Migration Lead + MCK Stakeholder | All pre-migration checklist items complete; MI Link replication lag < 5s | Any infrastructure or data readiness item incomplete |
| Post-sync | T+60 min | DBA + Migration Lead | Databases consistent on Azure SQL MI; media sync complete; no data corruption | Data integrity issues detected; MI Link cutover failed |
| Post-validation | T+120 min | Migration Lead + MCK Stakeholder | All smoke tests pass; xConnect operational; search functional; performance acceptable | Critical functionality broken; Unicorn sync failures; search not returning results |
| Post-DNS | T+150 min + 30 min | Migration Lead | Error rates below 1%; traffic flowing normally through Azure Front Door; no user-facing errors | Error rate > 5% or traffic not shifting to Azure |

---

## Communication Cadence

### Stakeholder Notifications

| Timing | Audience | Channel | Message |
|--------|----------|---------|---------|
| T-24 hr | All stakeholders | Email | Maintenance window reminder: Saturday 10 PM -- Sunday 10 AM ET. Expected site downtime during cutover. |
| T-1 hr | Technical team | Microsoft Teams | Final go/no-go check-in. All team members confirm availability and readiness. |
| T-0 | All stakeholders | Email + Microsoft Teams | Maintenance started -- site is in maintenance mode. Migration in progress. |
| Every 30 min during cutover | Technical team | Microsoft Teams | Progress update: current step number, completion status, any issues encountered. |
| Every 60 min during cutover | MCK Stakeholder | Email / SMS | Summary status update with expected completion time. |
| Cutover complete | All stakeholders | Email + Microsoft Teams | Migration complete -- MCK sites are now live on Azure. Hypercare monitoring active. |
| If rollback initiated | All stakeholders | Email + Microsoft Teams | Rollback initiated -- site reverting to AWS. Estimated time to restore: 60 minutes. |
| Post-rollback complete | All stakeholders | Email | Rollback complete -- site operational on AWS. Post-mortem meeting to be scheduled within 48 hours. |

---

## Rollback Procedure

### Rollback Triggers

Execute rollback if ANY of the following occur:

- [ ] MI Link database cutover fails or data corruption detected on Azure SQL MI
- [ ] Sitecore CM or CD fails to start on Azure after 3 restart attempts
- [ ] xConnect services fail to connect to Azure SQL MI after 3 attempts
- [ ] Unicorn serialization sync fails with unresolvable errors
- [ ] Critical functionality broken and unfixable within 30 minutes
- [ ] Cumulative delay exceeds 2 hours and remaining steps cannot complete before rollback deadline (Sunday 6:00 AM ET)
- [ ] Migration Lead declares rollback based on professional judgment

### Rollback Steps

| # | Step | Owner | Est. Time | Notes |
|---|------|-------|-----------|-------|
| R1 | **Decision: Declare rollback** -- notify all team members on Microsoft Teams | Migration Lead | 5 min | Document reason for rollback in Issues Log |
| R2 | Stop all Sitecore services on Azure (CM, CD, xConnect, Identity Server) | Sitecore Dev | 10 min | Prevent any data writes to Azure |
| R3 | Revert DNS records in Cloudflare to AWS endpoints | Infrastructure | 10 min | Update A/CNAME records back to AWS targets |
| R4 | Verify DNS propagation resolves to AWS from multiple regions | Infrastructure | 15 min | Confirm US East, US West, EU resolve to AWS |
| R5 | Restart Sitecore services on AWS (CM, CD, xConnect) | Sitecore Dev | 15 min | Start IIS application pools in order: Identity Server, CM, xConnect, CD |
| R6 | Remove maintenance page on AWS | Infrastructure | 5 min | Verify site renders correctly |
| R7 | Verify AWS environment health (smoke tests, search, forms, xConnect) | QA | 15 min | Full smoke test on AWS environment |
| R8 | Re-establish MI Link replication from AWS to Azure (for next attempt) | DBA | 30 min | Only if MI Link was broken during cutover |
| R9 | Send "Rollback Complete" notification to all stakeholders | Migration Lead | 5 min | Include brief reason and next steps |
| R10 | Schedule post-mortem meeting within 48 hours | Migration Lead | -- | Include all team members and MCK stakeholder |

**Estimated total rollback time: 60-90 minutes**

### Point of No Return

The point of no return is when DNS records are switched and traffic begins flowing to Azure (Step 35). Before DNS cutover, rollback is straightforward -- revert to AWS by restarting services and the site resumes operation on the original infrastructure.

After DNS cutover, if issues are found, DNS can still be reverted in Cloudflare, but the following complications apply:

- **Session loss**: Users who established sessions on Azure will lose their session state when traffic shifts back to AWS. Any active shopping carts, form progress, or authenticated sessions will be invalidated.
- **Data reconciliation**: Any data written to Azure SQL MI databases during the transition period (new content edits, form submissions, xDB interactions, user registrations) will need to be manually reconciled with the AWS databases. This may require DBA-assisted data merge operations.
- **Cache warming**: AWS CDN caches (CloudFront) will have been cold during the cutover window. Expect slower initial page loads until caches are warm again.

For these reasons, the DNS cutover decision at Step 34 is the most critical go/no-go checkpoint. All validation must be thoroughly completed before proceeding.

---

## Post-Migration Validation Checklist

### Day 1 (Cutover Day)

#### Core Sitecore Functionality
- [ ] All pages rendering correctly across all sites and languages
- [ ] Content authoring working in Experience Editor (create, edit, save)
- [ ] Content publishing working (CM full publish, incremental publish, smart publish)
- [ ] Published content appearing on CD instances within expected timeframe
- [ ] Media library items loading correctly (images, documents, videos)
- [ ] Image resizing and media cache functioning

#### xConnect and Analytics
- [ ] xConnect Collection service recording interactions from live traffic
- [ ] xConnect Search Indexer processing new interactions
- [ ] Experience Analytics dashboard showing current-day data
- [ ] Contact identification and tracking working (known and anonymous contacts)
- [ ] Path Analyzer functional (if used)

#### Search
- [ ] Solr search returning correct results across all 30+ custom indexes
- [ ] Content search in Content Editor returning results
- [ ] Site search on CD returning relevant results
- [ ] Newly published content appearing in search results after index update
- [ ] Index rebuild operations completing successfully

#### Forms and Email
- [ ] Sitecore Forms rendering correctly on all relevant pages
- [ ] Form submissions saving data to database
- [ ] Form submission confirmation emails sending via SMTP
- [ ] Form data accessible in Sitecore Forms reports

#### Authentication and Sessions
- [ ] Azure AD authentication working for all editor/admin users
- [ ] Role-based content access enforced correctly
- [ ] Visitor authentication (custom membership provider) working
- [ ] Redis session state persisting across CD instances and page loads
- [ ] Session timeout behavior operating correctly (20-minute default)

#### Infrastructure and Integrations
- [ ] Azure Front Door serving traffic correctly for all domains
- [ ] WAF rules on Front Door not blocking legitimate traffic
- [ ] Custom error pages rendering through Front Door
- [ ] OneTrust consent management loading and functional
- [ ] SiteImprove analytics tracking active
- [ ] Klaviyo integration operational
- [ ] Cognito integration operational
- [ ] Azure Key Vault secrets accessible (replacing AWS Secrets Manager)
- [ ] Transactional email delivery functioning via SMTP
- [ ] Performance within acceptable range (page load times comparable to AWS baseline)
- [ ] No unexpected errors in Application Insights or Sitecore logs

### Day 2-3

- [ ] Full regression test suite passed across all sites
- [ ] Performance trending stable (no degradation over time)
- [ ] No memory leaks or resource issues on Azure VMs
- [ ] Azure SQL MI performance metrics within acceptable range
- [ ] Solr heap and query performance stable
- [ ] Redis memory usage stable (no unexpected growth)
- [ ] Azure Backup jobs completing successfully (SQL MI and VM backups)
- [ ] Monitoring alerts verified (trigger test alert, confirm notification chain)
- [ ] xConnect data aggregation processing correctly (if applicable)
- [ ] Content sync from Prod to QA/Dev environments tested (if applicable)
- [ ] CI/CD pipeline (Azure Pipelines) deploys successfully to Azure environment

### Week 1

- [ ] Traffic patterns normal compared to pre-migration baseline
- [ ] No user-reported issues outstanding
- [ ] Azure cost monitoring configured and initial spend reviewed against estimates
- [ ] AWS environment marked for decommission review (do NOT decommission yet)
- [ ] DNS TTL restored to normal values in Cloudflare (3600s or higher)
- [ ] MI Link replication stopped and cleaned up (if no longer needed)
- [ ] Temporary hybrid connectivity (AWS-Azure VPN/endpoints) decommissioned
- [ ] Hypercare team stood down -- transition to normal support operations
- [ ] Post-migration retrospective completed with team and MCK stakeholder
- [ ] Lessons learned documented

### Week 2-4 (AWS Decommission Window)

- [ ] Confirm no residual traffic to AWS infrastructure
- [ ] Final backup of AWS environment taken (archival copy)
- [ ] AWS resource decommission plan approved by MCK
- [ ] CloudFront distributions disabled
- [ ] EC2 instances stopped (do not terminate until sign-off)
- [ ] AWS Reserved Instance commitments reviewed for early termination or transfer

---

## Environment Reference

| Component | AWS (Source) | Azure (Target) |
|-----------|-------------|----------------|
| Compute (CM) | EC2 (Windows Server 2019) | Azure VM (Windows Server 2019/2022) |
| Compute (CD) | EC2 with Auto Scaling Group | Azure VM Scale Set |
| Compute (xConnect) | EC2 (Windows Server 2019) | Azure VM (Windows Server 2019/2022) |
| Database | SQL Server 2019 on EC2 (self-managed) | Azure SQL Managed Instance |
| Search | Solr 8.8+ on EC2 (standalone) | Solr on Azure VM (standalone) |
| Session/Cache | Redis on EC2 (self-managed) | Azure Managed Redis (TLS enabled) |
| CDN/WAF | Amazon CloudFront (~20 distributions) + AWS WAF | Azure Front Door Premium (single profile) + Azure WAF |
| DNS | Cloudflare | Cloudflare (no change -- record updates only) |
| Secrets | AWS Secrets Manager | Azure Key Vault + Managed Identity |
| Monitoring | New Relic (APM + Logs) | Azure Monitor + Application Insights (or New Relic retained) |
| CI/CD | TeamCity (~30 build configs) | Azure Pipelines (source already on Azure DevOps Repos) |
| Source Control | Azure DevOps Repos | Azure DevOps Repos (no change) |
| Item Serialization | Unicorn | Unicorn (validated on Azure VMs) |
| Identity | Azure AD (editor auth) | Azure AD (no change) |
| SMTP | [TBD - Current Provider] | [TBD - Azure-compatible SMTP] |

---

## Key Risks to Monitor During Cutover

The following risks from the migration assessment are most relevant during cutover execution. The full risk register is maintained in the assessment documentation.

| Risk ID | Description | Mitigation During Cutover | Contingency |
|---------|-------------|--------------------------|-------------|
| RISK-001 | 250GB database migration exceeding maintenance window | MI Link provides near-instant cutover after continuous replication | If MI Link cutover fails, rollback to AWS; fall back to backup/restore with extended window |
| RISK-002 | Media stored in SQL DB (~50GB) adding to sync time | Pre-staged via AzCopy incremental sync; final delta only | If media sync fails, proceed without latest media; remediate post-cutover |
| RISK-004 | Unicorn path length issues on Azure | Deploying on Azure VMs (not App Service) to avoid known issues | If Unicorn sync fails on Azure VMs, use database state as-is without re-sync |
| RISK-006 | 30+ custom Solr indexes requiring rebuild validation | Indexes pre-built on Azure; validation during cutover is confirmation only | If index validation fails, trigger full re-index; if time-constrained, proceed with limitation |

---

## Notes & Issues Log

Record all issues, decisions, and notable events during cutover execution.

| Time (ET) | Step # | Category | Description | Resolution | Owner | Duration |
|-----------|--------|----------|-------------|------------|-------|----------|
| | | | | | | |
| | | | | | | |
| | | | | | | |
| | | | | | | |
| | | | | | | |
| | | | | | | |
| | | | | | | |
| | | | | | | |
| | | | | | | |
| | | | | | | |

---

## Sign-Off

### Pre-Cutover Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Migration Lead | | | |
| MCK Stakeholder | | | |

### Post-Cutover Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Migration Lead | | | |
| MCK Stakeholder | | | |
| QA Engineer | | | |

---

*Generated by Migration Planner Plugin v1.0*
*Assessment ID: cb15ed5c-9d1e-4103-ae5a-34b7aab5fb9b*
*Document Date: February 21, 2026*
