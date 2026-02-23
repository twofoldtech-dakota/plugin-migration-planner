import { ad as attr, ab as escape_html } from './index4-DG1itRH8.js';
import { C as Card } from './Card-w7RlWvYA.js';
import { P as ProgressBar } from './ProgressBar-BC01P1QB.js';
import { T as Tooltip } from './Tooltip-hZ63yG7F.js';

function KpiCard($$renderer, $$props) {
  let { label, value, detail, href, variant, progress, tooltip } = $$props;
  function labelContent($$renderer2) {
    if (tooltip) {
      $$renderer2.push("<!--[-->");
      Tooltip($$renderer2, {
        text: tooltip,
        position: "bottom",
        children: ($$renderer3) => {
          $$renderer3.push(`<span class="text-xs font-bold uppercase tracking-wider text-text-muted cursor-help">${escape_html(label)}</span>`);
        }
      });
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<span class="text-xs font-bold uppercase tracking-wider text-text-muted">${escape_html(label)}</span>`);
    }
    $$renderer2.push(`<!--]-->`);
  }
  if (href) {
    $$renderer.push("<!--[-->");
    $$renderer.push(`<a${attr("href", href)} class="no-underline group block">`);
    Card($$renderer, {
      hover: true,
      children: ($$renderer2) => {
        $$renderer2.push(`<div class="space-y-3"><div class="flex items-start justify-between gap-2"><div>`);
        labelContent($$renderer2);
        $$renderer2.push(`<!----> <p class="text-2xl font-extrabold font-mono mt-0.5">${escape_html(value)}</p> `);
        if (detail) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<p class="text-xs text-text-secondary mt-0.5">${escape_html(detail)}</p>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></div> <span class="text-text-muted group-hover:text-primary transition-colors text-lg">→</span></div> `);
        if (progress !== void 0 && variant) {
          $$renderer2.push("<!--[-->");
          ProgressBar($$renderer2, { value: progress, variant });
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></div>`);
      }
    });
    $$renderer.push(`<!----></a>`);
  } else {
    $$renderer.push("<!--[!-->");
    Card($$renderer, {
      children: ($$renderer2) => {
        $$renderer2.push(`<div class="space-y-3"><div>`);
        labelContent($$renderer2);
        $$renderer2.push(`<!----> <p class="text-2xl font-extrabold font-mono mt-0.5">${escape_html(value)}</p> `);
        if (detail) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<p class="text-xs text-text-secondary mt-0.5">${escape_html(detail)}</p>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></div> `);
        if (progress !== void 0 && variant) {
          $$renderer2.push("<!--[-->");
          ProgressBar($$renderer2, { value: progress, variant });
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></div>`);
      }
    });
  }
  $$renderer.push(`<!--]-->`);
}

export { KpiCard as K };
//# sourceMappingURL=KpiCard-D-WYJRm6.js.map
