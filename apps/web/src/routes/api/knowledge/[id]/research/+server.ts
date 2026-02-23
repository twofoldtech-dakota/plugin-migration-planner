import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { getKnowledgePackById, saveKnowledgePack } from '@migration-planner/db';

export const POST: RequestHandler = async ({ params }) => {
	const pack = await getKnowledgePackById(db(), params.id);
	if (!pack) {
		return json({ error: 'Knowledge pack not found' }, { status: 404 });
	}

	await saveKnowledgePack(db(), {
		...pack,
		supported_versions: pack.supported_versions ?? [],
		eol_versions: pack.eol_versions ?? {},
		valid_topologies: pack.valid_topologies ?? [],
		deployment_models: pack.deployment_models ?? [],
		compatible_targets: pack.compatible_targets ?? [],
		compatible_infrastructure: pack.compatible_infrastructure ?? [],
		required_services: pack.required_services ?? [],
		optional_services: pack.optional_services ?? [],
		confidence: 'draft',
		last_researched: null,
		change_summary: 'Queued for re-research'
	});

	return json({ success: true });
};
