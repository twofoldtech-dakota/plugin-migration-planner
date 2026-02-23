/**
 * WBS Generator — Pure function that converts estimate + analysis data
 * into a flat array of work items with temporary parent references.
 */

export interface WorkItemInput {
  temp_id: number;
  parent_temp_id: number | null;
  type: 'epic' | 'feature' | 'story' | 'task' | 'spike';
  title: string;
  description: string;
  hours: number;
  base_hours: number;
  role: string | null;
  phase_id: string;
  component_id: string;
  labels: string[];
  acceptance_criteria: string[];
  priority: string;
  confidence: string;
  sort_order: number;
  source: 'generated';
  blocked_by: string[];
  blocks: string[];
}

interface EstimatePhase {
  id: string;
  name: string;
  duration?: string;
  components?: EstimateComponent[];
}

interface EstimateComponent {
  id: string;
  name: string;
  base_hours?: number;
  final_hours?: number;
  firm_hours?: number;
  assumption_dependent_hours?: number;
  by_role?: Record<string, number>;
  includes?: string;
  assumptions_affecting?: string[];
}

interface AnalysisData {
  assumptions?: Array<{
    id: string;
    assumed_value?: string;
    basis?: string;
    validation_status?: string;
    affected_components?: string[];
    pessimistic_widening_hours?: number;
  }>;
  risks?: Array<{
    id: string;
    description?: string;
    severity?: string;
    estimated_hours_impact?: number;
    mitigation?: string;
    category?: string;
    linked_assumptions?: string[];
  }>;
  dependency_chains?: Array<{
    from: string;
    to: string | string[];
    type?: string;
  }>;
}

interface Refinements {
  roleOverrides?: Record<string, Record<string, number>>;
  roleTasks?: Record<string, Record<string, string[]>>;
}

function formatRoleName(role: string): string {
  return role
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function generateWBS(
  estimate: { phases?: EstimatePhase[]; version?: number },
  analysis: AnalysisData | null,
  refinements?: Refinements | null,
  scopeExclusions?: Set<string>
): WorkItemInput[] {
  const items: WorkItemInput[] = [];
  let nextTempId = -1;
  let globalSort = 0;

  const phases = estimate.phases ?? [];
  const assumptions = analysis?.assumptions ?? [];
  const risks = analysis?.risks ?? [];
  const chains = analysis?.dependency_chains ?? [];
  const excluded = scopeExclusions ?? new Set<string>();

  // Build dependency map for blocked_by/blocks
  const blockedByMap = new Map<string, string[]>();
  const blocksMap = new Map<string, string[]>();
  for (const chain of chains) {
    const targets = Array.isArray(chain.to) ? chain.to : [chain.to];
    for (const to of targets) {
      if (!blockedByMap.has(to)) blockedByMap.set(to, []);
      blockedByMap.get(to)!.push(chain.from);
      if (!blocksMap.has(chain.from)) blocksMap.set(chain.from, []);
      blocksMap.get(chain.from)!.push(to);
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

    // Phase → Epic
    items.push({
      temp_id: epicTempId,
      parent_temp_id: null,
      type: 'epic',
      title: phase.name,
      description: phase.duration ? `Duration: ${phase.duration}` : '',
      hours: epicHours,
      base_hours: epicHours,
      role: null,
      phase_id: phase.id,
      component_id: '',
      labels: ['phase'],
      acceptance_criteria: [],
      priority: 'high',
      confidence: 'high',
      sort_order: globalSort++,
      source: 'generated',
      blocked_by: blockedByMap.get(phase.id) ?? [],
      blocks: blocksMap.get(phase.id) ?? [],
    });

    // Component → Story under epic
    for (const comp of inScopeComps) {
      const storyTempId = nextTempId--;
      const compHours = comp.final_hours ?? comp.base_hours ?? 0;
      const firmHours = comp.firm_hours ?? compHours;
      const assumptionHours = comp.assumption_dependent_hours ?? 0;
      const confidence =
        assumptionHours > compHours * 0.5
          ? 'low'
          : assumptionHours > 0
            ? 'medium'
            : 'high';

      items.push({
        temp_id: storyTempId,
        parent_temp_id: epicTempId,
        type: 'story',
        title: comp.name,
        description: comp.includes ?? '',
        hours: compHours,
        base_hours: comp.base_hours ?? 0,
        role: null,
        phase_id: phase.id,
        component_id: comp.id,
        labels: ['component'],
        acceptance_criteria: comp.includes
          ? comp.includes.split(/[,;]/).map((s) => s.trim()).filter(Boolean)
          : [],
        priority: 'medium',
        confidence,
        sort_order: globalSort++,
        source: 'generated',
        blocked_by: blockedByMap.get(comp.id) ?? [],
        blocks: blocksMap.get(comp.id) ?? [],
      });

      // Role tasks → Task under story
      const byRole = comp.by_role ?? {};
      const roleTasks = refinements?.roleTasks?.[comp.id];
      const roleOverrides = refinements?.roleOverrides?.[comp.id];

      for (const [role, baseH] of Object.entries(byRole)) {
        const roleHours = roleOverrides?.[role] ?? baseH;
        const tasks = roleTasks?.[role];

        if (tasks && tasks.length > 0) {
          // Distribute hours evenly across tasks
          const perTask = roleHours / tasks.length;
          for (const taskTitle of tasks) {
            items.push({
              temp_id: nextTempId--,
              parent_temp_id: storyTempId,
              type: 'task',
              title: taskTitle,
              description: '',
              hours: Math.round(perTask * 10) / 10,
              base_hours: Math.round(perTask * 10) / 10,
              role,
              phase_id: phase.id,
              component_id: comp.id,
              labels: ['role-task'],
              acceptance_criteria: [],
              priority: 'medium',
              confidence: 'medium',
              sort_order: globalSort++,
              source: 'generated',
              blocked_by: [],
              blocks: [],
            });
          }
        } else {
          // Single task per role
          items.push({
            temp_id: nextTempId--,
            parent_temp_id: storyTempId,
            type: 'task',
            title: `${formatRoleName(role)} work`,
            description: '',
            hours: roleHours,
            base_hours: baseH,
            role,
            phase_id: phase.id,
            component_id: comp.id,
            labels: ['role-task'],
            acceptance_criteria: [],
            priority: 'medium',
            confidence: 'medium',
            sort_order: globalSort++,
            source: 'generated',
            blocked_by: [],
            blocks: [],
          });
        }
      }
    }

    // Unvalidated assumptions → Spike under phase epic
    const phaseCompIds = new Set(inScopeComps.map((c) => c.id));
    const phaseAssumptions = assumptions.filter(
      (a) =>
        a.validation_status !== 'validated' &&
        (a.affected_components ?? []).some((cid) => phaseCompIds.has(cid))
    );

    for (const assumption of phaseAssumptions) {
      items.push({
        temp_id: nextTempId--,
        parent_temp_id: epicTempId,
        type: 'spike',
        title: `Validate: ${assumption.assumed_value || assumption.basis || assumption.id}`,
        description: `Assumption ${assumption.id}: ${assumption.basis ?? ''}`,
        hours: assumption.pessimistic_widening_hours ?? 4,
        base_hours: assumption.pessimistic_widening_hours ?? 4,
        role: null,
        phase_id: phase.id,
        component_id: '',
        labels: ['assumption', 'validation'],
        acceptance_criteria: [
          'Assumption confirmed or invalidated with evidence',
          'Estimate updated if assumption was wrong',
        ],
        priority: 'high',
        confidence: 'low',
        sort_order: globalSort++,
        source: 'generated',
        blocked_by: [],
        blocks: [],
      });
    }

    // High/critical risks with mitigation → Story under epic
    const phaseRisks = risks.filter(
      (r) =>
        (r.severity === 'critical' || r.severity === 'high') &&
        r.mitigation &&
        (r.linked_assumptions ?? []).some((aId) =>
          assumptions
            .filter((a) => a.id === aId)
            .some((a) =>
              (a.affected_components ?? []).some((cid) => phaseCompIds.has(cid))
            )
        )
    );

    for (const risk of phaseRisks) {
      items.push({
        temp_id: nextTempId--,
        parent_temp_id: epicTempId,
        type: 'story',
        title: `Mitigate: ${risk.description || risk.id}`,
        description: `Risk ${risk.id} (${risk.severity}): ${risk.mitigation ?? ''}`,
        hours: risk.estimated_hours_impact ?? 8,
        base_hours: risk.estimated_hours_impact ?? 8,
        role: null,
        phase_id: phase.id,
        component_id: '',
        labels: ['risk', 'mitigation', risk.severity ?? ''],
        acceptance_criteria: [
          'Risk mitigation strategy implemented',
          'Contingency plan documented',
        ],
        priority: risk.severity === 'critical' ? 'critical' : 'high',
        confidence: 'low',
        sort_order: globalSort++,
        source: 'generated',
        blocked_by: [],
        blocks: [],
      });
    }
  }

  return items;
}
