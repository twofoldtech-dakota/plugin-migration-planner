import { eq, and } from "drizzle-orm";
import { type Database } from "../connection.js";
import { migrationPaths } from "../schema.js";

export interface SaveMigrationPathInput {
  id: string;
  source_pack_id: string;
  target_pack_id: string;
  prevalence?: string;
  complexity?: string;
  typical_duration?: string;
  primary_drivers?: unknown;
  prerequisites?: unknown;
  service_map?: unknown;
  migration_tools?: unknown;
  path_gotcha_patterns?: unknown;
  path_effort_adjustments?: unknown;
  step_by_step?: string;
  decision_points?: string;
  case_studies?: string;
  incompatibilities?: string;
  confidence?: string;
  last_researched?: string | null;
  version?: string;
}

export async function saveMigrationPath(db: Database, input: SaveMigrationPathInput) {
  const now = new Date().toISOString();

  await db
    .insert(migrationPaths)
    .values({
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
      updated_at: now,
    })
    .onConflictDoUpdate({
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
        updated_at: now,
      },
    });

  return { success: true, id: input.id };
}

export interface GetMigrationPathInput {
  id?: string;
  source_pack_id?: string;
  target_pack_id?: string;
}

export async function getMigrationPath(db: Database, input: GetMigrationPathInput) {
  if (input.id) {
    const rows = await db
      .select()
      .from(migrationPaths)
      .where(eq(migrationPaths.id, input.id))
      .limit(1);
    return rows[0] ?? null;
  }

  if (input.source_pack_id && input.target_pack_id) {
    const rows = await db
      .select()
      .from(migrationPaths)
      .where(
        and(
          eq(migrationPaths.source_pack_id, input.source_pack_id),
          eq(migrationPaths.target_pack_id, input.target_pack_id)
        )
      )
      .limit(1);
    return rows[0] ?? null;
  }

  return null;
}

export interface ListMigrationPathsFilters {
  source_pack_id?: string;
  target_pack_id?: string;
  complexity?: string;
  prevalence?: string;
}

export async function listMigrationPaths(db: Database, filters?: ListMigrationPathsFilters) {
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

  return db
    .select()
    .from(migrationPaths)
    .where(and(...conditions));
}
