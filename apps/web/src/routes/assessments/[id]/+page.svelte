<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Tooltip from '$lib/components/ui/Tooltip.svelte';
	import InfoDrawer from '$lib/components/ui/InfoDrawer.svelte';
	import WorkflowProgress from '$lib/components/WorkflowProgress.svelte';
	import ConfidenceGauge from '$lib/components/ConfidenceGauge.svelte';
	import PhaseBarChart from '$lib/components/PhaseBarChart.svelte';
	import RiskSummaryList from '$lib/components/RiskSummaryList.svelte';
	import ConfidenceImprovementPath from '$lib/components/ConfidenceImprovementPath.svelte';
	import { getPhaseHours, computeRefinedTotals, filterPhases } from '$lib/utils/scenario-engine';
	import type { Scenario, ProficiencyData } from '$lib/utils/scenario-engine';

	let { data } = $props();

	const assessment = $derived(data.assessment);
	const estimate = $derived(data.estimate as any);
	const analysis = $derived(data.analysis as any);
	const summary = $derived(data.summary);
	const phases = $derived((estimate?.phases ?? []) as any[]);
	const risks = $derived((analysis?.risks ?? []) as any[]);
	const gaps = $derived(analysis?.gaps as any);
	const assumptions = $derived((analysis?.assumptions ?? []) as any[]);

	let aiToggles = $state<Record<string, boolean>>({});
	let scenario = $state<Scenario>('ai_assisted');
	let drawerSection = $state<'page' | 'confidence' | 'scenarios' | 'phases' | 'risks' | 'attention' | 'assumptions' | null>(null);
	let savingAssumption = $state<string | null>(null);
	let validatedLocally = $state<Record<string, boolean>>({});

	$effect(() => {
		aiToggles = { ...(data.aiSelections?.selections ?? {}) };
	});

	async function validateAssumption(id: string) {
		savingAssumption = id;
		try {
			const res = await fetch(`/api/assessments/${page.params.id}/assumptions/${id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ validation_status: 'validated' })
			});
			if (res.ok) {
				validatedLocally = { ...validatedLocally, [id]: true };
				await invalidateAll();
			}
		} finally {
			savingAssumption = null;
		}
	}

	const profData = $derived(data.proficiencyData as ProficiencyData | undefined);
	const excludedSet = $derived(new Set(
		Object.entries(data.scopeExclusions?.exclusions ?? {}).filter(([, v]) => v).map(([k]) => k)
	));
	const filteredPhases = $derived(filterPhases(phases, excludedSet));
	const scenarioTotals = $derived(computeRefinedTotals(phases, aiToggles, excludedSet, profData));
	const activeTotal = $derived(
		scenario === 'manual' ? scenarioTotals.manual
		: scenario === 'best_case' ? scenarioTotals.bestCase
		: scenarioTotals.aiAssisted
	);

	// Risk clusters sorted by widening hours
	const riskClusters = $derived(
		((analysis?.risk_clusters ?? []) as any[])
			.slice()
			.sort((a: any, b: any) => (b.combined_widening_hours ?? 0) - (a.combined_widening_hours ?? 0))
	);

	// Top unvalidated assumptions sorted by impact
	const topUnknowns = $derived(
		assumptions
			.filter((a: any) => a.validation_status !== 'validated' && !validatedLocally[a.id])
			.slice()
			.sort((a: any, b: any) => (b.pessimistic_widening_hours ?? 0) - (a.pessimistic_widening_hours ?? 0))
	);

	// Count of assumptions validated in this session (not yet reflected in server data)
	const localValidatedCount = $derived(
		Object.keys(validatedLocally).filter(id => !assumptions.find((a: any) => a.id === id && a.validation_status === 'validated')).length
	);
	const adjustedUnvalidated = $derived(Math.max(0, summary.assumptions.unvalidated - localValidatedCount));
	const adjustedValidated = $derived(summary.assumptions.validated + localValidatedCount);

	const maxClusterWidening = $derived(
		riskClusters.length > 0 ? Math.max(...riskClusters.map((c: any) => c.combined_widening_hours ?? 0)) : 0
	);

	const base = $derived(`/assessments/${assessment.id}`);

	const workflowSteps = $derived((() => {
		let activeIdx = 0;
		if (assessment.status === 'complete') activeIdx = 5;
		else if (summary.hasEstimate)          activeIdx = 3;
		else if (summary.hasAnalysis)          activeIdx = 2;
		else if (summary.hasDiscovery)         activeIdx = 1;

		const defs = [
			{ label: 'Discovery',    href: `${base}/discovery`,    detail: `${summary.discovery.discoveryPercent}%` },
			{ label: 'Analysis',     href: `${base}/analysis`,     detail: `${summary.risks.total} risks` },
			{ label: 'Estimate',     href: `${base}/estimate`,     detail: summary.hasEstimate ? `${Math.round(summary.estimateHours)}h` : '' },
			{ label: 'Refine',       href: `${base}/refine`,       detail: excludedSet.size > 0 ? `${excludedSet.size} excluded` : '' },
			{ label: 'Deliverables', href: `${base}/deliverables`, detail: '' },
		];

		return defs.map((d, i) => ({
			...d,
			status: i < activeIdx  ? 'complete' as const
				: i === activeIdx ? 'in-progress' as const
				: 'not-started' as const,
		}));
	})());

	// Scenario config
	const scenarioDefs: Array<{ id: Scenario; label: string; icon: string }> = [
		{ id: 'manual',      label: 'Manual',      icon: '⛏' },
		{ id: 'ai_assisted', label: 'AI-Assisted',  icon: '⚡' },
		{ id: 'best_case',   label: 'Best Case',   icon: '🎯' },
	];

	function hoursFor(id: Scenario): number {
		if (id === 'manual') return scenarioTotals.manual;
		if (id === 'best_case') return scenarioTotals.bestCase;
		return scenarioTotals.aiAssisted;
	}

	// Pre-estimate: next step guidance
	const nextStep = $derived((() => {
		if (!summary.hasDiscovery) return {
			target: 'Discovery', href: `${base}/discovery`, command: '/migrate-discover',
			description: 'Gather project information — topology, integrations, data, and infrastructure.',
		};
		if (!summary.hasAnalysis) return {
			target: 'Analysis', href: `${base}/analysis`, command: '/migrate-analyze',
			description: 'Identify risks, dependencies, and complexity multipliers.',
		};
		return {
			target: 'Estimate', href: `${base}/estimate`, command: '/migrate-estimate',
			description: 'Calculate effort hours across all migration phases.',
		};
	})());
</script>

<svelte:head>
	<title>{assessment.project_name} — Overview</title>
</svelte:head>

<div class="animate-enter">
{#if estimate}
	<!-- ═══════════════════════════════════════════════════════════════
	     POST-ESTIMATE — Full Command Center
	     ═══════════════════════════════════════════════════════════════ -->

	<!-- ── HERO: The Number ──────────────────────────────────────── -->
	<section class="hero-surface border-b-3 border-primary">
		<!-- Main area -->
		<div class="px-8 pt-8 pb-5">
			<div class="flex items-start justify-between gap-8">
				<!-- Left: THE focal point -->
				<div>
					<button
						onclick={() => drawerSection = 'page'}
						class="text-[10px] font-extrabold uppercase tracking-widest text-white/50 hover:text-white/70 transition-colors mb-2 block cursor-pointer"
						aria-label="About this page"
					>
						Total Estimate <span class="font-mono opacity-60">(i)</span>
					</button>
					<div class="flex items-baseline gap-3">
						<span class="text-[clamp(3rem,8vw,4.5rem)] font-extrabold font-mono tracking-tighter leading-none tabular-nums">
							{Math.round(activeTotal).toLocaleString()}
						</span>
						<span class="text-lg font-extrabold text-white/45 uppercase tracking-wider">hours</span>
					</div>
					{#if scenario !== 'manual'}
						{@const savings = scenarioTotals.manual - activeTotal}
						{@const pct = scenarioTotals.manual > 0 ? Math.round((savings / scenarioTotals.manual) * 100) : 0}
						<div class="flex items-center gap-2 mt-2">
							<span class="text-xs font-mono font-bold text-success">
								-{Math.round(savings).toLocaleString()}h ({pct}%)
							</span>
							<span class="text-[10px] text-white/40">vs manual</span>
						</div>
					{/if}
				</div>

				<!-- Right: Migration path + metadata -->
				<div class="shrink-0 text-right hidden sm:block">
					<div class="inline-flex items-center gap-3 px-4 py-2 border-2 border-white/20 bg-white/5">
						<span class="text-xs font-extrabold uppercase tracking-wider">{(assessment.source_stack as any)?.infrastructure || assessment.source_cloud}</span>
						<svg width="20" height="12" viewBox="0 0 20 12" fill="none" aria-hidden="true">
							<path d="M0 6H16M16 6L11 1M16 6L11 11" stroke="currentColor" stroke-width="2" stroke-linecap="square"/>
						</svg>
						<span class="text-xs font-extrabold uppercase tracking-wider">{(assessment.target_stack as any)?.infrastructure || assessment.target_cloud}</span>
					</div>
					<div class="mt-2 space-y-0.5 text-[10px] font-mono text-white/40">
						{#if (assessment.source_stack as any)?.platform}<div>{(assessment.source_stack as any).platform}{(assessment.source_stack as any).platform_version ? ` ${(assessment.source_stack as any).platform_version}` : ''}</div>{/if}
						{#if (assessment.source_stack as any)?.topology}<div>{(assessment.source_stack as any).topology}</div>{/if}
						{#if assessment.target_timeline}<div>Target: {assessment.target_timeline}</div>{/if}
					</div>
				</div>
			</div>
		</div>

		<!-- Scenario toggle bar -->
		<div class="border-t border-white/10 px-8 py-3">
			<div class="flex items-center gap-5">
				<button
					onclick={() => drawerSection = 'scenarios'}
					class="text-[10px] font-extrabold uppercase tracking-widest text-white/45 hover:text-white/70 transition-colors shrink-0 cursor-pointer"
				>
					Scenario <span class="font-mono opacity-60">(i)</span>
				</button>
				<div class="flex gap-1.5" role="radiogroup" aria-label="Estimate scenario">
					{#each scenarioDefs as s}
						{@const active = scenario === s.id}
						{@const hrs = hoursFor(s.id)}
						{@const delta = s.id !== 'manual' && scenarioTotals.manual > 0
							? Math.round(((hrs - scenarioTotals.manual) / scenarioTotals.manual) * 100)
							: 0}
						<button
							onclick={() => scenario = s.id}
							role="radio"
							aria-checked={active}
							class="flex items-center gap-2 px-4 py-2 text-xs font-extrabold uppercase tracking-wider border-2 transition-all cursor-pointer
								{active
									? 'bg-white text-[#1a1a1a] border-white shadow-[2px_2px_0_rgba(255,255,255,0.15)]'
									: 'bg-transparent text-white/60 border-white/20 hover:border-white/40 hover:text-white/80'}"
						>
							<span class="text-sm leading-none">{s.icon}</span>
							<span class="hidden md:inline">{s.label}</span>
							<span class="font-mono text-[11px] {active ? 'text-[#1a1a1a]/60' : 'text-white/40'}">
								{Math.round(hrs).toLocaleString()}h
							</span>
							{#if delta !== 0}
								<span class="text-[10px] font-mono {active ? 'text-[#1a1a1a]/40' : 'text-success/70'}">
									{delta}%
								</span>
							{/if}
						</button>
					{/each}
				</div>
			</div>
		</div>

		<!-- Health signals footer -->
		<div class="border-t border-white/10 px-8 py-2.5 flex items-center gap-5 flex-wrap text-[11px]">
			<a href="{base}/discovery" class="flex items-center gap-1.5 text-white/50 hover:text-white/80 transition-colors no-underline">
				<span class="font-mono font-bold tabular-nums {summary.discovery.discoveryPercent === 100 ? 'text-success' : 'text-white/70'}">
					{summary.discovery.discoveryPercent}%
				</span>
				<span>discovery</span>
			</a>
			<span class="text-white/20" aria-hidden="true">&middot;</span>
			<a href="{base}/analysis?tab=gaps" class="flex items-center gap-1.5 text-white/50 hover:text-white/80 transition-colors no-underline">
				<span class="font-mono font-bold tabular-nums {summary.confidence >= 70 ? 'text-success' : summary.confidence >= 40 ? 'text-warning' : 'text-danger'}">
					{summary.confidence}%
				</span>
				<span>confidence</span>
			</a>
			<span class="text-white/20" aria-hidden="true">&middot;</span>
			<a href="{base}/analysis?tab=risks" class="flex items-center gap-1.5 text-white/50 hover:text-white/80 transition-colors no-underline">
				<span class="font-mono font-bold tabular-nums {summary.risks.critical > 0 ? 'text-danger' : 'text-white/70'}">
					{summary.risks.open}
				</span>
				<span>risks{#if summary.risks.critical > 0}&nbsp;<span class="text-danger">({summary.risks.critical} crit)</span>{/if}</span>
			</a>
			<span class="text-white/20" aria-hidden="true">&middot;</span>
			<a href="{base}/analysis?tab=assumptions" class="flex items-center gap-1.5 text-white/50 hover:text-white/80 transition-colors no-underline">
				<span class="font-mono font-bold tabular-nums {adjustedUnvalidated > 0 ? 'text-warning' : 'text-success'}">
					{adjustedUnvalidated}
				</span>
				<span>open assumptions</span>
			</a>
		</div>
	</section>

	<!-- ── CONTENT AREA ──────────────────────────────────────────── -->
	<div class="p-6 space-y-6">

		<!-- Workflow Progress -->
		<div class="brutal-border bg-surface px-5 py-5">
			<WorkflowProgress steps={workflowSteps} reviews={data.summary?.challengeReviews ?? {}} />
		</div>

		<!-- Phase Breakdown — full width, the main chart -->
		<Card>
			<div class="flex items-center justify-between mb-5 pb-2 border-b-3 border-primary">
				<button
					onclick={() => drawerSection = 'phases'}
					class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-primary cursor-pointer hover:opacity-80 transition-opacity"
				>
					Hours by Phase <span class="text-[10px] font-mono opacity-60">(i)</span>
				</button>
				<span class="text-[10px] font-mono text-text-muted tabular-nums">
					{filteredPhases.length} phases &middot; {Math.round(activeTotal).toLocaleString()}h total
				</span>
			</div>
			<PhaseBarChart
				phases={filteredPhases}
				getPhaseHours={(p) => getPhaseHours(p, scenario, aiToggles, profData)}
				total={activeTotal}
			/>
		</Card>

		<!-- Intelligence Grid: Confidence + Risks side by side -->
		<div class="grid gap-5 lg:grid-cols-[1fr_1fr] [&>*]:min-w-0">
			<!-- Confidence & Assumptions -->
			<Card>
				<div class="flex items-center justify-between mb-4 pb-2 border-b-3 border-primary">
					<button
						onclick={() => drawerSection = 'confidence'}
						class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-primary cursor-pointer hover:opacity-80 transition-opacity"
					>
						Confidence <span class="text-[10px] font-mono opacity-60">(i)</span>
					</button>
				</div>
				<ConfidenceGauge
					score={summary.confidence}
					confirmed={gaps?.confirmed_answers ?? 0}
					assumed={gaps?.assumed_answers ?? 0}
					unknown={gaps?.unknown_answers ?? 0}
					size="sm"
				/>
				<!-- Assumption status bar below gauge -->
				{@const totalAssumptions = adjustedValidated + adjustedUnvalidated + summary.assumptions.invalidated}
				{#if totalAssumptions > 0}
					<div class="mt-5 pt-4 border-t-2 border-border-light">
						<button
							onclick={() => drawerSection = 'assumptions'}
							class="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-text-muted hover:text-primary transition-colors cursor-pointer mb-2"
						>
							Assumptions <span class="font-mono opacity-60">(i)</span>
						</button>
						<div class="h-2.5 w-full border-2 border-brutal flex overflow-hidden">
							{#if adjustedValidated > 0}
								<div class="h-full bg-success transition-all duration-300" style="width: {(adjustedValidated / totalAssumptions) * 100}%"></div>
							{/if}
							{#if adjustedUnvalidated > 0}
								<div class="h-full bg-warning transition-all duration-300" style="width: {(adjustedUnvalidated / totalAssumptions) * 100}%"></div>
							{/if}
							{#if summary.assumptions.invalidated > 0}
								<div class="h-full bg-danger transition-all duration-300" style="width: {(summary.assumptions.invalidated / totalAssumptions) * 100}%"></div>
							{/if}
						</div>
						<div class="flex items-center justify-between mt-1.5 text-[10px]">
							<span class="font-bold text-success">{adjustedValidated} valid</span>
							<span class="font-bold text-warning">{adjustedUnvalidated} open</span>
							<span class="font-bold text-danger">{summary.assumptions.invalidated} invalid</span>
						</div>
						<a href="{base}/analysis?tab=assumptions" class="block text-[10px] font-bold text-primary hover:text-primary-hover text-right mt-1">
							Manage &rarr;
						</a>
					</div>
				{/if}
			</Card>

			<!-- Risk Summary -->
			<Card>
				<div class="flex items-center justify-between mb-4 pb-2 border-b-3 border-primary">
					<button
						onclick={() => drawerSection = 'risks'}
						class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-primary cursor-pointer hover:opacity-80 transition-opacity"
					>
						Risk Summary <span class="text-[10px] font-mono opacity-60">(i)</span>
					</button>
					<span class="text-[10px] font-mono text-text-muted tabular-nums">{summary.risks.open} open</span>
				</div>
				<RiskSummaryList {risks} assessmentId={assessment.id} />
			</Card>
		</div>

		<!-- What Needs Attention — actionable intelligence panel -->
		<Card>
			<div class="flex items-center justify-between mb-5 pb-2 border-b-3 border-primary">
				<button
					onclick={() => drawerSection = 'attention'}
					class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-primary cursor-pointer hover:opacity-80 transition-opacity"
				>
					What Needs Attention <span class="text-[10px] font-mono opacity-60">(i)</span>
				</button>
				<span class="text-[10px] font-mono text-text-muted tabular-nums">
					{riskClusters.length} cluster{riskClusters.length !== 1 ? 's' : ''} · {adjustedUnvalidated} open
				</span>
			</div>

			<!-- Risk Clusters -->
			{#if riskClusters.length > 0}
				<div class="mb-6">
					<h3 class="text-[10px] font-extrabold uppercase tracking-widest text-text-muted mb-3">Risk Clusters</h3>
					<div class="space-y-2">
						{#each riskClusters as cluster (cluster.name)}
							{@const widening = cluster.combined_widening_hours ?? 0}
							{@const riskCount = (cluster.risks?.length ?? 0)}
							{@const assumptionCount = (cluster.assumptions?.length ?? 0)}
							{@const barPct = maxClusterWidening > 0 ? (widening / maxClusterWidening) * 100 : 0}
							<a href="{base}/analysis?tab=risks" class="flex items-center gap-3 group no-underline text-inherit hover:bg-bg px-2 py-1 -mx-2 transition-colors">
								<span class="text-xs font-bold truncate w-40 shrink-0" title={cluster.name}>{cluster.name}</span>
								<span class="text-[11px] font-mono font-bold text-danger tabular-nums shrink-0 w-12 text-right">+{Math.round(widening)}h</span>
								<div class="flex-1 h-2.5 border-2 border-brutal bg-bg overflow-hidden">
									<div
										class="h-full transition-all duration-300 {widening >= 25 ? 'bg-danger' : widening >= 15 ? 'bg-warning' : 'bg-success'}"
										style="width: {barPct}%"
									></div>
								</div>
								<span class="text-[10px] text-text-muted tabular-nums shrink-0 w-24 text-right">
									{#if riskCount > 0}{riskCount} risk{riskCount !== 1 ? 's' : ''}{/if}{#if riskCount > 0 && assumptionCount > 0}, {/if}{#if assumptionCount > 0}{assumptionCount} assumption{assumptionCount !== 1 ? 's' : ''}{/if}
								</span>
							</a>
						{/each}
					</div>
					<a href="{base}/analysis?tab=risks" class="block text-[10px] font-bold text-primary hover:text-primary-hover text-right mt-2">
						View risks &rarr;
					</a>
				</div>
			{/if}

			<!-- Top Unknowns -->
			{#if topUnknowns.length > 0}
				<div class="mb-6 pt-4 border-t-2 border-border-light">
					<h3 class="text-[10px] font-extrabold uppercase tracking-widest text-text-muted mb-3">Top Unknowns to Resolve</h3>
					<div class="space-y-1.5">
						{#each topUnknowns.slice(0, 5) as assumption, i (assumption.id)}
							<div class="flex items-center gap-3 text-sm">
								<span class="text-[10px] font-mono font-bold text-text-muted w-4 shrink-0">{i + 1}.</span>
								<span class="truncate flex-1" title={assumption.assumed_value ?? assumption.id}>
									{assumption.assumed_value ?? assumption.id}
								</span>
								<span class="text-[11px] font-mono font-bold text-danger tabular-nums shrink-0">+{Math.round(assumption.pessimistic_widening_hours ?? 0)}h</span>
								{#if assumption.validation_method}
									<span class="text-[10px] text-text-muted truncate max-w-32 hidden md:inline" title={assumption.validation_method}>{assumption.validation_method}</span>
								{/if}
								<button
									onclick={() => validateAssumption(assumption.id)}
									disabled={savingAssumption === assumption.id}
									class="shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border-2 border-success text-success hover:bg-success hover:text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-wait"
								>
									{savingAssumption === assumption.id ? '...' : 'Validate'}
								</button>
							</div>
						{/each}
					</div>
					{#if topUnknowns.length > 5}
						<a href="{base}/analysis?tab=assumptions" class="block text-[10px] font-bold text-primary hover:text-primary-hover text-right mt-2">
							View all {topUnknowns.length} &rarr;
						</a>
					{/if}
				</div>
			{/if}

			<!-- Confidence Improvement Path -->
			<div class="{riskClusters.length > 0 || topUnknowns.length > 0 ? 'pt-4 border-t-2 border-border-light' : ''}">
				<h3 class="text-[10px] font-extrabold uppercase tracking-widest text-text-muted mb-3">How to Improve Confidence</h3>
				<ConfidenceImprovementPath
					discovery={data.discovery ?? {}}
					unvalidatedCount={adjustedUnvalidated}
					totalWidening={summary.assumptions.totalWidening}
					unknownCount={gaps?.unknown_answers ?? 0}
					assessmentId={assessment.id}
				/>
			</div>
		</Card>
	</div>

{:else}
	<!-- ═══════════════════════════════════════════════════════════════
	     PRE-ESTIMATE — Guided Journey
	     ═══════════════════════════════════════════════════════════════ -->

	<!-- Hero: Project identity -->
	<section class="hero-surface border-b-3 border-primary">
		<div class="px-8 py-8">
			<div class="flex items-start justify-between gap-6">
				<div>
					<div class="flex items-center gap-3 mb-2">
						<h1 class="text-2xl font-extrabold uppercase tracking-wider leading-none">{assessment.project_name}</h1>
						<Badge variant={assessment.status === 'complete' ? 'success' : 'info'}>{assessment.status}</Badge>
						<button onclick={() => drawerSection = 'page'} class="text-[10px] font-mono text-white/45 hover:text-white/70 transition-colors cursor-pointer" aria-label="About this page">
							(i)
						</button>
					</div>
					{#if assessment.client_name}
						<span class="text-xs font-mono text-white/50">{assessment.client_name}</span>
					{/if}
				</div>
				<div class="shrink-0 flex items-center gap-3 px-4 py-2 border-2 border-white/20 bg-white/5">
					<span class="text-xs font-extrabold uppercase tracking-wider">{(assessment.source_stack as any)?.infrastructure || assessment.source_cloud}</span>
					<svg width="20" height="12" viewBox="0 0 20 12" fill="none" aria-hidden="true">
						<path d="M0 6H16M16 6L11 1M16 6L11 11" stroke="currentColor" stroke-width="2" stroke-linecap="square"/>
					</svg>
					<span class="text-xs font-extrabold uppercase tracking-wider">{(assessment.target_stack as any)?.infrastructure || assessment.target_cloud}</span>
				</div>
			</div>
			{#if (assessment.source_stack as any)?.platform || (assessment.source_stack as any)?.topology || assessment.target_timeline}
				{@const srcStack = assessment.source_stack as any}
				<div class="flex items-center gap-3 mt-4 text-[10px] font-mono text-white/40">
					{#if srcStack?.platform}<span>{srcStack.platform}{srcStack.platform_version ? ` ${srcStack.platform_version}` : ''}</span>{/if}
					{#if srcStack?.platform && srcStack?.topology}<span class="text-white/20">&middot;</span>{/if}
					{#if srcStack?.topology}<span>{srcStack.topology}</span>{/if}
					{#if (srcStack?.platform || srcStack?.topology) && assessment.target_timeline}<span class="text-white/20">&middot;</span>{/if}
					{#if assessment.target_timeline}<span>Target: {assessment.target_timeline}</span>{/if}
				</div>
			{/if}
		</div>

		<!-- Health signals footer -->
		<div class="border-t border-white/10 px-8 py-2.5 flex items-center gap-5 flex-wrap text-[11px]">
			<a href="{base}/discovery" class="flex items-center gap-1.5 text-white/50 hover:text-white/80 transition-colors no-underline">
				<span class="font-mono font-bold tabular-nums {summary.discovery.discoveryPercent === 100 ? 'text-success' : 'text-white/70'}">
					{summary.discovery.discoveryPercent}%
				</span>
				<span>discovery</span>
			</a>
			<span class="text-white/20" aria-hidden="true">&middot;</span>
			<a href="{base}/analysis?tab=gaps" class="flex items-center gap-1.5 text-white/50 hover:text-white/80 transition-colors no-underline">
				<span class="font-mono font-bold tabular-nums {summary.confidence >= 70 ? 'text-success' : summary.confidence >= 40 ? 'text-warning' : 'text-danger'}">
					{summary.confidence}%
				</span>
				<span>confidence</span>
			</a>
			<span class="text-white/20" aria-hidden="true">&middot;</span>
			<a href="{base}/analysis?tab=risks" class="flex items-center gap-1.5 text-white/50 hover:text-white/80 transition-colors no-underline">
				<span class="font-mono font-bold tabular-nums {summary.risks.critical > 0 ? 'text-danger' : 'text-white/70'}">
					{summary.risks.open}
				</span>
				<span>risks</span>
			</a>
			<span class="text-white/20" aria-hidden="true">&middot;</span>
			<a href="{base}/analysis?tab=assumptions" class="flex items-center gap-1.5 text-white/50 hover:text-white/80 transition-colors no-underline">
				<span class="font-mono font-bold tabular-nums {adjustedUnvalidated > 0 ? 'text-warning' : adjustedValidated > 0 ? 'text-success' : 'text-white/70'}">
					{adjustedUnvalidated}
				</span>
				<span>open assumptions</span>
			</a>
		</div>
	</section>

	<div class="p-6 space-y-6">
		<!-- Workflow Progress -->
		<div class="brutal-border bg-surface px-5 py-5">
			<WorkflowProgress steps={workflowSteps} reviews={data.summary?.challengeReviews ?? {}} />
		</div>

		<!-- Next Step CTA -->
		<div class="brutal-border bg-surface overflow-hidden">
			<div class="flex items-stretch">
				<!-- Accent bar -->
				<div class="w-1.5 bg-primary shrink-0"></div>
				<div class="flex-1 px-6 py-5">
					<div class="flex items-center justify-between gap-6 flex-wrap">
						<div class="min-w-0">
							<div class="text-[10px] font-extrabold uppercase tracking-widest text-text-muted mb-1.5">Next Step</div>
							<h2 class="text-lg font-extrabold uppercase tracking-wider leading-tight">
								{nextStep.target}
							</h2>
							<p class="text-sm text-text-secondary mt-1 max-w-lg">{nextStep.description}</p>
						</div>
						<a
							href={nextStep.href}
							class="shrink-0 brutal-border-thin px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-primary text-white border-primary hover:bg-primary-hover active:translate-y-px transition-all no-underline"
						>
							Go to {nextStep.target} &rarr;
						</a>
					</div>
					<div class="border-t-2 border-border-light pt-3 mt-4">
						<p class="text-[10px] text-text-muted">
							Or run
							<code class="brutal-border-thin bg-bg px-1.5 py-0.5 text-[10px] font-mono">{nextStep.command}</code>
							in Claude Code
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
</div>

<!-- ═══ Info Drawer ═══════════════════════════════════════════════ -->
<InfoDrawer
	open={drawerSection !== null}
	onclose={() => drawerSection = null}
	title={
		drawerSection === 'page' ? 'About Overview'
		: drawerSection === 'confidence' ? 'Confidence Score'
		: drawerSection === 'scenarios' ? 'Scenario Comparison'
		: drawerSection === 'phases' ? 'Hours by Phase'
		: drawerSection === 'risks' ? 'Risk Summary'
		: drawerSection === 'attention' ? 'What Needs Attention'
		: drawerSection === 'assumptions' ? 'Assumption Status'
		: ''
	}
>
	{#if drawerSection === 'page'}
		<div class="space-y-4 text-sm">
			<p>The <strong>Overview</strong> is your migration command center — a single view of project health, progress, and key metrics.</p>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">The Hero Number</h3>
				<p class="text-text-secondary">The total estimate in hours dominates the top of the page. It updates in real time as you switch scenarios and toggle AI tools. The savings delta shows the difference from the manual baseline.</p>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Scenarios</h3>
				<p class="text-text-secondary">Switch between Manual (no AI), AI-Assisted (selected tools), and Best Case (all tools, optimistic) to see how different approaches affect the total.</p>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Health Signals</h3>
				<p class="text-text-secondary">The footer bar shows discovery progress, confidence score, open risks, and unvalidated assumptions. Each links to its detail page. Color indicates status: green = healthy, orange = attention needed, red = critical.</p>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Sections</h3>
				<ul class="list-disc list-inside space-y-1 text-text-secondary">
					<li><strong>Hours by Phase</strong> — Effort distribution across migration phases</li>
					<li><strong>Confidence</strong> — Visual breakdown of confirmed, assumed, and unknown answers</li>
					<li><strong>Risk Summary</strong> — Top risks by severity with quick access to details</li>
					<li><strong>What Needs Attention</strong> — Risk clusters, top unknowns, and improvement steps</li>
				</ul>
			</div>
		</div>
	{:else if drawerSection === 'confidence'}
		<div class="space-y-4 text-sm">
			<p>The <strong>confidence score</strong> measures how much of the estimate is based on confirmed facts versus assumptions.</p>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Score Ranges</h3>
				<div class="space-y-1 font-mono text-xs">
					<p><span class="inline-block w-3 h-3 bg-danger border border-danger mr-1.5"></span> <strong>0–40%</strong> — High uncertainty. Many assumptions unvalidated.</p>
					<p><span class="inline-block w-3 h-3 bg-warning border border-warning mr-1.5"></span> <strong>40–70%</strong> — Moderate. Key assumptions need validation.</p>
					<p><span class="inline-block w-3 h-3 bg-success border border-success mr-1.5"></span> <strong>70–100%</strong> — High confidence. Most inputs confirmed.</p>
				</div>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">How to Improve</h3>
				<ul class="list-disc list-inside space-y-1 text-text-secondary">
					<li>Validate open assumptions with the client</li>
					<li>Complete remaining discovery dimensions</li>
					<li>Resolve unknown answers in analysis gaps</li>
				</ul>
			</div>
			<p class="text-xs text-text-muted">See the <a href="{base}/analysis?tab=gaps" class="text-primary font-bold">Analysis Gaps</a> tab for specifics.</p>
		</div>
	{:else if drawerSection === 'scenarios'}
		<div class="space-y-4 text-sm">
			<p><strong>Scenario comparison</strong> shows three projections for migration effort.</p>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Scenarios</h3>
				<div class="space-y-2 text-text-secondary">
					<p><strong class="text-text">Manual</strong> — Full effort with no AI tooling. Baseline hours.</p>
					<p><strong class="text-text">AI-Assisted</strong> — Hours reduced by enabled AI tools. Default view.</p>
					<p><strong class="text-text">Best Case</strong> — All AI tools enabled at optimistic savings estimates.</p>
				</div>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">How Savings Work</h3>
				<p class="text-text-secondary">Each AI tool specifies expected hours saved per component. Savings are summed across enabled tools, capped at 50% per component to keep estimates realistic.</p>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Customization</h3>
				<p class="text-text-secondary">Toggle individual AI tools in the AI Tools section. The hero number and scenario totals update in real time.</p>
			</div>
		</div>
	{:else if drawerSection === 'phases'}
		<div class="space-y-4 text-sm">
			<p><strong>Hours by Phase</strong> breaks down the total estimate into migration phases.</p>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">What Phases Represent</h3>
				<p class="text-text-secondary">Each phase groups related migration tasks (e.g., Content Migration, Infrastructure, Testing). Hours reflect the selected scenario.</p>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Calculation</h3>
				<p class="text-text-secondary">Base hours &times; complexity multipliers + gotcha patterns. AI tool savings are subtracted in AI-Assisted and Best Case scenarios.</p>
			</div>
			<p class="text-xs text-text-muted">Use <a href="{base}/refine" class="text-primary font-bold">Refine</a> to exclude phases or components from the estimate.</p>
		</div>
	{:else if drawerSection === 'risks'}
		<div class="space-y-4 text-sm">
			<p><strong>Risks</strong> are factors that could increase migration effort beyond the current estimate.</p>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Severity</h3>
				<div class="space-y-1 font-mono text-xs">
					<p><span class="inline-block w-3 h-3 bg-danger border border-danger mr-1.5"></span> <strong>Critical / High</strong> — Likely to cause delays or rework.</p>
					<p><span class="inline-block w-3 h-3 bg-warning border border-warning mr-1.5"></span> <strong>Medium</strong> — May add hours. Should have mitigation.</p>
					<p><span class="inline-block w-3 h-3 bg-success border border-success mr-1.5"></span> <strong>Low</strong> — Minor impact. Monitor.</p>
				</div>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Hours Impact</h3>
				<p class="text-text-secondary">Each risk shows estimated additional hours (<code class="text-xs font-mono brutal-border-thin bg-surface px-1 py-0.5">+Nh</code>) if the risk materializes.</p>
			</div>
			<p class="text-xs text-text-muted">Manage all risks on the <a href="{base}/analysis?tab=risks" class="text-primary font-bold">Analysis</a> page.</p>
		</div>
	{:else if drawerSection === 'attention'}
		<div class="space-y-4 text-sm">
			<p><strong>What Needs Attention</strong> surfaces the highest-impact actions to improve your estimate's confidence and reduce uncertainty.</p>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Risk Clusters</h3>
				<p class="text-text-secondary">Groups of related risks and assumptions that compound. Each cluster shows the combined widening hours — the uncertainty penalty added to the estimate. Resolving a cluster shrinks the pessimistic range.</p>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Top Unknowns</h3>
				<p class="text-text-secondary">The unvalidated assumptions with the highest hours at stake. Each shows a validation method — the specific action to confirm or deny the assumption. Validating these has the biggest impact on narrowing the estimate range.</p>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Improvement Path</h3>
				<p class="text-text-secondary">Numbered steps to maximize confidence: complete missing discovery dimensions, validate assumptions, and resolve unknowns. Work through them in order for the fastest confidence improvement.</p>
			</div>
			<p class="text-xs text-text-muted">Manage AI tool selections on the <a href="{base}/estimate?tab=ai-tools" class="text-primary font-bold">Estimate</a> page.</p>
		</div>
	{:else if drawerSection === 'assumptions'}
		<div class="space-y-4 text-sm">
			<p><strong>Assumptions</strong> are unconfirmed inputs used to build the estimate. Their status directly affects confidence.</p>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Statuses</h3>
				<div class="space-y-2 text-text-secondary">
					<p><strong class="text-success">Validated</strong> — Confirmed by client or evidence. Adds certainty.</p>
					<p><strong class="text-warning">Unvalidated</strong> — Pending confirmation. Widens estimate range, lowers confidence.</p>
					<p><strong class="text-danger">Invalidated</strong> — Proven incorrect. Affected areas need rework.</p>
				</div>
			</div>
			<p class="text-xs text-text-muted">Manage on the <a href="{base}/analysis?tab=assumptions" class="text-primary font-bold">Analysis</a> page.</p>
		</div>
	{/if}
</InfoDrawer>
