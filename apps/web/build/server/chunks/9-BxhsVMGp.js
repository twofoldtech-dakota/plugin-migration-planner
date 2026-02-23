import { d as db, n as knowledgeSourceUrls, s as sql, o as knowledgeAiAlternatives } from './db-BWpbog7L.js';
import { l as listKnowledgePacks } from './knowledge-packs-PreH8nWI.js';
import { g as getHeuristicsForPacks } from './knowledge-heuristics-BHO3IhyP.js';
import { g as getDiscoveryTree } from './knowledge-discovery-C61edzvf.js';
import { l as listMigrationPaths } from './migration-paths-Cv3IGt0S.js';
import { g as gradeKnowledgePack } from './pack-grading-B-ZgwrAj.js';
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
import './aggregate-B2GxRiPZ.js';

const load = async () => {
  const d = db();
  const [packs, paths, urlStats] = await Promise.all([
    listKnowledgePacks(d),
    listMigrationPaths(d),
    // Source URL health aggregation
    d.select({
      total: sql`count(*)`,
      accessible: sql`count(*) filter (where ${knowledgeSourceUrls.still_accessible} = true)`,
      stale: sql`count(*) filter (where ${knowledgeSourceUrls.still_accessible} = false)`
    }).from(knowledgeSourceUrls)
  ]);
  const packIds = packs.map((p) => p.id);
  const [heuristics, discoveryResult, aiCountRows, sourceCountRows] = await Promise.all([
    packIds.length > 0 ? getHeuristicsForPacks(d, packIds) : {},
    packIds.length > 0 ? getDiscoveryTree(d, packIds) : { packs: [], dimensions: [] },
    packIds.length > 0 ? d.select({
      pack_id: knowledgeAiAlternatives.pack_id,
      count: sql`count(*)`
    }).from(knowledgeAiAlternatives).groupBy(knowledgeAiAlternatives.pack_id) : [],
    packIds.length > 0 ? d.select({
      pack_id: knowledgeSourceUrls.pack_id,
      count: sql`count(*)`
    }).from(knowledgeSourceUrls).where(sql`${knowledgeSourceUrls.pack_id} IS NOT NULL`).groupBy(knowledgeSourceUrls.pack_id) : []
  ]);
  const healthStats = {};
  for (const pack of packs) {
    const h = heuristics[pack.id] ?? {};
    healthStats[pack.id] = {
      effort: (h.effort_hours ?? []).length,
      multipliers: (h.multipliers ?? []).length,
      gotchas: (h.gotcha_patterns ?? []).length,
      chains: (h.dependency_chains ?? []).length,
      phases: (h.phase_mappings ?? []).length,
      roles: (h.roles ?? []).length
    };
  }
  const discoveryStats = {};
  for (const dt of discoveryResult.packs) {
    const dims = Array.isArray(dt.dimensions) ? dt.dimensions : [];
    let totalQuestions = 0;
    for (const dim of dims) {
      totalQuestions += (dim.required_questions?.length ?? 0) + (dim.conditional_questions?.length ?? 0);
    }
    discoveryStats[dt.pack_id] = { dims: dims.length, questions: totalQuestions };
  }
  const aiCountMap = {};
  for (const row of aiCountRows) {
    aiCountMap[row.pack_id] = Number(row.count);
  }
  const sourceCountMap = {};
  for (const row of sourceCountRows) {
    if (row.pack_id) sourceCountMap[row.pack_id] = Number(row.count);
  }
  const confidenceLevels = {};
  for (const p of packs) {
    const level = p.confidence || "draft";
    confidenceLevels[level] = (confidenceLevels[level] || 0) + 1;
  }
  const confidenceColors = {
    verified: "var(--color-success)",
    reviewed: "var(--color-primary)",
    draft: "var(--color-warning)",
    community: "var(--color-info)"
  };
  const confidenceSegments = Object.entries(confidenceLevels).map(([label, value]) => ({
    label: label.charAt(0).toUpperCase() + label.slice(1),
    value,
    color: confidenceColors[label] || "var(--color-text-muted)"
  }));
  const urlTotal = Number(urlStats[0]?.total ?? 0);
  const urlAccessible = Number(urlStats[0]?.accessible ?? 0);
  const urlStale = Number(urlStats[0]?.stale ?? 0);
  const urlUnchecked = urlTotal - urlAccessible - urlStale;
  const urlHealthSegments = [
    { label: "Accessible", value: urlAccessible, color: "var(--color-success)" },
    { label: "Stale", value: urlStale, color: "var(--color-danger)" },
    ...urlUnchecked > 0 ? [{ label: "Unchecked", value: urlUnchecked, color: "var(--color-text-muted)" }] : []
  ].filter((s) => s.value > 0);
  const packCompleteness = packs.map((p) => {
    const stats = healthStats[p.id] ?? { effort: 0, gotchas: 0, multipliers: 0 };
    return {
      label: p.name,
      value: stats.effort + stats.gotchas + stats.multipliers,
      detail: `${stats.effort} effort, ${stats.gotchas} gotchas, ${stats.multipliers} multipliers`
    };
  }).sort((a, b) => b.value - a.value);
  const packGrades = packs.map((p) => {
    const stats = healthStats[p.id] ?? { effort: 0, multipliers: 0, gotchas: 0, chains: 0, phases: 0, roles: 0 };
    const disc = discoveryStats[p.id] ?? { dims: 0, questions: 0 };
    return gradeKnowledgePack({
      packId: p.id,
      packName: p.name,
      discoveryDimensions: disc.dims,
      discoveryQuestions: disc.questions,
      effortHours: stats.effort,
      multipliers: stats.multipliers,
      gotchas: stats.gotchas,
      chains: stats.chains,
      phases: stats.phases,
      roles: stats.roles,
      aiAlternatives: aiCountMap[p.id] ?? 0,
      sourceUrls: sourceCountMap[p.id] ?? 0,
      lastResearched: !!p.last_researched
    });
  });
  const packTable = packs.map((p) => {
    const stats = healthStats[p.id] ?? { effort: 0, multipliers: 0, gotchas: 0, chains: 0, phases: 0, roles: 0 };
    const disc = discoveryStats[p.id] ?? { dims: 0, questions: 0 };
    const grade = packGrades.find((g) => g.packId === p.id);
    return {
      id: p.id,
      name: p.name,
      category: p.category,
      confidence: p.confidence,
      effort: stats.effort,
      gotchas: stats.gotchas,
      multipliers: stats.multipliers,
      chains: stats.chains,
      phases: stats.phases,
      roles: stats.roles,
      aiAlts: aiCountMap[p.id] ?? 0,
      sources: sourceCountMap[p.id] ?? 0,
      discoveryDims: disc.dims,
      discoveryQuestions: disc.questions,
      total: stats.effort + stats.gotchas + stats.multipliers,
      grade: grade?.overall ?? "F",
      gradeScore: grade?.overallScore ?? 0
    };
  });
  return {
    kpis: {
      packs: packs.length,
      paths: paths.length,
      sourceUrls: urlTotal,
      staleUrls: urlStale
    },
    confidenceSegments,
    urlHealthSegments,
    packCompleteness,
    packTable,
    packGrades
  };
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 9;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-Bo3DCJ5O.js')).default;
const server_id = "src/routes/analytics/knowledge/+page.server.ts";
const imports = ["_app/immutable/nodes/9.CwlJAkDX.js","_app/immutable/chunks/Nq2m2xDw.js","_app/immutable/chunks/DcamcR-f.js","_app/immutable/chunks/tZfpQL7D.js","_app/immutable/chunks/D62f41K-.js","_app/immutable/chunks/DOdfwfvb.js","_app/immutable/chunks/B489Hgvz.js","_app/immutable/chunks/CTZ8dTRF.js","_app/immutable/chunks/14L2tLyd.js","_app/immutable/chunks/D-Fef6i9.js","_app/immutable/chunks/jfJYy30P.js","_app/immutable/chunks/Dt-GL34s.js","_app/immutable/chunks/COtyJqkZ.js","_app/immutable/chunks/bllHAThW.js","_app/immutable/chunks/DsmKcCbW.js","_app/immutable/chunks/DwGCDbOQ.js","_app/immutable/chunks/D7Ames6W.js","_app/immutable/chunks/CFGnnNQp.js","_app/immutable/chunks/BjgLYfVN.js","_app/immutable/chunks/CQkEMrDG.js","_app/immutable/chunks/CtkXoNsT.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=9-BxhsVMGp.js.map
