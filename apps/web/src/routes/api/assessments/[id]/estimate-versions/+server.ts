import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { listEstimateVersions } from '@migration-planner/db';

export const GET: RequestHandler = async ({ params }) => {
	const versions = await listEstimateVersions(db(), params.id);
	return json(versions);
};
