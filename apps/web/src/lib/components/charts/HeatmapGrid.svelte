<script lang="ts">
	interface Cell {
		row: string;
		col: string;
		value: number;
		label?: string;
	}

	interface Props {
		cells: Cell[];
		rows: string[];
		cols: string[];
		colorScale?: 'danger' | 'primary' | 'sequential';
		showValues?: boolean;
	}

	let {
		cells,
		rows,
		cols,
		colorScale = 'danger',
		showValues = true
	}: Props = $props();

	let containerWidth = $state(800);

	const margin = { top: 48, right: 16, bottom: 16, left: 120 };
	const cellPad = 2;
	const minCellSize = 28;

	// Normalize values to 0-1
	const valueRange = $derived.by(() => {
		if (cells.length === 0) return { min: 0, max: 1 };
		const vals = cells.map((c) => c.value);
		const min = Math.min(...vals);
		const max = Math.max(...vals);
		return { min, max: max === min ? min + 1 : max };
	});

	function normalize(value: number): number {
		return (value - valueRange.min) / (valueRange.max - valueRange.min);
	}

	// Cell dimensions
	const cellW = $derived(
		Math.max(
			(containerWidth - margin.left - margin.right - (cols.length - 1) * cellPad) / cols.length,
			minCellSize
		)
	);

	const cellH = $derived(Math.max(cellW * 0.75, minCellSize));

	const chartHeight = $derived(
		margin.top + rows.length * (cellH + cellPad) + margin.bottom
	);

	// Cell lookup
	const cellMap = $derived.by(() => {
		const map = new Map<string, Cell>();
		for (const cell of cells) {
			map.set(`${cell.row}|${cell.col}`, cell);
		}
		return map;
	});

	// Color computation
	function cellColor(value: number): string {
		const n = normalize(value);
		if (colorScale === 'danger') {
			// Transparent to red
			return `rgba(220, 38, 38, ${0.1 + n * 0.8})`;
		}
		if (colorScale === 'primary') {
			// Transparent to indigo
			return `rgba(79, 70, 229, ${0.1 + n * 0.8})`;
		}
		// Sequential: blue to red through yellow
		if (n < 0.5) {
			const t = n * 2;
			const r = Math.round(37 + t * (234 - 37));
			const g = Math.round(99 + t * (179 - 99));
			const b = Math.round(235 + t * (8 - 235));
			return `rgb(${r}, ${g}, ${b})`;
		} else {
			const t = (n - 0.5) * 2;
			const r = Math.round(234 + t * (220 - 234));
			const g = Math.round(179 + t * (38 - 179));
			const b = Math.round(8 + t * (38 - 8));
			return `rgb(${r}, ${g}, ${b})`;
		}
	}

	// Text color: white for high intensity, dark for low
	function textColor(value: number): string {
		const n = normalize(value);
		if (colorScale === 'sequential') {
			return n > 0.3 ? 'white' : 'var(--color-text)';
		}
		return n > 0.5 ? 'white' : 'var(--color-text)';
	}

	// Grid positions
	function colX(ci: number): number {
		return margin.left + ci * (cellW + cellPad);
	}

	function rowY(ri: number): number {
		return margin.top + ri * (cellH + cellPad);
	}

	// Hover state
	let hoveredCell = $state<{ row: string; col: string } | null>(null);

	const tooltipData = $derived.by(() => {
		if (!hoveredCell) return null;
		const cell = cellMap.get(`${hoveredCell.row}|${hoveredCell.col}`);
		if (!cell) return null;

		const ri = rows.indexOf(cell.row);
		const ci = cols.indexOf(cell.col);
		const text = cell.label
			? `${cell.row} / ${cell.col}: ${cell.label}`
			: `${cell.row} / ${cell.col}: ${cell.value.toFixed(2)}`;
		const tooltipW = Math.max(text.length * 7, 100);
		const tx = Math.max(4, Math.min(colX(ci) + cellW / 2 - tooltipW / 2, containerWidth - tooltipW - 4));
		const ty = rowY(ri) - 28;

		return { text, x: tx, y: Math.max(4, ty), w: tooltipW };
	});
</script>

<div bind:clientWidth={containerWidth} class="w-full">
	{#if cells.length === 0}
		<div class="flex items-center justify-center h-32 text-text-muted text-sm">
			No data available
		</div>
	{:else}
		<svg width={containerWidth} height={chartHeight} class="block">
			<!-- Column headers -->
			{#each cols as col, ci}
				<text
					x={colX(ci) + cellW / 2}
					y={margin.top - 10}
					text-anchor="middle"
					class="text-[10px] font-bold"
					fill="var(--color-text-muted)"
				>
					{col.length > 10 ? col.slice(0, 9) + '\u2026' : col}
				</text>
			{/each}

			<!-- Row labels + cells -->
			{#each rows as row, ri}
				<!-- Row label -->
				<text
					x={margin.left - 8}
					y={rowY(ri) + cellH / 2 + 4}
					text-anchor="end"
					class="text-[11px]"
					fill="var(--color-text-muted)"
				>
					{row.length > 16 ? row.slice(0, 15) + '\u2026' : row}
				</text>

				{#each cols as col, ci}
					{@const cell = cellMap.get(`${row}|${col}`)}
					{@const cx = colX(ci)}
					{@const cy = rowY(ri)}
					{@const isHovered = hoveredCell?.row === row && hoveredCell?.col === col}

					<!-- Cell background -->
					<rect
						x={cx}
						y={cy}
						width={cellW}
						height={cellH}
						fill={cell ? cellColor(cell.value) : 'var(--color-border-light)'}
						rx="2"
						stroke={isHovered ? 'var(--color-brutal)' : 'none'}
						stroke-width={isHovered ? 2 : 0}
					/>

					<!-- Value label -->
					{#if showValues && cell}
						<text
							x={cx + cellW / 2}
							y={cy + cellH / 2 + 4}
							text-anchor="middle"
							class="text-[10px] font-mono font-bold"
							fill={textColor(cell.value)}
						>
							{cell.label ?? cell.value.toFixed(1)}
						</text>
					{/if}

					<!-- Hover target -->
					<rect
						x={cx}
						y={cy}
						width={cellW}
						height={cellH}
						fill="transparent"
						role="presentation"
						onmouseenter={() => (hoveredCell = cell ? { row, col } : null)}
						onmouseleave={() => (hoveredCell = null)}
						class="cursor-crosshair"
					/>
				{/each}
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
