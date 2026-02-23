<script lang="ts">
	import Toggle from './ui/Toggle.svelte';
	import Tooltip from './ui/Tooltip.svelte';
	import CollapsibleSection from './ui/CollapsibleSection.svelte';

	interface Props {
		tools: any[];
		toggles: Record<string, boolean>;
		ontoggle: (toolId: string, enabled: boolean) => void;
		mode?: 'compact' | 'full';
		initialLimit?: number;
	}

	let { tools, toggles, ontoggle, mode = 'compact', initialLimit = 6 }: Props = $props();

	let showAll = $state(false);

	// Sort all tools by expected hours saved, descending
	const rankedTools = $derived(
		[...tools].sort((a, b) => (b.hours_saved?.expected ?? 0) - (a.hours_saved?.expected ?? 0))
	);

	const displayedTools = $derived(
		mode === 'compact' && !showAll ? rankedTools.slice(0, initialLimit) : rankedTools
	);

	// Category grouping for full mode — sort within each category by value
	const categories = $derived([...new Set(rankedTools.map((t: any) => t.category))]);

	function getCategoryTools(category: string) {
		return rankedTools.filter((t: any) => t.category === category);
	}

	function getCategoryTotalSavings(category: string) {
		return getCategoryTools(category).reduce((s, t) => s + (t.hours_saved?.expected ?? 0), 0);
	}

	// Global rank lookup (1-indexed)
	const rankMap = $derived(() => {
		const map = new Map<string, number>();
		rankedTools.forEach((t, i) => map.set(t.id, i + 1));
		return map;
	});
</script>

{#if mode === 'compact'}
	<p class="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-2">Ranked by estimated hours saved</p>
	<div class="space-y-2">
		{#each displayedTools as tool, i}
			{@const isOn = toggles[tool.id] !== false}
			{@const rank = rankMap().get(tool.id) ?? i + 1}
			<div class="flex items-center justify-between gap-2">
				<div class="flex items-center gap-2 flex-1 min-w-0">
					<Tooltip text={rank <= 3 ? 'Top 3 by hours saved' : `Ranked #${rank} of ${rankedTools.length} by hours saved`}>
						<span class="w-5 text-center text-[10px] font-extrabold font-mono
							{rank <= 3 ? 'text-success' : 'text-text-muted'}">#{rank}</span>
					</Tooltip>
					<span class="text-sm font-bold {isOn ? '' : 'text-text-muted'} truncate">{tool.name}</span>
					<span class="text-xs text-success font-mono font-bold shrink-0">-{tool.hours_saved?.expected ?? 0}h</span>
				</div>
				<Toggle
					checked={isOn}
					onchange={(v) => ontoggle(tool.id, v)}
					size="sm"
				/>
			</div>
		{/each}
		{#if tools.length > initialLimit}
			<button
				class="w-full text-center text-xs font-bold text-primary hover:text-primary-hover pt-1"
				onclick={() => showAll = !showAll}
			>
				{showAll ? 'Show fewer' : `Show all ${tools.length} tools`}
			</button>
		{/if}
	</div>
{:else}
	<p class="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-3">Ranked by estimated hours saved</p>
	<div class="space-y-4">
		{#each categories as category}
			{@const categoryTools = getCategoryTools(category)}
			{@const catSavings = getCategoryTotalSavings(category)}
			<CollapsibleSection
				title={category.replace(/_/g, ' ')}
				subtitle="-{Math.round(catSavings)}h"
				open={true}
				badge="{categoryTools.filter((t) => toggles[t.id] !== false).length}/{categoryTools.length} on"
				badgeVariant={categoryTools.every((t) => toggles[t.id] !== false) ? 'success' : 'warning'}
			>
				<div class="space-y-3">
					{#each categoryTools as tool}
						{@const isOn = toggles[tool.id] !== false}
						{@const rank = rankMap().get(tool.id) ?? 0}
						<div class="border-2 {rank <= 3 ? 'border-success' : 'border-border-light'} {isOn ? 'bg-surface' : 'bg-bg opacity-70'} transition-all duration-150">
							<div class="flex items-center gap-3 px-4 py-3">
								<div class="flex flex-col items-center shrink-0 w-8">
									<Tooltip text={rank <= 3 ? 'Top 3 by hours saved' : `Ranked #${rank} of ${rankedTools.length} by hours saved`} position="right">
										<span class="text-xs font-extrabold font-mono {rank <= 3 ? 'text-success' : 'text-text-muted'}">#{rank}</span>
									</Tooltip>
								</div>
								<Toggle
									checked={isOn}
									onchange={(v) => ontoggle(tool.id, v)}
								/>
								<div class="flex-1 min-w-0">
									<div class="flex items-center gap-2">
										<span class="text-sm font-bold">{tool.name}</span>
										<span class="text-xs text-text-muted font-mono">{tool.vendor}</span>
										{#if rank === 1}
											<span class="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-success-light text-success border border-success">Top Pick</span>
										{:else if tool.recommendation === 'recommended'}
											<span class="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-success-light text-success border border-success">Recommended</span>
										{/if}
									</div>
									<p class="text-xs text-text-secondary mt-0.5 truncate">{tool.description}</p>
								</div>
								<div class="text-right shrink-0">
									<span class="text-sm font-mono font-bold text-success">-{tool.hours_saved?.expected ?? 0}h</span>
									<span class="block text-[10px] text-text-muted font-mono">
										{tool.hours_saved?.optimistic ?? 0}-{tool.hours_saved?.pessimistic ?? 0}h range
									</span>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</CollapsibleSection>
		{/each}
	</div>
{/if}
