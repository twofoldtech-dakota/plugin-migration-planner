<script lang="ts">
	import KpiCard from '$lib/components/ui/KpiCard.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import HorizontalBarChart from '$lib/components/charts/HorizontalBarChart.svelte';
	import HeatmapGrid from '$lib/components/charts/HeatmapGrid.svelte';
	import DonutChart from '$lib/components/charts/DonutChart.svelte';
	import AreaChart from '$lib/components/charts/AreaChart.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Portfolio Intelligence | MigrateIQ</title>
</svelte:head>

<div>
	<p class="text-sm text-text-muted mb-6">
		Cross-portfolio pipeline health, risk exposure, and client distribution.
	</p>

	<!-- KPI Row -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
		<KpiCard
			label="Total Assessments"
			value={data.kpis.totalAssessments}
			tooltip="Active assessments across all clients"
		/>
		<KpiCard
			label="Total Estimated Hours"
			value={data.kpis.totalHours.toLocaleString() + 'h'}
			tooltip="Sum of expected hours across all projects"
		/>
		<KpiCard
			label="Open Risks"
			value={data.kpis.openRisks}
			variant={data.kpis.openRisks > 10 ? 'danger' : data.kpis.openRisks > 5 ? 'warning' : 'success'}
			tooltip="Risks with status 'open' across all assessments"
		/>
		<KpiCard
			label="Assumptions Validated"
			value={data.kpis.assumptionValidationPct + '%'}
			variant={data.kpis.assumptionValidationPct >= 70 ? 'success' : data.kpis.assumptionValidationPct >= 40 ? 'warning' : 'danger'}
			progress={data.kpis.assumptionValidationPct}
			tooltip="Percentage of assumptions that have been validated"
		/>
	</div>

	<!-- Charts Grid -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- Pipeline by Status -->
		<Card>
			<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4">Assessment Pipeline</h2>
			{#if data.pipeline.some((p) => p.value > 0)}
				<HorizontalBarChart bars={data.pipeline} />
			{:else}
				<div class="flex items-center justify-center h-32 text-text-muted text-sm">
					No assessments found.
				</div>
			{/if}
		</Card>

		<!-- Hours per Project -->
		<Card>
			<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4">Hours by Project</h2>
			{#if data.hoursPerProject.length > 0}
				<HorizontalBarChart bars={data.hoursPerProject} valueFormat="hours" />
			{:else}
				<div class="flex items-center justify-center h-32 text-text-muted text-sm">
					No estimated hours yet.
				</div>
			{/if}
		</Card>

		<!-- Risk Matrix -->
		<Card>
			<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4">Risk Matrix</h2>
			{#if data.riskMatrix.cells.length > 0}
				<HeatmapGrid
					cells={data.riskMatrix.cells}
					rows={data.riskMatrix.rows}
					cols={data.riskMatrix.cols}
					colorScale="danger"
				/>
			{:else}
				<div class="flex items-center justify-center h-32 text-text-muted text-sm">
					No risks recorded yet.
				</div>
			{/if}
		</Card>

		<!-- Client Distribution -->
		<Card>
			<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4">Client Distribution</h2>
			{#if data.clientDistribution.length > 0}
				<DonutChart
					segments={data.clientDistribution}
					centerLabel="Clients"
					centerValue={String(data.clientDistribution.length)}
				/>
			{:else}
				<div class="flex items-center justify-center h-32 text-text-muted text-sm">
					No client data available.
				</div>
			{/if}
		</Card>
	</div>

	<!-- Validation Velocity (full width) -->
	{#if data.validationVelocity.length >= 2}
		<div class="mt-6">
			<Card>
				<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4">Assumption Validation Velocity</h2>
				<AreaChart
					series={[
						{
							id: 'validated',
							label: 'Validated',
							color: '#10b981',
							data: data.validationVelocity,
						},
					]}
					yLabel="Count"
				/>
			</Card>
		</div>
	{/if}
</div>
