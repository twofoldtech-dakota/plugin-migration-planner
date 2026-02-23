import { e as error, j as json } from './index-wpIsICWW.js';
import { d as db } from './db-BWpbog7L.js';
import { g as getAnalysis } from './analysis-BcZv0btd.js';
import { g as getEstimate } from './estimates-zTf3XwgF.js';
import { g as getScopeExclusions } from './scope-exclusions-7kg0wvsO.js';
import { l as listWBSVersions, s as saveWBSSnapshot } from './wbs-_BnBrxIn.js';
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
function generateWBS(estimate, analysis, refinements, scopeExclusions) {
  const items = [];
  let nextTempId = -1;
  let globalSort = 0;
  const phases = estimate.phases ?? [];
  const assumptions = analysis?.assumptions ?? [];
  const risks = analysis?.risks ?? [];
  const chains = analysis?.dependency_chains ?? [];
  const excluded = scopeExclusions ?? /* @__PURE__ */ new Set();
  const blockedByMap = /* @__PURE__ */ new Map();
  const blocksMap = /* @__PURE__ */ new Map();
  for (const chain of chains) {
    const targets = Array.isArray(chain.to) ? chain.to : [chain.to];
    for (const to of targets) {
      if (!blockedByMap.has(to)) blockedByMap.set(to, []);
      blockedByMap.get(to).push(chain.from);
      if (!blocksMap.has(chain.from)) blocksMap.set(chain.from, []);
      blocksMap.get(chain.from).push(to);
    }
  }
  for (const phase of phases) {
    const inScopeComps = (phase.components ?? []).filter(
      (c) => !excluded.has(c.id)
    );
    if (inScopeComps.length === 0) continue;
    const epicTempId = nextTempId--;
    const epicHours = inScopeComps.reduce(
      (s, c) => s + (c.final_hours ?? c.base_hours ?? 0),
      0
    );
    items.push({
      temp_id: epicTempId,
      parent_temp_id: null,
      type: "epic",
      title: phase.name,
      description: phase.duration ? `Duration: ${phase.duration}` : "",
      hours: epicHours,
      base_hours: epicHours,
      role: null,
      phase_id: phase.id,
      component_id: "",
      labels: ["phase"],
      acceptance_criteria: [],
      priority: "high",
      confidence: "high",
      sort_order: globalSort++,
      source: "generated",
      blocked_by: blockedByMap.get(phase.id) ?? [],
      blocks: blocksMap.get(phase.id) ?? []
    });
    for (const comp of inScopeComps) {
      const storyTempId = nextTempId--;
      const compHours = comp.final_hours ?? comp.base_hours ?? 0;
      comp.firm_hours ?? compHours;
      const assumptionHours = comp.assumption_dependent_hours ?? 0;
      const confidence = assumptionHours > compHours * 0.5 ? "low" : assumptionHours > 0 ? "medium" : "high";
      items.push({
        temp_id: storyTempId,
        parent_temp_id: epicTempId,
        type: "story",
        title: comp.name,
        description: comp.includes ?? "",
        hours: compHours,
        base_hours: comp.base_hours ?? 0,
        role: null,
        phase_id: phase.id,
        component_id: comp.id,
        labels: ["component"],
        acceptance_criteria: comp.includes ? comp.includes.split(/[,;]/).map((s) => s.trim()).filter(Boolean) : [],
        priority: "medium",
        confidence,
        sort_order: globalSort++,
        source: "generated",
        blocked_by: blockedByMap.get(comp.id) ?? [],
        blocks: blocksMap.get(comp.id) ?? []
      });
      const byRole = comp.by_role ?? {};
      for (const [role, baseH] of Object.entries(byRole)) {
        const roleHours = baseH;
        {
          items.push({
            temp_id: nextTempId--,
            parent_temp_id: storyTempId,
            type: "task",
            title: `${formatRoleName(role)} work`,
            description: "",
            hours: roleHours,
            base_hours: baseH,
            role,
            phase_id: phase.id,
            component_id: comp.id,
            labels: ["role-task"],
            acceptance_criteria: [],
            priority: "medium",
            confidence: "medium",
            sort_order: globalSort++,
            source: "generated",
            blocked_by: [],
            blocks: []
          });
        }
      }
    }
    const phaseCompIds = new Set(inScopeComps.map((c) => c.id));
    const phaseAssumptions = assumptions.filter(
      (a) => a.validation_status !== "validated" && (a.affected_components ?? []).some((cid) => phaseCompIds.has(cid))
    );
    for (const assumption of phaseAssumptions) {
      items.push({
        temp_id: nextTempId--,
        parent_temp_id: epicTempId,
        type: "spike",
        title: `Validate: ${assumption.assumed_value || assumption.basis || assumption.id}`,
        description: `Assumption ${assumption.id}: ${assumption.basis ?? ""}`,
        hours: assumption.pessimistic_widening_hours ?? 4,
        base_hours: assumption.pessimistic_widening_hours ?? 4,
        role: null,
        phase_id: phase.id,
        component_id: "",
        labels: ["assumption", "validation"],
        acceptance_criteria: [
          "Assumption confirmed or invalidated with evidence",
          "Estimate updated if assumption was wrong"
        ],
        priority: "high",
        confidence: "low",
        sort_order: globalSort++,
        source: "generated",
        blocked_by: [],
        blocks: []
      });
    }
    const phaseRisks = risks.filter(
      (r) => (r.severity === "critical" || r.severity === "high") && r.mitigation && (r.linked_assumptions ?? []).some(
        (aId) => assumptions.filter((a) => a.id === aId).some(
          (a) => (a.affected_components ?? []).some((cid) => phaseCompIds.has(cid))
        )
      )
    );
    for (const risk of phaseRisks) {
      items.push({
        temp_id: nextTempId--,
        parent_temp_id: epicTempId,
        type: "story",
        title: `Mitigate: ${risk.description || risk.id}`,
        description: `Risk ${risk.id} (${risk.severity}): ${risk.mitigation ?? ""}`,
        hours: risk.estimated_hours_impact ?? 8,
        base_hours: risk.estimated_hours_impact ?? 8,
        role: null,
        phase_id: phase.id,
        component_id: "",
        labels: ["risk", "mitigation", risk.severity ?? ""],
        acceptance_criteria: [
          "Risk mitigation strategy implemented",
          "Contingency plan documented"
        ],
        priority: risk.severity === "critical" ? "critical" : "high",
        confidence: "low",
        sort_order: globalSort++,
        source: "generated",
        blocked_by: [],
        blocks: []
      });
    }
  }
  return items;
}
const GET = async ({ url }) => {
  const assessmentId = url.searchParams.get("assessment");
  if (!assessmentId) return error(400, "Missing assessment param");
  const versions = await listWBSVersions(db(), assessmentId);
  return json(versions);
};
const POST = async ({ request }) => {
  const body = await request.json();
  const { assessment_id } = body;
  if (!assessment_id) return error(400, "Missing assessment_id");
  const [estimate, analysis, scopeExclusions] = await Promise.all([
    getEstimate(db(), assessment_id),
    getAnalysis(db(), assessment_id),
    getScopeExclusions(db(), assessment_id)
  ]);
  if (!estimate) return error(400, "No estimate found for this assessment");
  const excluded = new Set(
    Object.entries(scopeExclusions?.exclusions ?? {}).filter(([, v]) => v).map(([k]) => k)
  );
  const items = generateWBS(estimate, analysis, null, excluded);
  const result = await saveWBSSnapshot(db(), {
    assessment_id,
    estimate_version: estimate.version ?? 1,
    items
  });
  return json(result);
};

export { GET, POST };
//# sourceMappingURL=_server.ts-BlQvMzph.js.map
