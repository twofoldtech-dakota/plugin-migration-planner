import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { saveProficiencies, getProficiencies } from '@migration-planner/db';

export const GET: RequestHandler = async ({ params }) => {
	const proficiencies = await getProficiencies(db(), params.id);
	return json(proficiencies);
};

export const PUT: RequestHandler = async ({ params, request }) => {
	const body = await request.json();
	const { proficiencies } = body;

	if (!proficiencies) {
		return json({ error: 'proficiencies object is required' }, { status: 400 });
	}

	await saveProficiencies(db(), {
		client_id: params.id,
		proficiencies
	});

	return json({ success: true });
};
