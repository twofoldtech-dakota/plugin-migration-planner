import { aa as head, ab as escape_html, a1 as derived } from './index4-DG1itRH8.js';
import { p as page } from './index3-fupcZyp6.js';
import './client-Cm3t_ao5.js';
import './state.svelte-DeAIIc79.js';
import './root-DQzxKDPP.js';
import './index-mV5xf0Xo.js';

function _error($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const status = derived(() => page.status);
    const message = derived(() => page.error?.message ?? "Something went wrong");
    const is404 = derived(() => status() === 404);
    const headline = derived(() => is404() ? "Page not found" : "Something broke");
    const description = derived(() => is404() ? "The page you're looking for doesn't exist or has been moved." : "An unexpected error occurred. Try refreshing the page or head back to the dashboard.");
    head("1j96wlh", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html(status())} — ${escape_html(headline())} | MigrateIQ</title>`);
      });
    });
    $$renderer2.push(`<div class="mx-auto max-w-lg px-6 py-20 text-center animate-enter"><div class="inline-flex items-center justify-center brutal-border bg-surface shadow-lg px-8 py-5 mb-8"><span class="text-7xl font-extrabold font-mono tracking-tighter text-primary leading-none">${escape_html(status())}</span></div> <h1 class="text-2xl font-extrabold uppercase tracking-wider mb-3">${escape_html(headline())}</h1> <p class="text-sm text-text-secondary leading-relaxed max-w-sm mx-auto mb-8">${escape_html(description())}</p> `);
    if (!is404() && message()) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="brutal-border-thin bg-danger-light text-left px-4 py-3 mb-8 max-w-sm mx-auto"><span class="text-[10px] font-extrabold uppercase tracking-wider text-danger block mb-1">Error Detail</span> <p class="text-xs font-mono text-text break-words">${escape_html(message())}</p></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="flex items-center justify-center gap-3"><a href="/" class="brutal-border-thin px-6 py-3 text-sm font-bold uppercase tracking-wider bg-primary text-white border-primary hover:bg-primary-hover transition-colors no-underline">Back to Dashboard</a> `);
    if (!is404()) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="brutal-border-thin px-6 py-3 text-sm font-bold uppercase tracking-wider bg-surface text-text hover:bg-surface-hover transition-colors cursor-pointer">Retry</button>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}

export { _error as default };
//# sourceMappingURL=_error.svelte-DJVZBF-6.js.map
