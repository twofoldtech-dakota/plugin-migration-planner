import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';
import {
	getKnowledgePackFull,
	getKnowledgePackById,
	listMigrationPaths,
	getDiscoveryTree,
	knowledgeAiAlternatives,
	knowledgeSourceUrls,
} from '@migration-planner/db';
import { error } from '@sveltejs/kit';
import { gradeKnowledgePack } from '$lib/utils/pack-grading';

export const load: PageServerLoad = async ({ params }) => {
	const d = db();
	const pack = await getKnowledgePackFull(d, params.id);
	if (!pack) {
		throw error(404, 'Knowledge pack not found');
	}

	// Get migration paths + discovery tree + counts in parallel
	const [pathsAsSource, pathsAsTarget, discoveryResult, aiCountRows, sourceCountRows] = await Promise.all([
		listMigrationPaths(d, { source_pack_id: params.id }),
		listMigrationPaths(d, { target_pack_id: params.id }),
		getDiscoveryTree(d, [params.id]),
		d
			.select({ count: sql<number>`count(*)` })
			.from(knowledgeAiAlternatives)
			.where(sql`${knowledgeAiAlternatives.pack_id} = ${params.id}`),
		d
			.select({ count: sql<number>`count(*)` })
			.from(knowledgeSourceUrls)
			.where(sql`${knowledgeSourceUrls.pack_id} = ${params.id}`),
	]);

	// Resolve related pack names
	const relatedPackIds = new Set<string>();
	for (const p of pathsAsSource) relatedPackIds.add(p.target_pack_id);
	for (const p of pathsAsTarget) relatedPackIds.add(p.source_pack_id);
	relatedPackIds.delete(params.id);

	const relatedPacks: Record<string, { id: string; name: string; category: string }> = {};
	await Promise.all(
		[...relatedPackIds].map(async (id) => {
			const rp = await getKnowledgePackById(d, id);
			if (rp) {
				relatedPacks[id] = { id: rp.id, name: rp.name, category: rp.category };
			}
		})
	);

	// Compute discovery stats from JS
	let discoveryDims = 0;
	let discoveryQuestions = 0;
	const dt = discoveryResult.packs.find((p) => p.pack_id === params.id);
	if (dt) {
		const dims = Array.isArray(dt.dimensions) ? dt.dimensions as any[] : [];
		discoveryDims = dims.length;
		for (const dim of dims) {
			discoveryQuestions += (dim.required_questions?.length ?? 0) + (dim.conditional_questions?.length ?? 0);
		}
	}

	const effortHours = (pack.effort_hours as unknown[] ?? []);
	const multipliers = (pack.multipliers as unknown[] ?? []);
	const gotchas = (pack.gotcha_patterns as unknown[] ?? []);
	const chains = (pack.dependency_chains as unknown[] ?? []);
	const phases = (pack.phase_mappings as unknown[] ?? []);
	const roles = (pack.roles as unknown[] ?? []);

	const grade = gradeKnowledgePack({
		packId: params.id,
		packName: (pack as any).name,
		discoveryDimensions: discoveryDims,
		discoveryQuestions: discoveryQuestions,
		effortHours: effortHours.length,
		multipliers: multipliers.length,
		gotchas: gotchas.length,
		chains: chains.length,
		phases: phases.length,
		roles: roles.length,
		aiAlternatives: Number(aiCountRows[0]?.count ?? 0),
		sourceUrls: Number(sourceCountRows[0]?.count ?? 0),
		lastResearched: !!(pack as any).last_researched,
	});

	return { pack, pathsAsSource, pathsAsTarget, relatedPacks, grade };
};
