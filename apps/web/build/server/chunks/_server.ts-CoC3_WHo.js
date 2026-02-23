import { j as json } from './index-wpIsICWW.js';
import { d as db } from './db-BWpbog7L.js';
import { i as insertAnalyticsEvents } from './analytics-events-C4J_4XK6.js';
import 'events';
import 'util';
import 'crypto';
import 'dns';
import 'fs';
import 'net';
import 'tls';
import 'path';
import 'stream';
import 'string_decoder';
import './shared-server-DaWdgxVh.js';

const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const { session_id, events } = body;
    if (!session_id || !Array.isArray(events) || events.length === 0) {
      return json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }
    const batch = events.slice(0, 100).map((e) => ({
      session_id: String(session_id),
      event: String(e.event ?? "unknown"),
      category: String(e.category ?? ""),
      properties: e.properties ?? {},
      path: String(e.path ?? ""),
      assessment_id: e.assessment_id ? String(e.assessment_id) : null,
      created_at: e.created_at ? String(e.created_at) : void 0
    }));
    await insertAnalyticsEvents(db(), batch);
    return json({ ok: true });
  } catch {
    return json({ ok: false, error: "Server error" }, { status: 500 });
  }
};

export { POST };
//# sourceMappingURL=_server.ts-CoC3_WHo.js.map
