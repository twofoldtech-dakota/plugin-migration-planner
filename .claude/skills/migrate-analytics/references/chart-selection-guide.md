# Chart Selection Guide

Decision framework for choosing the optimal visualization for any MigrateIQ data scenario.

## Table of Contents

- [Decision Flowchart](#decision-flowchart)
- [MigrateIQ Data Scenarios](#migrateiq-data-scenarios)
- [Chart Type Deep Dives](#chart-type-deep-dives)
- [Anti-Patterns](#anti-patterns)
- [Color & Accessibility](#color--accessibility)
- [Data-Ink Ratio](#data-ink-ratio)

---

## Decision Flowchart

```
What are you showing?
│
├── Single number/KPI
│   ├── With trend context → Big Number + Sparkline
│   ├── Against a target → Gauge / Progress bar
│   └── Just the number → KPI Card with delta badge
│
├── Comparison across categories
│   ├── Few categories (2-6) → Column chart (vertical bars)
│   ├── Many categories (7+) → Horizontal bar chart
│   ├── Two values per category → Grouped bar / Cleveland dot
│   └── Ranked order matters → Horizontal bar, sorted
│
├── Change over time
│   ├── Continuous series → Line chart
│   ├── Emphasize volume → Area chart
│   ├── Multiple series (2-5) → Multiline chart
│   ├── Multiple series (6+) → Small multiples
│   ├── Discrete time periods → Column chart
│   └── Cyclical patterns → Radar / radial chart
│
├── Part-to-whole composition
│   ├── Simple split (2-3 parts) → Donut chart
│   ├── 4-6 parts → Stacked bar (single bar)
│   ├── Over time → Stacked area / Stacked column
│   ├── Hierarchical → Treemap
│   └── Exact percentages matter → 100% stacked bar
│
├── Distribution
│   ├── Single variable → Histogram
│   ├── Compare distributions → Box plot / Violin
│   └── Density estimation → Kernel density plot
│
├── Relationship / Correlation
│   ├── Two continuous variables → Scatter plot
│   ├── Three variables → Bubble chart
│   └── Sequential relationship → Connected scatter
│
├── Flow / Process
│   ├── Category → Category flow → Sankey diagram
│   └── Step funnel → Funnel chart
│
└── Multi-dimensional profile
    └── 3-8 dimensions → Radar chart
```

---

## MigrateIQ Data Scenarios

Specific recommendations for data available in MigrateIQ:

### Confidence Score

| Context | Chart | Why |
|---------|-------|-----|
| Single assessment, current score | **Gauge** (semicircular) | Shows position against 0-100 target |
| Single assessment, over estimate versions | **Line + Area** | Trend over sequential refinements |
| Portfolio, all assessments over time | **Multiline** with portfolio avg overlay | Compare individual trajectories |
| Dashboard, compact indicator | **Sparkline** (120x32) | Trend at a glance, embed in tables/cards |
| Portfolio overview, per-assessment | **Horizontal bar**, sorted by confidence | Rank assessments by readiness |

### Estimate Hours

| Context | Chart | Why |
|---------|-------|-----|
| Phase breakdown, single estimate | **Horizontal bar** | Compare phase durations with long labels |
| Component breakdown within phase | **Horizontal bar**, sorted | Rank components by effort |
| Phase composition by role | **Stacked horizontal bar** | Part-to-whole per phase |
| Total hours across scenarios | **Grouped column** (manual/AI/best) | Side-by-side scenario comparison |
| Hours over estimate versions | **Line chart** (one line per scenario) | Track estimate convergence |
| Phase hours — estimated vs actual | **Grouped bar** (est + actual side by side) | Calibration accuracy |

### Risk Data

| Context | Chart | Why |
|---------|-------|-----|
| Risk count by severity | **Stacked bar** (single) or **Donut** | Part-to-whole severity distribution |
| Risks by category | **Horizontal bar**, colored by severity | Category + severity in one view |
| Risk likelihood vs impact | **Scatter** or **Bubble** (size=hours impact) | Identify highest-priority risks |
| Risk trend over time | **Stacked area** | Show risk profile evolution |
| Top 5 risks quick view | **List** (not a chart — use RiskSummaryList) | Tables beat charts for small ranked lists |

### Discovery Progress

| Context | Chart | Why |
|---------|-------|-----|
| Overall completion % | **Progress bar** or **Gauge** | Simple percentage against target |
| Per-dimension completion | **Horizontal bar**, grouped by tier | Show which dimensions need work |
| Completion over time | **Area chart** | Emphasize accumulation of knowledge |
| Dimension priority vs completion | **Scatter** (x=priority, y=completion) | Highlight high-priority gaps |

### Assumption Validation

| Context | Chart | Why |
|---------|-------|-----|
| Validated / Unvalidated / Invalidated | **Stacked bar** (single) or **Donut** (3 segments) | Simple 3-part composition |
| Assumption status over time | **Stacked area** | Track validation progress |
| Impact of unvalidated assumptions | **Horizontal bar** (widening hours) | Quantify cost of uncertainty |

### User Behavior / Events

| Context | Chart | Why |
|---------|-------|-----|
| Page views over time | **Area chart** | Volume emphasis |
| Top pages ranked | **Horizontal bar** | Standard ranked list |
| Events by category | **Donut** (if 3-5) or **Column** (if more) | Composition or comparison |
| Feature usage heatmap | **Calendar heatmap** | Show daily activity patterns |
| Session duration distribution | **Histogram** | Distribution analysis |
| Workflow funnel | **Funnel** (or horizontal bars, decreasing) | Conversion/completion rates |
| User flow between pages | **Sankey** | Navigation patterns |
| Events timeline (real-time) | **Line chart** (streaming) | Live activity monitoring |

### Portfolio / Cross-Project

| Context | Chart | Why |
|---------|-------|-----|
| Assessment count by status | **Donut** or **Column** | Composition or comparison |
| Hours by client | **Horizontal bar** | Ranked comparison |
| Confidence distribution across projects | **Histogram** or **Box plot** | Spread analysis |
| Projects on timeline | **Gantt-style horizontal bars** | Timeline visibility |

---

## Chart Type Deep Dives

### Line Chart — When & How

**Use when:**
- Data is continuous and ordered (time series, sequential versions)
- Showing trends, patterns, or rates of change
- Comparing 2-5 overlapping series

**Never use when:**
- Data is categorical (use bar)
- Only 2-3 data points (use big numbers with delta)
- Showing composition (use stacked area)

**Best practices:**
- Max 5 lines before it becomes spaghetti — use small multiples for more
- Start y-axis at 0 for absolute comparisons, or use meaningful baseline
- Add threshold reference lines (e.g., "Good" at 70%) with dashed style
- Use `curveMonotoneX` for smooth curves that don't overshoot data points

### Bar Chart — When & How

**Use when:**
- Comparing discrete categories
- Showing rankings (sort descending)
- Labels are long (use horizontal bars)

**Best practices:**
- Always sort meaningfully — alphabetical is rarely useful
- Start bars at 0 (truncated bars are misleading)
- Gap between bars: 30-50% of bar width
- Direct label bars when there are few (skip axis)
- Color: single color for single series, or color by category if that encodes meaning

### Donut Chart — When & How

**Use when:**
- Showing part-to-whole with 2-5 segments
- Primary insight is "which is biggest" or "how much is X"
- Total matters (show in center of donut)

**Never use when:**
- More than 5-6 segments
- Comparing precise values (angular differences are hard to judge)
- Showing change over time

**Best practices:**
- Always sort segments by size (largest at 12 o'clock, clockwise)
- Label directly on or next to segments (not in a separate legend)
- Use donut over pie — center space for total, less area distortion
- Inner radius: 55-65% of outer radius

### Scatter Plot — When & How

**Use when:**
- Exploring correlation between two continuous variables
- Identifying clusters, outliers, patterns
- Third variable encodable via bubble size or color

**Best practices:**
- Always label axes clearly with units
- Add reference lines or quadrant dividers for context
- Use Voronoi overlay for interactive tooltips
- Jitter overlapping points or use opacity
- Use Canvas rendering for >200 points

---

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| Pie with 8+ slices | Impossible to compare thin wedges | Use horizontal bar |
| Dual Y-axes | Misleading correlation suggestion | Use small multiples |
| 3D charts | Perspective distorts values | Always 2D |
| Truncated Y-axis | Exaggerates small differences | Start at 0 (or clearly mark break) |
| Rainbow color scale | Not perceptually uniform | Use sequential or diverging palette |
| Spaghetti chart (>5 lines) | Unreadable tangle | Small multiples or highlight one |
| Unnecessary animation | Distracts, hides data | Only animate to show change |
| Chart without title/labels | Reader can't interpret | Always include title, axis labels, units |
| Using a chart for 1-3 items | Overhead > insight | Use text, KPI card, or table |

---

## Color & Accessibility

### Semantic Color Mapping

Always use MigrateIQ design tokens semantically:

| Data Meaning | Token | Hex |
|-------------|-------|-----|
| Primary / default series | `--color-primary` | #4f46e5 |
| Positive / validated / complete | `--color-success` | #16a34a |
| Caution / assumed / medium | `--color-warning` | #ea580c |
| Negative / invalid / high risk | `--color-danger` | #dc2626 |
| Informational / discovery | `--color-info` | #2563eb |
| Gridlines / subtle | `--color-border-light` | #e8e4dc |
| Labels / muted text | `--color-text-muted` | #8a8a8a |

### Categorical Palette (multi-series, no semantic meaning)

```
#4f46e5 (indigo), #16a34a (green), #ea580c (orange),
#dc2626 (red), #2563eb (blue), #7c3aed (violet),
#0891b2 (cyan), #ca8a04 (amber)
```

Max 8 categories before colors become indistinguishable.

### WCAG Compliance

- **3:1 minimum** contrast ratio for chart elements against background
- **4.5:1 minimum** for text labels
- Never rely on color alone — supplement with:
  - Patterns (stripes, dots) on fills
  - Shape differences (circle, square, triangle) on scatter points
  - Direct labels adjacent to data
- Test with color blindness simulators (protanopia, deuteranopia)

### Reduced Motion

```svelte
<script lang="ts">
  const prefersReduced = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
</script>

{#if !prefersReduced}
  <rect transition:fly={{ y: 20, duration: 300 }} ... />
{:else}
  <rect ... />
{/if}
```

---

## Data-Ink Ratio

Every pixel should earn its place. Apply these rules:

1. **Remove chart borders** — the card boundary is enough
2. **Lighten gridlines** — dashed, `--color-border-light`, low opacity
3. **Minimize axis ticks** — 4-5 ticks on Y, key labels on X
4. **Remove axis lines** if gridlines are present
5. **Direct label** data series instead of using legends
6. **Use whitespace** — don't fill every pixel
7. **Remove background fills** on the chart area
8. **Skip zero-value segments** in stacked charts
9. **Abbreviate large numbers** — "1.2k" not "1,200", "3.5M" not "3,500,000"

### Number Formatting

```ts
import { format } from 'd3-format';

const formatHours = format(',.0f');     // 1,234
const formatPercent = format('.0%');     // 72%
const formatCompact = format('.2s');     // 1.2k, 3.5M
const formatDelta = format('+.1f');     // +2.3, -1.5
```
