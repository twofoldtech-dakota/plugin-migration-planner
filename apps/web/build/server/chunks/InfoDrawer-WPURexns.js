import { a6 as attr_class, a7 as stringify, ab as escape_html } from './index4-DG1itRH8.js';

function InfoDrawer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { open, onclose, title, children } = $$props;
    if (open) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="fixed inset-0 bg-black/40 z-40 cursor-default" aria-label="Close drawer" tabindex="-1"></button>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div${attr_class(`fixed top-0 right-0 bottom-0 w-full max-w-md z-50 bg-surface border-l-3 border-brutal shadow-lg flex flex-col transition-transform duration-200 ${stringify(open ? "translate-x-0" : "translate-x-full")}`)}><div class="flex items-center justify-between border-b-3 border-brutal p-4"><h2 class="text-sm font-extrabold uppercase tracking-wider">${escape_html(title)}</h2> <button class="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text font-bold text-lg brutal-border-thin hover:bg-surface-hover transition-colors" aria-label="Close">×</button></div> <div class="overflow-y-auto p-6 flex-1">`);
    children($$renderer2);
    $$renderer2.push(`<!----></div></div>`);
  });
}

export { InfoDrawer as I };
//# sourceMappingURL=InfoDrawer-WPURexns.js.map
