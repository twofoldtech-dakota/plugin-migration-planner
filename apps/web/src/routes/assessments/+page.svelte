<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
	import Tooltip from '$lib/components/ui/Tooltip.svelte';
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
			discoveryComplete ? 'complete' : hasDiscovery ? 'in-progress' : 'not-started',
			hasAnalysis ? 'complete' : (discoveryComplete ? 'in-progress' : 'not-started'),
			hasEstimate ? 'complete' : (hasAnalysis ? 'in-progress' : 'not-started'),
			isComplete ? 'complete' : (hasEstimate ? 'in-progress' : 'not-started'),
			isComplete ? 'complete' : 'not-started',
		];
	}

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

	// ── Portfolio stats ───────────────────────────────────────
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

		return { total, totalHours, avgConfidence, byStatus, withEstimates: withEstimates.length };
	});

	// ── Search state ──────────────────────────────────────────
	let search = $state('');
	let searchEl: HTMLInputElement | undefined = $state();

	let filtered = $derived(
		search.trim()
			? data.projects.filter((p) => {
					const q = search.toLowerCase();
					return p.project_name.toLowerCase().includes(q) ||
						(p.client_name && p.client_name.toLowerCase().includes(q));
				})
			: data.projects
	);

	function handleGlobalKeydown(e: KeyboardEvent) {
		if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
			e.preventDefault();
			searchEl?.focus();
		}
	}
</script>

<svelte:window onkeydown={handleGlobalKeydown} />

<svelte:head>
	<title>Assessments | MigrateIQ</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-6 py-8 animate-enter">
	{#if data.projects.length === 0}
		<EmptyState />
	{:else}
		<!-- ── Header ────────────────────────────────────────────── -->
		<div class="mb-8">
			<div class="flex items-center gap-2">
				<h1 class="text-2xl font-extrabold uppercase tracking-wider">Assessments</h1>
				<a
					href="/new"
					class="ml-auto brutal-border-thin px-4 py-2 text-xs font-bold uppercase tracking-wider bg-primary text-white border-primary hover:bg-primary-hover transition-colors no-underline"
				>
					+ New Assessment
				</a>
			</div>
			<p class="mt-1 text-sm font-bold text-text-secondary">
				{portfolio.total} assessment{portfolio.total === 1 ? '' : 's'}
				{#if portfolio.withEstimates > 0}
					&middot; {formatHours(portfolio.totalHours)} total hours
					&middot; {Math.round(portfolio.avgConfidence)}% avg confidence
				{/if}
			</p>
		</div>

		<!-- ── Status filter chips ───────────────────────────────── -->
		{#if Object.keys(portfolio.byStatus).length > 1}
			<div class="flex flex-wrap gap-2 mb-6">
				{#each Object.entries(portfolio.byStatus).sort(([a], [b]) => (statusOrder[a] ?? 0) - (statusOrder[b] ?? 0)) as [status, count]}
					<Badge variant={statusVariant[status] ?? 'default'}>{count} {status}</Badge>
				{/each}
			</div>
		{/if}

		<!-- ── Search bar ───────────────────────────────────────── -->
		<div class="mb-6 relative">
			<input
				bind:this={searchEl}
				type="text"
				bind:value={search}
				placeholder="Search assessments..."
				class="w-full max-w-md brutal-border-thin px-4 py-2.5 text-sm font-mono bg-surface
					focus:outline-2 focus:outline-primary placeholder:text-text-muted pr-12"
			/>
			<span class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-text-muted brutal-border-thin px-1.5 py-0.5 bg-bg pointer-events-none"
				style="max-width: fit-content;"
			>/</span>
		</div>

		<!-- ── Assessment cards ───────────────────────────────── -->
		{#if filtered.length === 0}
			<div class="py-12 text-center">
				<p class="text-sm font-bold text-text-muted">No assessments match "{search}"</p>
				<button
					onclick={() => (search = '')}
					class="mt-2 text-xs font-bold text-primary hover:text-primary-hover"
				>
					Clear search
				</button>
			</div>
		{:else}
			<div class="grid gap-5 lg:grid-cols-2 stagger-grid">
				{#each filtered as project, i}
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
											<span class="text-sm font-mono text-text-muted">---</span>
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
											<span class="text-sm font-mono text-text-muted">---</span>
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
											<span class="text-sm font-mono text-text-muted">---</span>
										{/if}
									</div>
								</div>

								<!-- Footer -->
								<div class="flex items-center justify-between border-t-2 border-border-light pt-3 text-xs font-mono text-text-muted">
									<div class="flex flex-wrap gap-x-4 gap-y-1">
										{#if (project.source_stack as any)?.platform}
											<span>{(project.source_stack as any).platform}{(project.source_stack as any).platform_version ? ` ${(project.source_stack as any).platform_version}` : ''}</span>
										{:else if project.topology}
											<span>{project.topology}</span>
										{/if}
										{#if (project.source_stack as any)?.infrastructure}
											<span>{(project.source_stack as any).infrastructure} &rarr; {(project.target_stack as any)?.infrastructure ?? '?'}</span>
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
	{/if}
</div>
