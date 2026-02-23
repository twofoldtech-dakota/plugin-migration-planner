<script lang="ts">
	interface Bar {
		label: string;
		value: number;
		color?: string;
		detail?: string;
	}

	interface Props {
		bars: Bar[];
		maxValue?: number;
		showValues?: boolean;
		valueFormat?: 'hours' | 'percent' | 'number';
		barHeight?: number;
	}

	let {
		bars,
		maxValue,
		showValues = true,
		valueFormat = 'number',
		barHeight = 28
	}: Props = $props();

	let containerWidth = $state(800);

	const margin = { top: 8, right: 16, bottom: 8, left: 120 };

	const computedMax = $derived(
		maxValue ?? Math.max(...bars.map((b) => b.value), 1)
	);

	const chartHeight = $derived(
		margin.top + bars.length * (barHeight + 8) + margin.bottom
	);

	const innerW = $derived(
		Math.max(containerWidth - margin.left - margin.right, 60)
	);

	function barWidth(value: number): number {
		return (value / computedMax) * innerW;
	}

	function barY(index: number): number {
		return margin.top + index * (barHeight + 8);
	}

	function formatValue(value: number): string {
		if (valueFormat === 'hours') return `${Math.round(value)}h`;
		if (valueFormat === 'percent') return `${Math.round(value)}%`;
		return value % 1 === 0 ? String(value) : value.toFixed(1);
	}

	// Sorted bars descending by value
	const sortedBars = $derived(
		[...bars].sort((a, b) => b.value - a.value)
	);

	// Hover state
	let hoveredIndex = $state<number | null>(null);

	// Tooltip positioning
	const tooltipData = $derived.by(() => {
		if (hoveredIndex === null) return null;
		const bar = sortedBars[hoveredIndex];
		const bw = barWidth(bar.value);
		const by = barY(hoveredIndex);
		const text = bar.detail
			? `${bar.label}: ${formatValue(bar.value)} - ${bar.detail}`
			: `${bar.label}: ${formatValue(bar.value)}`;
		const tooltipW = Math.min(Math.max(text.length * 7, 100), containerWidth - 20);
		const tx = Math.min(margin.left + bw + 8, containerWidth - tooltipW - 8);
		const ty = by + barHeight / 2 - 11;
		return { text, x: tx, y: ty, w: tooltipW };
	});
</script>

<div bind:clientWidth={containerWidth} class="w-full">
	{#if bars.length === 0}
		<div class="flex items-center justify-center h-32 text-text-muted text-sm">
			No data available
		</div>
	{:else}
		<svg width={containerWidth} height={chartHeight} class="block">
			{#each sortedBars as bar, i}
				{@const by = barY(i)}
				{@const bw = barWidth(bar.value)}
				{@const barColor = bar.color ?? 'var(--color-primary)'}

				<!-- Row label -->
				<text
					x={margin.left - 8}
					y={by + barHeight / 2 + 4}
					text-anchor="end"
					class="text-[11px]"
					fill="var(--color-text-muted)"
				>
					{bar.label.length > 16 ? bar.label.slice(0, 15) + '\u2026' : bar.label}
				</text>

				<!-- Background track -->
				<rect
					x={margin.left}
					y={by}
					width={innerW}
					height={barHeight}
					fill="var(--color-border-light)"
					rx="2"
				/>

				<!-- Bar fill -->
				<rect
					x={margin.left}
					y={by}
					width={Math.max(bw, 2)}
					height={barHeight}
					fill={barColor}
					rx="2"
					opacity={hoveredIndex === i ? 1 : 0.85}
					class="transition-opacity duration-150"
				/>

				<!-- Neo-brutalist bar border (only on the filled portion) -->
				<rect
					x={margin.left}
					y={by}
					width={Math.max(bw, 2)}
					height={barHeight}
					fill="none"
					stroke="var(--color-brutal)"
					stroke-width="1.5"
					rx="2"
					opacity="0.2"
				/>

				<!-- Value label -->
				{#if showValues}
					<text
						x={margin.left + Math.max(bw, 2) + 6}
						y={by + barHeight / 2 + 4}
						class="text-[11px] font-mono font-bold"
						fill="var(--color-text-muted)"
					>
						{formatValue(bar.value)}
					</text>
				{/if}

				<!-- Hover target (full row) -->
				<rect
					x={margin.left}
					y={by}
					width={innerW}
					height={barHeight}
					fill="transparent"
					role="presentation"
					onmouseenter={() => (hoveredIndex = i)}
					onmouseleave={() => (hoveredIndex = null)}
					class="cursor-crosshair"
				/>
			{/each}

			<!-- Tooltip -->
			{#if tooltipData}
				<rect
					x={tooltipData.x}
					y={tooltipData.y}
					width={tooltipData.w}
					height="22"
					rx="3"
					fill="var(--color-brutal)"
					opacity="0.92"
				/>
				<text
					x={tooltipData.x + tooltipData.w / 2}
					y={tooltipData.y + 15}
					text-anchor="middle"
					class="text-[11px] font-mono font-bold"
					fill="white"
				>
					{tooltipData.text}
				</text>
			{/if}
		</svg>
	{/if}
</div>
