import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { getAssessmentById, saveAssessment } from '@migration-planner/db';

export const POST: RequestHandler = async ({ params }) => {
	const assessment = await getAssessmentById(db(), params.id);
	if (!assessment) throw error(404, 'Assessment not found');

	await saveAssessment(db(), {
		...assessment,
		environments: (assessment.environments as string[]) ?? [],
		status: 'complete',
	});

	return json({ success: true });
};
