import { ac as ensure_array_like, ad as attr, a6 as attr_class, a7 as stringify, ab as escape_html } from './index4-DG1itRH8.js';
import { p as page } from './index3-fupcZyp6.js';
import './client-Cm3t_ao5.js';
import './state.svelte-DeAIIc79.js';
import './root-DQzxKDPP.js';
import './index-mV5xf0Xo.js';

function AnalyticsNav($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const tabs = [
      { href: "/analytics", label: "Overview", exact: true },
      { href: "/analytics/portfolio", label: "Portfolio" },
      { href: "/analytics/estimates", label: "Estimates" },
      { href: "/analytics/confidence", label: "Confidence" },
      { href: "/analytics/calibration", label: "Calibration" },
      { href: "/analytics/knowledge", label: "Knowledge" },
      { href: "/analytics/usage", label: "Usage" }
    ];
    function isActive(tab) {
      if (tab.exact) return page.url.pathname === tab.href;
      return page.url.pathname.startsWith(tab.href);
    }
    $$renderer2.push(`<nav class="flex items-center gap-1 flex-wrap"><!--[-->`);
    const each_array = ensure_array_like(tabs);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let tab = each_array[$$index];
      $$renderer2.push(`<a${attr("href", tab.href)}${attr_class(`brutal-border-thin px-3 py-1.5 text-xs font-bold uppercase tracking-wider no-underline transition-all duration-150 ${stringify(isActive(tab) ? "bg-primary text-white shadow-sm -translate-x-px -translate-y-px" : "bg-surface text-text-secondary hover:bg-surface-hover hover:-translate-x-px hover:-translate-y-px hover:shadow-sm")}`)}>${escape_html(tab.label)}</a>`);
    }
    $$renderer2.push(`<!--]--></nav>`);
  });
}
function _layout($$renderer, $$props) {
  let { children } = $$props;
  $$renderer.push(`<div class="mx-auto max-w-7xl px-6 pt-8 pb-12 animate-enter"><div class="mb-6"><a href="/" class="text-xs font-bold text-primary hover:text-primary-hover no-underline mb-2 inline-block">← Dashboard</a> <h1 class="text-2xl font-extrabold uppercase tracking-wider">Analytics</h1></div> <div class="mb-8">`);
  AnalyticsNav($$renderer);
  $$renderer.push(`<!----></div> `);
  children($$renderer);
  $$renderer.push(`<!----></div>`);
}

export { _layout as default };
//# sourceMappingURL=_layout.svelte-_ucPTOOI.js.map
