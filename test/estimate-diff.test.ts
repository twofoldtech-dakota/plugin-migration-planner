/**
 * Estimate Diff Engine unit tests.
 *
 * Run: npx tsx test/estimate-diff.test.ts
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { numericDelta, computeEstimateComparison } from '../apps/web/src/lib/utils/estimate-diff.js';

// ── numericDelta ───────────────────────────────────────────────

describe('numericDelta', () => {
	it('computes positive delta', () => {
		const d = numericDelta(100, 120);
		assert.equal(d.from, 100);
		assert.equal(d.to, 120);
		assert.equal(d.delta, 20);
		assert.equal(d.deltaPercent, 20);
		assert.equal(d.direction, 'increased');
	});

	it('computes negative delta', () => {
		const d = numericDelta(100, 80);
		assert.equal(d.delta, -20);
		assert.equal(d.deltaPercent, -20);
		assert.equal(d.direction, 'decreased');
	});

	it('handles unchanged', () => {
		const d = numericDelta(50, 50);
		assert.equal(d.delta, 0);
		assert.equal(d.deltaPercent, 0);
		assert.equal(d.direction, 'unchanged');
	});

	it('handles division by zero (from=0, to>0)', () => {
		const d = numericDelta(0, 100);
		assert.equal(d.delta, 100);
		assert.equal(d.deltaPercent, 100);
		assert.equal(d.direction, 'increased');
	});

	it('handles both zero', () => {
		const d = numericDelta(0, 0);
		assert.equal(d.delta, 0);
		assert.equal(d.deltaPercent, 0);
		assert.equal(d.direction, 'unchanged');
	});
});

// ── computeEstimateComparison ──────────────────────────────────

describe('computeEstimateComparison', () => {
	const baseEstimate = {
		version: 1,
		confidence_score: 60,
		total_expected_hours: 500,
		total_base_hours: 400,
		total_gotcha_hours: 50,
		assumption_widening_hours: 50,
		phases: [
			{
				id: 'phase-1',
				name: 'Planning',
				components: [
					{
						id: 'comp-1',
						name: 'Content Audit',
						base_hours: 40,
						final_hours: 48,
						gotcha_hours: 8,
						firm_hours: 30,
						assumption_dependent_hours: 10,
						units: 1,
						multipliers_applied: ['legacy_code'],
						assumptions_affecting: ['A1', 'A2'],
						by_role: { developer: 30, architect: 18 },
						hours: {
							without_ai: { optimistic: 36, expected: 48, pessimistic: 60 },
							with_ai: { optimistic: 28, expected: 38, pessimistic: 50 },
						},
					},
					{
						id: 'comp-2',
						name: 'Data Migration',
						base_hours: 100,
						final_hours: 120,
						gotcha_hours: 20,
						firm_hours: 80,
						assumption_dependent_hours: 20,
						units: 3,
						multipliers_applied: [{ id: 'large_db', name: 'Large Database', factor: 1.5 }],
						assumptions_affecting: ['A1'],
						by_role: { developer: 80, devops: 40 },
						hours: {},
					},
				],
			},
		],
	};

	it('detects summary-level deltas', () => {
		const updated = {
			...baseEstimate,
			version: 2,
			confidence_score: 75,
			total_expected_hours: 550,
			total_base_hours: 420,
			total_gotcha_hours: 60,
			assumption_widening_hours: 70,
		};

		const diff = computeEstimateComparison(baseEstimate, updated);

		assert.equal(diff.from_version, 1);
		assert.equal(diff.to_version, 2);
		assert.equal(diff.summary.total_expected_hours.delta, 50);
		assert.equal(diff.summary.confidence_score.delta, 15);
		assert.equal(diff.summary.confidence_score.direction, 'increased');
		assert.equal(diff.summary.total_gotcha_hours.delta, 10);
	});

	it('detects added components', () => {
		const updated = {
			...baseEstimate,
			version: 2,
			phases: [
				{
					...baseEstimate.phases[0],
					components: [
						...baseEstimate.phases[0].components,
						{
							id: 'comp-3',
							name: 'New Component',
							base_hours: 20,
							final_hours: 25,
							gotcha_hours: 5,
							firm_hours: 15,
							assumption_dependent_hours: 5,
							units: 1,
							multipliers_applied: [],
							assumptions_affecting: [],
							by_role: { developer: 25 },
							hours: {},
						},
					],
				},
			],
		};

		const diff = computeEstimateComparison(baseEstimate, updated);
		const phase = diff.phases[0];
		const added = phase.components.find((c) => c.id === 'comp-3');

		assert.ok(added);
		assert.equal(added.status, 'added');
		assert.equal(added.base_hours.from, 0);
		assert.equal(added.base_hours.to, 20);
		assert.equal(phase.status, 'modified');
	});

	it('detects removed components', () => {
		const updated = {
			...baseEstimate,
			version: 2,
			phases: [
				{
					...baseEstimate.phases[0],
					components: [baseEstimate.phases[0].components[0]],
				},
			],
		};

		const diff = computeEstimateComparison(baseEstimate, updated);
		const removed = diff.phases[0].components.find((c) => c.id === 'comp-2');

		assert.ok(removed);
		assert.equal(removed.status, 'removed');
		assert.equal(removed.final_hours.to, 0);
		assert.equal(removed.final_hours.from, 120);
	});

	it('detects modified components', () => {
		const updated = {
			...baseEstimate,
			version: 2,
			phases: [
				{
					...baseEstimate.phases[0],
					components: [
						{
							...baseEstimate.phases[0].components[0],
							base_hours: 50,
							final_hours: 58,
							gotcha_hours: 8,
						},
						baseEstimate.phases[0].components[1],
					],
				},
			],
		};

		const diff = computeEstimateComparison(baseEstimate, updated);
		const modified = diff.phases[0].components.find((c) => c.id === 'comp-1');

		assert.ok(modified);
		assert.equal(modified.status, 'modified');
		assert.equal(modified.base_hours.delta, 10);
		assert.equal(modified.final_hours.delta, 10);
	});

	it('detects unchanged components', () => {
		const diff = computeEstimateComparison(baseEstimate, { ...baseEstimate, version: 2 });
		const comp = diff.phases[0].components.find((c) => c.id === 'comp-1');

		assert.ok(comp);
		assert.equal(comp.status, 'unchanged');
	});

	it('diffs multipliers (string and object formats)', () => {
		const updated = {
			...baseEstimate,
			version: 2,
			phases: [
				{
					...baseEstimate.phases[0],
					components: [
						{
							...baseEstimate.phases[0].components[0],
							multipliers_applied: ['legacy_code', 'new_multiplier'],
							final_hours: 55,
						},
						baseEstimate.phases[0].components[1],
					],
				},
			],
		};

		const diff = computeEstimateComparison(baseEstimate, updated);
		const comp = diff.phases[0].components.find((c) => c.id === 'comp-1');

		assert.ok(comp);
		assert.deepEqual(comp.multipliers.added, ['new_multiplier']);
		assert.deepEqual(comp.multipliers.removed, []);
		assert.deepEqual(comp.multipliers.unchanged, ['legacy_code']);
	});

	it('diffs assumptions', () => {
		const updated = {
			...baseEstimate,
			version: 2,
			phases: [
				{
					...baseEstimate.phases[0],
					components: [
						{
							...baseEstimate.phases[0].components[0],
							assumptions_affecting: ['A2', 'A3'],
							final_hours: 50,
						},
						baseEstimate.phases[0].components[1],
					],
				},
			],
		};

		const diff = computeEstimateComparison(baseEstimate, updated);
		const comp = diff.phases[0].components.find((c) => c.id === 'comp-1');

		assert.ok(comp);
		assert.deepEqual(comp.assumptions.added, ['A3']);
		assert.deepEqual(comp.assumptions.removed, ['A1']);
		assert.deepEqual(comp.assumptions.unchanged, ['A2']);
	});

	it('diffs role breakdowns', () => {
		const updated = {
			...baseEstimate,
			version: 2,
			phases: [
				{
					...baseEstimate.phases[0],
					components: [
						{
							...baseEstimate.phases[0].components[0],
							by_role: { developer: 40, architect: 18, qa: 10 },
							final_hours: 58,
						},
						baseEstimate.phases[0].components[1],
					],
				},
			],
		};

		const diff = computeEstimateComparison(baseEstimate, updated);
		const comp = diff.phases[0].components.find((c) => c.id === 'comp-1');

		assert.ok(comp);
		assert.equal(comp.roles.developer.delta, 10);
		assert.equal(comp.roles.architect.delta, 0);
		assert.equal(comp.roles.qa.from, 0);
		assert.equal(comp.roles.qa.to, 10);
		assert.equal(comp.roles.qa.direction, 'increased');
	});

	it('aggregates role-level diffs', () => {
		const diff = computeEstimateComparison(baseEstimate, { ...baseEstimate, version: 2 });

		assert.ok(diff.roles.length > 0);
		for (const r of diff.roles) {
			assert.equal(r.delta.direction, 'unchanged');
		}
	});

	it('handles added phases', () => {
		const updated = {
			...baseEstimate,
			version: 2,
			phases: [
				...baseEstimate.phases,
				{
					id: 'phase-2',
					name: 'Deployment',
					components: [
						{
							id: 'comp-deploy',
							name: 'Deploy Setup',
							base_hours: 16,
							final_hours: 16,
							gotcha_hours: 0,
							firm_hours: 16,
							assumption_dependent_hours: 0,
							units: 1,
							multipliers_applied: [],
							assumptions_affecting: [],
							by_role: { devops: 16 },
							hours: {},
						},
					],
				},
			],
		};

		const diff = computeEstimateComparison(baseEstimate, updated);
		const addedPhase = diff.phases.find((p) => p.id === 'phase-2');

		assert.ok(addedPhase);
		assert.equal(addedPhase.status, 'added');
		assert.equal(addedPhase.total_hours.from, 0);
		assert.equal(addedPhase.total_hours.to, 16);
	});

	it('handles removed phases', () => {
		const updated = {
			...baseEstimate,
			version: 2,
			phases: [],
		};

		const diff = computeEstimateComparison(baseEstimate, updated);
		const removedPhase = diff.phases.find((p) => p.id === 'phase-1');

		assert.ok(removedPhase);
		assert.equal(removedPhase.status, 'removed');
	});

	it('diffs three-point estimates', () => {
		const updated = {
			...baseEstimate,
			version: 2,
			phases: [
				{
					...baseEstimate.phases[0],
					components: [
						{
							...baseEstimate.phases[0].components[0],
							hours: {
								without_ai: { optimistic: 40, expected: 52, pessimistic: 68 },
								with_ai: { optimistic: 30, expected: 42, pessimistic: 55 },
							},
							final_hours: 52,
						},
						baseEstimate.phases[0].components[1],
					],
				},
			],
		};

		const diff = computeEstimateComparison(baseEstimate, updated);
		const comp = diff.phases[0].components.find((c) => c.id === 'comp-1');

		assert.ok(comp);
		assert.ok(comp.hours.without_ai);
		assert.equal(comp.hours.without_ai.optimistic.delta, 4);
		assert.equal(comp.hours.without_ai.expected.delta, 4);
		assert.equal(comp.hours.without_ai.pessimistic.delta, 8);
		assert.ok(comp.hours.with_ai);
		assert.equal(comp.hours.with_ai.optimistic.delta, 2);
	});

	it('handles empty estimates gracefully', () => {
		const empty = { version: 1, phases: [] };
		const diff = computeEstimateComparison(empty, empty);

		assert.equal(diff.phases.length, 0);
		assert.equal(diff.roles.length, 0);
		assert.equal(diff.summary.total_expected_hours.delta, 0);
	});
});
