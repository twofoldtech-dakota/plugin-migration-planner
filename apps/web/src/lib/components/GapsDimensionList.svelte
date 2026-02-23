<script lang="ts">
	import CollapsibleSection from './ui/CollapsibleSection.svelte';
	import { DIMENSION_LABELS, formatQuestionId } from '$lib/utils/migration-stats';

	interface Props {
		discovery: Record<string, any>;
	}

	let { discovery }: Props = $props();

	function computeGaps(disc: Record<string, any>) {
		const result: Record<string, { assumed: any[]; unknown: any[]; total: number }> = {};
		for (const [dim, dimData] of Object.entries(disc)) {
			const answers = (dimData as any)?.answers ?? {};
			const assumed: any[] = [];
			const unknown: any[] = [];
			for (const [qId, answer] of Object.entries(answers) as [string, any][]) {
				if (answer.confidence === 'assumed') assumed.push({ questionId: qId, ...answer });
				else if (answer.confidence === 'unknown') unknown.push({ questionId: qId, ...answer });
			}
			if (assumed.length > 0 || unknown.length > 0) {
				result[dim] = { assumed, unknown, total: assumed.length + unknown.length };
			}
		}
		return result;
	}

	const dimGaps = $derived(computeGaps(discovery));
</script>

{#if Object.keys(dimGaps).length > 0}
	<div class="space-y-3">
		{#each Object.entries(dimGaps).sort((a, b) => b[1].total - a[1].total) as [dim, gapData]}
			<CollapsibleSection
				title={DIMENSION_LABELS[dim] ?? dim}
				subtitle="{gapData.total} gaps"
				badge="{gapData.unknown.length} unknown, {gapData.assumed.length} assumed"
				badgeVariant={gapData.unknown.length > 0 ? 'danger' : 'warning'}
			>
				{#if gapData.unknown.length > 0}
					<h4 class="text-xs font-extrabold uppercase tracking-wider text-danger mb-2">Unknown ({gapData.unknown.length})</h4>
					<div class="space-y-1 mb-4">
						{#each gapData.unknown as item}
							<div class="flex items-center justify-between px-3 py-2 border border-danger bg-danger-light">
								<span class="text-sm">{formatQuestionId(item.questionId)}</span>
								<span class="text-xs font-mono text-text-muted">{item.value !== null && item.value !== undefined ? `Value: ${item.value}` : 'No value'}</span>
							</div>
						{/each}
					</div>
				{/if}
				{#if gapData.assumed.length > 0}
					<h4 class="text-xs font-extrabold uppercase tracking-wider text-warning mb-2">Assumed ({gapData.assumed.length})</h4>
					<div class="space-y-1">
						{#each gapData.assumed as item}
							<div class="flex items-center justify-between px-3 py-2 border border-warning bg-warning-light">
								<div>
									<span class="text-sm">{formatQuestionId(item.questionId)}</span>
									{#if item.basis}
										<span class="block text-[10px] text-text-muted italic">Basis: {item.basis}</span>
									{/if}
								</div>
								<span class="text-xs font-mono font-bold">{item.value}</span>
							</div>
						{/each}
					</div>
				{/if}
			</CollapsibleSection>
		{/each}
	</div>
{:else}
	<p class="text-sm text-text-muted text-center py-4">No dimension gaps found</p>
{/if}
