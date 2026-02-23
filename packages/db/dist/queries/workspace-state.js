import { eq } from "drizzle-orm";
import { workspaceState } from "../schema.js";
export async function getActiveAssessmentId(db, projectPath) {
    const rows = await db
        .select({ active_assessment_id: workspaceState.active_assessment_id })
        .from(workspaceState)
        .where(eq(workspaceState.project_path, projectPath))
        .limit(1);
    return rows[0]?.active_assessment_id ?? null;
}
export async function setActiveAssessment(db, projectPath, assessmentId) {
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
export async function clearActiveAssessment(db, projectPath) {
    await db
        .delete(workspaceState)
        .where(eq(workspaceState.project_path, projectPath));
}
//# sourceMappingURL=workspace-state.js.map