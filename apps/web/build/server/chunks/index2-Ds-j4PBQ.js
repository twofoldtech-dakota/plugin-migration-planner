import { M as or, $ as isNull, n as knowledgeSourceUrls, a0 as lt, t as eq, x as and, k as knowledgePacks, a1 as assessmentKnowledgePins, L as knowledgePackVersions, f as calibrations, g as calibrationPhases, h as calibrationComponents, i as calibrationAiTools, j as assessments } from './db-BWpbog7L.js';
export { m as activeMultipliers, V as aiSelections, p as analyticsEvents, a as assumptions, c as challengeReviews, K as clientProficiencies, I as clients, a2 as closeDb, W as deliverables, y as dependencyChains, v as discoveryAnswers, u as discoveryDimensions, l as estimateComponents, e as estimateSnapshots, a3 as getDb, o as knowledgeAiAlternatives, Q as knowledgeDependencyChains, T as knowledgeDiscoveryTrees, N as knowledgeEffortHours, P as knowledgeGotchaPatterns, O as knowledgeMultipliers, R as knowledgePhaseMappings, a4 as knowledgeProficiencyCatalog, S as knowledgeRoles, U as migrationPaths, z as riskClusters, r as risks, A as scopeExclusions, _ as teamRoles, Z as teamSnapshots, X as wbsSnapshots, Y as workItems, w as workspaceState } from './db-BWpbog7L.js';
import { g as getAssessmentById } from './assessments-DKcL9-FM.js';
export { c as clearActiveAssessment, a as getActiveAssessmentId, b as getAssessmentByPath, l as listAssessments, d as listAssessmentsByPath, s as saveAssessment, e as setActiveAssessment } from './assessments-DKcL9-FM.js';
export { g as getDiscovery, s as saveDiscovery } from './discovery-ZQezVmz4.js';
export { g as getAnalysis, s as saveAnalysis } from './analysis-BcZv0btd.js';
export { g as getEstimate, l as listEstimateVersions, s as saveEstimate } from './estimates-zTf3XwgF.js';
export { u as updateAssumption } from './assumptions-Czeu5zeL.js';
export { g as getAiSelections, s as saveAiSelections } from './ai-selections-81CCgTAS.js';
export { g as getScopeExclusions, s as saveScopeExclusions } from './scope-exclusions-7kg0wvsO.js';
export { a as queryConfidenceTimeline, q as queryProjects } from './analytics-BZLNJxd8.js';
export { g as getDeliverables, u as upsertDeliverable } from './deliverables-Bw2E3Qk7.js';
export { c as createWorkItem, d as deleteWorkItem, g as getWBSSnapshot, l as listWBSVersions, r as reorderWorkItems, s as saveWBSSnapshot, u as updateWorkItem } from './wbs-_BnBrxIn.js';
export { c as createTeamRole, d as deleteTeamRole, g as getTeamSnapshot, l as listTeamVersions, s as saveTeamSnapshot, u as updateTeamRole } from './team-Utu5T08G.js';
export { d as deleteClient, a as getClientById, g as getProficiencies, l as listClients, s as saveClient, b as saveProficiencies } from './clients-DrQYkYt7.js';
export { g as getChallengeReviewSummary, a as getChallengeReviews, b as getLatestChallengeReview, s as saveChallengeReview } from './challenge-reviews-NXl75WQY.js';
export { d as deleteKnowledgePack, a as getKnowledgePackById, g as getKnowledgePackFull, l as listKnowledgePacks, s as saveKnowledgePack } from './knowledge-packs-PreH8nWI.js';
import { g as getHeuristicsForPacks } from './knowledge-heuristics-BHO3IhyP.js';
export { s as saveHeuristics } from './knowledge-heuristics-BHO3IhyP.js';
import { g as getDiscoveryTree } from './knowledge-discovery-C61edzvf.js';
export { s as saveDiscoveryTree } from './knowledge-discovery-C61edzvf.js';
import { g as getMigrationPath } from './migration-paths-Cv3IGt0S.js';
export { l as listMigrationPaths, s as saveMigrationPath } from './migration-paths-Cv3IGt0S.js';
export { e as getMostEngagedAssessments, g as getPageViewCount, b as getPageViewsOverTime, a as getSessionCount, d as getTopFeatures, c as getTopPages, i as insertAnalyticsEvents } from './analytics-events-C4J_4XK6.js';
import { m as max } from './aggregate-B2GxRiPZ.js';
import 'events';
import 'util';
import 'crypto';
import 'dns';
import 'fs';
import 'net';
import 'tls';
import 'path';
import 'stream';
import 'string_decoder';
import './shared-server-DaWdgxVh.js';

async function saveCalibration(db, input) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  let calId = 0;
  await db.transaction(async (tx) => {
    const inserted = await tx.insert(calibrations).values({
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
      created_at: now
    }).returning({ id: calibrations.id });
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
        notes: p.notes ?? ""
      });
    }
    for (const c6 of input.components ?? []) {
      await tx.insert(calibrationComponents).values({
        calibration_id: calId,
        component_id: c6.id,
        estimated_hours: c6.estimated_hours ?? 0,
        actual_hours: c6.actual_hours ?? 0,
        variance_percent: c6.variance_percent ?? 0,
        notes: c6.notes ?? ""
      });
    }
    for (const t2 of input.ai_tools ?? []) {
      await tx.insert(calibrationAiTools).values({
        calibration_id: calId,
        tool_id: t2.id,
        tool_name: t2.name ?? "",
        was_used: t2.was_used ?? false,
        estimated_savings_hours: t2.estimated_savings_hours ?? 0,
        actual_savings_hours: t2.actual_savings_hours ?? 0,
        variance_percent: t2.variance_percent ?? 0,
        notes: t2.notes ?? ""
      });
    }
    await tx.update(assessments).set({ updated_at: now }).where(eq(assessments.id, input.assessment_id));
  });
  return { success: true, id: calId };
}
async function saveSourceUrls(db, input) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  for (const url of input.urls) {
    await db.insert(knowledgeSourceUrls).values({
      pack_id: input.pack_id ?? null,
      migration_path_id: input.migration_path_id ?? null,
      source_url: url.source_url,
      title: url.title ?? "",
      source_type: url.source_type ?? "vendor-docs",
      accessed_at: now,
      claims: url.claims ?? [],
      confidence: url.confidence ?? "medium",
      still_accessible: url.still_accessible ?? true
    });
  }
  return { success: true, count: input.urls.length };
}
async function getSourceUrls(db, input) {
  if (input.pack_id) {
    return db.select().from(knowledgeSourceUrls).where(eq(knowledgeSourceUrls.pack_id, input.pack_id));
  }
  if (input.migration_path_id) {
    return db.select().from(knowledgeSourceUrls).where(eq(knowledgeSourceUrls.migration_path_id, input.migration_path_id));
  }
  return [];
}
async function checkUrlFreshness(db, input = {}) {
  const thresholdDays = input.stale_threshold_days ?? 7;
  const timeoutMs = input.timeout_ms ?? 1e4;
  const cutoff = new Date(Date.now() - thresholdDays * 864e5).toISOString();
  const conditions = [
    or(lt(knowledgeSourceUrls.accessed_at, cutoff), isNull(knowledgeSourceUrls.accessed_at))
  ];
  if (input.pack_id) {
    conditions.push(eq(knowledgeSourceUrls.pack_id, input.pack_id));
  }
  if (input.migration_path_id) {
    conditions.push(eq(knowledgeSourceUrls.migration_path_id, input.migration_path_id));
  }
  const rows = await db.select({ id: knowledgeSourceUrls.id, source_url: knowledgeSourceUrls.source_url }).from(knowledgeSourceUrls).where(and(...conditions));
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const errors = [];
  let accessible = 0;
  let inaccessible = 0;
  for (let i3 = 0; i3 < rows.length; i3 += 5) {
    const batch = rows.slice(i3, i3 + 5);
    const results = await Promise.allSettled(batch.map(async (row) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        let response = await fetch(row.source_url, {
          method: "HEAD",
          signal: controller.signal,
          redirect: "follow"
        });
        if (response.status === 405 || response.status === 403) {
          response = await fetch(row.source_url, {
            method: "GET",
            signal: controller.signal,
            redirect: "follow"
          });
        }
        const ok = response.status >= 200 && response.status < 400;
        return { id: row.id, url: row.source_url, ok, status: response.status };
      } catch (err) {
        return {
          id: row.id,
          url: row.source_url,
          ok: false,
          status: null,
          error: err.name === "AbortError" ? "timeout" : err.message ?? "unknown"
        };
      } finally {
        clearTimeout(timer);
      }
    }));
    for (const result of results) {
      if (result.status === "rejected")
        continue;
      const { id, url, ok, status } = result.value;
      const errorMsg = "error" in result.value ? result.value.error : void 0;
      await db.update(knowledgeSourceUrls).set({ still_accessible: ok, accessed_at: now }).where(eq(knowledgeSourceUrls.id, id));
      if (ok) {
        accessible++;
      } else {
        inaccessible++;
        errors.push({ id, url, status, error: errorMsg ?? `HTTP ${status}` });
      }
    }
  }
  return {
    total_checked: rows.length,
    still_accessible: accessible,
    now_inaccessible: inaccessible,
    errors
  };
}
async function pinKnowledgeVersion(db, input) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const pins = [];
  for (const packId of input.pack_ids) {
    const maxVersionRows = await db.select({ v: max(knowledgePackVersions.version) }).from(knowledgePackVersions).where(eq(knowledgePackVersions.pack_id, packId));
    const latestVersion = maxVersionRows[0]?.v ?? 1;
    await db.insert(assessmentKnowledgePins).values({
      assessment_id: input.assessment_id,
      pack_id: packId,
      pinned_version: latestVersion,
      pinned_at: now
    }).onConflictDoUpdate({
      target: [assessmentKnowledgePins.assessment_id, assessmentKnowledgePins.pack_id],
      set: {
        pinned_version: latestVersion,
        pinned_at: now
      }
    });
    pins.push({ pack_id: packId, pinned_version: latestVersion });
  }
  return { success: true, pins };
}
async function getPinnedKnowledge(db, assessmentId) {
  const rows = await db.select({
    assessment_id: assessmentKnowledgePins.assessment_id,
    pack_id: assessmentKnowledgePins.pack_id,
    pinned_version: assessmentKnowledgePins.pinned_version,
    pinned_at: assessmentKnowledgePins.pinned_at,
    pack_name: knowledgePacks.name,
    pack_category: knowledgePacks.category
  }).from(assessmentKnowledgePins).innerJoin(knowledgePacks, eq(assessmentKnowledgePins.pack_id, knowledgePacks.id)).where(eq(assessmentKnowledgePins.assessment_id, assessmentId));
  return rows;
}
const PRIORITY_INFRASTRUCTURE = 10;
const PRIORITY_PLATFORM = 20;
const PRIORITY_SERVICE = 30;
async function resolvePackIds(db, assessmentId) {
  const assessment = await getAssessmentById(db, assessmentId);
  if (!assessment) {
    throw new Error(`Assessment not found: ${assessmentId}`);
  }
  const packIds = /* @__PURE__ */ new Set();
  const packPriority = {};
  const sourceStack = assessment.source_stack ?? {};
  const targetStack = assessment.target_stack ?? {};
  function addPack(id, priority) {
    if (id && typeof id === "string" && id.trim()) {
      const trimmed = id.trim();
      packIds.add(trimmed);
      if (!(trimmed in packPriority) || priority < packPriority[trimmed]) {
        packPriority[trimmed] = priority;
      }
    }
  }
  addPack(sourceStack.infrastructure, PRIORITY_INFRASTRUCTURE);
  addPack(targetStack.infrastructure, PRIORITY_INFRASTRUCTURE);
  addPack(sourceStack.platform, PRIORITY_PLATFORM);
  addPack(targetStack.platform, PRIORITY_PLATFORM);
  if (Array.isArray(sourceStack.services)) {
    for (const s16 of sourceStack.services) {
      addPack(typeof s16 === "string" ? s16 : s16?.id, PRIORITY_SERVICE);
    }
  }
  if (Array.isArray(targetStack.services)) {
    for (const s16 of targetStack.services) {
      addPack(typeof s16 === "string" ? s16 : s16?.id, PRIORITY_SERVICE);
    }
  }
  if (packIds.size === 0) {
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
  const pinnedVersions = {};
  const pins = await getPinnedKnowledge(db, assessmentId);
  for (const pin of pins) {
    if (pin.pinned_version != null) {
      pinnedVersions[pin.pack_id] = pin.pinned_version;
    }
  }
  let migrationPathId = null;
  const sourcePlatform = sourceStack.platform;
  const sourceInfra = sourceStack.infrastructure;
  const targetInfra = targetStack.infrastructure;
  if (sourceInfra && targetInfra && sourceInfra !== targetInfra) {
    const path = await getMigrationPath(db, {
      source_pack_id: sourceInfra,
      target_pack_id: targetInfra
    });
    if (path)
      migrationPathId = path.id;
  }
  if (!migrationPathId && sourcePlatform && targetStack.platform && sourcePlatform !== targetStack.platform) {
    const path = await getMigrationPath(db, {
      source_pack_id: sourcePlatform,
      target_pack_id: targetStack.platform
    });
    if (path)
      migrationPathId = path.id;
  }
  if (!migrationPathId && sourcePlatform && sourceInfra && targetInfra) {
    const compositeId = `${sourcePlatform}-${sourceInfra}->${targetInfra}`;
    const path = await getMigrationPath(db, { id: compositeId });
    if (path)
      migrationPathId = path.id;
  }
  return {
    packIds: Array.from(packIds),
    migrationPathId,
    packPriority,
    pinnedVersions
  };
}
async function composeDiscoveryTree(db, assessmentId) {
  const resolved = await resolvePackIds(db, assessmentId);
  if (resolved.packIds.length === 0) {
    return { dimensions: [], packs_used: [], migration_path_id: resolved.migrationPathId ?? void 0 };
  }
  const raw = await getDiscoveryTree(db, resolved.packIds);
  const sortedPacks = [...raw.packs].sort((a8, b5) => {
    const pa = resolved.packPriority[a8.pack_id] ?? 99;
    const pb = resolved.packPriority[b5.pack_id] ?? 99;
    return pa - pb;
  });
  const dimMap = /* @__PURE__ */ new Map();
  for (const pack of sortedPacks) {
    const dims = pack.dimensions;
    if (!Array.isArray(dims))
      continue;
    for (const dim of dims) {
      const dimId = dim.id ?? dim.dimension_id ?? dim.name;
      if (!dimId)
        continue;
      const existing = dimMap.get(dimId);
      if (existing) {
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
          required_questions: [...dim.required_questions ?? dim.questions ?? []],
          conditional_questions: [...dim.conditional_questions ?? []],
          inference_rules: [...dim.inference_rules ?? []]
        });
      }
    }
  }
  const dimensions = Array.from(dimMap.values()).sort((a8, b5) => {
    if (a8.order !== b5.order)
      return a8.order - b5.order;
    const pa = Math.min(...a8.source_packs.map((p) => resolved.packPriority[p] ?? 99));
    const pb = Math.min(...b5.source_packs.map((p) => resolved.packPriority[p] ?? 99));
    return pa - pb;
  });
  return {
    dimensions,
    packs_used: raw.packs.map((p) => ({ pack_id: p.pack_id, version: p.version })),
    migration_path_id: resolved.migrationPathId ?? void 0
  };
}
async function composeHeuristics(db, assessmentId, type) {
  const resolved = await resolvePackIds(db, assessmentId);
  const emptyResult = {
    effort_hours: [],
    multipliers: [],
    gotcha_patterns: [],
    dependency_chains: [],
    phase_mappings: [],
    roles: [],
    packs_used: [],
    migration_path_id: resolved.migrationPathId ?? void 0
  };
  if (resolved.packIds.length === 0) {
    return emptyResult;
  }
  const raw = await getHeuristicsForPacks(db, resolved.packIds, type);
  const sortedPackIds = [...resolved.packIds].sort((a8, b5) => (resolved.packPriority[a8] ?? 99) - (resolved.packPriority[b5] ?? 99));
  const effortHours = [];
  const multipliersSeen = /* @__PURE__ */ new Map();
  const multipliers = [];
  const gotchaSeen = /* @__PURE__ */ new Map();
  const gotchaPatterns = [];
  const chainsSeen = /* @__PURE__ */ new Map();
  const phasesSeen = /* @__PURE__ */ new Map();
  const rolesSeen = /* @__PURE__ */ new Map();
  const roles = [];
  for (const packId of sortedPackIds) {
    const packData = raw[packId];
    if (!packData)
      continue;
    if (packData.effort_hours) {
      for (const row of packData.effort_hours) {
        effortHours.push({ ...row, source_pack_id: packId });
      }
    }
    if (packData.multipliers) {
      for (const row of packData.multipliers) {
        const mid = row.multiplier_id;
        if (mid && !multipliersSeen.has(mid)) {
          multipliersSeen.set(mid, true);
          multipliers.push({ ...row, source_pack_id: packId });
        }
      }
    }
    if (packData.gotcha_patterns) {
      for (const row of packData.gotcha_patterns) {
        const pid = row.pattern_id;
        if (pid && !gotchaSeen.has(pid)) {
          gotchaSeen.set(pid, true);
          gotchaPatterns.push({ ...row, source_pack_id: packId });
        }
      }
    }
    if (packData.dependency_chains) {
      for (const row of packData.dependency_chains) {
        const cid = row.chain_id;
        if (!cid)
          continue;
        const existing = chainsSeen.get(cid);
        if (existing) {
          const existingSucc = Array.isArray(existing.successors) ? existing.successors : [];
          const newSucc = Array.isArray(row.successors) ? row.successors : [];
          const merged = [.../* @__PURE__ */ new Set([...existingSucc, ...newSucc])];
          existing.successors = merged;
        } else {
          const entry = { ...row, source_pack_id: packId };
          chainsSeen.set(cid, entry);
        }
      }
    }
    if (packData.phase_mappings) {
      for (const row of packData.phase_mappings) {
        const pid = row.phase_id;
        if (!pid)
          continue;
        const existing = phasesSeen.get(pid);
        if (existing) {
          const existingIds = Array.isArray(existing.component_ids) ? existing.component_ids : [];
          const newIds = Array.isArray(row.component_ids) ? row.component_ids : [];
          existing.component_ids = [.../* @__PURE__ */ new Set([...existingIds, ...newIds])];
        } else {
          phasesSeen.set(pid, { ...row, source_pack_id: packId });
        }
      }
    }
    if (packData.roles) {
      for (const row of packData.roles) {
        const rid = row.role_id;
        if (!rid)
          continue;
        if (!rolesSeen.has(rid)) {
          rolesSeen.set(rid, true);
          roles.push({ ...row, source_pack_id: packId });
        } else {
          const existingIdx = roles.findIndex((r3) => r3.role_id === rid);
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
  if (resolved.migrationPathId) {
    const path = await getMigrationPath(db, { id: resolved.migrationPathId });
    if (path) {
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
      const pathAdjustments = path.path_effort_adjustments;
      if (Array.isArray(pathAdjustments)) {
        for (const adj of pathAdjustments) {
          effortHours.push({ ...adj, source_pack_id: `path:${resolved.migrationPathId}` });
        }
      }
    }
  }
  const packsUsed = resolved.packIds.map((pid) => ({
    pack_id: pid,
    version: resolved.pinnedVersions[pid] ?? 1
  }));
  return {
    effort_hours: effortHours,
    multipliers,
    gotcha_patterns: gotchaPatterns,
    dependency_chains: dependencyChains,
    phase_mappings: phaseMappings,
    roles,
    packs_used: packsUsed,
    migration_path_id: resolved.migrationPathId ?? void 0
  };
}
function mergeQuestions(target, source) {
  if (!Array.isArray(source))
    return;
  const existingIds = new Set(target.map((q3) => q3.id ?? q3.question_id));
  for (const q3 of source) {
    const qId = q3.id ?? q3.question_id;
    if (qId && !existingIds.has(qId)) {
      target.push(q3);
      existingIds.add(qId);
    }
  }
}
function mergeInferenceRules(target, source) {
  if (!Array.isArray(source))
    return;
  const existingIds = new Set(target.map((r3) => r3.id ?? r3.rule_id));
  for (const r3 of source) {
    const rId = r3.id ?? r3.rule_id;
    if (rId && !existingIds.has(rId)) {
      target.push(r3);
      existingIds.add(rId);
    }
  }
}

export { assessmentKnowledgePins, assessments, calibrationAiTools, calibrationComponents, calibrationPhases, calibrations, checkUrlFreshness, composeDiscoveryTree, composeHeuristics, getAssessmentById, getDiscoveryTree, getHeuristicsForPacks, getMigrationPath, getPinnedKnowledge, getSourceUrls, knowledgePackVersions, knowledgePacks, knowledgeSourceUrls, pinKnowledgeVersion, resolvePackIds, saveCalibration, saveSourceUrls };
//# sourceMappingURL=index2-Ds-j4PBQ.js.map
