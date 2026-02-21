<script lang="ts">
	import { page } from '$app/state';
	import Card from '$lib/components/ui/Card.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import CollapsibleSection from '$lib/components/ui/CollapsibleSection.svelte';
	import ScenarioSelector from '$lib/components/ScenarioSelector.svelte';
	import Tooltip from '$lib/components/ui/Tooltip.svelte';
	import InfoDrawer from '$lib/components/ui/InfoDrawer.svelte';
	import { computeRefinedTotals, filterPhases, getComponentHours } from '$lib/utils/scenario-engine';
	import { computeScopeCascade } from '$lib/utils/scope-cascade';
	import type { Scenario } from '$lib/utils/scenario-engine';

	let { data } = $props();

	const assessment = $derived(data.assessment);
	const estimate = $derived(data.estimate as any);
	const analysis = $derived(data.analysis as any);
	const phases = $derived((estimate?.phases ?? []) as any[]);
	const assumptions = $derived((analysis?.assumptions ?? []) as any[]);
	const risks = $derived((analysis?.risks ?? []) as any[]);
	const aiTools = $derived((data.aiAlternatives ?? []) as any[]);

	let aiToggles = $state<Record<string, boolean>>({ ...(data.aiSelections?.selections ?? {}) });
	let exclusions = $state<Record<string, boolean>>({ ...(data.scopeExclusions?.exclusions ?? {}) });
	let scenario = $state<Scenario>('ai_assisted');
	let drawerSection = $state<'page' | 'cascade' | null>(null);

	const excludedSet = $derived(new Set(
		Object.entries(exclusions).filter(([, v]) => v).map(([k]) => k)
	));

	// All component IDs from all phases
	const allComponents = $derived(
		phases.flatMap((p: any) => (p.components ?? []).map((c: any) => c.id))
	);
	const inScopeCount = $derived(allComponents.length - excludedSet.size);

	const scenarioTotals = $derived(computeRefinedTotals(phases, aiToggles, excludedSet));
	const activeTotal = $derived(
		scenario === 'manual' ? scenarioTotals.manual
		: scenario === 'best_case' ? scenarioTotals.bestCase
		: scenarioTotals.aiAssisted
	);

	const cascade = $derived(computeScopeCascade(excludedSet, aiTools, assumptions, risks));

	// Phase-level toggle state: 'all' | 'none' | 'partial'
	function phaseToggleState(phase: any): 'all' | 'none' | 'partial' {
		const comps = (phase.components ?? []) as any[];
		if (comps.length === 0) return 'all';
		const excludedCount = comps.filter((c: any) => excludedSet.has(c.id)).length;
		if (excludedCount === 0) return 'all';
		if (excludedCount === comps.length) return 'none';
		return 'partial';
	}

	function toggleComponent(componentId: string, included: boolean) {
		exclusions[componentId] = !included;
		exclusions = { ...exclusions };
		persistExclusions();
	}

	function togglePhase(phase: any, included: boolean) {
		for (const comp of (phase.components ?? []) as any[]) {
			exclusions[comp.id] = !included;
		}
		exclusions = { ...exclusions };
		persistExclusions();
	}

	async function persistExclusions() {
		await fetch(`/api/assessments/${page.params.id}/scope-exclusions`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ exclusions })
		});
	}
</script>

<svelte:head>
	<title>{assessment.project_name} — Refine Scope</title>
</svelte:head>

<div class="p-6 space-y-6 animate-enter">
	<div>
		<div class="flex items-center gap-2">
			<h1 class="text-xl font-extrabold uppercase tracking-wider">Refine Scope</h1>
			<button onclick={() => drawerSection = 'page'} class="flex items-center justify-center w-5 h-5 text-text-muted hover:text-primary transition-colors" aria-label="About this page">
				<span class="text-[10px] font-mono opacity-60">(i)</span>
			</button>
		</div>
		<p class="text-xs text-text-muted mt-1 font-mono">
			Toggle phases and components to adjust the project scope. Changes cascade through hours, AI tools, risks, and assumptions.
		</p>
	</div>

	{#if !estimate}
		<Card>
			<div class="py-8 text-center">
				<p class="text-lg font-extrabold uppercase tracking-wider text-text-secondary">No Estimate Yet</p>
				<p class="mt-2 text-sm text-text-muted max-w-md mx-auto">
					Run <code class="brutal-border-thin bg-surface px-1.5 py-0.5 text-xs font-mono">/migrate estimate</code> first, then come back to refine the scope.
				</p>
			</div>
		</Card>
	{:else}
		<!-- A) Summary Bar -->
		<Card padding="p-4">
			<div class="flex items-center justify-between flex-wrap gap-4">
				<div class="flex items-center gap-6">
					<div>
						<Tooltip text="Components included in the estimate. Excluded components don't count toward hours." position="bottom">
							<span class="text-xs font-extrabold uppercase tracking-wider text-text-muted cursor-help">In Scope</span>
						</Tooltip>
						<p class="text-lg font-extrabold font-mono">
							{inScopeCount}/{allComponents.length}
							<span class="text-sm text-text-muted font-normal">components</span>
						</p>
					</div>
					<div>
						<Tooltip text="Total hours after scope exclusions and AI savings for the active scenario." position="bottom">
							<span class="text-xs font-extrabold uppercase tracking-wider text-text-muted cursor-help">Refined Total</span>
						</Tooltip>
						<p class="text-lg font-extrabold font-mono">
							{Math.round(activeTotal).toLocaleString()}h
						</p>
					</div>
				</div>
				<div class="w-full sm:w-auto">
					<ScenarioSelector
						{scenario}
						onchange={(s) => scenario = s}
						totals={scenarioTotals}
					/>
				</div>
			</div>
		</Card>

		<!-- B) Phase/Component Toggle Grid -->
		<div class="space-y-3">
			{#each phases as phase}
				{@const state = phaseToggleState(phase)}
				{@const phaseComps = (phase.components ?? []) as any[]}
				{@const inScopePhaseComps = phaseComps.filter((c: any) => !excludedSet.has(c.id))}
				{@const phaseHours = inScopePhaseComps.reduce((sum: number, c: any) => sum + getComponentHours(c, scenario, aiToggles), 0)}
				<CollapsibleSection
					title={phase.name}
					subtitle="{inScopePhaseComps.length}/{phaseComps.length} components | {Math.round(phaseHours)}h"
					open={true}
					badge={state === 'none' ? 'excluded' : state === 'partial' ? 'partial' : undefined}
					badgeVariant={state === 'none' ? 'danger' : 'warning'}
				>
					<!-- Phase master toggle -->
					<div class="flex items-center justify-between pb-3 mb-3 border-b-2 border-border-light">
						<span class="text-xs font-extrabold uppercase tracking-wider text-text-muted">
							{state === 'all' ? 'All included' : state === 'none' ? 'All excluded' : 'Partially included'}
						</span>
						<Toggle
							checked={state !== 'none'}
							onchange={(checked) => togglePhase(phase, checked)}
							label={state === 'none' ? 'Include all' : 'Exclude all'}
							size="sm"
						/>
					</div>

					<!-- Component rows -->
					<div class="space-y-1">
						{#each phaseComps as comp}
							{@const excluded = excludedSet.has(comp.id)}
							{@const hours = getComponentHours(comp, scenario, aiToggles)}
							<div class="flex items-center justify-between px-2 py-1.5 rounded transition-opacity {excluded ? 'opacity-50' : ''}">
								<div class="flex items-center gap-3 min-w-0 flex-1">
									<Toggle
										checked={!excluded}
										onchange={(checked) => toggleComponent(comp.id, checked)}
										size="sm"
									/>
									<span class="text-sm font-bold truncate">{comp.name}</span>
								</div>
								<div class="flex items-center gap-4 shrink-0">
									<span class="text-xs font-mono text-text-muted {excluded ? 'line-through' : ''}">
										{Math.round(hours)}h
									</span>
									{#if comp.ai_alternatives?.length}
										<span class="text-[10px] text-primary font-bold">{comp.ai_alternatives.length} AI</span>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</CollapsibleSection>
			{/each}
		</div>

		<!-- C) Cascade Impact Panel -->
		{#if excludedSet.size > 0}
			<Card>
				<button class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider mb-4 pb-2 border-b-3 border-primary text-primary w-full text-left cursor-pointer hover:opacity-80 transition-opacity" onclick={() => drawerSection = 'cascade'}>
					Cascade Impact
					<span class="text-[10px] font-mono opacity-60">(i)</span>
				</button>
				<div class="grid gap-4 sm:grid-cols-3">
					<div>
						<Tooltip text="Assumptions linked only to excluded components. No longer affect the estimate." position="bottom">
							<span class="text-xs font-extrabold uppercase tracking-wider text-text-muted cursor-help">Assumptions</span>
						</Tooltip>
						<p class="text-lg font-extrabold font-mono">{cascade.outOfScopeAssumptions.size} <span class="text-sm text-text-muted font-normal">out of scope</span></p>
					</div>
					<div>
						<Tooltip text="Risks linked only to excluded components. No longer counted in risk analysis." position="bottom">
							<span class="text-xs font-extrabold uppercase tracking-wider text-text-muted cursor-help">Risks</span>
						</Tooltip>
						<p class="text-lg font-extrabold font-mono">{cascade.outOfScopeRisks.size} <span class="text-sm text-text-muted font-normal">out of scope</span></p>
					</div>
					<div>
						<Tooltip text="AI tools that only apply to excluded components. No savings counted." position="bottom">
							<span class="text-xs font-extrabold uppercase tracking-wider text-text-muted cursor-help">AI Tools</span>
						</Tooltip>
						<p class="text-lg font-extrabold font-mono">{cascade.inactiveAiTools.size} <span class="text-sm text-text-muted font-normal">inactive</span></p>
					</div>
				</div>

				{#if cascade.outOfScopeAssumptions.size > 0}
					<details class="mt-4">
						<summary class="text-xs font-extrabold uppercase tracking-wider text-text-muted cursor-pointer hover:text-text">
							Out-of-scope assumptions ({cascade.outOfScopeAssumptions.size})
						</summary>
						<ul class="mt-2 space-y-1">
							{#each assumptions.filter((a: any) => cascade.outOfScopeAssumptions.has(a.id)) as assumption}
								<li class="text-xs font-mono text-text-muted px-2 py-1 bg-surface-hover">
									<span class="font-bold text-text-secondary">{assumption.id}</span> — {assumption.assumed_value || assumption.basis || 'No description'}
								</li>
							{/each}
						</ul>
					</details>
				{/if}

				{#if cascade.outOfScopeRisks.size > 0}
					<details class="mt-3">
						<summary class="text-xs font-extrabold uppercase tracking-wider text-text-muted cursor-pointer hover:text-text">
							Out-of-scope risks ({cascade.outOfScopeRisks.size})
						</summary>
						<ul class="mt-2 space-y-1">
							{#each risks.filter((r: any) => cascade.outOfScopeRisks.has(r.id)) as risk}
								<li class="text-xs font-mono text-text-muted px-2 py-1 bg-surface-hover">
									<span class="font-bold text-text-secondary">{risk.id}</span> — {risk.description || 'No description'}
								</li>
							{/each}
						</ul>
					</details>
				{/if}

				{#if cascade.inactiveAiTools.size > 0}
					<details class="mt-3">
						<summary class="text-xs font-extrabold uppercase tracking-wider text-text-muted cursor-pointer hover:text-text">
							Inactive AI tools ({cascade.inactiveAiTools.size})
						</summary>
						<ul class="mt-2 space-y-1">
							{#each aiTools.filter((t: any) => cascade.inactiveAiTools.has(t.tool_id ?? t.id)) as tool}
								<li class="text-xs font-mono text-text-muted px-2 py-1 bg-surface-hover">
									<span class="font-bold text-text-secondary">{tool.tool_id ?? tool.id}</span> — {tool.name || tool.description || 'No description'}
								</li>
							{/each}
						</ul>
					</details>
				{/if}
			</Card>
		{/if}
	{/if}
</div>

<InfoDrawer
	open={drawerSection !== null}
	onclose={() => drawerSection = null}
	title={drawerSection === 'page' ? 'About Refine Scope' : 'Cascade Impact'}
>
	{#if drawerSection === 'page'}
		<div class="space-y-4 text-sm">
			<p><strong>Refine Scope</strong> lets you include or exclude migration components to adjust the project scope and see the cascading impact.</p>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">How It Works</h3>
				<p class="text-text-secondary">Toggle individual components or entire phases on/off. Excluded components are removed from the estimate totals. Related assumptions, risks, and AI tools cascade out automatically.</p>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Scenarios</h3>
				<p class="text-text-secondary">Use the scenario selector to see refined totals under Manual, AI-Assisted, or Best Case projections. Scope exclusions apply across all scenarios.</p>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Cascade Impact</h3>
				<p class="text-text-secondary">When components are excluded, the Cascade Impact panel shows how many assumptions, risks, and AI tools went out of scope. This helps you understand the downstream effects of scope decisions.</p>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Impact on Deliverables</h3>
				<p class="text-text-secondary">Scope exclusions carry through to all deliverables. The migration plan, risk register, and runbook will reflect the refined scope.</p>
			</div>
		</div>
	{:else if drawerSection === 'cascade'}
		<div class="space-y-4 text-sm">
			<p>When you exclude components from scope, related items are <strong>cascaded out</strong> automatically.</p>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">What Gets Cascaded</h3>
				<ul class="list-disc list-inside space-y-1 text-text-secondary">
					<li><strong>Assumptions</strong> — If all affected components are excluded, the assumption is out of scope and its widening hours are removed.</li>
					<li><strong>Risks</strong> — Risks linked only to excluded components are no longer counted in the risk register totals.</li>
					<li><strong>AI Tools</strong> — Tools that only apply to excluded components become inactive and their savings are removed.</li>
				</ul>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">How It Works</h3>
				<p class="text-text-secondary">Cascade is calculated in real time as you toggle components. Items are only removed when <em>all</em> of their linked components are excluded — if even one remains in scope, the item stays active.</p>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Reversible</h3>
				<p class="text-text-secondary">Re-including a component immediately restores its associated assumptions, risks, and AI tools.</p>
			</div>
		</div>
	{/if}
</InfoDrawer>
