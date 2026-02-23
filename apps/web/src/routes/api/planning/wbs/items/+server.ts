import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { createWorkItem } from '@migration-planner/db';

export const POST: RequestHandler = async ({ request }) => {
    const body = await request.json();
    const { snapshot_id, ...item } = body;

    if (!snapshot_id) return error(400, 'Missing snapshot_id');
    if (!item.title) return error(400, 'Missing title');

    const result = await createWorkItem(db(), snapshot_id, item);
    return json(result);
};
