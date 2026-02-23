import { A as scopeExclusions, t as eq, j as assessments } from './db-BWpbog7L.js';

async function saveScopeExclusions(db, input) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await db.transaction(async (tx) => {
    await tx.delete(scopeExclusions).where(eq(scopeExclusions.assessment_id, input.assessment_id));
    for (const [componentId, excluded] of Object.entries(input.exclusions)) {
      await tx.insert(scopeExclusions).values({
        assessment_id: input.assessment_id,
        component_id: componentId,
        excluded,
        reason: input.reasons?.[componentId] ?? null
      });
    }
    await tx.update(assessments).set({ updated_at: now }).where(eq(assessments.id, input.assessment_id));
  });
  return { success: true, total: Object.keys(input.exclusions).length };
}
async function getScopeExclusions(db, assessmentId) {
  const rows = await db.select().from(scopeExclusions).where(eq(scopeExclusions.assessment_id, assessmentId));
  const exclusions = {};
  const reasons = {};
  for (const row of rows) {
    exclusions[row.component_id] = row.excluded;
    if (row.reason)
      reasons[row.component_id] = row.reason;
  }
  return { exclusions, reasons };
}

export { getScopeExclusions as g, saveScopeExclusions as s };
//# sourceMappingURL=scope-exclusions-7kg0wvsO.js.map
