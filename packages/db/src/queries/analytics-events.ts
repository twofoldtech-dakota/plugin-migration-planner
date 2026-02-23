import { sql } from "drizzle-orm";
import type { Database } from "../connection.js";
import { analyticsEvents } from "../schema.js";

export interface AnalyticsEventInput {
  session_id: string;
  event: string;
  category?: string;
  properties?: Record<string, unknown>;
  path?: string;
  assessment_id?: string | null;
  created_at?: string;
}

export async function insertAnalyticsEvents(
  db: Database,
  events: AnalyticsEventInput[]
): Promise<void> {
  if (events.length === 0) return;
  await db.insert(analyticsEvents).values(
    events.map((e) => ({
      session_id: e.session_id,
      event: e.event,
      category: e.category ?? "",
      properties: e.properties ?? {},
      path: e.path ?? "",
      assessment_id: e.assessment_id ?? null,
      created_at: e.created_at ?? new Date().toISOString(),
    }))
  );
}

export interface PageViewBucket {
  bucket: string;
  count: number;
}

export async function getPageViewsOverTime(
  db: Database,
  hours: number = 168
): Promise<PageViewBucket[]> {
  const rows = await db
    .select({
      bucket: sql<string>`date_trunc('hour', ${analyticsEvents.created_at})::text`,
      count: sql<number>`count(*)`,
    })
    .from(analyticsEvents)
    .where(
      sql`${analyticsEvents.event} = 'page_view' AND ${analyticsEvents.created_at} > now() - interval '${sql.raw(String(hours))} hours'`
    )
    .groupBy(sql`date_trunc('hour', ${analyticsEvents.created_at})`)
    .orderBy(sql`date_trunc('hour', ${analyticsEvents.created_at})`);
  return rows.map((r) => ({ bucket: r.bucket, count: Number(r.count) }));
}

export async function getTopPages(
  db: Database,
  days: number = 7,
  limit: number = 10
): Promise<{ path: string; count: number }[]> {
  const rows = await db
    .select({
      path: analyticsEvents.path,
      count: sql<number>`count(*)`,
    })
    .from(analyticsEvents)
    .where(
      sql`${analyticsEvents.event} = 'page_view' AND ${analyticsEvents.created_at} > now() - interval '${sql.raw(String(days))} days'`
    )
    .groupBy(analyticsEvents.path)
    .orderBy(sql`count(*) desc`)
    .limit(limit);
  return rows.map((r) => ({ path: r.path, count: Number(r.count) }));
}

export async function getTopFeatures(
  db: Database,
  days: number = 7,
  limit: number = 10
): Promise<{ event: string; count: number }[]> {
  const rows = await db
    .select({
      event: analyticsEvents.event,
      count: sql<number>`count(*)`,
    })
    .from(analyticsEvents)
    .where(
      sql`${analyticsEvents.event} != 'page_view' AND ${analyticsEvents.created_at} > now() - interval '${sql.raw(String(days))} days'`
    )
    .groupBy(analyticsEvents.event)
    .orderBy(sql`count(*) desc`)
    .limit(limit);
  return rows.map((r) => ({ event: r.event, count: Number(r.count) }));
}

export async function getSessionCount(
  db: Database,
  days: number = 7
): Promise<number> {
  const rows = await db
    .select({ count: sql<number>`count(distinct ${analyticsEvents.session_id})` })
    .from(analyticsEvents)
    .where(
      sql`${analyticsEvents.created_at} > now() - interval '${sql.raw(String(days))} days'`
    );
  return Number(rows[0]?.count ?? 0);
}

export async function getPageViewCount(
  db: Database,
  hours: number = 24
): Promise<number> {
  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(analyticsEvents)
    .where(
      sql`${analyticsEvents.event} = 'page_view' AND ${analyticsEvents.created_at} > now() - interval '${sql.raw(String(hours))} hours'`
    );
  return Number(rows[0]?.count ?? 0);
}

export async function getMostEngagedAssessments(
  db: Database,
  days: number = 7,
  limit: number = 10
): Promise<{ assessment_id: string; count: number }[]> {
  const rows = await db
    .select({
      assessment_id: analyticsEvents.assessment_id,
      count: sql<number>`count(*)`,
    })
    .from(analyticsEvents)
    .where(
      sql`${analyticsEvents.assessment_id} is not null AND ${analyticsEvents.created_at} > now() - interval '${sql.raw(String(days))} days'`
    )
    .groupBy(analyticsEvents.assessment_id)
    .orderBy(sql`count(*) desc`)
    .limit(limit);
  return rows.map((r) => ({
    assessment_id: r.assessment_id!,
    count: Number(r.count),
  }));
}
