import { e as estimateSnapshots, t as eq, b as desc, x as and, s as sql, l as estimateComponents, j as assessments } from './db-BWpbog7L.js';
import { m as max } from './aggregate-B2GxRiPZ.js';

async function listEstimateVersions(db, assessmentId) {
  const rows = await db.select({
    version: estimateSnapshots.version,
    confidence_score: estimateSnapshots.confidence_score,
    total_expected_hours: estimateSnapshots.total_expected_hours,
    total_base_hours: estimateSnapshots.total_base_hours,
    total_gotcha_hours: estimateSnapshots.total_gotcha_hours,
    assumption_widening_hours: estimateSnapshots.assumption_widening_hours,
    created_at: estimateSnapshots.created_at
  }).from(estimateSnapshots).where(eq(estimateSnapshots.assessment_id, assessmentId)).orderBy(desc(estimateSnapshots.version));
  return rows;
}
async function saveEstimate(db, input) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const maxVersionRows = await db.select({ v: max(estimateSnapshots.version) }).from(estimateSnapshots).where(eq(estimateSnapshots.assessment_id, input.assessment_id));
  const version = (maxVersionRows[0]?.v ?? 0) + 1;
  let snapshotId = 0;
  await db.transaction(async (tx) => {
    const inserted = await tx.insert(estimateSnapshots).values({
      assessment_id: input.assessment_id,
      version,
      confidence_score: input.confidence_score ?? 0,
      total_base_hours: input.total_base_hours ?? 0,
      total_gotcha_hours: input.total_gotcha_hours ?? 0,
      total_expected_hours: input.total_expected_hours ?? 0,
      assumption_widening_hours: input.assumption_widening_hours ?? 0,
      totals: input.totals ?? {},
      total_by_role: input.total_by_role ?? {},
      client_summary: input.client_summary ?? {},
      phases_json: input.phases ?? [],
      created_at: now
    }).returning({ id: estimateSnapshots.id });
    snapshotId = inserted[0].id;
    for (const phase of input.phases ?? []) {
      for (const comp of phase.components ?? []) {
        await tx.insert(estimateComponents).values({
          snapshot_id: snapshotId,
          phase_id: phase.id,
          phase_name: phase.name,
          component_id: comp.id,
          component_name: comp.name,
          units: comp.units ?? 1,
          base_hours: comp.base_hours ?? 0,
          multipliers_applied: comp.multipliers_applied ?? [],
          gotcha_hours: comp.gotcha_hours ?? 0,
          final_hours: comp.final_hours ?? 0,
          firm_hours: comp.firm_hours ?? 0,
          assumption_dependent_hours: comp.assumption_dependent_hours ?? 0,
          assumptions_affecting: comp.assumptions_affecting ?? [],
          hours: comp.hours ?? {},
          ai_alternatives: comp.ai_alternatives ?? [],
          by_role: comp.by_role ?? {}
        });
      }
    }
    await tx.update(assessments).set({ updated_at: now }).where(eq(assessments.id, input.assessment_id));
  });
  return { success: true, version };
}
async function getEstimate(db, assessmentId, version) {
  let snapshot;
  if (version) {
    const rows = await db.select().from(estimateSnapshots).where(and(eq(estimateSnapshots.assessment_id, assessmentId), eq(estimateSnapshots.version, version))).limit(1);
    snapshot = rows[0];
  } else {
    const rows = await db.select().from(estimateSnapshots).where(eq(estimateSnapshots.assessment_id, assessmentId)).orderBy(sql`${estimateSnapshots.version} DESC`).limit(1);
    snapshot = rows[0];
  }
  if (!snapshot)
    return null;
  const components = await db.select().from(estimateComponents).where(eq(estimateComponents.snapshot_id, snapshot.id));
  const phaseMap = {};
  for (const c of components) {
    if (!phaseMap[c.phase_id]) {
      phaseMap[c.phase_id] = { id: c.phase_id, name: c.phase_name, components: [] };
    }
    phaseMap[c.phase_id].components.push({
      id: c.component_id,
      name: c.component_name,
      units: c.units,
      base_hours: c.base_hours,
      multipliers_applied: c.multipliers_applied,
      gotcha_hours: c.gotcha_hours,
      final_hours: c.final_hours,
      firm_hours: c.firm_hours,
      assumption_dependent_hours: c.assumption_dependent_hours,
      assumptions_affecting: c.assumptions_affecting,
      hours: c.hours,
      ai_alternatives: c.ai_alternatives,
      by_role: c.by_role
    });
  }
  let phases;
  const storedPhases = snapshot.phases_json;
  if (storedPhases && Array.isArray(storedPhases) && storedPhases.length > 0) {
    phases = storedPhases.map((sp) => ({
      id: sp.id,
      name: sp.name,
      duration: sp.duration,
      components: phaseMap[sp.id]?.components ?? []
    }));
  } else {
    phases = Object.values(phaseMap);
  }
  return {
    id: snapshot.id,
    assessment_id: snapshot.assessment_id,
    version: snapshot.version,
    confidence_score: snapshot.confidence_score,
    total_base_hours: snapshot.total_base_hours,
    total_gotcha_hours: snapshot.total_gotcha_hours,
    total_expected_hours: snapshot.total_expected_hours,
    assumption_widening_hours: snapshot.assumption_widening_hours,
    totals: snapshot.totals,
    total_by_role: snapshot.total_by_role,
    client_summary: snapshot.client_summary,
    phases,
    created_at: snapshot.created_at
  };
}

export { getEstimate as g, listEstimateVersions as l, saveEstimate as s };
//# sourceMappingURL=estimates-zTf3XwgF.js.map
