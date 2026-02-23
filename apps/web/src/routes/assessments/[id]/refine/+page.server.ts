import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { getAiSelections, getScopeExclusions, getAssessmentById } from '@migration-planner/db';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

export const load: PageServerLoad = async ({ params }) => {
	const [aiSelections, scopeExclusions] = await Promise.all([
		getAiSelections(db(), params.id),
		getScopeExclusions(db(), params.id)
	]);

	let aiAlternatives: any[] = [];
	try {
		const { getAiAlternatives } = await import('$lib/server/knowledge');
		aiAlternatives = getAiAlternatives();
	} catch (e) {
		console.error('Failed to load AI alternatives:', e);
	}

	// Load component refinements from .migration/refinements.json
	let refinements = { roleOverrides: {} as Record<string, Record<string, number>>, roleTasks: {} as Record<string, Record<string, string[]>> };
	try {
		const assessment = await getAssessmentById(db(), params.id);
		if (assessment?.project_path) {
			const refinementsPath = join(assessment.project_path, '.migration', 'refinements.json');
			if (existsSync(refinementsPath)) {
				const raw = await readFile(refinementsPath, 'utf-8');
				refinements = JSON.parse(raw);
			}
		}
	} catch (e) {
		console.error('Failed to load refinements:', e);
	}

	return {
		aiSelections: aiSelections ?? { selections: {} },
		aiAlternatives,
		scopeExclusions: scopeExclusions ?? { exclusions: {}, reasons: {} },
		refinements,
	};
};
