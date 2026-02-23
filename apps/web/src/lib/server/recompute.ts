/**
 * Reactive recomputation pipeline.
 *
 * After discovery/AI-selection/scope/assumption changes, this module
 * re-runs the analysis and estimate engines and saves results to the DB.
 * Computation failure is non-fatal — the triggering save always succeeds.
 */

import { db } from './db.js';
import {
	getDiscovery,
	getAssessmentById,
	getAnalysis,
	saveAnalysis,
	saveEstimate,
	getAiSelections,
	getScopeExclusions,
} from '@migration-planner/db';
import { getComplexityMultipliers, getGotchaPatterns, getDependencyChains, getBaseEffort, getAiAlternatives, getComposedKnowledge } from './knowledge.js';
import { flattenDiscovery, type DiscoveryData } from './condition-evaluator.js';
import { computeAnalysis } from './analysis-engine.js';
import { computeEstimate } from './estimate-engine.js';

export interface RecomputeResult {
	success: boolean;
	analysisRisks?: number;
	analysisAssumptions?: number;
	estimateVersion?: number;
	error?: string;
}

/**
 * Full recomputation: analysis + estimate.
 * Call after discovery changes or assumption validation.
 */
export async function recomputeAll(assessmentId: string): Promise<RecomputeResult> {
	try {
		const database = db();

		// Load current state
		const [assessment, discovery, existingAnalysis] = await Promise.all([
			getAssessmentById(database, assessmentId),
			getDiscovery(database, assessmentId),
			getAnalysis(database, assessmentId),
		]);

		if (!assessment || !discovery) {
			return { success: false, error: 'Assessment or discovery not found' };
		}

		const disc = discovery as DiscoveryData;
		const envCount = assessment.environment_count ?? 1;

		// Load heuristics — try DB composition first, fall back to JSON files
		let rawMultipliers: any;
		let rawGotchas: any;
		let rawDeps: any;
		let baseEffort: any;
		let aiAlts: any;

		let usedComposition = false;
		try {
			const composed = await getComposedKnowledge(assessmentId);
			if (composed && composed.effort_hours.length > 0) {
				usedComposition = true;
				// Map composed output to shapes the engines expect
				rawMultipliers = composed.multipliers.map((m: any) => ({
					id: m.multiplier_id ?? m.id,
					condition: m.condition ?? '',
					multiplier: m.factor ?? 1.0,
					applies_to: m.applies_to ?? [],
					reason: m.reason ?? (m.multiplier_id ?? m.id),
					supersedes: m.supersedes ?? undefined,
				}));
				rawGotchas = composed.gotcha_patterns.map((g: any) => ({
					id: g.pattern_id ?? g.id,
					pattern: g.pattern_condition ?? '',
					risk: g.risk_level ?? 'medium',
					hours_impact: g.hours_impact ?? 0,
					description: g.description ?? '',
					mitigation: g.mitigation ?? '',
					affected_components: g.affected_components ?? [],
				}));
				rawDeps = {
					dependencies: composed.dependency_chains.map((c: any) => ({
						id: c.chain_id ?? c.id,
						predecessor: c.predecessor ?? '',
						successors: c.successors ?? [],
						type: c.dependency_type ?? 'hard',
						reason: c.reason ?? '',
					})),
					critical_path_template: { description: '', path: [], parallel_tracks: [] },
				};

				// Build baseEffort in the shape expected by computeAnalysis/computeEstimate
				const components: Record<string, any> = {};
				for (const eh of composed.effort_hours) {
					const cid = (eh as any).component_id;
					if (cid) {
						components[cid] = {
							id: cid,
							name: (eh as any).component_name ?? cid,
							base_hours: (eh as any).base_hours ?? 0,
							unit: (eh as any).unit ?? '',
							phase: (eh as any).phase_id ?? '',
							roles: (eh as any).role_breakdown ?? {},
							description: (eh as any).includes ?? '',
						};
					}
				}
				const phases: Record<string, any> = {};
				for (const pm of composed.phase_mappings) {
					const pid = (pm as any).phase_id;
					if (pid) {
						phases[pid] = {
							name: (pm as any).phase_name ?? pid,
							order: (pm as any).phase_order ?? 0,
							component_ids: (pm as any).component_ids ?? [],
						};
					}
				}
				const roles: Record<string, any> = {};
				for (const r of composed.roles) {
					const rid = (r as any).role_id;
					if (rid) {
						roles[rid] = {
							description: (r as any).description ?? '',
							typical_rate_range: (r as any).typical_rate_range ?? '',
						};
					}
				}
				baseEffort = { components, phases, roles };
				aiAlts = getAiAlternatives();
			}
		} catch {
			// DB composition unavailable — fall through to JSON
		}

		if (!usedComposition) {
			rawMultipliers = loadRawMultipliers();
			rawGotchas = loadRawGotchas();
			rawDeps = getDependencyChains();
			baseEffort = loadRawBaseEffort();
			aiAlts = getAiAlternatives();
		}

		// 1. Compute analysis
		const analysis = computeAnalysis({
			discovery: disc,
			rawMultipliers,
			rawGotchas,
			rawDependencies: rawDeps,
			allComponentIds: Object.keys(baseEffort.components),
		});
		analysis.assessment_id = assessmentId;

		// Preserve validation metadata from existing assumptions
		if (existingAnalysis?.assumptions) {
			const priorMap = new Map(
				(existingAnalysis.assumptions as any[]).map((a: any) => [a.id, a])
			);
			analysis.assumptions = (analysis.assumptions ?? []).map((a: any) => {
				const prior = priorMap.get(a.id);
				if (prior && prior.validation_status !== 'unvalidated') {
					return {
						...a,
						validation_status: prior.validation_status,
						actual_value: prior.actual_value ?? a.actual_value,
					};
				}
				return a;
			});
		}

		// Save analysis
		const analysisResult = await saveAnalysis(database, analysis);

		// 2. Compute estimate
		const estimate = computeEstimate({
			assessmentId,
			answers: analysis._meta.flat_answers,
			envCount,
			activeMultipliers: analysis.active_multipliers as any[],
			risks: analysis.risks as any[],
			assumptions: analysis.assumptions as any[],
			baseEffort,
			aiAlternatives: aiAlts as any[],
		});

		// Save estimate
		const estimateResult = await saveEstimate(database, estimate);

		return {
			success: true,
			analysisRisks: (analysis.risks ?? []).length,
			analysisAssumptions: (analysis.assumptions ?? []).length,
			estimateVersion: estimateResult.version,
		};
	} catch (err) {
		console.error('[recompute] Error during recomputation:', err);
		return {
			success: false,
			error: err instanceof Error ? err.message : String(err),
		};
	}
}

/**
 * Estimate-only recomputation.
 * Call after AI selection or scope exclusion changes (analysis doesn't change).
 */
export async function recomputeEstimate(assessmentId: string): Promise<RecomputeResult> {
	try {
		const database = db();

		const [assessment, discovery, existingAnalysis] = await Promise.all([
			getAssessmentById(database, assessmentId),
			getDiscovery(database, assessmentId),
			// We need the current analysis for multipliers/risks/assumptions
			import('@migration-planner/db').then((m) => m.getAnalysis(database, assessmentId)),
		]);

		if (!assessment || !discovery) {
			return { success: false, error: 'Assessment or discovery not found' };
		}

		if (!existingAnalysis) {
			// No analysis yet — run full recompute instead
			return recomputeAll(assessmentId);
		}

		const disc = discovery as DiscoveryData;
		const answers = flattenDiscovery(disc);
		const envCount = assessment.environment_count ?? 1;

		const baseEffort = loadRawBaseEffort();
		const aiAlts = getAiAlternatives();

		const estimate = computeEstimate({
			assessmentId,
			answers,
			envCount,
			activeMultipliers: (existingAnalysis.active_multipliers ?? []).map((m: any) => ({
				id: m.multiplier_id ?? m.id,
				name: m.name,
				factor: m.factor,
				trigger: m.trigger_condition ?? m.trigger ?? '',
				affected_components: m.affected_components ?? [],
			})),
			risks: (existingAnalysis.risks ?? []).map((r: any) => ({
				id: r.id,
				category: r.category ?? 'gotcha',
				description: r.description ?? '',
				likelihood: r.likelihood ?? '',
				impact: r.impact ?? '',
				severity: r.severity ?? '',
				estimated_hours_impact: r.estimated_hours_impact ?? 0,
				mitigation: r.mitigation ?? '',
				contingency: r.contingency ?? '',
				linked_assumptions: r.linked_assumptions ?? [],
				owner: r.owner ?? '',
				status: r.status ?? 'open',
			})),
			assumptions: (existingAnalysis.assumptions ?? []).map((a: any) => ({
				id: a.id,
				dimension: a.dimension ?? '',
				question_id: a.question_id ?? null,
				assumed_value: a.assumed_value ?? '',
				basis: a.basis ?? '',
				confidence: a.confidence ?? 'unknown',
				validation_status: a.validation_status ?? 'unvalidated',
				validation_method: a.validation_method ?? '',
				pessimistic_widening_hours: a.pessimistic_widening_hours ?? 0,
				affected_components: a.affected_components ?? [],
			})),
			baseEffort,
			aiAlternatives: aiAlts as any[],
		});

		const estimateResult = await saveEstimate(database, estimate);

		return {
			success: true,
			estimateVersion: estimateResult.version,
		};
	} catch (err) {
		console.error('[recompute] Error during estimate recomputation:', err);
		return {
			success: false,
			error: err instanceof Error ? err.message : String(err),
		};
	}
}

// ── Raw JSON loaders (bypass knowledge.ts interface mapping) ────

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function findHeuristicsDir(): string {
	const subpath = join('skills', 'migrate-knowledge', 'heuristics');
	let dir = resolve(__dirname);
	for (let i = 0; i < 10; i++) {
		const candidate = join(dir, subpath);
		if (existsSync(join(candidate, 'ai-alternatives.json'))) return candidate;
		const parent = dirname(dir);
		if (parent === dir) break;
		dir = parent;
	}
	dir = resolve(process.cwd());
	for (let i = 0; i < 10; i++) {
		const candidate = join(dir, subpath);
		if (existsSync(join(candidate, 'ai-alternatives.json'))) return candidate;
		const parent = dirname(dir);
		if (parent === dir) break;
		dir = parent;
	}
	throw new Error('Cannot find heuristics directory');
}

let _hDir: string | null = null;
function getHDir(): string {
	if (!_hDir) _hDir = findHeuristicsDir();
	return _hDir;
}

function loadRawJson<T>(filename: string): T {
	return JSON.parse(readFileSync(resolve(getHDir(), filename), 'utf-8'));
}

let _rawMultipliers: any = null;
function loadRawMultipliers() {
	if (!_rawMultipliers) {
		const data = loadRawJson<{ multipliers: any[] }>('complexity-multipliers.json');
		_rawMultipliers = data.multipliers;
	}
	return _rawMultipliers;
}

let _rawGotchas: any = null;
function loadRawGotchas() {
	if (!_rawGotchas) {
		const data = loadRawJson<{ patterns: any[] }>('gotcha-patterns.json');
		_rawGotchas = data.patterns;
	}
	return _rawGotchas;
}

let _rawBaseEffort: any = null;
function loadRawBaseEffort() {
	if (!_rawBaseEffort) {
		_rawBaseEffort = loadRawJson('base-effort-hours.json');
	}
	return _rawBaseEffort;
}
