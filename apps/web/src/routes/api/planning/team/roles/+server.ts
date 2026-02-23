import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { createTeamRole } from '@migration-planner/db';

export const POST: RequestHandler = async ({ request }) => {
    const body = await request.json();
    const { snapshot_id, ...role } = body;

    if (!snapshot_id) return error(400, 'Missing snapshot_id');
    if (!role.role_id) return error(400, 'Missing role_id');

    const result = await createTeamRole(db(), snapshot_id, role);
    return json(result);
};
