import { e as error, j as json } from './index-wpIsICWW.js';
import { d as db } from './db-BWpbog7L.js';
import { g as getAnalysis } from './analysis-BcZv0btd.js';
import { g as getEstimate } from './estimates-zTf3XwgF.js';
import { l as listTeamVersions, s as saveTeamSnapshot } from './team-Utu5T08G.js';
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

function formatRoleName(role) {
  return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function parseRateRange(range) {
  const nums = range.match(/\d+/g);
  if (!nums || nums.length === 0) return { min: 100, max: 200 };
  if (nums.length === 1) {
    const v = parseInt(nums[0], 10);
    return { min: v, max: v };
  }
  return { min: parseInt(nums[0], 10), max: parseInt(nums[1], 10) };
}
function recommendTeam(estimate, heuristicRoles, activeMultipliers, risks, clientProficiencies) {
  const phases = estimate.phases ?? [];
  const roles = [];
  const roleMap = new Map(roles.map((r) => [r.role_id, r]));
  const roleHoursTotal = /* @__PURE__ */ new Map();
  const rolePhaseHours = /* @__PURE__ */ new Map();
  const hasHighMultiplier = (activeMultipliers ?? []).some(
    (m) => (m.factor ?? 1) >= 1.3
  );
  for (const phase of phases) {
    for (const comp of phase.components ?? []) {
      const byRole = comp.by_role ?? {};
      for (const [role, hours] of Object.entries(byRole)) {
        roleHoursTotal.set(role, (roleHoursTotal.get(role) ?? 0) + hours);
        if (!rolePhaseHours.has(role)) rolePhaseHours.set(role, /* @__PURE__ */ new Map());
        const phaseMap = rolePhaseHours.get(role);
        if (!phaseMap.has(phase.id)) {
          phaseMap.set(phase.id, { hours: 0, phaseName: phase.name, duration: phase.duration });
        }
        phaseMap.get(phase.id).hours += hours;
      }
    }
  }
  const teamRoles = [];
  let sortOrder = 0;
  for (const [roleId, totalHours] of roleHoursTotal.entries()) {
    const roleDef = roleMap.get(roleId);
    const rateRange = roleDef?.typical_rate_range ? parseRateRange(roleDef.typical_rate_range) : { min: 100, max: 200 };
    let allocation;
    if (totalHours < 80) allocation = "contractor";
    else if (totalHours < 160) allocation = "part-time";
    else allocation = "full-time";
    let seniority;
    if (hasHighMultiplier) seniority = "senior";
    else if (totalHours < 40) seniority = "junior";
    else seniority = "mid";
    const phaseBreakdown = [];
    const phaseMap = rolePhaseHours.get(roleId) ?? /* @__PURE__ */ new Map();
    for (const [phaseId, data] of phaseMap.entries()) {
      const phaseWeeks = data.duration ? parseInt(data.duration, 10) || 4 : 4;
      const headcount2 = Math.ceil(data.hours / (40 * 0.8 * phaseWeeks));
      phaseBreakdown.push({
        phase_id: phaseId,
        phase_name: data.phaseName,
        hours: Math.round(data.hours * 10) / 10,
        headcount: Math.max(1, headcount2)
      });
    }
    const headcount = Math.max(
      1,
      Math.max(...phaseBreakdown.map((p) => p.headcount))
    );
    teamRoles.push({
      role_id: roleId,
      role_name: formatRoleName(roleId),
      total_hours: Math.round(totalHours * 10) / 10,
      base_hours: Math.round(totalHours * 10) / 10,
      headcount,
      allocation,
      seniority,
      rate_min: rateRange.min,
      rate_max: rateRange.max,
      phases: phaseBreakdown,
      notes: roleDef?.description ?? "",
      source: "generated",
      sort_order: sortOrder++
    });
  }
  teamRoles.sort((a, b) => b.total_hours - a.total_hours);
  teamRoles.forEach((r, i) => r.sort_order = i);
  const costByRole = {};
  let costLow = 0;
  let costHigh = 0;
  for (const role of teamRoles) {
    const low = role.total_hours * role.rate_min;
    const high = role.total_hours * role.rate_max;
    const expected = (low + high) / 2;
    costByRole[role.role_id] = {
      low: Math.round(low),
      expected: Math.round(expected),
      high: Math.round(high),
      hours: role.total_hours
    };
    costLow += low;
    costHigh += high;
  }
  const costProjection = {
    low: Math.round(costLow),
    expected: Math.round((costLow + costHigh) / 2),
    high: Math.round(costHigh),
    by_role: costByRole
  };
  const phaseStaffing = [];
  for (const phase of phases) {
    const phaseRoles = [];
    for (const role of teamRoles) {
      const phaseData = role.phases.find((p) => p.phase_id === phase.id);
      if (phaseData) {
        phaseRoles.push({
          role_id: role.role_id,
          role_name: role.role_name,
          hours: phaseData.hours,
          headcount: phaseData.headcount
        });
      }
    }
    if (phaseRoles.length > 0) {
      phaseStaffing.push({
        phase_id: phase.id,
        phase_name: phase.name,
        duration: phase.duration,
        roles: phaseRoles,
        total_headcount: phaseRoles.reduce((s, r) => s + r.headcount, 0)
      });
    }
  }
  const hiringNotes = [];
  for (const role of teamRoles) {
    if (role.allocation === "contractor") {
      hiringNotes.push(
        `${role.role_name}: ${Math.round(role.total_hours)}h total — consider contractor or short-term engagement`
      );
    }
  }
  const highRisks = (risks ?? []).filter(
    (r) => r.severity === "critical" || r.severity === "high"
  ).length;
  if (highRisks >= 3) {
    hiringNotes.push(
      `${highRisks} high-severity risks identified — consider adding a dedicated risk manager or senior architect`
    );
  }
  return {
    roles: teamRoles,
    cost_projection: costProjection,
    phase_staffing: phaseStaffing,
    hiring_notes: hiringNotes,
    assumptions: {
      utilization_rate: 0.8,
      default_phase_weeks: 4,
      rate_source: "heuristic_knowledge_pack"
    }
  };
}
const GET = async ({ url }) => {
  const assessmentId = url.searchParams.get("assessment");
  if (!assessmentId) return error(400, "Missing assessment param");
  const versions = await listTeamVersions(db(), assessmentId);
  return json(versions);
};
const POST = async ({ request }) => {
  const body = await request.json();
  const { assessment_id } = body;
  if (!assessment_id) return error(400, "Missing assessment_id");
  const [estimate, analysis] = await Promise.all([
    getEstimate(db(), assessment_id),
    getAnalysis(db(), assessment_id)
  ]);
  if (!estimate) return error(400, "No estimate found for this assessment");
  const recommendation = recommendTeam(
    estimate,
    void 0,
    // heuristic roles — would need composed heuristics
    analysis?.active_multipliers,
    analysis?.risks
  );
  const result = await saveTeamSnapshot(db(), {
    assessment_id,
    estimate_version: estimate.version ?? 1,
    assumptions: recommendation.assumptions,
    cost_projection: recommendation.cost_projection,
    phase_staffing: recommendation.phase_staffing,
    hiring_notes: recommendation.hiring_notes,
    notes: "",
    roles: recommendation.roles
  });
  return json(result);
};

export { GET, POST };
//# sourceMappingURL=_server.ts-CuHJkOmm.js.map
