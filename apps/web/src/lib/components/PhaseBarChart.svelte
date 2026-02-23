<script lang="ts">
	interface Props {
		phases: any[];
		getPhaseHours: (phase: any) => number;
		total: number;
	}

	let { phases, getPhaseHours, total }: Props = $props();

	const maxPhaseHours = $derived(Math.max(...phases.map(p => getPhaseHours(p)), 1));
</script>

<div class="space-y-3">
	{#each phases as phase}
		{@const phaseHours = getPhaseHours(phase)}
		{@const componentCount = (phase.components ?? []).length}
		<div>
			<div class="flex items-center justify-between mb-1">
				<span class="text-sm font-bold">{phase.name}</span>
				<div class="text-right">
					<span class="text-sm font-mono font-bold">{Math.round(phaseHours)}h</span>
					<span class="text-xs text-text-muted ml-1">({componentCount} components)</span>
				</div>
			</div>
			<div class="h-6 w-full bg-border-light border border-brutal relative">
				<div
					class="h-full bg-primary transition-all duration-300"
					style="width: {(phaseHours / maxPhaseHours) * 100}%"
				></div>
			</div>
		</div>
	{/each}
</div>
<div class="mt-4 pt-3 border-t-2 border-brutal flex justify-between items-center">
	<span class="text-xs font-extrabold uppercase tracking-wider text-text-muted">Total</span>
	<span class="text-lg font-extrabold font-mono">{Math.round(total).toLocaleString()}h</span>
</div>
