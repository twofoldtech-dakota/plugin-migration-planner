import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { getClientById, queryProjects } from '@migration-planner/db';
import { getTechProficiencyCatalog, getAiAlternatives } from '$lib/server/knowledge';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const client = await getClientById(db(), params.id);
	if (!client) {
		throw error(404, 'Client not found');
	}

	let catalog = null;
	try {
		catalog = getTechProficiencyCatalog();
	} catch (e) {
		console.error('Failed to load tech proficiency catalog:', e);
	}

	let aiTools: any[] = [];
	try {
		aiTools = getAiAlternatives();
	} catch (e) {
		console.error('Failed to load AI alternatives:', e);
	}

	// Get assessments linked to this client
	const { projects: allProjects } = await queryProjects(db(), { limit: 200 });
	const linkedAssessments = allProjects.filter(
		(p) => p.client_name === client.name
	);

	return { client, catalog, aiTools, linkedAssessments };
};
