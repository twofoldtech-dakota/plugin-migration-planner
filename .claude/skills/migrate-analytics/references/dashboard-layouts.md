# Dashboard Layout Patterns

Composition patterns for building analytics dashboards in MigrateIQ's neo-brutalist design system.

## Table of Contents

- [Layout Hierarchy](#layout-hierarchy)
- [KPI Cards](#kpi-cards)
- [ChartCard Wrapper](#chartcard-wrapper)
- [Grid Patterns](#grid-patterns)
- [Dashboard Page Templates](#dashboard-page-templates)
- [Loading States](#loading-states)
- [Empty States](#empty-states)
- [Time Range Controls](#time-range-controls)
- [Responsive Breakpoints](#responsive-breakpoints)

---

## Layout Hierarchy

Dashboard pages follow a top-down information hierarchy:

```
┌──────────────────────────────────────────────────────────┐
│  Page Header (title + time range picker + filters)       │
├──────────────────────────────────────────────────────────┤
│  KPI Row (4 metric cards — key numbers at a glance)      │
├────────────────────────────┬─────────────────────────────┤
│  Primary Chart (2/3 width) │  Secondary Chart (1/3)      │
├────────────────────────────┴─────────────────────────────┤
│  Detail Row (table, ranked list, or small multiples)     │
└──────────────────────────────────────────────────────────┘
```

Rules:
1. Most important metrics at the top (KPI row)
2. Largest chart = most important trend/comparison
3. Supporting detail below fold
4. Max 6-8 visual elements per viewport to avoid cognitive overload

---

## KPI Cards

### Standard KPI Card

```svelte
<!-- KpiCard.svelte -->
<script lang="ts">
  import { format } from 'd3-format';

  type Props = {
    label: string;
    value: number;
    format?: 'number' | 'percent' | 'hours' | 'compact';
    delta?: number;          // change from previous period
    deltaLabel?: string;     // e.g. "vs last week"
    sparklineData?: number[];
  };

  let { label, value, format: fmt = 'number', delta, deltaLabel,
    sparklineData }: Props = $props();

  const formatters: Record<string, (n: number) => string> = {
    number: format(',.0f'),
    percent: (n) => `${format('.0f')(n)}%`,
    hours: (n) => `${format(',.0f')(n)}h`,
    compact: format('.2s'),
  };

  let formatted = $derived(formatters[fmt](value));
  let deltaFormatted = $derived(delta != null ? format('+.1f')(delta) : null);
  let deltaColor = $derived(
    delta == null ? '' :
    delta > 0 ? 'text-success' :
    delta < 0 ? 'text-danger' : 'text-text-muted'
  );
</script>

<div class="brutal-border bg-surface shadow-sm p-4">
  <div class="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
    {label}
  </div>
  <div class="flex items-end gap-3">
    <span class="text-2xl font-extrabold font-mono text-text">
      {formatted}
    </span>
    {#if deltaFormatted != null}
      <span class="text-xs font-mono {deltaColor} mb-0.5">
        {deltaFormatted}
        {#if deltaLabel}
          <span class="text-text-muted font-sans"> {deltaLabel}</span>
        {/if}
      </span>
    {/if}
  </div>
  {#if sparklineData?.length}
    <div class="mt-2 h-6">
      <!-- Inline sparkline via composed Sparkline component -->
      <Sparkline data={sparklineData} />
    </div>
  {/if}
</div>
```

### KPI Row

```svelte
<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
  <KpiCard label="Total Assessments" value={42} delta={3} deltaLabel="this week" />
  <KpiCard label="Avg Confidence" value={68} format="percent" delta={4.2}
    sparklineData={confidenceTrend} />
  <KpiCard label="Total Hours" value={12400} format="hours" delta={-800} />
  <KpiCard label="Events Today" value={1847} format="compact" />
</div>
```

---

## ChartCard Wrapper

Standard card wrapper for any chart component:

```svelte
<!-- ChartCard.svelte -->
<script lang="ts">
  type Props = {
    title: string;
    subtitle?: string;
    height?: string;       // Tailwind height class, default 'h-64'
    class?: string;
    loading?: boolean;
    empty?: boolean;
    emptyMessage?: string;
  };

  let { title, subtitle, height = 'h-64', class: cls = '',
    loading = false, empty = false, emptyMessage = 'No data available',
    children }: Props & { children?: any } = $props();
</script>

<div class="brutal-border bg-surface shadow-md p-4 {cls}">
  <div class="flex items-center justify-between mb-3">
    <div>
      <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted">
        {title}
      </h3>
      {#if subtitle}
        <p class="text-[10px] text-text-muted mt-0.5">{subtitle}</p>
      {/if}
    </div>
    <!-- Slot for chart controls (filters, export button) -->
    {@render controls?.()}
  </div>

  {#if loading}
    <div class="{height} flex items-center justify-center">
      <div class="animate-pulse text-text-muted text-sm">Loading...</div>
    </div>
  {:else if empty}
    <div class="{height} flex items-center justify-center">
      <p class="text-sm text-text-muted">{emptyMessage}</p>
    </div>
  {:else}
    <div class={height}>
      {@render children?.()}
    </div>
  {/if}
</div>
```

---

## Grid Patterns

### Two-Column Split (Primary + Secondary)

```svelte
<div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
  <ChartCard title="Confidence Trend" class="lg:col-span-2" height="h-72">
    <ConfidenceTrendChart {data} />
  </ChartCard>
  <ChartCard title="Risk Breakdown" height="h-72">
    <RiskDonutChart {data} />
  </ChartCard>
</div>
```

### Equal Three-Column

```svelte
<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
  <ChartCard title="Discovery" height="h-48">
    <ProgressGauge value={discoveryPct} />
  </ChartCard>
  <ChartCard title="Assumptions" height="h-48">
    <AssumptionDonut {data} />
  </ChartCard>
  <ChartCard title="Risks" height="h-48">
    <RiskSeverityBars {data} />
  </ChartCard>
</div>
```

### Full-Width Detail

```svelte
<ChartCard title="Estimate Breakdown by Phase" height="h-96" class="mb-6">
  <PhaseStackedBarChart {data} />
</ChartCard>
```

### Small Multiples Grid

```svelte
<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
  {#each assessments as assessment}
    <ChartCard title={assessment.name} height="h-32">
      <Sparkline data={assessment.confidenceHistory} />
    </ChartCard>
  {/each}
</div>
```

---

## Dashboard Page Templates

### Analytics Overview (`/analytics`)

```svelte
<!-- Top controls -->
<div class="flex items-center justify-between mb-6">
  <h1 class="text-xl font-bold text-text">Analytics</h1>
  <TimeRangePicker bind:range={timeRange} />
</div>

<!-- KPI row -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
  <KpiCard label="Page Views" value={stats.pageViews} format="compact"
    delta={stats.pageViewsDelta} deltaLabel="vs prev period" />
  <KpiCard label="Unique Sessions" value={stats.sessions} format="compact" />
  <KpiCard label="Avg Session" value={stats.avgDuration} format="number" />
  <KpiCard label="Events" value={stats.totalEvents} format="compact" />
</div>

<!-- Primary charts -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
  <ChartCard title="Traffic Over Time" height="h-72">
    <LineChart data={trafficData} x="date" y="views" showArea />
  </ChartCard>
  <ChartCard title="Events by Category" height="h-72">
    <BarChart data={categoryData} x="count" y="category" />
  </ChartCard>
</div>

<!-- Detail -->
<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <ChartCard title="Top Pages" class="lg:col-span-2" height="h-80">
    <TopPagesTable data={topPages} />
  </ChartCard>
  <ChartCard title="Workflow Funnel" height="h-80">
    <FunnelChart data={funnelData} />
  </ChartCard>
</div>
```

### Confidence Dashboard (`/analytics/confidence`)

```svelte
<!-- KPI row -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
  <KpiCard label="Portfolio Avg" value={avgConfidence} format="percent"
    sparklineData={avgTrend} />
  <KpiCard label="Highest" value={maxConfidence} format="percent" />
  <KpiCard label="Lowest" value={minConfidence} format="percent" />
  <KpiCard label="Active Assessments" value={activeCount} />
</div>

<!-- Main trend -->
<ChartCard title="Portfolio Confidence Trend" height="h-80" class="mb-6">
  <MultilineChart data={allAssessmentTrends} x="date" y="score" z="project" />
</ChartCard>

<!-- Per-assessment grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {#each assessments as a}
    <ChartCard title={a.name} subtitle="{a.confidence}% confidence" height="h-40">
      <LineChart data={a.history} x="version" y="score"
        yDomain={[0, 100]} color={confidenceColor(a.confidence)} showArea />
    </ChartCard>
  {/each}
</div>
```

### Estimate Analytics (`/analytics/estimates`)

```svelte
<!-- KPI row -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
  <KpiCard label="Total Hours" value={totalHours} format="hours" />
  <KpiCard label="Avg per Project" value={avgHoursPerProject} format="hours" />
  <KpiCard label="AI Savings" value={aiSavingsPercent} format="percent" />
  <KpiCard label="Projects Estimated" value={estimatedCount} />
</div>

<!-- Charts -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
  <ChartCard title="Hours by Phase" height="h-72">
    <StackedBarChart data={phaseData} />
  </ChartCard>
  <ChartCard title="Hours by Role" height="h-72">
    <DonutChart data={roleData} innerRadius={0.55} />
  </ChartCard>
</div>

<ChartCard title="Scenario Comparison" height="h-64">
  <GroupedColumnChart data={scenarioData}
    groups={['Manual', 'AI-Assisted', 'Best Case']} />
</ChartCard>
```

---

## Loading States

### Skeleton Chart

```svelte
<div class="{height} animate-pulse">
  <div class="h-full rounded bg-surface-hover flex items-end gap-1 p-4">
    {#each Array(6) as _, i}
      <div class="flex-1 bg-border-light rounded-t"
        style="height: {20 + Math.random() * 60}%"></div>
    {/each}
  </div>
</div>
```

### Progressive Loading

Load KPI cards first (fast query), then charts (heavier queries):

```ts
// +page.server.ts
export const load = async ({ depends }) => {
  depends('analytics:data');

  // Fast: return KPIs immediately
  const kpis = await getKpiStats();

  // Deferred: charts load after page renders
  const chartData = getChartData(); // returns Promise, not awaited

  return {
    kpis,
    streamed: { chartData },
  };
};
```

```svelte
<!-- +page.svelte -->
{#await data.streamed.chartData}
  <ChartCard title="Trend" loading={true} />
{:then chartData}
  <ChartCard title="Trend">
    <LineChart data={chartData} ... />
  </ChartCard>
{/await}
```

---

## Empty States

When no data exists yet:

```svelte
<ChartCard title="Confidence Trend" empty={data.length === 0}
  emptyMessage="Run your first estimate to see confidence trends">
  <LineChart {data} ... />
</ChartCard>
```

For the full analytics page with no data:

```svelte
<div class="brutal-border bg-surface shadow-md p-12 text-center">
  <div class="text-4xl mb-4">📊</div>
  <h2 class="text-lg font-bold text-text mb-2">No Analytics Data Yet</h2>
  <p class="text-sm text-text-secondary mb-4">
    Start using MigrateIQ to see analytics appear here.
    Page views, workflow progress, and assessment metrics
    are tracked automatically.
  </p>
  <a href="/new" class="inline-block brutal-border bg-primary text-white
    px-4 py-2 shadow-sm hover:shadow-md transition-shadow font-semibold text-sm">
    Create Assessment
  </a>
</div>
```

---

## Time Range Controls

### TimeRangePicker Component

```svelte
<!-- TimeRangePicker.svelte -->
<script lang="ts">
  let { range = $bindable('7d') }: { range: string } = $props();

  const options = [
    { value: '24h', label: '24h' },
    { value: '7d', label: '7d' },
    { value: '30d', label: '30d' },
    { value: '90d', label: '90d' },
    { value: 'all', label: 'All' },
  ];
</script>

<div class="flex brutal-border-thin overflow-hidden">
  {#each options as opt}
    <button
      class="px-3 py-1.5 text-xs font-mono font-bold uppercase
        {range === opt.value
          ? 'bg-brutal text-white'
          : 'bg-surface text-text-secondary hover:bg-surface-hover'}
        transition-colors"
      onclick={() => range = opt.value}>
      {opt.label}
    </button>
  {/each}
</div>
```

---

## Responsive Breakpoints

| Breakpoint | Layout |
|-----------|--------|
| `< 640px` (mobile) | Single column, KPIs in 2-col grid, charts stacked |
| `640-1023px` (tablet) | KPIs in 2-col, charts in 2-col where possible |
| `1024px+` (desktop) | Full grid: 4-col KPIs, 2-3 col chart rows |

All grids use `grid-cols-1` as base with `md:` and `lg:` overrides:

```svelte
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

Charts should have minimum heights to prevent content squishing:
- Sparkline: `h-6` to `h-8`
- KPI sparkline: `h-6`
- Small chart: `h-32` to `h-48`
- Standard chart: `h-64`
- Primary chart: `h-72` to `h-80`
- Detail chart: `h-96`
