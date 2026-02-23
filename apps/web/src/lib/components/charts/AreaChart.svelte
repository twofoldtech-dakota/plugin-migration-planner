<script lang="ts">
	interface Props {
		series: { id: string; label: string; color: string; data: { label: string; value: number }[] }[];
		stacked?: boolean;
		yLabel?: string;
	}

	let { series, stacked = false, yLabel = '' }: Props = $props();

	let containerWidth = $state(800);

	const margin = { top: 24, right: 24, bottom: 44, left: 52 };
	const chartHeight = 340;
	const innerW = $derived(Math.max(containerWidth - margin.left - margin.right, 100));
	const innerH = chartHeight - margin.top - margin.bottom;

	// X labels from first series
	const xLabels = $derived(series.length > 0 ? series[0].data.map((d) => d.label) : []);
	const pointCount = $derived(xLabels.length);

	// Compute stacked data if needed
	const stackedValues = $derived.by(() => {
		if (!stacked || series.length === 0 || pointCount === 0) return null;
		// For each point index, cumulative sums per series (bottom-up)
		const cumulative: number[][] = Array.from({ length: series.length }, () =>
			Array(pointCount).fill(0)
		);
		for (let xi = 0; xi < pointCount; xi++) {
			let running = 0;
			for (let si = 0; si < series.length; si++) {
				const val = series[si].data[xi]?.value ?? 0;
				cumulative[si][xi] = running + val;
				running += val;
			}
		}
		return cumulative;
	});

	// Y range
	const yRange = $derived.by(() => {
		if (series.length === 0 || pointCount === 0) return { min: 0, max: 100 };
		let maxVal = 0;
		if (stacked && stackedValues) {
			// Max is the top of the last series
			const lastSeries = stackedValues[series.length - 1];
			maxVal = Math.max(...lastSeries);
		} else {
			for (const s of series) {
				for (const d of s.data) {
					if (d.value > maxVal) maxVal = d.value;
				}
			}
		}
		const pad = Math.max(maxVal * 0.1, 1);
		return { min: 0, max: maxVal + pad };
	});

	function xPos(i: number): number {
		if (pointCount <= 1) return margin.left + innerW / 2;
		return margin.left + (i / (pointCount - 1)) * innerW;
	}

	function yPos(val: number): number {
		const range = yRange.max - yRange.min;
		if (range === 0) return margin.top + innerH / 2;
		return margin.top + innerH - ((val - yRange.min) / range) * innerH;
	}

	// Nice grid step
	function niceStep(range: number): number {
		const rough = range / 5;
		const pow = Math.pow(10, Math.floor(Math.log10(rough)));
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
		for (let v = 0; v <= yRange.max; v += step) {
			lines.push(v);
		}
		return lines;
	});

	// Build line paths and area paths for each series
	const seriesPaths = $derived.by(() => {
		return series.map((s, si) => {
			const linePoints: string[] = [];
			const areaPoints: string[] = [];

			for (let xi = 0; xi < pointCount; xi++) {
				let topY: number;
				let bottomY: number;

				if (stacked && stackedValues) {
					topY = stackedValues[si][xi];
					bottomY = si > 0 ? stackedValues[si - 1][xi] : 0;
				} else {
					topY = s.data[xi]?.value ?? 0;
					bottomY = 0;
				}

				const px = xPos(xi);
				linePoints.push(`${xi === 0 ? 'M' : 'L'} ${px} ${yPos(topY)}`);
				areaPoints.push(`${px},${yPos(topY)}`);
			}

			// Close area polygon
			const areaTop = areaPoints.join(' ');
			let areaBottom: string;
			if (stacked && stackedValues && si > 0) {
				// Trace back along the previous series top
				const bottomPts: string[] = [];
				for (let xi = pointCount - 1; xi >= 0; xi--) {
					bottomPts.push(`${xPos(xi)},${yPos(stackedValues[si - 1][xi])}`);
				}
				areaBottom = bottomPts.join(' ');
			} else {
				const base = margin.top + innerH;
				areaBottom = `${xPos(pointCount - 1)},${base} ${xPos(0)},${base}`;
			}

			return {
				linePath: linePoints.join(' '),
				areaPolygon: `${areaTop} ${areaBottom}`,
				color: s.color
			};
		});
	});

	// X-axis label thinning
	const labelEvery = $derived(Math.max(1, Math.ceil(pointCount / 10)));

	// Hover state
	let hoveredIndex = $state<number | null>(null);
	const columnWidth = $derived(
		pointCount > 1 ? innerW / (pointCount - 1) : innerW
	);

	// Tooltip content at hovered index
	const tooltip = $derived.by(() => {
		if (hoveredIndex === null || hoveredIndex >= pointCount) return null;
		const xLabel = xLabels[hoveredIndex];
		const lines = series.map((s, si) => {
			let val: number;
			if (stacked && stackedValues) {
				const top = stackedValues[si][hoveredIndex!];
				const bottom = si > 0 ? stackedValues[si - 1][hoveredIndex!] : 0;
				val = top - bottom;
			} else {
				val = s.data[hoveredIndex!]?.value ?? 0;
			}
			return { label: s.label, value: val, color: s.color };
		});
		const maxLabelLen = Math.max(
			xLabel.length * 8,
			...lines.map((l) => (l.label.length + 8) * 7)
		);
		const w = Math.max(maxLabelLen, 120);
		const h = 20 + lines.length * 16;
		const tx = xPos(hoveredIndex);
		let rx = Math.min(Math.max(tx - w / 2, margin.left), margin.left + innerW - w);
		return { x: rx, y: margin.top + 4, w, h, xLabel, lines };
	});

	// Unique IDs
	const uid = Math.random().toString(36).slice(2, 6);
</script>

<div bind:clientWidth={containerWidth} class="w-full">
	{#if series.length === 0 || pointCount < 2}
		<div class="flex items-center justify-center h-64 text-text-muted text-sm">
			No data available
		</div>
	{:else}
		<!-- Legend -->
		<div class="flex flex-wrap gap-4 mb-2 ml-[52px]">
			{#each series as s}
				<div class="flex items-center gap-1.5 text-xs font-mono">
					<span
						class="inline-block w-3 h-3 border border-brutal"
						style="background-color: {s.color};"
					></span>
					<span style="color: var(--color-text-secondary)">{s.label}</span>
				</div>
			{/each}
		</div>

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
					{Math.round(val)}
				</text>
			{/each}

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

			<!-- Hover columns (behind everything) -->
			{#each xLabels as _, i}
				<rect
					x={xPos(i) - columnWidth / 2}
					y={margin.top}
					width={columnWidth}
					height={innerH}
					fill={hoveredIndex === i ? 'var(--color-primary)' : 'transparent'}
					opacity={hoveredIndex === i ? 0.04 : 0}
					role="presentation"
					onmouseenter={() => (hoveredIndex = i)}
					onmouseleave={() => (hoveredIndex = null)}
					class="cursor-crosshair"
				/>
			{/each}

			<!-- Series areas and lines (render bottom-up so first series is on top if not stacked) -->
			{#each seriesPaths as sp, si}
				<polygon
					points={sp.areaPolygon}
					fill={sp.color}
					fill-opacity="0.1"
				/>
				<path
					d={sp.linePath}
					fill="none"
					stroke={sp.color}
					stroke-width="2"
					stroke-linejoin="round"
					stroke-linecap="round"
				/>
			{/each}

			<!-- X-axis labels -->
			{#each xLabels as label, i}
				{#if i % labelEvery === 0 || i === pointCount - 1}
					<text
						x={xPos(i)}
						y={chartHeight - 10}
						text-anchor="middle"
						class="text-[10px] font-mono"
						fill="var(--color-text-muted)"
					>
						{label}
					</text>
				{/if}
			{/each}

			<!-- Y-axis label -->
			{#if yLabel}
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
			{/if}

			<!-- Hover vertical guide -->
			{#if hoveredIndex !== null}
				<line
					x1={xPos(hoveredIndex)}
					y1={margin.top}
					x2={xPos(hoveredIndex)}
					y2={margin.top + innerH}
					stroke="var(--color-primary)"
					stroke-width="1"
					stroke-dasharray="3,3"
					opacity="0.3"
				/>
			{/if}

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
					{tooltip.xLabel}
				</text>
				{#each tooltip.lines as line, li}
					<circle
						cx={tooltip.x + 10}
						cy={tooltip.y + 26 + li * 16}
						r="4"
						fill={line.color}
					/>
					<text
						x={tooltip.x + 20}
						y={tooltip.y + 30 + li * 16}
						class="text-[10px] font-mono"
						fill="white"
						opacity="0.85"
					>
						{line.label}: {Math.round(line.value)}
					</text>
				{/each}
			{/if}
		</svg>
	{/if}
</div>
