import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';
import {
	estimateSnapshots,
	estimateComponents,
	activeMultipliers,
	assessments,
} from '@migration-planner/db';

export const load: PageServerLoad = async () => {
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
		d
			.select({
				snapshot_id: estimateComponents.snapshot_id,
				phase_id: estimateComponents.phase_id,
				phase_name: estimateComponents.phase_name,
				component_id: estimateComponents.component_id,
				component_name: estimateComponents.component_name,
				base_hours: estimateComponents.base_hours,
				final_hours: estimateComponents.final_hours,
				by_role: estimateComponents.by_role,
			})
			.from(estimateComponents),

		// Active multipliers frequency
		d
			.select({
				multiplier_id: activeMultipliers.multiplier_id,
				name: activeMultipliers.name,
				factor: activeMultipliers.factor,
				cnt: sql<number>`count(*)`,
			})
			.from(activeMultipliers)
			.groupBy(
				activeMultipliers.multiplier_id,
				activeMultipliers.name,
				activeMultipliers.factor
			)
			.orderBy(sql`count(*) desc`),
	]);

	const snapshots = latestSnapshots.rows as Array<{
		id: number;
		assessment_id: string;
		project_name: string;
		version: number;
		confidence_score: number;
		total_base_hours: number;
		total_gotcha_hours: number;
		total_expected_hours: number;
		assumption_widening_hours: number;
		total_by_role: Record<string, number> | null;
		created_at: string;
	}>;

	// ── Waterfall data (aggregated across all latest snapshots) ─
	const aggBase = snapshots.reduce((s, r) => s + (r.total_base_hours ?? 0), 0);
	const aggGotcha = snapshots.reduce((s, r) => s + (r.total_gotcha_hours ?? 0), 0);
	const aggWidening = snapshots.reduce((s, r) => s + (r.assumption_widening_hours ?? 0), 0);
	const aggExpected = snapshots.reduce((s, r) => s + (r.total_expected_hours ?? 0), 0);
	const aggMultiplierDelta = aggExpected - aggBase - aggGotcha - aggWidening;

	const waterfallData = [
		{ label: 'Base Hours', value: Math.round(aggBase) },
		{ label: '+ Multipliers', value: Math.round(aggMultiplierDelta) },
		{ label: '+ Gotchas', value: Math.round(aggGotcha) },
		{ label: '+ Widening', value: Math.round(aggWidening) },
		{ label: 'Total', value: Math.round(aggExpected), isTotal: true },
	];

	// ── Role breakdown (stacked bar chart) ─────────────────────
	// Aggregate by_role across all components, grouped by phase
	const phaseRoles = new Map<string, { label: string; roles: Record<string, number> }>();
	const allRoleIds = new Set<string>();

	// Build a set of snapshot IDs from latest snapshots
	const latestSnapshotIds = new Set(snapshots.map((s) => s.id));

	for (const comp of allComponents) {
		// Only include components from latest snapshots
		if (!latestSnapshotIds.has(comp.snapshot_id)) continue;

		const key = comp.phase_id || 'unknown';
		if (!phaseRoles.has(key)) {
			phaseRoles.set(key, { label: comp.phase_name || key, roles: {} });
		}
		const entry = phaseRoles.get(key)!;
		const roleObj = (comp.by_role ?? {}) as Record<string, number>;
		for (const [role, hours] of Object.entries(roleObj)) {
			if (typeof hours === 'number') {
				entry.roles[role] = (entry.roles[role] ?? 0) + hours;
				allRoleIds.add(role);
			}
		}
	}

	const roleColors: Record<string, string> = {
		'solution-architect': '#4f46e5',
		'devops-engineer': '#06b6d4',
		'sitecore-developer': '#f59e0b',
		'qa-engineer': '#10b981',
		'frontend-developer': '#ec4899',
		'content-strategist': '#8b5cf6',
		'project-manager': '#f97316',
	};
	const fallbackColors = ['#6366f1', '#14b8a6', '#ef4444', '#84cc16', '#a855f7', '#e11d48'];

	const roleSeriesArr = [...allRoleIds].map((roleId, i) => ({
		id: roleId,
		label: roleId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
		color: roleColors[roleId] ?? fallbackColors[i % fallbackColors.length],
	}));

	const roleBreakdownData = [...phaseRoles.values()].map((phase) => ({
		label: phase.label,
		values: phase.roles,
	}));

	// ── Multiplier impact ──────────────────────────────────────
	const multiplierImpact = multiplierFreq.map((m) => ({
		label: m.name || m.multiplier_id,
		value: Math.round(Number(m.cnt) * (m.factor - 1) * 100) / 100,
		detail: `${Number(m.cnt)}x applied, factor ${m.factor}x`,
	}));

	// ── Component scatter (base vs final hours) ────────────────
	const componentScatter = allComponents
		.filter((c) => latestSnapshotIds.has(c.snapshot_id) && c.base_hours > 0)
		.map((c) => ({
			x: c.base_hours,
			y: c.final_hours,
			label: c.component_name || c.component_id,
		}));

	// ── KPIs ───────────────────────────────────────────────────
	// Total versions: count all snapshots (not just latest)
	const [versionCountRow] = await d
		.select({ cnt: sql<number>`count(*)` })
		.from(estimateSnapshots);
	const totalVersions = Number(versionCountRow?.cnt ?? 0);

	const confidenceScores = snapshots
		.map((s) => s.confidence_score)
		.filter((c) => c > 0);
	const avgConfidence =
		confidenceScores.length > 0
			? Math.round(
					(confidenceScores.reduce((s, c) => s + c, 0) / confidenceScores.length) * 10
				) / 10
			: 0;

	const totalHours = Math.round(aggExpected);

	const avgGotchaPct =
		aggBase > 0 ? Math.round((aggGotcha / aggBase) * 1000) / 10 : 0;

	return {
		kpis: {
			totalVersions,
			avgConfidence,
			totalHours,
			avgGotchaPct,
		},
		waterfallData,
		roleBreakdown: {
			data: roleBreakdownData,
			series: roleSeriesArr,
		},
		multiplierImpact,
		componentScatter,
	};
};
