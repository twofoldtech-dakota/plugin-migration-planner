import { aa as head, ac as ensure_array_like, a6 as attr_class, ab as escape_html, a7 as stringify, ad as attr, a1 as derived } from './index4-DG1itRH8.js';
import './root-DQzxKDPP.js';
import './state.svelte-DeAIIc79.js';
import { C as Card } from './Card-w7RlWvYA.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    let currentStep = 0;
    const steps = ["Client", "Proficiency", "Project", "Review"];
    let newClientName = "";
    let newClientIndustry = "";
    const step1Valid = derived(
      () => newClientName.trim().length > 0
    );
    head("1ax4549", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>New Assessment | MigrateIQ</title>`);
      });
    });
    $$renderer2.push(`<div class="mx-auto max-w-3xl px-6 py-8 animate-enter"><div class="mb-8"><a href="/" class="text-sm font-bold text-text-muted hover:text-primary transition-colors">← Back to Overview</a> <h1 class="text-2xl font-extrabold uppercase tracking-wider mt-4">New Assessment</h1></div> <div class="flex items-center gap-1 mb-8"><!--[-->`);
    const each_array = ensure_array_like(steps);
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let step = each_array[i];
      $$renderer2.push(`<div class="flex-1 flex flex-col items-center gap-1.5"><div${attr_class(`w-full h-2 rounded-sm transition-colors ${stringify(i < currentStep ? "bg-success" : i === currentStep ? "bg-primary" : "bg-border-light")}`)}></div> <span${attr_class(`text-[10px] font-bold uppercase tracking-wider ${stringify(i <= currentStep ? "text-text" : "text-text-muted")}`)}>${escape_html(step)}</span></div> `);
      if (i < steps.length - 1) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="w-2"></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push("<!--[-->");
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="space-y-6"><h2 class="text-lg font-extrabold uppercase tracking-wider">Select Client</h2> <div class="flex gap-3"><button${attr_class(`flex-1 brutal-border-thin px-4 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${stringify(
            "bg-primary text-white border-primary"
          )}`)}>New Client</button> <button${attr_class(`flex-1 brutal-border-thin px-4 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${stringify("bg-surface hover:bg-surface-hover")}`)}${attr("disabled", data.clients.length === 0, true)}>Existing Client `);
          if (data.clients.length > 0) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<span class="text-[10px] opacity-70">(${escape_html(data.clients.length)})</span>`);
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]--></button></div> `);
          {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="space-y-4"><div><label class="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5" for="client-name">Client Name *</label> <input id="client-name" type="text"${attr("value", newClientName)} placeholder="e.g. Acme Corp" class="w-full brutal-border-thin bg-bg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-primary"/></div> <div><label class="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5" for="client-industry">Industry</label> `);
            $$renderer3.select(
              {
                id: "client-industry",
                value: newClientIndustry,
                class: "w-full brutal-border-thin bg-bg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-primary"
              },
              ($$renderer4) => {
                $$renderer4.option({ value: "" }, ($$renderer5) => {
                  $$renderer5.push(`Select...`);
                });
                $$renderer4.option({ value: "ecommerce" }, ($$renderer5) => {
                  $$renderer5.push(`E-Commerce`);
                });
                $$renderer4.option({ value: "finance" }, ($$renderer5) => {
                  $$renderer5.push(`Finance`);
                });
                $$renderer4.option({ value: "healthcare" }, ($$renderer5) => {
                  $$renderer5.push(`Healthcare`);
                });
                $$renderer4.option({ value: "manufacturing" }, ($$renderer5) => {
                  $$renderer5.push(`Manufacturing`);
                });
                $$renderer4.option({ value: "media" }, ($$renderer5) => {
                  $$renderer5.push(`Media &amp; Entertainment`);
                });
                $$renderer4.option({ value: "retail" }, ($$renderer5) => {
                  $$renderer5.push(`Retail`);
                });
                $$renderer4.option({ value: "technology" }, ($$renderer5) => {
                  $$renderer5.push(`Technology`);
                });
                $$renderer4.option({ value: "other" }, ($$renderer5) => {
                  $$renderer5.push(`Other`);
                });
              }
            );
            $$renderer3.push(`</div></div>`);
          }
          $$renderer3.push(`<!--]--> <div class="flex justify-end pt-2"><button${attr_class(`brutal-border-thin px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition-colors ${stringify(step1Valid() ? "bg-primary text-white border-primary hover:bg-primary-hover" : "bg-border-light text-text-muted cursor-not-allowed")}`)}${attr("disabled", !step1Valid(), true)}>Next</button></div></div>`);
        }
      });
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-CYsvIUUb.js.map
