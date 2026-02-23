<script lang="ts">
	interface Props {
		steps: { label: string; value: number; isTotal?: boolean; color?: string }[];
		valueFormat?: 'hours' | 'percent' | 'number';
	}

	let { steps, valueFormat = 'hours' }: Props = $props();

	let containerWidth = $state(800);

	const margin = { top: 24, right: 24, bottom: 44, left: 52 };
	const chartHeight = 340;
	const innerW = $derived(Math.max(containerWidth - margin.left - margin.right, 100));
	const innerH = chartHeight - margin.top - margin.bottom;

	function formatValue(val: number): string {
		if (valueFormat === 'percent') return `${val.toFixed(1)}%`;
		if (valueFormat === 'hours') {
			if (Math.abs(val) >= 1000) return `${(val / 1000).toFixed(1)}kh`;
			return `${Math.round(val)}h`;
		}
		return `${Math.round(val)}`;
	}

	// Compute bar geometry: each bar has a start (bottom) and end (top)
	const bars = $derived.by(() => {
		if (steps.length === 0) return [];
		let running = 0;
		return steps.map((step) => {
			let barStart: number;
			let barEnd: number;

			if (step.isTotal) {
				// Total bar always starts from zero
				barStart = 0;
				barEnd = running;
			} else {
				barStart = running;
				barEnd = running + step.value;
				running += step.value;
			}

			// Determine color
			let color: string;
			if (step.color) {
				color = step.color;
			} else if (step.isTotal) {
				color = 'var(--color-primary)';
			} else if (step.value >= 0) {
				color = 'var(--color-success)';
			} else {
				color = 'var(--color-danger)';
			}

			return {
				label: step.label,
				value: step.value,
				isTotal: step.isTotal ?? false,
				start: barStart,
				end: barEnd,
				color,
				runningAfter: step.isTotal ? running : barEnd
			};
		});
	});

	// Y range: from 0 to max running value with padding
	const yRange = $derived.by(() => {
		if (bars.length === 0) return { min: 0, max: 100 };
		let minVal = 0;
		let maxVal = 0;
		for (const b of bars) {
			minVal = Math.min(minVal, b.start, b.end);
			maxVal = Math.max(maxVal, b.start, b.end);
		}
		const span = maxVal - minVal;
		const pad = Math.max(span * 0.15, 1);
		return {
			min: Math.min(0, minVal - pad),
			max: maxVal + pad
		};
	});

	function yPos(val: number): number {
		const range = yRange.max - yRange.min;
		if (range === 0) return margin.top + innerH / 2;
		return margin.top + innerH - ((val - yRange.min) / range) * innerH;
	}

	// Bar x positions and width
	const barWidth = $derived(
		steps.length > 0
			? Math.min(innerW / steps.length * 0.6, 60)
			: 40
	);

	function barX(i: number): number {
		if (steps.length <= 1) return margin.left + innerW / 2;
		const totalBarSpace = innerW;
		const slotWidth = totalBarSpace / steps.length;
		return margin.left + slotWidth * i + slotWidth / 2;
	}

	// Y grid
	function niceStep(range: number): number {
		const rough = range / 5;
		const pow = Math.pow(10, Math.floor(Math.log10(Math.abs(rough) || 1)));
		const norm = rough / pow;
		if (norm <= 1.5) return pow;
		if (norm <= 3.5) return 2 * pow;
		if (norm <= 7.5) return 5 * pow;
		return 10 * pow;
	}

	const yGridLines = $derived.by(() => {
		const range = yRange.max - yRange.min;
		if (range === 0) return [0];
		const step = niceStep(range);
		const lines: number[] = [];
		const start = Math.ceil(yRange.min / step) * step;
		for (let v = start; v <= yRange.max; v += step) {
			lines.push(v);
		}
		return lines;
	});

	// Hover
	let hoveredIndex = $state<number | null>(null);

	// Tooltip
	const tooltip = $derived.by(() => {
		if (hoveredIndex === null) return null;
		const bar = bars[hoveredIndex];
		const line1 = bar.label;
		const line2 = bar.isTotal
			? `Total: ${formatValue(bar.end)}`
			: `${bar.value >= 0 ? '+' : ''}${formatValue(bar.value)}`;
		const maxLen = Math.max(line1.length, line2.length);
		const w = Math.max(maxLen * 8, 90);
		const h = 36;
		const bx = barX(hoveredIndex);
		const by = yPos(Math.max(bar.start, bar.end));
		let tx = Math.min(Math.max(bx - w / 2, margin.left), margin.left + innerW - w);
		let ty = by - h - 6;
		if (ty < margin.top) ty = by + 6;
		return { x: tx, y: ty, w, h, line1, line2 };
	});
</script>

<div bind:clientWidth={containerWidth} class="w-full">
	{#if steps.length === 0}
		<div class="flex items-center justify-center h-64 text-text-muted text-sm">
			No data available
		</div>
	{:else}
		<svg width={containerWidth} height={chartHeight} class="block">
			<!-- Horizontal grid -->
			{#each yGridLines as val}
				<line
					x1={margin.left}
					y1={yPos(val)}
					x2={margin.left + innerW}
					y2={yPos(val)}
					stroke="var(--color-border-light)"
					stroke-width="1"
					stroke-dasharray="4,3"
				/>
				<text
					x={margin.left - 10}
					y={yPos(val) + 4}
					text-anchor="end"
					class="text-[10px] font-mono"
					fill="var(--color-text-muted)"
				>
					{formatValue(val)}
				</text>
			{/each}

			<!-- Zero line (if visible) -->
			{#if yRange.min < 0}
				<line
					x1={margin.left}
					y1={yPos(0)}
					x2={margin.left + innerW}
					y2={yPos(0)}
					stroke="var(--color-border-light)"
					stroke-width="1.5"
				/>
			{/if}

			<!-- Axis border -->
			<line
				x1={margin.left}
				y1={margin.top}
				x2={margin.left}
				y2={margin.top + innerH}
				stroke="var(--color-border-light)"
				stroke-width="1"
			/>
			<line
				x1={margin.left}
				y1={margin.top + innerH}
				x2={margin.left + innerW}
				y2={margin.top + innerH}
				stroke="var(--color-border-light)"
				stroke-width="1"
			/>

			<!-- Connector lines between bars -->
			{#each bars as bar, i}
				{#if i < bars.length - 1 && !bars[i + 1].isTotal}
					{@const nextBar = bars[i + 1]}
					{@const connY = yPos(bar.runningAfter)}
					<line
						x1={barX(i) + barWidth / 2}
						y1={connY}
						x2={barX(i + 1) - barWidth / 2}
						y2={connY}
						stroke="var(--color-text-muted)"
						stroke-width="1"
						stroke-dasharray="3,3"
						opacity="0.4"
					/>
				{/if}
			{/each}

			<!-- Bars -->
			{#each bars as bar, i}
				{@const topVal = Math.max(bar.start, bar.end)}
				{@const bottomVal = Math.min(bar.start, bar.end)}
				{@const barTop = yPos(topVal)}
				{@const barBottom = yPos(bottomVal)}
				{@const barH = Math.max(barBottom - barTop, 1)}

				<!-- Bar rect -->
				<rect
					role="img"
					aria-label="{bar.label}: {bar.value}"
					x={barX(i) - barWidth / 2}
					y={barTop}
					width={barWidth}
					height={barH}
					fill={bar.color}
					fill-opacity={bar.isTotal ? 0.85 : 0.7}
					stroke={bar.isTotal ? 'var(--color-brutal)' : bar.color}
					stroke-width={bar.isTotal ? 2 : 1}
					class="cursor-pointer"
					onmouseenter={() => (hoveredIndex = i)}
					onmouseleave={() => (hoveredIndex = null)}
				/>

				<!-- Value label above bar -->
				<text
					x={barX(i)}
					y={barTop - 6}
					text-anchor="middle"
					class="text-[10px] font-mono font-bold"
					fill={bar.color}
				>
					{bar.isTotal ? formatValue(bar.end) : `${bar.value >= 0 ? '+' : ''}${formatValue(bar.value)}`}
				</text>

				<!-- X-axis label -->
				<text
					x={barX(i)}
					y={chartHeight - 10}
					text-anchor="middle"
					class="text-[10px] font-mono"
					fill="var(--color-text-muted)"
				>
					{bar.label}
				</text>
			{/each}

			<!-- Hover tooltip -->
			{#if tooltip}
				<rect
					x={tooltip.x}
					y={tooltip.y}
					width={tooltip.w}
					height={tooltip.h}
					rx="3"
					fill="var(--color-brutal)"
					opacity="0.92"
				/>
				<text
					x={tooltip.x + tooltip.w / 2}
					y={tooltip.y + 14}
					text-anchor="middle"
					class="text-[11px] font-mono font-bold"
					fill="white"
				>
					{tooltip.line1}
				</text>
				<text
					x={tooltip.x + tooltip.w / 2}
					y={tooltip.y + 30}
					text-anchor="middle"
					class="text-[10px] font-mono"
					fill="white"
					opacity="0.8"
				>
					{tooltip.line2}
				</text>
			{/if}
		</svg>
	{/if}
</div>
