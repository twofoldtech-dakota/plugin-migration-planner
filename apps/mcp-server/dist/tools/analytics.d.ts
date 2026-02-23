import { z } from "zod";
export declare const queryProjectsSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodString>;
    client_name: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    status?: string | undefined;
    client_name?: string | undefined;
}, {
    status?: string | undefined;
    client_name?: string | undefined;
    limit?: number | undefined;
}>;
export declare function queryProjects(input: z.infer<typeof queryProjectsSchema>): Promise<{
    projects: {
        completeness_pct: number | null;
        total_assumptions: number;
        validated_assumptions: number;
        estimate_version: number;
        confidence_score: number;
        total_expected_hours: number;
        recommended_hours: {} | null;
        id: string;
        project_name: string;
        client_name: string;
        status: string;
        topology: string;
        source_cloud: string;
        target_cloud: string;
        source_stack: unknown;
        target_stack: unknown;
        created_at: string;
    }[];
    total: number;
}>;
export declare const queryConfidenceTimelineSchema: z.ZodObject<{
    from: z.ZodOptional<z.ZodString>;
    to: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    from?: string | undefined;
    to?: string | undefined;
}, {
    from?: string | undefined;
    to?: string | undefined;
    limit?: number | undefined;
}>;
export declare function queryConfidenceTimeline(input: z.infer<typeof queryConfidenceTimelineSchema>): Promise<import("@migration-planner/db").ConfidenceTimelinePoint[]>;
//# sourceMappingURL=analytics.d.ts.map