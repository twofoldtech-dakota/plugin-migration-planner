import { eq } from "drizzle-orm";
import { type Database } from "../connection.js";
import { scopeExclusions, assessments } from "../schema.js";

export interface SaveScopeExclusionsInput {
  assessment_id: string;
  exclusions: Record<string, boolean>;
  reasons?: Record<string, string>;
}

export async function saveScopeExclusions(db: Database, input: SaveScopeExclusionsInput) {
  const now = new Date().toISOString();

  await db.transaction(async (tx) => {
    await tx.delete(scopeExclusions).where(eq(scopeExclusions.assessment_id, input.assessment_id));

    for (const [componentId, excluded] of Object.entries(input.exclusions)) {
      await tx.insert(scopeExclusions).values({
        assessment_id: input.assessment_id,
        component_id: componentId,
        excluded,
        reason: input.reasons?.[componentId] ?? null,
      });
    }

    await tx
      .update(assessments)
      .set({ updated_at: now })
      .where(eq(assessments.id, input.assessment_id));
  });

  return { success: true, total: Object.keys(input.exclusions).length };
}

export async function getScopeExclusions(db: Database, assessmentId: string) {
  const rows = await db
    .select()
    .from(scopeExclusions)
    .where(eq(scopeExclusions.assessment_id, assessmentId));

  const exclusions: Record<string, boolean> = {};
  const reasons: Record<string, string> = {};

  for (const row of rows) {
    exclusions[row.component_id] = row.excluded;
    if (row.reason) reasons[row.component_id] = row.reason;
  }

  return { exclusions, reasons };
}
