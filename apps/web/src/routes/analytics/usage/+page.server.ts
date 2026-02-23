import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { sql, inArray } from 'drizzle-orm';
import {
	getPageViewCount,
	getSessionCount,
	getPageViewsOverTime,
	getTopPages,
	getTopFeatures,
	getMostEngagedAssessments,
	analyticsEvents,
	assessments,
} from '@migration-planner/db';

export const load: PageServerLoad = async () => {
	const d = db();

	const [pageViews24h, sessions7d, pageViewBuckets, topPages, topFeatures, engagedRows, activeAssessmentRows] =
		await Promise.all([
			getPageViewCount(d, 24),
			getSessionCount(d, 7),
			getPageViewsOverTime(d, 168),
			getTopPages(d, 7, 10),
			getTopFeatures(d, 7, 10),
			getMostEngagedAssessments(d, 7, 10),
			d
				.select({ count: sql<number>`count(distinct ${analyticsEvents.assessment_id})` })
				.from(analyticsEvents)
				.where(
					sql`${analyticsEvents.assessment_id} is not null AND ${analyticsEvents.created_at} > now() - interval '7 days'`
				),
		]);

	// Build assessment name map for engaged assessments
	let assessmentMap = new Map<string, string>();
	if (engagedRows.length > 0) {
		const ids = engagedRows.map((r) => r.assessment_id);
		const rows = await d
			.select({ id: assessments.id, project_name: assessments.project_name })
			.from(assessments)
			.where(inArray(assessments.id, ids));
		assessmentMap = new Map(rows.map((r) => [r.id, r.project_name]));
	}

	// ── AreaChart series: page views over time ──────────────────
	function formatHour(bucket: string): string {
		const d = new Date(bucket);
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		const hour = d.getHours();
		const ampm = hour >= 12 ? 'pm' : 'am';
		const h12 = hour % 12 || 12;
		return `${months[d.getMonth()]} ${d.getDate()} ${h12}${ampm}`;
	}

	const pageViewTrend = [
		{
			id: 'views',
			label: 'Page Views',
			color: 'var(--color-primary)',
			data: pageViewBuckets.map((b) => ({
				label: formatHour(b.bucket),
				value: b.count,
			})),
		},
	];

	// ── HorizontalBarChart bars ─────────────────────────────────
	const topPagesBars = topPages.map((p) => ({
		label: p.path || '/',
		value: p.count,
	}));

	const topFeaturesBars = topFeatures.map((f) => ({
		label: f.event,
		value: f.count,
	}));

	// ── Engaged assessments table data ──────────────────────────
	const engagedAssessments = engagedRows.map((r) => ({
		assessment_id: r.assessment_id,
		project_name: assessmentMap.get(r.assessment_id) ?? r.assessment_id,
		count: r.count,
	}));

	// ── KPIs ────────────────────────────────────────────────────
	const activeAssessments = Number(activeAssessmentRows[0]?.count ?? 0);
	const avgPagesPerSession =
		sessions7d > 0 ? Math.round((pageViews24h / Math.max(sessions7d / 7, 1)) * 10) / 10 : 0;

	return {
		pageViewTrend,
		topPagesBars,
		topFeaturesBars,
		engagedAssessments,
		pageViews24h,
		sessions7d,
		avgPagesPerSession,
		activeAssessments,
	};
};
