<script lang="ts">
	import { page } from '$app/state';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import KpiCard from '$lib/components/ui/KpiCard.svelte';
	import InfoDrawer from '$lib/components/ui/InfoDrawer.svelte';
	import WorkflowProgress from '$lib/components/WorkflowProgress.svelte';
	import ConfidenceGauge from '$lib/components/ConfidenceGauge.svelte';
	import ScenarioComparison from '$lib/components/ScenarioComparison.svelte';
	import PhaseBarChart from '$lib/components/PhaseBarChart.svelte';
	import RiskSummaryList from '$lib/components/RiskSummaryList.svelte';
	import AiToolToggles from '$lib/components/AiToolToggles.svelte';
	import AssumptionStatusBar from '$lib/components/AssumptionStatusBar.svelte';
	import { confidenceVariant } from '$lib/utils/migration-stats';
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
	const aiTools = $derived((data.aiAlternatives ?? []) as any[]);

	let aiToggles = $state<Record<string, boolean>>({ ...(data.aiSelections?.selections ?? {}) });
	let scenario = $state<Scenario>('ai_assisted');
	let drawerSection = $state<'page' | 'confidence' | 'scenarios' | 'phases' | 'risks' | 'aitools' | 'assumptions' | null>(null);

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

	async function toggleAiTool(toolId: string, enabled: boolean) {
		aiToggles[toolId] = enabled;
		aiToggles = { ...aiToggles };
		await fetch(`/api/assessments/${page.params.id}/ai-selections`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ selections: aiToggles })
		});
	}

	const base = $derived(`/assessments/${assessment.id}`);

	const workflowSteps = $derived([
		{
			label: 'Discovery',
			href: `${base}/discovery`,
			status: summary.discovery.discoveryPercent === 100 ? 'complete' as const
				: summary.hasDiscovery ? 'in-progress' as const : 'not-started' as const,
			detail: `${summary.discovery.discoveryPercent}%`
		},
		{
			label: 'Analysis',
			href: `${base}/analysis`,
			status: summary.hasAnalysis ? 'complete' as const : 'not-started' as const,
			detail: `${summary.risks.total} risks`
		},
		{
			label: 'Estimate',
			href: `${base}/estimate`,
			status: summary.hasEstimate ? 'complete' as const : 'not-started' as const,
			detail: summary.hasEstimate ? `${Math.round(summary.estimateHours)}h` : ''
		},
		{
			label: 'Refine',
			href: `${base}/refine`,
			status: summary.hasRefine ? 'complete' as const : 'not-started' as const,
			detail: excludedSet.size > 0 ? `${excludedSet.size} excluded` : ''
		},
		{
			label: 'Deliverables',
			href: `${base}/deliverables`,
			status: 'not-started' as const,
			detail: ''
		}
	]);
</script>

<svelte:head>
	<title>{assessment.project_name} — Overview</title>
</svelte:head>

<div class="p-6 space-y-6 animate-enter">
	<!-- Compact Project Header -->
	<div class="flex items-start justify-between gap-4 flex-wrap">
		<div>
			<div class="flex items-center gap-2">
				<h1 class="text-xl font-extrabold uppercase tracking-wider">Overview</h1>
				<button onclick={() => drawerSection = 'page'} class="flex items-center justify-center w-5 h-5 text-text-muted hover:text-primary transition-colors" aria-label="About this page">
					<span class="text-[10px] font-mono opacity-60">(i)</span>
				</button>
			</div>
			<div class="flex items-center gap-3 mt-1 text-xs font-mono text-text-muted flex-wrap">
				<span class="font-bold text-text-secondary">{assessment.project_name}</span>
				{#if assessment.client_name}
					<span>| {assessment.client_name}</span>
				{/if}
				{#if assessment.topology}
					<span>{assessment.topology}</span>
				{/if}
				<span>{assessment.source_cloud} &rarr; {assessment.target_cloud}</span>
				{#if assessment.sitecore_version}
					<span>v{assessment.sitecore_version}</span>
				{/if}
				{#if assessment.target_timeline}
					<span>Target: {assessment.target_timeline}</span>
				{/if}
			</div>
		</div>
		<Badge variant={assessment.status === 'complete' ? 'success' : 'info'}>{assessment.status}</Badge>
	</div>

	<!-- Workflow Progress -->
	<Card padding="p-5 px-4">
		<WorkflowProgress steps={workflowSteps} reviews={data.summary?.challengeReviews ?? {}} />
	</Card>

	{#if !estimate}
		<Card>
			<div class="py-8 text-center">
				<p class="text-lg font-extrabold uppercase tracking-wider text-text-secondary">Getting Started</p>
				<p class="mt-2 text-sm text-text-muted max-w-md mx-auto">
					Complete discovery and analysis, then run <code class="brutal-border-thin bg-surface px-1.5 py-0.5 text-xs font-mono">/migrate estimate</code> to see the full dashboard.
				</p>
			</div>
		</Card>

		<!-- Show available KPIs even without estimate -->
		<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 stagger-grid">
			<div style="--stagger-i: 0;"><KpiCard
				label="Discovery"
				value="{summary.discovery.discoveryPercent}%"
				detail="{summary.discovery.completedDimensions}/{summary.discovery.totalDimensions} dimensions"
				href="{base}/discovery"
				variant={summary.discovery.discoveryPercent === 100 ? 'success' : 'primary'}
				progress={summary.discovery.discoveryPercent}
			/></div>
			<div style="--stagger-i: 1;"><KpiCard
				label="Risks"
				value="{summary.risks.open} open"
				detail="{summary.risks.critical} high/critical"
				href="{base}/analysis?tab=risks"
			/></div>
			<div style="--stagger-i: 2;"><KpiCard
				label="Confidence"
				value="{summary.confidence}%"
				detail="{summary.assumptions.validated} assumptions validated"
				href="{base}/analysis?tab=gaps"
				variant={confidenceVariant(summary.confidence)}
				progress={summary.confidence}
			/></div>
		</div>
	{:else}
		<!-- 5 KpiCards -->
		<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-5 stagger-grid">
			<div style="--stagger-i: 0;"><KpiCard
				label="Total Hours"
				value="{Math.round(activeTotal).toLocaleString()}h"
				detail="{scenario === 'manual' ? 'Manual' : scenario === 'best_case' ? 'Best Case' : 'AI-Assisted'}"
				href="{base}/estimate"
				tooltip="Effective hours for the active scenario, factoring in scope exclusions and AI tool savings."
			/></div>
			<div style="--stagger-i: 1;"><KpiCard
				label="Confidence"
				value="{summary.confidence}%"
				href="{base}/analysis?tab=gaps"
				variant={confidenceVariant(summary.confidence)}
				progress={summary.confidence}
				tooltip="Higher confidence = fewer assumptions. Validate assumptions to increase."
			/></div>
			<div style="--stagger-i: 2;"><KpiCard
				label="Discovery"
				value="{summary.discovery.discoveryPercent}%"
				detail="{summary.discovery.completedDimensions}/{summary.discovery.totalDimensions}"
				href="{base}/discovery"
				variant={summary.discovery.discoveryPercent === 100 ? 'success' : 'primary'}
				progress={summary.discovery.discoveryPercent}
				tooltip="Percentage of discovery dimensions completed."
			/></div>
			<div style="--stagger-i: 3;"><KpiCard
				label="Risks"
				value="{summary.risks.open} open"
				detail="{summary.risks.critical} high/critical"
				href="{base}/analysis?tab=risks"
				tooltip="Open risks that may add hours."
			/></div>
			<div style="--stagger-i: 4;"><KpiCard
				label="AI Savings"
				value="-{scenarioTotals.savingsPercent}%"
				detail="-{Math.round(scenarioTotals.savings)}h"
				href="{base}/estimate?tab=ai-tools"
				tooltip="Estimated hours reduction from enabled AI tools."
			/></div>
		</div>

		<!-- Confidence Gauge + Scenario Comparison -->
		<div class="grid gap-5 lg:grid-cols-2">
			<Card>
				<button class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider mb-4 pb-2 border-b-3 border-primary text-primary w-full text-left cursor-pointer hover:opacity-80 transition-opacity" onclick={() => drawerSection = 'confidence'}>
					Confidence Score
					<span class="text-[10px] font-mono opacity-60">(i)</span>
				</button>
				<ConfidenceGauge
					score={summary.confidence}
					confirmed={gaps?.confirmed_answers ?? 0}
					assumed={gaps?.assumed_answers ?? 0}
					unknown={gaps?.unknown_answers ?? 0}
				/>
			</Card>
			<Card>
				<button class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider mb-4 pb-2 border-b-3 border-primary text-primary w-full text-left cursor-pointer hover:opacity-80 transition-opacity" onclick={() => drawerSection = 'scenarios'}>
					Scenario Comparison
					<span class="text-[10px] font-mono opacity-60">(i)</span>
				</button>
				<ScenarioComparison
					manualTotal={scenarioTotals.manual}
					aiAssistedTotal={scenarioTotals.aiAssisted}
					bestCaseTotal={scenarioTotals.bestCase}
					activeScenario={scenario}
					onselect={(s) => scenario = s}
				/>
			</Card>
		</div>

		<!-- Phase Bar Chart -->
		<Card>
			<button class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider mb-4 pb-2 border-b-3 border-primary text-primary w-full text-left cursor-pointer hover:opacity-80 transition-opacity" onclick={() => drawerSection = 'phases'}>
				Hours by Phase
				<span class="text-[10px] font-mono opacity-60">(i)</span>
			</button>
			<PhaseBarChart
				phases={filteredPhases}
				getPhaseHours={(p) => getPhaseHours(p, scenario, aiToggles, profData)}
				total={activeTotal}
			/>
		</Card>

		<!-- Risk Summary + AI Tool Toggles -->
		<div class="grid gap-5 lg:grid-cols-2">
			<Card>
				<button class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider mb-4 pb-2 border-b-3 border-primary text-primary w-full text-left cursor-pointer hover:opacity-80 transition-opacity" onclick={() => drawerSection = 'risks'}>
					Risk Summary
					<span class="text-[10px] font-mono opacity-60">(i)</span>
				</button>
				<RiskSummaryList {risks} assessmentId={assessment.id} />
			</Card>
			<Card>
				<div class="flex items-center justify-between mb-4 pb-2 border-b-3 border-primary">
					<button class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-primary cursor-pointer hover:opacity-80 transition-opacity" onclick={() => drawerSection = 'aitools'}>
						AI Tools
						<span class="text-[10px] font-mono opacity-60">(i)</span>
					</button>
					<span class="text-xs font-mono text-text-muted">
						{Object.values(aiToggles).filter(Boolean).length}/{aiTools.length} on
					</span>
				</div>
				<AiToolToggles
					tools={aiTools}
					toggles={aiToggles}
					ontoggle={toggleAiTool}
					mode="compact"
				/>
			</Card>
		</div>

		<!-- Assumption Status Bar -->
		<Card padding="p-4">
			<AssumptionStatusBar
				validated={summary.assumptions.validated}
				unvalidated={summary.assumptions.unvalidated}
				invalidated={summary.assumptions.invalidated}
				assessmentId={assessment.id}
				oninfoclick={() => drawerSection = 'assumptions'}
			/>
		</Card>
	{/if}
</div>

<!-- Info Drawer -->
<InfoDrawer
	open={drawerSection !== null}
	onclose={() => drawerSection = null}
	title={
		drawerSection === 'page' ? 'About Overview'
		: drawerSection === 'confidence' ? 'Confidence Score'
		: drawerSection === 'scenarios' ? 'Scenario Comparison'
		: drawerSection === 'phases' ? 'Hours by Phase'
		: drawerSection === 'risks' ? 'Risk Summary'
		: drawerSection === 'aitools' ? 'AI Tools'
		: drawerSection === 'assumptions' ? 'Assumption Status'
		: ''
	}
>
	{#if drawerSection === 'page'}
		<div class="space-y-4 text-sm">
			<p>The <strong>Overview</strong> is your migration assessment dashboard — a single view of project health, progress, and key metrics.</p>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">KPI Cards</h3>
				<ul class="list-disc list-inside space-y-1 text-text-secondary">
					<li><strong>Total Hours</strong> — Effective hours for the active scenario (manual, AI-assisted, or best case)</li>
					<li><strong>Confidence</strong> — How much of the estimate is based on confirmed facts vs. assumptions</li>
					<li><strong>Discovery</strong> — Progress through infrastructure discovery dimensions</li>
					<li><strong>Risks</strong> — Open risks that may add hours to the estimate</li>
					<li><strong>AI Savings</strong> — Estimated reduction from enabled AI tools</li>
				</ul>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Workflow</h3>
				<p class="text-text-secondary">The workflow bar shows your progress: Discovery &rarr; Analysis &rarr; Estimate &rarr; Refine &rarr; Deliverables. Complete each step to build a comprehensive migration plan.</p>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Sections</h3>
				<ul class="list-disc list-inside space-y-1 text-text-secondary">
					<li><strong>Confidence Gauge</strong> — Visual breakdown of confirmed, assumed, and unknown answers</li>
					<li><strong>Scenario Comparison</strong> — Compare manual, AI-assisted, and best case totals</li>
					<li><strong>Hours by Phase</strong> — Bar chart of effort distribution across migration phases</li>
					<li><strong>Risk Summary</strong> — Top risks by severity with quick access to details</li>
					<li><strong>AI Tools</strong> — Toggle individual tools and see savings in real time</li>
					<li><strong>Assumption Status</strong> — Track validation progress</li>
				</ul>
			</div>
		</div>
	{:else if drawerSection === 'confidence'}
		<div class="space-y-4 text-sm">
			<p>The <strong>confidence score</strong> measures how much of the estimate is based on confirmed facts versus assumptions.</p>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Score Ranges</h3>
				<div class="space-y-1 font-mono text-xs">
					<p><span class="inline-block w-3 h-3 bg-danger border border-danger mr-1.5"></span> <strong>0–40%</strong> — High uncertainty. Many assumptions remain unvalidated.</p>
					<p><span class="inline-block w-3 h-3 bg-warning border border-warning mr-1.5"></span> <strong>40–70%</strong> — Moderate. Some key assumptions still need validation.</p>
					<p><span class="inline-block w-3 h-3 bg-success border border-success mr-1.5"></span> <strong>70–100%</strong> — High confidence. Most inputs are confirmed.</p>
				</div>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">How to Improve</h3>
				<ul class="list-disc list-inside space-y-1 text-text-secondary">
					<li>Validate open assumptions with the client</li>
					<li>Complete remaining discovery dimensions</li>
					<li>Resolve unknown answers in the analysis gaps</li>
				</ul>
			</div>
			<p class="text-xs text-text-muted">See the <a href="{base}/analysis?tab=gaps" class="text-primary font-bold">Analysis Gaps</a> tab for specifics.</p>
		</div>
	{:else if drawerSection === 'scenarios'}
		<div class="space-y-4 text-sm">
			<p><strong>Scenario comparison</strong> shows three projections for the migration effort.</p>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Scenarios</h3>
				<div class="space-y-2 text-text-secondary">
					<p><strong class="text-text">Manual</strong> — Full effort with no AI tooling. Baseline hours.</p>
					<p><strong class="text-text">AI-Assisted</strong> — Hours reduced by enabled AI tools. Default view.</p>
					<p><strong class="text-text">Best Case</strong> — All AI tools enabled at optimistic savings estimates.</p>
				</div>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">How Savings Are Calculated</h3>
				<p class="text-text-secondary">Each AI tool specifies expected hours saved per component. Savings are summed across enabled tools, capped at 50% per component to avoid over-optimistic projections.</p>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Customization</h3>
				<p class="text-text-secondary">Toggle individual AI tools on/off in the AI Tools section below. The scenario totals update in real time.</p>
			</div>
		</div>
	{:else if drawerSection === 'phases'}
		<div class="space-y-4 text-sm">
			<p><strong>Hours by Phase</strong> breaks down the total estimate into migration phases.</p>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">What Phases Represent</h3>
				<p class="text-text-secondary">Each phase groups related migration tasks (e.g., Content Migration, Infrastructure Setup, Testing). Hours reflect the selected scenario.</p>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">How Hours Are Calculated</h3>
				<p class="text-text-secondary">Base hours &times; complexity multipliers + gotcha patterns. AI tool savings are subtracted when in AI-Assisted or Best Case scenarios.</p>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Adjusting Scope</h3>
				<p class="text-text-secondary">Use the <a href="{base}/refine" class="text-primary font-bold">Refine</a> page to exclude phases or components from the estimate.</p>
			</div>
		</div>
	{:else if drawerSection === 'risks'}
		<div class="space-y-4 text-sm">
			<p><strong>Risks</strong> are factors that could increase the migration effort beyond the current estimate.</p>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Severity Levels</h3>
				<div class="space-y-1 font-mono text-xs">
					<p><span class="inline-block w-3 h-3 bg-danger border border-danger mr-1.5"></span> <strong>Critical / High</strong> — Likely to cause significant delays or rework. Address before estimation is finalized.</p>
					<p><span class="inline-block w-3 h-3 bg-warning border border-warning mr-1.5"></span> <strong>Medium</strong> — May add hours. Should have a mitigation plan.</p>
					<p><span class="inline-block w-3 h-3 bg-success border border-success mr-1.5"></span> <strong>Low</strong> — Minor impact. Monitor but unlikely to derail the project.</p>
				</div>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Hours Impact</h3>
				<p class="text-text-secondary">Each risk shows an estimated hours impact (<code class="text-xs font-mono brutal-border-thin bg-surface px-1 py-0.5">+Nh</code>) representing additional effort if the risk materializes.</p>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Managing Risks</h3>
				<ul class="list-disc list-inside space-y-1 text-text-secondary">
					<li>Hover a risk badge to see its likelihood and category</li>
					<li>Hover the description to see the mitigation strategy</li>
					<li>View and manage all risks on the <a href="{base}/analysis?tab=risks" class="text-primary font-bold">Analysis</a> page</li>
				</ul>
			</div>
		</div>
	{:else if drawerSection === 'aitools'}
		<div class="space-y-4 text-sm">
			<p><strong>AI Tools</strong> are software products that can automate parts of the migration, reducing manual effort.</p>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Ranking</h3>
				<p class="text-text-secondary">Tools are ranked by estimated hours saved. The top 3 tools are highlighted in green as they deliver the most value for this specific migration.</p>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Toggling Tools</h3>
				<p class="text-text-secondary">Enable or disable individual tools to see how they affect the AI-Assisted and Best Case scenario totals. Changes are saved automatically and update the dashboard in real time.</p>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Savings Calculation</h3>
				<p class="text-text-secondary">Each tool specifies hours saved per migration component. Savings are summed across enabled tools but capped at 50% per component to keep estimates realistic.</p>
			</div>
			<p class="text-xs text-text-muted">See detailed tool descriptions on the <a href="{base}/estimate?tab=ai-tools" class="text-primary font-bold">Estimate</a> page.</p>
		</div>
	{:else if drawerSection === 'assumptions'}
		<div class="space-y-4 text-sm">
			<p><strong>Assumptions</strong> are unconfirmed inputs used to build the estimate. Their status directly affects the confidence score.</p>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Statuses</h3>
				<div class="space-y-2 text-text-secondary">
					<p><strong class="text-success">Validated</strong> — Confirmed by the client or supporting evidence. These add certainty to the estimate.</p>
					<p><strong class="text-warning">Unvalidated</strong> — Pending confirmation. Each unvalidated assumption widens the estimate range and lowers confidence.</p>
					<p><strong class="text-danger">Invalidated</strong> — Proven incorrect. The affected areas of the estimate need to be reworked with corrected inputs.</p>
				</div>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Impact on Confidence</h3>
				<p class="text-text-secondary">The confidence score is primarily driven by the ratio of validated to total assumptions. Validating assumptions is the fastest way to increase confidence.</p>
			</div>
			<p class="text-xs text-text-muted">Manage assumptions on the <a href="{base}/analysis?tab=assumptions" class="text-primary font-bold">Analysis</a> page.</p>
		</div>
	{/if}
</InfoDrawer>
