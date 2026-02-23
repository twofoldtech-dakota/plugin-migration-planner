<script lang="ts">
	import KpiCard from '$lib/components/ui/KpiCard.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import WaterfallChart from '$lib/components/charts/WaterfallChart.svelte';
	import StackedBarChart from '$lib/components/charts/StackedBarChart.svelte';
	import HorizontalBarChart from '$lib/components/charts/HorizontalBarChart.svelte';
	import ScatterPlot from '$lib/components/charts/ScatterPlot.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Estimation Accuracy | MigrateIQ</title>
</svelte:head>

<div>
	<p class="text-sm text-text-muted mb-6">
		Hours buildup analysis, role distribution, multiplier impact, and component-level accuracy.
	</p>

	<!-- KPI Row -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
		<KpiCard
			label="Estimate Versions"
			value={data.kpis.totalVersions}
			tooltip="Total estimate snapshots across all assessments"
		/>
		<KpiCard
			label="Avg Confidence"
			value={data.kpis.avgConfidence + '%'}
			variant={data.kpis.avgConfidence >= 70 ? 'success' : data.kpis.avgConfidence >= 40 ? 'warning' : 'danger'}
			progress={data.kpis.avgConfidence}
			tooltip="Average confidence score across latest estimate snapshots"
		/>
		<KpiCard
			label="Total Estimated Hours"
			value={data.kpis.totalHours.toLocaleString() + 'h'}
			tooltip="Sum of expected hours across all latest estimates"
		/>
		<KpiCard
			label="Avg Gotcha %"
			value={data.kpis.avgGotchaPct + '%'}
			variant={data.kpis.avgGotchaPct > 20 ? 'danger' : data.kpis.avgGotchaPct > 10 ? 'warning' : 'success'}
			tooltip="Gotcha hours as a percentage of base hours"
		/>
	</div>

	<!-- Waterfall Chart (full width) -->
	<div class="mb-6">
		<Card>
			<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4">Hours Buildup</h2>
			{#if data.waterfallData.some((s) => s.value > 0)}
				<WaterfallChart steps={data.waterfallData} valueFormat="hours" />
			{:else}
				<div class="flex items-center justify-center h-64 text-text-muted text-sm">
					No estimate data available yet.
				</div>
			{/if}
		</Card>
	</div>

	<!-- Two-column grid -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
		<!-- Hours by Role -->
		<Card>
			<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4">Hours by Role</h2>
			{#if data.roleBreakdown.data.length > 0 && data.roleBreakdown.series.length > 0}
				<StackedBarChart
					data={data.roleBreakdown.data}
					series={data.roleBreakdown.series}
					orientation="horizontal"
					valueFormat="hours"
				/>
			{:else}
				<div class="flex items-center justify-center h-32 text-text-muted text-sm">
					No role breakdown data available.
				</div>
			{/if}
		</Card>

		<!-- Multiplier Impact -->
		<Card>
			<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4">Multiplier Impact</h2>
			{#if data.multiplierImpact.length > 0}
				<HorizontalBarChart bars={data.multiplierImpact} />
			{:else}
				<div class="flex items-center justify-center h-32 text-text-muted text-sm">
					No active multipliers recorded.
				</div>
			{/if}
		</Card>
	</div>

	<!-- Scatter Plot (full width) -->
	<Card>
		<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4">Base vs Final Hours by Component</h2>
		{#if data.componentScatter.length > 0}
			<ScatterPlot
				points={data.componentScatter}
				xLabel="Base Hours"
				yLabel="Final Hours"
				showDiagonal={true}
			/>
		{:else}
			<div class="flex items-center justify-center h-64 text-text-muted text-sm">
				No component-level estimate data available.
			</div>
		{/if}
	</Card>
</div>
