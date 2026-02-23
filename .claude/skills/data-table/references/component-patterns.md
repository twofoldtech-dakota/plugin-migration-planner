# Component Patterns — Svelte 5 Data Tables

## Table of Contents
1. [Core DataTable Component](#core-datatable)
2. [Column Definition API](#column-definition)
3. [Sorting](#sorting)
4. [Filtering & Search](#filtering)
5. [Pagination](#pagination)
6. [Row Selection](#row-selection)
7. [Responsive Patterns](#responsive)
8. [Cell Renderers](#cell-renderers)
9. [Empty & Loading States](#states)
10. [Keyboard Navigation](#keyboard)
11. [Toolbar Composition](#toolbar)
12. [Expandable Rows](#expandable)

---

## Core DataTable Component <a id="core-datatable"></a>

Svelte 5 runes pattern. Zero JS shipped for static tables — use `{#each}` with server data.
Only add client interactivity (`$state`, `$derived`) when sorting/filtering/pagination is needed.

```svelte
<script lang="ts">
    import type { Snippet } from 'svelte';

    type Column<T> = {
        key: string;
        label: string;
        align?: 'left' | 'center' | 'right';
        width?: string;           // Tailwind width class or CSS value
        sortable?: boolean;
        mono?: boolean;           // Use JetBrains Mono
        format?: (value: any, row: T) => string;
        snippet?: Snippet<[T]>;   // Custom cell renderer
        srOnly?: string;          // Screen reader override
        sticky?: boolean;         // Sticky column (left)
        priority?: number;        // Responsive priority (1=always, 2=md+, 3=lg+)
    };

    type Props<T> = {
        data: T[];
        columns: Column<T>[];
        caption?: string;         // Required for accessibility
        density?: 'compact' | 'default' | 'spacious';
        striped?: boolean;
        hoverable?: boolean;
        bordered?: boolean;       // Cell borders
        stickyHeader?: boolean;
        maxHeight?: string;       // Scrollable body
        emptyMessage?: string;
        class?: string;
    };

    let {
        data,
        columns,
        caption = '',
        density = 'default',
        striped = false,
        hoverable = true,
        bordered = false,
        stickyHeader = false,
        maxHeight,
        emptyMessage = 'No data available',
        class: className = '',
    }: Props<T> = $props();

    const densityPad = $derived({
        compact: 'px-2 py-1.5',
        default: 'px-3 py-2',
        spacious: 'px-4 py-3',
    }[density]);
</script>
```

### Markup Structure

```svelte
<div class="brutal-border bg-surface shadow-md overflow-hidden {className}">
    {#if $$slots.toolbar}
        <div class="flex items-center justify-between px-3 py-2 border-b-3 border-brutal bg-surface">
            {@render toolbar()}
        </div>
    {/if}

    <div class={maxHeight ? `overflow-auto` : ''} style={maxHeight ? `max-height: ${maxHeight}` : ''}>
        <table class="w-full border-collapse" role="grid">
            {#if caption}
                <caption class="sr-only">{caption}</caption>
            {/if}

            <thead class={stickyHeader ? 'sticky top-0 z-10' : ''}>
                <tr class="border-b-3 border-brutal bg-surface">
                    {#each columns as col}
                        <th
                            class="{densityPad} text-xs font-bold uppercase tracking-wider text-text-muted text-{col.align ?? 'left'} whitespace-nowrap"
                            scope="col"
                        >
                            {col.label}
                        </th>
                    {/each}
                </tr>
            </thead>

            <tbody>
                {#each data as row, i}
                    <tr
                        class="border-b border-border-light {striped && i % 2 ? 'bg-surface-hover/50' : ''} {hoverable ? 'hover:bg-surface-hover' : ''} transition-colors duration-100"
                    >
                        {#each columns as col}
                            <td
                                class="{densityPad} text-sm {col.mono ? 'font-mono' : ''} text-{col.align ?? 'left'} {bordered ? 'border-r border-border-light last:border-r-0' : ''}"
                            >
                                {#if col.snippet}
                                    {@render col.snippet(row)}
                                {:else if col.format}
                                    {col.format(row[col.key], row)}
                                {:else}
                                    {row[col.key] ?? '—'}
                                {/if}
                            </td>
                        {/each}
                    </tr>
                {/each}

                {#if data.length === 0}
                    <tr>
                        <td colspan={columns.length} class="px-4 py-12 text-center text-sm text-text-muted italic">
                            {emptyMessage}
                        </td>
                    </tr>
                {/if}
            </tbody>
        </table>
    </div>

    {#if $$slots.footer}
        <div class="flex items-center justify-between px-3 py-2 border-t-3 border-brutal bg-surface">
            {@render footer()}
        </div>
    {/if}
</div>
```

---

## Column Definition API <a id="column-definition"></a>

```typescript
// Recommended column definitions by data type
const columns = [
    // Text — left-aligned, default font
    { key: 'name', label: 'Name', sortable: true },

    // Numeric — right-aligned, mono font
    { key: 'hours', label: 'Hours', align: 'right', mono: true, sortable: true,
      format: (v) => v.toFixed(1) },

    // Currency — right-aligned, mono, formatted
    { key: 'cost', label: 'Cost', align: 'right', mono: true,
      format: (v) => `$${v.toLocaleString()}` },

    // Percentage — right-aligned, mono
    { key: 'confidence', label: 'Confidence', align: 'right', mono: true,
      format: (v) => `${v}%` },

    // Date — left-aligned, mono
    { key: 'created', label: 'Date', mono: true,
      format: (v) => new Date(v).toLocaleDateString() },

    // Status — center-aligned, badge snippet
    { key: 'status', label: 'Status', align: 'center',
      snippet: statusBadge },

    // ID/Code — left-aligned, mono, truncated
    { key: 'id', label: 'ID', mono: true, width: 'w-24',
      format: (v) => v.slice(0, 8) },

    // Actions — right-aligned, icon buttons
    { key: '_actions', label: '', align: 'right', srOnly: 'Actions',
      snippet: actionButtons },
];
```

---

## Sorting <a id="sorting"></a>

Client-side sorting with `$state` runes. Apply only when table has <500 rows.
For larger datasets, use server-side sorting via SvelteKit `load` with URL search params.

```svelte
<script lang="ts">
    let sortKey = $state<string | null>(null);
    let sortDir = $state<'asc' | 'desc'>('asc');

    const sorted = $derived.by(() => {
        if (!sortKey) return data;
        const col = columns.find(c => c.key === sortKey);
        return [...data].sort((a, b) => {
            const va = a[sortKey!], vb = b[sortKey!];
            if (va == null) return 1;
            if (vb == null) return -1;
            const cmp = typeof va === 'string' ? va.localeCompare(vb) : va - vb;
            return sortDir === 'asc' ? cmp : -cmp;
        });
    });

    function toggleSort(key: string) {
        if (sortKey === key) {
            sortDir = sortDir === 'asc' ? 'desc' : 'asc';
        } else {
            sortKey = key;
            sortDir = 'asc';
        }
    }
</script>

<!-- Sortable header -->
<th>
    {#if col.sortable}
        <button
            class="inline-flex items-center gap-1 hover:text-primary transition-colors group"
            onclick={() => toggleSort(col.key)}
            aria-sort={sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
        >
            {col.label}
            <span class="text-[10px] {sortKey === col.key ? 'text-primary' : 'text-text-muted opacity-0 group-hover:opacity-100'}">
                {sortKey === col.key ? (sortDir === 'asc' ? '▲' : '▼') : '▲'}
            </span>
        </button>
    {:else}
        {col.label}
    {/if}
</th>
```

---

## Filtering & Search <a id="filtering"></a>

### Global Search

```svelte
<script lang="ts">
    let search = $state('');
    const searchableKeys = columns.filter(c => !c.mono || c.key === 'id').map(c => c.key);

    const filtered = $derived.by(() => {
        if (!search.trim()) return data;
        const q = search.toLowerCase();
        return data.filter(row =>
            searchableKeys.some(k => String(row[k] ?? '').toLowerCase().includes(q))
        );
    });
</script>

<!-- Search input — brutalist style -->
<input
    type="search"
    bind:value={search}
    placeholder="Search..."
    class="px-3 py-1.5 text-sm border-2 border-brutal bg-surface placeholder:text-text-muted
           focus:outline-none focus:border-primary focus:shadow-sm transition-shadow"
/>
```

### Column Filters (Faceted)

```svelte
<script lang="ts">
    let filters = $state<Record<string, Set<string>>>({});

    const facets = $derived.by(() => {
        const result: Record<string, Map<string, number>> = {};
        for (const col of columns.filter(c => c.filterable)) {
            const counts = new Map<string, number>();
            for (const row of data) {
                const v = String(row[col.key] ?? '');
                counts.set(v, (counts.get(v) ?? 0) + 1);
            }
            result[col.key] = counts;
        }
        return result;
    });
</script>
```

---

## Pagination <a id="pagination"></a>

```svelte
<script lang="ts">
    let page = $state(0);
    let pageSize = $state(25);

    const totalPages = $derived(Math.ceil(filtered.length / pageSize));
    const paginated = $derived(filtered.slice(page * pageSize, (page + 1) * pageSize));

    // Reset page on filter change
    $effect(() => { filtered; page = 0; });
</script>

<!-- Pagination footer -->
{#snippet footer()}
    <div class="flex items-center justify-between w-full text-xs text-text-muted">
        <span class="font-mono">
            {page * pageSize + 1}–{Math.min((page + 1) * pageSize, filtered.length)}
            of {filtered.length}
        </span>

        <div class="flex items-center gap-1">
            <button
                onclick={() => page = 0}
                disabled={page === 0}
                class="px-2 py-1 border-2 border-brutal hover:bg-surface-hover disabled:opacity-30
                       disabled:cursor-not-allowed active:translate-x-[0.5px] active:translate-y-[0.5px]"
                aria-label="First page"
            >««</button>
            <button
                onclick={() => page--}
                disabled={page === 0}
                class="px-2 py-1 border-2 border-brutal hover:bg-surface-hover disabled:opacity-30
                       disabled:cursor-not-allowed"
                aria-label="Previous page"
            >«</button>

            <span class="px-2 font-mono font-bold">{page + 1} / {totalPages}</span>

            <button
                onclick={() => page++}
                disabled={page >= totalPages - 1}
                class="px-2 py-1 border-2 border-brutal hover:bg-surface-hover disabled:opacity-30
                       disabled:cursor-not-allowed"
                aria-label="Next page"
            >»</button>
            <button
                onclick={() => page = totalPages - 1}
                disabled={page >= totalPages - 1}
                class="px-2 py-1 border-2 border-brutal hover:bg-surface-hover disabled:opacity-30
                       disabled:cursor-not-allowed"
                aria-label="Last page"
            >»»</button>
        </div>

        <select
            bind:value={pageSize}
            class="px-2 py-1 text-xs border-2 border-brutal bg-surface font-mono"
        >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
        </select>
    </div>
{/snippet}
```

---

## Row Selection <a id="row-selection"></a>

```svelte
<script lang="ts">
    let selected = $state<Set<string>>(new Set());

    const allSelected = $derived(
        paginated.length > 0 && paginated.every(r => selected.has(r.id))
    );

    function toggleAll() {
        if (allSelected) {
            for (const r of paginated) selected.delete(r.id);
        } else {
            for (const r of paginated) selected.add(r.id);
        }
        selected = new Set(selected); // trigger reactivity
    }
</script>

<!-- Header checkbox -->
<th class="w-10 px-2">
    <input
        type="checkbox"
        checked={allSelected}
        onchange={toggleAll}
        class="accent-primary"
        aria-label="Select all rows"
    />
</th>

<!-- Row checkbox -->
<td class="w-10 px-2">
    <input
        type="checkbox"
        checked={selected.has(row.id)}
        onchange={() => {
            selected.has(row.id) ? selected.delete(row.id) : selected.add(row.id);
            selected = new Set(selected);
        }}
        aria-label="Select row"
    />
</td>
```

---

## Responsive Patterns <a id="responsive"></a>

### Priority-Based Column Hiding

```svelte
<!-- Column with priority -->
<th class="{col.priority === 3 ? 'hidden lg:table-cell' : col.priority === 2 ? 'hidden md:table-cell' : ''}">
```

### Card Layout on Mobile

```svelte
<!-- Switch to card layout under md breakpoint -->
<div class="md:hidden space-y-2">
    {#each paginated as row}
        <div class="brutal-border bg-surface p-3 shadow-sm">
            {#each columns as col}
                <div class="flex justify-between py-1 {col !== columns[columns.length-1] ? 'border-b border-border-light' : ''}">
                    <span class="text-xs font-bold uppercase tracking-wider text-text-muted">{col.label}</span>
                    <span class="text-sm {col.mono ? 'font-mono' : ''}">{col.format ? col.format(row[col.key], row) : row[col.key]}</span>
                </div>
            {/each}
        </div>
    {/each}
</div>

<!-- Regular table on md+ -->
<div class="hidden md:block">
    <table>...</table>
</div>
```

### Horizontal Scroll

```svelte
<div class="brutal-border overflow-hidden">
    <div class="overflow-x-auto">
        <table class="w-full min-w-[600px]">...</table>
    </div>
</div>
```

---

## Cell Renderers <a id="cell-renderers"></a>

### Badge Cell

```svelte
{#snippet statusBadge(row)}
    <span class="inline-flex px-2 py-0.5 text-xs font-bold uppercase tracking-wider border-2 border-brutal
        {row.status === 'complete' ? 'bg-success-light text-success' :
         row.status === 'warning' ? 'bg-warning-light text-warning' :
         row.status === 'error' ? 'bg-danger-light text-danger' :
         'bg-border-light text-text-muted'}">
        {row.status}
    </span>
{/snippet}
```

### Progress Cell

```svelte
{#snippet progressCell(row)}
    <div class="flex items-center gap-2">
        <div class="h-2 flex-1 bg-border-light border border-brutal">
            <div class="h-full bg-primary" style="width: {row.progress}%"></div>
        </div>
        <span class="text-xs font-mono w-8 text-right">{row.progress}%</span>
    </div>
{/snippet}
```

### Relative Time Cell

```svelte
{#snippet timeAgo(row)}
    <time datetime={row.updated} class="text-sm text-text-secondary" title={new Date(row.updated).toLocaleString()}>
        {formatRelative(row.updated)}
    </time>
{/snippet}
```

### Truncated Text with Tooltip

```svelte
{#snippet truncated(row)}
    <span class="block max-w-[200px] truncate" title={row.description}>
        {row.description}
    </span>
{/snippet}
```

---

## Empty & Loading States <a id="states"></a>

### Empty State

```svelte
<tr>
    <td colspan={columns.length} class="px-4 py-16 text-center">
        <div class="flex flex-col items-center gap-2">
            <svg class="w-8 h-8 text-text-muted" ...><!-- empty icon --></svg>
            <p class="text-sm text-text-muted">{emptyMessage}</p>
            {#if search}
                <button
                    onclick={() => search = ''}
                    class="text-xs font-bold text-primary hover:underline"
                >
                    Clear search
                </button>
            {/if}
        </div>
    </td>
</tr>
```

### Skeleton Loading

```svelte
{#each Array(pageSize) as _, i}
    <tr class="border-b border-border-light">
        {#each columns as col}
            <td class="{densityPad}">
                <div class="h-4 rounded bg-border-light animate-pulse"
                     style="width: {40 + Math.random() * 40}%"></div>
            </td>
        {/each}
    </tr>
{/each}
```

---

## Keyboard Navigation <a id="keyboard"></a>

```svelte
<script lang="ts">
    let focusedRow = $state(-1);

    function handleKeydown(e: KeyboardEvent) {
        const rows = paginated;
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                focusedRow = Math.min(focusedRow + 1, rows.length - 1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                focusedRow = Math.max(focusedRow - 1, 0);
                break;
            case 'Home':
                e.preventDefault();
                focusedRow = 0;
                break;
            case 'End':
                e.preventDefault();
                focusedRow = rows.length - 1;
                break;
            case ' ':
            case 'Enter':
                if (focusedRow >= 0) {
                    e.preventDefault();
                    // Toggle selection or trigger action
                }
                break;
        }
    }
</script>

<tbody onkeydown={handleKeydown}>
    {#each paginated as row, i}
        <tr
            tabindex={i === focusedRow ? 0 : -1}
            aria-selected={selected.has(row.id)}
            class="... {i === focusedRow ? 'outline-2 outline-primary -outline-offset-2' : ''}"
        >
```

---

## Toolbar Composition <a id="toolbar"></a>

```svelte
{#snippet toolbar()}
    <div class="flex items-center gap-2 flex-wrap">
        <!-- Search -->
        <input type="search" bind:value={search}
            placeholder="Search..."
            class="px-3 py-1.5 text-sm border-2 border-brutal bg-surface w-48
                   focus:outline-none focus:border-primary" />

        <!-- Filter chips -->
        {#each activeFilters as filter}
            <button
                class="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold
                       border-2 border-brutal bg-primary-light text-primary"
                onclick={() => removeFilter(filter)}
            >
                {filter.label} ✕
            </button>
        {/each}

        <div class="flex-1"></div>

        <!-- Row count -->
        <span class="text-xs font-mono text-text-muted">
            {filtered.length} row{filtered.length !== 1 ? 's' : ''}
        </span>

        <!-- Density toggle -->
        <div class="flex border-2 border-brutal">
            {#each ['compact', 'default', 'spacious'] as d}
                <button
                    class="px-2 py-1 text-xs {density === d ? 'bg-brutal text-white' : 'hover:bg-surface-hover'}"
                    onclick={() => density = d}
                >{d[0].toUpperCase()}</button>
            {/each}
        </div>
    </div>
{/snippet}
```

---

## Expandable Rows <a id="expandable"></a>

```svelte
<script lang="ts">
    let expanded = $state<Set<string>>(new Set());
</script>

<tr onclick={() => {
    expanded.has(row.id) ? expanded.delete(row.id) : expanded.add(row.id);
    expanded = new Set(expanded);
}}>
    <td class="w-8 px-2">
        <span class="inline-block transition-transform {expanded.has(row.id) ? 'rotate-90' : ''}">
            ▸
        </span>
    </td>
    <!-- ... other cells ... -->
</tr>

{#if expanded.has(row.id)}
    <tr class="bg-surface-hover/30">
        <td colspan={columns.length + 1} class="px-6 py-4 border-b border-border-light">
            <!-- Expanded content here -->
        </td>
    </tr>
{/if}
```
