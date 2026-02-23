#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# seed-e2e.sh — E2E seed script for Migration Planner Plugin v2.0
#
# Seeds a complete .migration/ directory with realistic Sitecore XP 10.3 + EXM
# assessment data, processes templates, and opens the dashboard.
#
# Usage:  bash test/seed-e2e.sh          (from repo root)
#         bash test/seed-e2e.sh --no-open (skip browser open)
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MIG="$REPO_ROOT/.migration"
TEMPLATES="$REPO_ROOT/skills/migrate-knowledge/templates"
AI_JSON="$REPO_ROOT/skills/migrate-knowledge/heuristics/ai-alternatives.json"

# --- Constants ---
PROJECT_NAME="Contoso Global Web Platform"
CLIENT_NAME="Contoso Ltd."
ARCHITECT_NAME="Dakota Smith"
ASSESSMENT_ID="assess-e2e-$(date +%Y%m%d)"
DATE_NOW="$(date +%Y-%m-%d)"
SITECORE_VERSION="10.3"
TOPOLOGY="xp_exm"

NO_OPEN=false
[[ "${1:-}" == "--no-open" ]] && NO_OPEN=true

echo "=== Migration Planner E2E Seed ==="
echo "Project:    $PROJECT_NAME"
echo "Client:     $CLIENT_NAME"
echo "Assessment: $ASSESSMENT_ID"
echo ""

# --- Directory scaffold ---
rm -rf "$MIG"
mkdir -p "$MIG/discovery" "$MIG/deliverables" "$MIG/calibration" "$MIG/comparisons"

# ============================================================
# 1. assessment.json
# ============================================================
write_assessment() {
cat > "$MIG/assessment.json" << 'EOF'
{
  "id": "ASSESSMENT_ID_PLACEHOLDER",
  "project_name": "Contoso Global Web Platform",
  "client_name": "Contoso Ltd.",
  "architect": "Dakota Smith",
  "created": "DATE_PLACEHOLDER",
  "updated": "DATE_PLACEHOLDER",
  "sitecore_version": "10.3",
  "topology": "xp_exm",
  "status": "planning",
  "source_cloud": "aws",
  "target_cloud": "azure",
  "target_timeline": "Q2 2026",
  "environment_count": 3,
  "environments": ["dev", "staging", "production"]
}
EOF
sed -i '' "s/ASSESSMENT_ID_PLACEHOLDER/$ASSESSMENT_ID/g" "$MIG/assessment.json"
sed -i '' "s/DATE_PLACEHOLDER/$DATE_NOW/g" "$MIG/assessment.json"
echo "  [ok] assessment.json"
}

# ============================================================
# 2. discovery/compute.json
# ============================================================
write_discovery_compute() {
cat > "$MIG/discovery/compute.json" << 'EOF'
{
  "dimension": "compute",
  "status": "complete",
  "last_updated": "DATE_PLACEHOLDER",
  "answers": {
    "hosting_platform": { "value": "EC2", "confidence": "confirmed" },
    "cm_count": { "value": 1, "confidence": "confirmed" },
    "cm_instance_type": { "value": "m5.xlarge", "confidence": "confirmed" },
    "cd_count": { "value": 4, "confidence": "confirmed" },
    "cd_instance_type": { "value": "m5.large", "confidence": "confirmed" },
    "cd_autoscale": { "value": true, "confidence": "confirmed", "max_instances": 6 },
    "xconnect_count": { "value": 2, "confidence": "confirmed" },
    "xconnect_instance_type": { "value": "m5.large", "confidence": "confirmed" },
    "processing_count": { "value": 1, "confidence": "confirmed" },
    "processing_instance_type": { "value": "m5.large", "confidence": "confirmed" },
    "identity_count": { "value": 1, "confidence": "confirmed" },
    "identity_instance_type": { "value": "t3.medium", "confidence": "confirmed" },
    "load_balancer": { "value": "ALB", "confidence": "confirmed" },
    "os_version": { "value": "Windows Server 2019", "confidence": "confirmed" }
  }
}
EOF
sed -i '' "s/DATE_PLACEHOLDER/$DATE_NOW/g" "$MIG/discovery/compute.json"
echo "  [ok] discovery/compute.json"
}

# ============================================================
# 3. discovery/database.json
# ============================================================
write_discovery_database() {
cat > "$MIG/discovery/database.json" << 'EOF'
{
  "dimension": "database",
  "status": "complete",
  "last_updated": "DATE_PLACEHOLDER",
  "answers": {
    "engine": { "value": "SQL Server 2019 Enterprise", "confidence": "confirmed" },
    "hosting": { "value": "RDS", "confidence": "confirmed" },
    "multi_az": { "value": true, "confidence": "confirmed" },
    "database_count": { "value": 11, "confidence": "confirmed" },
    "total_size_gb": { "value": 120, "confidence": "assumed", "basis": "CloudWatch storage metrics, not exact" },
    "largest_db_gb": { "value": 45, "confidence": "assumed", "basis": "Estimated xDB collection" },
    "collation": { "value": "SQL_Latin1_General_CP1_CI_AS", "confidence": "assumed", "basis": "Sitecore default assumed" },
    "custom_schemas": { "value": false, "confidence": "assumed" },
    "databases": [
      "Sitecore_Core", "Sitecore_Master", "Sitecore_Web",
      "Sitecore_ExperienceForms", "Sitecore_EXM_Master",
      "Sitecore_MarketingAutomation", "Sitecore_Processing_Pools",
      "Sitecore_Processing_Tasks", "Sitecore_ReferenceData",
      "Sitecore_Xdb_Collection", "Sitecore_Xdb_Collection_Shard1"
    ]
  }
}
EOF
sed -i '' "s/DATE_PLACEHOLDER/$DATE_NOW/g" "$MIG/discovery/database.json"
echo "  [ok] discovery/database.json"
}

# ============================================================
# 4. discovery/search.json
# ============================================================
write_discovery_search() {
cat > "$MIG/discovery/search.json" << 'EOF'
{
  "dimension": "search",
  "status": "complete",
  "last_updated": "DATE_PLACEHOLDER",
  "answers": {
    "provider": { "value": "SolrCloud", "confidence": "confirmed" },
    "version": { "value": "8.11", "confidence": "confirmed" },
    "node_count": { "value": 2, "confidence": "confirmed" },
    "node_instance_type": { "value": "m5.large", "confidence": "confirmed" },
    "zookeeper_count": { "value": 3, "confidence": "confirmed" },
    "custom_indexes": { "value": 3, "confidence": "assumed", "basis": "Client mentioned 3, names unconfirmed" },
    "index_names": { "value": ["product_catalog", "knowledge_base", "store_locator"], "confidence": "assumed" },
    "total_index_size_gb": { "value": 15, "confidence": "assumed" }
  }
}
EOF
sed -i '' "s/DATE_PLACEHOLDER/$DATE_NOW/g" "$MIG/discovery/search.json"
echo "  [ok] discovery/search.json"
}

# ============================================================
# 5. discovery/caching.json
# ============================================================
write_discovery_caching() {
cat > "$MIG/discovery/caching.json" << 'EOF'
{
  "dimension": "caching",
  "status": "complete",
  "last_updated": "DATE_PLACEHOLDER",
  "answers": {
    "provider": { "value": "ElastiCache Redis", "confidence": "confirmed" },
    "node_type": { "value": "r6g.large", "confidence": "confirmed" },
    "node_count": { "value": 2, "confidence": "confirmed" },
    "cluster_mode": { "value": false, "confidence": "confirmed" },
    "eviction_policy": { "value": "unknown", "confidence": "unknown", "basis": "Not disclosed" },
    "used_for_session": { "value": true, "confidence": "confirmed" },
    "ssl_in_transit": { "value": true, "confidence": "confirmed" }
  }
}
EOF
sed -i '' "s/DATE_PLACEHOLDER/$DATE_NOW/g" "$MIG/discovery/caching.json"
echo "  [ok] discovery/caching.json"
}

# ============================================================
# 6. discovery/cdn.json
# ============================================================
write_discovery_cdn() {
cat > "$MIG/discovery/cdn.json" << 'EOF'
{
  "dimension": "cdn",
  "status": "complete",
  "last_updated": "DATE_PLACEHOLDER",
  "answers": {
    "provider": { "value": "CloudFront", "confidence": "confirmed" },
    "distribution_count": { "value": 2, "confidence": "confirmed" },
    "waf_enabled": { "value": true, "confidence": "confirmed" },
    "custom_origins": { "value": ["www.contoso.com", "media.contoso.com"], "confidence": "confirmed" },
    "caching_behavior": { "value": "Default + media path overrides", "confidence": "confirmed" }
  }
}
EOF
sed -i '' "s/DATE_PLACEHOLDER/$DATE_NOW/g" "$MIG/discovery/cdn.json"
echo "  [ok] discovery/cdn.json"
}

# ============================================================
# 7. discovery/dns.json
# ============================================================
write_discovery_dns() {
cat > "$MIG/discovery/dns.json" << 'EOF'
{
  "dimension": "dns",
  "status": "complete",
  "last_updated": "DATE_PLACEHOLDER",
  "answers": {
    "provider": { "value": "Route 53", "confidence": "confirmed" },
    "zone_count": { "value": 3, "confidence": "confirmed" },
    "zones": { "value": ["contoso.com", "contoso-cms.com", "contoso-cdn.com"], "confidence": "confirmed" },
    "record_count": { "value": 42, "confidence": "confirmed" }
  }
}
EOF
sed -i '' "s/DATE_PLACEHOLDER/$DATE_NOW/g" "$MIG/discovery/dns.json"
echo "  [ok] discovery/dns.json"
}

# ============================================================
# 8. discovery/ssl.json
# ============================================================
write_discovery_ssl() {
cat > "$MIG/discovery/ssl.json" << 'EOF'
{
  "dimension": "ssl",
  "status": "complete",
  "last_updated": "DATE_PLACEHOLDER",
  "answers": {
    "certificate_provider": { "value": "ACM", "confidence": "confirmed" },
    "certificate_count": { "value": 3, "confidence": "confirmed" },
    "domains": { "value": ["*.contoso.com", "*.contoso-cms.com", "*.contoso-cdn.com"], "confidence": "confirmed" },
    "auto_renewal": { "value": true, "confidence": "confirmed" }
  }
}
EOF
sed -i '' "s/DATE_PLACEHOLDER/$DATE_NOW/g" "$MIG/discovery/ssl.json"
echo "  [ok] discovery/ssl.json"
}

# ============================================================
# 9. discovery/storage.json
# ============================================================
write_discovery_storage() {
cat > "$MIG/discovery/storage.json" << 'EOF'
{
  "dimension": "storage",
  "status": "complete",
  "last_updated": "DATE_PLACEHOLDER",
  "answers": {
    "provider": { "value": "S3", "confidence": "confirmed" },
    "bucket_count": { "value": 2, "confidence": "confirmed" },
    "buckets": { "value": ["contoso-media-prod", "contoso-media-assets"], "confidence": "confirmed" },
    "total_size_gb": { "value": 75, "confidence": "confirmed" },
    "blob_provider_module": { "value": "unknown", "confidence": "unknown", "basis": "Custom module or standard Sitecore provider unclear" },
    "versioning_enabled": { "value": true, "confidence": "confirmed" }
  }
}
EOF
sed -i '' "s/DATE_PLACEHOLDER/$DATE_NOW/g" "$MIG/discovery/storage.json"
echo "  [ok] discovery/storage.json"
}

# ============================================================
# 10. discovery/email.json
# ============================================================
write_discovery_email() {
cat > "$MIG/discovery/email.json" << 'EOF'
{
  "dimension": "email",
  "status": "complete",
  "last_updated": "DATE_PLACEHOLDER",
  "answers": {
    "exm_enabled": { "value": true, "confidence": "confirmed" },
    "dispatch_provider": { "value": "SendGrid", "confidence": "confirmed" },
    "dedicated_ips": { "value": 2, "confidence": "confirmed" },
    "monthly_volume": { "value": 200000, "confidence": "assumed", "basis": "Client estimate, not from SendGrid analytics" },
    "ip_warmup_needed": { "value": true, "confidence": "confirmed" },
    "custom_templates": { "value": true, "confidence": "confirmed" },
    "bounce_handling": { "value": "SendGrid webhooks", "confidence": "confirmed" }
  }
}
EOF
sed -i '' "s/DATE_PLACEHOLDER/$DATE_NOW/g" "$MIG/discovery/email.json"
echo "  [ok] discovery/email.json"
}

# ============================================================
# 11. discovery/xconnect.json
# ============================================================
write_discovery_xconnect() {
cat > "$MIG/discovery/xconnect.json" << 'EOF'
{
  "dimension": "xconnect",
  "status": "complete",
  "last_updated": "DATE_PLACEHOLDER",
  "answers": {
    "xconnect_enabled": { "value": true, "confidence": "confirmed" },
    "collection_db_shards": { "value": 2, "confidence": "confirmed" },
    "estimated_contacts": { "value": "500K-2M", "confidence": "assumed", "basis": "Range given by client, not verified" },
    "custom_facets": { "value": "suspected", "confidence": "assumed", "basis": "Client mentioned loyalty data in xDB, unconfirmed schema" },
    "xdb_rebuild_needed": { "value": "likely", "confidence": "assumed" }
  }
}
EOF
sed -i '' "s/DATE_PLACEHOLDER/$DATE_NOW/g" "$MIG/discovery/xconnect.json"
echo "  [ok] discovery/xconnect.json"
}

# ============================================================
# 12. discovery/identity.json
# ============================================================
write_discovery_identity() {
cat > "$MIG/discovery/identity.json" << 'EOF'
{
  "dimension": "identity",
  "status": "complete",
  "last_updated": "DATE_PLACEHOLDER",
  "answers": {
    "identity_server": { "value": true, "confidence": "confirmed" },
    "hosting": { "value": "EC2 t3.medium", "confidence": "confirmed" },
    "custom_providers": { "value": false, "confidence": "confirmed" },
    "sso_integration": { "value": "Azure AD (staff only)", "confidence": "confirmed" }
  }
}
EOF
sed -i '' "s/DATE_PLACEHOLDER/$DATE_NOW/g" "$MIG/discovery/identity.json"
echo "  [ok] discovery/identity.json"
}

# ============================================================
# 13. discovery/session.json
# ============================================================
write_discovery_session() {
cat > "$MIG/discovery/session.json" << 'EOF'
{
  "dimension": "session",
  "status": "complete",
  "last_updated": "DATE_PLACEHOLDER",
  "answers": {
    "session_provider": { "value": "Redis", "confidence": "confirmed" },
    "sticky_sessions": { "value": true, "confidence": "confirmed" },
    "session_timeout_min": { "value": 20, "confidence": "confirmed" }
  }
}
EOF
sed -i '' "s/DATE_PLACEHOLDER/$DATE_NOW/g" "$MIG/discovery/session.json"
echo "  [ok] discovery/session.json"
}

# ============================================================
# 14. discovery/integrations.json
# ============================================================
write_discovery_integrations() {
cat > "$MIG/discovery/integrations.json" << 'EOF'
{
  "dimension": "integrations",
  "status": "complete",
  "last_updated": "DATE_PLACEHOLDER",
  "answers": {
    "integration_count": { "value": 3, "confidence": "confirmed" },
    "integrations": [
      {
        "name": "Salesforce CRM",
        "type": "REST API",
        "direction": "bidirectional",
        "aws_sdk_usage": { "value": "unknown", "confidence": "unknown" },
        "confidence": "confirmed"
      },
      {
        "name": "Akeneo PIM",
        "type": "REST API + scheduled sync",
        "direction": "inbound",
        "aws_sdk_usage": { "value": "unknown", "confidence": "unknown" },
        "confidence": "confirmed"
      },
      {
        "name": "Bynder DAM",
        "type": "Sitecore connector module",
        "direction": "inbound",
        "aws_sdk_usage": { "value": "unknown", "confidence": "unknown" },
        "confidence": "confirmed"
      }
    ]
  }
}
EOF
sed -i '' "s/DATE_PLACEHOLDER/$DATE_NOW/g" "$MIG/discovery/integrations.json"
echo "  [ok] discovery/integrations.json"
}

# ============================================================
# 15. discovery/cicd.json
# ============================================================
write_discovery_cicd() {
cat > "$MIG/discovery/cicd.json" << 'EOF'
{
  "dimension": "cicd",
  "status": "complete",
  "last_updated": "DATE_PLACEHOLDER",
  "answers": {
    "platform": { "value": "Jenkins", "confidence": "confirmed" },
    "pipeline_count": { "value": 2, "confidence": "confirmed" },
    "pipelines": { "value": ["CI Build + Deploy to Dev/Staging", "Production Release Pipeline"], "confidence": "confirmed" },
    "artifact_storage": { "value": "S3", "confidence": "confirmed" },
    "pipeline_complexity": { "value": "moderate", "confidence": "assumed", "basis": "2 pipelines, but internal steps not reviewed" }
  }
}
EOF
sed -i '' "s/DATE_PLACEHOLDER/$DATE_NOW/g" "$MIG/discovery/cicd.json"
echo "  [ok] discovery/cicd.json"
}

# ============================================================
# 16. discovery/monitoring.json
# ============================================================
write_discovery_monitoring() {
cat > "$MIG/discovery/monitoring.json" << 'EOF'
{
  "dimension": "monitoring",
  "status": "complete",
  "last_updated": "DATE_PLACEHOLDER",
  "answers": {
    "primary_tool": { "value": "CloudWatch", "confidence": "confirmed" },
    "secondary_tool": { "value": "Datadog", "confidence": "confirmed" },
    "custom_dashboards": { "value": "unknown", "confidence": "unknown", "basis": "Not disclosed" },
    "alerting": { "value": "CloudWatch Alarms + Datadog monitors", "confidence": "confirmed" },
    "log_aggregation": { "value": "CloudWatch Logs + Datadog", "confidence": "confirmed" }
  }
}
EOF
sed -i '' "s/DATE_PLACEHOLDER/$DATE_NOW/g" "$MIG/discovery/monitoring.json"
echo "  [ok] discovery/monitoring.json"
}

# ============================================================
# 17. discovery/networking.json
# ============================================================
write_discovery_networking() {
cat > "$MIG/discovery/networking.json" << 'EOF'
{
  "dimension": "networking",
  "status": "complete",
  "last_updated": "DATE_PLACEHOLDER",
  "answers": {
    "vpc_count": { "value": 1, "confidence": "confirmed" },
    "subnet_count": { "value": 6, "confidence": "confirmed" },
    "vpn_site_to_site": { "value": true, "confidence": "confirmed" },
    "vpn_throughput": { "value": "unknown", "confidence": "unknown", "basis": "Not disclosed" },
    "vpn_destination": { "value": "On-premises data center", "confidence": "confirmed" },
    "security_groups": { "value": 12, "confidence": "confirmed" },
    "nat_gateway": { "value": true, "confidence": "confirmed" }
  }
}
EOF
sed -i '' "s/DATE_PLACEHOLDER/$DATE_NOW/g" "$MIG/discovery/networking.json"
echo "  [ok] discovery/networking.json"
}

# ============================================================
# 18. discovery/backup_dr.json
# ============================================================
write_discovery_backup_dr() {
cat > "$MIG/discovery/backup_dr.json" << 'EOF'
{
  "dimension": "backup_dr",
  "status": "complete",
  "last_updated": "DATE_PLACEHOLDER",
  "answers": {
    "backup_provider": { "value": "AWS Backup", "confidence": "confirmed" },
    "rpo_hours": { "value": 4, "confidence": "confirmed" },
    "rto_hours": { "value": 8, "confidence": "confirmed" },
    "dr_region": { "value": "us-west-2 (secondary)", "confidence": "confirmed" },
    "db_backup_retention_days": { "value": 30, "confidence": "confirmed" }
  }
}
EOF
sed -i '' "s/DATE_PLACEHOLDER/$DATE_NOW/g" "$MIG/discovery/backup_dr.json"
echo "  [ok] discovery/backup_dr.json"
}

# ============================================================
# 19. analysis.json
# ============================================================
write_analysis() {
cat > "$MIG/analysis.json" << 'EOF'
{
  "id": "ASSESSMENT_ID_PLACEHOLDER",
  "generated": "DATE_PLACEHOLDER",
  "version": "2.0.0",
  "risks": [
    {
      "id": "RISK-001",
      "category": "data",
      "description": "xDB shard migration complexity — 2 shards with 500K-2M contacts requires careful sequencing and validation of collection data integrity",
      "likelihood": "high",
      "impact": "high",
      "severity": "critical",
      "estimated_hours_impact": 24,
      "linked_assumptions": ["ASMP-002", "ASMP-012"],
      "mitigation": "Run test migration of collection shard to Azure SQL MI in dev environment first; validate contact counts and facet data",
      "contingency": "Fall back to backup restore if shard migration fails; extend cutover window by 4 hours",
      "owner": "DBA",
      "status": "open"
    },
    {
      "id": "RISK-002",
      "category": "email",
      "description": "EXM IP warming period of 4-6 weeks required for 2 new dedicated IPs to reach full send reputation at 200K/month volume",
      "likelihood": "high",
      "impact": "high",
      "severity": "critical",
      "estimated_hours_impact": 40,
      "linked_assumptions": ["ASMP-004"],
      "mitigation": "Start IP warmup 6 weeks before cutover; use SendGrid automated warmup; monitor deliverability daily",
      "contingency": "Temporarily route through existing SendGrid IPs during transition; accept lower deliverability for 2 weeks",
      "owner": "Sitecore Developer",
      "status": "open"
    },
    {
      "id": "RISK-003",
      "category": "data",
      "description": "120GB database migration window may exceed maintenance window if delta sync volume is high",
      "likelihood": "medium",
      "impact": "high",
      "severity": "high",
      "estimated_hours_impact": 16,
      "linked_assumptions": ["ASMP-001", "ASMP-009"],
      "mitigation": "Perform bulk migration pre-cutover; limit cutover to delta sync only; test delta sync timing in staging",
      "contingency": "Extend maintenance window or split migration across two windows",
      "owner": "DBA",
      "status": "open"
    },
    {
      "id": "RISK-004",
      "category": "infrastructure",
      "description": "VPN site-to-site from on-premises to Azure must be established before decommissioning AWS VPN; throughput requirements unknown",
      "likelihood": "medium",
      "impact": "high",
      "severity": "high",
      "estimated_hours_impact": 12,
      "linked_assumptions": ["ASMP-006"],
      "mitigation": "Provision Azure VPN Gateway early in Phase 1; test throughput with synthetic load",
      "contingency": "Use ExpressRoute if VPN throughput insufficient; temporary dual-VPN during transition",
      "owner": "Infrastructure Engineer",
      "status": "open"
    },
    {
      "id": "RISK-005",
      "category": "application",
      "description": "3 custom integrations (Salesforce, Akeneo, Bynder) may use AWS SDK internally; cloud-specific code requires refactoring",
      "likelihood": "medium",
      "impact": "medium",
      "severity": "medium",
      "estimated_hours_impact": 8,
      "linked_assumptions": ["ASMP-005"],
      "mitigation": "Audit integration code for AWS SDK dependencies in Phase 1; create refactoring backlog",
      "contingency": "Wrap AWS SDK calls in abstraction layer rather than full rewrite",
      "owner": "Sitecore Developer",
      "status": "open"
    },
    {
      "id": "RISK-006",
      "category": "infrastructure",
      "description": "Solr custom index migration — 3 custom indexes need schema recreation and full reindex on Azure target",
      "likelihood": "medium",
      "impact": "medium",
      "severity": "medium",
      "estimated_hours_impact": 8,
      "linked_assumptions": ["ASMP-003"],
      "mitigation": "Export Solr schemas early; rebuild indexes in dev first; estimate reindex time for 15GB of index data",
      "contingency": "Rebuild indexes from Sitecore master database if schema export fails",
      "owner": "Sitecore Developer",
      "status": "open"
    },
    {
      "id": "RISK-007",
      "category": "infrastructure",
      "description": "S3 blob provider module compatibility — unknown whether custom or standard provider is in use; Azure Blob requires different provider",
      "likelihood": "low",
      "impact": "medium",
      "severity": "medium",
      "estimated_hours_impact": 6,
      "linked_assumptions": ["ASMP-007"],
      "mitigation": "Identify blob provider module in Sitecore config during analysis; test Azure Blob provider in dev",
      "contingency": "Use community Azure Blob provider if custom provider is incompatible",
      "owner": "Sitecore Developer",
      "status": "open"
    },
    {
      "id": "RISK-008",
      "category": "operational",
      "description": "Jenkins to Azure DevOps / GitHub Actions pipeline migration requires full rebuild; pipeline complexity not fully assessed",
      "likelihood": "medium",
      "impact": "low",
      "severity": "medium",
      "estimated_hours_impact": 6,
      "linked_assumptions": ["ASMP-010"],
      "mitigation": "Document existing Jenkins pipeline steps; map to Azure DevOps YAML; build and test in parallel",
      "contingency": "Keep Jenkins temporarily and only migrate CI/CD post-cutover",
      "owner": "Infrastructure Engineer",
      "status": "open"
    }
  ],
  "active_multipliers": [
    { "id": "multi_cd", "name": "Multiple CD Instances", "factor": 1.3, "trigger": "cd_count >= 3", "affected_components": ["networking_vnet", "compute_single_role", "cdn_setup", "testing_validation"] },
    { "id": "xdb_large", "name": "Large xDB Collection", "factor": 1.5, "trigger": "estimated_contacts > 500K", "affected_components": ["database_single", "xconnect_xdb"] },
    { "id": "ha_db", "name": "HA Database (Multi-AZ)", "factor": 1.4, "trigger": "multi_az == true", "affected_components": ["database_single"] },
    { "id": "multi_env", "name": "Multiple Environments", "factor": 1.3, "trigger": "environment_count >= 3", "affected_components": ["networking_vnet", "compute_single_role", "database_single", "cicd_pipeline", "monitoring_setup"] },
    { "id": "custom_indexes", "name": "Custom Solr Indexes", "factor": 1.3, "trigger": "custom_indexes >= 1", "affected_components": ["solr_cloud"] },
    { "id": "large_media", "name": "Large Media Library", "factor": 1.3, "trigger": "total_size_gb >= 50", "affected_components": ["blob_storage"] },
    { "id": "exm_high_vol", "name": "High EXM Volume", "factor": 1.3, "trigger": "monthly_volume >= 100K", "affected_components": ["exm_dispatch"] },
    { "id": "vpn", "name": "VPN Site-to-Site", "factor": 1.3, "trigger": "vpn_site_to_site == true", "affected_components": ["networking_vnet"] }
  ],
  "dependency_chains": [
    { "from": "networking_vnet", "to": ["compute_single_role", "database_single", "redis_session"], "type": "hard" },
    { "from": "identity_server", "to": ["compute_single_role"], "type": "hard" },
    { "from": "database_single", "to": ["xconnect_xdb", "exm_dispatch"], "type": "hard" },
    { "from": "compute_single_role", "to": ["testing_validation", "monitoring_setup"], "type": "soft" },
    { "from": "solr_cloud", "to": ["compute_single_role"], "type": "hard" }
  ],
  "risk_clusters": [
    {
      "name": "Data Integrity",
      "risks": ["RISK-001", "RISK-003"],
      "assumptions": ["ASMP-001", "ASMP-002", "ASMP-009", "ASMP-012"],
      "combined_widening_hours": 40
    },
    {
      "name": "Email Deliverability",
      "risks": ["RISK-002"],
      "assumptions": ["ASMP-004"],
      "combined_widening_hours": 12
    },
    {
      "name": "Network & Connectivity",
      "risks": ["RISK-004"],
      "assumptions": ["ASMP-006"],
      "combined_widening_hours": 8
    }
  ],
  "gaps": {
    "unknown_answers": 7,
    "assumed_answers": 11,
    "confirmed_answers": 34,
    "total_answers": 52,
    "top_gaps": [
      { "dimension": "integrations", "question": "AWS SDK usage in integrations", "impact": "May require code refactoring" },
      { "dimension": "networking", "question": "VPN throughput requirements", "impact": "May need ExpressRoute" },
      { "dimension": "storage", "question": "Blob provider module type", "impact": "May need provider swap" },
      { "dimension": "caching", "question": "Redis eviction policy", "impact": "Session behavior may differ" },
      { "dimension": "monitoring", "question": "Custom dashboard count", "impact": "Recreation effort unknown" }
    ]
  }
}
EOF
sed -i '' "s/ASSESSMENT_ID_PLACEHOLDER/$ASSESSMENT_ID/g" "$MIG/analysis.json"
sed -i '' "s/DATE_PLACEHOLDER/$DATE_NOW/g" "$MIG/analysis.json"
echo "  [ok] analysis.json"
}

# ============================================================
# 20. assumptions-registry.json
# ============================================================
write_assumptions() {
cat > "$MIG/assumptions-registry.json" << 'EOF'
{
  "id": "ASSESSMENT_ID_PLACEHOLDER",
  "generated": "DATE_PLACEHOLDER",
  "version": "2.0.0",
  "summary": {
    "total_assumptions": 12,
    "validated": 0,
    "unvalidated": 12,
    "confirmed_answers": 34,
    "confidence_score": 68
  },
  "assumptions": [
    {
      "id": "ASMP-001",
      "dimension": "database",
      "assumed_value": "Total database size ~120GB",
      "basis": "CloudWatch storage metrics observed, but not exact export measurement",
      "confidence": "assumed",
      "validation_status": "unvalidated",
      "validation_method": "Run sp_spaceused on each database; sum actual data + log sizes",
      "pessimistic_widening_hours": 12,
      "affected_components": ["database_single"],
      "created": "DATE_PLACEHOLDER"
    },
    {
      "id": "ASMP-002",
      "dimension": "xconnect",
      "assumed_value": "Contact count between 500K and 2M",
      "basis": "Client verbal estimate; no xDB analytics export reviewed",
      "confidence": "assumed",
      "validation_status": "unvalidated",
      "validation_method": "Query xDB collection database: SELECT COUNT(*) FROM Contacts",
      "pessimistic_widening_hours": 8,
      "affected_components": ["xconnect_xdb", "database_single"],
      "created": "DATE_PLACEHOLDER"
    },
    {
      "id": "ASMP-003",
      "dimension": "search",
      "assumed_value": "3 custom Solr indexes (product_catalog, knowledge_base, store_locator)",
      "basis": "Client mentioned 3 custom indexes; names and schemas not confirmed",
      "confidence": "assumed",
      "validation_status": "unvalidated",
      "validation_method": "List Solr collections via API: /solr/admin/collections?action=LIST",
      "pessimistic_widening_hours": 6,
      "affected_components": ["solr_cloud"],
      "created": "DATE_PLACEHOLDER"
    },
    {
      "id": "ASMP-004",
      "dimension": "email",
      "assumed_value": "~200K emails/month with 2 dedicated IPs",
      "basis": "Client estimate; not verified via SendGrid analytics dashboard",
      "confidence": "assumed",
      "validation_status": "unvalidated",
      "validation_method": "Export SendGrid activity feed; verify 90-day send volume and IP usage",
      "pessimistic_widening_hours": 12,
      "affected_components": ["exm_dispatch"],
      "created": "DATE_PLACEHOLDER"
    },
    {
      "id": "ASMP-005",
      "dimension": "integrations",
      "assumed_value": "AWS SDK usage in integrations unknown",
      "basis": "Integration endpoints confirmed, but underlying code not reviewed",
      "confidence": "unknown",
      "validation_status": "unvalidated",
      "validation_method": "Code review: grep for AWSSDK, Amazon.*, boto3 in solution",
      "pessimistic_widening_hours": 10,
      "affected_components": ["custom_integration"],
      "created": "DATE_PLACEHOLDER"
    },
    {
      "id": "ASMP-006",
      "dimension": "networking",
      "assumed_value": "VPN throughput requirements unknown",
      "basis": "Site-to-site VPN confirmed, but bandwidth and latency needs not disclosed",
      "confidence": "unknown",
      "validation_status": "unvalidated",
      "validation_method": "Review VPN monitoring metrics in CloudWatch; interview network team",
      "pessimistic_widening_hours": 8,
      "affected_components": ["networking_vnet"],
      "created": "DATE_PLACEHOLDER"
    },
    {
      "id": "ASMP-007",
      "dimension": "storage",
      "assumed_value": "Blob provider module type unknown",
      "basis": "S3 storage confirmed, but Sitecore blob provider module (standard vs custom) not identified",
      "confidence": "unknown",
      "validation_status": "unvalidated",
      "validation_method": "Check Sitecore config: App_Config/Include for blob provider patch files",
      "pessimistic_widening_hours": 6,
      "affected_components": ["blob_storage"],
      "created": "DATE_PLACEHOLDER"
    },
    {
      "id": "ASMP-008",
      "dimension": "caching",
      "assumed_value": "Redis eviction policy unknown",
      "basis": "ElastiCache Redis confirmed, but eviction policy not disclosed",
      "confidence": "unknown",
      "validation_status": "unvalidated",
      "validation_method": "Check ElastiCache parameter group: maxmemory-policy setting",
      "pessimistic_widening_hours": 4,
      "affected_components": ["redis_session"],
      "created": "DATE_PLACEHOLDER"
    },
    {
      "id": "ASMP-009",
      "dimension": "database",
      "assumed_value": "Database collation is SQL_Latin1_General_CP1_CI_AS (Sitecore default)",
      "basis": "Assumed Sitecore default; not verified on RDS instance",
      "confidence": "assumed",
      "validation_status": "unvalidated",
      "validation_method": "Query: SELECT DATABASEPROPERTYEX(db, 'Collation') for each Sitecore DB",
      "pessimistic_widening_hours": 8,
      "affected_components": ["database_single"],
      "created": "DATE_PLACEHOLDER"
    },
    {
      "id": "ASMP-010",
      "dimension": "cicd",
      "assumed_value": "Pipeline complexity is moderate (2 pipelines)",
      "basis": "Pipeline count confirmed; internal steps, plugins, and custom scripts not reviewed",
      "confidence": "assumed",
      "validation_status": "unvalidated",
      "validation_method": "Export Jenkinsfile / pipeline configs; review stage count and plugin dependencies",
      "pessimistic_widening_hours": 6,
      "affected_components": ["cicd_pipeline"],
      "created": "DATE_PLACEHOLDER"
    },
    {
      "id": "ASMP-011",
      "dimension": "monitoring",
      "assumed_value": "Custom dashboard count unknown",
      "basis": "CloudWatch + Datadog confirmed, but custom dashboards not inventoried",
      "confidence": "unknown",
      "validation_status": "unvalidated",
      "validation_method": "List Datadog dashboards via API; count CloudWatch custom dashboards",
      "pessimistic_widening_hours": 4,
      "affected_components": ["monitoring_setup"],
      "created": "DATE_PLACEHOLDER"
    },
    {
      "id": "ASMP-012",
      "dimension": "xconnect",
      "assumed_value": "Custom xDB facets unconfirmed (loyalty data suspected)",
      "basis": "Client mentioned loyalty data in xDB; custom facet schema not reviewed",
      "confidence": "assumed",
      "validation_status": "unvalidated",
      "validation_method": "Review Sitecore xDB model config: check for custom FacetKey registrations",
      "pessimistic_widening_hours": 12,
      "affected_components": ["xconnect_xdb", "database_single"],
      "created": "DATE_PLACEHOLDER"
    }
  ]
}
EOF
sed -i '' "s/ASSESSMENT_ID_PLACEHOLDER/$ASSESSMENT_ID/g" "$MIG/assumptions-registry.json"
sed -i '' "s/DATE_PLACEHOLDER/$DATE_NOW/g" "$MIG/assumptions-registry.json"
echo "  [ok] assumptions-registry.json"
}

# ============================================================
# 21. estimate.json
# ============================================================
write_estimate() {
cat > "$MIG/estimate.json" << 'EOF'
{
  "id": "ASSESSMENT_ID_PLACEHOLDER",
  "generated": "DATE_PLACEHOLDER",
  "version": "2.0.0",
  "confidence_score": 68,
  "total_base_hours": 592,
  "total_gotcha_hours": 84,
  "total_expected_hours": 1046,
  "assumption_widening_hours": 96,
  "phases": [
    {
      "id": "phase_1_infrastructure",
      "name": "Phase 1: Infrastructure Foundation",
      "duration": "3-4 weeks",
      "components": [
        {
          "id": "networking_vnet",
          "name": "Networking & VNet",
          "units": 1,
          "base_hours": 16,
          "multipliers_applied": ["multi_cd", "vpn", "multi_env"],
          "gotcha_hours": 0,
          "final_hours": 35,
          "firm_hours": 28,
          "assumption_dependent_hours": 7,
          "assumptions_affecting": ["ASMP-006"],
          "hours": {
            "without_ai": { "optimistic": 28, "expected": 35, "pessimistic": 46 }
          },
          "ai_alternatives": [
            { "id": "terraform_opentofu", "hours_saved": { "optimistic": 6, "expected": 4, "pessimistic": 2 } },
            { "id": "azure_network_watcher", "hours_saved": { "optimistic": 4, "expected": 3, "pessimistic": 1 } },
            { "id": "azure_migrate", "hours_saved": { "optimistic": 3, "expected": 2, "pessimistic": 1 } }
          ],
          "by_role": { "infrastructure_engineer": 30, "project_manager": 5 }
        },
        {
          "id": "compute_single_role",
          "name": "Compute (5 roles)",
          "units": 5,
          "base_hours": 80,
          "multipliers_applied": ["multi_cd", "multi_env"],
          "gotcha_hours": 0,
          "final_hours": 135,
          "firm_hours": 135,
          "assumption_dependent_hours": 0,
          "assumptions_affecting": [],
          "hours": {
            "without_ai": { "optimistic": 108, "expected": 135, "pessimistic": 176 }
          },
          "ai_alternatives": [
            { "id": "terraform_opentofu", "hours_saved": { "optimistic": 10, "expected": 7, "pessimistic": 3 } },
            { "id": "azure_migrate", "hours_saved": { "optimistic": 5, "expected": 3, "pessimistic": 1 } }
          ],
          "by_role": { "infrastructure_engineer": 110, "sitecore_developer": 15, "project_manager": 10 }
        },
        {
          "id": "ssl_tls",
          "name": "SSL/TLS Certificates",
          "units": 3,
          "base_hours": 12,
          "multipliers_applied": [],
          "gotcha_hours": 0,
          "final_hours": 12,
          "firm_hours": 12,
          "assumption_dependent_hours": 0,
          "assumptions_affecting": [],
          "hours": {
            "without_ai": { "optimistic": 10, "expected": 12, "pessimistic": 16 }
          },
          "ai_alternatives": [],
          "by_role": { "infrastructure_engineer": 12 }
        },
        {
          "id": "cdn_setup",
          "name": "CDN & WAF Setup",
          "units": 2,
          "base_hours": 16,
          "multipliers_applied": ["multi_cd"],
          "gotcha_hours": 0,
          "final_hours": 21,
          "firm_hours": 21,
          "assumption_dependent_hours": 0,
          "assumptions_affecting": [],
          "hours": {
            "without_ai": { "optimistic": 17, "expected": 21, "pessimistic": 27 }
          },
          "ai_alternatives": [
            { "id": "terraform_opentofu", "hours_saved": { "optimistic": 3, "expected": 2, "pessimistic": 1 } }
          ],
          "by_role": { "infrastructure_engineer": 18, "qa_engineer": 3 }
        }
      ]
    },
    {
      "id": "phase_2_data",
      "name": "Phase 2: Data Migration",
      "duration": "2-3 weeks",
      "components": [
        {
          "id": "database_single",
          "name": "Database Migration (11 DBs)",
          "units": 11,
          "base_hours": 132,
          "multipliers_applied": ["xdb_large", "ha_db", "multi_env"],
          "gotcha_hours": 20,
          "final_hours": 380,
          "firm_hours": 340,
          "assumption_dependent_hours": 40,
          "assumptions_affecting": ["ASMP-001", "ASMP-002", "ASMP-009"],
          "hours": {
            "without_ai": { "optimistic": 304, "expected": 380, "pessimistic": 494 }
          },
          "ai_alternatives": [
            { "id": "azure_dms", "hours_saved": { "optimistic": 8, "expected": 5, "pessimistic": 3 } },
            { "id": "dma", "hours_saved": { "optimistic": 4, "expected": 3, "pessimistic": 1 } }
          ],
          "by_role": { "dba": 280, "infrastructure_engineer": 60, "sitecore_developer": 20, "project_manager": 20 }
        },
        {
          "id": "blob_storage",
          "name": "Blob Storage Migration",
          "units": 2,
          "base_hours": 24,
          "multipliers_applied": ["large_media"],
          "gotcha_hours": 0,
          "final_hours": 31,
          "firm_hours": 25,
          "assumption_dependent_hours": 6,
          "assumptions_affecting": ["ASMP-007"],
          "hours": {
            "without_ai": { "optimistic": 25, "expected": 31, "pessimistic": 40 }
          },
          "ai_alternatives": [
            { "id": "azcopy", "hours_saved": { "optimistic": 6, "expected": 4, "pessimistic": 2 } }
          ],
          "by_role": { "infrastructure_engineer": 20, "sitecore_developer": 11 }
        }
      ]
    },
    {
      "id": "phase_3_application",
      "name": "Phase 3: Application & Services",
      "duration": "3-4 weeks",
      "components": [
        {
          "id": "solr_cloud",
          "name": "SolrCloud Migration",
          "units": 1,
          "base_hours": 40,
          "multipliers_applied": ["custom_indexes"],
          "gotcha_hours": 0,
          "final_hours": 52,
          "firm_hours": 46,
          "assumption_dependent_hours": 6,
          "assumptions_affecting": ["ASMP-003"],
          "hours": {
            "without_ai": { "optimistic": 42, "expected": 52, "pessimistic": 68 }
          },
          "ai_alternatives": [],
          "by_role": { "infrastructure_engineer": 30, "sitecore_developer": 22 }
        },
        {
          "id": "redis_session",
          "name": "Redis & Session State",
          "units": 1,
          "base_hours": 8,
          "multipliers_applied": [],
          "gotcha_hours": 4,
          "final_hours": 12,
          "firm_hours": 8,
          "assumption_dependent_hours": 4,
          "assumptions_affecting": ["ASMP-008"],
          "hours": {
            "without_ai": { "optimistic": 10, "expected": 12, "pessimistic": 16 }
          },
          "ai_alternatives": [
            { "id": "terraform_opentofu", "hours_saved": { "optimistic": 2, "expected": 1, "pessimistic": 0 } }
          ],
          "by_role": { "infrastructure_engineer": 8, "sitecore_developer": 4 }
        },
        {
          "id": "identity_server",
          "name": "Identity Server",
          "units": 1,
          "base_hours": 8,
          "multipliers_applied": [],
          "gotcha_hours": 0,
          "final_hours": 8,
          "firm_hours": 8,
          "assumption_dependent_hours": 0,
          "assumptions_affecting": [],
          "hours": {
            "without_ai": { "optimistic": 6, "expected": 8, "pessimistic": 10 }
          },
          "ai_alternatives": [],
          "by_role": { "sitecore_developer": 8 }
        },
        {
          "id": "xconnect_xdb",
          "name": "xConnect & xDB",
          "units": 1,
          "base_hours": 24,
          "multipliers_applied": ["xdb_large"],
          "gotcha_hours": 12,
          "final_hours": 48,
          "firm_hours": 36,
          "assumption_dependent_hours": 12,
          "assumptions_affecting": ["ASMP-002", "ASMP-012"],
          "hours": {
            "without_ai": { "optimistic": 38, "expected": 48, "pessimistic": 62 }
          },
          "ai_alternatives": [],
          "by_role": { "sitecore_developer": 30, "dba": 18 }
        },
        {
          "id": "exm_dispatch",
          "name": "EXM & Email Dispatch",
          "units": 1,
          "base_hours": 20,
          "multipliers_applied": ["exm_high_vol"],
          "gotcha_hours": 40,
          "final_hours": 66,
          "firm_hours": 54,
          "assumption_dependent_hours": 12,
          "assumptions_affecting": ["ASMP-004"],
          "hours": {
            "without_ai": { "optimistic": 53, "expected": 66, "pessimistic": 86 }
          },
          "ai_alternatives": [
            { "id": "sendgrid_ip_warmup", "hours_saved": { "optimistic": 16, "expected": 10, "pessimistic": 4 } }
          ],
          "by_role": { "sitecore_developer": 46, "infrastructure_engineer": 12, "qa_engineer": 8 }
        },
        {
          "id": "custom_integration",
          "name": "Custom Integrations (3)",
          "units": 3,
          "base_hours": 48,
          "multipliers_applied": [],
          "gotcha_hours": 8,
          "final_hours": 56,
          "firm_hours": 46,
          "assumption_dependent_hours": 10,
          "assumptions_affecting": ["ASMP-005"],
          "hours": {
            "without_ai": { "optimistic": 45, "expected": 56, "pessimistic": 73 }
          },
          "ai_alternatives": [
            { "id": "github_copilot", "hours_saved": { "optimistic": 8, "expected": 5, "pessimistic": 2 } },
            { "id": "claude_code", "hours_saved": { "optimistic": 6, "expected": 4, "pessimistic": 2 } }
          ],
          "by_role": { "sitecore_developer": 46, "qa_engineer": 10 }
        },
        {
          "id": "cicd_pipeline",
          "name": "CI/CD Pipeline Rebuild",
          "units": 2,
          "base_hours": 32,
          "multipliers_applied": ["multi_env"],
          "gotcha_hours": 0,
          "final_hours": 42,
          "firm_hours": 36,
          "assumption_dependent_hours": 6,
          "assumptions_affecting": ["ASMP-010"],
          "hours": {
            "without_ai": { "optimistic": 34, "expected": 42, "pessimistic": 55 }
          },
          "ai_alternatives": [
            { "id": "github_copilot", "hours_saved": { "optimistic": 4, "expected": 3, "pessimistic": 1 } },
            { "id": "claude_code", "hours_saved": { "optimistic": 4, "expected": 3, "pessimistic": 1 } }
          ],
          "by_role": { "infrastructure_engineer": 30, "sitecore_developer": 12 }
        },
        {
          "id": "monitoring_setup",
          "name": "Monitoring & Alerting",
          "units": 1,
          "base_hours": 12,
          "multipliers_applied": ["multi_env"],
          "gotcha_hours": 0,
          "final_hours": 16,
          "firm_hours": 12,
          "assumption_dependent_hours": 4,
          "assumptions_affecting": ["ASMP-011"],
          "hours": {
            "without_ai": { "optimistic": 13, "expected": 16, "pessimistic": 21 }
          },
          "ai_alternatives": [
            { "id": "azure_monitor_ai", "hours_saved": { "optimistic": 4, "expected": 3, "pessimistic": 1 } },
            { "id": "app_insights_smart", "hours_saved": { "optimistic": 2, "expected": 1, "pessimistic": 0 } }
          ],
          "by_role": { "infrastructure_engineer": 12, "sitecore_developer": 4 }
        }
      ]
    },
    {
      "id": "phase_4_validation",
      "name": "Phase 4: Validation & Testing",
      "duration": "2-3 weeks",
      "components": [
        {
          "id": "testing_validation",
          "name": "Testing & Validation",
          "units": 1,
          "base_hours": 40,
          "multipliers_applied": ["multi_cd"],
          "gotcha_hours": 0,
          "final_hours": 52,
          "firm_hours": 52,
          "assumption_dependent_hours": 0,
          "assumptions_affecting": [],
          "hours": {
            "without_ai": { "optimistic": 42, "expected": 52, "pessimistic": 68 }
          },
          "ai_alternatives": [
            { "id": "playwright_ai_testgen", "hours_saved": { "optimistic": 12, "expected": 8, "pessimistic": 3 } },
            { "id": "k6_performance", "hours_saved": { "optimistic": 8, "expected": 5, "pessimistic": 2 } }
          ],
          "by_role": { "qa_engineer": 36, "sitecore_developer": 10, "infrastructure_engineer": 6 }
        },
        {
          "id": "backup_dr",
          "name": "Backup & DR Setup",
          "units": 1,
          "base_hours": 12,
          "multipliers_applied": [],
          "gotcha_hours": 0,
          "final_hours": 12,
          "firm_hours": 12,
          "assumption_dependent_hours": 0,
          "assumptions_affecting": [],
          "hours": {
            "without_ai": { "optimistic": 10, "expected": 12, "pessimistic": 16 }
          },
          "ai_alternatives": [
            { "id": "azure_backup_smart", "hours_saved": { "optimistic": 4, "expected": 3, "pessimistic": 1 } }
          ],
          "by_role": { "infrastructure_engineer": 10, "dba": 2 }
        },
        {
          "id": "project_management",
          "name": "Project Management",
          "units": 1,
          "base_hours": 40,
          "multipliers_applied": [],
          "gotcha_hours": 0,
          "final_hours": 40,
          "firm_hours": 40,
          "assumption_dependent_hours": 0,
          "assumptions_affecting": [],
          "hours": {
            "without_ai": { "optimistic": 32, "expected": 40, "pessimistic": 52 }
          },
          "ai_alternatives": [],
          "by_role": { "project_manager": 40 }
        }
      ]
    },
    {
      "id": "phase_5_cutover",
      "name": "Phase 5: Cutover & Go-Live",
      "duration": "1-2 weeks",
      "components": [
        {
          "id": "cutover_execution",
          "name": "Cutover Execution",
          "units": 1,
          "base_hours": 16,
          "multipliers_applied": [],
          "gotcha_hours": 0,
          "final_hours": 16,
          "firm_hours": 16,
          "assumption_dependent_hours": 0,
          "assumptions_affecting": [],
          "hours": {
            "without_ai": { "optimistic": 13, "expected": 16, "pessimistic": 21 }
          },
          "ai_alternatives": [],
          "by_role": { "infrastructure_engineer": 6, "sitecore_developer": 4, "dba": 3, "project_manager": 3 }
        },
        {
          "id": "dns_cutover",
          "name": "DNS Cutover",
          "units": 3,
          "base_hours": 12,
          "multipliers_applied": [],
          "gotcha_hours": 0,
          "final_hours": 12,
          "firm_hours": 12,
          "assumption_dependent_hours": 0,
          "assumptions_affecting": [],
          "hours": {
            "without_ai": { "optimistic": 10, "expected": 12, "pessimistic": 16 }
          },
          "ai_alternatives": [
            { "id": "azure_traffic_manager", "hours_saved": { "optimistic": 4, "expected": 3, "pessimistic": 1 } }
          ],
          "by_role": { "infrastructure_engineer": 10, "qa_engineer": 2 }
        }
      ]
    }
  ],
  "totals": {
    "without_ai": {
      "optimistic": 837,
      "expected": 1046,
      "pessimistic": 1456
    },
    "with_ai": {
      "optimistic": 685,
      "expected": 884,
      "pessimistic": 1296
    },
    "ai_savings": {
      "optimistic": 152,
      "expected": 162,
      "pessimistic": 160
    }
  },
  "total_by_role": {
    "infrastructure_engineer": 372,
    "dba": 303,
    "sitecore_developer": 232,
    "qa_engineer": 59,
    "project_manager": 78
  },
  "client_summary": {
    "recommended_hours": 884,
    "low_hours": 685,
    "high_hours": 1456,
    "confidence_percent": 68,
    "range_narrative": "This estimate carries 68% confidence due to 12 unvalidated assumptions. Validating the top 5 assumptions (database size, xDB contacts, EXM volume, custom xDB facets, and AWS SDK usage) would reduce the pessimistic scenario by ~54 hours and raise confidence to ~82%."
  }
}
EOF
sed -i '' "s/ASSESSMENT_ID_PLACEHOLDER/$ASSESSMENT_ID/g" "$MIG/estimate.json"
sed -i '' "s/DATE_PLACEHOLDER/$DATE_NOW/g" "$MIG/estimate.json"
echo "  [ok] estimate.json"
}

# ============================================================
# 22. ai-alternatives-selection.json
# ============================================================
write_ai_selections() {
cat > "$MIG/ai-alternatives-selection.json" << 'EOF'
{
  "id": "ASSESSMENT_ID_PLACEHOLDER",
  "generated": "DATE_PLACEHOLDER",
  "version": "2.0.0",
  "total_available": 27,
  "total_enabled": 17,
  "selections": {
    "azure_migrate": true,
    "aws_app_discovery": true,
    "azure_dms": true,
    "ssma": false,
    "dma": true,
    "azcopy": true,
    "azure_storage_mover": false,
    "github_copilot": true,
    "claude_code": true,
    "terraform_opentofu": true,
    "azure_bicep": false,
    "playwright_ai_testgen": true,
    "k6_performance": true,
    "azure_load_testing": false,
    "azure_monitor_ai": true,
    "app_insights_smart": true,
    "defender_for_cloud": true,
    "azure_policy": false,
    "sendgrid_ip_warmup": true,
    "azure_devops_pipelines": false,
    "github_actions_copilot": false,
    "azure_site_recovery": false,
    "azure_backup_smart": true,
    "azure_traffic_manager": false,
    "azure_network_watcher": true,
    "azure_advisor": true
  },
  "disabled_reasons": {
    "ssma": "Source is already SQL Server — SSMA not applicable",
    "azure_storage_mover": "75GB media under 100GB threshold; AzCopy sufficient",
    "azure_bicep": "Team prefers Terraform (mutual exclusion with terraform_opentofu)",
    "azure_load_testing": "K6 selected as primary load testing tool",
    "azure_policy": "No specific compliance requirements identified yet",
    "azure_devops_pipelines": "Not selected (no CI/CD platform chosen yet)",
    "github_actions_copilot": "Not selected (no CI/CD platform chosen yet)",
    "azure_site_recovery": "Standard migration approach preferred; ASR complexity not justified for this topology",
    "azure_traffic_manager": "Big-bang cutover planned; gradual traffic shift not required"
  }
}
EOF
sed -i '' "s/ASSESSMENT_ID_PLACEHOLDER/$ASSESSMENT_ID/g" "$MIG/ai-alternatives-selection.json"
sed -i '' "s/DATE_PLACEHOLDER/$DATE_NOW/g" "$MIG/ai-alternatives-selection.json"
echo "  [ok] ai-alternatives-selection.json"
}

# ============================================================
# 23. Dashboard HTML (template processing via Python3)
# ============================================================
write_dashboard() {
python3 << 'PYEOF'
import json, os, sys

repo = os.environ.get("REPO_ROOT", ".")
mig = os.environ.get("MIG", "./.migration")
templates = os.environ.get("TEMPLATES", "./skills/migrate-knowledge/templates")
ai_json_path = os.environ.get("AI_JSON", "./skills/migrate-knowledge/heuristics/ai-alternatives.json")

# Load data
with open(os.path.join(mig, "assessment.json")) as f:
    project = json.load(f)
with open(os.path.join(mig, "estimate.json")) as f:
    estimate = json.load(f)
with open(os.path.join(mig, "assumptions-registry.json")) as f:
    assumptions = json.load(f)
with open(os.path.join(mig, "analysis.json")) as f:
    analysis = json.load(f)
with open(ai_json_path) as f:
    ai_alts = json.load(f)
with open(os.path.join(mig, "ai-alternatives-selection.json")) as f:
    ai_sels = json.load(f)

# Read template
with open(os.path.join(templates, "dashboard-template.html")) as f:
    template = f.read()

# Replace placeholders
replacements = {
    "{{PROJECT_NAME}}": project["project_name"],
    "{{CLIENT_NAME}}": project["client_name"],
    "{{DATE}}": project["updated"],
    "{{ASSESSMENT_ID}}": project["id"],
    "{{PROJECT_DATA_JSON}}": json.dumps(project),
    "{{ESTIMATE_DATA_JSON}}": json.dumps(estimate),
    "{{ASSUMPTIONS_DATA_JSON}}": json.dumps(assumptions),
    "{{ANALYSIS_DATA_JSON}}": json.dumps(analysis),
    "{{AI_ALTERNATIVES_JSON}}": json.dumps(ai_alts),
    "{{AI_SELECTIONS_JSON}}": json.dumps(ai_sels),
}

for placeholder, value in replacements.items():
    template = template.replace(placeholder, value)

out_path = os.path.join(mig, "deliverables", "dashboard.html")
with open(out_path, "w") as f:
    f.write(template)

print("  [ok] deliverables/dashboard.html")
PYEOF
}

# ============================================================
# 24. migration-plan.md (filled-in)
# ============================================================
write_migration_plan() {
cat > "$MIG/deliverables/migration-plan.md" << PLANEOF
# $PROJECT_NAME — Sitecore XP Migration Plan

## AWS to Azure Infrastructure Migration

| Field | Value |
|-------|-------|
| **Client** | $CLIENT_NAME |
| **Prepared By** | $ARCHITECT_NAME |
| **Date** | $DATE_NOW |
| **Version** | 1.0 |
| **Status** | Draft |
| **Sitecore Version** | $SITECORE_VERSION |
| **Target Timeline** | Q2 2026 |

---

## 1. Executive Summary

This migration plan covers the replatforming of Contoso's Sitecore XP 10.3 + EXM deployment from AWS to Azure. The current environment runs an XP Scaled + EXM topology across multiple EC2 instances with RDS SQL Server, SolrCloud, ElastiCache Redis, and SendGrid for email dispatch. The migration is infrastructure-only — no Sitecore version upgrade is included.

The recommended approach is an AI-assisted migration estimated at **884 hours** (expected), with a range of 685–1,456 hours depending on assumption validation and AI tool adoption. Current estimate confidence is **68%** due to 12 unvalidated assumptions.

### Migration Scope
- **Source**: Sitecore XP 10.3 on AWS (XP Scaled + EXM)
- **Target**: Sitecore XP 10.3 on Azure (IaaS equivalent)
- **Migration Type**: Infrastructure replatforming (no version upgrade)

### Key Metrics
| Metric | Value |
|--------|-------|
| Recommended Estimate | 884 hours (AI-assisted) |
| Estimate Range | 685–1,456 hours |
| Estimate Confidence | 68% |
| Estimated Duration | 12-16 weeks |
| Number of Environments | 3 |
| Risk Items | 8 (2 critical) |
| Unvalidated Assumptions | 12 |

---

## 2. Current State Architecture

### 2.1 Topology Overview
Sitecore XP 10.3 Scaled + EXM topology on AWS, with dedicated roles for CM, CD (4x with auto-scale to 6), xConnect (2x), Processing (1x), and Identity Server (1x). All roles run on EC2 instances behind an Application Load Balancer.

### 2.2 Infrastructure Components

#### Compute
- **CM**: 1x m5.xlarge (Windows Server 2019)
- **CD**: 4x m5.large, auto-scale to 6, behind ALB
- **xConnect**: 2x m5.large
- **Processing**: 1x m5.large
- **Identity Server**: 1x t3.medium

#### Database
- RDS SQL Server 2019 Enterprise, Multi-AZ
- 11 databases, ~120GB total (assumed)
- Includes core, master, web, xDB collection (2 shards), EXM, marketing automation, processing pools/tasks, reference data, experience forms

#### Search
- SolrCloud 8.11 on 2x m5.large + 3 ZooKeeper nodes
- 3 custom indexes: product_catalog, knowledge_base, store_locator (assumed)

#### Caching
- ElastiCache Redis r6g.large, 2 nodes
- Used for session state, SSL in transit enabled
- Eviction policy unknown

#### CDN & Load Balancing
- CloudFront with 2 distributions (www + media)
- WAF enabled on both distributions
- ALB for CD tier load balancing

#### Storage
- S3 with 2 buckets (~75GB total media)
- Versioning enabled
- Blob provider module unknown

#### Email (EXM)
- SendGrid with 2 dedicated IPs
- ~200K emails/month (assumed)
- IP warmup required for new IPs

#### xConnect / xDB
- 2x m5.large xConnect servers
- 2 collection shards, 500K-2M contacts (assumed)
- Custom xDB facets suspected (loyalty data)

#### Networking
- 1 VPC, 6 subnets, 12 security groups
- Site-to-site VPN to on-premises
- NAT Gateway for outbound

#### Monitoring
- CloudWatch (primary) + Datadog (APM/dashboards)
- Custom dashboard count unknown

#### CI/CD
- Jenkins with 2 pipelines
- Artifact storage on S3

### 2.3 Integration Points
1. **Salesforce CRM** — Bidirectional REST API integration
2. **Akeneo PIM** — Inbound REST API with scheduled sync
3. **Bynder DAM** — Inbound via Sitecore connector module

---

## 3. Target State Architecture

### 3.1 Azure Topology
IaaS deployment on Azure replicating the XP Scaled + EXM topology. Key changes: EC2 → Azure VMs, RDS → Azure SQL MI, ElastiCache → Azure Cache for Redis, CloudFront → Azure Front Door, S3 → Azure Blob Storage, VPN Gateway for site-to-site connectivity.

### 3.2 Service Mapping

| AWS Service | Azure Equivalent | Notes |
|-------------|-----------------|-------|
| EC2 (m5.xlarge) | D4s_v5 VM | Similar vCPU/memory profile |
| EC2 (m5.large) | D2s_v5 VM | Similar vCPU/memory profile |
| EC2 (t3.medium) | B2s VM | Burstable equivalent |
| RDS SQL Server | Azure SQL MI (Business Critical) | Multi-AZ equivalent |
| ElastiCache Redis | Azure Cache for Redis (Premium P2) | Clustering support |
| CloudFront | Azure Front Door (Premium) | WAF included |
| S3 | Azure Blob Storage (Hot) | AzCopy for migration |
| Route 53 | Azure DNS | Zone migration needed |
| ACM | Azure Key Vault (certificates) | Manual cert import |
| ALB | Azure Application Gateway v2 | WAF optional |
| VPN Gateway | Azure VPN Gateway | S2S compatible |
| CloudWatch | Azure Monitor + App Insights | Datadog stays or migrates |

### 3.3 Azure Resource Summary

| Resource | SKU/Tier | Count | Purpose |
|----------|----------|-------|---------|
| Virtual Machines (D4s_v5) | Standard | 1 | CM role |
| Virtual Machines (D2s_v5) | Standard | 4-6 | CD roles (VMSS) |
| Virtual Machines (D2s_v5) | Standard | 2 | xConnect |
| Virtual Machines (D2s_v5) | Standard | 1 | Processing |
| Virtual Machines (B2s) | Standard | 1 | Identity Server |
| Azure SQL MI | Business Critical | 1 | 11 databases |
| Azure Cache for Redis | Premium P2 | 1 | Session + cache |
| Azure Front Door | Premium | 1 | CDN + WAF |
| Azure Blob Storage | Hot (GPv2) | 2 | Media storage |
| Azure Application Gateway | v2 Standard | 1 | CD load balancing |
| Azure VPN Gateway | VpnGw1 | 1 | S2S VPN |
| SolrCloud VMs (D2s_v5) | Standard | 2+3 | Solr + ZooKeeper |

---

## 4. Migration Approach

### 4.1 Strategy
Parallel build approach: provision the complete Azure environment alongside existing AWS, perform bulk data migration, then execute cutover with a controlled maintenance window. This minimizes risk by allowing side-by-side validation before DNS cutover.

### 4.2 Guiding Principles
- Minimize downtime through parallel environment build
- Validate each component independently before integration
- Maintain rollback capability until DNS cutover is confirmed stable
- No Sitecore version changes during migration to reduce variables

---

## 5. Phase Breakdown

### Phase 1: Infrastructure Foundation
**Duration**: 3-4 weeks
**Effort**: 203 hours

Provision Azure networking (VNet, subnets, NSGs, VPN Gateway), compute resources (VMs for all Sitecore roles), SSL certificates (Key Vault), and CDN (Front Door). Infrastructure-as-code via Terraform for repeatability across dev/staging/production environments.

#### Key Deliverables
- Azure VNet with subnet architecture matching Sitecore role isolation
- All VMs provisioned with correct sizing
- VPN Gateway connected to on-premises
- Front Door configured with WAF policies
- SSL certificates in Key Vault
- Terraform modules for all resources

#### Exit Criteria
- All VMs accessible and passing health checks
- VPN connectivity verified with on-premises
- Front Door routing to CD instances
- SSL certificates valid and bound

---

### Phase 2: Data Migration
**Duration**: 2-3 weeks
**Effort**: 411 hours

Migrate 11 SQL Server databases to Azure SQL MI using Azure DMS for online migration. Migrate 75GB media from S3 to Azure Blob Storage using AzCopy. Validate data integrity post-migration.

#### Key Deliverables
- All 11 databases migrated to Azure SQL MI
- Media library migrated to Azure Blob Storage
- Data integrity validation report
- Delta sync mechanism tested and ready for cutover

#### Exit Criteria
- All databases accessible from Azure VMs
- Sitecore connection strings updated and tested
- Media rendering verified through Blob Storage
- Delta sync completing within acceptable window

---

### Phase 3: Application & Services
**Duration**: 3-4 weeks
**Effort**: 300 hours

Deploy Sitecore roles, configure SolrCloud, Redis, Identity Server, xConnect, and EXM on Azure. Rebuild CI/CD pipelines. Migrate monitoring to Azure Monitor. Begin EXM IP warmup (6 weeks before cutover).

#### Key Deliverables
- All Sitecore roles deployed and running on Azure
- SolrCloud rebuilt with custom indexes
- Redis session state operational
- EXM configured with new SendGrid settings
- CI/CD pipelines rebuilt for Azure targets
- Monitoring dashboards configured
- IP warmup initiated

#### Exit Criteria
- CM login successful, content authoring working
- CD rendering all pages correctly
- xConnect collecting analytics data
- Search returning results from custom indexes
- Email test dispatch successful
- CI/CD deploying to Azure environments

---

### Phase 4: Validation & Testing
**Duration**: 2-3 weeks
**Effort**: 104 hours

Full regression testing, performance validation (K6 load testing), security scan (Defender for Cloud), UAT sign-off. Configure backup policies and DR procedures.

#### Key Deliverables
- Regression test results
- Performance comparison report (AWS baseline vs Azure)
- Security scan results
- UAT sign-off document
- Backup and DR policies configured and tested

#### Exit Criteria
- All regression tests passing
- Performance within 10% of AWS baseline
- No critical security findings
- UAT approved by client stakeholder
- Backup restore tested successfully

---

### Phase 5: Cutover & Go-Live
**Duration**: 1-2 weeks
**Effort**: 28 hours

Execute cutover runbook: final delta sync, DNS switch, validation, and hypercare monitoring.

#### Key Deliverables
- Completed cutover runbook with timestamps
- DNS records updated to Azure endpoints
- Post-cutover validation checklist completed
- Hypercare monitoring active

#### Exit Criteria
- All production traffic routing through Azure
- No critical errors in first 24 hours
- Client stakeholder sign-off on go-live
- Rollback window passed without issues

---

## 6. Timeline

\`\`\`
Week  1-2:  [████████] Phase 1 — Infrastructure Foundation
Week  3-4:  [████████] Phase 1 (continued) + Phase 2 start
Week  5-6:  [████████] Phase 2 — Data Migration
Week  7-8:  [████████] Phase 3 — Application & Services
Week  9-10: [████████] Phase 3 (continued)
Week 11-12: [████████] Phase 4 — Validation & Testing
Week 13-14: [████████] Phase 4 (continued) + Cutover prep
Week 15:    [████]     Phase 5 — Cutover & Go-Live
Week 16:    [████]     Hypercare & Stabilization

EXM IP Warmup: Starts Week 7, runs through Week 15 (6+ weeks)
\`\`\`

---

## 7. Resource Requirements

### 7.1 Team Composition

| Role | Hours (Expected) | Hours (Range) | Responsibilities |
|------|------------------|---------------|------------------|
| Infrastructure Engineer | 372 | 305-484 | Azure provisioning, networking, IaC, monitoring |
| DBA | 303 | 248-394 | Database migration, validation, performance tuning |
| Sitecore Developer | 232 | 190-302 | Role deployment, integrations, EXM, xConnect |
| QA Engineer | 59 | 48-77 | Testing, validation, UAT coordination |
| Project Manager | 78 | 64-101 | Planning, coordination, stakeholder management |

### 7.2 Resource Loading by Phase

| Role | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 |
|------|---------|---------|---------|---------|---------|
| Infrastructure Engineer | 170 | 80 | 92 | 16 | 16 |
| DBA | 0 | 280 | 18 | 2 | 3 |
| Sitecore Developer | 15 | 11 | 172 | 10 | 4 |
| QA Engineer | 3 | 0 | 18 | 36 | 2 |
| Project Manager | 15 | 20 | 0 | 40 | 3 |

---

## 8. Risk Register

| ID | Risk | Likelihood | Impact | Severity | Mitigation | Owner |
|----|------|-----------|--------|----------|------------|-------|
| RISK-001 | xDB shard migration complexity | High | High | Critical | Test migration in dev first | DBA |
| RISK-002 | EXM IP warming delay | High | High | Critical | Start warmup 6 weeks early | Sitecore Dev |
| RISK-003 | Database migration window | Medium | High | High | Bulk pre-migrate, delta only at cutover | DBA |
| RISK-004 | VPN throughput unknown | Medium | High | High | Provision VPN Gateway early, test | Infra Engineer |
| RISK-005 | Integration AWS SDK usage | Medium | Medium | Medium | Code audit in Phase 1 | Sitecore Dev |
| RISK-006 | Solr custom index migration | Medium | Medium | Medium | Export schemas, rebuild in dev | Sitecore Dev |
| RISK-007 | Blob provider compatibility | Low | Medium | Medium | Identify provider in config review | Sitecore Dev |
| RISK-008 | Jenkins pipeline complexity | Medium | Low | Medium | Document steps, build in parallel | Infra Engineer |

---

## 9. Dependency Map

### 9.1 Critical Path
Networking → Database → xConnect/xDB → EXM (longest dependency chain)

Secondary: Networking → Compute → SolrCloud → Testing

### 9.2 Dependency Chain
- **Networking** must complete before: Compute, Database, Redis
- **Identity Server** must complete before: Compute roles start
- **Database** must complete before: xConnect, EXM
- **Compute** should complete before: Testing, Monitoring (soft dependency)
- **SolrCloud** must complete before: Compute roles start

---

## 10. Assumptions

1. Database total size is approximately 120GB (CloudWatch estimate, not measured)
2. xDB contact count is between 500K and 2M (client verbal estimate)
3. Three custom Solr indexes exist (names assumed: product_catalog, knowledge_base, store_locator)
4. EXM sends ~200K emails/month via 2 dedicated SendGrid IPs
5. Integration code may contain AWS SDK dependencies (not reviewed)
6. VPN throughput requirements are sufficient for Azure VPN Gateway
7. Sitecore blob provider is standard or easily replaceable
8. Redis eviction policy can be replicated on Azure Cache for Redis
9. Database collation is Sitecore default (SQL_Latin1_General_CP1_CI_AS)
10. Jenkins pipeline complexity is moderate (internal steps not reviewed)
11. Custom monitoring dashboard count and complexity unknown
12. Custom xDB facets may exist for loyalty data (schema not confirmed)

---

## 10.5 Assumption Sensitivity Analysis

### Confidence Score

**Current Confidence: 68%** — 12 unvalidated assumptions contribute +96 hours of pessimistic widening. Validating the top 5 assumptions would raise confidence to ~82% and reduce the pessimistic estimate by ~54 hours.

### Assumption Impact Table

| ID | Assumption | Current Value | Confidence | Affected Components | Pessimistic Widening | Validation Method |
|----|-----------|---------------|------------|--------------------|--------------------|-------------------|
| ASMP-001 | DB size | ~120GB | Assumed | database_single | +12 hrs | Run sp_spaceused |
| ASMP-002 | xDB contacts | 500K-2M | Assumed | xconnect_xdb, database_single | +8 hrs | Query collection DB |
| ASMP-003 | Custom indexes | 3 indexes | Assumed | solr_cloud | +6 hrs | Solr API list |
| ASMP-004 | EXM volume | 200K/mo, 2 IPs | Assumed | exm_dispatch | +12 hrs | SendGrid analytics |
| ASMP-005 | AWS SDK usage | Unknown | Unknown | custom_integration | +10 hrs | Code grep |
| ASMP-006 | VPN throughput | Unknown | Unknown | networking_vnet | +8 hrs | CloudWatch VPN metrics |
| ASMP-007 | Blob provider | Unknown | Unknown | blob_storage | +6 hrs | Sitecore config review |
| ASMP-008 | Redis eviction | Unknown | Unknown | redis_session | +4 hrs | ElastiCache params |
| ASMP-009 | DB collation | Default assumed | Assumed | database_single | +8 hrs | SQL query |
| ASMP-010 | Pipeline complexity | Moderate | Assumed | cicd_pipeline | +6 hrs | Export Jenkinsfile |
| ASMP-011 | Dashboard count | Unknown | Unknown | monitoring_setup | +4 hrs | Datadog API |
| ASMP-012 | Custom xDB facets | Suspected | Assumed | xconnect_xdb, database_single | +12 hrs | xDB model config |

### Scenario Comparison

| Scenario | Optimistic | Expected | Pessimistic |
|----------|-----------|----------|-------------|
| Current (0 validated) | 685 hrs | 884 hrs | 1,456 hrs |
| All assumptions validated | 685 hrs | 884 hrs | 1,360 hrs |
| Range reduction | — | — | -96 hrs |

### Top Assumptions to Validate

1. **ASMP-004** (EXM volume) and **ASMP-012** (xDB facets) — +12 hrs widening each
2. **ASMP-001** (DB size) — +12 hrs widening, affects critical path
3. **ASMP-005** (AWS SDK usage) — +10 hrs widening, unknown confidence
4. **ASMP-002** (xDB contacts) and **ASMP-009** (collation) — +8 hrs each

---

## 11. Exclusions

- Sitecore version upgrade (staying on 10.3)
- Application code refactoring beyond AWS SDK dependency changes
- Content migration or content freeze coordination
- End-user training
- Third-party vendor contract renegotiation (SendGrid, Salesforce, etc.)
- Performance optimization beyond parity with AWS baseline
- Azure cost optimization (post-migration activity)
- Decommissioning of AWS infrastructure (separate workstream)

---

## 11.5 AI Tools & Automation Opportunities

### Effort Comparison

| Approach | Optimistic | Expected | Pessimistic |
|----------|-----------|----------|-------------|
| Manual Only | 837 hrs | 1,046 hrs | 1,456 hrs |
| AI-Assisted (Recommended) | 685 hrs | 884 hrs | 1,296 hrs |
| **Savings** | **152 hrs** | **162 hrs** | **160 hrs** |

### Recommended AI Tools

| Tool | Category | Applicable Phase | Expected Savings | Cost | Status |
|------|----------|-----------------|-----------------|------|--------|
| Azure Migrate | Discovery | Phase 1 | 8 hrs | Free | Enabled |
| AWS App Discovery | Discovery | Phase 1 | 5 hrs | Free | Enabled |
| Azure DMS | Data Migration | Phase 2 | 5 hrs | Included | Enabled |
| DMA | Data Migration | Phase 2 | 3 hrs | Free | Enabled |
| AzCopy | Storage | Phase 2 | 4 hrs | Free | Enabled |
| GitHub Copilot | Code Assistance | Phase 3 | 10 hrs | \$19-39/user/mo | Enabled |
| Claude Code | Code Assistance | Phase 1, 3 | 12 hrs | Usage-based | Enabled |
| Terraform | IaC | Phase 1-4 | 16 hrs | Free (OSS) | Enabled |
| Playwright AI | Testing | Phase 4 | 8 hrs | Free (OSS) | Enabled |
| K6 | Testing | Phase 4 | 5 hrs | Free (OSS) | Enabled |
| Azure Monitor AI | Monitoring | Phase 3-4 | 4 hrs | Included | Enabled |
| App Insights Smart | Monitoring | Phase 3-4 | 3 hrs | Included | Enabled |
| Defender for Cloud | Security | Phase 1, 4 | 5 hrs | Free tier | Enabled |
| SendGrid IP Warmup | Email | Phase 3 | 10 hrs | Included | Enabled |
| Azure Backup Smart | Backup/DR | Phase 4 | 3 hrs | Pay-per-use | Enabled |
| Azure Network Watcher | Network | Phase 1, 4 | 3 hrs | Included | Enabled |
| Azure Advisor | Monitoring | Phase 4 | 3 hrs | Free | Enabled |

### Tool Details

17 of 27 available AI/automation tools are enabled for this engagement. Key exclusions: Azure Bicep (team prefers Terraform), SSMA (source is already SQL Server), Azure Storage Mover (75GB under threshold), Azure Load Testing (K6 preferred). No CI/CD platform selected yet (Azure DevOps and GitHub Actions both disabled pending decision).

---

## 12. Success Criteria

- All Sitecore roles operational on Azure with equivalent or better performance
- Zero data loss during database migration
- Email deliverability maintained above 95% within 8 weeks of cutover
- Total cutover downtime under 4 hours
- All custom integrations functional post-migration
- Client UAT sign-off obtained
- All monitoring and alerting operational

---

## 13. Rollback Plan

### 13.1 Rollback Triggers
- Database migration fails or data corruption detected
- Sitecore CM or CD fails to start after 3 attempts on Azure
- Critical functionality broken and not fixable within 2 hours
- Migration Lead declares rollback

### 13.2 Rollback Procedure
1. Revert DNS records to AWS endpoints (10 min)
2. Verify DNS propagation (15 min)
3. Restart Sitecore services on AWS (15 min)
4. Verify AWS environment health (15 min)
5. Send rollback notification to stakeholders

### 13.3 Point of No Return
After DNS propagation is confirmed and AWS databases are more than 24 hours stale, rollback becomes significantly more complex. The point of no return is approximately T+24 hours post-cutover.

---

## 14. Post-Migration

### 14.1 Hypercare Period
2-week hypercare period with dedicated team monitoring. Daily check-ins for first week, every-other-day for second week. 24/7 on-call rotation for critical issues.

### 14.2 Decommissioning
AWS environment kept in standby for 30 days post-cutover. Decommissioning is a separate workstream with its own approval process. AWS costs during standby estimated at ~60% of current run rate.

### 14.3 Knowledge Transfer
- Azure architecture documentation delivered
- Runbook and troubleshooting guide provided
- 2x knowledge transfer sessions with client operations team
- Monitoring dashboard walkthrough

---

## Appendices

### A. Discovery Summary
17 dimensions assessed across compute, database, search, caching, CDN, DNS, SSL, storage, email, xConnect, identity, session, integrations, CI/CD, monitoring, networking, and backup/DR. 34 confirmed answers, 11 assumed, 7 unknown.

### B. Detailed Estimate Breakdown
See interactive dashboard at \`.migration/deliverables/dashboard.html\` for component-level breakdown with AI tool toggles and assumption sensitivity analysis.

### C. Interactive Dashboard
An interactive HTML dashboard is available at \`.migration/deliverables/dashboard.html\`. The dashboard allows toggling AI tools, validating assumptions, and comparing scenarios in real time.

### D. Azure Resource Naming Convention
- Resource Group: \`rg-contoso-sitecore-{env}\`
- VMs: \`vm-{role}-{env}-{number}\` (e.g., \`vm-cd-prod-01\`)
- SQL MI: \`sqlmi-contoso-{env}\`
- Storage: \`stcontoso{env}\` (no hyphens)
- Key Vault: \`kv-contoso-{env}\`
- VNet: \`vnet-contoso-{env}\`

---

*Generated by Migration Planner Plugin v2.0*
*Assessment ID: $ASSESSMENT_ID*
PLANEOF
echo "  [ok] deliverables/migration-plan.md"
}

# ============================================================
# 25. risk-register.md (filled-in)
# ============================================================
write_risk_register() {
cat > "$MIG/deliverables/risk-register.md" << RISKEOF
# Risk Register — $PROJECT_NAME

## AWS to Azure Migration

| Field | Value |
|-------|-------|
| **Client** | $CLIENT_NAME |
| **Date** | $DATE_NOW |
| **Last Updated** | $DATE_NOW |
| **Total Risks** | 8 |
| **High Risks** | 2 |
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
| RISK-001 | Data | xDB shard migration complexity — 2 shards, 500K-2M contacts | High | High | Critical | 24 | ASMP-002, ASMP-012 | Test migration in dev first | Backup restore fallback | DBA | Open | $DATE_NOW |
| RISK-002 | Email | EXM IP warming — 4-6 weeks for 2 dedicated IPs at 200K/mo | High | High | Critical | 40 | ASMP-004 | Start warmup 6 weeks early; SendGrid auto-warmup | Route through existing IPs temporarily | Sitecore Dev | Open | $DATE_NOW |
| RISK-003 | Data | 120GB DB migration may exceed maintenance window | Medium | High | High | 16 | ASMP-001, ASMP-009 | Bulk pre-migrate; delta sync only at cutover | Extend window or split migration | DBA | Open | $DATE_NOW |
| RISK-004 | Infrastructure | VPN throughput unknown; may need ExpressRoute | Medium | High | High | 12 | ASMP-006 | Provision VPN Gateway early; test with synthetic load | Use ExpressRoute if insufficient | Infra Engineer | Open | $DATE_NOW |
| RISK-005 | Application | Integration AWS SDK dependencies unknown | Medium | Medium | Medium | 8 | ASMP-005 | Code audit for AWS SDK in Phase 1 | Wrap in abstraction layer | Sitecore Dev | Open | $DATE_NOW |
| RISK-006 | Infrastructure | 3 custom Solr indexes need schema recreation | Medium | Medium | Medium | 8 | ASMP-003 | Export schemas; rebuild in dev | Rebuild from master DB | Sitecore Dev | Open | $DATE_NOW |
| RISK-007 | Infrastructure | Blob provider module compatibility unknown | Low | Medium | Medium | 6 | ASMP-007 | Identify provider in config review | Use community Azure Blob provider | Sitecore Dev | Open | $DATE_NOW |
| RISK-008 | Operational | Jenkins pipeline complexity may be underestimated | Medium | Low | Medium | 6 | ASMP-010 | Document pipeline steps; build in parallel | Keep Jenkins temporarily | Infra Engineer | Open | $DATE_NOW |

---

## Risk Categories

- **Infrastructure**: Risks related to Azure resource provisioning, networking, compute
- **Data**: Risks related to database migration, data integrity, data loss
- **Application**: Risks related to Sitecore configuration, custom code, integrations
- **Performance**: Risks related to performance degradation after migration
- **Security**: Risks related to access control, certificates, compliance
- **Operational**: Risks related to team readiness, process, coordination
- **Timeline**: Risks related to schedule delays, dependency bottlenecks
- **Email/Deliverability**: Risks specific to EXM and email reputation

---

## Risk Trend

| Review Date | Critical | High | Medium | Low | New | Closed | Notes |
|------------|----------|------|--------|-----|-----|--------|-------|
| $DATE_NOW | 2 | 2 | 4 | 0 | 8 | 0 | Initial assessment |

---

## Key Risk Details

### RISK-001: xDB Shard Migration Complexity (Critical)

**Category**: Data | **Owner**: DBA

The xDB collection database uses 2 shards with an estimated 500K-2M contacts. Shard migration to Azure SQL MI requires careful sequencing — shards must be migrated in order, and collection data integrity must be validated post-migration. Custom xDB facets (ASMP-012) add additional complexity as facet schemas must be preserved.

**Mitigation**: Run a complete test migration of both collection shards in the dev environment before production cutover. Validate contact counts, facet data, and interaction history.

**Contingency**: If shard migration fails, restore from backup and extend cutover window by 4 hours.

---

### RISK-002: EXM IP Warming Period (Critical)

**Category**: Email | **Owner**: Sitecore Developer

Migrating EXM to new Azure infrastructure requires new dedicated IPs, which need 4-6 weeks of IP warmup to establish sender reputation. During warmup, email deliverability will be lower than normal. At 200K emails/month, any deliverability issues have significant business impact.

**Mitigation**: Start IP warmup 6 weeks before planned cutover. Use SendGrid's automated warmup scheduling. Monitor deliverability metrics daily.

**Contingency**: If deliverability drops below 85%, temporarily route critical email through existing AWS-based SendGrid IPs.

---

### RISK-003: Database Migration Window (High)

**Category**: Data | **Owner**: DBA

With ~120GB across 11 databases, the migration window may be tight if delta sync volume is high on cutover day. The largest database (xDB collection, ~45GB estimated) drives the critical path.

**Mitigation**: Perform initial bulk migration well before cutover. Limit cutover-day work to delta sync only. Test delta sync timing in staging with realistic transaction volume.

---

### RISK-004: VPN Throughput Requirements (High)

**Category**: Infrastructure | **Owner**: Infrastructure Engineer

The current site-to-site VPN to on-premises must be replicated on Azure. Throughput requirements are unknown (ASMP-006), and Azure VPN Gateway SKU selection depends on these requirements.

**Mitigation**: Provision Azure VPN Gateway in Phase 1. Test throughput with synthetic load matching observed CloudWatch VPN metrics.

---

*Generated by Migration Planner Plugin v2.0*
*Assessment ID: $ASSESSMENT_ID*
RISKEOF
echo "  [ok] deliverables/risk-register.md"
}

# ============================================================
# 26. runbook.md (filled-in)
# ============================================================
write_runbook() {
cat > "$MIG/deliverables/runbook.md" << RUNEOF
# Migration Runbook — $PROJECT_NAME

## AWS to Azure Cutover Execution Guide

| Field | Value |
|-------|-------|
| **Client** | $CLIENT_NAME |
| **Date** | $DATE_NOW |
| **Cutover Window** | Saturday 22:00–Sunday 06:00 (8 hours) |
| **Maintenance Window Start** | Saturday 22:00 UTC |
| **Expected Duration** | 5-6 hours |
| **Rollback Deadline** | Sunday 04:00 UTC |

---

## Contacts & Escalation

| Role | Name | Phone | Email | Availability |
|------|------|-------|-------|-------------|
| Migration Lead | $ARCHITECT_NAME | +1-555-0100 | dakota@contoso.com | On-site |
| Infrastructure | Alex Chen | +1-555-0101 | alex.chen@contoso.com | On-call |
| DBA | Maria Rodriguez | +1-555-0102 | maria.rodriguez@contoso.com | On-call |
| Sitecore Dev | James Wilson | +1-555-0103 | james.wilson@contoso.com | On-call |
| Client Stakeholder | Sarah Thompson | +1-555-0104 | sarah.thompson@contoso.com | On-call |

---

## Pre-Migration Checklist

Complete ALL items before starting cutover.

### Infrastructure Readiness
- [ ] Azure VNet and subnets provisioned and validated
- [ ] NSG rules configured and tested
- [ ] VMs provisioned with correct sizing and disk configuration
- [ ] Azure SQL MI provisioned with 11 databases
- [ ] Solr cluster deployed and accessible
- [ ] Azure Cache for Redis provisioned with SSL
- [ ] Application Gateway configured
- [ ] SSL certificates uploaded to Key Vault
- [ ] Monitoring and alerting configured
- [ ] Backup policies configured

### Application Readiness
- [ ] Sitecore roles deployed to all VMs
- [ ] Connection strings updated for Azure targets
- [ ] Identity Server deployed and tested
- [ ] xConnect deployed and tested
- [ ] EXM configured with new dispatch settings
- [ ] CI/CD pipelines updated for Azure targets
- [ ] All custom integrations tested against Azure endpoints

### Data Readiness
- [ ] Initial bulk data migration completed
- [ ] Delta sync mechanism tested
- [ ] Media migration completed or staged
- [ ] Solr indexes rebuilt on Azure
- [ ] xDB shard migration validated

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
| 8 | Final database delta sync to Azure | DBA | 30 min | [ ] | |
| 9 | Verify database consistency on Azure | DBA | 15 min | [ ] | |
| 10 | Final media/blob sync to Azure | Infrastructure | 15 min | [ ] | |

### T+60 min: Application Startup
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

### T+2 hrs: Validation
| # | Step | Owner | Est. Time | Status | Notes |
|---|------|-------|-----------|--------|-------|
| 19 | Run smoke test suite | QA | 15 min | [ ] | |
| 20 | Verify search functionality | Sitecore Dev | 10 min | [ ] | |
| 21 | Verify form submissions | QA | 5 min | [ ] | |
| 22 | Verify custom integrations (Salesforce, Akeneo, Bynder) | Sitecore Dev | 15 min | [ ] | |
| 23 | Test publish workflow (CM to CD) | Sitecore Dev | 10 min | [ ] | |
| 24 | Verify monitoring and alerts firing | Infrastructure | 5 min | [ ] | |
| 25 | **GO / NO-GO for DNS cutover** | Migration Lead | 5 min | [ ] | **DECISION POINT** |

### T+3 hrs: DNS Cutover
| # | Step | Owner | Est. Time | Status | Notes |
|---|------|-------|-----------|--------|-------|
| 26 | Update DNS records to Azure endpoints | Infrastructure | 10 min | [ ] | |
| 27 | Verify DNS propagation (multiple regions) | Infrastructure | 15 min | [ ] | |
| 28 | Remove maintenance page | Infrastructure | 5 min | [ ] | |
| 29 | Monitor traffic shift in Azure Monitor | Infrastructure | 15 min | [ ] | |
| 30 | Verify site accessible via production URLs | QA | 10 min | [ ] | |

### T+4 hrs: Post-Cutover
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
- [ ] Critical functionality broken and unfixable within 2 hours
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
After DNS has fully propagated and users have been active on the Azure environment for 24+ hours, rolling back becomes significantly more complex due to data written to Azure databases. The effective point of no return is T+24 hours post-cutover. Before this point, AWS databases can be restored from pre-cutover backups.

---

## Post-Migration Validation Checklist

### Day 1
- [ ] All pages rendering correctly
- [ ] Content authoring working (create, edit, publish)
- [ ] Search returning correct results
- [ ] Forms submitting successfully
- [ ] User login/authentication working
- [ ] Analytics data being collected
- [ ] Email dispatch functioning (EXM)
- [ ] Custom integrations operational (Salesforce, Akeneo, Bynder)
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

*Generated by Migration Planner Plugin v2.0*
*Assessment ID: $ASSESSMENT_ID*
RUNEOF
echo "  [ok] deliverables/runbook.md"
}

# ============================================================
# Execute all write functions
# ============================================================
echo "--- Writing state files ---"
write_assessment
write_discovery_compute
write_discovery_database
write_discovery_search
write_discovery_caching
write_discovery_cdn
write_discovery_dns
write_discovery_ssl
write_discovery_storage
write_discovery_email
write_discovery_xconnect
write_discovery_identity
write_discovery_session
write_discovery_integrations
write_discovery_cicd
write_discovery_monitoring
write_discovery_networking
write_discovery_backup_dr
write_analysis
write_assumptions
write_estimate
write_ai_selections

echo ""
echo "--- Writing deliverables ---"
write_dashboard
write_migration_plan
write_risk_register
write_runbook

# ============================================================
# Verification
# ============================================================
echo ""
echo "--- Verification ---"

ERRORS=0

# Check JSON validity
for f in "$MIG"/*.json "$MIG"/discovery/*.json; do
  if ! python3 -m json.tool "$f" > /dev/null 2>&1; then
    echo "  [FAIL] Invalid JSON: $f"
    ERRORS=$((ERRORS + 1))
  fi
done
echo "  [ok] All JSON files valid"

# Check for leftover placeholders in dashboard
DASHBOARD_PLACEHOLDERS=$(grep -c '{{' "$MIG/deliverables/dashboard.html" 2>/dev/null || true)
if [ "$DASHBOARD_PLACEHOLDERS" -gt 0 ]; then
  echo "  [FAIL] Dashboard has $DASHBOARD_PLACEHOLDERS leftover {{ placeholders"
  grep -n '{{' "$MIG/deliverables/dashboard.html" | head -5
  ERRORS=$((ERRORS + 1))
else
  echo "  [ok] Dashboard has no leftover placeholders"
fi

# Count files
JSON_COUNT=$(find "$MIG" -name '*.json' | wc -l | tr -d ' ')
MD_COUNT=$(find "$MIG/deliverables" -name '*.md' | wc -l | tr -d ' ')
HTML_COUNT=$(find "$MIG/deliverables" -name '*.html' | wc -l | tr -d ' ')
echo "  [ok] Files: ${JSON_COUNT} JSON, ${MD_COUNT} markdown, ${HTML_COUNT} HTML"

if [ "$ERRORS" -gt 0 ]; then
  echo ""
  echo "=== FAILED with $ERRORS error(s) ==="
  exit 1
fi

echo ""
echo "=== E2E seed complete ==="
echo "State:        $MIG/"
echo "Dashboard:    $MIG/deliverables/dashboard.html"
echo "Plan:         $MIG/deliverables/migration-plan.md"
echo "Risk Register:$MIG/deliverables/risk-register.md"
echo "Runbook:      $MIG/deliverables/runbook.md"

# Open dashboard
if [ "$NO_OPEN" = false ]; then
  echo ""
  echo "Opening dashboard..."
  open "$MIG/deliverables/dashboard.html" 2>/dev/null || xdg-open "$MIG/deliverables/dashboard.html" 2>/dev/null || echo "  (open manually: $MIG/deliverables/dashboard.html)"
fi
