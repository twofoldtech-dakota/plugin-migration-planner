<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import KpiCard from '$lib/components/ui/KpiCard.svelte';
	import AreaChart from '$lib/components/charts/AreaChart.svelte';
	import HorizontalBarChart from '$lib/components/charts/HorizontalBarChart.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Usage Analytics | MigrateIQ</title>
</svelte:head>

<div>
	<p class="text-sm text-text-muted mb-6">
		Track page views, sessions, and feature engagement across the platform.
	</p>

	{#if data.pageViews24h === 0 && data.sessions7d === 0}
		<Card>
			<div class="flex flex-col items-center gap-4 py-12 text-center">
				<div class="flex h-16 w-16 items-center justify-center brutal-border bg-primary-light text-3xl text-primary shadow-sm">
					&#9636;
				</div>
				<h2 class="text-lg font-extrabold uppercase tracking-wider">No Usage Data Yet</h2>
				<p class="text-sm text-text-muted max-w-md">
					Analytics event tracking is active. Page views and feature events will appear here
					as users interact with the platform.
				</p>
			</div>
		</Card>
	{:else}
		<!-- KPI Row -->
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
			<KpiCard
				label="Page Views (24h)"
				value={data.pageViews24h.toLocaleString()}
				tooltip="Total page views in the last 24 hours"
			/>
			<KpiCard
				label="Sessions (7d)"
				value={data.sessions7d.toLocaleString()}
				tooltip="Unique sessions in the last 7 days"
			/>
			<KpiCard
				label="Pages / Session"
				value={data.avgPagesPerSession}
				tooltip="Average daily page views per session"
			/>
			<KpiCard
				label="Active Assessments"
				value={data.activeAssessments}
				detail="with events in 7 days"
			/>
		</div>

		<!-- Page Views Over Time -->
		<div class="mb-6">
			<Card>
				<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4">Page Views Over Time</h2>
				{#if data.pageViewTrend[0].data.length >= 2}
					<AreaChart
						series={data.pageViewTrend}
						yLabel="Views"
					/>
				{:else}
					<div class="flex items-center justify-center h-64 text-text-muted text-sm">
						Not enough data points yet. Check back after more activity.
					</div>
				{/if}
			</Card>
		</div>

		<!-- Two-column: Top Pages + Top Features -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
			<Card>
				<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4">Top Pages</h2>
				{#if data.topPagesBars.length > 0}
					<HorizontalBarChart bars={data.topPagesBars} />
				{:else}
					<p class="text-sm text-text-muted">No page view data in the last 7 days.</p>
				{/if}
			</Card>

			<Card>
				<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4">Top Features</h2>
				{#if data.topFeaturesBars.length > 0}
					<HorizontalBarChart bars={data.topFeaturesBars} />
				{:else}
					<p class="text-sm text-text-muted">No feature events in the last 7 days.</p>
				{/if}
			</Card>
		</div>

		<!-- Engaged Assessments Table -->
		{#if data.engagedAssessments.length > 0}
			<Card padding="p-0">
				<div class="px-6 pt-5 pb-4">
					<h2 class="text-sm font-extrabold uppercase tracking-wider">Most Engaged Assessments</h2>
					<p class="text-xs text-text-muted mt-1">Assessments with the most events in the last 7 days</p>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="bg-brutal text-white text-left">
								<th class="px-6 py-2.5 text-[10px] font-extrabold uppercase tracking-wider">Project</th>
								<th class="px-6 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-right">Events</th>
							</tr>
						</thead>
						<tbody>
							{#each data.engagedAssessments as row}
								<tr class="border-b-2 border-border-light hover:bg-surface-hover transition-colors">
									<td class="px-6 py-3">
										<a
											href="/assessments/{row.assessment_id}"
											class="font-bold text-text hover:text-primary transition-colors no-underline"
										>
											{row.project_name}
										</a>
									</td>
									<td class="px-6 py-3 text-right font-mono font-bold">
										{row.count.toLocaleString()}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</Card>
		{/if}
	{/if}
</div>
