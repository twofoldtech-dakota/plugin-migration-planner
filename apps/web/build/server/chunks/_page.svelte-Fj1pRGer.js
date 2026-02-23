import { aa as head, a1 as derived } from './index4-DG1itRH8.js';
import { K as KpiCard } from './KpiCard-D-WYJRm6.js';
import './Card-w7RlWvYA.js';
import './ProgressBar-BC01P1QB.js';
import './Tooltip-hZ63yG7F.js';
import './index-server-CVwIEJCx.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    const k = derived(() => data.kpis);
    head("1m0gshv", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Analytics | MigrateIQ</title>`);
      });
    });
    $$renderer2.push(`<div><p class="text-sm text-text-muted mb-6">Cross-portfolio metrics and operational insights.</p> <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">`);
    KpiCard($$renderer2, {
      label: "Total Assessments",
      value: k().totalAssessments,
      href: "/analytics/portfolio"
    });
    $$renderer2.push(`<!----> `);
    KpiCard($$renderer2, {
      label: "Total Estimated Hours",
      value: k().totalHours.toLocaleString() + "h",
      href: "/analytics/estimates"
    });
    $$renderer2.push(`<!----> `);
    KpiCard($$renderer2, {
      label: "Avg Confidence",
      value: k().avgConfidence + "%",
      variant: k().avgConfidence >= 70 ? "success" : k().avgConfidence >= 40 ? "warning" : "danger",
      progress: k().avgConfidence,
      href: "/analytics/confidence"
    });
    $$renderer2.push(`<!----> `);
    KpiCard($$renderer2, {
      label: "Open Risks",
      value: k().openRisks,
      variant: k().openRisks > 10 ? "danger" : k().openRisks > 5 ? "warning" : "success",
      href: "/analytics/portfolio"
    });
    $$renderer2.push(`<!----> `);
    KpiCard($$renderer2, {
      label: "Calibrations",
      value: k().calibrationsCompleted,
      href: "/analytics/calibration"
    });
    $$renderer2.push(`<!----> `);
    KpiCard($$renderer2, {
      label: "Knowledge Packs",
      value: k().knowledgePacks,
      href: "/analytics/knowledge"
    });
    $$renderer2.push(`<!----></div> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"><a href="/analytics/portfolio" class="brutal-border bg-surface p-5 no-underline text-text hover:-translate-x-px hover:-translate-y-px hover:shadow-lg transition-all duration-150 block"><h3 class="text-sm font-extrabold uppercase tracking-wider mb-1">Portfolio Intelligence</h3> <p class="text-xs text-text-muted">Assessment pipeline, risk matrix, hours by project</p></a> <a href="/analytics/estimates" class="brutal-border bg-surface p-5 no-underline text-text hover:-translate-x-px hover:-translate-y-px hover:shadow-lg transition-all duration-150 block"><h3 class="text-sm font-extrabold uppercase tracking-wider mb-1">Estimation Accuracy</h3> <p class="text-xs text-text-muted">Hours buildup, role breakdown, multiplier impact</p></a> <a href="/analytics/confidence" class="brutal-border bg-surface p-5 no-underline text-text hover:-translate-x-px hover:-translate-y-px hover:shadow-lg transition-all duration-150 block"><h3 class="text-sm font-extrabold uppercase tracking-wider mb-1">Confidence Trends</h3> <p class="text-xs text-text-muted">Score timeline, per-assessment breakdown, radar profiles</p></a> <a href="/analytics/calibration" class="brutal-border bg-surface p-5 no-underline text-text hover:-translate-x-px hover:-translate-y-px hover:shadow-lg transition-all duration-150 block"><h3 class="text-sm font-extrabold uppercase tracking-wider mb-1">Calibration</h3> <p class="text-xs text-text-muted">Estimated vs actual hours, variance analysis, AI tool performance</p></a> <a href="/analytics/knowledge" class="brutal-border bg-surface p-5 no-underline text-text hover:-translate-x-px hover:-translate-y-px hover:shadow-lg transition-all duration-150 block"><h3 class="text-sm font-extrabold uppercase tracking-wider mb-1">Knowledge Health</h3> <p class="text-xs text-text-muted">Pack completeness, source URL health, confidence levels</p></a> <a href="/analytics/usage" class="brutal-border bg-surface p-5 no-underline text-text hover:-translate-x-px hover:-translate-y-px hover:shadow-lg transition-all duration-150 block"><h3 class="text-sm font-extrabold uppercase tracking-wider mb-1">Usage Analytics</h3> <p class="text-xs text-text-muted">Page views, sessions, feature engagement</p></a></div></div>`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-Fj1pRGer.js.map
