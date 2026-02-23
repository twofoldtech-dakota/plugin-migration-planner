<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import Tooltip from '$lib/components/ui/Tooltip.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import CollapsibleSection from '$lib/components/ui/CollapsibleSection.svelte';
	import RadarChart from '$lib/components/charts/RadarChart.svelte';
	import { gradeColor } from '$lib/utils/pack-grading';

	let { data } = $props();

	// ── Local state ───────────────────────────────────────────
	let pack: Record<string, any> = $state({ ...data.pack });
	let activeTab = $state('heuristics');
	let showResearchModal = $state(false);
	let researching = $state(false);

	// ── Tab config ────────────────────────────────────────────
	const effortHours = $derived((pack.effort_hours ?? []) as any[]);
	const multipliers = $derived((pack.multipliers ?? []) as any[]);
	const gotchaPatterns = $derived((pack.gotcha_patterns ?? []) as any[]);
	const dependencyChains = $derived((pack.dependency_chains ?? []) as any[]);
	const phaseMappings = $derived((pack.phase_mappings ?? []) as any[]);
	const roles = $derived((pack.roles ?? []) as any[]);
	const sourceUrls = $derived((pack.source_urls ?? []) as any[]);
	const totalPaths = $derived(data.pathsAsSource.length + data.pathsAsTarget.length);

	const tabs = $derived([
		{ id: 'heuristics', label: 'Heuristics', count: effortHours.length + multipliers.length + gotchaPatterns.length },
		{ id: 'paths', label: 'Migration Paths', count: totalPaths },
		{ id: 'sources', label: 'Sources', count: sourceUrls.length },
		{ id: 'details', label: 'Details' }
	]);

	// ── Re-research action ────────────────────────────────────
	async function triggerResearch() {
		researching = true;
		try {
			const res = await fetch(`/api/knowledge/${pack.id}/research`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			});
			if (res.ok) {
				pack = { ...pack, confidence: 'draft', last_researched: null };
				showResearchModal = false;
			}
		} finally {
			researching = false;
		}
	}

	// ── Helpers ────────────────────────────────────────────────
	function formatDate(dateStr: string | null): string {
		if (!dateStr) return 'Never';
		return new Date(dateStr).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	const categoryVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted'> = {
		platform: 'default',
		cms: 'default',
		commerce: 'info',
		infrastructure: 'warning',
		martech: 'success',
		ai_dev: 'danger',
		service: 'muted',
		services: 'muted'
	};

	const confidenceVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted'> = {
		verified: 'success',
		preliminary: 'warning',
		draft: 'muted'
	};

	const complexityVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted'> = {
		low: 'success',
		medium: 'warning',
		high: 'danger',
		critical: 'danger'
	};

	const riskVariant: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
		low: 'success',
		medium: 'warning',
		high: 'danger',
		critical: 'danger'
	};

	function getRelatedPackName(packId: string): string {
		return data.relatedPacks[packId]?.name ?? packId;
	}

	function jsonArray(val: unknown): string[] {
		if (Array.isArray(val)) return val.map(String);
		return [];
	}
</script>

<svelte:head>
	<title>{pack.name} | Knowledge | MigrateIQ</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-6 py-8 animate-enter">
	<!-- ── Back link ────────────────────────────────────────── -->
	<a
		href="/knowledge"
		class="inline-flex items-center gap-1.5 text-sm font-bold text-text-secondary hover:text-primary transition-colors no-underline mb-6"
	>
		&larr; All Platforms
	</a>

	<!-- ── Header card ─────────────────────────────────────── -->
	<Card>
		<div class="flex flex-col gap-5">
			<!-- Top row: name + actions -->
			<div class="flex items-start justify-between gap-4">
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-3 mb-1">
						<div class="flex h-10 w-10 items-center justify-center brutal-border-thin bg-primary-light text-lg text-primary font-extrabold shrink-0">
							{pack.name.charAt(0).toUpperCase()}
						</div>
						<div class="flex-1 min-w-0">
							<h1 class="text-xl font-extrabold uppercase tracking-wider truncate">{pack.name}</h1>
							{#if pack.vendor || pack.latest_version}
								<p class="text-sm text-text-secondary">
									{pack.vendor}{pack.vendor && pack.latest_version ? ' \u00b7 ' : ''}
									{pack.latest_version ? `v${pack.latest_version}` : ''}
								</p>
							{/if}
						</div>
					</div>
				</div>
				<button
					onclick={() => (showResearchModal = true)}
					class="brutal-border-thin px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-warning-light text-warning border-warning hover:bg-warning hover:text-white transition-colors shrink-0
						focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
				>
					Re-Research
				</button>
			</div>

			<!-- Badges row -->
			<div class="flex flex-wrap items-center gap-2">
				<Badge variant={categoryVariant[pack.category] ?? 'default'}>{pack.category}</Badge>
				<Badge variant={confidenceVariant[pack.confidence] ?? 'muted'}>{pack.confidence}</Badge>
				{#if pack.direction && pack.direction !== 'both'}
					<Badge variant="muted">{pack.direction}</Badge>
				{/if}
				{#if data.grade}
					<Tooltip text="Thoroughness grade: {data.grade.overallScore}/100 across 9 dimensions" position="bottom">
						<span class="text-sm font-extrabold font-mono px-2 py-0.5 border-2 cursor-help {gradeColor(data.grade.overall)}">
							{data.grade.overall}
						</span>
					</Tooltip>
				{/if}
			</div>

			{#if pack.description}
				<p class="text-sm text-text-secondary">{pack.description}</p>
			{/if}

			<!-- Thoroughness Grade Radar -->
			{#if data.grade}
				<div class="border-t-2 border-border-light pt-4">
					<h3 class="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-3">Thoroughness Profile</h3>
					<div class="flex flex-col sm:flex-row items-center gap-6">
						<div class="shrink-0">
							<RadarChart
								dimensions={data.grade.dimensions.map((d) => ({
									label: d.label.replace('Dependency ', 'Dep. ').replace('Alternatives', 'Alt.').replace('Patterns', 'Pat.').replace('Mappings', 'Map.'),
									value: d.score,
									maxValue: 100,
								}))}
								size={200}
							/>
						</div>
						<div class="grid grid-cols-3 gap-x-4 gap-y-1.5 text-xs">
							{#each data.grade.dimensions as dim}
								<div class="flex items-center gap-1.5">
									<span class="text-[10px] font-bold font-mono px-1 py-0.5 border {gradeColor(dim.grade)}">{dim.grade}</span>
									<span class="text-text-muted">{dim.label}</span>
									<span class="font-mono text-text-secondary">({dim.count})</span>
								</div>
							{/each}
						</div>
					</div>
				</div>
			{/if}

			<!-- Summary stat chips -->
			<div class="flex flex-wrap gap-3 border-t-2 border-border-light pt-4">
				<Tooltip text="Effort hour components defined for this platform" position="bottom">
					<div class="flex items-center gap-2 brutal-border-thin px-3 py-1.5 bg-bg cursor-help">
						<span class="text-[10px] font-bold uppercase tracking-wider text-text-muted">Components</span>
						<span class="text-sm font-extrabold font-mono">{effortHours.length}</span>
					</div>
				</Tooltip>
				<Tooltip text="Gotcha patterns that add risk hours" position="bottom">
					<div class="flex items-center gap-2 brutal-border-thin px-3 py-1.5 bg-bg cursor-help">
						<span class="text-[10px] font-bold uppercase tracking-wider text-text-muted">Gotchas</span>
						<span class="text-sm font-extrabold font-mono">{gotchaPatterns.length}</span>
					</div>
				</Tooltip>
				<Tooltip text="Source URLs documenting this knowledge" position="bottom">
					<div class="flex items-center gap-2 brutal-border-thin px-3 py-1.5 bg-bg cursor-help">
						<span class="text-[10px] font-bold uppercase tracking-wider text-text-muted">Sources</span>
						<span class="text-sm font-extrabold font-mono">{sourceUrls.length}</span>
					</div>
				</Tooltip>
				<Tooltip text="Migration paths involving this platform" position="bottom">
					<div class="flex items-center gap-2 brutal-border-thin px-3 py-1.5 bg-bg cursor-help">
						<span class="text-[10px] font-bold uppercase tracking-wider text-text-muted">Paths</span>
						<span class="text-sm font-extrabold font-mono">{totalPaths}</span>
					</div>
				</Tooltip>
				<div class="flex-1"></div>
				<span class="text-xs font-mono text-text-muted self-center">
					Updated {formatDate(pack.updated_at)}
					{#if pack.last_researched}
						&middot; Researched {formatDate(pack.last_researched)}
					{/if}
				</span>
			</div>
		</div>
	</Card>

	<!-- ── Tabbed content ──────────────────────────────────── -->
	<div class="mt-8">
		<Tabs
			{tabs}
			active={activeTab}
			onchange={(id) => (activeTab = id)}
		>
			<!-- ── Migration Paths ───────────────────────────── -->
			{#if activeTab === 'paths'}
				<div id="panel-paths" role="tabpanel">
					{#if totalPaths === 0}
						<div class="py-12 text-center">
							<div class="flex h-14 w-14 mx-auto items-center justify-center brutal-border-thin bg-bg text-2xl text-text-muted mb-4">
								&#8644;
							</div>
							<p class="text-sm font-bold text-text-muted">No migration paths documented yet.</p>
							<p class="text-xs text-text-muted mt-1">Run the research pipeline to discover migration paths.</p>
						</div>
					{:else}
						<!-- Migrate FROM this platform -->
						{#if data.pathsAsSource.length > 0}
							<div class="mb-8">
								<h3 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-3 pb-1.5 border-b-2 border-border-light">
									Migrate From {pack.name} &rarr;
								</h3>
								<div class="grid gap-4 lg:grid-cols-2 stagger-grid">
									{#each data.pathsAsSource as path, i}
										<a href="/knowledge/{path.target_pack_id}" class="no-underline group" style="--stagger-i: {i};">
											<Card hover>
												<div class="flex flex-col gap-3">
													<div class="flex items-start justify-between gap-3">
														<div class="min-w-0">
															<h4 class="font-extrabold text-text truncate group-hover:text-primary transition-colors">
																&rarr; {getRelatedPackName(path.target_pack_id)}
															</h4>
															{#if path.typical_duration}
																<p class="text-xs text-text-muted mt-0.5">{path.typical_duration}</p>
															{/if}
														</div>
														<div class="flex gap-1.5 shrink-0">
															{#if path.complexity}
																<Badge variant={complexityVariant[path.complexity] ?? 'default'}>
																	{path.complexity}
																</Badge>
															{/if}
															{#if path.confidence}
																<Badge variant={confidenceVariant[path.confidence] ?? 'muted'}>
																	{path.confidence}
																</Badge>
															{/if}
														</div>
													</div>
													{#if path.prevalence}
														<div class="flex items-center gap-2 text-xs text-text-secondary">
															<span class="font-bold uppercase tracking-wider text-text-muted">Prevalence</span>
															<span class="font-mono">{path.prevalence}</span>
														</div>
													{/if}
												</div>
											</Card>
										</a>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Migrate TO this platform -->
						{#if data.pathsAsTarget.length > 0}
							<div>
								<h3 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-3 pb-1.5 border-b-2 border-border-light">
									&larr; Migrate To {pack.name}
								</h3>
								<div class="grid gap-4 lg:grid-cols-2 stagger-grid">
									{#each data.pathsAsTarget as path, i}
										<a href="/knowledge/{path.source_pack_id}" class="no-underline group" style="--stagger-i: {i};">
											<Card hover>
												<div class="flex flex-col gap-3">
													<div class="flex items-start justify-between gap-3">
														<div class="min-w-0">
															<h4 class="font-extrabold text-text truncate group-hover:text-primary transition-colors">
																{getRelatedPackName(path.source_pack_id)} &rarr;
															</h4>
															{#if path.typical_duration}
																<p class="text-xs text-text-muted mt-0.5">{path.typical_duration}</p>
															{/if}
														</div>
														<div class="flex gap-1.5 shrink-0">
															{#if path.complexity}
																<Badge variant={complexityVariant[path.complexity] ?? 'default'}>
																	{path.complexity}
																</Badge>
															{/if}
															{#if path.confidence}
																<Badge variant={confidenceVariant[path.confidence] ?? 'muted'}>
																	{path.confidence}
																</Badge>
															{/if}
														</div>
													</div>
													{#if path.prevalence}
														<div class="flex items-center gap-2 text-xs text-text-secondary">
															<span class="font-bold uppercase tracking-wider text-text-muted">Prevalence</span>
															<span class="font-mono">{path.prevalence}</span>
														</div>
													{/if}
												</div>
											</Card>
										</a>
									{/each}
								</div>
							</div>
						{/if}
					{/if}
				</div>

			<!-- ── Heuristics ────────────────────────────────── -->
			{:else if activeTab === 'heuristics'}
				<div id="panel-heuristics" role="tabpanel" class="space-y-4">
					{#if effortHours.length === 0 && multipliers.length === 0 && gotchaPatterns.length === 0}
						<div class="py-12 text-center">
							<div class="flex h-14 w-14 mx-auto items-center justify-center brutal-border-thin bg-bg text-2xl text-text-muted mb-4">
								&#9881;
							</div>
							<p class="text-sm font-bold text-text-muted">No heuristics data yet.</p>
							<p class="text-xs text-text-muted mt-1">Research agents populate effort hours, multipliers, and gotcha patterns.</p>
						</div>
					{:else}
						<!-- Effort Hours -->
						{#if effortHours.length > 0}
							<CollapsibleSection
								title="Effort Hours"
								subtitle="{effortHours.length} components"
								badge="{effortHours.reduce((s, e) => s + (e.base_hours ?? 0), 0)}h total"
								badgeVariant="default"
								open={false}
							>
								<div class="overflow-x-auto">
									<table class="w-full text-sm">
										<thead>
											<tr class="bg-brutal text-white text-left">
												<th class="px-3 py-2 font-bold uppercase tracking-wider text-xs">Component</th>
												<th class="px-3 py-2 font-bold uppercase tracking-wider text-xs text-right">Base Hours</th>
												<th class="px-3 py-2 font-bold uppercase tracking-wider text-xs">Unit</th>
												<th class="px-3 py-2 font-bold uppercase tracking-wider text-xs">Phase</th>
											</tr>
										</thead>
										<tbody>
											{#each effortHours as item, i}
												<tr class="border-b border-border-light hover:bg-surface-hover transition-colors {i % 2 === 0 ? 'bg-surface' : 'bg-bg'}">
													<td class="px-3 py-2 font-bold">{item.component_name || item.component_id}</td>
													<td class="px-3 py-2 text-right font-mono font-bold">{item.base_hours}</td>
													<td class="px-3 py-2 text-text-muted font-mono">{item.unit || '\u2014'}</td>
													<td class="px-3 py-2 text-text-muted font-mono text-xs">{item.phase_id || '\u2014'}</td>
												</tr>
											{/each}
										</tbody>
									</table>
								</div>
							</CollapsibleSection>
						{/if}

						<!-- Gotcha Patterns -->
						{#if gotchaPatterns.length > 0}
							<CollapsibleSection
								title="Gotcha Patterns"
								subtitle="{gotchaPatterns.length} patterns"
								badge="{gotchaPatterns.reduce((s, g) => s + (g.hours_impact ?? 0), 0)}h risk"
								badgeVariant="danger"
								open={false}
							>
								<div class="space-y-2">
									{#each gotchaPatterns as gotcha}
										<div class="flex gap-3 px-3 py-2.5 border-2 border-border-light hover:border-brutal transition-colors bg-surface">
											<div class="shrink-0 mt-0.5">
												<Badge variant={riskVariant[gotcha.risk_level] ?? 'warning'}>
													{gotcha.risk_level}
												</Badge>
											</div>
											<div class="flex-1 min-w-0">
												<div class="flex items-center gap-2">
													<span class="text-sm font-bold">{gotcha.pattern_condition || gotcha.pattern_id}</span>
													<span class="text-xs font-mono font-bold text-danger">+{gotcha.hours_impact ?? 0}h</span>
												</div>
												{#if gotcha.description}
													<p class="text-xs text-text-secondary mt-0.5">{gotcha.description}</p>
												{/if}
												{#if gotcha.mitigation}
													<p class="text-xs text-success mt-1">
														<span class="font-bold uppercase tracking-wider">Mitigation:</span> {gotcha.mitigation}
													</p>
												{/if}
											</div>
										</div>
									{/each}
								</div>
							</CollapsibleSection>
						{/if}

						<!-- Multipliers -->
						{#if multipliers.length > 0}
							<CollapsibleSection
								title="Complexity Multipliers"
								subtitle="{multipliers.length} multipliers"
								open={false}
							>
								<div class="overflow-x-auto">
									<table class="w-full text-sm">
										<thead>
											<tr class="bg-brutal text-white text-left">
												<th class="px-3 py-2 font-bold uppercase tracking-wider text-xs">Condition</th>
												<th class="px-3 py-2 font-bold uppercase tracking-wider text-xs text-right">Factor</th>
												<th class="px-3 py-2 font-bold uppercase tracking-wider text-xs">Reason</th>
											</tr>
										</thead>
										<tbody>
											{#each multipliers as m, i}
												<tr class="border-b border-border-light hover:bg-surface-hover transition-colors {i % 2 === 0 ? 'bg-surface' : 'bg-bg'}">
													<td class="px-3 py-2 font-bold">{m.condition || m.multiplier_id}</td>
													<td class="px-3 py-2 text-right font-mono font-bold
														{m.factor > 1.3 ? 'text-danger' : m.factor > 1.0 ? 'text-warning' : 'text-success'}">
														{m.factor}x
													</td>
													<td class="px-3 py-2 text-text-secondary text-xs">{m.reason || '\u2014'}</td>
												</tr>
											{/each}
										</tbody>
									</table>
								</div>
							</CollapsibleSection>
						{/if}

						<!-- Dependency Chains -->
						{#if dependencyChains.length > 0}
							<CollapsibleSection
								title="Dependency Chains"
								subtitle="{dependencyChains.length} chains"
								open={false}
							>
								<div class="space-y-2">
									{#each dependencyChains as chain}
										<div class="flex items-center gap-3 px-3 py-2 border-2 border-border-light bg-surface text-sm">
											<span class="font-bold font-mono">{chain.predecessor}</span>
											<span class="text-text-muted">&rarr;</span>
											<span class="font-mono text-text-secondary">
												{jsonArray(chain.successors).join(', ')}
											</span>
											<Badge variant={chain.dependency_type === 'hard' ? 'danger' : 'warning'}>
												{chain.dependency_type}
											</Badge>
										</div>
									{/each}
								</div>
							</CollapsibleSection>
						{/if}

						<!-- Phase Mappings -->
						{#if phaseMappings.length > 0}
							<CollapsibleSection
								title="Phase Mappings"
								subtitle="{phaseMappings.length} phases"
								open={false}
							>
								<div class="space-y-2">
									{#each phaseMappings.toSorted((a, b) => (a.phase_order ?? 0) - (b.phase_order ?? 0)) as phase}
										<div class="flex items-start gap-3 px-3 py-2.5 border-2 border-border-light bg-surface">
											<span class="brutal-border-thin bg-primary text-white text-xs font-bold px-2 py-0.5 shrink-0">
												{phase.phase_order ?? '?'}
											</span>
											<div class="flex-1 min-w-0">
												<span class="text-sm font-bold">{phase.phase_name || phase.phase_id}</span>
												{#if jsonArray(phase.component_ids).length > 0}
													<p class="text-xs text-text-muted mt-0.5 font-mono">
														{jsonArray(phase.component_ids).join(', ')}
													</p>
												{/if}
											</div>
										</div>
									{/each}
								</div>
							</CollapsibleSection>
						{/if}

						<!-- Roles -->
						{#if roles.length > 0}
							<CollapsibleSection
								title="Roles"
								subtitle="{roles.length} roles"
								open={false}
							>
								<div class="grid gap-3 md:grid-cols-2">
									{#each roles as role}
										<div class="px-3 py-2.5 border-2 border-border-light bg-surface">
											<span class="text-sm font-bold">{role.role_id}</span>
											{#if role.description}
												<p class="text-xs text-text-secondary mt-0.5">{role.description}</p>
											{/if}
											{#if role.typical_rate_range}
												<p class="text-xs font-mono text-text-muted mt-1">{role.typical_rate_range}</p>
											{/if}
										</div>
									{/each}
								</div>
							</CollapsibleSection>
						{/if}
					{/if}
				</div>

			<!-- ── Sources ───────────────────────────────────── -->
			{:else if activeTab === 'sources'}
				<div id="panel-sources" role="tabpanel">
					{#if sourceUrls.length === 0}
						<div class="py-12 text-center">
							<div class="flex h-14 w-14 mx-auto items-center justify-center brutal-border-thin bg-bg text-2xl text-text-muted mb-4">
								&#128279;
							</div>
							<p class="text-sm font-bold text-text-muted">No sources documented yet.</p>
							<p class="text-xs text-text-muted mt-1">Research agents attach source URLs for traceability.</p>
						</div>
					{:else}
						<div class="overflow-x-auto">
							<table class="w-full text-sm">
								<thead>
									<tr class="bg-brutal text-white text-left">
										<th class="px-3 py-2 font-bold uppercase tracking-wider text-xs">Title</th>
										<th class="px-3 py-2 font-bold uppercase tracking-wider text-xs">Type</th>
										<th class="px-3 py-2 font-bold uppercase tracking-wider text-xs">Confidence</th>
										<th class="px-3 py-2 font-bold uppercase tracking-wider text-xs text-center">Accessible</th>
									</tr>
								</thead>
								<tbody>
									{#each sourceUrls as src, i}
										<tr class="border-b border-border-light hover:bg-surface-hover transition-colors {i % 2 === 0 ? 'bg-surface' : 'bg-bg'}">
											<td class="px-3 py-2">
												{#if src.url}
													<a
														href={src.url}
														target="_blank"
														rel="noopener noreferrer"
														class="font-bold text-primary hover:text-primary-hover no-underline hover:underline"
													>
														{src.title || src.url}
													</a>
												{:else}
													<span class="font-bold">{src.title || 'Untitled'}</span>
												{/if}
											</td>
											<td class="px-3 py-2">
												{#if src.source_type}
													<Badge variant="muted">{src.source_type}</Badge>
												{:else}
													<span class="text-text-muted">&mdash;</span>
												{/if}
											</td>
											<td class="px-3 py-2">
												{#if src.confidence}
													<Badge variant={confidenceVariant[src.confidence] ?? 'muted'}>
														{src.confidence}
													</Badge>
												{:else}
													<span class="text-text-muted">&mdash;</span>
												{/if}
											</td>
											<td class="px-3 py-2 text-center">
												{#if src.still_accessible === true}
													<span class="text-success font-bold" title="URL verified accessible">&#10003;</span>
												{:else if src.still_accessible === false}
													<span class="text-danger font-bold" title="URL not accessible">&#10007;</span>
												{:else}
													<span class="text-text-muted" title="Not checked">&mdash;</span>
												{/if}
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{/if}
				</div>

			<!-- ── Details ───────────────────────────────────── -->
			{:else if activeTab === 'details'}
				<div id="panel-details" role="tabpanel" class="space-y-6">
					<!-- Pack metadata grid -->
					<div class="grid gap-4 md:grid-cols-2">
						<!-- Supported Versions -->
						<div class="px-4 py-3 border-2 border-border-light bg-surface">
							<h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-2">Supported Versions</h4>
							{#if jsonArray(pack.supported_versions).length > 0}
								<div class="flex flex-wrap gap-1.5">
									{#each jsonArray(pack.supported_versions) as ver}
										<span class="brutal-border-thin px-2 py-0.5 text-xs font-mono bg-bg">{ver}</span>
									{/each}
								</div>
							{:else}
								<p class="text-sm text-text-muted">&mdash;</p>
							{/if}
						</div>

						<!-- EOL Versions -->
						<div class="px-4 py-3 border-2 border-border-light bg-surface">
							<h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-2">EOL Versions</h4>
							{#if pack.eol_versions && typeof pack.eol_versions === 'object' && Object.keys(pack.eol_versions).length > 0}
								<div class="flex flex-wrap gap-1.5">
									{#each Object.entries(pack.eol_versions) as [ver, date]}
										<Tooltip text="EOL: {date}" position="bottom">
											<span class="brutal-border-thin px-2 py-0.5 text-xs font-mono bg-danger-light text-danger border-danger cursor-help">{ver}</span>
										</Tooltip>
									{/each}
								</div>
							{:else}
								<p class="text-sm text-text-muted">&mdash;</p>
							{/if}
						</div>

						<!-- Deployment Models -->
						<div class="px-4 py-3 border-2 border-border-light bg-surface">
							<h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-2">Deployment Models</h4>
							{#if jsonArray(pack.deployment_models).length > 0}
								<div class="flex flex-wrap gap-1.5">
									{#each jsonArray(pack.deployment_models) as model}
										<Badge variant="info">{model}</Badge>
									{/each}
								</div>
							{:else}
								<p class="text-sm text-text-muted">&mdash;</p>
							{/if}
						</div>

						<!-- Valid Topologies -->
						<div class="px-4 py-3 border-2 border-border-light bg-surface">
							<h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-2">Valid Topologies</h4>
							{#if jsonArray(pack.valid_topologies).length > 0}
								<div class="flex flex-wrap gap-1.5">
									{#each jsonArray(pack.valid_topologies) as topo}
										<span class="brutal-border-thin px-2 py-0.5 text-xs font-mono bg-bg">{topo}</span>
									{/each}
								</div>
							{:else}
								<p class="text-sm text-text-muted">&mdash;</p>
							{/if}
						</div>

						<!-- Compatible Targets -->
						<div class="px-4 py-3 border-2 border-border-light bg-surface">
							<h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-2">Compatible Targets</h4>
							{#if jsonArray(pack.compatible_targets).length > 0}
								<div class="flex flex-wrap gap-1.5">
									{#each jsonArray(pack.compatible_targets) as target}
										<Badge variant="success">{target}</Badge>
									{/each}
								</div>
							{:else}
								<p class="text-sm text-text-muted">&mdash;</p>
							{/if}
						</div>

						<!-- Compatible Infrastructure -->
						<div class="px-4 py-3 border-2 border-border-light bg-surface">
							<h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-2">Compatible Infrastructure</h4>
							{#if jsonArray(pack.compatible_infrastructure).length > 0}
								<div class="flex flex-wrap gap-1.5">
									{#each jsonArray(pack.compatible_infrastructure) as infra}
										<Badge variant="warning">{infra}</Badge>
									{/each}
								</div>
							{:else}
								<p class="text-sm text-text-muted">&mdash;</p>
							{/if}
						</div>

						<!-- Required Services -->
						<div class="px-4 py-3 border-2 border-border-light bg-surface">
							<h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-2">Required Services</h4>
							{#if jsonArray(pack.required_services).length > 0}
								<div class="flex flex-wrap gap-1.5">
									{#each jsonArray(pack.required_services) as svc}
										<Badge variant="danger">{svc}</Badge>
									{/each}
								</div>
							{:else}
								<p class="text-sm text-text-muted">&mdash;</p>
							{/if}
						</div>

						<!-- Optional Services -->
						<div class="px-4 py-3 border-2 border-border-light bg-surface">
							<h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-2">Optional Services</h4>
							{#if jsonArray(pack.optional_services).length > 0}
								<div class="flex flex-wrap gap-1.5">
									{#each jsonArray(pack.optional_services) as svc}
										<Badge variant="muted">{svc}</Badge>
									{/each}
								</div>
							{:else}
								<p class="text-sm text-text-muted">&mdash;</p>
							{/if}
						</div>
					</div>

					<!-- Raw metadata -->
					<div class="border-t-2 border-border-light pt-4">
						<div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
							<div>
								<span class="font-bold uppercase tracking-wider text-text-muted block">Pack ID</span>
								<span class="font-mono mt-0.5 block break-all">{pack.id}</span>
							</div>
							<div>
								<span class="font-bold uppercase tracking-wider text-text-muted block">Version</span>
								<span class="font-mono mt-0.5 block">{pack.pack_version ?? '\u2014'}</span>
							</div>
							<div>
								<span class="font-bold uppercase tracking-wider text-text-muted block">Created</span>
								<span class="font-mono mt-0.5 block">{formatDate(pack.created_at)}</span>
							</div>
							<div>
								<span class="font-bold uppercase tracking-wider text-text-muted block">Last Researched</span>
								<span class="font-mono mt-0.5 block">{formatDate(pack.last_researched)}</span>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</Tabs>
	</div>
</div>

<!-- ── Re-Research confirmation modal ─────────────────────── -->
<Modal open={showResearchModal} onclose={() => (showResearchModal = false)} title="Re-Research Pack" size="sm">
	<div class="space-y-4">
		<p class="text-sm">
			Queue <strong>{pack.name}</strong> for re-research? This will:
		</p>
		<ul class="text-sm space-y-1 ml-4 list-disc text-text-secondary">
			<li>Reset confidence to <Badge variant="muted">draft</Badge></li>
			<li>Clear the last researched timestamp</li>
			<li>Research agents will pick up this pack on their next run</li>
		</ul>
	</div>

	{#snippet footer()}
		<div class="flex justify-end gap-3">
			<button
				onclick={() => (showResearchModal = false)}
				class="brutal-border-thin px-4 py-2 text-xs font-bold uppercase tracking-wider bg-surface hover:bg-surface-hover transition-colors"
			>
				Cancel
			</button>
			<button
				onclick={triggerResearch}
				disabled={researching}
				class="brutal-border-thin px-4 py-2 text-xs font-bold uppercase tracking-wider bg-warning text-white border-warning hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{researching ? 'Queuing...' : 'Queue Research'}
			</button>
		</div>
	{/snippet}
</Modal>
