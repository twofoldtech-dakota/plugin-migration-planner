import { d as db } from './db-BWpbog7L.js';
import { l as listAssessments, g as getAssessmentById } from './assessments-DKcL9-FM.js';
import { g as getAnalysis } from './analysis-BcZv0btd.js';
import { g as getEstimate } from './estimates-zTf3XwgF.js';
import { g as getDeliverables } from './deliverables-Bw2E3Qk7.js';
import { g as getWBSSnapshot, l as listWBSVersions } from './wbs-_BnBrxIn.js';
import { g as getTeamSnapshot, l as listTeamVersions } from './team-Utu5T08G.js';
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

const load = async ({ url }) => {
  const assessmentId = url.searchParams.get("assessment");
  const tab = url.searchParams.get("tab") ?? "documents";
  const wbsVersion = url.searchParams.get("wbsVersion");
  const teamVersion = url.searchParams.get("teamVersion");
  const allAssessments = await listAssessments(db());
  if (!assessmentId) {
    return { assessments: allAssessments, tab };
  }
  const assessment = await getAssessmentById(db(), assessmentId);
  if (!assessment) {
    return { assessments: allAssessments, tab, error: "Assessment not found" };
  }
  const [estimate, analysis, deliverables, wbs, wbsVersions, team, teamVersions] = await Promise.all([
    getEstimate(db(), assessmentId),
    getAnalysis(db(), assessmentId),
    getDeliverables(db(), assessmentId),
    getWBSSnapshot(
      db(),
      assessmentId,
      wbsVersion ? parseInt(wbsVersion, 10) : void 0
    ),
    listWBSVersions(db(), assessmentId),
    getTeamSnapshot(
      db(),
      assessmentId,
      teamVersion ? parseInt(teamVersion, 10) : void 0
    ),
    listTeamVersions(db(), assessmentId)
  ]);
  return {
    assessments: allAssessments,
    assessment,
    estimate,
    analysis,
    deliverables,
    wbs,
    wbsVersions,
    team,
    teamVersions,
    tab
  };
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 29;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DHu1dLxw.js')).default;
const server_id = "src/routes/planning/+page.server.ts";
const imports = ["_app/immutable/nodes/29.BGvtT-tj.js","_app/immutable/chunks/Nq2m2xDw.js","_app/immutable/chunks/DcamcR-f.js","_app/immutable/chunks/tZfpQL7D.js","_app/immutable/chunks/D62f41K-.js","_app/immutable/chunks/DOdfwfvb.js","_app/immutable/chunks/B489Hgvz.js","_app/immutable/chunks/CTZ8dTRF.js","_app/immutable/chunks/DTyJUmrG.js","_app/immutable/chunks/5_lFXlvf.js","_app/immutable/chunks/DsmKcCbW.js","_app/immutable/chunks/CZtzXEyY.js","_app/immutable/chunks/D-Fef6i9.js","_app/immutable/chunks/jfJYy30P.js","_app/immutable/chunks/D4Xvn_HC.js","_app/immutable/chunks/CbvwqsEx.js","_app/immutable/chunks/DwGCDbOQ.js","_app/immutable/chunks/COtyJqkZ.js","_app/immutable/chunks/D8cY5i6L.js","_app/immutable/chunks/bllHAThW.js"];
const stylesheets = ["_app/immutable/assets/29.BVb8jM_U.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=29-ZnoDc77m.js.map
