import { k as knowledgePacks, t as eq, L as knowledgePackVersions, M as or, J as ilike, x as and, N as knowledgeEffortHours, O as knowledgeMultipliers, P as knowledgeGotchaPatterns, Q as knowledgeDependencyChains, R as knowledgePhaseMappings, S as knowledgeRoles, T as knowledgeDiscoveryTrees, o as knowledgeAiAlternatives, n as knowledgeSourceUrls } from './db-BWpbog7L.js';
import { m as max } from './aggregate-B2GxRiPZ.js';

async function saveKnowledgePack(db, input) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await db.insert(knowledgePacks).values({
    id: input.id,
    name: input.name,
    vendor: input.vendor ?? "",
    category: input.category,
    subcategory: input.subcategory ?? "",
    description: input.description ?? "",
    direction: input.direction ?? "both",
    latest_version: input.latest_version ?? "",
    supported_versions: input.supported_versions ?? [],
    eol_versions: input.eol_versions ?? {},
    valid_topologies: input.valid_topologies ?? [],
    deployment_models: input.deployment_models ?? [],
    compatible_targets: input.compatible_targets ?? [],
    compatible_infrastructure: input.compatible_infrastructure ?? [],
    required_services: input.required_services ?? [],
    optional_services: input.optional_services ?? [],
    confidence: input.confidence ?? "draft",
    last_researched: input.last_researched ?? null,
    pack_version: input.pack_version ?? "1",
    created_at: now,
    updated_at: now
  }).onConflictDoUpdate({
    target: knowledgePacks.id,
    set: {
      name: input.name,
      vendor: input.vendor ?? "",
      category: input.category,
      subcategory: input.subcategory ?? "",
      description: input.description ?? "",
      direction: input.direction ?? "both",
      latest_version: input.latest_version ?? "",
      supported_versions: input.supported_versions ?? [],
      eol_versions: input.eol_versions ?? {},
      valid_topologies: input.valid_topologies ?? [],
      deployment_models: input.deployment_models ?? [],
      compatible_targets: input.compatible_targets ?? [],
      compatible_infrastructure: input.compatible_infrastructure ?? [],
      required_services: input.required_services ?? [],
      optional_services: input.optional_services ?? [],
      confidence: input.confidence ?? "draft",
      last_researched: input.last_researched ?? null,
      pack_version: input.pack_version ?? "1",
      updated_at: now
    }
  });
  const maxVersionRows = await db.select({ v: max(knowledgePackVersions.version) }).from(knowledgePackVersions).where(eq(knowledgePackVersions.pack_id, input.id));
  const version = (maxVersionRows[0]?.v ?? 0) + 1;
  await db.insert(knowledgePackVersions).values({
    pack_id: input.id,
    version,
    created_by: input.created_by ?? "",
    change_summary: input.change_summary ?? "",
    snapshot_data: input,
    created_at: now
  });
  return { success: true, id: input.id, version };
}
async function getKnowledgePackById(db, id) {
  const rows = await db.select().from(knowledgePacks).where(eq(knowledgePacks.id, id)).limit(1);
  return rows[0] ?? null;
}
async function getKnowledgePackFull(db, id, include, version) {
  const pack = await getKnowledgePackById(db, id);
  if (!pack)
    return null;
  const sections = include ?? ["heuristics", "discovery", "ai_alternatives", "sources"];
  const result = { ...pack };
  const fetches = [];
  if (sections.includes("heuristics")) {
    fetches.push((async () => {
      const [effort, multipliers, gotchas, chains, phases, roles] = await Promise.all([
        db.select().from(knowledgeEffortHours).where(eq(knowledgeEffortHours.pack_id, id)),
        db.select().from(knowledgeMultipliers).where(eq(knowledgeMultipliers.pack_id, id)),
        db.select().from(knowledgeGotchaPatterns).where(eq(knowledgeGotchaPatterns.pack_id, id)),
        db.select().from(knowledgeDependencyChains).where(eq(knowledgeDependencyChains.pack_id, id)),
        db.select().from(knowledgePhaseMappings).where(eq(knowledgePhaseMappings.pack_id, id)),
        db.select().from(knowledgeRoles).where(eq(knowledgeRoles.pack_id, id))
      ]);
      result.effort_hours = effort;
      result.multipliers = multipliers;
      result.gotcha_patterns = gotchas;
      result.dependency_chains = chains;
      result.phase_mappings = phases;
      result.roles = roles;
    })());
  }
  if (sections.includes("discovery")) {
    fetches.push((async () => {
      let rows;
      if (version) {
        rows = await db.select().from(knowledgeDiscoveryTrees).where(and(eq(knowledgeDiscoveryTrees.pack_id, id), eq(knowledgeDiscoveryTrees.version, version))).limit(1);
      } else {
        rows = await db.select().from(knowledgeDiscoveryTrees).where(eq(knowledgeDiscoveryTrees.pack_id, id)).orderBy(knowledgeDiscoveryTrees.version).limit(1);
      }
      result.discovery_tree = rows[0] ?? null;
    })());
  }
  if (sections.includes("ai_alternatives")) {
    fetches.push((async () => {
      result.ai_alternatives = await db.select().from(knowledgeAiAlternatives).where(eq(knowledgeAiAlternatives.pack_id, id));
    })());
  }
  if (sections.includes("sources")) {
    fetches.push((async () => {
      result.source_urls = await db.select().from(knowledgeSourceUrls).where(eq(knowledgeSourceUrls.pack_id, id));
    })());
  }
  await Promise.all(fetches);
  return result;
}
async function listKnowledgePacks(db, filters) {
  const conditions = [];
  if (filters?.category) {
    conditions.push(eq(knowledgePacks.category, filters.category));
  }
  if (filters?.direction) {
    conditions.push(eq(knowledgePacks.direction, filters.direction));
  }
  if (filters?.subcategory) {
    conditions.push(eq(knowledgePacks.subcategory, filters.subcategory));
  }
  if (filters?.search) {
    conditions.push(or(ilike(knowledgePacks.name, `%${filters.search}%`), ilike(knowledgePacks.description, `%${filters.search}%`)));
  }
  if (conditions.length === 0) {
    return db.select().from(knowledgePacks);
  }
  return db.select().from(knowledgePacks).where(and(...conditions));
}
async function deleteKnowledgePack(db, id) {
  await db.delete(knowledgePacks).where(eq(knowledgePacks.id, id));
  return { success: true };
}

export { getKnowledgePackById as a, deleteKnowledgePack as d, getKnowledgePackFull as g, listKnowledgePacks as l, saveKnowledgePack as s };
//# sourceMappingURL=knowledge-packs-PreH8nWI.js.map
