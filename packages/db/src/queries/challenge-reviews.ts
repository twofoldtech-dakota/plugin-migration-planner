import { eq, and, sql, desc } from "drizzle-orm";
import { type Database } from "../connection.js";
import { challengeReviews, assessments } from "../schema.js";

export interface SaveChallengeReviewInput {
  assessment_id: string;
  step: string;
  round?: number;
  status?: string;
  confidence_score?: number;
  score_breakdown?: Record<string, number>;
  acceptance_criteria_met?: Record<string, boolean>;
  challenges?: unknown[];
  findings?: unknown[];
  summary?: string;
  completed_at?: string | null;
}

export async function saveChallengeReview(
  db: Database,
  input: SaveChallengeReviewInput
) {
  const now = new Date().toISOString();

  // Auto-determine round if not provided
  let round = input.round;
  if (!round) {
    const maxRoundRows = await db
      .select({ r: sql<number>`coalesce(max(${challengeReviews.round}), 0)` })
      .from(challengeReviews)
      .where(
        and(
          eq(challengeReviews.assessment_id, input.assessment_id),
          eq(challengeReviews.step, input.step)
        )
      );
    round = ((maxRoundRows[0]?.r as number | null) ?? 0) + 1;
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

export async function getChallengeReviews(
  db: Database,
  assessmentId: string,
  step?: string
) {
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

export async function getLatestChallengeReview(
  db: Database,
  assessmentId: string,
  step: string
) {
  const rows = await db
    .select()
    .from(challengeReviews)
    .where(
      and(
        eq(challengeReviews.assessment_id, assessmentId),
        eq(challengeReviews.step, step)
      )
    )
    .orderBy(desc(challengeReviews.round))
    .limit(1);

  return rows[0] ?? null;
}

export interface ChallengeReviewSummary {
  step: string;
  latestRound: number;
  latestStatus: string;
  confidenceScore: number;
}

export async function getChallengeReviewSummary(
  db: Database,
  assessmentId: string
): Promise<Record<string, ChallengeReviewSummary>> {
  // Get the latest review for each step
  const rows = await db
    .select()
    .from(challengeReviews)
    .where(eq(challengeReviews.assessment_id, assessmentId))
    .orderBy(challengeReviews.step, desc(challengeReviews.round));

  const summary: Record<string, ChallengeReviewSummary> = {};
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
