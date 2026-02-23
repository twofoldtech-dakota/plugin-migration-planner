# Analytics Event Schema

Complete taxonomy of trackable events for MigrateIQ. Covers navigation, user interaction, workflow progress, chart engagement, and system performance.

## Table of Contents

- [Core Types](#core-types)
- [Tracker Implementation](#tracker-implementation)
- [Event Catalog](#event-catalog)
  - [Navigation Events](#navigation-events)
  - [Interaction Events](#interaction-events)
  - [Workflow Events](#workflow-events)
  - [Chart Events](#chart-events)
  - [System Events](#system-events)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Aggregation Queries](#aggregation-queries)

---

## Core Types

```ts
type EventCategory = 'navigation' | 'interaction' | 'workflow' | 'chart' | 'system';

type AnalyticsEvent = {
  event: string;                              // e.g. 'page_view', 'button_click'
  category: EventCategory;
  properties?: Record<string, string | number | boolean>;
  timestamp: number;                          // Date.now()
  session_id: string;                         // generated per browser session
  assessment_id?: string;                     // current assessment context
  page_path: string;                          // window.location.pathname
};
```

---

## Tracker Implementation

### Core Module (`$lib/utils/analytics.ts`)

```ts
import { browser } from '$app/environment';

const FLUSH_INTERVAL = 30_000; // 30 seconds
const MAX_BUFFER = 100;

let buffer: AnalyticsEvent[] = [];
let sessionId: string;

function getSessionId(): string {
  if (!browser) return '';
  if (!sessionId) {
    sessionId = sessionStorage.getItem('miq_sid')
      || crypto.randomUUID();
    sessionStorage.setItem('miq_sid', sessionId);
  }
  return sessionId;
}

export function trackEvent(
  event: string,
  category: EventCategory,
  properties?: Record<string, string | number | boolean>
): void {
  if (!browser) return;
  buffer.push({
    event,
    category,
    properties,
    timestamp: Date.now(),
    session_id: getSessionId(),
    page_path: window.location.pathname,
  });
  if (buffer.length >= MAX_BUFFER) flush();
}

export function trackPageView(path: string, assessmentId?: string): void {
  trackEvent('page_view', 'navigation', {
    path,
    ...(assessmentId && { assessment_id: assessmentId }),
  });
}

export function trackTiming(label: string, durationMs: number): void {
  trackEvent('timing', 'system', { label, duration_ms: durationMs });
}

export function trackError(error: string, context?: string): void {
  trackEvent('error', 'system', { error, ...(context && { context }) });
}

async function flush(): Promise<void> {
  if (!buffer.length) return;
  const events = [...buffer];
  buffer = [];
  try {
    await fetch('/api/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
      keepalive: true, // survives page navigation
    });
  } catch {
    buffer.unshift(...events); // re-queue on failure
  }
}

// Auto-flush on interval and page leave
if (browser) {
  setInterval(flush, FLUSH_INTERVAL);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
}
```

### Layout Integration

```svelte
<!-- +layout.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { trackPageView } from '$lib/utils/analytics';

  $effect(() => {
    trackPageView($page.url.pathname, $page.params?.id);
  });
</script>
```

---

## Event Catalog

### Navigation Events

| Event | Properties | Trigger |
|-------|-----------|---------|
| `page_view` | `path`, `assessment_id?` | Every route change (via layout $effect) |
| `sidebar_click` | `target`, `section` | Click on sidebar navigation item |
| `tab_switch` | `from_tab`, `to_tab` | Switch between tabs on a page |
| `breadcrumb_click` | `level`, `target` | Click breadcrumb navigation |
| `external_link` | `url`, `context` | Click link that leaves the app |

### Interaction Events

| Event | Properties | Trigger |
|-------|-----------|---------|
| `button_click` | `button_id`, `label`, `context` | Any actionable button click |
| `form_submit` | `form_id`, `fields_count` | Form submission |
| `toggle_change` | `toggle_id`, `new_value` | Toggle switch (e.g., AI tool toggles) |
| `search_query` | `query`, `results_count`, `context` | Search input submission |
| `filter_apply` | `filter_type`, `value`, `context` | Apply a filter (status, date, etc.) |
| `sort_change` | `column`, `direction`, `context` | Change table sort |
| `expand_collapse` | `target`, `new_state` | Accordion/collapsible toggle |
| `copy_to_clipboard` | `content_type`, `context` | Copy action |
| `download` | `file_type`, `context` | Download export |
| `modal_open` | `modal_id`, `trigger` | Modal/dialog opened |
| `modal_close` | `modal_id`, `method` | Modal closed (button/escape/backdrop) |
| `theme_toggle` | `new_theme` | Dark/light mode switch |

### Workflow Events

| Event | Properties | Trigger |
|-------|-----------|---------|
| `assessment_create` | `project_name`, `topology?` | New assessment created |
| `assessment_open` | `assessment_id`, `status` | Open an existing assessment |
| `step_start` | `step`, `assessment_id` | Begin a workflow step (discovery/analysis/etc.) |
| `step_complete` | `step`, `assessment_id`, `duration_ms` | Complete a workflow step |
| `skill_invoke` | `skill_name`, `assessment_id` | Claude skill invoked |
| `agent_run_start` | `agent_type`, `assessment_id` | Agent/challenge review started |
| `agent_run_complete` | `agent_type`, `assessment_id`, `result` | Agent completed |
| `version_create` | `version`, `assessment_id`, `confidence` | New estimate version saved |
| `assumption_validate` | `assumption_id`, `status`, `assessment_id` | Assumption validated/invalidated |
| `scope_change` | `component_id`, `included`, `assessment_id` | Component included/excluded |
| `scenario_switch` | `scenario`, `assessment_id` | Switch between manual/AI/best case |
| `deliverable_generate` | `type`, `assessment_id` | Generate migration plan/runbook |

### Chart Events

| Event | Properties | Trigger |
|-------|-----------|---------|
| `chart_hover` | `chart_id`, `data_point` | Tooltip triggered on chart |
| `chart_click` | `chart_id`, `data_point`, `action` | Click on chart element |
| `chart_zoom` | `chart_id`, `range` | Zoom/brush interaction |
| `chart_filter` | `chart_id`, `filter_type`, `value` | Filter applied within chart |
| `chart_export` | `chart_id`, `format` | Chart exported as image/data |
| `time_range_change` | `chart_id`, `from`, `to` | Date range picker change |
| `series_toggle` | `chart_id`, `series`, `visible` | Show/hide a data series |

### System Events

| Event | Properties | Trigger |
|-------|-----------|---------|
| `timing` | `label`, `duration_ms` | Performance measurement |
| `error` | `error`, `context?`, `stack?` | JavaScript error |
| `api_latency` | `endpoint`, `method`, `duration_ms`, `status` | API call timing |
| `page_load` | `path`, `load_ms`, `data_ms` | Full page load timing |
| `session_start` | `referrer?`, `user_agent` | New session detected |
| `feature_flag` | `flag`, `value` | Feature flag evaluated |

---

## Database Schema

```sql
CREATE TABLE analytics_events (
  id BIGSERIAL PRIMARY KEY,
  event VARCHAR(100) NOT NULL,
  category VARCHAR(20) NOT NULL,
  properties JSONB DEFAULT '{}',
  session_id UUID NOT NULL,
  assessment_id UUID REFERENCES assessments(id),
  page_path VARCHAR(500) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_events_timestamp ON analytics_events (timestamp DESC);
CREATE INDEX idx_events_category ON analytics_events (category, timestamp DESC);
CREATE INDEX idx_events_session ON analytics_events (session_id, timestamp);
CREATE INDEX idx_events_assessment ON analytics_events (assessment_id, timestamp DESC)
  WHERE assessment_id IS NOT NULL;
CREATE INDEX idx_events_event ON analytics_events (event, timestamp DESC);

-- Partition by month for large datasets (optional)
-- CREATE TABLE analytics_events (...) PARTITION BY RANGE (timestamp);
```

### Drizzle ORM Schema

```ts
import { pgTable, bigserial, varchar, jsonb, uuid, timestamp, index } from 'drizzle-orm/pg-core';

export const analyticsEvents = pgTable('analytics_events', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  event: varchar('event', { length: 100 }).notNull(),
  category: varchar('category', { length: 20 }).notNull(),
  properties: jsonb('properties').default({}),
  sessionId: uuid('session_id').notNull(),
  assessmentId: uuid('assessment_id'),
  pagePath: varchar('page_path', { length: 500 }).notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_events_timestamp').on(table.timestamp),
  index('idx_events_category').on(table.category, table.timestamp),
  index('idx_events_session').on(table.sessionId, table.timestamp),
  index('idx_events_event').on(table.event, table.timestamp),
]);
```

---

## API Endpoints

### POST `/api/analytics/events`

Batch insert events from the client-side buffer.

```ts
// +server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { analyticsEvents } from '$lib/server/schema';

export const POST: RequestHandler = async ({ request }) => {
  const { events } = await request.json();

  if (!Array.isArray(events) || events.length === 0) {
    return json({ error: 'No events provided' }, { status: 400 });
  }

  if (events.length > 200) {
    return json({ error: 'Too many events (max 200)' }, { status: 400 });
  }

  await db.insert(analyticsEvents).values(
    events.map((e: AnalyticsEvent) => ({
      event: e.event,
      category: e.category,
      properties: e.properties || {},
      sessionId: e.session_id,
      assessmentId: e.assessment_id || null,
      pagePath: e.page_path,
      timestamp: new Date(e.timestamp),
    }))
  );

  return json({ ok: true });
};
```

### GET `/api/analytics/summary`

Aggregated stats for the analytics dashboard.

```ts
// Returns: { pageViews, uniqueSessions, topPages, eventsByCategory, hourlyActivity }
```

---

## Aggregation Queries

### Page Views Over Time

```sql
SELECT
  date_trunc('day', timestamp) AS day,
  COUNT(*) AS views,
  COUNT(DISTINCT session_id) AS unique_sessions
FROM analytics_events
WHERE event = 'page_view'
  AND timestamp >= NOW() - INTERVAL '30 days'
GROUP BY day
ORDER BY day;
```

### Top Pages

```sql
SELECT
  page_path,
  COUNT(*) AS views,
  COUNT(DISTINCT session_id) AS unique_visitors
FROM analytics_events
WHERE event = 'page_view'
  AND timestamp >= NOW() - INTERVAL '7 days'
GROUP BY page_path
ORDER BY views DESC
LIMIT 20;
```

### Events by Category

```sql
SELECT
  category,
  COUNT(*) AS count
FROM analytics_events
WHERE timestamp >= NOW() - INTERVAL '7 days'
GROUP BY category
ORDER BY count DESC;
```

### Workflow Funnel

```sql
WITH steps AS (
  SELECT
    assessment_id,
    MAX(CASE WHEN event = 'step_complete' AND properties->>'step' = 'discovery' THEN 1 END) AS discovery,
    MAX(CASE WHEN event = 'step_complete' AND properties->>'step' = 'analysis' THEN 1 END) AS analysis,
    MAX(CASE WHEN event = 'step_complete' AND properties->>'step' = 'estimate' THEN 1 END) AS estimate,
    MAX(CASE WHEN event = 'step_complete' AND properties->>'step' = 'refine' THEN 1 END) AS refine,
    MAX(CASE WHEN event = 'step_complete' AND properties->>'step' = 'deliverables' THEN 1 END) AS deliverables
  FROM analytics_events
  WHERE event = 'step_complete' AND assessment_id IS NOT NULL
  GROUP BY assessment_id
)
SELECT
  COUNT(*) AS total_assessments,
  SUM(discovery) AS completed_discovery,
  SUM(analysis) AS completed_analysis,
  SUM(estimate) AS completed_estimate,
  SUM(refine) AS completed_refine,
  SUM(deliverables) AS completed_deliverables
FROM steps;
```

### Session Duration

```sql
SELECT
  session_id,
  MIN(timestamp) AS session_start,
  MAX(timestamp) AS session_end,
  EXTRACT(EPOCH FROM MAX(timestamp) - MIN(timestamp)) AS duration_seconds,
  COUNT(*) AS event_count
FROM analytics_events
WHERE timestamp >= NOW() - INTERVAL '7 days'
GROUP BY session_id
HAVING COUNT(*) > 1
ORDER BY duration_seconds DESC;
```

### Feature Usage (interactions by type)

```sql
SELECT
  event,
  properties->>'context' AS context,
  COUNT(*) AS usage_count,
  COUNT(DISTINCT session_id) AS unique_users
FROM analytics_events
WHERE category = 'interaction'
  AND timestamp >= NOW() - INTERVAL '30 days'
GROUP BY event, properties->>'context'
ORDER BY usage_count DESC
LIMIT 50;
```

### Hourly Activity Heatmap

```sql
SELECT
  EXTRACT(DOW FROM timestamp) AS day_of_week,
  EXTRACT(HOUR FROM timestamp) AS hour_of_day,
  COUNT(*) AS event_count
FROM analytics_events
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY day_of_week, hour_of_day
ORDER BY day_of_week, hour_of_day;
```
