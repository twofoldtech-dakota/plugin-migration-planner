import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { getWBSSnapshot } from '@migration-planner/db';

export const GET: RequestHandler = async ({ url, params }) => {
    const assessmentId = url.searchParams.get('assessment');
    if (!assessmentId) return error(400, 'Missing assessment param');

    const version = parseInt(params.snapshotId, 10);
    if (isNaN(version)) return error(400, 'Invalid snapshot version');

    const snapshot = await getWBSSnapshot(db(), assessmentId, version);
    if (!snapshot) return error(404, 'WBS snapshot not found');

    return json(snapshot);
};
