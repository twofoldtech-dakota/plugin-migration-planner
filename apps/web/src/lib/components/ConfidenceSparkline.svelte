<script lang="ts">
	interface Point {
		week: string;
		avg: number;
	}

	interface Props {
		points: Point[];
		width?: number;
		height?: number;
	}

	let { points, width = 120, height = 32 }: Props = $props();

	const padX = 4;
	const padY = 4;
	const innerW = $derived(width - padX * 2);
	const innerH = $derived(height - padY * 2);

	// Auto-scale Y to data range so small variations are visible
	const yRange = $derived.by(() => {
		if (points.length < 2) return { min: 0, max: 100 };
		const vals = points.map((p) => p.avg);
		const min = Math.min(...vals);
		const max = Math.max(...vals);
		const pad = Math.max((max - min) * 0.25, 3); // at least 3% padding
		return { min: Math.max(0, min - pad), max: Math.min(100, max + pad) };
	});

	function yForVal(val: number): number {
		const range = yRange.max - yRange.min;
		if (range === 0) return padY + innerH / 2;
		return padY + innerH - ((val - yRange.min) / range) * innerH;
	}

	const coords = $derived.by(() => {
		if (points.length < 2) return [];
		const step = innerW / (points.length - 1);
		return points.map((p, i) => ({
			x: padX + i * step,
			y: yForVal(p.avg),
		}));
	});

	const polyline = $derived(coords.map((c) => `${c.x},${c.y}`).join(' '));

	// Gradient fill path (close along bottom)
	const fillPath = $derived.by(() => {
		if (coords.length < 2) return '';
		const bottom = padY + innerH;
		const first = coords[0];
		const last = coords[coords.length - 1];
		const linePart = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
		return `${linePart} L ${last.x} ${bottom} L ${first.x} ${bottom} Z`;
	});

	const lastCoord = $derived(coords.length >= 2 ? coords[coords.length - 1] : null);

	const trend = $derived.by(() => {
		if (points.length < 2) return 'flat';
		const first = points[0].avg;
		const last = points[points.length - 1].avg;
		const delta = last - first;
		if (delta > 3) return 'up';
		if (delta < -3) return 'down';
		return 'flat';
	});

	const strokeColor = $derived(
		trend === 'up'
			? 'var(--color-success)'
			: trend === 'down'
				? 'var(--color-danger)'
				: 'var(--color-primary)'
	);

	const fillOpacity = $derived(trend === 'down' ? 0.15 : 0.2);
</script>

{#if points.length >= 2}
	<svg {width} {height} viewBox="0 0 {width} {height}" class="block">
		<defs>
			<linearGradient id="spark-fill-{width}-{height}" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color={strokeColor} stop-opacity={fillOpacity} />
				<stop offset="100%" stop-color={strokeColor} stop-opacity="0.02" />
			</linearGradient>
		</defs>
		<path d={fillPath} fill="url(#spark-fill-{width}-{height})" />
		<polyline
			points={polyline}
			fill="none"
			stroke={strokeColor}
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		{#if lastCoord}
			<circle cx={lastCoord.x} cy={lastCoord.y} r="2.5" fill={strokeColor} />
		{/if}
	</svg>
{/if}
