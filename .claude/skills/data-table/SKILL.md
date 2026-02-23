---
name: data-table
description: >
  Expert data table engineer for SvelteKit + Tailwind CSS v4 apps using a neo-brutalist design
  system. Analyzes any data shape (arrays, objects, API responses, DB query results, CSV, JSON)
  and builds the optimal table presentation — deciding column types, alignment, formatting,
  density, sort/filter/pagination needs, responsive breakpoints, and accessibility.
  Use when: (1) Displaying data in a table or grid, (2) Building sortable/filterable data views,
  (3) Presenting API or DB results, (4) Adding pagination to lists, (5) Creating comparison
  tables or data grids, (6) Converting raw data into a readable table format,
  (7) Building responsive data displays that work on mobile.
  Triggers on: "show this as a table", "display this data", "build a data table",
  "add a table", "make this sortable", "paginate this list", "create a data grid",
  "format this as a table", "table component", "data view".
---

# Data Table Engineering

Build data tables for SvelteKit + Tailwind v4 with the MigrateIQ neo-brutalist design system.

## Decision Process

When given data to display, follow this sequence:

### 1. Analyze the Data Shape

Determine:
- **Row count**: <20 = static, 20-500 = client interactive, >500 = server-side
- **Column count**: <5 = simple, 5-10 = standard, >10 = needs column priority/hiding
- **Data types per column**: text, number, currency, percentage, date, status/enum, ID, boolean, nested object
- **Actions needed**: view, edit, delete, select, expand

### 2. Choose the Table Mode

| Scenario | Mode | Features |
|----------|------|----------|
| Static reference data (<20 rows) | **Static** | No JS, server-rendered `{#each}` |
| Interactive dataset (20-500 rows) | **Client** | `$state` sort/filter/page |
| Large dataset (>500 rows) | **Server** | URL params, `load()` pagination |
| Mobile-primary or narrow viewport | **Cards** | Stacked card layout, no `<table>` |
| Comparison (2-5 items side-by-side) | **Comparison** | Fixed first column, horizontal scroll |

### 3. Configure Columns

For each column, determine from the data:

| Data Type | Align | Font | Format | Width |
|-----------|-------|------|--------|-------|
| Text (names, descriptions) | left | sans | raw | flex |
| Numbers (counts, hours) | right | mono | `.toFixed()` or `.toLocaleString()` | fixed |
| Currency | right | mono | `$X,XXX` | fixed |
| Percentages | right | mono | `XX%` | `w-20` |
| Dates | left | mono | `toLocaleDateString()` or relative | `w-28` |
| Status / Enum | center | sans | Badge snippet | `w-24` |
| IDs / Codes | left | mono | truncate to 8 chars | `w-24` |
| Booleans | center | sans | checkmark/x icon | `w-12` |
| Actions | right | — | icon buttons | `w-20` |

### 4. Set Responsive Priority

- **Priority 1** (always visible): primary identifier, key metric, status
- **Priority 2** (md+): secondary metrics, dates
- **Priority 3** (lg+): IDs, notes, less critical data

Under `md` breakpoint with >5 columns, switch to card layout.

### 5. Add Interactivity

Only add what the data needs:
- **Sort**: if column has natural ordering and >5 rows
- **Search**: if >10 rows and text columns exist
- **Filter**: if enum/status columns with <10 distinct values
- **Pagination**: if >25 rows
- **Selection**: only if bulk actions exist
- **Expand**: only if rows have nested detail data

## Implementation Rules

1. **Server-first**: Default to zero-JS static tables. Only add `$state`/`$derived` when interactivity is required.
2. **Semantic HTML**: Always use `<table>`, `<thead>`, `<th scope="col">`, `<tbody>`, `<caption class="sr-only">`.
3. **No wrapper libraries**: Build with native Svelte 5 `{#each}`, `{#snippet}`, `$state`, `$derived`. No tanstack-table, no AG Grid.
4. **Design tokens**: Read [references/design-tokens.md](references/design-tokens.md) for exact CSS classes, colors, borders, shadows.
5. **Component patterns**: Read [references/component-patterns.md](references/component-patterns.md) for full Svelte 5 code patterns — sorting, filtering, pagination, keyboard nav, cell renderers, expandable rows, responsive layouts.
6. **Brutalist aesthetic**: 3px outer border (`brutal-border`), offset shadow (`shadow-md`), thick header divider (`border-b-3`), thin row dividers (`border-b border-border-light`), minimal rounding (4px).
7. **Typography**: Column headers = `text-xs font-bold uppercase tracking-wider text-text-muted`. Numbers always `font-mono`.
8. **Dark mode**: All classes use CSS custom properties — no hardcoded colors.
9. **Keyboard**: Sortable headers are `<button>` with `aria-sort`. Selectable rows use Arrow keys, Space/Enter. Focused row gets `outline-2 outline-primary`.
10. **Empty state**: Centered message with clear-filter action if search is active.

## Placement

- Table components specific to a domain: `apps/web/src/lib/components/` (e.g., `RiskTable.svelte`)
- Reusable table primitives: `apps/web/src/lib/components/ui/` (e.g., `DataTable.svelte`)
- Data loading: `+page.server.ts` loaders → pass to `+page.svelte` → pass to table component

## Anti-Patterns

- Never use `<div>` tables — always semantic `<table>` with proper roles
- Never install table libraries — build with native Svelte 5 patterns from references
- Never use `overflow-x-auto` without `min-w-[Xpx]` on the inner table
- Never hardcode colors — always use CSS custom property classes (`text-text`, `bg-surface`, `border-brutal`)
- Never add client JS for static data — `{#each}` with server `load()` data is enough
- Never skip `<caption>` — screen readers need it, use `class="sr-only"` to hide visually
