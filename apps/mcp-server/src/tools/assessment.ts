import { z } from "zod";
import {
  getDb,
  saveAssessment as dbSaveAssessment,
  getAssessmentById,
  getAssessmentByPath,
  listAssessmentsByPath,
  setActiveAssessment as dbSetActiveAssessment,
  getActiveAssessmentId,
  getClientById,
} from "@migration-planner/db";
import { autoImportFromJson } from "../db.js";

export const saveAssessmentSchema = z.object({
  id: z.string(),
  project_name: z.string(),
  client_name: z.string().default(""),
  client_id: z.string().optional(),
  architect: z.string().default(""),
  project_path: z.string().default(""),
  // New generic stack model
  source_stack: z.unknown().default({}),
  target_stack: z.unknown().default({}),
  migration_scope: z.unknown().default({}),
  // Legacy fields (deprecated — kept for backward compatibility)
  sitecore_version: z.string().default(""),
  topology: z.string().default(""),
  source_cloud: z.string().default("aws"),
  target_cloud: z.string().default("azure"),
  target_timeline: z.string().default(""),
  environment_count: z.number().default(1),
  environments: z.array(z.string()).default([]),
  status: z.string().default("discovery"),
});

export async function saveAssessment(input: z.infer<typeof saveAssessmentSchema>) {
  const db = getDb();
  return dbSaveAssessment(db, input);
}

export const getAssessmentSchema = z.object({
  id: z.string().optional(),
  project_path: z.string().optional(),
});

export async function getAssessment(input: z.infer<typeof getAssessmentSchema>) {
  const db = getDb();

  let row = null;

  if (input.id) {
    row = await getAssessmentById(db, input.id);
  } else if (input.project_path) {
    row = await getAssessmentByPath(db, input.project_path);
    if (!row) {
      const imported = await autoImportFromJson(`auto-${Date.now()}`, input.project_path);
      if (imported) {
        row = await getAssessmentByPath(db, input.project_path);
      }
    }
  }

  if (!row) return null;

  // Enrich with multi-assessment metadata
  const allForPath = row.project_path
    ? await listAssessmentsByPath(db, row.project_path)
    : [];
  const activeId = row.project_path
    ? await getActiveAssessmentId(db, row.project_path)
    : null;

  // Enrich with client profile if linked
  let client_profile = null;
  if (row.client_id) {
    client_profile = await getClientById(db, row.client_id);
  }

  return {
    ...row,
    client_profile,
    _meta: {
      total_assessments_for_path: allForPath.length,
      is_active: activeId ? row.id === activeId : allForPath.length <= 1,
    },
  };
}

// ── List all assessments for a project path ──────────────────

export const listAssessmentsSchema = z.object({
  project_path: z.string(),
});

export async function listAssessmentsForPath(input: z.infer<typeof listAssessmentsSchema>) {
  const db = getDb();
  return listAssessmentsByPath(db, input.project_path);
}

// ── Set the active assessment for a project path ─────────────

export const setActiveAssessmentSchema = z.object({
  project_path: z.string(),
  assessment_id: z.string(),
});

export async function setActiveAssessment(input: z.infer<typeof setActiveAssessmentSchema>) {
  const db = getDb();

  // Validate the assessment exists and belongs to this path
  const assessment = await getAssessmentById(db, input.assessment_id);
  if (!assessment) {
    return { success: false, error: `Assessment ${input.assessment_id} not found` };
  }
  if (assessment.project_path !== input.project_path) {
    return {
      success: false,
      error: `Assessment ${input.assessment_id} belongs to a different project path`,
    };
  }

  await dbSetActiveAssessment(db, input.project_path, input.assessment_id);
  return { success: true, active_assessment_id: input.assessment_id };
}
