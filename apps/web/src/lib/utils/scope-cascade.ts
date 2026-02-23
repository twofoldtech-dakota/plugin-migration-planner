/**
 * Computes cascading effects when components are excluded from scope.
 *
 * - AI Tools: inactive if ALL applicable_components are excluded
 * - Assumptions: out of scope if ALL affected_components are excluded
 * - Risks: out of scope if ALL linked_assumptions are out-of-scope
 */

export interface CascadeResult {
	excludedComponents: Set<string>;
	inactiveAiTools: Set<string>;
	outOfScopeAssumptions: Set<string>;
	outOfScopeRisks: Set<string>;
}

export function computeScopeCascade(
	excludedComponents: Set<string>,
	aiTools: any[],
	assumptions: any[],
	risks: any[]
): CascadeResult {
	// AI tools: inactive if every applicable component is excluded
	const inactiveAiTools = new Set<string>();
	for (const tool of aiTools) {
		const applicable = (tool.applicable_components ?? []) as string[];
		if (applicable.length > 0 && applicable.every((c: string) => excludedComponents.has(c))) {
			inactiveAiTools.add(tool.tool_id ?? tool.id);
		}
	}

	// Assumptions: out of scope if every affected component is excluded
	const outOfScopeAssumptions = new Set<string>();
	for (const assumption of assumptions) {
		const affected = (assumption.affected_components ?? []) as string[];
		if (affected.length > 0 && affected.every((c: string) => excludedComponents.has(c))) {
			outOfScopeAssumptions.add(assumption.id);
		}
	}

	// Risks: out of scope if every linked assumption is out-of-scope
	const outOfScopeRisks = new Set<string>();
	for (const risk of risks) {
		const linked = (risk.linked_assumptions ?? []) as string[];
		if (linked.length > 0 && linked.every((a: string) => outOfScopeAssumptions.has(a))) {
			outOfScopeRisks.add(risk.id);
		}
	}

	return { excludedComponents, inactiveAiTools, outOfScopeAssumptions, outOfScopeRisks };
}
