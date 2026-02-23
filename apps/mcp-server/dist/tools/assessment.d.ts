import { z } from "zod";
export declare const saveAssessmentSchema: z.ZodObject<{
    id: z.ZodString;
    project_name: z.ZodString;
    client_name: z.ZodDefault<z.ZodString>;
    client_id: z.ZodOptional<z.ZodString>;
    architect: z.ZodDefault<z.ZodString>;
    project_path: z.ZodDefault<z.ZodString>;
    source_stack: z.ZodDefault<z.ZodUnknown>;
    target_stack: z.ZodDefault<z.ZodUnknown>;
    migration_scope: z.ZodDefault<z.ZodUnknown>;
    sitecore_version: z.ZodDefault<z.ZodString>;
    topology: z.ZodDefault<z.ZodString>;
    source_cloud: z.ZodDefault<z.ZodString>;
    target_cloud: z.ZodDefault<z.ZodString>;
    target_timeline: z.ZodDefault<z.ZodString>;
    environment_count: z.ZodDefault<z.ZodNumber>;
    environments: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    status: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: string;
    project_name: string;
    client_name: string;
    architect: string;
    project_path: string;
    sitecore_version: string;
    topology: string;
    source_cloud: string;
    target_cloud: string;
    target_timeline: string;
    environment_count: number;
    environments: string[];
    client_id?: string | undefined;
    source_stack?: unknown;
    target_stack?: unknown;
    migration_scope?: unknown;
}, {
    id: string;
    project_name: string;
    status?: string | undefined;
    client_name?: string | undefined;
    client_id?: string | undefined;
    architect?: string | undefined;
    project_path?: string | undefined;
    source_stack?: unknown;
    target_stack?: unknown;
    migration_scope?: unknown;
    sitecore_version?: string | undefined;
    topology?: string | undefined;
    source_cloud?: string | undefined;
    target_cloud?: string | undefined;
    target_timeline?: string | undefined;
    environment_count?: number | undefined;
    environments?: string[] | undefined;
}>;
export declare function saveAssessment(input: z.infer<typeof saveAssessmentSchema>): Promise<{
    success: boolean;
    id: string;
}>;
export declare const getAssessmentSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    project_path: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id?: string | undefined;
    project_path?: string | undefined;
}, {
    id?: string | undefined;
    project_path?: string | undefined;
}>;
export declare function getAssessment(input: z.infer<typeof getAssessmentSchema>): Promise<{
    client_profile: {
        proficiencies: Record<string, import("@migration-planner/db").ProficiencyEntry>;
        id: string;
        name: string;
        industry: string;
        notes: string;
        created_at: string;
        updated_at: string;
    } | null;
    _meta: {
        total_assessments_for_path: number;
        is_active: boolean;
    };
    id: string;
    project_name: string;
    client_name: string;
    client_id: string | null;
    architect: string;
    project_path: string;
    source_stack: unknown;
    target_stack: unknown;
    migration_scope: unknown;
    sitecore_version: string;
    topology: string;
    source_cloud: string;
    target_cloud: string;
    target_timeline: string;
    environment_count: number;
    environments: unknown;
    status: string;
    challenge_required: boolean;
    created_at: string;
    updated_at: string;
} | null>;
export declare const listAssessmentsSchema: z.ZodObject<{
    project_path: z.ZodString;
}, "strip", z.ZodTypeAny, {
    project_path: string;
}, {
    project_path: string;
}>;
export declare function listAssessmentsForPath(input: z.infer<typeof listAssessmentsSchema>): Promise<{
    is_active: boolean;
    id: string;
    project_name: string;
    client_name: string;
    client_id: string | null;
    architect: string;
    project_path: string;
    source_stack: unknown;
    target_stack: unknown;
    migration_scope: unknown;
    sitecore_version: string;
    topology: string;
    source_cloud: string;
    target_cloud: string;
    target_timeline: string;
    environment_count: number;
    environments: unknown;
    status: string;
    challenge_required: boolean;
    created_at: string;
    updated_at: string;
}[]>;
export declare const setActiveAssessmentSchema: z.ZodObject<{
    project_path: z.ZodString;
    assessment_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    project_path: string;
    assessment_id: string;
}, {
    project_path: string;
    assessment_id: string;
}>;
export declare function setActiveAssessment(input: z.infer<typeof setActiveAssessmentSchema>): Promise<{
    success: boolean;
    error: string;
    active_assessment_id?: undefined;
} | {
    success: boolean;
    active_assessment_id: string;
    error?: undefined;
}>;
//# sourceMappingURL=assessment.d.ts.map