import { d as db, s as sql, r as risks, f as calibrations, e as estimateSnapshots } from './db-BWpbog7L.js';
import { q as queryProjects } from './analytics-BZLNJxd8.js';
import { l as listKnowledgePacks } from './knowledge-packs-PreH8nWI.js';
import { l as listMigrationPaths } from './migration-paths-Cv3IGt0S.js';
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
  const [
    { projects },
    packs,
    paths,
    riskRows,
    calibrationCount,
    estimateRows
  ] = await Promise.all([
    queryProjects(d, { limit: 200 }),
    listKnowledgePacks(d),
    listMigrationPaths(d),
    d.select({ cnt: sql`count(*)` }).from(risks).where(sql`${risks.status} = 'open'`),
    d.select({ cnt: sql`count(*)` }).from(calibrations),
    d.select({
      confidence_score: estimateSnapshots.confidence_score
    }).from(estimateSnapshots).where(sql`${estimateSnapshots.confidence_score} > 0`)
  ]);
  const withEstimates = projects.filter((p) => p.total_expected_hours != null);
  const totalHours = withEstimates.reduce((s, p) => s + (p.total_expected_hours ?? 0), 0);
  const avgConfidence = estimateRows.length > 0 ? Math.round(estimateRows.reduce((s, r) => s + r.confidence_score, 0) / estimateRows.length * 10) / 10 : 0;
  return {
    kpis: {
      totalAssessments: projects.length,
      totalHours: Math.round(totalHours),
      avgConfidence,
      openRisks: Number(riskRows[0]?.cnt ?? 0),
      calibrationsCompleted: Number(calibrationCount[0]?.cnt ?? 0),
      knowledgePacks: packs.length
    },
    quickLinks: {
      paths: paths.length
    }
  };
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 5;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-Fj1pRGer.js')).default;
const server_id = "src/routes/analytics/+page.server.ts";
const imports = ["_app/immutable/nodes/5.DkJbJa1N.js","_app/immutable/chunks/Nq2m2xDw.js","_app/immutable/chunks/DcamcR-f.js","_app/immutable/chunks/DOdfwfvb.js","_app/immutable/chunks/14L2tLyd.js","_app/immutable/chunks/tZfpQL7D.js","_app/immutable/chunks/B489Hgvz.js","_app/immutable/chunks/D-Fef6i9.js","_app/immutable/chunks/CTZ8dTRF.js","_app/immutable/chunks/jfJYy30P.js","_app/immutable/chunks/Dt-GL34s.js","_app/immutable/chunks/COtyJqkZ.js","_app/immutable/chunks/bllHAThW.js","_app/immutable/chunks/DsmKcCbW.js","_app/immutable/chunks/DwGCDbOQ.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=5-SVRcoWb4.js.map
