import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';
import {
	queryProjects,
	listKnowledgePacks,
	listMigrationPaths,
} from '@migration-planner/db';
import {
	risks,
	calibrations,
	estimateSnapshots,
	knowledgePacks,
} from '@migration-planner/db';

export const load: PageServerLoad = async () => {
	const d = db();

	const [
		{ projects },
		packs,
		paths,
		riskRows,
		calibrationCount,
		estimateRows,
	] = await Promise.all([
		queryProjects(d, { limit: 200 }),
		listKnowledgePacks(d),
		listMigrationPaths(d),
		d.select({ cnt: sql<number>`count(*)` }).from(risks).where(sql`${risks.status} = 'open'`),
		d.select({ cnt: sql<number>`count(*)` }).from(calibrations),
		d.select({
			confidence_score: estimateSnapshots.confidence_score,
		}).from(estimateSnapshots).where(sql`${estimateSnapshots.confidence_score} > 0`),
	]);

	const withEstimates = projects.filter((p) => p.total_expected_hours != null);
	const totalHours = withEstimates.reduce((s, p) => s + (p.total_expected_hours ?? 0), 0);
	const avgConfidence =
		estimateRows.length > 0
			? Math.round(estimateRows.reduce((s, r) => s + r.confidence_score, 0) / estimateRows.length * 10) / 10
			: 0;

	return {
		kpis: {
			totalAssessments: projects.length,
			totalHours: Math.round(totalHours),
			avgConfidence,
			openRisks: Number(riskRows[0]?.cnt ?? 0),
			calibrationsCompleted: Number(calibrationCount[0]?.cnt ?? 0),
			knowledgePacks: packs.length,
		},
		quickLinks: {
			paths: paths.length,
		},
	};
};
