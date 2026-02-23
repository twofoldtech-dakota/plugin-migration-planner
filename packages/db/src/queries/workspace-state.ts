import { eq } from "drizzle-orm";
import { type Database } from "../connection.js";
import { workspaceState } from "../schema.js";

export async function getActiveAssessmentId(
  db: Database,
  projectPath: string
): Promise<string | null> {
  const rows = await db
    .select({ active_assessment_id: workspaceState.active_assessment_id })
    .from(workspaceState)
    .where(eq(workspaceState.project_path, projectPath))
    .limit(1);
  return rows[0]?.active_assessment_id ?? null;
}

export async function setActiveAssessment(
  db: Database,
  projectPath: string,
  assessmentId: string
): Promise<void> {
  const now = new Date().toISOString();
  await db
    .insert(workspaceState)
    .values({
      project_path: projectPath,
      active_assessment_id: assessmentId,
      updated_at: now,
    })
    .onConflictDoUpdate({
      target: workspaceState.project_path,
      set: {
        active_assessment_id: assessmentId,
        updated_at: now,
      },
    });
}

export async function clearActiveAssessment(
  db: Database,
  projectPath: string
): Promise<void> {
  await db
    .delete(workspaceState)
    .where(eq(workspaceState.project_path, projectPath));
}
