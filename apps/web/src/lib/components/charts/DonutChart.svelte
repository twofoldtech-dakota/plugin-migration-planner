<script lang="ts">
	interface Segment {
		label: string;
		value: number;
		color: string;
	}

	interface Props {
		segments: Segment[];
		size?: number;
		innerRadius?: number;
		centerLabel?: string;
		centerValue?: string;
	}

	let {
		segments,
		size = 200,
		innerRadius = 0.6,
		centerLabel = '',
		centerValue = ''
	}: Props = $props();

	let containerWidth = $state(800);

	// Computed dimensions
	const displaySize = $derived(Math.min(size, containerWidth));
	const cx = $derived(displaySize / 2);
	const cy = $derived(displaySize / 2);
	const outerR = $derived(displaySize / 2 - 4);
	const innerR = $derived(outerR * innerRadius);
	const strokeW = $derived(outerR - innerR);
	const midR = $derived(innerR + strokeW / 2);

	// Total for percentage calculations
	const total = $derived(segments.reduce((sum, s) => sum + s.value, 0));

	// Compute arc data for each segment using strokeDasharray
	const arcs = $derived.by(() => {
		if (total === 0) return [];
		const circumference = 2 * Math.PI * midR;
		let offset = 0;
		return segments.map((seg) => {
			const fraction = seg.value / total;
			const length = fraction * circumference;
			const gap = circumference - length;
			const rotation = offset;
			offset += fraction;
			return {
				...seg,
				fraction,
				dasharray: `${length} ${gap}`,
				dashoffset: -rotation * circumference,
				pct: Math.round(fraction * 100)
			};
		});
	});

	// Hover state
	let hoveredIndex = $state<number | null>(null);

	// Tooltip data
	const tooltipData = $derived.by(() => {
		if (hoveredIndex === null || !arcs[hoveredIndex]) return null;
		const arc = arcs[hoveredIndex];
		// Position tooltip at the midpoint of the arc
		const midAngle =
			arcs.slice(0, hoveredIndex).reduce((sum, a) => sum + a.fraction, 0) +
			arc.fraction / 2;
		const angle = midAngle * 2 * Math.PI - Math.PI / 2;
		const tipR = midR + strokeW / 2 + 16;
		const tx = cx + tipR * Math.cos(angle);
		const ty = cy + tipR * Math.sin(angle);
		const text = `${arc.label}: ${arc.value} (${arc.pct}%)`;
		const tooltipW = Math.max(text.length * 7, 80);
		return {
			text,
			x: Math.max(4, Math.min(tx - tooltipW / 2, displaySize - tooltipW - 4)),
			y: Math.max(4, Math.min(ty - 11, displaySize + 40)),
			w: tooltipW
		};
	});

	// Legend layout
	const legendHeight = $derived(Math.ceil(segments.length / 2) * 24 + 16);
	const svgHeight = $derived(displaySize + legendHeight);
	const legendY = $derived(displaySize + 8);
	const legendColW = $derived(displaySize / 2);
</script>

<div bind:clientWidth={containerWidth} class="w-full">
	{#if segments.length === 0}
		<div class="flex items-center justify-center h-32 text-text-muted text-sm">
			No data available
		</div>
	{:else}
		<svg width={displaySize} height={svgHeight} class="block mx-auto">
			<!-- Empty track ring -->
			<circle
				{cx}
				{cy}
				r={midR}
				fill="none"
				stroke="var(--color-border-light)"
				stroke-width={strokeW}
			/>

			<!-- Segment arcs -->
			{#each arcs as arc, i}
				<circle
					{cx}
					{cy}
					r={midR}
					fill="none"
					stroke={arc.color}
					stroke-width={hoveredIndex === i ? strokeW + 6 : strokeW}
					stroke-dasharray={arc.dasharray}
					stroke-dashoffset={arc.dashoffset}
					stroke-linecap="butt"
					transform="rotate(-90 {cx} {cy})"
					opacity={hoveredIndex !== null && hoveredIndex !== i ? 0.5 : 1}
					class="transition-all duration-150"
				/>
			{/each}

			<!-- Invisible hover targets for each segment -->
			{#each arcs as arc, i}
				<circle
					{cx}
					{cy}
					r={midR}
					fill="none"
					stroke="transparent"
					stroke-width={strokeW + 8}
					stroke-dasharray={arc.dasharray}
					stroke-dashoffset={arc.dashoffset}
					stroke-linecap="butt"
					transform="rotate(-90 {cx} {cy})"
					role="presentation"
					onmouseenter={() => (hoveredIndex = i)}
					onmouseleave={() => (hoveredIndex = null)}
					class="cursor-crosshair"
				/>
			{/each}

			<!-- Center text -->
			{#if centerValue}
				<text
					x={cx}
					y={cy - 2}
					text-anchor="middle"
					dominant-baseline="middle"
					class="text-2xl font-extrabold font-mono"
					fill="var(--color-text)"
				>
					{centerValue}
				</text>
			{/if}
			{#if centerLabel}
				<text
					x={cx}
					y={cy + (centerValue ? 18 : 0)}
					text-anchor="middle"
					dominant-baseline="middle"
					class="text-[10px] font-bold uppercase tracking-wider"
					fill="var(--color-text-muted)"
				>
					{centerLabel}
				</text>
			{/if}

			<!-- Legend below the donut -->
			{#each segments as seg, i}
				{@const col = i % 2}
				{@const row = Math.floor(i / 2)}
				{@const lx = col * legendColW + 8}
				{@const ly = legendY + row * 24}
				<circle
					cx={lx + 5}
					cy={ly + 8}
					r="5"
					fill={seg.color}
					stroke="var(--color-brutal)"
					stroke-width="1"
				/>
				<text
					x={lx + 16}
					y={ly + 12}
					class="text-[11px]"
					fill="var(--color-text-muted)"
				>
					{seg.label}
				</text>
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
