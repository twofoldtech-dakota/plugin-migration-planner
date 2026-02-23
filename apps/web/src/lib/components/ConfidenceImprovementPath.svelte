<script lang="ts">
	import { KNOWN_DIMENSIONS, DIMENSION_LABELS } from '$lib/utils/migration-stats';

	interface Props {
		discovery: Record<string, any>;
		unvalidatedCount: number;
		totalWidening: number;
		unknownCount: number;
		assessmentId?: string;
	}

	let { discovery, unvalidatedCount, totalWidening, unknownCount, assessmentId }: Props = $props();

	const missingDimensions = $derived(
		KNOWN_DIMENSIONS.filter(d => !discovery[d])
	);

	const basePath = $derived(assessmentId ? `/assessments/${assessmentId}` : '');
</script>

<div class="space-y-2 text-sm text-text-secondary">
	{#if missingDimensions.length > 0}
		<div class="flex items-center gap-2">
			<span class="text-danger font-bold">1.</span>
			<span class="flex-1">Complete {missingDimensions.length} missing dimension{missingDimensions.length > 1 ? 's' : ''}: <span class="font-bold">{missingDimensions.map(d => DIMENSION_LABELS[d] ?? d).join(', ')}</span></span>
			{#if basePath}
				<a href="{basePath}/discovery?dimension={missingDimensions[0]}" class="shrink-0 text-[10px] font-bold text-primary hover:text-primary-hover">Go &rarr;</a>
			{/if}
		</div>
	{/if}
	{#if unvalidatedCount > 0}
		<div class="flex items-center gap-2">
			<span class="text-warning font-bold">{missingDimensions.length > 0 ? '2' : '1'}.</span>
			<span class="flex-1">Validate {unvalidatedCount} assumption{unvalidatedCount > 1 ? 's' : ''} to remove <span class="font-mono font-bold text-danger">+{Math.round(totalWidening)}h</span> pessimistic widening</span>
			{#if basePath}
				<a href="{basePath}/analysis?tab=assumptions&filter=unvalidated" class="shrink-0 text-[10px] font-bold text-primary hover:text-primary-hover">Go &rarr;</a>
			{/if}
		</div>
	{/if}
	{#if unknownCount > 0}
		<div class="flex items-center gap-2">
			<span class="text-info font-bold">{(missingDimensions.length > 0 ? 2 : 1) + (unvalidatedCount > 0 ? 1 : 0)}.</span>
			<span class="flex-1">Resolve {unknownCount} unknown answer{unknownCount > 1 ? 's' : ''} across discovery dimensions</span>
			{#if basePath}
				<a href="{basePath}/analysis?tab=gaps" class="shrink-0 text-[10px] font-bold text-primary hover:text-primary-hover">Go &rarr;</a>
			{/if}
		</div>
	{/if}
	{#if missingDimensions.length === 0 && unvalidatedCount === 0 && unknownCount === 0}
		<p class="text-success font-bold">All data points are confirmed. Confidence is maximized.</p>
	{/if}
</div>
