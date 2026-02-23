import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db';
import { getAssessmentById, getDiscovery, getAnalysis, getEstimate, getScopeExclusions, getChallengeReviewSummary, listEstimateVersions } from '@migration-planner/db';
import { error } from '@sveltejs/kit';
import { computeDiscoveryStats, computeRiskStats, computeAssumptionStats } from '$lib/utils/migration-stats';

export const load: LayoutServerLoad = async ({ params, url }) => {
	const assessment = await getAssessmentById(db(), params.id);

	if (!assessment) {
		error(404, 'Assessment not found');
	}

	const vParam = url.searchParams.get('v');
	const requestedVersion = vParam ? parseInt(vParam, 10) : undefined;

	const [discovery, analysis, estimate, scopeExclusions, challengeReviewSummary, estimateVersions] = await Promise.all([
		getDiscovery(db(), params.id),
		getAnalysis(db(), params.id),
		getEstimate(db(), params.id, requestedVersion || undefined),
		getScopeExclusions(db(), params.id),
		getChallengeReviewSummary(db(), params.id),
		listEstimateVersions(db(), params.id)
	]);

	const discoveryStats = computeDiscoveryStats(discovery as Record<string, any>);
	const riskStats = computeRiskStats(analysis?.risks as any[]);
	const assumptionStats = computeAssumptionStats(analysis?.assumptions as any[]);

	const summary = {
		discovery: discoveryStats,
		risks: riskStats,
		assumptions: assumptionStats,
		estimateHours: (estimate as any)?.total_expected_hours ?? 0,
		confidence: (estimate as any)?.confidence_score ?? 0,
		hasDiscovery: discoveryStats.completedDimensions > 0,
		hasAnalysis: !!analysis && riskStats.total > 0,
		hasEstimate: !!estimate,
		hasRefine: Object.values(scopeExclusions?.exclusions ?? {}).some(Boolean),
		challengeReviews: challengeReviewSummary
	};

	return { assessment, discovery, analysis, estimate, scopeExclusions, summary, estimateVersions };
};
