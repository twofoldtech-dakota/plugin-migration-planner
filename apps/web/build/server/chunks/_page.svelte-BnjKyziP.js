import { aa as head, ab as escape_html, ad as attr, a6 as attr_class, ac as ensure_array_like, a7 as stringify, ae as attr_style, a1 as derived } from './index4-DG1itRH8.js';
import { C as Card } from './Card-w7RlWvYA.js';
import { B as Badge } from './Badge-CWejdkwM.js';
import { K as KpiCard } from './KpiCard-D-WYJRm6.js';
import { T as Tooltip } from './Tooltip-hZ63yG7F.js';
import { a as gradeColor } from './pack-grading-B-ZgwrAj.js';
import './ProgressBar-BC01P1QB.js';
import './index-server-CVwIEJCx.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    let search = "";
    let selectedCategory = "";
    let filtered = derived(() => data.packs.filter((p) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.vendor.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    }));
    let verifiedCount = derived(() => data.packs.filter((p) => p.confidence === "verified").length);
    let needsResearch = derived(() => data.packs.filter((p) => p.confidence === "draft" || !p.last_researched).length);
    function formatDate(dateStr) {
      if (!dateStr) return "Never";
      return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    const categoryVariant = {
      platform: "default",
      cms: "default",
      commerce: "info",
      infrastructure: "warning",
      martech: "success",
      ai_dev: "danger",
      service: "muted",
      services: "muted"
    };
    const confidenceVariant = { verified: "success", preliminary: "warning", draft: "muted" };
    function getCategoryVariant(category) {
      return categoryVariant[category.toLowerCase()] ?? "default";
    }
    function getConfidenceVariant(confidence) {
      return confidenceVariant[confidence.toLowerCase()] ?? "muted";
    }
    function totalPathsForPack(packId) {
      return (data.pathCountsAsSource[packId] ?? 0) + (data.pathCountsAsTarget[packId] ?? 0);
    }
    head("u7nvcr", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Knowledge Base | MigrateIQ</title>`);
      });
    });
    $$renderer2.push(`<div class="mx-auto max-w-7xl px-6 py-8 animate-enter"><div class="mb-8"><h1 class="text-2xl font-extrabold uppercase tracking-wider">Knowledge Base</h1> <p class="mt-1 text-sm font-bold text-text-secondary">${escape_html(data.packs.length)} platform${escape_html(data.packs.length === 1 ? "" : "s")} · ${escape_html(data.totalPaths)} migration path${escape_html(data.totalPaths === 1 ? "" : "s")}</p></div> <div class="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">`);
    KpiCard($$renderer2, {
      label: "Platforms",
      value: data.packs.length,
      tooltip: "Total knowledge packs loaded"
    });
    $$renderer2.push(`<!----> `);
    KpiCard($$renderer2, {
      label: "Paths",
      value: data.totalPaths,
      tooltip: "Documented migration paths between platforms"
    });
    $$renderer2.push(`<!----> `);
    KpiCard($$renderer2, {
      label: "Verified",
      value: verifiedCount(),
      variant: "success",
      tooltip: "Packs with verified confidence level"
    });
    $$renderer2.push(`<!----> `);
    KpiCard($$renderer2, {
      label: "Needs Research",
      value: needsResearch(),
      variant: needsResearch() > 0 ? "warning" : "success",
      tooltip: "Packs in draft state or never researched"
    });
    $$renderer2.push(`<!----></div> <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6"><div class="relative flex-1 max-w-md"><input type="text"${attr("value", search)} placeholder="Search platforms..." class="w-full brutal-border-thin px-4 py-2.5 text-sm font-mono bg-surface focus:outline-2 focus:outline-primary placeholder:text-text-muted pr-12"/> <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-text-muted brutal-border-thin px-1.5 py-0.5 bg-bg pointer-events-none" style="max-width: fit-content;">/</span></div> `);
    if (data.categories.length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex flex-wrap gap-1.5"><button${attr_class(`px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 transition-all duration-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${stringify(
        "bg-primary text-white border-primary -translate-y-px shadow-sm"
      )}`)}>All</button> <!--[-->`);
      const each_array = ensure_array_like(data.categories);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let cat = each_array[$$index];
        $$renderer2.push(`<button${attr_class(`px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 transition-all duration-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${stringify(selectedCategory === cat ? "bg-primary text-white border-primary -translate-y-px shadow-sm" : "bg-surface border-border-light text-text-muted hover:border-brutal hover:bg-surface-hover")}`)}>${escape_html(cat)}</button>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    if (data.packs.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="mx-auto max-w-lg py-16 text-center">`);
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="flex flex-col items-center gap-4 py-4"><div class="flex h-16 w-16 items-center justify-center brutal-border bg-primary-light text-3xl text-primary shadow-sm">📚</div> <h2 class="text-xl font-extrabold uppercase tracking-wider">No knowledge packs</h2> <p class="text-text-secondary text-sm leading-relaxed max-w-sm">Knowledge packs are created by research agents or seeded from the database. Run the research pipeline to populate this catalog.</p></div>`);
        }
      });
      $$renderer2.push(`<!----></div>`);
    } else if (filtered().length === 0) {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<div class="py-12 text-center"><p class="text-sm font-bold text-text-muted">No platforms match `);
      if (search.trim()) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`"${escape_html(search)}"`);
      } else {
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
      $$renderer2.push(`<!--]--></p> <button class="mt-2 text-xs font-bold text-primary hover:text-primary-hover">Clear filters</button></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 stagger-grid"><!--[-->`);
      const each_array_1 = ensure_array_like(filtered());
      for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
        let pack = each_array_1[i];
        const stats = data.healthStats[pack.id];
        const grade = data.packGrades[pack.id];
        const pathCount = totalPathsForPack(pack.id);
        $$renderer2.push(`<a${attr("href", `/knowledge/${stringify(pack.id)}`)} class="no-underline group"${attr_style(`--stagger-i: ${stringify(i)};`)}>`);
        Card($$renderer2, {
          hover: true,
          children: ($$renderer3) => {
            $$renderer3.push(`<div class="flex flex-col gap-3"><div class="flex items-start justify-between gap-3"><div class="flex items-center gap-2.5 min-w-0"><div class="flex h-9 w-9 items-center justify-center brutal-border-thin bg-primary-light text-sm text-primary font-extrabold shrink-0 group-hover:-translate-y-px transition-transform">${escape_html(pack.name.charAt(0).toUpperCase())}</div> <div class="min-w-0"><h3 class="font-extrabold text-text text-lg truncate group-hover:text-primary transition-colors">${escape_html(pack.name)}</h3> `);
            if (pack.vendor || pack.latest_version) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<p class="text-xs text-text-muted truncate">${escape_html(pack.vendor)}${escape_html(pack.vendor && pack.latest_version ? " · " : "")}${escape_html(pack.latest_version ? `v${pack.latest_version}` : "")}</p>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--></div></div> `);
            Badge($$renderer3, {
              variant: getCategoryVariant(pack.category),
              children: ($$renderer4) => {
                $$renderer4.push(`<!---->${escape_html(pack.category)}`);
              }
            });
            $$renderer3.push(`<!----></div> <div class="flex items-center gap-2">`);
            Badge($$renderer3, {
              variant: getConfidenceVariant(pack.confidence),
              children: ($$renderer4) => {
                $$renderer4.push(`<!---->${escape_html(pack.confidence)}`);
              }
            });
            $$renderer3.push(`<!----> `);
            if (pack.direction && pack.direction !== "both") {
              $$renderer3.push("<!--[-->");
              Badge($$renderer3, {
                variant: "muted",
                children: ($$renderer4) => {
                  $$renderer4.push(`<!---->${escape_html(pack.direction)}`);
                }
              });
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--> `);
            if (grade) {
              $$renderer3.push("<!--[-->");
              Tooltip($$renderer3, {
                text: `Thoroughness grade: ${stringify(grade.overallScore)}/100 across 9 dimensions`,
                position: "bottom",
                children: ($$renderer4) => {
                  $$renderer4.push(`<span${attr_class(`text-xs font-extrabold font-mono px-1.5 py-0.5 border-2 cursor-help ${stringify(gradeColor(grade.overall))}`)}>${escape_html(grade.overall)}</span>`);
                }
              });
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--></div> `);
            if (stats) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">`);
              if (stats.effortHours > 0) {
                $$renderer3.push("<!--[-->");
                Tooltip($$renderer3, {
                  text: "Effort hour components defined",
                  position: "bottom",
                  children: ($$renderer4) => {
                    $$renderer4.push(`<span class="cursor-help font-mono">${escape_html(stats.effortHours)} components</span>`);
                  }
                });
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--> `);
              if (stats.gotchas > 0) {
                $$renderer3.push("<!--[-->");
                Tooltip($$renderer3, {
                  text: "Gotcha patterns documented",
                  position: "bottom",
                  children: ($$renderer4) => {
                    $$renderer4.push(`<span class="cursor-help font-mono">${escape_html(stats.gotchas)} gotchas</span>`);
                  }
                });
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--> `);
              if (pathCount > 0) {
                $$renderer3.push("<!--[-->");
                Tooltip($$renderer3, {
                  text: "Migration paths involving this platform",
                  position: "bottom",
                  children: ($$renderer4) => {
                    $$renderer4.push(`<span class="cursor-help font-mono">${escape_html(pathCount)} path${escape_html(pathCount === 1 ? "" : "s")}</span>`);
                  }
                });
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--> <div class="flex items-center justify-between border-t-2 border-border-light pt-3 text-xs font-mono text-text-muted"><span>Updated ${escape_html(formatDate(pack.updated_at))}</span> `);
            if (pack.last_researched) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<span>Researched ${escape_html(formatDate(pack.last_researched))}</span>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--></div></div>`);
          }
        });
        $$renderer2.push(`<!----></a>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-BnjKyziP.js.map
