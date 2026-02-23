import { T as knowledgeDiscoveryTrees, x as and, t as eq, b as desc } from './db-BWpbog7L.js';
import { m as max } from './aggregate-B2GxRiPZ.js';

async function saveDiscoveryTree(db, input) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const maxVersionRows = await db.select({ v: max(knowledgeDiscoveryTrees.version) }).from(knowledgeDiscoveryTrees).where(eq(knowledgeDiscoveryTrees.pack_id, input.pack_id));
  const version = (maxVersionRows[0]?.v ?? 0) + 1;
  await db.insert(knowledgeDiscoveryTrees).values({
    pack_id: input.pack_id,
    version,
    dimensions_json: input.dimensions ?? [],
    created_at: now
  });
  return { success: true, pack_id: input.pack_id, version };
}
async function getDiscoveryTree(db, packIds, version) {
  const results = [];
  for (const packId of packIds) {
    let rows;
    if (version) {
      rows = await db.select().from(knowledgeDiscoveryTrees).where(and(eq(knowledgeDiscoveryTrees.pack_id, packId), eq(knowledgeDiscoveryTrees.version, version))).limit(1);
    } else {
      rows = await db.select().from(knowledgeDiscoveryTrees).where(eq(knowledgeDiscoveryTrees.pack_id, packId)).orderBy(desc(knowledgeDiscoveryTrees.version)).limit(1);
    }
    if (rows[0]) {
      results.push({
        pack_id: rows[0].pack_id,
        version: rows[0].version,
        dimensions: rows[0].dimensions_json
      });
    }
  }
  const allDimensions = [];
  for (const r of results) {
    const dims = r.dimensions;
    if (Array.isArray(dims)) {
      allDimensions.push(...dims);
    }
  }
  return {
    packs: results,
    dimensions: allDimensions
  };
}

export { getDiscoveryTree as g, saveDiscoveryTree as s };
//# sourceMappingURL=knowledge-discovery-C61edzvf.js.map
