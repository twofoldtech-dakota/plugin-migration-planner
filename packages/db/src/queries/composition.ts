/**
 * Discovery Tree & Heuristics Composition Engine.
 *
 * Resolves all knowledge packs for an assessment, then merges their
 * discovery trees and heuristics into single, deduplicated result sets.
 * Higher-priority packs (lower tier number) win on ID conflicts.
 */

import { type Database } from "../connection.js";
import { getAssessmentById } from "./assessments.js";
import { getPinnedKnowledge } from "./knowledge-pins.js";
import { getDiscoveryTree } from "./knowledge-discovery.js";
import { getHeuristicsForPacks, type HeuristicType } from "./knowledge-heuristics.js";
import { getMigrationPath } from "./migration-paths.js";

// ── Types ──────────────────────────────────────────────────────

export interface ResolvedPacks {
  packIds: string[];
  migrationPathId: string | null;
  packPriority: Record<string, number>;
  pinnedVersions: Record<string, number>;
}

export interface ComposedDimension {
  id: string;
  name: string;
  order: number;
  description: string;
  source_packs: string[];
  required_questions: any[];
  conditional_questions: any[];
  inference_rules: any[];
}

export interface ComposedDiscoveryTree {
  dimensions: ComposedDimension[];
  packs_used: Array<{ pack_id: string; version: number }>;
  migration_path_id?: string;
}

export interface ComposedHeuristics {
  effort_hours: Array<Record<string, unknown> & { source_pack_id: string }>;
  multipliers: Array<Record<string, unknown> & { source_pack_id: string }>;
  gotcha_patterns: Array<Record<string, unknown> & { source_pack_id: string }>;
  dependency_chains: Array<Record<string, unknown> & { source_pack_id: string }>;
  phase_mappings: Array<Record<string, unknown> & { source_pack_id: string }>;
  roles: Array<Record<string, unknown> & { source_pack_id: string }>;
  packs_used: Array<{ pack_id: string; version: number }>;
  migration_path_id?: string;
}

// ── Priority tiers ─────────────────────────────────────────────

const PRIORITY_INFRASTRUCTURE = 10;
const PRIORITY_PLATFORM = 20;
const PRIORITY_SERVICE = 30;

// ── 1a. resolvePackIds ─────────────────────────────────────────

export async function resolvePackIds(
  db: Database,
  assessmentId: string
): Promise<ResolvedPacks> {
  const assessment = await getAssessmentById(db, assessmentId);
  if (!assessment) {
    throw new Error(`Assessment not found: ${assessmentId}`);
  }

  const packIds = new Set<string>();
  const packPriority: Record<string, number> = {};

  // Parse source_stack and target_stack (JSONB fields)
  const sourceStack = (assessment.source_stack ?? {}) as Record<string, any>;
  const targetStack = (assessment.target_stack ?? {}) as Record<string, any>;

  function addPack(id: string | undefined | null, priority: number) {
    if (id && typeof id === "string" && id.trim()) {
      const trimmed = id.trim();
      packIds.add(trimmed);
      // Keep the highest priority (lowest number) if already set
      if (!(trimmed in packPriority) || priority < packPriority[trimmed]) {
        packPriority[trimmed] = priority;
      }
    }
  }

  // Extract pack IDs from stacks
  addPack(sourceStack.infrastructure, PRIORITY_INFRASTRUCTURE);
  addPack(targetStack.infrastructure, PRIORITY_INFRASTRUCTURE);
  addPack(sourceStack.platform, PRIORITY_PLATFORM);
  addPack(targetStack.platform, PRIORITY_PLATFORM);

  // Services arrays
  if (Array.isArray(sourceStack.services)) {
    for (const s of sourceStack.services) {
      addPack(typeof s === "string" ? s : s?.id, PRIORITY_SERVICE);
    }
  }
  if (Array.isArray(targetStack.services)) {
    for (const s of targetStack.services) {
      addPack(typeof s === "string" ? s : s?.id, PRIORITY_SERVICE);
    }
  }

  // ── Backward compatibility: derive from legacy fields ──
  if (packIds.size === 0) {
    // No source_stack data — fall back to legacy fields
    if (assessment.sitecore_version) {
      addPack("sitecore-xp", PRIORITY_PLATFORM);
    }
    const srcCloud = assessment.source_cloud;
    if (srcCloud && typeof srcCloud === "string" && srcCloud.trim()) {
      addPack(srcCloud.trim(), PRIORITY_INFRASTRUCTURE);
    }
    const tgtCloud = assessment.target_cloud;
    if (tgtCloud && typeof tgtCloud === "string" && tgtCloud.trim()) {
      addPack(tgtCloud.trim(), PRIORITY_INFRASTRUCTURE);
    }
  }

  // Check for pinned versions
  const pinnedVersions: Record<string, number> = {};
  const pins = await getPinnedKnowledge(db, assessmentId);
  for (const pin of pins) {
    if (pin.pinned_version != null) {
      pinnedVersions[pin.pack_id] = pin.pinned_version;
    }
  }

  // Resolve migration path(s) for applicable source→target pairs
  let migrationPathId: string | null = null;

  // Try platform source → infrastructure target (most common: e.g., sitecore-xp on aws → azure)
  const sourcePlatform = sourceStack.platform;
  const sourceInfra = sourceStack.infrastructure;
  const targetInfra = targetStack.infrastructure;

  if (sourceInfra && targetInfra && sourceInfra !== targetInfra) {
    const path = await getMigrationPath(db, {
      source_pack_id: sourceInfra,
      target_pack_id: targetInfra,
    });
    if (path) migrationPathId = path.id;
  }

  // Also try platform-level path if no infra path found
  if (!migrationPathId && sourcePlatform && targetStack.platform && sourcePlatform !== targetStack.platform) {
    const path = await getMigrationPath(db, {
      source_pack_id: sourcePlatform,
      target_pack_id: targetStack.platform,
    });
    if (path) migrationPathId = path.id;
  }

  // Try composite path ID pattern (e.g., "sitecore-xp-aws->azure")
  if (!migrationPathId && sourcePlatform && sourceInfra && targetInfra) {
    const compositeId = `${sourcePlatform}-${sourceInfra}->${targetInfra}`;
    const path = await getMigrationPath(db, { id: compositeId });
    if (path) migrationPathId = path.id;
  }

  return {
    packIds: Array.from(packIds),
    migrationPathId,
    packPriority,
    pinnedVersions,
  };
}

// ── 1b. composeDiscoveryTree ───────────────────────────────────

export async function composeDiscoveryTree(
  db: Database,
  assessmentId: string
): Promise<ComposedDiscoveryTree> {
  const resolved = await resolvePackIds(db, assessmentId);

  if (resolved.packIds.length === 0) {
    return { dimensions: [], packs_used: [], migration_path_id: resolved.migrationPathId ?? undefined };
  }

  // Fetch raw per-pack dimensions
  const raw = await getDiscoveryTree(db, resolved.packIds);

  // Sort packs by priority (lowest number = highest priority = processed first)
  const sortedPacks = [...raw.packs].sort((a, b) => {
    const pa = resolved.packPriority[a.pack_id] ?? 99;
    const pb = resolved.packPriority[b.pack_id] ?? 99;
    return pa - pb;
  });

  // Merge by dimension ID
  const dimMap = new Map<string, ComposedDimension>();

  for (const pack of sortedPacks) {
    const dims = pack.dimensions;
    if (!Array.isArray(dims)) continue;

    for (const dim of dims) {
      const dimId = dim.id ?? dim.dimension_id ?? dim.name;
      if (!dimId) continue;

      const existing = dimMap.get(dimId);
      if (existing) {
        // Merge questions by ID — first-seen (higher priority) wins
        mergeQuestions(existing.required_questions, dim.required_questions ?? dim.questions ?? []);
        mergeQuestions(existing.conditional_questions, dim.conditional_questions ?? []);
        mergeInferenceRules(existing.inference_rules, dim.inference_rules ?? []);
        if (!existing.source_packs.includes(pack.pack_id)) {
          existing.source_packs.push(pack.pack_id);
        }
      } else {
        dimMap.set(dimId, {
          id: dimId,
          name: dim.name ?? dimId,
          order: dim.order ?? 0,
          description: dim.description ?? "",
          source_packs: [pack.pack_id],
          required_questions: [...(dim.required_questions ?? dim.questions ?? [])],
          conditional_questions: [...(dim.conditional_questions ?? [])],
          inference_rules: [...(dim.inference_rules ?? [])],
        });
      }
    }
  }

  // Sort dimensions by order, then by priority tier of source pack
  const dimensions = Array.from(dimMap.values()).sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    const pa = Math.min(...a.source_packs.map((p) => resolved.packPriority[p] ?? 99));
    const pb = Math.min(...b.source_packs.map((p) => resolved.packPriority[p] ?? 99));
    return pa - pb;
  });

  return {
    dimensions,
    packs_used: raw.packs.map((p) => ({ pack_id: p.pack_id, version: p.version })),
    migration_path_id: resolved.migrationPathId ?? undefined,
  };
}

// ── 1c. composeHeuristics ──────────────────────────────────────

export async function composeHeuristics(
  db: Database,
  assessmentId: string,
  type?: HeuristicType
): Promise<ComposedHeuristics> {
  const resolved = await resolvePackIds(db, assessmentId);

  const emptyResult: ComposedHeuristics = {
    effort_hours: [],
    multipliers: [],
    gotcha_patterns: [],
    dependency_chains: [],
    phase_mappings: [],
    roles: [],
    packs_used: [],
    migration_path_id: resolved.migrationPathId ?? undefined,
  };

  if (resolved.packIds.length === 0) {
    return emptyResult;
  }

  // Fetch raw per-pack heuristics
  const raw = await getHeuristicsForPacks(db, resolved.packIds, type);

  // Sort pack IDs by priority
  const sortedPackIds = [...resolved.packIds].sort(
    (a, b) => (resolved.packPriority[a] ?? 99) - (resolved.packPriority[b] ?? 99)
  );

  // Flatten and merge
  const effortHours: Array<Record<string, unknown> & { source_pack_id: string }> = [];
  const multipliersSeen = new Map<string, true>();
  const multipliers: Array<Record<string, unknown> & { source_pack_id: string }> = [];
  const gotchaSeen = new Map<string, true>();
  const gotchaPatterns: Array<Record<string, unknown> & { source_pack_id: string }> = [];
  const chainsSeen = new Map<string, Record<string, unknown> & { source_pack_id: string }>();
  const phasesSeen = new Map<string, Record<string, unknown> & { source_pack_id: string }>();
  const rolesSeen = new Map<string, true>();
  const roles: Array<Record<string, unknown> & { source_pack_id: string }> = [];

  for (const packId of sortedPackIds) {
    const packData = raw[packId];
    if (!packData) continue;

    // Effort hours: additive (keep both — they represent different layers)
    if (packData.effort_hours) {
      for (const row of packData.effort_hours as any[]) {
        effortHours.push({ ...row, source_pack_id: packId });
      }
    }

    // Multipliers: dedup by multiplier_id, higher-priority pack wins
    if (packData.multipliers) {
      for (const row of packData.multipliers as any[]) {
        const mid = row.multiplier_id;
        if (mid && !multipliersSeen.has(mid)) {
          multipliersSeen.set(mid, true);
          multipliers.push({ ...row, source_pack_id: packId });
        }
      }
    }

    // Gotcha patterns: dedup by pattern_id, higher-priority pack wins
    if (packData.gotcha_patterns) {
      for (const row of packData.gotcha_patterns as any[]) {
        const pid = row.pattern_id;
        if (pid && !gotchaSeen.has(pid)) {
          gotchaSeen.set(pid, true);
          gotchaPatterns.push({ ...row, source_pack_id: packId });
        }
      }
    }

    // Dependency chains: dedup by chain_id, merge successors arrays
    if (packData.dependency_chains) {
      for (const row of packData.dependency_chains as any[]) {
        const cid = row.chain_id;
        if (!cid) continue;
        const existing = chainsSeen.get(cid);
        if (existing) {
          // Merge successors
          const existingSucc = Array.isArray(existing.successors) ? existing.successors : [];
          const newSucc = Array.isArray(row.successors) ? row.successors : [];
          const merged = [...new Set([...existingSucc, ...newSucc])];
          existing.successors = merged;
        } else {
          const entry = { ...row, source_pack_id: packId };
          chainsSeen.set(cid, entry);
        }
      }
    }

    // Phase mappings: merge by phase_id, union component_ids
    if (packData.phase_mappings) {
      for (const row of packData.phase_mappings as any[]) {
        const pid = row.phase_id;
        if (!pid) continue;
        const existing = phasesSeen.get(pid);
        if (existing) {
          const existingIds = Array.isArray(existing.component_ids) ? existing.component_ids as string[] : [];
          const newIds = Array.isArray(row.component_ids) ? row.component_ids as string[] : [];
          existing.component_ids = [...new Set([...existingIds, ...newIds])];
        } else {
          phasesSeen.set(pid, { ...row, source_pack_id: packId });
        }
      }
    }

    // Roles: dedup by role_id, longer description wins
    if (packData.roles) {
      for (const row of packData.roles as any[]) {
        const rid = row.role_id;
        if (!rid) continue;
        if (!rolesSeen.has(rid)) {
          rolesSeen.set(rid, true);
          roles.push({ ...row, source_pack_id: packId });
        } else {
          // Check if this pack has a longer description
          const existingIdx = roles.findIndex((r) => r.role_id === rid);
          if (existingIdx >= 0) {
            const existingDesc = String(roles[existingIdx].description ?? "");
            const newDesc = String(row.description ?? "");
            if (newDesc.length > existingDesc.length) {
              roles[existingIdx] = { ...row, source_pack_id: packId };
            }
          }
        }
      }
    }
  }

  const dependencyChains = Array.from(chainsSeen.values());
  const phaseMappings = Array.from(phasesSeen.values());

  // Path overlay: append path-specific gotchas and effort adjustments
  if (resolved.migrationPathId) {
    const path = await getMigrationPath(db, { id: resolved.migrationPathId });
    if (path) {
      // Path gotcha patterns
      const pathGotchas = path.path_gotcha_patterns;
      if (Array.isArray(pathGotchas)) {
        for (const pg of pathGotchas) {
          const pid = pg.pattern_id ?? `path_${pg.id ?? gotchaPatterns.length}`;
          if (!gotchaSeen.has(pid)) {
            gotchaSeen.set(pid, true);
            gotchaPatterns.push({ ...pg, pattern_id: pid, source_pack_id: `path:${resolved.migrationPathId}` });
          }
        }
      }

      // Path effort adjustments
      const pathAdjustments = path.path_effort_adjustments;
      if (Array.isArray(pathAdjustments)) {
        for (const adj of pathAdjustments) {
          effortHours.push({ ...adj, source_pack_id: `path:${resolved.migrationPathId}` });
        }
      }
    }
  }

  // Build packs_used from raw data versions
  const packsUsed: Array<{ pack_id: string; version: number }> = resolved.packIds.map((pid) => ({
    pack_id: pid,
    version: resolved.pinnedVersions[pid] ?? 1,
  }));

  return {
    effort_hours: effortHours,
    multipliers,
    gotcha_patterns: gotchaPatterns,
    dependency_chains: dependencyChains,
    phase_mappings: phaseMappings,
    roles,
    packs_used: packsUsed,
    migration_path_id: resolved.migrationPathId ?? undefined,
  };
}

// ── Helpers ────────────────────────────────────────────────────

function mergeQuestions(target: any[], source: any[]) {
  if (!Array.isArray(source)) return;
  const existingIds = new Set(target.map((q) => q.id ?? q.question_id));
  for (const q of source) {
    const qId = q.id ?? q.question_id;
    if (qId && !existingIds.has(qId)) {
      target.push(q);
      existingIds.add(qId);
    }
  }
}

function mergeInferenceRules(target: any[], source: any[]) {
  if (!Array.isArray(source)) return;
  const existingIds = new Set(target.map((r) => r.id ?? r.rule_id));
  for (const r of source) {
    const rId = r.id ?? r.rule_id;
    if (rId && !existingIds.has(rId)) {
      target.push(r);
      existingIds.add(rId);
    }
  }
}
