<script lang="ts">
	import Tooltip from './Tooltip.svelte';

	interface Props {
		label: string;
		value: string | number;
		detail?: string;
		tooltip?: string;
	}

	let { label, value, detail, tooltip }: Props = $props();
</script>

<div class="flex flex-col gap-1">
	{#if tooltip}
		<Tooltip text={tooltip} position="bottom">
			<span class="text-xs font-bold uppercase tracking-wider text-text-muted cursor-help">{label}</span>
		</Tooltip>
	{:else}
		<span class="text-xs font-bold uppercase tracking-wider text-text-muted">{label}</span>
	{/if}
	<span class="text-2xl font-extrabold tracking-tight font-mono">{value}</span>
	{#if detail}
		<span class="text-xs text-text-secondary">{detail}</span>
	{/if}
</div>
