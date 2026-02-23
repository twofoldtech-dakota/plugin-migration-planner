import { d as db } from './db-BWpbog7L.js';
import { g as getAiSelections } from './ai-selections-81CCgTAS.js';
import { g as getScopeExclusions } from './scope-exclusions-7kg0wvsO.js';
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

const load = async ({ params }) => {
  const [aiSelections, scopeExclusions] = await Promise.all([
    getAiSelections(db(), params.id),
    getScopeExclusions(db(), params.id)
  ]);
  let knownMultipliers = [];
  let knownGotchas = [];
  let dependencyChains = null;
  let knownIncompatibilities = [];
  let aiAlternatives = [];
  try {
    const knowledge = await import('./knowledge-CxzzbHNI.js');
    knownMultipliers = knowledge.getComplexityMultipliers();
    knownGotchas = knowledge.getGotchaPatterns();
    dependencyChains = knowledge.getDependencyChains();
    knownIncompatibilities = knowledge.getKnownIncompatibilities();
    aiAlternatives = knowledge.getAiAlternatives();
  } catch (e) {
    console.error("Failed to load knowledge heuristics:", e);
  }
  return {
    knownMultipliers,
    knownGotchas,
    dependencyChains,
    knownIncompatibilities,
    aiAlternatives,
    aiSelections: aiSelections ?? { selections: {} },
    scopeExclusions: scopeExclusions ?? { exclusions: {}, reasons: {} }
  };
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 14;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BF_0zhN4.js')).default;
const server_id = "src/routes/assessments/[id]/analysis/+page.server.ts";
const imports = ["_app/immutable/nodes/14.C_dbuptW.js","_app/immutable/chunks/Nq2m2xDw.js","_app/immutable/chunks/DcamcR-f.js","_app/immutable/chunks/tZfpQL7D.js","_app/immutable/chunks/D62f41K-.js","_app/immutable/chunks/DOdfwfvb.js","_app/immutable/chunks/B489Hgvz.js","_app/immutable/chunks/CTZ8dTRF.js","_app/immutable/chunks/COtyJqkZ.js","_app/immutable/chunks/CZtzXEyY.js","_app/immutable/chunks/5_lFXlvf.js","_app/immutable/chunks/DsmKcCbW.js","_app/immutable/chunks/D-Fef6i9.js","_app/immutable/chunks/jfJYy30P.js","_app/immutable/chunks/D4Xvn_HC.js","_app/immutable/chunks/DrfDtZDJ.js","_app/immutable/chunks/DjBhgMx0.js","_app/immutable/chunks/z0dYBnNc.js","_app/immutable/chunks/5msdRUWR.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=14-44eED6fa.js.map
