<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import MarkdownRenderer from '$lib/components/ui/MarkdownRenderer.svelte';
	import WorkBreakdownTree from '$lib/components/WorkBreakdownTree.svelte';
	import WorkItemEditor from '$lib/components/WorkItemEditor.svelte';
	import TeamComposition from '$lib/components/TeamComposition.svelte';
	import PhaseStaffingChart from '$lib/components/PhaseStaffingChart.svelte';
	import CostProjectionCard from '$lib/components/CostProjectionCard.svelte';

	let { data } = $props();

	const assessments = $derived((data.assessments ?? []) as any[]);
	const assessment = $derived(data.assessment as any);
	const tab = $derived(data.tab ?? 'documents');
	const deliverables = $derived((data.deliverables ?? []) as any[]);
	const wbs = $derived(data.wbs as any);
	const wbsVersions = $derived((data.wbsVersions ?? []) as any[]);
	const team = $derived(data.team as any);
	const teamVersions = $derived((data.teamVersions ?? []) as any[]);
	const estimate = $derived(data.estimate as any);

	// Assessment selector
	const selectedId = $derived(assessment?.id ?? '');

	function selectAssessment(id: string) {
		if (!id) {
			goto('/planning/');
		} else {
			const params = new URLSearchParams();
			params.set('assessment', id);
			params.set('tab', tab);
			goto(`/planning/?${params.toString()}`);
		}
	}

	function setTab(t: string) {
		const params = new URLSearchParams(page.url.searchParams);
		params.set('tab', t);
		goto(`/planning/?${params.toString()}`, { replaceState: true });
	}

	// ── Documents tab state ─────────────────────────────────────
	const deliverableIcons: Record<string, string> = {
		'migration-plan.md': '&#9997;',
		'risk-register.md': '&#9888;',
		'runbook.md': '&#9654;',
		'dashboard.html': '&#9635;',
	};
	const deliverableLabels: Record<string, string> = {
		'migration-plan.md': 'Migration Plan',
		'risk-register.md': 'Risk Register',
		'runbook.md': 'Cutover Runbook',
		'dashboard.html': 'Client Dashboard',
	};
	const deliverableDescriptions: Record<string, string> = {
		'migration-plan.md': 'Phased migration plan with timelines, dependencies, and role assignments',
		'risk-register.md': 'Complete risk register with mitigations, contingencies, and ownership',
		'runbook.md': 'Step-by-step cutover runbook with rollback procedures',
		'dashboard.html': 'Self-contained HTML dashboard for client presentations',
	};

	let docModalOpen = $state(false);
	let docModalDeliverable = $state<any>(null);
	let docModalContent = $state('');
	let docModalLoading = $state(false);
	let docModalError = $state('');

	const docIsHtml = $derived(docModalDeliverable?.name?.endsWith('.html') ?? false);
	const docIsMarkdown = $derived(docModalDeliverable?.name?.endsWith('.md') ?? false);

	async function openDeliverable(deliverable: any) {
		docModalDeliverable = deliverable;
		docModalContent = '';
		docModalError = '';
		docModalLoading = true;
		docModalOpen = true;

		try {
			const res = await fetch(
				`/api/assessments/${assessment.id}/deliverables?path=${encodeURIComponent(deliverable.file_path)}`
			);
			if (!res.ok) {
				docModalError = (await res.json().catch(() => ({}))).message ?? `Error ${res.status}`;
			} else {
				docModalContent = (await res.json()).content;
			}
		} catch {
			docModalError = 'Network error';
		} finally {
			docModalLoading = false;
		}
	}

	function closeDocModal() {
		docModalOpen = false;
		docModalContent = '';
		docModalError = '';
		docModalDeliverable = null;
	}

	// ── WBS tab state ───────────────────────────────────────────
	let generating = $state<'wbs' | 'team' | null>(null);
	let editorOpen = $state(false);
	let editorItem = $state<any>(null);
	let editorParentId = $state<number | null>(null);

	async function generateWBS() {
		if (!assessment) return;
		generating = 'wbs';
		try {
			await fetch('/api/planning/wbs', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ assessment_id: assessment.id }),
			});
			// Reload page to get fresh data
			const params = new URLSearchParams(page.url.searchParams);
			params.set('tab', 'wbs');
			goto(`/planning/?${params.toString()}`, { invalidateAll: true });
		} finally {
			generating = null;
		}
	}

	async function generateTeam() {
		if (!assessment) return;
		generating = 'team';
		try {
			await fetch('/api/planning/team', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ assessment_id: assessment.id }),
			});
			const params = new URLSearchParams(page.url.searchParams);
			params.set('tab', 'team');
			goto(`/planning/?${params.toString()}`, { invalidateAll: true });
		} finally {
			generating = null;
		}
	}

	function openEditor(item?: any, parentId?: number) {
		editorItem = item ?? null;
		editorParentId = parentId ?? null;
		editorOpen = true;
	}

	function onEditorSave() {
		editorOpen = false;
		// Reload to refresh data
		goto(page.url.href, { invalidateAll: true });
	}

	async function deleteItem(itemId: number) {
		await fetch(`/api/planning/wbs/items/${itemId}`, { method: 'DELETE' });
		goto(page.url.href, { invalidateAll: true });
	}

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleDateString('en-US', {
			month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
		});
	}

	const tabs = [
		{ id: 'documents', label: 'Documents' },
		{ id: 'wbs', label: 'Work Breakdown' },
		{ id: 'team', label: 'Team' },
	];
</script>

<svelte:head>
	<title>Planning{assessment ? ` — ${assessment.project_name}` : ''} | MigrateIQ</title>
</svelte:head>

<div class="p-6 space-y-5 animate-enter">
	<!-- ── Header ─────────────────────────────────────────────────── -->
	<div class="flex items-start justify-between flex-wrap gap-3">
		<div>
			<h1 class="text-xl font-extrabold uppercase tracking-wider">Planning</h1>
			<p class="text-xs text-text-muted font-mono mt-0.5">
				Documents, work breakdown, and team composition
			</p>
		</div>

		<!-- Assessment selector -->
		<div class="flex items-center gap-2">
			<label for="assessment-select" class="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">Assessment:</label>
			<select
				id="assessment-select"
				value={selectedId}
				onchange={(e) => selectAssessment((e.target as HTMLSelectElement).value)}
				class="brutal-border-thin px-3 py-1.5 text-sm font-bold bg-bg min-w-[200px]
					focus:outline-none focus:ring-2 focus:ring-primary"
			>
				<option value="">Select an assessment...</option>
				{#each assessments as a}
					<option value={a.id}>{a.project_name}{a.client_name ? ` (${a.client_name})` : ''}</option>
				{/each}
			</select>
		</div>
	</div>

	{#if !assessment}
		<!-- ── Empty state ─────────────────────────────────────────── -->
		<Card>
			<div class="py-12 text-center space-y-3">
				<div class="inline-flex items-center justify-center w-14 h-14 brutal-border bg-primary-light text-2xl text-primary shadow-sm">&#9881;</div>
				<p class="text-base font-extrabold uppercase tracking-wider text-text-muted">Select an Assessment</p>
				<p class="text-sm text-text-muted max-w-sm mx-auto">
					Choose an assessment from the dropdown above to view its planning deliverables, work breakdown, and team composition.
				</p>
			</div>
		</Card>
	{:else}
		<!-- ── Tab bar ─────────────────────────────────────────────── -->
		<div class="flex brutal-border overflow-hidden shadow-[2px_2px_0_#000]" role="tablist">
			{#each tabs as t}
				<button
					role="tab"
					aria-selected={tab === t.id}
					class="flex-1 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider transition-colors duration-100
						{tab === t.id
							? 'bg-[#1a1a1a] text-white'
							: 'bg-surface text-text-muted hover:bg-surface-raised'}"
					onclick={() => setTab(t.id)}
				>{t.label}</button>
			{/each}
		</div>

		<!-- ── Documents tab ──────────────────────────────────────── -->
		{#if tab === 'documents'}
			{#if deliverables.length === 0}
				<Card>
					<div class="py-8 text-center">
						<p class="text-lg font-extrabold uppercase tracking-wider text-text-secondary">No Documents</p>
						<p class="mt-2 text-sm text-text-muted max-w-md mx-auto">
							Run <code class="brutal-border-thin bg-surface px-1.5 py-0.5 text-xs font-mono">/migrate plan</code> to generate migration documents.
						</p>
					</div>
				</Card>
			{:else}
				<div class="grid gap-4 sm:grid-cols-2">
					{#each deliverables as deliverable}
						<button
							class="text-left w-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
							onclick={() => openDeliverable(deliverable)}
						>
							<Card hover padding="p-5">
								<div class="flex items-start gap-4">
									<div class="flex h-12 w-12 shrink-0 items-center justify-center brutal-border bg-primary-light text-2xl text-primary shadow-sm">
										{@html deliverableIcons[deliverable.name] ?? '&#128196;'}
									</div>
									<div class="flex-1 min-w-0">
										<h3 class="font-extrabold text-sm">{deliverableLabels[deliverable.name] ?? deliverable.name}</h3>
										<p class="text-xs text-text-secondary mt-0.5">
											{deliverableDescriptions[deliverable.name] ?? 'Generated deliverable document'}
										</p>
										<span class="text-[10px] font-mono text-text-muted truncate block mt-1">{deliverable.file_path}</span>
										{#if deliverable.generated_at}
											<span class="text-[10px] text-text-muted font-mono block mt-0.5">
												Generated: {formatDate(deliverable.generated_at)}
											</span>
										{/if}
									</div>
									<Badge variant="success">Generated</Badge>
								</div>
							</Card>
						</button>
					{/each}
				</div>
			{/if}

		<!-- ── WBS tab ────────────────────────────────────────────── -->
		{:else if tab === 'wbs'}
			<div class="flex items-center justify-between flex-wrap gap-3">
				<div class="flex items-center gap-3">
					{#if wbs}
						<span class="text-xs font-bold text-text-muted">
							v{wbs.version} &middot; {formatDate(wbs.created_at)}
						</span>
						{#if wbsVersions.length > 1}
							<select
								value={wbs.version}
								onchange={(e) => {
									const params = new URLSearchParams(page.url.searchParams);
									params.set('wbsVersion', (e.target as HTMLSelectElement).value);
									goto(`/planning/?${params.toString()}`);
								}}
								class="brutal-border-thin px-2 py-1 text-xs font-mono bg-bg"
							>
								{#each wbsVersions as v}
									<option value={v.version}>v{v.version} — {v.total_items} items, {Math.round(v.total_hours)}h</option>
								{/each}
							</select>
						{/if}
					{/if}
				</div>
				<div class="flex items-center gap-2">
					{#if wbs}
						<a
							href="/api/planning/wbs/export?assessment={assessment.id}&format=csv"
							class="brutal-border-thin px-3 py-1 text-xs font-bold uppercase tracking-wider bg-surface text-text-muted hover:bg-surface-raised no-underline transition-colors"
						>CSV</a>
						<a
							href="/api/planning/wbs/export?assessment={assessment.id}&format=json"
							class="brutal-border-thin px-3 py-1 text-xs font-bold uppercase tracking-wider bg-surface text-text-muted hover:bg-surface-raised no-underline transition-colors"
						>JSON</a>
						<a
							href="/api/planning/wbs/export?assessment={assessment.id}&format=md"
							class="brutal-border-thin px-3 py-1 text-xs font-bold uppercase tracking-wider bg-surface text-text-muted hover:bg-surface-raised no-underline transition-colors"
						>MD</a>
					{/if}
					<button
						class="px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider
							bg-primary text-white border-2 border-brutal shadow-[2px_2px_0_#000]
							hover:bg-primary-hover hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_#000]
							active:translate-x-px active:translate-y-px active:shadow-none
							transition-all duration-100 disabled:opacity-50"
						onclick={generateWBS}
						disabled={generating === 'wbs' || !estimate}
					>
						{#if generating === 'wbs'}
							<span class="inline-flex items-center gap-2">
								<span class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
								Generating...
							</span>
						{:else}
							{wbs ? 'Regenerate WBS' : 'Generate WBS'}
						{/if}
					</button>
				</div>
			</div>

			{#if !estimate}
				<Card>
					<div class="py-8 text-center">
						<p class="text-lg font-extrabold uppercase tracking-wider text-text-secondary">No Estimate</p>
						<p class="mt-2 text-sm text-text-muted">Run an estimate first to generate the work breakdown.</p>
					</div>
				</Card>
			{:else if !wbs}
				<Card>
					<div class="py-8 text-center">
						<p class="text-lg font-extrabold uppercase tracking-wider text-text-secondary">No WBS Yet</p>
						<p class="mt-2 text-sm text-text-muted">Click "Generate WBS" to create a work breakdown from your estimate.</p>
					</div>
				</Card>
			{:else}
				<div class="flex justify-end mb-2">
					<button
						class="brutal-border-thin px-3 py-1 text-xs font-bold uppercase tracking-wider bg-surface text-text-muted hover:bg-surface-raised transition-colors"
						onclick={() => openEditor()}
					>+ Add Item</button>
				</div>
				<WorkBreakdownTree
					items={wbs.items}
					snapshotId={wbs.id}
					onEdit={(item) => openEditor(item)}
					onDelete={deleteItem}
					onAddChild={(parentId) => openEditor(undefined, parentId)}
				/>
			{/if}

		<!-- ── Team tab ───────────────────────────────────────────── -->
		{:else if tab === 'team'}
			<div class="flex items-center justify-between flex-wrap gap-3">
				<div class="flex items-center gap-3">
					{#if team}
						<span class="text-xs font-bold text-text-muted">
							v{team.version} &middot; {formatDate(team.created_at)}
						</span>
						{#if teamVersions.length > 1}
							<select
								value={team.version}
								onchange={(e) => {
									const params = new URLSearchParams(page.url.searchParams);
									params.set('teamVersion', (e.target as HTMLSelectElement).value);
									goto(`/planning/?${params.toString()}`);
								}}
								class="brutal-border-thin px-2 py-1 text-xs font-mono bg-bg"
							>
								{#each teamVersions as v}
									<option value={v.version}>v{v.version} — {formatDate(v.created_at)}</option>
								{/each}
							</select>
						{/if}
					{/if}
				</div>
				<div class="flex items-center gap-2">
					{#if team}
						<a
							href="/api/planning/team/export?assessment={assessment.id}&format=csv"
							class="brutal-border-thin px-3 py-1 text-xs font-bold uppercase tracking-wider bg-surface text-text-muted hover:bg-surface-raised no-underline transition-colors"
						>CSV</a>
						<a
							href="/api/planning/team/export?assessment={assessment.id}&format=json"
							class="brutal-border-thin px-3 py-1 text-xs font-bold uppercase tracking-wider bg-surface text-text-muted hover:bg-surface-raised no-underline transition-colors"
						>JSON</a>
						<a
							href="/api/planning/team/export?assessment={assessment.id}&format=md"
							class="brutal-border-thin px-3 py-1 text-xs font-bold uppercase tracking-wider bg-surface text-text-muted hover:bg-surface-raised no-underline transition-colors"
						>MD</a>
					{/if}
					<button
						class="px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider
							bg-primary text-white border-2 border-brutal shadow-[2px_2px_0_#000]
							hover:bg-primary-hover hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_#000]
							active:translate-x-px active:translate-y-px active:shadow-none
							transition-all duration-100 disabled:opacity-50"
						onclick={generateTeam}
						disabled={generating === 'team' || !estimate}
					>
						{#if generating === 'team'}
							<span class="inline-flex items-center gap-2">
								<span class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
								Generating...
							</span>
						{:else}
							{team ? 'Regenerate Team' : 'Generate Team'}
						{/if}
					</button>
				</div>
			</div>

			{#if !estimate}
				<Card>
					<div class="py-8 text-center">
						<p class="text-lg font-extrabold uppercase tracking-wider text-text-secondary">No Estimate</p>
						<p class="mt-2 text-sm text-text-muted">Run an estimate first to generate team composition.</p>
					</div>
				</Card>
			{:else if !team}
				<Card>
					<div class="py-8 text-center">
						<p class="text-lg font-extrabold uppercase tracking-wider text-text-secondary">No Team Yet</p>
						<p class="mt-2 text-sm text-text-muted">Click "Generate Team" to create a team composition from your estimate.</p>
					</div>
				</Card>
			{:else}
				<div class="space-y-5">
					<TeamComposition
						roles={team.roles}
						snapshotId={team.id}
						onUpdate={() => goto(page.url.href, { invalidateAll: true })}
					/>

					{#if (team.cost_projection as any)?.expected > 0}
						<CostProjectionCard cost={team.cost_projection as any} />
					{/if}

					<PhaseStaffingChart staffing={(team.phase_staffing ?? []) as any[]} />

					{#if (team.hiring_notes as any[])?.length > 0}
						<div class="brutal-border bg-surface p-4 shadow-[2px_2px_0_#000]">
							<h3 class="text-[10px] font-extrabold uppercase tracking-wider text-text-muted mb-2">Hiring Notes</h3>
							<ul class="space-y-1.5">
								{#each (team.hiring_notes as string[]) as note}
									<li class="text-xs text-text-secondary flex items-start gap-2">
										<span class="text-warning shrink-0 mt-0.5">&#9888;</span>
										{note}
									</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>
			{/if}
		{/if}
	{/if}
</div>

<!-- ── Document content modal ─────────────────────────────────── -->
<Modal open={docModalOpen} onclose={closeDocModal} title={deliverableLabels[docModalDeliverable?.name] ?? docModalDeliverable?.name ?? ''} size="lg">
	{#if docModalLoading}
		<div class="py-16 text-center">
			<div class="inline-flex items-center justify-center w-12 h-12 brutal-border bg-primary-light mb-4">
				<div class="w-5 h-5 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
			</div>
			<p class="text-sm text-text-muted font-bold">Loading document...</p>
		</div>
	{:else if docModalError}
		<div class="py-12 text-center">
			<p class="text-sm font-bold text-danger">{docModalError}</p>
		</div>
	{:else if docIsHtml}
		<iframe
			srcdoc={docModalContent}
			title={docModalDeliverable?.name ?? ''}
			class="w-full border-2 border-brutal bg-white"
			style="height: 70vh;"
			sandbox="allow-scripts allow-same-origin"
		></iframe>
	{:else if docIsMarkdown}
		<MarkdownRenderer content={docModalContent} />
	{:else}
		<pre class="text-xs font-mono leading-relaxed whitespace-pre-wrap break-words text-text-secondary bg-surface-hover border-2 border-brutal p-4 overflow-x-auto">{docModalContent}</pre>
	{/if}
	{#snippet footer()}
		<div class="flex justify-end">
			<button
				class="brutal-border-thin bg-primary text-white px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider hover:bg-primary-hover transition-colors"
				onclick={closeDocModal}
			>Close</button>
		</div>
	{/snippet}
</Modal>

<!-- ── Work Item Editor Modal ─────────────────────────────────── -->
<WorkItemEditor
	open={editorOpen}
	item={editorItem}
	snapshotId={wbs?.id}
	parentId={editorParentId}
	onclose={() => editorOpen = false}
	onsave={onEditorSave}
/>
