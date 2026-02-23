import { eq } from "drizzle-orm";
import { type Database } from "../connection.js";
import { deliverables } from "../schema.js";

export async function getDeliverables(db: Database, assessmentId: string) {
  return db
    .select()
    .from(deliverables)
    .where(eq(deliverables.assessment_id, assessmentId));
}

export async function upsertDeliverable(
  db: Database,
  assessmentId: string,
  name: string,
  filePath: string
) {
  const now = new Date().toISOString();
  await db
    .insert(deliverables)
    .values({ assessment_id: assessmentId, name, file_path: filePath, generated_at: now })
    .onConflictDoUpdate({
      target: [deliverables.assessment_id, deliverables.name],
      set: { file_path: filePath, generated_at: now },
    });
}
