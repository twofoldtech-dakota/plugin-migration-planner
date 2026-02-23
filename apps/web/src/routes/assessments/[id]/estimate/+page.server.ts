import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { getAiSelections, getEstimate, getAssessmentById, getProficiencies } from '@migration-planner/db';

export const load: PageServerLoad = async ({ params, url }) => {
	// Estimate, analysis come from parent layout.
	// Only load page-specific data.
	const aiSelections = await getAiSelections(db(), params.id);

	// Load comparison estimate if ?compare=N is present
	const compareParam = url.searchParams.get('compare');
	const compareVersion = compareParam ? parseInt(compareParam, 10) : undefined;
	const compareEstimate = compareVersion
		? await getEstimate(db(), params.id, compareVersion)
		: null;

	let aiAlternatives: any[] = [];
	let baseEffort: any = { components: [], phases: {}, roles: {} };
	let proficiencyData: any = null;
	try {
		const knowledge = await import('$lib/server/knowledge');
		aiAlternatives = knowledge.getAiAlternatives();
		baseEffort = knowledge.getBaseEffort();

		// Load proficiency data if assessment has a client_id
		const assessment = await getAssessmentById(db(), params.id);
		if (assessment?.client_id) {
			const proficiencies = await getProficiencies(db(), assessment.client_id);
			if (Object.keys(proficiencies).length > 0) {
				const catalog = knowledge.getTechProficiencyCatalog();
				proficiencyData = { proficiencies, catalog };
			}
		}
	} catch (e) {
		console.error('Failed to load knowledge heuristics:', e);
	}

	return {
		aiSelections: aiSelections ?? { selections: {} },
		aiAlternatives,
		baseEffort,
		compareEstimate,
		proficiencyData
	};
};
