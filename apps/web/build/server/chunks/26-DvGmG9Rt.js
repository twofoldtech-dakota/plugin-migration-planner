import { d as db, o as knowledgeAiAlternatives, s as sql, n as knowledgeSourceUrls } from './db-BWpbog7L.js';
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
  const [packs, paths] = await Promise.all([
    listKnowledgePacks(d),
    listMigrationPaths(d)
  ]);
  const pathCountsAsSource = {};
  const pathCountsAsTarget = {};
  for (const path of paths) {
    pathCountsAsSource[path.source_pack_id] = (pathCountsAsSource[path.source_pack_id] ?? 0) + 1;
    pathCountsAsTarget[path.target_pack_id] = (pathCountsAsTarget[path.target_pack_id] ?? 0) + 1;
  }
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
      effortHours: (h.effort_hours ?? []).length,
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
  const packGrades = {};
  for (const pack of packs) {
    const stats = healthStats[pack.id];
    const disc = discoveryStats[pack.id] ?? { dims: 0, questions: 0 };
    packGrades[pack.id] = gradeKnowledgePack({
      packId: pack.id,
      packName: pack.name,
      discoveryDimensions: disc.dims,
      discoveryQuestions: disc.questions,
      effortHours: stats?.effortHours ?? 0,
      multipliers: stats?.multipliers ?? 0,
      gotchas: stats?.gotchas ?? 0,
      chains: stats?.chains ?? 0,
      phases: stats?.phases ?? 0,
      roles: stats?.roles ?? 0,
      aiAlternatives: aiCountMap[pack.id] ?? 0,
      sourceUrls: sourceCountMap[pack.id] ?? 0,
      lastResearched: !!pack.last_researched
    });
  }
  const categories = [...new Set(packs.map((p) => p.category))].filter(Boolean).sort();
  return {
    packs,
    pathCountsAsSource,
    pathCountsAsTarget,
    healthStats,
    packGrades,
    categories,
    totalPaths: paths.length
  };
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 26;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BnjKyziP.js')).default;
const server_id = "src/routes/knowledge/+page.server.ts";
const imports = ["_app/immutable/nodes/26.DBeCyktP.js","_app/immutable/chunks/Nq2m2xDw.js","_app/immutable/chunks/DcamcR-f.js","_app/immutable/chunks/tZfpQL7D.js","_app/immutable/chunks/D62f41K-.js","_app/immutable/chunks/DOdfwfvb.js","_app/immutable/chunks/B489Hgvz.js","_app/immutable/chunks/CTZ8dTRF.js","_app/immutable/chunks/COtyJqkZ.js","_app/immutable/chunks/D8cY5i6L.js","_app/immutable/chunks/DwGCDbOQ.js","_app/immutable/chunks/D-Fef6i9.js","_app/immutable/chunks/jfJYy30P.js","_app/immutable/chunks/D4Xvn_HC.js","_app/immutable/chunks/14L2tLyd.js","_app/immutable/chunks/Dt-GL34s.js","_app/immutable/chunks/bllHAThW.js","_app/immutable/chunks/DsmKcCbW.js","_app/immutable/chunks/CtkXoNsT.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=26-DvGmG9Rt.js.map
