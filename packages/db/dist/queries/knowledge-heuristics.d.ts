import { type Database } from "../connection.js";
export interface SaveHeuristicsInput {
    pack_id: string;
    effort_hours?: Array<{
        component_id: string;
        component_name?: string;
        base_hours?: number;
        unit?: string;
        includes?: string;
        role_breakdown?: unknown;
        phase_id?: string;
    }>;
    multipliers?: Array<{
        multiplier_id: string;
        condition?: string;
        factor?: number;
        applies_to?: unknown;
        reason?: string;
        supersedes?: string | null;
    }>;
    gotcha_patterns?: Array<{
        pattern_id: string;
        pattern_condition?: string;
        risk_level?: string;
        hours_impact?: number;
        description?: string;
        mitigation?: string;
        affected_components?: unknown;
    }>;
    dependency_chains?: Array<{
        chain_id: string;
        predecessor: string;
        successors?: unknown;
        dependency_type?: string;
        reason?: string;
    }>;
    phase_mappings?: Array<{
        phase_id: string;
        phase_name?: string;
        phase_order?: number;
        component_ids?: unknown;
    }>;
    roles?: Array<{
        role_id: string;
        description?: string;
        typical_rate_range?: string;
    }>;
}
export declare function saveHeuristics(db: Database, input: SaveHeuristicsInput): Promise<{
    success: boolean;
    pack_id: string;
}>;
export type HeuristicType = "effort" | "multipliers" | "gotchas" | "chains" | "phases" | "roles";
export declare function getHeuristicsForPacks(db: Database, packIds: string[], type?: HeuristicType): Promise<Record<string, Record<string, unknown[]>>>;
//# sourceMappingURL=knowledge-heuristics.d.ts.map