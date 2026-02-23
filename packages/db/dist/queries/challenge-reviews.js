import { eq, and, sql, desc } from "drizzle-orm";
import { challengeReviews, assessments } from "../schema.js";
export async function saveChallengeReview(db, input) {
    const now = new Date().toISOString();
    // Auto-determine round if not provided
    let round = input.round;
    if (!round) {
        const maxRoundRows = await db
            .select({ r: sql `coalesce(max(${challengeReviews.round}), 0)` })
            .from(challengeReviews)
            .where(and(eq(challengeReviews.assessment_id, input.assessment_id), eq(challengeReviews.step, input.step)));
        round = (maxRoundRows[0]?.r ?? 0) + 1;
    }
    const inserted = await db
        .insert(challengeReviews)
        .values({
        assessment_id: input.assessment_id,
        step: input.step,
        round,
        status: input.status ?? "in_progress",
        confidence_score: input.confidence_score ?? 0,
        score_breakdown: input.score_breakdown ?? {},
        acceptance_criteria_met: input.acceptance_criteria_met ?? {},
        challenges: input.challenges ?? [],
        findings: input.findings ?? [],
        summary: input.summary ?? "",
        created_at: now,
        completed_at: input.completed_at ?? null,
    })
        .returning({ id: challengeReviews.id });
    await db
        .update(assessments)
        .set({ updated_at: now })
        .where(eq(assessments.id, input.assessment_id));
    return { success: true, id: inserted[0].id, round };
}
export async function getChallengeReviews(db, assessmentId, step) {
    const conditions = [eq(challengeReviews.assessment_id, assessmentId)];
    if (step) {
        conditions.push(eq(challengeReviews.step, step));
    }
    const rows = await db
        .select()
        .from(challengeReviews)
        .where(and(...conditions))
        .orderBy(challengeReviews.step, challengeReviews.round);
    return rows;
}
export async function getLatestChallengeReview(db, assessmentId, step) {
    const rows = await db
        .select()
        .from(challengeReviews)
        .where(and(eq(challengeReviews.assessment_id, assessmentId), eq(challengeReviews.step, step)))
        .orderBy(desc(challengeReviews.round))
        .limit(1);
    return rows[0] ?? null;
}
export async function getChallengeReviewSummary(db, assessmentId) {
    // Get the latest review for each step
    const rows = await db
        .select()
        .from(challengeReviews)
        .where(eq(challengeReviews.assessment_id, assessmentId))
        .orderBy(challengeReviews.step, desc(challengeReviews.round));
    const summary = {};
    for (const row of rows) {
        // Only keep the first (latest) row per step
        if (!summary[row.step]) {
            summary[row.step] = {
                step: row.step,
                latestRound: row.round,
                latestStatus: row.status,
                confidenceScore: row.confidence_score,
            };
        }
    }
    return summary;
}
//# sourceMappingURL=challenge-reviews.js.map