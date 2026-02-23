import { type Database } from "../connection.js";
export interface SaveCalibrationInput {
    assessment_id: string;
    engagement_name: string;
    estimate_date?: string;
    status?: string;
    phases?: Array<{
        id: string;
        name?: string;
        estimated_hours?: number;
        actual_hours?: number;
        variance_percent?: number;
        variance_direction?: string;
        notes?: string;
    }>;
    components?: Array<{
        id: string;
        estimated_hours?: number;
        actual_hours?: number;
        variance_percent?: number;
        notes?: string;
    }>;
    ai_tools?: Array<{
        id: string;
        name?: string;
        was_used?: boolean;
        estimated_savings_hours?: number;
        actual_savings_hours?: number;
        variance_percent?: number;
        notes?: string;
    }>;
    total_estimated?: unknown;
    total_actual?: number | null;
    surprises?: unknown[];
    smoother?: unknown[];
    suggested_adjustments?: unknown[];
}
export declare function saveCalibration(db: Database, input: SaveCalibrationInput): Promise<{
    success: boolean;
    id: number;
}>;
//# sourceMappingURL=calibrations.d.ts.map