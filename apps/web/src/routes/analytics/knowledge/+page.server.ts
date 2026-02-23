import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';
import {
	listKnowledgePacks,
	listMigrationPaths,
	getHeuristicsForPacks,
	getDiscoveryTree,
	knowledgeAiAlternatives,
	knowledgeSourceUrls,
} from '@migration-planner/db';
import { gradeKnowledgePack, type PackGrade } from '$lib/utils/pack-grading';

export const load: PageServerLoad = async () => {
	const d = db();

	const [packs, paths, urlStats] = await Promise.all([
		listKnowledgePacks(d),
		listMigrationPaths(d),
		// Source URL health aggregation
		d
			.select({
				total: sql<number>`count(*)`,
				accessible: sql<number>`count(*) filter (where ${knowledgeSourceUrls.still_accessible} = true)`,
				stale: sql<number>`count(*) filter (where ${knowledgeSourceUrls.still_accessible} = false)`,
			})
			.from(knowledgeSourceUrls),
	]);

	const packIds = packs.map((p) => p.id);

	// Fetch heuristics, discovery tree, AI counts, and source counts in parallel
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

	// Build per-pack heuristic stats
	const healthStats: Record<string, {
		effort: number; multipliers: number; gotchas: number;
		chains: number; phases: number; roles: number;
	}> = {};
	for (const pack of packs) {
		const h = (heuristics as Record<string, Record<string, unknown[]>>)[pack.id] ?? {};
		healthStats[pack.id] = {
			effort: (h.effort_hours as unknown[] ?? []).length,
			multipliers: (h.multipliers as unknown[] ?? []).length,
			gotchas: (h.gotcha_patterns as unknown[] ?? []).length,
			chains: (h.dependency_chains as unknown[] ?? []).length,
			phases: (h.phase_mappings as unknown[] ?? []).length,
			roles: (h.roles as unknown[] ?? []).length,
		};
	}

	// Build per-pack discovery stats
	const discoveryStats: Record<string, { dims: number; questions: number }> = {};
	for (const dt of discoveryResult.packs) {
		const dims = Array.isArray(dt.dimensions) ? dt.dimensions as any[] : [];
		let totalQuestions = 0;
		for (const dim of dims) {
			totalQuestions += (dim.required_questions?.length ?? 0) + (dim.conditional_questions?.length ?? 0);
		}
		discoveryStats[dt.pack_id] = { dims: dims.length, questions: totalQuestions };
	}

	// Build lookup maps for AI and source counts
	const aiCountMap: Record<string, number> = {};
	for (const row of aiCountRows) {
		aiCountMap[row.pack_id] = Number(row.count);
	}
	const sourceCountMap: Record<string, number> = {};
	for (const row of sourceCountRows) {
		if (row.pack_id) sourceCountMap[row.pack_id] = Number(row.count);
	}

	// ── Confidence level distribution for DonutChart ─────────
	const confidenceLevels: Record<string, number> = {};
	for (const p of packs) {
		const level = p.confidence || 'draft';
		confidenceLevels[level] = (confidenceLevels[level] || 0) + 1;
	}

	const confidenceColors: Record<string, string> = {
		verified: 'var(--color-success)',
		reviewed: 'var(--color-primary)',
		draft: 'var(--color-warning)',
		community: 'var(--color-info)',
	};

	const confidenceSegments = Object.entries(confidenceLevels).map(([label, value]) => ({
		label: label.charAt(0).toUpperCase() + label.slice(1),
		value,
		color: confidenceColors[label] || 'var(--color-text-muted)',
	}));

	// ── URL health for DonutChart ────────────────────────────
	const urlTotal = Number(urlStats[0]?.total ?? 0);
	const urlAccessible = Number(urlStats[0]?.accessible ?? 0);
	const urlStale = Number(urlStats[0]?.stale ?? 0);
	const urlUnchecked = urlTotal - urlAccessible - urlStale;

	const urlHealthSegments = [
		{ label: 'Accessible', value: urlAccessible, color: 'var(--color-success)' },
		{ label: 'Stale', value: urlStale, color: 'var(--color-danger)' },
		...(urlUnchecked > 0 ? [{ label: 'Unchecked', value: urlUnchecked, color: 'var(--color-text-muted)' }] : []),
	].filter((s) => s.value > 0);

	// ── Pack completeness for HorizontalBarChart ─────────────
	const packCompleteness = packs.map((p) => {
		const stats = healthStats[p.id] ?? { effort: 0, gotchas: 0, multipliers: 0 };
		return {
			label: p.name,
			value: stats.effort + stats.gotchas + stats.multipliers,
			detail: `${stats.effort} effort, ${stats.gotchas} gotchas, ${stats.multipliers} multipliers`,
		};
	}).sort((a, b) => b.value - a.value);

	// ── Pack grades ──────────────────────────────────────────
	const packGrades: PackGrade[] = packs.map((p) => {
		const stats = healthStats[p.id] ?? { effort: 0, multipliers: 0, gotchas: 0, chains: 0, phases: 0, roles: 0 };
		const disc = discoveryStats[p.id] ?? { dims: 0, questions: 0 };
		return gradeKnowledgePack({
			packId: p.id,
			packName: p.name,
			discoveryDimensions: disc.dims,
			discoveryQuestions: disc.questions,
			effortHours: stats.effort,
			multipliers: stats.multipliers,
			gotchas: stats.gotchas,
			chains: stats.chains,
			phases: stats.phases,
			roles: stats.roles,
			aiAlternatives: aiCountMap[p.id] ?? 0,
			sourceUrls: sourceCountMap[p.id] ?? 0,
			lastResearched: !!p.last_researched,
		});
	});

	// ── Pack detail table (enhanced with grade) ──────────────
	const packTable = packs.map((p) => {
		const stats = healthStats[p.id] ?? { effort: 0, multipliers: 0, gotchas: 0, chains: 0, phases: 0, roles: 0 };
		const disc = discoveryStats[p.id] ?? { dims: 0, questions: 0 };
		const grade = packGrades.find((g) => g.packId === p.id);
		return {
			id: p.id,
			name: p.name,
			category: p.category,
			confidence: p.confidence,
			effort: stats.effort,
			gotchas: stats.gotchas,
			multipliers: stats.multipliers,
			chains: stats.chains,
			phases: stats.phases,
			roles: stats.roles,
			aiAlts: aiCountMap[p.id] ?? 0,
			sources: sourceCountMap[p.id] ?? 0,
			discoveryDims: disc.dims,
			discoveryQuestions: disc.questions,
			total: stats.effort + stats.gotchas + stats.multipliers,
			grade: grade?.overall ?? 'F',
			gradeScore: grade?.overallScore ?? 0,
		};
	});

	return {
		kpis: {
			packs: packs.length,
			paths: paths.length,
			sourceUrls: urlTotal,
			staleUrls: urlStale,
		},
		confidenceSegments,
		urlHealthSegments,
		packCompleteness,
		packTable,
		packGrades,
	};
};
