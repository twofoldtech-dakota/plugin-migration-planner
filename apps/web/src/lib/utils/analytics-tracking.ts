interface BufferedEvent {
	event: string;
	category: string;
	properties: Record<string, unknown>;
	path: string;
	assessment_id?: string | null;
	created_at: string;
}

const FLUSH_INTERVAL_MS = 30_000;
const FLUSH_THRESHOLD = 20;

export class AnalyticsTracker {
	private buffer: BufferedEvent[] = [];
	private sessionId: string = '';
	private timer: ReturnType<typeof setInterval> | null = null;
	private boundFlush: () => void;

	constructor() {
		this.boundFlush = () => this.flush();
	}

	init() {
		this.sessionId = crypto.randomUUID();
		this.timer = setInterval(this.boundFlush, FLUSH_INTERVAL_MS);
		window.addEventListener('beforeunload', this.boundFlush);
	}

	destroy() {
		this.flush();
		if (this.timer) clearInterval(this.timer);
		if (typeof window !== 'undefined') {
			window.removeEventListener('beforeunload', this.boundFlush);
		}
	}

	trackEvent(event: string, category: string, properties: Record<string, unknown> = {}) {
		this.buffer.push({
			event,
			category,
			properties,
			path: window.location.pathname,
			created_at: new Date().toISOString(),
		});
		if (this.buffer.length >= FLUSH_THRESHOLD) {
			this.flush();
		}
	}

	trackPageView(path: string, assessmentId?: string) {
		this.buffer.push({
			event: 'page_view',
			category: 'navigation',
			properties: {},
			path,
			assessment_id: assessmentId ?? null,
			created_at: new Date().toISOString(),
		});
		if (this.buffer.length >= FLUSH_THRESHOLD) {
			this.flush();
		}
	}

	private flush() {
		if (this.buffer.length === 0 || !this.sessionId) return;

		const events = [...this.buffer];
		this.buffer = [];

		const body = JSON.stringify({ session_id: this.sessionId, events });

		if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
			navigator.sendBeacon('/api/analytics/events', new Blob([body], { type: 'application/json' }));
		} else {
			fetch('/api/analytics/events', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body,
				keepalive: true,
			}).catch(() => {});
		}
	}
}

export const tracker = new AnalyticsTracker();
