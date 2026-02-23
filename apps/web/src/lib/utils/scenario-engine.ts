// Scenario/hours calculation extracted from Dashboard and Estimate pages

export type Scenario = 'manual' | 'ai_assisted' | 'best_case';

// ── Proficiency-aware adoption overhead ─────────────────────

export interface ProficiencyData {
	proficiencies: Record<string, { proficiency: string }>;
	catalog: {
		adoption_overhead_factors: Record<string, number>;
		categories: Record<string, { adoption_base_hours: number; maps_to_tools: string[] }>;
	};
}

/**
 * Build a reverse map: tool_id → category_id
 */
function buildToolCategoryMap(catalog: ProficiencyData['catalog']): Record<string, string> {
	const map: Record<string, string> = {};
	for (const [catId, cat] of Object.entries(catalog.categories)) {
		for (const toolId of cat.maps_to_tools) {
			map[toolId] = catId;
		}
	}
	return map;
}

/**
 * Calculate adoption overhead hours for a specific tool based on team proficiency.
 * Returns 0 when no proficiency data is available (backward compat).
 */
export function getToolAdoptionOverhead(toolId: string, profData?: ProficiencyData): number {
	if (!profData) return 0;

	const toolCatMap = buildToolCategoryMap(profData.catalog);
	const categoryId = toolCatMap[toolId];
	if (!categoryId) return 0;

	const category = profData.catalog.categories[categoryId];
	if (!category) return 0;

	const profEntry = profData.proficiencies[categoryId];
	const level = profEntry?.proficiency ?? 'beginner';
	const factor = profData.catalog.adoption_overhead_factors[level] ?? 0.6;

	return category.adoption_base_hours * factor;
}

// ── Core hours calculation ──────────────────────────────────

export function getComponentHours(
	comp: any,
	scenario: Scenario,
	aiToggles: Record<string, boolean>,
	profData?: ProficiencyData
): number {
	const hours = comp.hours as any;
	if (!hours) return comp.final_hours ?? 0;

	if (scenario === 'manual') {
		return hours.without_ai?.expected ?? comp.final_hours ?? 0;
	}
	if (scenario === 'best_case') {
		return hours.with_ai?.optimistic ?? hours.without_ai?.optimistic ?? comp.final_hours ?? 0;
	}

	// ai_assisted: check individual tool toggles
	const baseHours = hours.without_ai?.expected ?? comp.final_hours ?? 0;
	const aiAlts = (comp.ai_alternatives ?? []) as any[];
	if (aiAlts.length === 0) return baseHours;

	let totalSavings = 0;
	for (const alt of aiAlts) {
		const toolId = alt.tool_id ?? alt.id;
		if (aiToggles[toolId] !== false) {
			const grossSavings = alt.hours_saved?.expected ?? 0;
			const overhead = getToolAdoptionOverhead(toolId, profData);
			const netSavings = Math.max(grossSavings - overhead, 0);
			totalSavings += netSavings;
		}
	}

	const maxSavings = baseHours * 0.5;
	return Math.max(baseHours - Math.min(totalSavings, maxSavings), 0);
}

export function getPhaseHours(
	phase: any,
	scenario: Scenario,
	aiToggles: Record<string, boolean>,
	profData?: ProficiencyData
): number {
	return (phase.components ?? []).reduce(
		(sum: number, c: any) => sum + getComponentHours(c, scenario, aiToggles, profData), 0
	);
}

export interface ScenarioTotals {
	manual: number;
	aiAssisted: number;
	bestCase: number;
	savings: number;
	savingsPercent: number;
}

export function computeScenarioTotals(
	phases: any[],
	aiToggles: Record<string, boolean>,
	profData?: ProficiencyData
): ScenarioTotals {
	const manual = phases.reduce((sum: number, p: any) =>
		sum + (p.components ?? []).reduce((s: number, c: any) => {
			const h = c.hours as any;
			return s + (h?.without_ai?.expected ?? c.final_hours ?? 0);
		}, 0), 0);

	const aiAssisted = phases.reduce((sum: number, p: any) =>
		sum + getPhaseHours(p, 'ai_assisted', aiToggles, profData), 0);

	const bestCase = phases.reduce((sum: number, p: any) =>
		sum + (p.components ?? []).reduce((s: number, c: any) => {
			const h = c.hours as any;
			return s + (h?.with_ai?.optimistic ?? h?.without_ai?.optimistic ?? c.final_hours ?? 0);
		}, 0), 0);

	const savings = manual - aiAssisted;
	const savingsPercent = manual > 0 ? Math.round((savings / manual) * 100) : 0;

	return { manual, aiAssisted, bestCase, savings, savingsPercent };
}

/**
 * Returns a copy of phases with excluded components removed.
 * Drops phases that end up with zero components.
 */
export function filterPhases(phases: any[], excludedComponents: Set<string>): any[] {
	if (excludedComponents.size === 0) return phases;

	return phases
		.map((phase: any) => ({
			...phase,
			components: (phase.components ?? []).filter(
				(c: any) => !excludedComponents.has(c.id)
			)
		}))
		.filter((phase: any) => (phase.components ?? []).length > 0);
}

/**
 * Filters out excluded components, then computes scenario totals.
 */
export function computeRefinedTotals(
	phases: any[],
	aiToggles: Record<string, boolean>,
	excludedComponents: Set<string>,
	profData?: ProficiencyData
): ScenarioTotals {
	const filtered = filterPhases(phases, excludedComponents);
	return computeScenarioTotals(filtered, aiToggles, profData);
}
