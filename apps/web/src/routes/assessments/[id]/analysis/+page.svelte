<script lang="ts">
	import { page } from '$app/state';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Stat from '$lib/components/ui/Stat.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
	import CollapsibleSection from '$lib/components/ui/CollapsibleSection.svelte';
	import GapsDimensionList from '$lib/components/GapsDimensionList.svelte';
	import ConfidenceImprovementPath from '$lib/components/ConfidenceImprovementPath.svelte';
	import Tooltip from '$lib/components/ui/Tooltip.svelte';
	import InfoDrawer from '$lib/components/ui/InfoDrawer.svelte';
	import { severityVariant, KNOWN_DIMENSIONS, DIMENSION_LABELS, normalizeDiscovery } from '$lib/utils/migration-stats';

	let { data } = $props();

	const analysis = $derived(data.analysis);
	const risks = $derived((analysis?.risks ?? []) as any[]);
	const multipliers = $derived((analysis?.active_multipliers ?? []) as any[]);
	const chains = $derived((analysis?.dependency_chains ?? []) as any[]);
	const clusters = $derived((analysis?.risk_clusters ?? []) as any[]);
	const gaps = $derived(analysis?.gaps as any);
	const summary = $derived(data.summary);
	const discovery = $derived(
		normalizeDiscovery(data.discovery as Record<string, any> | null | undefined)
	);

	// Knowledge data from +page.server.ts
	const knownGotchas = $derived((data.knownGotchas ?? []) as any[]);
	const knownMultipliers = $derived((data.knownMultipliers ?? []) as any[]);
	const depChainsData = $derived(data.dependencyChains as any);
	const knownIncompatibilities = $derived((data.knownIncompatibilities ?? []) as any[]);

	// Estimate phases for cross-referencing gotcha hours
	const estimate = $derived(data.estimate as any);
	const phases = $derived((estimate?.phases ?? []) as any[]);

	// Mutable assumptions for validation toggles
	let assumptionsList = $state<any[]>([...(data.analysis?.assumptions ?? [])]);

	// Tab from URL param or default
	const urlTab = $derived(page.url.searchParams.get('tab'));
	let activeTab = $state(urlTab ?? 'risks');

	// Sync tab with URL param changes
	$effect(() => {
		if (urlTab && ['risks', 'assumptions', 'multipliers', 'dependencies', 'gaps', 'decisions'].includes(urlTab)) {
			activeTab = urlTab;
		}
	});

	const tabs = $derived([
		{ id: 'risks', label: 'Risks', count: risks.length },
		{ id: 'assumptions', label: 'Assumptions', count: assumptionsList.length },
		{ id: 'multipliers', label: 'Multipliers', count: multipliers.length },
		{ id: 'dependencies', label: 'Dependencies', count: chains.length },
		{ id: 'gaps', label: 'Gaps' },
		{ id: 'decisions', label: 'Decisions' }
	]);

	// Expanded rows
	let expandedRows = $state<Record<string, boolean>>({});

	// Assumption filter — support URL param ?filter=unvalidated
	const urlFilter = $derived(page.url.searchParams.get('filter'));
	let assumptionFilter = $state<'all' | 'unvalidated' | 'validated'>(
		(urlFilter === 'unvalidated' || urlFilter === 'validated') ? urlFilter : 'all'
	);

	$effect(() => {
		if (urlFilter === 'unvalidated' || urlFilter === 'validated') {
			assumptionFilter = urlFilter;
		}
	});

	const filteredAssumptions = $derived(
		assumptionFilter === 'all'
			? assumptionsList
			: assumptionsList.filter(a => {
				if (assumptionFilter === 'validated') return a.validation_status === 'validated';
				return a.validation_status !== 'validated';
			})
	);

	// Validate/invalidate assumption
	let savingAssumption = $state<string | null>(null);
	async function toggleAssumption(id: string, status: 'validated' | 'invalidated') {
		savingAssumption = id;
		try {
			const res = await fetch(`/api/assessments/${page.params.id}/assumptions/${id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ validation_status: status })
			});
			const result = await res.json();
			if (result.success) {
				assumptionsList = assumptionsList.map(a =>
					a.id === id ? { ...a, validation_status: status } : a
				);
			}
		} finally {
			savingAssumption = null;
		}
	}

	let drawerSection = $state<'page' | 'risks' | 'assumptions' | 'multipliers' | 'dependencies' | 'gaps' | 'gotchas' | 'decisions' | null>(null);

	// Stats from layout summary
	const openRisks = $derived(summary.risks.open);
	const criticalRisks = $derived(summary.risks.critical);
	const validatedCount = $derived(summary.assumptions.validated);
	const totalWidening = $derived(summary.assumptions.totalWidening);

	// Gotcha hours — total from estimate phases
	const totalGotchaHours = $derived(() => {
		let total = 0;
		for (const phase of phases) {
			for (const comp of (phase.components ?? []) as any[]) {
				total += comp.gotcha_hours ?? 0;
			}
		}
		return total;
	});

	// Components with gotcha hours (for cross-referencing which patterns triggered)
	const triggeredGotchaComponentIds = $derived(() => {
		const ids = new Set<string>();
		for (const phase of phases) {
			for (const comp of (phase.components ?? []) as any[]) {
				if (comp.gotcha_hours > 0) {
					ids.add(comp.id);
				}
			}
		}
		return ids;
	});

	// Check if a gotcha pattern is triggered based on affected_components overlap
	function isGotchaTriggered(gotcha: any): boolean {
		const triggered = triggeredGotchaComponentIds();
		if (!gotcha.affected_components?.length) return false;
		return gotcha.affected_components.some((c: string) => triggered.has(c));
	}

	// Active multiplier IDs for highlighting in the known multipliers reference
	const activeMultiplierIds = $derived(new Set(multipliers.map((m: any) => m.multiplier_id ?? m.id)));

	// Dependency stats
	const hardDeps = $derived(chains.filter((c: any) => c.type === 'hard'));
	const softDeps = $derived(chains.filter((c: any) => c.type !== 'hard'));

	// Critical path from dependency chains data
	const criticalPath = $derived(depChainsData?.critical_path_template?.path ?? []);

	// Gaps-specific
	const missingDimensions = $derived(
		KNOWN_DIMENSIONS.filter(d => !discovery[d])
	);

	const unknownCount = $derived(() => {
		let count = 0;
		for (const dimData of Object.values(discovery)) {
			const answers = (dimData as any)?.answers ?? {};
			for (const a of Object.values(answers) as any[]) {
				if (a.confidence === 'unknown') count++;
			}
		}
		return count;
	});

	// AI tool selections for decisions tab
	const aiTools = $derived((data.aiAlternatives ?? []) as any[]);
	const aiToggles = $derived((data.aiSelections?.selections ?? {}) as Record<string, boolean>);
	const enabledAiTools = $derived(aiTools.filter((t: any) => aiToggles[t.id] !== false));

	// Scope exclusions for decisions tab
	const excludedSet = $derived(new Set(
		Object.entries(data.scopeExclusions?.exclusions ?? {}).filter(([, v]) => v).map(([k]) => k)
	));
</script>

<svelte:head>
	<title>{data.assessment.project_name} — Analysis</title>
</svelte:head>

<div class="p-6 space-y-6 animate-enter">
	<div>
		<div class="flex items-center gap-2">
			<h1 class="text-xl font-extrabold uppercase tracking-wider">Analysis</h1>
			<button onclick={() => drawerSection = 'page'} class="flex items-center justify-center w-5 h-5 text-text-muted hover:text-primary transition-colors" aria-label="About this page">
				<span class="text-[10px] font-mono opacity-60">(i)</span>
			</button>
		</div>
		<p class="text-sm font-bold text-text-secondary mt-0.5">Risk register, assumptions, complexity, and data gaps</p>
	</div>

	{#if !analysis}
		<Card>
			<div class="py-8 text-center">
				<p class="text-lg font-extrabold uppercase tracking-wider text-text-secondary">No Analysis Data</p>
				<p class="mt-2 text-sm text-text-muted max-w-md mx-auto">
					Run <code class="brutal-border-thin bg-surface px-1.5 py-0.5 text-xs font-mono">/migrate analyze</code> to generate.
				</p>
			</div>
		</Card>
	{:else}
		<!-- Summary Cards -->
		<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
			<Card>
				<Stat label="Open Risks" value={openRisks} detail="{criticalRisks} high/critical" tooltip="Risks that haven't been mitigated or accepted. May add hours to the estimate." />
			</Card>
			<Card>
				<Stat label="Assumptions" value={assumptionsList.length} detail="{validatedCount} validated" tooltip="Unconfirmed inputs used in the estimate. Validate to increase confidence." />
			</Card>
			<Card>
				<Stat label="Multipliers" value={multipliers.length} detail="Active complexity factors" tooltip="Complexity factors that scale component hours (e.g., legacy code, custom integrations)." />
			</Card>
			<Card>
				<Stat label="Risk Widening" value="+{Math.round(totalWidening)}h" detail="From unvalidated assumptions" tooltip="Extra hours added to the pessimistic estimate due to unvalidated assumptions." />
			</Card>
			<Card>
				<Stat label="Gotcha Hours" value="+{Math.round(totalGotchaHours())}h" detail="From triggered patterns" tooltip="Additional hours from known gotcha patterns — common pitfalls triggered for this migration." />
			</Card>
		</div>

		<!-- Tabs -->
		<Tabs {tabs} active={activeTab} onchange={(id) => activeTab = id}>
			{#if activeTab === 'risks'}
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="bg-[#1a1a1a] text-white text-xs font-extrabold uppercase tracking-wider">
								<th class="text-left px-4 py-2.5">ID</th>
								<th class="text-left px-4 py-2.5">Category</th>
								<th class="text-left px-4 py-2.5">Description</th>
								<th class="text-center px-4 py-2.5 w-24">Severity</th>
								<th class="text-center px-4 py-2.5 w-24">Likelihood</th>
								<th class="text-right px-4 py-2.5 w-20">Hours</th>
								<th class="text-center px-4 py-2.5 w-20">Status</th>
								<th class="text-center px-4 py-2.5 w-12"></th>
							</tr>
						</thead>
						<tbody>
							{#each risks as risk}
								{@const expanded = expandedRows[risk.id]}
								<tr
									class="border-b border-border-light hover:bg-surface-hover transition-colors cursor-pointer select-none {expanded ? 'bg-surface-hover' : ''}"
									onclick={() => expandedRows[risk.id] = !expanded}
									aria-expanded={expanded}
								>
									<td class="px-4 py-2.5 font-mono font-bold text-xs">{risk.id}</td>
									<td class="px-4 py-2.5 text-text-secondary">{risk.category}</td>
									<td class="px-4 py-2.5 max-w-xs truncate">{risk.description}</td>
									<td class="px-4 py-2.5 text-center">
										<Badge variant={severityVariant(risk.severity)}>{risk.severity}</Badge>
									</td>
									<td class="px-4 py-2.5 text-center text-xs font-bold uppercase">{risk.likelihood}</td>
									<td class="px-4 py-2.5 text-right font-mono font-bold">{risk.estimated_hours_impact}h</td>
									<td class="px-4 py-2.5 text-center">
										<Badge variant={risk.status === 'open' ? 'warning' : 'success'}>{risk.status}</Badge>
									</td>
									<td class="px-4 py-2.5 text-center">
										<span class="inline-block text-xs text-text-muted transition-transform duration-200 {expanded ? 'rotate-90' : ''}" aria-hidden="true">&#9654;</span>
									</td>
								</tr>
								{#if expanded}
									<tr>
										<td colspan="8" class="px-4 py-4 bg-surface-hover border-b border-border-light">
											<div class="grid gap-4 sm:grid-cols-2">
												<div>
													<h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-1">Mitigation</h4>
													<p class="text-sm text-text-secondary">{risk.mitigation || 'None specified'}</p>
												</div>
												<div>
													<h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-1">Contingency</h4>
													<p class="text-sm text-text-secondary">{risk.contingency || 'None specified'}</p>
												</div>
												{#if risk.linked_assumptions && (risk.linked_assumptions as string[]).length > 0}
													<div>
														<h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-1">Linked Assumptions</h4>
														<div class="flex flex-wrap gap-1">
															{#each risk.linked_assumptions as aId}
																<span class="px-2 py-0.5 text-xs font-mono bg-warning-light text-warning border border-warning">{aId}</span>
															{/each}
														</div>
													</div>
												{/if}
												{#if risk.owner}
													<div>
														<h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-1">Owner</h4>
														<p class="text-sm font-bold">{risk.owner}</p>
													</div>
												{/if}
											</div>
										</td>
									</tr>
								{/if}
							{/each}
						</tbody>
					</table>
				</div>

				<!-- Risk Clusters -->
				{#if clusters.length > 0}
					<div class="mt-6">
						<button class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider mb-3 pb-1.5 border-b-3 border-primary text-primary w-full text-left cursor-pointer hover:opacity-80 transition-opacity" onclick={() => drawerSection = 'risks'}>
						Risk Clusters
						<span class="text-[10px] font-mono opacity-60">(i)</span>
					</button>
						<div class="grid gap-3 sm:grid-cols-2">
							{#each clusters as cluster}
								<Card padding="p-4">
									<h4 class="font-bold text-sm mb-2">{cluster.name}</h4>
									<div class="flex flex-wrap gap-1 mb-2">
										{#each (cluster.risks ?? []) as rId}
											<span class="px-1.5 py-0.5 text-[10px] font-mono bg-danger-light text-danger border border-danger">{rId}</span>
										{/each}
										{#each (cluster.assumptions ?? []) as aId}
											<span class="px-1.5 py-0.5 text-[10px] font-mono bg-warning-light text-warning border border-warning">{aId}</span>
										{/each}
									</div>
									<span class="text-xs font-mono font-bold text-danger">+{cluster.combined_widening_hours ?? 0}h widening</span>
								</Card>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Gotcha Patterns -->
				{#if knownGotchas.length > 0}
					<div class="mt-6">
						<button class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider mb-3 pb-1.5 border-b-3 border-warning text-warning w-full text-left cursor-pointer hover:opacity-80 transition-opacity" onclick={() => drawerSection = 'gotchas'}>
							Gotcha Patterns ({knownGotchas.length})
							<span class="text-[10px] font-mono opacity-60">(i)</span>
						</button>
						<div class="grid gap-3 sm:grid-cols-2">
							{#each knownGotchas as gotcha}
								{@const triggered = isGotchaTriggered(gotcha)}
								{@const expanded = expandedRows[`gotcha-${gotcha.id}`]}
								<Card padding="p-4">
									<div class="flex items-start justify-between gap-2 mb-2">
										<div class="flex items-center gap-2 flex-wrap">
											<span class="text-xs font-mono font-bold text-text-muted">{gotcha.id}</span>
											<Badge variant={gotcha.risk === 'high' ? 'danger' : gotcha.risk === 'medium' ? 'warning' : 'default'}>{gotcha.risk}</Badge>
											{#if triggered}
												<Badge variant="danger">Triggered</Badge>
											{:else}
												<span class="text-[10px] font-bold text-text-muted uppercase px-1.5 py-0.5 border border-border-light">Not triggered</span>
											{/if}
										</div>
										<span class="text-sm font-mono font-bold text-warning shrink-0">+{gotcha.hours_impact}h</span>
									</div>
									<p class="text-xs font-mono text-text-muted mb-1">{gotcha.pattern}</p>
									<p class="text-sm text-text-secondary">{gotcha.description}</p>
									<button
										class="mt-2 text-xs font-bold text-primary hover:text-primary-hover cursor-pointer"
										onclick={() => expandedRows[`gotcha-${gotcha.id}`] = !expanded}
									>
										{expanded ? 'Hide details' : 'Show mitigation'}
									</button>
									{#if expanded}
										<div class="mt-2 pt-2 border-t border-border-light space-y-2">
											<div>
												<h5 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-0.5">Mitigation</h5>
												<p class="text-xs text-text-secondary">{gotcha.mitigation}</p>
											</div>
											{#if gotcha.affected_components?.length > 0}
												<div>
													<h5 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-0.5">Affected Components</h5>
													<div class="flex flex-wrap gap-1">
														{#each gotcha.affected_components as comp}
															<span class="px-1.5 py-0.5 text-[10px] font-mono bg-warning-light text-warning border border-warning">{comp}</span>
														{/each}
													</div>
												</div>
											{/if}
										</div>
									{/if}
								</Card>
							{/each}
						</div>
					</div>
				{/if}

			{:else if activeTab === 'assumptions'}
				<!-- Assumption filters -->
				<div class="flex items-center gap-2 mb-4">
					{#each [
						{ id: 'all', label: 'All', count: assumptionsList.length },
						{ id: 'unvalidated', label: 'Unvalidated', count: assumptionsList.filter(a => a.validation_status !== 'validated').length },
						{ id: 'validated', label: 'Validated', count: validatedCount }
					] as f}
						<button
							class="px-3 py-1.5 text-xs font-bold uppercase border-2 border-brutal transition-all duration-150
								{assumptionFilter === f.id
								? 'bg-primary text-white shadow-sm -translate-x-px -translate-y-px'
								: 'bg-surface text-text-muted hover:bg-surface-hover'}
								focus-visible:outline-2 focus-visible:outline-primary"
							onclick={() => assumptionFilter = f.id as any}
						>
							{f.label}
							<span class="ml-1 font-mono">{f.count}</span>
						</button>
					{/each}
				</div>

				<div class="space-y-3">
					{#each filteredAssumptions as assumption}
						{@const expanded = expandedRows[`a-${assumption.id}`]}
						{@const isValidated = assumption.validation_status === 'validated'}
						{@const isSaving = savingAssumption === assumption.id}
						<div class="brutal-border bg-surface shadow-sm {isValidated ? 'opacity-70' : ''}">
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div
								class="flex items-center gap-3 px-4 py-3 cursor-pointer select-none hover:bg-surface-hover transition-colors"
								onclick={() => expandedRows[`a-${assumption.id}`] = !expanded}
								aria-expanded={expanded}
							>
								<div class="flex-1 min-w-0">
									<div class="flex items-center gap-2">
										<span class="text-xs font-mono font-bold text-text-muted">{assumption.id}</span>
										<Badge variant={isValidated ? 'success' : assumption.validation_status === 'invalidated' ? 'danger' : 'warning'}>
											{assumption.validation_status}
										</Badge>
										{#if assumption.dimension}
											<span class="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-info-light text-info border border-info">{assumption.dimension}</span>
										{/if}
									</div>
									<p class="text-sm mt-1 font-bold">Assumed: {assumption.assumed_value}</p>
									{#if assumption.basis}
										<p class="text-xs text-text-muted mt-0.5">Basis: {assumption.basis}</p>
									{/if}
								</div>
								<div class="text-right shrink-0">
									<span class="text-sm font-mono font-bold text-danger">+{assumption.pessimistic_widening_hours ?? 0}h</span>
									<span class="block text-[10px] text-text-muted">widening</span>
								</div>
								{#if !isValidated}
									<button
										class="px-2 py-1 text-xs font-bold uppercase border-2 border-success text-success bg-success-light
											hover:bg-success hover:text-white transition-colors
											disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-primary"
										disabled={isSaving}
										onclick={(e) => { e.stopPropagation(); toggleAssumption(assumption.id, 'validated'); }}
									>
										{isSaving ? '...' : 'Validate'}
									</button>
								{/if}
								<span class="inline-block text-xs text-text-muted transition-transform duration-200 {expanded ? 'rotate-90' : ''}" aria-hidden="true">&#9654;</span>
							</div>
							{#if expanded}
								<div class="border-t border-border-light px-4 py-3 bg-bg">
									<div class="grid gap-3 sm:grid-cols-2">
										<div>
											<h5 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-1">Validation Method</h5>
											<p class="text-sm text-text-secondary">{assumption.validation_method || 'Not specified'}</p>
										</div>
										<div>
											<h5 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-1">Confidence</h5>
											<p class="text-sm font-bold">{assumption.confidence}</p>
										</div>
										{#if (assumption.affected_components as string[])?.length > 0}
											<div class="sm:col-span-2">
												<h5 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-1">Affected Components</h5>
												<div class="flex flex-wrap gap-1">
													{#each assumption.affected_components as comp}
														<span class="px-2 py-0.5 text-xs font-mono bg-primary-light text-primary border border-primary">{comp}</span>
													{/each}
												</div>
											</div>
										{/if}
										{#if assumption.actual_value}
											<div>
												<h5 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-1">Actual Value</h5>
												<p class="text-sm font-bold text-success">{assumption.actual_value}</p>
											</div>
										{/if}
									</div>
								</div>
							{/if}
						</div>
					{/each}
				</div>

			{:else if activeTab === 'multipliers'}
				<!-- Active Multipliers -->
				<button class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider mb-3 pb-1.5 border-b-3 border-primary text-primary w-full text-left cursor-pointer hover:opacity-80 transition-opacity" onclick={() => drawerSection = 'multipliers'}>
					Active Multipliers ({multipliers.length})
					<span class="text-[10px] font-mono opacity-60">(i)</span>
				</button>
				<div class="grid gap-3 sm:grid-cols-2">
					{#each multipliers as mult}
						<Card padding="p-4">
							<div class="flex items-start justify-between gap-2">
								<div>
									<h4 class="text-sm font-bold">{mult.name || mult.multiplier_id}</h4>
									<p class="text-xs text-text-muted mt-0.5">{mult.trigger_condition}</p>
								</div>
								<span class="text-lg font-extrabold font-mono text-warning">&times;{mult.factor}</span>
							</div>
							{#if (mult.affected_components as string[])?.length > 0}
								<div class="mt-3 flex flex-wrap gap-1">
									{#each mult.affected_components as comp}
										<span class="px-1.5 py-0.5 text-[10px] font-mono bg-warning-light text-warning border border-warning">{comp}</span>
									{/each}
								</div>
							{/if}
						</Card>
					{/each}
				</div>

				{#if multipliers.length === 0}
					<Card>
						<div class="py-4 text-center text-sm text-text-muted">No active multipliers</div>
					</Card>
				{/if}

				<!-- All Known Multipliers Reference -->
				{#if knownMultipliers.length > 0}
					<div class="mt-6">
						<CollapsibleSection
							title="All Known Multipliers"
							subtitle="{knownMultipliers.length} defined — {multipliers.length} active"
							open={false}
						>
							<div class="overflow-x-auto -mx-4">
								<table class="w-full text-sm">
									<thead>
										<tr class="bg-[#1a1a1a] text-white text-xs font-extrabold uppercase tracking-wider">
											<th class="text-left px-4 py-2">ID</th>
											<th class="text-left px-4 py-2">Name</th>
											<th class="text-center px-4 py-2 w-20">Factor</th>
											<th class="text-left px-4 py-2">Trigger</th>
											<th class="text-left px-4 py-2 w-28">Category</th>
											<th class="text-center px-4 py-2 w-20">Status</th>
										</tr>
									</thead>
									<tbody>
										{#each knownMultipliers as km}
											{@const isActive = activeMultiplierIds.has(km.id)}
											<tr class="border-b border-border-light {isActive ? 'bg-warning-light' : 'opacity-60'}">
												<td class="px-4 py-2 font-mono font-bold text-xs">{km.id}</td>
												<td class="px-4 py-2 font-bold">{km.name}</td>
												<td class="px-4 py-2 text-center font-mono font-bold">&times;{km.factor}</td>
												<td class="px-4 py-2 text-xs text-text-secondary">{km.trigger}</td>
												<td class="px-4 py-2 text-xs">{km.category}</td>
												<td class="px-4 py-2 text-center">
													{#if isActive}
														<Badge variant="warning">Active</Badge>
													{:else}
														<span class="text-[10px] text-text-muted uppercase">Inactive</span>
													{/if}
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						</CollapsibleSection>
					</div>
				{/if}

			{:else if activeTab === 'dependencies'}
				<!-- Dependency Stats -->
				<div class="flex items-center gap-4 mb-4">
					<span class="text-xs font-bold"><span class="font-mono text-danger">{hardDeps.length}</span> hard</span>
					<span class="text-xs text-text-muted">|</span>
					<span class="text-xs font-bold"><span class="font-mono">{softDeps.length}</span> soft</span>
					<span class="text-xs text-text-muted">|</span>
					<span class="text-xs font-bold"><span class="font-mono">{chains.length}</span> total dependencies</span>
				</div>

				<!-- Critical Path -->
				{#if criticalPath.length > 0}
					<Card padding="p-4">
						<button class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider mb-3 pb-1.5 border-b-3 border-danger text-danger w-full text-left cursor-pointer hover:opacity-80 transition-opacity" onclick={() => drawerSection = 'dependencies'}>
							Critical Path ({criticalPath.length} steps)
							<span class="text-[10px] font-mono opacity-60">(i)</span>
						</button>
						<div class="flex items-center gap-1 flex-wrap">
							{#each criticalPath as step, i}
								<span class="font-mono font-bold text-xs px-2 py-1 bg-danger-light text-danger border-2 border-danger">{step}</span>
								{#if i < criticalPath.length - 1}
									<span class="text-danger font-bold">&rarr;</span>
								{/if}
							{/each}
						</div>
						{#if depChainsData?.critical_path_template?.description}
							<p class="mt-2 text-xs text-text-muted">{depChainsData.critical_path_template.description}</p>
						{/if}
						{#if depChainsData?.critical_path_template?.parallel_tracks?.length > 0}
							<div class="mt-3 pt-3 border-t border-border-light">
								<h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-2">Parallel Tracks</h4>
								<div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
									{#each depChainsData.critical_path_template.parallel_tracks as track}
										<div class="px-3 py-2 border-2 border-border-light bg-surface">
											<span class="text-xs font-bold">{track.name}</span>
											<span class="block text-[10px] text-text-muted font-mono mt-0.5">after {track.starts_after}</span>
											<div class="flex items-center gap-1 mt-1">
												{#each track.path as step, i}
													<span class="text-[10px] font-mono font-bold">{step}</span>
													{#if i < track.path.length - 1}
														<span class="text-text-muted text-[10px]">&rarr;</span>
													{/if}
												{/each}
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</Card>
				{/if}

				<!-- Hard Dependencies -->
				{#if hardDeps.length > 0}
					<div class="mt-4">
						<h3 class="text-xs font-extrabold uppercase tracking-wider mb-3 pb-1.5 border-b-3 border-danger text-danger">
							Hard Dependencies ({hardDeps.length})
						</h3>
						<div class="space-y-2">
							{#each hardDeps as chain}
								<Card padding="p-3">
									<div class="flex items-center gap-2 text-sm">
										<span class="font-mono font-bold px-2 py-1 bg-surface border-2 border-brutal">{chain.from}</span>
										<span class="font-bold text-danger">&rarr;</span>
										<div class="flex flex-wrap gap-1">
											{#each (Array.isArray(chain.to) ? chain.to : [chain.to]) as target}
												<span class="font-mono font-bold px-2 py-1 bg-surface border-2 border-brutal">{target}</span>
											{/each}
										</div>
										<Badge variant="danger">hard</Badge>
									</div>
									{#if chain.reason}
										<p class="mt-1.5 text-xs text-text-secondary pl-1">{chain.reason}</p>
									{/if}
								</Card>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Soft Dependencies -->
				{#if softDeps.length > 0}
					<div class="mt-4">
						<h3 class="text-xs font-extrabold uppercase tracking-wider mb-3 pb-1.5 border-b-3 border-border-light text-text-muted">
							Soft Dependencies ({softDeps.length})
						</h3>
						<div class="space-y-2">
							{#each softDeps as chain}
								<Card padding="p-3">
									<div class="flex items-center gap-2 text-sm">
										<span class="font-mono font-bold px-2 py-1 bg-surface border-2 border-brutal">{chain.from}</span>
										<span class="text-text-muted">&dashrightarrow;</span>
										<div class="flex flex-wrap gap-1">
											{#each (Array.isArray(chain.to) ? chain.to : [chain.to]) as target}
												<span class="font-mono font-bold px-2 py-1 bg-surface border-2 border-brutal">{target}</span>
											{/each}
										</div>
										<Badge variant="default">soft</Badge>
									</div>
									{#if chain.reason}
										<p class="mt-1.5 text-xs text-text-secondary pl-1">{chain.reason}</p>
									{/if}
								</Card>
							{/each}
						</div>
					</div>
				{/if}

				{#if chains.length === 0}
					<Card>
						<div class="py-4 text-center text-sm text-text-muted">No dependency chains defined</div>
					</Card>
				{/if}

			{:else if activeTab === 'gaps'}
				<!-- Confidence Stats -->
				<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
					<Card>
						<div class="space-y-3">
							<Stat label="Confidence Score" value="{summary.confidence}%" detail="{gaps?.confirmed_answers ?? 0}/{gaps?.total_answers ?? 0} confirmed" tooltip="Ratio of confirmed answers to total. Higher = more reliable estimate." />
							<ProgressBar value={summary.confidence} variant={summary.confidence >= 70 ? 'success' : summary.confidence >= 40 ? 'warning' : 'danger'} />
						</div>
					</Card>
					<Card>
						<Stat label="Unknown Answers" value={gaps?.unknown_answers ?? 0} detail="Missing data points" tooltip="Data points with no answer. Each unknown widens the estimate range." />
					</Card>
					<Card>
						<Stat label="Assumed Answers" value={gaps?.assumed_answers ?? 0} detail="Need validation" tooltip="Answers based on assumptions. Validate to reduce risk widening." />
					</Card>
					<Card>
						<Stat label="Risk Widening" value="+{Math.round(totalWidening)}h" detail="{summary.assumptions.unvalidated} unvalidated assumptions" tooltip="Additional hours in the pessimistic estimate from unvalidated assumptions." />
					</Card>
				</div>

				<!-- Missing Dimensions -->
				{#if missingDimensions.length > 0}
					<Card>
						<button class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider mb-3 pb-1.5 border-b-3 border-danger text-danger w-full text-left cursor-pointer hover:opacity-80 transition-opacity" onclick={() => drawerSection = 'gaps'}>
							Missing Dimensions ({missingDimensions.length})
							<span class="text-[10px] font-mono opacity-60">(i)</span>
						</button>
						<div class="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
							{#each missingDimensions as dim}
								<div class="flex items-center gap-2 px-3 py-2 border-2 border-danger bg-danger-light">
									<span class="text-danger font-bold text-xs">&#10007;</span>
									<span class="text-sm font-bold">{DIMENSION_LABELS[dim] ?? dim}</span>
								</div>
							{/each}
						</div>
						<p class="mt-3 text-xs text-text-muted">
							Run <code class="brutal-border-thin bg-surface px-1 py-0.5 text-xs font-mono">/migrate discover</code> to fill these in.
						</p>
					</Card>
				{/if}

				<!-- Gaps by Dimension -->
				<div>
					<button class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider mb-3 pb-1.5 border-b-3 border-warning text-warning w-full text-left cursor-pointer hover:opacity-80 transition-opacity" onclick={() => drawerSection = 'gaps'}>
						Gaps by Dimension
						<span class="text-[10px] font-mono opacity-60">(i)</span>
					</button>
					<GapsDimensionList {discovery} />
				</div>

				<!-- Unvalidated Assumptions Link -->
				{#if summary.assumptions.unvalidated > 0}
					<Card padding="p-4">
						<div class="flex items-center justify-between">
							<span class="text-sm text-text-secondary">
								{summary.assumptions.unvalidated} unvalidated assumption{summary.assumptions.unvalidated > 1 ? 's' : ''} contributing <span class="font-mono font-bold text-danger">+{Math.round(totalWidening)}h</span> widening
							</span>
							<button
								class="text-xs font-bold text-primary hover:text-primary-hover"
								onclick={() => { activeTab = 'assumptions'; assumptionFilter = 'unvalidated'; }}
							>
								View assumptions &rarr;
							</button>
						</div>
					</Card>
				{/if}

				<!-- Confidence Improvement Path -->
				<Card padding="p-4">
					<h3 class="text-xs font-extrabold uppercase tracking-wider mb-2 text-primary">How to Improve Confidence</h3>
					<ConfidenceImprovementPath
						{discovery}
						unvalidatedCount={summary.assumptions.unvalidated}
						{totalWidening}
						unknownCount={unknownCount()}
					/>
				</Card>

			{:else if activeTab === 'decisions'}
				<!-- Key Decisions -->
				<div class="space-y-6">
					<!-- Active Multiplier Decisions -->
					<Card>
						<h3 class="text-xs font-extrabold uppercase tracking-wider mb-3 pb-1.5 border-b-3 border-warning text-warning">
							Active Multipliers ({multipliers.length})
						</h3>
						{#if multipliers.length > 0}
							<div class="space-y-3">
								{#each multipliers as mult}
									<div class="flex items-start justify-between gap-2 py-2 border-b border-border-light last:border-0">
										<div>
											<span class="text-sm font-bold">{mult.name || mult.multiplier_id}</span>
											<p class="text-xs text-text-muted mt-0.5">Trigger: {mult.trigger_condition}</p>
											{#if (mult.affected_components as string[])?.length > 0}
												<div class="flex flex-wrap gap-1 mt-1">
													{#each mult.affected_components as comp}
														<span class="px-1.5 py-0.5 text-[10px] font-mono bg-warning-light text-warning border border-warning">{comp}</span>
													{/each}
												</div>
											{/if}
										</div>
										<span class="font-mono font-bold text-warning shrink-0">&times;{mult.factor}</span>
									</div>
								{/each}
							</div>
						{:else}
							<p class="text-sm text-text-muted">No multipliers triggered for this assessment.</p>
						{/if}
					</Card>

					<!-- Triggered Gotcha Patterns -->
					<Card>
						<h3 class="text-xs font-extrabold uppercase tracking-wider mb-3 pb-1.5 border-b-3 border-danger text-danger">
							Triggered Gotcha Patterns
						</h3>
						{@const triggeredGotchas = knownGotchas.filter(g => isGotchaTriggered(g))}
						{#if triggeredGotchas.length > 0}
							<div class="space-y-3">
								{#each triggeredGotchas as gotcha}
									<div class="py-2 border-b border-border-light last:border-0">
										<div class="flex items-start justify-between gap-2">
											<div>
												<div class="flex items-center gap-2">
													<span class="text-sm font-bold">{gotcha.id}</span>
													<Badge variant={gotcha.risk === 'high' ? 'danger' : gotcha.risk === 'medium' ? 'warning' : 'default'}>{gotcha.risk}</Badge>
												</div>
												<p class="text-xs text-text-secondary mt-0.5">{gotcha.description}</p>
											</div>
											<span class="font-mono font-bold text-danger shrink-0">+{gotcha.hours_impact}h</span>
										</div>
										<div class="mt-1.5 px-3 py-2 bg-success-light border border-success">
											<span class="text-xs font-extrabold uppercase tracking-wider text-success">Mitigation:</span>
											<p class="text-xs text-text-secondary mt-0.5">{gotcha.mitigation}</p>
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<p class="text-sm text-text-muted">No gotcha patterns triggered for this assessment.</p>
						{/if}
					</Card>

					<!-- AI Tool Selections -->
					<Card>
						<h3 class="text-xs font-extrabold uppercase tracking-wider mb-3 pb-1.5 border-b-3 border-success text-success">
							AI Tool Selections ({enabledAiTools.length}/{aiTools.length} enabled)
						</h3>
						{#if enabledAiTools.length > 0}
							<div class="space-y-2">
								{#each enabledAiTools as tool}
									<div class="flex items-center justify-between py-1.5 border-b border-border-light last:border-0">
										<div>
											<span class="text-sm font-bold">{tool.name}</span>
											{#if tool.vendor}
												<span class="text-xs text-text-muted ml-1">by {tool.vendor}</span>
											{/if}
										</div>
										<span class="text-xs font-mono font-bold text-success">-{tool.hours_saved?.expected ?? 0}h</span>
									</div>
								{/each}
							</div>
						{:else}
							<p class="text-sm text-text-muted">No AI tools are enabled.</p>
						{/if}
					</Card>

					<!-- Scope Exclusions -->
					{#if excludedSet.size > 0}
						<Card>
							<h3 class="text-xs font-extrabold uppercase tracking-wider mb-3 pb-1.5 border-b-3 border-primary text-primary">
								Scope Exclusions ({excludedSet.size})
							</h3>
							<div class="flex flex-wrap gap-1">
								{#each [...excludedSet] as compId}
									<span class="px-2 py-0.5 text-xs font-mono bg-danger-light text-danger border border-danger">{compId}</span>
								{/each}
							</div>
						</Card>
					{/if}

					<!-- Known Incompatibilities -->
					{#if knownIncompatibilities.length > 0}
						<Card>
							<button class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider mb-3 pb-1.5 border-b-3 border-primary text-primary w-full text-left cursor-pointer hover:opacity-80 transition-opacity" onclick={() => drawerSection = 'decisions'}>
								Known Incompatibilities
								<span class="text-[10px] font-mono opacity-60">(i)</span>
							</button>
							<div class="space-y-4">
								{#each knownIncompatibilities as section}
									<CollapsibleSection
										title={section.heading}
										subtitle="{section.entries.length} items"
										open={false}
									>
										<div class="space-y-3">
											{#each section.entries as entry}
												<div class="border-b border-border-light pb-3 last:border-0 last:pb-0">
													<h4 class="text-sm font-bold mb-1">{entry.title}</h4>
													{#if entry.aws}
														<div class="text-xs mb-0.5">
															<span class="font-bold text-text-muted">AWS:</span>
															<span class="text-text-secondary">{entry.aws}</span>
														</div>
													{/if}
													{#if entry.azure}
														<div class="text-xs mb-0.5">
															<span class="font-bold text-text-muted">Azure:</span>
															<span class="text-text-secondary">{entry.azure}</span>
														</div>
													{/if}
													{#if entry.impact}
														<div class="text-xs mt-1 px-2 py-1 bg-warning-light border border-warning">
															<span class="font-bold text-warning">Impact:</span>
															<span class="text-text-secondary">{entry.impact}</span>
														</div>
													{/if}
												</div>
											{/each}
										</div>
									</CollapsibleSection>
								{/each}
							</div>
						</Card>
					{/if}

					<!-- Methodology Notes -->
					<Card>
						<h3 class="text-xs font-extrabold uppercase tracking-wider mb-3 pb-1.5 border-b-3 border-primary text-primary">
							Methodology Notes
						</h3>
						<div class="space-y-4 text-sm text-text-secondary">
							<div>
								<h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-1">Three-Point Estimation</h4>
								<p>Each component is estimated with optimistic, expected, and pessimistic values. The expected value is used for totals. The pessimistic value includes assumption widening and gotcha buffers.</p>
							</div>
							<div>
								<h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-1">Confidence Score</h4>
								<p>Calculated as the ratio of confirmed answers to total discovery answers. Higher confidence means fewer assumptions and a narrower estimate range.</p>
							</div>
							<div>
								<h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-1">Multiplier Compounding</h4>
								<p>Multipliers compound multiplicatively. If a component has a &times;1.3 and &times;1.5 multiplier, the effective factor is &times;1.95 (1.3 &times; 1.5). This reflects real-world complexity stacking.</p>
							</div>
							<div>
								<h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-1">AI Savings Cap</h4>
								<p>AI tool savings are capped at 50% per component to prevent over-optimistic projections. Even with multiple AI tools enabled, no component can have more than half its hours reduced.</p>
							</div>
						</div>
					</Card>
				</div>
			{/if}
		</Tabs>
	{/if}
</div>

<InfoDrawer
	open={drawerSection !== null}
	onclose={() => drawerSection = null}
	title={
		drawerSection === 'page' ? 'About Analysis'
		: drawerSection === 'risks' ? 'Risks & Clusters'
		: drawerSection === 'assumptions' ? 'Assumptions'
		: drawerSection === 'multipliers' ? 'Multipliers'
		: drawerSection === 'dependencies' ? 'Dependency Chains'
		: drawerSection === 'gaps' ? 'Gaps & Missing Data'
		: drawerSection === 'gotchas' ? 'Gotcha Patterns'
		: drawerSection === 'decisions' ? 'Known Incompatibilities'
		: ''
	}
>
	{#if drawerSection === 'page'}
		<div class="space-y-4 text-sm">
			<p>The <strong>Analysis</strong> page is the data-dense deep dive into your migration assessment. It surfaces risk factors, assumptions, complexity multipliers, dependency chains, data gaps, and key decisions.</p>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Tabs</h3>
				<ul class="list-disc list-inside space-y-1 text-text-secondary">
					<li><strong>Risks</strong> — Risk register with severity, likelihood, hours impact, mitigation. Includes risk clusters and gotcha patterns.</li>
					<li><strong>Assumptions</strong> — Unconfirmed inputs. Validate them to reduce estimate uncertainty and increase confidence.</li>
					<li><strong>Multipliers</strong> — Complexity factors that scale component hours. Shows active + all known multipliers.</li>
					<li><strong>Dependencies</strong> — Ordering constraints between components. Shows critical path and hard/soft dependency chains.</li>
					<li><strong>Gaps</strong> — Missing or unverified data. Shows confidence score, missing dimensions, and improvement path.</li>
					<li><strong>Decisions</strong> — Aggregated documentation: active multipliers, triggered gotchas, AI selections, incompatibilities, and methodology.</li>
				</ul>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">How Analysis Feeds Into Estimates</h3>
				<p class="text-text-secondary">Multipliers scale base component hours. Gotcha patterns add buffer hours. Assumptions widen the pessimistic estimate. All of this flows into the Estimate page totals.</p>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Related Pages</h3>
				<ul class="list-disc list-inside space-y-1 text-text-secondary">
					<li><a href="/assessments/{page.params.id}/estimate" class="text-primary font-bold">Estimate</a> — See how analysis data affects hours</li>
					<li><a href="/assessments/{page.params.id}/discovery" class="text-primary font-bold">Discovery</a> — Fill data gaps to improve confidence</li>
					<li><a href="/assessments/{page.params.id}/refine" class="text-primary font-bold">Refine</a> — Exclude components and see cascade impact</li>
				</ul>
			</div>
		</div>
	{:else if drawerSection === 'risks'}
		<div class="space-y-4 text-sm">
			<p><strong>Risks</strong> are factors that could increase migration effort beyond the current estimate.</p>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Severity Levels</h3>
				<div class="space-y-1 font-mono text-xs">
					<p><span class="inline-block w-3 h-3 bg-danger border border-danger mr-1.5"></span> <strong>Critical / High</strong> — Likely to cause significant delays or rework.</p>
					<p><span class="inline-block w-3 h-3 bg-warning border border-warning mr-1.5"></span> <strong>Medium</strong> — May add hours. Should have a mitigation plan.</p>
					<p><span class="inline-block w-3 h-3 bg-success border border-success mr-1.5"></span> <strong>Low</strong> — Minor impact. Monitor but unlikely to derail.</p>
				</div>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Risk Clusters</h3>
				<p class="text-text-secondary">Clusters group related risks and assumptions that compound each other. The combined widening hours show the total additional effort if the cluster materializes.</p>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Table Columns</h3>
				<ul class="list-disc list-inside space-y-1 text-text-secondary">
					<li><strong>Severity</strong> — Impact level (critical, high, medium, low)</li>
					<li><strong>Likelihood</strong> — Probability of occurrence</li>
					<li><strong>Hours</strong> — Additional effort if the risk materializes</li>
					<li><strong>Status</strong> — Open (active) or mitigated</li>
				</ul>
			</div>
		</div>
	{:else if drawerSection === 'assumptions'}
		<div class="space-y-4 text-sm">
			<p><strong>Assumptions</strong> are unconfirmed inputs used to build the estimate.</p>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Validation Status</h3>
				<div class="space-y-2 text-text-secondary">
					<p><strong class="text-success">Validated</strong> — Confirmed correct. Removes uncertainty from the estimate.</p>
					<p><strong class="text-warning">Unvalidated</strong> — Pending. Adds widening hours to the pessimistic estimate.</p>
					<p><strong class="text-danger">Invalidated</strong> — Proven wrong. Affected components need re-estimation.</p>
				</div>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Widening Hours</h3>
				<p class="text-text-secondary">Each unvalidated assumption adds a widening buffer to the pessimistic estimate. Validating assumptions is the fastest way to narrow the estimate range and increase confidence.</p>
			</div>
		</div>
	{:else if drawerSection === 'multipliers'}
		<div class="space-y-4 text-sm">
			<p><strong>Multipliers</strong> are complexity factors that scale component hours up or down.</p>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">How They Work</h3>
				<p class="text-text-secondary">Each multiplier has a trigger condition (e.g., "legacy codebase", "custom integrations") and a factor (&times;1.2, &times;1.5, etc.). When triggered, the factor multiplies the base hours of affected components.</p>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Compounding</h3>
				<p class="text-text-secondary">Multiple multipliers on the same component compound multiplicatively. For example, &times;1.3 and &times;1.5 result in &times;1.95 effective factor.</p>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Known vs Active</h3>
				<p class="text-text-secondary">The reference table shows all {knownMultipliers.length} known multipliers. Active ones are highlighted — they were triggered by this assessment's discovery data. Inactive ones show what <em>could</em> be triggered under different conditions.</p>
			</div>
		</div>
	{:else if drawerSection === 'dependencies'}
		<div class="space-y-4 text-sm">
			<p><strong>Dependency chains</strong> define ordering constraints between migration components.</p>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Dependency Types</h3>
				<div class="space-y-2 text-text-secondary">
					<p><strong class="text-danger">Hard</strong> — Strict ordering. The target cannot start until the source completes. Affects the critical path.</p>
					<p><strong class="text-text">Soft</strong> — Preferred ordering. Can be parallelized with some risk. Does not block the critical path.</p>
				</div>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Critical Path</h3>
				<p class="text-text-secondary">The critical path is the longest chain of hard dependencies. It determines the minimum calendar duration of the migration. Parallel tracks can execute simultaneously alongside the critical path.</p>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Impact on Timeline</h3>
				<p class="text-text-secondary">Hard dependencies lengthen the critical path. Long chains of hard dependencies are the primary driver of calendar duration (as opposed to total effort hours).</p>
			</div>
		</div>
	{:else if drawerSection === 'gaps'}
		<div class="space-y-4 text-sm">
			<p><strong>Gaps</strong> represent missing or unverified data that reduces estimate confidence.</p>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Missing Dimensions</h3>
				<p class="text-text-secondary">Entire discovery dimensions with no data. These are the biggest gaps — run <code class="brutal-border-thin bg-surface px-1 py-0.5 text-xs font-mono">/migrate discover</code> to fill them in.</p>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Unknown Answers</h3>
				<p class="text-text-secondary">Individual questions with no answer within a completed dimension. Each unknown widens the estimate range.</p>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Assumed Answers</h3>
				<p class="text-text-secondary">Answers that are educated guesses. They add widening hours until validated. Focus on validating high-impact assumptions first.</p>
			</div>
		</div>
	{:else if drawerSection === 'gotchas'}
		<div class="space-y-4 text-sm">
			<p><strong>Gotcha patterns</strong> are known pitfalls that add buffer hours to specific components when their trigger conditions are met.</p>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">How They Work</h3>
				<p class="text-text-secondary">Each pattern has a trigger condition (e.g., "cd_instances >= 4 AND session.type != 'redis'"). When triggered, the pattern's hours impact is added to the affected components' estimates.</p>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Risk Levels</h3>
				<div class="space-y-1 font-mono text-xs">
					<p><span class="inline-block w-3 h-3 bg-danger border border-danger mr-1.5"></span> <strong>High</strong> — Significant hours impact, likely to cause delays if unmitigated.</p>
					<p><span class="inline-block w-3 h-3 bg-warning border border-warning mr-1.5"></span> <strong>Medium</strong> — Moderate impact. Plan mitigation in advance.</p>
					<p><span class="inline-block w-3 h-3 bg-success border border-success mr-1.5"></span> <strong>Low</strong> — Minor impact. Good to know but manageable.</p>
				</div>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Triggered vs. Not Triggered</h3>
				<p class="text-text-secondary">Patterns are cross-referenced with your estimate data. "Triggered" patterns have matching components with gotcha hours in the estimate. "Not triggered" patterns show what could trigger under different conditions.</p>
			</div>
		</div>
	{:else if drawerSection === 'decisions'}
		<div class="space-y-4 text-sm">
			<p><strong>Known incompatibilities</strong> are documented differences between AWS and Azure services that affect the migration.</p>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Categories</h3>
				<ul class="list-disc list-inside space-y-1 text-text-secondary">
					<li><strong>No Direct Equivalent</strong> — AWS services with no 1:1 Azure mapping. Requires architecture changes.</li>
					<li><strong>Behavioral Differences</strong> — Services that exist on both clouds but work differently.</li>
					<li><strong>Sitecore-Specific</strong> — Incompatibilities specific to Sitecore's Azure deployment patterns.</li>
				</ul>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Using This Data</h3>
				<p class="text-text-secondary">Review incompatibilities relevant to your migration scope. Each entry includes the impact and what needs to change. Use this to validate assumptions and identify risks you may have missed.</p>
			</div>
		</div>
	{/if}
</InfoDrawer>
