// Schema
export * from "./schema.js";

// Connection
export { getDb, closeDb, type Database } from "./connection.js";

// Queries
export {
  saveAssessment,
  getAssessmentById,
  getAssessmentByPath,
  listAssessments,
  listAssessmentsByPath,
  type SaveAssessmentInput,
} from "./queries/assessments.js";

export {
  getActiveAssessmentId,
  setActiveAssessment,
  clearActiveAssessment,
} from "./queries/workspace-state.js";

export {
  saveDiscovery,
  getDiscovery,
  type SaveDiscoveryInput,
} from "./queries/discovery.js";

export {
  saveAnalysis,
  getAnalysis,
  type SaveAnalysisInput,
} from "./queries/analysis.js";

export {
  saveEstimate,
  getEstimate,
  listEstimateVersions,
  type SaveEstimateInput,
  type EstimateVersionSummary,
} from "./queries/estimates.js";

export {
  updateAssumption,
  type UpdateAssumptionInput,
} from "./queries/assumptions.js";

export {
  saveAiSelections,
  getAiSelections,
  type SaveAiSelectionsInput,
} from "./queries/ai-selections.js";

export {
  saveScopeExclusions,
  getScopeExclusions,
  type SaveScopeExclusionsInput,
} from "./queries/scope-exclusions.js";

export {
  saveCalibration,
  type SaveCalibrationInput,
} from "./queries/calibrations.js";

export {
  queryProjects,
  queryConfidenceTimeline,
  type QueryProjectsInput,
  type QueryConfidenceTimelineInput,
  type ConfidenceTimelinePoint,
} from "./queries/analytics.js";

export { getDeliverables, upsertDeliverable } from "./queries/deliverables.js";

// WBS (Work Breakdown Structure)
export {
  listWBSVersions,
  saveWBSSnapshot,
  getWBSSnapshot,
  updateWorkItem,
  createWorkItem,
  deleteWorkItem,
  reorderWorkItems,
  type WBSVersionSummary,
  type WorkItemInput,
  type SaveWBSSnapshotInput,
  type UpdateWorkItemInput,
} from "./queries/wbs.js";

// Team composition
export {
  listTeamVersions,
  saveTeamSnapshot,
  getTeamSnapshot,
  updateTeamRole,
  createTeamRole,
  deleteTeamRole,
  type TeamVersionSummary,
  type TeamRoleInput,
  type SaveTeamSnapshotInput,
  type UpdateTeamRoleInput,
} from "./queries/team.js";

export {
  saveClient,
  getClientById,
  listClients,
  saveProficiencies,
  getProficiencies,
  deleteClient,
  type SaveClientInput,
  type SaveProficienciesInput,
  type ProficiencyEntry,
} from "./queries/clients.js";

export {
  saveChallengeReview,
  getChallengeReviews,
  getLatestChallengeReview,
  getChallengeReviewSummary,
  type SaveChallengeReviewInput,
  type ChallengeReviewSummary,
} from "./queries/challenge-reviews.js";

// Knowledge base queries
export {
  saveKnowledgePack,
  getKnowledgePackById,
  getKnowledgePackFull,
  listKnowledgePacks,
  deleteKnowledgePack,
  type SaveKnowledgePackInput,
  type ListKnowledgePacksFilters,
  type IncludeSection,
} from "./queries/knowledge-packs.js";

export {
  saveHeuristics,
  getHeuristicsForPacks,
  type SaveHeuristicsInput,
  type HeuristicType,
} from "./queries/knowledge-heuristics.js";

export {
  saveDiscoveryTree,
  getDiscoveryTree,
  type SaveDiscoveryTreeInput,
} from "./queries/knowledge-discovery.js";

export {
  saveMigrationPath,
  getMigrationPath,
  listMigrationPaths,
  type SaveMigrationPathInput,
  type GetMigrationPathInput,
  type ListMigrationPathsFilters,
} from "./queries/migration-paths.js";

export {
  saveSourceUrls,
  getSourceUrls,
  checkUrlFreshness,
  type SaveSourceUrlsInput,
  type GetSourceUrlsInput,
  type CheckUrlFreshnessInput,
  type UrlFreshnessResult,
} from "./queries/knowledge-sources.js";

export {
  pinKnowledgeVersion,
  getPinnedKnowledge,
  type PinKnowledgeVersionInput,
} from "./queries/knowledge-pins.js";

// Analytics events
export {
  insertAnalyticsEvents,
  getPageViewsOverTime,
  getTopPages,
  getTopFeatures,
  getSessionCount,
  getPageViewCount,
  getMostEngagedAssessments,
  type AnalyticsEventInput,
} from "./queries/analytics-events.js";

// Composition engine
export {
  resolvePackIds,
  composeDiscoveryTree,
  composeHeuristics,
  type ResolvedPacks,
  type ComposedDiscoveryTree,
  type ComposedDimension,
  type ComposedHeuristics,
} from "./queries/composition.js";
