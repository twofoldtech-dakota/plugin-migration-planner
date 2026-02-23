import { j as assessments, t as eq, b as desc, w as workspaceState } from './db-BWpbog7L.js';

async function getActiveAssessmentId(db, projectPath) {
  const rows = await db.select({ active_assessment_id: workspaceState.active_assessment_id }).from(workspaceState).where(eq(workspaceState.project_path, projectPath)).limit(1);
  return rows[0]?.active_assessment_id ?? null;
}
async function setActiveAssessment(db, projectPath, assessmentId) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await db.insert(workspaceState).values({
    project_path: projectPath,
    active_assessment_id: assessmentId,
    updated_at: now
  }).onConflictDoUpdate({
    target: workspaceState.project_path,
    set: {
      active_assessment_id: assessmentId,
      updated_at: now
    }
  });
}
async function clearActiveAssessment(db, projectPath) {
  await db.delete(workspaceState).where(eq(workspaceState.project_path, projectPath));
}
async function saveAssessment(db, input) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await db.insert(assessments).values({
    id: input.id,
    project_name: input.project_name,
    client_name: input.client_name ?? "",
    client_id: input.client_id ?? null,
    architect: input.architect ?? "",
    project_path: input.project_path,
    source_stack: input.source_stack ?? {},
    target_stack: input.target_stack ?? {},
    migration_scope: input.migration_scope ?? {},
    sitecore_version: input.sitecore_version ?? "",
    topology: input.topology ?? "",
    source_cloud: input.source_cloud ?? "aws",
    target_cloud: input.target_cloud ?? "azure",
    target_timeline: input.target_timeline ?? "",
    environment_count: input.environment_count ?? 1,
    environments: input.environments ?? [],
    status: input.status ?? "discovery",
    created_at: now,
    updated_at: now
  }).onConflictDoUpdate({
    target: assessments.id,
    set: {
      project_name: input.project_name,
      client_name: input.client_name ?? "",
      client_id: input.client_id ?? null,
      architect: input.architect ?? "",
      project_path: input.project_path,
      source_stack: input.source_stack ?? {},
      target_stack: input.target_stack ?? {},
      migration_scope: input.migration_scope ?? {},
      sitecore_version: input.sitecore_version ?? "",
      topology: input.topology ?? "",
      source_cloud: input.source_cloud ?? "aws",
      target_cloud: input.target_cloud ?? "azure",
      target_timeline: input.target_timeline ?? "",
      environment_count: input.environment_count ?? 1,
      environments: input.environments ?? [],
      status: input.status ?? "discovery",
      updated_at: now
    }
  });
  return { success: true, id: input.id };
}
async function getAssessmentById(db, id) {
  const rows = await db.select().from(assessments).where(eq(assessments.id, id)).limit(1);
  return rows[0] ?? null;
}
async function getAssessmentByPath(db, projectPath) {
  const activeId = await getActiveAssessmentId(db, projectPath);
  if (activeId) {
    const row = await getAssessmentById(db, activeId);
    if (row)
      return row;
  }
  const rows = await db.select().from(assessments).where(eq(assessments.project_path, projectPath)).orderBy(desc(assessments.updated_at)).limit(1);
  return rows[0] ?? null;
}
async function listAssessments(db) {
  return db.select().from(assessments).orderBy(desc(assessments.updated_at));
}
async function listAssessmentsByPath(db, projectPath) {
  const activeId = await getActiveAssessmentId(db, projectPath);
  const rows = await db.select().from(assessments).where(eq(assessments.project_path, projectPath)).orderBy(desc(assessments.updated_at));
  return rows.map((row) => ({
    ...row,
    is_active: row.id === activeId
  }));
}

export { getActiveAssessmentId as a, getAssessmentByPath as b, clearActiveAssessment as c, listAssessmentsByPath as d, setActiveAssessment as e, getAssessmentById as g, listAssessments as l, saveAssessment as s };
//# sourceMappingURL=assessments-DKcL9-FM.js.map
