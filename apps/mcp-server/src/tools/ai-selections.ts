import { z } from "zod";
import { getDb, saveAiSelections as dbSaveAiSelections } from "@migration-planner/db";

export const saveAiSelectionsSchema = z.object({
  assessment_id: z.string(),
  selections: z.record(z.string(), z.boolean()),
  disabled_reasons: z.record(z.string(), z.string()).default({}),
});

export async function saveAiSelections(input: z.infer<typeof saveAiSelectionsSchema>) {
  const db = getDb();
  return dbSaveAiSelections(db, input);
}
