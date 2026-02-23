import { aa as head, ab as escape_html, a6 as attr_class, a7 as stringify, ae as attr_style, ac as ensure_array_like, ad as attr, a1 as derived } from './index4-DG1itRH8.js';
import { p as page } from './index3-fupcZyp6.js';
import './root-DQzxKDPP.js';
import './state.svelte-DeAIIc79.js';
import { C as Card } from './Card-w7RlWvYA.js';
import { B as Badge } from './Badge-CWejdkwM.js';
import { T as Tooltip } from './Tooltip-hZ63yG7F.js';
import { I as InfoDrawer } from './InfoDrawer-WPURexns.js';
import { T as TIER_COLORS, f as formatQuestionId, g as getDimensionsByTier } from './migration-stats-BAGrJ4E5.js';
import './client-Cm3t_ao5.js';
import './index-mV5xf0Xo.js';
import './index-server-CVwIEJCx.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    const summary = derived(() => data.summary);
    const statusBadge = derived(() => summary().hasDiscovery ? { variant: "success", label: "Complete" } : summary().discovery.discoveryPercent > 0 ? {
      variant: "default",
      label: `${Math.round(summary().discovery.discoveryPercent)}%`
    } : { variant: "muted", label: "Not Started" });
    let discoveryData = {};
    let expandedDimensions = {};
    function dimAnswerStats(dim) {
      const answers = discoveryData[dim]?.answers ?? {};
      let total = 0, confirmed = 0, assumed = 0, unknown = 0;
      for (const a of Object.values(answers)) {
        total++;
        if (a.confidence === "confirmed") confirmed++;
        else if (a.confidence === "assumed") assumed++;
        else unknown++;
      }
      return { total, confirmed, assumed, unknown };
    }
    const globalStats = derived(() => (() => {
      let total = 0, confirmed = 0, assumed = 0, unknown = 0;
      for (const dim of Object.values(discoveryData)) {
        const answers = dim?.answers ?? {};
        for (const a of Object.values(answers)) {
          total++;
          if (a.confidence === "confirmed") confirmed++;
          else if (a.confidence === "assumed") assumed++;
          else unknown++;
        }
      }
      return { total, confirmed, assumed, unknown };
    })());
    const dimensionTiers = derived(getDimensionsByTier);
    const readinessVerdict = derived(() => (() => {
      const pct = summary().discovery.discoveryPercent;
      if (pct === 100 && globalStats().unknown === 0 && globalStats().assumed === 0) return "Discovery is complete with full confidence. All data points are confirmed.";
      if (pct === 100 && globalStats().unknown === 0) return `Discovery is complete. ${globalStats().assumed} data point${globalStats().assumed !== 1 ? "s" : ""} still based on assumptions — validate to tighten estimates.`;
      if (pct === 100) return `All dimensions covered but ${globalStats().unknown} unknown and ${globalStats().assumed} assumed data point${globalStats().assumed !== 1 ? "s" : ""} reduce confidence.`;
      if (pct >= 75) return `${summary().discovery.completedDimensions} of ${summary().discovery.totalDimensions} dimensions complete. Focus on remaining critical gaps to improve estimate accuracy.`;
      if (pct > 0) return `Early-stage discovery — ${summary().discovery.totalDimensions - summary().discovery.completedDimensions} dimensions still need investigation. Estimates will have wide ranges.`;
      return "Discovery has not started. Run /migrate discover to begin collecting infrastructure data.";
    })());
    const priorityItems = derived(() => getDimensionsByTier().flatMap((g) => g.dimensions).filter((d) => {
      const dd = discoveryData[d.key];
      if (!dd) return true;
      const s = dimAnswerStats(d.key);
      return s.unknown > 0 || s.assumed > 0;
    }).slice(0, 5));
    const riskHours = derived(() => (() => {
      let min = 0, max = 0;
      for (const tierGroup of dimensionTiers()) {
        if (tierGroup.tier !== "critical" && tierGroup.tier !== "high") continue;
        for (const dim of tierGroup.dimensions) {
          const dd = discoveryData[dim.key];
          if (!dd || dd.status !== "complete") {
            min += dim.meta.hoursSwing[0];
            max += dim.meta.hoursSwing[1];
          } else {
            const s = dimAnswerStats(dim.key);
            if (s.unknown > 0 || s.assumed > 0) {
              const gapRatio = (s.unknown + s.assumed) / Math.max(1, s.total);
              min += Math.round(dim.meta.hoursSwing[0] * gapRatio);
              max += Math.round(dim.meta.hoursSwing[1] * gapRatio);
            }
          }
        }
      }
      return { min, max };
    })());
    const allDimensionKeys = derived(() => dimensionTiers().flatMap((g) => g.dimensions.map((d) => d.key)));
    const expandedCount = derived(() => allDimensionKeys().filter((k) => expandedDimensions[k]).length);
    let editingAnswer = null;
    let editValue = "";
    let editConfidence = "confirmed";
    let saving = false;
    function formatValue(value) {
      if (value === null || value === void 0) return "—";
      if (typeof value === "boolean") return value ? "Yes" : "No";
      if (typeof value === "object") return JSON.stringify(value);
      return String(value);
    }
    function badgeVariant(confidence) {
      switch (confidence) {
        case "confirmed":
          return "success";
        case "assumed":
          return "warning";
        case "unknown":
          return "danger";
        default:
          return "default";
      }
    }
    function tierBorderColor(tier) {
      const map = {
        critical: "var(--color-danger)",
        high: "var(--color-warning)",
        medium: "var(--color-primary)",
        lower: "var(--color-border-light)"
      };
      return map[tier];
    }
    function dimStatusLabel(dim) {
      const dimData = discoveryData[dim];
      if (!dimData) return { label: "Not Started", variant: "muted" };
      const stats = dimAnswerStats(dim);
      if (dimData.status === "complete" && stats.unknown === 0 && stats.assumed === 0) return { label: "Verified", variant: "success" };
      if (dimData.status === "complete") return { label: "Complete", variant: "success" };
      if (stats.total > 0) return { label: "Partial", variant: "warning" };
      return { label: "Not Started", variant: "muted" };
    }
    const completionPctGlobal = derived(() => summary().discovery.discoveryPercent);
    const completionPctColor = derived(() => completionPctGlobal() === 100 ? "text-success" : completionPctGlobal() >= 75 ? "text-primary" : completionPctGlobal() >= 50 ? "text-warning" : "text-danger");
    const completionPctBg = derived(() => completionPctGlobal() === 100 ? "bg-success" : completionPctGlobal() >= 75 ? "bg-primary" : completionPctGlobal() >= 50 ? "bg-warning" : "bg-danger");
    let drawerSection = null;
    head("zidl3n", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html(data.assessment.project_name)} — Discovery</title>`);
      });
    });
    $$renderer2.push(`<div class="p-6 space-y-6 animate-enter"><div><div class="flex items-center gap-2"><h1 class="text-xl font-extrabold uppercase tracking-wider">Discovery</h1> `);
    Badge($$renderer2, {
      variant: statusBadge().variant,
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->${escape_html(statusBadge().label)}`);
      }
    });
    $$renderer2.push(`<!----> <button class="flex items-center justify-center w-5 h-5 text-text-muted hover:text-primary transition-colors" aria-label="About this page"><span class="text-[10px] font-mono opacity-60">(i)</span></button></div> <p class="text-sm font-bold text-text-secondary mt-0.5">Infrastructure &amp; environment discovery across ${escape_html(summary().discovery.totalDimensions)} dimensions</p></div> `);
    if (Object.keys(discoveryData).length === 0) {
      $$renderer2.push("<!--[-->");
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="py-8 text-center"><p class="text-lg font-extrabold uppercase tracking-wider text-text-secondary">No Discovery Data</p> <p class="mt-2 text-sm text-text-muted max-w-md mx-auto">Run <code class="brutal-border-thin bg-surface px-1.5 py-0.5 text-xs font-mono">/migrate discover</code> to begin collecting infrastructure data.</p></div>`);
        }
      });
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="brutal-border bg-surface shadow-md overflow-hidden"><div class="flex items-start gap-6 px-5 py-4"><div class="shrink-0"><div class="text-[10px] font-extrabold uppercase tracking-widest text-text-muted mb-1">Completion</div> <div${attr_class(`text-4xl font-extrabold font-mono ${stringify(completionPctColor())}`)}>${escape_html(completionPctGlobal())}%</div> <div class="w-24 h-2 bg-border-light mt-2 overflow-hidden"><div${attr_class(`h-full ${stringify(completionPctBg())} transition-all duration-500`)}${attr_style(`width: ${stringify(completionPctGlobal())}%`)}></div></div> <div class="text-[10px] font-mono text-text-muted mt-1">${escape_html(summary().discovery.completedDimensions)}/${escape_html(summary().discovery.totalDimensions)} dimensions</div></div> <div class="flex-1 min-w-0"><p class="text-sm text-text-secondary">${escape_html(readinessVerdict())}</p> <div class="grid grid-cols-2 sm:grid-cols-4 mt-3 border-2 border-brutal bg-surface"><div class="px-3 py-2.5 text-left border-r border-b sm:border-b-0 border-border-light"><span class="block text-xl font-extrabold font-mono">${escape_html(globalStats().total)}</span> <span class="text-[10px] font-extrabold uppercase tracking-widest text-text-muted">Data Points</span></div> <div class="px-3 py-2.5 text-left border-b sm:border-b-0 sm:border-r border-border-light"><span class="block text-xl font-extrabold font-mono text-success">${escape_html(globalStats().confirmed)}</span> <span class="text-[10px] font-extrabold uppercase tracking-widest text-text-muted">Confirmed</span></div> <div class="px-3 py-2.5 text-left border-r border-border-light"><span class="block text-xl font-extrabold font-mono text-warning">${escape_html(globalStats().assumed)}</span> <span class="text-[10px] font-extrabold uppercase tracking-widest text-text-muted">Assumed</span></div> <div class="px-3 py-2.5 text-left"><span${attr_class(`block text-xl font-extrabold font-mono ${stringify(globalStats().unknown > 0 ? "text-danger" : "text-text-muted")}`)}>${escape_html(globalStats().unknown)}</span> <span class="text-[10px] font-extrabold uppercase tracking-widest text-text-muted">Unknown</span></div></div></div></div> `);
      if (riskHours().max > 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="border-t-2 border-brutal px-5 py-3 bg-bg flex items-center justify-between gap-4 flex-wrap"><div><span class="text-xs font-extrabold uppercase tracking-wider text-danger">Estimate Uncertainty</span> <p class="text-xs text-text-muted mt-0.5">Gaps in critical/high-impact dimensions create a <span class="font-mono font-bold text-danger">${escape_html(riskHours().min)}–${escape_html(riskHours().max)}h</span> hours swing in the estimate</p></div> <div class="text-right shrink-0"><span class="text-lg font-extrabold font-mono text-danger">+${escape_html(riskHours().max)}h</span> <span class="block text-[10px] text-text-muted">worst case</span></div></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (priorityItems().length > 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="border-t-2 border-brutal px-5 py-4 bg-bg"><h3 class="text-xs font-extrabold uppercase tracking-wider mb-3">Priority Actions</h3> <div class="space-y-2"><!--[-->`);
        const each_array = ensure_array_like(priorityItems());
        for (let i = 0, $$length = each_array.length; i < $$length; i++) {
          let item = each_array[i];
          const itemDimData = discoveryData[item.key];
          const itemDimStats = itemDimData ? dimAnswerStats(item.key) : null;
          $$renderer2.push(`<button class="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left hover:bg-surface-hover transition-colors cursor-pointer select-none brutal-border-thin bg-surface"${attr_style(`border-left: 4px solid ${stringify(tierBorderColor(item.meta.tier))}`)}><span class="text-xs font-mono font-bold text-text-muted w-4 shrink-0">${escape_html(i + 1)}.</span> <span class="flex-1 min-w-0"><span class="font-bold">${escape_html(item.label)}</span> <span class="text-xs text-text-muted ml-2">`);
          if (!itemDimData) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`No data collected`);
          } else if (itemDimStats) {
            $$renderer2.push("<!--[1-->");
            $$renderer2.push(`${escape_html(itemDimStats.unknown > 0 ? `${itemDimStats.unknown} unknown` : "")}${escape_html(itemDimStats.unknown > 0 && itemDimStats.assumed > 0 ? ", " : "")}${escape_html(itemDimStats.assumed > 0 ? `${itemDimStats.assumed} assumed` : "")}`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--></span></span> <span class="text-xs font-mono font-bold text-text-muted shrink-0">${escape_html(item.meta.hoursSwing[0])}–${escape_html(item.meta.hoursSwing[1])}h swing</span> <span class="text-xs text-text-muted shrink-0" aria-hidden="true">▶</span></button>`);
        }
        $$renderer2.push(`<!--]--></div></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div> <div class="flex items-center justify-between"><h2 class="text-sm font-extrabold uppercase tracking-wider text-text-secondary">All Dimensions <span class="text-text-muted font-mono text-xs ml-1">(${escape_html(allDimensionKeys().length)})</span></h2> <button class="text-xs font-bold text-primary hover:text-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary">${escape_html(expandedCount() > 0 ? "Collapse All" : "Expand All")}</button></div> <!--[-->`);
      const each_array_1 = ensure_array_like(dimensionTiers());
      for (let $$index_5 = 0, $$length = each_array_1.length; $$index_5 < $$length; $$index_5++) {
        let tierGroup = each_array_1[$$index_5];
        const tierColors = TIER_COLORS[tierGroup.tier];
        $$renderer2.push(`<div><div class="flex items-center gap-2 mb-3"><span${attr_class(`w-2.5 h-2.5 ${stringify(tierColors.dot)} shrink-0`)}></span> <h2${attr_class(`text-xs font-extrabold uppercase tracking-wider ${stringify(tierColors.text)}`)}>${escape_html(tierGroup.label)}</h2> <span class="flex-1 h-px bg-border-light"></span> <span class="text-[10px] font-mono text-text-muted">${escape_html(tierGroup.dimensions.length)} dimension${escape_html(tierGroup.dimensions.length !== 1 ? "s" : "")}</span></div> <div class="space-y-2"><!--[-->`);
        const each_array_2 = ensure_array_like(tierGroup.dimensions);
        for (let $$index_4 = 0, $$length2 = each_array_2.length; $$index_4 < $$length2; $$index_4++) {
          let dim = each_array_2[$$index_4];
          const dimData = discoveryData[dim.key];
          const dimStats = dimData ? dimAnswerStats(dim.key) : { total: 0, confirmed: 0, assumed: 0, unknown: 0 };
          const status = dimStatusLabel(dim.key);
          const isExpanded = expandedDimensions[dim.key] ?? false;
          const answers = dimData?.answers ?? {};
          const answerEntries = Object.entries(answers);
          const completionPct = dimStats.total > 0 ? Math.round(dimStats.confirmed / dimStats.total * 100) : 0;
          $$renderer2.push(`<div${attr("id", `dim-${stringify(dim.key)}`)} class="brutal-border bg-surface shadow-sm overflow-hidden transition-shadow duration-150"${attr_style(`border-left: 5px solid ${stringify(tierBorderColor(tierGroup.tier))}`)}><button type="button" class="w-full flex items-center gap-4 px-4 py-3 text-left transition-colors duration-150 hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary select-none cursor-pointer"${attr("aria-expanded", isExpanded)}${attr("aria-controls", `detail-${stringify(dim.key)}`)}><span${attr_class(`inline-block text-xs transition-transform duration-200 text-text-muted shrink-0 ${stringify(isExpanded ? "rotate-90" : "rotate-0")}`)} aria-hidden="true">▶</span> <div class="flex-1 min-w-0"><div class="flex items-center gap-2"><span class="text-sm font-extrabold">${escape_html(dim.label)}</span> `);
          Badge($$renderer2, {
            variant: status.variant,
            children: ($$renderer3) => {
              $$renderer3.push(`<!---->${escape_html(status.label)}`);
            }
          });
          $$renderer2.push(`<!----></div> <p class="text-xs text-text-muted mt-0.5 truncate">${escape_html(dim.meta.whyItMatters)}</p></div> `);
          if (dimStats.total > 0) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<div class="hidden sm:flex items-center gap-3 shrink-0">`);
            Tooltip($$renderer2, {
              text: `${stringify(dimStats.confirmed)} confirmed, ${stringify(dimStats.assumed)} assumed, ${stringify(dimStats.unknown)} unknown`,
              position: "left",
              children: ($$renderer3) => {
                $$renderer3.push(`<div class="flex items-center gap-1 cursor-help">`);
                if (dimStats.confirmed > 0) {
                  $$renderer3.push("<!--[-->");
                  $$renderer3.push(`<span class="text-xs font-mono font-bold text-success">${escape_html(dimStats.confirmed)}</span>`);
                } else {
                  $$renderer3.push("<!--[!-->");
                }
                $$renderer3.push(`<!--]--> `);
                if (dimStats.assumed > 0) {
                  $$renderer3.push("<!--[-->");
                  $$renderer3.push(`<span class="text-xs font-mono font-bold text-warning">${escape_html(dimStats.assumed)}</span>`);
                } else {
                  $$renderer3.push("<!--[!-->");
                }
                $$renderer3.push(`<!--]--> `);
                if (dimStats.unknown > 0) {
                  $$renderer3.push("<!--[-->");
                  $$renderer3.push(`<span class="text-xs font-mono font-bold text-danger">${escape_html(dimStats.unknown)}</span>`);
                } else {
                  $$renderer3.push("<!--[!-->");
                }
                $$renderer3.push(`<!--]--> <span class="text-[10px] text-text-muted">/ ${escape_html(dimStats.total)}</span></div>`);
              }
            });
            $$renderer2.push(`<!----></div>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--> <div class="w-16 shrink-0 hidden sm:block">`);
          if (dimStats.total > 0) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<div class="h-1.5 bg-border-light overflow-hidden"><div${attr_class(`h-full transition-all duration-300 ${stringify(completionPct === 100 ? "bg-success" : completionPct > 0 ? "bg-primary" : "bg-border-light")}`)}${attr_style(`width: ${stringify(completionPct)}%`)}></div></div>`);
          } else {
            $$renderer2.push("<!--[!-->");
            $$renderer2.push(`<div class="h-1.5 bg-border-light"></div>`);
          }
          $$renderer2.push(`<!--]--></div> `);
          Tooltip($$renderer2, {
            text: "Typical hours swing if this dimension has incomplete data",
            position: "left",
            children: ($$renderer3) => {
              $$renderer3.push(`<span class="text-xs font-mono text-text-muted shrink-0 cursor-help">${escape_html(dim.meta.hoursSwing[0])}–${escape_html(dim.meta.hoursSwing[1])}h</span>`);
            }
          });
          $$renderer2.push(`<!----></button> `);
          if (isExpanded) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<div${attr("id", `detail-${stringify(dim.key)}`)} class="border-t-2 border-brutal">`);
            if (!dimData || answerEntries.length === 0) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<div class="px-5 py-6 text-center bg-bg"><p class="text-sm font-bold text-text-secondary">No data collected for ${escape_html(dim.label)}</p> <p class="mt-1 text-xs text-text-muted">Run <code class="brutal-border-thin bg-surface px-1.5 py-0.5 text-xs font-mono">/migrate discover</code> targeting this dimension.</p></div>`);
            } else {
              $$renderer2.push("<!--[!-->");
              const needsAttention = answerEntries.filter(([, a]) => a.confidence !== "confirmed");
              const confirmed = answerEntries.filter(([, a]) => a.confidence === "confirmed");
              $$renderer2.push(`<div class="px-5 py-3 bg-bg flex items-center gap-4 flex-wrap border-b border-border-light"><div class="flex items-center gap-2"><span class="text-xs font-extrabold uppercase tracking-widest text-text-muted">Answers</span> <span class="font-mono font-bold text-sm">${escape_html(dimStats.total)}</span></div> <span class="w-px h-4 bg-border-light" aria-hidden="true"></span> <div class="flex items-center gap-4"><div class="flex items-center gap-1"><span class="w-2 h-2 bg-success"></span> <span class="text-xs font-mono font-bold text-success">${escape_html(dimStats.confirmed)}</span> <span class="text-[10px] text-text-muted">confirmed</span></div> <div class="flex items-center gap-1"><span class="w-2 h-2 bg-warning"></span> <span class="text-xs font-mono font-bold text-warning">${escape_html(dimStats.assumed)}</span> <span class="text-[10px] text-text-muted">assumed</span></div> <div class="flex items-center gap-1"><span class="w-2 h-2 bg-danger"></span> <span${attr_class(`text-xs font-mono font-bold ${stringify(dimStats.unknown > 0 ? "text-danger" : "text-text-muted")}`)}>${escape_html(dimStats.unknown)}</span> <span class="text-[10px] text-text-muted">unknown</span></div></div> `);
              if (dimData?.last_updated) {
                $$renderer2.push("<!--[-->");
                $$renderer2.push(`<span class="ml-auto text-[10px] text-text-muted font-mono">Updated ${escape_html(new Date(dimData.last_updated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }))}</span>`);
              } else {
                $$renderer2.push("<!--[!-->");
              }
              $$renderer2.push(`<!--]--></div>  `);
              if (needsAttention.length > 0) {
                $$renderer2.push("<!--[-->");
                $$renderer2.push(`<div class="px-5 pt-4 pb-2"><h4 class="text-xs font-extrabold uppercase tracking-wider text-warning mb-2">Needs Attention (${escape_html(needsAttention.length)})</h4> <div class="space-y-1"><!--[-->`);
                const each_array_3 = ensure_array_like(needsAttention);
                for (let $$index_1 = 0, $$length3 = each_array_3.length; $$index_1 < $$length3; $$index_1++) {
                  let [qId, answer] = each_array_3[$$index_1];
                  const isEditing = editingAnswer?.dimension === dim.key && editingAnswer?.questionId === qId;
                  $$renderer2.push(`<div role="button" tabindex="0" class="flex items-start gap-3 px-3 py-2.5 border-2 border-border-light bg-surface hover:bg-surface-hover cursor-pointer transition-colors"${attr_style(`border-left: 4px solid ${stringify(answer.confidence === "unknown" ? "var(--color-danger)" : "var(--color-warning)")}`)}><div class="flex-1 min-w-0"><span class="text-xs font-bold text-text-secondary">${escape_html(formatQuestionId(qId))}</span> `);
                  if (isEditing) {
                    $$renderer2.push("<!--[-->");
                    $$renderer2.push(`<div role="presentation" class="flex items-center gap-2 mt-1.5"><input${attr("value", editValue)} class="text-sm font-mono font-bold bg-warning-light border-2 border-warning px-2 py-1 flex-1 focus:outline-2 focus:outline-primary"/> `);
                    $$renderer2.select(
                      {
                        value: editConfidence,
                        class: "text-xs border-2 border-brutal px-1 py-1 bg-surface"
                      },
                      ($$renderer3) => {
                        $$renderer3.option({ value: "confirmed" }, ($$renderer4) => {
                          $$renderer4.push(`Confirmed`);
                        });
                        $$renderer3.option({ value: "assumed" }, ($$renderer4) => {
                          $$renderer4.push(`Assumed`);
                        });
                        $$renderer3.option({ value: "unknown" }, ($$renderer4) => {
                          $$renderer4.push(`Unknown`);
                        });
                      }
                    );
                    $$renderer2.push(` <button class="px-2 py-1 text-xs font-bold bg-success text-white border border-success disabled:opacity-50"${attr("disabled", saving, true)}>${escape_html("Save")}</button> <button class="px-2 py-1 text-xs font-bold bg-surface border border-brutal text-text-muted">Cancel</button></div>`);
                  } else {
                    $$renderer2.push("<!--[!-->");
                    $$renderer2.push(`<div class="flex items-center gap-2 mt-1"><span class="font-mono font-bold text-sm">${escape_html(formatValue(answer.value))}</span> `);
                    if (answer.basis) {
                      $$renderer2.push("<!--[-->");
                      $$renderer2.push(`<span class="text-[10px] text-text-muted italic">(${escape_html(answer.basis)})</span>`);
                    } else {
                      $$renderer2.push("<!--[!-->");
                    }
                    $$renderer2.push(`<!--]--></div>`);
                  }
                  $$renderer2.push(`<!--]--></div> <div class="flex items-center gap-2 shrink-0">`);
                  Tooltip($$renderer2, {
                    text: answer.confidence === "assumed" ? "Based on assumption — needs validation" : "No data available",
                    position: "left",
                    children: ($$renderer3) => {
                      Badge($$renderer3, {
                        variant: badgeVariant(answer.confidence),
                        children: ($$renderer4) => {
                          $$renderer4.push(`<!---->${escape_html(answer.confidence ?? "unknown")}`);
                        }
                      });
                    }
                  });
                  $$renderer2.push(`<!----></div></div>`);
                }
                $$renderer2.push(`<!--]--></div></div>`);
              } else {
                $$renderer2.push("<!--[!-->");
              }
              $$renderer2.push(`<!--]--> `);
              if (confirmed.length > 0) {
                $$renderer2.push("<!--[-->");
                $$renderer2.push(`<div class="px-5 pt-3 pb-4">`);
                if (needsAttention.length > 0) {
                  $$renderer2.push("<!--[-->");
                  const showConfirmed = expandedDimensions[`${dim.key}-confirmed`] ?? false;
                  $$renderer2.push(`<button class="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-success mb-2 cursor-pointer hover:opacity-80 transition-opacity w-full text-left"><span${attr_class(`inline-block transition-transform duration-200 ${stringify(showConfirmed ? "rotate-90" : "")}`)} aria-hidden="true">▶</span> Confirmed (${escape_html(confirmed.length)})</button> `);
                  if (showConfirmed) {
                    $$renderer2.push("<!--[-->");
                    $$renderer2.push(`<div class="space-y-1"><!--[-->`);
                    const each_array_4 = ensure_array_like(confirmed);
                    for (let $$index_2 = 0, $$length3 = each_array_4.length; $$index_2 < $$length3; $$index_2++) {
                      let [qId, answer] = each_array_4[$$index_2];
                      const isEditing = editingAnswer?.dimension === dim.key && editingAnswer?.questionId === qId;
                      $$renderer2.push(`<div role="button" tabindex="0" class="group flex items-start gap-3 px-3 py-2 border-b border-border-light last:border-0 hover:bg-surface-hover cursor-pointer transition-colors"><div class="flex-1 min-w-0"><span class="text-xs text-text-muted">${escape_html(formatQuestionId(qId))}</span> `);
                      if (isEditing) {
                        $$renderer2.push("<!--[-->");
                        $$renderer2.push(`<div role="presentation" class="flex items-center gap-2 mt-1"><input${attr("value", editValue)} class="text-sm font-mono font-bold bg-warning-light border-2 border-warning px-2 py-1 flex-1 focus:outline-2 focus:outline-primary"/> `);
                        $$renderer2.select(
                          {
                            value: editConfidence,
                            class: "text-xs border-2 border-brutal px-1 py-1 bg-surface"
                          },
                          ($$renderer3) => {
                            $$renderer3.option({ value: "confirmed" }, ($$renderer4) => {
                              $$renderer4.push(`Confirmed`);
                            });
                            $$renderer3.option({ value: "assumed" }, ($$renderer4) => {
                              $$renderer4.push(`Assumed`);
                            });
                            $$renderer3.option({ value: "unknown" }, ($$renderer4) => {
                              $$renderer4.push(`Unknown`);
                            });
                          }
                        );
                        $$renderer2.push(` <button class="px-2 py-1 text-xs font-bold bg-success text-white border border-success disabled:opacity-50"${attr("disabled", saving, true)}>${escape_html("Save")}</button> <button class="px-2 py-1 text-xs font-bold bg-surface border border-brutal text-text-muted">Cancel</button></div>`);
                      } else {
                        $$renderer2.push("<!--[!-->");
                        $$renderer2.push(`<span class="block font-mono font-bold text-sm mt-0.5">${escape_html(formatValue(answer.value))}</span>`);
                      }
                      $$renderer2.push(`<!--]--></div> <div class="flex items-center gap-2 shrink-0">`);
                      Badge($$renderer2, {
                        variant: "success",
                        children: ($$renderer3) => {
                          $$renderer3.push(`<!---->confirmed`);
                        }
                      });
                      $$renderer2.push(`<!----> `);
                      if (!isEditing) {
                        $$renderer2.push("<!--[-->");
                        $$renderer2.push(`<span class="text-xs text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">Edit</span>`);
                      } else {
                        $$renderer2.push("<!--[!-->");
                      }
                      $$renderer2.push(`<!--]--></div></div>`);
                    }
                    $$renderer2.push(`<!--]--></div>`);
                  } else {
                    $$renderer2.push("<!--[!-->");
                  }
                  $$renderer2.push(`<!--]-->`);
                } else {
                  $$renderer2.push("<!--[!-->");
                  $$renderer2.push(`<h4 class="text-xs font-extrabold uppercase tracking-wider text-success mb-2">All Confirmed (${escape_html(confirmed.length)})</h4> <div class="space-y-1"><!--[-->`);
                  const each_array_5 = ensure_array_like(confirmed);
                  for (let $$index_3 = 0, $$length3 = each_array_5.length; $$index_3 < $$length3; $$index_3++) {
                    let [qId, answer] = each_array_5[$$index_3];
                    const isEditing = editingAnswer?.dimension === dim.key && editingAnswer?.questionId === qId;
                    $$renderer2.push(`<div role="button" tabindex="0"${attr_class(`group flex items-start gap-3 px-3 py-2 border-b border-border-light last:border-0 transition-colors ${stringify(isEditing ? "" : "hover:bg-surface-hover cursor-pointer")}`)}><div class="flex-1 min-w-0"><span class="text-xs text-text-muted">${escape_html(formatQuestionId(qId))}</span> `);
                    if (isEditing) {
                      $$renderer2.push("<!--[-->");
                      $$renderer2.push(`<div role="presentation" class="flex items-center gap-2 mt-1"><input${attr("value", editValue)} class="text-sm font-mono font-bold bg-warning-light border-2 border-warning px-2 py-1 flex-1 focus:outline-2 focus:outline-primary"/> `);
                      $$renderer2.select(
                        {
                          value: editConfidence,
                          class: "text-xs border-2 border-brutal px-1 py-1 bg-surface"
                        },
                        ($$renderer3) => {
                          $$renderer3.option({ value: "confirmed" }, ($$renderer4) => {
                            $$renderer4.push(`Confirmed`);
                          });
                          $$renderer3.option({ value: "assumed" }, ($$renderer4) => {
                            $$renderer4.push(`Assumed`);
                          });
                          $$renderer3.option({ value: "unknown" }, ($$renderer4) => {
                            $$renderer4.push(`Unknown`);
                          });
                        }
                      );
                      $$renderer2.push(` <button class="px-2 py-1 text-xs font-bold bg-success text-white border border-success disabled:opacity-50"${attr("disabled", saving, true)}>${escape_html("Save")}</button> <button class="px-2 py-1 text-xs font-bold bg-surface border border-brutal text-text-muted">Cancel</button></div>`);
                    } else {
                      $$renderer2.push("<!--[!-->");
                      $$renderer2.push(`<span class="block font-mono font-bold text-sm mt-0.5">${escape_html(formatValue(answer.value))}</span>`);
                    }
                    $$renderer2.push(`<!--]--></div> <div class="flex items-center gap-2 shrink-0">`);
                    Badge($$renderer2, {
                      variant: "success",
                      children: ($$renderer3) => {
                        $$renderer3.push(`<!---->confirmed`);
                      }
                    });
                    $$renderer2.push(`<!----> `);
                    if (!isEditing) {
                      $$renderer2.push("<!--[-->");
                      $$renderer2.push(`<span class="text-xs text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">Edit</span>`);
                    } else {
                      $$renderer2.push("<!--[!-->");
                    }
                    $$renderer2.push(`<!--]--></div></div>`);
                  }
                  $$renderer2.push(`<!--]--></div>`);
                }
                $$renderer2.push(`<!--]--></div>`);
              } else {
                $$renderer2.push("<!--[!-->");
              }
              $$renderer2.push(`<!--]-->`);
            }
            $$renderer2.push(`<!--]--></div>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--></div>`);
        }
        $$renderer2.push(`<!--]--></div></div>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div> `);
    InfoDrawer($$renderer2, {
      open: drawerSection !== null,
      onclose: () => drawerSection = null,
      title: "About Discovery",
      children: ($$renderer3) => {
        if (drawerSection === "page") {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<div class="space-y-4 text-sm"><p><strong>Discovery</strong> collects infrastructure and environment data across ${escape_html(summary().discovery.totalDimensions)} dimensions. This data feeds directly into analysis, risk identification, and hour estimates.</p> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">Impact Tiers</h3> <div class="space-y-1.5 text-text-secondary"><p><span class="inline-block w-3 h-3 bg-danger border border-danger mr-1.5 align-middle"></span> <strong>Critical</strong> — Must-have before estimation. Gaps here make estimates unreliable.</p> <p><span class="inline-block w-3 h-3 bg-warning border border-warning mr-1.5 align-middle"></span> <strong>High</strong> — Should-have. Assumptions carry significant widening hours.</p> <p><span class="inline-block w-3 h-3 bg-primary border border-primary mr-1.5 align-middle"></span> <strong>Medium</strong> — Important but can be estimated from topology defaults.</p> <p><span class="inline-block w-3 h-3 bg-text-muted border border-text-muted mr-1.5 align-middle"></span> <strong>Lower</strong> — Reasonable defaults usually produce acceptable estimates.</p></div></div> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">Confidence Levels</h3> <div class="space-y-1 text-text-secondary"><p><strong class="text-success">Confirmed</strong> — Verified by client or evidence. Highest confidence.</p> <p><strong class="text-warning">Assumed</strong> — Based on educated guesses. Adds widening to estimates until validated.</p> <p><strong class="text-danger">Unknown</strong> — No data available. Creates the most uncertainty.</p></div></div> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">Hours Swing</h3> <p class="text-text-secondary">Each dimension shows a typical hours swing range. This is how much the estimate could shift if data for that dimension is incomplete or wrong. Higher-impact dimensions have wider swings.</p></div> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">Progressive Disclosure</h3> <p class="text-text-secondary">Dimensions are grouped by impact tier. Click any dimension to expand its detail. Within each dimension, attention items (unknown/assumed) are shown first, with confirmed data collapsible below.</p></div> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">Related Pages</h3> <ul class="list-disc list-inside space-y-1 text-text-secondary"><li><a${attr("href", `/assessments/${stringify(page.params.id)}/analysis?tab=gaps`)} class="text-primary font-bold">Analysis Gaps</a> — See which missing data has the most impact</li> <li><a${attr("href", `/assessments/${stringify(page.params.id)}/estimate`)} class="text-primary font-bold">Estimate</a> — See how discovery data affects hours</li></ul></div></div>`);
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
//# sourceMappingURL=_page.svelte-WxUJDkSn.js.map
