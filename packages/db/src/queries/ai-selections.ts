import { eq } from "drizzle-orm";
import { type Database } from "../connection.js";
import { aiSelections, assessments } from "../schema.js";

export interface SaveAiSelectionsInput {
  assessment_id: string;
  selections: Record<string, boolean>;
  disabled_reasons?: Record<string, string>;
}

export async function saveAiSelections(db: Database, input: SaveAiSelectionsInput) {
  const now = new Date().toISOString();

  await db.transaction(async (tx) => {
    await tx.delete(aiSelections).where(eq(aiSelections.assessment_id, input.assessment_id));

    for (const [toolId, enabled] of Object.entries(input.selections)) {
      await tx.insert(aiSelections).values({
        assessment_id: input.assessment_id,
        tool_id: toolId,
        enabled,
        reason: input.disabled_reasons?.[toolId] ?? null,
      });
    }

    await tx
      .update(assessments)
      .set({ updated_at: now })
      .where(eq(assessments.id, input.assessment_id));
  });

  return { success: true, total: Object.keys(input.selections).length };
}

export async function getAiSelections(db: Database, assessmentId: string) {
  const rows = await db
    .select()
    .from(aiSelections)
    .where(eq(aiSelections.assessment_id, assessmentId));

  const selections: Record<string, boolean> = {};
  const disabled_reasons: Record<string, string> = {};

  for (const row of rows) {
    selections[row.tool_id] = row.enabled;
    if (row.reason) disabled_reasons[row.tool_id] = row.reason;
  }

  return { selections, disabled_reasons };
}
