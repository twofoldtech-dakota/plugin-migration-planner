import { pgTable, text, integer, real, serial, timestamp, jsonb, boolean, index, unique, primaryKey, } from "drizzle-orm/pg-core";
// ── Client profiles ─────────────────────────────────────────
export const clients = pgTable("clients", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    industry: text("industry").notNull().default(""),
    notes: text("notes").notNull().default(""),
    created_at: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});
export const clientProficiencies = pgTable("client_proficiencies", {
    client_id: text("client_id")
        .notNull()
        .references(() => clients.id, { onDelete: "cascade" }),
    category_id: text("category_id").notNull(),
    proficiency: text("proficiency").notNull().default("beginner"),
    notes: text("notes").notNull().default(""),
}, (t) => [primaryKey({ columns: [t.client_id, t.category_id] })]);
// ── Core assessment metadata ────────────────────────────────
export const assessments = pgTable("assessments", {
    id: text("id").primaryKey(),
    project_name: text("project_name").notNull(),
    client_name: text("client_name").notNull().default(""),
    client_id: text("client_id").references(() => clients.id, { onDelete: "set null" }),
    architect: text("architect").notNull().default(""),
    project_path: text("project_path").notNull().default(""),
    // New generic stack model
    source_stack: jsonb("source_stack").notNull().default({}),
    target_stack: jsonb("target_stack").notNull().default({}),
    migration_scope: jsonb("migration_scope").notNull().default({}),
    // Legacy fields (deprecated — kept for backward compatibility)
    sitecore_version: text("sitecore_version").notNull().default(""),
    topology: text("topology").notNull().default(""),
    source_cloud: text("source_cloud").notNull().default("aws"),
    target_cloud: text("target_cloud").notNull().default("azure"),
    target_timeline: text("target_timeline").notNull().default(""),
    environment_count: integer("environment_count").notNull().default(1),
    environments: jsonb("environments").notNull().default([]),
    status: text("status").notNull().default("discovery"),
    challenge_required: boolean("challenge_required").notNull().default(false),
    created_at: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
}, (t) => [index("idx_assessments_project_path").on(t.project_path)]);
// ── Per-dimension discovery status ──────────────────────────
export const discoveryDimensions = pgTable("discovery_dimensions", {
    assessment_id: text("assessment_id")
        .notNull()
        .references(() => assessments.id, { onDelete: "cascade" }),
    dimension: text("dimension").notNull(),
    status: text("status").notNull().default("not_started"),
    completed_at: timestamp("completed_at", { mode: "string" }),
    last_updated: timestamp("last_updated", { mode: "string" }).notNull().defaultNow(),
}, (t) => [primaryKey({ columns: [t.assessment_id, t.dimension] })]);
// ── Individual discovery answers ────────────────────────────
export const discoveryAnswers = pgTable("discovery_answers", {
    assessment_id: text("assessment_id")
        .notNull()
        .references(() => assessments.id, { onDelete: "cascade" }),
    dimension: text("dimension").notNull(),
    question_id: text("question_id").notNull(),
    value: jsonb("value").notNull().default(null),
    notes: text("notes").notNull().default(""),
    confidence: text("confidence").notNull().default("unknown"),
    basis: text("basis"),
}, (t) => [primaryKey({ columns: [t.assessment_id, t.dimension, t.question_id] })]);
// ── Risk records from analysis ──────────────────────────────
export const risks = pgTable("risks", {
    id: text("id").notNull(),
    assessment_id: text("assessment_id")
        .notNull()
        .references(() => assessments.id, { onDelete: "cascade" }),
    category: text("category").notNull().default(""),
    description: text("description").notNull().default(""),
    likelihood: text("likelihood").notNull().default(""),
    impact: text("impact").notNull().default(""),
    severity: text("severity").notNull().default(""),
    estimated_hours_impact: real("estimated_hours_impact").notNull().default(0),
    linked_assumptions: jsonb("linked_assumptions").notNull().default([]),
    mitigation: text("mitigation").notNull().default(""),
    contingency: text("contingency").notNull().default(""),
    owner: text("owner").notNull().default(""),
    status: text("status").notNull().default("open"),
}, (t) => [primaryKey({ columns: [t.id, t.assessment_id] })]);
// ── Formal assumption tracking ──────────────────────────────
export const assumptions = pgTable("assumptions", {
    id: text("id").notNull(),
    assessment_id: text("assessment_id")
        .notNull()
        .references(() => assessments.id, { onDelete: "cascade" }),
    dimension: text("dimension").notNull().default(""),
    question_id: text("question_id"),
    assumed_value: text("assumed_value").notNull().default(""),
    basis: text("basis").notNull().default(""),
    confidence: text("confidence").notNull().default("unknown"),
    validation_status: text("validation_status").notNull().default("unvalidated"),
    validation_method: text("validation_method").notNull().default(""),
    pessimistic_widening_hours: real("pessimistic_widening_hours").notNull().default(0),
    affected_components: jsonb("affected_components").notNull().default([]),
    created_at: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
    validated_at: timestamp("validated_at", { mode: "string" }),
    actual_value: text("actual_value"),
}, (t) => [primaryKey({ columns: [t.id, t.assessment_id] })]);
// ── Active complexity multipliers ───────────────────────────
export const activeMultipliers = pgTable("active_multipliers", {
    assessment_id: text("assessment_id")
        .notNull()
        .references(() => assessments.id, { onDelete: "cascade" }),
    multiplier_id: text("multiplier_id").notNull(),
    name: text("name").notNull().default(""),
    factor: real("factor").notNull().default(1.0),
    trigger_condition: text("trigger_condition").notNull().default(""),
    affected_components: jsonb("affected_components").notNull().default([]),
}, (t) => [primaryKey({ columns: [t.assessment_id, t.multiplier_id] })]);
// ── Dependency chains ───────────────────────────────────────
export const dependencyChains = pgTable("dependency_chains", {
    assessment_id: text("assessment_id")
        .notNull()
        .references(() => assessments.id, { onDelete: "cascade" }),
    from_component: text("from_component").notNull(),
    to_component: text("to_component").notNull(),
    dependency_type: text("dependency_type").notNull().default("hard"),
}, (t) => [primaryKey({ columns: [t.assessment_id, t.from_component, t.to_component] })]);
// ── Risk clusters ───────────────────────────────────────────
export const riskClusters = pgTable("risk_clusters", {
    assessment_id: text("assessment_id")
        .notNull()
        .references(() => assessments.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    risks: jsonb("risks").notNull().default([]),
    assumptions: jsonb("assumptions").notNull().default([]),
    combined_widening_hours: real("combined_widening_hours").notNull().default(0),
}, (t) => [primaryKey({ columns: [t.assessment_id, t.name] })]);
// ── Versioned estimate snapshots ────────────────────────────
export const estimateSnapshots = pgTable("estimate_snapshots", {
    id: serial("id").primaryKey(),
    assessment_id: text("assessment_id")
        .notNull()
        .references(() => assessments.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    confidence_score: real("confidence_score").notNull().default(0),
    total_base_hours: real("total_base_hours").notNull().default(0),
    total_gotcha_hours: real("total_gotcha_hours").notNull().default(0),
    total_expected_hours: real("total_expected_hours").notNull().default(0),
    assumption_widening_hours: real("assumption_widening_hours").notNull().default(0),
    totals: jsonb("totals").notNull().default({}),
    total_by_role: jsonb("total_by_role").notNull().default({}),
    client_summary: jsonb("client_summary").notNull().default({}),
    phases_json: jsonb("phases_json").notNull().default([]),
    created_at: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
}, (t) => [unique("uq_estimate_version").on(t.assessment_id, t.version)]);
// ── Per-component detail within an estimate ─────────────────
export const estimateComponents = pgTable("estimate_components", {
    snapshot_id: integer("snapshot_id")
        .notNull()
        .references(() => estimateSnapshots.id, { onDelete: "cascade" }),
    phase_id: text("phase_id").notNull(),
    phase_name: text("phase_name").notNull().default(""),
    component_id: text("component_id").notNull(),
    component_name: text("component_name").notNull().default(""),
    units: integer("units").notNull().default(1),
    base_hours: real("base_hours").notNull().default(0),
    multipliers_applied: jsonb("multipliers_applied").notNull().default([]),
    gotcha_hours: real("gotcha_hours").notNull().default(0),
    final_hours: real("final_hours").notNull().default(0),
    firm_hours: real("firm_hours").notNull().default(0),
    assumption_dependent_hours: real("assumption_dependent_hours").notNull().default(0),
    assumptions_affecting: jsonb("assumptions_affecting").notNull().default([]),
    hours: jsonb("hours").notNull().default({}),
    ai_alternatives: jsonb("ai_alternatives").notNull().default([]),
    by_role: jsonb("by_role").notNull().default({}),
}, (t) => [primaryKey({ columns: [t.snapshot_id, t.component_id] })]);
// ── AI tool selection states ────────────────────────────────
export const aiSelections = pgTable("ai_selections", {
    assessment_id: text("assessment_id")
        .notNull()
        .references(() => assessments.id, { onDelete: "cascade" }),
    tool_id: text("tool_id").notNull(),
    enabled: boolean("enabled").notNull().default(false),
    reason: text("reason"),
}, (t) => [primaryKey({ columns: [t.assessment_id, t.tool_id] })]);
// ── Scope exclusions (refine step) ──────────────────────────
export const scopeExclusions = pgTable("scope_exclusions", {
    assessment_id: text("assessment_id")
        .notNull()
        .references(() => assessments.id, { onDelete: "cascade" }),
    component_id: text("component_id").notNull(),
    excluded: boolean("excluded").notNull().default(false),
    reason: text("reason"),
}, (t) => [primaryKey({ columns: [t.assessment_id, t.component_id] })]);
// ── Calibration records ─────────────────────────────────────
export const calibrations = pgTable("calibrations", {
    id: serial("id").primaryKey(),
    assessment_id: text("assessment_id")
        .notNull()
        .references(() => assessments.id, { onDelete: "cascade" }),
    engagement_name: text("engagement_name").notNull().default(""),
    estimate_date: text("estimate_date").notNull().default(""),
    calibration_date: timestamp("calibration_date", { mode: "string" }).notNull().defaultNow(),
    status: text("status").notNull().default("in_progress"),
    total_estimated: jsonb("total_estimated").notNull().default({}),
    total_actual: real("total_actual"),
    surprises: jsonb("surprises").notNull().default([]),
    smoother: jsonb("smoother").notNull().default([]),
    suggested_adjustments: jsonb("suggested_adjustments").notNull().default([]),
    created_at: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});
export const calibrationPhases = pgTable("calibration_phases", {
    calibration_id: integer("calibration_id")
        .notNull()
        .references(() => calibrations.id, { onDelete: "cascade" }),
    phase_id: text("phase_id").notNull(),
    phase_name: text("phase_name").notNull().default(""),
    estimated_hours: real("estimated_hours").notNull().default(0),
    actual_hours: real("actual_hours").notNull().default(0),
    variance_percent: real("variance_percent").notNull().default(0),
    variance_direction: text("variance_direction").notNull().default(""),
    notes: text("notes").notNull().default(""),
}, (t) => [primaryKey({ columns: [t.calibration_id, t.phase_id] })]);
export const calibrationComponents = pgTable("calibration_components", {
    calibration_id: integer("calibration_id")
        .notNull()
        .references(() => calibrations.id, { onDelete: "cascade" }),
    component_id: text("component_id").notNull(),
    estimated_hours: real("estimated_hours").notNull().default(0),
    actual_hours: real("actual_hours").notNull().default(0),
    variance_percent: real("variance_percent").notNull().default(0),
    notes: text("notes").notNull().default(""),
}, (t) => [primaryKey({ columns: [t.calibration_id, t.component_id] })]);
export const calibrationAiTools = pgTable("calibration_ai_tools", {
    calibration_id: integer("calibration_id")
        .notNull()
        .references(() => calibrations.id, { onDelete: "cascade" }),
    tool_id: text("tool_id").notNull(),
    tool_name: text("tool_name").notNull().default(""),
    was_used: boolean("was_used").notNull().default(false),
    estimated_savings_hours: real("estimated_savings_hours").notNull().default(0),
    actual_savings_hours: real("actual_savings_hours").notNull().default(0),
    variance_percent: real("variance_percent").notNull().default(0),
    notes: text("notes").notNull().default(""),
}, (t) => [primaryKey({ columns: [t.calibration_id, t.tool_id] })]);
// ── Challenge reviews (quality gate half-steps) ─────────────
export const challengeReviews = pgTable("challenge_reviews", {
    id: serial("id").primaryKey(),
    assessment_id: text("assessment_id")
        .notNull()
        .references(() => assessments.id, { onDelete: "cascade" }),
    step: text("step").notNull(), // discovery | analysis | estimate | refine
    round: integer("round").notNull().default(1),
    status: text("status").notNull().default("in_progress"), // in_progress | passed | conditional_pass | failed | skipped
    confidence_score: real("confidence_score").notNull().default(0),
    score_breakdown: jsonb("score_breakdown").notNull().default({}),
    acceptance_criteria_met: jsonb("acceptance_criteria_met").notNull().default({}),
    challenges: jsonb("challenges").notNull().default([]),
    findings: jsonb("findings").notNull().default([]),
    summary: text("summary").notNull().default(""),
    created_at: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
    completed_at: timestamp("completed_at", { mode: "string" }),
}, (t) => [
    index("idx_challenge_reviews_assessment").on(t.assessment_id),
    index("idx_challenge_reviews_step").on(t.assessment_id, t.step),
]);
// ── Workspace state (active assessment per directory) ────────
export const workspaceState = pgTable("workspace_state", {
    project_path: text("project_path").primaryKey(),
    active_assessment_id: text("active_assessment_id")
        .notNull()
        .references(() => assessments.id, { onDelete: "cascade" }),
    updated_at: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});
// ── Track generated deliverables ────────────────────────────
export const deliverables = pgTable("deliverables", {
    assessment_id: text("assessment_id")
        .notNull()
        .references(() => assessments.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    file_path: text("file_path").notNull().default(""),
    generated_at: timestamp("generated_at", { mode: "string" }).notNull().defaultNow(),
}, (t) => [primaryKey({ columns: [t.assessment_id, t.name] })]);
// ── Knowledge Packs ─────────────────────────────────────────
export const knowledgePacks = pgTable("knowledge_packs", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    vendor: text("vendor").notNull().default(""),
    category: text("category").notNull(),
    subcategory: text("subcategory").notNull().default(""),
    description: text("description").notNull().default(""),
    direction: text("direction").notNull().default("both"),
    latest_version: text("latest_version").notNull().default(""),
    supported_versions: jsonb("supported_versions").notNull().default([]),
    eol_versions: jsonb("eol_versions").notNull().default({}),
    valid_topologies: jsonb("valid_topologies").notNull().default([]),
    deployment_models: jsonb("deployment_models").notNull().default([]),
    compatible_targets: jsonb("compatible_targets").notNull().default([]),
    compatible_infrastructure: jsonb("compatible_infrastructure").notNull().default([]),
    required_services: jsonb("required_services").notNull().default([]),
    optional_services: jsonb("optional_services").notNull().default([]),
    confidence: text("confidence").notNull().default("draft"),
    last_researched: timestamp("last_researched", { mode: "string" }),
    pack_version: text("pack_version").notNull().default("1"),
    created_at: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
}, (t) => [
    index("idx_knowledge_packs_category").on(t.category),
    index("idx_knowledge_packs_direction").on(t.direction),
]);
// ── Knowledge Pack Versions (snapshot tracking) ─────────────
export const knowledgePackVersions = pgTable("knowledge_pack_versions", {
    id: serial("id").primaryKey(),
    pack_id: text("pack_id")
        .notNull()
        .references(() => knowledgePacks.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    created_by: text("created_by").notNull().default(""),
    change_summary: text("change_summary").notNull().default(""),
    snapshot_data: jsonb("snapshot_data").notNull().default({}),
    created_at: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
}, (t) => [
    unique("uq_pack_version").on(t.pack_id, t.version),
    index("idx_pack_versions_pack_id").on(t.pack_id),
]);
// ── Knowledge Discovery Trees ───────────────────────────────
export const knowledgeDiscoveryTrees = pgTable("knowledge_discovery_trees", {
    pack_id: text("pack_id")
        .notNull()
        .references(() => knowledgePacks.id, { onDelete: "cascade" }),
    version: integer("version").notNull().default(1),
    dimensions_json: jsonb("dimensions_json").notNull().default([]),
    created_at: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
}, (t) => [primaryKey({ columns: [t.pack_id, t.version] })]);
// ── Knowledge Effort Hours ──────────────────────────────────
export const knowledgeEffortHours = pgTable("knowledge_effort_hours", {
    pack_id: text("pack_id")
        .notNull()
        .references(() => knowledgePacks.id, { onDelete: "cascade" }),
    component_id: text("component_id").notNull(),
    component_name: text("component_name").notNull().default(""),
    base_hours: real("base_hours").notNull().default(0),
    unit: text("unit").notNull().default(""),
    includes: text("includes").notNull().default(""),
    role_breakdown: jsonb("role_breakdown").notNull().default({}),
    phase_id: text("phase_id").notNull().default(""),
}, (t) => [primaryKey({ columns: [t.pack_id, t.component_id] })]);
// ── Knowledge Multipliers ───────────────────────────────────
export const knowledgeMultipliers = pgTable("knowledge_multipliers", {
    pack_id: text("pack_id")
        .notNull()
        .references(() => knowledgePacks.id, { onDelete: "cascade" }),
    multiplier_id: text("multiplier_id").notNull(),
    condition: text("condition").notNull().default(""),
    factor: real("factor").notNull().default(1.0),
    applies_to: jsonb("applies_to").notNull().default([]),
    reason: text("reason").notNull().default(""),
    supersedes: text("supersedes"),
}, (t) => [primaryKey({ columns: [t.pack_id, t.multiplier_id] })]);
// ── Knowledge Gotcha Patterns ───────────────────────────────
export const knowledgeGotchaPatterns = pgTable("knowledge_gotcha_patterns", {
    pack_id: text("pack_id")
        .notNull()
        .references(() => knowledgePacks.id, { onDelete: "cascade" }),
    pattern_id: text("pattern_id").notNull(),
    pattern_condition: text("pattern_condition").notNull().default(""),
    risk_level: text("risk_level").notNull().default("medium"),
    hours_impact: real("hours_impact").notNull().default(0),
    description: text("description").notNull().default(""),
    mitigation: text("mitigation").notNull().default(""),
    affected_components: jsonb("affected_components").notNull().default([]),
}, (t) => [primaryKey({ columns: [t.pack_id, t.pattern_id] })]);
// ── Knowledge Dependency Chains ─────────────────────────────
export const knowledgeDependencyChains = pgTable("knowledge_dependency_chains", {
    pack_id: text("pack_id")
        .notNull()
        .references(() => knowledgePacks.id, { onDelete: "cascade" }),
    chain_id: text("chain_id").notNull(),
    predecessor: text("predecessor").notNull(),
    successors: jsonb("successors").notNull().default([]),
    dependency_type: text("dependency_type").notNull().default("hard"),
    reason: text("reason").notNull().default(""),
}, (t) => [primaryKey({ columns: [t.pack_id, t.chain_id] })]);
// ── Knowledge Phase Mappings ────────────────────────────────
export const knowledgePhaseMappings = pgTable("knowledge_phase_mappings", {
    pack_id: text("pack_id")
        .notNull()
        .references(() => knowledgePacks.id, { onDelete: "cascade" }),
    phase_id: text("phase_id").notNull(),
    phase_name: text("phase_name").notNull().default(""),
    phase_order: integer("phase_order").notNull().default(0),
    component_ids: jsonb("component_ids").notNull().default([]),
}, (t) => [primaryKey({ columns: [t.pack_id, t.phase_id] })]);
// ── Knowledge Roles ─────────────────────────────────────────
export const knowledgeRoles = pgTable("knowledge_roles", {
    pack_id: text("pack_id")
        .notNull()
        .references(() => knowledgePacks.id, { onDelete: "cascade" }),
    role_id: text("role_id").notNull(),
    description: text("description").notNull().default(""),
    typical_rate_range: text("typical_rate_range").notNull().default(""),
}, (t) => [primaryKey({ columns: [t.pack_id, t.role_id] })]);
// ── Migration Paths ─────────────────────────────────────────
export const migrationPaths = pgTable("migration_paths", {
    id: text("id").primaryKey(),
    source_pack_id: text("source_pack_id")
        .notNull()
        .references(() => knowledgePacks.id, { onDelete: "cascade" }),
    target_pack_id: text("target_pack_id")
        .notNull()
        .references(() => knowledgePacks.id, { onDelete: "cascade" }),
    prevalence: text("prevalence").notNull().default(""),
    complexity: text("complexity").notNull().default(""),
    typical_duration: text("typical_duration").notNull().default(""),
    primary_drivers: jsonb("primary_drivers").notNull().default([]),
    prerequisites: jsonb("prerequisites").notNull().default([]),
    service_map: jsonb("service_map").notNull().default({}),
    migration_tools: jsonb("migration_tools").notNull().default([]),
    path_gotcha_patterns: jsonb("path_gotcha_patterns").notNull().default([]),
    path_effort_adjustments: jsonb("path_effort_adjustments").notNull().default([]),
    step_by_step: text("step_by_step").notNull().default(""),
    decision_points: text("decision_points").notNull().default(""),
    case_studies: text("case_studies").notNull().default(""),
    incompatibilities: text("incompatibilities").notNull().default(""),
    confidence: text("confidence").notNull().default("draft"),
    last_researched: timestamp("last_researched", { mode: "string" }),
    version: text("version").notNull().default("1"),
    created_at: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
}, (t) => [
    unique("uq_migration_path_pair").on(t.source_pack_id, t.target_pack_id),
    index("idx_migration_paths_source").on(t.source_pack_id),
    index("idx_migration_paths_target").on(t.target_pack_id),
]);
// ── Knowledge AI Alternatives ───────────────────────────────
export const knowledgeAiAlternatives = pgTable("knowledge_ai_alternatives", {
    pack_id: text("pack_id")
        .notNull()
        .references(() => knowledgePacks.id, { onDelete: "cascade" }),
    tool_id: text("tool_id").notNull(),
    name: text("name").notNull().default(""),
    vendor: text("vendor").notNull().default(""),
    category: text("category").notNull().default(""),
    description: text("description").notNull().default(""),
    url: text("url").notNull().default(""),
    applicable_components: jsonb("applicable_components").notNull().default([]),
    applicable_phases: jsonb("applicable_phases").notNull().default([]),
    hours_saved: jsonb("hours_saved").notNull().default({}),
    cost: jsonb("cost").notNull().default({}),
    pros: jsonb("pros").notNull().default([]),
    cons: jsonb("cons").notNull().default([]),
    prerequisites: jsonb("prerequisites").notNull().default([]),
    recommendation: text("recommendation").notNull().default("conditional"),
    applicability_conditions: jsonb("applicability_conditions").notNull().default({}),
    mutual_exclusion_group: text("mutual_exclusion_group"),
}, (t) => [primaryKey({ columns: [t.pack_id, t.tool_id] })]);
// ── Knowledge Source URLs ───────────────────────────────────
export const knowledgeSourceUrls = pgTable("knowledge_source_urls", {
    id: serial("id").primaryKey(),
    pack_id: text("pack_id").references(() => knowledgePacks.id, { onDelete: "cascade" }),
    migration_path_id: text("migration_path_id").references(() => migrationPaths.id, { onDelete: "cascade" }),
    source_url: text("source_url").notNull(),
    title: text("title").notNull().default(""),
    source_type: text("source_type").notNull().default("vendor-docs"),
    accessed_at: timestamp("accessed_at", { mode: "string" }).notNull().defaultNow(),
    claims: jsonb("claims").notNull().default([]),
    confidence: text("confidence").notNull().default("medium"),
    still_accessible: boolean("still_accessible").notNull().default(true),
}, (t) => [
    index("idx_source_urls_pack").on(t.pack_id),
    index("idx_source_urls_path").on(t.migration_path_id),
]);
// ── Assessment Knowledge Pins ───────────────────────────────
export const assessmentKnowledgePins = pgTable("assessment_knowledge_pins", {
    assessment_id: text("assessment_id")
        .notNull()
        .references(() => assessments.id, { onDelete: "cascade" }),
    pack_id: text("pack_id")
        .notNull()
        .references(() => knowledgePacks.id, { onDelete: "cascade" }),
    pinned_version: integer("pinned_version").notNull(),
    pinned_at: timestamp("pinned_at", { mode: "string" }).notNull().defaultNow(),
}, (t) => [primaryKey({ columns: [t.assessment_id, t.pack_id] })]);
// ── Knowledge Proficiency Catalog ───────────────────────────
export const knowledgeProficiencyCatalog = pgTable("knowledge_proficiency_catalog", {
    category_id: text("category_id").primaryKey(),
    name: text("name").notNull().default(""),
    description: text("description").notNull().default(""),
    adoption_base_hours: real("adoption_base_hours").notNull().default(0),
    maps_to_tools: jsonb("maps_to_tools").notNull().default([]),
    created_at: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});
// ── WBS Snapshots ───────────────────────────────────────────
export const wbsSnapshots = pgTable("wbs_snapshots", {
    id: serial("id").primaryKey(),
    assessment_id: text("assessment_id")
        .notNull()
        .references(() => assessments.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    estimate_version: integer("estimate_version").notNull().default(1),
    total_items: integer("total_items").notNull().default(0),
    total_hours: real("total_hours").notNull().default(0),
    created_at: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
}, (t) => [unique("uq_wbs_version").on(t.assessment_id, t.version)]);
// ── Work Items ──────────────────────────────────────────────
export const workItems = pgTable("work_items", {
    id: serial("id").primaryKey(),
    snapshot_id: integer("snapshot_id")
        .notNull()
        .references(() => wbsSnapshots.id, { onDelete: "cascade" }),
    parent_id: integer("parent_id"),
    type: text("type").notNull().default("story"), // epic|feature|story|task|spike
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    hours: real("hours").notNull().default(0),
    base_hours: real("base_hours").notNull().default(0),
    role: text("role"),
    phase_id: text("phase_id").notNull().default(""),
    component_id: text("component_id").notNull().default(""),
    labels: jsonb("labels").notNull().default([]),
    acceptance_criteria: jsonb("acceptance_criteria").notNull().default([]),
    priority: text("priority").notNull().default("medium"),
    confidence: text("confidence").notNull().default("medium"),
    sort_order: integer("sort_order").notNull().default(0),
    source: text("source").notNull().default("generated"), // generated|custom
    blocked_by: jsonb("blocked_by").notNull().default([]),
    blocks: jsonb("blocks").notNull().default([]),
}, (t) => [
    index("idx_work_items_snapshot").on(t.snapshot_id),
    index("idx_work_items_parent").on(t.parent_id),
]);
// ── Team Snapshots ──────────────────────────────────────────
export const teamSnapshots = pgTable("team_snapshots", {
    id: serial("id").primaryKey(),
    assessment_id: text("assessment_id")
        .notNull()
        .references(() => assessments.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    estimate_version: integer("estimate_version").notNull().default(1),
    assumptions: jsonb("assumptions").notNull().default({}),
    cost_projection: jsonb("cost_projection").notNull().default({}),
    phase_staffing: jsonb("phase_staffing").notNull().default([]),
    hiring_notes: jsonb("hiring_notes").notNull().default([]),
    notes: text("notes").notNull().default(""),
    created_at: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
}, (t) => [unique("uq_team_version").on(t.assessment_id, t.version)]);
// ── Team Roles ──────────────────────────────────────────────
export const teamRoles = pgTable("team_roles", {
    id: serial("id").primaryKey(),
    snapshot_id: integer("snapshot_id")
        .notNull()
        .references(() => teamSnapshots.id, { onDelete: "cascade" }),
    role_id: text("role_id").notNull(),
    role_name: text("role_name").notNull().default(""),
    total_hours: real("total_hours").notNull().default(0),
    base_hours: real("base_hours").notNull().default(0),
    headcount: integer("headcount").notNull().default(1),
    allocation: text("allocation").notNull().default("full-time"),
    seniority: text("seniority").notNull().default("mid"),
    rate_min: real("rate_min").notNull().default(0),
    rate_max: real("rate_max").notNull().default(0),
    rate_override: real("rate_override"),
    phases: jsonb("phases").notNull().default([]),
    notes: text("notes").notNull().default(""),
    source: text("source").notNull().default("generated"),
    sort_order: integer("sort_order").notNull().default(0),
}, (t) => [index("idx_team_roles_snapshot").on(t.snapshot_id)]);
// ── Analytics Events ─────────────────────────────────────────
export const analyticsEvents = pgTable("analytics_events", {
    id: serial("id").primaryKey(),
    session_id: text("session_id").notNull(),
    event: text("event").notNull(),
    category: text("category").notNull().default(""),
    properties: jsonb("properties").notNull().default({}),
    path: text("path").notNull().default(""),
    assessment_id: text("assessment_id"),
    created_at: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
}, (t) => [
    index("idx_analytics_events_session").on(t.session_id),
    index("idx_analytics_events_event").on(t.event),
    index("idx_analytics_events_created_at").on(t.created_at),
]);
//# sourceMappingURL=schema.js.map