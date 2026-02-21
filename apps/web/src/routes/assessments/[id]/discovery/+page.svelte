<script lang="ts">
	import { page } from '$app/state';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Stat from '$lib/components/ui/Stat.svelte';
	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
	import CollapsibleSection from '$lib/components/ui/CollapsibleSection.svelte';
	import Tooltip from '$lib/components/ui/Tooltip.svelte';
	import InfoDrawer from '$lib/components/ui/InfoDrawer.svelte';
	import { KNOWN_DIMENSIONS, DIMENSION_LABELS, normalizeDiscovery, formatQuestionId } from '$lib/utils/migration-stats';

	let { data } = $props();

	const summary = $derived(data.summary);

	// Discovery data keyed by dimension name (normalized so aliases map to canonical keys)
	let discoveryData = $state<Record<string, any>>(
		normalizeDiscovery(data.discovery as Record<string, any> | null | undefined)
	);

	const dimensionNames = $derived(Object.keys(discoveryData).sort());

	// URL param for deep-linking to a dimension
	const expandedDimension = $derived(page.url.searchParams.get('dimension'));

	// Answer stats across all dimensions
	const answerStats = $derived(() => {
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
	});

	// Editing state
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

	let drawerSection = $state<'page' | null>(null);

	function badgeVariant(confidence: string): 'success' | 'warning' | 'danger' | 'default' {
		switch (confidence) {
			case 'confirmed': return 'success';
			case 'assumed': return 'warning';
			case 'unknown': return 'danger';
			default: return 'default';
		}
	}
</script>

<svelte:head>
	<title>{data.assessment.project_name} — Discovery</title>
</svelte:head>

<div class="p-6 space-y-6 animate-enter">
	<div>
		<div class="flex items-center gap-2">
			<h1 class="text-xl font-extrabold uppercase tracking-wider">Discovery</h1>
			<button onclick={() => drawerSection = 'page'} class="flex items-center justify-center w-5 h-5 text-text-muted hover:text-primary transition-colors" aria-label="About this page">
				<span class="text-[10px] font-mono opacity-60">(i)</span>
			</button>
		</div>
		<p class="text-sm font-bold text-text-secondary mt-0.5">Infrastructure discovery across {summary.discovery.totalDimensions} dimensions</p>
	</div>

	{#if dimensionNames.length === 0}
		<Card>
			<div class="py-8 text-center">
				<p class="text-lg font-extrabold uppercase tracking-wider text-text-secondary">No Discovery Data</p>
				<p class="mt-2 text-sm text-text-muted max-w-md mx-auto">
					Run <code class="brutal-border-thin bg-surface px-1.5 py-0.5 text-xs font-mono">/migrate discover</code> to begin.
				</p>
			</div>
		</Card>
	{:else}
		<!-- Progress summary -->
		<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
			<Card>
				<div class="space-y-3">
					<Stat label="Progress" value="{summary.discovery.discoveryPercent}%" detail="{summary.discovery.completedDimensions}/{summary.discovery.totalDimensions} dimensions" tooltip="Percentage of discovery dimensions with at least one answer." />
					<ProgressBar value={summary.discovery.discoveryPercent} variant={summary.discovery.discoveryPercent === 100 ? 'success' : 'primary'} />
				</div>
			</Card>
			<Card>
				{@const stats = answerStats()}
				<Stat label="Total Answers" value={stats.total} detail="{stats.confirmed} confirmed" tooltip="Total data points collected across all discovery dimensions." />
			</Card>
			<Card>
				{@const stats = answerStats()}
				<Stat label="Assumed" value={stats.assumed} detail="Need validation" tooltip="Answers based on assumptions. Validate with the client to increase confidence." />
			</Card>
			<Card>
				{@const stats = answerStats()}
				<Stat label="Unknown" value={stats.unknown} detail="Missing data" tooltip="Data points with no answer. These create the most uncertainty in the estimate." />
			</Card>
		</div>

		<!-- Dimension Grid -->
		<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-6">
			{#each KNOWN_DIMENSIONS as dim}
				{@const dimData = discoveryData[dim]}
				{@const isComplete = dimData?.status === 'complete'}
				{@const answerCount = dimData?.answers ? Object.keys(dimData.answers).length : 0}
				<Card padding="p-3" hover>
					<div class="flex items-center justify-between">
						<div>
							<span class="text-sm font-bold">{DIMENSION_LABELS[dim] ?? dim}</span>
							<span class="block text-xs text-text-muted font-mono">{answerCount} answers</span>
						</div>
						<Badge variant={isComplete ? 'success' : dimData ? 'warning' : 'default'}>
							{isComplete ? 'Complete' : dimData ? 'Partial' : 'Not Started'}
						</Badge>
					</div>
				</Card>
			{/each}
		</div>

		<!-- Dimension Details -->
		<div class="space-y-3">
			{#each dimensionNames as dim}
				{@const dimData = discoveryData[dim]}
				{@const answers = dimData?.answers ?? {}}
				{@const answerEntries = Object.entries(answers) as [string, any][]}
				<CollapsibleSection
					title={DIMENSION_LABELS[dim] ?? dim}
					subtitle="{answerEntries.length} answers"
					open={expandedDimension === dim}
					badge={dimData?.status ?? 'unknown'}
					badgeVariant={dimData?.status === 'complete' ? 'success' : 'warning'}
				>
					{#if dimData?.last_updated}
						<p class="text-xs text-text-muted mb-3 font-mono">
							Last updated: {new Date(dimData.last_updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
						</p>
					{/if}

					<div class="overflow-x-auto -mx-4">
						<table class="w-full text-sm">
							<thead>
								<tr class="bg-[#1a1a1a] text-white text-xs font-extrabold uppercase tracking-wider">
									<th class="text-left px-4 py-2">Question</th>
									<th class="text-left px-4 py-2">Value</th>
									<th class="text-center px-4 py-2 w-28">Confidence</th>
									<th class="text-center px-4 py-2 w-16">Edit</th>
								</tr>
							</thead>
							<tbody>
								{#each answerEntries as [qId, answer]}
									{@const isEditing = editingAnswer?.dimension === dim && editingAnswer?.questionId === qId}
									<tr class="border-b border-border-light hover:bg-surface-hover transition-colors">
										<td class="px-4 py-2.5 text-text-secondary">{formatQuestionId(qId)}</td>
										<td class="px-4 py-2.5">
											{#if isEditing}
												<div class="flex items-center gap-2">
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
												<span class="font-mono font-bold">{formatValue(answer.value)}</span>
												{#if answer.notes}
													<span class="block text-xs text-text-muted mt-0.5">{answer.notes}</span>
												{/if}
												{#if answer.basis}
													<span class="block text-[10px] text-text-muted italic mt-0.5">Basis: {answer.basis}</span>
												{/if}
											{/if}
										</td>
										<td class="px-4 py-2.5 text-center">
											<Tooltip text={answer.confidence === 'confirmed' ? 'Verified by client or evidence' : answer.confidence === 'assumed' ? 'Based on assumption — needs validation' : 'No data available'} position="left">
												<Badge variant={badgeVariant(answer.confidence)}>{answer.confidence ?? 'unknown'}</Badge>
											</Tooltip>
										</td>
										<td class="px-4 py-2.5 text-center">
											{#if !isEditing}
												<button
													class="text-xs text-primary hover:text-primary-hover font-bold
														focus-visible:outline-2 focus-visible:outline-primary"
													onclick={() => startEdit(dim, qId, answer)}
												>Edit</button>
											{/if}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</CollapsibleSection>
			{/each}
		</div>
	{/if}
</div>

<InfoDrawer
	open={drawerSection !== null}
	onclose={() => drawerSection = null}
	title="About Discovery"
>
	{#if drawerSection === 'page'}
		<div class="space-y-4 text-sm">
			<p><strong>Discovery</strong> collects infrastructure and environment data across multiple dimensions to build an accurate migration estimate.</p>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">What Are Dimensions?</h3>
				<p class="text-text-secondary">Each dimension represents a category of infrastructure (compute, networking, storage, databases, etc.). Completing all dimensions gives the estimate engine the most accurate inputs.</p>
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
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Editing Answers</h3>
				<p class="text-text-secondary">Click "Edit" on any answer to update its value and confidence level. Changes are saved immediately and flow into analysis and estimates.</p>
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
