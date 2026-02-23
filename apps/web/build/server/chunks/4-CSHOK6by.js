import { d as db, r as risks, s as sql, a as assumptions, k as knowledgePacks, c as challengeReviews, b as desc, e as estimateSnapshots } from './db-BWpbog7L.js';
import { q as queryProjects } from './analytics-BZLNJxd8.js';
import { l as listClients } from './clients-DrQYkYt7.js';
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
    clients,
    riskRows,
    assumptionRows,
    knowledgeHealthRows,
    recentReviews,
    confidenceSnapshots
  ] = await Promise.all([
    queryProjects(d, { limit: 100 }),
    listKnowledgePacks(d),
    listMigrationPaths(d),
    listClients(d),
    // Aggregate risk stats across ALL assessments
    d.select({
      severity: risks.severity,
      status: risks.status,
      cnt: sql`count(*)`
    }).from(risks).groupBy(risks.severity, risks.status),
    // Aggregate assumption stats across ALL assessments
    d.select({
      validation_status: assumptions.validation_status,
      cnt: sql`count(*)`
    }).from(assumptions).groupBy(assumptions.validation_status),
    // Knowledge pack health: count effort hours + gotchas + multipliers per pack
    d.select({
      pack_id: knowledgePacks.id,
      name: knowledgePacks.name,
      category: knowledgePacks.category,
      confidence: knowledgePacks.confidence,
      effort_count: sql`(SELECT count(*) FROM knowledge_effort_hours WHERE pack_id = ${knowledgePacks.id})`,
      gotcha_count: sql`(SELECT count(*) FROM knowledge_gotcha_patterns WHERE pack_id = ${knowledgePacks.id})`,
      multiplier_count: sql`(SELECT count(*) FROM knowledge_multipliers WHERE pack_id = ${knowledgePacks.id})`
    }).from(knowledgePacks),
    // Recent challenge reviews
    d.select().from(challengeReviews).orderBy(desc(challengeReviews.created_at)).limit(5),
    // Confidence snapshots for sparkline (need assessment_id for running avg)
    d.select({
      assessment_id: estimateSnapshots.assessment_id,
      confidence_score: estimateSnapshots.confidence_score,
      created_at: estimateSnapshots.created_at
    }).from(estimateSnapshots).where(sql`${estimateSnapshots.confidence_score} > 0`).orderBy(estimateSnapshots.created_at)
  ]);
  const riskSummary = {
    total: 0,
    open: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  };
  for (const r of riskRows) {
    const n = Number(r.cnt);
    riskSummary.total += n;
    if (r.status === "open") riskSummary.open += n;
    const sev = r.severity?.toLowerCase();
    if (sev === "critical") riskSummary.critical += n;
    else if (sev === "high") riskSummary.high += n;
    else if (sev === "medium") riskSummary.medium += n;
    else if (sev === "low") riskSummary.low += n;
  }
  const assumptionSummary = { total: 0, validated: 0, unvalidated: 0, invalidated: 0 };
  for (const a of assumptionRows) {
    const n = Number(a.cnt);
    assumptionSummary.total += n;
    if (a.validation_status === "validated") assumptionSummary.validated += n;
    else if (a.validation_status === "invalidated") assumptionSummary.invalidated += n;
    else assumptionSummary.unvalidated += n;
  }
  const pipeline = { planning: 0, discovery: 0, analysis: 0, estimation: 0, complete: 0 };
  for (const p of projects) {
    const s = p.status;
    if (s in pipeline) pipeline[s]++;
  }
  const knowledgeHealth = {
    totalPacks: packs.length,
    totalPaths: paths.length,
    verified: packs.filter((p) => p.confidence === "verified").length,
    draft: packs.filter((p) => p.confidence === "draft").length,
    categories: [...new Set(packs.map((p) => p.category))].filter(Boolean),
    packHealth: knowledgeHealthRows.map((r) => ({
      id: r.pack_id,
      name: r.name,
      category: r.category,
      confidence: r.confidence,
      effort: Number(r.effort_count),
      gotchas: Number(r.gotcha_count),
      multipliers: Number(r.multiplier_count)
    }))
  };
  const withEstimates = projects.filter((p) => p.total_expected_hours != null);
  const totalHours = withEstimates.reduce((s, p) => s + (p.total_expected_hours ?? 0), 0);
  const avgConfidence = withEstimates.length > 0 ? withEstimates.reduce((s, p) => s + (p.confidence_score ?? 0), 0) / withEstimates.length : 0;
  const needsAttention = projects.filter(
    (p) => p.completeness_pct != null && p.completeness_pct < 50 || p.confidence_score != null && p.confidence_score < 40
  ).length;
  function toWeekKey(dateStr) {
    const dt = new Date(dateStr);
    const day = dt.getDay();
    const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(dt);
    monday.setDate(diff);
    return monday.toISOString().slice(0, 10);
  }
  const latestByAssessment = /* @__PURE__ */ new Map();
  const weeklyPortfolioAvg = /* @__PURE__ */ new Map();
  for (const snap of confidenceSnapshots) {
    latestByAssessment.set(snap.assessment_id, snap.confidence_score);
    const week = toWeekKey(snap.created_at);
    const scores = [...latestByAssessment.values()];
    const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
    weeklyPortfolioAvg.set(week, Math.round(avg * 10) / 10);
  }
  const confidenceTrend = [...weeklyPortfolioAvg.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([week, avg]) => ({ week, avg }));
  const topProjects = projects.slice(0, 5).map((p) => ({
    id: p.id,
    name: p.project_name,
    client: p.client_name,
    status: p.status,
    discovery: p.completeness_pct,
    confidence: p.confidence_score,
    hours: p.total_expected_hours,
    totalAssumptions: p.total_assumptions,
    validatedAssumptions: p.validated_assumptions,
    source: p.source_stack?.platform ?? null,
    target: p.target_stack?.infrastructure ?? null,
    created: p.created_at
  }));
  return {
    portfolio: {
      total: projects.length,
      totalHours,
      avgConfidence,
      needsAttention,
      withEstimates: withEstimates.length
    },
    confidenceTrend,
    pipeline,
    riskSummary,
    assumptionSummary,
    knowledgeHealth,
    clients: {
      total: clients.length,
      list: clients.slice(0, 4).map((c) => ({
        id: c.id,
        name: c.name,
        industry: c.industry
      }))
    },
    topProjects,
    recentReviews: recentReviews.map((r) => ({
      step: r.step,
      status: r.status,
      score: r.confidence_score,
      assessment_id: r.assessment_id,
      created: r.created_at
    }))
  };
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 4;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-CAOPH0fU.js')).default;
const server_id = "src/routes/+page.server.ts";
const imports = ["_app/immutable/nodes/4.3lHJjEqV.js","_app/immutable/chunks/Nq2m2xDw.js","_app/immutable/chunks/DcamcR-f.js","_app/immutable/chunks/tZfpQL7D.js","_app/immutable/chunks/D62f41K-.js","_app/immutable/chunks/DOdfwfvb.js","_app/immutable/chunks/B489Hgvz.js","_app/immutable/chunks/CTZ8dTRF.js","_app/immutable/chunks/COtyJqkZ.js","_app/immutable/chunks/D-Fef6i9.js","_app/immutable/chunks/jfJYy30P.js","_app/immutable/chunks/D4Xvn_HC.js","_app/immutable/chunks/bllHAThW.js","_app/immutable/chunks/DsmKcCbW.js","_app/immutable/chunks/DwGCDbOQ.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=4-CSHOK6by.js.map
