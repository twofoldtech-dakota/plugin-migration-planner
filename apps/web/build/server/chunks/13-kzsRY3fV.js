import { d as db } from './db-BWpbog7L.js';
import { g as getAssessmentById } from './assessments-DKcL9-FM.js';
import { g as getAiSelections } from './ai-selections-81CCgTAS.js';
import { g as getScopeExclusions } from './scope-exclusions-7kg0wvsO.js';
import { g as getProficiencies } from './clients-DrQYkYt7.js';
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
  let aiAlternatives = [];
  let proficiencyData = null;
  try {
    const knowledge = await import('./knowledge-CxzzbHNI.js');
    aiAlternatives = knowledge.getAiAlternatives();
    const assessment = await getAssessmentById(db(), params.id);
    if (assessment?.client_id) {
      const proficiencies = await getProficiencies(db(), assessment.client_id);
      if (Object.keys(proficiencies).length > 0) {
        const catalog = knowledge.getTechProficiencyCatalog();
        proficiencyData = { proficiencies, catalog };
      }
    }
  } catch (e) {
    console.error("Failed to load AI alternatives:", e);
  }
  return {
    aiSelections: aiSelections ?? { selections: {} },
    aiAlternatives,
    scopeExclusions: scopeExclusions ?? { exclusions: {}, reasons: {} },
    proficiencyData
  };
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 13;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-D98jEKLD.js')).default;
const server_id = "src/routes/assessments/[id]/+page.server.ts";
const imports = ["_app/immutable/nodes/13.DdAaDXt3.js","_app/immutable/chunks/Nq2m2xDw.js","_app/immutable/chunks/DcamcR-f.js","_app/immutable/chunks/tZfpQL7D.js","_app/immutable/chunks/D62f41K-.js","_app/immutable/chunks/DOdfwfvb.js","_app/immutable/chunks/B489Hgvz.js","_app/immutable/chunks/CTZ8dTRF.js","_app/immutable/chunks/COtyJqkZ.js","_app/immutable/chunks/5_lFXlvf.js","_app/immutable/chunks/DsmKcCbW.js","_app/immutable/chunks/CZtzXEyY.js","_app/immutable/chunks/D-Fef6i9.js","_app/immutable/chunks/jfJYy30P.js","_app/immutable/chunks/D4Xvn_HC.js","_app/immutable/chunks/bllHAThW.js","_app/immutable/chunks/DwGCDbOQ.js","_app/immutable/chunks/z0dYBnNc.js","_app/immutable/chunks/DIDNRxIi.js","_app/immutable/chunks/5msdRUWR.js","_app/immutable/chunks/CNHYXi2h.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=13-kzsRY3fV.js.map
