<script lang="ts">
	import { page } from '$app/state';
	import { invalidateAll } from '$app/navigation';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Tooltip from '$lib/components/ui/Tooltip.svelte';
	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
	import InfoDrawer from '$lib/components/ui/InfoDrawer.svelte';
	import {
		DIMENSION_LABELS,
		DIMENSION_META,
		TIER_COLORS,
		normalizeDiscovery,
		formatQuestionId,
		getDimensionsByTier,
		type ImpactTier,
		type DimensionMeta
	} from '$lib/utils/migration-stats';

	let { data } = $props();

	const summary = $derived(data.summary);

	const statusBadge = $derived(
		summary.hasDiscovery
			? { variant: 'success' as const, label: 'Complete' }
			: summary.discovery.discoveryPercent > 0
			? { variant: 'default' as const, label: `${Math.round(summary.discovery.discoveryPercent)}%` }
			: { variant: 'muted'   as const, label: 'Not Started' }
	);

	// Discovery data keyed by dimension name
	let discoveryData = $state<Record<string, any>>({});

	$effect(() => {
		discoveryData = normalizeDiscovery(data.discovery as Record<string, any> | null | undefined);
	});

	// URL param for deep-linking to a dimension
	const expandedFromUrl = $derived(page.url.searchParams.get('dimension'));

	// Expanded state — supports multiple open dimensions
	let expandedDimensions = $state<Record<string, boolean>>({});

	$effect(() => {
		if (expandedFromUrl) {
			expandedDimensions = { [expandedFromUrl]: true };
		}
	});

	// Answer stats per dimension
	function dimAnswerStats(dim: string): { total: number; confirmed: number; assumed: number; unknown: number } {
		const answers = discoveryData[dim]?.answers ?? {};
		let total = 0, confirmed = 0, assumed = 0, unknown = 0;
		for (const a of Object.values(answers) as any[]) {
			total++;
			if (a.confidence === 'confirmed') confirmed++;
			else if (a.confidence === 'assumed') assumed++;
			else unknown++;
		}
		return { total, confirmed, assumed, unknown };
	}

	// Global answer stats
	const globalStats = $derived((() => {
		let total = 0, confirmed = 0, assumed = 0, unknown = 0;
		for (const dim of Object.values(discoveryData)) {
			const answers = dim?.answers ?? {};
			for (const a of Object.values(answers) as any[]) {
				total++;
				if (a.confidence === 'confirmed') confirmed++;
				else if (a.confidence === 'assumed') assumed++;
				else unknown++;
			}
		}
		return { total, confirmed, assumed, unknown };
	})());

	// Dimensions grouped by impact tier
	const dimensionTiers = $derived(getDimensionsByTier());

	// Readiness verdict — one-liner for executives
	const readinessVerdict = $derived((() => {
		const pct = summary.discovery.discoveryPercent;
		if (pct === 100 && globalStats.unknown === 0 && globalStats.assumed === 0)
			return 'Discovery is complete with full confidence. All data points are confirmed.';
		if (pct === 100 && globalStats.unknown === 0)
			return `Discovery is complete. ${globalStats.assumed} data point${globalStats.assumed !== 1 ? 's' : ''} still based on assumptions — validate to tighten estimates.`;
		if (pct === 100)
			return `All dimensions covered but ${globalStats.unknown} unknown and ${globalStats.assumed} assumed data point${globalStats.assumed !== 1 ? 's' : ''} reduce confidence.`;
		if (pct >= 75)
			return `${summary.discovery.completedDimensions} of ${summary.discovery.totalDimensions} dimensions complete. Focus on remaining critical gaps to improve estimate accuracy.`;
		if (pct > 0)
			return `Early-stage discovery — ${summary.discovery.totalDimensions - summary.discovery.completedDimensions} dimensions still need investigation. Estimates will have wide ranges.`;
		return 'Discovery has not started. Run /migrate discover to begin collecting infrastructure data.';
	})());

	// Priority attention items — incomplete dimensions sorted by impact
	const priorityItems = $derived(
		getDimensionsByTier()
			.flatMap(g => g.dimensions)
			.filter(d => {
				const dd = discoveryData[d.key];
				if (!dd) return true;
				const s = dimAnswerStats(d.key);
				return s.unknown > 0 || s.assumed > 0;
			})
			.slice(0, 5)
	);

	// Total hours swing from incomplete critical/high dimensions
	const riskHours = $derived((() => {
		let min = 0, max = 0;
		for (const tierGroup of dimensionTiers) {
			if (tierGroup.tier !== 'critical' && tierGroup.tier !== 'high') continue;
			for (const dim of tierGroup.dimensions) {
				const dd = discoveryData[dim.key];
				if (!dd || dd.status !== 'complete') {
					min += dim.meta.hoursSwing[0];
					max += dim.meta.hoursSwing[1];
				} else {
					const s = dimAnswerStats(dim.key);
					if (s.unknown > 0 || s.assumed > 0) {
						const gapRatio = (s.unknown + s.assumed) / Math.max(1, s.total);
						min += Math.round(dim.meta.hoursSwing[0] * gapRatio);
						max += Math.round(dim.meta.hoursSwing[1] * gapRatio);
					}
				}
			}
		}
		return { min, max };
	})());

	// ── Expand All / Collapse All ────────────────────────────
	const allDimensionKeys = $derived(dimensionTiers.flatMap(g => g.dimensions.map(d => d.key)));
	const expandedCount = $derived(allDimensionKeys.filter(k => expandedDimensions[k]).length);

	function expandAll() {
		for (const key of allDimensionKeys) expandedDimensions[key] = true;
	}
	function collapseAll() {
		expandedDimensions = {};
	}

	// ── Editing state ─────────────────────────────────────────
	let editingAnswer = $state<{ dimension: string; questionId: string } | null>(null);
	let editValue = $state('');
	let editConfidence = $state('confirmed');
	let saving = $state(false);

	function startEdit(dimension: string, questionId: string, answer: any) {
		editingAnswer = { dimension, questionId };
		editValue = typeof answer.value === 'object' ? JSON.stringify(answer.value) : String(answer.value ?? '');
		editConfidence = answer.confidence ?? 'unknown';
	}

	function cancelEdit() {
		editingAnswer = null;
	}

	async function saveEdit() {
		if (!editingAnswer) return;
		saving = true;

		let parsedValue: any = editValue;
		try { parsedValue = JSON.parse(editValue); } catch { /* keep as string */ }

		const { dimension, questionId } = editingAnswer;
		try {
			await fetch(`/api/assessments/${page.params.id}/discovery`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					dimension,
					status: discoveryData[dimension]?.status ?? 'complete',
					answers: {
						[questionId]: { value: parsedValue, confidence: editConfidence, notes: '' }
					}
				})
			});

			invalidateAll();

			if (discoveryData[dimension]?.answers) {
				discoveryData[dimension].answers[questionId] = {
					...discoveryData[dimension].answers[questionId],
					value: parsedValue,
					confidence: editConfidence
				};
				discoveryData = { ...discoveryData };
			}
		} finally {
			saving = false;
			editingAnswer = null;
		}
	}

	function formatValue(value: any): string {
		if (value === null || value === undefined) return '\u2014';
		if (typeof value === 'boolean') return value ? 'Yes' : 'No';
		if (typeof value === 'object') return JSON.stringify(value);
		return String(value);
	}

	function badgeVariant(confidence: string): 'success' | 'warning' | 'danger' | 'default' {
		switch (confidence) {
			case 'confirmed': return 'success';
			case 'assumed': return 'warning';
			case 'unknown': return 'danger';
			default: return 'default';
		}
	}

	function tierBorderColor(tier: ImpactTier): string {
		const map: Record<ImpactTier, string> = {
			critical: 'var(--color-danger)',
			high: 'var(--color-warning)',
			medium: 'var(--color-primary)',
			lower: 'var(--color-border-light)',
		};
		return map[tier];
	}

	function dimStatusLabel(dim: string): { label: string; variant: 'success' | 'warning' | 'danger' | 'muted' } {
		const dimData = discoveryData[dim];
		if (!dimData) return { label: 'Not Started', variant: 'muted' };
		const stats = dimAnswerStats(dim);
		if (dimData.status === 'complete' && stats.unknown === 0 && stats.assumed === 0)
			return { label: 'Verified', variant: 'success' };
		if (dimData.status === 'complete')
			return { label: 'Complete', variant: 'success' };
		if (stats.total > 0)
			return { label: 'Partial', variant: 'warning' };
		return { label: 'Not Started', variant: 'muted' };
	}

	// Completion gauge derived values
	const completionPctGlobal = $derived(summary.discovery.discoveryPercent);
	const completionPctColor = $derived(
		completionPctGlobal === 100 ? 'text-success' : completionPctGlobal >= 75 ? 'text-primary' : completionPctGlobal >= 50 ? 'text-warning' : 'text-danger'
	);
	const completionPctBg = $derived(
		completionPctGlobal === 100 ? 'bg-success' : completionPctGlobal >= 75 ? 'bg-primary' : completionPctGlobal >= 50 ? 'bg-warning' : 'bg-danger'
	);

	let drawerSection = $state<'page' | null>(null);
</script>

<svelte:head>
	<title>{data.assessment.project_name} — Discovery</title>
</svelte:head>

<div class="p-6 space-y-6 animate-enter">
	<!-- ══════════════════════════════════════════════════════════
	     LEVEL 1: Executive Summary
	     Always visible. Tells the story at a glance.
	     ══════════════════════════════════════════════════════════ -->
	<div>
		<div class="flex items-center gap-2">
			<h1 class="text-xl font-extrabold uppercase tracking-wider">Discovery</h1>
			<Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
			<button onclick={() => drawerSection = 'page'} class="flex items-center justify-center w-5 h-5 text-text-muted hover:text-primary transition-colors" aria-label="About this page">
				<span class="text-[10px] font-mono opacity-60">(i)</span>
			</button>
		</div>
		<p class="text-sm font-bold text-text-secondary mt-0.5">Infrastructure & environment discovery across {summary.discovery.totalDimensions} dimensions</p>
	</div>

	{#if Object.keys(discoveryData).length === 0}
		<Card>
			<div class="py-8 text-center">
				<p class="text-lg font-extrabold uppercase tracking-wider text-text-secondary">No Discovery Data</p>
				<p class="mt-2 text-sm text-text-muted max-w-md mx-auto">
					Run <code class="brutal-border-thin bg-surface px-1.5 py-0.5 text-xs font-mono">/migrate discover</code> to begin collecting infrastructure data.
				</p>
			</div>
		</Card>
	{:else}
		<!-- Executive Summary Card -->
		<div class="brutal-border bg-surface shadow-md overflow-hidden">
			<div class="flex items-start gap-6 px-5 py-4">
				<!-- Completion gauge -->
				<div class="shrink-0">
					<div class="text-[10px] font-extrabold uppercase tracking-widest text-text-muted mb-1">Completion</div>
					<div class="text-4xl font-extrabold font-mono {completionPctColor}">{completionPctGlobal}%</div>
					<div class="w-24 h-2 bg-border-light mt-2 overflow-hidden">
						<div class="h-full {completionPctBg} transition-all duration-500" style="width: {completionPctGlobal}%"></div>
					</div>
					<div class="text-[10px] font-mono text-text-muted mt-1">{summary.discovery.completedDimensions}/{summary.discovery.totalDimensions} dimensions</div>
				</div>

				<!-- Verdict + KPIs -->
				<div class="flex-1 min-w-0">
					<p class="text-sm text-text-secondary">{readinessVerdict}</p>
					<div class="grid grid-cols-2 sm:grid-cols-4 mt-3 border-2 border-brutal bg-surface">
						<div class="px-3 py-2.5 text-left border-r border-b sm:border-b-0 border-border-light">
							<span class="block text-xl font-extrabold font-mono">{globalStats.total}</span>
							<span class="text-[10px] font-extrabold uppercase tracking-widest text-text-muted">Data Points</span>
						</div>
						<div class="px-3 py-2.5 text-left border-b sm:border-b-0 sm:border-r border-border-light">
							<span class="block text-xl font-extrabold font-mono text-success">{globalStats.confirmed}</span>
							<span class="text-[10px] font-extrabold uppercase tracking-widest text-text-muted">Confirmed</span>
						</div>
						<div class="px-3 py-2.5 text-left border-r border-border-light">
							<span class="block text-xl font-extrabold font-mono text-warning">{globalStats.assumed}</span>
							<span class="text-[10px] font-extrabold uppercase tracking-widest text-text-muted">Assumed</span>
						</div>
						<div class="px-3 py-2.5 text-left">
							<span class="block text-xl font-extrabold font-mono {globalStats.unknown > 0 ? 'text-danger' : 'text-text-muted'}">{globalStats.unknown}</span>
							<span class="text-[10px] font-extrabold uppercase tracking-widest text-text-muted">Unknown</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Hours at Risk Banner — only show when there are gaps in critical/high dimensions -->
			{#if riskHours.max > 0}
				<div class="border-t-2 border-brutal px-5 py-3 bg-bg flex items-center justify-between gap-4 flex-wrap">
					<div>
						<span class="text-xs font-extrabold uppercase tracking-wider text-danger">Estimate Uncertainty</span>
						<p class="text-xs text-text-muted mt-0.5">Gaps in critical/high-impact dimensions create a <span class="font-mono font-bold text-danger">{riskHours.min}–{riskHours.max}h</span> hours swing in the estimate</p>
					</div>
					<div class="text-right shrink-0">
						<span class="text-lg font-extrabold font-mono text-danger">+{riskHours.max}h</span>
						<span class="block text-[10px] text-text-muted">worst case</span>
					</div>
				</div>
			{/if}

			<!-- Priority Attention Items -->
			{#if priorityItems.length > 0}
				<div class="border-t-2 border-brutal px-5 py-4 bg-bg">
					<h3 class="text-xs font-extrabold uppercase tracking-wider mb-3">Priority Actions</h3>
					<div class="space-y-2">
						{#each priorityItems as item, i}
							{@const itemDimData = discoveryData[item.key]}
							{@const itemDimStats = itemDimData ? dimAnswerStats(item.key) : null}
							<button
								class="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left hover:bg-surface-hover transition-colors cursor-pointer select-none brutal-border-thin bg-surface"
								style="border-left: 4px solid {tierBorderColor(item.meta.tier)}"
								onclick={() => { expandedDimensions[item.key] = true; document.getElementById(`dim-${item.key}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}
							>
								<span class="text-xs font-mono font-bold text-text-muted w-4 shrink-0">{i + 1}.</span>
								<span class="flex-1 min-w-0">
									<span class="font-bold">{item.label}</span>
									<span class="text-xs text-text-muted ml-2">
										{#if !itemDimData}
											No data collected
										{:else if itemDimStats}
											{itemDimStats.unknown > 0 ? `${itemDimStats.unknown} unknown` : ''}{itemDimStats.unknown > 0 && itemDimStats.assumed > 0 ? ', ' : ''}{itemDimStats.assumed > 0 ? `${itemDimStats.assumed} assumed` : ''}
										{/if}
									</span>
								</span>
								<span class="text-xs font-mono font-bold text-text-muted shrink-0">{item.meta.hoursSwing[0]}–{item.meta.hoursSwing[1]}h swing</span>
								<span class="text-xs text-text-muted shrink-0" aria-hidden="true">&#9654;</span>
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<!-- ══════════════════════════════════════════════════════════
		     LEVEL 2: Dimension List by Impact Tier
		     Scannable overview, grouped by how much each dimension
		     affects estimate accuracy. Click to expand into Level 3.
		     ══════════════════════════════════════════════════════════ -->
		<div class="flex items-center justify-between">
			<h2 class="text-sm font-extrabold uppercase tracking-wider text-text-secondary">
				All Dimensions
				<span class="text-text-muted font-mono text-xs ml-1">({allDimensionKeys.length})</span>
			</h2>
			<button
				class="text-xs font-bold text-primary hover:text-primary-hover transition-colors
					focus-visible:outline-2 focus-visible:outline-primary"
				onclick={() => expandedCount > 0 ? collapseAll() : expandAll()}
			>
				{expandedCount > 0 ? 'Collapse All' : 'Expand All'}
			</button>
		</div>

		{#each dimensionTiers as tierGroup}
			{@const tierColors = TIER_COLORS[tierGroup.tier]}
			<div>
				<!-- Tier Header -->
				<div class="flex items-center gap-2 mb-3">
					<span class="w-2.5 h-2.5 {tierColors.dot} shrink-0"></span>
					<h2 class="text-xs font-extrabold uppercase tracking-wider {tierColors.text}">{tierGroup.label}</h2>
					<span class="flex-1 h-px bg-border-light"></span>
					<span class="text-[10px] font-mono text-text-muted">{tierGroup.dimensions.length} dimension{tierGroup.dimensions.length !== 1 ? 's' : ''}</span>
				</div>

				<!-- Dimension Rows -->
				<div class="space-y-2">
					{#each tierGroup.dimensions as dim}
						{@const dimData = discoveryData[dim.key]}
						{@const dimStats = dimData ? dimAnswerStats(dim.key) : { total: 0, confirmed: 0, assumed: 0, unknown: 0 }}
						{@const status = dimStatusLabel(dim.key)}
						{@const isExpanded = expandedDimensions[dim.key] ?? false}
						{@const answers = dimData?.answers ?? {}}
						{@const answerEntries = Object.entries(answers) as [string, any][]}
						{@const completionPct = dimStats.total > 0 ? Math.round((dimStats.confirmed / dimStats.total) * 100) : 0}

						<div
							id="dim-{dim.key}"
							class="brutal-border bg-surface shadow-sm overflow-hidden transition-shadow duration-150"
							style="border-left: 5px solid {tierBorderColor(tierGroup.tier)}"
						>
							<!-- Dimension Row (always visible) -->
							<button
								type="button"
								class="w-full flex items-center gap-4 px-4 py-3 text-left transition-colors duration-150
									hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary
									select-none cursor-pointer"
								aria-expanded={isExpanded}
								aria-controls="detail-{dim.key}"
								onclick={() => expandedDimensions[dim.key] = !isExpanded}
								onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); expandedDimensions[dim.key] = !isExpanded; }}}
							>
								<!-- Chevron -->
								<span
									class="inline-block text-xs transition-transform duration-200 text-text-muted shrink-0
										{isExpanded ? 'rotate-90' : 'rotate-0'}"
									aria-hidden="true"
								>&#9654;</span>

								<!-- Name + priority -->
								<div class="flex-1 min-w-0">
									<div class="flex items-center gap-2">
										<span class="text-sm font-extrabold">{dim.label}</span>
										<Badge variant={status.variant}>{status.label}</Badge>
									</div>
									<p class="text-xs text-text-muted mt-0.5 truncate">{dim.meta.whyItMatters}</p>
								</div>

								<!-- Answer breakdown — compact inline -->
								{#if dimStats.total > 0}
									<div class="hidden sm:flex items-center gap-3 shrink-0">
										<Tooltip text="{dimStats.confirmed} confirmed, {dimStats.assumed} assumed, {dimStats.unknown} unknown" position="left">
											<div class="flex items-center gap-1 cursor-help">
												{#if dimStats.confirmed > 0}
													<span class="text-xs font-mono font-bold text-success">{dimStats.confirmed}</span>
												{/if}
												{#if dimStats.assumed > 0}
													<span class="text-xs font-mono font-bold text-warning">{dimStats.assumed}</span>
												{/if}
												{#if dimStats.unknown > 0}
													<span class="text-xs font-mono font-bold text-danger">{dimStats.unknown}</span>
												{/if}
												<span class="text-[10px] text-text-muted">/ {dimStats.total}</span>
											</div>
										</Tooltip>
									</div>
								{/if}

								<!-- Mini progress bar -->
								<div class="w-16 shrink-0 hidden sm:block">
									{#if dimStats.total > 0}
										<div class="h-1.5 bg-border-light overflow-hidden">
											<div
												class="h-full transition-all duration-300 {completionPct === 100 ? 'bg-success' : completionPct > 0 ? 'bg-primary' : 'bg-border-light'}"
												style="width: {completionPct}%"
											></div>
										</div>
									{:else}
										<div class="h-1.5 bg-border-light"></div>
									{/if}
								</div>

								<!-- Hours swing -->
								<Tooltip text="Typical hours swing if this dimension has incomplete data" position="left">
									<span class="text-xs font-mono text-text-muted shrink-0 cursor-help">{dim.meta.hoursSwing[0]}–{dim.meta.hoursSwing[1]}h</span>
								</Tooltip>
							</button>

							<!-- ══════════════════════════════════════════════
							     LEVEL 3: Dimension Detail (expanded)
							     Full data table with edit capability.
							     ══════════════════════════════════════════════ -->
							{#if isExpanded}
								<div id="detail-{dim.key}" class="border-t-2 border-brutal">
									{#if !dimData || answerEntries.length === 0}
										<div class="px-5 py-6 text-center bg-bg">
											<p class="text-sm font-bold text-text-secondary">No data collected for {dim.label}</p>
											<p class="mt-1 text-xs text-text-muted">
												Run <code class="brutal-border-thin bg-surface px-1.5 py-0.5 text-xs font-mono">/migrate discover</code> targeting this dimension.
											</p>
										</div>
									{:else}
										<!-- Dimension Summary Bar -->
										<div class="px-5 py-3 bg-bg flex items-center gap-4 flex-wrap border-b border-border-light">
											<div class="flex items-center gap-2">
												<span class="text-xs font-extrabold uppercase tracking-widest text-text-muted">Answers</span>
												<span class="font-mono font-bold text-sm">{dimStats.total}</span>
											</div>
											<span class="w-px h-4 bg-border-light" aria-hidden="true"></span>
											<div class="flex items-center gap-4">
												<div class="flex items-center gap-1">
													<span class="w-2 h-2 bg-success"></span>
													<span class="text-xs font-mono font-bold text-success">{dimStats.confirmed}</span>
													<span class="text-[10px] text-text-muted">confirmed</span>
												</div>
												<div class="flex items-center gap-1">
													<span class="w-2 h-2 bg-warning"></span>
													<span class="text-xs font-mono font-bold text-warning">{dimStats.assumed}</span>
													<span class="text-[10px] text-text-muted">assumed</span>
												</div>
												<div class="flex items-center gap-1">
													<span class="w-2 h-2 bg-danger"></span>
													<span class="text-xs font-mono font-bold {dimStats.unknown > 0 ? 'text-danger' : 'text-text-muted'}">{dimStats.unknown}</span>
													<span class="text-[10px] text-text-muted">unknown</span>
												</div>
											</div>
											{#if dimData?.last_updated}
												<span class="ml-auto text-[10px] text-text-muted font-mono">
													Updated {new Date(dimData.last_updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
												</span>
											{/if}
										</div>

										<!-- Grouped answers: unknown/assumed first (attention items), then confirmed -->
										{@const needsAttention = answerEntries.filter(([, a]) => a.confidence !== 'confirmed')}
										{@const confirmed = answerEntries.filter(([, a]) => a.confidence === 'confirmed')}

										{#if needsAttention.length > 0}
											<div class="px-5 pt-4 pb-2">
												<h4 class="text-xs font-extrabold uppercase tracking-wider text-warning mb-2">
													Needs Attention ({needsAttention.length})
												</h4>
												<div class="space-y-1">
													{#each needsAttention as [qId, answer]}
														{@const isEditing = editingAnswer?.dimension === dim.key && editingAnswer?.questionId === qId}
														<div
															role="button"
															tabindex="0"
															class="flex items-start gap-3 px-3 py-2.5 border-2 border-border-light bg-surface hover:bg-surface-hover cursor-pointer transition-colors"
															style="border-left: 4px solid {answer.confidence === 'unknown' ? 'var(--color-danger)' : 'var(--color-warning)'}"
															onclick={() => { isEditing ? cancelEdit() : startEdit(dim.key, qId, answer); }}
															onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); isEditing ? cancelEdit() : startEdit(dim.key, qId, answer); } }}
														>
															<div class="flex-1 min-w-0">
																<span class="text-xs font-bold text-text-secondary">{formatQuestionId(qId)}</span>
																{#if isEditing}
																																		<div role="presentation" class="flex items-center gap-2 mt-1.5" onclick={(e) => e.stopPropagation()}>
																		<input
																			bind:value={editValue}
																			class="text-sm font-mono font-bold bg-warning-light border-2 border-warning px-2 py-1 flex-1
																				focus:outline-2 focus:outline-primary"
																			onkeydown={(e) => {
																				if (e.key === 'Enter') saveEdit();
																				if (e.key === 'Escape') cancelEdit();
																			}}
																		/>
																		<select
																			bind:value={editConfidence}
																			class="text-xs border-2 border-brutal px-1 py-1 bg-surface"
																		>
																			<option value="confirmed">Confirmed</option>
																			<option value="assumed">Assumed</option>
																			<option value="unknown">Unknown</option>
																		</select>
																		<button
																			class="px-2 py-1 text-xs font-bold bg-success text-white border border-success disabled:opacity-50"
																			disabled={saving}
																			onclick={saveEdit}
																		>{saving ? '...' : 'Save'}</button>
																		<button
																			class="px-2 py-1 text-xs font-bold bg-surface border border-brutal text-text-muted"
																			onclick={cancelEdit}
																		>Cancel</button>
																	</div>
																{:else}
																	<div class="flex items-center gap-2 mt-1">
																		<span class="font-mono font-bold text-sm">{formatValue(answer.value)}</span>
																		{#if answer.basis}
																			<span class="text-[10px] text-text-muted italic">({answer.basis})</span>
																		{/if}
																	</div>
																{/if}
															</div>
															<div class="flex items-center gap-2 shrink-0">
																<Tooltip text={answer.confidence === 'assumed' ? 'Based on assumption — needs validation' : 'No data available'} position="left">
																	<Badge variant={badgeVariant(answer.confidence)}>{answer.confidence ?? 'unknown'}</Badge>
																</Tooltip>
															</div>
														</div>
													{/each}
												</div>
											</div>
										{/if}

										{#if confirmed.length > 0}
											<div class="px-5 pt-3 pb-4">
												{#if needsAttention.length > 0}
													<!-- Confirmed section is collapsible when there are attention items above -->
													{@const showConfirmed = expandedDimensions[`${dim.key}-confirmed`] ?? false}
													<button
														class="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-success mb-2 cursor-pointer hover:opacity-80 transition-opacity w-full text-left"
														onclick={() => expandedDimensions[`${dim.key}-confirmed`] = !showConfirmed}
													>
														<span class="inline-block transition-transform duration-200 {showConfirmed ? 'rotate-90' : ''}" aria-hidden="true">&#9654;</span>
														Confirmed ({confirmed.length})
													</button>
													{#if showConfirmed}
														<div class="space-y-1">
															{#each confirmed as [qId, answer]}
																{@const isEditing = editingAnswer?.dimension === dim.key && editingAnswer?.questionId === qId}
																<div
																	role="button"
																	tabindex="0"
																	class="group flex items-start gap-3 px-3 py-2 border-b border-border-light last:border-0 hover:bg-surface-hover cursor-pointer transition-colors"
																	onclick={() => { isEditing ? cancelEdit() : startEdit(dim.key, qId, answer); }}
																	onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); isEditing ? cancelEdit() : startEdit(dim.key, qId, answer); } }}
																>
																	<div class="flex-1 min-w-0">
																		<span class="text-xs text-text-muted">{formatQuestionId(qId)}</span>
																		{#if isEditing}
																																						<div role="presentation" class="flex items-center gap-2 mt-1" onclick={(e) => e.stopPropagation()}>
																				<input
																					bind:value={editValue}
																					class="text-sm font-mono font-bold bg-warning-light border-2 border-warning px-2 py-1 flex-1
																						focus:outline-2 focus:outline-primary"
																					onkeydown={(e) => {
																						if (e.key === 'Enter') saveEdit();
																						if (e.key === 'Escape') cancelEdit();
																					}}
																				/>
																				<select
																					bind:value={editConfidence}
																					class="text-xs border-2 border-brutal px-1 py-1 bg-surface"
																				>
																					<option value="confirmed">Confirmed</option>
																					<option value="assumed">Assumed</option>
																					<option value="unknown">Unknown</option>
																				</select>
																				<button
																					class="px-2 py-1 text-xs font-bold bg-success text-white border border-success disabled:opacity-50"
																					disabled={saving}
																					onclick={saveEdit}
																				>{saving ? '...' : 'Save'}</button>
																				<button
																					class="px-2 py-1 text-xs font-bold bg-surface border border-brutal text-text-muted"
																					onclick={cancelEdit}
																				>Cancel</button>
																			</div>
																		{:else}
																			<span class="block font-mono font-bold text-sm mt-0.5">{formatValue(answer.value)}</span>
																		{/if}
																	</div>
																	<div class="flex items-center gap-2 shrink-0">
																		<Badge variant="success">confirmed</Badge>
																		{#if !isEditing}
																			<span class="text-xs text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">Edit</span>
																		{/if}
																	</div>
																</div>
															{/each}
														</div>
													{/if}
												{:else}
													<!-- No attention items — show confirmed directly -->
													<h4 class="text-xs font-extrabold uppercase tracking-wider text-success mb-2">
														All Confirmed ({confirmed.length})
													</h4>
													<div class="space-y-1">
														{#each confirmed as [qId, answer]}
															{@const isEditing = editingAnswer?.dimension === dim.key && editingAnswer?.questionId === qId}
															<div
																role="button"
																tabindex="0"
																class="group flex items-start gap-3 px-3 py-2 border-b border-border-light last:border-0 transition-colors
																	{isEditing ? '' : 'hover:bg-surface-hover cursor-pointer'}"
																onclick={() => { if (!isEditing) startEdit(dim.key, qId, answer); }}
																onkeydown={(e) => { if (!isEditing && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); startEdit(dim.key, qId, answer); } }}
															>
																<div class="flex-1 min-w-0">
																	<span class="text-xs text-text-muted">{formatQuestionId(qId)}</span>
																	{#if isEditing}
																		<div role="presentation" class="flex items-center gap-2 mt-1" onclick={(e) => e.stopPropagation()}>
																			<input
																				bind:value={editValue}
																				class="text-sm font-mono font-bold bg-warning-light border-2 border-warning px-2 py-1 flex-1
																					focus:outline-2 focus:outline-primary"
																				onkeydown={(e) => {
																					if (e.key === 'Enter') saveEdit();
																					if (e.key === 'Escape') cancelEdit();
																				}}
																			/>
																			<select
																				bind:value={editConfidence}
																				class="text-xs border-2 border-brutal px-1 py-1 bg-surface"
																			>
																				<option value="confirmed">Confirmed</option>
																				<option value="assumed">Assumed</option>
																				<option value="unknown">Unknown</option>
																			</select>
																			<button
																				class="px-2 py-1 text-xs font-bold bg-success text-white border border-success disabled:opacity-50"
																				disabled={saving}
																				onclick={saveEdit}
																			>{saving ? '...' : 'Save'}</button>
																			<button
																				class="px-2 py-1 text-xs font-bold bg-surface border border-brutal text-text-muted"
																				onclick={cancelEdit}
																			>Cancel</button>
																		</div>
																	{:else}
																		<span class="block font-mono font-bold text-sm mt-0.5">{formatValue(answer.value)}</span>
																	{/if}
																</div>
																<div class="flex items-center gap-2 shrink-0">
																	<Badge variant="success">confirmed</Badge>
																	{#if !isEditing}
																		<span class="text-xs text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">Edit</span>
																	{/if}
																</div>
															</div>
														{/each}
													</div>
												{/if}
											</div>
										{/if}
									{/if}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/each}
	{/if}
</div>

<InfoDrawer
	open={drawerSection !== null}
	onclose={() => drawerSection = null}
	title="About Discovery"
>
	{#if drawerSection === 'page'}
		<div class="space-y-4 text-sm">
			<p><strong>Discovery</strong> collects infrastructure and environment data across {summary.discovery.totalDimensions} dimensions. This data feeds directly into analysis, risk identification, and hour estimates.</p>

			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Impact Tiers</h3>
				<div class="space-y-1.5 text-text-secondary">
					<p><span class="inline-block w-3 h-3 bg-danger border border-danger mr-1.5 align-middle"></span> <strong>Critical</strong> — Must-have before estimation. Gaps here make estimates unreliable.</p>
					<p><span class="inline-block w-3 h-3 bg-warning border border-warning mr-1.5 align-middle"></span> <strong>High</strong> — Should-have. Assumptions carry significant widening hours.</p>
					<p><span class="inline-block w-3 h-3 bg-primary border border-primary mr-1.5 align-middle"></span> <strong>Medium</strong> — Important but can be estimated from topology defaults.</p>
					<p><span class="inline-block w-3 h-3 bg-text-muted border border-text-muted mr-1.5 align-middle"></span> <strong>Lower</strong> — Reasonable defaults usually produce acceptable estimates.</p>
				</div>
			</div>

			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Confidence Levels</h3>
				<div class="space-y-1 text-text-secondary">
					<p><strong class="text-success">Confirmed</strong> — Verified by client or evidence. Highest confidence.</p>
					<p><strong class="text-warning">Assumed</strong> — Based on educated guesses. Adds widening to estimates until validated.</p>
					<p><strong class="text-danger">Unknown</strong> — No data available. Creates the most uncertainty.</p>
				</div>
			</div>

			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Hours Swing</h3>
				<p class="text-text-secondary">Each dimension shows a typical hours swing range. This is how much the estimate could shift if data for that dimension is incomplete or wrong. Higher-impact dimensions have wider swings.</p>
			</div>

			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Progressive Disclosure</h3>
				<p class="text-text-secondary">Dimensions are grouped by impact tier. Click any dimension to expand its detail. Within each dimension, attention items (unknown/assumed) are shown first, with confirmed data collapsible below.</p>
			</div>

			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Related Pages</h3>
				<ul class="list-disc list-inside space-y-1 text-text-secondary">
					<li><a href="/assessments/{page.params.id}/analysis?tab=gaps" class="text-primary font-bold">Analysis Gaps</a> — See which missing data has the most impact</li>
					<li><a href="/assessments/{page.params.id}/estimate" class="text-primary font-bold">Estimate</a> — See how discovery data affects hours</li>
				</ul>
			</div>
		</div>
	{/if}
</InfoDrawer>
