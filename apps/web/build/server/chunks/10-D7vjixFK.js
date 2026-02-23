import { d as db, r as risks, s as sql, a as assumptions, j as assessments } from './db-BWpbog7L.js';
import { q as queryProjects } from './analytics-BZLNJxd8.js';
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
  const [{ projects }, riskMatrix, validationVelocity, clientDist] = await Promise.all([
    queryProjects(d, { limit: 200 }),
    // Risk severity x likelihood cross-tab
    d.select({
      severity: risks.severity,
      likelihood: risks.likelihood,
      cnt: sql`count(*)`
    }).from(risks).groupBy(risks.severity, risks.likelihood),
    // Assumption validation velocity by week
    d.select({
      week: sql`to_char(date_trunc('week', ${assumptions.created_at}::timestamp), 'YYYY-MM-DD')`,
      validation_status: assumptions.validation_status,
      cnt: sql`count(*)`
    }).from(assumptions).groupBy(
      sql`date_trunc('week', ${assumptions.created_at}::timestamp)`,
      assumptions.validation_status
    ).orderBy(sql`date_trunc('week', ${assumptions.created_at}::timestamp)`),
    // Client distribution
    d.select({
      client_name: assessments.client_name,
      cnt: sql`count(*)`
    }).from(assessments).groupBy(assessments.client_name).orderBy(sql`count(*) desc`)
  ]);
  const statusMap = {
    planning: 0,
    discovery: 0,
    analysis: 0,
    estimation: 0,
    complete: 0
  };
  for (const p of projects) {
    const s = (p.status ?? "discovery").toLowerCase();
    if (s in statusMap) {
      statusMap[s]++;
    } else {
      statusMap["planning"]++;
    }
  }
  const pipeline = Object.entries(statusMap).map(([label, value]) => ({
    label: label.charAt(0).toUpperCase() + label.slice(1),
    value
  }));
  const hoursPerProject = projects.filter((p) => p.total_expected_hours != null && p.total_expected_hours > 0).map((p) => ({
    label: p.project_name,
    value: Math.round(p.total_expected_hours ?? 0)
  })).sort((a, b) => b.value - a.value);
  const severityRows = ["critical", "high", "medium", "low"];
  const likelihoodCols = ["high", "medium", "low"];
  const riskCells = riskMatrix.map((r) => ({
    row: r.severity || "medium",
    col: r.likelihood || "medium",
    value: Number(r.cnt)
  }));
  const weeklyValidated = /* @__PURE__ */ new Map();
  for (const row of validationVelocity) {
    if (row.validation_status === "validated") {
      weeklyValidated.set(row.week, Number(row.cnt));
    }
  }
  const validationData = [...weeklyValidated.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([week, count]) => ({
    label: week,
    value: count
  }));
  const chartColors = [
    "#4f46e5",
    "#06b6d4",
    "#f59e0b",
    "#ef4444",
    "#10b981",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f97316",
    "#6366f1"
  ];
  const clientDistribution = clientDist.filter((c) => c.client_name).map((c, i) => ({
    label: c.client_name || "Unknown",
    value: Number(c.cnt),
    color: chartColors[i % chartColors.length]
  }));
  const totalAssessments = projects.length;
  const totalHours = Math.round(
    projects.reduce((s, p) => s + (p.total_expected_hours ?? 0), 0)
  );
  const [openRiskRow] = await d.select({ cnt: sql`count(*)` }).from(risks).where(sql`${risks.status} = 'open'`);
  const openRisks = Number(openRiskRow?.cnt ?? 0);
  const totalAssumptions = validationVelocity.reduce((s, r) => s + Number(r.cnt), 0);
  const validatedAssumptions = validationVelocity.filter((r) => r.validation_status === "validated").reduce((s, r) => s + Number(r.cnt), 0);
  const assumptionValidationPct = totalAssumptions > 0 ? Math.round(validatedAssumptions / totalAssumptions * 1e3) / 10 : 0;
  return {
    kpis: {
      totalAssessments,
      totalHours,
      openRisks,
      assumptionValidationPct
    },
    pipeline,
    hoursPerProject,
    riskMatrix: {
      cells: riskCells,
      rows: severityRows,
      cols: likelihoodCols
    },
    validationVelocity: validationData,
    clientDistribution
  };
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 10;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-CXP_5L__.js')).default;
const server_id = "src/routes/analytics/portfolio/+page.server.ts";
const imports = ["_app/immutable/nodes/10.DtqO2n8W.js","_app/immutable/chunks/Nq2m2xDw.js","_app/immutable/chunks/DcamcR-f.js","_app/immutable/chunks/tZfpQL7D.js","_app/immutable/chunks/DOdfwfvb.js","_app/immutable/chunks/14L2tLyd.js","_app/immutable/chunks/B489Hgvz.js","_app/immutable/chunks/D-Fef6i9.js","_app/immutable/chunks/CTZ8dTRF.js","_app/immutable/chunks/jfJYy30P.js","_app/immutable/chunks/Dt-GL34s.js","_app/immutable/chunks/COtyJqkZ.js","_app/immutable/chunks/bllHAThW.js","_app/immutable/chunks/DsmKcCbW.js","_app/immutable/chunks/DwGCDbOQ.js","_app/immutable/chunks/BjgLYfVN.js","_app/immutable/chunks/D62f41K-.js","_app/immutable/chunks/CFGnnNQp.js","_app/immutable/chunks/D7Ames6W.js","_app/immutable/chunks/DrFOKtAU.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=10-D7vjixFK.js.map
