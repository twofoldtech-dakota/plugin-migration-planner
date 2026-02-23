import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { insertAnalyticsEvents } from '@migration-planner/db';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { session_id, events } = body;

		if (!session_id || !Array.isArray(events) || events.length === 0) {
			return json({ ok: false, error: 'Invalid payload' }, { status: 400 });
		}

		// Cap batch size to prevent abuse
		const batch = events.slice(0, 100).map((e: Record<string, unknown>) => ({
			session_id: String(session_id),
			event: String(e.event ?? 'unknown'),
			category: String(e.category ?? ''),
			properties: (e.properties ?? {}) as Record<string, unknown>,
			path: String(e.path ?? ''),
			assessment_id: e.assessment_id ? String(e.assessment_id) : null,
			created_at: e.created_at ? String(e.created_at) : undefined,
		}));

		await insertAnalyticsEvents(db(), batch);
		return json({ ok: true });
	} catch {
		return json({ ok: false, error: 'Server error' }, { status: 500 });
	}
};
