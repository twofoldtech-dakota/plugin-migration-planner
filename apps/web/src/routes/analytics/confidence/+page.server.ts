import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { sql, desc } from 'drizzle-orm';
import { queryConfidenceTimeline } from '@migration-planner/db';
import { challengeReviews, assessments } from '@migration-planner/db';

const SESSION_GAP_MS = 60 * 60 * 1000; // 1 hour gap = new estimation run

interface Run {
	run: number; // 1-indexed
	type: 'initial' | 'refinement';
	score: number;
	created_at: string;
}

export const load: PageServerLoad = async () => {
	const d = db();
	const [points, radarReviews] = await Promise.all([
		queryConfidenceTimeline(d),
		// Latest challenge review per assessment with score_breakdown
		d
			.select({
				assessment_id: challengeReviews.assessment_id,
				project_name: assessments.project_name,
				score_breakdown: challengeReviews.score_breakdown,
				confidence_score: challengeReviews.confidence_score,
			})
			.from(challengeReviews)
			.innerJoin(assessments, sql`${challengeReviews.assessment_id} = ${assessments.id}`)
			.where(sql`${challengeReviews.confidence_score} > 0`)
			.orderBy(desc(challengeReviews.created_at))
			.limit(20),
	]);

	// ── Detect estimation runs per assessment ──────────────────
	// Group by assessment, then detect session boundaries (>1hr gap)
	const byAssessment = new Map<
		string,
		{ project_name: string; snapshots: { score: number; created_at: string }[] }
	>();
	for (const p of points) {
		let entry = byAssessment.get(p.assessment_id);
		if (!entry) {
			entry = { project_name: p.project_name, snapshots: [] };
			byAssessment.set(p.assessment_id, entry);
		}
		entry.snapshots.push({ score: p.confidence_score, created_at: p.created_at });
	}

	// For each assessment, collapse snapshots into runs (take final score per session)
	const assessmentRuns = new Map<string, { project_name: string; runs: Run[] }>();

	for (const [id, data] of byAssessment) {
		const sorted = data.snapshots.sort(
			(a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
		);

		const runs: Run[] = [];
		let sessionStart = 0;

		for (let i = 1; i <= sorted.length; i++) {
			const isEnd =
				i === sorted.length ||
				new Date(sorted[i].created_at).getTime() -
					new Date(sorted[i - 1].created_at).getTime() >
					SESSION_GAP_MS;

			if (isEnd) {
				const final = sorted[i - 1];
				runs.push({
					run: runs.length + 1,
					type: runs.length === 0 ? 'initial' : 'refinement',
					score: final.score,
					created_at: final.created_at,
				});
				sessionStart = i;
			}
		}

		assessmentRuns.set(id, { project_name: data.project_name, runs });
	}

	// ── Build timeline events (sorted chronologically) ─────────
	// Each run creates a timeline event. Portfolio avg updates at each event.
	interface TimelineEvent {
		assessment_id: string;
		project_name: string;
		type: 'initial' | 'refinement';
		run: number;
		score: number;
		created_at: string;
		portfolioAvg: number;
	}

	const allEvents: TimelineEvent[] = [];
	for (const [id, data] of assessmentRuns) {
		for (const run of data.runs) {
			allEvents.push({
				assessment_id: id,
				project_name: data.project_name,
				...run,
				portfolioAvg: 0, // computed below
			});
		}
	}
	allEvents.sort((a, b) => a.created_at.localeCompare(b.created_at));

	// Compute running portfolio average at each event
	const latestByAssessment = new Map<string, number>();
	for (const ev of allEvents) {
		latestByAssessment.set(ev.assessment_id, ev.score);
		const scores = [...latestByAssessment.values()];
		ev.portfolioAvg = Math.round((scores.reduce((s, v) => s + v, 0) / scores.length) * 10) / 10;
	}

	// ── Assessment summaries for table ─────────────────────────
	const assessmentSummaries = [...assessmentRuns.entries()].map(([id, data]) => {
		const initial = data.runs[0];
		const current = data.runs[data.runs.length - 1];
		return {
			assessment_id: id,
			project_name: data.project_name,
			initialScore: initial.score,
			currentScore: current.score,
			delta: Math.round((current.score - initial.score) * 10) / 10,
			totalRuns: data.runs.length,
			runs: data.runs,
			firstEstimate: initial.created_at,
			lastEstimate: current.created_at,
		};
	});

	// ── Radar chart data from challenge reviews ───────────────
	// Deduplicate to latest per assessment
	const seenAssessments = new Set<string>();
	const radarData = radarReviews
		.filter((r) => {
			if (seenAssessments.has(r.assessment_id)) return false;
			seenAssessments.add(r.assessment_id);
			return true;
		})
		.map((r) => {
			const bd = (r.score_breakdown ?? {}) as Record<string, number>;
			return {
				assessment_id: r.assessment_id,
				project_name: r.project_name,
				confidence: r.confidence_score,
				dimensions: [
					{ label: 'Completeness', value: bd.completeness ?? 0 },
					{ label: 'Consistency', value: bd.consistency ?? 0 },
					{ label: 'Currency', value: bd.currency ?? 0 },
					{ label: 'Plausibility', value: bd.plausibility ?? 0 },
					{ label: 'Risk Coverage', value: bd.risk_coverage ?? 0 },
				],
			};
		});

	return {
		events: allEvents,
		assessments: assessmentSummaries,
		totalSnapshots: points.length,
		totalRuns: allEvents.length,
		radarData,
	};
};
