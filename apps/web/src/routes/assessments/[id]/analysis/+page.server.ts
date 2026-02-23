import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { getAiSelections, getScopeExclusions } from '@migration-planner/db';

export const load: PageServerLoad = async ({ params }) => {
	// Analysis and discovery data come from parent layout.
	// Load page-specific knowledge heuristics + AI selections for the Decisions tab.
	const [aiSelections, scopeExclusions] = await Promise.all([
		getAiSelections(db(), params.id),
		getScopeExclusions(db(), params.id)
	]);

	let knownMultipliers: any[] = [];
	let knownGotchas: any[] = [];
	let dependencyChains: any = null;
	let knownIncompatibilities: any[] = [];
	let aiAlternatives: any[] = [];
	try {
		const knowledge = await import('$lib/server/knowledge');
		knownMultipliers = knowledge.getComplexityMultipliers();
		knownGotchas = knowledge.getGotchaPatterns();
		dependencyChains = knowledge.getDependencyChains();
		knownIncompatibilities = knowledge.getKnownIncompatibilities();
		aiAlternatives = knowledge.getAiAlternatives();
	} catch (e) {
		console.error('Failed to load knowledge heuristics:', e);
	}

	return {
		knownMultipliers,
		knownGotchas,
		dependencyChains,
		knownIncompatibilities,
		aiAlternatives,
		aiSelections: aiSelections ?? { selections: {} },
		scopeExclusions: scopeExclusions ?? { exclusions: {}, reasons: {} }
	};
};
