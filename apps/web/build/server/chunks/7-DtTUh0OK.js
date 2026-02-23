import { d as db, c as challengeReviews, j as assessments, s as sql, b as desc } from './db-BWpbog7L.js';
import { a as queryConfidenceTimeline } from './analytics-BZLNJxd8.js';
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

const SESSION_GAP_MS = 60 * 60 * 1e3;
const load = async () => {
  const d = db();
  const [points, radarReviews] = await Promise.all([
    queryConfidenceTimeline(d),
    // Latest challenge review per assessment with score_breakdown
    d.select({
      assessment_id: challengeReviews.assessment_id,
      project_name: assessments.project_name,
      score_breakdown: challengeReviews.score_breakdown,
      confidence_score: challengeReviews.confidence_score
    }).from(challengeReviews).innerJoin(assessments, sql`${challengeReviews.assessment_id} = ${assessments.id}`).where(sql`${challengeReviews.confidence_score} > 0`).orderBy(desc(challengeReviews.created_at)).limit(20)
  ]);
  const byAssessment = /* @__PURE__ */ new Map();
  for (const p of points) {
    let entry = byAssessment.get(p.assessment_id);
    if (!entry) {
      entry = { project_name: p.project_name, snapshots: [] };
      byAssessment.set(p.assessment_id, entry);
    }
    entry.snapshots.push({ score: p.confidence_score, created_at: p.created_at });
  }
  const assessmentRuns = /* @__PURE__ */ new Map();
  for (const [id, data] of byAssessment) {
    const sorted = data.snapshots.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const runs = [];
    for (let i = 1; i <= sorted.length; i++) {
      const isEnd = i === sorted.length || new Date(sorted[i].created_at).getTime() - new Date(sorted[i - 1].created_at).getTime() > SESSION_GAP_MS;
      if (isEnd) {
        const final = sorted[i - 1];
        runs.push({
          run: runs.length + 1,
          type: runs.length === 0 ? "initial" : "refinement",
          score: final.score,
          created_at: final.created_at
        });
      }
    }
    assessmentRuns.set(id, { project_name: data.project_name, runs });
  }
  const allEvents = [];
  for (const [id, data] of assessmentRuns) {
    for (const run of data.runs) {
      allEvents.push({
        assessment_id: id,
        project_name: data.project_name,
        ...run,
        portfolioAvg: 0
        // computed below
      });
    }
  }
  allEvents.sort((a, b) => a.created_at.localeCompare(b.created_at));
  const latestByAssessment = /* @__PURE__ */ new Map();
  for (const ev of allEvents) {
    latestByAssessment.set(ev.assessment_id, ev.score);
    const scores = [...latestByAssessment.values()];
    ev.portfolioAvg = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length * 10) / 10;
  }
  const assessmentSummaries = [...assessmentRuns.entries()].map(([id, data]) => {
    const initial = data.runs[0];
    const current = data.runs[data.runs.length - 1];
    return {
      assessment_id: id,
      project_name: data.project_name,
      initialScore: initial.score,
      currentScore: current.score,
      delta: Math.round((current.score - initial.score) * 10) / 10,
      totalRuns: data.runs.length,
      runs: data.runs,
      firstEstimate: initial.created_at,
      lastEstimate: current.created_at
    };
  });
  const seenAssessments = /* @__PURE__ */ new Set();
  const radarData = radarReviews.filter((r) => {
    if (seenAssessments.has(r.assessment_id)) return false;
    seenAssessments.add(r.assessment_id);
    return true;
  }).map((r) => {
    const bd = r.score_breakdown ?? {};
    return {
      assessment_id: r.assessment_id,
      project_name: r.project_name,
      confidence: r.confidence_score,
      dimensions: [
        { label: "Completeness", value: bd.completeness ?? 0 },
        { label: "Consistency", value: bd.consistency ?? 0 },
        { label: "Currency", value: bd.currency ?? 0 },
        { label: "Plausibility", value: bd.plausibility ?? 0 },
        { label: "Risk Coverage", value: bd.risk_coverage ?? 0 }
      ]
    };
  });
  return {
    events: allEvents,
    assessments: assessmentSummaries,
    totalSnapshots: points.length,
    totalRuns: allEvents.length,
    radarData
  };
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 7;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-D6nmDHGw.js')).default;
const server_id = "src/routes/analytics/confidence/+page.server.ts";
const imports = ["_app/immutable/nodes/7.ByQwmOCe.js","_app/immutable/chunks/Nq2m2xDw.js","_app/immutable/chunks/DcamcR-f.js","_app/immutable/chunks/tZfpQL7D.js","_app/immutable/chunks/D62f41K-.js","_app/immutable/chunks/DOdfwfvb.js","_app/immutable/chunks/B489Hgvz.js","_app/immutable/chunks/CTZ8dTRF.js","_app/immutable/chunks/D8cY5i6L.js","_app/immutable/chunks/D-Fef6i9.js","_app/immutable/chunks/jfJYy30P.js","_app/immutable/chunks/CFGnnNQp.js","_app/immutable/chunks/CQkEMrDG.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=7-DtTUh0OK.js.map
