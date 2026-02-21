<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
	import Tooltip from '$lib/components/ui/Tooltip.svelte';
	import InfoDrawer from '$lib/components/ui/InfoDrawer.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';

	let { data } = $props();

	// ── Status config ──────────────────────────────────────────
	const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
		planning: 'default',
		discovery: 'info',
		analysis: 'warning',
		estimation: 'default',
		complete: 'success'
	};

	const statusOrder: Record<string, number> = {
		planning: 0,
		discovery: 1,
		analysis: 2,
		estimation: 3,
		complete: 4
	};

	// Workflow steps match the assessment Overview dashboard
	const workflowSteps = ['Discovery', 'Analysis', 'Estimate', 'Refine', 'Deliverables'] as const;

	type StepStatus = 'complete' | 'in-progress' | 'not-started';

	interface ProjectData {
		status: string;
		completeness_pct: number | null;
		confidence_score: number | null;
		total_expected_hours: number | null;
	}

	function getStepStatuses(project: ProjectData): StepStatus[] {
		const hasDiscovery = project.completeness_pct != null && project.completeness_pct > 0;
		const discoveryComplete = project.completeness_pct != null && project.completeness_pct >= 100;
		const hasAnalysis = project.confidence_score != null;
		const hasEstimate = project.total_expected_hours != null;
		const isComplete = project.status === 'complete';

		return [
			// Discovery
			discoveryComplete ? 'complete' : hasDiscovery ? 'in-progress' : 'not-started',
			// Analysis
			hasAnalysis ? 'complete' : (discoveryComplete ? 'in-progress' : 'not-started'),
			// Estimate
			hasEstimate ? 'complete' : (hasAnalysis ? 'in-progress' : 'not-started'),
			// Refine
			isComplete ? 'complete' : (hasEstimate ? 'in-progress' : 'not-started'),
			// Deliverables
			isComplete ? 'complete' : 'not-started',
		];
	}

	// ── Drawer state ──────────────────────────────────────────
	let drawerSection = $state<'page' | 'kpis' | 'assessments' | null>(null);

	// ── Derived portfolio stats ────────────────────────────────
	let portfolio = $derived.by(() => {
		const p = data.projects;
		const total = p.length;
		const withEstimates = p.filter((a) => a.total_expected_hours != null);
		const totalHours = withEstimates.reduce((s, a) => s + (a.total_expected_hours ?? 0), 0);
		const avgConfidence =
			withEstimates.length > 0
				? withEstimates.reduce((s, a) => s + (a.confidence_score ?? 0), 0) /
					withEstimates.length
				: 0;
		const byStatus = p.reduce(
			(acc, a) => {
				acc[a.status] = (acc[a.status] ?? 0) + 1;
				return acc;
			},
			{} as Record<string, number>
		);
		const needsAttention = p.filter(
			(a) =>
				(a.completeness_pct != null && a.completeness_pct < 50) ||
				(a.confidence_score != null && a.confidence_score < 40)
		).length;

		return { total, totalHours, avgConfidence, byStatus, needsAttention, withEstimates: withEstimates.length };
	});

	// ── Helpers ────────────────────────────────────────────────
	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function formatHours(h: number): string {
		if (h >= 1000) return `${(h / 1000).toFixed(1)}k`;
		return Math.round(h).toLocaleString();
	}

	function confidenceVariant(score: number): 'success' | 'warning' | 'danger' {
		if (score >= 70) return 'success';
		if (score >= 40) return 'warning';
		return 'danger';
	}

	function stepBarColor(status: StepStatus): string {
		switch (status) {
			case 'complete': return 'bg-success';
			case 'in-progress': return 'bg-primary';
			default: return 'bg-border-light';
		}
	}
</script>

<svelte:head>
	<title>MigrateIQ</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-6 py-8 animate-enter">
	{#if data.projects.length === 0}
		<EmptyState />
	{:else}
		<!-- ── Overview header ────────────────────────────────── -->
		<div class="mb-8">
			<div class="flex items-center gap-2">
				<h1 class="text-2xl font-extrabold uppercase tracking-wider">Command Center</h1>
				<button onclick={() => drawerSection = 'page'} class="flex items-center justify-center w-5 h-5 text-text-muted hover:text-primary transition-colors" aria-label="About this page">
					<span class="text-[10px] font-mono opacity-60">(i)</span>
				</button>
				<a
					href="/new"
					class="ml-auto brutal-border-thin px-4 py-2 text-xs font-bold uppercase tracking-wider bg-primary text-white border-primary hover:bg-primary-hover transition-colors no-underline"
				>
					+ New Assessment
				</a>
			</div>
			<p class="mt-1 text-sm font-bold text-text-secondary">
				{portfolio.total} assessment{portfolio.total === 1 ? '' : 's'} across all projects
			</p>
		</div>

		<!-- ── KPI cards ─────────────────────────────────────── -->
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8 stagger-grid">
			<!-- Total assessments -->
			<div style="--stagger-i: 0;"><Card>
				<div class="space-y-3">
					<div class="flex items-start justify-between">
						<div>
							<Tooltip text="Total migration assessments grouped by workflow status." position="bottom">
								<span class="text-xs font-bold uppercase tracking-wider text-text-muted cursor-help">Assessments</span>
							</Tooltip>
							<p class="text-3xl font-extrabold font-mono mt-1">{portfolio.total}</p>
						</div>
						<div class="flex h-10 w-10 items-center justify-center brutal-border-thin bg-primary-light text-lg">
							&#9776;
						</div>
					</div>
					{#if Object.keys(portfolio.byStatus).length > 1}
						<div class="flex flex-wrap gap-2">
							{#each Object.entries(portfolio.byStatus).sort(([a], [b]) => (statusOrder[a] ?? 0) - (statusOrder[b] ?? 0)) as [status, count]}
								<Badge variant={statusVariant[status] ?? 'default'}>{count} {status}</Badge>
							{/each}
						</div>
					{/if}
				</div>
			</Card></div>

			<!-- Total estimated hours -->
			<div style="--stagger-i: 1;"><Card>
				<div class="space-y-3">
					<div class="flex items-start justify-between">
						<div>
							<Tooltip text="Sum of expected hours across all projects with estimates." position="bottom">
								<span class="text-xs font-bold uppercase tracking-wider text-text-muted cursor-help">Total Hours</span>
							</Tooltip>
							<p class="text-3xl font-extrabold font-mono mt-1">
								{portfolio.totalHours > 0 ? formatHours(portfolio.totalHours) : '—'}
							</p>
							<p class="text-xs text-text-secondary mt-0.5">
								{#if portfolio.withEstimates > 0}
									{portfolio.withEstimates} project{portfolio.withEstimates === 1 ? '' : 's'}
								{:else}
									No estimates yet
								{/if}
							</p>
						</div>
						<div class="flex h-10 w-10 items-center justify-center brutal-border-thin bg-warning-light text-lg">
							&#9201;
						</div>
					</div>
				</div>
			</Card></div>

			<!-- Average confidence -->
			<div style="--stagger-i: 2;"><Card>
				<div class="space-y-3">
					<div class="flex items-start justify-between">
						<div>
							<Tooltip text="Average confidence score. Higher = fewer unvalidated assumptions." position="bottom">
								<span class="text-xs font-bold uppercase tracking-wider text-text-muted cursor-help">Avg Confidence</span>
							</Tooltip>
							<p class="text-3xl font-extrabold font-mono mt-1">
								{portfolio.avgConfidence > 0 ? `${Math.round(portfolio.avgConfidence)}%` : '—'}
							</p>
							{#if portfolio.avgConfidence > 0}
								<p class="text-xs text-text-secondary mt-0.5">
									{portfolio.withEstimates} project{portfolio.withEstimates === 1 ? '' : 's'}
								</p>
							{:else}
								<p class="text-xs text-text-muted mt-0.5">Run analysis to calculate</p>
							{/if}
						</div>
						<div class="flex h-10 w-10 items-center justify-center brutal-border-thin {portfolio.avgConfidence >= 70 ? 'bg-success-light' : portfolio.avgConfidence >= 40 ? 'bg-warning-light' : 'bg-danger-light'} text-lg">
							&#9733;
						</div>
					</div>
					{#if portfolio.avgConfidence > 0}
						<ProgressBar
							value={portfolio.avgConfidence}
							variant={confidenceVariant(portfolio.avgConfidence)}
						/>
					{/if}
				</div>
			</Card></div>

			<!-- Needs attention -->
			<div style="--stagger-i: 3;"><Card>
				<div class="space-y-3">
					<div class="flex items-start justify-between">
						<div>
							<Tooltip text="Projects with discovery below 50% or confidence below 40%." position="bottom">
								<span class="text-xs font-bold uppercase tracking-wider text-text-muted cursor-help">Needs Attention</span>
							</Tooltip>
							<p class="text-3xl font-extrabold font-mono mt-1">
								{portfolio.needsAttention}
							</p>
							<p class="text-xs text-text-secondary mt-0.5">
								{#if portfolio.needsAttention > 0}
									Low discovery or confidence
								{:else}
									All projects on track
								{/if}
							</p>
						</div>
						<div class="flex h-10 w-10 items-center justify-center brutal-border-thin {portfolio.needsAttention > 0 ? 'bg-danger-light' : 'bg-success-light'} text-lg">
							{#if portfolio.needsAttention > 0}!{:else}{@html '&#10003;'}{/if}
						</div>
					</div>
				</div>
			</Card></div>
		</div>

		<!-- ── Assessment cards ───────────────────────────────── -->
		<div class="flex items-center gap-2 mb-4">
			<button class="flex items-center gap-1.5 text-lg font-extrabold uppercase tracking-wider text-primary cursor-pointer hover:opacity-80 transition-opacity" onclick={() => drawerSection = 'assessments'}>
				Assessments
				<span class="text-[10px] font-mono opacity-60">(i)</span>
			</button>
		</div>

		<div class="grid gap-5 lg:grid-cols-2 stagger-grid">
			{#each data.projects as project, i}
				{@const steps = getStepStatuses(project)}
				<a href="/assessments/{project.id}" class="no-underline group" style="--stagger-i: {i};">
					<Card hover>
						<div class="flex flex-col gap-4">
							<!-- Header row -->
							<div class="flex items-start justify-between gap-3">
								<div class="min-w-0 flex-1">
									<h3 class="font-extrabold text-text text-lg truncate group-hover:text-primary transition-colors">
										{project.project_name}
									</h3>
									{#if project.client_name}
										<p class="text-sm text-text-secondary truncate">{project.client_name}</p>
									{/if}
								</div>
								<Badge variant={statusVariant[project.status] ?? 'default'}>
									{project.status}
								</Badge>
							</div>

							<!-- Workflow steps -->
							<div class="flex items-center gap-0.5">
								{#each workflowSteps as step, i}
									<div class="flex-1 flex flex-col items-center gap-1">
										<div class="w-full h-1.5 rounded-sm {stepBarColor(steps[i])}"></div>
										<span class="text-[9px] font-bold uppercase tracking-wider {steps[i] !== 'not-started' ? 'text-text' : 'text-text-muted'}">
											{step}
										</span>
									</div>
									{#if i < workflowSteps.length - 1}
										<div class="w-1"></div>
									{/if}
								{/each}
							</div>

							<!-- Stats row -->
							<div class="grid grid-cols-3 gap-3">
								<!-- Discovery -->
								<div class="flex flex-col gap-1.5">
									<Tooltip text="Percentage of discovery dimensions completed or partially answered." position="bottom">
										<span class="text-[10px] font-bold uppercase tracking-wider text-text-muted cursor-help">Discovery</span>
									</Tooltip>
									{#if project.completeness_pct != null}
									{@const disc = Math.min(100, Math.round(project.completeness_pct))}
										<span class="text-sm font-extrabold font-mono">{disc}%</span>
										<ProgressBar
											value={disc}
											variant={disc >= 80 ? 'success' : disc >= 50 ? 'warning' : 'danger'}
										/>
									{:else}
										<span class="text-sm font-mono text-text-muted">—</span>
									{/if}
								</div>

								<!-- Confidence -->
								<div class="flex flex-col gap-1.5">
									<Tooltip text="Estimate confidence. Validate assumptions to increase this score." position="bottom">
										<span class="text-[10px] font-bold uppercase tracking-wider text-text-muted cursor-help">Confidence</span>
									</Tooltip>
									{#if project.confidence_score != null}
										<span class="text-sm font-extrabold font-mono">{Math.round(project.confidence_score)}%</span>
										<ProgressBar
											value={project.confidence_score}
											variant={confidenceVariant(project.confidence_score)}
										/>
									{:else}
										<span class="text-sm font-mono text-text-muted">—</span>
									{/if}
								</div>

								<!-- Hours -->
								<div class="flex flex-col gap-1.5">
									<Tooltip text="Total expected hours including base effort, gotcha patterns, and complexity multipliers." position="bottom">
										<span class="text-[10px] font-bold uppercase tracking-wider text-text-muted cursor-help">Est. Hours</span>
									</Tooltip>
									{#if project.total_expected_hours != null}
										<span class="text-sm font-extrabold font-mono">{formatHours(project.total_expected_hours)}</span>
										{#if project.total_assumptions != null}
											<span class="text-[10px] text-text-muted">
												{project.validated_assumptions ?? 0}/{project.total_assumptions} assumptions validated
											</span>
										{/if}
									{:else}
										<span class="text-sm font-mono text-text-muted">—</span>
									{/if}
								</div>
							</div>

							<!-- Footer -->
							<div class="flex items-center justify-between border-t-2 border-border-light pt-3 text-xs font-mono text-text-muted">
								<div class="flex flex-wrap gap-x-4 gap-y-1">
									{#if project.topology}
										<span>{project.topology}</span>
									{/if}
								</div>
								<span>Updated {formatDate(project.created_at)}</span>
							</div>
						</div>
					</Card>
				</a>
			{/each}
		</div>
	{/if}
</div>

<!-- ── Info Drawer ──────────────────────────────────────────── -->
<InfoDrawer
	open={drawerSection !== null}
	onclose={() => drawerSection = null}
	title={
		drawerSection === 'page' ? 'About Command Center'
		: drawerSection === 'kpis' ? 'Command Center KPIs'
		: drawerSection === 'assessments' ? 'Assessments'
		: ''
	}
>
	{#if drawerSection === 'page'}
		<div class="space-y-4 text-sm">
			<p>The <strong>Command Center</strong> is your top-level view of all Sitecore migration assessments — a single place to monitor progress, compare projects, and spot issues early.</p>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">KPI Cards</h3>
				<ul class="list-disc list-inside space-y-1 text-text-secondary">
					<li><strong>Assessments</strong> — Total projects in the portfolio, broken down by workflow status</li>
					<li><strong>Total Hours</strong> — Aggregate estimated hours across all projects with estimates</li>
					<li><strong>Avg Confidence</strong> — Mean confidence score, weighted across estimated projects</li>
					<li><strong>Needs Attention</strong> — Projects flagged for low discovery (&lt;50%) or low confidence (&lt;40%)</li>
				</ul>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Assessment Cards</h3>
				<p class="text-text-secondary">Each card shows a project's current workflow position, discovery progress, confidence score, and estimated hours. Click any card to open its Overview.</p>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Workflow</h3>
				<p class="text-text-secondary">The progress bar on each card tracks the 5-step workflow: Planning &rarr; Discovery &rarr; Analysis &rarr; Estimation &rarr; Complete. Green bars indicate completed steps, purple indicates the current step.</p>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Getting Started</h3>
				<p class="text-text-secondary">Create assessments by running <code class="brutal-border-thin bg-surface px-1.5 py-0.5 text-xs font-mono">/migrate-new</code> in Claude Code. Each assessment progresses through discovery, analysis, estimation, and refinement before generating deliverables.</p>
			</div>
		</div>
	{:else if drawerSection === 'assessments'}
		<div class="space-y-4 text-sm">
			<p><strong>Assessments</strong> are individual Sitecore migration projects being evaluated for effort, risk, and complexity.</p>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Card Layout</h3>
				<ul class="list-disc list-inside space-y-1 text-text-secondary">
					<li><strong>Header</strong> — Project name, client, and current workflow status badge</li>
					<li><strong>Progress bar</strong> — Visual workflow position across the 5 migration steps</li>
					<li><strong>Stats row</strong> — Discovery completeness, confidence score, and estimated hours at a glance</li>
					<li><strong>Footer</strong> — Topology type and last updated timestamp</li>
				</ul>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Status Badges</h3>
				<div class="space-y-1 text-text-secondary">
					<p><strong class="text-primary">Planning</strong> — Assessment created, discovery not yet started</p>
					<p><strong class="text-info">Discovery</strong> — Actively gathering infrastructure and environment details</p>
					<p><strong class="text-warning">Analysis</strong> — Identifying risks, assumptions, and complexity</p>
					<p><strong class="text-text">Estimation</strong> — Calculating hours by phase and component</p>
					<p><strong class="text-success">Complete</strong> — All steps finished, deliverables generated</p>
				</div>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Stats Explained</h3>
				<ul class="list-disc list-inside space-y-1 text-text-secondary">
					<li><strong>Discovery %</strong> — How many discovery dimensions have been completed or partially answered</li>
					<li><strong>Confidence %</strong> — How much of the estimate is based on confirmed facts vs. assumptions. Validate assumptions to increase.</li>
					<li><strong>Est. Hours</strong> — Total expected hours including base effort, gotcha patterns, and complexity multipliers</li>
				</ul>
			</div>
		</div>
	{/if}
</InfoDrawer>
