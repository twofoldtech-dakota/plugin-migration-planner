import { type Database } from "../connection.js";
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
export declare function saveChallengeReview(db: Database, input: SaveChallengeReviewInput): Promise<{
    success: boolean;
    id: number;
    round: number;
}>;
export declare function getChallengeReviews(db: Database, assessmentId: string, step?: string): Promise<{
    id: number;
    assessment_id: string;
    step: string;
    round: number;
    status: string;
    confidence_score: number;
    score_breakdown: unknown;
    acceptance_criteria_met: unknown;
    challenges: unknown;
    findings: unknown;
    summary: string;
    created_at: string;
    completed_at: string | null;
}[]>;
export declare function getLatestChallengeReview(db: Database, assessmentId: string, step: string): Promise<{
    id: number;
    assessment_id: string;
    step: string;
    round: number;
    status: string;
    confidence_score: number;
    score_breakdown: unknown;
    acceptance_criteria_met: unknown;
    challenges: unknown;
    findings: unknown;
    summary: string;
    created_at: string;
    completed_at: string | null;
}>;
export interface ChallengeReviewSummary {
    step: string;
    latestRound: number;
    latestStatus: string;
    confidenceScore: number;
}
export declare function getChallengeReviewSummary(db: Database, assessmentId: string): Promise<Record<string, ChallengeReviewSummary>>;
//# sourceMappingURL=challenge-reviews.d.ts.map