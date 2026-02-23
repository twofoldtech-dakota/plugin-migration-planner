import { z } from "zod";
export declare const saveDiscoverySchema: z.ZodObject<{
    assessment_id: z.ZodString;
    dimension: z.ZodString;
    status: z.ZodDefault<z.ZodString>;
    completed_at: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    answers: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodObject<{
        value: z.ZodUnknown;
        notes: z.ZodDefault<z.ZodString>;
        confidence: z.ZodDefault<z.ZodString>;
        basis: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        notes: string;
        confidence: string;
        basis: string | null;
        value?: unknown;
    }, {
        value?: unknown;
        notes?: string | undefined;
        confidence?: string | undefined;
        basis?: string | null | undefined;
    }>>>;
}, "strip", z.ZodTypeAny, {
    status: string;
    dimension: string;
    assessment_id: string;
    completed_at: string | null;
    answers: Record<string, {
        notes: string;
        confidence: string;
        basis: string | null;
        value?: unknown;
    }>;
}, {
    dimension: string;
    assessment_id: string;
    status?: string | undefined;
    completed_at?: string | null | undefined;
    answers?: Record<string, {
        value?: unknown;
        notes?: string | undefined;
        confidence?: string | undefined;
        basis?: string | null | undefined;
    }> | undefined;
}>;
export declare function saveDiscovery(input: z.infer<typeof saveDiscoverySchema>): Promise<{
    success: boolean;
    dimension: string;
}>;
export declare const getDiscoverySchema: z.ZodObject<{
    assessment_id: z.ZodString;
    dimension: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    assessment_id: string;
    dimension?: string | undefined;
}, {
    assessment_id: string;
    dimension?: string | undefined;
}>;
export declare function getDiscovery(input: z.infer<typeof getDiscoverySchema>): Promise<Record<string, unknown> | null>;
//# sourceMappingURL=discovery.d.ts.map