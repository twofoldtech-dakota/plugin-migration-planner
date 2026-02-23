<script lang="ts">
	import { page } from '$app/state';
	import type { EstimateVersionSummary } from '@migration-planner/db';

	interface Props {
		versions: EstimateVersionSummary[];
		currentVersion: number;
	}

	let { versions, currentVersion }: Props = $props();

	let open = $state(false);
	let selectingCompare = $state(false);

	const canCompare = $derived(versions.length >= 2);

	function formatDate(iso: string): string {
		const d = new Date(iso);
		return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
	}

	function versionUrl(version: number): string {
		const base = `/assessments/${page.params.id}/estimate`;
		const tab = page.url.searchParams.get('tab');
		const params = new URLSearchParams();
		if (version !== versions[0]?.version) params.set('v', String(version));
		if (tab) params.set('tab', tab);
		const qs = params.toString();
		return qs ? `${base}?${qs}` : base;
	}

	function compareUrl(compareVersion: number): string {
		const base = `/assessments/${page.params.id}/estimate`;
		const tab = page.url.searchParams.get('tab');
		const params = new URLSearchParams();
		params.set('v', String(currentVersion));
		params.set('compare', String(compareVersion));
		if (tab) params.set('tab', tab);
		return `${base}?${params.toString()}`;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			open = false;
			selectingCompare = false;
		}
	}

	function handleClickOutside(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (!target.closest('[data-version-switcher]')) {
			open = false;
			selectingCompare = false;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} onclick={handleClickOutside} />

<div class="relative" data-version-switcher>
	<button
		class="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider
			border-2 border-primary bg-primary-light text-primary
			hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_theme(colors.primary)]
			active:translate-x-0 active:translate-y-0 active:shadow-none
			transition-all duration-150
			focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
		onclick={(e) => { e.stopPropagation(); open = !open; selectingCompare = false; }}
		aria-expanded={open}
		aria-haspopup="true"
	>
		<span class="font-mono font-extrabold">v{currentVersion}</span>
		{#if versions.length > 0}
			{@const current = versions.find(v => v.version === currentVersion)}
			{#if current}
				<span class="text-primary/60 font-normal">{formatDate(current.created_at)}</span>
			{/if}
		{/if}
		<span class="ml-0.5 text-[10px] text-primary/50" aria-hidden="true">{open ? '\u25B2' : '\u25BC'}</span>
	</button>

	{#if open}
		<div
			class="absolute right-0 top-full mt-1 z-50 w-80 brutal-border bg-surface shadow-lg"
			role="menu"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => { if (e.key === 'Escape') open = false; }}
		>
			<div class="px-3 py-2 border-b-2 border-brutal bg-bg">
				<span class="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">
					{selectingCompare ? 'Select version to compare' : 'Estimate Versions'}
				</span>
			</div>

			<div class="max-h-60 overflow-y-auto">
				{#each versions as v}
					{@const isCurrent = v.version === currentVersion}
					{#if selectingCompare}
						{#if !isCurrent}
							<a
								href={compareUrl(v.version)}
								class="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-surface-hover transition-colors duration-100 border-b border-border-light"
								role="menuitem"
							>
								<span class="font-mono font-bold text-xs">v{v.version}</span>
								<span class="flex-1 text-xs text-text-muted">{formatDate(v.created_at)}</span>
								<span class="font-mono text-xs">{Math.round(v.total_expected_hours)}h</span>
							</a>
						{/if}
					{:else}
						<a
							href={versionUrl(v.version)}
							class="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-surface-hover transition-colors duration-100 border-b border-border-light
								{isCurrent ? 'bg-primary-light' : ''}"
							role="menuitem"
						>
							{#if isCurrent}
								<span class="text-primary text-xs" aria-label="Current version">&#10003;</span>
							{:else}
								<span class="w-3"></span>
							{/if}
							<span class="font-mono font-bold text-xs">v{v.version}</span>
							<span class="flex-1 text-xs text-text-muted">{formatDate(v.created_at)}</span>
							<div class="text-right">
								<span class="font-mono text-xs font-bold">{Math.round(v.total_expected_hours)}h</span>
								<span class="block text-[10px] text-text-muted">{v.confidence_score}%</span>
							</div>
						</a>
					{/if}
				{/each}
			</div>

			{#if !selectingCompare}
				<div class="px-3 py-2 border-t-2 border-brutal">
					{#if canCompare}
						<button
							class="w-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider
								border-2 border-brutal bg-primary-light text-primary
								hover:bg-primary hover:text-white transition-colors duration-150
								focus-visible:outline-2 focus-visible:outline-primary"
							onclick={() => selectingCompare = true}
						>
							Compare with...
						</button>
					{:else}
						<span class="block text-center text-[10px] text-text-muted py-1">
							Need 2+ versions to compare
						</span>
					{/if}
				</div>
			{:else}
				<div class="px-3 py-2 border-t-2 border-brutal">
					<button
						class="w-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider
							border-2 border-brutal bg-surface text-text-muted
							hover:bg-surface-hover transition-colors duration-150"
						onclick={() => selectingCompare = false}
					>
						Cancel
					</button>
				</div>
			{/if}
		</div>
	{/if}
</div>
