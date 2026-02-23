import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { listClients, saveClient, saveProficiencies } from '@migration-planner/db';

export const GET: RequestHandler = async ({ url }) => {
	const search = url.searchParams.get('search') ?? undefined;
	const clients = await listClients(db(), search);
	return json(clients);
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { id, name, industry, notes, proficiencies } = body;

	if (!id || !name) {
		return json({ error: 'id and name are required' }, { status: 400 });
	}

	await saveClient(db(), { id, name, industry, notes });

	if (proficiencies && Object.keys(proficiencies).length > 0) {
		await saveProficiencies(db(), { client_id: id, proficiencies });
	}

	return json({ success: true, id });
};
