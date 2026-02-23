<script lang="ts">
	interface Props {
		points: { x: number; y: number; label: string; color?: string }[];
		xLabel: string;
		yLabel: string;
		showDiagonal?: boolean;
		xFormat?: 'hours' | 'percent';
		yFormat?: 'hours' | 'percent';
	}

	let {
		points,
		xLabel,
		yLabel,
		showDiagonal = false,
		xFormat = 'hours',
		yFormat = 'hours'
	}: Props = $props();

	let containerWidth = $state(800);

	const margin = { top: 24, right: 24, bottom: 44, left: 52 };
	const chartHeight = 340;
	const innerW = $derived(Math.max(containerWidth - margin.left - margin.right, 100));
	const innerH = chartHeight - margin.top - margin.bottom;

	// Format a value with suffix
	function formatValue(val: number, fmt: 'hours' | 'percent'): string {
		if (fmt === 'percent') return `${val.toFixed(1)}%`;
		if (val >= 1000) return `${(val / 1000).toFixed(1)}kh`;
		return `${Math.round(val)}h`;
	}

	// Auto-scale axes to data range with 10% padding
	const xRange = $derived.by(() => {
		if (points.length === 0) return { min: 0, max: 100 };
		const vals = points.map((p) => p.x);
		const dataMin = Math.min(...vals);
		const dataMax = Math.max(...vals);
		const span = dataMax - dataMin;
		const pad = Math.max(span * 0.1, 1);
		return {
			min: Math.max(0, dataMin - pad),
			max: dataMax + pad
		};
	});

	const yRange = $derived.by(() => {
		if (points.length === 0) return { min: 0, max: 100 };
		const vals = points.map((p) => p.y);
		const dataMin = Math.min(...vals);
		const dataMax = Math.max(...vals);
		const span = dataMax - dataMin;
		const pad = Math.max(span * 0.1, 1);
		return {
			min: Math.max(0, dataMin - pad),
			max: dataMax + pad
		};
	});

	function xPos(val: number): number {
		const range = xRange.max - xRange.min;
		if (range === 0) return margin.left + innerW / 2;
		return margin.left + ((val - xRange.min) / range) * innerW;
	}

	function yPos(val: number): number {
		const range = yRange.max - yRange.min;
		if (range === 0) return margin.top + innerH / 2;
		return margin.top + innerH - ((val - yRange.min) / range) * innerH;
	}

	// Grid lines — ~5 lines on each axis
	function niceStep(range: number): number {
		const rough = range / 5;
		const pow = Math.pow(10, Math.floor(Math.log10(rough)));
		const norm = rough / pow;
		if (norm <= 1.5) return pow;
		if (norm <= 3.5) return 2 * pow;
		if (norm <= 7.5) return 5 * pow;
		return 10 * pow;
	}

	const xGridLines = $derived.by(() => {
		const range = xRange.max - xRange.min;
		if (range === 0) return [0];
		const step = niceStep(range);
		const lines: number[] = [];
		const start = Math.ceil(xRange.min / step) * step;
		for (let v = start; v <= xRange.max; v += step) {
			lines.push(v);
		}
		return lines;
	});

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

	// Diagonal line coordinates (for estimated vs actual)
	const diagonal = $derived.by(() => {
		if (!showDiagonal) return null;
		const commonMin = Math.max(xRange.min, yRange.min);
		const commonMax = Math.min(xRange.max, yRange.max);
		if (commonMin >= commonMax) return null;
		return {
			x1: xPos(commonMin),
			y1: yPos(commonMin),
			x2: xPos(commonMax),
			y2: yPos(commonMax)
		};
	});

	// Hover state
	let hoveredIndex = $state<number | null>(null);

	// Tooltip
	const tooltip = $derived.by(() => {
		if (hoveredIndex === null) return null;
		const pt = points[hoveredIndex];
		const sx = xPos(pt.x);
		const sy = yPos(pt.y);
		const line1 = pt.label;
		const line2 = `${xLabel}: ${formatValue(pt.x, xFormat)}`;
		const line3 = `${yLabel}: ${formatValue(pt.y, yFormat)}`;
		const maxLen = Math.max(line1.length, line2.length, line3.length);
		const w = Math.max(maxLen * 7, 100);
		const h = 48;
		// Position above the point, clamped
		let tx = Math.min(Math.max(sx - w / 2, margin.left), margin.left + innerW - w);
		let ty = sy - h - 10;
		if (ty < margin.top) ty = sy + 14;
		return { x: tx, y: ty, w, h, line1, line2, line3 };
	});
</script>

<div bind:clientWidth={containerWidth} class="w-full">
	{#if points.length === 0}
		<div class="flex items-center justify-center h-64 text-text-muted text-sm">
			No data available
		</div>
	{:else}
		<svg width={containerWidth} height={chartHeight} class="block">
			<!-- Horizontal grid lines -->
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
					{formatValue(val, yFormat)}
				</text>
			{/each}

			<!-- Vertical grid lines -->
			{#each xGridLines as val}
				<line
					x1={xPos(val)}
					y1={margin.top}
					x2={xPos(val)}
					y2={margin.top + innerH}
					stroke="var(--color-border-light)"
					stroke-width="1"
					stroke-dasharray="4,3"
				/>
				<text
					x={xPos(val)}
					y={chartHeight - 10}
					text-anchor="middle"
					class="text-[10px] font-mono"
					fill="var(--color-text-muted)"
				>
					{formatValue(val, xFormat)}
				</text>
			{/each}

			<!-- Axis border lines -->
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

			<!-- Diagonal reference line (estimated = actual) -->
			{#if diagonal}
				<line
					x1={diagonal.x1}
					y1={diagonal.y1}
					x2={diagonal.x2}
					y2={diagonal.y2}
					stroke="var(--color-text-muted)"
					stroke-width="1"
					stroke-dasharray="6,4"
					opacity="0.3"
				/>
			{/if}

			<!-- Data points -->
			{#each points as pt, i}
				<circle
					role="img"
					aria-label="{pt.label ?? `Point ${i + 1}`}"
					cx={xPos(pt.x)}
					cy={yPos(pt.y)}
					r={hoveredIndex === i ? 7 : 5}
					fill={hoveredIndex === i
						? (pt.color ?? 'var(--color-primary)')
						: (pt.color ?? 'var(--color-primary)')}
					fill-opacity={hoveredIndex === i ? 1 : 0.7}
					stroke="var(--color-surface)"
					stroke-width="2"
					class="cursor-pointer"
					onmouseenter={() => (hoveredIndex = i)}
					onmouseleave={() => (hoveredIndex = null)}
				/>
			{/each}

			<!-- Axis labels -->
			<text
				x={margin.left + innerW / 2}
				y={chartHeight - 0}
				text-anchor="middle"
				class="text-[11px] font-mono font-bold"
				fill="var(--color-text-muted)"
			>
				{xLabel}
			</text>
			<text
				x={14}
				y={margin.top + innerH / 2}
				text-anchor="middle"
				class="text-[11px] font-mono font-bold"
				fill="var(--color-text-muted)"
				transform="rotate(-90, 14, {margin.top + innerH / 2})"
			>
				{yLabel}
			</text>

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
					y={tooltip.y + 28}
					text-anchor="middle"
					class="text-[10px] font-mono"
					fill="white"
					opacity="0.8"
				>
					{tooltip.line2}
				</text>
				<text
					x={tooltip.x + tooltip.w / 2}
					y={tooltip.y + 42}
					text-anchor="middle"
					class="text-[10px] font-mono"
					fill="white"
					opacity="0.8"
				>
					{tooltip.line3}
				</text>
			{/if}
		</svg>
	{/if}
</div>
