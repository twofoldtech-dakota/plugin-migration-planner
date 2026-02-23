<script lang="ts">
	import { page } from '$app/state';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import CollapsibleSection from '$lib/components/ui/CollapsibleSection.svelte';
	import GapsDimensionList from '$lib/components/GapsDimensionList.svelte';
	import ConfidenceImprovementPath from '$lib/components/ConfidenceImprovementPath.svelte';
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

	const statusBadge = $derived(
		summary.hasAnalysis
			? { variant: 'success' as const, label: 'Complete' }
			: summary.hasDiscovery
			? { variant: 'default' as const, label: 'In Progress' }
			: { variant: 'muted'   as const, label: 'Not Run' }
	);
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
	let assumptionsList = $state<any[]>([]);

	$effect(() => {
		assumptionsList = [...(data.analysis?.assumptions ?? [])];
	});

	// ── Tab configuration (4 tabs, backward-compat mapping) ──────
	const TAB_MAP: Record<string, string> = {
		'risks': 'risk-register', 'risk-register': 'risk-register',
		'assumptions': 'assumptions',
		'multipliers': 'complexity', 'dependencies': 'complexity', 'complexity': 'complexity',
		'gaps': 'reference', 'decisions': 'reference', 'reference': 'reference'
	};

	const urlTab = $derived(page.url.searchParams.get('tab'));
	let activeTab = $state('risk-register');

	$effect(() => {
		const mapped = TAB_MAP[urlTab ?? ''];
		if (mapped) activeTab = mapped;
	});

	// Expanded rows
	let expandedRows = $state<Record<string, boolean>>({});

	// Assumption filter
	const urlFilter = $derived(page.url.searchParams.get('filter'));
	let assumptionFilter = $state<'all' | 'unvalidated' | 'validated'>('all');

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

	const totalGotchaHours = $derived(() => {
		let total = 0;
		for (const phase of phases) {
			for (const comp of (phase.components ?? []) as any[]) {
				total += comp.gotcha_hours ?? 0;
			}
		}
		return total;
	});

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

	function isGotchaTriggered(gotcha: any): boolean {
		const triggered = triggeredGotchaComponentIds();
		if (!gotcha.affected_components?.length) return false;
		return gotcha.affected_components.some((c: string) => triggered.has(c));
	}

	const activeMultiplierIds = $derived(new Set(multipliers.map((m: any) => m.multiplier_id ?? m.id)));

	const hardDeps = $derived(chains.filter((c: any) => c.type === 'hard'));
	const softDeps = $derived(chains.filter((c: any) => c.type !== 'hard'));
	const criticalPath = $derived(depChainsData?.critical_path_template?.path ?? []);

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

	const aiTools = $derived((data.aiAlternatives ?? []) as any[]);
	const aiToggles = $derived((data.aiSelections?.selections ?? {}) as Record<string, boolean>);
	const enabledAiTools = $derived(aiTools.filter((t: any) => aiToggles[t.id] !== false));

	const excludedSet = $derived(new Set(
		Object.entries(data.scopeExclusions?.exclusions ?? {}).filter(([, v]) => v).map(([k]) => k)
	));

	// ── Executive summary helpers ─────────────────────────────

	const risksBySeverity = $derived({
		critical: risks.filter((r: any) => r.severity === 'critical').length,
		high: risks.filter((r: any) => r.severity === 'high').length,
		medium: risks.filter((r: any) => r.severity === 'medium').length,
		low: risks.filter((r: any) => r.severity === 'low').length
	});

	const severityRank: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
	const sortedRisks = $derived(
		[...risks].sort((a: any, b: any) => (severityRank[a.severity] ?? 4) - (severityRank[b.severity] ?? 4))
	);

	const validationProgress = $derived(
		assumptionsList.length > 0 ? Math.round((validatedCount / assumptionsList.length) * 100) : 100
	);

	const sortedFilteredAssumptions = $derived(
		[...filteredAssumptions].sort((a: any, b: any) => {
			if (a.validation_status === 'validated' && b.validation_status !== 'validated') return 1;
			if (a.validation_status !== 'validated' && b.validation_status === 'validated') return -1;
			return (b.pessimistic_widening_hours ?? 0) - (a.pessimistic_widening_hours ?? 0);
		})
	);

	const triggeredGotchasList = $derived(knownGotchas.filter((g: any) => isGotchaTriggered(g)));
	const untriggeredGotchasList = $derived(knownGotchas.filter((g: any) => !isGotchaTriggered(g)));

	const tabs = $derived([
		{ id: 'risk-register', label: 'Risk Register', count: risks.length + triggeredGotchasList.length },
		{ id: 'assumptions', label: 'Assumptions', count: assumptionsList.length },
		{ id: 'complexity', label: 'Complexity', count: multipliers.length + chains.length },
		{ id: 'reference', label: 'Reference' }
	]);

	function severityAccent(severity: string): string {
		const map: Record<string, string> = {
			critical: 'var(--color-danger)',
			high: 'var(--color-warning)',
			medium: '#d97706',
			low: 'var(--color-success)'
		};
		return map[severity] ?? 'var(--color-border-light)';
	}

	function validationAccent(status: string): string {
		const map: Record<string, string> = {
			validated: 'var(--color-success)',
			invalidated: 'var(--color-danger)',
			unvalidated: 'var(--color-warning)'
		};
		return map[status] ?? 'var(--color-border-light)';
	}

	// Top unvalidated assumptions sorted by hours impact (for executive summary)
	const topUnvalidated = $derived(
		assumptionsList
			.filter(a => a.validation_status !== 'validated')
			.sort((a, b) => (b.pessimistic_widening_hours ?? 0) - (a.pessimistic_widening_hours ?? 0))
			.slice(0, 5)
	);

	const topSavings = $derived(
		topUnvalidated.reduce((sum, a) => sum + (a.pessimistic_widening_hours ?? 0), 0)
	);

	// Lookup maps for resolving IDs in risk clusters
	const risksById = $derived(
		Object.fromEntries(risks.map((r: any) => [r.id, r])) as Record<string, any>
	);
	const assumptionsById = $derived(
		Object.fromEntries(assumptionsList.map((a: any) => [a.id, a])) as Record<string, any>
	);

	const confidenceVerdict = $derived(() => {
		const conf = summary.confidence;
		const unval = summary.assumptions.unvalidated;
		if (conf >= 80) return 'High confidence — estimate range is narrow and reliable.';
		if (conf >= 60) return `Moderate confidence — ${unval} unvalidated assumption${unval !== 1 ? 's' : ''} add +${Math.round(totalWidening)}h to the pessimistic estimate.`;
		return `Low confidence — significant data gaps remain. ${unval} assumption${unval !== 1 ? 's' : ''} need validation and ${unknownCount()} discovery answers are unknown.`;
	});

	function confidenceColor(conf: number): string {
		if (conf >= 70) return 'text-success';
		if (conf >= 40) return 'text-warning';
		return 'text-danger';
	}

	function confidenceBg(conf: number): string {
		if (conf >= 70) return 'bg-success';
		if (conf >= 40) return 'bg-warning';
		return 'bg-danger';
	}

	/** Build a readable summary for the executive action list. */
	function assumptionLabel(a: any): string {
		// If assumed_value is descriptive (long string, not just a number), use it
		const val = String(a.assumed_value ?? '');
		if (val.length > 10 && !/^\[/.test(val)) return val;
		// Otherwise, humanize the ID: "asmp_caching_redis_memory_gb" → "Caching redis memory gb"
		const name = (a.id ?? '')
			.replace(/^asmp_/, '')
			.replace(/_/g, ' ')
			.replace(/^\w/, (c: string) => c.toUpperCase());
		return val && val !== 'undefined' ? `${name}: ${val}` : name;
	}
</script>

<svelte:head>
	<title>{data.assessment.project_name} — Analysis</title>
</svelte:head>

<div class="p-6 space-y-6 animate-enter">
	<!-- Page Header -->
	<div>
		<div class="flex items-center gap-2">
			<h1 class="text-xl font-extrabold uppercase tracking-wider">Analysis</h1>
			<Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
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
		<!-- ── Executive Summary ────────────────────────────── -->
		<div class="brutal-border bg-surface shadow-md overflow-hidden">
			<div class="flex items-start gap-6 px-5 py-4">
				<!-- Confidence gauge -->
				<div class="shrink-0">
					<div class="text-[10px] font-extrabold uppercase tracking-widest text-text-muted mb-1">Confidence</div>
					<div class="text-4xl font-extrabold font-mono {confidenceColor(summary.confidence)}">{summary.confidence}%</div>
					<div class="w-24 h-2 bg-border-light mt-2 overflow-hidden">
						<div class="h-full {confidenceBg(summary.confidence)} transition-all duration-500" style:width="{summary.confidence}%"></div>
					</div>
				</div>
				<!-- Verdict + key metrics -->
				<div class="flex-1 min-w-0">
					<p class="text-sm text-text-secondary">{confidenceVerdict()}</p>
					<div class="grid grid-cols-2 sm:grid-cols-4 mt-3 border-2 border-brutal bg-surface">
						<button
							class="group px-3 py-2.5 text-left border-r border-b sm:border-b-0 border-border-light hover:bg-surface-hover transition-colors cursor-pointer"
							onclick={() => activeTab = 'risk-register'}
						>
							<span class="block text-xl font-extrabold font-mono">{openRisks}{#if criticalRisks > 0}<span class="text-danger text-sm ml-1">({criticalRisks})</span>{/if}</span>
							<span class="text-[10px] font-extrabold uppercase tracking-widest text-text-muted group-hover:text-primary transition-colors">Open Risks</span>
						</button>
						<button
							class="group px-3 py-2.5 text-left border-b sm:border-b-0 sm:border-r border-border-light hover:bg-surface-hover transition-colors cursor-pointer"
							onclick={() => activeTab = 'assumptions'}
						>
							<span class="block text-xl font-extrabold font-mono">{summary.assumptions.unvalidated}<span class="text-text-muted text-sm">/{assumptionsList.length}</span></span>
							<span class="text-[10px] font-extrabold uppercase tracking-widest text-text-muted group-hover:text-primary transition-colors">Unvalidated</span>
						</button>
						<button
							class="group px-3 py-2.5 text-left border-r border-border-light hover:bg-surface-hover transition-colors cursor-pointer"
							onclick={() => activeTab = 'complexity'}
						>
							<span class="block text-xl font-extrabold font-mono">{multipliers.length}</span>
							<span class="text-[10px] font-extrabold uppercase tracking-widest text-text-muted group-hover:text-primary transition-colors">Multipliers</span>
						</button>
						<div class="px-3 py-2.5 text-left">
							<span class="block text-xl font-extrabold font-mono text-danger">+{Math.round(totalWidening + totalGotchaHours())}h</span>
							<span class="text-[10px] font-extrabold uppercase tracking-widest text-text-muted">Buffer</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Highest-impact actions -->
			{#if topUnvalidated.length > 0}
				<div class="border-t-2 border-brutal px-5 py-4 bg-bg">
					<div class="flex items-center justify-between mb-3">
						<h3 class="text-xs font-extrabold uppercase tracking-wider">Highest-Impact Actions</h3>
						<span class="text-xs text-text-muted">Validate to save up to <span class="font-mono font-bold text-success">{topSavings}h</span></span>
					</div>
					<div class="space-y-2">
						{#each topUnvalidated as assumption, i}
							{@const isSaving = savingAssumption === assumption.id}
							{@const expanded = expandedRows[`hia-${assumption.id}`]}
							<div class="brutal-border-thin bg-surface overflow-hidden" style:border-left="4px solid var(--color-warning)">
								<button
									class="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left hover:bg-surface-hover transition-colors cursor-pointer select-none"
									onclick={() => expandedRows[`hia-${assumption.id}`] = !expanded}
									aria-expanded={expanded}
								>
									<span class="text-xs font-mono font-bold text-text-muted w-4 shrink-0">{i + 1}.</span>
									<span class="flex-1 min-w-0 text-text-secondary">{assumptionLabel(assumption)}</span>
									<span class="text-xs font-mono font-bold text-danger shrink-0">+{assumption.pessimistic_widening_hours ?? 0}h</span>
									<span class="inline-block text-xs text-text-muted transition-transform duration-200 shrink-0 {expanded ? 'rotate-90' : ''}" aria-hidden="true">&#9654;</span>
								</button>
								{#if expanded}
									<div class="border-t border-border-light px-3 py-3 bg-bg">
										<div class="grid gap-3 sm:grid-cols-2 text-xs">
											{#if assumption.basis}
												<div>
													<h5 class="font-extrabold uppercase tracking-wider text-text-muted mb-0.5">Basis</h5>
													<p class="text-text-secondary">{assumption.basis}</p>
												</div>
											{/if}
											{#if assumption.validation_method}
												<div>
													<h5 class="font-extrabold uppercase tracking-wider text-text-muted mb-0.5">Validation Method</h5>
													<p class="text-text-secondary">{assumption.validation_method}</p>
												</div>
											{/if}
											{#if assumption.confidence}
												<div>
													<h5 class="font-extrabold uppercase tracking-wider text-text-muted mb-0.5">Confidence</h5>
													<p class="font-bold">{assumption.confidence}</p>
												</div>
											{/if}
											{#if assumption.dimension}
												<div>
													<h5 class="font-extrabold uppercase tracking-wider text-text-muted mb-0.5">Dimension</h5>
													<span class="px-1.5 py-0.5 text-[10px] font-bold uppercase bg-info-light text-info border border-info">{assumption.dimension}</span>
												</div>
											{/if}
											{#if (assumption.affected_components as string[])?.length > 0}
												<div class="sm:col-span-2">
													<h5 class="font-extrabold uppercase tracking-wider text-text-muted mb-0.5">Affected Components</h5>
													<div class="flex flex-wrap gap-1">
														{#each assumption.affected_components as comp}
															<span class="px-1.5 py-0.5 text-[10px] font-mono bg-primary-light text-primary border border-primary">{comp}</span>
														{/each}
													</div>
												</div>
											{/if}
										</div>
										<button
											class="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-extrabold uppercase tracking-wider
												bg-success text-white border-2 border-brutal
												hover:-translate-y-px hover:shadow-sm active:translate-y-0 active:shadow-none
												transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed
												focus-visible:outline-2 focus-visible:outline-primary"
											disabled={isSaving}
											onclick={() => toggleAssumption(assumption.id, 'validated')}
										>
											{#if isSaving}
												Validating...
											{:else}
												<span>&#10003;</span> Validate — saves +{assumption.pessimistic_widening_hours ?? 0}h
											{/if}
										</button>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<!-- ── Tabs ─────────────────────────────────────────── -->
		<Tabs {tabs} active={activeTab} onchange={(id) => activeTab = id}>

			<!-- ═══ RISK REGISTER TAB ═══════════════════════ -->
			{#if activeTab === 'risk-register'}

				<p class="text-sm text-text-secondary mb-5">Identified risks that could increase migration effort, known gotcha patterns from past migrations, and correlated risk clusters. Click any row to expand.</p>

				<!-- ── Identified Risks ───────────────────────────── -->
				<div class="flex items-center justify-between mb-3">
					<h3 class="text-xs font-extrabold uppercase tracking-wider pb-1.5 border-b-3 border-danger text-danger">
						Identified Risks ({risks.length})
					</h3>
					{#if risks.length > 0}
						<div class="flex items-center gap-3">
							{#each [
								{ level: 'critical', count: risksBySeverity.critical, color: 'var(--color-danger)' },
								{ level: 'high', count: risksBySeverity.high, color: 'var(--color-warning)' },
								{ level: 'medium', count: risksBySeverity.medium, color: '#d97706' },
								{ level: 'low', count: risksBySeverity.low, color: 'var(--color-success)' }
							] as s}
								{#if s.count > 0}
									<div class="flex items-center gap-1.5">
										<span class="w-2.5 h-2.5" style:background={s.color}></span>
										<span class="text-xs font-mono font-bold" style:color={s.color}>{s.count}</span>
										<span class="text-[10px] font-bold uppercase tracking-wider text-text-muted">{s.level}</span>
									</div>
								{/if}
							{/each}
						</div>
					{/if}
				</div>

				{#if sortedRisks.length > 0}
					<div class="brutal-border bg-surface shadow-sm overflow-hidden">
						{#each sortedRisks as risk, i}
							{@const expanded = expandedRows[risk.id]}
							<div
								class="{i > 0 ? 'border-t border-border-light' : ''}"
								style:border-left="5px solid {severityAccent(risk.severity)}"
							>
								<button
									class="w-full px-4 py-3 text-left hover:bg-surface-hover transition-colors cursor-pointer select-none {expanded ? 'bg-surface-hover' : ''}"
									onclick={() => expandedRows[risk.id] = !expanded}
									onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); expandedRows[risk.id] = !expanded; }}}
									aria-expanded={expanded}
								>
									<div class="flex items-start gap-3">
										<span class="inline-block text-xs text-text-muted transition-transform duration-200 shrink-0 mt-0.5 {expanded ? 'rotate-90' : ''}" aria-hidden="true">&#9654;</span>
										<div class="flex-1 min-w-0">
											<div class="flex items-center gap-2 flex-wrap mb-1">
												<Badge variant={severityVariant(risk.severity)}>{risk.severity}</Badge>
												<span class="text-[10px] font-bold uppercase tracking-wider text-text-muted">{risk.category}</span>
												{#if risk.likelihood}
													<span class="text-[10px] text-text-muted">&middot; {risk.likelihood} likelihood</span>
												{/if}
											</div>
											<p class="text-sm">{risk.description}</p>
										</div>
										<div class="flex items-center gap-3 shrink-0">
											<span class="text-sm font-mono font-bold text-danger">+{risk.estimated_hours_impact}h</span>
											<Badge variant={risk.status === 'open' ? 'warning' : 'success'}>{risk.status}</Badge>
										</div>
									</div>
								</button>
								{#if expanded}
									<div class="border-t border-border-light px-4 py-4 bg-bg" style:margin-left="5px">
										<div class="grid gap-4 sm:grid-cols-2">
											<div>
												<h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-1">Mitigation Strategy</h4>
												<p class="text-sm text-text-secondary">{risk.mitigation || 'No mitigation strategy defined yet.'}</p>
											</div>
											<div>
												<h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-1">Contingency Plan</h4>
												<p class="text-sm text-text-secondary">{risk.contingency || 'No contingency plan defined yet.'}</p>
											</div>
											{#if risk.linked_assumptions && (risk.linked_assumptions as string[]).length > 0}
												<div class="sm:col-span-2">
													<h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-1.5">Linked Assumptions</h4>
													<div class="space-y-1.5">
														{#each risk.linked_assumptions as aId}
															{@const assumption = assumptionsById[aId]}
															{#if assumption}
																<div class="flex items-center justify-between gap-2 px-2.5 py-1.5 border border-border-light bg-surface text-xs">
																	<div class="flex items-center gap-2 min-w-0">
																		<Badge variant={assumption.validation_status === 'validated' ? 'success' : 'warning'}>{assumption.validation_status}</Badge>
																		<span class="text-text-secondary">{assumption.assumed_value || aId}</span>
																	</div>
																	{#if assumption.validation_status !== 'validated'}
																		<span class="font-mono font-bold text-danger shrink-0">+{assumption.pessimistic_widening_hours ?? 0}h</span>
																	{/if}
																</div>
															{:else}
																<span class="px-2 py-0.5 text-xs font-mono bg-warning-light text-warning border border-warning">{aId}</span>
															{/if}
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
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{:else}
					<div class="brutal-border bg-surface px-5 py-8 text-center">
						<p class="text-sm text-text-muted">No risks have been identified yet.</p>
						<p class="text-xs text-text-muted mt-1">Run <code class="brutal-border-thin bg-bg px-1.5 py-0.5 text-xs font-mono">/migrate analyze</code> to generate the risk register.</p>
					</div>
				{/if}

				<!-- ── Risk Clusters ──────────────────────────────── -->
				{#if clusters.length > 0}
					<div class="mt-8">
						<div class="flex items-center justify-between mb-1">
							<h3 class="text-xs font-extrabold uppercase tracking-wider pb-1.5 border-b-3 border-primary text-primary">
								Risk Clusters ({clusters.length})
							</h3>
							<button class="text-[10px] font-mono text-text-muted hover:text-primary transition-colors cursor-pointer" onclick={() => drawerSection = 'risks'}>What are clusters?</button>
						</div>
						<p class="text-xs text-text-muted mb-4">Groups of correlated risks and assumptions that compound each other. If one materializes, the others are more likely to follow.</p>

						<div class="space-y-3">
							{#each clusters as cluster}
								{@const expanded = expandedRows[`cluster-${cluster.name}`]}
								{@const clusterRisks = (cluster.risks ?? []).map((id: string) => risksById[id]).filter(Boolean)}
								{@const clusterAssumptions = (cluster.assumptions ?? []).map((id: string) => assumptionsById[id]).filter(Boolean)}
								{@const maxSeverity = clusterRisks.reduce((worst: string, r: any) => {
									const rank: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
									return (rank[r.severity] ?? 4) < (rank[worst] ?? 4) ? r.severity : worst;
								}, 'low')}
								<div class="brutal-border bg-surface shadow-sm overflow-hidden" style:border-left="5px solid {severityAccent(maxSeverity)}">
									<button
										class="w-full px-4 py-3.5 text-left hover:bg-surface-hover transition-colors cursor-pointer select-none {expanded ? 'bg-surface-hover' : ''}"
										onclick={() => expandedRows[`cluster-${cluster.name}`] = !expanded}
										aria-expanded={expanded}
									>
										<div class="flex items-start gap-3">
											<span class="inline-block text-xs text-text-muted transition-transform duration-200 shrink-0 mt-0.5 {expanded ? 'rotate-90' : ''}" aria-hidden="true">&#9654;</span>
											<div class="flex-1 min-w-0">
												<h4 class="font-bold text-sm">{cluster.name}</h4>
												<div class="flex items-center gap-3 mt-1 text-xs text-text-muted">
													<span>{clusterRisks.length} risk{clusterRisks.length !== 1 ? 's' : ''}</span>
													<span class="text-border-light">|</span>
													<span>{clusterAssumptions.length} assumption{clusterAssumptions.length !== 1 ? 's' : ''}</span>
													<span class="text-border-light">|</span>
													<span>worst: <span class="font-bold" style:color={severityAccent(maxSeverity)}>{maxSeverity}</span></span>
												</div>
											</div>
											<span class="text-sm font-mono font-bold text-danger shrink-0">+{cluster.combined_widening_hours ?? 0}h</span>
										</div>
									</button>

									<!-- Always-visible summary chips -->
									{#if !expanded && clusterRisks.length > 0}
										<div class="border-t border-border-light px-4 py-2 flex flex-wrap gap-1.5">
											{#each clusterRisks.slice(0, 4) as risk}
												<span class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold border bg-bg" style:border-color={severityAccent(risk.severity)} style:color={severityAccent(risk.severity)}>
													{risk.severity} &middot; {risk.category}
												</span>
											{/each}
											{#if clusterRisks.length > 4}
												<span class="px-2 py-0.5 text-[10px] text-text-muted">+{clusterRisks.length - 4} more</span>
											{/if}
										</div>
									{/if}

									{#if expanded}
										<div class="border-t-2 border-border-light">
											<!-- Risks in this cluster -->
											{#if clusterRisks.length > 0}
												<div class="px-4 py-3">
													<h5 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-2">Correlated Risks</h5>
													<div class="space-y-2">
														{#each clusterRisks as risk}
															<div class="flex items-start gap-2.5 px-3 py-2 border border-border-light bg-bg text-xs">
																<Badge variant={severityVariant(risk.severity)}>{risk.severity}</Badge>
																<div class="flex-1 min-w-0">
																	<p class="text-text-secondary">{risk.description}</p>
																	{#if risk.mitigation}
																		<p class="text-text-muted mt-1"><span class="font-bold">Mitigation:</span> {risk.mitigation}</p>
																	{/if}
																</div>
																<span class="font-mono font-bold text-danger shrink-0">+{risk.estimated_hours_impact}h</span>
															</div>
														{/each}
													</div>
												</div>
											{/if}
											<!-- Assumptions in this cluster -->
											{#if clusterAssumptions.length > 0}
												<div class="px-4 py-3 {clusterRisks.length > 0 ? 'border-t border-border-light' : ''}">
													<h5 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-2">Linked Assumptions</h5>
													<div class="space-y-2">
														{#each clusterAssumptions as assumption}
															<div class="flex items-center justify-between gap-2 px-3 py-2 border border-border-light bg-bg text-xs">
																<div class="flex items-center gap-2 min-w-0">
																	<Badge variant={assumption.validation_status === 'validated' ? 'success' : assumption.validation_status === 'invalidated' ? 'danger' : 'warning'}>
																		{assumption.validation_status}
																	</Badge>
																	<span class="text-text-secondary">{assumption.assumed_value || assumption.id}</span>
																</div>
																{#if assumption.validation_status !== 'validated'}
																	<span class="font-mono font-bold text-danger shrink-0">+{assumption.pessimistic_widening_hours ?? 0}h</span>
																{/if}
															</div>
														{/each}
													</div>
												</div>
											{/if}
										</div>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- ── Gotcha Patterns ────────────────────────────── -->
				{#if knownGotchas.length > 0}
					<div class="mt-8">
						<div class="flex items-center justify-between mb-1">
							<h3 class="text-xs font-extrabold uppercase tracking-wider pb-1.5 border-b-3 border-warning text-warning">
								Gotcha Patterns ({knownGotchas.length})
							</h3>
							<button class="text-[10px] font-mono text-text-muted hover:text-primary transition-colors cursor-pointer" onclick={() => drawerSection = 'gotchas'}>What are gotchas?</button>
						</div>
						<p class="text-xs text-text-muted mb-4">Known pitfalls from past migrations. Triggered patterns are adding buffer hours to your estimate. Untriggered ones show what could surface.</p>

						{#if triggeredGotchasList.length > 0}
							{@const triggeredTotal = triggeredGotchasList.reduce((sum, g) => sum + (g.hours_impact ?? 0), 0)}
							<div class="flex items-center justify-between mb-2">
								<span class="text-xs font-extrabold uppercase tracking-wider text-danger">Triggered ({triggeredGotchasList.length})</span>
								<span class="text-xs font-mono font-bold text-danger">+{triggeredTotal}h total buffer</span>
							</div>
							<div class="brutal-border bg-surface shadow-sm overflow-hidden mb-4" style:border-left="5px solid var(--color-danger)">
								{#each triggeredGotchasList as gotcha, i}
									{@const expanded = expandedRows[`gotcha-${gotcha.id}`]}
									<div class="{i > 0 ? 'border-t border-border-light' : ''}">
										<button
											class="w-full px-4 py-3 text-left hover:bg-surface-hover transition-colors cursor-pointer select-none {expanded ? 'bg-surface-hover' : ''}"
											onclick={() => expandedRows[`gotcha-${gotcha.id}`] = !expanded}
											aria-expanded={expanded}
										>
											<div class="flex items-start gap-3">
												<span class="inline-block text-xs text-text-muted transition-transform duration-200 shrink-0 mt-0.5 {expanded ? 'rotate-90' : ''}" aria-hidden="true">&#9654;</span>
												<div class="flex-1 min-w-0">
													<div class="flex items-center gap-2 mb-0.5">
														<Badge variant={gotcha.risk === 'high' ? 'danger' : gotcha.risk === 'medium' ? 'warning' : 'default'}>{gotcha.risk}</Badge>
														<span class="text-xs font-mono text-text-muted">{gotcha.id}</span>
													</div>
													<p class="text-sm text-text-secondary">{gotcha.description}</p>
												</div>
												<span class="text-sm font-mono font-bold text-danger shrink-0">+{gotcha.hours_impact}h</span>
											</div>
										</button>
										{#if expanded}
											<div class="border-t border-border-light px-4 py-3 bg-bg space-y-3" style:margin-left="5px">
												<div>
													<h5 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-0.5">Trigger Condition</h5>
													<p class="text-xs font-mono text-text-secondary">{gotcha.pattern}</p>
												</div>
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
									</div>
								{/each}
							</div>
						{/if}

						{#if untriggeredGotchasList.length > 0}
							<CollapsibleSection
								title="Not Triggered"
								subtitle="{untriggeredGotchasList.length} patterns — not currently adding hours"
								open={false}
							>
								<div class="border-2 border-border-light bg-surface overflow-hidden">
									{#each untriggeredGotchasList as gotcha, i}
										{@const expanded = expandedRows[`gotcha-${gotcha.id}`]}
										<div class="{i > 0 ? 'border-t border-border-light' : ''} opacity-70 hover:opacity-100 transition-opacity">
											<button
												class="w-full px-4 py-2.5 text-left hover:bg-surface-hover transition-colors cursor-pointer select-none {expanded ? 'bg-surface-hover !opacity-100' : ''}"
												onclick={() => expandedRows[`gotcha-${gotcha.id}`] = !expanded}
												aria-expanded={expanded}
											>
												<div class="flex items-start gap-3">
													<span class="inline-block text-xs text-text-muted transition-transform duration-200 shrink-0 mt-0.5 {expanded ? 'rotate-90' : ''}" aria-hidden="true">&#9654;</span>
													<div class="flex-1 min-w-0">
														<div class="flex items-center gap-2 mb-0.5">
															<Badge variant={gotcha.risk === 'high' ? 'danger' : gotcha.risk === 'medium' ? 'warning' : 'default'}>{gotcha.risk}</Badge>
															<span class="text-xs font-mono text-text-muted">{gotcha.id}</span>
														</div>
														<p class="text-xs text-text-secondary">{gotcha.description}</p>
													</div>
													<span class="text-xs font-mono text-text-muted shrink-0">+{gotcha.hours_impact}h</span>
												</div>
											</button>
											{#if expanded}
												<div class="border-t border-border-light px-4 py-2.5 bg-bg space-y-2" style:margin-left="5px">
													<div>
														<h5 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-0.5">Trigger Condition</h5>
														<p class="text-xs font-mono text-text-secondary">{gotcha.pattern}</p>
													</div>
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
										</div>
									{/each}
								</div>
							</CollapsibleSection>
						{/if}
					</div>
				{/if}

				<!-- Empty state when nothing at all -->
				{#if risks.length === 0 && knownGotchas.length === 0 && clusters.length === 0}
					<div class="brutal-border bg-surface px-5 py-10 text-center">
						<p class="text-lg font-extrabold uppercase tracking-wider text-text-secondary">No Risk Data</p>
						<p class="mt-2 text-sm text-text-muted max-w-md mx-auto">
							Run <code class="brutal-border-thin bg-bg px-1.5 py-0.5 text-xs font-mono">/migrate analyze</code> to identify risks, gotcha patterns, and risk clusters.
						</p>
					</div>
				{/if}

			<!-- ═══ ASSUMPTIONS TAB ═════════════════════════ -->
			{:else if activeTab === 'assumptions'}

				<p class="text-sm text-text-secondary mb-4">Unconfirmed inputs that widen the estimate. Validate each one to remove its buffer hours and tighten the range.</p>

				<!-- Action Banner -->
				{#if summary.assumptions.unvalidated > 0}
					<div class="brutal-border bg-warning-light px-5 py-4 mb-5" style:border-left="6px solid var(--color-warning)">
						<div class="flex items-start justify-between gap-4">
							<div>
								<h3 class="text-sm font-extrabold uppercase tracking-wider" style:color="var(--color-warning)">
									{summary.assumptions.unvalidated} assumption{summary.assumptions.unvalidated > 1 ? 's' : ''} need validation
								</h3>
								<p class="text-xs text-text-secondary mt-1">
									Unvalidated assumptions add <span class="font-mono font-bold text-danger">+{Math.round(totalWidening)}h</span> to the pessimistic estimate. Validate the highest-impact items first.
								</p>
							</div>
							<div class="text-right shrink-0">
								<span class="text-2xl font-extrabold font-mono">{validationProgress}%</span>
								<span class="block text-[10px] font-bold uppercase tracking-wider text-text-muted">complete</span>
							</div>
						</div>
						<div class="mt-3">
							<div class="w-full h-2 bg-white border border-brutal overflow-hidden">
								<div class="h-full bg-success transition-all duration-500" style:width="{validationProgress}%"></div>
							</div>
							<div class="flex justify-between mt-1">
								<span class="text-[10px] font-mono text-text-secondary">{validatedCount}/{assumptionsList.length} validated</span>
								<span class="text-[10px] font-mono text-danger">+{Math.round(totalWidening)}h at risk</span>
							</div>
						</div>
					</div>
				{:else if assumptionsList.length > 0}
					<div class="brutal-border bg-success-light px-5 py-3 mb-5 flex items-center gap-3" style:border-left="6px solid var(--color-success)">
						<span class="text-success text-lg">&#10003;</span>
						<div>
							<h3 class="text-sm font-extrabold uppercase tracking-wider text-success">All assumptions validated</h3>
							<p class="text-xs text-text-secondary mt-0.5">No additional widening hours in the estimate.</p>
						</div>
					</div>
				{/if}

				<!-- Filter Pills -->
				<div class="flex items-center gap-2 mb-4">
					{#each [
						{ id: 'all', label: 'All', count: assumptionsList.length },
						{ id: 'unvalidated', label: 'Needs Review', count: assumptionsList.filter(a => a.validation_status !== 'validated').length },
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
					<button class="ml-auto flex items-center gap-1 text-xs text-text-muted hover:text-primary transition-colors" onclick={() => drawerSection = 'assumptions'}>
						<span class="text-[10px] font-mono opacity-60">(i)</span> Help
					</button>
				</div>

				<!-- Assumption Cards -->
				<div class="space-y-3">
					{#each sortedFilteredAssumptions as assumption}
						{@const expanded = expandedRows[`a-${assumption.id}`]}
						{@const isValidated = assumption.validation_status === 'validated'}
						{@const isInvalidated = assumption.validation_status === 'invalidated'}
						{@const isSaving = savingAssumption === assumption.id}
						<div
							class="brutal-border bg-surface shadow-sm overflow-hidden transition-opacity duration-300 {isValidated ? 'opacity-60 hover:opacity-100' : ''}"
							style:border-left="5px solid {validationAccent(assumption.validation_status)}"
						>
							<div class="px-4 py-3">
								<div class="flex items-start justify-between gap-3">
									<div class="flex-1 min-w-0">
										<div class="flex items-center gap-2 flex-wrap">
											<span class="text-xs font-mono font-bold text-text-muted">{assumption.id}</span>
											{#if assumption.dimension}
												<span class="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-info-light text-info border border-info">{assumption.dimension}</span>
											{/if}
											<Badge variant={isValidated ? 'success' : isInvalidated ? 'danger' : 'warning'}>
												{assumption.validation_status}
											</Badge>
										</div>
										<p class="text-sm mt-2 font-bold">{assumption.assumed_value}</p>
										{#if assumption.basis}
											<p class="text-xs text-text-muted mt-1">Basis: {assumption.basis}</p>
										{/if}
									</div>
									<div class="text-right shrink-0">
										{#if !isValidated}
											<span class="text-lg font-mono font-extrabold text-danger">+{assumption.pessimistic_widening_hours ?? 0}h</span>
											<span class="block text-[10px] text-text-muted">widening</span>
										{:else}
											<span class="text-lg font-mono font-extrabold text-success">0h</span>
											<span class="block text-[10px] text-text-muted">resolved</span>
										{/if}
									</div>
								</div>

								<button
									class="mt-2 text-xs font-bold text-primary hover:text-primary-hover cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
									onclick={() => expandedRows[`a-${assumption.id}`] = !expanded}
								>
									<span class="inline-block transition-transform duration-200 {expanded ? 'rotate-90' : ''}" aria-hidden="true">&#9654;</span>
									{expanded ? 'Hide details' : 'Show details'}
								</button>
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

							{#if !isValidated}
								<div class="border-t-2 border-brutal bg-success-light px-4 py-2.5">
									<button
										class="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-extrabold uppercase tracking-wider
											bg-success text-white border-3 border-brutal
											hover:-translate-y-px hover:shadow-md
											active:translate-y-0 active:shadow-none
											transition-all duration-150
											disabled:opacity-50 disabled:cursor-not-allowed
											focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
										disabled={isSaving}
										onclick={() => toggleAssumption(assumption.id, 'validated')}
									>
										{#if isSaving}
											Validating...
										{:else}
											<span class="text-base">&#10003;</span> Validate &mdash; saves +{assumption.pessimistic_widening_hours ?? 0}h widening
										{/if}
									</button>
								</div>
							{/if}
						</div>
					{/each}
				</div>

				{#if sortedFilteredAssumptions.length === 0}
					<Card>
						<div class="py-6 text-center">
							<p class="text-sm text-text-muted">No assumptions match the current filter.</p>
						</div>
					</Card>
				{/if}

			<!-- ═══ COMPLEXITY TAB (multipliers + dependencies) ═══ -->
			{:else if activeTab === 'complexity'}

				<p class="text-sm text-text-secondary mb-4">Active complexity factors and ordering constraints that affect the estimate.</p>

				<!-- ── Multipliers Section ──────────────────────── -->
				<button class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider mb-3 pb-1.5 border-b-3 border-warning text-warning w-full text-left cursor-pointer hover:opacity-80 transition-opacity" onclick={() => drawerSection = 'multipliers'}>
					Active Multipliers ({multipliers.length})
					<span class="text-[10px] font-mono opacity-60">(i)</span>
				</button>

				{#if multipliers.length > 0}
					<div class="brutal-border bg-surface shadow-sm overflow-hidden">
						{#each multipliers as mult, i}
							{@const expanded = expandedRows[`mult-${mult.multiplier_id ?? mult.id}`]}
							<button
								class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-hover transition-colors cursor-pointer select-none {i > 0 ? 'border-t border-border-light' : ''} {expanded ? 'bg-surface-hover' : ''}"
								onclick={() => expandedRows[`mult-${mult.multiplier_id ?? mult.id}`] = !expanded}
								aria-expanded={expanded}
							>
								<span class="inline-block text-xs text-text-muted transition-transform duration-200 shrink-0 {expanded ? 'rotate-90' : ''}" aria-hidden="true">&#9654;</span>
								<span class="flex-1 min-w-0 font-bold text-sm">{mult.name || mult.multiplier_id}</span>
								<div class="w-16 h-2 bg-border-light overflow-hidden shrink-0">
									<div class="h-full bg-warning transition-all duration-300" style:width="{Math.min(100, ((mult.factor - 1) / 0.5) * 100)}%"></div>
								</div>
								<span class="text-base font-extrabold font-mono text-warning shrink-0">&times;{mult.factor}</span>
							</button>
							{#if expanded}
								<div class="border-t border-border-light px-4 py-3 bg-bg {i < multipliers.length - 1 ? 'border-b border-border-light' : ''}">
									<p class="text-xs text-text-secondary mb-2">{mult.trigger_condition}</p>
									{#if (mult.affected_components as string[])?.length > 0}
										<div>
											<h5 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-1">Affected Components</h5>
											<div class="flex flex-wrap gap-1">
												{#each mult.affected_components as comp}
													<span class="px-1.5 py-0.5 text-[10px] font-mono bg-warning-light text-warning border border-warning">{comp}</span>
												{/each}
											</div>
										</div>
									{/if}
								</div>
							{/if}
						{/each}
					</div>
				{:else}
					<Card>
						<div class="py-4 text-center text-sm text-text-muted">No active multipliers &mdash; no complexity factors are scaling your estimate.</div>
					</Card>
				{/if}

				{#if knownMultipliers.length > 0}
					<div class="mt-4">
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

				<!-- ── Dependencies Section ─────────────────────── -->
				<div class="mt-8 pt-6 border-t-3 border-border-light">
					<button class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider mb-3 pb-1.5 border-b-3 border-danger text-danger w-full text-left cursor-pointer hover:opacity-80 transition-opacity" onclick={() => drawerSection = 'dependencies'}>
						Dependency Chains ({chains.length})
						<span class="text-[10px] font-mono opacity-60">(i)</span>
					</button>

					<div class="flex items-center gap-4 mb-5">
						<div class="flex items-center gap-1.5">
							<span class="w-3 h-3 bg-danger"></span>
							<span class="text-xs font-bold"><span class="font-mono">{hardDeps.length}</span> hard</span>
						</div>
						<div class="flex items-center gap-1.5">
							<span class="w-3 h-3 border-2 border-border-light"></span>
							<span class="text-xs font-bold"><span class="font-mono">{softDeps.length}</span> soft</span>
						</div>
					</div>

					{#if criticalPath.length > 0}
						<Card padding="p-4">
							<h4 class="text-xs font-extrabold uppercase tracking-wider mb-3 pb-1.5 border-b-3 border-danger text-danger">
								Critical Path ({criticalPath.length} steps)
							</h4>
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

					{#if hardDeps.length > 0}
						<div class="mt-4">
							<h3 class="text-xs font-extrabold uppercase tracking-wider mb-3 pb-1.5 border-b-3 border-danger text-danger">
								Hard Dependencies ({hardDeps.length})
							</h3>
							<div class="space-y-2">
								{#each hardDeps as chain}
									<div class="brutal-border bg-surface shadow-sm overflow-hidden p-3" style:border-left="5px solid var(--color-danger)">
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
									</div>
								{/each}
							</div>
						</div>
					{/if}

					{#if softDeps.length > 0}
						<div class="mt-4">
							<CollapsibleSection
								title="Soft Dependencies"
								subtitle="{softDeps.length} chains"
								open={softDeps.length <= 5}
							>
								<div class="space-y-2">
									{#each softDeps as chain}
										<div class="flex items-center gap-2 text-sm px-2 py-2 border-b border-border-light last:border-0">
											<span class="font-mono font-bold px-2 py-1 bg-surface border-2 border-border-light">{chain.from}</span>
											<span class="text-text-muted">&rArr;</span>
											<div class="flex flex-wrap gap-1">
												{#each (Array.isArray(chain.to) ? chain.to : [chain.to]) as target}
													<span class="font-mono font-bold px-2 py-1 bg-surface border-2 border-border-light">{target}</span>
												{/each}
											</div>
											<Badge variant="muted">soft</Badge>
										</div>
									{/each}
								</div>
							</CollapsibleSection>
						</div>
					{/if}

					{#if chains.length === 0}
						<Card>
							<div class="py-4 text-center text-sm text-text-muted">No dependency chains defined</div>
						</Card>
					{/if}
				</div>

			<!-- ═══ REFERENCE TAB (gaps + decisions + methodology) ═══ -->
			{:else if activeTab === 'reference'}

				<p class="text-sm text-text-secondary mb-4">Supporting data: confidence breakdown, data gaps, AI tool selections, platform incompatibilities, and estimation methodology.</p>

				<!-- ── Data Quality ─────────────────────────────── -->
				<h3 class="text-xs font-extrabold uppercase tracking-wider mb-3 pb-1.5 border-b-3 border-primary text-primary">Data Quality</h3>

				<!-- Compact stat strip -->
				<div class="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 brutal-border bg-surface mb-5">
					<div class="flex items-center gap-2">
						<span class="text-xs font-extrabold uppercase tracking-widest text-text-muted">Confidence</span>
						<span class="text-lg font-extrabold font-mono {confidenceColor(summary.confidence)}">{summary.confidence}%</span>
						<span class="text-[10px] text-text-muted font-mono">({gaps?.confirmed_answers ?? 0}/{gaps?.total_answers ?? 0})</span>
					</div>
					<span class="hidden sm:inline text-border-light">|</span>
					<div class="flex items-center gap-2">
						<span class="text-xs font-extrabold uppercase tracking-widest text-text-muted">Unknown</span>
						<span class="text-lg font-extrabold font-mono text-danger">{gaps?.unknown_answers ?? 0}</span>
					</div>
					<span class="hidden sm:inline text-border-light">|</span>
					<div class="flex items-center gap-2">
						<span class="text-xs font-extrabold uppercase tracking-widest text-text-muted">Assumed</span>
						<span class="text-lg font-extrabold font-mono text-warning">{gaps?.assumed_answers ?? 0}</span>
					</div>
					<span class="hidden sm:inline text-border-light">|</span>
					<div class="flex items-center gap-2">
						<span class="text-xs font-extrabold uppercase tracking-widest text-text-muted">Widening</span>
						<span class="text-lg font-extrabold font-mono text-danger">+{Math.round(totalWidening)}h</span>
					</div>
				</div>

				<div class="brutal-border bg-primary-light px-5 py-4 mb-5" style:border-left="6px solid var(--color-primary)">
					<h3 class="text-xs font-extrabold uppercase tracking-wider mb-2 text-primary">How to Improve Confidence</h3>
					<ConfidenceImprovementPath
						{discovery}
						unvalidatedCount={summary.assumptions.unvalidated}
						{totalWidening}
						unknownCount={unknownCount()}
					/>
				</div>

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

				<div class="mb-6">
					<button class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider mb-3 pb-1.5 border-b-3 border-warning text-warning w-full text-left cursor-pointer hover:opacity-80 transition-opacity" onclick={() => drawerSection = 'gaps'}>
						Gaps by Dimension
						<span class="text-[10px] font-mono opacity-60">(i)</span>
					</button>
					<GapsDimensionList {discovery} />
				</div>

				{#if summary.assumptions.unvalidated > 0}
					<Card padding="p-4">
						<div class="flex items-center justify-between">
							<span class="text-sm text-text-secondary">
								{summary.assumptions.unvalidated} unvalidated assumption{summary.assumptions.unvalidated > 1 ? 's' : ''} contributing <span class="font-mono font-bold text-danger">+{Math.round(totalWidening)}h</span> widening
							</span>
							<button
								class="px-3 py-1.5 text-xs font-bold uppercase bg-primary text-white border-2 border-brutal hover:-translate-y-px hover:shadow-sm transition-all duration-150 focus-visible:outline-2 focus-visible:outline-primary"
								onclick={() => { activeTab = 'assumptions'; assumptionFilter = 'unvalidated'; }}
							>
								Review assumptions &rarr;
							</button>
						</div>
					</Card>
				{/if}

				<!-- ── Estimate Inputs ──────────────────────────── -->
				<h3 class="text-xs font-extrabold uppercase tracking-wider mt-8 mb-3 pb-1.5 border-b-3 border-success text-success">Estimate Inputs</h3>

				<Card>
					<h4 class="text-xs font-extrabold uppercase tracking-wider mb-3 pb-1.5 border-b-2 border-border-light">
						AI Tool Selections ({enabledAiTools.length}/{aiTools.length} enabled)
					</h4>
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

				{#if excludedSet.size > 0}
					<Card>
						<h4 class="text-xs font-extrabold uppercase tracking-wider mb-3 pb-1.5 border-b-2 border-border-light">
							Scope Exclusions ({excludedSet.size})
						</h4>
						<div class="flex flex-wrap gap-1">
							{#each [...excludedSet] as compId}
								<span class="px-2 py-0.5 text-xs font-mono bg-danger-light text-danger border border-danger">{compId}</span>
							{/each}
						</div>
					</Card>
				{/if}

				<!-- ── Platform Knowledge ───────────────────────── -->
				{#if knownIncompatibilities.length > 0}
					<h3 class="text-xs font-extrabold uppercase tracking-wider mt-8 mb-3 pb-1.5 border-b-3 border-text-muted text-text-muted">Platform Knowledge</h3>

					<Card>
						<button class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider mb-3 pb-1.5 border-b-2 border-border-light w-full text-left cursor-pointer hover:opacity-80 transition-opacity" onclick={() => drawerSection = 'decisions'}>
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

				<CollapsibleSection
					title="Methodology Notes"
					subtitle="Estimation approach"
					open={false}
				>
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
				</CollapsibleSection>
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
			<p>The <strong>Analysis</strong> page is the data-dense deep dive into your migration assessment. The executive summary shows confidence and top actions, then four tabs organize the detail.</p>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Tabs</h3>
				<ul class="list-disc list-inside space-y-1 text-text-secondary">
					<li><strong>Risk Register</strong> — Risks with severity, likelihood, hours impact, and mitigation. Includes risk clusters and gotcha patterns.</li>
					<li><strong>Assumptions</strong> — Unconfirmed inputs. Validate them to reduce estimate uncertainty and increase confidence.</li>
					<li><strong>Complexity</strong> — Multipliers that scale component hours, plus dependency chains and critical path.</li>
					<li><strong>Reference</strong> — Data gaps, AI tool selections, scope exclusions, platform incompatibilities, and methodology.</li>
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
		</div>
	{:else if drawerSection === 'dependencies'}
		<div class="space-y-4 text-sm">
			<p><strong>Dependency chains</strong> define ordering constraints between migration components.</p>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Dependency Types</h3>
				<div class="space-y-2 text-text-secondary">
					<p><strong class="text-danger">Hard</strong> — Strict ordering. The target cannot start until the source completes.</p>
					<p><strong class="text-text">Soft</strong> — Preferred ordering. Can be parallelized with some risk.</p>
				</div>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Critical Path</h3>
				<p class="text-text-secondary">The longest chain of hard dependencies. It determines the minimum calendar duration of the migration.</p>
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
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Unknown vs Assumed</h3>
				<p class="text-text-secondary">Unknown answers have no data. Assumed answers are educated guesses that add widening hours until validated.</p>
			</div>
		</div>
	{:else if drawerSection === 'gotchas'}
		<div class="space-y-4 text-sm">
			<p><strong>Gotcha patterns</strong> are known pitfalls that add buffer hours to specific components when their trigger conditions are met.</p>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Triggered vs. Not Triggered</h3>
				<p class="text-text-secondary">Patterns are cross-referenced with your estimate data. "Triggered" patterns have matching components with gotcha hours. "Not triggered" patterns show what could trigger under different conditions.</p>
			</div>
		</div>
	{:else if drawerSection === 'decisions'}
		<div class="space-y-4 text-sm">
			<p><strong>Known incompatibilities</strong> are documented differences between source and target platforms that affect the migration.</p>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Using This Data</h3>
				<p class="text-text-secondary">Review incompatibilities relevant to your migration scope. Each entry includes the impact and what needs to change. Use this to validate assumptions and identify risks you may have missed.</p>
			</div>
		</div>
	{/if}
</InfoDrawer>
