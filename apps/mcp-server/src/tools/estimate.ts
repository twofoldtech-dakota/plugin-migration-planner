import { z } from "zod";
import {
  getDb,
  saveEstimate as dbSaveEstimate,
  getEstimate as dbGetEstimate,
  listEstimateVersions as dbListEstimateVersions,
} from "@migration-planner/db";

export const saveEstimateSchema = z.object({
  assessment_id: z.string(),
  confidence_score: z.number().default(0),
  total_base_hours: z.number().default(0),
  total_gotcha_hours: z.number().default(0),
  total_expected_hours: z.number().default(0),
  assumption_widening_hours: z.number().default(0),
  totals: z.unknown().default({}),
  total_by_role: z.unknown().default({}),
  client_summary: z.unknown().default({}),
  phases: z.array(z.object({
    id: z.string(),
    name: z.string(),
    duration: z.string().optional(),
    components: z.array(z.object({
      id: z.string(),
      name: z.string(),
      units: z.number().default(1),
      base_hours: z.number().default(0),
      multipliers_applied: z.unknown().default([]),
      gotcha_hours: z.number().default(0),
      final_hours: z.number().default(0),
      firm_hours: z.number().default(0),
      assumption_dependent_hours: z.number().default(0),
      assumptions_affecting: z.array(z.string()).default([]),
      hours: z.unknown().default({}),
      ai_alternatives: z.unknown().default([]),
      by_role: z.unknown().default({}),
    })).default([]),
  })).default([]),
});

export async function saveEstimate(input: z.infer<typeof saveEstimateSchema>) {
  const db = getDb();
  return dbSaveEstimate(db, input);
}

export const getEstimateSchema = z.object({
  assessment_id: z.string(),
  version: z.number().optional(),
});

export async function getEstimate(input: z.infer<typeof getEstimateSchema>) {
  const db = getDb();
  return dbGetEstimate(db, input.assessment_id, input.version);
}

export const listEstimateVersionsSchema = z.object({
  assessment_id: z.string(),
});

export async function listEstimateVersions(input: z.infer<typeof listEstimateVersionsSchema>) {
  const db = getDb();
  return dbListEstimateVersions(db, input.assessment_id);
}
