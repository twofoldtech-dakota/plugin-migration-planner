import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { getClientById, saveClient, deleteClient } from '@migration-planner/db';

export const GET: RequestHandler = async ({ params }) => {
	const client = await getClientById(db(), params.id);
	if (!client) {
		return json({ error: 'Client not found' }, { status: 404 });
	}
	return json(client);
};

export const PATCH: RequestHandler = async ({ params, request }) => {
	const body = await request.json();
	const { name, industry, notes } = body;

	if (!name) {
		return json({ error: 'name is required' }, { status: 400 });
	}

	await saveClient(db(), { id: params.id, name, industry, notes });
	return json({ success: true });
};

export const DELETE: RequestHandler = async ({ params }) => {
	await deleteClient(db(), params.id);
	return json({ success: true });
};
