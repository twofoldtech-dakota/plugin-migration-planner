/**
 * Estimate Diff Engine
 *
 * Pure functions for computing structured diffs between two estimate snapshots.
 * Works entirely client-side with no side effects.
 */

// ── Types ──────────────────────────────────────────────────────

export type Direction = 'increased' | 'decreased' | 'unchanged';

export interface NumericDelta {
	from: number;
	to: number;
	delta: number;
	deltaPercent: number;
	direction: Direction;
}

export type ItemStatus = 'added' | 'removed' | 'modified' | 'unchanged';

export interface ComponentDiff {
	id: string;
	name: string;
	status: ItemStatus;
	base_hours: NumericDelta;
	final_hours: NumericDelta;
	gotcha_hours: NumericDelta;
	firm_hours: NumericDelta;
	assumption_dependent_hours: NumericDelta;
	units: NumericDelta;
	multipliers: {
		added: string[];
		removed: string[];
		unchanged: string[];
	};
	assumptions: {
		added: string[];
		removed: string[];
		unchanged: string[];
	};
	roles: Record<string, NumericDelta>;
	hours: {
		without_ai?: ThreePointDelta;
		with_ai?: ThreePointDelta;
	};
}

export interface ThreePointDelta {
	optimistic: NumericDelta;
	expected: NumericDelta;
	pessimistic: NumericDelta;
}

export interface PhaseDiff {
	id: string;
	name: string;
	status: ItemStatus;
	total_hours: NumericDelta;
	components: ComponentDiff[];
}

export interface RoleDelta {
	role: string;
	delta: NumericDelta;
}

export interface EstimateComparison {
	from_version: number;
	to_version: number;
	summary: {
		total_expected_hours: NumericDelta;
		total_base_hours: NumericDelta;
		total_gotcha_hours: NumericDelta;
		assumption_widening_hours: NumericDelta;
		confidence_score: NumericDelta;
	};
	phases: PhaseDiff[];
	roles: RoleDelta[];
}

// ── Helpers ────────────────────────────────────────────────────

function direction(delta: number): Direction {
	if (delta > 0) return 'increased';
	if (delta < 0) return 'decreased';
	return 'unchanged';
}

export function numericDelta(from: number, to: number): NumericDelta {
	const delta = to - from;
	const deltaPercent = from !== 0 ? (delta / Math.abs(from)) * 100 : to !== 0 ? 100 : 0;
	return { from, to, delta, deltaPercent, direction: direction(delta) };
}

function normalizeMultiplier(mult: unknown): string {
	if (typeof mult === 'string') return mult;
	if (mult && typeof mult === 'object') {
		const obj = mult as Record<string, unknown>;
		return (obj.id as string) ?? (obj.name as string) ?? JSON.stringify(mult);
	}
	return String(mult);
}

function diffSets(from: string[], to: string[]): { added: string[]; removed: string[]; unchanged: string[] } {
	const fromSet = new Set(from);
	const toSet = new Set(to);
	return {
		added: to.filter((x) => !fromSet.has(x)),
		removed: from.filter((x) => !toSet.has(x)),
		unchanged: from.filter((x) => toSet.has(x)),
	};
}

function diffRoles(
	fromRoles: Record<string, number>,
	toRoles: Record<string, number>
): Record<string, NumericDelta> {
	const allKeys = new Set([...Object.keys(fromRoles), ...Object.keys(toRoles)]);
	const result: Record<string, NumericDelta> = {};
	for (const key of allKeys) {
		result[key] = numericDelta(fromRoles[key] ?? 0, toRoles[key] ?? 0);
	}
	return result;
}

function diffThreePoint(from: Record<string, unknown> | undefined, to: Record<string, unknown> | undefined): ThreePointDelta | undefined {
	if (!from && !to) return undefined;
	const f = (from ?? {}) as Record<string, number>;
	const t = (to ?? {}) as Record<string, number>;
	return {
		optimistic: numericDelta(f.optimistic ?? 0, t.optimistic ?? 0),
		expected: numericDelta(f.expected ?? 0, t.expected ?? 0),
		pessimistic: numericDelta(f.pessimistic ?? 0, t.pessimistic ?? 0),
	};
}

// ── Core Diff ──────────────────────────────────────────────────

function diffComponent(from: Record<string, unknown> | null, to: Record<string, unknown> | null): ComponentDiff {
	const f = from ?? {};
	const t = to ?? {};

	const fromMults = ((f.multipliers_applied ?? []) as unknown[]).map(normalizeMultiplier);
	const toMults = ((t.multipliers_applied ?? []) as unknown[]).map(normalizeMultiplier);

	const fromAssumptions = (f.assumptions_affecting ?? []) as string[];
	const toAssumptions = (t.assumptions_affecting ?? []) as string[];

	const fromRoles = (f.by_role ?? {}) as Record<string, number>;
	const toRoles = (t.by_role ?? {}) as Record<string, number>;

	const fromHours = (f.hours ?? {}) as Record<string, Record<string, number>>;
	const toHours = (t.hours ?? {}) as Record<string, Record<string, number>>;

	let status: ItemStatus;
	if (!from) status = 'added';
	else if (!to) status = 'removed';
	else {
		const base = numericDelta((f.base_hours ?? 0) as number, (t.base_hours ?? 0) as number);
		const final = numericDelta((f.final_hours ?? 0) as number, (t.final_hours ?? 0) as number);
		const gotcha = numericDelta((f.gotcha_hours ?? 0) as number, (t.gotcha_hours ?? 0) as number);
		const multDiff = diffSets(fromMults, toMults);
		const assumpDiff = diffSets(fromAssumptions, toAssumptions);
		const hasChanges =
			base.delta !== 0 ||
			final.delta !== 0 ||
			gotcha.delta !== 0 ||
			multDiff.added.length > 0 ||
			multDiff.removed.length > 0 ||
			assumpDiff.added.length > 0 ||
			assumpDiff.removed.length > 0;
		status = hasChanges ? 'modified' : 'unchanged';
	}

	return {
		id: ((t.id ?? f.id) as string) ?? '',
		name: ((t.name ?? f.name) as string) ?? '',
		status,
		base_hours: numericDelta((f.base_hours ?? 0) as number, (t.base_hours ?? 0) as number),
		final_hours: numericDelta((f.final_hours ?? 0) as number, (t.final_hours ?? 0) as number),
		gotcha_hours: numericDelta((f.gotcha_hours ?? 0) as number, (t.gotcha_hours ?? 0) as number),
		firm_hours: numericDelta((f.firm_hours ?? 0) as number, (t.firm_hours ?? 0) as number),
		assumption_dependent_hours: numericDelta(
			(f.assumption_dependent_hours ?? 0) as number,
			(t.assumption_dependent_hours ?? 0) as number
		),
		units: numericDelta((f.units ?? 1) as number, (t.units ?? 1) as number),
		multipliers: diffSets(fromMults, toMults),
		assumptions: diffSets(fromAssumptions, toAssumptions),
		roles: diffRoles(fromRoles, toRoles),
		hours: {
			without_ai: diffThreePoint(fromHours.without_ai, toHours.without_ai),
			with_ai: diffThreePoint(fromHours.with_ai, toHours.with_ai),
		},
	};
}

function diffPhase(
	fromPhase: Record<string, unknown> | null,
	toPhase: Record<string, unknown> | null
): PhaseDiff {
	const f = fromPhase ?? {};
	const t = toPhase ?? {};

	const fromComps = ((f.components ?? []) as Record<string, unknown>[]);
	const toComps = ((t.components ?? []) as Record<string, unknown>[]);

	const fromMap = new Map(fromComps.map((c) => [c.id as string, c]));
	const toMap = new Map(toComps.map((c) => [c.id as string, c]));

	const allIds = new Set([...fromMap.keys(), ...toMap.keys()]);
	const components: ComponentDiff[] = [];
	for (const id of allIds) {
		components.push(diffComponent(fromMap.get(id) ?? null, toMap.get(id) ?? null));
	}

	// Compute total hours for the phase
	const fromTotal = fromComps.reduce((s, c) => s + ((c.final_hours ?? 0) as number), 0);
	const toTotal = toComps.reduce((s, c) => s + ((c.final_hours ?? 0) as number), 0);

	let status: ItemStatus;
	if (!fromPhase) status = 'added';
	else if (!toPhase) status = 'removed';
	else {
		const hasChanges = components.some((c) => c.status !== 'unchanged');
		status = hasChanges ? 'modified' : 'unchanged';
	}

	return {
		id: ((t.id ?? f.id) as string) ?? '',
		name: ((t.name ?? f.name) as string) ?? '',
		status,
		total_hours: numericDelta(fromTotal, toTotal),
		components,
	};
}

// ── Public API ─────────────────────────────────────────────────

export function computeEstimateComparison(
	from: Record<string, unknown>,
	to: Record<string, unknown>
): EstimateComparison {
	const fromPhases = (from.phases ?? []) as Record<string, unknown>[];
	const toPhases = (to.phases ?? []) as Record<string, unknown>[];

	const fromPhaseMap = new Map(fromPhases.map((p) => [p.id as string, p]));
	const toPhaseMap = new Map(toPhases.map((p) => [p.id as string, p]));

	// Maintain order: toPhases order first, then any removed fromPhases
	const orderedIds: string[] = [];
	const seen = new Set<string>();
	for (const p of toPhases) {
		orderedIds.push(p.id as string);
		seen.add(p.id as string);
	}
	for (const p of fromPhases) {
		if (!seen.has(p.id as string)) {
			orderedIds.push(p.id as string);
		}
	}

	const phases: PhaseDiff[] = orderedIds.map((id) =>
		diffPhase(fromPhaseMap.get(id) ?? null, toPhaseMap.get(id) ?? null)
	);

	// Aggregate role diffs
	const fromRoles: Record<string, number> = {};
	const toRoles: Record<string, number> = {};
	for (const p of fromPhases) {
		for (const c of (p.components ?? []) as Record<string, unknown>[]) {
			const byRole = (c.by_role ?? {}) as Record<string, number>;
			for (const [role, hours] of Object.entries(byRole)) {
				fromRoles[role] = (fromRoles[role] ?? 0) + hours;
			}
		}
	}
	for (const p of toPhases) {
		for (const c of (p.components ?? []) as Record<string, unknown>[]) {
			const byRole = (c.by_role ?? {}) as Record<string, number>;
			for (const [role, hours] of Object.entries(byRole)) {
				toRoles[role] = (toRoles[role] ?? 0) + hours;
			}
		}
	}
	const roleDiffs = diffRoles(fromRoles, toRoles);
	const roles: RoleDelta[] = Object.entries(roleDiffs)
		.map(([role, delta]) => ({ role, delta }))
		.sort((a, b) => Math.abs(b.delta.delta) - Math.abs(a.delta.delta));

	return {
		from_version: (from.version ?? 0) as number,
		to_version: (to.version ?? 0) as number,
		summary: {
			total_expected_hours: numericDelta(
				(from.total_expected_hours ?? 0) as number,
				(to.total_expected_hours ?? 0) as number
			),
			total_base_hours: numericDelta(
				(from.total_base_hours ?? 0) as number,
				(to.total_base_hours ?? 0) as number
			),
			total_gotcha_hours: numericDelta(
				(from.total_gotcha_hours ?? 0) as number,
				(to.total_gotcha_hours ?? 0) as number
			),
			assumption_widening_hours: numericDelta(
				(from.assumption_widening_hours ?? 0) as number,
				(to.assumption_widening_hours ?? 0) as number
			),
			confidence_score: numericDelta(
				(from.confidence_score ?? 0) as number,
				(to.confidence_score ?? 0) as number
			),
		},
		phases,
		roles,
	};
}
