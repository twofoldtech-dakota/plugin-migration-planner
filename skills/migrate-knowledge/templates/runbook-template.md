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
- [ ] EXM configured with new dispatch settings (if applicable)
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

## Rollback Procedure

### Rollback Triggers
Execute rollback if ANY of the following occur:
- [ ] Database migration fails or data corruption detected
- [ ] Sitecore CM or CD fails to start after 3 attempts
- [ ] Critical functionality broken and unfixable within {{MAX_FIX_TIME}}
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
- [ ] Email dispatch functioning (if EXM)
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
