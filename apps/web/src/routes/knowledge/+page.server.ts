import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';
import { listKnowledgePacks, listMigrationPaths, getHeuristicsForPacks, getDiscoveryTree } from '@migration-planner/db';
import {
	knowledgePacks,
	knowledgeAiAlternatives,
	knowledgeSourceUrls,
} from '@migration-planner/db';
import { gradeKnowledgePack, type PackGrade } from '$lib/utils/pack-grading';

export const load: PageServerLoad = async () => {
	const d = db();

	const [packs, paths] = await Promise.all([
		listKnowledgePacks(d),
		listMigrationPaths(d)
	]);

	// Count paths per pack (as source and target)
	const pathCountsAsSource: Record<string, number> = {};
	const pathCountsAsTarget: Record<string, number> = {};
	for (const path of paths) {
		pathCountsAsSource[path.source_pack_id] = (pathCountsAsSource[path.source_pack_id] ?? 0) + 1;
		pathCountsAsTarget[path.target_pack_id] = (pathCountsAsTarget[path.target_pack_id] ?? 0) + 1;
	}

	// Get health stats per pack
	const packIds = packs.map((p) => p.id);
	const [heuristics, discoveryResult, aiCountRows, sourceCountRows] = await Promise.all([
		packIds.length > 0 ? getHeuristicsForPacks(d, packIds) : {},
		packIds.length > 0 ? getDiscoveryTree(d, packIds) : { packs: [], dimensions: [] },
		packIds.length > 0
			? d
					.select({
						pack_id: knowledgeAiAlternatives.pack_id,
						count: sql<number>`count(*)`,
					})
					.from(knowledgeAiAlternatives)
					.groupBy(knowledgeAiAlternatives.pack_id)
			: [],
		packIds.length > 0
			? d
					.select({
						pack_id: knowledgeSourceUrls.pack_id,
						count: sql<number>`count(*)`,
					})
					.from(knowledgeSourceUrls)
					.where(sql`${knowledgeSourceUrls.pack_id} IS NOT NULL`)
					.groupBy(knowledgeSourceUrls.pack_id)
			: [],
	]);

	const healthStats: Record<string, {
		effortHours: number;
		multipliers: number;
		gotchas: number;
		chains: number;
		phases: number;
		roles: number;
	}> = {};

	for (const pack of packs) {
		const h = (heuristics as Record<string, Record<string, unknown[]>>)[pack.id] ?? {};
		healthStats[pack.id] = {
			effortHours: (h.effort_hours as unknown[] ?? []).length,
			multipliers: (h.multipliers as unknown[] ?? []).length,
			gotchas: (h.gotcha_patterns as unknown[] ?? []).length,
			chains: (h.dependency_chains as unknown[] ?? []).length,
			phases: (h.phase_mappings as unknown[] ?? []).length,
			roles: (h.roles as unknown[] ?? []).length
		};
	}

	// Count discovery dimensions and questions per pack
	const discoveryStats: Record<string, { dims: number; questions: number }> = {};
	for (const dt of discoveryResult.packs) {
		const dims = Array.isArray(dt.dimensions) ? dt.dimensions as any[] : [];
		let totalQuestions = 0;
		for (const dim of dims) {
			totalQuestions += (dim.required_questions?.length ?? 0) + (dim.conditional_questions?.length ?? 0);
		}
		discoveryStats[dt.pack_id] = { dims: dims.length, questions: totalQuestions };
	}

	// AI and source count maps
	const aiCountMap: Record<string, number> = {};
	for (const row of aiCountRows) {
		aiCountMap[row.pack_id] = Number(row.count);
	}
	const sourceCountMap: Record<string, number> = {};
	for (const row of sourceCountRows) {
		if (row.pack_id) sourceCountMap[row.pack_id] = Number(row.count);
	}

	// Compute grades
	const packGrades: Record<string, PackGrade> = {};
	for (const pack of packs) {
		const stats = healthStats[pack.id];
		const disc = discoveryStats[pack.id] ?? { dims: 0, questions: 0 };
		packGrades[pack.id] = gradeKnowledgePack({
			packId: pack.id,
			packName: pack.name,
			discoveryDimensions: disc.dims,
			discoveryQuestions: disc.questions,
			effortHours: stats?.effortHours ?? 0,
			multipliers: stats?.multipliers ?? 0,
			gotchas: stats?.gotchas ?? 0,
			chains: stats?.chains ?? 0,
			phases: stats?.phases ?? 0,
			roles: stats?.roles ?? 0,
			aiAlternatives: aiCountMap[pack.id] ?? 0,
			sourceUrls: sourceCountMap[pack.id] ?? 0,
			lastResearched: !!pack.last_researched,
		});
	}

	// Unique categories for filter chips
	const categories = [...new Set(packs.map((p) => p.category))].filter(Boolean).sort();

	return {
		packs,
		pathCountsAsSource,
		pathCountsAsTarget,
		healthStats,
		packGrades,
		categories,
		totalPaths: paths.length
	};
};
