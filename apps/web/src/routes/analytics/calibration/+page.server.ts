import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import {
	calibrations,
	calibrationPhases,
	calibrationComponents,
	calibrationAiTools,
	assessments,
} from '@migration-planner/db';

export const load: PageServerLoad = async () => {
	const d = db();

	const [calRows, phaseRows, componentRows, aiToolRows, assessmentRows] = await Promise.all([
		d
			.select({
				id: calibrations.id,
				assessment_id: calibrations.assessment_id,
				engagement_name: calibrations.engagement_name,
				surprises: calibrations.surprises,
				created_at: calibrations.created_at,
			})
			.from(calibrations),
		d
			.select({
				calibration_id: calibrationPhases.calibration_id,
				phase_id: calibrationPhases.phase_id,
				phase_name: calibrationPhases.phase_name,
				estimated_hours: calibrationPhases.estimated_hours,
				actual_hours: calibrationPhases.actual_hours,
				variance_percent: calibrationPhases.variance_percent,
			})
			.from(calibrationPhases),
		d
			.select({
				calibration_id: calibrationComponents.calibration_id,
				component_id: calibrationComponents.component_id,
				estimated_hours: calibrationComponents.estimated_hours,
				actual_hours: calibrationComponents.actual_hours,
				variance_percent: calibrationComponents.variance_percent,
			})
			.from(calibrationComponents),
		d
			.select({
				calibration_id: calibrationAiTools.calibration_id,
				tool_id: calibrationAiTools.tool_id,
				tool_name: calibrationAiTools.tool_name,
				was_used: calibrationAiTools.was_used,
				estimated_savings_hours: calibrationAiTools.estimated_savings_hours,
				actual_savings_hours: calibrationAiTools.actual_savings_hours,
			})
			.from(calibrationAiTools),
		d
			.select({
				id: assessments.id,
				project_name: assessments.project_name,
			})
			.from(assessments),
	]);

	// Assessment name lookup
	const assessmentMap = new Map(assessmentRows.map((a) => [a.id, a.project_name]));

	// ── Scatter data: estimated vs actual from phases ────────────
	const scatterData = phaseRows.map((p) => ({
		x: p.estimated_hours,
		y: p.actual_hours,
		label: p.phase_name || p.phase_id,
	}));

	// ── Phase variance: average variance_percent per phase ──────
	const phaseMap = new Map<string, { total: number; count: number }>();
	for (const p of phaseRows) {
		const name = p.phase_name || p.phase_id;
		const entry = phaseMap.get(name) ?? { total: 0, count: 0 };
		entry.total += p.variance_percent;
		entry.count += 1;
		phaseMap.set(name, entry);
	}
	const phaseVariance = [...phaseMap.entries()].map(([label, { total, count }]) => ({
		label,
		value: Math.round((total / count) * 10) / 10,
	}));

	// ── AI tool usage donut ─────────────────────────────────────
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
		{ label: 'Used', value: usedCount, color: 'var(--color-success)' },
		{ label: 'Not Used', value: notUsedCount, color: 'var(--color-text-muted)' },
	];

	// ── Surprises: flatten from all calibrations ────────────────
	const surprises: Array<{ description: string; impact: string; project: string }> = [];
	for (const cal of calRows) {
		const raw = cal.surprises as unknown[];
		if (Array.isArray(raw)) {
			for (const s of raw) {
				if (s && typeof s === 'object') {
					const entry = s as Record<string, unknown>;
					surprises.push({
						description: String(entry.description ?? entry.name ?? ''),
						impact: String(entry.impact ?? entry.hours_impact ?? ''),
						project: assessmentMap.get(cal.assessment_id) ?? cal.engagement_name,
					});
				}
			}
		}
	}

	// ── KPIs ────────────────────────────────────────────────────
	const totalCalibrations = calRows.length;

	const allVariances = phaseRows.map((p) => p.variance_percent);
	const avgVariance =
		allVariances.length > 0
			? Math.round(
					(allVariances.reduce((s, v) => s + Math.abs(v), 0) / allVariances.length) * 10
				) / 10
			: 0;

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
		underEstimated,
	};
};
