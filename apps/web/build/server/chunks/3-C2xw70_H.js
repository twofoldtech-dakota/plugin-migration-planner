import { d as db } from './db-BWpbog7L.js';
import { g as getAssessmentById } from './assessments-DKcL9-FM.js';
import { g as getDiscovery } from './discovery-ZQezVmz4.js';
import { g as getAnalysis } from './analysis-BcZv0btd.js';
import { g as getEstimate, l as listEstimateVersions } from './estimates-zTf3XwgF.js';
import { g as getScopeExclusions } from './scope-exclusions-7kg0wvsO.js';
import { g as getChallengeReviewSummary } from './challenge-reviews-NXl75WQY.js';
import { e as error } from './index-wpIsICWW.js';
import { c as computeDiscoveryStats, a as computeRiskStats, b as computeAssumptionStats } from './migration-stats-BAGrJ4E5.js';
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
  const assessment = await getAssessmentById(db(), params.id);
  if (!assessment) {
    error(404, "Assessment not found");
  }
  const vParam = url.searchParams.get("v");
  const requestedVersion = vParam ? parseInt(vParam, 10) : void 0;
  const [discovery, analysis, estimate, scopeExclusions, challengeReviewSummary, estimateVersions] = await Promise.all([
    getDiscovery(db(), params.id),
    getAnalysis(db(), params.id),
    getEstimate(db(), params.id, requestedVersion || void 0),
    getScopeExclusions(db(), params.id),
    getChallengeReviewSummary(db(), params.id),
    listEstimateVersions(db(), params.id)
  ]);
  const discoveryStats = computeDiscoveryStats(discovery);
  const riskStats = computeRiskStats(analysis?.risks);
  const assumptionStats = computeAssumptionStats(analysis?.assumptions);
  const summary = {
    discovery: discoveryStats,
    risks: riskStats,
    assumptions: assumptionStats,
    estimateHours: estimate?.total_expected_hours ?? 0,
    confidence: estimate?.confidence_score ?? 0,
    hasDiscovery: discoveryStats.completedDimensions > 0,
    hasAnalysis: !!analysis && riskStats.total > 0,
    hasEstimate: !!estimate,
    hasRefine: Object.values(scopeExclusions?.exclusions ?? {}).some(Boolean),
    challengeReviews: challengeReviewSummary
  };
  return { assessment, discovery, analysis, estimate, scopeExclusions, summary, estimateVersions };
};

var _layout_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 3;
let component_cache;
const component = async () => component_cache ??= (await import('./_layout.svelte-0wssQZnv.js')).default;
const server_id = "src/routes/assessments/[id]/+layout.server.ts";
const imports = ["_app/immutable/nodes/3.BHI5mgkG.js","_app/immutable/chunks/Nq2m2xDw.js","_app/immutable/chunks/DcamcR-f.js","_app/immutable/chunks/CTZ8dTRF.js","_app/immutable/chunks/tZfpQL7D.js","_app/immutable/chunks/D62f41K-.js","_app/immutable/chunks/B489Hgvz.js","_app/immutable/chunks/COtyJqkZ.js","_app/immutable/chunks/CZtzXEyY.js","_app/immutable/chunks/5_lFXlvf.js","_app/immutable/chunks/DsmKcCbW.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _layout_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=3-C2xw70_H.js.map
