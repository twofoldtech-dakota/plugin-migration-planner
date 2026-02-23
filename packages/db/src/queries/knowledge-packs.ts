import { eq, and, max, ilike, or } from "drizzle-orm";
import { type Database } from "../connection.js";
import {
  knowledgePacks,
  knowledgePackVersions,
  knowledgeDiscoveryTrees,
  knowledgeEffortHours,
  knowledgeMultipliers,
  knowledgeGotchaPatterns,
  knowledgeDependencyChains,
  knowledgePhaseMappings,
  knowledgeRoles,
  knowledgeAiAlternatives,
  knowledgeSourceUrls,
} from "../schema.js";

export interface SaveKnowledgePackInput {
  id: string;
  name: string;
  vendor?: string;
  category: string;
  subcategory?: string;
  description?: string;
  direction?: string;
  latest_version?: string;
  supported_versions?: unknown;
  eol_versions?: unknown;
  valid_topologies?: unknown;
  deployment_models?: unknown;
  compatible_targets?: unknown;
  compatible_infrastructure?: unknown;
  required_services?: unknown;
  optional_services?: unknown;
  confidence?: string;
  last_researched?: string | null;
  pack_version?: string;
  created_by?: string;
  change_summary?: string;
}

export async function saveKnowledgePack(db: Database, input: SaveKnowledgePackInput) {
  const now = new Date().toISOString();

  await db
    .insert(knowledgePacks)
    .values({
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
      updated_at: now,
    })
    .onConflictDoUpdate({
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
        updated_at: now,
      },
    });

  // Auto-create version snapshot
  const maxVersionRows = await db
    .select({ v: max(knowledgePackVersions.version) })
    .from(knowledgePackVersions)
    .where(eq(knowledgePackVersions.pack_id, input.id));

  const version = ((maxVersionRows[0]?.v as number | null) ?? 0) + 1;

  await db.insert(knowledgePackVersions).values({
    pack_id: input.id,
    version,
    created_by: input.created_by ?? "",
    change_summary: input.change_summary ?? "",
    snapshot_data: input as unknown as Record<string, unknown>,
    created_at: now,
  });

  return { success: true, id: input.id, version };
}

export async function getKnowledgePackById(db: Database, id: string) {
  const rows = await db
    .select()
    .from(knowledgePacks)
    .where(eq(knowledgePacks.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export type IncludeSection = "heuristics" | "discovery" | "ai_alternatives" | "sources";

export async function getKnowledgePackFull(
  db: Database,
  id: string,
  include?: IncludeSection[],
  version?: number
) {
  const pack = await getKnowledgePackById(db, id);
  if (!pack) return null;

  const sections = include ?? ["heuristics", "discovery", "ai_alternatives", "sources"];
  const result: Record<string, unknown> = { ...pack };

  const fetches: Promise<void>[] = [];

  if (sections.includes("heuristics")) {
    fetches.push(
      (async () => {
        const [effort, multipliers, gotchas, chains, phases, roles] = await Promise.all([
          db.select().from(knowledgeEffortHours).where(eq(knowledgeEffortHours.pack_id, id)),
          db.select().from(knowledgeMultipliers).where(eq(knowledgeMultipliers.pack_id, id)),
          db.select().from(knowledgeGotchaPatterns).where(eq(knowledgeGotchaPatterns.pack_id, id)),
          db.select().from(knowledgeDependencyChains).where(eq(knowledgeDependencyChains.pack_id, id)),
          db.select().from(knowledgePhaseMappings).where(eq(knowledgePhaseMappings.pack_id, id)),
          db.select().from(knowledgeRoles).where(eq(knowledgeRoles.pack_id, id)),
        ]);
        result.effort_hours = effort;
        result.multipliers = multipliers;
        result.gotcha_patterns = gotchas;
        result.dependency_chains = chains;
        result.phase_mappings = phases;
        result.roles = roles;
      })()
    );
  }

  if (sections.includes("discovery")) {
    fetches.push(
      (async () => {
        let rows;
        if (version) {
          rows = await db
            .select()
            .from(knowledgeDiscoveryTrees)
            .where(
              and(
                eq(knowledgeDiscoveryTrees.pack_id, id),
                eq(knowledgeDiscoveryTrees.version, version)
              )
            )
            .limit(1);
        } else {
          rows = await db
            .select()
            .from(knowledgeDiscoveryTrees)
            .where(eq(knowledgeDiscoveryTrees.pack_id, id))
            .orderBy(knowledgeDiscoveryTrees.version)
            .limit(1);
        }
        result.discovery_tree = rows[0] ?? null;
      })()
    );
  }

  if (sections.includes("ai_alternatives")) {
    fetches.push(
      (async () => {
        result.ai_alternatives = await db
          .select()
          .from(knowledgeAiAlternatives)
          .where(eq(knowledgeAiAlternatives.pack_id, id));
      })()
    );
  }

  if (sections.includes("sources")) {
    fetches.push(
      (async () => {
        result.source_urls = await db
          .select()
          .from(knowledgeSourceUrls)
          .where(eq(knowledgeSourceUrls.pack_id, id));
      })()
    );
  }

  await Promise.all(fetches);
  return result;
}

export interface ListKnowledgePacksFilters {
  category?: string;
  direction?: string;
  subcategory?: string;
  search?: string;
}

export async function listKnowledgePacks(db: Database, filters?: ListKnowledgePacksFilters) {
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
    conditions.push(
      or(
        ilike(knowledgePacks.name, `%${filters.search}%`),
        ilike(knowledgePacks.description, `%${filters.search}%`)
      )!
    );
  }

  if (conditions.length === 0) {
    return db.select().from(knowledgePacks);
  }

  return db
    .select()
    .from(knowledgePacks)
    .where(and(...conditions));
}

export async function deleteKnowledgePack(db: Database, id: string) {
  await db.delete(knowledgePacks).where(eq(knowledgePacks.id, id));
  return { success: true };
}
