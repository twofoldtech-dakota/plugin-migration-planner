import { eq, and, sql } from "drizzle-orm";
import { assumptions, assessments, discoveryAnswers } from "../schema.js";
export async function updateAssumption(db, input) {
    const now = new Date().toISOString();
    const existing = await db
        .select()
        .from(assumptions)
        .where(and(eq(assumptions.id, input.assumption_id), eq(assumptions.assessment_id, input.assessment_id)))
        .limit(1);
    if (existing.length === 0) {
        return { success: false, error: `Assumption ${input.assumption_id} not found` };
    }
    await db
        .update(assumptions)
        .set({
        validation_status: input.validation_status,
        validated_at: now,
        actual_value: input.actual_value ?? null,
    })
        .where(and(eq(assumptions.id, input.assumption_id), eq(assumptions.assessment_id, input.assessment_id)));
    // Recalculate confidence score
    const summaryRows = await db
        .select({
        total_assumptions: sql `count(*)`,
        validated: sql `sum(case when ${assumptions.validation_status} = 'validated' then 1 else 0 end)`,
        total_widening: sql `sum(case when ${assumptions.validation_status} = 'unvalidated' then ${assumptions.pessimistic_widening_hours} else 0 end)`,
    })
        .from(assumptions)
        .where(eq(assumptions.assessment_id, input.assessment_id));
    const confirmedRows = await db
        .select({
        c: sql `count(*)`,
    })
        .from(discoveryAnswers)
        .where(and(eq(discoveryAnswers.assessment_id, input.assessment_id), eq(discoveryAnswers.confidence, "confirmed")));
    const totalAnswerRows = await db
        .select({
        c: sql `count(*)`,
    })
        .from(discoveryAnswers)
        .where(eq(discoveryAnswers.assessment_id, input.assessment_id));
    const summary = summaryRows[0];
    const confirmed = confirmedRows[0]?.c ?? 0;
    const totalAnswers = totalAnswerRows[0]?.c ?? 0;
    const validated = summary?.validated ?? 0;
    const totalAssumptions = summary?.total_assumptions ?? 0;
    const totalDataPoints = totalAnswers + totalAssumptions;
    const confidence = totalDataPoints > 0 ? Math.round(((validated + confirmed) / totalDataPoints) * 100) : 0;
    await db
        .update(assessments)
        .set({ updated_at: now })
        .where(eq(assessments.id, input.assessment_id));
    return {
        success: true,
        assumption_id: input.assumption_id,
        new_status: input.validation_status,
        new_confidence_score: confidence,
        remaining_widening_hours: summary?.total_widening ?? 0,
    };
}
//# sourceMappingURL=assumptions.js.map