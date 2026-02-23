<script lang="ts">
	import Tooltip from './ui/Tooltip.svelte';

	interface Props {
		validated: number;
		unvalidated: number;
		invalidated: number;
		assessmentId: string;
		oninfoclick?: () => void;
	}

	let { validated, unvalidated, invalidated, assessmentId, oninfoclick }: Props = $props();
</script>

{#if validated + unvalidated + invalidated > 0}
	<div class="flex items-center justify-between mb-3 pb-1.5 border-b-3 border-primary">
		{#if oninfoclick}
			<button class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-primary cursor-pointer hover:opacity-80 transition-opacity" onclick={oninfoclick}>
				Assumption Status
				<span class="text-[10px] font-mono opacity-60">(i)</span>
			</button>
		{:else}
			<h2 class="text-xs font-extrabold uppercase tracking-wider text-primary">Assumption Status</h2>
		{/if}
		<a href="/assessments/{assessmentId}/analysis?tab=assumptions" class="text-xs font-bold text-primary hover:text-primary-hover">View all &rarr;</a>
	</div>
	<div class="grid gap-3 sm:grid-cols-3">
		<Tooltip text="Confirmed by client or evidence. Adds certainty to the estimate." position="bottom">
			<div class="px-3 py-2 border-2 border-success bg-success-light text-center">
				<span class="text-2xl font-extrabold font-mono text-success">{validated}</span>
				<span class="block text-xs font-bold uppercase text-success">Validated</span>
			</div>
		</Tooltip>
		<Tooltip text="Pending confirmation. Adds uncertainty (widening hours) to the estimate." position="bottom">
			<div class="px-3 py-2 border-2 border-warning bg-warning-light text-center">
				<span class="text-2xl font-extrabold font-mono text-warning">{unvalidated}</span>
				<span class="block text-xs font-bold uppercase text-warning">Unvalidated</span>
			</div>
		</Tooltip>
		<Tooltip text="Proven incorrect. Affected estimate areas need rework." position="bottom">
			<div class="px-3 py-2 border-2 border-danger bg-danger-light text-center">
				<span class="text-2xl font-extrabold font-mono text-danger">{invalidated}</span>
				<span class="block text-xs font-bold uppercase text-danger">Invalidated</span>
			</div>
		</Tooltip>
	</div>
{/if}
