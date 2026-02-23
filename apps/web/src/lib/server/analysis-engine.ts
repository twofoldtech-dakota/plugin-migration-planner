/**
 * Analysis Engine — deterministic computation of risks, multipliers,
 * assumptions, dependency chains, and risk clusters from discovery data
 * and heuristic definitions.
 *
 * Raw JSON field names are used (not the knowledge.ts interface names):
 * - multipliers: { condition, multiplier, applies_to, supersedes }
 * - gotchas: { pattern, risk, hours_impact, affected_components }
 */

import {
	flattenDiscovery,
	evaluateCondition,
	type DiscoveryData,
	type FlatAnswers,
	type DiscoveryAnswer,
} from './condition-evaluator.js';
import { getAffectedComponentsForQuestion } from './question-component-map.js';
import type { SaveAnalysisInput } from '@migration-planner/db';

// ── Types for raw JSON shapes ──────────────────────────────

interface RawMultiplier {
	id: string;
	condition: string;
	multiplier: number;
	applies_to: string[];
	reason: string;
	supersedes?: string;
}

interface RawGotchaPattern {
	id: string;
	pattern: string;
	risk: string;
	hours_impact: number;
	description: string;
	mitigation: string;
	affected_components?: string[];
}

interface RawDependency {
	id: string;
	predecessor: string;
	successors: string[];
	type: 'hard' | 'soft';
	reason: string;
}

interface RawDependencyData {
	dependencies: RawDependency[];
	critical_path_template?: unknown;
}

// ── Multiplier evaluation ──────────────────────────────────

export interface ActiveMultiplier {
	id: string;
	name: string;
	factor: number;
	trigger: string;
	affected_components: string[];
}

/**
 * Evaluates complexity multiplier conditions against discovery answers.
 * Handles supersedes logic: if multiplier B supersedes A, and both match,
 * only B is kept.
 */
export function evaluateMultipliers(
	answers: FlatAnswers,
	rawMultipliers: RawMultiplier[]
): ActiveMultiplier[] {
	const matched: ActiveMultiplier[] = [];

	for (const m of rawMultipliers) {
		if (evaluateCondition(answers, m.condition)) {
			matched.push({
				id: m.id,
				name: m.reason,
				factor: m.multiplier,
				trigger: m.condition,
				affected_components: m.applies_to,
			});
		}
	}

	// Apply supersedes: remove superseded multipliers
	const supersededIds = new Set<string>();
	for (const m of rawMultipliers) {
		if (m.supersedes && matched.some((a) => a.id === m.id)) {
			supersededIds.add(m.supersedes);
		}
	}

	return matched.filter((m) => !supersededIds.has(m.id));
}

// ── Gotcha / risk evaluation ───────────────────────────────

export interface EvaluatedRisk {
	id: string;
	category: string;
	description: string;
	likelihood: string;
	impact: string;
	severity: string;
	estimated_hours_impact: number;
	mitigation: string;
	contingency: string;
	linked_assumptions: string[];
	owner: string;
	status: string;
}

function riskToSeverity(risk: string): { likelihood: string; impact: string; severity: string } {
	switch (risk) {
		case 'high':
			return { likelihood: 'likely', impact: 'high', severity: 'high' };
		case 'medium':
			return { likelihood: 'possible', impact: 'medium', severity: 'medium' };
		case 'low':
			return { likelihood: 'unlikely', impact: 'low', severity: 'low' };
		default:
			return { likelihood: 'possible', impact: 'medium', severity: 'medium' };
	}
}

export function evaluateGotchas(
	answers: FlatAnswers,
	rawPatterns: RawGotchaPattern[]
): EvaluatedRisk[] {
	const risks: EvaluatedRisk[] = [];

	for (const p of rawPatterns) {
		if (evaluateCondition(answers, p.pattern)) {
			const sev = riskToSeverity(p.risk);
			risks.push({
				id: p.id,
				category: 'gotcha',
				description: p.description,
				likelihood: sev.likelihood,
				impact: sev.impact,
				severity: sev.severity,
				estimated_hours_impact: p.hours_impact,
				mitigation: p.mitigation,
				contingency: '',
				linked_assumptions: [],
				owner: '',
				status: 'open',
			});
		}
	}

	return risks;
}

// ── Assumption building ────────────────────────────────────

export interface BuiltAssumption {
	id: string;
	dimension: string;
	question_id: string | null;
	assumed_value: string;
	basis: string;
	confidence: string;
	validation_status: string;
	validation_method: string;
	pessimistic_widening_hours: number;
	affected_components: string[];
}

/**
 * Scans discovery for answers with confidence "assumed" or "unknown"
 * and produces an assumption registry with affected components and widening hours.
 */
export function buildAssumptions(discovery: DiscoveryData): BuiltAssumption[] {
	const assumptions: BuiltAssumption[] = [];

	for (const [dimension, dimData] of Object.entries(discovery)) {
		if (!dimData?.answers) continue;

		for (const [qId, raw] of Object.entries(dimData.answers)) {
			const answer = raw as DiscoveryAnswer;
			if (answer.confidence !== 'assumed' && answer.confidence !== 'unknown') continue;

			const affectedComponents = getAffectedComponentsForQuestion(dimension, qId);
			const isUnknown = answer.confidence === 'unknown';

			// Widening: unknown answers get more widening than assumed ones
			const wideningHours = isUnknown ? 4 : 2;

			assumptions.push({
				id: `asmp_${qId}`,
				dimension,
				question_id: qId,
				assumed_value: answer.value !== null && answer.value !== undefined
					? String(typeof answer.value === 'object' ? JSON.stringify(answer.value) : answer.value)
					: '',
				basis: answer.basis ?? (isUnknown ? 'No data available' : 'Assumed based on typical patterns'),
				confidence: answer.confidence,
				validation_status: 'unvalidated',
				validation_method: 'Client confirmation required',
				pessimistic_widening_hours: wideningHours,
				affected_components: affectedComponents,
			});
		}
	}

	return assumptions;
}

// ── Dependency chains ──────────────────────────────────────

export function buildDependencyChains(
	depData: RawDependencyData,
	inScopeComponents: Set<string>
): Array<{ from: string; to: string[]; type: string }> {
	if (!depData?.dependencies) return [];

	return depData.dependencies
		.filter((d) => inScopeComponents.has(d.predecessor))
		.map((d) => ({
			from: d.predecessor,
			to: d.successors.filter((s) => inScopeComponents.has(s)),
			type: d.type,
		}))
		.filter((d) => d.to.length > 0);
}

// ── Risk clusters ──────────────────────────────────────────

export function buildRiskClusters(
	risks: EvaluatedRisk[],
	assumptions: BuiltAssumption[]
): Array<{ name: string; risks: string[]; assumptions: string[]; combined_widening_hours: number }> {
	// Group by shared affected components
	const componentRisks: Record<string, string[]> = {};
	const componentAssumptions: Record<string, string[]> = {};

	for (const r of risks) {
		// Use gotcha affected_components info (from pattern definition)
		const key = r.category === 'gotcha' ? r.id : 'general';
		if (!componentRisks[key]) componentRisks[key] = [];
		componentRisks[key].push(r.id);
	}

	for (const a of assumptions) {
		for (const comp of a.affected_components) {
			if (!componentAssumptions[comp]) componentAssumptions[comp] = [];
			componentAssumptions[comp].push(a.id);
		}
	}

	// Build clusters from components that have both risks and assumptions
	const clusters: Array<{ name: string; risks: string[]; assumptions: string[]; combined_widening_hours: number }> = [];
	const allComponents = new Set([...Object.keys(componentAssumptions)]);

	for (const comp of allComponents) {
		const compAssumptions = componentAssumptions[comp] ?? [];
		if (compAssumptions.length === 0) continue;

		// Find risks that affect this component
		const compRisks = risks
			.filter((r) => r.id.includes(comp) || r.description.toLowerCase().includes(comp.replace(/_/g, ' ')))
			.map((r) => r.id);

		if (compRisks.length === 0 && compAssumptions.length < 2) continue;

		const wideningSum = assumptions
			.filter((a) => compAssumptions.includes(a.id))
			.reduce((sum, a) => sum + a.pessimistic_widening_hours, 0);

		clusters.push({
			name: comp.replace(/_/g, ' '),
			risks: [...new Set(compRisks)],
			assumptions: [...new Set(compAssumptions)],
			combined_widening_hours: wideningSum,
		});
	}

	return clusters;
}

// ── Top-level orchestrator ─────────────────────────────────

interface AnalysisInputs {
	discovery: DiscoveryData;
	rawMultipliers: RawMultiplier[];
	rawGotchas: RawGotchaPattern[];
	rawDependencies: RawDependencyData;
	allComponentIds: string[];
}

/**
 * Computes the full analysis from discovery data and heuristic definitions.
 * Returns an object that matches the SaveAnalysisInput shape for direct DB save.
 */
export function computeAnalysis(inputs: AnalysisInputs): SaveAnalysisInput & { _meta: { flat_answers: FlatAnswers } } {
	const { discovery, rawMultipliers, rawGotchas, rawDependencies, allComponentIds } = inputs;

	const answers = flattenDiscovery(discovery);

	// 1. Evaluate multipliers
	const activeMultipliers = evaluateMultipliers(answers, rawMultipliers);

	// 2. Evaluate gotcha risks
	const risks = evaluateGotchas(answers, rawGotchas);

	// 3. Build assumptions from non-confirmed answers
	const assumptions = buildAssumptions(discovery);

	// 4. Build dependency chains (scoped to known components)
	const inScope = new Set(allComponentIds);
	const dependencyChains = buildDependencyChains(rawDependencies, inScope);

	// 5. Build risk clusters
	const riskClusters = buildRiskClusters(risks, assumptions);

	return {
		assessment_id: '', // caller must set this
		risks,
		active_multipliers: activeMultipliers,
		dependency_chains: dependencyChains,
		risk_clusters: riskClusters,
		assumptions,
		_meta: { flat_answers: answers },
	};
}
