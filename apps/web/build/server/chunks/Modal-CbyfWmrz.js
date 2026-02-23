import { a6 as attr_class, a7 as stringify, ab as escape_html } from './index4-DG1itRH8.js';

function Modal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { open, onclose, title, size = "md", children, footer } = $$props;
    const widths = { sm: "max-w-md", md: "max-w-2xl", lg: "max-w-4xl" };
    $$renderer2.push(`<dialog class="backdrop:bg-black/50 bg-transparent p-0 m-0 max-h-[100dvh] max-w-[100vw] w-full h-full open:flex items-center justify-center"><div${attr_class(`brutal-border bg-surface text-text shadow-lg w-[calc(100%-2rem)] ${stringify(widths[size])} flex flex-col max-h-[85vh]`)}><div class="flex items-center justify-between border-b-3 border-brutal px-5 py-3.5 shrink-0"><h2 class="text-sm font-extrabold uppercase tracking-wider truncate pr-4">${escape_html(title)}</h2> <button class="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text font-bold text-lg brutal-border-thin hover:bg-surface-hover transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" aria-label="Close modal">×</button></div> <div class="overflow-y-auto px-5 py-4 flex-1 min-h-0">`);
    children($$renderer2);
    $$renderer2.push(`<!----></div> `);
    if (footer) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="border-t-3 border-brutal px-5 py-3 shrink-0">`);
      footer($$renderer2);
      $$renderer2.push(`<!----></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></dialog>`);
  });
}

export { Modal as M };
//# sourceMappingURL=Modal-CbyfWmrz.js.map
