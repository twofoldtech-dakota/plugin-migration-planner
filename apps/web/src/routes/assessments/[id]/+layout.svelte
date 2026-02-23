<script lang="ts">
	import Sidebar from '$lib/components/Sidebar.svelte';
	import type { Snippet } from 'svelte';

	let { data, children }: { data: any; children: Snippet } = $props();

	const assessment = $derived(data.assessment);
	const summary    = $derived(data.summary);

	// ── Workflow cascade ─────────────────────────────────────────────────
	// Determines the active step index (0-based) and phase display props.
	// Steps before activeIdx are complete, activeIdx is in-progress, after are pending.
	const activeIdx = $derived((() => {
		if (assessment.status === 'complete') return 4;
		if (summary?.hasEstimate)             return 3;
		if (summary?.hasAnalysis)             return 2;
		if (summary?.hasDiscovery)            return 1;
		return 0;
	})());

	const phase = $derived((() => {
		const map = [
			{ label: 'Discovery', badge: 'bg-surface text-text-muted border-border-light',   dot: 'bg-text-muted' },
			{ label: 'Analysis',  badge: 'bg-primary-light text-primary border-primary',      dot: 'bg-primary' },
			{ label: 'Estimate',  badge: 'bg-primary-light text-primary border-primary',      dot: 'bg-primary' },
			{ label: 'Refine',    badge: 'bg-warning-light text-warning border-warning',      dot: 'bg-warning' },
			{ label: 'Refine',    badge: 'bg-warning-light text-warning border-warning',      dot: 'bg-warning' },
			{ label: 'Complete',  badge: 'bg-success-light text-success border-success',      dot: 'bg-success' },
		];
		return map[activeIdx];
	})());

	// ── Workflow steps for progress strip ────────────────────────────────
	const stepLabels = ['Discovery', 'Analysis', 'Estimate', 'Refine'];

	// ── Metric derivations ───────────────────────────────────────────────
	const discoveryPct = $derived(summary?.discovery?.discoveryPercent ?? 0);
	const discoveryDone = $derived(summary?.discovery?.completedDimensions ?? 0);
	const discoveryTotal = $derived(summary?.discovery?.totalDimensions ?? 0);
	const risksOpen    = $derived(summary?.risks?.open ?? 0);
	const risksCrit    = $derived(summary?.risks?.critical ?? 0);
	const assumeUnval  = $derived(summary?.assumptions?.unvalidated ?? 0);
	const assumeTotal  = $derived(summary?.assumptions?.total ?? 0);
	const confidence   = $derived(summary?.confidence ?? 0);
	const hours        = $derived(summary?.estimateHours ?? 0);

	const confColor = $derived(
		confidence >= 70 ? 'text-success' : confidence >= 40 ? 'text-warning' : 'text-danger'
	);
	const confBg = $derived(
		confidence >= 70 ? 'bg-success' : confidence >= 40 ? 'bg-warning' : 'bg-danger'
	);
</script>

<div class="flex flex-col h-full">
	<!-- ── Status bar — full-width, pinned above scroll area ─────────── -->
	<div class="shrink-0 bg-surface select-none z-40">
		<div class="flex items-stretch">
			<!-- ─── Identity zone ──────────────────────────────────────── -->
			<div class="flex items-center gap-3 px-6 py-3 min-w-0">
				<div class="min-w-0">
					<h1 class="text-[15px] font-extrabold text-text truncate leading-tight">{assessment.project_name}</h1>
					<div class="flex items-center gap-2 mt-1">
						<span class="inline-flex items-center gap-1.5 px-2 py-px text-[10px] font-extrabold uppercase tracking-widest border-2 {phase.badge}">
							<span class="w-1.5 h-1.5 rounded-full {phase.dot} {assessment.status !== 'complete' ? 'animate-pulse' : ''}"></span>
							{phase.label}
						</span>
						{#if assessment.client_name}
							<span class="text-[11px] text-text-muted truncate">{assessment.client_name}</span>
						{/if}
					</div>
				</div>
			</div>

			<!-- ─── Spacer ─────────────────────────────────────────────── -->
			<div class="flex-1"></div>

			<!-- ─── Metrics zone ───────────────────────────────────────── -->
			<div class="flex items-stretch">
				{#if discoveryPct > 0}
					<a href="/assessments/{assessment.id}/discovery" class="flex flex-col items-center justify-center px-5 border-l-2 border-border-light no-underline hover:bg-surface-hover transition-colors group">
						<span class="text-[10px] font-bold uppercase tracking-widest text-text-muted leading-none">Discovery</span>
						<span class="text-[15px] font-extrabold font-mono tabular-nums leading-tight mt-1 text-text group-hover:text-primary transition-colors">{discoveryPct}<span class="text-[10px] text-text-muted">%</span></span>
						<span class="text-[9px] font-mono text-text-faint mt-0.5">{discoveryDone}/{discoveryTotal}</span>
					</a>
				{/if}

				{#if risksOpen > 0}
					<a href="/assessments/{assessment.id}/analysis?tab=risks" class="flex flex-col items-center justify-center px-5 border-l-2 border-border-light no-underline hover:bg-surface-hover transition-colors group">
						<span class="text-[10px] font-bold uppercase tracking-widest text-text-muted leading-none">Risks</span>
						<span class="text-[15px] font-extrabold font-mono tabular-nums leading-tight mt-1 {risksCrit > 0 ? 'text-danger' : 'text-text'} group-hover:opacity-80 transition-opacity">{risksOpen}</span>
						{#if risksCrit > 0}
							<span class="text-[9px] font-mono font-bold text-danger mt-0.5">{risksCrit} critical</span>
						{:else}
							<span class="text-[9px] font-mono text-text-faint mt-0.5">open</span>
						{/if}
					</a>
				{/if}

				{#if assumeTotal > 0}
					<a href="/assessments/{assessment.id}/analysis?tab=assumptions" class="flex flex-col items-center justify-center px-5 border-l-2 border-border-light no-underline hover:bg-surface-hover transition-colors group">
						<span class="text-[10px] font-bold uppercase tracking-widest text-text-muted leading-none">Unvalidated</span>
						<span class="text-[15px] font-extrabold font-mono tabular-nums leading-tight mt-1 {assumeUnval > 0 ? 'text-warning' : 'text-success'} group-hover:opacity-80 transition-opacity">{assumeUnval}</span>
						<span class="text-[9px] font-mono text-text-faint mt-0.5">of {assumeTotal}</span>
					</a>
				{/if}

				{#if hours > 0}
					<a href="/assessments/{assessment.id}/estimate" class="flex flex-col items-center justify-center px-5 border-l-2 border-border-light no-underline hover:bg-surface-hover transition-colors group">
						<span class="text-[10px] font-bold uppercase tracking-widest text-text-muted leading-none">Hours</span>
						<span class="text-[15px] font-extrabold font-mono tabular-nums leading-tight mt-1 text-text group-hover:text-primary transition-colors">{Math.round(hours).toLocaleString()}</span>
						<span class="text-[9px] font-mono text-text-faint mt-0.5">estimate</span>
					</a>
				{/if}

				{#if confidence > 0}
					<a href="/assessments/{assessment.id}/analysis?tab=gaps" class="flex flex-col items-center justify-center px-5 border-l-2 border-border-light no-underline hover:bg-surface-hover transition-colors group">
						<span class="text-[10px] font-bold uppercase tracking-widest text-text-muted leading-none">Confidence</span>
						<span class="text-[15px] font-extrabold font-mono tabular-nums leading-tight mt-1 {confColor} group-hover:opacity-80 transition-opacity">{confidence}<span class="text-[10px]">%</span></span>
						<!-- Tiny inline bar -->
						<div class="w-10 h-[3px] bg-border-light mt-1 overflow-hidden">
							<div class="h-full {confBg} transition-all duration-500" style="width: {confidence}%"></div>
						</div>
					</a>
				{/if}
			</div>
		</div>

		<!-- ─── Workflow progress strip ──────────────────────────────────── -->
		<div class="flex gap-px h-[3px]" role="progressbar" aria-valuenow={activeIdx} aria-valuemin={0} aria-valuemax={5} aria-label="Workflow progress">
			{#each stepLabels as label, i}
				{@const done = i < activeIdx}
				{@const active = i === activeIdx && assessment.status !== 'complete'}
				<div
					class="flex-1 transition-colors duration-500
						{done ? 'bg-primary' : active ? 'bg-primary/40' : 'bg-border-light'}"
					title="{label}: {done ? 'Complete' : active ? 'In progress' : 'Pending'}"
				></div>
			{/each}
		</div>
	</div>

	<!-- ── Sidebar + Content — fills remaining height ────────────────── -->
	<div class="flex flex-1 min-h-0">
		<Sidebar
			assessmentId={assessment.id}
			projectName={assessment.project_name}
			summary={data.summary}
		/>
		<div class="flex-1 overflow-auto">
			{@render children()}
		</div>
	</div>
</div>
