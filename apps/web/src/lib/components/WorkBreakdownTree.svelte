<script lang="ts">
	import Badge from '$lib/components/ui/Badge.svelte';
	import Tooltip from '$lib/components/ui/Tooltip.svelte';

	interface WorkItem {
		id: number;
		type: string;
		title: string;
		description: string;
		hours: number;
		base_hours: number;
		role: string | null;
		phase_id: string;
		component_id: string;
		labels: string[];
		priority: string;
		confidence: string;
		source: string;
		sort_order: number;
		children: WorkItem[];
	}

	interface Props {
		items: WorkItem[];
		snapshotId: number;
		onEdit?: (item: WorkItem) => void;
		onDelete?: (itemId: number) => void;
		onAddChild?: (parentId: number) => void;
	}

	let { items, snapshotId, onEdit, onDelete, onAddChild }: Props = $props();

	let collapsed = $state<Record<number, boolean>>({});
	let editingTitle = $state<number | null>(null);
	let editValue = $state('');

	const typeIcons: Record<string, string> = {
		epic: '\u25A0',    // filled square
		feature: '\u25C6', // diamond
		story: '\u25CF',   // circle
		task: '\u25B6',    // triangle
		spike: '\u26A1',   // lightning
	};

	const typeColors: Record<string, string> = {
		epic: 'text-primary',
		feature: 'text-[#7c3aed]',
		story: 'text-text',
		task: 'text-text-muted',
		spike: 'text-warning',
	};

	const priorityVariant: Record<string, 'danger' | 'warning' | 'default' | 'muted' | 'info'> = {
		critical: 'danger',
		high: 'warning',
		medium: 'default',
		low: 'muted',
	};

	// Stats
	const flatCount = $derived(countItems(items));
	const totalHours = $derived(sumHours(items));
	const typeCounts = $derived(countByType(items));

	function countItems(list: WorkItem[]): number {
		return list.reduce((s, i) => s + 1 + countItems(i.children ?? []), 0);
	}

	function sumHours(list: WorkItem[]): number {
		// Only sum leaf hours to avoid double-counting
		return list.reduce((s, i) => {
			if ((i.children ?? []).length > 0) return s + sumHours(i.children);
			return s + i.hours;
		}, 0);
	}

	function countByType(list: WorkItem[]): Record<string, number> {
		const counts: Record<string, number> = {};
		for (const item of list) {
			counts[item.type] = (counts[item.type] ?? 0) + 1;
			const childCounts = countByType(item.children ?? []);
			for (const [t, c] of Object.entries(childCounts)) {
				counts[t] = (counts[t] ?? 0) + c;
			}
		}
		return counts;
	}

	function startEdit(item: WorkItem) {
		editingTitle = item.id;
		editValue = item.title;
	}

	async function saveEdit(item: WorkItem) {
		if (editValue.trim() && editValue !== item.title) {
			await fetch(`/api/planning/wbs/items/${item.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title: editValue.trim() }),
			});
			item.title = editValue.trim();
		}
		editingTitle = null;
	}

	function toggleCollapse(id: number) {
		collapsed[id] = !collapsed[id];
		collapsed = { ...collapsed };
	}

	function hoursDelta(item: WorkItem): number {
		return item.hours - item.base_hours;
	}
</script>

<!-- Summary bar -->
<div class="brutal-border bg-surface px-4 py-2.5 flex items-center gap-5 flex-wrap mb-4">
	<div class="flex items-baseline gap-1.5">
		<span class="text-xl font-extrabold font-mono">{flatCount}</span>
		<span class="text-xs font-bold uppercase tracking-wider text-text-muted">items</span>
	</div>
	<span class="w-px h-5 bg-border-light" aria-hidden="true"></span>
	<div class="flex items-baseline gap-1.5">
		<span class="text-sm font-extrabold font-mono">{Math.round(totalHours).toLocaleString()}h</span>
		<span class="text-xs text-text-muted">total</span>
	</div>
	<span class="w-px h-5 bg-border-light" aria-hidden="true"></span>
	<div class="flex items-center gap-2 flex-wrap">
		{#each Object.entries(typeCounts) as [type, count]}
			<span class="text-[10px] font-bold uppercase tracking-wider {typeColors[type] ?? 'text-text-muted'}">
				{typeIcons[type] ?? ''} {count} {type}{count !== 1 ? 's' : ''}
			</span>
		{/each}
	</div>
</div>

<!-- Tree -->
<div class="space-y-1" role="tree" aria-label="Work breakdown structure">
	{#each items as item}
		{@render treeNode(item, 0)}
	{/each}
</div>

{#snippet treeNode(item: WorkItem, depth: number)}
	{@const hasChildren = (item.children ?? []).length > 0}
	{@const isCollapsed = collapsed[item.id]}
	{@const delta = hoursDelta(item)}
	{@const isEditing = editingTitle === item.id}

	<div
		role="treeitem"
		aria-expanded={hasChildren ? !isCollapsed : undefined}
		class="border-2 border-brutal bg-bg transition-all duration-100
			{depth === 0 ? 'shadow-[2px_2px_0_#000]' : 'shadow-[1px_1px_0_#000]'}
			{item.source === 'custom' ? 'border-l-4 border-l-success' : ''}"
		style="margin-left: {depth * 20}px"
	>
		<div class="flex items-center gap-2 px-3 py-2">
			<!-- Expand/collapse -->
			{#if hasChildren}
				<button
					class="w-5 h-5 flex items-center justify-center text-xs text-text-muted hover:text-text transition-colors"
					onclick={() => toggleCollapse(item.id)}
					aria-label="{isCollapsed ? 'Expand' : 'Collapse'} {item.title}"
				>
					<span class="inline-block transition-transform duration-150 {isCollapsed ? '' : 'rotate-90'}">&#9654;</span>
				</button>
			{:else}
				<span class="w-5"></span>
			{/if}

			<!-- Type icon -->
			<Tooltip text={item.type} position="top">
				<span class="text-sm {typeColors[item.type] ?? 'text-text-muted'} cursor-default">{typeIcons[item.type] ?? '\u25CB'}</span>
			</Tooltip>

			<!-- Title (click-to-edit) -->
			{#if isEditing}
				<input
					type="text"
					bind:value={editValue}
					onblur={() => saveEdit(item)}
					onkeydown={(e) => { if (e.key === 'Enter') saveEdit(item); if (e.key === 'Escape') editingTitle = null; }}
					class="flex-1 text-sm font-bold bg-bg border-b-2 border-primary focus:outline-none font-mono"
					autofocus
				/>
			{:else}
				<button
					class="flex-1 text-left text-sm font-bold truncate hover:text-primary transition-colors"
					ondblclick={() => startEdit(item)}
					title="Double-click to edit"
				>
					{item.title}
				</button>
			{/if}

			<!-- Badges -->
			<div class="flex items-center gap-1.5 shrink-0">
				{#if item.role}
					<span class="text-[10px] font-bold font-mono text-text-muted bg-surface-raised px-1.5 py-0.5 border border-border-light">
						{item.role}
					</span>
				{/if}
				{#if item.priority !== 'medium'}
					<Badge variant={priorityVariant[item.priority] ?? 'default'}>{item.priority}</Badge>
				{/if}
				{#if item.source === 'custom'}
					<span class="text-[10px] font-bold text-success">custom</span>
				{/if}

				<!-- Hours -->
				<div class="text-right min-w-[50px]">
					<span class="text-sm font-extrabold font-mono">{Math.round(item.hours * 10) / 10}h</span>
					{#if delta !== 0}
						<span class="block text-[10px] font-bold font-mono {delta > 0 ? 'text-danger' : 'text-success'}">
							{delta > 0 ? '+' : ''}{Math.round(delta * 10) / 10}h
						</span>
					{/if}
				</div>

				<!-- Actions -->
				<div class="flex items-center gap-0.5 ml-1">
					{#if onEdit}
						<button
							class="w-6 h-6 flex items-center justify-center text-[10px] text-text-muted hover:text-primary transition-colors"
							onclick={() => onEdit?.(item)}
							aria-label="Edit {item.title}"
						>&#9998;</button>
					{/if}
					{#if onAddChild}
						<button
							class="w-6 h-6 flex items-center justify-center text-[10px] text-text-muted hover:text-success transition-colors"
							onclick={() => onAddChild?.(item.id)}
							aria-label="Add child to {item.title}"
						>+</button>
					{/if}
					{#if onDelete}
						<button
							class="w-6 h-6 flex items-center justify-center text-[10px] text-text-muted hover:text-danger transition-colors"
							onclick={() => onDelete?.(item.id)}
							aria-label="Delete {item.title}"
						>&#10005;</button>
					{/if}
				</div>
			</div>
		</div>
	</div>

	{#if hasChildren && !isCollapsed}
		{#each item.children as child}
			{@render treeNode(child, depth + 1)}
		{/each}
	{/if}
{/snippet}
