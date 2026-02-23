import { d as db, s as sql, o as knowledgeAiAlternatives, n as knowledgeSourceUrls } from './db-BWpbog7L.js';
import { g as getKnowledgePackFull, a as getKnowledgePackById } from './knowledge-packs-PreH8nWI.js';
import { g as getDiscoveryTree } from './knowledge-discovery-C61edzvf.js';
import { l as listMigrationPaths } from './migration-paths-Cv3IGt0S.js';
import { e as error } from './index-wpIsICWW.js';
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

const load = async ({ params }) => {
  const d = db();
  const pack = await getKnowledgePackFull(d, params.id);
  if (!pack) {
    throw error(404, "Knowledge pack not found");
  }
  const [pathsAsSource, pathsAsTarget, discoveryResult, aiCountRows, sourceCountRows] = await Promise.all([
    listMigrationPaths(d, { source_pack_id: params.id }),
    listMigrationPaths(d, { target_pack_id: params.id }),
    getDiscoveryTree(d, [params.id]),
    d.select({ count: sql`count(*)` }).from(knowledgeAiAlternatives).where(sql`${knowledgeAiAlternatives.pack_id} = ${params.id}`),
    d.select({ count: sql`count(*)` }).from(knowledgeSourceUrls).where(sql`${knowledgeSourceUrls.pack_id} = ${params.id}`)
  ]);
  const relatedPackIds = /* @__PURE__ */ new Set();
  for (const p of pathsAsSource) relatedPackIds.add(p.target_pack_id);
  for (const p of pathsAsTarget) relatedPackIds.add(p.source_pack_id);
  relatedPackIds.delete(params.id);
  const relatedPacks = {};
  await Promise.all(
    [...relatedPackIds].map(async (id) => {
      const rp = await getKnowledgePackById(d, id);
      if (rp) {
        relatedPacks[id] = { id: rp.id, name: rp.name, category: rp.category };
      }
    })
  );
  let discoveryDims = 0;
  let discoveryQuestions = 0;
  const dt = discoveryResult.packs.find((p) => p.pack_id === params.id);
  if (dt) {
    const dims = Array.isArray(dt.dimensions) ? dt.dimensions : [];
    discoveryDims = dims.length;
    for (const dim of dims) {
      discoveryQuestions += (dim.required_questions?.length ?? 0) + (dim.conditional_questions?.length ?? 0);
    }
  }
  const effortHours = pack.effort_hours ?? [];
  const multipliers = pack.multipliers ?? [];
  const gotchas = pack.gotcha_patterns ?? [];
  const chains = pack.dependency_chains ?? [];
  const phases = pack.phase_mappings ?? [];
  const roles = pack.roles ?? [];
  const grade = gradeKnowledgePack({
    packId: params.id,
    packName: pack.name,
    discoveryDimensions: discoveryDims,
    effortHours: effortHours.length,
    multipliers: multipliers.length,
    gotchas: gotchas.length,
    chains: chains.length,
    phases: phases.length,
    roles: roles.length,
    aiAlternatives: Number(aiCountRows[0]?.count ?? 0),
    sourceUrls: Number(sourceCountRows[0]?.count ?? 0),
    lastResearched: !!pack.last_researched
  });
  return { pack, pathsAsSource, pathsAsTarget, relatedPacks, grade };
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 27;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-LtoFXNlx.js')).default;
const server_id = "src/routes/knowledge/[id]/+page.server.ts";
const imports = ["_app/immutable/nodes/27.BuT-fPZJ.js","_app/immutable/chunks/Nq2m2xDw.js","_app/immutable/chunks/DcamcR-f.js","_app/immutable/chunks/tZfpQL7D.js","_app/immutable/chunks/D62f41K-.js","_app/immutable/chunks/DOdfwfvb.js","_app/immutable/chunks/B489Hgvz.js","_app/immutable/chunks/CTZ8dTRF.js","_app/immutable/chunks/COtyJqkZ.js","_app/immutable/chunks/D-Fef6i9.js","_app/immutable/chunks/jfJYy30P.js","_app/immutable/chunks/D4Xvn_HC.js","_app/immutable/chunks/DrfDtZDJ.js","_app/immutable/chunks/bllHAThW.js","_app/immutable/chunks/DsmKcCbW.js","_app/immutable/chunks/DwGCDbOQ.js","_app/immutable/chunks/CbvwqsEx.js","_app/immutable/chunks/DjBhgMx0.js","_app/immutable/chunks/CQkEMrDG.js","_app/immutable/chunks/CFGnnNQp.js","_app/immutable/chunks/CtkXoNsT.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=27-DQK0n-4a.js.map
