import { d as db, s as sql, l as estimateComponents, m as activeMultipliers, e as estimateSnapshots } from './db-BWpbog7L.js';
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
  const [latestSnapshots, allComponents, multiplierFreq] = await Promise.all([
    // Latest estimate snapshot per assessment using DISTINCT ON
    d.execute(sql`
			SELECT DISTINCT ON (es.assessment_id)
				es.id,
				es.assessment_id,
				a.project_name,
				es.version,
				es.confidence_score,
				es.total_base_hours,
				es.total_gotcha_hours,
				es.total_expected_hours,
				es.assumption_widening_hours,
				es.total_by_role,
				es.created_at
			FROM estimate_snapshots es
			JOIN assessments a ON a.id = es.assessment_id
			ORDER BY es.assessment_id, es.version DESC
		`),
    // All estimate components with role breakdown
    d.select({
      snapshot_id: estimateComponents.snapshot_id,
      phase_id: estimateComponents.phase_id,
      phase_name: estimateComponents.phase_name,
      component_id: estimateComponents.component_id,
      component_name: estimateComponents.component_name,
      base_hours: estimateComponents.base_hours,
      final_hours: estimateComponents.final_hours,
      by_role: estimateComponents.by_role
    }).from(estimateComponents),
    // Active multipliers frequency
    d.select({
      multiplier_id: activeMultipliers.multiplier_id,
      name: activeMultipliers.name,
      factor: activeMultipliers.factor,
      cnt: sql`count(*)`
    }).from(activeMultipliers).groupBy(
      activeMultipliers.multiplier_id,
      activeMultipliers.name,
      activeMultipliers.factor
    ).orderBy(sql`count(*) desc`)
  ]);
  const snapshots = latestSnapshots.rows;
  const aggBase = snapshots.reduce((s, r) => s + (r.total_base_hours ?? 0), 0);
  const aggGotcha = snapshots.reduce((s, r) => s + (r.total_gotcha_hours ?? 0), 0);
  const aggWidening = snapshots.reduce((s, r) => s + (r.assumption_widening_hours ?? 0), 0);
  const aggExpected = snapshots.reduce((s, r) => s + (r.total_expected_hours ?? 0), 0);
  const aggMultiplierDelta = aggExpected - aggBase - aggGotcha - aggWidening;
  const waterfallData = [
    { label: "Base Hours", value: Math.round(aggBase) },
    { label: "+ Multipliers", value: Math.round(aggMultiplierDelta) },
    { label: "+ Gotchas", value: Math.round(aggGotcha) },
    { label: "+ Widening", value: Math.round(aggWidening) },
    { label: "Total", value: Math.round(aggExpected), isTotal: true }
  ];
  const phaseRoles = /* @__PURE__ */ new Map();
  const allRoleIds = /* @__PURE__ */ new Set();
  const latestSnapshotIds = new Set(snapshots.map((s) => s.id));
  for (const comp of allComponents) {
    if (!latestSnapshotIds.has(comp.snapshot_id)) continue;
    const key = comp.phase_id || "unknown";
    if (!phaseRoles.has(key)) {
      phaseRoles.set(key, { label: comp.phase_name || key, roles: {} });
    }
    const entry = phaseRoles.get(key);
    const roleObj = comp.by_role ?? {};
    for (const [role, hours] of Object.entries(roleObj)) {
      if (typeof hours === "number") {
        entry.roles[role] = (entry.roles[role] ?? 0) + hours;
        allRoleIds.add(role);
      }
    }
  }
  const roleColors = {
    "solution-architect": "#4f46e5",
    "devops-engineer": "#06b6d4",
    "sitecore-developer": "#f59e0b",
    "qa-engineer": "#10b981",
    "frontend-developer": "#ec4899",
    "content-strategist": "#8b5cf6",
    "project-manager": "#f97316"
  };
  const fallbackColors = ["#6366f1", "#14b8a6", "#ef4444", "#84cc16", "#a855f7", "#e11d48"];
  const roleSeriesArr = [...allRoleIds].map((roleId, i) => ({
    id: roleId,
    label: roleId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    color: roleColors[roleId] ?? fallbackColors[i % fallbackColors.length]
  }));
  const roleBreakdownData = [...phaseRoles.values()].map((phase) => ({
    label: phase.label,
    values: phase.roles
  }));
  const multiplierImpact = multiplierFreq.map((m) => ({
    label: m.name || m.multiplier_id,
    value: Math.round(Number(m.cnt) * (m.factor - 1) * 100) / 100,
    detail: `${Number(m.cnt)}x applied, factor ${m.factor}x`
  }));
  const componentScatter = allComponents.filter((c) => latestSnapshotIds.has(c.snapshot_id) && c.base_hours > 0).map((c) => ({
    x: c.base_hours,
    y: c.final_hours,
    label: c.component_name || c.component_id
  }));
  const [versionCountRow] = await d.select({ cnt: sql`count(*)` }).from(estimateSnapshots);
  const totalVersions = Number(versionCountRow?.cnt ?? 0);
  const confidenceScores = snapshots.map((s) => s.confidence_score).filter((c) => c > 0);
  const avgConfidence = confidenceScores.length > 0 ? Math.round(
    confidenceScores.reduce((s, c) => s + c, 0) / confidenceScores.length * 10
  ) / 10 : 0;
  const totalHours = Math.round(aggExpected);
  const avgGotchaPct = aggBase > 0 ? Math.round(aggGotcha / aggBase * 1e3) / 10 : 0;
  return {
    kpis: {
      totalVersions,
      avgConfidence,
      totalHours,
      avgGotchaPct
    },
    waterfallData,
    roleBreakdown: {
      data: roleBreakdownData,
      series: roleSeriesArr
    },
    multiplierImpact,
    componentScatter
  };
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 8;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DQA9bFOt.js')).default;
const server_id = "src/routes/analytics/estimates/+page.server.ts";
const imports = ["_app/immutable/nodes/8.DQU3g7xS.js","_app/immutable/chunks/Nq2m2xDw.js","_app/immutable/chunks/DcamcR-f.js","_app/immutable/chunks/tZfpQL7D.js","_app/immutable/chunks/DOdfwfvb.js","_app/immutable/chunks/14L2tLyd.js","_app/immutable/chunks/B489Hgvz.js","_app/immutable/chunks/D-Fef6i9.js","_app/immutable/chunks/CTZ8dTRF.js","_app/immutable/chunks/jfJYy30P.js","_app/immutable/chunks/Dt-GL34s.js","_app/immutable/chunks/COtyJqkZ.js","_app/immutable/chunks/bllHAThW.js","_app/immutable/chunks/DsmKcCbW.js","_app/immutable/chunks/DwGCDbOQ.js","_app/immutable/chunks/D62f41K-.js","_app/immutable/chunks/CFGnnNQp.js","_app/immutable/chunks/BjgLYfVN.js","_app/immutable/chunks/OdoaFVBC.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=8-C2cUKNcl.js.map
