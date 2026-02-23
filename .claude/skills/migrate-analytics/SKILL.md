---
name: migrate-analytics
description: >
  Expert analytics and data visualization engineer for the MigrateIQ SvelteKit app.
  Builds charts, dashboards, and analytics tracking using LayerCake + custom SVG
  with the neo-brutalist design system (3px borders, offset shadows, Inter + JetBrains Mono,
  brand color #4f46e5). Use when: (1) Adding any chart or visualization, (2) Building
  analytics dashboards or data displays, (3) Choosing which chart type to use for a
  dataset, (4) Adding event tracking or user behavior analytics, (5) Creating sparklines,
  gauges, or KPI cards, (6) Optimizing chart performance or accessibility.
  Triggers on: "add a chart", "build analytics", "visualize this data", "track events",
  "create a dashboard", "which chart should I use", "add metrics", "show trends".
---

# Analytics & Charting — MigrateIQ

## Stack

- **Charting**: LayerCake 10.x + custom SVG components (Svelte 5 runes)
- **Scales**: d3-scale, d3-shape, d3-array, d3-format, d3-time-format, d3-delaunay
- **Framework**: SvelteKit, TypeScript, Tailwind CSS v4
- **Design**: Neo-brutalist — `brutal-border`, offset shadows, brand palette
- **Data**: MCP server → PostgreSQL → SvelteKit server loaders → components

## Chart Selection — Pick the Right Viz

Before building, determine the **analytical goal**, then select the chart type:

| Goal | Use | Never Use |
|------|-----|-----------|
| Compare categories | Bar (horiz), Column (vert) | Pie (>3 items) |
| Show trend over time | Line, Area | Bar (implies discrete) |
| Part-to-whole | Stacked bar, Donut (2-5 segments) | Pie (>5 segments) |
| Distribution | Histogram, Box plot | Bar (implies categories) |
| Correlation | Scatter, Bubble | Line (implies time sequence) |
| Rank ordered items | Horizontal bar | Pie, Radar |
| Multi-dimensional profile | Radar (3-8 axes) | Separate charts |
| KPI / single metric | Gauge, Big number + sparkline | Full chart |
| Progress / completion | Progress bar, Gauge | Pie |
| Flow / relationships | Sankey | Stacked bar |

For full decision tree with MigrateIQ-specific recommendations → read [chart-selection-guide.md](references/chart-selection-guide.md)

## LayerCake Quick Reference

### Setup Pattern

```svelte
<script lang="ts">
  import { LayerCake, Svg, Html } from 'layercake';
  import Line from './Line.svelte';
  import AxisX from './AxisX.svelte';
  import AxisY from './AxisY.svelte';
  import Tooltip from './Tooltip.svelte';

  let { data }: { data: DataPoint[] } = $props();
</script>

<div class="chart-container h-64 w-full">
  <LayerCake padding={{ top: 8, right: 10, bottom: 20, left: 25 }}
    x="date" y="value" yDomain={[0, null]} {data}>
    <Svg>
      <AxisX />
      <AxisY ticks={4} />
      <Line stroke="var(--color-primary)" />
    </Svg>
    <Html>
      <Tooltip />
    </Html>
  </LayerCake>
</div>
```

### Child Component Pattern (Svelte 5 runes)

```svelte
<script lang="ts">
  import { getContext } from 'svelte';
  const { data, xGet, yGet } = getContext('LayerCake');
  let { stroke = 'var(--color-primary)' } = $props();

  let path = $derived(
    'M' + $data.map((d: any) => `${$xGet(d)},${$yGet(d)}`).join('L')
  );
</script>

<path d={path} fill="none" {stroke} stroke-width="2"
  stroke-linejoin="round" stroke-linecap="round" />
```

For all chart primitives (line, area, bar, column, scatter, pie, donut, radar, stacked variants, axes, tooltips, multiline, canvas rendering, SSR, animations) → read [layercake-patterns.md](references/layercake-patterns.md)

## Design System Integration

### Chart Container (brutal card wrapper)

```svelte
<div class="brutal-border bg-surface shadow-md p-4">
  <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
    {title}
  </h3>
  <div class="h-64">
    <LayerCake ...><!-- chart layers --></LayerCake>
  </div>
</div>
```

### Color Tokens for Charts

Use CSS custom properties (not hardcoded hex) so dark mode works:

| Token | Usage |
|-------|-------|
| `var(--color-primary)` | Primary data series, interactive elements |
| `var(--color-success)` | Positive trends, validated, complete |
| `var(--color-warning)` | Caution states, assumptions, medium risk |
| `var(--color-danger)` | Negative trends, errors, high risk |
| `var(--color-info)` | Informational, discovery, neutral series |
| `var(--color-text-muted)` | Axis labels, gridlines, annotations |
| `var(--color-border-light)` | Gridlines, subtle dividers |

### Categorical Palette (multi-series, no semantic meaning)

```ts
const CHART_PALETTE = [
  'var(--color-primary)',    // #4f46e5 indigo
  'var(--color-success)',    // #16a34a green
  'var(--color-warning)',    // #ea580c orange
  'var(--color-danger)',     // #dc2626 red
  'var(--color-info)',       // #2563eb blue
  '#7c3aed',                // violet
  '#0891b2',                // cyan
  '#ca8a04',                // amber
];
```

### Typography in Charts

- Axis labels: `font-family: var(--font-sans); font-size: 10px; fill: var(--color-text-muted)`
- Data values: `font-family: var(--font-mono); font-weight: 700`
- Tooltip title: `font-family: var(--font-sans); font-size: 12px; font-weight: 600`
- Tooltip values: `font-family: var(--font-mono); font-size: 12px`

### Tooltip Styling (HTML layer)

```svelte
<div class="brutal-border bg-surface shadow-sm px-3 py-2 text-xs
  pointer-events-none absolute -translate-x-1/2"
  style="left:{x}px; top:{y - 10}px;">
  <div class="font-semibold text-text">{label}</div>
  <div class="font-mono text-text-secondary">{value}</div>
</div>
```

## Event Tracking System

### Architecture

```
User Action → trackEvent() → eventStore (in-memory buffer)
                                  ↓ flush every 30s or on page leave
                              /api/analytics/events (POST)
                                  ↓
                              PostgreSQL analytics_events table
```

### Core API

```ts
// $lib/utils/analytics.ts
trackEvent(event: string, category: EventCategory, properties?: Record<string, string | number | boolean>): void
trackPageView(path: string, assessmentId?: string): void
trackTiming(label: string, durationMs: number): void
trackError(error: string, context?: string): void
```

**Categories**: `navigation`, `interaction`, `workflow`, `chart`, `system`

### Layout Integration

```ts
// +layout.svelte
$effect(() => {
  trackPageView($page.url.pathname, $page.params?.id);
});
```

For full event taxonomy, DB schema, API endpoints, and aggregation queries → read [event-schema.md](references/event-schema.md)

## Dashboard Composition

### Layout Hierarchy

```
Page Header (title + time range picker)
  → KPI Row (4 metric cards)
    → Primary Charts (2-col, largest = most important)
      → Detail Section (table, ranked list, small multiples)
```

### KPI Card Pattern

```svelte
<div class="brutal-border bg-surface shadow-sm p-4">
  <div class="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
    {label}
  </div>
  <div class="flex items-end gap-3">
    <span class="text-2xl font-extrabold font-mono text-text">{formatted}</span>
    <span class="text-xs font-mono {deltaColor} mb-0.5">{delta}</span>
  </div>
</div>
```

### Grid Pattern

```svelte
<!-- KPIs: 4-col -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">...</div>
<!-- Primary: 2/3 + 1/3 -->
<div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
  <ChartCard class="lg:col-span-2">...</ChartCard>
  <ChartCard>...</ChartCard>
</div>
<!-- Detail: table + small chart -->
<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">...</div>
```

For full dashboard templates, loading states, empty states, time range picker, responsive breakpoints → read [dashboard-layouts.md](references/dashboard-layouts.md)

## Accessibility Checklist

Every chart MUST:
- [ ] Use `role="img"` on SVG container with `aria-label`
- [ ] Include `<title>` via LayerCake's `title` snippet
- [ ] Never rely on color alone — add patterns, labels, or shapes
- [ ] Maintain 3:1 contrast for data elements, 4.5:1 for text
- [ ] Respect `prefers-reduced-motion` — disable transitions
- [ ] Provide data table alternative (toggle or screen reader)

## Performance Rules

1. **SSR first** — `<LayerCake ssr percentRange>` + `<ScaledSvg>` for initial paint
2. **Canvas for >500 points** — use `<Canvas>` layer for scatter/line with many data points
3. **Lazy load below-fold** — intersection observer for charts not in viewport
4. **Use `$derived`** for path calculations — not `$effect`
5. **Limit DOM** — aggregate data before rendering, never 10k+ SVG elements

## File Organization

```
src/lib/components/charts/
├── primitives/          # LayerCake child components (AxisX, Line, Bar, etc.)
├── composed/            # Full chart wrappers (LineChart, BarChart, DonutChart)
├── widgets/             # Dashboard wrappers (ChartCard, KpiCard, Sparkline)
└── index.ts             # Barrel exports

src/routes/analytics/
├── +page.svelte         # Overview dashboard
├── confidence/          # Confidence trends (exists)
├── events/              # Event tracking dashboard
├── usage/               # Feature usage & pages
└── estimates/           # Estimate accuracy & trends

src/lib/utils/analytics.ts  # Event tracker (trackEvent, trackPageView, flush)
src/routes/api/analytics/   # Event ingestion + summary endpoints
```
