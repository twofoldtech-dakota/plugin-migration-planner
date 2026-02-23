# LayerCake Component Patterns

Complete reference for building chart components with LayerCake 10.x + Svelte 5 runes in MigrateIQ's neo-brutalist design system.

## Table of Contents

- [Installation](#installation)
- [Core Concepts](#core-concepts)
- [Primitives](#primitives)
  - [AxisX](#axisx)
  - [AxisY](#axisy)
  - [Line](#line)
  - [Area](#area)
  - [Bar (Horizontal)](#bar-horizontal)
  - [Column (Vertical)](#column-vertical)
  - [Scatter](#scatter)
  - [Pie / Donut](#pie--donut)
  - [Radar](#radar)
  - [BarStacked](#barstacked)
  - [ColumnStacked](#columnstacked)
  - [AreaStacked](#areastacked)
- [Tooltips](#tooltips)
  - [QuadTree (nearest-point)](#quadtree)
  - [Direct Element Events](#direct-element-events)
  - [Voronoi (proximity cells)](#voronoi)
- [Multiline Charts](#multiline-charts)
- [Stacking Data](#stacking-data)
- [Animations](#animations)
- [SSR Rendering](#ssr-rendering)
- [Canvas Rendering (large datasets)](#canvas-rendering)
- [Composed Chart Pattern](#composed-chart-pattern)

---

## Installation

```bash
npm install layercake d3-scale d3-shape d3-array d3-format d3-time-format d3-delaunay
```

No SvelteKit config changes needed. LayerCake is a standard Svelte component library.

## Core Concepts

**LayerCake is headless.** It provides:
- Reactive container dimensions (ResizeObserver)
- D3 scale management (domain/range auto-calculation)
- Accessor functions (`x`, `y`, `z`, `r`) bound to data fields
- Combined accessor+scale shortcuts (`xGet`, `yGet`, `zGet`, `rGet`)
- Layout containers: `<Svg>`, `<Html>`, `<Canvas>`, `<WebGL>`

You write the actual marks (paths, rects, circles) in child components.

### Context API

Every child component accesses the LayerCake context:

```svelte
<script lang="ts">
  import { getContext } from 'svelte';
  const { data, xGet, yGet, xScale, yScale, width, height } = getContext('LayerCake');
  // All values are Svelte stores — prefix with $ in templates/derived
</script>
```

Key context stores:
- `$data` — the data array
- `$xGet(d)`, `$yGet(d)` — combined accessor+scale (most used)
- `$xScale`, `$yScale` — raw D3 scale functions
- `$width`, `$height` — drawable area (after padding)
- `$x(d)`, `$y(d)` — raw accessor functions (before scaling)
- `$extents` — computed min/max for each dimension

---

## Primitives

### AxisX

```svelte
<script lang="ts">
  import { getContext } from 'svelte';
  const { width, height, xScale } = getContext('LayerCake');

  let { ticks = 4, format = String, gridlines = true, baseline = false } = $props();

  let tickVals = $derived(
    typeof $xScale.ticks === 'function'
      ? $xScale.ticks(ticks)
      : $xScale.domain()
  );
</script>

<g class="axis x-axis" transform="translate(0, {$height})">
  {#each tickVals as tick}
    {@const x = $xScale(tick)}
    {#if gridlines}
      <line x1={x} x2={x} y1={0} y2={-$height}
        stroke="var(--color-border-light)" stroke-dasharray="2,2" />
    {/if}
    <text x={x} y={16} text-anchor="middle"
      font-family="var(--font-sans)" font-size="10"
      fill="var(--color-text-muted)" text-transform="uppercase"
      letter-spacing="0.05em">
      {format(tick)}
    </text>
  {/each}
  {#if baseline}
    <line x1={0} x2={$width} y1={0} y2={0}
      stroke="var(--color-border-light)" />
  {/if}
</g>
```

### AxisY

```svelte
<script lang="ts">
  import { getContext } from 'svelte';
  const { height, yScale } = getContext('LayerCake');

  let { ticks = 4, format = String, gridlines = true } = $props();

  let tickVals = $derived(
    typeof $yScale.ticks === 'function'
      ? $yScale.ticks(ticks)
      : $yScale.domain()
  );
</script>

<g class="axis y-axis">
  {#each tickVals as tick}
    {@const y = $yScale(tick)}
    {#if gridlines}
      <line x1={0} x2={$width} y1={y} y2={y}
        stroke="var(--color-border-light)" stroke-dasharray="2,2" />
    {/if}
    <text x={-8} y={y} dy="0.35em" text-anchor="end"
      font-family="var(--font-mono)" font-size="10"
      fill="var(--color-text-muted)">
      {format(tick)}
    </text>
  {/each}
</g>
```

### Line

```svelte
<script lang="ts">
  import { getContext } from 'svelte';
  const { data, xGet, yGet } = getContext('LayerCake');

  let { stroke = 'var(--color-primary)', strokeWidth = 2 } = $props();

  let path = $derived(
    'M' + $data.map((d: any) => `${$xGet(d)},${$yGet(d)}`).join('L')
  );
</script>

<path d={path} fill="none" {stroke} stroke-width={strokeWidth}
  stroke-linejoin="round" stroke-linecap="round" />
```

### Area

```svelte
<script lang="ts">
  import { getContext } from 'svelte';
  const { data, xGet, yGet, xScale, yScale, extents } = getContext('LayerCake');

  let { fill = 'var(--color-primary)', opacity = 0.1 } = $props();

  let path = $derived.by(() => {
    const d = $data;
    if (!d.length) return '';
    const yRange = $yScale.range();
    const baseline = yRange[0]; // bottom of chart
    const points = d.map((pt: any) => `${$xGet(pt)},${$yGet(pt)}`).join('L');
    return `M${points}L${$xGet(d[d.length - 1])},${baseline}L${$xGet(d[0])},${baseline}Z`;
  });
</script>

<path d={path} {fill} fill-opacity={opacity} stroke="none" />
```

### Bar (Horizontal)

```svelte
<script lang="ts">
  import { getContext } from 'svelte';
  const { data, xGet, yGet, xScale, yScale } = getContext('LayerCake');

  let { fill = 'var(--color-primary)', radius = 2 } = $props();
</script>

<g class="bar-group">
  {#each $data as d}
    {@const w = $xGet(d)}
    {@const y = $yGet(d)}
    {@const h = $yScale.bandwidth()}
    <rect x={0} {y} width={w} height={h} {fill} rx={radius} />
  {/each}
</g>
```

Requires `yScale={scaleBand().paddingInner(0.05)}` on LayerCake.

### Column (Vertical)

```svelte
<script lang="ts">
  import { getContext } from 'svelte';
  const { data, xGet, yGet, xScale, height } = getContext('LayerCake');

  let { fill = 'var(--color-primary)', radius = 2 } = $props();
</script>

<g class="column-group">
  {#each $data as d}
    {@const x = $xGet(d)}
    {@const y = $yGet(d)}
    {@const w = $xScale.bandwidth()}
    {@const h = $height - y}
    <rect {x} {y} width={w} height={h} {fill} rx={radius} />
  {/each}
</g>
```

Requires `xScale={scaleBand().paddingInner(0.1)}` on LayerCake.

### Scatter

```svelte
<script lang="ts">
  import { getContext } from 'svelte';
  const { data, xGet, yGet, rGet } = getContext('LayerCake');

  let { fill = 'var(--color-primary)', r = 4, stroke = 'var(--color-brutal)',
    strokeWidth = 1.5 } = $props();
</script>

<g class="scatter-group">
  {#each $data as d}
    <circle cx={$xGet(d)} cy={$yGet(d)} r={$rGet ? $rGet(d) : r}
      {fill} {stroke} stroke-width={strokeWidth} />
  {/each}
</g>
```

### Pie / Donut

```svelte
<script lang="ts">
  import { getContext } from 'svelte';
  import { pie, arc } from 'd3-shape';

  const { data, width, height } = getContext('LayerCake');

  let { innerRadius = 0, colors = ['var(--color-primary)', 'var(--color-success)',
    'var(--color-warning)', 'var(--color-danger)', 'var(--color-info)'],
    valueKey = 'value' } = $props();

  let pieGen = $derived(pie().value((d: any) => d[valueKey]).sort(null));
  let radius = $derived(Math.min($width, $height) / 2);
  let arcGen = $derived(
    arc().innerRadius(innerRadius * radius).outerRadius(radius - 2)
  );
  let arcs = $derived(pieGen($data));
</script>

<g transform="translate({$width / 2}, {$height / 2})">
  {#each arcs as slice, i}
    <path d={arcGen(slice)} fill={colors[i % colors.length]}
      stroke="var(--color-surface)" stroke-width="2" />
  {/each}
</g>
```

Use `innerRadius={0.55}` for donut. Use `innerRadius={0}` for pie.

### Radar

```svelte
<script lang="ts">
  import { getContext } from 'svelte';

  const { data, xGet, config } = getContext('LayerCake');

  let { fill = 'var(--color-primary)', fillOpacity = 0.15,
    stroke = 'var(--color-primary)', strokeWidth = 2 } = $props();

  // xKey is the array of dimension names passed to LayerCake x prop
  let xKey: string[] = $derived($config.x);

  let points = $derived.by(() => {
    const d = $data[0]; // single data object
    if (!d) return '';
    const total = xKey.length;
    const angleSlice = (Math.PI * 2) / total;
    return xKey.map((key, i) => {
      const val = $xGet(d); // returns array when x is array
      const r = Array.isArray(val) ? val[i] : val;
      const angle = angleSlice * i - Math.PI / 2;
      return `${r * Math.cos(angle)},${r * Math.sin(angle)}`;
    }).join(' ');
  });
</script>

<polygon {points} {fill} fill-opacity={fillOpacity}
  {stroke} stroke-width={strokeWidth} stroke-linejoin="round" />
```

Requires `xRange={({ height }) => [0, height / 2]}` on LayerCake.

### BarStacked

```svelte
<script lang="ts">
  import { getContext } from 'svelte';
  const { data, xGet, yGet, zGet, yScale } = getContext('LayerCake');

  let { radius = 0 } = $props();
</script>

<g class="bar-stacked-group">
  {#each $data as series}
    {#each series as d}
      {@const xVals = $xGet(d)}
      <rect
        x={xVals[0]}
        y={$yGet(d)}
        height={$yScale.bandwidth()}
        width={Math.max(0, xVals[1] - xVals[0])}
        fill={$zGet(series)}
        rx={radius}
      />
    {/each}
  {/each}
</g>
```

### ColumnStacked

```svelte
<script lang="ts">
  import { getContext } from 'svelte';
  const { data, xGet, yGet, zGet, xScale } = getContext('LayerCake');

  let { radius = 0 } = $props();
</script>

<g class="column-stacked-group">
  {#each $data as series}
    {#each series as d}
      {@const yVals = $yGet(d)}
      <rect
        x={$xGet(d)}
        y={yVals[1]}
        width={$xScale.bandwidth()}
        height={Math.max(0, yVals[0] - yVals[1])}
        fill={$zGet(series)}
        rx={radius}
      />
    {/each}
  {/each}
</g>
```

### AreaStacked

```svelte
<script lang="ts">
  import { getContext } from 'svelte';
  import { area } from 'd3-shape';
  const { data, xGet, yScale, zGet } = getContext('LayerCake');

  let areaGen = $derived(
    area()
      .x((d: any) => $xGet(d))
      .y0((d: any) => $yScale(d[0]))
      .y1((d: any) => $yScale(d[1]))
  );
</script>

<g class="area-stacked-group">
  {#each $data as series}
    <path d={areaGen(series)} fill={$zGet(series)} opacity="0.8" />
  {/each}
</g>
```

---

## Tooltips

### QuadTree

Best for line/area charts. Uses `d3-quadtree` for O(log n) nearest-point lookup.

```svelte
<!-- QuadTree.svelte -->
<script lang="ts">
  import { getContext } from 'svelte';
  import { quadtree } from 'd3-quadtree';

  const { data, xGet, yGet, width, height } = getContext('LayerCake');
  let { dataset }: { dataset: any[] } = $props();

  let visible = $state(false);
  let found: any = $state(null);
  let x = $state(0);
  let y = $state(0);

  let tree = $derived(
    quadtree()
      .x((d: any) => $xGet(d))
      .y((d: any) => $yGet(d))
      .addAll(dataset)
  );

  function handleMove(e: MouseEvent) {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    found = tree.find(mx, my);
    if (found) {
      x = $xGet(found);
      y = $yGet(found);
      visible = true;
    }
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="absolute inset-0"
  onmousemove={handleMove}
  onmouseleave={() => visible = false}>
  {#if visible && found}
    <!-- Vertical guide line -->
    <div class="absolute top-0 w-px bg-border-light"
      style="left:{x}px; height:{$height}px;"></div>
    <!-- Tooltip -->
    <div class="brutal-border bg-surface shadow-sm px-3 py-2 text-xs
      pointer-events-none absolute -translate-x-1/2 z-10"
      style="left:{x}px; top:{y - 40}px;">
      {@render children?.({ found, x, y })}
    </div>
  {/if}
</div>
```

### Direct Element Events

Best for bar/column charts where each element is discrete.

```svelte
{#each $data as d}
  <rect ...
    onmouseenter={(e) => { tooltip = { d, x: e.clientX, y: e.clientY } }}
    onmouseleave={() => { tooltip = null }}
    class="cursor-pointer hover:opacity-80 transition-opacity"
  />
{/each}
```

### Voronoi

Best for scatter plots. Uses `d3-delaunay` to create proximity cells.

```svelte
<script lang="ts">
  import { getContext } from 'svelte';
  import { Delaunay } from 'd3-delaunay';

  const { data, xGet, yGet, width, height } = getContext('LayerCake');

  let { onhover }: { onhover?: (d: any) => void } = $props();

  let voronoi = $derived.by(() => {
    const points = $data.map((d: any) => [$xGet(d), $yGet(d)] as [number, number]);
    const delaunay = Delaunay.from(points);
    return delaunay.voronoi([0, 0, $width, $height]);
  });
</script>

<g class="voronoi-group">
  {#each $data as d, i}
    <path d={voronoi.renderCell(i)} fill="transparent"
      onmouseenter={() => onhover?.(d)} />
  {/each}
</g>
```

---

## Multiline Charts

Use `groupLonger` to transform wide data:

```ts
import { groupLonger, flatten } from 'layercake';

const seriesNames = ['confidence', 'discovery', 'risks'];
const grouped = groupLonger(data, seriesNames, {
  groupTo: 'metric',
  valueTo: 'value'
});

// LayerCake config:
// x="date" y="value" z="metric"
// flatData={flatten(grouped, 'values')}
// data={grouped}
// zScale={scaleOrdinal()}
// zRange={['var(--color-primary)', 'var(--color-success)', 'var(--color-danger)']}
```

```svelte
<!-- MultiLine.svelte -->
<script lang="ts">
  import { getContext } from 'svelte';
  import { line, curveMonotoneX } from 'd3-shape';
  const { data, xGet, yGet, zGet } = getContext('LayerCake');

  let pathGen = $derived(line().x($xGet).y($yGet).curve(curveMonotoneX));
</script>

<g>
  {#each $data as group}
    <path d={pathGen(group.values)} stroke={$zGet(group)}
      fill="none" stroke-width="2" stroke-linecap="round" />
  {/each}
</g>
```

---

## Stacking Data

```ts
import { stack, flatten } from 'layercake';
import { scaleBand, scaleOrdinal } from 'd3-scale';

const seriesNames = ['discovery', 'analysis', 'migration', 'testing', 'cutover'];
const stackedData = stack(data, seriesNames);

// LayerCake config for stacked columns:
// x={d => d.data.label}
// y={[0, 1]}             ← array accessor for stack bounds
// z="key"
// xScale={scaleBand().paddingInner(0.1)}
// zScale={scaleOrdinal()}
// zDomain={seriesNames}
// zRange={CHART_PALETTE}
// flatData={flatten(stackedData)}
// data={stackedData}
```

---

## Animations

### Svelte transitions on elements

```svelte
{#each $data as d, i (d.id)}
  <rect transition:fly={{ y: 20, duration: 300, delay: i * 50 }}
    x={$xGet(d)} ... />
{/each}
```

### Tweened domain transitions

```ts
import { Tween } from 'svelte/motion';
import { cubicInOut } from 'svelte/easing';

const xDomain = new Tween([0, 100], { duration: 400, easing: cubicInOut });
// Update: xDomain.target = [0, 200];
// Use: <LayerCake xDomain={xDomain.current} ...>
```

### Respect reduced motion

```ts
const prefersReduced = typeof window !== 'undefined'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const duration = prefersReduced ? 0 : 300;
```

---

## SSR Rendering

```svelte
<LayerCake ssr percentRange
  padding={{ top: 8, right: 10, bottom: 20, left: 25 }}
  x="date" y="value" {data}>
  <ScaledSvg fixedAspectRatio={16/9}>
    <AxisX />
    <AxisY />
    <Line />
  </ScaledSvg>
</LayerCake>
```

`percentRange` sets scale ranges to `[0, 100]` (works without knowing container px). `ScaledSvg` renders a fixed-aspect SVG that scales with CSS. After hydration, becomes fully responsive.

---

## Canvas Rendering

For scatter plots or line charts with >500 data points:

```svelte
<script lang="ts">
  import { getContext } from 'svelte';
  import { scaleCanvas } from 'layercake';

  const { data, xGet, yGet, width, height } = getContext('LayerCake');
  const { ctx } = getContext('canvas');

  let { r = 3, fill = 'var(--color-primary)' } = $props();

  $effect(() => {
    const context = $ctx;
    if (!context) return;
    scaleCanvas(context, $width, $height);
    context.clearRect(0, 0, $width, $height);
    context.fillStyle = fill;
    for (const d of $data) {
      context.beginPath();
      context.arc($xGet(d), $yGet(d), r, 0, Math.PI * 2);
      context.fill();
    }
  });
</script>

<canvas></canvas>
```

Use with `<Canvas>` layout:

```svelte
<LayerCake ...>
  <Svg><AxisX /><AxisY /></Svg>
  <Canvas><ScatterCanvas r={3} /></Canvas>
</LayerCake>
```

---

## Composed Chart Pattern

Wrap LayerCake + primitives into a single reusable component:

```svelte
<!-- LineChart.svelte -->
<script lang="ts">
  import { LayerCake, Svg, Html } from 'layercake';
  import Line from '../primitives/Line.svelte';
  import Area from '../primitives/Area.svelte';
  import AxisX from '../primitives/AxisX.svelte';
  import AxisY from '../primitives/AxisY.svelte';
  import QuadTree from '../primitives/QuadTree.svelte';

  type Props = {
    data: any[];
    x: string;
    y: string;
    color?: string;
    showArea?: boolean;
    yDomain?: [number | null, number | null];
    xFormat?: (v: any) => string;
    yFormat?: (v: any) => string;
    yTicks?: number;
  };

  let { data, x, y, color = 'var(--color-primary)', showArea = false,
    yDomain = [0, null], xFormat = String, yFormat = String,
    yTicks = 4 }: Props = $props();
</script>

<LayerCake padding={{ top: 8, right: 10, bottom: 20, left: 35 }}
  {x} {y} {yDomain} {data}>
  <Svg>
    <AxisX format={xFormat} />
    <AxisY ticks={yTicks} format={yFormat} />
    {#if showArea}
      <Area fill={color} />
    {/if}
    <Line stroke={color} />
  </Svg>
  <Html>
    <QuadTree dataset={data}>
      {#snippet children({ found })}
        <span class="font-mono font-bold">{yFormat(found[y])}</span>
      {/snippet}
    </QuadTree>
  </Html>
</LayerCake>
```

Usage:

```svelte
<div class="h-64">
  <LineChart data={confidenceData} x="date" y="score"
    color="var(--color-primary)" showArea
    yFormat={v => `${v}%`} yDomain={[0, 100]} />
</div>
```
