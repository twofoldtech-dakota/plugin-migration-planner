/**
 * Estimate Engine — deterministic computation of migration hours from
 * analysis results and heuristic definitions.
 *
 * Produces per-component hours with:
 * - Base hours × units × applicable multipliers + gotcha hours
 * - Role breakdown scaled by multiplier
 * - Firm vs assumption-dependent hour split
 * - Three-point estimates (optimistic/expected/pessimistic)
 * - AI alternative savings per component
 * - Phase grouping from base-effort-hours.json phase_mapping
 * - Confidence score from confirmed/total answer ratio
 *
 * Output matches SaveEstimateInput for direct DB save.
 */

import type { FlatAnswers } from './condition-evaluator.js';
import type { ActiveMultiplier, EvaluatedRisk, BuiltAssumption } from './analysis-engine.js';
import type { SaveEstimateInput } from '@migration-planner/db';

// ── Raw JSON types ─────────────────────────────────────────

interface RawBaseComponent {
	base_hours: number;
	unit: string;
	includes: string;
	role_breakdown: Record<string, number>;
}

interface RawBaseEffort {
	components: Record<string, RawBaseComponent>;
	phase_mapping: Record<string, string[]>;
	roles: Record<string, { description: string; typical_rate_range: string }>;
}

interface RawAiAlternative {
	id: string;
	name: string;
	vendor: string;
	category: string;
	applicable_components: string[];
	hours_saved: { optimistic: number; expected: number; pessimistic: number };
	recommendation: string;
}

// ── Helpers ────────────────────────────────────────────────

/**
 * Converts a select-option string representing a range into a numeric midpoint.
 * Handles patterns like "10-30", "< 5", "100+", "50,000-100,000", etc.
 */
function parseSelectRange(value: string | undefined | null): number {
	if (!value) return 0;
	const s = String(value).replace(/,/g, '');
	// "100+" or "100K+" style
	const plusMatch = s.match(/(\d+)\+/);
	if (plusMatch) return Number(plusMatch[1]) * 1.2; // slightly above the threshold
	// "< 5" or "<5" style
	const ltMatch = s.match(/<\s*(\d+)/);
	if (ltMatch) return Math.max(1, Number(ltMatch[1]) * 0.5);
	// "10-30" or "5,000-20,000" style
	const rangeMatch = s.match(/(\d+)\s*[-–]\s*(\d+)/);
	if (rangeMatch) return (Number(rangeMatch[1]) + Number(rangeMatch[2])) / 2;
	// Plain number
	const num = Number(s);
	if (!isNaN(num)) return num;
	return 0;
}

// ── Unit computation ───────────────────────────────────────

/**
 * Determines how many units of a component are needed based on discovery.
 * E.g., "per VM role" × CD instance count, "per database" × number of DBs, etc.
 */
export function computeUnits(componentId: string, answers: FlatAnswers, envCount: number): number {
	switch (componentId) {
		case 'compute_single_role': {
			const cm = Number(answers['compute_cm_instance_count']) || 1;
			const cd = Number(answers['compute_cd_instance_count']) || 2;
			return cm + cd;
		}
		case 'database_single': {
			// Base Sitecore DBs: Core, Master, Web + optional xDB + custom
			let count = 3;
			if (answers['database_separate_xdb'] === true || answers['database_separate_xdb'] === 'true') count += 2;
			if (answers['database_custom_databases'] === true || answers['database_custom_databases'] === 'true') count += 1;
			return count;
		}
		case 'solr_standalone':
		case 'solr_cloud': {
			const provider = String(answers['search_provider'] ?? '');
			// Only include if the search type matches
			if (componentId === 'solr_cloud' && !provider.toLowerCase().includes('cloud')) return 0;
			if (componentId === 'solr_standalone' && provider.toLowerCase().includes('cloud')) return 0;
			return 1;
		}
		case 'redis_session': {
			const inUse = answers['caching_redis_in_use'];
			if (inUse === false || inUse === 'false') return 0;
			return 1;
		}
		case 'cdn_setup': {
			const cdnInUse = answers['cdn_in_use'];
			if (cdnInUse === false || cdnInUse === 'false') return 0;
			return Number(answers['cdn_distribution_count']) || 1;
		}
		case 'dns_cutover':
			return Number(answers['dns_zone_count']) || 1;
		case 'ssl_tls':
			return Number(answers['ssl_certificate_count']) || 1;
		case 'blob_storage':
			return Number(answers['storage_s3_bucket_count']) || 1;
		case 'content_serialization_sync':
			return envCount;
		case 'xconnect_xdb': {
			const enabled = answers['xconnect_enabled'];
			if (enabled === false || enabled === 'false') return 0;
			return 1;
		}
		case 'identity_server': {
			const deployed = answers['identity_server_deployed'];
			if (deployed === false || deployed === 'false') return 0;
			return 1;
		}
		case 'custom_integration':
			return Number(answers['integrations_custom_api_count']) || 0;
		case 'cicd_pipeline':
			return 1;
		case 'monitoring_setup':
			return envCount;
		case 'networking_vnet':
			return envCount;
		case 'backup_dr':
			return envCount;
		case 'managed_identity_keyvault':
			return envCount;
		case 'publishing_service': {
			const hosting = answers['integrations_publishing_service_hosting'];
			if (!hosting || hosting === 'N/A' || hosting === 'none') return 0;
			return 1;
		}
		case 'project_management':
			return 1;
		case 'testing_validation':
			return envCount;
		case 'cutover_execution':
			return envCount;
		case 'content_migration': {
			// Units = number of content types / 5 (batch of 5 types per unit)
			const typeCount = parseSelectRange(String(answers['content_type_count'] ?? ''));
			return Math.max(1, Math.ceil(typeCount / 5));
		}
		case 'code_migration': {
			// Units = (pipeline count + event handler count) / 10, min 1 if any customization
			const pipelines = parseSelectRange(String(answers['customization_pipeline_count'] ?? ''));
			const handlers = parseSelectRange(String(answers['customization_event_handlers'] ?? ''));
			const total = pipelines + handlers;
			if (total === 0) return 0;
			return Math.max(1, Math.ceil(total / 10));
		}
		case 'frontend_rebuild': {
			// 1 unit if JSS/Headless/Mixed approach, 0 for pure MVC/SXA
			const approach = String(answers['frontend_rendering_approach'] ?? '');
			if (approach.includes('JSS') || approach.includes('Headless') || approach.includes('Mixed')) return 1;
			return 0;
		}
		case 'training': {
			// Units = number of selected training areas (excluding "None needed")
			const needs = answers['team_training_needs'];
			if (!needs) return 0;
			if (Array.isArray(needs)) {
				const filtered = needs.filter((n: string) => n !== 'None needed' && n !== 'None');
				return filtered.length;
			}
			const str = String(needs);
			if (str === 'None needed' || str === 'None' || str === '') return 0;
			return str.split(',').filter((s: string) => s.trim() && s.trim() !== 'None needed').length;
		}
		case 'go_live_planning':
			return envCount;
		default:
			return 1;
	}
}

// ── Estimate computation ───────────────────────────────────

interface ComputeEstimateInputs {
	assessmentId: string;
	answers: FlatAnswers;
	envCount: number;
	activeMultipliers: ActiveMultiplier[];
	risks: EvaluatedRisk[];
	assumptions: BuiltAssumption[];
	baseEffort: RawBaseEffort;
	aiAlternatives: RawAiAlternative[];
}

interface EstimateComponent {
	id: string;
	name: string;
	units: number;
	base_hours: number;
	multipliers_applied: Array<{ id: string; name: string; factor: number }>;
	gotcha_hours: number;
	final_hours: number;
	firm_hours: number;
	assumption_dependent_hours: number;
	assumptions_affecting: string[];
	hours: {
		without_ai: { optimistic: number; expected: number; pessimistic: number };
		with_ai: { optimistic: number; expected: number; pessimistic: number };
	};
	ai_alternatives: Array<{
		tool_id: string;
		tool_name: string;
		hours_saved: { optimistic: number; expected: number; pessimistic: number };
	}>;
	by_role: Record<string, number>;
}

interface EstimatePhase {
	id: string;
	name: string;
	duration?: string;
	components: EstimateComponent[];
}

const PHASE_NAMES: Record<string, string> = {
	phase_1_infrastructure: 'Phase 1: Infrastructure',
	phase_2_data: 'Phase 2: Data Migration',
	phase_3_application: 'Phase 3: Application',
	phase_3b_content: 'Phase 3b: Content Migration',
	phase_4_validation: 'Phase 4: Validation',
	phase_5_cutover: 'Phase 5: Cutover',
};

/**
 * Computes a full estimate from analysis results and heuristic data.
 * Output matches SaveEstimateInput for direct DB persistence.
 */
export function computeEstimate(inputs: ComputeEstimateInputs): SaveEstimateInput {
	const {
		assessmentId,
		answers,
		envCount,
		activeMultipliers,
		risks,
		assumptions,
		baseEffort,
		aiAlternatives,
	} = inputs;

	const { components: rawComponents, phase_mapping: phaseMapping } = baseEffort;

	// Build assumption lookup: component → assumption IDs
	const componentAssumptions: Record<string, string[]> = {};
	for (const a of assumptions) {
		for (const comp of a.affected_components) {
			if (!componentAssumptions[comp]) componentAssumptions[comp] = [];
			componentAssumptions[comp].push(a.id);
		}
	}

	// Build gotcha hours per component
	const componentGotchaHours: Record<string, number> = {};
	for (const r of risks) {
		// Distribute gotcha hours across affected components from the risk pattern
		// For risks without explicit affected_components, apply to all
		const comps = r.id ? [r.id] : Object.keys(rawComponents);
		// Actually, we need to look back at the raw gotcha patterns for affected_components
		// Since we only have EvaluatedRisk which doesn't carry affected_components,
		// we distribute hours based on the risk ID matching
		componentGotchaHours[r.id] = (componentGotchaHours[r.id] ?? 0) + r.estimated_hours_impact;
	}

	// Build multiplier lookup: component → applicable multipliers
	const componentMultipliers: Record<string, ActiveMultiplier[]> = {};
	for (const m of activeMultipliers) {
		const targets = m.affected_components.includes('all')
			? Object.keys(rawComponents)
			: m.affected_components;
		for (const comp of targets) {
			if (!componentMultipliers[comp]) componentMultipliers[comp] = [];
			componentMultipliers[comp].push(m);
		}
	}

	// Build AI alternatives per component
	const componentAiAlts: Record<string, RawAiAlternative[]> = {};
	for (const alt of aiAlternatives) {
		for (const comp of alt.applicable_components) {
			if (!componentAiAlts[comp]) componentAiAlts[comp] = [];
			componentAiAlts[comp].push(alt);
		}
	}

	// Build gotcha hours per affected component from risks
	const gotchaPerComponent: Record<string, number> = {};
	// We need the raw gotcha patterns to know affected_components
	// For now, we'll distribute based on pattern naming heuristics
	for (const r of risks) {
		// Check which components this risk affects — use a simple heuristic
		// matching risk ID prefixes to component IDs
		let assigned = false;
		for (const compId of Object.keys(rawComponents)) {
			if (r.id.includes(compId.replace(/_/g, '').substring(0, 6))) {
				gotchaPerComponent[compId] = (gotchaPerComponent[compId] ?? 0) + r.estimated_hours_impact;
				assigned = true;
			}
		}
		if (!assigned) {
			// Distribute evenly across all components as a fallback
			const perComp = r.estimated_hours_impact / Object.keys(rawComponents).length;
			for (const compId of Object.keys(rawComponents)) {
				gotchaPerComponent[compId] = (gotchaPerComponent[compId] ?? 0) + perComp;
			}
		}
	}

	// Compute per-component estimates
	const allEstComponents: Record<string, EstimateComponent> = {};
	let totalBaseHours = 0;
	let totalGotchaHours = 0;
	let totalExpectedHours = 0;
	let totalWideningHours = 0;
	const totalByRole: Record<string, number> = {};

	for (const [compId, rawComp] of Object.entries(rawComponents)) {
		const units = computeUnits(compId, answers, envCount);
		if (units === 0) continue;

		// Combined multiplier factor
		const applicableMultipliers = componentMultipliers[compId] ?? [];
		const combinedFactor = applicableMultipliers.reduce((f, m) => f * m.factor, 1.0);

		// Base hours
		const baseHours = rawComp.base_hours * units;
		const multipliedHours = Math.round(baseHours * combinedFactor * 10) / 10;

		// Gotcha hours for this component
		const gotchaHrs = Math.round((gotchaPerComponent[compId] ?? 0) * 10) / 10;

		// Final hours
		const finalHours = Math.round((multipliedHours + gotchaHrs) * 10) / 10;

		// Assumption-dependent vs firm split
		const affectingAssumptions = componentAssumptions[compId] ?? [];
		const assumptionRatio = affectingAssumptions.length > 0 ? 0.3 : 0;
		const assumptionDependentHours = Math.round(finalHours * assumptionRatio * 10) / 10;
		const firmHours = Math.round((finalHours - assumptionDependentHours) * 10) / 10;

		// Three-point estimate
		const optimistic = Math.round(finalHours * 0.8 * 10) / 10;
		const pessimistic = Math.round(finalHours * 1.3 * 10) / 10;

		// AI alternative savings
		const aiAlts = componentAiAlts[compId] ?? [];
		const maxSavings = finalHours * 0.5; // 50% cap
		let aiSavingsExpected = 0;
		let aiSavingsOptimistic = 0;
		let aiSavingsPessimistic = 0;

		const altEntries: EstimateComponent['ai_alternatives'] = [];
		for (const alt of aiAlts) {
			altEntries.push({
				tool_id: alt.id,
				tool_name: alt.name,
				hours_saved: alt.hours_saved,
			});
			aiSavingsExpected += alt.hours_saved.expected;
			aiSavingsOptimistic += alt.hours_saved.optimistic;
			aiSavingsPessimistic += alt.hours_saved.pessimistic;
		}

		// Cap savings
		aiSavingsExpected = Math.min(aiSavingsExpected, maxSavings);
		aiSavingsOptimistic = Math.min(aiSavingsOptimistic, maxSavings);
		aiSavingsPessimistic = Math.min(aiSavingsPessimistic, maxSavings);

		const withAiExpected = Math.round((finalHours - aiSavingsExpected) * 10) / 10;
		const withAiOptimistic = Math.round((optimistic - aiSavingsOptimistic) * 10) / 10;
		const withAiPessimistic = Math.round((pessimistic - aiSavingsPessimistic) * 10) / 10;

		// Role breakdown (scaled by combined factor and units)
		const byRole: Record<string, number> = {};
		for (const [role, roleHours] of Object.entries(rawComp.role_breakdown)) {
			const scaled = Math.round(roleHours * units * combinedFactor * 10) / 10;
			byRole[role] = scaled;
			totalByRole[role] = (totalByRole[role] ?? 0) + scaled;
		}

		// Widening from unvalidated assumptions affecting this component
		const wideningForComp = assumptions
			.filter((a) => affectingAssumptions.includes(a.id) && a.validation_status !== 'validated')
			.reduce((sum, a) => sum + a.pessimistic_widening_hours, 0);

		allEstComponents[compId] = {
			id: compId,
			name: rawComp.includes?.split(',')[0]?.trim() ?? compId.replace(/_/g, ' '),
			units,
			base_hours: baseHours,
			multipliers_applied: applicableMultipliers.map((m) => ({
				id: m.id,
				name: m.name,
				factor: m.factor,
			})),
			gotcha_hours: gotchaHrs,
			final_hours: finalHours,
			firm_hours: firmHours,
			assumption_dependent_hours: assumptionDependentHours,
			assumptions_affecting: affectingAssumptions,
			hours: {
				without_ai: { optimistic, expected: finalHours, pessimistic },
				with_ai: {
					optimistic: Math.max(withAiOptimistic, 0),
					expected: Math.max(withAiExpected, 0),
					pessimistic: Math.max(withAiPessimistic, 0),
				},
			},
			ai_alternatives: altEntries,
			by_role: byRole,
		};

		totalBaseHours += baseHours;
		totalGotchaHours += gotchaHrs;
		totalExpectedHours += finalHours;
		totalWideningHours += wideningForComp;
	}

	// Build phases
	const phases: EstimatePhase[] = [];
	for (const [phaseId, componentIds] of Object.entries(phaseMapping)) {
		const phaseComponents: EstimateComponent[] = [];
		for (const compId of componentIds) {
			if (allEstComponents[compId]) {
				phaseComponents.push(allEstComponents[compId]);
			}
		}
		if (phaseComponents.length > 0) {
			phases.push({
				id: phaseId,
				name: PHASE_NAMES[phaseId] ?? phaseId,
				components: phaseComponents,
			});
		}
	}

	// Add project_management if not in any phase
	if (allEstComponents['project_management'] && !phases.some((p) =>
		p.components.some((c) => c.id === 'project_management')
	)) {
		// Add to the last phase or create a management phase
		const lastPhase = phases[phases.length - 1];
		if (lastPhase) {
			lastPhase.components.push(allEstComponents['project_management']);
		}
	}

	// Confidence score
	let confirmedCount = 0;
	let totalAnswers = 0;
	// We don't have direct access to discovery here, so we use assumptions as a proxy
	totalAnswers = assumptions.length; // non-confirmed answers
	// The caller can provide a better confidence score from the DB
	const validated = assumptions.filter((a) => a.validation_status === 'validated').length;
	const totalDataPoints = totalAnswers + Object.keys(answers).length;
	const confirmedDataPoints = Object.keys(answers).length - totalAnswers + validated;
	const confidenceScore = totalDataPoints > 0
		? Math.round((confirmedDataPoints / totalDataPoints) * 100)
		: 0;

	// Client summary
	const pessimisticTotal = Math.round(totalExpectedHours * 1.3 + totalWideningHours);
	const optimisticTotal = Math.round(totalExpectedHours * 0.8);

	const clientSummary = {
		recommended_hours: totalExpectedHours,
		range_low: optimisticTotal,
		range_high: pessimisticTotal,
		confidence_score: confidenceScore,
		assumption_count: assumptions.length,
		risk_count: risks.length,
		narrative: `Estimated ${totalExpectedHours} hours (range: ${optimisticTotal}–${pessimisticTotal}). ` +
			`${assumptions.length} assumptions add ${totalWideningHours}h of uncertainty. ` +
			`Confidence: ${confidenceScore}%.`,
	};

	return {
		assessment_id: assessmentId,
		confidence_score: confidenceScore,
		total_base_hours: Math.round(totalBaseHours * 10) / 10,
		total_gotcha_hours: Math.round(totalGotchaHours * 10) / 10,
		total_expected_hours: Math.round(totalExpectedHours * 10) / 10,
		assumption_widening_hours: Math.round(totalWideningHours * 10) / 10,
		totals: {
			optimistic: optimisticTotal,
			expected: Math.round(totalExpectedHours),
			pessimistic: pessimisticTotal,
		},
		total_by_role: totalByRole,
		client_summary: clientSummary,
		phases,
	};
}
