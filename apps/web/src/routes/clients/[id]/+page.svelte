<script lang="ts">
	import { goto } from '$app/navigation';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import InlineEdit from '$lib/components/ui/InlineEdit.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import Tooltip from '$lib/components/ui/Tooltip.svelte';

	let { data } = $props();

	// ── Editable client state ─────────────────────────────────
	let client = $state<Record<string, any>>({});
	let proficiencies = $state<Record<string, { proficiency: string; notes: string }>>({});

	$effect(() => {
		client = { ...data.client };
		proficiencies = { ...data.client.proficiencies };
	});

	// ── Category splits ───────────────────────────────────────
	const categories = $derived(data.catalog?.categories ?? {});
	const proficiencyLevels = $derived(data.catalog?.proficiency_levels ?? ['none', 'beginner', 'intermediate', 'advanced', 'expert']);

	const platformCatIds = ['azure_services', 'aws_services'];
	const generalCatIds = $derived(Object.keys(categories).filter((id: string) => !platformCatIds.includes(id)));

	// ── Tab state ─────────────────────────────────────────────
	let activeTab = $state('general');
	const tabs = $derived([
		{ id: 'general', label: 'General Tech', count: generalCatIds.length },
		{ id: 'platform', label: 'Platform Skills', count: platformCatIds.length },
		{ id: 'ai', label: 'AI Tooling', count: data.aiTools?.length ?? 0 },
		{ id: 'assessments', label: 'Assessments', count: data.linkedAssessments.length },
	]);

	// ── AI tool grouping ──────────────────────────────────────
	const aiTools = $derived((data.aiTools ?? []) as any[]);

	const aiCategoryNames: Record<string, string> = {
		discovery_assessment: 'Discovery & Assessment',
		data_migration: 'Data Migration',
		storage_migration: 'Storage Migration',
		code_assistance: 'Code Assistance',
		infrastructure_automation: 'Infrastructure Automation',
		testing_validation: 'Testing & Validation',
		monitoring_observability: 'Monitoring & Observability',
		security_compliance: 'Security & Compliance',
		cicd_devops: 'CI/CD & DevOps',
		backup_dr: 'Backup & DR',
		network_dns: 'Network & DNS'
	};

	function getAiCategories(): [string, { name: string; tools: any[] }][] {
		const map = new Map<string, { name: string; tools: any[] }>();
		for (const tool of aiTools) {
			const catId = tool.category ?? 'other';
			if (!map.has(catId)) {
				const catName = aiCategoryNames[catId] ?? catId.replace(/_/g, ' ');
				map.set(catId, { name: catName, tools: [] });
			}
			map.get(catId)!.tools.push(tool);
		}
		return [...map.entries()];
	}

	const aiCategoryList = getAiCategories();

	// AI tool stances: include / exclude / open
	const AI_PREFIX = 'aitool_';
	const stances = ['include', 'exclude', 'open'] as const;
	type Stance = (typeof stances)[number];

	function getToolStance(toolId: string): Stance {
		const val = proficiencies[AI_PREFIX + toolId]?.proficiency;
		if (val === 'include' || val === 'exclude' || val === 'open') return val;
		return 'open'; // default
	}

	// ── Delete confirmation ───────────────────────────────────
	let showDeleteModal = $state(false);
	let deleting = $state(false);

	// ── Persistence ───────────────────────────────────────────
	async function saveField(field: 'name' | 'industry' | 'notes', value: string) {
		const updated = { ...client, [field]: value };
		client[field] = value;
		await fetch(`/api/clients/${client.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: updated.name, industry: updated.industry, notes: updated.notes })
		});
	}

	async function saveProficiency(categoryId: string, level: string) {
		proficiencies = {
			...proficiencies,
			[categoryId]: { proficiency: level, notes: proficiencies[categoryId]?.notes ?? '' }
		};
		await fetch(`/api/clients/${client.id}/proficiencies`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ proficiencies })
		});
	}

	async function saveToolStance(toolId: string, stance: Stance) {
		await saveProficiency(AI_PREFIX + toolId, stance);
	}

	async function bulkSetTools(stance: Stance) {
		const updated = { ...proficiencies };
		for (const tool of aiTools) {
			updated[AI_PREFIX + tool.id] = { proficiency: stance, notes: '' };
		}
		proficiencies = updated;
		await fetch(`/api/clients/${client.id}/proficiencies`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ proficiencies })
		});
	}

	async function deleteClient() {
		deleting = true;
		try {
			const res = await fetch(`/api/clients/${client.id}`, { method: 'DELETE' });
			if (res.ok) {
				goto('/clients');
			}
		} finally {
			deleting = false;
		}
	}

	// ── Derived stats ─────────────────────────────────────────
	let proficiencyStats = $derived.by(() => {
		const allCatIds = Object.keys(categories);
		let filled = 0;
		let total = allCatIds.length;
		let levelSum = 0;
		for (const catId of allCatIds) {
			const p = proficiencies[catId]?.proficiency ?? 'none';
			if (p !== 'none') {
				filled++;
				levelSum += proficiencyLevels.indexOf(p);
			}
		}
		const avgLevel = filled > 0 ? levelSum / filled : 0;
		return { filled, total, avgLevel };
	});

	let aiToolStats = $derived.by(() => {
		let included = 0;
		let excluded = 0;
		let open = 0;
		for (const tool of aiTools) {
			const s = getToolStance(tool.id);
			if (s === 'include') included++;
			else if (s === 'exclude') excluded++;
			else open++;
		}
		return { included, excluded, open, total: aiTools.length };
	});

	// ── Helpers ────────────────────────────────────────────────
	const proficiencyColors: Record<string, string> = {
		none: 'bg-border-light text-text-muted border-border-light',
		beginner: 'bg-danger-light text-danger border-danger',
		intermediate: 'bg-warning-light text-warning border-warning',
		advanced: 'bg-info-light text-info border-info',
		expert: 'bg-success-light text-success border-success'
	};

	const stanceConfig: Record<Stance, { label: string; color: string; icon: string }> = {
		include: { label: 'Include', color: 'bg-success-light text-success border-success', icon: '+' },
		open: { label: 'Open', color: 'bg-warning-light text-warning border-warning', icon: '~' },
		exclude: { label: 'Exclude', color: 'bg-danger-light text-danger border-danger', icon: '-' }
	};

	function proficiencyBarWidth(level: string): number {
		const idx = proficiencyLevels.indexOf(level);
		if (idx <= 0) return 0;
		return (idx / (proficiencyLevels.length - 1)) * 100;
	}

	function proficiencyBarColor(level: string): string {
		switch (level) {
			case 'expert': return 'bg-success';
			case 'advanced': return 'bg-info';
			case 'intermediate': return 'bg-warning';
			case 'beginner': return 'bg-danger';
			default: return 'bg-border-light';
		}
	}

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

	const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
		planning: 'default',
		discovery: 'info',
		analysis: 'warning',
		estimation: 'default',
		complete: 'success'
	};

	const industryVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
		healthcare: 'danger',
		finance: 'warning',
		retail: 'info',
		technology: 'success',
		education: 'default',
		manufacturing: 'warning',
		government: 'info'
	};

	function parseIndustries(raw: string): string[] {
		return raw.split(',').map((s) => s.trim()).filter(Boolean);
	}
</script>

<svelte:head>
	<title>{client.name} | Clients | MigrateIQ</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-6 py-8 animate-enter">
	<!-- ── Back link ────────────────────────────────────────── -->
	<a
		href="/clients"
		class="inline-flex items-center gap-1.5 text-sm font-bold text-text-secondary hover:text-primary transition-colors no-underline mb-6"
	>
		&larr; All Clients
	</a>

	<!-- ── Header card ─────────────────────────────────────── -->
	<Card>
		<div class="flex flex-col gap-5">
			<!-- Top row: name + actions -->
			<div class="flex items-start justify-between gap-4">
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-3 mb-1">
						<div class="flex h-10 w-10 items-center justify-center brutal-border-thin bg-primary-light text-lg text-primary font-extrabold shrink-0">
							{client.name.charAt(0).toUpperCase()}
						</div>
						<div class="flex-1 min-w-0">
							<InlineEdit value={client.name} onsave={(v) => saveField('name', v)} placeholder="Client name" />
						</div>
						{#if client.industry}
							<div class="flex flex-wrap gap-1">
								{#each parseIndustries(client.industry) as tag}
									<Badge variant={industryVariant[tag.toLowerCase()] ?? 'default'}>
										{tag}
									</Badge>
								{/each}
							</div>
						{/if}
					</div>
				</div>
				<button
					onclick={() => (showDeleteModal = true)}
					class="brutal-border-thin px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-danger border-danger hover:bg-danger-light transition-colors shrink-0
						focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
				>
					Delete
				</button>
			</div>

			<!-- Editable fields row -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<span class="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-0.5">Industry</span>
					<InlineEdit value={client.industry} onsave={(v) => saveField('industry', v)} placeholder="e.g. Healthcare, Finance, Retail (comma-separated)" size="sm" />
				</div>
				<div>
					<span class="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-0.5">Notes</span>
					<InlineEdit value={client.notes} onsave={(v) => saveField('notes', v)} placeholder="Key contacts, special considerations..." size="sm" />
				</div>
			</div>

			<!-- Summary stat chips -->
			<div class="flex flex-wrap gap-3 border-t-2 border-border-light pt-4">
				<Tooltip text="Technology categories with proficiency set above 'none'" position="bottom">
					<div class="flex items-center gap-2 brutal-border-thin px-3 py-1.5 bg-bg cursor-help">
						<span class="text-[10px] font-bold uppercase tracking-wider text-text-muted">Proficiencies</span>
						<span class="text-sm font-extrabold font-mono">{proficiencyStats.filled}/{proficiencyStats.total}</span>
					</div>
				</Tooltip>
				<Tooltip text="AI tools marked as Include for this client" position="bottom">
					<div class="flex items-center gap-2 brutal-border-thin px-3 py-1.5 bg-bg cursor-help">
						<span class="text-[10px] font-bold uppercase tracking-wider text-text-muted">AI Included</span>
						<span class="text-sm font-extrabold font-mono text-success">{aiToolStats.included}</span>
					</div>
				</Tooltip>
				<Tooltip text="AI tools excluded by this client" position="bottom">
					<div class="flex items-center gap-2 brutal-border-thin px-3 py-1.5 bg-bg cursor-help">
						<span class="text-[10px] font-bold uppercase tracking-wider text-text-muted">AI Excluded</span>
						<span class="text-sm font-extrabold font-mono text-danger">{aiToolStats.excluded}</span>
					</div>
				</Tooltip>
				<Tooltip text="Assessments linked to this client" position="bottom">
					<div class="flex items-center gap-2 brutal-border-thin px-3 py-1.5 bg-bg cursor-help">
						<span class="text-[10px] font-bold uppercase tracking-wider text-text-muted">Assessments</span>
						<span class="text-sm font-extrabold font-mono">{data.linkedAssessments.length}</span>
					</div>
				</Tooltip>
				<div class="flex-1"></div>
				<span class="text-xs font-mono text-text-muted self-center">
					Created {formatDate(client.created_at)} &middot; Updated {formatDate(client.updated_at)}
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
			<!-- ── General Technologies ───────────────────────── -->
			{#if activeTab === 'general'}
				<div id="panel-general" role="tabpanel">
					<p class="text-xs text-text-secondary mb-4">
						Rate your client team's proficiency in each technology area. This calibrates adoption overhead in estimates.
					</p>
					<div class="space-y-1">
						{#each generalCatIds as catId, i}
							{@const cat = categories[catId]}
							{@const current = proficiencies[catId]?.proficiency ?? 'none'}
							{#if cat}
								<div
									class="flex items-center gap-4 px-4 py-3 border-2 border-border-light hover:border-brutal transition-colors duration-100 bg-surface"
									style="--stagger-i: {i};"
								>
									<!-- Category info -->
									<div class="flex-1 min-w-0">
										<div class="flex items-center gap-2">
											<span class="text-sm font-bold">{cat.name}</span>
											<span class="text-xs text-text-muted hidden sm:inline">{cat.description}</span>
										</div>
										<!-- Proficiency bar -->
										<div class="mt-1.5 flex items-center gap-2">
											<div class="h-1.5 flex-1 max-w-[120px] bg-border-light">
												<div
													class="h-full {proficiencyBarColor(current)} transition-all duration-200"
													style="width: {proficiencyBarWidth(current)}%"
												></div>
											</div>
											{#if current !== 'none'}
												<span class="text-[10px] font-bold uppercase tracking-wider {proficiencyColors[current].split(' ')[1]}">{current}</span>
											{/if}
										</div>
									</div>

									<!-- Level buttons -->
									<div class="flex gap-0.5 shrink-0">
										{#each proficiencyLevels as level}
											<button
												onclick={() => saveProficiency(catId, level)}
												class="w-7 h-7 flex items-center justify-center text-[9px] font-extrabold uppercase border-2 transition-all duration-100
													focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary
													{current === level
													? proficiencyColors[level] + ' -translate-y-px shadow-sm'
													: 'border-transparent text-text-muted hover:border-border-light hover:bg-surface-hover'}"
												aria-label="{cat.name}: {level}"
												title={level}
											>
												{level.charAt(0).toUpperCase()}
											</button>
										{/each}
									</div>
								</div>
							{/if}
						{/each}
					</div>
				</div>

			<!-- ── Platform Skills ────────────────────────────── -->
			{:else if activeTab === 'platform'}
				<div id="panel-platform" role="tabpanel">
					<p class="text-xs text-text-secondary mb-4">
						Rate familiarity with each cloud platform. This affects infrastructure migration overhead calculations.
					</p>
					<div class="grid gap-4 md:grid-cols-2">
						{#each platformCatIds as catId}
							{@const cat = categories[catId]}
							{@const current = proficiencies[catId]?.proficiency ?? 'none'}
							{#if cat}
								<Card>
									<div class="space-y-4">
										<div>
											<h3 class="text-sm font-extrabold uppercase tracking-wider">{cat.name}</h3>
											<p class="text-xs text-text-secondary mt-1">{cat.description}</p>
										</div>

										<!-- Large level selector -->
										<div class="space-y-2">
											{#each proficiencyLevels as level}
												{@const isActive = current === level}
												<button
													onclick={() => saveProficiency(catId, level)}
													class="w-full flex items-center gap-3 px-3 py-2.5 border-2 text-left transition-all duration-100
														focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary
														{isActive
														? proficiencyColors[level] + ' -translate-x-px -translate-y-px shadow-sm'
														: 'border-border-light hover:border-brutal hover:bg-surface-hover'}"
												>
													<div class="w-2.5 h-2.5 border-2 {isActive ? proficiencyColors[level] : 'border-border-light bg-bg'}"></div>
													<span class="text-sm font-bold capitalize flex-1">{level}</span>
													{#if isActive}
														<span class="text-[10px] font-mono text-text-muted">{cat.adoption_base_hours}h base overhead</span>
													{/if}
												</button>
											{/each}
										</div>

										<!-- Visual summary -->
										<div class="border-t-2 border-border-light pt-3">
											<div class="flex items-center gap-2">
												<span class="text-xs font-bold text-text-muted">Level:</span>
												<div class="flex-1 h-2 bg-border-light">
													<div
														class="h-full {proficiencyBarColor(current)} transition-all duration-300"
														style="width: {proficiencyBarWidth(current)}%"
													></div>
												</div>
												<Badge variant={current === 'none' ? 'default' : current === 'expert' || current === 'advanced' ? 'success' : current === 'intermediate' ? 'warning' : 'danger'}>
													{current}
												</Badge>
											</div>
										</div>
									</div>
								</Card>
							{/if}
						{/each}
					</div>
				</div>

			<!-- ── AI Tooling ────────────────────────────────── -->
			{:else if activeTab === 'ai'}
				<div id="panel-ai" role="tabpanel">
					<div class="flex items-start justify-between gap-4 mb-4">
						<p class="text-xs text-text-secondary">
							Set your client's stance on each AI/automation tool. These preferences carry into assessment estimates.
						</p>
						<!-- Bulk actions -->
						<div class="flex gap-1 shrink-0">
							{#each stances as stance}
								{@const cfg = stanceConfig[stance]}
								<button
									onclick={() => bulkSetTools(stance)}
									class="brutal-border-thin px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all duration-100
										hover:-translate-y-px hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary
										{cfg.color}"
								>
									All {cfg.label}
								</button>
							{/each}
						</div>
					</div>

					<!-- Summary bar -->
					{#if aiTools.length > 0}
						<div class="flex h-2 mb-5 border-2 border-brutal overflow-hidden">
							{#if aiToolStats.included > 0}
								<div class="bg-success transition-all duration-300" style="width: {(aiToolStats.included / aiToolStats.total) * 100}%"></div>
							{/if}
							{#if aiToolStats.open > 0}
								<div class="bg-warning transition-all duration-300" style="width: {(aiToolStats.open / aiToolStats.total) * 100}%"></div>
							{/if}
							{#if aiToolStats.excluded > 0}
								<div class="bg-danger transition-all duration-300" style="width: {(aiToolStats.excluded / aiToolStats.total) * 100}%"></div>
							{/if}
						</div>
						<div class="flex gap-4 mb-5 text-[10px] font-bold uppercase tracking-wider">
							<span class="flex items-center gap-1.5"><span class="w-3 h-3 bg-success border border-brutal"></span> Include ({aiToolStats.included})</span>
							<span class="flex items-center gap-1.5"><span class="w-3 h-3 bg-warning border border-brutal"></span> Open ({aiToolStats.open})</span>
							<span class="flex items-center gap-1.5"><span class="w-3 h-3 bg-danger border border-brutal"></span> Exclude ({aiToolStats.excluded})</span>
						</div>
					{/if}

					<!-- Grouped by category -->
					<div class="space-y-6">
						{#each aiCategoryList as [catId, group]}
							<div>
								<h3 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-2 pb-1 border-b-2 border-border-light">
									{group.name}
								</h3>
								<div class="space-y-1">
									{#each group.tools as tool}
										{@const stance = getToolStance(tool.id)}
										{@const cfg = stanceConfig[stance]}
										<div class="flex items-center gap-3 px-4 py-2.5 border-2 border-border-light hover:border-brutal transition-colors duration-100 bg-surface">
											<!-- Tool info -->
											<div class="flex-1 min-w-0">
												<div class="flex items-center gap-2">
													<span class="text-sm font-bold">{tool.name}</span>
													<span class="text-[10px] font-mono text-text-muted">{tool.vendor}</span>
													{#if tool.recommendation === 'recommended'}
														<span class="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-success-light text-success border border-success leading-none">Rec</span>
													{/if}
													{#if tool.cost?.type === 'free'}
														<span class="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-info-light text-info border border-info leading-none">Free</span>
													{/if}
												</div>
												<p class="text-[11px] text-text-secondary mt-0.5 truncate">{tool.description}</p>
											</div>

											<!-- Hours saved -->
											<Tooltip text="Expected hours saved: {tool.hours_saved?.optimistic ?? '?'} optimistic / {tool.hours_saved?.expected ?? '?'} expected / {tool.hours_saved?.pessimistic ?? '?'} pessimistic" position="left">
												<span class="text-xs font-mono font-bold text-success shrink-0 cursor-help">-{tool.hours_saved?.expected ?? 0}h</span>
											</Tooltip>

											<!-- Stance selector -->
											<div class="flex gap-0.5 shrink-0">
												{#each stances as s}
													{@const sCfg = stanceConfig[s]}
													<button
														onclick={() => saveToolStance(tool.id, s)}
														class="px-2 py-1 text-[10px] font-bold uppercase border-2 transition-all duration-100 min-w-[4rem] text-center
															focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary
															{stance === s
															? sCfg.color + ' -translate-y-px shadow-sm'
															: 'border-transparent text-text-muted hover:border-border-light hover:bg-surface-hover'}"
														aria-label="{tool.name}: {s}"
													>
														{sCfg.label}
													</button>
												{/each}
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				</div>

			<!-- ── Linked Assessments ────────────────────────── -->
			{:else if activeTab === 'assessments'}
				<div id="panel-assessments" role="tabpanel">
					{#if data.linkedAssessments.length === 0}
						<div class="py-12 text-center">
							<div class="flex h-14 w-14 mx-auto items-center justify-center brutal-border-thin bg-bg text-2xl text-text-muted mb-4">
								&#9776;
							</div>
							<p class="text-sm font-bold text-text-muted">No assessments linked to this client.</p>
							<p class="text-xs text-text-muted mt-1">Create an assessment and select this client to link it.</p>
						</div>
					{:else}
						<div class="grid gap-4 lg:grid-cols-2 stagger-grid">
							{#each data.linkedAssessments as project, i}
								<a href="/assessments/{project.id}" class="no-underline group" style="--stagger-i: {i};">
									<Card hover>
										<div class="flex flex-col gap-3">
											<div class="flex items-start justify-between gap-3">
												<h3 class="font-extrabold text-text truncate group-hover:text-primary transition-colors">
													{project.project_name}
												</h3>
												<Badge variant={statusVariant[project.status] ?? 'default'}>
													{project.status}
												</Badge>
											</div>
											<div class="grid grid-cols-3 gap-3 text-xs">
												<div>
													<span class="font-bold uppercase tracking-wider text-text-muted">Confidence</span>
													{#if project.confidence_score != null}
														<p class="font-extrabold font-mono mt-0.5">{Math.round(project.confidence_score)}%</p>
														<ProgressBar value={project.confidence_score} variant={confidenceVariant(project.confidence_score)} />
													{:else}
														<p class="font-mono text-text-muted mt-0.5">&mdash;</p>
													{/if}
												</div>
												<div>
													<span class="font-bold uppercase tracking-wider text-text-muted">Est. Hours</span>
													<p class="font-extrabold font-mono mt-0.5">
														{project.total_expected_hours != null ? formatHours(project.total_expected_hours) : '\u2014'}
													</p>
												</div>
												<div>
													<span class="font-bold uppercase tracking-wider text-text-muted">Created</span>
													<p class="font-mono text-text-secondary mt-0.5">{formatDate(project.created_at)}</p>
												</div>
											</div>
										</div>
									</Card>
								</a>
							{/each}
						</div>
					{/if}
				</div>
			{/if}
		</Tabs>
	</div>
</div>

<!-- ── Delete confirmation modal ─────────────────────────── -->
<Modal open={showDeleteModal} onclose={() => (showDeleteModal = false)} title="Delete Client" size="sm">
	<div class="space-y-4">
		<p class="text-sm">
			Are you sure you want to delete <strong>{client.name}</strong>? This action cannot be undone.
		</p>
		{#if data.linkedAssessments.length > 0}
			<div class="brutal-border-thin bg-warning-light p-3 text-xs">
				<strong>Warning:</strong> This client has {data.linkedAssessments.length} linked assessment{data.linkedAssessments.length === 1 ? '' : 's'}.
				The assessments will not be deleted, but their client link will be removed.
			</div>
		{/if}
	</div>

	{#snippet footer()}
		<div class="flex justify-end gap-3">
			<button
				onclick={() => (showDeleteModal = false)}
				class="brutal-border-thin px-4 py-2 text-xs font-bold uppercase tracking-wider bg-surface hover:bg-surface-hover transition-colors"
			>
				Cancel
			</button>
			<button
				onclick={deleteClient}
				disabled={deleting}
				class="brutal-border-thin px-4 py-2 text-xs font-bold uppercase tracking-wider bg-danger text-white border-danger hover:opacity-90 transition-colors disabled:opacity-50"
			>
				{deleting ? 'Deleting...' : 'Delete Client'}
			</button>
		</div>
	{/snippet}
</Modal>
