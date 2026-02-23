import { type Database } from "../connection.js";
export interface EstimateVersionSummary {
    version: number;
    confidence_score: number;
    total_expected_hours: number;
    total_base_hours: number;
    total_gotcha_hours: number;
    assumption_widening_hours: number;
    created_at: string;
}
export declare function listEstimateVersions(db: Database, assessmentId: string): Promise<EstimateVersionSummary[]>;
export interface SaveEstimateInput {
    assessment_id: string;
    confidence_score?: number;
    total_base_hours?: number;
    total_gotcha_hours?: number;
    total_expected_hours?: number;
    assumption_widening_hours?: number;
    totals?: unknown;
    total_by_role?: unknown;
    client_summary?: unknown;
    phases?: Array<{
        id: string;
        name: string;
        duration?: string;
        components?: Array<{
            id: string;
            name: string;
            units?: number;
            base_hours?: number;
            multipliers_applied?: unknown;
            gotcha_hours?: number;
            final_hours?: number;
            firm_hours?: number;
            assumption_dependent_hours?: number;
            assumptions_affecting?: string[];
            hours?: unknown;
            ai_alternatives?: unknown;
            by_role?: unknown;
        }>;
    }>;
}
export declare function saveEstimate(db: Database, input: SaveEstimateInput): Promise<{
    success: boolean;
    version: number;
}>;
export declare function getEstimate(db: Database, assessmentId: string, version?: number): Promise<{
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
//# sourceMappingURL=estimates.d.ts.map