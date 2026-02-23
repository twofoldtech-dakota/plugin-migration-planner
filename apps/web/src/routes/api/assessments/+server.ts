import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { saveAssessment } from '@migration-planner/db';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { id, project_name, client_id, client_name, source_stack, target_stack, migration_scope, sitecore_version, topology, source_cloud, target_cloud, target_timeline, project_path } = body;

	if (!id || !project_name) {
		return json({ error: 'id and project_name are required' }, { status: 400 });
	}

	await saveAssessment(db(), {
		id,
		project_name,
		client_id: client_id ?? null,
		client_name: client_name ?? '',
		project_path: project_path ?? '',
		source_stack: source_stack ?? {},
		target_stack: target_stack ?? {},
		migration_scope: migration_scope ?? {},
		sitecore_version: sitecore_version ?? '',
		topology: topology ?? '',
		source_cloud: source_cloud ?? 'aws',
		target_cloud: target_cloud ?? 'azure',
		target_timeline: target_timeline ?? '',
	});

	return json({ success: true, id });
};
