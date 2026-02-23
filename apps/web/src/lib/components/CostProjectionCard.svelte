<script lang="ts">
	interface CostProjection {
		low: number;
		expected: number;
		high: number;
		by_role?: Record<string, { low: number; expected: number; high: number; hours: number }>;
	}

	interface Props {
		cost: CostProjection;
	}

	let { cost }: Props = $props();

	function fmt(n: number): string {
		return '$' + Math.round(n).toLocaleString();
	}

	const byRole = $derived(Object.entries(cost.by_role ?? {}).sort(([, a], [, b]) => b.hours - a.hours));
</script>

<div class="brutal-border bg-surface shadow-[3px_3px_0_#000]">
	<!-- Three columns -->
	<div class="grid grid-cols-3 divide-x-2 divide-brutal">
		<div class="p-4 text-center">
			<p class="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">Low</p>
			<p class="text-lg font-extrabold font-mono text-success mt-1">{fmt(cost.low)}</p>
		</div>
		<div class="p-4 text-center bg-primary-light/30">
			<p class="text-[10px] font-extrabold uppercase tracking-wider text-primary">Expected</p>
			<p class="text-xl font-extrabold font-mono text-primary mt-1">{fmt(cost.expected)}</p>
		</div>
		<div class="p-4 text-center">
			<p class="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">High</p>
			<p class="text-lg font-extrabold font-mono text-danger mt-1">{fmt(cost.high)}</p>
		</div>
	</div>

	<!-- By-role breakdown -->
	{#if byRole.length > 0}
		<div class="border-t-2 border-brutal px-4 py-3">
			<h4 class="text-[10px] font-extrabold uppercase tracking-wider text-text-muted mb-2">By Role</h4>
			<div class="space-y-1.5">
				{#each byRole as [roleId, data]}
					{@const pct = cost.expected > 0 ? (data.expected / cost.expected) * 100 : 0}
					<div class="flex items-center gap-3">
						<span class="text-xs font-bold w-40 truncate">{roleId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
						<div class="flex-1 h-2 bg-border-light border border-brutal overflow-hidden">
							<div class="h-full bg-primary transition-all duration-300" style="width: {pct}%"></div>
						</div>
						<span class="text-xs font-mono text-text-muted w-24 text-right">{fmt(data.expected)}</span>
						<span class="text-[10px] font-mono text-text-faint w-10 text-right">{data.hours}h</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
