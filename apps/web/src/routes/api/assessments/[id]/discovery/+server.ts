import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { saveDiscovery } from '@migration-planner/db';
import { recomputeAll } from '$lib/server/recompute';

export const PATCH: RequestHandler = async ({ params, request }) => {
    const body = await request.json();
    const { dimension, answers, status } = body;

    const result = await saveDiscovery(db(), {
        assessment_id: params.id,
        dimension,
        status,
        answers
    });

    // Recompute analysis + estimate reactively (non-fatal)
    const recomputed = await recomputeAll(params.id);

    return json({ ...result, recomputed });
};
