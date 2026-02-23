import { t as eq, U as migrationPaths, x as and } from './db-BWpbog7L.js';

async function saveMigrationPath(db, input) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await db.insert(migrationPaths).values({
    id: input.id,
    source_pack_id: input.source_pack_id,
    target_pack_id: input.target_pack_id,
    prevalence: input.prevalence ?? "",
    complexity: input.complexity ?? "",
    typical_duration: input.typical_duration ?? "",
    primary_drivers: input.primary_drivers ?? [],
    prerequisites: input.prerequisites ?? [],
    service_map: input.service_map ?? {},
    migration_tools: input.migration_tools ?? [],
    path_gotcha_patterns: input.path_gotcha_patterns ?? [],
    path_effort_adjustments: input.path_effort_adjustments ?? [],
    step_by_step: input.step_by_step ?? "",
    decision_points: input.decision_points ?? "",
    case_studies: input.case_studies ?? "",
    incompatibilities: input.incompatibilities ?? "",
    confidence: input.confidence ?? "draft",
    last_researched: input.last_researched ?? null,
    version: input.version ?? "1",
    created_at: now,
    updated_at: now
  }).onConflictDoUpdate({
    target: migrationPaths.id,
    set: {
      source_pack_id: input.source_pack_id,
      target_pack_id: input.target_pack_id,
      prevalence: input.prevalence ?? "",
      complexity: input.complexity ?? "",
      typical_duration: input.typical_duration ?? "",
      primary_drivers: input.primary_drivers ?? [],
      prerequisites: input.prerequisites ?? [],
      service_map: input.service_map ?? {},
      migration_tools: input.migration_tools ?? [],
      path_gotcha_patterns: input.path_gotcha_patterns ?? [],
      path_effort_adjustments: input.path_effort_adjustments ?? [],
      step_by_step: input.step_by_step ?? "",
      decision_points: input.decision_points ?? "",
      case_studies: input.case_studies ?? "",
      incompatibilities: input.incompatibilities ?? "",
      confidence: input.confidence ?? "draft",
      last_researched: input.last_researched ?? null,
      version: input.version ?? "1",
      updated_at: now
    }
  });
  return { success: true, id: input.id };
}
async function getMigrationPath(db, input) {
  if (input.id) {
    const rows = await db.select().from(migrationPaths).where(eq(migrationPaths.id, input.id)).limit(1);
    return rows[0] ?? null;
  }
  if (input.source_pack_id && input.target_pack_id) {
    const rows = await db.select().from(migrationPaths).where(and(eq(migrationPaths.source_pack_id, input.source_pack_id), eq(migrationPaths.target_pack_id, input.target_pack_id))).limit(1);
    return rows[0] ?? null;
  }
  return null;
}
async function listMigrationPaths(db, filters) {
  const conditions = [];
  if (filters?.source_pack_id) {
    conditions.push(eq(migrationPaths.source_pack_id, filters.source_pack_id));
  }
  if (filters?.target_pack_id) {
    conditions.push(eq(migrationPaths.target_pack_id, filters.target_pack_id));
  }
  if (filters?.complexity) {
    conditions.push(eq(migrationPaths.complexity, filters.complexity));
  }
  if (filters?.prevalence) {
    conditions.push(eq(migrationPaths.prevalence, filters.prevalence));
  }
  if (conditions.length === 0) {
    return db.select().from(migrationPaths);
  }
  return db.select().from(migrationPaths).where(and(...conditions));
}

export { getMigrationPath as g, listMigrationPaths as l, saveMigrationPath as s };
//# sourceMappingURL=migration-paths-Cv3IGt0S.js.map
