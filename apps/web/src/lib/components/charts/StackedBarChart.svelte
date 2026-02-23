<script lang="ts">
	interface DataPoint {
		label: string;
		values: Record<string, number>;
	}

	interface Series {
		id: string;
		label: string;
		color: string;
	}

	interface Props {
		data: DataPoint[];
		series: Series[];
		orientation?: 'horizontal' | 'vertical';
		showLegend?: boolean;
		valueFormat?: 'hours' | 'percent' | 'number';
	}

	let {
		data,
		series,
		orientation = 'vertical',
		showLegend = true,
		valueFormat = 'number'
	}: Props = $props();

	let containerWidth = $state(800);

	// Layout constants
	const marginV = { top: 24, right: 16, bottom: 48, left: 52 };
	const marginH = { top: 16, right: 16, bottom: 16, left: 120 };
	const barThickness = 28;
	const barGap = 12;
	const legendRowHeight = 24;

	const isVertical = $derived(orientation === 'vertical');
	const margin = $derived(isVertical ? marginV : marginH);

	// Compute max stacked total
	const maxTotal = $derived(
		Math.max(
			...data.map((d) =>
				series.reduce((sum, s) => sum + (d.values[s.id] ?? 0), 0)
			),
			1
		)
	);

	// Y-axis grid lines
	const gridLines = $derived.by(() => {
		const lines: number[] = [];
		const step =
			maxTotal <= 10 ? 2 : maxTotal <= 50 ? 10 : maxTotal <= 200 ? 25 : maxTotal <= 1000 ? 100 : 250;
		for (let v = 0; v <= maxTotal; v += step) {
			lines.push(v);
		}
		if (lines[lines.length - 1] < maxTotal) {
			lines.push(Math.ceil(maxTotal / step) * step);
		}
		return lines;
	});

	const gridMax = $derived(gridLines[gridLines.length - 1] || maxTotal);

	// Chart dimensions
	const innerW = $derived(Math.max(containerWidth - margin.left - margin.right, 100));

	const chartHeight = $derived.by(() => {
		if (isVertical) {
			return 300;
		}
		return margin.top + data.length * (barThickness + barGap) + margin.bottom;
	});

	const innerH = $derived(chartHeight - margin.top - margin.bottom);

	const legendH = $derived(showLegend ? legendRowHeight + 12 : 0);
	const svgHeight = $derived(chartHeight + legendH);

	// Bar sizing for vertical
	const barW = $derived.by(() => {
		if (!isVertical) return 0;
		const available = innerW - (data.length - 1) * barGap;
		return Math.min(Math.max(available / data.length, 12), 60);
	});

	// Position functions for vertical orientation
	function vBarX(index: number): number {
		const totalBarArea = data.length * barW + (data.length - 1) * barGap;
		const offsetX = (innerW - totalBarArea) / 2;
		return margin.left + offsetX + index * (barW + barGap);
	}

	function vBarY(value: number): number {
		return margin.top + innerH - (value / gridMax) * innerH;
	}

	function vBarH(value: number): number {
		return (value / gridMax) * innerH;
	}

	// Position functions for horizontal orientation
	function hBarX(value: number): number {
		return (value / gridMax) * innerW;
	}

	function hBarY(index: number): number {
		return margin.top + index * (barThickness + barGap);
	}

	function formatValue(value: number): string {
		if (valueFormat === 'hours') return `${Math.round(value)}h`;
		if (valueFormat === 'percent') return `${Math.round(value)}%`;
		return value % 1 === 0 ? String(value) : value.toFixed(1);
	}

	// Hover state
	let hoveredSegment = $state<{ dataIndex: number; seriesId: string } | null>(null);

	const tooltipData = $derived.by(() => {
		if (!hoveredSegment) return null;
		const dp = data[hoveredSegment.dataIndex];
		const s = series.find((s) => s.id === hoveredSegment!.seriesId);
		if (!dp || !s) return null;
		const val = dp.values[s.id] ?? 0;
		const text = `${s.label}: ${formatValue(val)}`;
		const tooltipW = Math.max(text.length * 7, 80);

		let tx: number;
		let ty: number;

		if (isVertical) {
			// Position above the bar
			const cumBefore = series
				.slice(
					0,
					series.findIndex((sr) => sr.id === s.id)
				)
				.reduce((sum, sr) => sum + (dp.values[sr.id] ?? 0), 0);
			tx = vBarX(hoveredSegment.dataIndex) + barW / 2 - tooltipW / 2;
			ty = vBarY(cumBefore + val) - 28;
		} else {
			const cumBefore = series
				.slice(
					0,
					series.findIndex((sr) => sr.id === s.id)
				)
				.reduce((sum, sr) => sum + (dp.values[sr.id] ?? 0), 0);
			tx = margin.left + hBarX(cumBefore + val / 2) - tooltipW / 2;
			ty = hBarY(hoveredSegment.dataIndex) - 6;
		}

		tx = Math.max(4, Math.min(tx, containerWidth - tooltipW - 4));
		ty = Math.max(4, ty);

		return { text, x: tx, y: ty, w: tooltipW };
	});
</script>

<div bind:clientWidth={containerWidth} class="w-full">
	{#if data.length === 0}
		<div class="flex items-center justify-center h-32 text-text-muted text-sm">
			No data available
		</div>
	{:else}
		<svg width={containerWidth} height={svgHeight} class="block">
			{#if isVertical}
				<!-- VERTICAL ORIENTATION -->

				<!-- Horizontal grid lines + Y-axis labels -->
				{#each gridLines as val}
					<line
						x1={margin.left}
						y1={vBarY(val)}
						x2={margin.left + innerW}
						y2={vBarY(val)}
						stroke="var(--color-border-light)"
						stroke-width="1"
						stroke-dasharray={val === 0 ? 'none' : '4,3'}
					/>
					<text
						x={margin.left - 8}
						y={vBarY(val) + 4}
						text-anchor="end"
						class="text-[10px] font-mono"
						fill="var(--color-text-muted)"
					>
						{formatValue(val)}
					</text>
				{/each}

				<!-- Stacked bars -->
				{#each data as dp, di}
					{@const bx = vBarX(di)}
					{#each series as s, si}
						{@const val = dp.values[s.id] ?? 0}
						{@const cumBefore = series.slice(0, si).reduce((sum, sr) => sum + (dp.values[sr.id] ?? 0), 0)}
						{#if val > 0}
							<rect
								x={bx}
								y={vBarY(cumBefore + val)}
								width={barW}
								height={vBarH(val)}
								fill={s.color}
								opacity={hoveredSegment && (hoveredSegment.dataIndex !== di || hoveredSegment.seriesId !== s.id) ? 0.5 : 0.9}
								class="transition-opacity duration-150"
							/>
							<!-- Segment border -->
							<rect
								x={bx}
								y={vBarY(cumBefore + val)}
								width={barW}
								height={vBarH(val)}
								fill="none"
								stroke="var(--color-brutal)"
								stroke-width="1"
								opacity="0.15"
							/>
							<!-- Hover target -->
							<rect
								x={bx}
								y={vBarY(cumBefore + val)}
								width={barW}
								height={vBarH(val)}
								fill="transparent"
								role="presentation"
								onmouseenter={() => (hoveredSegment = { dataIndex: di, seriesId: s.id })}
								onmouseleave={() => (hoveredSegment = null)}
								class="cursor-crosshair"
							/>
						{/if}
					{/each}

					<!-- X-axis label -->
					<text
						x={bx + barW / 2}
						y={chartHeight - 10}
						text-anchor="middle"
						class="text-[10px]"
						fill="var(--color-text-muted)"
					>
						{dp.label.length > 10 ? dp.label.slice(0, 9) + '\u2026' : dp.label}
					</text>
				{/each}
			{:else}
				<!-- HORIZONTAL ORIENTATION -->

				<!-- Vertical grid lines -->
				{#each gridLines as val}
					<line
						x1={margin.left + hBarX(val)}
						y1={margin.top}
						x2={margin.left + hBarX(val)}
						y2={margin.top + innerH}
						stroke="var(--color-border-light)"
						stroke-width="1"
						stroke-dasharray={val === 0 ? 'none' : '4,3'}
					/>
					<text
						x={margin.left + hBarX(val)}
						y={margin.top - 6}
						text-anchor="middle"
						class="text-[10px] font-mono"
						fill="var(--color-text-muted)"
					>
						{formatValue(val)}
					</text>
				{/each}

				<!-- Stacked horizontal bars -->
				{#each data as dp, di}
					{@const by = hBarY(di)}

					<!-- Background track -->
					<rect
						x={margin.left}
						y={by}
						width={innerW}
						height={barThickness}
						fill="var(--color-border-light)"
						rx="2"
					/>

					<!-- Row label -->
					<text
						x={margin.left - 8}
						y={by + barThickness / 2 + 4}
						text-anchor="end"
						class="text-[11px]"
						fill="var(--color-text-muted)"
					>
						{dp.label.length > 16 ? dp.label.slice(0, 15) + '\u2026' : dp.label}
					</text>

					{#each series as s, si}
						{@const val = dp.values[s.id] ?? 0}
						{@const cumBefore = series.slice(0, si).reduce((sum, sr) => sum + (dp.values[sr.id] ?? 0), 0)}
						{#if val > 0}
							<rect
								x={margin.left + hBarX(cumBefore)}
								y={by}
								width={hBarX(val)}
								height={barThickness}
								fill={s.color}
								opacity={hoveredSegment && (hoveredSegment.dataIndex !== di || hoveredSegment.seriesId !== s.id) ? 0.5 : 0.9}
								rx="2"
								class="transition-opacity duration-150"
							/>
							<rect
								x={margin.left + hBarX(cumBefore)}
								y={by}
								width={hBarX(val)}
								height={barThickness}
								fill="none"
								stroke="var(--color-brutal)"
								stroke-width="1"
								opacity="0.15"
								rx="2"
							/>
							<!-- Hover target -->
							<rect
								x={margin.left + hBarX(cumBefore)}
								y={by}
								width={hBarX(val)}
								height={barThickness}
								fill="transparent"
								role="presentation"
								onmouseenter={() => (hoveredSegment = { dataIndex: di, seriesId: s.id })}
								onmouseleave={() => (hoveredSegment = null)}
								class="cursor-crosshair"
							/>
						{/if}
					{/each}
				{/each}
			{/if}

			<!-- Legend -->
			{#if showLegend}
				{@const legendY = chartHeight + 4}
				{@const itemW = Math.min(160, containerWidth / series.length)}
				{@const totalLegendW = series.length * itemW}
				{@const legendStartX = (containerWidth - totalLegendW) / 2}
				{#each series as s, i}
					{@const lx = legendStartX + i * itemW}
					<rect
						x={lx}
						y={legendY + 2}
						width="12"
						height="12"
						fill={s.color}
						stroke="var(--color-brutal)"
						stroke-width="1"
						rx="2"
					/>
					<text
						x={lx + 18}
						y={legendY + 12}
						class="text-[11px]"
						fill="var(--color-text-muted)"
					>
						{s.label}
					</text>
				{/each}
			{/if}

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
