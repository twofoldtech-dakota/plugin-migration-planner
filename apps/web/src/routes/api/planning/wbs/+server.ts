import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import {
    listWBSVersions,
    saveWBSSnapshot,
    getEstimate,
    getAnalysis,
    getScopeExclusions,
} from '@migration-planner/db';
import { generateWBS } from '$lib/utils/wbs-generator';

export const GET: RequestHandler = async ({ url }) => {
    const assessmentId = url.searchParams.get('assessment');
    if (!assessmentId) return error(400, 'Missing assessment param');

    const versions = await listWBSVersions(db(), assessmentId);
    return json(versions);
};

export const POST: RequestHandler = async ({ request }) => {
    const body = await request.json();
    const { assessment_id } = body;
    if (!assessment_id) return error(400, 'Missing assessment_id');

    const [estimate, analysis, scopeExclusions] = await Promise.all([
        getEstimate(db(), assessment_id),
        getAnalysis(db(), assessment_id),
        getScopeExclusions(db(), assessment_id),
    ]);

    if (!estimate) return error(400, 'No estimate found for this assessment');

    const excluded = new Set(
        Object.entries(scopeExclusions?.exclusions ?? {})
            .filter(([, v]) => v)
            .map(([k]) => k)
    );

    // TODO: load refinements if available
    const items = generateWBS(estimate as any, analysis as any, null, excluded);

    const result = await saveWBSSnapshot(db(), {
        assessment_id,
        estimate_version: (estimate as any).version ?? 1,
        items: items as any[],
    });

    return json(result);
};
