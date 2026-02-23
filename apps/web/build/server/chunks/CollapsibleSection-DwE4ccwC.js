import { ad as attr, a6 as attr_class, a7 as stringify, ab as escape_html, ae as attr_style, a1 as derived } from './index4-DG1itRH8.js';

function CollapsibleSection($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      title,
      subtitle,
      open = false,
      badge,
      badgeVariant = "default",
      headerClass = "",
      children
    } = $$props;
    let expanded = false;
    const panelId = derived(() => `panel-${title.replace(/\s+/g, "-").toLowerCase()}-${Math.random().toString(36).slice(2, 6)}`);
    const badgeColors = {
      default: "bg-primary-light text-primary border-primary",
      success: "bg-success-light text-success border-success",
      warning: "bg-warning-light text-warning border-warning",
      danger: "bg-danger-light text-danger border-danger"
    };
    $$renderer2.push(`<div class="brutal-border bg-surface shadow-sm overflow-hidden scroll-mt-20"><button type="button"${attr("aria-expanded", expanded)}${attr("aria-controls", panelId())}${attr_class(`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary ${stringify(headerClass)}`)}><span${attr_class(`inline-block text-xs transition-transform duration-200 text-text-muted ${stringify("rotate-0")}`)} aria-hidden="true">▶</span> <div class="flex-1 min-w-0"><span class="text-sm font-extrabold uppercase tracking-wider">${escape_html(title)}</span> `);
    if (subtitle) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<span class="ml-2 text-xs text-text-muted font-mono">${escape_html(subtitle)}</span>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    if (badge) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<span${attr_class(`inline-flex items-center px-2 py-0.5 text-xs font-bold uppercase border-2 ${stringify(badgeColors[badgeVariant])}`)}>${escape_html(badge)}</span>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></button> <div${attr("id", panelId())} class="grid transition-[grid-template-rows] duration-250 ease-in-out"${attr_style(`grid-template-rows: ${stringify("0fr")};`)}${attr("aria-hidden", !expanded)}><div class="overflow-hidden">`);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div></div>`);
  });
}

export { CollapsibleSection as C };
//# sourceMappingURL=CollapsibleSection-DwE4ccwC.js.map
