import { type Database } from "../connection.js";
export interface SaveAnalysisInput {
    assessment_id: string;
    risks?: Array<{
        id: string;
        category?: string;
        description?: string;
        likelihood?: string;
        impact?: string;
        severity?: string;
        estimated_hours_impact?: number;
        linked_assumptions?: string[];
        mitigation?: string;
        contingency?: string;
        owner?: string;
        status?: string;
    }>;
    active_multipliers?: Array<{
        id: string;
        name?: string;
        factor?: number;
        trigger?: string;
        affected_components?: string[];
    }>;
    dependency_chains?: Array<{
        from: string;
        to: string | string[];
        type?: string;
    }>;
    risk_clusters?: Array<{
        name: string;
        risks?: string[];
        assumptions?: string[];
        combined_widening_hours?: number;
    }>;
    assumptions?: Array<{
        id: string;
        dimension?: string;
        question_id?: string | null;
        assumed_value?: string;
        basis?: string;
        confidence?: string;
        validation_status?: string;
        validation_method?: string;
        pessimistic_widening_hours?: number;
        affected_components?: string[];
    }>;
}
export declare function saveAnalysis(db: Database, input: SaveAnalysisInput): Promise<{
    success: boolean;
    risks: number;
    assumptions: number;
}>;
export declare function getAnalysis(db: Database, assessmentId: string): Promise<{
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