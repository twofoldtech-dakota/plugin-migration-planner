import { d as db } from './db-BWpbog7L.js';
import { g as getAssessmentById } from './assessments-DKcL9-FM.js';
import { g as getAiSelections } from './ai-selections-81CCgTAS.js';
import { g as getScopeExclusions } from './scope-exclusions-7kg0wvsO.js';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import 'events';
import 'util';
import 'crypto';
import 'dns';
import 'net';
import 'tls';
import 'stream';
import 'string_decoder';
import './shared-server-DaWdgxVh.js';

const load = async ({ params }) => {
  const [aiSelections, scopeExclusions] = await Promise.all([
    getAiSelections(db(), params.id),
    getScopeExclusions(db(), params.id)
  ]);
  let aiAlternatives = [];
  try {
    const { getAiAlternatives } = await import('./knowledge-CxzzbHNI.js');
    aiAlternatives = getAiAlternatives();
  } catch (e) {
    console.error("Failed to load AI alternatives:", e);
  }
  let refinements = { roleOverrides: {}, roleTasks: {} };
  try {
    const assessment = await getAssessmentById(db(), params.id);
    if (assessment?.project_path) {
      const refinementsPath = join(assessment.project_path, ".migration", "refinements.json");
      if (existsSync(refinementsPath)) {
        const raw = await readFile(refinementsPath, "utf-8");
        refinements = JSON.parse(raw);
      }
    }
  } catch (e) {
    console.error("Failed to load refinements:", e);
  }
  return {
    aiSelections: aiSelections ?? { selections: {} },
    aiAlternatives,
    scopeExclusions: scopeExclusions ?? { exclusions: {}, reasons: {} },
    refinements
  };
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 22;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-CzuE1ZLG.js')).default;
const server_id = "src/routes/assessments/[id]/refine/+page.server.ts";
const imports = ["_app/immutable/nodes/22.DYMUk-lw.js","_app/immutable/chunks/Nq2m2xDw.js","_app/immutable/chunks/DcamcR-f.js","_app/immutable/chunks/tZfpQL7D.js","_app/immutable/chunks/D62f41K-.js","_app/immutable/chunks/DOdfwfvb.js","_app/immutable/chunks/B489Hgvz.js","_app/immutable/chunks/CTZ8dTRF.js","_app/immutable/chunks/COtyJqkZ.js","_app/immutable/chunks/D8cY5i6L.js","_app/immutable/chunks/CZtzXEyY.js","_app/immutable/chunks/5_lFXlvf.js","_app/immutable/chunks/DsmKcCbW.js","_app/immutable/chunks/D-Fef6i9.js","_app/immutable/chunks/jfJYy30P.js","_app/immutable/chunks/LUAtJzi1.js","_app/immutable/chunks/DjBhgMx0.js","_app/immutable/chunks/bllHAThW.js","_app/immutable/chunks/DwGCDbOQ.js","_app/immutable/chunks/z0dYBnNc.js","_app/immutable/chunks/CbvwqsEx.js","_app/immutable/chunks/CNHYXi2h.js","_app/immutable/chunks/D4Xvn_HC.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=22-uoZI6I1h.js.map
