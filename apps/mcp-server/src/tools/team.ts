import { z } from "zod";
import {
  getDb,
  saveTeamSnapshot as dbSaveTeamSnapshot,
  getTeamSnapshot as dbGetTeamSnapshot,
  listTeamVersions as dbListTeamVersions,
  updateTeamRole as dbUpdateTeamRole,
  createTeamRole as dbCreateTeamRole,
  deleteTeamRole as dbDeleteTeamRole,
} from "@migration-planner/db";

// ── Save Team Snapshot ───────────────────────────────────────

export const saveTeamSnapshotSchema = z.object({
  assessment_id: z.string(),
  estimate_version: z.number().default(1),
  assumptions: z.unknown().default({}),
  cost_projection: z.unknown().default({}),
  phase_staffing: z.unknown().default([]),
  hiring_notes: z.unknown().default([]),
  notes: z.string().default(""),
  roles: z.array(z.object({
    role_id: z.string(),
    role_name: z.string().default(""),
    total_hours: z.number().default(0),
    base_hours: z.number().default(0),
    headcount: z.number().default(1),
    allocation: z.string().default("full-time"),
    seniority: z.string().default("mid"),
    rate_min: z.number().default(0),
    rate_max: z.number().default(0),
    rate_override: z.number().nullable().optional(),
    phases: z.unknown().default([]),
    notes: z.string().default(""),
    source: z.string().default("generated"),
    sort_order: z.number().default(0),
  })).default([]),
});

export async function saveTeamSnapshot(input: z.infer<typeof saveTeamSnapshotSchema>) {
  const db = getDb();
  return dbSaveTeamSnapshot(db, input);
}

// ── Get Team Snapshot ────────────────────────────────────────

export const getTeamSnapshotSchema = z.object({
  assessment_id: z.string(),
  version: z.number().optional(),
});

export async function getTeamSnapshot(input: z.infer<typeof getTeamSnapshotSchema>) {
  const db = getDb();
  return dbGetTeamSnapshot(db, input.assessment_id, input.version);
}

// ── List Team Versions ───────────────────────────────────────

export const listTeamVersionsSchema = z.object({
  assessment_id: z.string(),
});

export async function listTeamVersions(input: z.infer<typeof listTeamVersionsSchema>) {
  const db = getDb();
  return dbListTeamVersions(db, input.assessment_id);
}

// ── Update Team Role ─────────────────────────────────────────

export const updateTeamRoleSchema = z.object({
  role_id: z.number(), // DB serial ID
  role_name: z.string().optional(),
  total_hours: z.number().optional(),
  headcount: z.number().optional(),
  allocation: z.string().optional(),
  seniority: z.string().optional(),
  rate_min: z.number().optional(),
  rate_max: z.number().optional(),
  rate_override: z.number().nullable().optional(),
  phases: z.unknown().optional(),
  notes: z.string().optional(),
});

export async function updateTeamRole(input: z.infer<typeof updateTeamRoleSchema>) {
  const db = getDb();
  const { role_id, ...updates } = input;
  return dbUpdateTeamRole(db, role_id, updates);
}

// ── Create Team Role ─────────────────────────────────────────

export const createTeamRoleSchema = z.object({
  snapshot_id: z.number(),
  role_id: z.string(),
  role_name: z.string().default(""),
  total_hours: z.number().default(0),
  base_hours: z.number().default(0),
  headcount: z.number().default(1),
  allocation: z.string().default("full-time"),
  seniority: z.string().default("mid"),
  rate_min: z.number().default(0),
  rate_max: z.number().default(0),
  rate_override: z.number().nullable().optional(),
  phases: z.unknown().default([]),
  notes: z.string().default(""),
  source: z.string().default("custom"),
});

export async function createTeamRole(input: z.infer<typeof createTeamRoleSchema>) {
  const db = getDb();
  const { snapshot_id, ...role } = input;
  return dbCreateTeamRole(db, snapshot_id, role);
}

// ── Delete Team Role ─────────────────────────────────────────

export const deleteTeamRoleSchema = z.object({
  role_id: z.number(), // DB serial ID
});

export async function deleteTeamRole(input: z.infer<typeof deleteTeamRoleSchema>) {
  const db = getDb();
  return dbDeleteTeamRole(db, input.role_id);
}
