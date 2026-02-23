#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import {
  saveAssessmentSchema, saveAssessment,
  getAssessmentSchema, getAssessment,
  listAssessmentsSchema, listAssessmentsForPath,
  setActiveAssessmentSchema, setActiveAssessment,
} from "./tools/assessment.js";
import {
  saveClientSchema, saveClient,
  getClientSchema, getClient,
  listClientsSchema, listClients,
  saveClientProficienciesSchema, saveClientProficiencies,
  getClientProficienciesSchema, getClientProficiencies,
} from "./tools/client.js";
import { saveDiscoverySchema, saveDiscovery, getDiscoverySchema, getDiscovery } from "./tools/discovery.js";
import { saveAnalysisSchema, saveAnalysis, getAnalysisSchema, getAnalysis } from "./tools/analysis.js";
import { saveEstimateSchema, saveEstimate, getEstimateSchema, getEstimate, listEstimateVersionsSchema, listEstimateVersions } from "./tools/estimate.js";
import { updateAssumptionSchema, updateAssumption } from "./tools/assumption.js";
import { saveAiSelectionsSchema, saveAiSelections } from "./tools/ai-selections.js";
import { saveCalibrationSchema, saveCalibration } from "./tools/calibration.js";
import { queryProjectsSchema, queryProjects, queryConfidenceTimelineSchema, queryConfidenceTimeline } from "./tools/analytics.js";
import { saveChallengeReviewSchema, saveChallengeReview, getChallengeReviewsSchema, getChallengeReviews } from "./tools/challenge.js";
import {
  saveWBSSnapshotSchema, saveWBSSnapshot,
  getWBSSnapshotSchema, getWBSSnapshot,
  listWBSVersionsSchema, listWBSVersions,
  updateWorkItemSchema, updateWorkItem,
  createWorkItemSchema, createWorkItem as createWorkItemTool,
  deleteWorkItemSchema, deleteWorkItem as deleteWorkItemTool,
} from "./tools/wbs.js";
import {
  saveTeamSnapshotSchema, saveTeamSnapshot,
  getTeamSnapshotSchema, getTeamSnapshot,
  listTeamVersionsSchema, listTeamVersions,
  updateTeamRoleSchema, updateTeamRole,
  createTeamRoleSchema, createTeamRole as createTeamRoleTool,
  deleteTeamRoleSchema, deleteTeamRole as deleteTeamRoleTool,
} from "./tools/team.js";
import {
  saveKnowledgePackSchema, saveKnowledgePack,
  getKnowledgePackSchema, getKnowledgePack,
  listKnowledgePacksSchema, listKnowledgePacks,
  deleteKnowledgePackSchema, deleteKnowledgePack,
  saveDiscoveryTreeSchema, saveDiscoveryTreeKnowledge,
  getDiscoveryTreeSchema, getDiscoveryTreeKnowledge,
  saveHeuristicsSchema, saveHeuristics,
  getHeuristicsSchema, getHeuristics,
  saveMigrationPathSchema, saveMigrationPath,
  getMigrationPathSchema, getMigrationPath,
  listMigrationPathsSchema, listMigrationPaths,
  saveSourceUrlsSchema, saveSourceUrls,
  checkUrlFreshnessSchema, checkUrlFreshness,
  saveAiAlternativesSchema, saveAiAlternatives,
  pinKnowledgeVersionSchema, pinKnowledgeVersion,
  getPinnedKnowledgeSchema, getPinnedKnowledge,
  saveProficiencyCatalogSchema, saveProficiencyCatalog,
  getComposedDiscoveryTreeSchema, getComposedDiscoveryTree,
  getComposedHeuristicsSchema, getComposedHeuristics,
} from "./tools/knowledge.js";

const server = new McpServer({
  name: "migration-planner-db",
  version: "4.0.0",
});

// ── Assessment ──────────────────────────────────────────────────

server.tool(
  "save_assessment",
  "Create or update assessment metadata (project name, topology, status, etc.)",
  saveAssessmentSchema.shape,
  async ({ id, project_name, client_name, client_id, architect, project_path,
           source_stack, target_stack, migration_scope,
           sitecore_version, topology, source_cloud, target_cloud,
           target_timeline, environment_count, environments, status }) => {
    const result = await saveAssessment({
      id, project_name, client_name, client_id, architect, project_path,
      source_stack, target_stack, migration_scope,
      sitecore_version, topology, source_cloud, target_cloud,
      target_timeline, environment_count, environments, status,
    });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "get_assessment",
  "Look up an assessment by ID or project_path. Auto-imports from .migration/ JSON if found on disk but not in DB.",
  getAssessmentSchema.shape,
  async ({ id, project_path }) => {
    const result = await getAssessment({ id, project_path });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "list_assessments",
  "List all assessments for a project_path with is_active flag. Use to show the user which assessments exist before switching.",
  listAssessmentsSchema.shape,
  async ({ project_path }) => {
    const result = await listAssessmentsForPath({ project_path });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "set_active_assessment",
  "Set which assessment is active for a project_path. Validates the assessment belongs to the path before setting.",
  setActiveAssessmentSchema.shape,
  async ({ project_path, assessment_id }) => {
    const result = await setActiveAssessment({ project_path, assessment_id });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

// ── Discovery ───────────────────────────────────────────────────

server.tool(
  "save_discovery",
  "Save discovery answers for one dimension (atomic upsert). Pass assessment_id, dimension name, status, and answers object.",
  saveDiscoverySchema.shape,
  async ({ assessment_id, dimension, status, completed_at, answers }) => {
    const result = await saveDiscovery({ assessment_id, dimension, status, completed_at, answers });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "get_discovery",
  "Get discovery data. Pass assessment_id and optionally a dimension name. Returns all dimensions if dimension is omitted.",
  getDiscoverySchema.shape,
  async ({ assessment_id, dimension }) => {
    const result = await getDiscovery({ assessment_id, dimension });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

// ── Analysis ────────────────────────────────────────────────────

server.tool(
  "save_analysis",
  "Save full analysis atomically: risks, multipliers, dependency chains, risk clusters, and assumptions.",
  saveAnalysisSchema.shape,
  async (input) => {
    const result = await saveAnalysis(input);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "get_analysis",
  "Get full analysis for an assessment: risks, multipliers, chains, clusters, assumptions, and gap summary.",
  getAnalysisSchema.shape,
  async ({ assessment_id }) => {
    const result = await getAnalysis({ assessment_id });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

// ── Estimate ────────────────────────────────────────────────────

server.tool(
  "save_estimate",
  "Save a new estimate snapshot (auto-increments version). Includes phases, components, AI alternatives, and totals.",
  saveEstimateSchema.shape,
  async (input) => {
    const result = await saveEstimate(input);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "get_estimate",
  "Get an estimate snapshot. Returns the latest version by default, or a specific version if provided.",
  getEstimateSchema.shape,
  async ({ assessment_id, version }) => {
    const result = await getEstimate({ assessment_id, version });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "list_estimate_versions",
  "List all estimate versions for an assessment. Returns lightweight summaries (version, hours, confidence, date) without full phase data.",
  listEstimateVersionsSchema.shape,
  async ({ assessment_id }) => {
    const result = await listEstimateVersions({ assessment_id });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

// ── Assumption ──────────────────────────────────────────────────

server.tool(
  "update_assumption",
  "Validate or invalidate a single assumption. Returns updated confidence score.",
  updateAssumptionSchema.shape,
  async ({ assessment_id, assumption_id, validation_status, actual_value }) => {
    const result = await updateAssumption({ assessment_id, assumption_id, validation_status, actual_value });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

// ── AI Selections ───────────────────────────────────────────────

server.tool(
  "save_ai_selections",
  "Save AI tool toggle states (which tools are enabled/disabled and why).",
  saveAiSelectionsSchema.shape,
  async ({ assessment_id, selections, disabled_reasons }) => {
    const result = await saveAiSelections({ assessment_id, selections, disabled_reasons });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

// ── Calibration ─────────────────────────────────────────────────

server.tool(
  "save_calibration",
  "Save post-migration actuals (phases, components, AI tool performance, surprises).",
  saveCalibrationSchema.shape,
  async (input) => {
    const result = await saveCalibration(input);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

// ── Analytics ───────────────────────────────────────────────────

server.tool(
  "query_projects",
  "Cross-project analytics view. Filter by status or client name. Returns assessment summaries with estimate and confidence data.",
  queryProjectsSchema.shape,
  async ({ status, client_name, limit }) => {
    const result = await queryProjects({ status, client_name, limit });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "query_confidence_timeline",
  "Get confidence score timeline across all assessments. Returns timestamped confidence points for trend analysis and charting.",
  queryConfidenceTimelineSchema.shape,
  async ({ from, to, limit }) => {
    const result = await queryConfidenceTimeline({ from, to, limit });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

// ── Challenge Reviews ────────────────────────────────────────

server.tool(
  "save_challenge_review",
  "Save a challenge review round for a step. Includes confidence score, score breakdown, challenges, and research findings.",
  saveChallengeReviewSchema.shape,
  async (input) => {
    const result = await saveChallengeReview(input);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "get_challenge_reviews",
  "Get challenge reviews for an assessment. Optionally filter by step (discovery|analysis|estimate|refine).",
  getChallengeReviewsSchema.shape,
  async ({ assessment_id, step }) => {
    const result = await getChallengeReviews({ assessment_id, step });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

// ── Clients ──────────────────────────────────────────────────────

server.tool(
  "save_client",
  "Create or update a client profile (id, name, industry, notes).",
  saveClientSchema.shape,
  async ({ id, name, industry, notes }) => {
    const result = await saveClient({ id, name, industry, notes });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "get_client",
  "Look up a client by ID or name. Returns client profile with proficiencies.",
  getClientSchema.shape,
  async ({ id, name }) => {
    const result = await getClient({ id, name });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "list_clients",
  "List all clients, with optional name search.",
  listClientsSchema.shape,
  async ({ search }) => {
    const result = await listClients({ search });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "save_client_proficiencies",
  "Save category-level technology proficiency data for a client.",
  saveClientProficienciesSchema.shape,
  async ({ client_id, proficiencies }) => {
    const result = await saveClientProficiencies({ client_id, proficiencies });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "get_client_proficiencies",
  "Get the technology proficiency map for a client.",
  getClientProficienciesSchema.shape,
  async ({ client_id }) => {
    const result = await getClientProficiencies({ client_id });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

// ── WBS (Work Breakdown Structure) ──────────────────────────────

server.tool(
  "save_wbs_snapshot",
  "Save a new WBS snapshot (auto-increments version). Includes work items with parent-child hierarchy.",
  saveWBSSnapshotSchema.shape,
  async (input) => {
    const result = await saveWBSSnapshot(input);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "get_wbs_snapshot",
  "Get a WBS snapshot with work items as a tree. Returns latest version by default.",
  getWBSSnapshotSchema.shape,
  async ({ assessment_id, version }) => {
    const result = await getWBSSnapshot({ assessment_id, version });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "list_wbs_versions",
  "List all WBS versions for an assessment. Returns lightweight summaries.",
  listWBSVersionsSchema.shape,
  async ({ assessment_id }) => {
    const result = await listWBSVersions({ assessment_id });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "update_work_item",
  "Update a single work item's fields (title, hours, priority, etc.).",
  updateWorkItemSchema.shape,
  async (input) => {
    const result = await updateWorkItem(input);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "create_work_item",
  "Create a new work item in a WBS snapshot.",
  createWorkItemSchema.shape,
  async (input) => {
    const result = await createWorkItemTool(input);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "delete_work_item",
  "Delete a work item and its children from a WBS snapshot.",
  deleteWorkItemSchema.shape,
  async ({ item_id }) => {
    const result = await deleteWorkItemTool({ item_id });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

// ── Team Composition ────────────────────────────────────────────

server.tool(
  "save_team_snapshot",
  "Save a new team composition snapshot (auto-increments version). Includes roles, cost projection, and phase staffing.",
  saveTeamSnapshotSchema.shape,
  async (input) => {
    const result = await saveTeamSnapshot(input);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "get_team_snapshot",
  "Get a team composition snapshot with roles. Returns latest version by default.",
  getTeamSnapshotSchema.shape,
  async ({ assessment_id, version }) => {
    const result = await getTeamSnapshot({ assessment_id, version });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "list_team_versions",
  "List all team composition versions for an assessment.",
  listTeamVersionsSchema.shape,
  async ({ assessment_id }) => {
    const result = await listTeamVersions({ assessment_id });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "update_team_role",
  "Update a team role's fields (hours, headcount, rate, etc.).",
  updateTeamRoleSchema.shape,
  async (input) => {
    const result = await updateTeamRole(input);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "create_team_role",
  "Create a new team role in a team snapshot.",
  createTeamRoleSchema.shape,
  async (input) => {
    const result = await createTeamRoleTool(input);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "delete_team_role",
  "Delete a team role from a team snapshot.",
  deleteTeamRoleSchema.shape,
  async ({ role_id }) => {
    const result = await deleteTeamRoleTool({ role_id });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

// ── Knowledge Base ──────────────────────────────────────────────

server.tool(
  "save_knowledge_pack",
  "Create or update a knowledge pack with auto-versioning. Covers platforms, infrastructure, services, martech, AI tools, and data infrastructure.",
  saveKnowledgePackSchema.shape,
  async (input) => {
    const result = await saveKnowledgePack(input);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "get_knowledge_pack",
  "Get a knowledge pack by ID. Optionally include heuristics, discovery tree, AI alternatives, and/or source URLs.",
  getKnowledgePackSchema.shape,
  async ({ pack_id, include, version }) => {
    const result = await getKnowledgePack({ pack_id, include, version });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "list_knowledge_packs",
  "List and search knowledge packs. Filter by category, direction, subcategory, or free-text search.",
  listKnowledgePacksSchema.shape,
  async (input) => {
    const result = await listKnowledgePacks(input);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "delete_knowledge_pack",
  "Delete a knowledge pack and all its children (heuristics, discovery trees, AI alternatives, source URLs).",
  deleteKnowledgePackSchema.shape,
  async ({ pack_id }) => {
    const result = await deleteKnowledgePack({ pack_id });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "save_discovery_tree",
  "Save a discovery question tree for a knowledge pack. Auto-versions so previous trees are preserved.",
  saveDiscoveryTreeSchema.shape,
  async ({ pack_id, dimensions }) => {
    const result = await saveDiscoveryTreeKnowledge({ pack_id, dimensions });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "get_discovery_tree",
  "Get the composed discovery tree for one or more knowledge packs. Returns combined dimensions array.",
  getDiscoveryTreeSchema.shape,
  async ({ pack_ids, version }) => {
    const result = await getDiscoveryTreeKnowledge({ pack_ids, version });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "save_heuristics",
  "Atomically save all heuristics for a pack: effort hours, multipliers, gotcha patterns, dependency chains, phase mappings, and roles.",
  saveHeuristicsSchema.shape,
  async (input) => {
    const result = await saveHeuristics(input);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "get_heuristics",
  "Get heuristics for one or more knowledge packs. Optionally filter by type (effort, multipliers, gotchas, chains, phases, roles).",
  getHeuristicsSchema.shape,
  async ({ pack_ids, type }) => {
    const result = await getHeuristics({ pack_ids, type });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "save_migration_path",
  "Create or update a migration path between two knowledge packs. Includes service maps, guides, gotcha patterns, and effort adjustments.",
  saveMigrationPathSchema.shape,
  async (input) => {
    const result = await saveMigrationPath(input);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "get_migration_path",
  "Get a migration path by ID or by source+target pack pair.",
  getMigrationPathSchema.shape,
  async (input) => {
    const result = await getMigrationPath(input);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "list_migration_paths",
  "List and filter migration paths by source pack, target pack, complexity, or prevalence.",
  listMigrationPathsSchema.shape,
  async (input) => {
    const result = await listMigrationPaths(input);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "save_source_urls",
  "Append source URLs to a knowledge pack or migration path for traceability.",
  saveSourceUrlsSchema.shape,
  async (input) => {
    const result = await saveSourceUrls(input);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "save_ai_alternatives",
  "Save AI tool catalog for a knowledge pack. Replaces all existing alternatives atomically.",
  saveAiAlternativesSchema.shape,
  async (input) => {
    const result = await saveAiAlternatives(input);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "pin_knowledge_version",
  "Pin an assessment to the current versions of specified knowledge packs. Enables reproducible estimates.",
  pinKnowledgeVersionSchema.shape,
  async ({ assessment_id, pack_ids }) => {
    const result = await pinKnowledgeVersion({ assessment_id, pack_ids });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "get_pinned_knowledge",
  "Get all pinned knowledge pack versions for an assessment.",
  getPinnedKnowledgeSchema.shape,
  async ({ assessment_id }) => {
    const result = await getPinnedKnowledge({ assessment_id });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "save_proficiency_catalog",
  "Save global technology proficiency categories. Used for client skill assessment and adoption hour estimates.",
  saveProficiencyCatalogSchema.shape,
  async (input) => {
    const result = await saveProficiencyCatalog(input);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "get_composed_discovery_tree",
  "Get a fully merged, deduplicated discovery tree for an assessment. Resolves all knowledge packs from the assessment's source/target stacks, merges dimensions by ID (higher-priority packs win on conflicts), and returns a single flat dimensions array.",
  getComposedDiscoveryTreeSchema.shape,
  async ({ assessment_id }) => {
    const result = await getComposedDiscoveryTree({ assessment_id });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "get_composed_heuristics",
  "Get fully merged heuristics for an assessment. Resolves all knowledge packs, flattens effort hours (additive across packs), deduplicates multipliers/gotchas/roles (higher-priority pack wins), merges dependency chains and phase mappings, and overlays migration path adjustments. Returns a single flat result set.",
  getComposedHeuristicsSchema.shape,
  async ({ assessment_id, type }) => {
    const result = await getComposedHeuristics({ assessment_id, type });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "check_url_freshness",
  "Check source URLs for accessibility. HEAD-requests each URL, updates still_accessible and accessed_at. Only checks URLs not accessed within stale_threshold_days (default 7). Optionally filter by pack_id or migration_path_id.",
  checkUrlFreshnessSchema.shape,
  async (input) => {
    const result = await checkUrlFreshness(input);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

// ── Start ───────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
