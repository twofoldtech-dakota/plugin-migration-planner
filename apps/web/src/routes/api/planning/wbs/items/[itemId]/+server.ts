import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { updateWorkItem, deleteWorkItem } from '@migration-planner/db';

export const PATCH: RequestHandler = async ({ params, request }) => {
    const itemId = parseInt(params.itemId, 10);
    if (isNaN(itemId)) return error(400, 'Invalid item ID');

    const updates = await request.json();
    const result = await updateWorkItem(db(), itemId, updates);
    return json(result);
};

export const DELETE: RequestHandler = async ({ params }) => {
    const itemId = parseInt(params.itemId, 10);
    if (isNaN(itemId)) return error(400, 'Invalid item ID');

    const result = await deleteWorkItem(db(), itemId);
    return json(result);
};
