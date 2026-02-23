import { eq } from "drizzle-orm";
import { calibrations, calibrationPhases, calibrationComponents, calibrationAiTools, assessments, } from "../schema.js";
export async function saveCalibration(db, input) {
    const now = new Date().toISOString();
    let calId = 0;
    await db.transaction(async (tx) => {
        const inserted = await tx
            .insert(calibrations)
            .values({
            assessment_id: input.assessment_id,
            engagement_name: input.engagement_name,
            estimate_date: input.estimate_date ?? "",
            calibration_date: now,
            status: input.status ?? "in_progress",
            total_estimated: input.total_estimated ?? {},
            total_actual: input.total_actual ?? null,
            surprises: input.surprises ?? [],
            smoother: input.smoother ?? [],
            suggested_adjustments: input.suggested_adjustments ?? [],
            created_at: now,
        })
            .returning({ id: calibrations.id });
        calId = inserted[0].id;
        for (const p of input.phases ?? []) {
            await tx.insert(calibrationPhases).values({
                calibration_id: calId,
                phase_id: p.id,
                phase_name: p.name ?? "",
                estimated_hours: p.estimated_hours ?? 0,
                actual_hours: p.actual_hours ?? 0,
                variance_percent: p.variance_percent ?? 0,
                variance_direction: p.variance_direction ?? "",
                notes: p.notes ?? "",
            });
        }
        for (const c of input.components ?? []) {
            await tx.insert(calibrationComponents).values({
                calibration_id: calId,
                component_id: c.id,
                estimated_hours: c.estimated_hours ?? 0,
                actual_hours: c.actual_hours ?? 0,
                variance_percent: c.variance_percent ?? 0,
                notes: c.notes ?? "",
            });
        }
        for (const t of input.ai_tools ?? []) {
            await tx.insert(calibrationAiTools).values({
                calibration_id: calId,
                tool_id: t.id,
                tool_name: t.name ?? "",
                was_used: t.was_used ?? false,
                estimated_savings_hours: t.estimated_savings_hours ?? 0,
                actual_savings_hours: t.actual_savings_hours ?? 0,
                variance_percent: t.variance_percent ?? 0,
                notes: t.notes ?? "",
            });
        }
        await tx
            .update(assessments)
            .set({ updated_at: now })
            .where(eq(assessments.id, input.assessment_id));
    });
    return { success: true, id: calId };
}
//# sourceMappingURL=calibrations.js.map