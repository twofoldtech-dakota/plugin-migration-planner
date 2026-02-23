import { ac as ensure_array_like, ad as attr, a7 as stringify, a6 as attr_class, ab as escape_html } from './index4-DG1itRH8.js';

function Tabs($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { tabs, active, onchange, children } = $$props;
    $$renderer2.push(`<div><div role="tablist" class="flex gap-0 border-b-3 border-brutal mb-4"><!--[-->`);
    const each_array = ensure_array_like(tabs);
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let tab = each_array[i];
      $$renderer2.push(`<button role="tab"${attr("data-tab-id", tab.id)}${attr("aria-selected", active === tab.id)}${attr("aria-controls", `panel-${stringify(tab.id)}`)}${attr("tabindex", active === tab.id ? 0 : -1)}${attr_class(`px-4 py-2.5 text-sm font-bold uppercase tracking-wider border-3 border-b-0 border-brutal -mb-[3px] transition-all duration-150 ${stringify(active === tab.id ? "bg-surface text-text border-b-3 border-b-surface z-10 -translate-y-px" : "bg-bg text-text-muted hover:text-text hover:bg-surface-hover")} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`)}>${escape_html(tab.label)} `);
      if (tab.count !== void 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<span${attr_class(`ml-1.5 inline-flex items-center justify-center min-w-5 h-5 px-1 text-xs font-mono font-bold ${stringify(active === tab.id ? "bg-primary text-white" : "bg-border-light text-text-muted")} border border-brutal`)}>${escape_html(tab.count)}</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></button>`);
    }
    $$renderer2.push(`<!--]--></div> `);
    children($$renderer2);
    $$renderer2.push(`<!----></div>`);
  });
}

export { Tabs as T };
//# sourceMappingURL=Tabs-CIZXvs-S.js.map
