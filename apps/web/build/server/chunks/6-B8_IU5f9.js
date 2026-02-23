import { d as db, f as calibrations, g as calibrationPhases, h as calibrationComponents, i as calibrationAiTools, j as assessments } from './db-BWpbog7L.js';
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
  const [calRows, phaseRows, componentRows, aiToolRows, assessmentRows] = await Promise.all([
    d.select({
      id: calibrations.id,
      assessment_id: calibrations.assessment_id,
      engagement_name: calibrations.engagement_name,
      surprises: calibrations.surprises,
      created_at: calibrations.created_at
    }).from(calibrations),
    d.select({
      calibration_id: calibrationPhases.calibration_id,
      phase_id: calibrationPhases.phase_id,
      phase_name: calibrationPhases.phase_name,
      estimated_hours: calibrationPhases.estimated_hours,
      actual_hours: calibrationPhases.actual_hours,
      variance_percent: calibrationPhases.variance_percent
    }).from(calibrationPhases),
    d.select({
      calibration_id: calibrationComponents.calibration_id,
      component_id: calibrationComponents.component_id,
      estimated_hours: calibrationComponents.estimated_hours,
      actual_hours: calibrationComponents.actual_hours,
      variance_percent: calibrationComponents.variance_percent
    }).from(calibrationComponents),
    d.select({
      calibration_id: calibrationAiTools.calibration_id,
      tool_id: calibrationAiTools.tool_id,
      tool_name: calibrationAiTools.tool_name,
      was_used: calibrationAiTools.was_used,
      estimated_savings_hours: calibrationAiTools.estimated_savings_hours,
      actual_savings_hours: calibrationAiTools.actual_savings_hours
    }).from(calibrationAiTools),
    d.select({
      id: assessments.id,
      project_name: assessments.project_name
    }).from(assessments)
  ]);
  const assessmentMap = new Map(assessmentRows.map((a) => [a.id, a.project_name]));
  const scatterData = phaseRows.map((p) => ({
    x: p.estimated_hours,
    y: p.actual_hours,
    label: p.phase_name || p.phase_id
  }));
  const phaseMap = /* @__PURE__ */ new Map();
  for (const p of phaseRows) {
    const name = p.phase_name || p.phase_id;
    const entry = phaseMap.get(name) ?? { total: 0, count: 0 };
    entry.total += p.variance_percent;
    entry.count += 1;
    phaseMap.set(name, entry);
  }
  const phaseVariance = [...phaseMap.entries()].map(([label, { total, count }]) => ({
    label,
    value: Math.round(total / count * 10) / 10
  }));
  let usedCount = 0;
  let notUsedCount = 0;
  for (const t of aiToolRows) {
    if (t.was_used) {
      usedCount++;
    } else {
      notUsedCount++;
    }
  }
  const aiToolUsage = [
    { label: "Used", value: usedCount, color: "var(--color-success)" },
    { label: "Not Used", value: notUsedCount, color: "var(--color-text-muted)" }
  ];
  const surprises = [];
  for (const cal of calRows) {
    const raw = cal.surprises;
    if (Array.isArray(raw)) {
      for (const s of raw) {
        if (s && typeof s === "object") {
          const entry = s;
          surprises.push({
            description: String(entry.description ?? entry.name ?? ""),
            impact: String(entry.impact ?? entry.hours_impact ?? ""),
            project: assessmentMap.get(cal.assessment_id) ?? cal.engagement_name
          });
        }
      }
    }
  }
  const totalCalibrations = calRows.length;
  const allVariances = phaseRows.map((p) => p.variance_percent);
  const avgVariance = allVariances.length > 0 ? Math.round(
    allVariances.reduce((s, v) => s + Math.abs(v), 0) / allVariances.length * 10
  ) / 10 : 0;
  const overEstimated = allVariances.filter((v) => v > 0).length;
  const underEstimated = allVariances.filter((v) => v < 0).length;
  return {
    scatterData,
    phaseVariance,
    aiToolUsage,
    surprises,
    totalCalibrations,
    avgVariance,
    overEstimated,
    underEstimated
  };
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 6;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BWyCuVV-.js')).default;
const server_id = "src/routes/analytics/calibration/+page.server.ts";
const imports = ["_app/immutable/nodes/6.Brgzkkht.js","_app/immutable/chunks/Nq2m2xDw.js","_app/immutable/chunks/DcamcR-f.js","_app/immutable/chunks/tZfpQL7D.js","_app/immutable/chunks/D62f41K-.js","_app/immutable/chunks/DOdfwfvb.js","_app/immutable/chunks/D-Fef6i9.js","_app/immutable/chunks/CTZ8dTRF.js","_app/immutable/chunks/jfJYy30P.js","_app/immutable/chunks/14L2tLyd.js","_app/immutable/chunks/B489Hgvz.js","_app/immutable/chunks/Dt-GL34s.js","_app/immutable/chunks/COtyJqkZ.js","_app/immutable/chunks/bllHAThW.js","_app/immutable/chunks/DsmKcCbW.js","_app/immutable/chunks/DwGCDbOQ.js","_app/immutable/chunks/OdoaFVBC.js","_app/immutable/chunks/CFGnnNQp.js","_app/immutable/chunks/BjgLYfVN.js","_app/immutable/chunks/D7Ames6W.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=6-B8_IU5f9.js.map
