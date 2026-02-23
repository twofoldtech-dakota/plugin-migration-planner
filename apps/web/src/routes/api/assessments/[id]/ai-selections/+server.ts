import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { saveAiSelections, getAiSelections } from '@migration-planner/db';
import { recomputeEstimate } from '$lib/server/recompute';

export const PATCH: RequestHandler = async ({ params, request }) => {
    const body = await request.json();
    const { selections, disabled_reasons } = body;

    await saveAiSelections(db(), {
        assessment_id: params.id,
        selections,
        disabled_reasons
    });

    // Re-run estimate since AI savings affect hour totals (non-fatal)
    const recomputed = await recomputeEstimate(params.id);

    return json({ success: true, recomputed });
};

export const GET: RequestHandler = async ({ params }) => {
    const data = await getAiSelections(db(), params.id);
    return json(data);
};
