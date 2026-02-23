<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Tooltip from '$lib/components/ui/Tooltip.svelte';

	let { data } = $props();

	// ── Search state ──────────────────────────────────────────
	let search = $state('');
	let searchEl: HTMLInputElement | undefined = $state();
	let filtered = $derived(
		search.trim()
			? data.clients.filter((c) => {
					const q = search.toLowerCase();
					return c.name.toLowerCase().includes(q) ||
						parseIndustries(c.industry).some((tag) => tag.toLowerCase().includes(q));
				})
			: data.clients
	);

	// ── New client modal ──────────────────────────────────────
	let showNewModal = $state(false);
	let newName = $state('');
	let newIndustry = $state('');
	let newNotes = $state('');
	let saving = $state(false);

	async function createClient() {
		if (!newName.trim()) return;
		saving = true;
		try {
			const id = crypto.randomUUID();
			const res = await fetch('/api/clients', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id, name: newName.trim(), industry: newIndustry.trim(), notes: newNotes.trim() })
			});
			if (res.ok) {
				showNewModal = false;
				newName = '';
				newIndustry = '';
				newNotes = '';
				window.location.reload();
			}
		} finally {
			saving = false;
		}
	}

	// ── Keyboard shortcuts ────────────────────────────────────
	function handleGlobalKeydown(e: KeyboardEvent) {
		if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
			e.preventDefault();
			searchEl?.focus();
		}
	}

	// ── Helpers ────────────────────────────────────────────────
	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	const industryVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
		healthcare: 'danger',
		finance: 'warning',
		retail: 'info',
		technology: 'success',
		education: 'default',
		manufacturing: 'warning',
		government: 'info'
	};

	function getIndustryVariant(industry: string): 'default' | 'success' | 'warning' | 'danger' | 'info' {
		return industryVariant[industry.toLowerCase()] ?? 'default';
	}

	function parseIndustries(raw: string): string[] {
		return raw.split(',').map((s) => s.trim()).filter(Boolean);
	}
</script>

<svelte:window onkeydown={handleGlobalKeydown} />

<svelte:head>
	<title>Clients | MigrateIQ</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-6 py-8 animate-enter">
	<!-- ── Header ───────────────────────────────────────────── -->
	<div class="mb-8">
		<div class="flex items-center gap-2">
			<h1 class="text-2xl font-extrabold uppercase tracking-wider">Client Directory</h1>
			<button
				onclick={() => (showNewModal = true)}
				class="ml-auto brutal-border-thin px-4 py-2 text-xs font-bold uppercase tracking-wider bg-primary text-white border-primary hover:bg-primary-hover transition-colors
					focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
			>
				+ New Client
			</button>
		</div>
		<p class="mt-1 text-sm font-bold text-text-secondary">
			{data.clients.length} client{data.clients.length === 1 ? '' : 's'} &middot; Track proficiencies and AI tool preferences per organization
		</p>
	</div>

	<!-- ── Search bar ──────────────────────────────────────── -->
	{#if data.clients.length > 0}
		<div class="mb-6 relative">
			<input
				bind:this={searchEl}
				type="text"
				bind:value={search}
				placeholder="Search by name or industry..."
				class="w-full max-w-md brutal-border-thin px-4 py-2.5 text-sm font-mono bg-surface
					focus:outline-2 focus:outline-primary placeholder:text-text-muted pr-12"
			/>
			<span class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-text-muted brutal-border-thin px-1.5 py-0.5 bg-bg pointer-events-none"
				style="max-width: fit-content;"
			>/</span>
		</div>
	{/if}

	<!-- ── Client grid ─────────────────────────────────────── -->
	{#if data.clients.length === 0}
		<div class="mx-auto max-w-lg py-16 text-center">
			<Card>
				<div class="flex flex-col items-center gap-4 py-4">
					<div
						class="flex h-16 w-16 items-center justify-center brutal-border bg-primary-light text-3xl text-primary shadow-sm"
					>
						&#9812;
					</div>
					<h2 class="text-xl font-extrabold uppercase tracking-wider">No clients yet</h2>
					<p class="text-text-secondary text-sm leading-relaxed max-w-sm">
						Create your first client profile to track team proficiencies, AI tool preferences, and link assessments.
					</p>
					<button
						onclick={() => (showNewModal = true)}
						class="brutal-border-thin px-6 py-3 text-sm font-bold uppercase tracking-wider bg-primary text-white border-primary hover:bg-primary-hover transition-colors"
					>
						Create First Client
					</button>
				</div>
			</Card>
		</div>
	{:else if filtered.length === 0}
		<div class="py-12 text-center">
			<p class="text-sm font-bold text-text-muted">No clients match "{search}"</p>
			<button
				onclick={() => (search = '')}
				class="mt-2 text-xs font-bold text-primary hover:text-primary-hover"
			>
				Clear search
			</button>
		</div>
	{:else}
		<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 stagger-grid">
			{#each filtered as client, i}
				{@const count = data.assessmentCounts[client.id] ?? 0}
				{@const prof = data.proficiencySummaries[client.id]}
				<a href="/clients/{client.id}" class="no-underline group" style="--stagger-i: {i};">
					<Card hover>
						<div class="flex flex-col gap-3">
							<!-- Name & industry -->
							<div class="flex items-start justify-between gap-3">
								<div class="flex items-center gap-2.5 min-w-0">
									<div class="flex h-9 w-9 items-center justify-center brutal-border-thin bg-primary-light text-sm text-primary font-extrabold shrink-0 group-hover:-translate-y-px transition-transform">
										{client.name.charAt(0).toUpperCase()}
									</div>
									<h3 class="font-extrabold text-text text-lg truncate group-hover:text-primary transition-colors">
										{client.name}
									</h3>
								</div>
								{#if client.industry}
									<div class="flex flex-wrap gap-1">
										{#each parseIndustries(client.industry) as tag}
											<Badge variant={getIndustryVariant(tag)}>
												{tag}
											</Badge>
										{/each}
									</div>
								{/if}
							</div>

							<!-- Notes preview -->
							{#if client.notes}
								<p class="text-sm text-text-secondary line-clamp-2">{client.notes}</p>
							{/if}

							<!-- Proficiency summary dots -->
							{#if prof && prof.total > 0}
								<div class="flex items-center gap-2">
									<span class="text-[10px] font-bold uppercase tracking-wider text-text-muted">Proficiencies</span>
									<Tooltip text="{prof.filled} of {prof.total} categories rated" position="bottom">
										<span class="text-xs font-mono font-bold cursor-help">{prof.filled}/{prof.total}</span>
									</Tooltip>
								</div>
							{/if}

							<!-- Footer stats -->
							<div class="flex items-center justify-between border-t-2 border-border-light pt-3 text-xs font-mono text-text-muted">
								<span>{count} assessment{count === 1 ? '' : 's'}</span>
								<span>Updated {formatDate(client.updated_at)}</span>
							</div>
						</div>
					</Card>
				</a>
			{/each}
		</div>
	{/if}
</div>

<!-- ── New Client Modal ──────────────────────────────────── -->
<Modal open={showNewModal} onclose={() => (showNewModal = false)} title="New Client" size="md">
	<form
		onsubmit={(e) => {
			e.preventDefault();
			createClient();
		}}
		class="space-y-4"
	>
		<div>
			<label for="client-name" class="block text-xs font-extrabold uppercase tracking-wider mb-1.5">
				Name <span class="text-danger">*</span>
			</label>
			<input
				id="client-name"
				type="text"
				bind:value={newName}
				placeholder="Acme Corp"
				required
				class="w-full brutal-border-thin px-3 py-2 text-sm font-mono bg-surface focus:outline-2 focus:outline-primary placeholder:text-text-muted"
			/>
		</div>
		<div>
			<label for="client-industry" class="block text-xs font-extrabold uppercase tracking-wider mb-1.5">
				Industry
			</label>
			<input
				id="client-industry"
				type="text"
				bind:value={newIndustry}
				placeholder="e.g. Healthcare, Finance, Retail (comma-separated)"
				class="w-full brutal-border-thin px-3 py-2 text-sm font-mono bg-surface focus:outline-2 focus:outline-primary placeholder:text-text-muted"
			/>
		</div>
		<div>
			<label for="client-notes" class="block text-xs font-extrabold uppercase tracking-wider mb-1.5">
				Notes
			</label>
			<textarea
				id="client-notes"
				bind:value={newNotes}
				placeholder="Key contacts, special considerations..."
				rows="3"
				class="w-full brutal-border-thin px-3 py-2 text-sm font-mono bg-surface focus:outline-2 focus:outline-primary placeholder:text-text-muted resize-y"
			></textarea>
		</div>
	</form>

	{#snippet footer()}
		<div class="flex justify-end gap-3">
			<button
				onclick={() => (showNewModal = false)}
				class="brutal-border-thin px-4 py-2 text-xs font-bold uppercase tracking-wider bg-surface hover:bg-surface-hover transition-colors"
			>
				Cancel
			</button>
			<button
				onclick={createClient}
				disabled={!newName.trim() || saving}
				class="brutal-border-thin px-4 py-2 text-xs font-bold uppercase tracking-wider bg-primary text-white border-primary hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{saving ? 'Creating...' : 'Create Client'}
			</button>
		</div>
	{/snippet}
</Modal>
