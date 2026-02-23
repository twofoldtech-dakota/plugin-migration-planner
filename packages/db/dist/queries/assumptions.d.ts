import { type Database } from "../connection.js";
export interface UpdateAssumptionInput {
    assessment_id: string;
    assumption_id: string;
    validation_status: "validated" | "invalidated";
    actual_value?: string;
}
export declare function updateAssumption(db: Database, input: UpdateAssumptionInput): Promise<{
    success: boolean;
    error: string;
    assumption_id?: undefined;
    new_status?: undefined;
    new_confidence_score?: undefined;
    remaining_widening_hours?: undefined;
} | {
    success: boolean;
    assumption_id: string;
    new_status: "validated" | "invalidated";
    new_confidence_score: number;
    remaining_widening_hours: number;
    error?: undefined;
}>;
//# sourceMappingURL=assumptions.d.ts.map