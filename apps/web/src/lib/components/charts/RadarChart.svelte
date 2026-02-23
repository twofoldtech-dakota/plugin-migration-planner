<script lang="ts">
	interface Props {
		dimensions: { label: string; value: number; maxValue?: number }[];
		size?: number;
		fillColor?: string;
	}

	let {
		dimensions,
		size = 240,
		fillColor = 'var(--color-primary)'
	}: Props = $props();

	let containerWidth = $state(800);

	// Responsive: use the smaller of container width or desired size
	const effectiveSize = $derived(Math.min(containerWidth, size));
	const cx = $derived(effectiveSize / 2);
	const cy = $derived(effectiveSize / 2);
	const radius = $derived(effectiveSize / 2 - 36); // leave room for labels

	const ringLevels = [0.25, 0.5, 0.75, 1.0];

	// Angle for each dimension (evenly distributed, starting from top)
	function angleFor(i: number, total: number): number {
		return (Math.PI * 2 * i) / total - Math.PI / 2;
	}

	// Point on perimeter at a given fraction (0-1) of radius for dimension index i
	function pointAt(i: number, fraction: number): { x: number; y: number } {
		const angle = angleFor(i, dimensions.length);
		return {
			x: cx + Math.cos(angle) * radius * fraction,
			y: cy + Math.sin(angle) * radius * fraction
		};
	}

	// Ring polygon path for a given level
	const ringPaths = $derived.by(() => {
		if (dimensions.length < 3) return [];
		return ringLevels.map((level) => {
			const pts = dimensions
				.map((_, i) => {
					const p = pointAt(i, level);
					return `${p.x},${p.y}`;
				})
				.join(' ');
			return pts;
		});
	});

	// Value polygon points
	const valuePoly = $derived.by(() => {
		if (dimensions.length < 3) return '';
		return dimensions
			.map((d, i) => {
				const max = d.maxValue ?? 100;
				const fraction = max > 0 ? Math.min(d.value / max, 1) : 0;
				const p = pointAt(i, fraction);
				return `${p.x},${p.y}`;
			})
			.join(' ');
	});

	// Vertex positions for hover targets
	const vertices = $derived.by(() => {
		return dimensions.map((d, i) => {
			const max = d.maxValue ?? 100;
			const fraction = max > 0 ? Math.min(d.value / max, 1) : 0;
			const p = pointAt(i, fraction);
			return { ...p, label: d.label, value: d.value, max };
		});
	});

	// Label positions (slightly beyond the outer ring)
	const labels = $derived.by(() => {
		return dimensions.map((d, i) => {
			const angle = angleFor(i, dimensions.length);
			const labelRadius = radius + 20;
			const x = cx + Math.cos(angle) * labelRadius;
			const y = cy + Math.sin(angle) * labelRadius;
			// Determine text-anchor based on position
			let anchor: string = 'middle';
			if (Math.cos(angle) < -0.1) anchor = 'end';
			else if (Math.cos(angle) > 0.1) anchor = 'start';
			return { x, y, label: d.label, anchor };
		});
	});

	// Hover state
	let hoveredIndex = $state<number | null>(null);

	// Tooltip positioning
	const tooltip = $derived.by(() => {
		if (hoveredIndex === null) return null;
		const v = vertices[hoveredIndex];
		const text = `${v.label}: ${v.value}`;
		const w = Math.max(text.length * 7.5, 80);
		// Position tooltip above the vertex
		let tx = v.x - w / 2;
		let ty = v.y - 30;
		// Clamp inside SVG bounds
		tx = Math.max(2, Math.min(tx, effectiveSize - w - 2));
		ty = Math.max(2, ty);
		return { x: tx, y: ty, w, text };
	});

	// Unique ID for gradient
	const gradId = `radar-fill-${Math.random().toString(36).slice(2, 6)}`;
</script>

<div bind:clientWidth={containerWidth} class="w-full">
	{#if dimensions.length < 3}
		<div class="flex items-center justify-center h-64 text-text-muted text-sm">
			No data available
		</div>
	{:else}
		<svg
			width={effectiveSize}
			height={effectiveSize}
			class="block mx-auto"
			role="img"
			aria-label="Radar chart"
		>
			<!-- Grid rings (polygons) -->
			{#each ringPaths as pts}
				<polygon
					points={pts}
					fill="none"
					stroke="var(--color-border-light)"
					stroke-width="1"
				/>
			{/each}

			<!-- Axis lines from center to each dimension -->
			{#each dimensions as _, i}
				{@const outer = pointAt(i, 1)}
				<line
					x1={cx}
					y1={cy}
					x2={outer.x}
					y2={outer.y}
					stroke="var(--color-border-light)"
					stroke-width="1"
				/>
			{/each}

			<!-- Value polygon fill -->
			<polygon
				points={valuePoly}
				fill={fillColor}
				fill-opacity="0.2"
				stroke={fillColor}
				stroke-width="2"
				stroke-linejoin="round"
			/>

			<!-- Vertex dots + hover targets -->
			{#each vertices as v, i}
				<circle
					role="img"
					aria-label="{labels[i] ?? `Dimension ${i + 1}`}"
					cx={v.x}
					cy={v.y}
					r={hoveredIndex === i ? 6 : 4}
					fill={hoveredIndex === i ? fillColor : 'var(--color-surface)'}
					stroke={fillColor}
					stroke-width="2"
					class="cursor-pointer"
					onmouseenter={() => (hoveredIndex = i)}
					onmouseleave={() => (hoveredIndex = null)}
				/>
			{/each}

			<!-- Axis labels -->
			{#each labels as lbl}
				<text
					x={lbl.x}
					y={lbl.y}
					text-anchor={lbl.anchor}
					dominant-baseline="middle"
					class="text-[10px] font-mono"
					fill="var(--color-text-muted)"
				>
					{lbl.label}
				</text>
			{/each}

			<!-- Hover tooltip -->
			{#if tooltip}
				<rect
					x={tooltip.x}
					y={tooltip.y}
					width={tooltip.w}
					height="22"
					rx="3"
					fill="var(--color-brutal)"
					opacity="0.92"
				/>
				<text
					x={tooltip.x + tooltip.w / 2}
					y={tooltip.y + 15}
					text-anchor="middle"
					class="text-[11px] font-mono font-bold"
					fill="white"
				>
					{tooltip.text}
				</text>
			{/if}
		</svg>
	{/if}
</div>
