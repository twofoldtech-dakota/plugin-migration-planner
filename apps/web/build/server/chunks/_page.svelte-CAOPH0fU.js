import { aa as head, ab as escape_html, a6 as attr_class, a7 as stringify, ac as ensure_array_like, ad as attr, a1 as derived, ae as attr_style } from './index4-DG1itRH8.js';
import { C as Card } from './Card-w7RlWvYA.js';
import { B as Badge } from './Badge-CWejdkwM.js';
import { T as Tooltip } from './Tooltip-hZ63yG7F.js';
import './index-server-CVwIEJCx.js';

function ConfidenceSparkline($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { points, width = 120, height = 32 } = $$props;
    const padX = 4;
    const padY = 4;
    const innerW = derived(() => width - padX * 2);
    const innerH = derived(() => height - padY * 2);
    const yRange = derived(() => {
      if (points.length < 2) return { min: 0, max: 100 };
      const vals = points.map((p) => p.avg);
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      const pad = Math.max((max - min) * 0.25, 3);
      return { min: Math.max(0, min - pad), max: Math.min(100, max + pad) };
    });
    function yForVal(val) {
      const range = yRange().max - yRange().min;
      if (range === 0) return padY + innerH() / 2;
      return padY + innerH() - (val - yRange().min) / range * innerH();
    }
    const coords = derived(() => {
      if (points.length < 2) return [];
      const step = innerW() / (points.length - 1);
      return points.map((p, i) => ({ x: padX + i * step, y: yForVal(p.avg) }));
    });
    const polyline = derived(() => coords().map((c) => `${c.x},${c.y}`).join(" "));
    const fillPath = derived(() => {
      if (coords().length < 2) return "";
      const bottom = padY + innerH();
      const first = coords()[0];
      const last = coords()[coords().length - 1];
      const linePart = coords().map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
      return `${linePart} L ${last.x} ${bottom} L ${first.x} ${bottom} Z`;
    });
    const lastCoord = derived(() => coords().length >= 2 ? coords()[coords().length - 1] : null);
    const trend = derived(() => {
      if (points.length < 2) return "flat";
      const first = points[0].avg;
      const last = points[points.length - 1].avg;
      const delta = last - first;
      if (delta > 3) return "up";
      if (delta < -3) return "down";
      return "flat";
    });
    const strokeColor = derived(() => trend() === "up" ? "var(--color-success)" : trend() === "down" ? "var(--color-danger)" : "var(--color-primary)");
    const fillOpacity = derived(() => trend() === "down" ? 0.15 : 0.2);
    if (points.length >= 2) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<svg${attr("width", width)}${attr("height", height)}${attr("viewBox", `0 0 ${stringify(width)} ${stringify(height)}`)} class="block"><defs><linearGradient${attr("id", `spark-fill-${stringify(width)}-${stringify(height)}`)} x1="0" y1="0" x2="0" y2="1"><stop offset="0%"${attr("stop-color", strokeColor())}${attr("stop-opacity", fillOpacity())}></stop><stop offset="100%"${attr("stop-color", strokeColor())} stop-opacity="0.02"></stop></linearGradient></defs><path${attr("d", fillPath())}${attr("fill", `url(#spark-fill-${stringify(width)}-${stringify(height)})`)}></path><polyline${attr("points", polyline())} fill="none"${attr("stroke", strokeColor())} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></polyline>`);
      if (lastCoord()) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<circle${attr("cx", lastCoord().x)}${attr("cy", lastCoord().y)} r="2.5"${attr("fill", strokeColor())}></circle>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></svg>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
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
    const workflowSteps = [
      "Discovery",
      "Analysis",
      "Estimate",
      "Refine",
      "Deliverables"
    ];
    function getStepStatuses(project) {
      const hasDiscovery = project.discovery != null && project.discovery > 0;
      const discoveryComplete = project.discovery != null && project.discovery >= 100;
      const hasAnalysis = project.confidence != null;
      const hasEstimate = project.hours != null;
      const isComplete = project.status === "complete";
      return [
        discoveryComplete ? "complete" : hasDiscovery ? "in-progress" : "not-started",
        hasAnalysis ? "complete" : discoveryComplete ? "in-progress" : "not-started",
        hasEstimate ? "complete" : hasAnalysis ? "in-progress" : "not-started",
        isComplete ? "complete" : hasEstimate ? "in-progress" : "not-started",
        isComplete ? "complete" : "not-started"
      ];
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
    function formatHours(h) {
      if (h >= 1e3) return `${(h / 1e3).toFixed(1)}k`;
      return Math.round(h).toLocaleString();
    }
    function confidenceVariant(score) {
      if (score >= 70) return "success";
      if (score >= 40) return "warning";
      return "danger";
    }
    const pipelineStages = derived(() => [
      {
        key: "planning",
        label: "Planning",
        count: data.pipeline.planning,
        color: "bg-text-muted"
      },
      {
        key: "discovery",
        label: "Discovery",
        count: data.pipeline.discovery,
        color: "bg-info"
      },
      {
        key: "analysis",
        label: "Analysis",
        count: data.pipeline.analysis,
        color: "bg-warning"
      },
      {
        key: "estimation",
        label: "Estimation",
        count: data.pipeline.estimation,
        color: "bg-primary"
      },
      {
        key: "complete",
        label: "Complete",
        count: data.pipeline.complete,
        color: "bg-success"
      }
    ]);
    const pipelineMax = derived(() => Math.max(...pipelineStages().map((s) => s.count), 1));
    const riskBars = derived(() => [
      {
        label: "Critical",
        count: data.riskSummary.critical,
        color: "bg-danger",
        textColor: "text-danger"
      },
      {
        label: "High",
        count: data.riskSummary.high,
        color: "bg-warning",
        textColor: "text-warning"
      },
      {
        label: "Medium",
        count: data.riskSummary.medium,
        color: "bg-primary",
        textColor: "text-primary"
      },
      {
        label: "Low",
        count: data.riskSummary.low,
        color: "bg-success",
        textColor: "text-success"
      }
    ]);
    const assumptionPct = derived(() => data.assumptionSummary.total > 0 ? Math.round(data.assumptionSummary.validated / data.assumptionSummary.total * 100) : 0);
    head("1uha8ag", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Command Center | MigrateIQ</title>`);
      });
    });
    $$renderer2.push(`<div class="mx-auto max-w-7xl px-6 pt-8 pb-8 lg:pb-0 animate-enter">`);
    if (data.portfolio.total === 0 && data.knowledgeHealth.totalPacks === 0 && data.clients.total === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="mx-auto max-w-lg py-16 text-center">`);
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="flex flex-col items-center gap-4 py-4"><div class="flex h-16 w-16 items-center justify-center brutal-border bg-primary-light text-3xl text-primary shadow-sm">★</div> <h2 class="text-xl font-extrabold uppercase tracking-wider">Welcome to MigrateIQ</h2> <p class="text-text-secondary text-sm leading-relaxed max-w-sm">Your migration intelligence platform is ready. Start by creating your first assessment or building knowledge packs.</p> <a href="/new" class="brutal-border-thin px-6 py-3 text-sm font-bold uppercase tracking-wider bg-primary text-white border-primary hover:bg-primary-hover transition-colors no-underline">Start Your First Assessment</a></div>`);
        }
      });
      $$renderer2.push(`<!----></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="hero-surface brutal-border shadow-lg p-6 mb-8"><div class="flex items-center justify-between mb-5"><div><h1 class="text-2xl font-extrabold uppercase tracking-wider text-white">Command Center</h1> <p class="text-sm font-bold text-white/60 mt-0.5">Portfolio intelligence at a glance</p></div> <a href="/new" class="brutal-border-thin px-4 py-2 text-xs font-bold uppercase tracking-wider bg-primary text-white border-primary hover:bg-primary-hover transition-colors no-underline">+ New Assessment</a></div> <div class="grid grid-cols-2 md:grid-cols-4 gap-4"><a href="/assessments" class="no-underline group"><div class="border-2 border-white/20 p-3 hover:border-primary transition-colors"><span class="text-[10px] font-bold uppercase tracking-wider text-white/50">Assessments</span> <p class="text-2xl font-extrabold font-mono text-white mt-0.5 group-hover:text-primary transition-colors">${escape_html(data.portfolio.total)}</p></div></a> <div class="border-2 border-white/20 p-3"><span class="text-[10px] font-bold uppercase tracking-wider text-white/50">Total Hours</span> <p class="text-2xl font-extrabold font-mono text-white mt-0.5">${escape_html(data.portfolio.totalHours > 0 ? formatHours(data.portfolio.totalHours) : "---")}</p></div> <a href="/analytics/confidence" class="no-underline group"><div class="border-2 border-white/20 p-3 hover:border-primary transition-colors"><div class="flex items-center justify-between"><span class="text-[10px] font-bold uppercase tracking-wider text-white/50">Avg Confidence</span> `);
      if (data.confidenceTrend.length >= 2) {
        $$renderer2.push("<!--[-->");
        const last = data.confidenceTrend[data.confidenceTrend.length - 1].avg;
        const first = data.confidenceTrend[0].avg;
        const delta = last - first;
        if (Math.abs(delta) > 1) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<span${attr_class(`text-[9px] font-bold font-mono ${stringify(delta > 0 ? "text-success" : "text-danger")}`)}>${escape_html(delta > 0 ? "+" : "")}${escape_html(delta.toFixed(0))}</span>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]-->`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div> <p${attr_class(`text-2xl font-extrabold font-mono mt-0.5 ${stringify(data.portfolio.avgConfidence >= 70 ? "text-success" : data.portfolio.avgConfidence >= 40 ? "text-warning" : data.portfolio.avgConfidence > 0 ? "text-danger" : "text-white")} group-hover:text-primary transition-colors`)}>${escape_html(data.portfolio.avgConfidence > 0 ? `${Math.round(data.portfolio.avgConfidence)}%` : "---")}</p> `);
      if (data.confidenceTrend.length >= 2) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="mt-1.5 -mb-0.5">`);
        ConfidenceSparkline($$renderer2, { points: data.confidenceTrend, width: 120, height: 24 });
        $$renderer2.push(`<!----></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div></a> <div${attr_class(`border-2 ${stringify(data.portfolio.needsAttention > 0 ? "border-danger/60 bg-danger/10" : "border-white/20")} p-3`)}><span class="text-[10px] font-bold uppercase tracking-wider text-white/50">Attention</span> <p${attr_class(`text-2xl font-extrabold font-mono mt-0.5 ${stringify(data.portfolio.needsAttention > 0 ? "text-danger" : "text-success")}`)}>${escape_html(data.portfolio.needsAttention)}</p></div></div> <div class="border-t border-white/10 mt-5 pt-4"><div class="flex items-center gap-5 flex-wrap sm:flex-nowrap"><div class="flex items-baseline gap-2 shrink-0"><span class="text-base font-extrabold font-mono text-white">${escape_html(data.knowledgeHealth.totalPacks)}</span> <span class="text-xs text-white/50">packs</span> <span class="text-white/30 mx-0.5">·</span> <span class="text-base font-extrabold font-mono text-white">${escape_html(data.knowledgeHealth.totalPaths)}</span> <span class="text-xs text-white/50">paths</span></div> <div class="flex items-center gap-2 shrink-0"><span class="inline-flex items-center gap-1 text-[10px] font-bold font-mono text-success"><span class="inline-block w-1.5 h-1.5 rounded-full bg-success"></span> ${escape_html(data.knowledgeHealth.verified)} verified</span> `);
      if (data.knowledgeHealth.draft > 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<span class="inline-flex items-center gap-1 text-[10px] font-bold font-mono text-white/40"><span class="inline-block w-1.5 h-1.5 rounded-full bg-white/30"></span> ${escape_html(data.knowledgeHealth.draft)} draft</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div> <div class="flex items-center gap-3 ml-auto">`);
      if (data.knowledgeHealth.categories.length > 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="hidden md:flex flex-wrap gap-1"><!--[-->`);
        const each_array = ensure_array_like(data.knowledgeHealth.categories);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let cat = each_array[$$index];
          $$renderer2.push(`<span class="text-[9px] font-bold font-mono uppercase px-1.5 py-0.5 border border-white/20 text-white/60">${escape_html(cat)}</span>`);
        }
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> <a href="/knowledge" class="text-[10px] font-bold text-primary hover:text-primary-hover no-underline whitespace-nowrap">View all →</a></div></div></div></div>  <div class="flex gap-6 items-start min-h-[calc(100vh-59px)]"><aside class="hidden lg:block w-64 shrink-0 sticky top-[59px] self-start max-h-[calc(100vh-59px)] overflow-y-auto stagger-grid" style="--stagger-i: 0;"><div class="space-y-5 pt-2 pb-8 pr-1"><div class="brutal-border bg-surface shadow-md p-4"><h2 class="text-[10px] font-extrabold uppercase tracking-widest text-text-muted mb-3 pb-2 border-b-2 border-border-light">Quick Actions</h2> <div class="space-y-1.5"><a href="/new" class="no-underline group flex items-center gap-2.5 px-2.5 py-2 border-2 border-transparent hover:border-primary hover:bg-primary-light transition-all"><span class="flex h-7 w-7 items-center justify-center bg-primary text-white text-xs font-extrabold shrink-0 border-2 border-brutal">+</span> <div class="min-w-0"><span class="font-bold text-xs text-text group-hover:text-primary transition-colors block">New Assessment</span> <span class="text-[9px] text-text-muted">Start a migration</span></div></a> <a href="/assessments" class="no-underline group flex items-center gap-2.5 px-2.5 py-2 border-2 border-transparent hover:border-primary hover:bg-primary-light transition-all"><span class="flex h-7 w-7 items-center justify-center bg-brutal text-white text-xs font-extrabold shrink-0 border-2 border-brutal">☰</span> <div class="min-w-0"><span class="font-bold text-xs text-text group-hover:text-primary transition-colors block">All Assessments</span> <span class="text-[9px] text-text-muted">${escape_html(data.portfolio.total)} project${escape_html(data.portfolio.total !== 1 ? "s" : "")}</span></div></a> <a href="/clients" class="no-underline group flex items-center gap-2.5 px-2.5 py-2 border-2 border-transparent hover:border-info hover:bg-info-light transition-all"><span class="flex h-7 w-7 items-center justify-center bg-info text-white text-xs font-extrabold shrink-0 border-2 border-brutal">♔</span> <div class="min-w-0"><span class="font-bold text-xs text-text group-hover:text-info transition-colors block">Clients</span> <span class="text-[9px] text-text-muted">${escape_html(data.clients.total)} client${escape_html(data.clients.total !== 1 ? "s" : "")}</span></div></a> <a href="/knowledge" class="no-underline group flex items-center gap-2.5 px-2.5 py-2 border-2 border-transparent hover:border-warning hover:bg-warning-light transition-all"><span class="flex h-7 w-7 items-center justify-center bg-warning text-white text-xs font-extrabold shrink-0 border-2 border-brutal">⚙</span> <div class="min-w-0"><span class="font-bold text-xs text-text group-hover:text-warning transition-colors block">Knowledge</span> <span class="text-[9px] text-text-muted">${escape_html(data.knowledgeHealth.totalPacks)} packs</span></div></a></div></div> `);
      if (data.clients.list.length > 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="brutal-border bg-surface shadow-md p-4"><div class="flex items-center justify-between mb-3 pb-2 border-b-2 border-border-light"><h2 class="text-[10px] font-extrabold uppercase tracking-widest text-text-muted">Clients</h2> <a href="/clients" class="text-[10px] font-bold text-primary hover:text-primary-hover no-underline">All →</a></div> <div class="space-y-1.5"><!--[-->`);
        const each_array_1 = ensure_array_like(data.clients.list);
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let client = each_array_1[$$index_1];
          $$renderer2.push(`<a${attr("href", `/clients/${stringify(client.id)}`)} class="no-underline group flex items-center gap-2.5 px-2 py-1.5 hover:bg-surface-hover transition-colors"><div class="flex h-6 w-6 items-center justify-center bg-primary-light text-[10px] text-primary font-extrabold shrink-0 border border-brutal">${escape_html(client.name.charAt(0).toUpperCase())}</div> <div class="min-w-0 flex-1"><span class="font-bold text-xs text-text block truncate group-hover:text-primary transition-colors">${escape_html(client.name)}</span> `);
          if (client.industry) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<span class="text-[9px] text-text-muted truncate block">${escape_html(client.industry)}</span>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--></div></a>`);
        }
        $$renderer2.push(`<!--]--></div> `);
        if (data.clients.total > 4) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<p class="text-[10px] text-text-muted text-center mt-2 pt-2 border-t border-border-light">+${escape_html(data.clients.total - 4)} more</p>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> <div class="brutal-border bg-surface shadow-md p-4"><h2 class="text-[10px] font-extrabold uppercase tracking-widest text-text-muted mb-3 pb-2 border-b-2 border-border-light">CLI Shortcuts</h2> <div class="space-y-2"><div class="flex items-center gap-2"><code class="text-[9px] font-mono bg-bg px-1.5 py-0.5 border border-border-light shrink-0">/migrate-new</code> <span class="text-[9px] text-text-muted">Create</span></div> <div class="flex items-center gap-2"><code class="text-[9px] font-mono bg-bg px-1.5 py-0.5 border border-border-light shrink-0">/migrate-discover</code> <span class="text-[9px] text-text-muted">Discover</span></div> <div class="flex items-center gap-2"><code class="text-[9px] font-mono bg-bg px-1.5 py-0.5 border border-border-light shrink-0">/migrate-analyze</code> <span class="text-[9px] text-text-muted">Analyze</span></div> <div class="flex items-center gap-2"><code class="text-[9px] font-mono bg-bg px-1.5 py-0.5 border border-border-light shrink-0">/migrate-estimate</code> <span class="text-[9px] text-text-muted">Estimate</span></div> <div class="flex items-center gap-2"><code class="text-[9px] font-mono bg-bg px-1.5 py-0.5 border border-border-light shrink-0">/migrate-plan</code> <span class="text-[9px] text-text-muted">Deliver</span></div></div></div></div></aside> <main class="flex-1 min-w-0 space-y-6"><div class="grid md:grid-cols-2 gap-6"><div class="stagger-grid" style="--stagger-i: 1;">`);
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="flex items-center justify-between mb-4"><h2 class="text-sm font-extrabold uppercase tracking-wider">Workflow Pipeline</h2> <span class="text-xs font-mono text-text-muted">${escape_html(data.portfolio.total)} total</span></div> <div class="space-y-3"><!--[-->`);
          const each_array_2 = ensure_array_like(pipelineStages());
          for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
            let stage = each_array_2[$$index_2];
            $$renderer3.push(`<div class="flex items-center gap-3"><span class="text-xs font-bold uppercase tracking-wider text-text-muted w-20 shrink-0 text-right">${escape_html(stage.label)}</span> <div class="flex-1 h-7 bg-border-light border border-brutal relative overflow-hidden"><div${attr_class(`h-full ${stringify(stage.color)} transition-all duration-500 flex items-center justify-end pr-2`)}${attr_style(`width: ${stringify(stage.count > 0 ? Math.max(stage.count / pipelineMax() * 100, 8) : 0)}%`)}>`);
            if (stage.count > 0) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<span class="text-xs font-extrabold font-mono text-white">${escape_html(stage.count)}</span>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--></div></div></div>`);
          }
          $$renderer3.push(`<!--]--></div>`);
        }
      });
      $$renderer2.push(`<!----></div> <div class="stagger-grid" style="--stagger-i: 2;">`);
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="flex items-center justify-between mb-4"><h2 class="text-sm font-extrabold uppercase tracking-wider">Risk &amp; Assumptions</h2> <span class="text-xs font-mono text-text-muted">${escape_html(data.riskSummary.total)} / ${escape_html(data.assumptionSummary.total)}</span></div> `);
          if (data.riskSummary.total > 0) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="mb-5"><span class="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-2">Risk by Severity</span> <div class="flex gap-1 h-8"><!--[-->`);
            const each_array_3 = ensure_array_like(riskBars());
            for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
              let bar = each_array_3[$$index_3];
              if (bar.count > 0) {
                $$renderer3.push("<!--[-->");
                Tooltip($$renderer3, {
                  text: `${stringify(bar.count)} ${stringify(bar.label.toLowerCase())} risk${stringify(bar.count !== 1 ? "s" : "")}`,
                  position: "bottom",
                  children: ($$renderer4) => {
                    $$renderer4.push(`<div${attr_class(`h-full ${stringify(bar.color)} border border-brutal flex items-center justify-center min-w-[32px] cursor-help transition-all hover:opacity-90`)}${attr_style(`flex: ${stringify(bar.count)};`)}><span class="text-[10px] font-extrabold font-mono text-white">${escape_html(bar.count)}</span></div>`);
                  }
                });
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]-->`);
            }
            $$renderer3.push(`<!--]--></div> <div class="flex gap-3 mt-2"><!--[-->`);
            const each_array_4 = ensure_array_like(riskBars());
            for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
              let bar = each_array_4[$$index_4];
              $$renderer3.push(`<span${attr_class(`text-[9px] font-mono ${stringify(bar.textColor)}`)}>${escape_html(bar.count)} ${escape_html(bar.label)}</span>`);
            }
            $$renderer3.push(`<!--]--></div></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
            $$renderer3.push(`<p class="text-sm text-text-muted mb-5">No risks identified yet.</p>`);
          }
          $$renderer3.push(`<!--]--> `);
          if (data.assumptionSummary.total > 0) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div><div class="flex items-center justify-between mb-2"><span class="text-[10px] font-bold uppercase tracking-wider text-text-muted">Assumption Validation</span> <span class="text-xs font-mono font-bold">${escape_html(assumptionPct())}%</span></div> <div class="h-5 w-full flex border border-brutal overflow-hidden">`);
            if (data.assumptionSummary.validated > 0) {
              $$renderer3.push("<!--[-->");
              Tooltip($$renderer3, {
                text: `${stringify(data.assumptionSummary.validated)} validated`,
                position: "bottom",
                children: ($$renderer4) => {
                  $$renderer4.push(`<div class="h-full bg-success cursor-help"${attr_style(`width: ${stringify(data.assumptionSummary.validated / data.assumptionSummary.total * 100)}%`)}></div>`);
                }
              });
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--> `);
            if (data.assumptionSummary.unvalidated > 0) {
              $$renderer3.push("<!--[-->");
              Tooltip($$renderer3, {
                text: `${stringify(data.assumptionSummary.unvalidated)} unvalidated`,
                position: "bottom",
                children: ($$renderer4) => {
                  $$renderer4.push(`<div class="h-full bg-warning cursor-help"${attr_style(`width: ${stringify(data.assumptionSummary.unvalidated / data.assumptionSummary.total * 100)}%`)}></div>`);
                }
              });
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--> `);
            if (data.assumptionSummary.invalidated > 0) {
              $$renderer3.push("<!--[-->");
              Tooltip($$renderer3, {
                text: `${stringify(data.assumptionSummary.invalidated)} invalidated`,
                position: "bottom",
                children: ($$renderer4) => {
                  $$renderer4.push(`<div class="h-full bg-danger cursor-help"${attr_style(`width: ${stringify(data.assumptionSummary.invalidated / data.assumptionSummary.total * 100)}%`)}></div>`);
                }
              });
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--></div> <div class="flex gap-4 mt-1.5"><span class="text-[9px] font-mono text-success">${escape_html(data.assumptionSummary.validated)} Validated</span> <span class="text-[9px] font-mono text-warning">${escape_html(data.assumptionSummary.unvalidated)} Unvalidated</span> <span class="text-[9px] font-mono text-danger">${escape_html(data.assumptionSummary.invalidated)} Invalidated</span></div></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
            $$renderer3.push(`<p class="text-sm text-text-muted">No assumptions tracked yet.</p>`);
          }
          $$renderer3.push(`<!--]-->`);
        }
      });
      $$renderer2.push(`<!----></div></div> `);
      if (data.topProjects.length > 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="stagger-grid" style="--stagger-i: 3;">`);
        Card($$renderer2, {
          padding: "p-0",
          children: ($$renderer3) => {
            $$renderer3.push(`<div class="flex items-center justify-between px-6 pt-5 pb-4"><h2 class="text-sm font-extrabold uppercase tracking-wider">Recent Assessments</h2> `);
            if (data.portfolio.total > 5) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<a href="/assessments" class="text-xs font-bold text-primary hover:text-primary-hover no-underline">View all ${escape_html(data.portfolio.total)} →</a>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--></div> <div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="bg-brutal text-white text-left"><th class="px-6 py-2.5 text-[10px] font-extrabold uppercase tracking-wider">Project</th><th class="px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-wider">Status</th><th class="px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-wider">Workflow</th><th class="px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-right">Discovery</th><th class="px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-right">Confidence</th><th class="px-6 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-right">Hours</th></tr></thead><tbody><!--[-->`);
            const each_array_5 = ensure_array_like(data.topProjects);
            for (let $$index_6 = 0, $$length = each_array_5.length; $$index_6 < $$length; $$index_6++) {
              let project = each_array_5[$$index_6];
              const steps = getStepStatuses(project);
              $$renderer3.push(`<tr class="border-b-2 border-border-light hover:bg-surface-hover transition-colors group"><td class="px-6 py-3"><a${attr("href", `/assessments/${stringify(project.id)}`)} class="no-underline"><span class="font-bold text-text group-hover:text-primary transition-colors block">${escape_html(project.name)}</span> `);
              if (project.client) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<span class="text-xs text-text-muted">${escape_html(project.client)}</span>`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--></a></td><td class="px-4 py-3">`);
              Badge($$renderer3, {
                variant: statusVariant[project.status] ?? "default",
                children: ($$renderer4) => {
                  $$renderer4.push(`<!---->${escape_html(project.status)}`);
                }
              });
              $$renderer3.push(`<!----></td><td class="px-4 py-3"><div class="flex items-center gap-0.5 min-w-[120px]"><!--[-->`);
              const each_array_6 = ensure_array_like(workflowSteps);
              for (let i = 0, $$length2 = each_array_6.length; i < $$length2; i++) {
                let step = each_array_6[i];
                Tooltip($$renderer3, {
                  text: `${stringify(step)}: ${stringify(steps[i].replace("-", " "))}`,
                  position: "bottom",
                  children: ($$renderer4) => {
                    $$renderer4.push(`<div${attr_class(`flex-1 h-2 ${stringify(stepBarColor(steps[i]))} cursor-help transition-colors`)}></div>`);
                  }
                });
                $$renderer3.push(`<!----> `);
                if (i < workflowSteps.length - 1) {
                  $$renderer3.push("<!--[-->");
                  $$renderer3.push(`<div class="w-px"></div>`);
                } else {
                  $$renderer3.push("<!--[!-->");
                }
                $$renderer3.push(`<!--]-->`);
              }
              $$renderer3.push(`<!--]--></div></td><td class="px-4 py-3 text-right font-mono">`);
              if (project.discovery != null) {
                $$renderer3.push("<!--[-->");
                const d = Math.min(100, Math.round(project.discovery));
                $$renderer3.push(`<span${attr_class(`font-bold ${stringify(d >= 80 ? "text-success" : d >= 50 ? "text-warning" : "text-danger")}`)}>${escape_html(d)}%</span>`);
              } else {
                $$renderer3.push("<!--[!-->");
                $$renderer3.push(`<span class="text-text-muted">---</span>`);
              }
              $$renderer3.push(`<!--]--></td><td class="px-4 py-3 text-right font-mono">`);
              if (project.confidence != null) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<span${attr_class(`font-bold ${stringify(confidenceVariant(project.confidence) === "success" ? "text-success" : confidenceVariant(project.confidence) === "warning" ? "text-warning" : "text-danger")}`)}>${escape_html(Math.round(project.confidence))}%</span>`);
              } else {
                $$renderer3.push("<!--[!-->");
                $$renderer3.push(`<span class="text-text-muted">---</span>`);
              }
              $$renderer3.push(`<!--]--></td><td class="px-6 py-3 text-right font-mono font-bold">`);
              if (project.hours != null) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`${escape_html(formatHours(project.hours))}`);
              } else {
                $$renderer3.push("<!--[!-->");
                $$renderer3.push(`<span class="text-text-muted">---</span>`);
              }
              $$renderer3.push(`<!--]--></td></tr>`);
            }
            $$renderer3.push(`<!--]--></tbody></table></div>`);
          }
        });
        $$renderer2.push(`<!----></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></main></div> <div class="lg:hidden mt-6 grid sm:grid-cols-2 gap-3"><a href="/new" class="no-underline group">`);
      Card($$renderer2, {
        hover: true,
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="flex items-center gap-3"><span class="flex h-8 w-8 items-center justify-center bg-primary text-white text-sm font-extrabold shrink-0 border-2 border-brutal">+</span> <span class="font-bold text-sm text-text group-hover:text-primary transition-colors">New Assessment</span></div>`);
        }
      });
      $$renderer2.push(`<!----></a> <a href="/assessments" class="no-underline group">`);
      Card($$renderer2, {
        hover: true,
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="flex items-center gap-3"><span class="flex h-8 w-8 items-center justify-center bg-brutal text-white text-sm font-extrabold shrink-0 border-2 border-brutal">☰</span> <span class="font-bold text-sm text-text group-hover:text-primary transition-colors">All Assessments</span></div>`);
        }
      });
      $$renderer2.push(`<!----></a> <a href="/clients" class="no-underline group">`);
      Card($$renderer2, {
        hover: true,
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="flex items-center gap-3"><span class="flex h-8 w-8 items-center justify-center bg-info text-white text-sm font-extrabold shrink-0 border-2 border-brutal">♔</span> <span class="font-bold text-sm text-text group-hover:text-info transition-colors">Clients</span></div>`);
        }
      });
      $$renderer2.push(`<!----></a> <a href="/knowledge" class="no-underline group">`);
      Card($$renderer2, {
        hover: true,
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="flex items-center gap-3"><span class="flex h-8 w-8 items-center justify-center bg-warning text-white text-sm font-extrabold shrink-0 border-2 border-brutal">⚙</span> <span class="font-bold text-sm text-text group-hover:text-warning transition-colors">Knowledge</span></div>`);
        }
      });
      $$renderer2.push(`<!----></a></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-CAOPH0fU.js.map
