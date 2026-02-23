import { z } from "zod";
import { getDb, saveCalibration as dbSaveCalibration } from "@migration-planner/db";
export const saveCalibrationSchema = z.object({
    assessment_id: z.string(),
    engagement_name: z.string(),
    estimate_date: z.string().default(""),
    status: z.string().default("in_progress"),
    phases: z.array(z.object({
        id: z.string(),
        name: z.string().default(""),
        estimated_hours: z.number().default(0),
        actual_hours: z.number().default(0),
        variance_percent: z.number().default(0),
        variance_direction: z.string().default(""),
        notes: z.string().default(""),
    })).default([]),
    components: z.array(z.object({
        id: z.string(),
        estimated_hours: z.number().default(0),
        actual_hours: z.number().default(0),
        variance_percent: z.number().default(0),
        notes: z.string().default(""),
    })).default([]),
    ai_tools: z.array(z.object({
        id: z.string(),
        name: z.string().default(""),
        was_used: z.boolean().default(false),
        estimated_savings_hours: z.number().default(0),
        actual_savings_hours: z.number().default(0),
        variance_percent: z.number().default(0),
        notes: z.string().default(""),
    })).default([]),
    total_estimated: z.unknown().default({}),
    total_actual: z.number().nullable().default(null),
    surprises: z.array(z.unknown()).default([]),
    smoother: z.array(z.unknown()).default([]),
    suggested_adjustments: z.array(z.unknown()).default([]),
});
export async function saveCalibration(input) {
    const db = getDb();
    return dbSaveCalibration(db, input);
}
//# sourceMappingURL=calibration.js.map