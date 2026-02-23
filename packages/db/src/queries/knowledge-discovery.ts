import { eq, and, max, inArray, desc } from "drizzle-orm";
import { type Database } from "../connection.js";
import { knowledgeDiscoveryTrees } from "../schema.js";

export interface SaveDiscoveryTreeInput {
  pack_id: string;
  dimensions?: unknown;
}

export async function saveDiscoveryTree(db: Database, input: SaveDiscoveryTreeInput) {
  const now = new Date().toISOString();

  // Determine next version
  const maxVersionRows = await db
    .select({ v: max(knowledgeDiscoveryTrees.version) })
    .from(knowledgeDiscoveryTrees)
    .where(eq(knowledgeDiscoveryTrees.pack_id, input.pack_id));

  const version = ((maxVersionRows[0]?.v as number | null) ?? 0) + 1;

  await db.insert(knowledgeDiscoveryTrees).values({
    pack_id: input.pack_id,
    version,
    dimensions_json: input.dimensions ?? [],
    created_at: now,
  });

  return { success: true, pack_id: input.pack_id, version };
}

export async function getDiscoveryTree(
  db: Database,
  packIds: string[],
  version?: number
) {
  const results: Array<{ pack_id: string; version: number; dimensions: unknown }> = [];

  for (const packId of packIds) {
    let rows;
    if (version) {
      rows = await db
        .select()
        .from(knowledgeDiscoveryTrees)
        .where(
          and(
            eq(knowledgeDiscoveryTrees.pack_id, packId),
            eq(knowledgeDiscoveryTrees.version, version)
          )
        )
        .limit(1);
    } else {
      // Latest version
      rows = await db
        .select()
        .from(knowledgeDiscoveryTrees)
        .where(eq(knowledgeDiscoveryTrees.pack_id, packId))
        .orderBy(desc(knowledgeDiscoveryTrees.version))
        .limit(1);
    }

    if (rows[0]) {
      results.push({
        pack_id: rows[0].pack_id,
        version: rows[0].version,
        dimensions: rows[0].dimensions_json,
      });
    }
  }

  // Compose all dimensions into a single array
  const allDimensions: unknown[] = [];
  for (const r of results) {
    const dims = r.dimensions;
    if (Array.isArray(dims)) {
      allDimensions.push(...dims);
    }
  }

  return {
    packs: results,
    dimensions: allDimensions,
  };
}
