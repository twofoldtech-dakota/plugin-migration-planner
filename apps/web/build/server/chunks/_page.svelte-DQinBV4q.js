import { aa as head, ac as ensure_array_like, ad as attr, a7 as stringify, ab as escape_html } from './index4-DG1itRH8.js';
import { C as Card } from './Card-w7RlWvYA.js';
import { K as KpiCard } from './KpiCard-D-WYJRm6.js';
import { A as AreaChart } from './AreaChart-BrBX_7Fj.js';
import { H as HorizontalBarChart } from './HorizontalBarChart-Bhs5XmzU.js';
import './ProgressBar-BC01P1QB.js';
import './Tooltip-hZ63yG7F.js';
import './index-server-CVwIEJCx.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    head("gpem4b", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Usage Analytics | MigrateIQ</title>`);
      });
    });
    $$renderer2.push(`<div><p class="text-sm text-text-muted mb-6">Track page views, sessions, and feature engagement across the platform.</p> `);
    if (data.pageViews24h === 0 && data.sessions7d === 0) {
      $$renderer2.push("<!--[-->");
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="flex flex-col items-center gap-4 py-12 text-center"><div class="flex h-16 w-16 items-center justify-center brutal-border bg-primary-light text-3xl text-primary shadow-sm">▤</div> <h2 class="text-lg font-extrabold uppercase tracking-wider">No Usage Data Yet</h2> <p class="text-sm text-text-muted max-w-md">Analytics event tracking is active. Page views and feature events will appear here
					as users interact with the platform.</p></div>`);
        }
      });
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">`);
      KpiCard($$renderer2, {
        label: "Page Views (24h)",
        value: data.pageViews24h.toLocaleString(),
        tooltip: "Total page views in the last 24 hours"
      });
      $$renderer2.push(`<!----> `);
      KpiCard($$renderer2, {
        label: "Sessions (7d)",
        value: data.sessions7d.toLocaleString(),
        tooltip: "Unique sessions in the last 7 days"
      });
      $$renderer2.push(`<!----> `);
      KpiCard($$renderer2, {
        label: "Pages / Session",
        value: data.avgPagesPerSession,
        tooltip: "Average daily page views per session"
      });
      $$renderer2.push(`<!----> `);
      KpiCard($$renderer2, {
        label: "Active Assessments",
        value: data.activeAssessments,
        detail: "with events in 7 days"
      });
      $$renderer2.push(`<!----></div> <div class="mb-6">`);
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4">Page Views Over Time</h2> `);
          if (data.pageViewTrend[0].data.length >= 2) {
            $$renderer3.push("<!--[-->");
            AreaChart($$renderer3, { series: data.pageViewTrend, yLabel: "Views" });
          } else {
            $$renderer3.push("<!--[!-->");
            $$renderer3.push(`<div class="flex items-center justify-center h-64 text-text-muted text-sm">Not enough data points yet. Check back after more activity.</div>`);
          }
          $$renderer3.push(`<!--]-->`);
        }
      });
      $$renderer2.push(`<!----></div> <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">`);
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4">Top Pages</h2> `);
          if (data.topPagesBars.length > 0) {
            $$renderer3.push("<!--[-->");
            HorizontalBarChart($$renderer3, { bars: data.topPagesBars });
          } else {
            $$renderer3.push("<!--[!-->");
            $$renderer3.push(`<p class="text-sm text-text-muted">No page view data in the last 7 days.</p>`);
          }
          $$renderer3.push(`<!--]-->`);
        }
      });
      $$renderer2.push(`<!----> `);
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4">Top Features</h2> `);
          if (data.topFeaturesBars.length > 0) {
            $$renderer3.push("<!--[-->");
            HorizontalBarChart($$renderer3, { bars: data.topFeaturesBars });
          } else {
            $$renderer3.push("<!--[!-->");
            $$renderer3.push(`<p class="text-sm text-text-muted">No feature events in the last 7 days.</p>`);
          }
          $$renderer3.push(`<!--]-->`);
        }
      });
      $$renderer2.push(`<!----></div> `);
      if (data.engagedAssessments.length > 0) {
        $$renderer2.push("<!--[-->");
        Card($$renderer2, {
          padding: "p-0",
          children: ($$renderer3) => {
            $$renderer3.push(`<div class="px-6 pt-5 pb-4"><h2 class="text-sm font-extrabold uppercase tracking-wider">Most Engaged Assessments</h2> <p class="text-xs text-text-muted mt-1">Assessments with the most events in the last 7 days</p></div> <div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="bg-brutal text-white text-left"><th class="px-6 py-2.5 text-[10px] font-extrabold uppercase tracking-wider">Project</th><th class="px-6 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-right">Events</th></tr></thead><tbody><!--[-->`);
            const each_array = ensure_array_like(data.engagedAssessments);
            for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
              let row = each_array[$$index];
              $$renderer3.push(`<tr class="border-b-2 border-border-light hover:bg-surface-hover transition-colors"><td class="px-6 py-3"><a${attr("href", `/assessments/${stringify(row.assessment_id)}`)} class="font-bold text-text hover:text-primary transition-colors no-underline">${escape_html(row.project_name)}</a></td><td class="px-6 py-3 text-right font-mono font-bold">${escape_html(row.count.toLocaleString())}</td></tr>`);
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
//# sourceMappingURL=_page.svelte-DQinBV4q.js.map
