import { V as aiSelections, t as eq, j as assessments } from './db-BWpbog7L.js';

async function saveAiSelections(db, input) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await db.transaction(async (tx) => {
    await tx.delete(aiSelections).where(eq(aiSelections.assessment_id, input.assessment_id));
    for (const [toolId, enabled] of Object.entries(input.selections)) {
      await tx.insert(aiSelections).values({
        assessment_id: input.assessment_id,
        tool_id: toolId,
        enabled,
        reason: input.disabled_reasons?.[toolId] ?? null
      });
    }
    await tx.update(assessments).set({ updated_at: now }).where(eq(assessments.id, input.assessment_id));
  });
  return { success: true, total: Object.keys(input.selections).length };
}
async function getAiSelections(db, assessmentId) {
  const rows = await db.select().from(aiSelections).where(eq(aiSelections.assessment_id, assessmentId));
  const selections = {};
  const disabled_reasons = {};
  for (const row of rows) {
    selections[row.tool_id] = row.enabled;
    if (row.reason)
      disabled_reasons[row.tool_id] = row.reason;
  }
  return { selections, disabled_reasons };
}

export { getAiSelections as g, saveAiSelections as s };
//# sourceMappingURL=ai-selections-81CCgTAS.js.map
