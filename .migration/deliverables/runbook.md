# Migration Runbook -- MCK - AWS to Azure

## AWS to Azure Cutover Execution Guide

| Field | Value |
|-------|-------|
| **Client** | MCK |
| **Date** | February 21, 2026 |
| **Cutover Window** | Saturday 22:00 - Sunday 04:00 UTC (6 hours) |
| **Maintenance Window Start** | Saturday 22:00 UTC |
| **Expected Duration** | 4-5 hours |
| **Rollback Deadline** | Sunday 02:30 UTC |

---

## Contacts & Escalation

| Role | Name | Phone | Email | Availability |
|------|------|-------|-------|-------------|
| Migration Lead | [TBD] | [TBD] | [TBD] | On-site |
| Infrastructure Engineer | [TBD] | [TBD] | [TBD] | On-call |
| DBA | [TBD] | [TBD] | [TBD] | On-call |
| Sitecore Developer | [TBD] | [TBD] | [TBD] | On-call |
| Client Stakeholder | [TBD] | [TBD] | [TBD] | On-call |
| Client Network Team (VPN) | [TBD] | [TBD] | [TBD] | On-call |

---

## Pre-Migration Checklist

Complete ALL items before starting cutover.

### Infrastructure Readiness
- [ ] Azure VNets provisioned across 3 environments with 3-tier subnet architecture
- [ ] NSG rules configured and tested (public, app, database tiers)
- [ ] Azure VPN Gateway (VpnGw2) connected and traffic flowing
- [ ] App Service Plans provisioned for CM, CD, xConnect (3 environments)
- [ ] Azure SQL Managed Instance (Business Critical) provisioned per environment
- [ ] Solr 8.8 deployed on AKS with all 30+ custom index configurations validated
- [ ] Azure Managed Redis provisioned on port 10000 with TLS (3 environments)
- [ ] Azure Front Door configured with 20 origin groups (mapped from CloudFront distributions)
- [ ] Azure Application Gateway (WAF_v2) configured per environment
- [ ] SSL wildcard certificate imported to Key Vault and bound to App Services
- [ ] Azure Monitor workspace configured with alerts and dashboards
- [ ] Azure Backup policies configured (RPO: 1h, RTO: 4h)
- [ ] Microsoft Defender for Cloud enabled (Enhanced tier)

### Application Readiness
- [ ] Sitecore CM deployed to App Service and connection strings configured
- [ ] Sitecore CD deployed to App Service with autoscale configured
- [ ] Identity Server deployed and tested (Azure AD for editors, Azure AD B2C for visitors)
- [ ] xConnect deployed on App Service with collection and search indexer roles
- [ ] SMTP relay configured for SendGrid / Azure Communication Services (replacing SES)
- [ ] Azure DevOps Pipelines configured for all ~30 build configurations
- [ ] All AWS SDK references removed from application code (verified by code scan)
- [ ] Azure Key Vault secrets populated (migrated from AWS Secrets Manager)
- [ ] Managed Identity configured for all App Service to Key Vault connections
- [ ] Unicorn serialization files synced to Azure file shares

### Data Readiness
- [ ] MI Link established for continuous replication from RDS to Azure SQL MI
- [ ] MI Link replication lag consistently below 5 seconds for 48+ hours
- [ ] Row counts validated within 0.1% between RDS and SQL MI
- [ ] Collation verified as SQL_Latin1_General_CP1_CI_AS on all SQL MI databases
- [ ] DMA (Database Migration Assistant) assessment completed with no blocking issues
- [ ] Media migration completed (in SQL MI or Azure Blob Storage)
- [ ] DynamoDB data migrated to Azure Managed Redis or Cosmos DB
- [ ] Solr indexes rebuilt on AKS -- item counts within 5% of source for all 30+ indexes
- [ ] Redis session state tested on Azure Managed Redis (port 10000, TLS)

### Validation Complete
- [ ] Smoke tests passed on all 3 Azure environments
- [ ] Full functional regression suite passed on Production Azure environment
- [ ] Integration tests passed (OneTrust, SiteImprove, Klaviyo, SendGrid, Azure AD B2C)
- [ ] Performance load test completed -- response times within 10% of AWS baseline
- [ ] Security vulnerability scan completed -- no critical or high findings
- [ ] UAT sign-off obtained from client stakeholders
- [ ] Backup restore test completed successfully within 4-hour RTO target

### Operational Readiness
- [ ] This runbook reviewed by all team members
- [ ] Rollback procedure rehearsed (at least 1 dry run)
- [ ] Communication plan sent to all stakeholders
- [ ] Maintenance page ready and tested
- [ ] Cloudflare DNS TTL lowered to 300 seconds 48 hours prior to cutover
- [ ] Route 53 DNS records inventoried for migration/consolidation
- [ ] AWS Sitecore services verified as stoppable (no dependencies preventing shutdown)

---

## Cutover Execution Steps

**Environment Order**: Development first (rehearsal), then QA, then Production. This runbook details the Production cutover. Dev and QA follow the same steps with reduced validation.

### T-60 min: Final Preparation
| # | Step | Owner | Est. Time | Status | Notes |
|---|------|-------|-----------|--------|-------|
| 1 | Confirm all team members available and on communication channel | Migration Lead | 5 min | [ ] | Teams / Slack |
| 2 | Verify Azure environment health (App Service, SQL MI, Redis, Solr, Front Door) | Infrastructure | 10 min | [ ] | Check Azure Portal health dashboard |
| 3 | Verify Cloudflare DNS TTL has propagated (should be 300s or lower) | Infrastructure | 5 min | [ ] | `dig +short` from multiple locations |
| 4 | Verify MI Link replication lag is below 5 seconds | DBA | 5 min | [ ] | Check SQL MI monitoring |
| 5 | Take final backup of AWS RDS databases (150 GB, estimated 15 min) | DBA | 15 min | [ ] | Manual RDS snapshot |
| 6 | Confirm go/no-go decision | Migration Lead | 5 min | [ ] | **GO / NO-GO** |

### T-0: Cutover Start
| # | Step | Owner | Est. Time | Status | Notes |
|---|------|-------|-----------|--------|-------|
| 7 | Enable maintenance page on AWS (via CloudFront custom error page) | Infrastructure | 5 min | [ ] | Maintenance page serves from S3 |
| 8 | Stop Sitecore services on AWS (CM, CD, xConnect, Identity Server) | Sitecore Dev | 10 min | [ ] | Stop IIS app pools on all EC2 instances |
| 9 | Wait 2 minutes for MI Link to drain final transactions | DBA | 2 min | [ ] | Allow in-flight writes to complete |
| 10 | Complete MI Link cutover (break link, promote SQL MI to primary) | DBA | 15 min | [ ] | **Critical step**: Breaks replication, SQL MI becomes read-write |
| 11 | Verify database consistency on Azure SQL MI | DBA | 15 min | [ ] | Row counts, spot-check key tables, verify xDB shards |
| 12 | Final media/blob sync to Azure (if using Azure Blob Storage) | Infrastructure | 10 min | [ ] | AzCopy incremental sync |

**Estimated time to complete T-0 block**: 57 minutes

### T+60 min: Application Startup
| # | Step | Owner | Est. Time | Status | Notes |
|---|------|-------|-----------|--------|-------|
| 13 | Start Sitecore Identity Server on Azure App Service | Sitecore Dev | 5 min | [ ] | Verify app pool started |
| 14 | Verify Identity Server health endpoint returns 200 | Sitecore Dev | 5 min | [ ] | `https://identity.{domain}/health` |
| 15 | Start Sitecore CM on Azure App Service | Sitecore Dev | 10 min | [ ] | First start may take 2-3 min for warm-up |
| 16 | Verify CM login and basic functionality (content tree, Experience Editor) | Sitecore Dev | 10 min | [ ] | Login with Azure AD credentials |
| 17 | Start xConnect services on Azure App Service | Sitecore Dev | 5 min | [ ] | Collection + Search Indexer roles |
| 18 | Verify xConnect health endpoint and collection DB connectivity | Sitecore Dev | 5 min | [ ] | Check xConnect logs for errors |
| 19 | Start Sitecore CD instances on Azure App Service (autoscale disabled initially) | Sitecore Dev | 10 min | [ ] | Start with minimum instance count |
| 20 | Verify CD site rendering (homepage, key landing pages, search) | Sitecore Dev | 10 min | [ ] | Check via direct App Service URL (not DNS) |

**Estimated time to complete Application Startup**: 60 minutes

### T+2 hrs: Validation
| # | Step | Owner | Est. Time | Status | Notes |
|---|------|-------|-----------|--------|-------|
| 21 | Run smoke test suite against Azure environment | QA | 15 min | [ ] | CM login, CD rendering, publish, search |
| 22 | Verify Solr search functionality (standard + custom indexes) | Sitecore Dev | 10 min | [ ] | Test queries against 3-5 custom indexes |
| 23 | Verify Sitecore Forms submissions (end-to-end with email) | QA | 5 min | [ ] | Submit test form, verify email delivery via SendGrid |
| 24 | Verify custom integrations (OneTrust, SiteImprove, Klaviyo) | Sitecore Dev | 10 min | [ ] | Client-side JS integrations -- verify loading |
| 25 | Verify Azure AD B2C authentication (visitor login) | Sitecore Dev | 5 min | [ ] | Test login flow replacing Cognito |
| 26 | Test publish workflow (CM to CD, full site publish) | Sitecore Dev | 10 min | [ ] | Publish item, verify on CD |
| 27 | Verify Azure Monitor alerts and Application Insights telemetry | Infrastructure | 5 min | [ ] | Check live metrics stream |
| 28 | Verify Azure Managed Redis session state (port 10000, TLS) | Sitecore Dev | 5 min | [ ] | Login on CD, verify session persists |
| 29 | **GO / NO-GO for DNS cutover** | Migration Lead | 5 min | [ ] | **DECISION POINT** -- all validation must pass |

**Estimated time to complete Validation**: 70 minutes

### T+3 hrs 10 min: DNS Cutover
| # | Step | Owner | Est. Time | Status | Notes |
|---|------|-------|-----------|--------|-------|
| 30 | Update Cloudflare DNS records to Azure Front Door endpoints | Infrastructure | 10 min | [ ] | CNAME records for all production domains |
| 31 | Update/consolidate Route 53 records (if applicable) | Infrastructure | 10 min | [ ] | Migrate remaining zones to Cloudflare or Azure DNS |
| 32 | Verify DNS propagation from multiple geographic locations | Infrastructure | 15 min | [ ] | Use `dig` or DNS checker tools from US, EU, Asia |
| 33 | Remove maintenance page (disable custom error page) | Infrastructure | 5 min | [ ] | Traffic now flowing to Azure |
| 34 | Monitor traffic shift in Azure Monitor and Front Door analytics | Infrastructure | 15 min | [ ] | Verify requests arriving at Azure CD instances |
| 35 | Verify site accessible via all production URLs | QA | 10 min | [ ] | Test 5-10 key pages via browser |
| 36 | Enable CD autoscale on Azure App Service | Infrastructure | 5 min | [ ] | Re-enable autoscale rules |

**Estimated time to complete DNS Cutover**: 70 minutes

### T+4 hrs 20 min: Post-Cutover
| # | Step | Owner | Est. Time | Status | Notes |
|---|------|-------|-----------|--------|-------|
| 37 | Monitor error rates for 30 minutes (target: < 1%) | Infrastructure | 30 min | [ ] | Application Insights failure rate |
| 38 | Verify xConnect analytics data flowing (contact tracking, page events) | Sitecore Dev | 10 min | [ ] | Check xDB collection in SSMS |
| 39 | Verify email delivery (send test email from Sitecore Forms) | QA | 5 min | [ ] | Confirm delivery via SendGrid dashboard |
| 40 | Send cutover complete notification to all stakeholders | Migration Lead | 5 min | [ ] | Email + Teams/Slack |
| 41 | **Declare cutover SUCCESS or initiate ROLLBACK** | Migration Lead | 5 min | [ ] | **FINAL DECISION** |
| 42 | Begin hypercare monitoring (2-week period) | All | Ongoing | [ ] | Daily check-ins Week 1, every other day Week 2 |

**Estimated total cutover time**: 4 hours 55 minutes (within 6-hour window)

---

## Go/No-Go Decision Criteria

### Per-Step Success/Failure Criteria

Each cutover step must pass its success criteria before proceeding. If a step fails, follow the action column.

| Step Group | Success Criteria | Failure Action |
|-----------|-----------------|----------------|
| MI Link Cutover (Steps 10-11) | MI Link broken cleanly, SQL MI promoted to read-write, row counts match within 0.1%, no orphaned records | Retry MI Link cutover once. If second attempt fails or data integrity issues detected, initiate Rollback. |
| Application Startup (Steps 13-20) | All roles start within 5 minutes, health endpoints return 200, no critical errors in App Service logs | Restart failed App Service. Check connection strings and Key Vault access. After 3 failures on same role, initiate Rollback. |
| Smoke Tests (Step 21) | All smoke tests pass (CM login, CD rendering, publish cycle, search returns results) | Investigate root cause. If unresolvable within 90 minutes, initiate Rollback. |
| Search Validation (Step 22) | Search returns results for standard queries, custom index item counts within 5% of source | Trigger Solr re-index on AKS. If re-index time exceeds 60 minutes, proceed with known limitation and re-index post-cutover. |
| Integration Tests (Steps 23-25) | All critical integrations responding. Forms submitting. Azure AD B2C login working. | Fix or disable non-critical integrations. Critical failure (Forms, Auth), initiate Rollback. |
| DNS Cutover (Steps 30-35) | DNS resolves to Azure Front Door from multiple geographic locations within 30 minutes | Wait for propagation. If still failing after 60 minutes, revert DNS to AWS and investigate. |

### Go/No-Go Checkpoints

| Checkpoint | Timing | Decision Maker | Go Criteria | No-Go Criteria |
|-----------|--------|----------------|-------------|----------------|
| Pre-cutover | T-60 min | Migration Lead | All pre-migration checklist items complete; MI Link lag < 5s; all team members available | Any infrastructure or data readiness item incomplete; MI Link lag > 30s |
| Post-sync | T+60 min | DBA + Migration Lead | Databases consistent on SQL MI; row counts verified; no corruption | Data integrity issues detected; MI Link cutover failed |
| Post-validation | T+3 hrs 10 min | Migration Lead + Client | All smoke tests pass; performance acceptable; integrations working | Critical functionality broken; performance degraded > 25% |
| Post-DNS | T+4 hrs 20 min + 30 min | Migration Lead | Error rates below 1%; traffic flowing normally through Azure; no user-impacting issues | Error rate > 5% or traffic not shifting; persistent 5xx errors |

---

## Communication Cadence

### Stakeholder Notifications

| Timing | Audience | Channel | Message |
|--------|----------|---------|---------|
| T-24 hr | All stakeholders | Email | Maintenance window reminder: Saturday 22:00-04:00 UTC. Expected downtime: 4-5 hours. |
| T-1 hr | Technical team | Teams/Slack | Final go/no-go check-in. All team members confirm availability. |
| T-0 | All stakeholders | Email + Teams/Slack | Maintenance started. Site in maintenance mode. Estimated completion: 03:00 UTC. |
| Every 30 min during cutover | Technical team | Teams/Slack | Progress update: current step number, any issues, ETA. |
| Every 60 min during cutover | Client stakeholder | Email / SMS | Summary status update: on track / delayed / issue under investigation. |
| Cutover complete | All stakeholders | Email + Teams/Slack | Migration complete. Site live on Azure. Hypercare monitoring active. |
| If rollback | All stakeholders | Email + Teams/Slack | Rollback initiated. Site reverting to AWS. Expected recovery: 65 minutes. |
| Post-rollback complete | All stakeholders | Email | Rollback complete. Site operational on AWS. Post-mortem scheduled within 48 hours. |

### Escalation Path
1. **Level 1** -- Technical team resolves within step time estimate
2. **Level 2** -- Migration Lead notified if step exceeds 2x time estimate
3. **Level 3** -- Client Stakeholder notified if cumulative delay exceeds 30 minutes
4. **Level 4** -- Executive escalation if rollback is triggered

---

## Rollback Procedure

### Rollback Triggers
Execute rollback if ANY of the following occur:
- [ ] MI Link cutover fails or data corruption detected on Azure SQL MI
- [ ] Sitecore CM or CD fails to start on Azure after 3 restart attempts
- [ ] Critical functionality broken and unfixable within 90 minutes
- [ ] Cumulative delay exceeds 3 hours and remaining steps cannot complete before rollback deadline (02:30 UTC)
- [ ] Migration Lead declares rollback

### Rollback Steps
| # | Step | Owner | Est. Time | Notes |
|---|------|-------|-----------|-------|
| R1 | Decision: Declare rollback | Migration Lead | 5 min | Announce on Teams/Slack + phone |
| R2 | Revert Cloudflare DNS records to AWS endpoints | Infrastructure | 10 min | Restore original CNAME/A records |
| R3 | Verify DNS propagation to AWS | Infrastructure | 15 min | Confirm from multiple locations |
| R4 | Restart Sitecore services on AWS (CM, CD, xConnect, Identity Server) | Sitecore Dev | 15 min | Start IIS app pools on all EC2 instances |
| R5 | Verify AWS environment health (smoke tests) | QA | 15 min | CM login, CD rendering, search, forms |
| R6 | Send rollback notification to all stakeholders | Migration Lead | 5 min | Email + Teams/Slack |
| R7 | Schedule post-mortem within 48 hours | Migration Lead | -- | Include root cause analysis |

**Estimated rollback time**: 65 minutes from decision to site operational on AWS.

**Important**: AWS Sitecore services must NOT be decommissioned before rollback window expires. Keep all EC2 instances, RDS, and supporting services running (but idle) until Migration Lead declares rollback window closed (2 weeks post-cutover).

### Point of No Return
The point of no return occurs when **content changes are made on the Azure CM after DNS cutover**. Once content authors begin editing content in the Azure environment, rolling back to AWS would result in content loss for any changes made after cutover.

During the cutover window, content editing will be disabled (CM set to read-only mode) until the Migration Lead declares cutover success -- approximately 30 minutes after DNS propagation is verified and error rates are confirmed below 1%.

After the 2-week hypercare period, AWS resources will be scheduled for decommissioning, making rollback infeasible.

---

## Post-Migration Validation Checklist

### Day 1 (Cutover Day)
- [ ] All pages rendering correctly on production URLs
- [ ] Content authoring working (create, edit, publish via CM)
- [ ] Search returning correct results (standard + all 30+ custom indexes)
- [ ] Sitecore Forms submitting successfully with email delivery via SendGrid
- [ ] User login/authentication working (Azure AD for editors, Azure AD B2C for visitors)
- [ ] xConnect analytics data being collected (contacts, interactions, page events)
- [ ] Transactional email delivery functioning (verify SendGrid delivery reports)
- [ ] OneTrust, SiteImprove, and Klaviyo integrations loading on page
- [ ] Azure Managed Redis session state working (port 10000, TLS) -- verify cross-CD session persistence
- [ ] Performance within 10% of AWS baseline (check Application Insights response times)
- [ ] No unexpected errors in App Service logs or Application Insights exceptions
- [ ] Azure Monitor alerts verified (trigger test alert, confirm notification delivery)

### Day 2-3
- [ ] Full regression test suite passed on Production Azure environment
- [ ] Performance trending stable (no degradation over 24-48 hours)
- [ ] No memory leaks or App Service restarts
- [ ] Azure Backup jobs completing successfully (check Recovery Services vault)
- [ ] SQL MI automated backups running (verify in Azure Portal)
- [ ] xConnect contact aggregation processing correctly
- [ ] Solr index rebuild completed successfully (if triggered)
- [ ] Azure DevOps Pipelines: execute test deployment to dev environment

### Week 1
- [ ] Traffic patterns normal (compare Azure Front Door analytics to historical CloudFront data)
- [ ] No user-reported issues
- [ ] AWS environment verified as idle (no traffic, services stopped but available)
- [ ] Cloudflare DNS TTL restored to normal values (3600s)
- [ ] All monitoring dashboards populated with 7 days of data
- [ ] Knowledge transfer session 1 completed (Azure Portal, pipelines, monitoring)
- [ ] Hypercare team operating within defined SLAs (4-hour response)

### Week 2
- [ ] Knowledge transfer session 2 completed (backup/DR, IaC, incident response)
- [ ] Client team able to perform basic operations independently
- [ ] AWS decommissioning plan reviewed and approved
- [ ] Hypercare team stood down
- [ ] Migration declared complete by Migration Lead and Client Stakeholder

---

## Environment-Specific Notes

### Database Details (150 GB)
- **MI Link cutover time**: Estimated 30-45 minutes for final delta sync after continuous replication
- **Database count**: 12 databases (Core, Master, Web, Reporting, Experience Forms, Marketing Automation, Processing Pools, Processing Tasks, Reference Data, xDB Collection Shard 0, xDB Collection Shard 1, Shard Map Manager)
- **Largest databases**: xDB Collection Shards (10-200 GB each), Master (5-100 GB), Web (5-100 GB)
- **Collation**: SQL_Latin1_General_CP1_CI_AS (must match on SQL MI)

### Azure Managed Redis (Port 10000)
- **Important**: Azure Cache for Redis Premium tier is blocked for new instances as of October 2026
- **Service**: Azure Managed Redis (next-generation)
- **Port**: 10000 (not 6380)
- **TLS**: Required (non-negotiable)
- **Connection string format**: `redis-mck-prod.redis.cache.windows.net:10000,password=...,ssl=True,abortConnect=False`
- **Sitecore config files to update**:
  - `App_Config/ConnectionStrings.config` (session state provider)
  - Custom Redis configuration patches (if any)

### Three-Environment Cutover Sequence

| Environment | Cutover Window | Validation Level | Rollback Window |
|-------------|---------------|------------------|-----------------|
| Development | Week 10 (weekday) | Smoke tests only (8 hours) | 48 hours |
| QA | Week 11 (weekday) | Functional + integration (16 hours) | 1 week |
| Production | Week 12 (weekend) | Full validation (40 hours) | 2 weeks |

Development and QA cutovers serve as rehearsals for the Production cutover. Lessons learned from each are incorporated into subsequent runbook revisions.

---

## Notes & Issues Log

| Time | Category | Description | Resolution | Owner |
|------|----------|-------------|------------|-------|
| | | | | |
| | | | | |
| | | | | |
| | | | | |
| | | | | |

---

*Generated by Migration Planner Plugin v2.0*
*Assessment ID: cb15ed5c-9d1e-4103-ae5a-34b7aab5fb9b*
