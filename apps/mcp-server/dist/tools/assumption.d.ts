import { z } from "zod";
export declare const updateAssumptionSchema: z.ZodObject<{
    assessment_id: z.ZodString;
    assumption_id: z.ZodString;
    validation_status: z.ZodEnum<["validated", "invalidated"]>;
    actual_value: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    validation_status: "validated" | "invalidated";
    assessment_id: string;
    assumption_id: string;
    actual_value?: string | undefined;
}, {
    validation_status: "validated" | "invalidated";
    assessment_id: string;
    assumption_id: string;
    actual_value?: string | undefined;
}>;
export declare function updateAssumption(input: z.infer<typeof updateAssumptionSchema>): Promise<{
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
//# sourceMappingURL=assumption.d.ts.map