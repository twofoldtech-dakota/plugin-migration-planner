<script lang="ts">
	import KpiCard from '$lib/components/ui/KpiCard.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import DonutChart from '$lib/components/charts/DonutChart.svelte';
	import HorizontalBarChart from '$lib/components/charts/HorizontalBarChart.svelte';
	import RadarChart from '$lib/components/charts/RadarChart.svelte';
	import { gradeColor } from '$lib/utils/pack-grading';

	let { data } = $props();

	// Sort grades: best first
	let sortedGrades = $derived(
		[...data.packGrades].sort((a, b) => b.overallScore - a.overallScore)
	);
</script>

<svelte:head>
	<title>Knowledge Health | MigrateIQ</title>
</svelte:head>

<div>
	<p class="text-sm text-text-muted mb-6">
		Knowledge pack completeness, thoroughness grades, and source URL health.
	</p>

	<!-- KPIs -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
		<KpiCard label="Knowledge Packs" value={data.kpis.packs} />
		<KpiCard label="Migration Paths" value={data.kpis.paths} />
		<KpiCard label="Source URLs" value={data.kpis.sourceUrls} />
		<KpiCard
			label="Stale URLs"
			value={data.kpis.staleUrls}
			variant={data.kpis.staleUrls > 5 ? 'danger' : data.kpis.staleUrls > 0 ? 'warning' : 'success'}
		/>
	</div>

	{#if data.kpis.packs === 0}
		<Card>
			<div class="flex flex-col items-center gap-4 py-12 text-center">
				<div class="flex h-16 w-16 items-center justify-center brutal-border bg-primary-light text-3xl text-primary shadow-sm">
					&#128218;
				</div>
				<h2 class="text-lg font-extrabold uppercase tracking-wider">No Knowledge Packs Yet</h2>
				<p class="text-sm text-text-muted max-w-md">
					Knowledge packs are built through the research pipeline. Run a research task to create your first pack.
				</p>
				<a
					href="/knowledge"
					class="brutal-border-thin px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-primary text-white border-primary hover:bg-primary-hover transition-colors no-underline"
				>
					View Knowledge
				</a>
			</div>
		</Card>
	{:else}
		<!-- Pack Thoroughness Grades (Radar Charts) -->
		<Card>
			<h2 class="text-sm font-extrabold uppercase tracking-wider mb-6">Pack Thoroughness Grades</h2>
			{#if sortedGrades.length > 0}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each sortedGrades as grade}
						<div class="brutal-border-thin p-4 bg-bg">
							<!-- Header: name + overall grade -->
							<div class="flex items-center justify-between mb-3">
								<a href="/knowledge/{grade.packId}" class="font-bold text-text hover:text-primary transition-colors no-underline">
									{grade.packName}
								</a>
								<span class="text-lg font-extrabold font-mono px-2.5 py-0.5 border-2 {gradeColor(grade.overall)}">
									{grade.overall}
								</span>
							</div>
							<!-- Radar -->
							<div class="flex justify-center">
								<RadarChart
									dimensions={grade.dimensions.map((d) => ({
										label: d.label.replace('Dependency ', 'Dep. ').replace('Alternatives', 'Alt.').replace('Patterns', 'Pat.').replace('Mappings', 'Map.'),
										value: d.score,
										maxValue: 100,
									}))}
									size={200}
								/>
							</div>
							<!-- Score -->
							<div class="text-center mt-2">
								<span class="text-xs font-mono text-text-muted">
									Score: {grade.overallScore}/100
								</span>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</Card>

		<!-- Dimension Grade Breakdown Table -->
		<div class="mt-6">
			<Card padding="p-0">
				<div class="px-6 pt-5 pb-4">
					<h2 class="text-sm font-extrabold uppercase tracking-wider">Dimension Breakdown</h2>
					<p class="text-xs text-text-muted mt-1">Letter grades across all 9 thoroughness dimensions</p>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="bg-brutal text-white text-left">
								<th class="px-6 py-2.5 text-[10px] font-extrabold uppercase tracking-wider">Pack</th>
								<th class="px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-center">Overall</th>
								<th class="px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-center">Discovery</th>
								<th class="px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-center">Effort</th>
								<th class="px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-center">Multipliers</th>
								<th class="px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-center">Gotchas</th>
								<th class="px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-center">Chains</th>
								<th class="px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-center">Phases</th>
								<th class="px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-center">Roles</th>
								<th class="px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-center">AI Tools</th>
								<th class="px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-center">Sources</th>
							</tr>
						</thead>
						<tbody>
							{#each sortedGrades as grade}
								<tr class="border-b-2 border-border-light hover:bg-surface-hover transition-colors">
									<td class="px-6 py-3">
										<a href="/knowledge/{grade.packId}" class="font-bold text-text hover:text-primary transition-colors no-underline">
											{grade.packName}
										</a>
									</td>
									<td class="px-3 py-3 text-center">
										<span class="text-xs font-extrabold font-mono px-1.5 py-0.5 border-2 {gradeColor(grade.overall)}">
											{grade.overall}
										</span>
									</td>
									{#each grade.dimensions as dim}
										<td class="px-3 py-3 text-center">
											<span class="text-[10px] font-bold font-mono px-1.5 py-0.5 border {gradeColor(dim.grade)}">
												{dim.grade}
											</span>
											<span class="block text-[9px] font-mono text-text-muted mt-0.5">{dim.count}</span>
										</td>
									{/each}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</Card>
		</div>

		<!-- Charts: Confidence + URL Health -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
			<Card>
				<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4">Pack Confidence Levels</h2>
				{#if data.confidenceSegments.length > 0}
					<div class="flex justify-center">
						<DonutChart
							segments={data.confidenceSegments}
							centerLabel="Packs"
							centerValue={String(data.kpis.packs)}
						/>
					</div>
				{:else}
					<p class="text-sm text-text-muted text-center py-8">No confidence data available</p>
				{/if}
			</Card>

			<Card>
				<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4">Source URL Health</h2>
				{#if data.urlHealthSegments.length > 0}
					<div class="flex justify-center">
						<DonutChart
							segments={data.urlHealthSegments}
							centerLabel="URLs"
							centerValue={String(data.kpis.sourceUrls)}
						/>
					</div>
				{:else}
					<p class="text-sm text-text-muted text-center py-8">No source URLs tracked yet</p>
				{/if}
			</Card>
		</div>

		<!-- Pack Completeness Bar Chart -->
		<div class="mt-6">
			<Card>
				<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4">Pack Completeness</h2>
				{#if data.packCompleteness.length > 0}
					<HorizontalBarChart bars={data.packCompleteness} showValues={true} valueFormat="number" />
				{:else}
					<p class="text-sm text-text-muted text-center py-8">No pack data available</p>
				{/if}
			</Card>
		</div>

		<!-- Detailed Pack Table -->
		{#if data.packTable.length > 0}
			<div class="mt-6">
				<Card padding="p-0">
					<div class="px-6 pt-5 pb-4">
						<h2 class="text-sm font-extrabold uppercase tracking-wider">Pack Details</h2>
					</div>
					<div class="overflow-x-auto">
						<table class="w-full text-sm">
							<thead>
								<tr class="bg-brutal text-white text-left">
									<th class="px-6 py-2.5 text-[10px] font-extrabold uppercase tracking-wider">Pack</th>
									<th class="px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-center">Grade</th>
									<th class="px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-wider">Category</th>
									<th class="px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-wider">Confidence</th>
									<th class="px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-right">Discovery</th>
									<th class="px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-right">Effort</th>
									<th class="px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-right">Gotchas</th>
									<th class="px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-right">Multi.</th>
									<th class="px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-right">AI</th>
									<th class="px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-right">Sources</th>
								</tr>
							</thead>
							<tbody>
								{#each data.packTable.sort((a, b) => b.gradeScore - a.gradeScore) as pack}
									<tr class="border-b-2 border-border-light hover:bg-surface-hover transition-colors">
										<td class="px-6 py-3 font-bold">{pack.name}</td>
										<td class="px-3 py-3 text-center">
											<span class="text-xs font-extrabold font-mono px-1.5 py-0.5 border-2 {gradeColor(pack.grade)}">
												{pack.grade}
											</span>
										</td>
										<td class="px-4 py-3 text-text-muted">{pack.category}</td>
										<td class="px-4 py-3">
											<span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border-2 border-brutal
												{pack.confidence === 'verified' ? 'bg-success-light text-success' :
												 pack.confidence === 'reviewed' ? 'bg-primary-light text-primary' :
												 'bg-warning-light text-warning'}">
												{pack.confidence}
											</span>
										</td>
										<td class="px-3 py-3 text-right font-mono">
											{pack.discoveryDims}d / {pack.discoveryQuestions}q
										</td>
										<td class="px-3 py-3 text-right font-mono">{pack.effort}</td>
										<td class="px-3 py-3 text-right font-mono">{pack.gotchas}</td>
										<td class="px-3 py-3 text-right font-mono">{pack.multipliers}</td>
										<td class="px-3 py-3 text-right font-mono">{pack.aiAlts}</td>
										<td class="px-3 py-3 text-right font-mono">{pack.sources}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</Card>
			</div>
		{/if}
	{/if}
</div>
