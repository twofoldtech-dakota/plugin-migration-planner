import { z } from "zod";
import {
  getDb,
  saveChallengeReview as dbSaveChallengeReview,
  getChallengeReviews as dbGetChallengeReviews,
} from "@migration-planner/db";

export const saveChallengeReviewSchema = z.object({
  assessment_id: z.string(),
  step: z.enum(["discovery", "analysis", "estimate", "refine"]),
  round: z.number().int().optional(),
  status: z
    .enum(["in_progress", "passed", "conditional_pass", "failed", "skipped"])
    .default("in_progress"),
  confidence_score: z.number().default(0),
  score_breakdown: z
    .object({
      completeness: z.number().default(0),
      consistency: z.number().default(0),
      plausibility: z.number().default(0),
      currency: z.number().default(0),
      risk_coverage: z.number().default(0),
    })
    .default({}),
  acceptance_criteria_met: z.record(z.string(), z.boolean()).default({}),
  challenges: z
    .array(
      z.object({
        id: z.string(),
        category: z.string().default(""),
        severity: z
          .enum(["critical", "high", "medium", "low"])
          .default("medium"),
        description: z.string().default(""),
        data_reference: z.string().default(""),
        status: z
          .enum(["open", "resolved", "accepted", "deferred"])
          .default("open"),
        resolution: z.string().nullable().default(null),
        researcher_needed: z.boolean().default(false),
        score_impact: z.number().default(0),
      })
    )
    .default([]),
  findings: z
    .array(
      z.object({
        challenge_id: z.string(),
        finding: z.string().default(""),
        source: z.string().default(""),
        source_url: z.string().nullable().default(null),
        verified_date: z.string().default(""),
        recommendation: z.string().default(""),
        data_update_suggested: z.boolean().default(false),
      })
    )
    .default([]),
  summary: z.string().default(""),
  completed_at: z.string().nullable().default(null),
});

export async function saveChallengeReview(
  input: z.infer<typeof saveChallengeReviewSchema>
) {
  const db = getDb();
  return dbSaveChallengeReview(db, input);
}

export const getChallengeReviewsSchema = z.object({
  assessment_id: z.string(),
  step: z
    .enum(["discovery", "analysis", "estimate", "refine"])
    .optional(),
});

export async function getChallengeReviews(
  input: z.infer<typeof getChallengeReviewsSchema>
) {
  const db = getDb();
  return dbGetChallengeReviews(db, input.assessment_id, input.step);
}
