import { p as analyticsEvents, s as sql } from './db-BWpbog7L.js';

async function insertAnalyticsEvents(db, events) {
  if (events.length === 0)
    return;
  await db.insert(analyticsEvents).values(events.map((e) => ({
    session_id: e.session_id,
    event: e.event,
    category: e.category ?? "",
    properties: e.properties ?? {},
    path: e.path ?? "",
    assessment_id: e.assessment_id ?? null,
    created_at: e.created_at ?? (/* @__PURE__ */ new Date()).toISOString()
  })));
}
async function getPageViewsOverTime(db, hours = 168) {
  const rows = await db.select({
    bucket: sql`date_trunc('hour', ${analyticsEvents.created_at})::text`,
    count: sql`count(*)`
  }).from(analyticsEvents).where(sql`${analyticsEvents.event} = 'page_view' AND ${analyticsEvents.created_at} > now() - interval '${sql.raw(String(hours))} hours'`).groupBy(sql`date_trunc('hour', ${analyticsEvents.created_at})`).orderBy(sql`date_trunc('hour', ${analyticsEvents.created_at})`);
  return rows.map((r) => ({ bucket: r.bucket, count: Number(r.count) }));
}
async function getTopPages(db, days = 7, limit = 10) {
  const rows = await db.select({
    path: analyticsEvents.path,
    count: sql`count(*)`
  }).from(analyticsEvents).where(sql`${analyticsEvents.event} = 'page_view' AND ${analyticsEvents.created_at} > now() - interval '${sql.raw(String(days))} days'`).groupBy(analyticsEvents.path).orderBy(sql`count(*) desc`).limit(limit);
  return rows.map((r) => ({ path: r.path, count: Number(r.count) }));
}
async function getTopFeatures(db, days = 7, limit = 10) {
  const rows = await db.select({
    event: analyticsEvents.event,
    count: sql`count(*)`
  }).from(analyticsEvents).where(sql`${analyticsEvents.event} != 'page_view' AND ${analyticsEvents.created_at} > now() - interval '${sql.raw(String(days))} days'`).groupBy(analyticsEvents.event).orderBy(sql`count(*) desc`).limit(limit);
  return rows.map((r) => ({ event: r.event, count: Number(r.count) }));
}
async function getSessionCount(db, days = 7) {
  const rows = await db.select({ count: sql`count(distinct ${analyticsEvents.session_id})` }).from(analyticsEvents).where(sql`${analyticsEvents.created_at} > now() - interval '${sql.raw(String(days))} days'`);
  return Number(rows[0]?.count ?? 0);
}
async function getPageViewCount(db, hours = 24) {
  const rows = await db.select({ count: sql`count(*)` }).from(analyticsEvents).where(sql`${analyticsEvents.event} = 'page_view' AND ${analyticsEvents.created_at} > now() - interval '${sql.raw(String(hours))} hours'`);
  return Number(rows[0]?.count ?? 0);
}
async function getMostEngagedAssessments(db, days = 7, limit = 10) {
  const rows = await db.select({
    assessment_id: analyticsEvents.assessment_id,
    count: sql`count(*)`
  }).from(analyticsEvents).where(sql`${analyticsEvents.assessment_id} is not null AND ${analyticsEvents.created_at} > now() - interval '${sql.raw(String(days))} days'`).groupBy(analyticsEvents.assessment_id).orderBy(sql`count(*) desc`).limit(limit);
  return rows.map((r) => ({
    assessment_id: r.assessment_id,
    count: Number(r.count)
  }));
}

export { getSessionCount as a, getPageViewsOverTime as b, getTopPages as c, getTopFeatures as d, getMostEngagedAssessments as e, getPageViewCount as g, insertAnalyticsEvents as i };
//# sourceMappingURL=analytics-events-C4J_4XK6.js.map
