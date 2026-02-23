<script lang="ts">
	interface Bucket {
		label: string;
		avg: number;
	}

	interface AssessmentLine {
		assessment_id: string;
		project_name: string;
		points: { label: string; score: number }[];
		current: number;
		delta: number;
	}

	interface Props {
		buckets: Bucket[];
		assessmentLines?: AssessmentLine[];
		showAssessments?: boolean;
	}

	let { buckets, assessmentLines = [], showAssessments = false }: Props = $props();

	let containerWidth = $state(800);

	const margin = { top: 24, right: 24, bottom: 44, left: 52 };
	const chartHeight = 340;
	const innerW = $derived(Math.max(containerWidth - margin.left - margin.right, 100));
	const innerH = chartHeight - margin.top - margin.bottom;

	// Auto-scale Y axis to data range with padding
	const yRange = $derived.by(() => {
		if (buckets.length < 2) return { min: 0, max: 100 };
		const vals = buckets.map((b) => b.avg);
		const dataMin = Math.min(...vals);
		const dataMax = Math.max(...vals);
		const span = dataMax - dataMin;
		const pad = Math.max(span * 0.3, 8); // at least 8% padding
		return {
			min: Math.max(0, Math.floor((dataMin - pad) / 5) * 5),
			max: Math.min(100, Math.ceil((dataMax + pad) / 5) * 5),
		};
	});

	// Grid lines — dynamically based on Y range
	const gridLines = $derived.by(() => {
		const range = yRange.max - yRange.min;
		const step = range <= 20 ? 5 : range <= 50 ? 10 : 25;
		const lines: number[] = [];
		for (let v = yRange.min; v <= yRange.max; v += step) {
			lines.push(v);
		}
		if (lines[lines.length - 1] !== yRange.max) lines.push(yRange.max);
		return lines;
	});

	// Threshold lines for context
	const thresholds = $derived.by(() => {
		const t: { val: number; label: string; color: string }[] = [];
		if (yRange.min <= 40 && yRange.max >= 40) {
			t.push({ val: 40, label: 'Low', color: 'var(--color-danger)' });
		}
		if (yRange.min <= 70 && yRange.max >= 70) {
			t.push({ val: 70, label: 'Good', color: 'var(--color-success)' });
		}
		return t;
	});

	function yPos(val: number): number {
		const range = yRange.max - yRange.min;
		if (range === 0) return margin.top + innerH / 2;
		return margin.top + innerH - ((val - yRange.min) / range) * innerH;
	}

	function xPos(i: number): number {
		if (buckets.length <= 1) return margin.left + innerW / 2;
		return margin.left + (i / (buckets.length - 1)) * innerW;
	}

	const portfolioPath = $derived.by(() => {
		if (buckets.length < 2) return '';
		return buckets
			.map((b, i) => `${i === 0 ? 'M' : 'L'} ${xPos(i)} ${yPos(b.avg)}`)
			.join(' ');
	});

	// Gradient fill path
	const fillPath = $derived.by(() => {
		if (buckets.length < 2) return '';
		const bottom = margin.top + innerH;
		const parts = buckets.map(
			(b, i) => `${i === 0 ? 'M' : 'L'} ${xPos(i)} ${yPos(b.avg)}`
		);
		const last = xPos(buckets.length - 1);
		const first = xPos(0);
		return `${parts.join(' ')} L ${last} ${bottom} L ${first} ${bottom} Z`;
	});

	// Hover state
	let hoveredIndex = $state<number | null>(null);
	const columnWidth = $derived(
		buckets.length > 1 ? innerW / (buckets.length - 1) : innerW
	);

	// Assessment line colors
	const lineColors = [
		'#6366f1', '#ec4899', '#f59e0b', '#10b981',
		'#8b5cf6', '#ef4444', '#06b6d4', '#84cc16',
	];

	function assessmentPath(line: AssessmentLine): string {
		if (line.points.length < 2) return '';
		const labelToIdx = new Map(buckets.map((b, i) => [b.label, i]));
		return line.points
			.filter((p) => labelToIdx.has(p.label))
			.map((p, i) => {
				const idx = labelToIdx.get(p.label)!;
				return `${i === 0 ? 'M' : 'L'} ${xPos(idx)} ${yPos(p.score)}`;
			})
			.join(' ');
	}

	// X-axis label thinning — show at most ~8 labels
	const labelEvery = $derived(Math.max(1, Math.ceil(buckets.length / 8)));

	// Format label for display (shorten ISO dates)
	function formatLabel(label: string): string {
		// Monthly: "2026-02" → "Feb '26"
		if (/^\d{4}-\d{2}$/.test(label)) {
			const [y, m] = label.split('-');
			const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
			return `${months[parseInt(m) - 1]} '${y.slice(2)}`;
		}
		// Weekly: "2026-02-16" → "Feb 16"
		if (/^\d{4}-\d{2}-\d{2}$/.test(label)) {
			const d = new Date(label + 'T00:00:00');
			const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
			return `${months[d.getMonth()]} ${d.getDate()}`;
		}
		return label;
	}

	// Only show individual data dots when there are few buckets
	const showDots = $derived(buckets.length <= 24);

	// Unique ID for gradient defs
	const gradId = `chart-fill-${Math.random().toString(36).slice(2, 6)}`;
</script>

<div bind:clientWidth={containerWidth} class="w-full">
	{#if buckets.length < 2}
		<div class="flex items-center justify-center h-64 text-text-muted text-sm">
			Not enough data points for a chart. At least 2 estimate snapshots are needed.
		</div>
	{:else}
		<svg width={containerWidth} height={chartHeight} class="block">
			<defs>
				<linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stop-color="var(--color-primary)" stop-opacity="0.15" />
					<stop offset="100%" stop-color="var(--color-primary)" stop-opacity="0.01" />
				</linearGradient>
			</defs>

			<!-- Horizontal grid -->
			{#each gridLines as val}
				<line
					x1={margin.left}
					y1={yPos(val)}
					x2={margin.left + innerW}
					y2={yPos(val)}
					stroke="var(--color-border-light)"
					stroke-width="1"
					stroke-dasharray={val === yRange.min || val === yRange.max ? 'none' : '4,3'}
				/>
				<text
					x={margin.left - 10}
					y={yPos(val) + 4}
					text-anchor="end"
					class="text-[10px] font-mono"
					fill="var(--color-text-muted)"
				>
					{val}%
				</text>
			{/each}

			<!-- Threshold reference lines -->
			{#each thresholds as th}
				<line
					x1={margin.left}
					y1={yPos(th.val)}
					x2={margin.left + innerW}
					y2={yPos(th.val)}
					stroke={th.color}
					stroke-width="1"
					stroke-dasharray="6,4"
					opacity="0.4"
				/>
				<text
					x={margin.left + innerW + 4}
					y={yPos(th.val) + 3}
					class="text-[9px] font-mono font-bold"
					fill={th.color}
					opacity="0.6"
				>
					{th.label}
				</text>
			{/each}

			<!-- Hover columns (behind everything) -->
			{#each buckets as _, i}
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

			<!-- Gradient fill -->
			<path d={fillPath} fill="url(#{gradId})" />

			<!-- Assessment lines (behind portfolio) -->
			{#if showAssessments}
				{#each assessmentLines as line, i}
					{@const path = assessmentPath(line)}
					{#if path}
						<path
							d={path}
							fill="none"
							stroke={lineColors[i % lineColors.length]}
							stroke-width="1.5"
							stroke-dasharray="6,3"
							opacity="0.6"
						/>
					{/if}
				{/each}
			{/if}

			<!-- Portfolio average line -->
			<path
				d={portfolioPath}
				fill="none"
				stroke="var(--color-primary)"
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>

			<!-- Data points on portfolio line -->
			{#if showDots}
				{#each buckets as bucket, i}
					<circle
						cx={xPos(i)}
						cy={yPos(bucket.avg)}
						r={hoveredIndex === i ? 5 : 3}
						fill={hoveredIndex === i ? 'var(--color-primary)' : 'var(--color-surface)'}
						stroke="var(--color-primary)"
						stroke-width="2"
					/>
				{/each}
			{:else}
				<!-- Just show hovered dot -->
				{#if hoveredIndex !== null}
					<circle
						cx={xPos(hoveredIndex)}
						cy={yPos(buckets[hoveredIndex].avg)}
						r="5"
						fill="var(--color-primary)"
						stroke="var(--color-surface)"
						stroke-width="2"
					/>
				{/if}
			{/if}

			<!-- X-axis labels -->
			{#each buckets as bucket, i}
				{#if i % labelEvery === 0 || i === buckets.length - 1}
					<text
						x={xPos(i)}
						y={chartHeight - 10}
						text-anchor="middle"
						class="text-[10px] font-mono"
						fill="var(--color-text-muted)"
					>
						{formatLabel(bucket.label)}
					</text>
				{/if}
			{/each}

			<!-- Hover tooltip -->
			{#if hoveredIndex !== null}
				{@const b = buckets[hoveredIndex]}
				{@const tx = xPos(hoveredIndex)}
				{@const ty = yPos(b.avg)}
				<!-- Vertical guide -->
				<line
					x1={tx}
					y1={margin.top}
					x2={tx}
					y2={margin.top + innerH}
					stroke="var(--color-primary)"
					stroke-width="1"
					stroke-dasharray="3,3"
					opacity="0.3"
				/>
				<!-- Tooltip box -->
				{@const tooltipText = `${b.avg.toFixed(1)}%  ${formatLabel(b.label)}`}
				{@const tooltipW = Math.max(tooltipText.length * 7, 90)}
				{@const tooltipX = Math.min(Math.max(tx - tooltipW / 2, margin.left), margin.left + innerW - tooltipW)}
				<rect
					x={tooltipX}
					y={ty - 32}
					width={tooltipW}
					height="22"
					rx="3"
					fill="var(--color-brutal)"
					opacity="0.92"
				/>
				<text
					x={tooltipX + tooltipW / 2}
					y={ty - 17}
					text-anchor="middle"
					class="text-[11px] font-mono font-bold"
					fill="white"
				>
					{b.avg.toFixed(1)}% &middot; {formatLabel(b.label)}
				</text>
			{/if}
		</svg>
	{/if}
</div>
