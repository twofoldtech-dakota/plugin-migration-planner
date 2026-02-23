import { W as deliverables, t as eq } from './db-BWpbog7L.js';

async function getDeliverables(db, assessmentId) {
  return db.select().from(deliverables).where(eq(deliverables.assessment_id, assessmentId));
}
async function upsertDeliverable(db, assessmentId, name, filePath) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await db.insert(deliverables).values({ assessment_id: assessmentId, name, file_path: filePath, generated_at: now }).onConflictDoUpdate({
    target: [deliverables.assessment_id, deliverables.name],
    set: { file_path: filePath, generated_at: now }
  });
}

export { getDeliverables as g, upsertDeliverable as u };
//# sourceMappingURL=deliverables-Bw2E3Qk7.js.map
