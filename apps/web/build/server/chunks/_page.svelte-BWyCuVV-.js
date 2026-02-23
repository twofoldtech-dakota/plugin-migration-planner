import { aa as head, ac as ensure_array_like, ab as escape_html } from './index4-DG1itRH8.js';
import { C as Card } from './Card-w7RlWvYA.js';
import { K as KpiCard } from './KpiCard-D-WYJRm6.js';
import { S as ScatterPlot } from './ScatterPlot-_X69FJNt.js';
import { H as HorizontalBarChart } from './HorizontalBarChart-Bhs5XmzU.js';
import { D as DonutChart } from './DonutChart-Dlc0pZpB.js';
import './ProgressBar-BC01P1QB.js';
import './Tooltip-hZ63yG7F.js';
import './index-server-CVwIEJCx.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    head("3g9o40", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Calibration | MigrateIQ</title>`);
      });
    });
    $$renderer2.push(`<div><p class="text-sm text-text-muted mb-6">Compare migration estimates against actual outcomes to improve future accuracy.</p> `);
    if (data.totalCalibrations === 0) {
      $$renderer2.push("<!--[-->");
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="flex flex-col items-center gap-4 py-12 text-center"><div class="flex h-16 w-16 items-center justify-center brutal-border bg-primary-light text-3xl text-primary shadow-sm">⚖</div> <h2 class="text-lg font-extrabold uppercase tracking-wider">No Calibration Data Yet</h2> <p class="text-sm text-text-muted max-w-md">Calibration data is recorded after a migration is complete. Complete an assessment and
					record actuals to start seeing variance analysis here.</p> <a href="/assessments" class="brutal-border-thin px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-primary text-white border-primary hover:bg-primary-hover transition-colors no-underline">View Assessments</a></div>`);
        }
      });
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">`);
      KpiCard($$renderer2, { label: "Total Calibrations", value: data.totalCalibrations });
      $$renderer2.push(`<!----> `);
      KpiCard($$renderer2, {
        label: "Avg Variance",
        value: data.avgVariance + "%",
        variant: data.avgVariance <= 10 ? "success" : data.avgVariance <= 25 ? "warning" : "danger",
        tooltip: "Average of absolute variance across all phases"
      });
      $$renderer2.push(`<!----> `);
      KpiCard($$renderer2, {
        label: "Over-Estimated",
        value: data.overEstimated,
        detail: "phases where actual < estimated"
      });
      $$renderer2.push(`<!----> `);
      KpiCard($$renderer2, {
        label: "Under-Estimated",
        value: data.underEstimated,
        detail: "phases where actual > estimated",
        variant: data.underEstimated > data.overEstimated ? "warning" : void 0
      });
      $$renderer2.push(`<!----></div> <div class="mb-6">`);
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4">Estimated vs Actual Hours</h2> `);
          ScatterPlot($$renderer3, {
            points: data.scatterData,
            xLabel: "Estimated Hours",
            yLabel: "Actual Hours",
            showDiagonal: true
          });
          $$renderer3.push(`<!----> <p class="text-[10px] text-text-muted mt-2">Points on the diagonal indicate perfect estimates. Above = under-estimated, below = over-estimated.</p>`);
        }
      });
      $$renderer2.push(`<!----></div> <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">`);
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4">Phase Variance</h2> `);
          if (data.phaseVariance.length > 0) {
            $$renderer3.push("<!--[-->");
            HorizontalBarChart($$renderer3, {
              bars: data.phaseVariance.map((p) => ({
                label: p.label,
                value: Math.abs(p.value),
                color: p.value >= 0 ? "var(--color-success)" : "var(--color-danger)",
                detail: p.value >= 0 ? `+${p.value}% over` : `${p.value}% under`
              })),
              valueFormat: "percent"
            });
            $$renderer3.push(`<!----> <div class="flex items-center gap-4 mt-3 pt-2 border-t-2 border-border-light"><div class="flex items-center gap-1.5"><span class="inline-block w-3 h-3 brutal-border" style="background-color: var(--color-success);"></span> <span class="text-[10px] font-bold text-text-muted uppercase">Over-estimated</span></div> <div class="flex items-center gap-1.5"><span class="inline-block w-3 h-3 brutal-border" style="background-color: var(--color-danger);"></span> <span class="text-[10px] font-bold text-text-muted uppercase">Under-estimated</span></div></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
            $$renderer3.push(`<p class="text-sm text-text-muted">No phase data available.</p>`);
          }
          $$renderer3.push(`<!--]-->`);
        }
      });
      $$renderer2.push(`<!----> `);
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4">AI Tool Adoption</h2> `);
          if (data.aiToolUsage[0].value + data.aiToolUsage[1].value > 0) {
            $$renderer3.push("<!--[-->");
            DonutChart($$renderer3, {
              segments: data.aiToolUsage,
              centerValue: String(data.aiToolUsage[0].value + data.aiToolUsage[1].value),
              centerLabel: "Tools"
            });
          } else {
            $$renderer3.push("<!--[!-->");
            $$renderer3.push(`<p class="text-sm text-text-muted">No AI tool data recorded.</p>`);
          }
          $$renderer3.push(`<!--]-->`);
        }
      });
      $$renderer2.push(`<!----></div> `);
      if (data.surprises.length > 0) {
        $$renderer2.push("<!--[-->");
        Card($$renderer2, {
          padding: "p-0",
          children: ($$renderer3) => {
            $$renderer3.push(`<div class="px-6 pt-5 pb-4"><h2 class="text-sm font-extrabold uppercase tracking-wider">Surprises</h2> <p class="text-xs text-text-muted mt-1">Unexpected findings recorded during calibration</p></div> <div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="bg-brutal text-white text-left"><th class="px-6 py-2.5 text-[10px] font-extrabold uppercase tracking-wider">Project</th><th class="px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-wider">Description</th><th class="px-6 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-right">Impact</th></tr></thead><tbody><!--[-->`);
            const each_array = ensure_array_like(data.surprises);
            for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
              let surprise = each_array[$$index];
              $$renderer3.push(`<tr class="border-b-2 border-border-light hover:bg-surface-hover transition-colors"><td class="px-6 py-3 font-bold whitespace-nowrap">${escape_html(surprise.project)}</td><td class="px-4 py-3 text-text-secondary">${escape_html(surprise.description)}</td><td class="px-6 py-3 text-right font-mono text-text-muted">${escape_html(surprise.impact)}</td></tr>`);
            }
            $$renderer3.push(`<!--]--></tbody></table></div>`);
          }
        });
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-BWyCuVV-.js.map
