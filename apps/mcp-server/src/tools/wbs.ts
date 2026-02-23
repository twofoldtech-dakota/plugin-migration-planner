import { z } from "zod";
import {
  getDb,
  saveWBSSnapshot as dbSaveWBSSnapshot,
  getWBSSnapshot as dbGetWBSSnapshot,
  listWBSVersions as dbListWBSVersions,
  updateWorkItem as dbUpdateWorkItem,
  createWorkItem as dbCreateWorkItem,
  deleteWorkItem as dbDeleteWorkItem,
} from "@migration-planner/db";

// ── Save WBS Snapshot ────────────────────────────────────────

export const saveWBSSnapshotSchema = z.object({
  assessment_id: z.string(),
  estimate_version: z.number().default(1),
  items: z.array(z.object({
    temp_id: z.number().optional(),
    parent_temp_id: z.number().nullable().optional(),
    type: z.string().default("story"),
    title: z.string(),
    description: z.string().default(""),
    hours: z.number().default(0),
    base_hours: z.number().default(0),
    role: z.string().nullable().optional(),
    phase_id: z.string().default(""),
    component_id: z.string().default(""),
    labels: z.unknown().default([]),
    acceptance_criteria: z.unknown().default([]),
    priority: z.string().default("medium"),
    confidence: z.string().default("medium"),
    sort_order: z.number().default(0),
    source: z.string().default("generated"),
    blocked_by: z.unknown().default([]),
    blocks: z.unknown().default([]),
  })).default([]),
});

export async function saveWBSSnapshot(input: z.infer<typeof saveWBSSnapshotSchema>) {
  const db = getDb();
  return dbSaveWBSSnapshot(db, input);
}

// ── Get WBS Snapshot ─────────────────────────────────────────

export const getWBSSnapshotSchema = z.object({
  assessment_id: z.string(),
  version: z.number().optional(),
});

export async function getWBSSnapshot(input: z.infer<typeof getWBSSnapshotSchema>) {
  const db = getDb();
  return dbGetWBSSnapshot(db, input.assessment_id, input.version);
}

// ── List WBS Versions ────────────────────────────────────────

export const listWBSVersionsSchema = z.object({
  assessment_id: z.string(),
});

export async function listWBSVersions(input: z.infer<typeof listWBSVersionsSchema>) {
  const db = getDb();
  return dbListWBSVersions(db, input.assessment_id);
}

// ── Update Work Item ─────────────────────────────────────────

export const updateWorkItemSchema = z.object({
  item_id: z.number(),
  title: z.string().optional(),
  type: z.string().optional(),
  description: z.string().optional(),
  hours: z.number().optional(),
  role: z.string().nullable().optional(),
  priority: z.string().optional(),
  confidence: z.string().optional(),
  labels: z.unknown().optional(),
  acceptance_criteria: z.unknown().optional(),
  blocked_by: z.unknown().optional(),
  blocks: z.unknown().optional(),
});

export async function updateWorkItem(input: z.infer<typeof updateWorkItemSchema>) {
  const db = getDb();
  const { item_id, ...updates } = input;
  return dbUpdateWorkItem(db, item_id, updates);
}

// ── Create Work Item ─────────────────────────────────────────

export const createWorkItemSchema = z.object({
  snapshot_id: z.number(),
  parent_id: z.number().nullable().optional(),
  type: z.string().default("story"),
  title: z.string(),
  description: z.string().default(""),
  hours: z.number().default(0),
  base_hours: z.number().default(0),
  role: z.string().nullable().optional(),
  phase_id: z.string().default(""),
  component_id: z.string().default(""),
  labels: z.unknown().default([]),
  acceptance_criteria: z.unknown().default([]),
  priority: z.string().default("medium"),
  confidence: z.string().default("medium"),
  source: z.string().default("custom"),
  blocked_by: z.unknown().default([]),
  blocks: z.unknown().default([]),
});

export async function createWorkItem(input: z.infer<typeof createWorkItemSchema>) {
  const db = getDb();
  const { snapshot_id, ...item } = input;
  return dbCreateWorkItem(db, snapshot_id, item);
}

// ── Delete Work Item ─────────────────────────────────────────

export const deleteWorkItemSchema = z.object({
  item_id: z.number(),
});

export async function deleteWorkItem(input: z.infer<typeof deleteWorkItemSchema>) {
  const db = getDb();
  return dbDeleteWorkItem(db, input.item_id);
}
