import { z } from "zod";
export declare const saveChallengeReviewSchema: z.ZodObject<{
    assessment_id: z.ZodString;
    step: z.ZodEnum<["discovery", "analysis", "estimate", "refine"]>;
    round: z.ZodOptional<z.ZodNumber>;
    status: z.ZodDefault<z.ZodEnum<["in_progress", "passed", "conditional_pass", "failed", "skipped"]>>;
    confidence_score: z.ZodDefault<z.ZodNumber>;
    score_breakdown: z.ZodDefault<z.ZodObject<{
        completeness: z.ZodDefault<z.ZodNumber>;
        consistency: z.ZodDefault<z.ZodNumber>;
        plausibility: z.ZodDefault<z.ZodNumber>;
        currency: z.ZodDefault<z.ZodNumber>;
        risk_coverage: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        completeness: number;
        consistency: number;
        plausibility: number;
        currency: number;
        risk_coverage: number;
    }, {
        completeness?: number | undefined;
        consistency?: number | undefined;
        plausibility?: number | undefined;
        currency?: number | undefined;
        risk_coverage?: number | undefined;
    }>>;
    acceptance_criteria_met: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodBoolean>>;
    challenges: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        category: z.ZodDefault<z.ZodString>;
        severity: z.ZodDefault<z.ZodEnum<["critical", "high", "medium", "low"]>>;
        description: z.ZodDefault<z.ZodString>;
        data_reference: z.ZodDefault<z.ZodString>;
        status: z.ZodDefault<z.ZodEnum<["open", "resolved", "accepted", "deferred"]>>;
        resolution: z.ZodDefault<z.ZodNullable<z.ZodString>>;
        researcher_needed: z.ZodDefault<z.ZodBoolean>;
        score_impact: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        category: string;
        description: string;
        severity: "critical" | "high" | "medium" | "low";
        status: "open" | "resolved" | "accepted" | "deferred";
        data_reference: string;
        resolution: string | null;
        researcher_needed: boolean;
        score_impact: number;
    }, {
        id: string;
        category?: string | undefined;
        description?: string | undefined;
        severity?: "critical" | "high" | "medium" | "low" | undefined;
        status?: "open" | "resolved" | "accepted" | "deferred" | undefined;
        data_reference?: string | undefined;
        resolution?: string | null | undefined;
        researcher_needed?: boolean | undefined;
        score_impact?: number | undefined;
    }>, "many">>;
    findings: z.ZodDefault<z.ZodArray<z.ZodObject<{
        challenge_id: z.ZodString;
        finding: z.ZodDefault<z.ZodString>;
        source: z.ZodDefault<z.ZodString>;
        source_url: z.ZodDefault<z.ZodNullable<z.ZodString>>;
        verified_date: z.ZodDefault<z.ZodString>;
        recommendation: z.ZodDefault<z.ZodString>;
        data_update_suggested: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        challenge_id: string;
        finding: string;
        source: string;
        source_url: string | null;
        verified_date: string;
        recommendation: string;
        data_update_suggested: boolean;
    }, {
        challenge_id: string;
        finding?: string | undefined;
        source?: string | undefined;
        source_url?: string | null | undefined;
        verified_date?: string | undefined;
        recommendation?: string | undefined;
        data_update_suggested?: boolean | undefined;
    }>, "many">>;
    summary: z.ZodDefault<z.ZodString>;
    completed_at: z.ZodDefault<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status: "in_progress" | "passed" | "conditional_pass" | "failed" | "skipped";
    assessment_id: string;
    completed_at: string | null;
    confidence_score: number;
    step: "discovery" | "analysis" | "estimate" | "refine";
    score_breakdown: {
        completeness: number;
        consistency: number;
        plausibility: number;
        currency: number;
        risk_coverage: number;
    };
    acceptance_criteria_met: Record<string, boolean>;
    challenges: {
        id: string;
        category: string;
        description: string;
        severity: "critical" | "high" | "medium" | "low";
        status: "open" | "resolved" | "accepted" | "deferred";
        data_reference: string;
        resolution: string | null;
        researcher_needed: boolean;
        score_impact: number;
    }[];
    findings: {
        challenge_id: string;
        finding: string;
        source: string;
        source_url: string | null;
        verified_date: string;
        recommendation: string;
        data_update_suggested: boolean;
    }[];
    summary: string;
    round?: number | undefined;
}, {
    assessment_id: string;
    step: "discovery" | "analysis" | "estimate" | "refine";
    status?: "in_progress" | "passed" | "conditional_pass" | "failed" | "skipped" | undefined;
    completed_at?: string | null | undefined;
    confidence_score?: number | undefined;
    round?: number | undefined;
    score_breakdown?: {
        completeness?: number | undefined;
        consistency?: number | undefined;
        plausibility?: number | undefined;
        currency?: number | undefined;
        risk_coverage?: number | undefined;
    } | undefined;
    acceptance_criteria_met?: Record<string, boolean> | undefined;
    challenges?: {
        id: string;
        category?: string | undefined;
        description?: string | undefined;
        severity?: "critical" | "high" | "medium" | "low" | undefined;
        status?: "open" | "resolved" | "accepted" | "deferred" | undefined;
        data_reference?: string | undefined;
        resolution?: string | null | undefined;
        researcher_needed?: boolean | undefined;
        score_impact?: number | undefined;
    }[] | undefined;
    findings?: {
        challenge_id: string;
        finding?: string | undefined;
        source?: string | undefined;
        source_url?: string | null | undefined;
        verified_date?: string | undefined;
        recommendation?: string | undefined;
        data_update_suggested?: boolean | undefined;
    }[] | undefined;
    summary?: string | undefined;
}>;
export declare function saveChallengeReview(input: z.infer<typeof saveChallengeReviewSchema>): Promise<{
    success: boolean;
    id: number;
    round: number;
}>;
export declare const getChallengeReviewsSchema: z.ZodObject<{
    assessment_id: z.ZodString;
    step: z.ZodOptional<z.ZodEnum<["discovery", "analysis", "estimate", "refine"]>>;
}, "strip", z.ZodTypeAny, {
    assessment_id: string;
    step?: "discovery" | "analysis" | "estimate" | "refine" | undefined;
}, {
    assessment_id: string;
    step?: "discovery" | "analysis" | "estimate" | "refine" | undefined;
}>;
export declare function getChallengeReviews(input: z.infer<typeof getChallengeReviewsSchema>): Promise<{
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
//# sourceMappingURL=challenge.d.ts.map