<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
	import Tooltip from '$lib/components/ui/Tooltip.svelte';
	import ConfidenceSparkline from '$lib/components/ConfidenceSparkline.svelte';

	let { data } = $props();

	// ── Status helpers ──────────────────────────────────────────
	const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
		planning: 'default',
		discovery: 'info',
		analysis: 'warning',
		estimation: 'default',
		complete: 'success'
	};

	const workflowSteps = ['Discovery', 'Analysis', 'Estimate', 'Refine', 'Deliverables'] as const;

	type StepStatus = 'complete' | 'in-progress' | 'not-started';

	function getStepStatuses(project: typeof data.topProjects[0]): StepStatus[] {
		const hasDiscovery = project.discovery != null && project.discovery > 0;
		const discoveryComplete = project.discovery != null && project.discovery >= 100;
		const hasAnalysis = project.confidence != null;
		const hasEstimate = project.hours != null;
		const isComplete = project.status === 'complete';

		return [
			discoveryComplete ? 'complete' : hasDiscovery ? 'in-progress' : 'not-started',
			hasAnalysis ? 'complete' : (discoveryComplete ? 'in-progress' : 'not-started'),
			hasEstimate ? 'complete' : (hasAnalysis ? 'in-progress' : 'not-started'),
			isComplete ? 'complete' : (hasEstimate ? 'in-progress' : 'not-started'),
			isComplete ? 'complete' : 'not-started',
		];
	}

	function stepBarColor(status: StepStatus): string {
		switch (status) {
			case 'complete': return 'bg-success';
			case 'in-progress': return 'bg-primary';
			default: return 'bg-border-light';
		}
	}

	// ── Formatters ──────────────────────────────────────────────
	function formatHours(h: number): string {
		if (h >= 1000) return `${(h / 1000).toFixed(1)}k`;
		return Math.round(h).toLocaleString();
	}

	function confidenceVariant(score: number): 'success' | 'warning' | 'danger' {
		if (score >= 70) return 'success';
		if (score >= 40) return 'warning';
		return 'danger';
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric'
		});
	}

	// ── Pipeline calculations ───────────────────────────────────
	const pipelineStages = $derived([
		{ key: 'planning', label: 'Planning', count: data.pipeline.planning, color: 'bg-text-muted' },
		{ key: 'discovery', label: 'Discovery', count: data.pipeline.discovery, color: 'bg-info' },
		{ key: 'analysis', label: 'Analysis', count: data.pipeline.analysis, color: 'bg-warning' },
		{ key: 'estimation', label: 'Estimation', count: data.pipeline.estimation, color: 'bg-primary' },
		{ key: 'complete', label: 'Complete', count: data.pipeline.complete, color: 'bg-success' },
	]);
	const pipelineMax = $derived(Math.max(...pipelineStages.map(s => s.count), 1));

	// ── Risk distribution ───────────────────────────────────────
	const riskBars = $derived([
		{ label: 'Critical', count: data.riskSummary.critical, color: 'bg-danger', textColor: 'text-danger' },
		{ label: 'High', count: data.riskSummary.high, color: 'bg-warning', textColor: 'text-warning' },
		{ label: 'Medium', count: data.riskSummary.medium, color: 'bg-primary', textColor: 'text-primary' },
		{ label: 'Low', count: data.riskSummary.low, color: 'bg-success', textColor: 'text-success' },
	]);
	const riskMax = $derived(Math.max(...riskBars.map(r => r.count), 1));

	// ── Assumption health ───────────────────────────────────────
	const assumptionPct = $derived(
		data.assumptionSummary.total > 0
			? Math.round((data.assumptionSummary.validated / data.assumptionSummary.total) * 100)
			: 0
	);
</script>

<svelte:head>
	<title>Command Center | MigrateIQ</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-6 pt-8 pb-8 lg:pb-0 animate-enter">
	{#if data.portfolio.total === 0 && data.knowledgeHealth.totalPacks === 0 && data.clients.total === 0}
		<!-- ── Empty state ──────────────────────────────────────── -->
		<div class="mx-auto max-w-lg py-16 text-center">
			<Card>
				<div class="flex flex-col items-center gap-4 py-4">
					<div class="flex h-16 w-16 items-center justify-center brutal-border bg-primary-light text-3xl text-primary shadow-sm">
						&#9733;
					</div>
					<h2 class="text-xl font-extrabold uppercase tracking-wider">Welcome to MigrateIQ</h2>
					<p class="text-text-secondary text-sm leading-relaxed max-w-sm">
						Your migration intelligence platform is ready. Start by creating your first assessment or building knowledge packs.
					</p>
					<a
						href="/new"
						class="brutal-border-thin px-6 py-3 text-sm font-bold uppercase tracking-wider bg-primary text-white border-primary hover:bg-primary-hover transition-colors no-underline"
					>
						Start Your First Assessment
					</a>
				</div>
			</Card>
		</div>
	{:else}
		<!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
		<!-- HERO STATS BAR                                          -->
		<!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
		<div class="hero-surface brutal-border shadow-lg p-6 mb-8">
			<div class="flex items-center justify-between mb-5">
				<div>
					<h1 class="text-2xl font-extrabold uppercase tracking-wider text-white">Command Center</h1>
					<p class="text-sm font-bold text-white/60 mt-0.5">Portfolio intelligence at a glance</p>
				</div>
				<a
					href="/new"
					class="brutal-border-thin px-4 py-2 text-xs font-bold uppercase tracking-wider bg-primary text-white border-primary hover:bg-primary-hover transition-colors no-underline"
				>
					+ New Assessment
				</a>
			</div>

			<!-- Row 1 — Portfolio Metrics -->
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
				<!-- Assessments -->
				<a href="/assessments" class="no-underline group">
					<div class="border-2 border-white/20 p-3 hover:border-primary transition-colors">
						<span class="text-[10px] font-bold uppercase tracking-wider text-white/50">Assessments</span>
						<p class="text-2xl font-extrabold font-mono text-white mt-0.5 group-hover:text-primary transition-colors">{data.portfolio.total}</p>
					</div>
				</a>

				<!-- Total Hours -->
				<div class="border-2 border-white/20 p-3">
					<span class="text-[10px] font-bold uppercase tracking-wider text-white/50">Total Hours</span>
					<p class="text-2xl font-extrabold font-mono text-white mt-0.5">
						{data.portfolio.totalHours > 0 ? formatHours(data.portfolio.totalHours) : '---'}
					</p>
				</div>

				<!-- Avg Confidence -->
				<a href="/analytics/confidence" class="no-underline group">
					<div class="border-2 border-white/20 p-3 hover:border-primary transition-colors">
						<div class="flex items-center justify-between">
							<span class="text-[10px] font-bold uppercase tracking-wider text-white/50">Avg Confidence</span>
							{#if data.confidenceTrend.length >= 2}
								{@const last = data.confidenceTrend[data.confidenceTrend.length - 1].avg}
								{@const first = data.confidenceTrend[0].avg}
								{@const delta = last - first}
								{#if Math.abs(delta) > 1}
									<span class="text-[9px] font-bold font-mono {delta > 0 ? 'text-success' : 'text-danger'}">
										{delta > 0 ? '+' : ''}{delta.toFixed(0)}
									</span>
								{/if}
							{/if}
						</div>
						<p class="text-2xl font-extrabold font-mono mt-0.5 {data.portfolio.avgConfidence >= 70 ? 'text-success' : data.portfolio.avgConfidence >= 40 ? 'text-warning' : data.portfolio.avgConfidence > 0 ? 'text-danger' : 'text-white'} group-hover:text-primary transition-colors">
							{data.portfolio.avgConfidence > 0 ? `${Math.round(data.portfolio.avgConfidence)}%` : '---'}
						</p>
						{#if data.confidenceTrend.length >= 2}
							<div class="mt-1.5 -mb-0.5">
								<ConfidenceSparkline points={data.confidenceTrend} width={120} height={24} />
							</div>
						{/if}
					</div>
				</a>

				<!-- Needs Attention -->
				<div class="border-2 {data.portfolio.needsAttention > 0 ? 'border-danger/60 bg-danger/10' : 'border-white/20'} p-3">
					<span class="text-[10px] font-bold uppercase tracking-wider text-white/50">Attention</span>
					<p class="text-2xl font-extrabold font-mono mt-0.5 {data.portfolio.needsAttention > 0 ? 'text-danger' : 'text-success'}">
						{data.portfolio.needsAttention}
					</p>
				</div>
			</div>

			<!-- Row 2 — Knowledge Health -->
			<div class="border-t border-white/10 mt-5 pt-4">
				<div class="flex items-center gap-5 flex-wrap sm:flex-nowrap">
					<!-- Pack & path counts -->
					<div class="flex items-baseline gap-2 shrink-0">
						<span class="text-base font-extrabold font-mono text-white">{data.knowledgeHealth.totalPacks}</span>
						<span class="text-xs text-white/50">packs</span>
						<span class="text-white/30 mx-0.5">&middot;</span>
						<span class="text-base font-extrabold font-mono text-white">{data.knowledgeHealth.totalPaths}</span>
						<span class="text-xs text-white/50">paths</span>
					</div>

					<!-- Verified / Draft badges -->
					<div class="flex items-center gap-2 shrink-0">
						<span class="inline-flex items-center gap-1 text-[10px] font-bold font-mono text-success">
							<span class="inline-block w-1.5 h-1.5 rounded-full bg-success"></span>
							{data.knowledgeHealth.verified} verified
						</span>
						{#if data.knowledgeHealth.draft > 0}
							<span class="inline-flex items-center gap-1 text-[10px] font-bold font-mono text-white/40">
								<span class="inline-block w-1.5 h-1.5 rounded-full bg-white/30"></span>
								{data.knowledgeHealth.draft} draft
							</span>
						{/if}
					</div>

					<!-- Spacer + categories + link -->
					<div class="flex items-center gap-3 ml-auto">
						{#if data.knowledgeHealth.categories.length > 0}
							<div class="hidden md:flex flex-wrap gap-1">
								{#each data.knowledgeHealth.categories as cat}
									<span class="text-[9px] font-bold font-mono uppercase px-1.5 py-0.5 border border-white/20 text-white/60">{cat}</span>
								{/each}
							</div>
						{/if}
						<a href="/knowledge" class="text-[10px] font-bold text-primary hover:text-primary-hover no-underline whitespace-nowrap">
							View all &rarr;
						</a>
					</div>
				</div>
			</div>
		</div>

		<!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
		<!-- SIDEBAR + MAIN CONTENT                                  -->
		<!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
		<div class="flex gap-6 items-start min-h-[calc(100vh-59px)]">

			<!-- ── SIDEBAR ─────────────────────────────────────────── -->
			<aside class="hidden lg:block w-64 shrink-0 sticky top-[59px] self-start max-h-[calc(100vh-59px)] overflow-y-auto stagger-grid" style="--stagger-i: 0;">
				<div class="space-y-5 pt-2 pb-8 pr-1">
				<!-- Quick Actions -->
				<div class="brutal-border bg-surface shadow-md p-4">
					<h2 class="text-[10px] font-extrabold uppercase tracking-widest text-text-muted mb-3 pb-2 border-b-2 border-border-light">Quick Actions</h2>
					<div class="space-y-1.5">
						<a href="/new" class="no-underline group flex items-center gap-2.5 px-2.5 py-2 border-2 border-transparent hover:border-primary hover:bg-primary-light transition-all">
							<span class="flex h-7 w-7 items-center justify-center bg-primary text-white text-xs font-extrabold shrink-0 border-2 border-brutal">+</span>
							<div class="min-w-0">
								<span class="font-bold text-xs text-text group-hover:text-primary transition-colors block">New Assessment</span>
								<span class="text-[9px] text-text-muted">Start a migration</span>
							</div>
						</a>
						<a href="/assessments" class="no-underline group flex items-center gap-2.5 px-2.5 py-2 border-2 border-transparent hover:border-primary hover:bg-primary-light transition-all">
							<span class="flex h-7 w-7 items-center justify-center bg-brutal text-white text-xs font-extrabold shrink-0 border-2 border-brutal">&#9776;</span>
							<div class="min-w-0">
								<span class="font-bold text-xs text-text group-hover:text-primary transition-colors block">All Assessments</span>
								<span class="text-[9px] text-text-muted">{data.portfolio.total} project{data.portfolio.total !== 1 ? 's' : ''}</span>
							</div>
						</a>
						<a href="/clients" class="no-underline group flex items-center gap-2.5 px-2.5 py-2 border-2 border-transparent hover:border-info hover:bg-info-light transition-all">
							<span class="flex h-7 w-7 items-center justify-center bg-info text-white text-xs font-extrabold shrink-0 border-2 border-brutal">&#9812;</span>
							<div class="min-w-0">
								<span class="font-bold text-xs text-text group-hover:text-info transition-colors block">Clients</span>
								<span class="text-[9px] text-text-muted">{data.clients.total} client{data.clients.total !== 1 ? 's' : ''}</span>
							</div>
						</a>
						<a href="/knowledge" class="no-underline group flex items-center gap-2.5 px-2.5 py-2 border-2 border-transparent hover:border-warning hover:bg-warning-light transition-all">
							<span class="flex h-7 w-7 items-center justify-center bg-warning text-white text-xs font-extrabold shrink-0 border-2 border-brutal">&#9881;</span>
							<div class="min-w-0">
								<span class="font-bold text-xs text-text group-hover:text-warning transition-colors block">Knowledge</span>
								<span class="text-[9px] text-text-muted">{data.knowledgeHealth.totalPacks} packs</span>
							</div>
						</a>
					</div>
				</div>

				<!-- Clients snapshot -->
				{#if data.clients.list.length > 0}
					<div class="brutal-border bg-surface shadow-md p-4">
						<div class="flex items-center justify-between mb-3 pb-2 border-b-2 border-border-light">
							<h2 class="text-[10px] font-extrabold uppercase tracking-widest text-text-muted">Clients</h2>
							<a href="/clients" class="text-[10px] font-bold text-primary hover:text-primary-hover no-underline">All &rarr;</a>
						</div>
						<div class="space-y-1.5">
							{#each data.clients.list as client}
								<a href="/clients/{client.id}" class="no-underline group flex items-center gap-2.5 px-2 py-1.5 hover:bg-surface-hover transition-colors">
									<div class="flex h-6 w-6 items-center justify-center bg-primary-light text-[10px] text-primary font-extrabold shrink-0 border border-brutal">
										{client.name.charAt(0).toUpperCase()}
									</div>
									<div class="min-w-0 flex-1">
										<span class="font-bold text-xs text-text block truncate group-hover:text-primary transition-colors">{client.name}</span>
										{#if client.industry}
											<span class="text-[9px] text-text-muted truncate block">{client.industry}</span>
										{/if}
									</div>
								</a>
							{/each}
						</div>
						{#if data.clients.total > 4}
							<p class="text-[10px] text-text-muted text-center mt-2 pt-2 border-t border-border-light">
								+{data.clients.total - 4} more
							</p>
						{/if}
					</div>
				{/if}

				<!-- CLI Shortcuts -->
				<div class="brutal-border bg-surface shadow-md p-4">
					<h2 class="text-[10px] font-extrabold uppercase tracking-widest text-text-muted mb-3 pb-2 border-b-2 border-border-light">CLI Shortcuts</h2>
					<div class="space-y-2">
						<div class="flex items-center gap-2">
							<code class="text-[9px] font-mono bg-bg px-1.5 py-0.5 border border-border-light shrink-0">/migrate-new</code>
							<span class="text-[9px] text-text-muted">Create</span>
						</div>
						<div class="flex items-center gap-2">
							<code class="text-[9px] font-mono bg-bg px-1.5 py-0.5 border border-border-light shrink-0">/migrate-discover</code>
							<span class="text-[9px] text-text-muted">Discover</span>
						</div>
						<div class="flex items-center gap-2">
							<code class="text-[9px] font-mono bg-bg px-1.5 py-0.5 border border-border-light shrink-0">/migrate-analyze</code>
							<span class="text-[9px] text-text-muted">Analyze</span>
						</div>
						<div class="flex items-center gap-2">
							<code class="text-[9px] font-mono bg-bg px-1.5 py-0.5 border border-border-light shrink-0">/migrate-estimate</code>
							<span class="text-[9px] text-text-muted">Estimate</span>
						</div>
						<div class="flex items-center gap-2">
							<code class="text-[9px] font-mono bg-bg px-1.5 py-0.5 border border-border-light shrink-0">/migrate-plan</code>
							<span class="text-[9px] text-text-muted">Deliver</span>
						</div>
					</div>
				</div>
				</div>
			</aside>

			<!-- ── MAIN CONTENT ─────────────────────────────────── -->
			<main class="flex-1 min-w-0 space-y-6">

				<!-- ── WORKFLOW PIPELINE + RISK/ASSUMPTIONS ─────── -->
				<div class="grid md:grid-cols-2 gap-6">
					<!-- Pipeline -->
					<div class="stagger-grid" style="--stagger-i: 1;">
						<Card>
							<div class="flex items-center justify-between mb-4">
								<h2 class="text-sm font-extrabold uppercase tracking-wider">Workflow Pipeline</h2>
								<span class="text-xs font-mono text-text-muted">{data.portfolio.total} total</span>
							</div>
							<div class="space-y-3">
								{#each pipelineStages as stage}
									<div class="flex items-center gap-3">
										<span class="text-xs font-bold uppercase tracking-wider text-text-muted w-20 shrink-0 text-right">{stage.label}</span>
										<div class="flex-1 h-7 bg-border-light border border-brutal relative overflow-hidden">
											<div
												class="h-full {stage.color} transition-all duration-500 flex items-center justify-end pr-2"
												style="width: {stage.count > 0 ? Math.max((stage.count / pipelineMax) * 100, 8) : 0}%"
											>
												{#if stage.count > 0}
													<span class="text-xs font-extrabold font-mono text-white">{stage.count}</span>
												{/if}
											</div>
										</div>
									</div>
								{/each}
							</div>
						</Card>
					</div>

					<!-- Risk & Assumptions -->
					<div class="stagger-grid" style="--stagger-i: 2;">
						<Card>
							<div class="flex items-center justify-between mb-4">
								<h2 class="text-sm font-extrabold uppercase tracking-wider">Risk & Assumptions</h2>
								<span class="text-xs font-mono text-text-muted">{data.riskSummary.total} / {data.assumptionSummary.total}</span>
							</div>

							{#if data.riskSummary.total > 0}
								<div class="mb-5">
									<span class="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-2">Risk by Severity</span>
									<div class="flex gap-1 h-8">
										{#each riskBars as bar}
											{#if bar.count > 0}
												<Tooltip text="{bar.count} {bar.label.toLowerCase()} risk{bar.count !== 1 ? 's' : ''}" position="bottom">
													<div
														class="h-full {bar.color} border border-brutal flex items-center justify-center min-w-[32px] cursor-help transition-all hover:opacity-90"
														style="flex: {bar.count};"
													>
														<span class="text-[10px] font-extrabold font-mono text-white">{bar.count}</span>
													</div>
												</Tooltip>
											{/if}
										{/each}
									</div>
									<div class="flex gap-3 mt-2">
										{#each riskBars as bar}
											<span class="text-[9px] font-mono {bar.textColor}">
												{bar.count} {bar.label}
											</span>
										{/each}
									</div>
								</div>
							{:else}
								<p class="text-sm text-text-muted mb-5">No risks identified yet.</p>
							{/if}

							{#if data.assumptionSummary.total > 0}
								<div>
									<div class="flex items-center justify-between mb-2">
										<span class="text-[10px] font-bold uppercase tracking-wider text-text-muted">Assumption Validation</span>
										<span class="text-xs font-mono font-bold">{assumptionPct}%</span>
									</div>
									<div class="h-5 w-full flex border border-brutal overflow-hidden">
										{#if data.assumptionSummary.validated > 0}
											<Tooltip text="{data.assumptionSummary.validated} validated" position="bottom">
												<div class="h-full bg-success cursor-help" style="width: {(data.assumptionSummary.validated / data.assumptionSummary.total) * 100}%"></div>
											</Tooltip>
										{/if}
										{#if data.assumptionSummary.unvalidated > 0}
											<Tooltip text="{data.assumptionSummary.unvalidated} unvalidated" position="bottom">
												<div class="h-full bg-warning cursor-help" style="width: {(data.assumptionSummary.unvalidated / data.assumptionSummary.total) * 100}%"></div>
											</Tooltip>
										{/if}
										{#if data.assumptionSummary.invalidated > 0}
											<Tooltip text="{data.assumptionSummary.invalidated} invalidated" position="bottom">
												<div class="h-full bg-danger cursor-help" style="width: {(data.assumptionSummary.invalidated / data.assumptionSummary.total) * 100}%"></div>
											</Tooltip>
										{/if}
									</div>
									<div class="flex gap-4 mt-1.5">
										<span class="text-[9px] font-mono text-success">{data.assumptionSummary.validated} Validated</span>
										<span class="text-[9px] font-mono text-warning">{data.assumptionSummary.unvalidated} Unvalidated</span>
										<span class="text-[9px] font-mono text-danger">{data.assumptionSummary.invalidated} Invalidated</span>
									</div>
								</div>
							{:else}
								<p class="text-sm text-text-muted">No assumptions tracked yet.</p>
							{/if}
						</Card>
					</div>
				</div>

				<!-- ── RECENT ASSESSMENTS TABLE ─────────────────── -->
				{#if data.topProjects.length > 0}
					<div class="stagger-grid" style="--stagger-i: 3;">
						<Card padding="p-0">
							<div class="flex items-center justify-between px-6 pt-5 pb-4">
								<h2 class="text-sm font-extrabold uppercase tracking-wider">Recent Assessments</h2>
								{#if data.portfolio.total > 5}
									<a href="/assessments" class="text-xs font-bold text-primary hover:text-primary-hover no-underline">
										View all {data.portfolio.total} &rarr;
									</a>
								{/if}
							</div>
							<div class="overflow-x-auto">
								<table class="w-full text-sm">
									<thead>
										<tr class="bg-brutal text-white text-left">
											<th class="px-6 py-2.5 text-[10px] font-extrabold uppercase tracking-wider">Project</th>
											<th class="px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-wider">Status</th>
											<th class="px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-wider">Workflow</th>
											<th class="px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-right">Discovery</th>
											<th class="px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-right">Confidence</th>
											<th class="px-6 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-right">Hours</th>
										</tr>
									</thead>
									<tbody>
										{#each data.topProjects as project}
											{@const steps = getStepStatuses(project)}
											<tr class="border-b-2 border-border-light hover:bg-surface-hover transition-colors group">
												<td class="px-6 py-3">
													<a href="/assessments/{project.id}" class="no-underline">
														<span class="font-bold text-text group-hover:text-primary transition-colors block">{project.name}</span>
														{#if project.client}
															<span class="text-xs text-text-muted">{project.client}</span>
														{/if}
													</a>
												</td>
												<td class="px-4 py-3">
													<Badge variant={statusVariant[project.status] ?? 'default'}>
														{project.status}
													</Badge>
												</td>
												<td class="px-4 py-3">
													<div class="flex items-center gap-0.5 min-w-[120px]">
														{#each workflowSteps as step, i}
															<Tooltip text="{step}: {steps[i].replace('-', ' ')}" position="bottom">
																<div class="flex-1 h-2 {stepBarColor(steps[i])} cursor-help transition-colors"></div>
															</Tooltip>
															{#if i < workflowSteps.length - 1}
																<div class="w-px"></div>
															{/if}
														{/each}
													</div>
												</td>
												<td class="px-4 py-3 text-right font-mono">
													{#if project.discovery != null}
														{@const d = Math.min(100, Math.round(project.discovery))}
														<span class="font-bold {d >= 80 ? 'text-success' : d >= 50 ? 'text-warning' : 'text-danger'}">{d}%</span>
													{:else}
														<span class="text-text-muted">---</span>
													{/if}
												</td>
												<td class="px-4 py-3 text-right font-mono">
													{#if project.confidence != null}
														<span class="font-bold {confidenceVariant(project.confidence) === 'success' ? 'text-success' : confidenceVariant(project.confidence) === 'warning' ? 'text-warning' : 'text-danger'}">{Math.round(project.confidence)}%</span>
													{:else}
														<span class="text-text-muted">---</span>
													{/if}
												</td>
												<td class="px-6 py-3 text-right font-mono font-bold">
													{#if project.hours != null}
														{formatHours(project.hours)}
													{:else}
														<span class="text-text-muted">---</span>
													{/if}
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						</Card>
					</div>
				{/if}

				</main>
		</div>

		<!-- ── MOBILE QUICK ACTIONS (below lg breakpoint) ──────── -->
		<div class="lg:hidden mt-6 grid sm:grid-cols-2 gap-3">
			<a href="/new" class="no-underline group">
				<Card hover>
					<div class="flex items-center gap-3">
						<span class="flex h-8 w-8 items-center justify-center bg-primary text-white text-sm font-extrabold shrink-0 border-2 border-brutal">+</span>
						<span class="font-bold text-sm text-text group-hover:text-primary transition-colors">New Assessment</span>
					</div>
				</Card>
			</a>
			<a href="/assessments" class="no-underline group">
				<Card hover>
					<div class="flex items-center gap-3">
						<span class="flex h-8 w-8 items-center justify-center bg-brutal text-white text-sm font-extrabold shrink-0 border-2 border-brutal">&#9776;</span>
						<span class="font-bold text-sm text-text group-hover:text-primary transition-colors">All Assessments</span>
					</div>
				</Card>
			</a>
			<a href="/clients" class="no-underline group">
				<Card hover>
					<div class="flex items-center gap-3">
						<span class="flex h-8 w-8 items-center justify-center bg-info text-white text-sm font-extrabold shrink-0 border-2 border-brutal">&#9812;</span>
						<span class="font-bold text-sm text-text group-hover:text-info transition-colors">Clients</span>
					</div>
				</Card>
			</a>
			<a href="/knowledge" class="no-underline group">
				<Card hover>
					<div class="flex items-center gap-3">
						<span class="flex h-8 w-8 items-center justify-center bg-warning text-white text-sm font-extrabold shrink-0 border-2 border-brutal">&#9881;</span>
						<span class="font-bold text-sm text-text group-hover:text-warning transition-colors">Knowledge</span>
					</div>
				</Card>
			</a>
		</div>
	{/if}
</div>
