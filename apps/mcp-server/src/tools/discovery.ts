import { z } from "zod";
import {
  getDb,
  saveDiscovery as dbSaveDiscovery,
  getDiscovery as dbGetDiscovery,
} from "@migration-planner/db";

export const saveDiscoverySchema = z.object({
  assessment_id: z.string(),
  dimension: z.string(),
  status: z.string().default("complete"),
  completed_at: z.string().nullable().default(null),
  answers: z.record(z.string(), z.object({
    value: z.unknown(),
    notes: z.string().default(""),
    confidence: z.string().default("unknown"),
    basis: z.string().nullable().default(null),
  })).default({}),
});

export async function saveDiscovery(input: z.infer<typeof saveDiscoverySchema>) {
  const db = getDb();
  // Map Zod output to db input, ensuring `value` is always present
  const answers: Record<string, { value: unknown; notes?: string; confidence?: string; basis?: string | null }> = {};
  for (const [qid, ans] of Object.entries(input.answers)) {
    answers[qid] = {
      value: ans.value,
      notes: ans.notes,
      confidence: ans.confidence,
      basis: ans.basis,
    };
  }
  return dbSaveDiscovery(db, { ...input, answers });
}

export const getDiscoverySchema = z.object({
  assessment_id: z.string(),
  dimension: z.string().optional(),
});

export async function getDiscovery(input: z.infer<typeof getDiscoverySchema>) {
  const db = getDb();
  return dbGetDiscovery(db, input.assessment_id, input.dimension);
}
