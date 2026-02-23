import { d as db, p as analyticsEvents, s as sql, j as assessments, q as inArray } from './db-BWpbog7L.js';
import { g as getPageViewCount, a as getSessionCount, b as getPageViewsOverTime, c as getTopPages, d as getTopFeatures, e as getMostEngagedAssessments } from './analytics-events-C4J_4XK6.js';
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

const load = async () => {
  const d = db();
  const [pageViews24h, sessions7d, pageViewBuckets, topPages, topFeatures, engagedRows, activeAssessmentRows] = await Promise.all([
    getPageViewCount(d, 24),
    getSessionCount(d, 7),
    getPageViewsOverTime(d, 168),
    getTopPages(d, 7, 10),
    getTopFeatures(d, 7, 10),
    getMostEngagedAssessments(d, 7, 10),
    d.select({ count: sql`count(distinct ${analyticsEvents.assessment_id})` }).from(analyticsEvents).where(
      sql`${analyticsEvents.assessment_id} is not null AND ${analyticsEvents.created_at} > now() - interval '7 days'`
    )
  ]);
  let assessmentMap = /* @__PURE__ */ new Map();
  if (engagedRows.length > 0) {
    const ids = engagedRows.map((r) => r.assessment_id);
    const rows = await d.select({ id: assessments.id, project_name: assessments.project_name }).from(assessments).where(inArray(assessments.id, ids));
    assessmentMap = new Map(rows.map((r) => [r.id, r.project_name]));
  }
  function formatHour(bucket) {
    const d2 = new Date(bucket);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const hour = d2.getHours();
    const ampm = hour >= 12 ? "pm" : "am";
    const h12 = hour % 12 || 12;
    return `${months[d2.getMonth()]} ${d2.getDate()} ${h12}${ampm}`;
  }
  const pageViewTrend = [
    {
      id: "views",
      label: "Page Views",
      color: "var(--color-primary)",
      data: pageViewBuckets.map((b) => ({
        label: formatHour(b.bucket),
        value: b.count
      }))
    }
  ];
  const topPagesBars = topPages.map((p) => ({
    label: p.path || "/",
    value: p.count
  }));
  const topFeaturesBars = topFeatures.map((f) => ({
    label: f.event,
    value: f.count
  }));
  const engagedAssessments = engagedRows.map((r) => ({
    assessment_id: r.assessment_id,
    project_name: assessmentMap.get(r.assessment_id) ?? r.assessment_id,
    count: r.count
  }));
  const activeAssessments = Number(activeAssessmentRows[0]?.count ?? 0);
  const avgPagesPerSession = sessions7d > 0 ? Math.round(pageViews24h / Math.max(sessions7d / 7, 1) * 10) / 10 : 0;
  return {
    pageViewTrend,
    topPagesBars,
    topFeaturesBars,
    engagedAssessments,
    pageViews24h,
    sessions7d,
    avgPagesPerSession,
    activeAssessments
  };
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 11;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DQinBV4q.js')).default;
const server_id = "src/routes/analytics/usage/+page.server.ts";
const imports = ["_app/immutable/nodes/11.Dl17Glv1.js","_app/immutable/chunks/Nq2m2xDw.js","_app/immutable/chunks/DcamcR-f.js","_app/immutable/chunks/tZfpQL7D.js","_app/immutable/chunks/D62f41K-.js","_app/immutable/chunks/DOdfwfvb.js","_app/immutable/chunks/B489Hgvz.js","_app/immutable/chunks/D-Fef6i9.js","_app/immutable/chunks/CTZ8dTRF.js","_app/immutable/chunks/jfJYy30P.js","_app/immutable/chunks/14L2tLyd.js","_app/immutable/chunks/Dt-GL34s.js","_app/immutable/chunks/COtyJqkZ.js","_app/immutable/chunks/bllHAThW.js","_app/immutable/chunks/DsmKcCbW.js","_app/immutable/chunks/DwGCDbOQ.js","_app/immutable/chunks/DrFOKtAU.js","_app/immutable/chunks/CFGnnNQp.js","_app/immutable/chunks/BjgLYfVN.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=11-BnNvhIau.js.map
