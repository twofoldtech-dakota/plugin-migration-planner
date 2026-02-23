<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import KpiCard from '$lib/components/ui/KpiCard.svelte';
	import Tooltip from '$lib/components/ui/Tooltip.svelte';
	import { gradeColor } from '$lib/utils/pack-grading';

	let { data } = $props();

	// ── Search state ──────────────────────────────────────────
	let search = $state('');
	let searchEl: HTMLInputElement | undefined = $state();
	let selectedCategory = $state('');

	let filtered = $derived(
		data.packs.filter((p) => {
			if (selectedCategory && p.category !== selectedCategory) return false;
			if (!search.trim()) return true;
			const q = search.toLowerCase();
			return (
				p.name.toLowerCase().includes(q) ||
				p.vendor.toLowerCase().includes(q) ||
				p.category.toLowerCase().includes(q) ||
				p.description.toLowerCase().includes(q)
			);
		})
	);

	// ── KPI stats ─────────────────────────────────────────────
	let verifiedCount = $derived(data.packs.filter((p) => p.confidence === 'verified').length);
	let needsResearch = $derived(
		data.packs.filter((p) => p.confidence === 'draft' || !p.last_researched).length
	);

	// ── Keyboard shortcuts ────────────────────────────────────
	function handleGlobalKeydown(e: KeyboardEvent) {
		if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
			e.preventDefault();
			searchEl?.focus();
		}
	}

	// ── Helpers ────────────────────────────────────────────────
	function formatDate(dateStr: string | null): string {
		if (!dateStr) return 'Never';
		return new Date(dateStr).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric'
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

	function getCategoryVariant(category: string): 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted' {
		return categoryVariant[category.toLowerCase()] ?? 'default';
	}

	function getConfidenceVariant(confidence: string): 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted' {
		return confidenceVariant[confidence.toLowerCase()] ?? 'muted';
	}

	function totalPathsForPack(packId: string): number {
		return (data.pathCountsAsSource[packId] ?? 0) + (data.pathCountsAsTarget[packId] ?? 0);
	}
</script>

<svelte:window onkeydown={handleGlobalKeydown} />

<svelte:head>
	<title>Knowledge Base | MigrateIQ</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-6 py-8 animate-enter">
	<!-- ── Header ───────────────────────────────────────────── -->
	<div class="mb-8">
		<h1 class="text-2xl font-extrabold uppercase tracking-wider">Knowledge Base</h1>
		<p class="mt-1 text-sm font-bold text-text-secondary">
			{data.packs.length} platform{data.packs.length === 1 ? '' : 's'} &middot; {data.totalPaths} migration path{data.totalPaths === 1 ? '' : 's'}
		</p>
	</div>

	<!-- ── KPI Row ─────────────────────────────────────────── -->
	<div class="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
		<KpiCard label="Platforms" value={data.packs.length} tooltip="Total knowledge packs loaded" />
		<KpiCard label="Paths" value={data.totalPaths} tooltip="Documented migration paths between platforms" />
		<KpiCard label="Verified" value={verifiedCount} variant="success" tooltip="Packs with verified confidence level" />
		<KpiCard label="Needs Research" value={needsResearch} variant={needsResearch > 0 ? 'warning' : 'success'} tooltip="Packs in draft state or never researched" />
	</div>

	<!-- ── Search + Category chips ─────────────────────────── -->
	<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
		<div class="relative flex-1 max-w-md">
			<input
				bind:this={searchEl}
				type="text"
				bind:value={search}
				placeholder="Search platforms..."
				class="w-full brutal-border-thin px-4 py-2.5 text-sm font-mono bg-surface
					focus:outline-2 focus:outline-primary placeholder:text-text-muted pr-12"
			/>
			<span
				class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-text-muted brutal-border-thin px-1.5 py-0.5 bg-bg pointer-events-none"
				style="max-width: fit-content;"
			>/</span>
		</div>

		{#if data.categories.length > 0}
			<div class="flex flex-wrap gap-1.5">
				<button
					onclick={() => (selectedCategory = '')}
					class="px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 transition-all duration-100
						focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary
						{selectedCategory === ''
						? 'bg-primary text-white border-primary -translate-y-px shadow-sm'
						: 'bg-surface border-border-light text-text-muted hover:border-brutal hover:bg-surface-hover'}"
				>
					All
				</button>
				{#each data.categories as cat}
					<button
						onclick={() => (selectedCategory = selectedCategory === cat ? '' : cat)}
						class="px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 transition-all duration-100
							focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary
							{selectedCategory === cat
							? 'bg-primary text-white border-primary -translate-y-px shadow-sm'
							: 'bg-surface border-border-light text-text-muted hover:border-brutal hover:bg-surface-hover'}"
					>
						{cat}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- ── Pack grid ───────────────────────────────────────── -->
	{#if data.packs.length === 0}
		<div class="mx-auto max-w-lg py-16 text-center">
			<Card>
				<div class="flex flex-col items-center gap-4 py-4">
					<div
						class="flex h-16 w-16 items-center justify-center brutal-border bg-primary-light text-3xl text-primary shadow-sm"
					>
						&#128218;
					</div>
					<h2 class="text-xl font-extrabold uppercase tracking-wider">No knowledge packs</h2>
					<p class="text-text-secondary text-sm leading-relaxed max-w-sm">
						Knowledge packs are created by research agents or seeded from the database. Run the research pipeline to populate this catalog.
					</p>
				</div>
			</Card>
		</div>
	{:else if filtered.length === 0}
		<div class="py-12 text-center">
			<p class="text-sm font-bold text-text-muted">
				No platforms match
				{#if search.trim()}"{search}"{/if}
				{#if search.trim() && selectedCategory}&nbsp;in&nbsp;{/if}
				{#if selectedCategory}category "{selectedCategory}"{/if}
			</p>
			<button
				onclick={() => { search = ''; selectedCategory = ''; }}
				class="mt-2 text-xs font-bold text-primary hover:text-primary-hover"
			>
				Clear filters
			</button>
		</div>
	{:else}
		<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 stagger-grid">
			{#each filtered as pack, i}
				{@const stats = data.healthStats[pack.id]}
				{@const grade = data.packGrades[pack.id]}
				{@const pathCount = totalPathsForPack(pack.id)}
				<a href="/knowledge/{pack.id}" class="no-underline group" style="--stagger-i: {i};">
					<Card hover>
						<div class="flex flex-col gap-3">
							<!-- Name + category badge -->
							<div class="flex items-start justify-between gap-3">
								<div class="flex items-center gap-2.5 min-w-0">
									<div class="flex h-9 w-9 items-center justify-center brutal-border-thin bg-primary-light text-sm text-primary font-extrabold shrink-0 group-hover:-translate-y-px transition-transform">
										{pack.name.charAt(0).toUpperCase()}
									</div>
									<div class="min-w-0">
										<h3 class="font-extrabold text-text text-lg truncate group-hover:text-primary transition-colors">
											{pack.name}
										</h3>
										{#if pack.vendor || pack.latest_version}
											<p class="text-xs text-text-muted truncate">
												{pack.vendor}{pack.vendor && pack.latest_version ? ' \u00b7 ' : ''}{pack.latest_version ? `v${pack.latest_version}` : ''}
											</p>
										{/if}
									</div>
								</div>
								<Badge variant={getCategoryVariant(pack.category)}>
									{pack.category}
								</Badge>
							</div>

							<!-- Confidence + Grade -->
							<div class="flex items-center gap-2">
								<Badge variant={getConfidenceVariant(pack.confidence)}>
									{pack.confidence}
								</Badge>
								{#if pack.direction && pack.direction !== 'both'}
									<Badge variant="muted">
										{pack.direction}
									</Badge>
								{/if}
								{#if grade}
									<Tooltip text="Thoroughness grade: {grade.overallScore}/100 across 9 dimensions" position="bottom">
										<span class="text-xs font-extrabold font-mono px-1.5 py-0.5 border-2 cursor-help {gradeColor(grade.overall)}">
											{grade.overall}
										</span>
									</Tooltip>
								{/if}
							</div>

							<!-- Stats row -->
							{#if stats}
								<div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
									{#if stats.effortHours > 0}
										<Tooltip text="Effort hour components defined" position="bottom">
											<span class="cursor-help font-mono">{stats.effortHours} components</span>
										</Tooltip>
									{/if}
									{#if stats.gotchas > 0}
										<Tooltip text="Gotcha patterns documented" position="bottom">
											<span class="cursor-help font-mono">{stats.gotchas} gotchas</span>
										</Tooltip>
									{/if}
									{#if pathCount > 0}
										<Tooltip text="Migration paths involving this platform" position="bottom">
											<span class="cursor-help font-mono">{pathCount} path{pathCount === 1 ? '' : 's'}</span>
										</Tooltip>
									{/if}
								</div>
							{/if}

							<!-- Footer -->
							<div class="flex items-center justify-between border-t-2 border-border-light pt-3 text-xs font-mono text-text-muted">
								<span>Updated {formatDate(pack.updated_at)}</span>
								{#if pack.last_researched}
									<span>Researched {formatDate(pack.last_researched)}</span>
								{/if}
							</div>
						</div>
					</Card>
				</a>
			{/each}
		</div>
	{/if}
</div>
