/**
 * Team Recommender — Pure function that generates team composition
 * from estimate data, heuristic roles, and analysis.
 */

export interface TeamRoleOutput {
  role_id: string;
  role_name: string;
  total_hours: number;
  base_hours: number;
  headcount: number;
  allocation: string;
  seniority: string;
  rate_min: number;
  rate_max: number;
  phases: Array<{ phase_id: string; phase_name: string; hours: number; headcount: number }>;
  notes: string;
  source: 'generated';
  sort_order: number;
}

export interface CostProjection {
  low: number;
  expected: number;
  high: number;
  by_role: Record<string, { low: number; expected: number; high: number; hours: number }>;
}

export interface PhaseStaffingEntry {
  phase_id: string;
  phase_name: string;
  duration?: string;
  roles: Array<{ role_id: string; role_name: string; hours: number; headcount: number }>;
  total_headcount: number;
}

export interface TeamRecommendation {
  roles: TeamRoleOutput[];
  cost_projection: CostProjection;
  phase_staffing: PhaseStaffingEntry[];
  hiring_notes: string[];
  assumptions: Record<string, unknown>;
}

interface EstimatePhase {
  id: string;
  name: string;
  duration?: string;
  components?: Array<{
    id: string;
    name: string;
    final_hours?: number;
    base_hours?: number;
    by_role?: Record<string, number>;
    multipliers_applied?: unknown[];
  }>;
}

interface HeuristicRole {
  role_id: string;
  description?: string;
  typical_rate_range?: string;
}

interface ActiveMultiplier {
  id?: string;
  name?: string;
  factor?: number;
}

function formatRoleName(role: string): string {
  return role
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function parseRateRange(range: string): { min: number; max: number } {
  const nums = range.match(/\d+/g);
  if (!nums || nums.length === 0) return { min: 100, max: 200 };
  if (nums.length === 1) {
    const v = parseInt(nums[0], 10);
    return { min: v, max: v };
  }
  return { min: parseInt(nums[0], 10), max: parseInt(nums[1], 10) };
}

export function recommendTeam(
  estimate: { phases?: EstimatePhase[]; version?: number },
  heuristicRoles?: HeuristicRole[],
  activeMultipliers?: ActiveMultiplier[],
  risks?: Array<{ severity?: string }>,
  clientProficiencies?: Record<string, { proficiency?: string }>
): TeamRecommendation {
  const phases = estimate.phases ?? [];
  const roles = heuristicRoles ?? [];
  const roleMap = new Map(roles.map((r) => [r.role_id, r]));

  // 1. Aggregate hours by role across all components
  const roleHoursTotal = new Map<string, number>();
  const rolePhaseHours = new Map<string, Map<string, { hours: number; phaseName: string; duration?: string }>>();

  // Check if high-complexity multipliers are active
  const hasHighMultiplier = (activeMultipliers ?? []).some(
    (m) => (m.factor ?? 1) >= 1.3
  );

  for (const phase of phases) {
    for (const comp of phase.components ?? []) {
      const byRole = comp.by_role ?? {};
      for (const [role, hours] of Object.entries(byRole)) {
        roleHoursTotal.set(role, (roleHoursTotal.get(role) ?? 0) + hours);

        if (!rolePhaseHours.has(role)) rolePhaseHours.set(role, new Map());
        const phaseMap = rolePhaseHours.get(role)!;
        if (!phaseMap.has(phase.id)) {
          phaseMap.set(phase.id, { hours: 0, phaseName: phase.name, duration: phase.duration });
        }
        phaseMap.get(phase.id)!.hours += hours;
      }
    }
  }

  // 2. Build role recommendations
  const teamRoles: TeamRoleOutput[] = [];
  let sortOrder = 0;

  for (const [roleId, totalHours] of roleHoursTotal.entries()) {
    const roleDef = roleMap.get(roleId);
    const rateRange = roleDef?.typical_rate_range
      ? parseRateRange(roleDef.typical_rate_range)
      : { min: 100, max: 200 };

    // Allocation
    let allocation: string;
    if (totalHours < 80) allocation = 'contractor';
    else if (totalHours < 160) allocation = 'part-time';
    else allocation = 'full-time';

    // Seniority
    let seniority: string;
    if (hasHighMultiplier) seniority = 'senior';
    else if (totalHours < 40) seniority = 'junior';
    else seniority = 'mid';

    // Per-phase breakdown
    const phaseBreakdown: TeamRoleOutput['phases'] = [];
    const phaseMap = rolePhaseHours.get(roleId) ?? new Map();

    for (const [phaseId, data] of phaseMap.entries()) {
      // Estimate phase weeks from duration or default 4
      const phaseWeeks = data.duration
        ? parseInt(data.duration, 10) || 4
        : 4;
      const headcount = Math.ceil(data.hours / (40 * 0.8 * phaseWeeks));

      phaseBreakdown.push({
        phase_id: phaseId,
        phase_name: data.phaseName,
        hours: Math.round(data.hours * 10) / 10,
        headcount: Math.max(1, headcount),
      });
    }

    // Overall headcount = max across phases
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
      notes: roleDef?.description ?? '',
      source: 'generated',
      sort_order: sortOrder++,
    });
  }

  // Sort by hours descending
  teamRoles.sort((a, b) => b.total_hours - a.total_hours);
  teamRoles.forEach((r, i) => (r.sort_order = i));

  // 3. Cost projection
  const costByRole: CostProjection['by_role'] = {};
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
      hours: role.total_hours,
    };
    costLow += low;
    costHigh += high;
  }

  const costProjection: CostProjection = {
    low: Math.round(costLow),
    expected: Math.round((costLow + costHigh) / 2),
    high: Math.round(costHigh),
    by_role: costByRole,
  };

  // 4. Phase staffing
  const phaseStaffing: PhaseStaffingEntry[] = [];
  for (const phase of phases) {
    const phaseRoles: PhaseStaffingEntry['roles'] = [];
    for (const role of teamRoles) {
      const phaseData = role.phases.find((p) => p.phase_id === phase.id);
      if (phaseData) {
        phaseRoles.push({
          role_id: role.role_id,
          role_name: role.role_name,
          hours: phaseData.hours,
          headcount: phaseData.headcount,
        });
      }
    }
    if (phaseRoles.length > 0) {
      phaseStaffing.push({
        phase_id: phase.id,
        phase_name: phase.name,
        duration: phase.duration,
        roles: phaseRoles,
        total_headcount: phaseRoles.reduce((s, r) => s + r.headcount, 0),
      });
    }
  }

  // 5. Hiring notes
  const hiringNotes: string[] = [];

  // Flag short-duration roles
  for (const role of teamRoles) {
    if (role.allocation === 'contractor') {
      hiringNotes.push(
        `${role.role_name}: ${Math.round(role.total_hours)}h total — consider contractor or short-term engagement`
      );
    }
  }

  // Flag skill gaps from client proficiencies
  if (clientProficiencies) {
    for (const role of teamRoles) {
      const proficiency = clientProficiencies[role.role_id];
      if (proficiency?.proficiency === 'beginner' || proficiency?.proficiency === 'none') {
        hiringNotes.push(
          `${role.role_name}: Client team has low proficiency — may need external hire or training`
        );
      }
    }
  }

  // Flag if many high-severity risks
  const highRisks = (risks ?? []).filter(
    (r) => r.severity === 'critical' || r.severity === 'high'
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
      rate_source: 'heuristic_knowledge_pack',
    },
  };
}
