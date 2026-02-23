import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { listClients, queryProjects, getProficiencies } from '@migration-planner/db';

export const load: PageServerLoad = async () => {
	const clients = await listClients(db());
	const { projects } = await queryProjects(db(), { limit: 500 });

	// Count assessments per client by matching client_name
	const assessmentCounts: Record<string, number> = {};
	for (const client of clients) {
		assessmentCounts[client.id] = projects.filter(
			(p) => p.client_name === client.name
		).length;
	}

	// Get proficiency summaries per client (how many set)
	const proficiencySummaries: Record<string, { filled: number; total: number }> = {};
	for (const client of clients) {
		const profs = await getProficiencies(db(), client.id);
		const entries = Object.values(profs);
		const filled = entries.filter((p) => p.proficiency && p.proficiency !== 'none').length;
		proficiencySummaries[client.id] = { filled, total: entries.length };
	}

	return { clients, assessmentCounts, proficiencySummaries };
};
