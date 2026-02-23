import { eq } from "drizzle-orm";
import { type Database } from "../connection.js";
import {
  calibrations,
  calibrationPhases,
  calibrationComponents,
  calibrationAiTools,
  assessments,
} from "../schema.js";

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

export async function saveCalibration(db: Database, input: SaveCalibrationInput) {
  const now = new Date().toISOString();

  let calId: number = 0;

  await db.transaction(async (tx) => {
    const inserted = await tx
      .insert(calibrations)
      .values({
        assessment_id: input.assessment_id,
        engagement_name: input.engagement_name,
        estimate_date: input.estimate_date ?? "",
        calibration_date: now,
        status: input.status ?? "in_progress",
        total_estimated: input.total_estimated ?? {},
        total_actual: input.total_actual ?? null,
        surprises: input.surprises ?? [],
        smoother: input.smoother ?? [],
        suggested_adjustments: input.suggested_adjustments ?? [],
        created_at: now,
      })
      .returning({ id: calibrations.id });

    calId = inserted[0].id;

    for (const p of input.phases ?? []) {
      await tx.insert(calibrationPhases).values({
        calibration_id: calId,
        phase_id: p.id,
        phase_name: p.name ?? "",
        estimated_hours: p.estimated_hours ?? 0,
        actual_hours: p.actual_hours ?? 0,
        variance_percent: p.variance_percent ?? 0,
        variance_direction: p.variance_direction ?? "",
        notes: p.notes ?? "",
      });
    }

    for (const c of input.components ?? []) {
      await tx.insert(calibrationComponents).values({
        calibration_id: calId,
        component_id: c.id,
        estimated_hours: c.estimated_hours ?? 0,
        actual_hours: c.actual_hours ?? 0,
        variance_percent: c.variance_percent ?? 0,
        notes: c.notes ?? "",
      });
    }

    for (const t of input.ai_tools ?? []) {
      await tx.insert(calibrationAiTools).values({
        calibration_id: calId,
        tool_id: t.id,
        tool_name: t.name ?? "",
        was_used: t.was_used ?? false,
        estimated_savings_hours: t.estimated_savings_hours ?? 0,
        actual_savings_hours: t.actual_savings_hours ?? 0,
        variance_percent: t.variance_percent ?? 0,
        notes: t.notes ?? "",
      });
    }

    await tx
      .update(assessments)
      .set({ updated_at: now })
      .where(eq(assessments.id, input.assessment_id));
  });

  return { success: true, id: calId };
}
