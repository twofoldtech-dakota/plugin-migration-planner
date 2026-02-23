import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { saveScopeExclusions, getScopeExclusions } from '@migration-planner/db';
import { recomputeEstimate } from '$lib/server/recompute';

export const PATCH: RequestHandler = async ({ params, request }) => {
    const body = await request.json();
    const { exclusions, reasons } = body;

    await saveScopeExclusions(db(), {
        assessment_id: params.id,
        exclusions,
        reasons
    });

    // Re-run estimate with updated scope (non-fatal)
    const recomputed = await recomputeEstimate(params.id);

    return json({ success: true, recomputed });
};

export const GET: RequestHandler = async ({ params }) => {
    const data = await getScopeExclusions(db(), params.id);
    return json(data);
};
