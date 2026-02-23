<script lang="ts">
	interface Props {
		delta: number;
		format?: 'hours' | 'percent' | 'number';
		invertColor?: boolean;
	}

	let { delta, format = 'hours', invertColor = true }: Props = $props();

	const sign = $derived(delta > 0 ? '+' : '');
	const rounded = $derived(Math.round(delta * 10) / 10);

	const suffix = $derived(
		format === 'hours' ? 'h' : format === 'percent' ? '%' : ''
	);

	const colorClass = $derived(() => {
		if (delta === 0) return 'bg-border-light text-text-muted border-border-light';
		const isPositive = delta > 0;
		const isGood = invertColor ? !isPositive : isPositive;
		return isGood
			? 'bg-success-light text-success border-success'
			: 'bg-danger-light text-danger border-danger';
	});
</script>

{#if delta !== 0}
	<span
		class="inline-flex items-center px-1.5 py-0.5 text-xs font-bold font-mono border {colorClass()}"
	>
		{sign}{rounded}{suffix}
	</span>
{/if}
