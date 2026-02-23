<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import ConfidenceLineChart from '$lib/components/ConfidenceLineChart.svelte';
	import RadarChart from '$lib/components/charts/RadarChart.svelte';

	let { data } = $props();

	let showAssessments = $state(true);

	// Build chart data from timeline events
	const chartBuckets = $derived(
		data.events.map((ev) => ({
			label: formatShortDate(ev.created_at),
			avg: ev.portfolioAvg,
		}))
	);

	// Build per-assessment lines from run data
	const chartAssessmentLines = $derived(
		data.assessments.map((a) => ({
			assessment_id: a.assessment_id,
			project_name: a.project_name,
			points: a.runs.map((r) => ({
				label: formatShortDate(r.created_at),
				score: r.score,
			})),
			current: a.currentScore,
			delta: a.delta,
		}))
	);

	function formatShortDate(dateStr: string): string {
		const d = new Date(dateStr);
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		return `${months[d.getMonth()]} ${d.getDate()}`;
	}

	function formatDateTime(dateStr: string): string {
		const d = new Date(dateStr);
		return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
	}

	function deltaClass(delta: number): string {
		if (delta > 3) return 'text-success';
		if (delta < -3) return 'text-danger';
		return 'text-text-muted';
	}

	function deltaPrefix(delta: number): string {
		return delta > 0 ? '+' : '';
	}

	function confidenceColor(score: number): string {
		if (score >= 70) return 'text-success';
		if (score >= 40) return 'text-warning';
		return 'text-danger';
	}

	function runTypeLabel(type: string): string {
		return type === 'initial' ? 'Initial' : 'Refinement';
	}

	function runTypeBadge(type: string): string {
		return type === 'initial'
			? 'bg-primary text-white'
			: 'bg-surface-hover text-text-muted';
	}
</script>

<svelte:head>
	<title>Confidence Over Time | MigrateIQ</title>
</svelte:head>

<div>
	<div class="flex items-center justify-between mb-6">
		<div>
			<h2 class="text-lg font-extrabold uppercase tracking-wider">Confidence Over Time</h2>
			<p class="text-sm text-text-muted mt-1">
				{data.assessments.length} assessment{data.assessments.length !== 1 ? 's' : ''}
				&middot; {data.totalRuns} estimation run{data.totalRuns !== 1 ? 's' : ''}
			</p>
		</div>
	</div>

	{#if data.events.length < 2}
		<!-- Empty state -->
		<Card>
			<div class="flex flex-col items-center gap-4 py-12 text-center">
				<div class="flex h-16 w-16 items-center justify-center brutal-border bg-primary-light text-3xl text-primary shadow-sm">
					&#9776;
				</div>
				<h2 class="text-lg font-extrabold uppercase tracking-wider">No Trend Data Yet</h2>
				<p class="text-sm text-text-muted max-w-md">
					Confidence trends require at least 2 estimation runs across your portfolio.
					Run estimates on your assessments to start building the timeline.
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
		<!-- Run summary stats -->
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
			<Card>
				<span class="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Assessments</span>
				<p class="text-2xl font-extrabold font-mono mt-0.5">{data.assessments.length}</p>
			</Card>
			<Card>
				<span class="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Total Runs</span>
				<p class="text-2xl font-extrabold font-mono mt-0.5">{data.totalRuns}</p>
			</Card>
			<Card>
				<span class="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Initial Estimates</span>
				<p class="text-2xl font-extrabold font-mono mt-0.5">{data.events.filter((e) => e.type === 'initial').length}</p>
			</Card>
			<Card>
				<span class="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Refinements</span>
				<p class="text-2xl font-extrabold font-mono mt-0.5">{data.events.filter((e) => e.type === 'refinement').length}</p>
			</Card>
		</div>

		<!-- Chart -->
		<Card>
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-sm font-extrabold uppercase tracking-wider">Portfolio Trend</h2>
				{#if data.assessments.length > 1}
					<label class="flex items-center gap-2 cursor-pointer">
						<input type="checkbox" bind:checked={showAssessments} class="accent-primary" />
						<span class="text-xs font-bold text-text-muted uppercase tracking-wider">Per-assessment lines</span>
					</label>
				{/if}
			</div>
			<ConfidenceLineChart
				buckets={chartBuckets}
				assessmentLines={chartAssessmentLines}
				{showAssessments}
			/>
			<!-- Event legend -->
			<div class="flex items-center gap-4 mt-4 pt-3 border-t-2 border-border-light">
				<div class="flex items-center gap-1.5">
					<div class="w-6 h-0.5 bg-primary"></div>
					<span class="text-[10px] font-bold text-text-muted uppercase">Portfolio avg</span>
				</div>
				{#if showAssessments && data.assessments.length > 1}
					<div class="flex items-center gap-1.5">
						<div class="w-6 h-0.5 border-t-2 border-dashed border-text-muted"></div>
						<span class="text-[10px] font-bold text-text-muted uppercase">Per-assessment</span>
					</div>
				{/if}
			</div>
		</Card>

		<!-- Timeline of events -->
		<div class="mt-6">
			<Card padding="p-0">
				<div class="flex items-center justify-between px-6 pt-5 pb-4">
					<h2 class="text-sm font-extrabold uppercase tracking-wider">Estimation Runs</h2>
					<span class="text-xs font-mono text-text-muted">{data.totalRuns} run{data.totalRuns !== 1 ? 's' : ''}</span>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="bg-brutal text-white text-left">
								<th class="px-6 py-2.5 text-[10px] font-extrabold uppercase tracking-wider">When</th>
								<th class="px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-wider">Project</th>
								<th class="px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-wider">Type</th>
								<th class="px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-right">Score</th>
								<th class="px-6 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-right">Portfolio Avg</th>
							</tr>
						</thead>
						<tbody>
							{#each data.events as event}
								<tr class="border-b-2 border-border-light hover:bg-surface-hover transition-colors">
									<td class="px-6 py-3 font-mono text-xs text-text-muted whitespace-nowrap">
										{formatDateTime(event.created_at)}
									</td>
									<td class="px-4 py-3">
										<a href="/assessments/{event.assessment_id}" class="font-bold text-text hover:text-primary transition-colors no-underline">
											{event.project_name}
										</a>
									</td>
									<td class="px-4 py-3">
										<span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border-2 border-brutal {runTypeBadge(event.type)}">
											{runTypeLabel(event.type)}
										</span>
									</td>
									<td class="px-4 py-3 text-right font-mono font-bold {confidenceColor(event.score)}">
										{Math.round(event.score)}%
									</td>
									<td class="px-6 py-3 text-right font-mono font-bold {confidenceColor(event.portfolioAvg)}">
										{event.portfolioAvg}%
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</Card>
		</div>

		<!-- Assessment Breakdown -->
		{#if data.assessments.length > 0}
			<div class="mt-6">
				<Card padding="p-0">
					<div class="flex items-center justify-between px-6 pt-5 pb-4">
						<h2 class="text-sm font-extrabold uppercase tracking-wider">Per-Assessment Summary</h2>
						<span class="text-xs font-mono text-text-muted">{data.assessments.length} assessment{data.assessments.length !== 1 ? 's' : ''}</span>
					</div>
					<div class="overflow-x-auto">
						<table class="w-full text-sm">
							<thead>
								<tr class="bg-brutal text-white text-left">
									<th class="px-6 py-2.5 text-[10px] font-extrabold uppercase tracking-wider">Project</th>
									<th class="px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-right">Initial</th>
									<th class="px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-right">Current</th>
									<th class="px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-right">Change</th>
									<th class="px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-right">Runs</th>
									<th class="px-6 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-right">Last Run</th>
								</tr>
							</thead>
							<tbody>
								{#each data.assessments as assessment}
									<tr class="border-b-2 border-border-light hover:bg-surface-hover transition-colors">
										<td class="px-6 py-3">
											<a href="/assessments/{assessment.assessment_id}" class="font-bold text-text hover:text-primary transition-colors no-underline">
												{assessment.project_name}
											</a>
										</td>
										<td class="px-4 py-3 text-right font-mono text-text-muted">
											{Math.round(assessment.initialScore)}%
										</td>
										<td class="px-4 py-3 text-right font-mono font-bold {confidenceColor(assessment.currentScore)}">
											{Math.round(assessment.currentScore)}%
										</td>
										<td class="px-4 py-3 text-right font-mono font-bold {deltaClass(assessment.delta)}">
											{#if assessment.totalRuns > 1}
												{deltaPrefix(assessment.delta)}{assessment.delta}
											{:else}
												<span class="text-text-muted">---</span>
											{/if}
										</td>
										<td class="px-4 py-3 text-right font-mono">
											<span class="font-bold">{assessment.totalRuns}</span>
											{#if assessment.totalRuns > 1}
												<span class="text-text-muted text-xs ml-0.5">({assessment.totalRuns - 1} refinement{assessment.totalRuns - 1 !== 1 ? 's' : ''})</span>
											{/if}
										</td>
										<td class="px-6 py-3 text-right font-mono text-xs text-text-muted whitespace-nowrap">
											{formatDateTime(assessment.lastEstimate)}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</Card>
			</div>
		{/if}

		<!-- Confidence Radar Profiles -->
		{#if data.radarData && data.radarData.length > 0}
			<div class="mt-6">
				<Card>
					<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4">Confidence Score Breakdown</h2>
					<p class="text-xs text-text-muted mb-6">
						Radar profiles from challenge reviews showing 5 quality dimensions per assessment.
					</p>
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{#each data.radarData as radar}
							<div class="text-center">
								<h3 class="text-xs font-bold mb-2 truncate" title={radar.project_name}>
									{radar.project_name}
								</h3>
								<RadarChart
									dimensions={radar.dimensions.map((d) => ({ ...d, maxValue: 100 }))}
									size={200}
								/>
								<p class="text-xs font-mono font-bold mt-1
									{radar.confidence >= 70 ? 'text-success' : radar.confidence >= 40 ? 'text-warning' : 'text-danger'}">
									{Math.round(radar.confidence)}%
								</p>
							</div>
						{/each}
					</div>
				</Card>
			</div>
		{/if}
	{/if}
</div>
