import { eq, max } from "drizzle-orm";
import { assessmentKnowledgePins, knowledgePacks, knowledgePackVersions, } from "../schema.js";
export async function pinKnowledgeVersion(db, input) {
    const now = new Date().toISOString();
    const pins = [];
    for (const packId of input.pack_ids) {
        // Resolve latest version for this pack
        const maxVersionRows = await db
            .select({ v: max(knowledgePackVersions.version) })
            .from(knowledgePackVersions)
            .where(eq(knowledgePackVersions.pack_id, packId));
        const latestVersion = maxVersionRows[0]?.v ?? 1;
        await db
            .insert(assessmentKnowledgePins)
            .values({
            assessment_id: input.assessment_id,
            pack_id: packId,
            pinned_version: latestVersion,
            pinned_at: now,
        })
            .onConflictDoUpdate({
            target: [assessmentKnowledgePins.assessment_id, assessmentKnowledgePins.pack_id],
            set: {
                pinned_version: latestVersion,
                pinned_at: now,
            },
        });
        pins.push({ pack_id: packId, pinned_version: latestVersion });
    }
    return { success: true, pins };
}
export async function getPinnedKnowledge(db, assessmentId) {
    const rows = await db
        .select({
        assessment_id: assessmentKnowledgePins.assessment_id,
        pack_id: assessmentKnowledgePins.pack_id,
        pinned_version: assessmentKnowledgePins.pinned_version,
        pinned_at: assessmentKnowledgePins.pinned_at,
        pack_name: knowledgePacks.name,
        pack_category: knowledgePacks.category,
    })
        .from(assessmentKnowledgePins)
        .innerJoin(knowledgePacks, eq(assessmentKnowledgePins.pack_id, knowledgePacks.id))
        .where(eq(assessmentKnowledgePins.assessment_id, assessmentId));
    return rows;
}
//# sourceMappingURL=knowledge-pins.js.map