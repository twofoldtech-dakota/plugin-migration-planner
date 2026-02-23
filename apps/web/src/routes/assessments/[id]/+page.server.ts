import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { getAiSelections, getScopeExclusions, getAssessmentById, getProficiencies } from '@migration-planner/db';

export const load: PageServerLoad = async ({ params }) => {
	const [aiSelections, scopeExclusions] = await Promise.all([
		getAiSelections(db(), params.id),
		getScopeExclusions(db(), params.id)
	]);

	let aiAlternatives: any[] = [];
	let proficiencyData: any = null;
	try {
		const knowledge = await import('$lib/server/knowledge');
		aiAlternatives = knowledge.getAiAlternatives();

		const assessment = await getAssessmentById(db(), params.id);
		if (assessment?.client_id) {
			const proficiencies = await getProficiencies(db(), assessment.client_id);
			if (Object.keys(proficiencies).length > 0) {
				const catalog = knowledge.getTechProficiencyCatalog();
				proficiencyData = { proficiencies, catalog };
			}
		}
	} catch (e) {
		console.error('Failed to load AI alternatives:', e);
	}

	return {
		aiSelections: aiSelections ?? { selections: {} },
		aiAlternatives,
		scopeExclusions: scopeExclusions ?? { exclusions: {}, reasons: {} },
		proficiencyData
	};
};
