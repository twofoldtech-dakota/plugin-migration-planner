import { d as db } from './db-BWpbog7L.js';
import { g as getAssessmentById } from './assessments-DKcL9-FM.js';
import { g as getEstimate } from './estimates-zTf3XwgF.js';
import { g as getAiSelections } from './ai-selections-81CCgTAS.js';
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
import './aggregate-B2GxRiPZ.js';

const load = async ({ params, url }) => {
  const aiSelections = await getAiSelections(db(), params.id);
  const compareParam = url.searchParams.get("compare");
  const compareVersion = compareParam ? parseInt(compareParam, 10) : void 0;
  const compareEstimate = compareVersion ? await getEstimate(db(), params.id, compareVersion) : null;
  let aiAlternatives = [];
  let baseEffort = { components: [], phases: {}, roles: {} };
  let proficiencyData = null;
  try {
    const knowledge = await import('./knowledge-CxzzbHNI.js');
    aiAlternatives = knowledge.getAiAlternatives();
    baseEffort = knowledge.getBaseEffort();
    const assessment = await getAssessmentById(db(), params.id);
    if (assessment?.client_id) {
      const proficiencies = await getProficiencies(db(), assessment.client_id);
      if (Object.keys(proficiencies).length > 0) {
        const catalog = knowledge.getTechProficiencyCatalog();
        proficiencyData = { proficiencies, catalog };
      }
    }
  } catch (e) {
    console.error("Failed to load knowledge heuristics:", e);
  }
  return {
    aiSelections: aiSelections ?? { selections: {} },
    aiAlternatives,
    baseEffort,
    compareEstimate,
    proficiencyData
  };
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 19;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-eW6ZED6E.js')).default;
const server_id = "src/routes/assessments/[id]/estimate/+page.server.ts";
const imports = ["_app/immutable/nodes/19.CD4Eb3ZN.js","_app/immutable/chunks/Nq2m2xDw.js","_app/immutable/chunks/DcamcR-f.js","_app/immutable/chunks/tZfpQL7D.js","_app/immutable/chunks/D62f41K-.js","_app/immutable/chunks/DOdfwfvb.js","_app/immutable/chunks/B489Hgvz.js","_app/immutable/chunks/CTZ8dTRF.js","_app/immutable/chunks/COtyJqkZ.js","_app/immutable/chunks/CZtzXEyY.js","_app/immutable/chunks/5_lFXlvf.js","_app/immutable/chunks/DsmKcCbW.js","_app/immutable/chunks/D-Fef6i9.js","_app/immutable/chunks/jfJYy30P.js","_app/immutable/chunks/D4Xvn_HC.js","_app/immutable/chunks/DrfDtZDJ.js","_app/immutable/chunks/DjBhgMx0.js","_app/immutable/chunks/LUAtJzi1.js","_app/immutable/chunks/bllHAThW.js","_app/immutable/chunks/DwGCDbOQ.js","_app/immutable/chunks/z0dYBnNc.js","_app/immutable/chunks/CNHYXi2h.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=19-B1hDyIzx.js.map
