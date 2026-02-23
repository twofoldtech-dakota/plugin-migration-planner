function buildToolCategoryMap(catalog) {
  const map = {};
  for (const [catId, cat] of Object.entries(catalog.categories)) {
    for (const toolId of cat.maps_to_tools) {
      map[toolId] = catId;
    }
  }
  return map;
}
function getToolAdoptionOverhead(toolId, profData) {
  if (!profData) return 0;
  const toolCatMap = buildToolCategoryMap(profData.catalog);
  const categoryId = toolCatMap[toolId];
  if (!categoryId) return 0;
  const category = profData.catalog.categories[categoryId];
  if (!category) return 0;
  const profEntry = profData.proficiencies[categoryId];
  const level = profEntry?.proficiency ?? "beginner";
  const factor = profData.catalog.adoption_overhead_factors[level] ?? 0.6;
  return category.adoption_base_hours * factor;
}
function getComponentHours(comp, scenario, aiToggles, profData) {
  const hours = comp.hours;
  if (!hours) return comp.final_hours ?? 0;
  if (scenario === "manual") {
    return hours.without_ai?.expected ?? comp.final_hours ?? 0;
  }
  if (scenario === "best_case") {
    return hours.with_ai?.optimistic ?? hours.without_ai?.optimistic ?? comp.final_hours ?? 0;
  }
  const baseHours = hours.without_ai?.expected ?? comp.final_hours ?? 0;
  const aiAlts = comp.ai_alternatives ?? [];
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
function getPhaseHours(phase, scenario, aiToggles, profData) {
  return (phase.components ?? []).reduce(
    (sum, c) => sum + getComponentHours(c, scenario, aiToggles, profData),
    0
  );
}
function computeScenarioTotals(phases, aiToggles, profData) {
  const manual = phases.reduce((sum, p) => sum + (p.components ?? []).reduce((s, c) => {
    const h = c.hours;
    return s + (h?.without_ai?.expected ?? c.final_hours ?? 0);
  }, 0), 0);
  const aiAssisted = phases.reduce((sum, p) => sum + getPhaseHours(p, "ai_assisted", aiToggles, profData), 0);
  const bestCase = phases.reduce((sum, p) => sum + (p.components ?? []).reduce((s, c) => {
    const h = c.hours;
    return s + (h?.with_ai?.optimistic ?? h?.without_ai?.optimistic ?? c.final_hours ?? 0);
  }, 0), 0);
  const savings = manual - aiAssisted;
  const savingsPercent = manual > 0 ? Math.round(savings / manual * 100) : 0;
  return { manual, aiAssisted, bestCase, savings, savingsPercent };
}
function filterPhases(phases, excludedComponents) {
  if (excludedComponents.size === 0) return phases;
  return phases.map((phase) => ({
    ...phase,
    components: (phase.components ?? []).filter(
      (c) => !excludedComponents.has(c.id)
    )
  })).filter((phase) => (phase.components ?? []).length > 0);
}
function computeRefinedTotals(phases, aiToggles, excludedComponents, profData) {
  const filtered = filterPhases(phases, excludedComponents);
  return computeScenarioTotals(filtered, aiToggles, profData);
}

export { computeScenarioTotals as a, getToolAdoptionOverhead as b, computeRefinedTotals as c, getComponentHours as d, filterPhases as f, getPhaseHours as g };
//# sourceMappingURL=scenario-engine-BY9xcCE7.js.map
