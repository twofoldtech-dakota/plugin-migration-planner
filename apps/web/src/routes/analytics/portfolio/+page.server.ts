import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';
import { queryProjects } from '@migration-planner/db';
import { risks, assumptions, assessments } from '@migration-planner/db';

export const load: PageServerLoad = async () => {
	const d = db();

	const [{ projects }, riskMatrix, validationVelocity, clientDist] = await Promise.all([
		queryProjects(d, { limit: 200 }),

		// Risk severity x likelihood cross-tab
		d
			.select({
				severity: risks.severity,
				likelihood: risks.likelihood,
				cnt: sql<number>`count(*)`,
			})
			.from(risks)
			.groupBy(risks.severity, risks.likelihood),

		// Assumption validation velocity by week
		d
			.select({
				week: sql<string>`to_char(date_trunc('week', ${assumptions.created_at}::timestamp), 'YYYY-MM-DD')`,
				validation_status: assumptions.validation_status,
				cnt: sql<number>`count(*)`,
			})
			.from(assumptions)
			.groupBy(
				sql`date_trunc('week', ${assumptions.created_at}::timestamp)`,
				assumptions.validation_status
			)
			.orderBy(sql`date_trunc('week', ${assumptions.created_at}::timestamp)`),

		// Client distribution
		d
			.select({
				client_name: assessments.client_name,
				cnt: sql<number>`count(*)`,
			})
			.from(assessments)
			.groupBy(assessments.client_name)
			.orderBy(sql`count(*) desc`),
	]);

	// ── Pipeline counts ────────────────────────────────────────
	const statusMap: Record<string, number> = {
		planning: 0,
		discovery: 0,
		analysis: 0,
		estimation: 0,
		complete: 0,
	};
	for (const p of projects) {
		const s = (p.status ?? 'discovery').toLowerCase();
		if (s in statusMap) {
			statusMap[s]++;
		} else {
			// Bucket unknown statuses into planning
			statusMap['planning']++;
		}
	}
	const pipeline = Object.entries(statusMap).map(([label, value]) => ({
		label: label.charAt(0).toUpperCase() + label.slice(1),
		value,
	}));

	// ── Hours per project ──────────────────────────────────────
	const hoursPerProject = projects
		.filter((p) => p.total_expected_hours != null && p.total_expected_hours > 0)
		.map((p) => ({
			label: p.project_name,
			value: Math.round(p.total_expected_hours ?? 0),
		}))
		.sort((a, b) => b.value - a.value);

	// ── Risk matrix cells ──────────────────────────────────────
	const severityRows = ['critical', 'high', 'medium', 'low'];
	const likelihoodCols = ['high', 'medium', 'low'];
	const riskCells = riskMatrix.map((r) => ({
		row: r.severity || 'medium',
		col: r.likelihood || 'medium',
		value: Number(r.cnt),
	}));

	// ── Validation velocity (weekly validated count) ───────────
	const weeklyValidated = new Map<string, number>();
	for (const row of validationVelocity) {
		if (row.validation_status === 'validated') {
			weeklyValidated.set(row.week, Number(row.cnt));
		}
	}
	const validationData = [...weeklyValidated.entries()]
		.sort((a, b) => a[0].localeCompare(b[0]))
		.map(([week, count]) => ({
			label: week,
			value: count,
		}));

	// ── Client distribution ────────────────────────────────────
	const chartColors = [
		'#4f46e5', '#06b6d4', '#f59e0b', '#ef4444', '#10b981',
		'#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
	];
	const clientDistribution = clientDist
		.filter((c) => c.client_name)
		.map((c, i) => ({
			label: c.client_name || 'Unknown',
			value: Number(c.cnt),
			color: chartColors[i % chartColors.length],
		}));

	// ── KPIs ───────────────────────────────────────────────────
	const totalAssessments = projects.length;
	const totalHours = Math.round(
		projects.reduce((s, p) => s + (p.total_expected_hours ?? 0), 0)
	);

	const [openRiskRow] = await d
		.select({ cnt: sql<number>`count(*)` })
		.from(risks)
		.where(sql`${risks.status} = 'open'`);
	const openRisks = Number(openRiskRow?.cnt ?? 0);

	const totalAssumptions = validationVelocity.reduce((s, r) => s + Number(r.cnt), 0);
	const validatedAssumptions = validationVelocity
		.filter((r) => r.validation_status === 'validated')
		.reduce((s, r) => s + Number(r.cnt), 0);
	const assumptionValidationPct =
		totalAssumptions > 0 ? Math.round((validatedAssumptions / totalAssumptions) * 1000) / 10 : 0;

	return {
		kpis: {
			totalAssessments,
			totalHours,
			openRisks,
			assumptionValidationPct,
		},
		pipeline,
		hoursPerProject,
		riskMatrix: {
			cells: riskCells,
			rows: severityRows,
			cols: likelihoodCols,
		},
		validationVelocity: validationData,
		clientDistribution,
	};
};
