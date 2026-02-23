<script lang="ts">
	import KpiCard from '$lib/components/ui/KpiCard.svelte';

	let { data } = $props();
	const k = $derived(data.kpis);
</script>

<svelte:head>
	<title>Analytics | MigrateIQ</title>
</svelte:head>

<div>
	<p class="text-sm text-text-muted mb-6">
		Cross-portfolio metrics and operational insights.
	</p>

	<!-- KPI Grid -->
	<div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
		<KpiCard
			label="Total Assessments"
			value={k.totalAssessments}
			href="/analytics/portfolio"
		/>
		<KpiCard
			label="Total Estimated Hours"
			value={k.totalHours.toLocaleString() + 'h'}
			href="/analytics/estimates"
		/>
		<KpiCard
			label="Avg Confidence"
			value={k.avgConfidence + '%'}
			variant={k.avgConfidence >= 70 ? 'success' : k.avgConfidence >= 40 ? 'warning' : 'danger'}
			progress={k.avgConfidence}
			href="/analytics/confidence"
		/>
		<KpiCard
			label="Open Risks"
			value={k.openRisks}
			variant={k.openRisks > 10 ? 'danger' : k.openRisks > 5 ? 'warning' : 'success'}
			href="/analytics/portfolio"
		/>
		<KpiCard
			label="Calibrations"
			value={k.calibrationsCompleted}
			href="/analytics/calibration"
		/>
		<KpiCard
			label="Knowledge Packs"
			value={k.knowledgePacks}
			href="/analytics/knowledge"
		/>
	</div>

	<!-- Quick navigation -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
		<a href="/analytics/portfolio" class="brutal-border bg-surface p-5 no-underline text-text hover:-translate-x-px hover:-translate-y-px hover:shadow-lg transition-all duration-150 block">
			<h3 class="text-sm font-extrabold uppercase tracking-wider mb-1">Portfolio Intelligence</h3>
			<p class="text-xs text-text-muted">Assessment pipeline, risk matrix, hours by project</p>
		</a>
		<a href="/analytics/estimates" class="brutal-border bg-surface p-5 no-underline text-text hover:-translate-x-px hover:-translate-y-px hover:shadow-lg transition-all duration-150 block">
			<h3 class="text-sm font-extrabold uppercase tracking-wider mb-1">Estimation Accuracy</h3>
			<p class="text-xs text-text-muted">Hours buildup, role breakdown, multiplier impact</p>
		</a>
		<a href="/analytics/confidence" class="brutal-border bg-surface p-5 no-underline text-text hover:-translate-x-px hover:-translate-y-px hover:shadow-lg transition-all duration-150 block">
			<h3 class="text-sm font-extrabold uppercase tracking-wider mb-1">Confidence Trends</h3>
			<p class="text-xs text-text-muted">Score timeline, per-assessment breakdown, radar profiles</p>
		</a>
		<a href="/analytics/calibration" class="brutal-border bg-surface p-5 no-underline text-text hover:-translate-x-px hover:-translate-y-px hover:shadow-lg transition-all duration-150 block">
			<h3 class="text-sm font-extrabold uppercase tracking-wider mb-1">Calibration</h3>
			<p class="text-xs text-text-muted">Estimated vs actual hours, variance analysis, AI tool performance</p>
		</a>
		<a href="/analytics/knowledge" class="brutal-border bg-surface p-5 no-underline text-text hover:-translate-x-px hover:-translate-y-px hover:shadow-lg transition-all duration-150 block">
			<h3 class="text-sm font-extrabold uppercase tracking-wider mb-1">Knowledge Health</h3>
			<p class="text-xs text-text-muted">Pack completeness, source URL health, confidence levels</p>
		</a>
		<a href="/analytics/usage" class="brutal-border bg-surface p-5 no-underline text-text hover:-translate-x-px hover:-translate-y-px hover:shadow-lg transition-all duration-150 block">
			<h3 class="text-sm font-extrabold uppercase tracking-wider mb-1">Usage Analytics</h3>
			<p class="text-xs text-text-muted">Page views, sessions, feature engagement</p>
		</a>
	</div>
</div>
