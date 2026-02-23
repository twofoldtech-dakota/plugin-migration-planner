import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import {
    listTeamVersions,
    saveTeamSnapshot,
    getEstimate,
    getAnalysis,
} from '@migration-planner/db';
import { recommendTeam } from '$lib/utils/team-recommender';

export const GET: RequestHandler = async ({ url }) => {
    const assessmentId = url.searchParams.get('assessment');
    if (!assessmentId) return error(400, 'Missing assessment param');

    const versions = await listTeamVersions(db(), assessmentId);
    return json(versions);
};

export const POST: RequestHandler = async ({ request }) => {
    const body = await request.json();
    const { assessment_id } = body;
    if (!assessment_id) return error(400, 'Missing assessment_id');

    const [estimate, analysis] = await Promise.all([
        getEstimate(db(), assessment_id),
        getAnalysis(db(), assessment_id),
    ]);

    if (!estimate) return error(400, 'No estimate found for this assessment');

    const recommendation = recommendTeam(
        estimate as any,
        undefined, // heuristic roles — would need composed heuristics
        (analysis as any)?.active_multipliers,
        (analysis as any)?.risks,
    );

    const result = await saveTeamSnapshot(db(), {
        assessment_id,
        estimate_version: (estimate as any).version ?? 1,
        assumptions: recommendation.assumptions,
        cost_projection: recommendation.cost_projection,
        phase_staffing: recommendation.phase_staffing,
        hiring_notes: recommendation.hiring_notes,
        notes: '',
        roles: recommendation.roles,
    });

    return json(result);
};
