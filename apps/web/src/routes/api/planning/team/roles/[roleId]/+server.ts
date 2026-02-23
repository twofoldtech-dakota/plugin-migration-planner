import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { updateTeamRole, deleteTeamRole } from '@migration-planner/db';

export const PATCH: RequestHandler = async ({ params, request }) => {
    const roleId = parseInt(params.roleId, 10);
    if (isNaN(roleId)) return error(400, 'Invalid role ID');

    const updates = await request.json();
    const result = await updateTeamRole(db(), roleId, updates);
    return json(result);
};

export const DELETE: RequestHandler = async ({ params }) => {
    const roleId = parseInt(params.roleId, 10);
    if (isNaN(roleId)) return error(400, 'Invalid role ID');

    const result = await deleteTeamRole(db(), roleId);
    return json(result);
};
