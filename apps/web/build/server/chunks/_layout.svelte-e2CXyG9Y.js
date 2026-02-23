import { o as onDestroy } from './index-server-CVwIEJCx.js';
import './root-DQzxKDPP.js';
import './state.svelte-DeAIIc79.js';
import { p as page } from './index3-fupcZyp6.js';
import { a6 as attr_class, a7 as stringify } from './index4-DG1itRH8.js';
import './client-Cm3t_ao5.js';
import './index-mV5xf0Xo.js';

function ThemeToggle($$renderer) {
  $$renderer.push(`<button class="brutal-border-thin flex h-9 w-9 items-center justify-center bg-surface text-text transition-transform hover:-translate-x-px hover:-translate-y-px hover:shadow-sm active:translate-x-0 active:translate-y-0 active:shadow-none" aria-label="Toggle dark mode">`);
  {
    $$renderer.push("<!--[!-->");
    $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`);
  }
  $$renderer.push(`<!--]--></button>`);
}
function AppHeader($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<header class="sticky top-0 z-50 border-b-3 border-brutal bg-surface"><div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-6"><a href="/" class="flex items-center gap-2.5 no-underline text-text group" aria-label="MigrateIQ home"><svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true" class="shrink-0 transition-transform duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:-rotate-6"><rect x="5" y="5" width="16" height="16" style="fill: var(--color-primary)"></rect><rect x="2" y="2" width="16" height="16" stroke-width="3" style="stroke: var(--color-brutal); fill: var(--color-surface)"></rect><line x1="14" y1="14" x2="28" y2="28" stroke-width="4" stroke-linecap="square" style="stroke: var(--color-primary)"></line></svg> <span class="flex items-baseline gap-1"><span class="text-[1.15rem] font-extrabold uppercase tracking-wider leading-none">Migrate</span> <span class="text-[1.15rem] font-extrabold leading-none text-white bg-primary px-1.5 py-0.5 border-2 border-brutal tracking-tight">IQ</span></span></a> <div class="flex items-center gap-4"><nav class="flex items-center gap-1 text-sm font-bold"><a href="/"${attr_class(`brutal-border-thin px-3 py-1 no-underline transition-all duration-150 ${stringify(page.url.pathname === "/" ? "bg-primary text-white shadow-sm -translate-x-px -translate-y-px" : "bg-surface text-text-secondary hover:bg-surface-hover hover:-translate-x-px hover:-translate-y-px hover:shadow-sm")}`)}>Dashboard</a> <a href="/assessments"${attr_class(`brutal-border-thin px-3 py-1 no-underline transition-all duration-150 ${stringify(page.url.pathname.startsWith("/assessments") ? "bg-primary text-white shadow-sm -translate-x-px -translate-y-px" : "bg-surface text-text-secondary hover:bg-surface-hover hover:-translate-x-px hover:-translate-y-px hover:shadow-sm")}`)}>Assessments</a> <a href="/clients"${attr_class(`brutal-border-thin px-3 py-1 no-underline transition-all duration-150 ${stringify(page.url.pathname.startsWith("/clients") ? "bg-primary text-white shadow-sm -translate-x-px -translate-y-px" : "bg-surface text-text-secondary hover:bg-surface-hover hover:-translate-x-px hover:-translate-y-px hover:shadow-sm")}`)}>Clients</a> <a href="/knowledge"${attr_class(`brutal-border-thin px-3 py-1 no-underline transition-all duration-150 ${stringify(page.url.pathname.startsWith("/knowledge") ? "bg-primary text-white shadow-sm -translate-x-px -translate-y-px" : "bg-surface text-text-secondary hover:bg-surface-hover hover:-translate-x-px hover:-translate-y-px hover:shadow-sm")}`)}>Knowledge</a> <a href="/analytics"${attr_class(`brutal-border-thin px-3 py-1 no-underline transition-all duration-150 ${stringify(page.url.pathname.startsWith("/analytics") ? "bg-primary text-white shadow-sm -translate-x-px -translate-y-px" : "bg-surface text-text-secondary hover:bg-surface-hover hover:-translate-x-px hover:-translate-y-px hover:shadow-sm")}`)}>Analytics</a> <a href="/planning"${attr_class(`brutal-border-thin px-3 py-1 no-underline transition-all duration-150 ${stringify(page.url.pathname.startsWith("/planning") ? "bg-primary text-white shadow-sm -translate-x-px -translate-y-px" : "bg-surface text-text-secondary hover:bg-surface-hover hover:-translate-x-px hover:-translate-y-px hover:shadow-sm")}`)}>Planning</a></nav> `);
    ThemeToggle($$renderer2);
    $$renderer2.push(`<!----></div></div></header>`);
  });
}
function NavigationProgress($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
const FLUSH_INTERVAL_MS = 3e4;
const FLUSH_THRESHOLD = 20;
class AnalyticsTracker {
  buffer = [];
  sessionId = "";
  timer = null;
  boundFlush;
  constructor() {
    this.boundFlush = () => this.flush();
  }
  init() {
    this.sessionId = crypto.randomUUID();
    this.timer = setInterval(this.boundFlush, FLUSH_INTERVAL_MS);
    window.addEventListener("beforeunload", this.boundFlush);
  }
  destroy() {
    this.flush();
    if (this.timer) clearInterval(this.timer);
    if (typeof window !== "undefined") {
      window.removeEventListener("beforeunload", this.boundFlush);
    }
  }
  trackEvent(event, category, properties = {}) {
    this.buffer.push({
      event,
      category,
      properties,
      path: window.location.pathname,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    if (this.buffer.length >= FLUSH_THRESHOLD) {
      this.flush();
    }
  }
  trackPageView(path, assessmentId) {
    this.buffer.push({
      event: "page_view",
      category: "navigation",
      properties: {},
      path,
      assessment_id: assessmentId ?? null,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    if (this.buffer.length >= FLUSH_THRESHOLD) {
      this.flush();
    }
  }
  flush() {
    if (this.buffer.length === 0 || !this.sessionId) return;
    const events = [...this.buffer];
    this.buffer = [];
    const body = JSON.stringify({ session_id: this.sessionId, events });
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/events", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/analytics/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true
      }).catch(() => {
      });
    }
  }
}
const tracker = new AnalyticsTracker();
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { children } = $$props;
    onDestroy(() => tracker.destroy());
    NavigationProgress($$renderer2);
    $$renderer2.push(`<!----> <div class="min-h-screen flex flex-col">`);
    AppHeader($$renderer2);
    $$renderer2.push(`<!----> <main class="flex-1">`);
    children($$renderer2);
    $$renderer2.push(`<!----></main></div>`);
  });
}

export { _layout as default };
//# sourceMappingURL=_layout.svelte-e2CXyG9Y.js.map
