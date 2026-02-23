import { z } from "zod";
export declare const saveEstimateSchema: z.ZodObject<{
    assessment_id: z.ZodString;
    confidence_score: z.ZodDefault<z.ZodNumber>;
    total_base_hours: z.ZodDefault<z.ZodNumber>;
    total_gotcha_hours: z.ZodDefault<z.ZodNumber>;
    total_expected_hours: z.ZodDefault<z.ZodNumber>;
    assumption_widening_hours: z.ZodDefault<z.ZodNumber>;
    totals: z.ZodDefault<z.ZodUnknown>;
    total_by_role: z.ZodDefault<z.ZodUnknown>;
    client_summary: z.ZodDefault<z.ZodUnknown>;
    phases: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        duration: z.ZodOptional<z.ZodString>;
        components: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            units: z.ZodDefault<z.ZodNumber>;
            base_hours: z.ZodDefault<z.ZodNumber>;
            multipliers_applied: z.ZodDefault<z.ZodUnknown>;
            gotcha_hours: z.ZodDefault<z.ZodNumber>;
            final_hours: z.ZodDefault<z.ZodNumber>;
            firm_hours: z.ZodDefault<z.ZodNumber>;
            assumption_dependent_hours: z.ZodDefault<z.ZodNumber>;
            assumptions_affecting: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            hours: z.ZodDefault<z.ZodUnknown>;
            ai_alternatives: z.ZodDefault<z.ZodUnknown>;
            by_role: z.ZodDefault<z.ZodUnknown>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            units: number;
            base_hours: number;
            gotcha_hours: number;
            final_hours: number;
            firm_hours: number;
            assumption_dependent_hours: number;
            assumptions_affecting: string[];
            multipliers_applied?: unknown;
            hours?: unknown;
            ai_alternatives?: unknown;
            by_role?: unknown;
        }, {
            id: string;
            name: string;
            units?: number | undefined;
            base_hours?: number | undefined;
            multipliers_applied?: unknown;
            gotcha_hours?: number | undefined;
            final_hours?: number | undefined;
            firm_hours?: number | undefined;
            assumption_dependent_hours?: number | undefined;
            assumptions_affecting?: string[] | undefined;
            hours?: unknown;
            ai_alternatives?: unknown;
            by_role?: unknown;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        components: {
            id: string;
            name: string;
            units: number;
            base_hours: number;
            gotcha_hours: number;
            final_hours: number;
            firm_hours: number;
            assumption_dependent_hours: number;
            assumptions_affecting: string[];
            multipliers_applied?: unknown;
            hours?: unknown;
            ai_alternatives?: unknown;
            by_role?: unknown;
        }[];
        duration?: string | undefined;
    }, {
        id: string;
        name: string;
        duration?: string | undefined;
        components?: {
            id: string;
            name: string;
            units?: number | undefined;
            base_hours?: number | undefined;
            multipliers_applied?: unknown;
            gotcha_hours?: number | undefined;
            final_hours?: number | undefined;
            firm_hours?: number | undefined;
            assumption_dependent_hours?: number | undefined;
            assumptions_affecting?: string[] | undefined;
            hours?: unknown;
            ai_alternatives?: unknown;
            by_role?: unknown;
        }[] | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    assessment_id: string;
    confidence_score: number;
    total_base_hours: number;
    total_gotcha_hours: number;
    total_expected_hours: number;
    assumption_widening_hours: number;
    phases: {
        id: string;
        name: string;
        components: {
            id: string;
            name: string;
            units: number;
            base_hours: number;
            gotcha_hours: number;
            final_hours: number;
            firm_hours: number;
            assumption_dependent_hours: number;
            assumptions_affecting: string[];
            multipliers_applied?: unknown;
            hours?: unknown;
            ai_alternatives?: unknown;
            by_role?: unknown;
        }[];
        duration?: string | undefined;
    }[];
    totals?: unknown;
    total_by_role?: unknown;
    client_summary?: unknown;
}, {
    assessment_id: string;
    confidence_score?: number | undefined;
    total_base_hours?: number | undefined;
    total_gotcha_hours?: number | undefined;
    total_expected_hours?: number | undefined;
    assumption_widening_hours?: number | undefined;
    totals?: unknown;
    total_by_role?: unknown;
    client_summary?: unknown;
    phases?: {
        id: string;
        name: string;
        duration?: string | undefined;
        components?: {
            id: string;
            name: string;
            units?: number | undefined;
            base_hours?: number | undefined;
            multipliers_applied?: unknown;
            gotcha_hours?: number | undefined;
            final_hours?: number | undefined;
            firm_hours?: number | undefined;
            assumption_dependent_hours?: number | undefined;
            assumptions_affecting?: string[] | undefined;
            hours?: unknown;
            ai_alternatives?: unknown;
            by_role?: unknown;
        }[] | undefined;
    }[] | undefined;
}>;
export declare function saveEstimate(input: z.infer<typeof saveEstimateSchema>): Promise<{
    success: boolean;
    version: number;
}>;
export declare const getEstimateSchema: z.ZodObject<{
    assessment_id: z.ZodString;
    version: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    assessment_id: string;
    version?: number | undefined;
}, {
    assessment_id: string;
    version?: number | undefined;
}>;
export declare function getEstimate(input: z.infer<typeof getEstimateSchema>): Promise<{
    id: number;
    assessment_id: string;
    version: number;
    confidence_score: number;
    total_base_hours: number;
    total_gotcha_hours: number;
    total_expected_hours: number;
    assumption_widening_hours: number;
    totals: unknown;
    total_by_role: unknown;
    client_summary: unknown;
    phases: unknown[];
    created_at: string;
} | null>;
export declare const listEstimateVersionsSchema: z.ZodObject<{
    assessment_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    assessment_id: string;
}, {
    assessment_id: string;
}>;
export declare function listEstimateVersions(input: z.infer<typeof listEstimateVersionsSchema>): Promise<import("@migration-planner/db").EstimateVersionSummary[]>;
//# sourceMappingURL=estimate.d.ts.map