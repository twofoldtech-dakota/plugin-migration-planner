import { aa as head, ab as escape_html, ad as attr, ac as ensure_array_like, a7 as stringify, ae as attr_style, a1 as derived } from './index4-DG1itRH8.js';
import { C as Card } from './Card-w7RlWvYA.js';
import { B as Badge } from './Badge-CWejdkwM.js';
import { M as Modal } from './Modal-CbyfWmrz.js';
import { T as Tooltip } from './Tooltip-hZ63yG7F.js';
import './index-server-CVwIEJCx.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    let search = "";
    let filtered = derived(() => search.trim() ? data.clients.filter((c) => {
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || parseIndustries(c.industry).some((tag) => tag.toLowerCase().includes(q));
    }) : data.clients);
    let showNewModal = false;
    let newName = "";
    let newIndustry = "";
    let newNotes = "";
    let saving = false;
    function formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
    const industryVariant = {
      healthcare: "danger",
      finance: "warning",
      retail: "info",
      technology: "success",
      education: "default",
      manufacturing: "warning",
      government: "info"
    };
    function getIndustryVariant(industry) {
      return industryVariant[industry.toLowerCase()] ?? "default";
    }
    function parseIndustries(raw) {
      return raw.split(",").map((s) => s.trim()).filter(Boolean);
    }
    head("10v80gf", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Clients | MigrateIQ</title>`);
      });
    });
    $$renderer2.push(`<div class="mx-auto max-w-7xl px-6 py-8 animate-enter"><div class="mb-8"><div class="flex items-center gap-2"><h1 class="text-2xl font-extrabold uppercase tracking-wider">Client Directory</h1> <button class="ml-auto brutal-border-thin px-4 py-2 text-xs font-bold uppercase tracking-wider bg-primary text-white border-primary hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">+ New Client</button></div> <p class="mt-1 text-sm font-bold text-text-secondary">${escape_html(data.clients.length)} client${escape_html(data.clients.length === 1 ? "" : "s")} · Track proficiencies and AI tool preferences per organization</p></div> `);
    if (data.clients.length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="mb-6 relative"><input type="text"${attr("value", search)} placeholder="Search by name or industry..." class="w-full max-w-md brutal-border-thin px-4 py-2.5 text-sm font-mono bg-surface focus:outline-2 focus:outline-primary placeholder:text-text-muted pr-12"/> <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-text-muted brutal-border-thin px-1.5 py-0.5 bg-bg pointer-events-none" style="max-width: fit-content;">/</span></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (data.clients.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="mx-auto max-w-lg py-16 text-center">`);
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="flex flex-col items-center gap-4 py-4"><div class="flex h-16 w-16 items-center justify-center brutal-border bg-primary-light text-3xl text-primary shadow-sm">♔</div> <h2 class="text-xl font-extrabold uppercase tracking-wider">No clients yet</h2> <p class="text-text-secondary text-sm leading-relaxed max-w-sm">Create your first client profile to track team proficiencies, AI tool preferences, and link assessments.</p> <button class="brutal-border-thin px-6 py-3 text-sm font-bold uppercase tracking-wider bg-primary text-white border-primary hover:bg-primary-hover transition-colors">Create First Client</button></div>`);
        }
      });
      $$renderer2.push(`<!----></div>`);
    } else if (filtered().length === 0) {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<div class="py-12 text-center"><p class="text-sm font-bold text-text-muted">No clients match "${escape_html(search)}"</p> <button class="mt-2 text-xs font-bold text-primary hover:text-primary-hover">Clear search</button></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 stagger-grid"><!--[-->`);
      const each_array = ensure_array_like(filtered());
      for (let i = 0, $$length = each_array.length; i < $$length; i++) {
        let client = each_array[i];
        const count = data.assessmentCounts[client.id] ?? 0;
        const prof = data.proficiencySummaries[client.id];
        $$renderer2.push(`<a${attr("href", `/clients/${stringify(client.id)}`)} class="no-underline group"${attr_style(`--stagger-i: ${stringify(i)};`)}>`);
        Card($$renderer2, {
          hover: true,
          children: ($$renderer3) => {
            $$renderer3.push(`<div class="flex flex-col gap-3"><div class="flex items-start justify-between gap-3"><div class="flex items-center gap-2.5 min-w-0"><div class="flex h-9 w-9 items-center justify-center brutal-border-thin bg-primary-light text-sm text-primary font-extrabold shrink-0 group-hover:-translate-y-px transition-transform">${escape_html(client.name.charAt(0).toUpperCase())}</div> <h3 class="font-extrabold text-text text-lg truncate group-hover:text-primary transition-colors">${escape_html(client.name)}</h3></div> `);
            if (client.industry) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="flex flex-wrap gap-1"><!--[-->`);
              const each_array_1 = ensure_array_like(parseIndustries(client.industry));
              for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
                let tag = each_array_1[$$index];
                Badge($$renderer3, {
                  variant: getIndustryVariant(tag),
                  children: ($$renderer4) => {
                    $$renderer4.push(`<!---->${escape_html(tag)}`);
                  }
                });
              }
              $$renderer3.push(`<!--]--></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--></div> `);
            if (client.notes) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<p class="text-sm text-text-secondary line-clamp-2">${escape_html(client.notes)}</p>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--> `);
            if (prof && prof.total > 0) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="flex items-center gap-2"><span class="text-[10px] font-bold uppercase tracking-wider text-text-muted">Proficiencies</span> `);
              Tooltip($$renderer3, {
                text: `${stringify(prof.filled)} of ${stringify(prof.total)} categories rated`,
                position: "bottom",
                children: ($$renderer4) => {
                  $$renderer4.push(`<span class="text-xs font-mono font-bold cursor-help">${escape_html(prof.filled)}/${escape_html(prof.total)}</span>`);
                }
              });
              $$renderer3.push(`<!----></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--> <div class="flex items-center justify-between border-t-2 border-border-light pt-3 text-xs font-mono text-text-muted"><span>${escape_html(count)} assessment${escape_html(count === 1 ? "" : "s")}</span> <span>Updated ${escape_html(formatDate(client.updated_at))}</span></div></div>`);
          }
        });
        $$renderer2.push(`<!----></a>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      let footer = function($$renderer3) {
        $$renderer3.push(`<div class="flex justify-end gap-3"><button class="brutal-border-thin px-4 py-2 text-xs font-bold uppercase tracking-wider bg-surface hover:bg-surface-hover transition-colors">Cancel</button> <button${attr("disabled", !newName.trim() || saving, true)} class="brutal-border-thin px-4 py-2 text-xs font-bold uppercase tracking-wider bg-primary text-white border-primary hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">${escape_html("Create Client")}</button></div>`);
      };
      Modal($$renderer2, {
        open: showNewModal,
        onclose: () => showNewModal = false,
        title: "New Client",
        size: "md",
        footer,
        children: ($$renderer3) => {
          $$renderer3.push(`<form class="space-y-4"><div><label for="client-name" class="block text-xs font-extrabold uppercase tracking-wider mb-1.5">Name <span class="text-danger">*</span></label> <input id="client-name" type="text"${attr("value", newName)} placeholder="Acme Corp" required="" class="w-full brutal-border-thin px-3 py-2 text-sm font-mono bg-surface focus:outline-2 focus:outline-primary placeholder:text-text-muted"/></div> <div><label for="client-industry" class="block text-xs font-extrabold uppercase tracking-wider mb-1.5">Industry</label> <input id="client-industry" type="text"${attr("value", newIndustry)} placeholder="e.g. Healthcare, Finance, Retail (comma-separated)" class="w-full brutal-border-thin px-3 py-2 text-sm font-mono bg-surface focus:outline-2 focus:outline-primary placeholder:text-text-muted"/></div> <div><label for="client-notes" class="block text-xs font-extrabold uppercase tracking-wider mb-1.5">Notes</label> <textarea id="client-notes" placeholder="Key contacts, special considerations..." rows="3" class="w-full brutal-border-thin px-3 py-2 text-sm font-mono bg-surface focus:outline-2 focus:outline-primary placeholder:text-text-muted resize-y">`);
          const $$body = escape_html(newNotes);
          if ($$body) {
            $$renderer3.push(`${$$body}`);
          }
          $$renderer3.push(`</textarea></div></form>`);
        }
      });
    }
    $$renderer2.push(`<!---->`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-Dm27_Hql.js.map
