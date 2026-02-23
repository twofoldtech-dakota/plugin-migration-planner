import { aa as head, ab as escape_html, ac as ensure_array_like, ad as attr, a7 as stringify, ae as attr_style, a1 as derived, a6 as attr_class } from './index4-DG1itRH8.js';
import { C as Card } from './Card-w7RlWvYA.js';
import { B as Badge } from './Badge-CWejdkwM.js';
import { P as ProgressBar } from './ProgressBar-BC01P1QB.js';
import { T as Tooltip } from './Tooltip-hZ63yG7F.js';
import './index-server-CVwIEJCx.js';

function EmptyState($$renderer) {
  $$renderer.push(`<div class="mx-auto max-w-lg py-16 text-center">`);
  Card($$renderer, {
    children: ($$renderer2) => {
      $$renderer2.push(`<div class="flex flex-col items-center gap-4 py-4"><div class="flex h-16 w-16 items-center justify-center brutal-border bg-primary-light text-3xl text-primary shadow-sm">★</div> <h2 class="text-xl font-extrabold uppercase tracking-wider">No assessments yet</h2> <p class="text-text-secondary text-sm leading-relaxed max-w-sm">Get started by creating your first assessment using the wizard or the CLI.</p> <a href="/new" class="brutal-border-thin px-6 py-3 text-sm font-bold uppercase tracking-wider bg-primary text-white border-primary hover:bg-primary-hover transition-colors no-underline">Start Your First Assessment</a> <div class="mt-2 w-full brutal-border-thin bg-bg p-4 text-left"><p class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-2">Or use the CLI:</p> <ol class="list-decimal list-inside text-sm text-text-secondary space-y-1.5"><li>Run <code class="brutal-border-thin bg-surface px-1.5 py-0.5 text-xs font-mono">/migrate-new</code> to create an assessment</li> <li>Run <code class="brutal-border-thin bg-surface px-1.5 py-0.5 text-xs font-mono">/migrate-discover</code> to gather project info</li> <li>Run <code class="brutal-border-thin bg-surface px-1.5 py-0.5 text-xs font-mono">/migrate-analyze</code> to identify risks</li> <li>Run <code class="brutal-border-thin bg-surface px-1.5 py-0.5 text-xs font-mono">/migrate-estimate</code> to generate hours</li></ol></div></div>`);
    }
  });
  $$renderer.push(`<!----></div>`);
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    const statusVariant = {
      planning: "default",
      discovery: "info",
      analysis: "warning",
      estimation: "default",
      complete: "success"
    };
    const statusOrder = {
      planning: 0,
      discovery: 1,
      analysis: 2,
      estimation: 3,
      complete: 4
    };
    const workflowSteps = [
      "Discovery",
      "Analysis",
      "Estimate",
      "Refine",
      "Deliverables"
    ];
    function getStepStatuses(project) {
      const hasDiscovery = project.completeness_pct != null && project.completeness_pct > 0;
      const discoveryComplete = project.completeness_pct != null && project.completeness_pct >= 100;
      const hasAnalysis = project.confidence_score != null;
      const hasEstimate = project.total_expected_hours != null;
      const isComplete = project.status === "complete";
      return [
        discoveryComplete ? "complete" : hasDiscovery ? "in-progress" : "not-started",
        hasAnalysis ? "complete" : discoveryComplete ? "in-progress" : "not-started",
        hasEstimate ? "complete" : hasAnalysis ? "in-progress" : "not-started",
        isComplete ? "complete" : hasEstimate ? "in-progress" : "not-started",
        isComplete ? "complete" : "not-started"
      ];
    }
    function formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
    function formatHours(h) {
      if (h >= 1e3) return `${(h / 1e3).toFixed(1)}k`;
      return Math.round(h).toLocaleString();
    }
    function confidenceVariant(score) {
      if (score >= 70) return "success";
      if (score >= 40) return "warning";
      return "danger";
    }
    function stepBarColor(status) {
      switch (status) {
        case "complete":
          return "bg-success";
        case "in-progress":
          return "bg-primary";
        default:
          return "bg-border-light";
      }
    }
    let portfolio = derived(() => {
      const p = data.projects;
      const total = p.length;
      const withEstimates = p.filter((a) => a.total_expected_hours != null);
      const totalHours = withEstimates.reduce((s, a) => s + (a.total_expected_hours ?? 0), 0);
      const avgConfidence = withEstimates.length > 0 ? withEstimates.reduce((s, a) => s + (a.confidence_score ?? 0), 0) / withEstimates.length : 0;
      const byStatus = p.reduce(
        (acc, a) => {
          acc[a.status] = (acc[a.status] ?? 0) + 1;
          return acc;
        },
        {}
      );
      return {
        total,
        totalHours,
        avgConfidence,
        byStatus,
        withEstimates: withEstimates.length
      };
    });
    let search = "";
    let filtered = derived(() => search.trim() ? data.projects.filter((p) => {
      const q = search.toLowerCase();
      return p.project_name.toLowerCase().includes(q) || p.client_name && p.client_name.toLowerCase().includes(q);
    }) : data.projects);
    head("daw2zo", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Assessments | MigrateIQ</title>`);
      });
    });
    $$renderer2.push(`<div class="mx-auto max-w-7xl px-6 py-8 animate-enter">`);
    if (data.projects.length === 0) {
      $$renderer2.push("<!--[-->");
      EmptyState($$renderer2);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="mb-8"><div class="flex items-center gap-2"><h1 class="text-2xl font-extrabold uppercase tracking-wider">Assessments</h1> <a href="/new" class="ml-auto brutal-border-thin px-4 py-2 text-xs font-bold uppercase tracking-wider bg-primary text-white border-primary hover:bg-primary-hover transition-colors no-underline">+ New Assessment</a></div> <p class="mt-1 text-sm font-bold text-text-secondary">${escape_html(portfolio().total)} assessment${escape_html(portfolio().total === 1 ? "" : "s")} `);
      if (portfolio().withEstimates > 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`· ${escape_html(formatHours(portfolio().totalHours))} total hours
					· ${escape_html(Math.round(portfolio().avgConfidence))}% avg confidence`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></p></div> `);
      if (Object.keys(portfolio().byStatus).length > 1) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="flex flex-wrap gap-2 mb-6"><!--[-->`);
        const each_array = ensure_array_like(Object.entries(portfolio().byStatus).sort(([a], [b]) => (statusOrder[a] ?? 0) - (statusOrder[b] ?? 0)));
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let [status, count] = each_array[$$index];
          Badge($$renderer2, {
            variant: statusVariant[status] ?? "default",
            children: ($$renderer3) => {
              $$renderer3.push(`<!---->${escape_html(count)} ${escape_html(status)}`);
            }
          });
        }
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> <div class="mb-6 relative"><input type="text"${attr("value", search)} placeholder="Search assessments..." class="w-full max-w-md brutal-border-thin px-4 py-2.5 text-sm font-mono bg-surface focus:outline-2 focus:outline-primary placeholder:text-text-muted pr-12"/> <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-text-muted brutal-border-thin px-1.5 py-0.5 bg-bg pointer-events-none" style="max-width: fit-content;">/</span></div> `);
      if (filtered().length === 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="py-12 text-center"><p class="text-sm font-bold text-text-muted">No assessments match "${escape_html(search)}"</p> <button class="mt-2 text-xs font-bold text-primary hover:text-primary-hover">Clear search</button></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div class="grid gap-5 lg:grid-cols-2 stagger-grid"><!--[-->`);
        const each_array_1 = ensure_array_like(filtered());
        for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
          let project = each_array_1[i];
          const steps = getStepStatuses(project);
          $$renderer2.push(`<a${attr("href", `/assessments/${stringify(project.id)}`)} class="no-underline group"${attr_style(`--stagger-i: ${stringify(i)};`)}>`);
          Card($$renderer2, {
            hover: true,
            children: ($$renderer3) => {
              $$renderer3.push(`<div class="flex flex-col gap-4"><div class="flex items-start justify-between gap-3"><div class="min-w-0 flex-1"><h3 class="font-extrabold text-text text-lg truncate group-hover:text-primary transition-colors">${escape_html(project.project_name)}</h3> `);
              if (project.client_name) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<p class="text-sm text-text-secondary truncate">${escape_html(project.client_name)}</p>`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--></div> `);
              Badge($$renderer3, {
                variant: statusVariant[project.status] ?? "default",
                children: ($$renderer4) => {
                  $$renderer4.push(`<!---->${escape_html(project.status)}`);
                }
              });
              $$renderer3.push(`<!----></div> <div class="flex items-center gap-0.5"><!--[-->`);
              const each_array_2 = ensure_array_like(workflowSteps);
              for (let i2 = 0, $$length2 = each_array_2.length; i2 < $$length2; i2++) {
                let step = each_array_2[i2];
                $$renderer3.push(`<div class="flex-1 flex flex-col items-center gap-1"><div${attr_class(`w-full h-1.5 rounded-sm ${stringify(stepBarColor(steps[i2]))}`)}></div> <span${attr_class(`text-[9px] font-bold uppercase tracking-wider ${stringify(steps[i2] !== "not-started" ? "text-text" : "text-text-muted")}`)}>${escape_html(step)}</span></div> `);
                if (i2 < workflowSteps.length - 1) {
                  $$renderer3.push("<!--[-->");
                  $$renderer3.push(`<div class="w-1"></div>`);
                } else {
                  $$renderer3.push("<!--[!-->");
                }
                $$renderer3.push(`<!--]-->`);
              }
              $$renderer3.push(`<!--]--></div> <div class="grid grid-cols-3 gap-3"><div class="flex flex-col gap-1.5">`);
              Tooltip($$renderer3, {
                text: "Percentage of discovery dimensions completed or partially answered.",
                position: "bottom",
                children: ($$renderer4) => {
                  $$renderer4.push(`<span class="text-[10px] font-bold uppercase tracking-wider text-text-muted cursor-help">Discovery</span>`);
                }
              });
              $$renderer3.push(`<!----> `);
              if (project.completeness_pct != null) {
                $$renderer3.push("<!--[-->");
                const disc = Math.min(100, Math.round(project.completeness_pct));
                $$renderer3.push(`<span class="text-sm font-extrabold font-mono">${escape_html(disc)}%</span> `);
                ProgressBar($$renderer3, {
                  value: disc,
                  variant: disc >= 80 ? "success" : disc >= 50 ? "warning" : "danger"
                });
                $$renderer3.push(`<!---->`);
              } else {
                $$renderer3.push("<!--[!-->");
                $$renderer3.push(`<span class="text-sm font-mono text-text-muted">---</span>`);
              }
              $$renderer3.push(`<!--]--></div> <div class="flex flex-col gap-1.5">`);
              Tooltip($$renderer3, {
                text: "Estimate confidence. Validate assumptions to increase this score.",
                position: "bottom",
                children: ($$renderer4) => {
                  $$renderer4.push(`<span class="text-[10px] font-bold uppercase tracking-wider text-text-muted cursor-help">Confidence</span>`);
                }
              });
              $$renderer3.push(`<!----> `);
              if (project.confidence_score != null) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<span class="text-sm font-extrabold font-mono">${escape_html(Math.round(project.confidence_score))}%</span> `);
                ProgressBar($$renderer3, {
                  value: project.confidence_score,
                  variant: confidenceVariant(project.confidence_score)
                });
                $$renderer3.push(`<!---->`);
              } else {
                $$renderer3.push("<!--[!-->");
                $$renderer3.push(`<span class="text-sm font-mono text-text-muted">---</span>`);
              }
              $$renderer3.push(`<!--]--></div> <div class="flex flex-col gap-1.5">`);
              Tooltip($$renderer3, {
                text: "Total expected hours including base effort, gotcha patterns, and complexity multipliers.",
                position: "bottom",
                children: ($$renderer4) => {
                  $$renderer4.push(`<span class="text-[10px] font-bold uppercase tracking-wider text-text-muted cursor-help">Est. Hours</span>`);
                }
              });
              $$renderer3.push(`<!----> `);
              if (project.total_expected_hours != null) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<span class="text-sm font-extrabold font-mono">${escape_html(formatHours(project.total_expected_hours))}</span> `);
                if (project.total_assumptions != null) {
                  $$renderer3.push("<!--[-->");
                  $$renderer3.push(`<span class="text-[10px] text-text-muted">${escape_html(project.validated_assumptions ?? 0)}/${escape_html(project.total_assumptions)} assumptions validated</span>`);
                } else {
                  $$renderer3.push("<!--[!-->");
                }
                $$renderer3.push(`<!--]-->`);
              } else {
                $$renderer3.push("<!--[!-->");
                $$renderer3.push(`<span class="text-sm font-mono text-text-muted">---</span>`);
              }
              $$renderer3.push(`<!--]--></div></div> <div class="flex items-center justify-between border-t-2 border-border-light pt-3 text-xs font-mono text-text-muted"><div class="flex flex-wrap gap-x-4 gap-y-1">`);
              if (project.source_stack?.platform) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<span>${escape_html(project.source_stack.platform)}${escape_html(project.source_stack.platform_version ? ` ${project.source_stack.platform_version}` : "")}</span>`);
              } else if (project.topology) {
                $$renderer3.push("<!--[1-->");
                $$renderer3.push(`<span>${escape_html(project.topology)}</span>`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--> `);
              if (project.source_stack?.infrastructure) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<span>${escape_html(project.source_stack.infrastructure)} → ${escape_html(project.target_stack?.infrastructure ?? "?")}</span>`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--></div> <span>Updated ${escape_html(formatDate(project.created_at))}</span></div></div>`);
            }
          });
          $$renderer2.push(`<!----></a>`);
        }
        $$renderer2.push(`<!--]--></div>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-Dl33NnhF.js.map
