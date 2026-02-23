import { aa as head, ab as escape_html, ac as ensure_array_like, ad as attr, a6 as attr_class, a7 as stringify, a1 as derived, ae as attr_style } from './index4-DG1itRH8.js';
import './root-DQzxKDPP.js';
import './state.svelte-DeAIIc79.js';
import './client-Cm3t_ao5.js';
import { C as Card } from './Card-w7RlWvYA.js';
import { B as Badge } from './Badge-CWejdkwM.js';
import { I as InfoDrawer } from './InfoDrawer-WPURexns.js';
import { T as Tooltip } from './Tooltip-hZ63yG7F.js';
import { C as ConfidenceGauge } from './ConfidenceGauge-CfeVxdrW.js';
import { s as severityVariant } from './migration-stats-BAGrJ4E5.js';
import { C as ConfidenceImprovementPath } from './ConfidenceImprovementPath-Bby9a7kW.js';
import { c as computeRefinedTotals, f as filterPhases, g as getPhaseHours } from './scenario-engine-BY9xcCE7.js';
import './index-mV5xf0Xo.js';
import './index-server-CVwIEJCx.js';

function WorkflowProgress($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { steps, reviews = {}, baseHref = "" } = $$props;
    const stepTooltips = {
      "Discovery": "Gather infrastructure and environment details across all dimensions.",
      "Analysis": "Identify risks, assumptions, complexity multipliers, and data gaps.",
      "Estimate": "Calculate hours by phase and component with AI tool savings.",
      "Refine": "Adjust scope by excluding components and customizing AI tools.",
      "Deliverables": "Generate migration plan, risk register, runbook, and dashboard."
    };
    const stepToReviewKey = {
      "Discovery": "discovery",
      "Analysis": "analysis",
      "Estimate": "estimate",
      "Refine": "refine"
    };
    function reviewDiamondColor(review) {
      if (!review) return "bg-border-light border-border-light";
      if (review.latestStatus === "passed" || review.confidenceScore >= 80) return "bg-success border-success";
      if (review.latestStatus === "conditional_pass" || review.confidenceScore >= 65) return "bg-warning border-warning";
      return "bg-danger border-danger";
    }
    function reviewTooltip(review, stepLabel) {
      if (!review) return `${stepLabel} agent review not yet run`;
      return `${stepLabel} agent review: ${Math.round(review.confidenceScore)}% (${review.latestStatus.replace("_", " ")})`;
    }
    function getReview(stepLabel) {
      const key = stepToReviewKey[stepLabel];
      if (!key) return null;
      return reviews[key] ?? null;
    }
    function getReviewHref(step) {
      return step.href + "/review";
    }
    function connectorColor(step) {
      return step.status === "complete" ? "bg-success" : "bg-border-light";
    }
    $$renderer2.push(`<div class="flex items-start w-full px-[52px]"><!--[-->`);
    const each_array = ensure_array_like(steps);
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let step = each_array[i];
      const isComplete = step.status === "complete";
      const isActive = step.status === "in-progress";
      const isNotStarted = step.status === "not-started";
      $$renderer2.push(`<div class="flex flex-col items-center" style="width: 0; flex: 0 0 auto;"><a${attr("href", step.href)} class="no-underline group relative z-10"${attr("aria-label", step.label)}>`);
      Tooltip($$renderer2, {
        text: stepTooltips[step.label] ?? "",
        position: "bottom",
        children: ($$renderer3) => {
          $$renderer3.push(`<div${attr_class(` flex items-center justify-center w-11 h-11 border-3 font-extrabold text-sm transition-all duration-150 ${stringify(isComplete ? "bg-success border-success text-white" : "")} ${stringify(isActive ? "bg-primary border-primary text-white" : "")} ${stringify(isNotStarted ? "bg-surface border-brutal text-text-muted" : "")} group-hover:-translate-y-0.5 group-hover:shadow-md `)}>`);
          if (isComplete) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M3 9.5L7 14L15 4" stroke="white" stroke-width="2.5" stroke-linecap="square" stroke-linejoin="miter"></path></svg>`);
          } else if (isActive) {
            $$renderer3.push("<!--[1-->");
            $$renderer3.push(`<span class="relative flex h-3 w-3"><span class="animate-ping absolute inline-flex h-full w-full bg-white opacity-60"></span> <span class="relative inline-flex h-3 w-3 bg-white"></span></span>`);
          } else {
            $$renderer3.push("<!--[!-->");
            $$renderer3.push(`<span class="font-mono text-sm">${escape_html(i + 1)}</span>`);
          }
          $$renderer3.push(`<!--]--></div>`);
        }
      });
      $$renderer2.push(`<!----></a> <a${attr("href", step.href)} class="no-underline flex flex-col items-center mt-2 group"><span${attr_class(`text-[11px] font-extrabold uppercase tracking-wider whitespace-nowrap ${stringify(isNotStarted ? "text-text-muted" : "text-text")} group-hover:text-primary transition-colors`)}>${escape_html(step.label)}</span> `);
      if (step.detail) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<span${attr_class(` mt-0.5 text-[10px] font-bold font-mono px-1.5 py-0.5 leading-none border ${stringify(isComplete ? "bg-success-light text-success border-success" : "")} ${stringify(isActive ? "bg-primary-light text-primary border-primary" : "")} ${stringify(isNotStarted ? "text-text-muted border-transparent" : "")} `)}>${escape_html(step.detail)}</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></a></div> `);
      if (i < steps.length - 1) {
        $$renderer2.push("<!--[-->");
        const review = getReview(step.label);
        const hasReview = !!stepToReviewKey[step.label];
        $$renderer2.push(`<div class="flex items-center flex-1 mt-[18px]"><div${attr_class(`h-[3px] flex-1 ${stringify(connectorColor(step))}`)}></div> `);
        if (hasReview) {
          $$renderer2.push("<!--[-->");
          Tooltip($$renderer2, {
            text: reviewTooltip(review, step.label),
            position: "bottom",
            children: ($$renderer3) => {
              $$renderer3.push(`<a${attr("href", getReviewHref(step))} class="no-underline mx-1 relative z-10"${attr("aria-label", `${stringify(step.label)} agent review`)}><div${attr_class(`w-[18px] h-[18px] rotate-45 border-2 ${stringify(reviewDiamondColor(review))} hover:scale-125 transition-all`)}></div></a>`);
            }
          });
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--> <div${attr_class(`h-[3px] flex-1 ${stringify(connectorColor(step))}`)}></div></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function PhaseBarChart($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { phases, getPhaseHours: getPhaseHours2, total } = $$props;
    const maxPhaseHours = derived(() => Math.max(...phases.map((p) => getPhaseHours2(p)), 1));
    $$renderer2.push(`<div class="space-y-3"><!--[-->`);
    const each_array = ensure_array_like(phases);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let phase = each_array[$$index];
      const phaseHours = getPhaseHours2(phase);
      const componentCount = (phase.components ?? []).length;
      $$renderer2.push(`<div><div class="flex items-center justify-between mb-1"><span class="text-sm font-bold">${escape_html(phase.name)}</span> <div class="text-right"><span class="text-sm font-mono font-bold">${escape_html(Math.round(phaseHours))}h</span> <span class="text-xs text-text-muted ml-1">(${escape_html(componentCount)} components)</span></div></div> <div class="h-6 w-full bg-border-light border border-brutal relative"><div class="h-full bg-primary transition-all duration-300"${attr_style(`width: ${stringify(phaseHours / maxPhaseHours() * 100)}%`)}></div></div></div>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="mt-4 pt-3 border-t-2 border-brutal flex justify-between items-center"><span class="text-xs font-extrabold uppercase tracking-wider text-text-muted">Total</span> <span class="text-lg font-extrabold font-mono">${escape_html(Math.round(total).toLocaleString())}h</span></div>`);
  });
}
function RiskSummaryList($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { risks, limit = 5, assessmentId } = $$props;
    if (risks.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="text-sm text-text-muted text-center py-4">No risks identified</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="space-y-2"><!--[-->`);
      const each_array = ensure_array_like(risks.slice(0, limit));
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let risk = each_array[$$index];
        $$renderer2.push(`<div class="flex items-center gap-3 px-3 py-2 border border-border-light hover:bg-surface-hover transition-colors">`);
        Tooltip($$renderer2, {
          text: `${stringify(risk.likelihood)} likelihood | ${stringify(risk.category)}`,
          children: ($$renderer3) => {
            Badge($$renderer3, {
              variant: severityVariant(risk.severity),
              children: ($$renderer4) => {
                $$renderer4.push(`<!---->${escape_html(risk.severity)}`);
              }
            });
          }
        });
        $$renderer2.push(`<!----> `);
        Tooltip($$renderer2, {
          text: risk.mitigation ?? risk.description,
          position: "bottom",
          block: true,
          children: ($$renderer3) => {
            $$renderer3.push(`<span class="text-sm block truncate">${escape_html(risk.description)}</span>`);
          }
        });
        $$renderer2.push(`<!----> <span class="text-xs font-mono font-bold shrink-0">+${escape_html(risk.estimated_hours_impact)}h</span></div>`);
      }
      $$renderer2.push(`<!--]--> `);
      if (risks.length > limit) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<p class="text-xs text-text-muted text-center pt-1">+${escape_html(risks.length - limit)} more risks — <a${attr("href", `/assessments/${stringify(assessmentId)}/analysis`)} class="text-primary font-bold">View all</a></p>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    const assessment = derived(() => data.assessment);
    const estimate = derived(() => data.estimate);
    const analysis = derived(() => data.analysis);
    const summary = derived(() => data.summary);
    const phases = derived(() => estimate()?.phases ?? []);
    const risks = derived(() => analysis()?.risks ?? []);
    const gaps = derived(() => analysis()?.gaps);
    const assumptions = derived(() => analysis()?.assumptions ?? []);
    let aiToggles = {};
    let scenario = "ai_assisted";
    let drawerSection = null;
    let savingAssumption = null;
    let validatedLocally = {};
    const profData = derived(() => data.proficiencyData);
    const excludedSet = derived(() => new Set(Object.entries(data.scopeExclusions?.exclusions ?? {}).filter(([, v]) => v).map(([k]) => k)));
    const filteredPhases = derived(() => filterPhases(phases(), excludedSet()));
    const scenarioTotals = derived(() => computeRefinedTotals(phases(), aiToggles, excludedSet(), profData()));
    const activeTotal = derived(() => scenarioTotals().aiAssisted);
    const riskClusters = derived(() => (analysis()?.risk_clusters ?? []).slice().sort((a, b) => (b.combined_widening_hours ?? 0) - (a.combined_widening_hours ?? 0)));
    const topUnknowns = derived(() => assumptions().filter((a) => a.validation_status !== "validated" && !validatedLocally[a.id]).slice().sort((a, b) => (b.pessimistic_widening_hours ?? 0) - (a.pessimistic_widening_hours ?? 0)));
    const localValidatedCount = derived(() => Object.keys(validatedLocally).filter((id) => !assumptions().find((a) => a.id === id && a.validation_status === "validated")).length);
    const adjustedUnvalidated = derived(() => Math.max(0, summary().assumptions.unvalidated - localValidatedCount()));
    const adjustedValidated = derived(() => summary().assumptions.validated + localValidatedCount());
    const maxClusterWidening = derived(() => riskClusters().length > 0 ? Math.max(...riskClusters().map((c) => c.combined_widening_hours ?? 0)) : 0);
    const base = derived(() => `/assessments/${assessment().id}`);
    const workflowSteps = derived(() => (() => {
      let activeIdx = 0;
      if (assessment().status === "complete") activeIdx = 5;
      else if (summary().hasEstimate) activeIdx = 3;
      else if (summary().hasAnalysis) activeIdx = 2;
      else if (summary().hasDiscovery) activeIdx = 1;
      const defs = [
        {
          label: "Discovery",
          href: `${base()}/discovery`,
          detail: `${summary().discovery.discoveryPercent}%`
        },
        {
          label: "Analysis",
          href: `${base()}/analysis`,
          detail: `${summary().risks.total} risks`
        },
        {
          label: "Estimate",
          href: `${base()}/estimate`,
          detail: summary().hasEstimate ? `${Math.round(summary().estimateHours)}h` : ""
        },
        {
          label: "Refine",
          href: `${base()}/refine`,
          detail: excludedSet().size > 0 ? `${excludedSet().size} excluded` : ""
        },
        {
          label: "Deliverables",
          href: `${base()}/deliverables`,
          detail: ""
        }
      ];
      return defs.map((d, i) => ({
        ...d,
        status: i < activeIdx ? "complete" : i === activeIdx ? "in-progress" : "not-started"
      }));
    })());
    const scenarioDefs = [
      { id: "manual", label: "Manual", icon: "⛏" },
      { id: "ai_assisted", label: "AI-Assisted", icon: "⚡" },
      { id: "best_case", label: "Best Case", icon: "🎯" }
    ];
    function hoursFor(id) {
      if (id === "manual") return scenarioTotals().manual;
      if (id === "best_case") return scenarioTotals().bestCase;
      return scenarioTotals().aiAssisted;
    }
    const nextStep = derived(() => (() => {
      if (!summary().hasDiscovery) return {
        target: "Discovery",
        href: `${base()}/discovery`,
        command: "/migrate-discover",
        description: "Gather project information — topology, integrations, data, and infrastructure."
      };
      if (!summary().hasAnalysis) return {
        target: "Analysis",
        href: `${base()}/analysis`,
        command: "/migrate-analyze",
        description: "Identify risks, dependencies, and complexity multipliers."
      };
      return {
        target: "Estimate",
        href: `${base()}/estimate`,
        command: "/migrate-estimate",
        description: "Calculate effort hours across all migration phases."
      };
    })());
    head("fk6ez0", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html(assessment().project_name)} — Overview</title>`);
      });
    });
    $$renderer2.push(`<div class="animate-enter">`);
    if (estimate()) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<section class="hero-surface border-b-3 border-primary"><div class="px-8 pt-8 pb-5"><div class="flex items-start justify-between gap-8"><div><button class="text-[10px] font-extrabold uppercase tracking-widest text-white/50 hover:text-white/70 transition-colors mb-2 block cursor-pointer" aria-label="About this page">Total Estimate <span class="font-mono opacity-60">(i)</span></button> <div class="flex items-baseline gap-3"><span class="text-[clamp(3rem,8vw,4.5rem)] font-extrabold font-mono tracking-tighter leading-none tabular-nums">${escape_html(Math.round(activeTotal()).toLocaleString())}</span> <span class="text-lg font-extrabold text-white/45 uppercase tracking-wider">hours</span></div> `);
      {
        $$renderer2.push("<!--[-->");
        const savings = scenarioTotals().manual - activeTotal();
        const pct = scenarioTotals().manual > 0 ? Math.round(savings / scenarioTotals().manual * 100) : 0;
        $$renderer2.push(`<div class="flex items-center gap-2 mt-2"><span class="text-xs font-mono font-bold text-success">-${escape_html(Math.round(savings).toLocaleString())}h (${escape_html(pct)}%)</span> <span class="text-[10px] text-white/40">vs manual</span></div>`);
      }
      $$renderer2.push(`<!--]--></div> <div class="shrink-0 text-right hidden sm:block"><div class="inline-flex items-center gap-3 px-4 py-2 border-2 border-white/20 bg-white/5"><span class="text-xs font-extrabold uppercase tracking-wider">${escape_html(assessment().source_stack?.infrastructure || assessment().source_cloud)}</span> <svg width="20" height="12" viewBox="0 0 20 12" fill="none" aria-hidden="true"><path d="M0 6H16M16 6L11 1M16 6L11 11" stroke="currentColor" stroke-width="2" stroke-linecap="square"></path></svg> <span class="text-xs font-extrabold uppercase tracking-wider">${escape_html(assessment().target_stack?.infrastructure || assessment().target_cloud)}</span></div> <div class="mt-2 space-y-0.5 text-[10px] font-mono text-white/40">`);
      if (assessment().source_stack?.platform) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div>${escape_html(assessment().source_stack.platform)}${escape_html(assessment().source_stack.platform_version ? ` ${assessment().source_stack.platform_version}` : "")}</div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (assessment().source_stack?.topology) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div>${escape_html(assessment().source_stack.topology)}</div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (assessment().target_timeline) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div>Target: ${escape_html(assessment().target_timeline)}</div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div></div></div></div> <div class="border-t border-white/10 px-8 py-3"><div class="flex items-center gap-5"><button class="text-[10px] font-extrabold uppercase tracking-widest text-white/45 hover:text-white/70 transition-colors shrink-0 cursor-pointer">Scenario <span class="font-mono opacity-60">(i)</span></button> <div class="flex gap-1.5" role="radiogroup" aria-label="Estimate scenario"><!--[-->`);
      const each_array = ensure_array_like(scenarioDefs);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let s = each_array[$$index];
        const active = scenario === s.id;
        const hrs = hoursFor(s.id);
        const delta = s.id !== "manual" && scenarioTotals().manual > 0 ? Math.round((hrs - scenarioTotals().manual) / scenarioTotals().manual * 100) : 0;
        $$renderer2.push(`<button role="radio"${attr("aria-checked", active)}${attr_class(`flex items-center gap-2 px-4 py-2 text-xs font-extrabold uppercase tracking-wider border-2 transition-all cursor-pointer ${stringify(active ? "bg-white text-[#1a1a1a] border-white shadow-[2px_2px_0_rgba(255,255,255,0.15)]" : "bg-transparent text-white/60 border-white/20 hover:border-white/40 hover:text-white/80")}`)}><span class="text-sm leading-none">${escape_html(s.icon)}</span> <span class="hidden md:inline">${escape_html(s.label)}</span> <span${attr_class(`font-mono text-[11px] ${stringify(active ? "text-[#1a1a1a]/60" : "text-white/40")}`)}>${escape_html(Math.round(hrs).toLocaleString())}h</span> `);
        if (delta !== 0) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<span${attr_class(`text-[10px] font-mono ${stringify(active ? "text-[#1a1a1a]/40" : "text-success/70")}`)}>${escape_html(delta)}%</span>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></button>`);
      }
      $$renderer2.push(`<!--]--></div></div></div> <div class="border-t border-white/10 px-8 py-2.5 flex items-center gap-5 flex-wrap text-[11px]"><a${attr("href", `${stringify(base())}/discovery`)} class="flex items-center gap-1.5 text-white/50 hover:text-white/80 transition-colors no-underline"><span${attr_class(`font-mono font-bold tabular-nums ${stringify(summary().discovery.discoveryPercent === 100 ? "text-success" : "text-white/70")}`)}>${escape_html(summary().discovery.discoveryPercent)}%</span> <span>discovery</span></a> <span class="text-white/20" aria-hidden="true">·</span> <a${attr("href", `${stringify(base())}/analysis?tab=gaps`)} class="flex items-center gap-1.5 text-white/50 hover:text-white/80 transition-colors no-underline"><span${attr_class(`font-mono font-bold tabular-nums ${stringify(summary().confidence >= 70 ? "text-success" : summary().confidence >= 40 ? "text-warning" : "text-danger")}`)}>${escape_html(summary().confidence)}%</span> <span>confidence</span></a> <span class="text-white/20" aria-hidden="true">·</span> <a${attr("href", `${stringify(base())}/analysis?tab=risks`)} class="flex items-center gap-1.5 text-white/50 hover:text-white/80 transition-colors no-underline"><span${attr_class(`font-mono font-bold tabular-nums ${stringify(summary().risks.critical > 0 ? "text-danger" : "text-white/70")}`)}>${escape_html(summary().risks.open)}</span> <span>risks`);
      if (summary().risks.critical > 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(` <span class="text-danger">(${escape_html(summary().risks.critical)} crit)</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></span></a> <span class="text-white/20" aria-hidden="true">·</span> <a${attr("href", `${stringify(base())}/analysis?tab=assumptions`)} class="flex items-center gap-1.5 text-white/50 hover:text-white/80 transition-colors no-underline"><span${attr_class(`font-mono font-bold tabular-nums ${stringify(adjustedUnvalidated() > 0 ? "text-warning" : "text-success")}`)}>${escape_html(adjustedUnvalidated())}</span> <span>open assumptions</span></a></div></section> <div class="p-6 space-y-6"><div class="brutal-border bg-surface px-5 py-5">`);
      WorkflowProgress($$renderer2, {
        steps: workflowSteps(),
        reviews: data.summary?.challengeReviews ?? {}
      });
      $$renderer2.push(`<!----></div> `);
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="flex items-center justify-between mb-5 pb-2 border-b-3 border-primary"><button class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-primary cursor-pointer hover:opacity-80 transition-opacity">Hours by Phase <span class="text-[10px] font-mono opacity-60">(i)</span></button> <span class="text-[10px] font-mono text-text-muted tabular-nums">${escape_html(filteredPhases().length)} phases · ${escape_html(Math.round(activeTotal()).toLocaleString())}h total</span></div> `);
          PhaseBarChart($$renderer3, {
            phases: filteredPhases(),
            getPhaseHours: (p) => getPhaseHours(p, scenario, aiToggles, profData()),
            total: activeTotal()
          });
          $$renderer3.push(`<!---->`);
        }
      });
      $$renderer2.push(`<!----> <div class="grid gap-5 lg:grid-cols-[1fr_1fr] [&amp;>*]:min-w-0">`);
      Card($$renderer2, {
        children: ($$renderer3) => {
          const totalAssumptions = adjustedValidated() + adjustedUnvalidated() + summary().assumptions.invalidated;
          $$renderer3.push(`<div class="flex items-center justify-between mb-4 pb-2 border-b-3 border-primary"><button class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-primary cursor-pointer hover:opacity-80 transition-opacity">Confidence <span class="text-[10px] font-mono opacity-60">(i)</span></button></div> `);
          ConfidenceGauge($$renderer3, {
            score: summary().confidence,
            confirmed: gaps()?.confirmed_answers ?? 0,
            assumed: gaps()?.assumed_answers ?? 0,
            unknown: gaps()?.unknown_answers ?? 0,
            size: "sm"
          });
          $$renderer3.push(`<!---->  `);
          if (totalAssumptions > 0) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="mt-5 pt-4 border-t-2 border-border-light"><button class="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-text-muted hover:text-primary transition-colors cursor-pointer mb-2">Assumptions <span class="font-mono opacity-60">(i)</span></button> <div class="h-2.5 w-full border-2 border-brutal flex overflow-hidden">`);
            if (adjustedValidated() > 0) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="h-full bg-success transition-all duration-300"${attr_style(`width: ${stringify(adjustedValidated() / totalAssumptions * 100)}%`)}></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--> `);
            if (adjustedUnvalidated() > 0) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="h-full bg-warning transition-all duration-300"${attr_style(`width: ${stringify(adjustedUnvalidated() / totalAssumptions * 100)}%`)}></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--> `);
            if (summary().assumptions.invalidated > 0) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="h-full bg-danger transition-all duration-300"${attr_style(`width: ${stringify(summary().assumptions.invalidated / totalAssumptions * 100)}%`)}></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--></div> <div class="flex items-center justify-between mt-1.5 text-[10px]"><span class="font-bold text-success">${escape_html(adjustedValidated())} valid</span> <span class="font-bold text-warning">${escape_html(adjustedUnvalidated())} open</span> <span class="font-bold text-danger">${escape_html(summary().assumptions.invalidated)} invalid</span></div> <a${attr("href", `${stringify(base())}/analysis?tab=assumptions`)} class="block text-[10px] font-bold text-primary hover:text-primary-hover text-right mt-1">Manage →</a></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]-->`);
        }
      });
      $$renderer2.push(`<!----> `);
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="flex items-center justify-between mb-4 pb-2 border-b-3 border-primary"><button class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-primary cursor-pointer hover:opacity-80 transition-opacity">Risk Summary <span class="text-[10px] font-mono opacity-60">(i)</span></button> <span class="text-[10px] font-mono text-text-muted tabular-nums">${escape_html(summary().risks.open)} open</span></div> `);
          RiskSummaryList($$renderer3, { risks: risks(), assessmentId: assessment().id });
          $$renderer3.push(`<!---->`);
        }
      });
      $$renderer2.push(`<!----></div> `);
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="flex items-center justify-between mb-5 pb-2 border-b-3 border-primary"><button class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-primary cursor-pointer hover:opacity-80 transition-opacity">What Needs Attention <span class="text-[10px] font-mono opacity-60">(i)</span></button> <span class="text-[10px] font-mono text-text-muted tabular-nums">${escape_html(riskClusters().length)} cluster${escape_html(riskClusters().length !== 1 ? "s" : "")} · ${escape_html(adjustedUnvalidated())} open</span></div> `);
          if (riskClusters().length > 0) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="mb-6"><h3 class="text-[10px] font-extrabold uppercase tracking-widest text-text-muted mb-3">Risk Clusters</h3> <div class="space-y-2"><!--[-->`);
            const each_array_1 = ensure_array_like(riskClusters());
            for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
              let cluster = each_array_1[$$index_1];
              const widening = cluster.combined_widening_hours ?? 0;
              const riskCount = cluster.risks?.length ?? 0;
              const assumptionCount = cluster.assumptions?.length ?? 0;
              const barPct = maxClusterWidening() > 0 ? widening / maxClusterWidening() * 100 : 0;
              $$renderer3.push(`<a${attr("href", `${stringify(base())}/analysis?tab=risks`)} class="flex items-center gap-3 group no-underline text-inherit hover:bg-bg px-2 py-1 -mx-2 transition-colors"><span class="text-xs font-bold truncate w-40 shrink-0"${attr("title", cluster.name)}>${escape_html(cluster.name)}</span> <span class="text-[11px] font-mono font-bold text-danger tabular-nums shrink-0 w-12 text-right">+${escape_html(Math.round(widening))}h</span> <div class="flex-1 h-2.5 border-2 border-brutal bg-bg overflow-hidden"><div${attr_class(`h-full transition-all duration-300 ${stringify(widening >= 25 ? "bg-danger" : widening >= 15 ? "bg-warning" : "bg-success")}`)}${attr_style(`width: ${stringify(barPct)}%`)}></div></div> <span class="text-[10px] text-text-muted tabular-nums shrink-0 w-24 text-right">`);
              if (riskCount > 0) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`${escape_html(riskCount)} risk${escape_html(riskCount !== 1 ? "s" : "")}`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]-->`);
              if (riskCount > 0 && assumptionCount > 0) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`,`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]-->`);
              if (assumptionCount > 0) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`${escape_html(assumptionCount)} assumption${escape_html(assumptionCount !== 1 ? "s" : "")}`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--></span></a>`);
            }
            $$renderer3.push(`<!--]--></div> <a${attr("href", `${stringify(base())}/analysis?tab=risks`)} class="block text-[10px] font-bold text-primary hover:text-primary-hover text-right mt-2">View risks →</a></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]--> `);
          if (topUnknowns().length > 0) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="mb-6 pt-4 border-t-2 border-border-light"><h3 class="text-[10px] font-extrabold uppercase tracking-widest text-text-muted mb-3">Top Unknowns to Resolve</h3> <div class="space-y-1.5"><!--[-->`);
            const each_array_2 = ensure_array_like(topUnknowns().slice(0, 5));
            for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
              let assumption = each_array_2[i];
              $$renderer3.push(`<div class="flex items-center gap-3 text-sm"><span class="text-[10px] font-mono font-bold text-text-muted w-4 shrink-0">${escape_html(i + 1)}.</span> <span class="truncate flex-1"${attr("title", assumption.assumed_value ?? assumption.id)}>${escape_html(assumption.assumed_value ?? assumption.id)}</span> <span class="text-[11px] font-mono font-bold text-danger tabular-nums shrink-0">+${escape_html(Math.round(assumption.pessimistic_widening_hours ?? 0))}h</span> `);
              if (assumption.validation_method) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<span class="text-[10px] text-text-muted truncate max-w-32 hidden md:inline"${attr("title", assumption.validation_method)}>${escape_html(assumption.validation_method)}</span>`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--> <button${attr("disabled", savingAssumption === assumption.id, true)} class="shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border-2 border-success text-success hover:bg-success hover:text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-wait">${escape_html(savingAssumption === assumption.id ? "..." : "Validate")}</button></div>`);
            }
            $$renderer3.push(`<!--]--></div> `);
            if (topUnknowns().length > 5) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<a${attr("href", `${stringify(base())}/analysis?tab=assumptions`)} class="block text-[10px] font-bold text-primary hover:text-primary-hover text-right mt-2">View all ${escape_html(topUnknowns().length)} →</a>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]--> <div${attr_class(riskClusters().length > 0 || topUnknowns().length > 0 ? "pt-4 border-t-2 border-border-light" : "")}><h3 class="text-[10px] font-extrabold uppercase tracking-widest text-text-muted mb-3">How to Improve Confidence</h3> `);
          ConfidenceImprovementPath($$renderer3, {
            discovery: data.discovery ?? {},
            unvalidatedCount: adjustedUnvalidated(),
            totalWidening: summary().assumptions.totalWidening,
            unknownCount: gaps()?.unknown_answers ?? 0,
            assessmentId: assessment().id
          });
          $$renderer3.push(`<!----></div>`);
        }
      });
      $$renderer2.push(`<!----></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<section class="hero-surface border-b-3 border-primary"><div class="px-8 py-8"><div class="flex items-start justify-between gap-6"><div><div class="flex items-center gap-3 mb-2"><h1 class="text-2xl font-extrabold uppercase tracking-wider leading-none">${escape_html(assessment().project_name)}</h1> `);
      Badge($$renderer2, {
        variant: assessment().status === "complete" ? "success" : "info",
        children: ($$renderer3) => {
          $$renderer3.push(`<!---->${escape_html(assessment().status)}`);
        }
      });
      $$renderer2.push(`<!----> <button class="text-[10px] font-mono text-white/45 hover:text-white/70 transition-colors cursor-pointer" aria-label="About this page">(i)</button></div> `);
      if (assessment().client_name) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<span class="text-xs font-mono text-white/50">${escape_html(assessment().client_name)}</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div> <div class="shrink-0 flex items-center gap-3 px-4 py-2 border-2 border-white/20 bg-white/5"><span class="text-xs font-extrabold uppercase tracking-wider">${escape_html(assessment().source_stack?.infrastructure || assessment().source_cloud)}</span> <svg width="20" height="12" viewBox="0 0 20 12" fill="none" aria-hidden="true"><path d="M0 6H16M16 6L11 1M16 6L11 11" stroke="currentColor" stroke-width="2" stroke-linecap="square"></path></svg> <span class="text-xs font-extrabold uppercase tracking-wider">${escape_html(assessment().target_stack?.infrastructure || assessment().target_cloud)}</span></div></div> `);
      if (assessment().source_stack?.platform || assessment().source_stack?.topology || assessment().target_timeline) {
        $$renderer2.push("<!--[-->");
        const srcStack = assessment().source_stack;
        $$renderer2.push(`<div class="flex items-center gap-3 mt-4 text-[10px] font-mono text-white/40">`);
        if (srcStack?.platform) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<span>${escape_html(srcStack.platform)}${escape_html(srcStack.platform_version ? ` ${srcStack.platform_version}` : "")}</span>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--> `);
        if (srcStack?.platform && srcStack?.topology) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<span class="text-white/20">·</span>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--> `);
        if (srcStack?.topology) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<span>${escape_html(srcStack.topology)}</span>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--> `);
        if ((srcStack?.platform || srcStack?.topology) && assessment().target_timeline) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<span class="text-white/20">·</span>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--> `);
        if (assessment().target_timeline) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<span>Target: ${escape_html(assessment().target_timeline)}</span>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div> <div class="border-t border-white/10 px-8 py-2.5 flex items-center gap-5 flex-wrap text-[11px]"><a${attr("href", `${stringify(base())}/discovery`)} class="flex items-center gap-1.5 text-white/50 hover:text-white/80 transition-colors no-underline"><span${attr_class(`font-mono font-bold tabular-nums ${stringify(summary().discovery.discoveryPercent === 100 ? "text-success" : "text-white/70")}`)}>${escape_html(summary().discovery.discoveryPercent)}%</span> <span>discovery</span></a> <span class="text-white/20" aria-hidden="true">·</span> <a${attr("href", `${stringify(base())}/analysis?tab=gaps`)} class="flex items-center gap-1.5 text-white/50 hover:text-white/80 transition-colors no-underline"><span${attr_class(`font-mono font-bold tabular-nums ${stringify(summary().confidence >= 70 ? "text-success" : summary().confidence >= 40 ? "text-warning" : "text-danger")}`)}>${escape_html(summary().confidence)}%</span> <span>confidence</span></a> <span class="text-white/20" aria-hidden="true">·</span> <a${attr("href", `${stringify(base())}/analysis?tab=risks`)} class="flex items-center gap-1.5 text-white/50 hover:text-white/80 transition-colors no-underline"><span${attr_class(`font-mono font-bold tabular-nums ${stringify(summary().risks.critical > 0 ? "text-danger" : "text-white/70")}`)}>${escape_html(summary().risks.open)}</span> <span>risks</span></a> <span class="text-white/20" aria-hidden="true">·</span> <a${attr("href", `${stringify(base())}/analysis?tab=assumptions`)} class="flex items-center gap-1.5 text-white/50 hover:text-white/80 transition-colors no-underline"><span${attr_class(`font-mono font-bold tabular-nums ${stringify(adjustedUnvalidated() > 0 ? "text-warning" : adjustedValidated() > 0 ? "text-success" : "text-white/70")}`)}>${escape_html(adjustedUnvalidated())}</span> <span>open assumptions</span></a></div></section> <div class="p-6 space-y-6"><div class="brutal-border bg-surface px-5 py-5">`);
      WorkflowProgress($$renderer2, {
        steps: workflowSteps(),
        reviews: data.summary?.challengeReviews ?? {}
      });
      $$renderer2.push(`<!----></div> <div class="brutal-border bg-surface overflow-hidden"><div class="flex items-stretch"><div class="w-1.5 bg-primary shrink-0"></div> <div class="flex-1 px-6 py-5"><div class="flex items-center justify-between gap-6 flex-wrap"><div class="min-w-0"><div class="text-[10px] font-extrabold uppercase tracking-widest text-text-muted mb-1.5">Next Step</div> <h2 class="text-lg font-extrabold uppercase tracking-wider leading-tight">${escape_html(nextStep().target)}</h2> <p class="text-sm text-text-secondary mt-1 max-w-lg">${escape_html(nextStep().description)}</p></div> <a${attr("href", nextStep().href)} class="shrink-0 brutal-border-thin px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-primary text-white border-primary hover:bg-primary-hover active:translate-y-px transition-all no-underline">Go to ${escape_html(nextStep().target)} →</a></div> <div class="border-t-2 border-border-light pt-3 mt-4"><p class="text-[10px] text-text-muted">Or run <code class="brutal-border-thin bg-bg px-1.5 py-0.5 text-[10px] font-mono">${escape_html(nextStep().command)}</code> in Claude Code</p></div></div></div></div></div>`);
    }
    $$renderer2.push(`<!--]--></div> `);
    InfoDrawer($$renderer2, {
      open: drawerSection !== null,
      onclose: () => drawerSection = null,
      title: drawerSection === "page" ? "About Overview" : drawerSection === "confidence" ? "Confidence Score" : drawerSection === "scenarios" ? "Scenario Comparison" : drawerSection === "phases" ? "Hours by Phase" : drawerSection === "risks" ? "Risk Summary" : drawerSection === "attention" ? "What Needs Attention" : drawerSection === "assumptions" ? "Assumption Status" : "",
      children: ($$renderer3) => {
        if (drawerSection === "page") {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<div class="space-y-4 text-sm"><p>The <strong>Overview</strong> is your migration command center — a single view of project health, progress, and key metrics.</p> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">The Hero Number</h3> <p class="text-text-secondary">The total estimate in hours dominates the top of the page. It updates in real time as you switch scenarios and toggle AI tools. The savings delta shows the difference from the manual baseline.</p></div> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">Scenarios</h3> <p class="text-text-secondary">Switch between Manual (no AI), AI-Assisted (selected tools), and Best Case (all tools, optimistic) to see how different approaches affect the total.</p></div> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">Health Signals</h3> <p class="text-text-secondary">The footer bar shows discovery progress, confidence score, open risks, and unvalidated assumptions. Each links to its detail page. Color indicates status: green = healthy, orange = attention needed, red = critical.</p></div> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">Sections</h3> <ul class="list-disc list-inside space-y-1 text-text-secondary"><li><strong>Hours by Phase</strong> — Effort distribution across migration phases</li> <li><strong>Confidence</strong> — Visual breakdown of confirmed, assumed, and unknown answers</li> <li><strong>Risk Summary</strong> — Top risks by severity with quick access to details</li> <li><strong>What Needs Attention</strong> — Risk clusters, top unknowns, and improvement steps</li></ul></div></div>`);
        } else if (drawerSection === "confidence") {
          $$renderer3.push("<!--[1-->");
          $$renderer3.push(`<div class="space-y-4 text-sm"><p>The <strong>confidence score</strong> measures how much of the estimate is based on confirmed facts versus assumptions.</p> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">Score Ranges</h3> <div class="space-y-1 font-mono text-xs"><p><span class="inline-block w-3 h-3 bg-danger border border-danger mr-1.5"></span> <strong>0–40%</strong> — High uncertainty. Many assumptions unvalidated.</p> <p><span class="inline-block w-3 h-3 bg-warning border border-warning mr-1.5"></span> <strong>40–70%</strong> — Moderate. Key assumptions need validation.</p> <p><span class="inline-block w-3 h-3 bg-success border border-success mr-1.5"></span> <strong>70–100%</strong> — High confidence. Most inputs confirmed.</p></div></div> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">How to Improve</h3> <ul class="list-disc list-inside space-y-1 text-text-secondary"><li>Validate open assumptions with the client</li> <li>Complete remaining discovery dimensions</li> <li>Resolve unknown answers in analysis gaps</li></ul></div> <p class="text-xs text-text-muted">See the <a${attr("href", `${stringify(base())}/analysis?tab=gaps`)} class="text-primary font-bold">Analysis Gaps</a> tab for specifics.</p></div>`);
        } else if (drawerSection === "scenarios") {
          $$renderer3.push("<!--[2-->");
          $$renderer3.push(`<div class="space-y-4 text-sm"><p><strong>Scenario comparison</strong> shows three projections for migration effort.</p> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">Scenarios</h3> <div class="space-y-2 text-text-secondary"><p><strong class="text-text">Manual</strong> — Full effort with no AI tooling. Baseline hours.</p> <p><strong class="text-text">AI-Assisted</strong> — Hours reduced by enabled AI tools. Default view.</p> <p><strong class="text-text">Best Case</strong> — All AI tools enabled at optimistic savings estimates.</p></div></div> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">How Savings Work</h3> <p class="text-text-secondary">Each AI tool specifies expected hours saved per component. Savings are summed across enabled tools, capped at 50% per component to keep estimates realistic.</p></div> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">Customization</h3> <p class="text-text-secondary">Toggle individual AI tools in the AI Tools section. The hero number and scenario totals update in real time.</p></div></div>`);
        } else if (drawerSection === "phases") {
          $$renderer3.push("<!--[3-->");
          $$renderer3.push(`<div class="space-y-4 text-sm"><p><strong>Hours by Phase</strong> breaks down the total estimate into migration phases.</p> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">What Phases Represent</h3> <p class="text-text-secondary">Each phase groups related migration tasks (e.g., Content Migration, Infrastructure, Testing). Hours reflect the selected scenario.</p></div> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">Calculation</h3> <p class="text-text-secondary">Base hours × complexity multipliers + gotcha patterns. AI tool savings are subtracted in AI-Assisted and Best Case scenarios.</p></div> <p class="text-xs text-text-muted">Use <a${attr("href", `${stringify(base())}/refine`)} class="text-primary font-bold">Refine</a> to exclude phases or components from the estimate.</p></div>`);
        } else if (drawerSection === "risks") {
          $$renderer3.push("<!--[4-->");
          $$renderer3.push(`<div class="space-y-4 text-sm"><p><strong>Risks</strong> are factors that could increase migration effort beyond the current estimate.</p> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">Severity</h3> <div class="space-y-1 font-mono text-xs"><p><span class="inline-block w-3 h-3 bg-danger border border-danger mr-1.5"></span> <strong>Critical / High</strong> — Likely to cause delays or rework.</p> <p><span class="inline-block w-3 h-3 bg-warning border border-warning mr-1.5"></span> <strong>Medium</strong> — May add hours. Should have mitigation.</p> <p><span class="inline-block w-3 h-3 bg-success border border-success mr-1.5"></span> <strong>Low</strong> — Minor impact. Monitor.</p></div></div> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">Hours Impact</h3> <p class="text-text-secondary">Each risk shows estimated additional hours (<code class="text-xs font-mono brutal-border-thin bg-surface px-1 py-0.5">+Nh</code>) if the risk materializes.</p></div> <p class="text-xs text-text-muted">Manage all risks on the <a${attr("href", `${stringify(base())}/analysis?tab=risks`)} class="text-primary font-bold">Analysis</a> page.</p></div>`);
        } else if (drawerSection === "attention") {
          $$renderer3.push("<!--[5-->");
          $$renderer3.push(`<div class="space-y-4 text-sm"><p><strong>What Needs Attention</strong> surfaces the highest-impact actions to improve your estimate's confidence and reduce uncertainty.</p> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">Risk Clusters</h3> <p class="text-text-secondary">Groups of related risks and assumptions that compound. Each cluster shows the combined widening hours — the uncertainty penalty added to the estimate. Resolving a cluster shrinks the pessimistic range.</p></div> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">Top Unknowns</h3> <p class="text-text-secondary">The unvalidated assumptions with the highest hours at stake. Each shows a validation method — the specific action to confirm or deny the assumption. Validating these has the biggest impact on narrowing the estimate range.</p></div> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">Improvement Path</h3> <p class="text-text-secondary">Numbered steps to maximize confidence: complete missing discovery dimensions, validate assumptions, and resolve unknowns. Work through them in order for the fastest confidence improvement.</p></div> <p class="text-xs text-text-muted">Manage AI tool selections on the <a${attr("href", `${stringify(base())}/estimate?tab=ai-tools`)} class="text-primary font-bold">Estimate</a> page.</p></div>`);
        } else if (drawerSection === "assumptions") {
          $$renderer3.push("<!--[6-->");
          $$renderer3.push(`<div class="space-y-4 text-sm"><p><strong>Assumptions</strong> are unconfirmed inputs used to build the estimate. Their status directly affects confidence.</p> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">Statuses</h3> <div class="space-y-2 text-text-secondary"><p><strong class="text-success">Validated</strong> — Confirmed by client or evidence. Adds certainty.</p> <p><strong class="text-warning">Unvalidated</strong> — Pending confirmation. Widens estimate range, lowers confidence.</p> <p><strong class="text-danger">Invalidated</strong> — Proven incorrect. Affected areas need rework.</p></div></div> <p class="text-xs text-text-muted">Manage on the <a${attr("href", `${stringify(base())}/analysis?tab=assumptions`)} class="text-primary font-bold">Analysis</a> page.</p></div>`);
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]-->`);
      }
    });
    $$renderer2.push(`<!---->`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-D98jEKLD.js.map
