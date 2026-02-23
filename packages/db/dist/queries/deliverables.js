import { eq } from "drizzle-orm";
import { deliverables } from "../schema.js";
export async function getDeliverables(db, assessmentId) {
    return db
        .select()
        .from(deliverables)
        .where(eq(deliverables.assessment_id, assessmentId));
}
export async function upsertDeliverable(db, assessmentId, name, filePath) {
    const now = new Date().toISOString();
    await db
        .insert(deliverables)
        .values({ assessment_id: assessmentId, name, file_path: filePath, generated_at: now })
        .onConflictDoUpdate({
        target: [deliverables.assessment_id, deliverables.name],
        set: { file_path: filePath, generated_at: now },
    });
}
//# sourceMappingURL=deliverables.js.map