import { z } from "zod";
export declare const saveAnalysisSchema: z.ZodObject<{
    assessment_id: z.ZodString;
    risks: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        category: z.ZodDefault<z.ZodString>;
        description: z.ZodDefault<z.ZodString>;
        likelihood: z.ZodDefault<z.ZodString>;
        impact: z.ZodDefault<z.ZodString>;
        severity: z.ZodDefault<z.ZodString>;
        estimated_hours_impact: z.ZodDefault<z.ZodNumber>;
        linked_assumptions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        mitigation: z.ZodDefault<z.ZodString>;
        contingency: z.ZodDefault<z.ZodString>;
        owner: z.ZodDefault<z.ZodString>;
        status: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        category: string;
        description: string;
        likelihood: string;
        impact: string;
        severity: string;
        estimated_hours_impact: number;
        linked_assumptions: string[];
        mitigation: string;
        contingency: string;
        owner: string;
        status: string;
    }, {
        id: string;
        category?: string | undefined;
        description?: string | undefined;
        likelihood?: string | undefined;
        impact?: string | undefined;
        severity?: string | undefined;
        estimated_hours_impact?: number | undefined;
        linked_assumptions?: string[] | undefined;
        mitigation?: string | undefined;
        contingency?: string | undefined;
        owner?: string | undefined;
        status?: string | undefined;
    }>, "many">>;
    active_multipliers: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodDefault<z.ZodString>;
        factor: z.ZodDefault<z.ZodNumber>;
        trigger: z.ZodDefault<z.ZodString>;
        affected_components: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        factor: number;
        trigger: string;
        affected_components: string[];
    }, {
        id: string;
        name?: string | undefined;
        factor?: number | undefined;
        trigger?: string | undefined;
        affected_components?: string[] | undefined;
    }>, "many">>;
    dependency_chains: z.ZodDefault<z.ZodArray<z.ZodObject<{
        from: z.ZodString;
        to: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>;
        type: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        from: string;
        to: string | string[];
        type: string;
    }, {
        from: string;
        to: string | string[];
        type?: string | undefined;
    }>, "many">>;
    risk_clusters: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        risks: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        assumptions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        combined_widening_hours: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        risks: string[];
        assumptions: string[];
        combined_widening_hours: number;
    }, {
        name: string;
        risks?: string[] | undefined;
        assumptions?: string[] | undefined;
        combined_widening_hours?: number | undefined;
    }>, "many">>;
    assumptions: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        dimension: z.ZodDefault<z.ZodString>;
        question_id: z.ZodDefault<z.ZodNullable<z.ZodString>>;
        assumed_value: z.ZodDefault<z.ZodString>;
        basis: z.ZodDefault<z.ZodString>;
        confidence: z.ZodDefault<z.ZodString>;
        validation_status: z.ZodDefault<z.ZodString>;
        validation_method: z.ZodDefault<z.ZodString>;
        pessimistic_widening_hours: z.ZodDefault<z.ZodNumber>;
        affected_components: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        confidence: string;
        basis: string;
        id: string;
        affected_components: string[];
        dimension: string;
        question_id: string | null;
        assumed_value: string;
        validation_status: string;
        validation_method: string;
        pessimistic_widening_hours: number;
    }, {
        id: string;
        confidence?: string | undefined;
        basis?: string | undefined;
        affected_components?: string[] | undefined;
        dimension?: string | undefined;
        question_id?: string | null | undefined;
        assumed_value?: string | undefined;
        validation_status?: string | undefined;
        validation_method?: string | undefined;
        pessimistic_widening_hours?: number | undefined;
    }>, "many">>;
    gaps: z.ZodOptional<z.ZodObject<{
        unknown_answers: z.ZodDefault<z.ZodNumber>;
        assumed_answers: z.ZodDefault<z.ZodNumber>;
        confirmed_answers: z.ZodDefault<z.ZodNumber>;
        total_answers: z.ZodDefault<z.ZodNumber>;
        top_gaps: z.ZodDefault<z.ZodArray<z.ZodObject<{
            dimension: z.ZodString;
            question: z.ZodString;
            impact: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            impact: string;
            dimension: string;
            question: string;
        }, {
            impact: string;
            dimension: string;
            question: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        unknown_answers: number;
        assumed_answers: number;
        confirmed_answers: number;
        total_answers: number;
        top_gaps: {
            impact: string;
            dimension: string;
            question: string;
        }[];
    }, {
        unknown_answers?: number | undefined;
        assumed_answers?: number | undefined;
        confirmed_answers?: number | undefined;
        total_answers?: number | undefined;
        top_gaps?: {
            impact: string;
            dimension: string;
            question: string;
        }[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    risks: {
        id: string;
        category: string;
        description: string;
        likelihood: string;
        impact: string;
        severity: string;
        estimated_hours_impact: number;
        linked_assumptions: string[];
        mitigation: string;
        contingency: string;
        owner: string;
        status: string;
    }[];
    assumptions: {
        confidence: string;
        basis: string;
        id: string;
        affected_components: string[];
        dimension: string;
        question_id: string | null;
        assumed_value: string;
        validation_status: string;
        validation_method: string;
        pessimistic_widening_hours: number;
    }[];
    assessment_id: string;
    active_multipliers: {
        id: string;
        name: string;
        factor: number;
        trigger: string;
        affected_components: string[];
    }[];
    dependency_chains: {
        from: string;
        to: string | string[];
        type: string;
    }[];
    risk_clusters: {
        name: string;
        risks: string[];
        assumptions: string[];
        combined_widening_hours: number;
    }[];
    gaps?: {
        unknown_answers: number;
        assumed_answers: number;
        confirmed_answers: number;
        total_answers: number;
        top_gaps: {
            impact: string;
            dimension: string;
            question: string;
        }[];
    } | undefined;
}, {
    assessment_id: string;
    risks?: {
        id: string;
        category?: string | undefined;
        description?: string | undefined;
        likelihood?: string | undefined;
        impact?: string | undefined;
        severity?: string | undefined;
        estimated_hours_impact?: number | undefined;
        linked_assumptions?: string[] | undefined;
        mitigation?: string | undefined;
        contingency?: string | undefined;
        owner?: string | undefined;
        status?: string | undefined;
    }[] | undefined;
    assumptions?: {
        id: string;
        confidence?: string | undefined;
        basis?: string | undefined;
        affected_components?: string[] | undefined;
        dimension?: string | undefined;
        question_id?: string | null | undefined;
        assumed_value?: string | undefined;
        validation_status?: string | undefined;
        validation_method?: string | undefined;
        pessimistic_widening_hours?: number | undefined;
    }[] | undefined;
    active_multipliers?: {
        id: string;
        name?: string | undefined;
        factor?: number | undefined;
        trigger?: string | undefined;
        affected_components?: string[] | undefined;
    }[] | undefined;
    dependency_chains?: {
        from: string;
        to: string | string[];
        type?: string | undefined;
    }[] | undefined;
    risk_clusters?: {
        name: string;
        risks?: string[] | undefined;
        assumptions?: string[] | undefined;
        combined_widening_hours?: number | undefined;
    }[] | undefined;
    gaps?: {
        unknown_answers?: number | undefined;
        assumed_answers?: number | undefined;
        confirmed_answers?: number | undefined;
        total_answers?: number | undefined;
        top_gaps?: {
            impact: string;
            dimension: string;
            question: string;
        }[] | undefined;
    } | undefined;
}>;
export declare function saveAnalysis(input: z.infer<typeof saveAnalysisSchema>): Promise<{
    success: boolean;
    risks: number;
    assumptions: number;
}>;
export declare const getAnalysisSchema: z.ZodObject<{
    assessment_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    assessment_id: string;
}, {
    assessment_id: string;
}>;
export declare function getAnalysis(input: z.infer<typeof getAnalysisSchema>): Promise<{
    risks: {
        id: string;
        assessment_id: string;
        category: string;
        description: string;
        likelihood: string;
        impact: string;
        severity: string;
        estimated_hours_impact: number;
        linked_assumptions: unknown;
        mitigation: string;
        contingency: string;
        owner: string;
        status: string;
    }[];
    active_multipliers: {
        assessment_id: string;
        multiplier_id: string;
        name: string;
        factor: number;
        trigger_condition: string;
        affected_components: unknown;
    }[];
    dependency_chains: {
        from: string;
        to: string[];
        type: string;
    }[];
    risk_clusters: {
        assessment_id: string;
        name: string;
        risks: unknown;
        assumptions: unknown;
        combined_widening_hours: number;
    }[];
    assumptions: {
        id: string;
        assessment_id: string;
        dimension: string;
        question_id: string | null;
        assumed_value: string;
        basis: string;
        confidence: string;
        validation_status: string;
        validation_method: string;
        pessimistic_widening_hours: number;
        affected_components: unknown;
        created_at: string;
        validated_at: string | null;
        actual_value: string | null;
    }[];
    gaps: {
        unknown_answers: number;
        assumed_answers: number;
        confirmed_answers: number;
        total_answers: number;
    } | null;
} | null>;
//# sourceMappingURL=analysis.d.ts.map