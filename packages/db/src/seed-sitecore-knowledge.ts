/**
 * Seed script: loads existing hand-built Sitecore XP knowledge from JSON files
 * into the DB via the exported query functions.
 *
 * Creates:
 *   - "sitecore-xp" knowledge pack (CMS)
 *   - "aws" knowledge pack (infrastructure)
 *   - "azure" knowledge pack (infrastructure)
 *   - Discovery trees for both aws (13 infra dims) and sitecore-xp (4 infra + 6 platform dims)
 *   - Heuristics split between aws (11 components) and sitecore-xp (16 components)
 *   - Migration path: aws -> azure
 *
 * Usage:
 *   DATABASE_URL=postgresql://... npx tsx src/seed-sitecore-knowledge.ts
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getDb, closeDb } from "./connection.js";
import { saveKnowledgePack } from "./queries/knowledge-packs.js";
import { saveHeuristics } from "./queries/knowledge-heuristics.js";
import { saveDiscoveryTree } from "./queries/knowledge-discovery.js";
import { saveMigrationPath } from "./queries/migration-paths.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const KNOWLEDGE_DIR = resolve(__dirname, "../../../skills/migrate-knowledge");

function loadJson(relativePath: string): any {
  const fullPath = resolve(KNOWLEDGE_DIR, relativePath);
  return JSON.parse(readFileSync(fullPath, "utf-8"));
}

function loadMarkdown(relativePath: string): string {
  const fullPath = resolve(KNOWLEDGE_DIR, relativePath);
  return readFileSync(fullPath, "utf-8");
}

// ──────────────────────────────────────────────
// Split definitions: which items belong to aws vs sitecore-xp
// ──────────────────────────────────────────────

// Discovery tree dimension IDs
const AWS_DIM_IDS = [
  "compute", "database", "caching", "cdn", "dns", "ssl_tls",
  "storage", "email", "session_state", "cicd", "monitoring",
  "networking", "backup_dr",
];
const SC_INFRA_DIM_IDS = ["search", "xconnect", "identity", "custom_integrations"];

// Effort hour component IDs
const AWS_COMPONENT_IDS = new Set([
  "compute_single_role", "database_single", "cdn_setup", "dns_cutover",
  "ssl_tls", "blob_storage", "backup_dr", "monitoring_setup",
  "cicd_pipeline", "networking_vnet", "managed_identity_keyvault",
]);

// Multiplier IDs
const AWS_MULTIPLIER_IDS = new Set([
  "multi_cd", "many_cd", "custom_session_state", "ha_database",
  "large_media_library", "very_large_media_library", "vpn_connectivity",
  "expressroute", "compliance_requirements", "pci_compliance",
  "hipaa_compliance", "gdpr_compliance", "multi_environment",
  "many_environments", "hub_spoke_networking", "active_active_dr",
]);

// Gotcha pattern IDs
const AWS_GOTCHA_IDS = new Set([
  "session_redis_cd", "media_blob_references", "rds_collation_mismatch",
  "certificate_pinning", "large_db_migration_window", "redis_ssl_default",
  "multiple_content_databases", "geo_distributed", "hub_spoke_multi_env",
  "aggressive_rto", "sql_advanced_features", "unicorn_path_dependencies",
  "custom_handlers_aws", "custom_cache_clearing",
]);

// Dependency chain IDs
const AWS_CHAIN_IDS = new Set([
  "network_first", "ssl_before_compute", "ssl_before_cdn", "cdn_before_dns",
  "backup_before_cutover", "monitoring_parallel", "cicd_after_compute",
  "keyvault_before_sitecore", "compute_before_sitecore_roles",
  "compute_before_publishing_service", "database_before_sitecore",
  "database_before_publishing_service", "database_before_content",
]);

// Phase mappings per pack
const AWS_PHASE_MAPPING: Record<string, string[]> = {
  phase_1_infrastructure: ["networking_vnet", "compute_single_role", "ssl_tls", "managed_identity_keyvault"],
  phase_2_data: ["database_single", "blob_storage"],
  phase_3_application: ["cdn_setup", "cicd_pipeline", "monitoring_setup"],
  phase_4_validation: ["backup_dr"],
  phase_5_cutover: ["dns_cutover"],
};

const SC_PHASE_MAPPING: Record<string, string[]> = {
  phase_2_data: ["content_serialization_sync", "solr_standalone", "solr_cloud", "redis_session"],
  phase_3_application: [
    "identity_server", "xconnect_xdb", "custom_integration",
    "publishing_service", "code_migration", "frontend_rebuild",
  ],
  phase_3b_content: ["content_migration"],
  phase_4_validation: ["testing_validation", "training"],
  phase_5_cutover: ["cutover_execution", "go_live_planning"],
};

async function main() {
  const db = getDb();
  console.log("Connected to database");

  // ──────────────────────────────────────────────
  // 1. Knowledge Packs
  // ──────────────────────────────────────────────
  console.log("\n[1/6] Creating knowledge packs...");

  const scResult = await saveKnowledgePack(db, {
    id: "sitecore-xp",
    name: "Sitecore XP",
    vendor: "Sitecore",
    category: "cms",
    subcategory: "enterprise-dxp",
    description:
      "Sitecore Experience Platform (XP) — on-premises/IaaS digital experience platform with content management, personalization, marketing automation, and analytics.",
    direction: "source",
    latest_version: "10.4",
    supported_versions: ["10.4", "10.3", "10.2", "10.1", "10.0"],
    eol_versions: {
      "9.3": "2024-12-31",
      "9.2": "2023-12-31",
      "9.1": "2023-06-30",
      "9.0": "2022-12-31",
      "8.2": "2021-12-31",
    },
    valid_topologies: ["XM Single", "XM Scaled", "XP Scaled"],
    deployment_models: ["IaaS (VM-based)", "PaaS (Azure App Service)", "Containers (AKS)"],
    compatible_targets: ["sitecore-ai", "optimizely-cms", "contentful", "custom"],
    compatible_infrastructure: ["aws", "azure", "gcp", "on-prem"],
    required_services: ["sql-server", "solr", "redis"],
    optional_services: ["cdn", "waf", "monitoring", "identity-provider"],
    confidence: "verified",
    last_researched: new Date().toISOString(),
    created_by: "seed-script",
    change_summary: "Initial seed from hand-built knowledge files",
  });
  console.log(`  sitecore-xp pack created (version ${scResult.version})`);

  const awsResult = await saveKnowledgePack(db, {
    id: "aws",
    name: "Amazon Web Services",
    vendor: "Amazon",
    category: "infrastructure",
    subcategory: "hyperscaler",
    description:
      "AWS cloud infrastructure — compute (EC2), databases (RDS), storage (S3), networking (VPC), and supporting services.",
    direction: "source",
    latest_version: "current",
    supported_versions: ["current"],
    eol_versions: {},
    valid_topologies: [],
    deployment_models: ["IaaS", "PaaS", "Serverless", "Containers"],
    compatible_targets: ["azure", "gcp"],
    compatible_infrastructure: [],
    required_services: [],
    optional_services: [],
    confidence: "verified",
    last_researched: new Date().toISOString(),
    created_by: "seed-script",
    change_summary: "Initial seed — AWS infrastructure pack with heuristics and discovery tree",
  });
  console.log(`  aws pack created (version ${awsResult.version})`);

  const azureResult = await saveKnowledgePack(db, {
    id: "azure",
    name: "Microsoft Azure",
    vendor: "Microsoft",
    category: "infrastructure",
    subcategory: "hyperscaler",
    description:
      "Azure cloud infrastructure — compute (VMs/App Service), databases (SQL MI/SQL DB), storage (Blob), networking (VNet), and supporting services.",
    direction: "target",
    latest_version: "current",
    supported_versions: ["current"],
    eol_versions: {},
    valid_topologies: [],
    deployment_models: ["IaaS", "PaaS", "Serverless", "Containers"],
    compatible_targets: [],
    compatible_infrastructure: [],
    required_services: [],
    optional_services: [],
    confidence: "verified",
    last_researched: new Date().toISOString(),
    created_by: "seed-script",
    change_summary: "Initial seed — Azure infrastructure pack for migration target",
  });
  console.log(`  azure pack created (version ${azureResult.version})`);

  // ──────────────────────────────────────────────
  // 2. Discovery Trees — split between aws and sitecore-xp
  // ──────────────────────────────────────────────
  console.log("\n[2/6] Saving discovery trees (split between aws and sitecore-xp)...");

  const monolithicTree = loadJson("discovery/discovery-tree-v1-monolithic.json");
  const allInfraDims: any[] = monolithicTree.dimensions;

  // Get the current sitecore-xp platform dimensions from DB (already saved by research pipeline)
  // We'll read them back after saving so we can report counts, but for the seed
  // we just need the 4 Sitecore-specific infrastructure dimensions + the 6 platform dims.

  const awsDims = allInfraDims.filter((d: any) => AWS_DIM_IDS.includes(d.id));
  const scInfraDims = allInfraDims.filter((d: any) => SC_INFRA_DIM_IDS.includes(d.id));

  // Save aws discovery tree (13 generic infrastructure dimensions)
  const awsTreeResult = await saveDiscoveryTree(db, {
    pack_id: "aws",
    dimensions: awsDims,
  });
  console.log(`  aws discovery tree saved: ${awsDims.length} dimensions (version ${awsTreeResult.version})`);

  // Save sitecore-xp discovery tree: 4 Sitecore-specific infra dims + 6 platform dims
  // The 6 platform dims are defined inline (same as what the research pipeline generated)
  const scPlatformDims = [
    {
      id: "content_data",
      label: "Content & Data Volume",
      order: 1,
      description: "Content items, languages, types, workflows, and media assets that must be migrated",
      questions: [
        { id: "content_total_item_count", label: "Total content item count", type: "select", options: ["< 5,000", "5,000-20,000", "20,000-50,000", "50,000-100,000", "100,000+"], required: true, help: "Total Sitecore items across all databases (master + web). Check via Sitecore PowerShell: Get-ChildItem -Path 'master:/' -Recurse | Measure-Object" },
        { id: "content_language_count", label: "Number of content languages", type: "number", default: 1, required: true, help: "Count of language versions configured in /sitecore/system/Languages" },
        { id: "content_type_count", label: "Number of content types (templates)", type: "select", options: ["< 10", "10-30", "30-60", "60-100", "100+"], required: true, help: "Custom data templates under /sitecore/templates (excluding system templates)" },
        { id: "content_workflow_complexity", label: "Workflow complexity", type: "select", options: ["None", "Simple (approve/reject)", "Multi-step (3+ states)", "Complex (branching, role-based)"], required: true, help: "Complexity of content approval workflows configured in Sitecore" },
        { id: "content_publishing_frequency", label: "Publishing frequency", type: "select", options: ["Rare (weekly or less)", "Regular (daily)", "Frequent (multiple times daily)", "Continuous (near real-time)"], required: true, help: "How often content is published to web database(s)" },
        { id: "content_tree_depth", label: "Content tree depth", type: "select", options: ["Shallow (< 5 levels)", "Medium (5-10 levels)", "Deep (10-20 levels)", "Very deep (20+ levels)"], required: true, help: "Maximum nesting depth of the Sitecore content tree. Deep trees can cause path length issues on Azure" },
        { id: "content_media_items_count", label: "Media library item count", type: "select", options: ["< 1,000", "1,000-10,000", "10,000-50,000", "50,000+"], required: true, help: "Total items in the Sitecore media library" },
        { id: "content_personalization_rules_count", label: "Number of personalization rules", type: "select", options: ["None", "1-10", "10-50", "50-100", "100+"], required: false, condition: "content_workflow_complexity != 'None'", help: "Active personalization rules and conditional renderings across the site" },
        { id: "content_multisite_shared_content", label: "Shared content across sites/languages?", type: "select", options: ["No shared content", "Some shared components", "Extensive content sharing", "Cloned items across sites"], required: false, condition: "content_language_count > 1", help: "Whether content items or datasources are shared across multiple sites or language versions" },
      ],
    },
    {
      id: "customization",
      label: "Customization Depth",
      order: 2,
      description: "Custom pipelines, renderings, config patches, solution architecture, and code quality",
      questions: [
        { id: "customization_pipeline_count", label: "Custom pipeline processor count", type: "select", options: ["0", "1-5", "6-15", "16-30", "30+"], required: true, help: "Number of custom Sitecore pipeline processors (httpRequestBegin, renderRendering, publishItem, etc.)" },
        { id: "customization_rendering_count", label: "Custom rendering/component count", type: "select", options: ["< 10", "10-30", "30-60", "60-100", "100+"], required: true, help: "Total custom renderings (Controller Renderings, View Renderings, JSS components)" },
        { id: "customization_config_patch_count", label: "Configuration patch file count", type: "select", options: ["< 5", "5-15", "16-30", "30-50", "50+"], required: true, help: "Number of custom .config patch files in App_Config/Include and Environment folders" },
        { id: "customization_helix_structure", label: "Helix architecture compliance", type: "select", options: ["Yes (strict Helix)", "Partially (Helix-inspired)", "No (monolithic or custom)", "Unknown"], required: true, help: "Whether the solution follows Sitecore Helix architecture principles (Feature/Foundation/Project layers)" },
        { id: "customization_orm_usage", label: "ORM / mapping framework", type: "select", options: ["Glass Mapper", "Synthesis", "Fortis", "No ORM (raw Sitecore API)", "Custom ORM", "Mixed"], required: true, help: "Which ORM or item mapping framework is used to access Sitecore items in code" },
        { id: "customization_scheduled_agents", label: "Custom scheduled agent count", type: "select", options: ["0", "1-3", "4-8", "8+"], required: true, help: "Number of custom Sitecore scheduled agents/tasks (not Windows Task Scheduler)" },
        { id: "customization_event_handlers", label: "Custom event handler count", type: "select", options: ["0", "1-5", "6-15", "15+"], required: true, help: "Number of custom event handlers (item:saved, item:created, publish:end, etc.)" },
        { id: "customization_custom_api_endpoints", label: "Custom API endpoint count", type: "select", options: ["0", "1-5", "6-15", "15+"], required: true, help: "Custom Web API controllers, API endpoints, or custom handlers exposed by Sitecore" },
        { id: "customization_code_quality", label: "Code quality assessment", type: "select", options: ["High (documented, tested, CI)", "Medium (some docs, some tests)", "Low (no docs, no tests)", "Unknown"], required: true, help: "Overall assessment of code quality, documentation, and test coverage" },
        { id: "customization_glass_mapper_version", label: "Glass Mapper version", type: "select", options: ["v4.x", "v5.x", "v6.x (latest)", "Unknown"], required: false, condition: "customization_orm_usage == 'Glass Mapper'", help: "Glass Mapper version in use — older versions may have compatibility issues with newer Sitecore" },
        { id: "customization_helix_layer_count", label: "Helix project/module count", type: "select", options: ["< 10 modules", "10-25 modules", "25-50 modules", "50+ modules"], required: false, condition: "customization_helix_structure == 'Yes (strict Helix)' OR customization_helix_structure == 'Partially (Helix-inspired)'", help: "Total number of Helix Feature/Foundation/Project modules in the Visual Studio solution" },
      ],
    },
    {
      id: "frontend",
      label: "Frontend Architecture",
      order: 3,
      description: "Rendering approach, JavaScript frameworks, build pipelines, and component architecture",
      questions: [
        { id: "frontend_rendering_approach", label: "Primary rendering approach", type: "select", options: ["MVC (traditional)", "SXA (Sitecore Experience Accelerator)", "JSS (JavaScript Services)", "Headless (Next.js/React)", "Mixed (MVC + JSS)", "Other"], required: true, help: "The primary rendering technology used to generate pages" },
        { id: "frontend_rendering_host", label: "Rendering host", type: "select", options: ["No separate host (server-side MVC)", "Node.js (Express/custom)", "Next.js (SSR/SSG)", "Custom rendering host"], required: true, help: "Whether a separate rendering host (Node.js, Next.js) runs alongside Sitecore" },
        { id: "frontend_build_pipeline", label: "Frontend build pipeline", type: "select", options: ["None (server-only)", "Webpack", "Gulp/Grunt", "Vite", "Next.js built-in", "Custom"], required: true, help: "Build tooling used for frontend assets (CSS, JS, images)" },
        { id: "frontend_js_framework", label: "JavaScript framework", type: "select", options: ["None", "jQuery", "React", "Angular", "Vue", "Next.js", "Other"], required: true, help: "Primary JavaScript framework used on the frontend" },
        { id: "frontend_component_count", label: "Frontend component count", type: "select", options: ["< 20", "20-50", "50-100", "100-200", "200+"], required: true, help: "Total frontend components (React components, MVC views, SXA renderings)" },
        { id: "frontend_design_system", label: "Design system / CSS framework", type: "select", options: ["None (ad-hoc)", "Custom design system", "Bootstrap", "Material UI", "SXA grid system", "Other"], required: true, help: "CSS framework or design system in use" },
        { id: "frontend_responsive_complexity", label: "Responsive design complexity", type: "select", options: ["Desktop only", "Basic responsive", "Full responsive (all breakpoints)", "Responsive + AMP/PWA"], required: true, help: "How many device form factors the frontend supports" },
        { id: "frontend_jss_app_count", label: "JSS application count", type: "select", options: ["1", "2-3", "4-6", "6+"], required: false, condition: "frontend_rendering_approach == 'JSS (JavaScript Services)' OR frontend_rendering_approach == 'Headless (Next.js/React)' OR frontend_rendering_approach == 'Mixed (MVC + JSS)'", help: "Number of separate JSS/headless applications registered in Sitecore" },
        { id: "frontend_sxa_theme_count", label: "SXA theme count", type: "select", options: ["1", "2-3", "4-6", "6+"], required: false, condition: "frontend_rendering_approach == 'SXA (Sitecore Experience Accelerator)'", help: "Number of custom SXA themes in use" },
      ],
    },
    {
      id: "team_timeline",
      label: "Team & Timeline",
      order: 4,
      description: "Team composition, experience levels, deadlines, and training requirements",
      questions: [
        { id: "team_total_size", label: "Total migration team size", type: "select", options: ["1-2 people", "3-5 people", "6-10 people", "10+ people"], required: true, help: "Total people actively working on the migration (client + partner)" },
        { id: "team_sitecore_experience", label: "Sitecore experience level", type: "select", options: ["Expert (5+ years)", "Experienced (2-5 years)", "Some experience (< 2 years)", "No Sitecore experience"], required: true, help: "Average Sitecore-specific experience of the migration team" },
        { id: "team_target_platform_experience", label: "Azure/target platform experience", type: "select", options: ["Expert (certified, 3+ years)", "Experienced (1-3 years)", "Some experience", "No Azure experience"], required: true, help: "Average Azure experience of the migration team" },
        { id: "team_parallel_workstreams", label: "Parallel workstreams possible", type: "select", options: ["1 (sequential)", "2 parallel", "3 parallel", "4+ parallel"], required: true, help: "How many migration workstreams can run simultaneously based on team capacity" },
        { id: "team_hard_deadline", label: "Hard deadline pressure", type: "select", options: ["No deadline", "Flexible deadline", "Fixed deadline (< 3 months away)", "Imminent deadline (< 6 weeks away)"], required: true, help: "Whether there is a hard deadline driving the migration timeline" },
        { id: "team_training_needs", label: "Training areas needed", type: "multi-select", options: ["None needed", "Azure fundamentals", "Sitecore on Azure", "Infrastructure as Code", "CI/CD pipelines", "Monitoring & observability"], required: true, help: "Training the team will need before or during the migration" },
        { id: "team_deadline_date", label: "Target deadline date", type: "text", required: false, condition: "team_hard_deadline == 'Fixed deadline (< 3 months away)' OR team_hard_deadline == 'Imminent deadline (< 6 weeks away)'", help: "Specific target date for migration completion (if known)" },
      ],
    },
    {
      id: "modules",
      label: "Third-Party Module Inventory",
      order: 5,
      description: "Marketplace modules, custom forks, version compatibility, and licensing",
      questions: [
        { id: "modules_marketplace_count", label: "Marketplace/third-party module count", type: "select", options: ["0", "1-3", "4-8", "9-15", "15+"], required: true, help: "Total third-party or Sitecore marketplace modules installed" },
        { id: "modules_marketplace_list", label: "Key modules in use", type: "multi-select", options: ["SXA", "Sitecore Forms", "EXM (Email Experience Manager)", "Publishing Service", "Horizon", "Coveo for Sitecore", "Sitecore Commerce", "WFFM (Web Forms for Marketers)", "Other"], required: true, help: "Which major Sitecore modules and third-party integrations are installed" },
        { id: "modules_custom_forks", label: "Custom-forked modules", type: "select", options: ["None", "1-2 lightly modified", "3+ significantly modified", "Unknown"], required: true, help: "Whether any third-party modules have been forked/modified from their original source" },
        { id: "modules_version_compatibility", label: "Module version compatibility", type: "select", options: ["All verified compatible", "Mostly compatible", "Several incompatible", "Unknown"], required: true, help: "Whether installed module versions are compatible with the target Sitecore version" },
        { id: "modules_license_portability", label: "License portability", type: "select", options: ["All licenses portable", "Some need re-licensing", "Unknown"], required: true, help: "Whether third-party module licenses can be transferred to the Azure environment" },
        { id: "modules_deprecated", label: "Deprecated modules in use", type: "select", options: ["None", "1 deprecated module", "2+ deprecated modules", "Unknown"], required: true, help: "Whether any installed modules are deprecated or end-of-life (e.g., WFFM)" },
        { id: "modules_other_list", label: "Other modules (list)", type: "text", required: false, condition: "modules_marketplace_list contains 'Other'", help: "List any other third-party modules not in the options above" },
        { id: "modules_incompatible_list", label: "Incompatible modules (list)", type: "text", required: false, condition: "modules_version_compatibility == 'Several incompatible'", help: "List the modules that are known to be incompatible with the target version" },
      ],
    },
    {
      id: "performance",
      label: "Performance Baselines",
      order: 6,
      description: "Current performance metrics, SLAs, and capacity requirements to maintain post-migration",
      questions: [
        { id: "performance_page_load_p50", label: "Page load time (p50)", type: "select", options: ["< 1s", "1-2s", "2-4s", "4-8s", "8s+", "Unknown"], required: true, help: "Median (p50) page load time for end users" },
        { id: "performance_ttfb", label: "Time to first byte (TTFB)", type: "select", options: ["< 200ms", "200-500ms", "500ms-1s", "1s+", "Unknown"], required: true, help: "Server response time before content starts loading" },
        { id: "performance_cache_hit_rate", label: "Cache hit rate", type: "select", options: ["90%+", "70-90%", "50-70%", "< 50%", "No caching", "Unknown"], required: true, help: "Percentage of requests served from cache (CDN + application cache)" },
        { id: "performance_publish_duration", label: "Full site publish duration", type: "select", options: ["< 5 minutes", "5-15 minutes", "15-30 minutes", "30-60 minutes", "60+ minutes", "Unknown"], required: true, help: "Time for a full site republish operation" },
        { id: "performance_peak_traffic", label: "Peak concurrent users", type: "select", options: ["< 100", "100-500", "500-2,000", "2,000-10,000", "10,000+", "Unknown"], required: true, help: "Peak concurrent user count during high-traffic periods" },
        { id: "performance_availability_sla", label: "Availability SLA", type: "select", options: ["None defined", "99.0%", "99.5%", "99.9%", "99.95%+"], required: true, help: "Contractual or business availability SLA for the Sitecore platform" },
        { id: "performance_load_test_exists", label: "Load testing available?", type: "select", options: ["Yes, recent results available", "Yes, but outdated", "No load testing done"], required: false, condition: "performance_peak_traffic != '< 100' AND performance_peak_traffic != 'Unknown'", help: "Whether load/performance test results exist that can be used as post-migration comparison baseline" },
      ],
    },
  ];

  // Renumber sitecore-xp infra dims to come after platform dims (order 7-10)
  const scInfraDimsNumbered = scInfraDims.map((d: any, i: number) => ({ ...d, order: 7 + i }));
  const scAllDims = [...scPlatformDims, ...scInfraDimsNumbered];

  const scTreeResult = await saveDiscoveryTree(db, {
    pack_id: "sitecore-xp",
    dimensions: scAllDims,
  });
  console.log(
    `  sitecore-xp discovery tree saved: ${scAllDims.length} dimensions ` +
    `(${scPlatformDims.length} platform + ${scInfraDims.length} infra) (version ${scTreeResult.version})`
  );

  // ──────────────────────────────────────────────
  // 3. Heuristics — split between aws and sitecore-xp
  // ──────────────────────────────────────────────
  console.log("\n[3/6] Saving heuristics (split between aws and sitecore-xp)...");

  const baseEffort = loadJson("heuristics/base-effort-hours.json");
  const multipliers = loadJson("heuristics/complexity-multipliers.json");
  const gotchas = loadJson("heuristics/gotcha-patterns.json");
  const deps = loadJson("heuristics/dependency-chains.json");

  // Transform all data first, then split
  const allEffortHours = Object.entries(baseEffort.components).map(
    ([componentId, data]: [string, any]) => ({
      component_id: componentId,
      component_name: componentId.replace(/_/g, " "),
      base_hours: data.base_hours,
      unit: data.unit,
      includes: data.includes,
      role_breakdown: data.role_breakdown,
      phase_id: findPhaseForComponent(componentId, baseEffort.phase_mapping),
    })
  );

  const allMultiplierRows = multipliers.multipliers.map((m: any) => ({
    multiplier_id: m.id,
    condition: m.condition,
    factor: m.multiplier,
    applies_to: m.applies_to,
    reason: m.reason,
    supersedes: m.supersedes || null,
  }));

  const allGotchaRows = gotchas.patterns.map((p: any) => ({
    pattern_id: p.id,
    pattern_condition: p.pattern,
    risk_level: p.risk,
    hours_impact: p.hours_impact,
    description: p.description,
    mitigation: p.mitigation,
    affected_components: p.affected_components || [],
  }));

  const allChainRows = deps.dependencies.map((d: any) => ({
    chain_id: d.id,
    predecessor: d.predecessor,
    successors: d.successors,
    dependency_type: d.type,
    reason: d.reason,
  }));

  // All 5 roles go in both packs (deduplicated by composition engine)
  const roles = Object.entries(baseEffort.roles).map(
    ([roleId, data]: [string, any]) => ({
      role_id: roleId,
      description: data.description,
      typical_rate_range: data.typical_rate_range,
    })
  );

  // Split into aws vs sitecore-xp
  const awsEffort = allEffortHours.filter((e) => AWS_COMPONENT_IDS.has(e.component_id));
  const scEffort = allEffortHours.filter((e) => !AWS_COMPONENT_IDS.has(e.component_id));

  const awsMultipliers = allMultiplierRows.filter((m: any) => AWS_MULTIPLIER_IDS.has(m.multiplier_id));
  const scMultipliers = allMultiplierRows.filter((m: any) => !AWS_MULTIPLIER_IDS.has(m.multiplier_id));

  const awsGotchas = allGotchaRows.filter((g: any) => AWS_GOTCHA_IDS.has(g.pattern_id));
  const scGotchas = allGotchaRows.filter((g: any) => !AWS_GOTCHA_IDS.has(g.pattern_id));

  const awsChains = allChainRows.filter((c: any) => AWS_CHAIN_IDS.has(c.chain_id));
  const scChains = allChainRows.filter((c: any) => !AWS_CHAIN_IDS.has(c.chain_id));

  // Phase mappings per pack
  const awsPhases = Object.entries(AWS_PHASE_MAPPING).map(
    ([phaseId, componentIds], index) => ({
      phase_id: phaseId,
      phase_name: phaseId.replace(/^phase_\d+b?_/, "").replace(/_/g, " "),
      phase_order: index + 1,
      component_ids: componentIds,
    })
  );

  const scPhases = Object.entries(SC_PHASE_MAPPING).map(
    ([phaseId, componentIds], index) => ({
      phase_id: phaseId,
      phase_name: phaseId.replace(/^phase_\d+b?_/, "").replace(/_/g, " "),
      phase_order: index + 1,
      component_ids: componentIds,
    })
  );

  // Save aws heuristics
  await saveHeuristics(db, {
    pack_id: "aws",
    effort_hours: awsEffort,
    multipliers: awsMultipliers,
    gotcha_patterns: awsGotchas,
    dependency_chains: awsChains,
    phase_mappings: awsPhases,
    roles,
  });
  console.log(
    `  aws heuristics saved: ${awsEffort.length} components, ${awsMultipliers.length} multipliers, ` +
    `${awsGotchas.length} gotchas, ${awsChains.length} chains, ${awsPhases.length} phases, ${roles.length} roles`
  );

  // Save sitecore-xp heuristics
  await saveHeuristics(db, {
    pack_id: "sitecore-xp",
    effort_hours: scEffort,
    multipliers: scMultipliers,
    gotcha_patterns: scGotchas,
    dependency_chains: scChains,
    phase_mappings: scPhases,
    roles,
  });
  console.log(
    `  sitecore-xp heuristics saved: ${scEffort.length} components, ${scMultipliers.length} multipliers, ` +
    `${scGotchas.length} gotchas, ${scChains.length} chains, ${scPhases.length} phases, ${roles.length} roles`
  );

  // Verify no double-counting
  const totalComponents = awsEffort.length + scEffort.length;
  const totalMultipliers = awsMultipliers.length + scMultipliers.length;
  const totalGotchas = awsGotchas.length + scGotchas.length;
  const totalChains = awsChains.length + scChains.length;
  console.log(
    `  Totals: ${totalComponents} components (11+16), ${totalMultipliers} multipliers (16+25), ` +
    `${totalGotchas} gotchas (14+15), ${totalChains} chains (13+11)`
  );

  // ──────────────────────────────────────────────
  // 4. Migration Path: sitecore-xp on AWS → Azure
  // ──────────────────────────────────────────────
  console.log("\n[4/6] Saving migration path (aws -> azure)...");

  const serviceMap = loadJson("knowledge/aws-to-azure-service-map.json");
  const incompatibilities = loadMarkdown("knowledge/known-incompatibilities.md");

  await saveMigrationPath(db, {
    id: "aws->azure",
    source_pack_id: "aws",
    target_pack_id: "azure",
    prevalence: "very_common",
    complexity: "complex",
    typical_duration: "8-16 weeks",
    primary_drivers: [
      "Microsoft EA/licensing alignment",
      "Azure AD integration",
      "Sitecore Azure PaaS support",
      "Cost optimization",
      "Compliance requirements",
    ],
    prerequisites: [
      "Azure subscription provisioned",
      "Azure AD tenant configured",
      "Network connectivity (VPN/ExpressRoute) planned",
      "Sitecore license valid for target environment",
    ],
    service_map: serviceMap,
    migration_tools: [
      {
        name: "Azure Database Migration Service",
        purpose: "SQL Server database migration with continuous sync",
        url: "https://learn.microsoft.com/en-us/azure/dms/",
        vendor: "Microsoft",
      },
      {
        name: "AzCopy",
        purpose: "High-performance blob/file transfer from S3 to Azure Blob Storage",
        url: "https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azcopy-v10",
        vendor: "Microsoft",
      },
      {
        name: "Azure Migrate",
        purpose: "VM discovery, assessment, and migration from AWS EC2",
        url: "https://learn.microsoft.com/en-us/azure/migrate/",
        vendor: "Microsoft",
      },
      {
        name: "Azure Site Recovery",
        purpose: "VM replication and failover from AWS to Azure",
        url: "https://learn.microsoft.com/en-us/azure/site-recovery/",
        vendor: "Microsoft",
      },
    ],
    path_gotcha_patterns: [
      {
        pattern_id: "path-gotcha-s3-sdk-references",
        pattern_condition: "storage_media_strategy == 'Amazon S3 (via blob provider)' AND integrations_custom_api_count > 0",
        risk_level: "medium",
        hours_impact: 12,
        description:
          "S3 SDK calls in custom Sitecore handlers/providers must be replaced with Azure Blob Storage SDK",
        mitigation:
          "Audit all code for AWS SDK references. Replace S3Client with BlobServiceClient. Update SAS token patterns.",
        affected_components: ["blob_storage", "custom_integration"],
      },
      {
        pattern_id: "path-gotcha-iam-to-rbac",
        pattern_condition: "compute_hosting_model == 'EC2 instances (standalone)'",
        risk_level: "high",
        hours_impact: 16,
        description:
          "AWS IAM role-based auth must be completely re-architected for Azure RBAC + Managed Identity",
        mitigation:
          "Map all IAM roles to Azure RBAC role assignments. Replace EC2 instance profiles with Managed Identity. Update all service-to-service auth.",
        affected_components: ["managed_identity_keyvault", "custom_integration"],
      },
      {
        pattern_id: "path-gotcha-connection-string-format",
        pattern_condition: "database_engine == 'Amazon RDS for SQL Server'",
        risk_level: "low",
        hours_impact: 4,
        description:
          "RDS SQL Server connection strings use different format than Azure SQL MI. All Sitecore connection strings must be updated.",
        mitigation:
          "Update all ConnectionStrings.config entries. Replace RDS endpoint with Azure SQL MI endpoint. Update auth from SQL auth to Managed Identity if applicable.",
        affected_components: ["database_single"],
      },
    ],
    path_effort_adjustments: [
      {
        component_id: "networking_vnet",
        adjustment_hours: 8,
        reason:
          "AWS VPC → Azure VNet translation requires CIDR replanning, NSG rule translation from security groups, and different subnet model",
      },
      {
        component_id: "managed_identity_keyvault",
        adjustment_hours: 8,
        reason:
          "IAM-to-RBAC migration adds overhead: mapping all IAM policies to Azure roles, replacing instance profiles with Managed Identity",
      },
    ],
    step_by_step: `## AWS to Azure Migration Steps

1. **Assessment & Planning** (Week 1-2)
   - Inventory all AWS resources (EC2, RDS, S3, ElastiCache, etc.)
   - Map each service to Azure equivalent using service map
   - Identify incompatibilities and plan workarounds
   - Design Azure landing zone (VNet, subnets, NSGs)

2. **Azure Landing Zone** (Week 2-3)
   - Provision Azure subscription and resource groups
   - Deploy networking (VNet, subnets, NSGs, VPN/ExpressRoute)
   - Configure Azure AD and RBAC
   - Set up Key Vault and Managed Identity

3. **Data Layer Migration** (Week 3-5)
   - Set up Azure Database Migration Service
   - Begin continuous replication of SQL Server databases
   - Transfer S3 data to Azure Blob Storage via AzCopy
   - Migrate ElastiCache to Azure Cache for Redis

4. **Compute & Application** (Week 4-6)
   - Provision Azure VMs matching EC2 instance specs
   - Install and configure Sitecore roles
   - Deploy Solr on Azure VMs or AKS
   - Configure Identity Server and xConnect

5. **Services & Integration** (Week 5-7)
   - Set up Azure CDN/Front Door
   - Configure monitoring (Azure Monitor, Application Insights)
   - Update CI/CD pipelines for Azure deployment
   - Migrate custom integrations (update SDK references)

6. **Testing** (Week 6-8)
   - Functional testing of all Sitecore features
   - Performance testing and tuning
   - Security validation
   - UAT with stakeholders

7. **Cutover** (Week 8-9)
   - Final database sync
   - DNS cutover
   - Smoke testing
   - Go/no-go decision

8. **Post-Migration** (Week 9-10)
   - Monitor for issues
   - Performance optimization
   - Decommission AWS resources
   - Documentation updates`,
    decision_points: `## Key Decision Points

### 1. Database Target: Azure SQL MI vs Azure SQL Database
- **SQL MI**: Near-100% SQL Server compatibility, supports CLR, linked servers, cross-DB queries
- **SQL DB**: Lower cost, fully managed, but feature gaps
- **Recommendation**: SQL MI for Sitecore (full compatibility required)

### 2. Search: Solr on VM vs Azure Cognitive Search
- **Solr on VM**: Closest to current state, less risk, more operational overhead
- **Azure Cognitive Search**: Managed service, less ops, but requires Sitecore search provider swap
- **Recommendation**: Solr on VM for lift-and-shift; Azure Search for modernization

### 3. Hosting: IaaS (VMs) vs PaaS (App Service) vs Containers (AKS)
- **VMs**: Closest to current EC2 setup, fastest migration path
- **App Service**: Managed hosting, but Sitecore XP has limitations on PaaS
- **AKS**: Future-proof, but significant containerization effort
- **Recommendation**: VMs for initial migration; plan PaaS/AKS as Phase 2

### 4. Networking: Direct VPN vs ExpressRoute
- **VPN**: Lower cost, simpler setup, suitable for most migrations
- **ExpressRoute**: Dedicated connection, better for large data transfers
- **Recommendation**: VPN for most cases; ExpressRoute if >500GB data or strict latency requirements`,
    incompatibilities,
    confidence: "verified",
    last_researched: new Date().toISOString(),
    version: "1",
  });
  console.log("  aws->azure migration path saved");

  // ──────────────────────────────────────────────
  // 5. Sitecore topologies (save as metadata on the pack)
  // ──────────────────────────────────────────────
  console.log("\n[5/6] Updating sitecore-xp pack with topology data...");

  const topologies = loadJson("knowledge/sitecore-xp-topologies.json");
  await saveKnowledgePack(db, {
    id: "sitecore-xp",
    name: "Sitecore XP",
    category: "cms",
    confidence: "verified",
    valid_topologies: Object.keys(topologies.topologies).map((k) => ({
      id: k,
      ...topologies.topologies[k],
    })),
  });
  console.log(`  sitecore-xp updated with ${Object.keys(topologies.topologies).length} topologies`);

  // ──────────────────────────────────────────────
  // 6. Summary
  // ──────────────────────────────────────────────
  console.log("\n[6/6] Seed complete!");
  console.log("─".repeat(60));
  console.log("Knowledge Packs:  sitecore-xp, aws, azure");
  console.log(`Discovery Trees:  aws (${awsDims.length} dims), sitecore-xp (${scAllDims.length} dims)`);
  console.log(
    `AWS Heuristics:   ${awsEffort.length} components, ${awsMultipliers.length} multipliers, ` +
    `${awsGotchas.length} gotchas, ${awsChains.length} chains`
  );
  console.log(
    `SC Heuristics:    ${scEffort.length} components, ${scMultipliers.length} multipliers, ` +
    `${scGotchas.length} gotchas, ${scChains.length} chains`
  );
  console.log(`Roles:            ${roles.length} (in both packs)`);
  console.log("Migration Path:   aws->azure");
  console.log("─".repeat(60));

  await closeDb();
  console.log("\nDatabase connection closed.");
}

function findPhaseForComponent(
  componentId: string,
  phaseMapping: Record<string, string[]>
): string {
  for (const [phaseId, components] of Object.entries(phaseMapping)) {
    if (components.includes(componentId)) {
      return phaseId;
    }
  }
  return "";
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
