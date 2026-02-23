import { z } from "zod";
import { getDb, updateAssumption as dbUpdateAssumption } from "@migration-planner/db";
export const updateAssumptionSchema = z.object({
    assessment_id: z.string(),
    assumption_id: z.string(),
    validation_status: z.enum(["validated", "invalidated"]),
    actual_value: z.string().optional(),
});
export async function updateAssumption(input) {
    const db = getDb();
    return dbUpdateAssumption(db, input);
}
//# sourceMappingURL=assumption.js.map