import { ab as escape_html, a6 as attr_class, a7 as stringify, ad as attr, ae as attr_style, ac as ensure_array_like, a1 as derived } from './index4-DG1itRH8.js';
import { p as page } from './index3-fupcZyp6.js';
import './client-Cm3t_ao5.js';
import './state.svelte-DeAIIc79.js';
import './root-DQzxKDPP.js';
import './index-mV5xf0Xo.js';

function Sidebar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { assessmentId, summary } = $$props;
    const base = derived(() => `/assessments/${assessmentId}`);
    const links = [
      {
        href: "",
        label: "Overview",
        step: "①",
        key: "always",
        reviewStep: null
      },
      {
        href: "/discovery",
        label: "Discovery",
        step: "②",
        key: "hasDiscovery",
        reviewStep: "discovery"
      },
      {
        href: "/analysis",
        label: "Analysis",
        step: "③",
        key: "hasAnalysis",
        reviewStep: "analysis"
      },
      {
        href: "/estimate",
        label: "Estimate",
        step: "④",
        key: "hasEstimate",
        reviewStep: "estimate"
      },
      {
        href: "/refine",
        label: "Refine",
        step: "⑤",
        key: "hasRefine",
        reviewStep: "refine"
      }
    ];
    function isActive(href) {
      const fullPath = base() + href;
      if (href === "") return page.url.pathname === base() || page.url.pathname === base() + "/";
      return page.url.pathname.startsWith(fullPath);
    }
    function isReviewActive(href) {
      return page.url.pathname === base() + href + "/review";
    }
    function isComplete(key) {
      if (key === "always") return true;
      return summary?.[key] ?? false;
    }
    function getReview(step) {
      if (!step || !summary?.challengeReviews) return null;
      return summary.challengeReviews[step] ?? null;
    }
    function reviewColor(status, score) {
      if (status === "passed" || score >= 80) return "text-success";
      if (status === "conditional_pass" || score >= 65) return "text-warning";
      return "text-danger";
    }
    function reviewIcon(status) {
      if (status === "passed") return "✓";
      if (status === "conditional_pass") return "⚠";
      return "✗";
    }
    function diamondColor(review) {
      if (!review) return "bg-border-light";
      if (review.latestStatus === "passed" || review.confidenceScore >= 80) return "bg-success";
      if (review.latestStatus === "conditional_pass" || review.confidenceScore >= 65) return "bg-warning";
      return "bg-danger";
    }
    $$renderer2.push(`<aside class="w-56 shrink-0 border-r-3 border-brutal bg-surface min-h-full"><nav class="flex flex-col gap-1 p-2 pt-3"><!--[-->`);
    const each_array = ensure_array_like(links);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let link = each_array[$$index];
      $$renderer2.push(`<a${attr("href", `${stringify(base())}${stringify(link.href)}`)}${attr_class(`flex items-center gap-2.5 px-3 py-2 text-sm font-bold no-underline transition-all duration-150 ${stringify(isActive(link.href) && !isReviewActive(link.href) ? "brutal-border-thin bg-primary text-white shadow-sm -translate-x-px -translate-y-px" : "text-text-secondary hover:bg-surface-hover hover:text-text")}`)}><span class="w-6 text-center text-base leading-none">${escape_html(link.step)}</span> <span class="flex-1">${escape_html(link.label)}</span> `);
      if (isComplete(link.key) && (!isActive(link.href) || isReviewActive(link.href))) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<span class="text-success text-xs">✓</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></a> `);
      if (link.reviewStep && isComplete(link.key)) {
        $$renderer2.push("<!--[-->");
        const review = getReview(link.reviewStep);
        $$renderer2.push(`<a${attr("href", `${stringify(base())}${stringify(link.href)}/review`)}${attr_class(`flex items-center gap-2 pl-10 pr-3 py-1.5 text-xs font-bold no-underline transition-all duration-150 ${stringify(isReviewActive(link.href) ? "brutal-border-thin bg-primary text-white shadow-sm -translate-x-px -translate-y-px" : "text-text-muted hover:bg-surface-hover hover:text-text")}`)}><span${attr_class(`w-1.5 h-1.5 rotate-45 ${stringify(diamondColor(review))} shrink-0`)}></span> <span class="flex-1">Agent Review</span> `);
        if (review) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<span${attr_class(`${stringify(reviewColor(review.latestStatus, review.confidenceScore))} font-mono text-[10px]`)}>${escape_html(Math.round(review.confidenceScore))}% ${escape_html(reviewIcon(review.latestStatus))}</span>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></a>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></nav></aside>`);
  });
}
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data, children } = $$props;
    const assessment = derived(() => data.assessment);
    const summary = derived(() => data.summary);
    const activeIdx = derived(() => (() => {
      if (assessment().status === "complete") return 4;
      if (summary()?.hasEstimate) return 3;
      if (summary()?.hasAnalysis) return 2;
      if (summary()?.hasDiscovery) return 1;
      return 0;
    })());
    const phase = derived(() => (() => {
      const map = [
        {
          label: "Discovery",
          badge: "bg-surface text-text-muted border-border-light",
          dot: "bg-text-muted"
        },
        {
          label: "Analysis",
          badge: "bg-primary-light text-primary border-primary",
          dot: "bg-primary"
        },
        {
          label: "Estimate",
          badge: "bg-primary-light text-primary border-primary",
          dot: "bg-primary"
        },
        {
          label: "Refine",
          badge: "bg-warning-light text-warning border-warning",
          dot: "bg-warning"
        },
        {
          label: "Refine",
          badge: "bg-warning-light text-warning border-warning",
          dot: "bg-warning"
        },
        {
          label: "Complete",
          badge: "bg-success-light text-success border-success",
          dot: "bg-success"
        }
      ];
      return map[activeIdx()];
    })());
    const stepLabels = ["Discovery", "Analysis", "Estimate", "Refine"];
    const discoveryPct = derived(() => summary()?.discovery?.discoveryPercent ?? 0);
    const discoveryDone = derived(() => summary()?.discovery?.completedDimensions ?? 0);
    const discoveryTotal = derived(() => summary()?.discovery?.totalDimensions ?? 0);
    const risksOpen = derived(() => summary()?.risks?.open ?? 0);
    const risksCrit = derived(() => summary()?.risks?.critical ?? 0);
    const assumeUnval = derived(() => summary()?.assumptions?.unvalidated ?? 0);
    const assumeTotal = derived(() => summary()?.assumptions?.total ?? 0);
    const confidence = derived(() => summary()?.confidence ?? 0);
    const hours = derived(() => summary()?.estimateHours ?? 0);
    const confColor = derived(() => confidence() >= 70 ? "text-success" : confidence() >= 40 ? "text-warning" : "text-danger");
    const confBg = derived(() => confidence() >= 70 ? "bg-success" : confidence() >= 40 ? "bg-warning" : "bg-danger");
    $$renderer2.push(`<div class="flex flex-col h-full"><div class="shrink-0 bg-surface select-none z-40"><div class="flex items-stretch"><div class="flex items-center gap-3 px-6 py-3 min-w-0"><div class="min-w-0"><h1 class="text-[15px] font-extrabold text-text truncate leading-tight">${escape_html(assessment().project_name)}</h1> <div class="flex items-center gap-2 mt-1"><span${attr_class(`inline-flex items-center gap-1.5 px-2 py-px text-[10px] font-extrabold uppercase tracking-widest border-2 ${stringify(phase().badge)}`)}><span${attr_class(`w-1.5 h-1.5 rounded-full ${stringify(phase().dot)} ${stringify(assessment().status !== "complete" ? "animate-pulse" : "")}`)}></span> ${escape_html(phase().label)}</span> `);
    if (assessment().client_name) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<span class="text-[11px] text-text-muted truncate">${escape_html(assessment().client_name)}</span>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div></div> <div class="flex-1"></div> <div class="flex items-stretch">`);
    if (discoveryPct() > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<a${attr("href", `/assessments/${stringify(assessment().id)}/discovery`)} class="flex flex-col items-center justify-center px-5 border-l-2 border-border-light no-underline hover:bg-surface-hover transition-colors group"><span class="text-[10px] font-bold uppercase tracking-widest text-text-muted leading-none">Discovery</span> <span class="text-[15px] font-extrabold font-mono tabular-nums leading-tight mt-1 text-text group-hover:text-primary transition-colors">${escape_html(discoveryPct())}<span class="text-[10px] text-text-muted">%</span></span> <span class="text-[9px] font-mono text-text-faint mt-0.5">${escape_html(discoveryDone())}/${escape_html(discoveryTotal())}</span></a>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (risksOpen() > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<a${attr("href", `/assessments/${stringify(assessment().id)}/analysis?tab=risks`)} class="flex flex-col items-center justify-center px-5 border-l-2 border-border-light no-underline hover:bg-surface-hover transition-colors group"><span class="text-[10px] font-bold uppercase tracking-widest text-text-muted leading-none">Risks</span> <span${attr_class(`text-[15px] font-extrabold font-mono tabular-nums leading-tight mt-1 ${stringify(risksCrit() > 0 ? "text-danger" : "text-text")} group-hover:opacity-80 transition-opacity`)}>${escape_html(risksOpen())}</span> `);
      if (risksCrit() > 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<span class="text-[9px] font-mono font-bold text-danger mt-0.5">${escape_html(risksCrit())} critical</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<span class="text-[9px] font-mono text-text-faint mt-0.5">open</span>`);
      }
      $$renderer2.push(`<!--]--></a>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (assumeTotal() > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<a${attr("href", `/assessments/${stringify(assessment().id)}/analysis?tab=assumptions`)} class="flex flex-col items-center justify-center px-5 border-l-2 border-border-light no-underline hover:bg-surface-hover transition-colors group"><span class="text-[10px] font-bold uppercase tracking-widest text-text-muted leading-none">Unvalidated</span> <span${attr_class(`text-[15px] font-extrabold font-mono tabular-nums leading-tight mt-1 ${stringify(assumeUnval() > 0 ? "text-warning" : "text-success")} group-hover:opacity-80 transition-opacity`)}>${escape_html(assumeUnval())}</span> <span class="text-[9px] font-mono text-text-faint mt-0.5">of ${escape_html(assumeTotal())}</span></a>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (hours() > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<a${attr("href", `/assessments/${stringify(assessment().id)}/estimate`)} class="flex flex-col items-center justify-center px-5 border-l-2 border-border-light no-underline hover:bg-surface-hover transition-colors group"><span class="text-[10px] font-bold uppercase tracking-widest text-text-muted leading-none">Hours</span> <span class="text-[15px] font-extrabold font-mono tabular-nums leading-tight mt-1 text-text group-hover:text-primary transition-colors">${escape_html(Math.round(hours()).toLocaleString())}</span> <span class="text-[9px] font-mono text-text-faint mt-0.5">estimate</span></a>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (confidence() > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<a${attr("href", `/assessments/${stringify(assessment().id)}/analysis?tab=gaps`)} class="flex flex-col items-center justify-center px-5 border-l-2 border-border-light no-underline hover:bg-surface-hover transition-colors group"><span class="text-[10px] font-bold uppercase tracking-widest text-text-muted leading-none">Confidence</span> <span${attr_class(`text-[15px] font-extrabold font-mono tabular-nums leading-tight mt-1 ${stringify(confColor())} group-hover:opacity-80 transition-opacity`)}>${escape_html(confidence())}<span class="text-[10px]">%</span></span> <div class="w-10 h-[3px] bg-border-light mt-1 overflow-hidden"><div${attr_class(`h-full ${stringify(confBg())} transition-all duration-500`)}${attr_style(`width: ${stringify(confidence())}%`)}></div></div></a>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div> <div class="flex gap-px h-[3px]" role="progressbar"${attr("aria-valuenow", activeIdx())}${attr("aria-valuemin", 0)}${attr("aria-valuemax", 5)} aria-label="Workflow progress"><!--[-->`);
    const each_array = ensure_array_like(stepLabels);
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let label = each_array[i];
      const done = i < activeIdx();
      const active = i === activeIdx() && assessment().status !== "complete";
      $$renderer2.push(`<div${attr_class(`flex-1 transition-colors duration-500 ${stringify(done ? "bg-primary" : active ? "bg-primary/40" : "bg-border-light")}`)}${attr("title", `${stringify(label)}: ${stringify(done ? "Complete" : active ? "In progress" : "Pending")}`)}></div>`);
    }
    $$renderer2.push(`<!--]--></div></div> <div class="flex flex-1 min-h-0">`);
    Sidebar($$renderer2, {
      assessmentId: assessment().id,
      projectName: assessment().project_name,
      summary: data.summary
    });
    $$renderer2.push(`<!----> <div class="flex-1 overflow-auto">`);
    children($$renderer2);
    $$renderer2.push(`<!----></div></div></div>`);
  });
}

export { _layout as default };
//# sourceMappingURL=_layout.svelte-0wssQZnv.js.map
