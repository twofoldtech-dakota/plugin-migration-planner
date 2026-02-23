import { z } from "zod";
export declare const saveCalibrationSchema: z.ZodObject<{
    assessment_id: z.ZodString;
    engagement_name: z.ZodString;
    estimate_date: z.ZodDefault<z.ZodString>;
    status: z.ZodDefault<z.ZodString>;
    phases: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodDefault<z.ZodString>;
        estimated_hours: z.ZodDefault<z.ZodNumber>;
        actual_hours: z.ZodDefault<z.ZodNumber>;
        variance_percent: z.ZodDefault<z.ZodNumber>;
        variance_direction: z.ZodDefault<z.ZodString>;
        notes: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        notes: string;
        id: string;
        name: string;
        estimated_hours: number;
        actual_hours: number;
        variance_percent: number;
        variance_direction: string;
    }, {
        id: string;
        notes?: string | undefined;
        name?: string | undefined;
        estimated_hours?: number | undefined;
        actual_hours?: number | undefined;
        variance_percent?: number | undefined;
        variance_direction?: string | undefined;
    }>, "many">>;
    components: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        estimated_hours: z.ZodDefault<z.ZodNumber>;
        actual_hours: z.ZodDefault<z.ZodNumber>;
        variance_percent: z.ZodDefault<z.ZodNumber>;
        notes: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        notes: string;
        id: string;
        estimated_hours: number;
        actual_hours: number;
        variance_percent: number;
    }, {
        id: string;
        notes?: string | undefined;
        estimated_hours?: number | undefined;
        actual_hours?: number | undefined;
        variance_percent?: number | undefined;
    }>, "many">>;
    ai_tools: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodDefault<z.ZodString>;
        was_used: z.ZodDefault<z.ZodBoolean>;
        estimated_savings_hours: z.ZodDefault<z.ZodNumber>;
        actual_savings_hours: z.ZodDefault<z.ZodNumber>;
        variance_percent: z.ZodDefault<z.ZodNumber>;
        notes: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        notes: string;
        id: string;
        name: string;
        variance_percent: number;
        was_used: boolean;
        estimated_savings_hours: number;
        actual_savings_hours: number;
    }, {
        id: string;
        notes?: string | undefined;
        name?: string | undefined;
        variance_percent?: number | undefined;
        was_used?: boolean | undefined;
        estimated_savings_hours?: number | undefined;
        actual_savings_hours?: number | undefined;
    }>, "many">>;
    total_estimated: z.ZodDefault<z.ZodUnknown>;
    total_actual: z.ZodDefault<z.ZodNullable<z.ZodNumber>>;
    surprises: z.ZodDefault<z.ZodArray<z.ZodUnknown, "many">>;
    smoother: z.ZodDefault<z.ZodArray<z.ZodUnknown, "many">>;
    suggested_adjustments: z.ZodDefault<z.ZodArray<z.ZodUnknown, "many">>;
}, "strip", z.ZodTypeAny, {
    status: string;
    components: {
        notes: string;
        id: string;
        estimated_hours: number;
        actual_hours: number;
        variance_percent: number;
    }[];
    assessment_id: string;
    phases: {
        notes: string;
        id: string;
        name: string;
        estimated_hours: number;
        actual_hours: number;
        variance_percent: number;
        variance_direction: string;
    }[];
    engagement_name: string;
    estimate_date: string;
    ai_tools: {
        notes: string;
        id: string;
        name: string;
        variance_percent: number;
        was_used: boolean;
        estimated_savings_hours: number;
        actual_savings_hours: number;
    }[];
    total_actual: number | null;
    surprises: unknown[];
    smoother: unknown[];
    suggested_adjustments: unknown[];
    total_estimated?: unknown;
}, {
    assessment_id: string;
    engagement_name: string;
    status?: string | undefined;
    components?: {
        id: string;
        notes?: string | undefined;
        estimated_hours?: number | undefined;
        actual_hours?: number | undefined;
        variance_percent?: number | undefined;
    }[] | undefined;
    phases?: {
        id: string;
        notes?: string | undefined;
        name?: string | undefined;
        estimated_hours?: number | undefined;
        actual_hours?: number | undefined;
        variance_percent?: number | undefined;
        variance_direction?: string | undefined;
    }[] | undefined;
    estimate_date?: string | undefined;
    ai_tools?: {
        id: string;
        notes?: string | undefined;
        name?: string | undefined;
        variance_percent?: number | undefined;
        was_used?: boolean | undefined;
        estimated_savings_hours?: number | undefined;
        actual_savings_hours?: number | undefined;
    }[] | undefined;
    total_estimated?: unknown;
    total_actual?: number | null | undefined;
    surprises?: unknown[] | undefined;
    smoother?: unknown[] | undefined;
    suggested_adjustments?: unknown[] | undefined;
}>;
export declare function saveCalibration(input: z.infer<typeof saveCalibrationSchema>): Promise<{
    success: boolean;
    id: number;
}>;
//# sourceMappingURL=calibration.d.ts.map