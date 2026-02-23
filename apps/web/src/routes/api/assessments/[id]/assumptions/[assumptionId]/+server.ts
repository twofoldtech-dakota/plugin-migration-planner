import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { updateAssumption } from '@migration-planner/db';
import { recomputeAll } from '$lib/server/recompute';

export const PATCH: RequestHandler = async ({ params, request }) => {
    const body = await request.json();
    const { validation_status, actual_value } = body;

    const result = await updateAssumption(db(), {
        assessment_id: params.id,
        assumption_id: params.assumptionId,
        validation_status,
        actual_value
    });

    // Re-run analysis + estimate to update confidence and hours (non-fatal)
    const recomputed = await recomputeAll(params.id);

    return json({ ...result, recomputed });
};
