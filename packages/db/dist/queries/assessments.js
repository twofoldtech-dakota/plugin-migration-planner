import { eq, desc } from "drizzle-orm";
import { assessments } from "../schema.js";
import { getActiveAssessmentId } from "./workspace-state.js";
export async function saveAssessment(db, input) {
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
export async function getAssessmentById(db, id) {
    const rows = await db.select().from(assessments).where(eq(assessments.id, id)).limit(1);
    return rows[0] ?? null;
}
export async function getAssessmentByPath(db, projectPath) {
    // Check workspace_state for an active assessment first
    const activeId = await getActiveAssessmentId(db, projectPath);
    if (activeId) {
        const row = await getAssessmentById(db, activeId);
        if (row)
            return row;
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
export async function listAssessments(db) {
    return db.select().from(assessments).orderBy(desc(assessments.updated_at));
}
export async function listAssessmentsByPath(db, projectPath) {
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
//# sourceMappingURL=assessments.js.map