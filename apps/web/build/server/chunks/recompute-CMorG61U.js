import { d as db } from './db-BWpbog7L.js';
import { g as getAssessmentById } from './assessments-DKcL9-FM.js';
import { g as getDiscovery } from './discovery-ZQezVmz4.js';
import { g as getAnalysis, s as saveAnalysis } from './analysis-BcZv0btd.js';
import { s as saveEstimate } from './estimates-zTf3XwgF.js';
import { getAiAlternatives, getComposedKnowledge, getDependencyChains } from './knowledge-CxzzbHNI.js';
import { readFileSync, existsSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';

function flattenDiscovery(discovery) {
  if (!discovery) return {};
  const flat = {};
  for (const dim of Object.values(discovery)) {
    if (!dim?.answers) continue;
    for (const [qId, answer] of Object.entries(dim.answers)) {
      const ans = answer;
      flat[qId] = ans.value;
    }
  }
  return flat;
}
function resolveValue(key, answers) {
  return answers[key];
}
function tokenize(condition) {
  const tokens = [];
  const parts = condition.match(
    /(?:'[^']*'|"[^"]*"|>=|<=|!=|==|>|<|\bAND\b|\bOR\b|\bcontains\b|[^\s'"><=!]+)/g
  );
  if (!parts) return tokens;
  for (const part of parts) {
    if (part === "AND" || part === "OR") {
      tokens.push({ type: "logic", value: part });
    } else if (part === "contains") {
      tokens.push({ type: "contains" });
    } else if (["==", "!=", ">", ">=", "<", "<="].includes(part)) {
      tokens.push({ type: "op", value: part });
    } else if (/^'.*'$/.test(part) || /^".*"$/.test(part)) {
      tokens.push({ type: "literal", value: part.slice(1, -1) });
    } else if (part === "true") {
      tokens.push({ type: "literal", value: true });
    } else if (part === "false") {
      tokens.push({ type: "literal", value: false });
    } else if (/^-?\d+(\.\d+)?$/.test(part)) {
      tokens.push({ type: "literal", value: Number(part) });
    } else {
      tokens.push({ type: "key", value: part });
    }
  }
  return tokens;
}
function evaluateComparison(left, op, right) {
  const numLeft = Number(left);
  const numRight = Number(right);
  const bothNumeric = !isNaN(numLeft) && !isNaN(numRight) && left !== "" && left !== null && left !== void 0;
  switch (op) {
    case "==":
      if (bothNumeric) return numLeft === numRight;
      return String(left) === String(right);
    case "!=":
      if (bothNumeric) return numLeft !== numRight;
      return String(left) !== String(right);
    case ">":
      return bothNumeric && numLeft > numRight;
    case ">=":
      return bothNumeric && numLeft >= numRight;
    case "<":
      return bothNumeric && numLeft < numRight;
    case "<=":
      return bothNumeric && numLeft <= numRight;
    default:
      return false;
  }
}
function evaluateContains(left, right) {
  if (Array.isArray(left)) {
    return left.some((item) => String(item) === String(right));
  }
  if (typeof left === "string") {
    return left.includes(String(right));
  }
  return false;
}
function evaluateClause(tokens, answers) {
  if (tokens.length === 0) return false;
  if (tokens.length === 1 && tokens[0].type === "key") {
    const val = resolveValue(tokens[0].value, answers);
    return isTruthy(val);
  }
  if (tokens.length === 3 && tokens[1].type === "contains") {
    const t0 = tokens[0];
    const t2 = tokens[2];
    if (t0.type !== "key" && t0.type !== "literal") return false;
    const left = t0.type === "key" ? resolveValue(t0.value, answers) : t0.value;
    const right = t2.type === "literal" ? t2.value : t2.type === "key" ? resolveValue(t2.value, answers) : void 0;
    return evaluateContains(left, right);
  }
  if (tokens.length === 3 && tokens[1].type === "op") {
    const t0 = tokens[0];
    const t2 = tokens[2];
    if (t0.type !== "key" && t0.type !== "literal") return false;
    const left = t0.type === "key" ? resolveValue(t0.value, answers) : t0.value;
    const right = t2.type === "literal" ? t2.value : t2.type === "key" ? resolveValue(t2.value, answers) : void 0;
    return evaluateComparison(left, tokens[1].value, right);
  }
  return false;
}
function isTruthy(val) {
  if (val === null || val === void 0 || val === "" || val === false || val === 0) return false;
  if (Array.isArray(val)) return val.length > 0;
  return true;
}
function evaluateCondition(answers, condition) {
  if (!condition || !condition.trim()) return false;
  const tokens = tokenize(condition.trim());
  if (tokens.length === 0) return false;
  const andGroups = [];
  let current = [];
  for (const token of tokens) {
    if (token.type === "logic" && token.value === "AND") {
      andGroups.push(current);
      current = [];
    } else {
      current.push(token);
    }
  }
  andGroups.push(current);
  for (const group of andGroups) {
    const orClauses = [];
    let clause = [];
    for (const token of group) {
      if (token.type === "logic" && token.value === "OR") {
        orClauses.push(clause);
        clause = [];
      } else {
        clause.push(token);
      }
    }
    orClauses.push(clause);
    const groupResult = orClauses.some((c) => evaluateClause(c, answers));
    if (!groupResult) return false;
  }
  return true;
}
const QUESTION_COMPONENT_MAP = {
  // Compute
  compute_cm_instance_count: ["compute_single_role"],
  compute_cd_instance_count: ["compute_single_role", "redis_session", "cdn_setup", "testing_validation"],
  compute_ec2_instance_type_cm: ["compute_single_role"],
  compute_ec2_instance_type_cd: ["compute_single_role"],
  compute_os_version: ["compute_single_role"],
  compute_sitecore_version: ["compute_single_role", "identity_server", "xconnect_xdb"],
  compute_cd_autoscaling: ["compute_single_role"],
  compute_hosting_model: ["compute_single_role", "cicd_pipeline"],
  // Database
  database_engine: ["database_single"],
  database_sql_version: ["database_single"],
  database_rds_instance_class: ["database_single"],
  database_total_size_gb: ["database_single", "cutover_execution"],
  database_ha_config: ["database_single", "backup_dr"],
  database_separate_xdb: ["database_single", "xconnect_xdb"],
  database_custom_databases: ["database_single"],
  database_encryption_at_rest: ["database_single"],
  database_clr_assemblies: ["database_single"],
  database_linked_servers: ["database_single"],
  database_cross_db_queries: ["database_single"],
  database_compliance_requirements: ["database_single", "networking_vnet", "blob_storage"],
  // Search
  search_provider: ["solr_standalone", "solr_cloud"],
  search_solr_version: ["solr_standalone", "solr_cloud"],
  search_solr_node_count: ["solr_standalone", "solr_cloud"],
  search_solr_hosting: ["solr_standalone", "solr_cloud"],
  search_total_index_size_gb: ["solr_standalone", "solr_cloud"],
  search_custom_indexes: ["solr_standalone", "solr_cloud"],
  // Caching / Session
  caching_redis_in_use: ["redis_session"],
  caching_redis_hosting: ["redis_session"],
  caching_redis_node_type: ["redis_session"],
  caching_redis_cluster_mode: ["redis_session"],
  session_shared_provider: ["redis_session", "compute_single_role"],
  session_private_provider: ["compute_single_role"],
  // CDN
  cdn_in_use: ["cdn_setup"],
  cdn_provider: ["cdn_setup"],
  cdn_distribution_count: ["cdn_setup"],
  cdn_waf_enabled: ["cdn_setup"],
  // DNS
  dns_provider: ["dns_cutover"],
  dns_zone_count: ["dns_cutover"],
  dns_total_record_count: ["dns_cutover"],
  // SSL/TLS
  ssl_certificate_provider: ["ssl_tls"],
  ssl_certificate_count: ["ssl_tls"],
  ssl_certificate_pinning: ["ssl_tls", "custom_integration"],
  // Storage
  storage_media_strategy: ["blob_storage"],
  storage_media_total_size_gb: ["blob_storage"],
  storage_s3_bucket_count: ["blob_storage"],
  storage_shared_filesystem: ["blob_storage", "content_serialization_sync"],
  // xConnect
  xconnect_enabled: ["xconnect_xdb"],
  xconnect_instance_count: ["xconnect_xdb"],
  xconnect_contact_count: ["xconnect_xdb", "database_single"],
  xconnect_collection_db_type: ["xconnect_xdb"],
  // Identity
  identity_server_deployed: ["identity_server"],
  identity_server_hosting: ["identity_server"],
  identity_external_providers: ["identity_server"],
  // Integrations
  integrations_crm: ["custom_integration"],
  integrations_custom_api_count: ["custom_integration"],
  integrations_aws_services: ["custom_integration", "compute_single_role"],
  integrations_sitecore_modules: ["compute_single_role", "testing_validation"],
  integrations_sxa_site_count: ["compute_single_role", "cdn_setup", "solr_standalone", "solr_cloud", "testing_validation"],
  integrations_jss_rendering_host: ["compute_single_role", "cdn_setup", "cicd_pipeline"],
  integrations_publishing_service_hosting: ["publishing_service", "compute_single_role"],
  // CI/CD
  cicd_platform: ["cicd_pipeline"],
  cicd_source_control: ["cicd_pipeline"],
  cicd_deployment_strategy: ["cicd_pipeline"],
  cicd_environment_count: ["networking_vnet", "compute_single_role", "database_single", "monitoring_setup", "cicd_pipeline"],
  cicd_item_serialization: ["content_serialization_sync"],
  // Monitoring
  monitoring_apm_tool: ["monitoring_setup"],
  monitoring_log_aggregation: ["monitoring_setup"],
  // Networking
  networking_vpc_count: ["networking_vnet"],
  networking_subnet_tiers: ["networking_vnet"],
  networking_vpn_connection: ["networking_vnet"],
  networking_topology_pattern: ["networking_vnet"],
  networking_load_balancer_type: ["networking_vnet"],
  // Backup / DR
  backup_database_strategy: ["backup_dr"],
  backup_rpo_hours: ["backup_dr"],
  backup_rto_hours: ["backup_dr", "compute_single_role", "database_single"],
  backup_dr_strategy: ["backup_dr", "database_single", "networking_vnet"],
  // Email
  email_smtp_provider: ["custom_integration"],
  // Content & Data Volume
  content_total_item_count: ["content_migration", "cutover_execution"],
  content_language_count: ["content_migration", "testing_validation"],
  content_type_count: ["content_migration"],
  content_workflow_complexity: ["content_migration", "testing_validation"],
  content_publishing_frequency: ["content_migration", "cutover_execution"],
  content_tree_depth: ["content_migration", "content_serialization_sync"],
  content_media_items_count: ["content_migration", "blob_storage"],
  content_personalization_rules_count: ["content_migration", "xconnect_xdb", "testing_validation"],
  content_multisite_shared_content: ["content_migration", "testing_validation"],
  // Customization Depth
  customization_pipeline_count: ["code_migration", "testing_validation"],
  customization_rendering_count: ["frontend_rebuild", "testing_validation"],
  customization_config_patch_count: ["code_migration"],
  customization_helix_structure: ["code_migration"],
  customization_orm_usage: ["code_migration"],
  customization_scheduled_agents: ["code_migration", "compute_single_role"],
  customization_event_handlers: ["code_migration", "testing_validation"],
  customization_custom_api_endpoints: ["code_migration", "custom_integration"],
  customization_code_quality: ["code_migration", "testing_validation"],
  customization_glass_mapper_version: ["code_migration"],
  customization_helix_layer_count: ["code_migration"],
  // Frontend Architecture
  frontend_rendering_approach: ["frontend_rebuild", "compute_single_role"],
  frontend_rendering_host: ["frontend_rebuild", "compute_single_role"],
  frontend_build_pipeline: ["frontend_rebuild", "cicd_pipeline"],
  frontend_js_framework: ["frontend_rebuild"],
  frontend_component_count: ["frontend_rebuild", "testing_validation"],
  frontend_design_system: ["frontend_rebuild"],
  frontend_responsive_complexity: ["frontend_rebuild", "testing_validation"],
  frontend_jss_app_count: ["frontend_rebuild", "compute_single_role", "cdn_setup"],
  frontend_sxa_theme_count: ["frontend_rebuild", "testing_validation"],
  // Team & Timeline
  team_total_size: ["project_management"],
  team_sitecore_experience: ["code_migration", "content_migration", "testing_validation"],
  team_target_platform_experience: ["compute_single_role", "networking_vnet", "database_single", "monitoring_setup"],
  team_parallel_workstreams: ["project_management"],
  team_hard_deadline: ["project_management", "testing_validation"],
  team_training_needs: ["training"],
  team_deadline_date: ["project_management"],
  // Third-Party Modules
  modules_marketplace_count: ["code_migration", "testing_validation"],
  modules_marketplace_list: ["code_migration", "testing_validation"],
  modules_custom_forks: ["code_migration", "testing_validation"],
  modules_version_compatibility: ["code_migration", "testing_validation"],
  modules_license_portability: ["project_management"],
  modules_deprecated: ["code_migration", "testing_validation"],
  modules_other_list: ["code_migration"],
  modules_incompatible_list: ["code_migration"],
  // Performance Baselines
  performance_page_load_p50: ["testing_validation"],
  performance_ttfb: ["testing_validation", "compute_single_role"],
  performance_cache_hit_rate: ["testing_validation", "cdn_setup", "redis_session"],
  performance_publish_duration: ["testing_validation", "content_migration"],
  performance_peak_traffic: ["testing_validation", "compute_single_role", "cdn_setup"],
  performance_availability_sla: ["backup_dr", "compute_single_role", "networking_vnet"],
  performance_load_test_exists: ["testing_validation"]
};
const DIMENSION_COMPONENT_MAP = {
  compute: ["compute_single_role"],
  database: ["database_single"],
  search: ["solr_standalone", "solr_cloud"],
  caching: ["redis_session"],
  cdn: ["cdn_setup"],
  dns: ["dns_cutover"],
  ssl_tls: ["ssl_tls"],
  storage: ["blob_storage"],
  email: ["custom_integration"],
  xconnect: ["xconnect_xdb"],
  identity: ["identity_server"],
  session_state: ["redis_session", "compute_single_role"],
  custom_integrations: ["custom_integration"],
  cicd: ["cicd_pipeline", "content_serialization_sync"],
  monitoring: ["monitoring_setup"],
  networking: ["networking_vnet"],
  backup_dr: ["backup_dr"],
  content_data: ["content_migration"],
  customization: ["code_migration"],
  frontend: ["frontend_rebuild"],
  team_timeline: ["project_management", "training"],
  modules: ["code_migration"],
  performance: ["testing_validation"]
};
function getAffectedComponentsForQuestion(dimension, questionId) {
  const specific = QUESTION_COMPONENT_MAP[questionId];
  if (specific && specific.length > 0) return specific;
  return DIMENSION_COMPONENT_MAP[dimension] ?? [];
}
function evaluateMultipliers(answers, rawMultipliers) {
  const matched = [];
  for (const m of rawMultipliers) {
    if (evaluateCondition(answers, m.condition)) {
      matched.push({
        id: m.id,
        name: m.reason,
        factor: m.multiplier,
        trigger: m.condition,
        affected_components: m.applies_to
      });
    }
  }
  const supersededIds = /* @__PURE__ */ new Set();
  for (const m of rawMultipliers) {
    if (m.supersedes && matched.some((a) => a.id === m.id)) {
      supersededIds.add(m.supersedes);
    }
  }
  return matched.filter((m) => !supersededIds.has(m.id));
}
function riskToSeverity(risk) {
  switch (risk) {
    case "high":
      return { likelihood: "likely", impact: "high", severity: "high" };
    case "medium":
      return { likelihood: "possible", impact: "medium", severity: "medium" };
    case "low":
      return { likelihood: "unlikely", impact: "low", severity: "low" };
    default:
      return { likelihood: "possible", impact: "medium", severity: "medium" };
  }
}
function evaluateGotchas(answers, rawPatterns) {
  const risks = [];
  for (const p of rawPatterns) {
    if (evaluateCondition(answers, p.pattern)) {
      const sev = riskToSeverity(p.risk);
      risks.push({
        id: p.id,
        category: "gotcha",
        description: p.description,
        likelihood: sev.likelihood,
        impact: sev.impact,
        severity: sev.severity,
        estimated_hours_impact: p.hours_impact,
        mitigation: p.mitigation,
        contingency: "",
        linked_assumptions: [],
        owner: "",
        status: "open"
      });
    }
  }
  return risks;
}
function buildAssumptions(discovery) {
  const assumptions = [];
  for (const [dimension, dimData] of Object.entries(discovery)) {
    if (!dimData?.answers) continue;
    for (const [qId, raw] of Object.entries(dimData.answers)) {
      const answer = raw;
      if (answer.confidence !== "assumed" && answer.confidence !== "unknown") continue;
      const affectedComponents = getAffectedComponentsForQuestion(dimension, qId);
      const isUnknown = answer.confidence === "unknown";
      const wideningHours = isUnknown ? 4 : 2;
      assumptions.push({
        id: `asmp_${qId}`,
        dimension,
        question_id: qId,
        assumed_value: answer.value !== null && answer.value !== void 0 ? String(typeof answer.value === "object" ? JSON.stringify(answer.value) : answer.value) : "",
        basis: answer.basis ?? (isUnknown ? "No data available" : "Assumed based on typical patterns"),
        confidence: answer.confidence,
        validation_status: "unvalidated",
        validation_method: "Client confirmation required",
        pessimistic_widening_hours: wideningHours,
        affected_components: affectedComponents
      });
    }
  }
  return assumptions;
}
function buildDependencyChains(depData, inScopeComponents) {
  if (!depData?.dependencies) return [];
  return depData.dependencies.filter((d) => inScopeComponents.has(d.predecessor)).map((d) => ({
    from: d.predecessor,
    to: d.successors.filter((s) => inScopeComponents.has(s)),
    type: d.type
  })).filter((d) => d.to.length > 0);
}
function buildRiskClusters(risks, assumptions) {
  const componentRisks = {};
  const componentAssumptions = {};
  for (const r of risks) {
    const key = r.category === "gotcha" ? r.id : "general";
    if (!componentRisks[key]) componentRisks[key] = [];
    componentRisks[key].push(r.id);
  }
  for (const a of assumptions) {
    for (const comp of a.affected_components) {
      if (!componentAssumptions[comp]) componentAssumptions[comp] = [];
      componentAssumptions[comp].push(a.id);
    }
  }
  const clusters = [];
  const allComponents = /* @__PURE__ */ new Set([...Object.keys(componentAssumptions)]);
  for (const comp of allComponents) {
    const compAssumptions = componentAssumptions[comp] ?? [];
    if (compAssumptions.length === 0) continue;
    const compRisks = risks.filter((r) => r.id.includes(comp) || r.description.toLowerCase().includes(comp.replace(/_/g, " "))).map((r) => r.id);
    if (compRisks.length === 0 && compAssumptions.length < 2) continue;
    const wideningSum = assumptions.filter((a) => compAssumptions.includes(a.id)).reduce((sum, a) => sum + a.pessimistic_widening_hours, 0);
    clusters.push({
      name: comp.replace(/_/g, " "),
      risks: [...new Set(compRisks)],
      assumptions: [...new Set(compAssumptions)],
      combined_widening_hours: wideningSum
    });
  }
  return clusters;
}
function computeAnalysis(inputs) {
  const { discovery, rawMultipliers, rawGotchas, rawDependencies, allComponentIds } = inputs;
  const answers = flattenDiscovery(discovery);
  const activeMultipliers = evaluateMultipliers(answers, rawMultipliers);
  const risks = evaluateGotchas(answers, rawGotchas);
  const assumptions = buildAssumptions(discovery);
  const inScope = new Set(allComponentIds);
  const dependencyChains = buildDependencyChains(rawDependencies, inScope);
  const riskClusters = buildRiskClusters(risks, assumptions);
  return {
    assessment_id: "",
    // caller must set this
    risks,
    active_multipliers: activeMultipliers,
    dependency_chains: dependencyChains,
    risk_clusters: riskClusters,
    assumptions,
    _meta: { flat_answers: answers }
  };
}
function parseSelectRange(value) {
  if (!value) return 0;
  const s = String(value).replace(/,/g, "");
  const plusMatch = s.match(/(\d+)\+/);
  if (plusMatch) return Number(plusMatch[1]) * 1.2;
  const ltMatch = s.match(/<\s*(\d+)/);
  if (ltMatch) return Math.max(1, Number(ltMatch[1]) * 0.5);
  const rangeMatch = s.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (rangeMatch) return (Number(rangeMatch[1]) + Number(rangeMatch[2])) / 2;
  const num = Number(s);
  if (!isNaN(num)) return num;
  return 0;
}
function computeUnits(componentId, answers, envCount) {
  switch (componentId) {
    case "compute_single_role": {
      const cm = Number(answers["compute_cm_instance_count"]) || 1;
      const cd = Number(answers["compute_cd_instance_count"]) || 2;
      return cm + cd;
    }
    case "database_single": {
      let count = 3;
      if (answers["database_separate_xdb"] === true || answers["database_separate_xdb"] === "true") count += 2;
      if (answers["database_custom_databases"] === true || answers["database_custom_databases"] === "true") count += 1;
      return count;
    }
    case "solr_standalone":
    case "solr_cloud": {
      const provider = String(answers["search_provider"] ?? "");
      if (componentId === "solr_cloud" && !provider.toLowerCase().includes("cloud")) return 0;
      if (componentId === "solr_standalone" && provider.toLowerCase().includes("cloud")) return 0;
      return 1;
    }
    case "redis_session": {
      const inUse = answers["caching_redis_in_use"];
      if (inUse === false || inUse === "false") return 0;
      return 1;
    }
    case "cdn_setup": {
      const cdnInUse = answers["cdn_in_use"];
      if (cdnInUse === false || cdnInUse === "false") return 0;
      return Number(answers["cdn_distribution_count"]) || 1;
    }
    case "dns_cutover":
      return Number(answers["dns_zone_count"]) || 1;
    case "ssl_tls":
      return Number(answers["ssl_certificate_count"]) || 1;
    case "blob_storage":
      return Number(answers["storage_s3_bucket_count"]) || 1;
    case "content_serialization_sync":
      return envCount;
    case "xconnect_xdb": {
      const enabled = answers["xconnect_enabled"];
      if (enabled === false || enabled === "false") return 0;
      return 1;
    }
    case "identity_server": {
      const deployed = answers["identity_server_deployed"];
      if (deployed === false || deployed === "false") return 0;
      return 1;
    }
    case "custom_integration":
      return Number(answers["integrations_custom_api_count"]) || 0;
    case "cicd_pipeline":
      return 1;
    case "monitoring_setup":
      return envCount;
    case "networking_vnet":
      return envCount;
    case "backup_dr":
      return envCount;
    case "managed_identity_keyvault":
      return envCount;
    case "publishing_service": {
      const hosting = answers["integrations_publishing_service_hosting"];
      if (!hosting || hosting === "N/A" || hosting === "none") return 0;
      return 1;
    }
    case "project_management":
      return 1;
    case "testing_validation":
      return envCount;
    case "cutover_execution":
      return envCount;
    case "content_migration": {
      const typeCount = parseSelectRange(String(answers["content_type_count"] ?? ""));
      return Math.max(1, Math.ceil(typeCount / 5));
    }
    case "code_migration": {
      const pipelines = parseSelectRange(String(answers["customization_pipeline_count"] ?? ""));
      const handlers = parseSelectRange(String(answers["customization_event_handlers"] ?? ""));
      const total = pipelines + handlers;
      if (total === 0) return 0;
      return Math.max(1, Math.ceil(total / 10));
    }
    case "frontend_rebuild": {
      const approach = String(answers["frontend_rendering_approach"] ?? "");
      if (approach.includes("JSS") || approach.includes("Headless") || approach.includes("Mixed")) return 1;
      return 0;
    }
    case "training": {
      const needs = answers["team_training_needs"];
      if (!needs) return 0;
      if (Array.isArray(needs)) {
        const filtered = needs.filter((n) => n !== "None needed" && n !== "None");
        return filtered.length;
      }
      const str = String(needs);
      if (str === "None needed" || str === "None" || str === "") return 0;
      return str.split(",").filter((s) => s.trim() && s.trim() !== "None needed").length;
    }
    case "go_live_planning":
      return envCount;
    default:
      return 1;
  }
}
const PHASE_NAMES = {
  phase_1_infrastructure: "Phase 1: Infrastructure",
  phase_2_data: "Phase 2: Data Migration",
  phase_3_application: "Phase 3: Application",
  phase_3b_content: "Phase 3b: Content Migration",
  phase_4_validation: "Phase 4: Validation",
  phase_5_cutover: "Phase 5: Cutover"
};
function computeEstimate(inputs) {
  const {
    assessmentId,
    answers,
    envCount,
    activeMultipliers,
    risks,
    assumptions,
    baseEffort,
    aiAlternatives
  } = inputs;
  const { components: rawComponents, phase_mapping: phaseMapping } = baseEffort;
  const componentAssumptions = {};
  for (const a of assumptions) {
    for (const comp of a.affected_components) {
      if (!componentAssumptions[comp]) componentAssumptions[comp] = [];
      componentAssumptions[comp].push(a.id);
    }
  }
  const componentGotchaHours = {};
  for (const r of risks) {
    r.id ? [r.id] : Object.keys(rawComponents);
    componentGotchaHours[r.id] = (componentGotchaHours[r.id] ?? 0) + r.estimated_hours_impact;
  }
  const componentMultipliers = {};
  for (const m of activeMultipliers) {
    const targets = m.affected_components.includes("all") ? Object.keys(rawComponents) : m.affected_components;
    for (const comp of targets) {
      if (!componentMultipliers[comp]) componentMultipliers[comp] = [];
      componentMultipliers[comp].push(m);
    }
  }
  const componentAiAlts = {};
  for (const alt of aiAlternatives) {
    for (const comp of alt.applicable_components) {
      if (!componentAiAlts[comp]) componentAiAlts[comp] = [];
      componentAiAlts[comp].push(alt);
    }
  }
  const gotchaPerComponent = {};
  for (const r of risks) {
    let assigned = false;
    for (const compId of Object.keys(rawComponents)) {
      if (r.id.includes(compId.replace(/_/g, "").substring(0, 6))) {
        gotchaPerComponent[compId] = (gotchaPerComponent[compId] ?? 0) + r.estimated_hours_impact;
        assigned = true;
      }
    }
    if (!assigned) {
      const perComp = r.estimated_hours_impact / Object.keys(rawComponents).length;
      for (const compId of Object.keys(rawComponents)) {
        gotchaPerComponent[compId] = (gotchaPerComponent[compId] ?? 0) + perComp;
      }
    }
  }
  const allEstComponents = {};
  let totalBaseHours = 0;
  let totalGotchaHours = 0;
  let totalExpectedHours = 0;
  let totalWideningHours = 0;
  const totalByRole = {};
  for (const [compId, rawComp] of Object.entries(rawComponents)) {
    const units = computeUnits(compId, answers, envCount);
    if (units === 0) continue;
    const applicableMultipliers = componentMultipliers[compId] ?? [];
    const combinedFactor = applicableMultipliers.reduce((f, m) => f * m.factor, 1);
    const baseHours = rawComp.base_hours * units;
    const multipliedHours = Math.round(baseHours * combinedFactor * 10) / 10;
    const gotchaHrs = Math.round((gotchaPerComponent[compId] ?? 0) * 10) / 10;
    const finalHours = Math.round((multipliedHours + gotchaHrs) * 10) / 10;
    const affectingAssumptions = componentAssumptions[compId] ?? [];
    const assumptionRatio = affectingAssumptions.length > 0 ? 0.3 : 0;
    const assumptionDependentHours = Math.round(finalHours * assumptionRatio * 10) / 10;
    const firmHours = Math.round((finalHours - assumptionDependentHours) * 10) / 10;
    const optimistic = Math.round(finalHours * 0.8 * 10) / 10;
    const pessimistic = Math.round(finalHours * 1.3 * 10) / 10;
    const aiAlts = componentAiAlts[compId] ?? [];
    const maxSavings = finalHours * 0.5;
    let aiSavingsExpected = 0;
    let aiSavingsOptimistic = 0;
    let aiSavingsPessimistic = 0;
    const altEntries = [];
    for (const alt of aiAlts) {
      altEntries.push({
        tool_id: alt.id,
        tool_name: alt.name,
        hours_saved: alt.hours_saved
      });
      aiSavingsExpected += alt.hours_saved.expected;
      aiSavingsOptimistic += alt.hours_saved.optimistic;
      aiSavingsPessimistic += alt.hours_saved.pessimistic;
    }
    aiSavingsExpected = Math.min(aiSavingsExpected, maxSavings);
    aiSavingsOptimistic = Math.min(aiSavingsOptimistic, maxSavings);
    aiSavingsPessimistic = Math.min(aiSavingsPessimistic, maxSavings);
    const withAiExpected = Math.round((finalHours - aiSavingsExpected) * 10) / 10;
    const withAiOptimistic = Math.round((optimistic - aiSavingsOptimistic) * 10) / 10;
    const withAiPessimistic = Math.round((pessimistic - aiSavingsPessimistic) * 10) / 10;
    const byRole = {};
    for (const [role, roleHours] of Object.entries(rawComp.role_breakdown)) {
      const scaled = Math.round(roleHours * units * combinedFactor * 10) / 10;
      byRole[role] = scaled;
      totalByRole[role] = (totalByRole[role] ?? 0) + scaled;
    }
    const wideningForComp = assumptions.filter((a) => affectingAssumptions.includes(a.id) && a.validation_status !== "validated").reduce((sum, a) => sum + a.pessimistic_widening_hours, 0);
    allEstComponents[compId] = {
      id: compId,
      name: rawComp.includes?.split(",")[0]?.trim() ?? compId.replace(/_/g, " "),
      units,
      base_hours: baseHours,
      multipliers_applied: applicableMultipliers.map((m) => ({
        id: m.id,
        name: m.name,
        factor: m.factor
      })),
      gotcha_hours: gotchaHrs,
      final_hours: finalHours,
      firm_hours: firmHours,
      assumption_dependent_hours: assumptionDependentHours,
      assumptions_affecting: affectingAssumptions,
      hours: {
        without_ai: { optimistic, expected: finalHours, pessimistic },
        with_ai: {
          optimistic: Math.max(withAiOptimistic, 0),
          expected: Math.max(withAiExpected, 0),
          pessimistic: Math.max(withAiPessimistic, 0)
        }
      },
      ai_alternatives: altEntries,
      by_role: byRole
    };
    totalBaseHours += baseHours;
    totalGotchaHours += gotchaHrs;
    totalExpectedHours += finalHours;
    totalWideningHours += wideningForComp;
  }
  const phases = [];
  for (const [phaseId, componentIds] of Object.entries(phaseMapping)) {
    const phaseComponents = [];
    for (const compId of componentIds) {
      if (allEstComponents[compId]) {
        phaseComponents.push(allEstComponents[compId]);
      }
    }
    if (phaseComponents.length > 0) {
      phases.push({
        id: phaseId,
        name: PHASE_NAMES[phaseId] ?? phaseId,
        components: phaseComponents
      });
    }
  }
  if (allEstComponents["project_management"] && !phases.some(
    (p) => p.components.some((c) => c.id === "project_management")
  )) {
    const lastPhase = phases[phases.length - 1];
    if (lastPhase) {
      lastPhase.components.push(allEstComponents["project_management"]);
    }
  }
  let totalAnswers = 0;
  totalAnswers = assumptions.length;
  const validated = assumptions.filter((a) => a.validation_status === "validated").length;
  const totalDataPoints = totalAnswers + Object.keys(answers).length;
  const confirmedDataPoints = Object.keys(answers).length - totalAnswers + validated;
  const confidenceScore = totalDataPoints > 0 ? Math.round(confirmedDataPoints / totalDataPoints * 100) : 0;
  const pessimisticTotal = Math.round(totalExpectedHours * 1.3 + totalWideningHours);
  const optimisticTotal = Math.round(totalExpectedHours * 0.8);
  const clientSummary = {
    recommended_hours: totalExpectedHours,
    range_low: optimisticTotal,
    range_high: pessimisticTotal,
    confidence_score: confidenceScore,
    assumption_count: assumptions.length,
    risk_count: risks.length,
    narrative: `Estimated ${totalExpectedHours} hours (range: ${optimisticTotal}–${pessimisticTotal}). ${assumptions.length} assumptions add ${totalWideningHours}h of uncertainty. Confidence: ${confidenceScore}%.`
  };
  return {
    assessment_id: assessmentId,
    confidence_score: confidenceScore,
    total_base_hours: Math.round(totalBaseHours * 10) / 10,
    total_gotcha_hours: Math.round(totalGotchaHours * 10) / 10,
    total_expected_hours: Math.round(totalExpectedHours * 10) / 10,
    assumption_widening_hours: Math.round(totalWideningHours * 10) / 10,
    totals: {
      optimistic: optimisticTotal,
      expected: Math.round(totalExpectedHours),
      pessimistic: pessimisticTotal
    },
    total_by_role: totalByRole,
    client_summary: clientSummary,
    phases
  };
}
async function recomputeAll(assessmentId) {
  try {
    const database = db();
    const [assessment, discovery, existingAnalysis] = await Promise.all([
      getAssessmentById(database, assessmentId),
      getDiscovery(database, assessmentId),
      getAnalysis(database, assessmentId)
    ]);
    if (!assessment || !discovery) {
      return { success: false, error: "Assessment or discovery not found" };
    }
    const disc = discovery;
    const envCount = assessment.environment_count ?? 1;
    let rawMultipliers;
    let rawGotchas;
    let rawDeps;
    let baseEffort;
    let aiAlts;
    let usedComposition = false;
    try {
      const composed = await getComposedKnowledge(assessmentId);
      if (composed && composed.effort_hours.length > 0) {
        usedComposition = true;
        rawMultipliers = composed.multipliers.map((m) => ({
          id: m.multiplier_id ?? m.id,
          condition: m.condition ?? "",
          multiplier: m.factor ?? 1,
          applies_to: m.applies_to ?? [],
          reason: m.reason ?? (m.multiplier_id ?? m.id),
          supersedes: m.supersedes ?? void 0
        }));
        rawGotchas = composed.gotcha_patterns.map((g) => ({
          id: g.pattern_id ?? g.id,
          pattern: g.pattern_condition ?? "",
          risk: g.risk_level ?? "medium",
          hours_impact: g.hours_impact ?? 0,
          description: g.description ?? "",
          mitigation: g.mitigation ?? "",
          affected_components: g.affected_components ?? []
        }));
        rawDeps = {
          dependencies: composed.dependency_chains.map((c) => ({
            id: c.chain_id ?? c.id,
            predecessor: c.predecessor ?? "",
            successors: c.successors ?? [],
            type: c.dependency_type ?? "hard",
            reason: c.reason ?? ""
          })),
          critical_path_template: { description: "", path: [], parallel_tracks: [] }
        };
        const components = {};
        for (const eh of composed.effort_hours) {
          const cid = eh.component_id;
          if (cid) {
            components[cid] = {
              id: cid,
              name: eh.component_name ?? cid,
              base_hours: eh.base_hours ?? 0,
              unit: eh.unit ?? "",
              phase: eh.phase_id ?? "",
              roles: eh.role_breakdown ?? {},
              description: eh.includes ?? ""
            };
          }
        }
        const phases = {};
        for (const pm of composed.phase_mappings) {
          const pid = pm.phase_id;
          if (pid) {
            phases[pid] = {
              name: pm.phase_name ?? pid,
              order: pm.phase_order ?? 0,
              component_ids: pm.component_ids ?? []
            };
          }
        }
        const roles = {};
        for (const r of composed.roles) {
          const rid = r.role_id;
          if (rid) {
            roles[rid] = {
              description: r.description ?? "",
              typical_rate_range: r.typical_rate_range ?? ""
            };
          }
        }
        baseEffort = { components, phases, roles };
        aiAlts = getAiAlternatives();
      }
    } catch {
    }
    if (!usedComposition) {
      rawMultipliers = loadRawMultipliers();
      rawGotchas = loadRawGotchas();
      rawDeps = getDependencyChains();
      baseEffort = loadRawBaseEffort();
      aiAlts = getAiAlternatives();
    }
    const analysis = computeAnalysis({
      discovery: disc,
      rawMultipliers,
      rawGotchas,
      rawDependencies: rawDeps,
      allComponentIds: Object.keys(baseEffort.components)
    });
    analysis.assessment_id = assessmentId;
    if (existingAnalysis?.assumptions) {
      const priorMap = new Map(
        existingAnalysis.assumptions.map((a) => [a.id, a])
      );
      analysis.assumptions = (analysis.assumptions ?? []).map((a) => {
        const prior = priorMap.get(a.id);
        if (prior && prior.validation_status !== "unvalidated") {
          return {
            ...a,
            validation_status: prior.validation_status,
            actual_value: prior.actual_value ?? a.actual_value
          };
        }
        return a;
      });
    }
    const analysisResult = await saveAnalysis(database, analysis);
    const estimate = computeEstimate({
      assessmentId,
      answers: analysis._meta.flat_answers,
      envCount,
      activeMultipliers: analysis.active_multipliers,
      risks: analysis.risks,
      assumptions: analysis.assumptions,
      baseEffort,
      aiAlternatives: aiAlts
    });
    const estimateResult = await saveEstimate(database, estimate);
    return {
      success: true,
      analysisRisks: (analysis.risks ?? []).length,
      analysisAssumptions: (analysis.assumptions ?? []).length,
      estimateVersion: estimateResult.version
    };
  } catch (err) {
    console.error("[recompute] Error during recomputation:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err)
    };
  }
}
async function recomputeEstimate(assessmentId) {
  try {
    const database = db();
    const [assessment, discovery, existingAnalysis] = await Promise.all([
      getAssessmentById(database, assessmentId),
      getDiscovery(database, assessmentId),
      // We need the current analysis for multipliers/risks/assumptions
      import('./index2-Ds-j4PBQ.js').then((m) => m.getAnalysis(database, assessmentId))
    ]);
    if (!assessment || !discovery) {
      return { success: false, error: "Assessment or discovery not found" };
    }
    if (!existingAnalysis) {
      return recomputeAll(assessmentId);
    }
    const disc = discovery;
    const answers = flattenDiscovery(disc);
    const envCount = assessment.environment_count ?? 1;
    const baseEffort = loadRawBaseEffort();
    const aiAlts = getAiAlternatives();
    const estimate = computeEstimate({
      assessmentId,
      answers,
      envCount,
      activeMultipliers: (existingAnalysis.active_multipliers ?? []).map((m) => ({
        id: m.multiplier_id ?? m.id,
        name: m.name,
        factor: m.factor,
        trigger: m.trigger_condition ?? m.trigger ?? "",
        affected_components: m.affected_components ?? []
      })),
      risks: (existingAnalysis.risks ?? []).map((r) => ({
        id: r.id,
        category: r.category ?? "gotcha",
        description: r.description ?? "",
        likelihood: r.likelihood ?? "",
        impact: r.impact ?? "",
        severity: r.severity ?? "",
        estimated_hours_impact: r.estimated_hours_impact ?? 0,
        mitigation: r.mitigation ?? "",
        contingency: r.contingency ?? "",
        linked_assumptions: r.linked_assumptions ?? [],
        owner: r.owner ?? "",
        status: r.status ?? "open"
      })),
      assumptions: (existingAnalysis.assumptions ?? []).map((a) => ({
        id: a.id,
        dimension: a.dimension ?? "",
        question_id: a.question_id ?? null,
        assumed_value: a.assumed_value ?? "",
        basis: a.basis ?? "",
        confidence: a.confidence ?? "unknown",
        validation_status: a.validation_status ?? "unvalidated",
        validation_method: a.validation_method ?? "",
        pessimistic_widening_hours: a.pessimistic_widening_hours ?? 0,
        affected_components: a.affected_components ?? []
      })),
      baseEffort,
      aiAlternatives: aiAlts
    });
    const estimateResult = await saveEstimate(database, estimate);
    return {
      success: true,
      estimateVersion: estimateResult.version
    };
  } catch (err) {
    console.error("[recompute] Error during estimate recomputation:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err)
    };
  }
}
const __filename$1 = fileURLToPath(import.meta.url);
const __dirname$1 = dirname(__filename$1);
function findHeuristicsDir() {
  const subpath = join("skills", "migrate-knowledge", "heuristics");
  let dir = resolve(__dirname$1);
  for (let i = 0; i < 10; i++) {
    const candidate = join(dir, subpath);
    if (existsSync(join(candidate, "ai-alternatives.json"))) return candidate;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  dir = resolve(process.cwd());
  for (let i = 0; i < 10; i++) {
    const candidate = join(dir, subpath);
    if (existsSync(join(candidate, "ai-alternatives.json"))) return candidate;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error("Cannot find heuristics directory");
}
let _hDir = null;
function getHDir() {
  if (!_hDir) _hDir = findHeuristicsDir();
  return _hDir;
}
function loadRawJson(filename) {
  return JSON.parse(readFileSync(resolve(getHDir(), filename), "utf-8"));
}
let _rawMultipliers = null;
function loadRawMultipliers() {
  if (!_rawMultipliers) {
    const data = loadRawJson("complexity-multipliers.json");
    _rawMultipliers = data.multipliers;
  }
  return _rawMultipliers;
}
let _rawGotchas = null;
function loadRawGotchas() {
  if (!_rawGotchas) {
    const data = loadRawJson("gotcha-patterns.json");
    _rawGotchas = data.patterns;
  }
  return _rawGotchas;
}
let _rawBaseEffort = null;
function loadRawBaseEffort() {
  if (!_rawBaseEffort) {
    _rawBaseEffort = loadRawJson("base-effort-hours.json");
  }
  return _rawBaseEffort;
}

export { recomputeAll as a, recomputeEstimate as r };
//# sourceMappingURL=recompute-CMorG61U.js.map
