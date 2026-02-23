import { z } from "zod";
import { getDb, saveKnowledgePack as dbSaveKnowledgePack, getKnowledgePackById as dbGetKnowledgePackById, getKnowledgePackFull as dbGetKnowledgePackFull, listKnowledgePacks as dbListKnowledgePacks, deleteKnowledgePack as dbDeleteKnowledgePack, saveHeuristics as dbSaveHeuristics, getHeuristicsForPacks as dbGetHeuristicsForPacks, saveDiscoveryTree as dbSaveDiscoveryTree, getDiscoveryTree as dbGetDiscoveryTree, saveMigrationPath as dbSaveMigrationPath, getMigrationPath as dbGetMigrationPath, listMigrationPaths as dbListMigrationPaths, saveSourceUrls as dbSaveSourceUrls, checkUrlFreshness as dbCheckUrlFreshness, pinKnowledgeVersion as dbPinKnowledgeVersion, getPinnedKnowledge as dbGetPinnedKnowledge, composeDiscoveryTree as dbComposeDiscoveryTree, composeHeuristics as dbComposeHeuristics, } from "@migration-planner/db";
import { knowledgeAiAlternatives, knowledgeProficiencyCatalog, } from "@migration-planner/db";
import { eq } from "drizzle-orm";
// ── save_knowledge_pack ─────────────────────────────────────
export const saveKnowledgePackSchema = z.object({
    id: z.string(),
    name: z.string(),
    vendor: z.string().default(""),
    category: z.string(),
    subcategory: z.string().default(""),
    description: z.string().default(""),
    direction: z.string().default("both"),
    latest_version: z.string().default(""),
    supported_versions: z.unknown().default([]),
    eol_versions: z.unknown().default({}),
    valid_topologies: z.unknown().default([]),
    deployment_models: z.unknown().default([]),
    compatible_targets: z.unknown().default([]),
    compatible_infrastructure: z.unknown().default([]),
    required_services: z.unknown().default([]),
    optional_services: z.unknown().default([]),
    confidence: z.string().default("draft"),
    last_researched: z.string().nullable().default(null),
    pack_version: z.string().default("1"),
    created_by: z.string().default(""),
    change_summary: z.string().default(""),
});
export async function saveKnowledgePack(input) {
    const db = getDb();
    return dbSaveKnowledgePack(db, input);
}
// ── get_knowledge_pack ──────────────────────────────────────
export const getKnowledgePackSchema = z.object({
    pack_id: z.string(),
    include: z.array(z.enum(["heuristics", "discovery", "ai_alternatives", "sources"])).optional(),
    version: z.number().optional(),
});
export async function getKnowledgePack(input) {
    const db = getDb();
    if (input.include && input.include.length > 0) {
        return dbGetKnowledgePackFull(db, input.pack_id, input.include, input.version);
    }
    return dbGetKnowledgePackById(db, input.pack_id);
}
// ── list_knowledge_packs ────────────────────────────────────
export const listKnowledgePacksSchema = z.object({
    category: z.string().optional(),
    direction: z.string().optional(),
    subcategory: z.string().optional(),
    search: z.string().optional(),
});
export async function listKnowledgePacks(input) {
    const db = getDb();
    return dbListKnowledgePacks(db, input);
}
// ── delete_knowledge_pack ───────────────────────────────────
export const deleteKnowledgePackSchema = z.object({
    pack_id: z.string(),
});
export async function deleteKnowledgePack(input) {
    const db = getDb();
    return dbDeleteKnowledgePack(db, input.pack_id);
}
// ── save_discovery_tree ─────────────────────────────────────
export const saveDiscoveryTreeSchema = z.object({
    pack_id: z.string(),
    dimensions: z.unknown().default([]),
});
export async function saveDiscoveryTreeKnowledge(input) {
    const db = getDb();
    return dbSaveDiscoveryTree(db, input);
}
// ── get_discovery_tree ──────────────────────────────────────
export const getDiscoveryTreeSchema = z.object({
    pack_ids: z.array(z.string()),
    version: z.number().optional(),
});
export async function getDiscoveryTreeKnowledge(input) {
    const db = getDb();
    return dbGetDiscoveryTree(db, input.pack_ids, input.version);
}
// ── save_heuristics ─────────────────────────────────────────
export const saveHeuristicsSchema = z.object({
    pack_id: z.string(),
    effort_hours: z.array(z.object({
        component_id: z.string(),
        component_name: z.string().default(""),
        base_hours: z.number().default(0),
        unit: z.string().default(""),
        includes: z.string().default(""),
        role_breakdown: z.unknown().default({}),
        phase_id: z.string().default(""),
    })).default([]),
    multipliers: z.array(z.object({
        multiplier_id: z.string(),
        condition: z.string().default(""),
        factor: z.number().default(1.0),
        applies_to: z.unknown().default([]),
        reason: z.string().default(""),
        supersedes: z.string().nullable().default(null),
    })).default([]),
    gotcha_patterns: z.array(z.object({
        pattern_id: z.string(),
        pattern_condition: z.string().default(""),
        risk_level: z.string().default("medium"),
        hours_impact: z.number().default(0),
        description: z.string().default(""),
        mitigation: z.string().default(""),
        affected_components: z.unknown().default([]),
    })).default([]),
    dependency_chains: z.array(z.object({
        chain_id: z.string(),
        predecessor: z.string(),
        successors: z.unknown().default([]),
        dependency_type: z.string().default("hard"),
        reason: z.string().default(""),
    })).default([]),
    phase_mappings: z.array(z.object({
        phase_id: z.string(),
        phase_name: z.string().default(""),
        phase_order: z.number().default(0),
        component_ids: z.unknown().default([]),
    })).default([]),
    roles: z.array(z.object({
        role_id: z.string(),
        description: z.string().default(""),
        typical_rate_range: z.string().default(""),
    })).default([]),
});
export async function saveHeuristics(input) {
    const db = getDb();
    return dbSaveHeuristics(db, input);
}
// ── get_heuristics ──────────────────────────────────────────
export const getHeuristicsSchema = z.object({
    pack_ids: z.array(z.string()),
    type: z.enum(["effort", "multipliers", "gotchas", "chains", "phases", "roles"]).optional(),
});
export async function getHeuristics(input) {
    const db = getDb();
    return dbGetHeuristicsForPacks(db, input.pack_ids, input.type);
}
// ── save_migration_path ─────────────────────────────────────
export const saveMigrationPathSchema = z.object({
    id: z.string(),
    source_pack_id: z.string(),
    target_pack_id: z.string(),
    prevalence: z.string().default(""),
    complexity: z.string().default(""),
    typical_duration: z.string().default(""),
    primary_drivers: z.unknown().default([]),
    prerequisites: z.unknown().default([]),
    service_map: z.unknown().default({}),
    migration_tools: z.unknown().default([]),
    path_gotcha_patterns: z.unknown().default([]),
    path_effort_adjustments: z.unknown().default([]),
    step_by_step: z.string().default(""),
    decision_points: z.string().default(""),
    case_studies: z.string().default(""),
    incompatibilities: z.string().default(""),
    confidence: z.string().default("draft"),
    last_researched: z.string().nullable().default(null),
    version: z.string().default("1"),
});
export async function saveMigrationPath(input) {
    const db = getDb();
    return dbSaveMigrationPath(db, input);
}
// ── get_migration_path ──────────────────────────────────────
export const getMigrationPathSchema = z.object({
    id: z.string().optional(),
    source_pack_id: z.string().optional(),
    target_pack_id: z.string().optional(),
});
export async function getMigrationPath(input) {
    const db = getDb();
    return dbGetMigrationPath(db, input);
}
// ── list_migration_paths ────────────────────────────────────
export const listMigrationPathsSchema = z.object({
    source_pack_id: z.string().optional(),
    target_pack_id: z.string().optional(),
    complexity: z.string().optional(),
    prevalence: z.string().optional(),
});
export async function listMigrationPaths(input) {
    const db = getDb();
    return dbListMigrationPaths(db, input);
}
// ── save_source_urls ────────────────────────────────────────
export const saveSourceUrlsSchema = z.object({
    pack_id: z.string().nullable().optional(),
    migration_path_id: z.string().nullable().optional(),
    urls: z.array(z.object({
        source_url: z.string(),
        title: z.string().default(""),
        source_type: z.string().default("vendor-docs"),
        claims: z.unknown().default([]),
        confidence: z.string().default("medium"),
        still_accessible: z.boolean().default(true),
    })),
});
export async function saveSourceUrls(input) {
    const db = getDb();
    return dbSaveSourceUrls(db, input);
}
// ── save_ai_alternatives ────────────────────────────────────
export const saveAiAlternativesSchema = z.object({
    pack_id: z.string(),
    alternatives: z.array(z.object({
        tool_id: z.string(),
        name: z.string().default(""),
        vendor: z.string().default(""),
        category: z.string().default(""),
        description: z.string().default(""),
        url: z.string().default(""),
        applicable_components: z.unknown().default([]),
        applicable_phases: z.unknown().default([]),
        hours_saved: z.unknown().default({}),
        cost: z.unknown().default({}),
        pros: z.unknown().default([]),
        cons: z.unknown().default([]),
        prerequisites: z.unknown().default([]),
        recommendation: z.string().default("conditional"),
        applicability_conditions: z.unknown().default({}),
        mutual_exclusion_group: z.string().nullable().default(null),
    })),
});
export async function saveAiAlternatives(input) {
    const db = getDb();
    await db.transaction(async (tx) => {
        // Delete existing alternatives for this pack
        await tx.delete(knowledgeAiAlternatives).where(eq(knowledgeAiAlternatives.pack_id, input.pack_id));
        // Insert new alternatives
        for (const alt of input.alternatives) {
            await tx.insert(knowledgeAiAlternatives).values({
                pack_id: input.pack_id,
                tool_id: alt.tool_id,
                name: alt.name ?? "",
                vendor: alt.vendor ?? "",
                category: alt.category ?? "",
                description: alt.description ?? "",
                url: alt.url ?? "",
                applicable_components: alt.applicable_components ?? [],
                applicable_phases: alt.applicable_phases ?? [],
                hours_saved: alt.hours_saved ?? {},
                cost: alt.cost ?? {},
                pros: alt.pros ?? [],
                cons: alt.cons ?? [],
                prerequisites: alt.prerequisites ?? [],
                recommendation: alt.recommendation ?? "conditional",
                applicability_conditions: alt.applicability_conditions ?? {},
                mutual_exclusion_group: alt.mutual_exclusion_group ?? null,
            });
        }
    });
    return { success: true, pack_id: input.pack_id, count: input.alternatives.length };
}
// ── pin_knowledge_version ───────────────────────────────────
export const pinKnowledgeVersionSchema = z.object({
    assessment_id: z.string(),
    pack_ids: z.array(z.string()),
});
export async function pinKnowledgeVersion(input) {
    const db = getDb();
    return dbPinKnowledgeVersion(db, input);
}
// ── get_pinned_knowledge ────────────────────────────────────
export const getPinnedKnowledgeSchema = z.object({
    assessment_id: z.string(),
});
export async function getPinnedKnowledge(input) {
    const db = getDb();
    return dbGetPinnedKnowledge(db, input.assessment_id);
}
// ── save_proficiency_catalog ────────────────────────────────
export const saveProficiencyCatalogSchema = z.object({
    categories: z.array(z.object({
        category_id: z.string(),
        name: z.string().default(""),
        description: z.string().default(""),
        adoption_base_hours: z.number().default(0),
        maps_to_tools: z.unknown().default([]),
    })),
});
export async function saveProficiencyCatalog(input) {
    const db = getDb();
    const now = new Date().toISOString();
    for (const cat of input.categories) {
        await db
            .insert(knowledgeProficiencyCatalog)
            .values({
            category_id: cat.category_id,
            name: cat.name ?? "",
            description: cat.description ?? "",
            adoption_base_hours: cat.adoption_base_hours ?? 0,
            maps_to_tools: cat.maps_to_tools ?? [],
            created_at: now,
            updated_at: now,
        })
            .onConflictDoUpdate({
            target: knowledgeProficiencyCatalog.category_id,
            set: {
                name: cat.name ?? "",
                description: cat.description ?? "",
                adoption_base_hours: cat.adoption_base_hours ?? 0,
                maps_to_tools: cat.maps_to_tools ?? [],
                updated_at: now,
            },
        });
    }
    return { success: true, count: input.categories.length };
}
// ── get_composed_discovery_tree ─────────────────────────────
export const getComposedDiscoveryTreeSchema = z.object({
    assessment_id: z.string(),
});
export async function getComposedDiscoveryTree(input) {
    const db = getDb();
    return dbComposeDiscoveryTree(db, input.assessment_id);
}
// ── get_composed_heuristics ────────────────────────────────
export const getComposedHeuristicsSchema = z.object({
    assessment_id: z.string(),
    type: z.enum(["effort", "multipliers", "gotchas", "chains", "phases", "roles"]).optional(),
});
export async function getComposedHeuristics(input) {
    const db = getDb();
    return dbComposeHeuristics(db, input.assessment_id, input.type);
}
// ── check_url_freshness ────────────────────────────────────
export const checkUrlFreshnessSchema = z.object({
    stale_threshold_days: z.number().default(7),
    pack_id: z.string().optional(),
    migration_path_id: z.string().optional(),
    timeout_ms: z.number().default(10000),
});
export async function checkUrlFreshness(input) {
    const db = getDb();
    return dbCheckUrlFreshness(db, input);
}
//# sourceMappingURL=knowledge.js.map