import { z } from "zod";
import {
  getDb,
  saveAnalysis as dbSaveAnalysis,
  getAnalysis as dbGetAnalysis,
} from "@migration-planner/db";

export const saveAnalysisSchema = z.object({
  assessment_id: z.string(),
  risks: z.array(z.object({
    id: z.string(),
    category: z.string().default(""),
    description: z.string().default(""),
    likelihood: z.string().default(""),
    impact: z.string().default(""),
    severity: z.string().default(""),
    estimated_hours_impact: z.number().default(0),
    linked_assumptions: z.array(z.string()).default([]),
    mitigation: z.string().default(""),
    contingency: z.string().default(""),
    owner: z.string().default(""),
    status: z.string().default("open"),
  })).default([]),
  active_multipliers: z.array(z.object({
    id: z.string(),
    name: z.string().default(""),
    factor: z.number().default(1.0),
    trigger: z.string().default(""),
    affected_components: z.array(z.string()).default([]),
  })).default([]),
  dependency_chains: z.array(z.object({
    from: z.string(),
    to: z.union([z.string(), z.array(z.string())]),
    type: z.string().default("hard"),
  })).default([]),
  risk_clusters: z.array(z.object({
    name: z.string(),
    risks: z.array(z.string()).default([]),
    assumptions: z.array(z.string()).default([]),
    combined_widening_hours: z.number().default(0),
  })).default([]),
  assumptions: z.array(z.object({
    id: z.string(),
    dimension: z.string().default(""),
    question_id: z.string().nullable().default(null),
    assumed_value: z.string().default(""),
    basis: z.string().default(""),
    confidence: z.string().default("unknown"),
    validation_status: z.string().default("unvalidated"),
    validation_method: z.string().default(""),
    pessimistic_widening_hours: z.number().default(0),
    affected_components: z.array(z.string()).default([]),
  })).default([]),
  gaps: z.object({
    unknown_answers: z.number().default(0),
    assumed_answers: z.number().default(0),
    confirmed_answers: z.number().default(0),
    total_answers: z.number().default(0),
    top_gaps: z.array(z.object({
      dimension: z.string(),
      question: z.string(),
      impact: z.string(),
    })).default([]),
  }).optional(),
});

export async function saveAnalysis(input: z.infer<typeof saveAnalysisSchema>) {
  const db = getDb();
  return dbSaveAnalysis(db, input);
}

export const getAnalysisSchema = z.object({
  assessment_id: z.string(),
});

export async function getAnalysis(input: z.infer<typeof getAnalysisSchema>) {
  const db = getDb();
  return dbGetAnalysis(db, input.assessment_id);
}
