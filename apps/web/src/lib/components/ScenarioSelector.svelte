<script lang="ts">
	import type { Scenario } from '$lib/utils/scenario-engine';
	import type { ScenarioTotals } from '$lib/utils/scenario-engine';

	interface Props {
		scenario: Scenario;
		onchange: (s: Scenario) => void;
		totals?: ScenarioTotals;
	}

	let { scenario, onchange, totals }: Props = $props();

	const scenarios: { id: Scenario; label: string; desc: string; icon: string }[] = [
		{ id: 'manual', label: 'Manual', desc: 'Full effort, no AI tooling', icon: '⛏' },
		{ id: 'ai_assisted', label: 'AI-Assisted', desc: 'Selected tools enabled', icon: '⚡' },
		{ id: 'best_case', label: 'Best Case', desc: 'All AI tools, optimistic estimates', icon: '🎯' }
	];

	function hoursFor(id: Scenario): number | null {
		if (!totals) return null;
		if (id === 'manual') return totals.manual;
		if (id === 'ai_assisted') return totals.aiAssisted;
		return totals.bestCase;
	}

	function savingsFor(id: Scenario): { hours: number; percent: number } | null {
		if (!totals || id === 'manual' || totals.manual === 0) return null;
		const hours = totals.manual - (hoursFor(id) ?? 0);
		if (hours <= 0) return null;
		return { hours, percent: Math.round((hours / totals.manual) * 100) };
	}
</script>

<div role="radiogroup" aria-label="Estimation scenario" class="grid grid-cols-3 gap-3">
	{#each scenarios as s}
		{@const active = scenario === s.id}
		{@const hours = hoursFor(s.id)}
		{@const saved = savingsFor(s.id)}
		<button
			class="relative text-left px-4 py-3.5 border-3 transition-all duration-150 cursor-pointer
				focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
				{active
				? 'border-primary bg-primary text-white shadow-[4px_4px_0_theme(colors.primary/0.4)]'
				: 'border-brutal bg-surface hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_#000] active:translate-x-0 active:translate-y-0 active:shadow-none'}"
			onclick={() => onchange(s.id)}
			role="radio"
			aria-checked={active}
		>
			<!-- Top row: icon + label -->
			<div class="flex items-center justify-between mb-2">
				<div class="flex items-center gap-1.5">
					<span class="text-sm" aria-hidden="true">{s.icon}</span>
					<span class="text-xs font-extrabold uppercase tracking-wider">{s.label}</span>
				</div>
				{#if active}
					<span class="w-4 h-4 flex items-center justify-center border-2 border-white/50 bg-white/20 text-[10px] leading-none" aria-hidden="true">✓</span>
				{/if}
			</div>

			<!-- Hero hours -->
			{#if hours !== null}
				<span class="block text-2xl font-extrabold font-mono tracking-tight leading-none">
					{Math.round(hours).toLocaleString()}h
				</span>
			{/if}

			<!-- Savings delta (not shown for manual) -->
			<div class="mt-1.5 h-4">
				{#if saved}
					<span class="text-xs font-bold font-mono {active ? 'text-white/70' : 'text-success'}">
						-{Math.round(saved.hours).toLocaleString()}h ({saved.percent}%)
					</span>
				{/if}
			</div>

			<!-- Description -->
			<span class="block text-[10px] mt-1 {active ? 'text-white/60' : 'text-text-muted'}">
				{s.desc}
			</span>
		</button>
	{/each}
</div>
