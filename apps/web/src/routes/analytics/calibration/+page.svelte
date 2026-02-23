<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import KpiCard from '$lib/components/ui/KpiCard.svelte';
	import ScatterPlot from '$lib/components/charts/ScatterPlot.svelte';
	import HorizontalBarChart from '$lib/components/charts/HorizontalBarChart.svelte';
	import DonutChart from '$lib/components/charts/DonutChart.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Calibration | MigrateIQ</title>
</svelte:head>

<div>
	<p class="text-sm text-text-muted mb-6">
		Compare migration estimates against actual outcomes to improve future accuracy.
	</p>

	{#if data.totalCalibrations === 0}
		<Card>
			<div class="flex flex-col items-center gap-4 py-12 text-center">
				<div class="flex h-16 w-16 items-center justify-center brutal-border bg-primary-light text-3xl text-primary shadow-sm">
					&#9878;
				</div>
				<h2 class="text-lg font-extrabold uppercase tracking-wider">No Calibration Data Yet</h2>
				<p class="text-sm text-text-muted max-w-md">
					Calibration data is recorded after a migration is complete. Complete an assessment and
					record actuals to start seeing variance analysis here.
				</p>
				<a
					href="/assessments"
					class="brutal-border-thin px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-primary text-white border-primary hover:bg-primary-hover transition-colors no-underline"
				>
					View Assessments
				</a>
			</div>
		</Card>
	{:else}
		<!-- KPI Row -->
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
			<KpiCard
				label="Total Calibrations"
				value={data.totalCalibrations}
			/>
			<KpiCard
				label="Avg Variance"
				value={data.avgVariance + '%'}
				variant={data.avgVariance <= 10 ? 'success' : data.avgVariance <= 25 ? 'warning' : 'danger'}
				tooltip="Average of absolute variance across all phases"
			/>
			<KpiCard
				label="Over-Estimated"
				value={data.overEstimated}
				detail="phases where actual < estimated"
			/>
			<KpiCard
				label="Under-Estimated"
				value={data.underEstimated}
				detail="phases where actual > estimated"
				variant={data.underEstimated > data.overEstimated ? 'warning' : undefined}
			/>
		</div>

		<!-- Scatter: Estimated vs Actual -->
		<div class="mb-6">
			<Card>
				<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4">Estimated vs Actual Hours</h2>
				<ScatterPlot
					points={data.scatterData}
					xLabel="Estimated Hours"
					yLabel="Actual Hours"
					showDiagonal={true}
				/>
				<p class="text-[10px] text-text-muted mt-2">
					Points on the diagonal indicate perfect estimates. Above = under-estimated, below = over-estimated.
				</p>
			</Card>
		</div>

		<!-- Two-column: Phase Variance + AI Tool Usage -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
			<Card>
				<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4">Phase Variance</h2>
				{#if data.phaseVariance.length > 0}
					<HorizontalBarChart
						bars={data.phaseVariance.map((p) => ({
							label: p.label,
							value: Math.abs(p.value),
							color: p.value >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
							detail: p.value >= 0 ? `+${p.value}% over` : `${p.value}% under`,
						}))}
						valueFormat="percent"
					/>
					<div class="flex items-center gap-4 mt-3 pt-2 border-t-2 border-border-light">
						<div class="flex items-center gap-1.5">
							<span class="inline-block w-3 h-3 brutal-border" style="background-color: var(--color-success);"></span>
							<span class="text-[10px] font-bold text-text-muted uppercase">Over-estimated</span>
						</div>
						<div class="flex items-center gap-1.5">
							<span class="inline-block w-3 h-3 brutal-border" style="background-color: var(--color-danger);"></span>
							<span class="text-[10px] font-bold text-text-muted uppercase">Under-estimated</span>
						</div>
					</div>
				{:else}
					<p class="text-sm text-text-muted">No phase data available.</p>
				{/if}
			</Card>

			<Card>
				<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4">AI Tool Adoption</h2>
				{#if data.aiToolUsage[0].value + data.aiToolUsage[1].value > 0}
					<DonutChart
						segments={data.aiToolUsage}
						centerValue={String(data.aiToolUsage[0].value + data.aiToolUsage[1].value)}
						centerLabel="Tools"
					/>
				{:else}
					<p class="text-sm text-text-muted">No AI tool data recorded.</p>
				{/if}
			</Card>
		</div>

		<!-- Surprises Table -->
		{#if data.surprises.length > 0}
			<Card padding="p-0">
				<div class="px-6 pt-5 pb-4">
					<h2 class="text-sm font-extrabold uppercase tracking-wider">Surprises</h2>
					<p class="text-xs text-text-muted mt-1">Unexpected findings recorded during calibration</p>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="bg-brutal text-white text-left">
								<th class="px-6 py-2.5 text-[10px] font-extrabold uppercase tracking-wider">Project</th>
								<th class="px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-wider">Description</th>
								<th class="px-6 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-right">Impact</th>
							</tr>
						</thead>
						<tbody>
							{#each data.surprises as surprise}
								<tr class="border-b-2 border-border-light hover:bg-surface-hover transition-colors">
									<td class="px-6 py-3 font-bold whitespace-nowrap">{surprise.project}</td>
									<td class="px-4 py-3 text-text-secondary">{surprise.description}</td>
									<td class="px-6 py-3 text-right font-mono text-text-muted">{surprise.impact}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</Card>
		{/if}
	{/if}
</div>
