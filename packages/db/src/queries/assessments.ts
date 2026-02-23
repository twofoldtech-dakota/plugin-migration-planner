import { eq, desc } from "drizzle-orm";
import { type Database } from "../connection.js";
import { assessments, workspaceState } from "../schema.js";
import { getActiveAssessmentId } from "./workspace-state.js";

export interface SaveAssessmentInput {
  id: string;
  project_name: string;
  client_name?: string;
  client_id?: string | null;
  architect?: string;
  project_path: string;
  // New generic stack model
  source_stack?: unknown;
  target_stack?: unknown;
  migration_scope?: unknown;
  // Legacy fields (deprecated — kept for backward compatibility)
  sitecore_version?: string;
  topology?: string;
  source_cloud?: string;
  target_cloud?: string;
  target_timeline?: string;
  environment_count?: number;
  environments?: string[];
  status?: string;
}

export async function saveAssessment(db: Database, input: SaveAssessmentInput) {
  const now = new Date().toISOString();
  await db
    .insert(assessments)
    .values({
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
      updated_at: now,
    })
    .onConflictDoUpdate({
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
        updated_at: now,
      },
    });
  return { success: true, id: input.id };
}

export async function getAssessmentById(db: Database, id: string) {
  const rows = await db.select().from(assessments).where(eq(assessments.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getAssessmentByPath(db: Database, projectPath: string) {
  // Check workspace_state for an active assessment first
  const activeId = await getActiveAssessmentId(db, projectPath);
  if (activeId) {
    const row = await getAssessmentById(db, activeId);
    if (row) return row;
  }

  // Fall back to legacy behavior: most recently updated assessment for this path
  const rows = await db
    .select()
    .from(assessments)
    .where(eq(assessments.project_path, projectPath))
    .orderBy(desc(assessments.updated_at))
    .limit(1);
  return rows[0] ?? null;
}

export async function listAssessments(db: Database) {
  return db.select().from(assessments).orderBy(desc(assessments.updated_at));
}

export async function listAssessmentsByPath(db: Database, projectPath: string) {
  const activeId = await getActiveAssessmentId(db, projectPath);
  const rows = await db
    .select()
    .from(assessments)
    .where(eq(assessments.project_path, projectPath))
    .orderBy(desc(assessments.updated_at));
  return rows.map((row) => ({
    ...row,
    is_active: row.id === activeId,
  }));
}
