import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { listClients, listKnowledgePacks } from '@migration-planner/db';

export const load: PageServerLoad = async () => {
	const [clients, packs] = await Promise.all([
		listClients(db()),
		listKnowledgePacks(db()),
	]);

	// Group packs by category for UI dropdowns
	const platforms = packs.filter((p) => p.category === 'platform');
	const infrastructure = packs.filter((p) => p.category === 'infrastructure');

	let catalog = null;
	try {
		const { getTechProficiencyCatalog } = await import('$lib/server/knowledge');
		catalog = getTechProficiencyCatalog();
	} catch (e) {
		console.error('Failed to load tech proficiency catalog:', e);
	}

	return { clients, catalog, platforms, infrastructure };
};
