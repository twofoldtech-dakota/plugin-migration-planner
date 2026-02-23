# Migration Runbook — {{PROJECT_NAME}}

## AWS to Azure Cutover Execution Guide

| Field | Value |
|-------|-------|
| **Client** | {{CLIENT_NAME}} |
| **Date** | {{DATE}} |
| **Cutover Window** | {{CUTOVER_WINDOW}} |
| **Maintenance Window Start** | {{MAINTENANCE_START}} |
| **Expected Duration** | {{CUTOVER_DURATION}} |
| **Rollback Deadline** | {{ROLLBACK_DEADLINE}} |

---

## Contacts & Escalation

| Role | Name | Phone | Email | Availability |
|------|------|-------|-------|-------------|
| Migration Lead | {{LEAD_NAME}} | {{LEAD_PHONE}} | {{LEAD_EMAIL}} | On-site |
| Infrastructure | {{INFRA_NAME}} | {{INFRA_PHONE}} | {{INFRA_EMAIL}} | On-call |
| DBA | {{DBA_NAME}} | {{DBA_PHONE}} | {{DBA_EMAIL}} | On-call |
| Sitecore Dev | {{DEV_NAME}} | {{DEV_PHONE}} | {{DEV_EMAIL}} | On-call |
| Client Stakeholder | {{CLIENT_NAME}} | {{CLIENT_PHONE}} | {{CLIENT_EMAIL}} | On-call |

---

## Pre-Migration Checklist

Complete ALL items before starting cutover.

### Infrastructure Readiness
- [ ] Azure VNet and subnets provisioned and validated
- [ ] NSG rules configured and tested
- [ ] VMs provisioned with correct sizing and disk configuration
- [ ] Azure SQL MI / SQL VMs provisioned
- [ ] Solr cluster deployed and accessible
- [ ] Azure Cache for Redis provisioned with SSL
- [ ] Application Gateway / Front Door configured
- [ ] SSL certificates uploaded to Key Vault
- [ ] Monitoring and alerting configured
- [ ] Backup policies configured

### Application Readiness
- [ ] Sitecore roles deployed to all VMs
- [ ] Connection strings updated for Azure targets
- [ ] Identity Server deployed and tested
- [ ] xConnect deployed and tested (if applicable)
- [ ] SMTP relay configured and tested for transactional email
- [ ] CI/CD pipelines updated for Azure targets
- [ ] All custom integrations tested against Azure endpoints

### Data Readiness
- [ ] Initial bulk data migration completed
- [ ] Delta sync mechanism tested
- [ ] Media migration completed or staged
- [ ] Solr indexes rebuilt on Azure
- [ ] xDB shard migration validated (if applicable)

### Validation Complete
- [ ] Smoke tests passed on Azure environment
- [ ] Functional test suite passed
- [ ] Performance baseline established
- [ ] Load test completed and within acceptable range
- [ ] Security scan completed
- [ ] UAT sign-off obtained

### Operational Readiness
- [ ] Runbook reviewed by all team members
- [ ] Rollback procedure tested
- [ ] Communication plan sent to stakeholders
- [ ] Maintenance page ready
- [ ] DNS TTL lowered 24-48 hours prior (to 300s or lower)

---

## Cutover Execution Steps

### T-60 min: Final Preparation
| # | Step | Owner | Est. Time | Status | Notes |
|---|------|-------|-----------|--------|-------|
| 1 | Confirm all team members available | Migration Lead | 5 min | [ ] | |
| 2 | Verify Azure environment health | Infrastructure | 10 min | [ ] | |
| 3 | Verify DNS TTL has propagated (should be low) | Infrastructure | 5 min | [ ] | |
| 4 | Take final backup of AWS databases | DBA | 15 min | [ ] | |
| 5 | Confirm go/no-go decision | Migration Lead | 5 min | [ ] | **GO / NO-GO** |

### T-0: Cutover Start
| # | Step | Owner | Est. Time | Status | Notes |
|---|------|-------|-----------|--------|-------|
| 6 | Enable maintenance page on AWS | Infrastructure | 5 min | [ ] | |
| 7 | Stop Sitecore services on AWS (CM, CD, xConnect) | Sitecore Dev | 10 min | [ ] | |
| 8 | Final database delta sync to Azure | DBA | {{DB_SYNC_TIME}} | [ ] | |
| 9 | Verify database consistency on Azure | DBA | 15 min | [ ] | |
| 10 | Final media/blob sync to Azure | Infrastructure | {{BLOB_SYNC_TIME}} | [ ] | |

### T+{{DB_SYNC_OFFSET}}: Application Startup
| # | Step | Owner | Est. Time | Status | Notes |
|---|------|-------|-----------|--------|-------|
| 11 | Start Sitecore Identity Server on Azure | Sitecore Dev | 5 min | [ ] | |
| 12 | Verify Identity Server health | Sitecore Dev | 5 min | [ ] | |
| 13 | Start Sitecore CM on Azure | Sitecore Dev | 10 min | [ ] | |
| 14 | Verify CM login and basic functionality | Sitecore Dev | 10 min | [ ] | |
| 15 | Start xConnect services on Azure | Sitecore Dev | 5 min | [ ] | |
| 16 | Verify xConnect health | Sitecore Dev | 5 min | [ ] | |
| 17 | Start Sitecore CD instances on Azure | Sitecore Dev | 10 min | [ ] | |
| 18 | Verify CD site rendering | Sitecore Dev | 10 min | [ ] | |

### T+{{APP_STARTUP_OFFSET}}: Validation
| # | Step | Owner | Est. Time | Status | Notes |
|---|------|-------|-----------|--------|-------|
| 19 | Run smoke test suite | QA | 15 min | [ ] | |
| 20 | Verify search functionality | Sitecore Dev | 10 min | [ ] | |
| 21 | Verify form submissions | QA | 5 min | [ ] | |
| 22 | Verify custom integrations | Sitecore Dev | 15 min | [ ] | |
| 23 | Test publish workflow (CM → CD) | Sitecore Dev | 10 min | [ ] | |
| 24 | Verify monitoring and alerts firing | Infrastructure | 5 min | [ ] | |
| 25 | **GO / NO-GO for DNS cutover** | Migration Lead | 5 min | [ ] | **DECISION POINT** |

### T+{{VALIDATION_OFFSET}}: DNS Cutover
| # | Step | Owner | Est. Time | Status | Notes |
|---|------|-------|-----------|--------|-------|
| 26 | Update DNS records to Azure endpoints | Infrastructure | 10 min | [ ] | |
| 27 | Verify DNS propagation (multiple regions) | Infrastructure | 15 min | [ ] | |
| 28 | Remove maintenance page | Infrastructure | 5 min | [ ] | |
| 29 | Monitor traffic shift in Azure Monitor | Infrastructure | 15 min | [ ] | |
| 30 | Verify site accessible via production URLs | QA | 10 min | [ ] | |

### T+{{CUTOVER_COMPLETE}}: Post-Cutover
| # | Step | Owner | Est. Time | Status | Notes |
|---|------|-------|-----------|--------|-------|
| 31 | Monitor error rates for 30 minutes | Infrastructure | 30 min | [ ] | |
| 32 | Verify analytics/tracking data flowing | Sitecore Dev | 10 min | [ ] | |
| 33 | Send cutover complete notification | Migration Lead | 5 min | [ ] | |
| 34 | Begin hypercare monitoring | All | Ongoing | [ ] | |

---

## Go/No-Go Decision Criteria

### Per-Step Success/Failure Criteria

Each cutover step must pass its success criteria before proceeding. If a step fails, follow the action column.

| Step Group | Success Criteria | Failure Action |
|-----------|-----------------|----------------|
| Database Sync (Steps 8-9) | All databases synced, row counts match within 0.1%, no orphaned records | Retry sync once. If second attempt fails → Rollback |
| Application Startup (Steps 11-18) | All roles start within 5 minutes, health endpoints return 200, no critical errors in logs | Restart failed role. After 3 failures → Rollback |
| Smoke Tests (Step 19) | All smoke tests pass (CM login, CD rendering, publish cycle) | Investigate and fix. If unresolvable in {{MAX_FIX_TIME}} → Rollback |
| Search Validation (Step 20) | Search returns results for standard queries, index item counts within 5% of source | Trigger re-index. If re-index time exceeds window → Proceed with known limitation |
| Integration Tests (Step 22) | All critical integrations responding, data flowing correctly | Fix or disable non-critical integrations. Critical failure → Rollback |
| DNS Cutover (Steps 26-30) | DNS resolves to Azure endpoints from multiple geographic locations within 30 min | Wait for propagation. If still failing after 60 min → Rollback DNS |

### Go/No-Go Checkpoints

| Checkpoint | Timing | Decision Maker | Go Criteria | No-Go Criteria |
|-----------|--------|----------------|-------------|----------------|
| Pre-cutover | T-60 min | Migration Lead | All pre-migration checklist items complete | Any infrastructure or data readiness item incomplete |
| Post-sync | T+{{DB_SYNC_OFFSET}} | DBA + Migration Lead | Databases consistent, no corruption | Data integrity issues detected |
| Post-validation | T+{{VALIDATION_OFFSET}} | Migration Lead + Client | All smoke tests pass, performance acceptable | Critical functionality broken |
| Post-DNS | T+{{CUTOVER_COMPLETE}} + 30 min | Migration Lead | Error rates below threshold, traffic flowing normally | Error rate > 5% or traffic not shifting |

---

## Communication Cadence

### Stakeholder Notifications

| Timing | Audience | Channel | Message |
|--------|----------|---------|---------|
| T-24 hr | All stakeholders | Email | Maintenance window reminder with expected downtime |
| T-1 hr | Technical team | {{COMMS_CHANNEL}} | Final go/no-go check-in |
| T-0 | All stakeholders | Email + {{COMMS_CHANNEL}} | Maintenance started — site in maintenance mode |
| Every 30 min during cutover | Technical team | {{COMMS_CHANNEL}} | Progress update: current step, any issues |
| Every 60 min during cutover | Client stakeholder | Email / SMS | Summary status update |
| Cutover complete | All stakeholders | Email + {{COMMS_CHANNEL}} | Migration complete — site live on Azure |
| If rollback | All stakeholders | Email + {{COMMS_CHANNEL}} | Rollback initiated — site reverting to AWS |
| Post-rollback complete | All stakeholders | Email | Rollback complete — site operational on AWS. Post-mortem to follow. |

### Escalation Path
1. **Level 1** — Technical team resolves within step time estimate
2. **Level 2** — Migration Lead notified if step exceeds 2x time estimate
3. **Level 3** — Client Stakeholder notified if cumulative delay exceeds 30 minutes
4. **Level 4** — Executive escalation if rollback is triggered

---

## Rollback Procedure

### Rollback Triggers
Execute rollback if ANY of the following occur:
- [ ] Database migration fails or data corruption detected
- [ ] Sitecore CM or CD fails to start after 3 attempts
- [ ] Critical functionality broken and unfixable within {{MAX_FIX_TIME}}
- [ ] Cumulative delay exceeds {{MAX_CUMULATIVE_DELAY}} and remaining steps cannot complete before rollback deadline
- [ ] Migration Lead declares rollback

### Rollback Steps
| # | Step | Owner | Est. Time | Notes |
|---|------|-------|-----------|-------|
| R1 | Decision: Declare rollback | Migration Lead | 5 min | |
| R2 | Revert DNS records to AWS endpoints | Infrastructure | 10 min | |
| R3 | Verify DNS propagation | Infrastructure | 15 min | |
| R4 | Restart Sitecore services on AWS | Sitecore Dev | 15 min | |
| R5 | Verify AWS environment health | QA | 15 min | |
| R6 | Send rollback notification | Migration Lead | 5 min | |
| R7 | Schedule post-mortem | Migration Lead | — | |

### Point of No Return
{{POINT_OF_NO_RETURN_DESCRIPTION}}

---

## Post-Migration Validation Checklist

### Day 1
- [ ] All pages rendering correctly
- [ ] Content authoring working (create, edit, publish)
- [ ] Search returning correct results
- [ ] Forms submitting successfully
- [ ] User login/authentication working
- [ ] Analytics data being collected
- [ ] Transactional email delivery functioning (SMTP)
- [ ] Custom integrations operational
- [ ] Performance within acceptable range
- [ ] No unexpected errors in logs

### Day 2-3
- [ ] Full regression test suite passed
- [ ] Performance trending stable
- [ ] No memory leaks or resource issues
- [ ] Backup jobs completing successfully
- [ ] Monitoring alerts verified (trigger test alert)

### Week 1
- [ ] Traffic patterns normal
- [ ] No user-reported issues
- [ ] AWS environment marked for decommission review
- [ ] DNS TTL restored to normal values
- [ ] Hypercare team stood down

---

## Notes & Issues Log

| Time | Category | Description | Resolution | Owner |
|------|----------|-------------|------------|-------|
| | | | | |

---

*Generated by Migration Planner Plugin v1.0*
*Assessment ID: {{ASSESSMENT_ID}}*
