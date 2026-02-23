import { aa as head, ac as ensure_array_like, ad as attr, a7 as stringify, ab as escape_html, a6 as attr_class, a1 as derived } from './index4-DG1itRH8.js';
import { K as KpiCard } from './KpiCard-D-WYJRm6.js';
import { C as Card } from './Card-w7RlWvYA.js';
import { D as DonutChart } from './DonutChart-Dlc0pZpB.js';
import { H as HorizontalBarChart } from './HorizontalBarChart-Bhs5XmzU.js';
import { R as RadarChart } from './RadarChart-BEXblXiD.js';
import { a as gradeColor } from './pack-grading-B-ZgwrAj.js';
import './ProgressBar-BC01P1QB.js';
import './Tooltip-hZ63yG7F.js';
import './index-server-CVwIEJCx.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    let sortedGrades = derived(() => [...data.packGrades].sort((a, b) => b.overallScore - a.overallScore));
    head("bduizg", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Knowledge Health | MigrateIQ</title>`);
      });
    });
    $$renderer2.push(`<div><p class="text-sm text-text-muted mb-6">Knowledge pack completeness, thoroughness grades, and source URL health.</p> <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">`);
    KpiCard($$renderer2, { label: "Knowledge Packs", value: data.kpis.packs });
    $$renderer2.push(`<!----> `);
    KpiCard($$renderer2, { label: "Migration Paths", value: data.kpis.paths });
    $$renderer2.push(`<!----> `);
    KpiCard($$renderer2, { label: "Source URLs", value: data.kpis.sourceUrls });
    $$renderer2.push(`<!----> `);
    KpiCard($$renderer2, {
      label: "Stale URLs",
      value: data.kpis.staleUrls,
      variant: data.kpis.staleUrls > 5 ? "danger" : data.kpis.staleUrls > 0 ? "warning" : "success"
    });
    $$renderer2.push(`<!----></div> `);
    if (data.kpis.packs === 0) {
      $$renderer2.push("<!--[-->");
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="flex flex-col items-center gap-4 py-12 text-center"><div class="flex h-16 w-16 items-center justify-center brutal-border bg-primary-light text-3xl text-primary shadow-sm">📚</div> <h2 class="text-lg font-extrabold uppercase tracking-wider">No Knowledge Packs Yet</h2> <p class="text-sm text-text-muted max-w-md">Knowledge packs are built through the research pipeline. Run a research task to create your first pack.</p> <a href="/knowledge" class="brutal-border-thin px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-primary text-white border-primary hover:bg-primary-hover transition-colors no-underline">View Knowledge</a></div>`);
        }
      });
    } else {
      $$renderer2.push("<!--[!-->");
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<h2 class="text-sm font-extrabold uppercase tracking-wider mb-6">Pack Thoroughness Grades</h2> `);
          if (sortedGrades().length > 0) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><!--[-->`);
            const each_array = ensure_array_like(sortedGrades());
            for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
              let grade = each_array[$$index];
              $$renderer3.push(`<div class="brutal-border-thin p-4 bg-bg"><div class="flex items-center justify-between mb-3"><a${attr("href", `/knowledge/${stringify(grade.packId)}`)} class="font-bold text-text hover:text-primary transition-colors no-underline">${escape_html(grade.packName)}</a> <span${attr_class(`text-lg font-extrabold font-mono px-2.5 py-0.5 border-2 ${stringify(gradeColor(grade.overall))}`)}>${escape_html(grade.overall)}</span></div> <div class="flex justify-center">`);
              RadarChart($$renderer3, {
                dimensions: grade.dimensions.map((d) => ({
                  label: d.label.replace("Dependency ", "Dep. ").replace("Alternatives", "Alt.").replace("Patterns", "Pat.").replace("Mappings", "Map."),
                  value: d.score,
                  maxValue: 100
                })),
                size: 200
              });
              $$renderer3.push(`<!----></div> <div class="text-center mt-2"><span class="text-xs font-mono text-text-muted">Score: ${escape_html(grade.overallScore)}/100</span></div></div>`);
            }
            $$renderer3.push(`<!--]--></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]-->`);
        }
      });
      $$renderer2.push(`<!----> <div class="mt-6">`);
      Card($$renderer2, {
        padding: "p-0",
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="px-6 pt-5 pb-4"><h2 class="text-sm font-extrabold uppercase tracking-wider">Dimension Breakdown</h2> <p class="text-xs text-text-muted mt-1">Letter grades across all 9 thoroughness dimensions</p></div> <div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="bg-brutal text-white text-left"><th class="px-6 py-2.5 text-[10px] font-extrabold uppercase tracking-wider">Pack</th><th class="px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-center">Overall</th><th class="px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-center">Discovery</th><th class="px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-center">Effort</th><th class="px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-center">Multipliers</th><th class="px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-center">Gotchas</th><th class="px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-center">Chains</th><th class="px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-center">Phases</th><th class="px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-center">Roles</th><th class="px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-center">AI Tools</th><th class="px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-center">Sources</th></tr></thead><tbody><!--[-->`);
          const each_array_1 = ensure_array_like(sortedGrades());
          for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
            let grade = each_array_1[$$index_2];
            $$renderer3.push(`<tr class="border-b-2 border-border-light hover:bg-surface-hover transition-colors"><td class="px-6 py-3"><a${attr("href", `/knowledge/${stringify(grade.packId)}`)} class="font-bold text-text hover:text-primary transition-colors no-underline">${escape_html(grade.packName)}</a></td><td class="px-3 py-3 text-center"><span${attr_class(`text-xs font-extrabold font-mono px-1.5 py-0.5 border-2 ${stringify(gradeColor(grade.overall))}`)}>${escape_html(grade.overall)}</span></td><!--[-->`);
            const each_array_2 = ensure_array_like(grade.dimensions);
            for (let $$index_1 = 0, $$length2 = each_array_2.length; $$index_1 < $$length2; $$index_1++) {
              let dim = each_array_2[$$index_1];
              $$renderer3.push(`<td class="px-3 py-3 text-center"><span${attr_class(`text-[10px] font-bold font-mono px-1.5 py-0.5 border ${stringify(gradeColor(dim.grade))}`)}>${escape_html(dim.grade)}</span> <span class="block text-[9px] font-mono text-text-muted mt-0.5">${escape_html(dim.count)}</span></td>`);
            }
            $$renderer3.push(`<!--]--></tr>`);
          }
          $$renderer3.push(`<!--]--></tbody></table></div>`);
        }
      });
      $$renderer2.push(`<!----></div> <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">`);
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4">Pack Confidence Levels</h2> `);
          if (data.confidenceSegments.length > 0) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="flex justify-center">`);
            DonutChart($$renderer3, {
              segments: data.confidenceSegments,
              centerLabel: "Packs",
              centerValue: String(data.kpis.packs)
            });
            $$renderer3.push(`<!----></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
            $$renderer3.push(`<p class="text-sm text-text-muted text-center py-8">No confidence data available</p>`);
          }
          $$renderer3.push(`<!--]-->`);
        }
      });
      $$renderer2.push(`<!----> `);
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4">Source URL Health</h2> `);
          if (data.urlHealthSegments.length > 0) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="flex justify-center">`);
            DonutChart($$renderer3, {
              segments: data.urlHealthSegments,
              centerLabel: "URLs",
              centerValue: String(data.kpis.sourceUrls)
            });
            $$renderer3.push(`<!----></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
            $$renderer3.push(`<p class="text-sm text-text-muted text-center py-8">No source URLs tracked yet</p>`);
          }
          $$renderer3.push(`<!--]-->`);
        }
      });
      $$renderer2.push(`<!----></div> <div class="mt-6">`);
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4">Pack Completeness</h2> `);
          if (data.packCompleteness.length > 0) {
            $$renderer3.push("<!--[-->");
            HorizontalBarChart($$renderer3, {
              bars: data.packCompleteness,
              showValues: true,
              valueFormat: "number"
            });
          } else {
            $$renderer3.push("<!--[!-->");
            $$renderer3.push(`<p class="text-sm text-text-muted text-center py-8">No pack data available</p>`);
          }
          $$renderer3.push(`<!--]-->`);
        }
      });
      $$renderer2.push(`<!----></div> `);
      if (data.packTable.length > 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="mt-6">`);
        Card($$renderer2, {
          padding: "p-0",
          children: ($$renderer3) => {
            $$renderer3.push(`<div class="px-6 pt-5 pb-4"><h2 class="text-sm font-extrabold uppercase tracking-wider">Pack Details</h2></div> <div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="bg-brutal text-white text-left"><th class="px-6 py-2.5 text-[10px] font-extrabold uppercase tracking-wider">Pack</th><th class="px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-center">Grade</th><th class="px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-wider">Category</th><th class="px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-wider">Confidence</th><th class="px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-right">Discovery</th><th class="px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-right">Effort</th><th class="px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-right">Gotchas</th><th class="px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-right">Multi.</th><th class="px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-right">AI</th><th class="px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-right">Sources</th></tr></thead><tbody><!--[-->`);
            const each_array_3 = ensure_array_like(data.packTable.sort((a, b) => b.gradeScore - a.gradeScore));
            for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
              let pack = each_array_3[$$index_3];
              $$renderer3.push(`<tr class="border-b-2 border-border-light hover:bg-surface-hover transition-colors"><td class="px-6 py-3 font-bold">${escape_html(pack.name)}</td><td class="px-3 py-3 text-center"><span${attr_class(`text-xs font-extrabold font-mono px-1.5 py-0.5 border-2 ${stringify(gradeColor(pack.grade))}`)}>${escape_html(pack.grade)}</span></td><td class="px-4 py-3 text-text-muted">${escape_html(pack.category)}</td><td class="px-4 py-3"><span${attr_class(`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border-2 border-brutal ${stringify(pack.confidence === "verified" ? "bg-success-light text-success" : pack.confidence === "reviewed" ? "bg-primary-light text-primary" : "bg-warning-light text-warning")}`)}>${escape_html(pack.confidence)}</span></td><td class="px-3 py-3 text-right font-mono">${escape_html(pack.discoveryDims)}d / ${escape_html(pack.discoveryQuestions)}q</td><td class="px-3 py-3 text-right font-mono">${escape_html(pack.effort)}</td><td class="px-3 py-3 text-right font-mono">${escape_html(pack.gotchas)}</td><td class="px-3 py-3 text-right font-mono">${escape_html(pack.multipliers)}</td><td class="px-3 py-3 text-right font-mono">${escape_html(pack.aiAlts)}</td><td class="px-3 py-3 text-right font-mono">${escape_html(pack.sources)}</td></tr>`);
            }
            $$renderer3.push(`<!--]--></tbody></table></div>`);
          }
        });
        $$renderer2.push(`<!----></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-Bo3DCJ5O.js.map
