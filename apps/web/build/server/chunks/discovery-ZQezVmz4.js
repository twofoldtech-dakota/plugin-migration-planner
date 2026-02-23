import { u as discoveryDimensions, v as discoveryAnswers, j as assessments, t as eq, x as and } from './db-BWpbog7L.js';

async function saveDiscovery(db, input) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const status = input.status ?? "complete";
  await db.transaction(async (tx) => {
    await tx.insert(discoveryDimensions).values({
      assessment_id: input.assessment_id,
      dimension: input.dimension,
      status,
      completed_at: input.completed_at ?? (status === "complete" ? now : null),
      last_updated: now
    }).onConflictDoUpdate({
      target: [discoveryDimensions.assessment_id, discoveryDimensions.dimension],
      set: {
        status,
        completed_at: input.completed_at ?? (status === "complete" ? now : null),
        last_updated: now
      }
    });
    for (const [qid, ans] of Object.entries(input.answers ?? {})) {
      await tx.insert(discoveryAnswers).values({
        assessment_id: input.assessment_id,
        dimension: input.dimension,
        question_id: qid,
        value: ans.value,
        notes: ans.notes ?? "",
        confidence: ans.confidence ?? "unknown",
        basis: ans.basis ?? null
      }).onConflictDoUpdate({
        target: [
          discoveryAnswers.assessment_id,
          discoveryAnswers.dimension,
          discoveryAnswers.question_id
        ],
        set: {
          value: ans.value,
          notes: ans.notes ?? "",
          confidence: ans.confidence ?? "unknown",
          basis: ans.basis ?? null
        }
      });
    }
    await tx.update(assessments).set({ updated_at: now }).where(eq(assessments.id, input.assessment_id));
  });
  return { success: true, dimension: input.dimension };
}
async function getDiscovery(db, assessmentId, dimension) {
  if (dimension) {
    const dims2 = await db.select().from(discoveryDimensions).where(and(eq(discoveryDimensions.assessment_id, assessmentId), eq(discoveryDimensions.dimension, dimension))).limit(1);
    if (dims2.length === 0)
      return null;
    const dim = dims2[0];
    const rows = await db.select().from(discoveryAnswers).where(and(eq(discoveryAnswers.assessment_id, assessmentId), eq(discoveryAnswers.dimension, dimension)));
    const answers = {};
    for (const row of rows) {
      answers[row.question_id] = {
        value: row.value,
        notes: row.notes,
        confidence: row.confidence,
        basis: row.basis
      };
    }
    return {
      dimension: dim.dimension,
      status: dim.status,
      completed_at: dim.completed_at,
      last_updated: dim.last_updated,
      answers
    };
  }
  const dims = await db.select().from(discoveryDimensions).where(eq(discoveryDimensions.assessment_id, assessmentId));
  const allAnswers = await db.select().from(discoveryAnswers).where(eq(discoveryAnswers.assessment_id, assessmentId));
  const answersByDim = {};
  for (const row of allAnswers) {
    if (!answersByDim[row.dimension])
      answersByDim[row.dimension] = {};
    answersByDim[row.dimension][row.question_id] = {
      value: row.value,
      notes: row.notes,
      confidence: row.confidence,
      basis: row.basis
    };
  }
  const result = {};
  for (const dim of dims) {
    result[dim.dimension] = {
      dimension: dim.dimension,
      status: dim.status,
      completed_at: dim.completed_at,
      last_updated: dim.last_updated,
      answers: answersByDim[dim.dimension] ?? {}
    };
  }
  return result;
}

export { getDiscovery as g, saveDiscovery as s };
//# sourceMappingURL=discovery-ZQezVmz4.js.map
