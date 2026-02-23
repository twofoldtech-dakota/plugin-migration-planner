<script lang="ts">
	import Tooltip from './ui/Tooltip.svelte';
	import type { Scenario } from '$lib/utils/scenario-engine';

	interface Props {
		manualTotal: number;
		aiAssistedTotal: number;
		bestCaseTotal: number;
		activeScenario: Scenario;
		onselect?: (s: Scenario) => void;
	}

	let { manualTotal, aiAssistedTotal, bestCaseTotal, activeScenario, onselect }: Props = $props();

	const scenarioTooltips: Record<string, string> = {
		manual: 'Full effort with no AI tooling. Baseline hours.',
		ai_assisted: 'Hours reduced by enabled AI tools. Default view.',
		best_case: 'All AI tools enabled at optimistic savings.'
	};

	const scenarios = $derived([
		{ id: 'manual' as Scenario, label: 'Manual', hours: manualTotal, color: 'bg-text-muted' },
		{ id: 'ai_assisted' as Scenario, label: 'AI-Assisted', hours: aiAssistedTotal, color: 'bg-primary' },
		{ id: 'best_case' as Scenario, label: 'Best Case', hours: bestCaseTotal, color: 'bg-success' }
	]);
</script>

<div class="space-y-4">
	{#each scenarios as s}
		{@const isActive = activeScenario === s.id}
		<button
			class="w-full text-left"
			onclick={() => onselect?.(s.id)}
		>
			<div class="flex items-center justify-between mb-1">
				<Tooltip text={scenarioTooltips[s.id]} position="right">
					<span class="text-sm font-bold {isActive ? 'text-primary' : 'text-text-secondary'}">
						{isActive ? '\u25B6 ' : ''}{s.label}
					</span>
				</Tooltip>
				<span class="text-sm font-mono font-bold">{Math.round(s.hours).toLocaleString()}h</span>
			</div>
			<div class="h-5 w-full bg-border-light border border-brutal">
				<div
					class="h-full {s.color} transition-all duration-300 {isActive ? 'opacity-100' : 'opacity-50'}"
					style="width: {manualTotal > 0 ? (s.hours / manualTotal) * 100 : 0}%"
				></div>
			</div>
			{#if s.id !== 'manual'}
				<span class="text-xs text-success font-bold">-{Math.round(manualTotal - s.hours)}h ({manualTotal > 0 ? Math.round(((manualTotal - s.hours) / manualTotal) * 100) : 0}%)</span>
			{/if}
		</button>
	{/each}
</div>
