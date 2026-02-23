import { eq, and, max, sql, desc } from "drizzle-orm";
import { teamSnapshots, teamRoles, assessments } from "../schema.js";
// ── List versions ────────────────────────────────────────────
export async function listTeamVersions(db, assessmentId) {
    const rows = await db
        .select({
        version: teamSnapshots.version,
        estimate_version: teamSnapshots.estimate_version,
        created_at: teamSnapshots.created_at,
    })
        .from(teamSnapshots)
        .where(eq(teamSnapshots.assessment_id, assessmentId))
        .orderBy(desc(teamSnapshots.version));
    return rows;
}
// ── Save snapshot ────────────────────────────────────────────
export async function saveTeamSnapshot(db, input) {
    const now = new Date().toISOString();
    const maxVersionRows = await db
        .select({ v: max(teamSnapshots.version) })
        .from(teamSnapshots)
        .where(eq(teamSnapshots.assessment_id, input.assessment_id));
    const version = (maxVersionRows[0]?.v ?? 0) + 1;
    let snapshotId = 0;
    await db.transaction(async (tx) => {
        const inserted = await tx
            .insert(teamSnapshots)
            .values({
            assessment_id: input.assessment_id,
            version,
            estimate_version: input.estimate_version ?? 1,
            assumptions: input.assumptions ?? {},
            cost_projection: input.cost_projection ?? {},
            phase_staffing: input.phase_staffing ?? [],
            hiring_notes: input.hiring_notes ?? [],
            notes: input.notes ?? "",
            created_at: now,
            updated_at: now,
        })
            .returning({ id: teamSnapshots.id });
        snapshotId = inserted[0].id;
        for (let i = 0; i < input.roles.length; i++) {
            const role = input.roles[i];
            await tx.insert(teamRoles).values({
                snapshot_id: snapshotId,
                role_id: role.role_id,
                role_name: role.role_name ?? "",
                total_hours: role.total_hours ?? 0,
                base_hours: role.base_hours ?? 0,
                headcount: role.headcount ?? 1,
                allocation: role.allocation ?? "full-time",
                seniority: role.seniority ?? "mid",
                rate_min: role.rate_min ?? 0,
                rate_max: role.rate_max ?? 0,
                rate_override: role.rate_override ?? null,
                phases: role.phases ?? [],
                notes: role.notes ?? "",
                source: role.source ?? "generated",
                sort_order: role.sort_order ?? i,
            });
        }
        await tx
            .update(assessments)
            .set({ updated_at: now })
            .where(eq(assessments.id, input.assessment_id));
    });
    return { success: true, version, snapshot_id: snapshotId };
}
// ── Get snapshot ─────────────────────────────────────────────
export async function getTeamSnapshot(db, assessmentId, version) {
    let snapshot;
    if (version) {
        const rows = await db
            .select()
            .from(teamSnapshots)
            .where(and(eq(teamSnapshots.assessment_id, assessmentId), eq(teamSnapshots.version, version)))
            .limit(1);
        snapshot = rows[0];
    }
    else {
        const rows = await db
            .select()
            .from(teamSnapshots)
            .where(eq(teamSnapshots.assessment_id, assessmentId))
            .orderBy(sql `${teamSnapshots.version} DESC`)
            .limit(1);
        snapshot = rows[0];
    }
    if (!snapshot)
        return null;
    const roles = await db
        .select()
        .from(teamRoles)
        .where(eq(teamRoles.snapshot_id, snapshot.id))
        .orderBy(teamRoles.sort_order);
    return {
        id: snapshot.id,
        assessment_id: snapshot.assessment_id,
        version: snapshot.version,
        estimate_version: snapshot.estimate_version,
        assumptions: snapshot.assumptions,
        cost_projection: snapshot.cost_projection,
        phase_staffing: snapshot.phase_staffing,
        hiring_notes: snapshot.hiring_notes,
        notes: snapshot.notes,
        roles,
        created_at: snapshot.created_at,
        updated_at: snapshot.updated_at,
    };
}
// ── Update team role ─────────────────────────────────────────
export async function updateTeamRole(db, roleId, updates) {
    const now = new Date().toISOString();
    await db
        .update(teamRoles)
        .set(updates)
        .where(eq(teamRoles.id, roleId));
    const [role] = await db
        .select({ snapshot_id: teamRoles.snapshot_id })
        .from(teamRoles)
        .where(eq(teamRoles.id, roleId))
        .limit(1);
    if (role) {
        await db
            .update(teamSnapshots)
            .set({ updated_at: now })
            .where(eq(teamSnapshots.id, role.snapshot_id));
    }
    return { success: true };
}
// ── Create team role ─────────────────────────────────────────
export async function createTeamRole(db, snapshotId, role) {
    const now = new Date().toISOString();
    const [maxRow] = await db
        .select({ v: max(teamRoles.sort_order) })
        .from(teamRoles)
        .where(eq(teamRoles.snapshot_id, snapshotId));
    const sortOrder = (maxRow?.v ?? 0) + 1;
    const [inserted] = await db
        .insert(teamRoles)
        .values({
        snapshot_id: snapshotId,
        role_id: role.role_id,
        role_name: role.role_name ?? "",
        total_hours: role.total_hours ?? 0,
        base_hours: role.base_hours ?? 0,
        headcount: role.headcount ?? 1,
        allocation: role.allocation ?? "full-time",
        seniority: role.seniority ?? "mid",
        rate_min: role.rate_min ?? 0,
        rate_max: role.rate_max ?? 0,
        rate_override: role.rate_override ?? null,
        phases: role.phases ?? [],
        notes: role.notes ?? "",
        source: role.source ?? "custom",
        sort_order: sortOrder,
    })
        .returning({ id: teamRoles.id });
    await db
        .update(teamSnapshots)
        .set({ updated_at: now })
        .where(eq(teamSnapshots.id, snapshotId));
    return { success: true, id: inserted.id };
}
// ── Delete team role ─────────────────────────────────────────
export async function deleteTeamRole(db, roleId) {
    const now = new Date().toISOString();
    const [role] = await db
        .select({ snapshot_id: teamRoles.snapshot_id })
        .from(teamRoles)
        .where(eq(teamRoles.id, roleId))
        .limit(1);
    if (!role)
        return { success: false, error: "Role not found" };
    await db.delete(teamRoles).where(eq(teamRoles.id, roleId));
    await db
        .update(teamSnapshots)
        .set({ updated_at: now })
        .where(eq(teamSnapshots.id, role.snapshot_id));
    return { success: true };
}
//# sourceMappingURL=team.js.map