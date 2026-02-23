import { aa as head, a6 as attr_class, a7 as stringify, ab as escape_html, ae as attr_style, ac as ensure_array_like, ad as attr, a1 as derived } from './index4-DG1itRH8.js';
import { p as page } from './index3-fupcZyp6.js';
import { C as Card } from './Card-w7RlWvYA.js';
import { B as Badge } from './Badge-CWejdkwM.js';
import { T as Tabs } from './Tabs-CIZXvs-S.js';
import { C as CollapsibleSection } from './CollapsibleSection-DwE4ccwC.js';
import { n as normalizeDiscovery, s as severityVariant, D as DIMENSION_LABELS, K as KNOWN_DIMENSIONS, f as formatQuestionId } from './migration-stats-BAGrJ4E5.js';
import { C as ConfidenceImprovementPath } from './ConfidenceImprovementPath-Bby9a7kW.js';
import { I as InfoDrawer } from './InfoDrawer-WPURexns.js';
import './client-Cm3t_ao5.js';
import './state.svelte-DeAIIc79.js';
import './root-DQzxKDPP.js';
import './index-mV5xf0Xo.js';

function GapsDimensionList($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { discovery } = $$props;
    function computeGaps(disc) {
      const result = {};
      for (const [dim, dimData] of Object.entries(disc)) {
        const answers = dimData?.answers ?? {};
        const assumed = [];
        const unknown = [];
        for (const [qId, answer] of Object.entries(answers)) {
          if (answer.confidence === "assumed") assumed.push({ questionId: qId, ...answer });
          else if (answer.confidence === "unknown") unknown.push({ questionId: qId, ...answer });
        }
        if (assumed.length > 0 || unknown.length > 0) {
          result[dim] = { assumed, unknown, total: assumed.length + unknown.length };
        }
      }
      return result;
    }
    const dimGaps = derived(() => computeGaps(discovery));
    if (Object.keys(dimGaps()).length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="space-y-3"><!--[-->`);
      const each_array = ensure_array_like(Object.entries(dimGaps()).sort((a, b) => b[1].total - a[1].total));
      for (let $$index_2 = 0, $$length = each_array.length; $$index_2 < $$length; $$index_2++) {
        let [dim, gapData] = each_array[$$index_2];
        CollapsibleSection($$renderer2, {
          title: DIMENSION_LABELS[dim] ?? dim,
          subtitle: `${stringify(gapData.total)} gaps`,
          badge: `${stringify(gapData.unknown.length)} unknown, ${stringify(gapData.assumed.length)} assumed`,
          badgeVariant: gapData.unknown.length > 0 ? "danger" : "warning",
          children: ($$renderer3) => {
            if (gapData.unknown.length > 0) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<h4 class="text-xs font-extrabold uppercase tracking-wider text-danger mb-2">Unknown (${escape_html(gapData.unknown.length)})</h4> <div class="space-y-1 mb-4"><!--[-->`);
              const each_array_1 = ensure_array_like(gapData.unknown);
              for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
                let item = each_array_1[$$index];
                $$renderer3.push(`<div class="flex items-center justify-between px-3 py-2 border border-danger bg-danger-light"><span class="text-sm">${escape_html(formatQuestionId(item.questionId))}</span> <span class="text-xs font-mono text-text-muted">${escape_html(item.value !== null && item.value !== void 0 ? `Value: ${item.value}` : "No value")}</span></div>`);
              }
              $$renderer3.push(`<!--]--></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--> `);
            if (gapData.assumed.length > 0) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<h4 class="text-xs font-extrabold uppercase tracking-wider text-warning mb-2">Assumed (${escape_html(gapData.assumed.length)})</h4> <div class="space-y-1"><!--[-->`);
              const each_array_2 = ensure_array_like(gapData.assumed);
              for (let $$index_1 = 0, $$length2 = each_array_2.length; $$index_1 < $$length2; $$index_1++) {
                let item = each_array_2[$$index_1];
                $$renderer3.push(`<div class="flex items-center justify-between px-3 py-2 border border-warning bg-warning-light"><div><span class="text-sm">${escape_html(formatQuestionId(item.questionId))}</span> `);
                if (item.basis) {
                  $$renderer3.push("<!--[-->");
                  $$renderer3.push(`<span class="block text-[10px] text-text-muted italic">Basis: ${escape_html(item.basis)}</span>`);
                } else {
                  $$renderer3.push("<!--[!-->");
                }
                $$renderer3.push(`<!--]--></div> <span class="text-xs font-mono font-bold">${escape_html(item.value)}</span></div>`);
              }
              $$renderer3.push(`<!--]--></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]-->`);
          }
        });
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<p class="text-sm text-text-muted text-center py-4">No dimension gaps found</p>`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    const analysis = derived(() => data.analysis);
    const risks = derived(() => analysis()?.risks ?? []);
    const multipliers = derived(() => analysis()?.active_multipliers ?? []);
    const chains = derived(() => analysis()?.dependency_chains ?? []);
    const clusters = derived(() => analysis()?.risk_clusters ?? []);
    const gaps = derived(() => analysis()?.gaps);
    const summary = derived(() => data.summary);
    const statusBadge = derived(() => summary().hasAnalysis ? { variant: "success", label: "Complete" } : summary().hasDiscovery ? { variant: "default", label: "In Progress" } : { variant: "muted", label: "Not Run" });
    const discovery = derived(() => normalizeDiscovery(data.discovery));
    const knownGotchas = derived(() => data.knownGotchas ?? []);
    const knownMultipliers = derived(() => data.knownMultipliers ?? []);
    const depChainsData = derived(() => data.dependencyChains);
    const knownIncompatibilities = derived(() => data.knownIncompatibilities ?? []);
    const estimate = derived(() => data.estimate);
    const phases = derived(() => estimate()?.phases ?? []);
    let assumptionsList = [];
    let activeTab = "risk-register";
    let expandedRows = {};
    let assumptionFilter = "all";
    const filteredAssumptions = derived(
      () => assumptionsList
    );
    let savingAssumption = null;
    let drawerSection = null;
    const openRisks = derived(() => summary().risks.open);
    const criticalRisks = derived(() => summary().risks.critical);
    const validatedCount = derived(() => summary().assumptions.validated);
    const totalWidening = derived(() => summary().assumptions.totalWidening);
    const totalGotchaHours = derived(() => () => {
      let total = 0;
      for (const phase of phases()) {
        for (const comp of phase.components ?? []) {
          total += comp.gotcha_hours ?? 0;
        }
      }
      return total;
    });
    const triggeredGotchaComponentIds = derived(() => () => {
      const ids = /* @__PURE__ */ new Set();
      for (const phase of phases()) {
        for (const comp of phase.components ?? []) {
          if (comp.gotcha_hours > 0) {
            ids.add(comp.id);
          }
        }
      }
      return ids;
    });
    function isGotchaTriggered(gotcha) {
      const triggered = triggeredGotchaComponentIds()();
      if (!gotcha.affected_components?.length) return false;
      return gotcha.affected_components.some((c) => triggered.has(c));
    }
    const activeMultiplierIds = derived(() => new Set(multipliers().map((m) => m.multiplier_id ?? m.id)));
    const hardDeps = derived(() => chains().filter((c) => c.type === "hard"));
    const softDeps = derived(() => chains().filter((c) => c.type !== "hard"));
    const criticalPath = derived(() => depChainsData()?.critical_path_template?.path ?? []);
    const missingDimensions = derived(() => KNOWN_DIMENSIONS.filter((d) => !discovery()[d]));
    const unknownCount = derived(() => () => {
      let count = 0;
      for (const dimData of Object.values(discovery())) {
        const answers = dimData?.answers ?? {};
        for (const a of Object.values(answers)) {
          if (a.confidence === "unknown") count++;
        }
      }
      return count;
    });
    const aiTools = derived(() => data.aiAlternatives ?? []);
    const aiToggles = derived(() => data.aiSelections?.selections ?? {});
    const enabledAiTools = derived(() => aiTools().filter((t) => aiToggles()[t.id] !== false));
    const excludedSet = derived(() => new Set(Object.entries(data.scopeExclusions?.exclusions ?? {}).filter(([, v]) => v).map(([k]) => k)));
    const risksBySeverity = derived(() => ({
      critical: risks().filter((r) => r.severity === "critical").length,
      high: risks().filter((r) => r.severity === "high").length,
      medium: risks().filter((r) => r.severity === "medium").length,
      low: risks().filter((r) => r.severity === "low").length
    }));
    const severityRank = { critical: 0, high: 1, medium: 2, low: 3 };
    const sortedRisks = derived(() => [...risks()].sort((a, b) => (severityRank[a.severity] ?? 4) - (severityRank[b.severity] ?? 4)));
    const validationProgress = derived(() => assumptionsList.length > 0 ? Math.round(validatedCount() / assumptionsList.length * 100) : 100);
    const sortedFilteredAssumptions = derived(() => [...filteredAssumptions()].sort((a, b) => {
      if (a.validation_status === "validated" && b.validation_status !== "validated") return 1;
      if (a.validation_status !== "validated" && b.validation_status === "validated") return -1;
      return (b.pessimistic_widening_hours ?? 0) - (a.pessimistic_widening_hours ?? 0);
    }));
    const triggeredGotchasList = derived(() => knownGotchas().filter((g) => isGotchaTriggered(g)));
    const untriggeredGotchasList = derived(() => knownGotchas().filter((g) => !isGotchaTriggered(g)));
    const tabs = derived(() => [
      {
        id: "risk-register",
        label: "Risk Register",
        count: risks().length + triggeredGotchasList().length
      },
      {
        id: "assumptions",
        label: "Assumptions",
        count: assumptionsList.length
      },
      {
        id: "complexity",
        label: "Complexity",
        count: multipliers().length + chains().length
      },
      { id: "reference", label: "Reference" }
    ]);
    function severityAccent(severity) {
      const map = {
        critical: "var(--color-danger)",
        high: "var(--color-warning)",
        medium: "#d97706",
        low: "var(--color-success)"
      };
      return map[severity] ?? "var(--color-border-light)";
    }
    function validationAccent(status) {
      const map = {
        validated: "var(--color-success)",
        invalidated: "var(--color-danger)",
        unvalidated: "var(--color-warning)"
      };
      return map[status] ?? "var(--color-border-light)";
    }
    const topUnvalidated = derived(() => assumptionsList.filter((a) => a.validation_status !== "validated").sort((a, b) => (b.pessimistic_widening_hours ?? 0) - (a.pessimistic_widening_hours ?? 0)).slice(0, 5));
    const topSavings = derived(() => topUnvalidated().reduce((sum, a) => sum + (a.pessimistic_widening_hours ?? 0), 0));
    const risksById = derived(() => Object.fromEntries(risks().map((r) => [r.id, r])));
    const assumptionsById = derived(() => Object.fromEntries(assumptionsList.map((a) => [a.id, a])));
    const confidenceVerdict = derived(() => () => {
      const conf = summary().confidence;
      const unval = summary().assumptions.unvalidated;
      if (conf >= 80) return "High confidence — estimate range is narrow and reliable.";
      if (conf >= 60) return `Moderate confidence — ${unval} unvalidated assumption${unval !== 1 ? "s" : ""} add +${Math.round(totalWidening())}h to the pessimistic estimate.`;
      return `Low confidence — significant data gaps remain. ${unval} assumption${unval !== 1 ? "s" : ""} need validation and ${unknownCount()()} discovery answers are unknown.`;
    });
    function confidenceColor(conf) {
      if (conf >= 70) return "text-success";
      if (conf >= 40) return "text-warning";
      return "text-danger";
    }
    function confidenceBg(conf) {
      if (conf >= 70) return "bg-success";
      if (conf >= 40) return "bg-warning";
      return "bg-danger";
    }
    function assumptionLabel(a) {
      const val = String(a.assumed_value ?? "");
      if (val.length > 10 && !/^\[/.test(val)) return val;
      const name = (a.id ?? "").replace(/^asmp_/, "").replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
      return val && val !== "undefined" ? `${name}: ${val}` : name;
    }
    head("o3qqa1", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html(data.assessment.project_name)} — Analysis</title>`);
      });
    });
    $$renderer2.push(`<div class="p-6 space-y-6 animate-enter"><div><div class="flex items-center gap-2"><h1 class="text-xl font-extrabold uppercase tracking-wider">Analysis</h1> `);
    Badge($$renderer2, {
      variant: statusBadge().variant,
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->${escape_html(statusBadge().label)}`);
      }
    });
    $$renderer2.push(`<!----> <button class="flex items-center justify-center w-5 h-5 text-text-muted hover:text-primary transition-colors" aria-label="About this page"><span class="text-[10px] font-mono opacity-60">(i)</span></button></div> <p class="text-sm font-bold text-text-secondary mt-0.5">Risk register, assumptions, complexity, and data gaps</p></div> `);
    if (!analysis()) {
      $$renderer2.push("<!--[-->");
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="py-8 text-center"><p class="text-lg font-extrabold uppercase tracking-wider text-text-secondary">No Analysis Data</p> <p class="mt-2 text-sm text-text-muted max-w-md mx-auto">Run <code class="brutal-border-thin bg-surface px-1.5 py-0.5 text-xs font-mono">/migrate analyze</code> to generate.</p></div>`);
        }
      });
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="brutal-border bg-surface shadow-md overflow-hidden"><div class="flex items-start gap-6 px-5 py-4"><div class="shrink-0"><div class="text-[10px] font-extrabold uppercase tracking-widest text-text-muted mb-1">Confidence</div> <div${attr_class(`text-4xl font-extrabold font-mono ${stringify(confidenceColor(summary().confidence))}`)}>${escape_html(summary().confidence)}%</div> <div class="w-24 h-2 bg-border-light mt-2 overflow-hidden"><div${attr_class(`h-full ${stringify(confidenceBg(summary().confidence))} transition-all duration-500`)}${attr_style("", { width: `${stringify(summary().confidence)}%` })}></div></div></div> <div class="flex-1 min-w-0"><p class="text-sm text-text-secondary">${escape_html(confidenceVerdict()())}</p> <div class="grid grid-cols-2 sm:grid-cols-4 mt-3 border-2 border-brutal bg-surface"><button class="group px-3 py-2.5 text-left border-r border-b sm:border-b-0 border-border-light hover:bg-surface-hover transition-colors cursor-pointer"><span class="block text-xl font-extrabold font-mono">${escape_html(openRisks())}`);
      if (criticalRisks() > 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<span class="text-danger text-sm ml-1">(${escape_html(criticalRisks())})</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></span> <span class="text-[10px] font-extrabold uppercase tracking-widest text-text-muted group-hover:text-primary transition-colors">Open Risks</span></button> <button class="group px-3 py-2.5 text-left border-b sm:border-b-0 sm:border-r border-border-light hover:bg-surface-hover transition-colors cursor-pointer"><span class="block text-xl font-extrabold font-mono">${escape_html(summary().assumptions.unvalidated)}<span class="text-text-muted text-sm">/${escape_html(assumptionsList.length)}</span></span> <span class="text-[10px] font-extrabold uppercase tracking-widest text-text-muted group-hover:text-primary transition-colors">Unvalidated</span></button> <button class="group px-3 py-2.5 text-left border-r border-border-light hover:bg-surface-hover transition-colors cursor-pointer"><span class="block text-xl font-extrabold font-mono">${escape_html(multipliers().length)}</span> <span class="text-[10px] font-extrabold uppercase tracking-widest text-text-muted group-hover:text-primary transition-colors">Multipliers</span></button> <div class="px-3 py-2.5 text-left"><span class="block text-xl font-extrabold font-mono text-danger">+${escape_html(Math.round(totalWidening() + totalGotchaHours()()))}h</span> <span class="text-[10px] font-extrabold uppercase tracking-widest text-text-muted">Buffer</span></div></div></div></div> `);
      if (topUnvalidated().length > 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="border-t-2 border-brutal px-5 py-4 bg-bg"><div class="flex items-center justify-between mb-3"><h3 class="text-xs font-extrabold uppercase tracking-wider">Highest-Impact Actions</h3> <span class="text-xs text-text-muted">Validate to save up to <span class="font-mono font-bold text-success">${escape_html(topSavings())}h</span></span></div> <div class="space-y-2"><!--[-->`);
        const each_array = ensure_array_like(topUnvalidated());
        for (let i = 0, $$length = each_array.length; i < $$length; i++) {
          let assumption = each_array[i];
          const isSaving = savingAssumption === assumption.id;
          const expanded = expandedRows[`hia-${assumption.id}`];
          $$renderer2.push(`<div class="brutal-border-thin bg-surface overflow-hidden"${attr_style("", { "border-left": "4px solid var(--color-warning)" })}><button class="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left hover:bg-surface-hover transition-colors cursor-pointer select-none"${attr("aria-expanded", expanded)}><span class="text-xs font-mono font-bold text-text-muted w-4 shrink-0">${escape_html(i + 1)}.</span> <span class="flex-1 min-w-0 text-text-secondary">${escape_html(assumptionLabel(assumption))}</span> <span class="text-xs font-mono font-bold text-danger shrink-0">+${escape_html(assumption.pessimistic_widening_hours ?? 0)}h</span> <span${attr_class(`inline-block text-xs text-text-muted transition-transform duration-200 shrink-0 ${stringify(expanded ? "rotate-90" : "")}`)} aria-hidden="true">▶</span></button> `);
          if (expanded) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<div class="border-t border-border-light px-3 py-3 bg-bg"><div class="grid gap-3 sm:grid-cols-2 text-xs">`);
            if (assumption.basis) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<div><h5 class="font-extrabold uppercase tracking-wider text-text-muted mb-0.5">Basis</h5> <p class="text-text-secondary">${escape_html(assumption.basis)}</p></div>`);
            } else {
              $$renderer2.push("<!--[!-->");
            }
            $$renderer2.push(`<!--]--> `);
            if (assumption.validation_method) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<div><h5 class="font-extrabold uppercase tracking-wider text-text-muted mb-0.5">Validation Method</h5> <p class="text-text-secondary">${escape_html(assumption.validation_method)}</p></div>`);
            } else {
              $$renderer2.push("<!--[!-->");
            }
            $$renderer2.push(`<!--]--> `);
            if (assumption.confidence) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<div><h5 class="font-extrabold uppercase tracking-wider text-text-muted mb-0.5">Confidence</h5> <p class="font-bold">${escape_html(assumption.confidence)}</p></div>`);
            } else {
              $$renderer2.push("<!--[!-->");
            }
            $$renderer2.push(`<!--]--> `);
            if (assumption.dimension) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<div><h5 class="font-extrabold uppercase tracking-wider text-text-muted mb-0.5">Dimension</h5> <span class="px-1.5 py-0.5 text-[10px] font-bold uppercase bg-info-light text-info border border-info">${escape_html(assumption.dimension)}</span></div>`);
            } else {
              $$renderer2.push("<!--[!-->");
            }
            $$renderer2.push(`<!--]--> `);
            if (assumption.affected_components?.length > 0) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<div class="sm:col-span-2"><h5 class="font-extrabold uppercase tracking-wider text-text-muted mb-0.5">Affected Components</h5> <div class="flex flex-wrap gap-1"><!--[-->`);
              const each_array_1 = ensure_array_like(assumption.affected_components);
              for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
                let comp = each_array_1[$$index];
                $$renderer2.push(`<span class="px-1.5 py-0.5 text-[10px] font-mono bg-primary-light text-primary border border-primary">${escape_html(comp)}</span>`);
              }
              $$renderer2.push(`<!--]--></div></div>`);
            } else {
              $$renderer2.push("<!--[!-->");
            }
            $$renderer2.push(`<!--]--></div> <button class="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-extrabold uppercase tracking-wider bg-success text-white border-2 border-brutal hover:-translate-y-px hover:shadow-sm active:translate-y-0 active:shadow-none transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-primary"${attr("disabled", isSaving, true)}>`);
            if (isSaving) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`Validating...`);
            } else {
              $$renderer2.push("<!--[!-->");
              $$renderer2.push(`<span>✓</span> Validate — saves +${escape_html(assumption.pessimistic_widening_hours ?? 0)}h`);
            }
            $$renderer2.push(`<!--]--></button></div>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--></div>`);
        }
        $$renderer2.push(`<!--]--></div></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div> `);
      Tabs($$renderer2, {
        tabs: tabs(),
        active: activeTab,
        onchange: (id) => activeTab = id,
        children: ($$renderer3) => {
          if (activeTab === "risk-register") {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<p class="text-sm text-text-secondary mb-5">Identified risks that could increase migration effort, known gotcha patterns from past migrations, and correlated risk clusters. Click any row to expand.</p> <div class="flex items-center justify-between mb-3"><h3 class="text-xs font-extrabold uppercase tracking-wider pb-1.5 border-b-3 border-danger text-danger">Identified Risks (${escape_html(risks().length)})</h3> `);
            if (risks().length > 0) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="flex items-center gap-3"><!--[-->`);
              const each_array_2 = ensure_array_like([
                {
                  level: "critical",
                  count: risksBySeverity().critical,
                  color: "var(--color-danger)"
                },
                {
                  level: "high",
                  count: risksBySeverity().high,
                  color: "var(--color-warning)"
                },
                {
                  level: "medium",
                  count: risksBySeverity().medium,
                  color: "#d97706"
                },
                {
                  level: "low",
                  count: risksBySeverity().low,
                  color: "var(--color-success)"
                }
              ]);
              for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
                let s = each_array_2[$$index_2];
                if (s.count > 0) {
                  $$renderer3.push("<!--[-->");
                  $$renderer3.push(`<div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5"${attr_style("", { background: s.color })}></span> <span class="text-xs font-mono font-bold"${attr_style("", { color: s.color })}>${escape_html(s.count)}</span> <span class="text-[10px] font-bold uppercase tracking-wider text-text-muted">${escape_html(s.level)}</span></div>`);
                } else {
                  $$renderer3.push("<!--[!-->");
                }
                $$renderer3.push(`<!--]-->`);
              }
              $$renderer3.push(`<!--]--></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--></div> `);
            if (sortedRisks().length > 0) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="brutal-border bg-surface shadow-sm overflow-hidden"><!--[-->`);
              const each_array_3 = ensure_array_like(sortedRisks());
              for (let i = 0, $$length = each_array_3.length; i < $$length; i++) {
                let risk = each_array_3[i];
                const expanded = expandedRows[risk.id];
                $$renderer3.push(`<div${attr_class(i > 0 ? "border-t border-border-light" : "")}${attr_style("", {
                  "border-left": `5px solid ${stringify(severityAccent(risk.severity))}`
                })}><button${attr_class(`w-full px-4 py-3 text-left hover:bg-surface-hover transition-colors cursor-pointer select-none ${stringify(expanded ? "bg-surface-hover" : "")}`)}${attr("aria-expanded", expanded)}><div class="flex items-start gap-3"><span${attr_class(`inline-block text-xs text-text-muted transition-transform duration-200 shrink-0 mt-0.5 ${stringify(expanded ? "rotate-90" : "")}`)} aria-hidden="true">▶</span> <div class="flex-1 min-w-0"><div class="flex items-center gap-2 flex-wrap mb-1">`);
                Badge($$renderer3, {
                  variant: severityVariant(risk.severity),
                  children: ($$renderer4) => {
                    $$renderer4.push(`<!---->${escape_html(risk.severity)}`);
                  }
                });
                $$renderer3.push(`<!----> <span class="text-[10px] font-bold uppercase tracking-wider text-text-muted">${escape_html(risk.category)}</span> `);
                if (risk.likelihood) {
                  $$renderer3.push("<!--[-->");
                  $$renderer3.push(`<span class="text-[10px] text-text-muted">· ${escape_html(risk.likelihood)} likelihood</span>`);
                } else {
                  $$renderer3.push("<!--[!-->");
                }
                $$renderer3.push(`<!--]--></div> <p class="text-sm">${escape_html(risk.description)}</p></div> <div class="flex items-center gap-3 shrink-0"><span class="text-sm font-mono font-bold text-danger">+${escape_html(risk.estimated_hours_impact)}h</span> `);
                Badge($$renderer3, {
                  variant: risk.status === "open" ? "warning" : "success",
                  children: ($$renderer4) => {
                    $$renderer4.push(`<!---->${escape_html(risk.status)}`);
                  }
                });
                $$renderer3.push(`<!----></div></div></button> `);
                if (expanded) {
                  $$renderer3.push("<!--[-->");
                  $$renderer3.push(`<div class="border-t border-border-light px-4 py-4 bg-bg"${attr_style("", { "margin-left": "5px" })}><div class="grid gap-4 sm:grid-cols-2"><div><h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-1">Mitigation Strategy</h4> <p class="text-sm text-text-secondary">${escape_html(risk.mitigation || "No mitigation strategy defined yet.")}</p></div> <div><h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-1">Contingency Plan</h4> <p class="text-sm text-text-secondary">${escape_html(risk.contingency || "No contingency plan defined yet.")}</p></div> `);
                  if (risk.linked_assumptions && risk.linked_assumptions.length > 0) {
                    $$renderer3.push("<!--[-->");
                    $$renderer3.push(`<div class="sm:col-span-2"><h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-1.5">Linked Assumptions</h4> <div class="space-y-1.5"><!--[-->`);
                    const each_array_4 = ensure_array_like(risk.linked_assumptions);
                    for (let $$index_3 = 0, $$length2 = each_array_4.length; $$index_3 < $$length2; $$index_3++) {
                      let aId = each_array_4[$$index_3];
                      const assumption = assumptionsById()[aId];
                      if (assumption) {
                        $$renderer3.push("<!--[-->");
                        $$renderer3.push(`<div class="flex items-center justify-between gap-2 px-2.5 py-1.5 border border-border-light bg-surface text-xs"><div class="flex items-center gap-2 min-w-0">`);
                        Badge($$renderer3, {
                          variant: assumption.validation_status === "validated" ? "success" : "warning",
                          children: ($$renderer4) => {
                            $$renderer4.push(`<!---->${escape_html(assumption.validation_status)}`);
                          }
                        });
                        $$renderer3.push(`<!----> <span class="text-text-secondary">${escape_html(assumption.assumed_value || aId)}</span></div> `);
                        if (assumption.validation_status !== "validated") {
                          $$renderer3.push("<!--[-->");
                          $$renderer3.push(`<span class="font-mono font-bold text-danger shrink-0">+${escape_html(assumption.pessimistic_widening_hours ?? 0)}h</span>`);
                        } else {
                          $$renderer3.push("<!--[!-->");
                        }
                        $$renderer3.push(`<!--]--></div>`);
                      } else {
                        $$renderer3.push("<!--[!-->");
                        $$renderer3.push(`<span class="px-2 py-0.5 text-xs font-mono bg-warning-light text-warning border border-warning">${escape_html(aId)}</span>`);
                      }
                      $$renderer3.push(`<!--]-->`);
                    }
                    $$renderer3.push(`<!--]--></div></div>`);
                  } else {
                    $$renderer3.push("<!--[!-->");
                  }
                  $$renderer3.push(`<!--]--> `);
                  if (risk.owner) {
                    $$renderer3.push("<!--[-->");
                    $$renderer3.push(`<div><h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-1">Owner</h4> <p class="text-sm font-bold">${escape_html(risk.owner)}</p></div>`);
                  } else {
                    $$renderer3.push("<!--[!-->");
                  }
                  $$renderer3.push(`<!--]--></div></div>`);
                } else {
                  $$renderer3.push("<!--[!-->");
                }
                $$renderer3.push(`<!--]--></div>`);
              }
              $$renderer3.push(`<!--]--></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
              $$renderer3.push(`<div class="brutal-border bg-surface px-5 py-8 text-center"><p class="text-sm text-text-muted">No risks have been identified yet.</p> <p class="text-xs text-text-muted mt-1">Run <code class="brutal-border-thin bg-bg px-1.5 py-0.5 text-xs font-mono">/migrate analyze</code> to generate the risk register.</p></div>`);
            }
            $$renderer3.push(`<!--]--> `);
            if (clusters().length > 0) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="mt-8"><div class="flex items-center justify-between mb-1"><h3 class="text-xs font-extrabold uppercase tracking-wider pb-1.5 border-b-3 border-primary text-primary">Risk Clusters (${escape_html(clusters().length)})</h3> <button class="text-[10px] font-mono text-text-muted hover:text-primary transition-colors cursor-pointer">What are clusters?</button></div> <p class="text-xs text-text-muted mb-4">Groups of correlated risks and assumptions that compound each other. If one materializes, the others are more likely to follow.</p> <div class="space-y-3"><!--[-->`);
              const each_array_5 = ensure_array_like(clusters());
              for (let $$index_8 = 0, $$length = each_array_5.length; $$index_8 < $$length; $$index_8++) {
                let cluster = each_array_5[$$index_8];
                const expanded = expandedRows[`cluster-${cluster.name}`];
                const clusterRisks = (cluster.risks ?? []).map((id) => risksById()[id]).filter(Boolean);
                const clusterAssumptions = (cluster.assumptions ?? []).map((id) => assumptionsById()[id]).filter(Boolean);
                const maxSeverity = clusterRisks.reduce(
                  (worst, r) => {
                    const rank = { critical: 0, high: 1, medium: 2, low: 3 };
                    return (rank[r.severity] ?? 4) < (rank[worst] ?? 4) ? r.severity : worst;
                  },
                  "low"
                );
                $$renderer3.push(`<div class="brutal-border bg-surface shadow-sm overflow-hidden"${attr_style("", {
                  "border-left": `5px solid ${stringify(severityAccent(maxSeverity))}`
                })}><button${attr_class(`w-full px-4 py-3.5 text-left hover:bg-surface-hover transition-colors cursor-pointer select-none ${stringify(expanded ? "bg-surface-hover" : "")}`)}${attr("aria-expanded", expanded)}><div class="flex items-start gap-3"><span${attr_class(`inline-block text-xs text-text-muted transition-transform duration-200 shrink-0 mt-0.5 ${stringify(expanded ? "rotate-90" : "")}`)} aria-hidden="true">▶</span> <div class="flex-1 min-w-0"><h4 class="font-bold text-sm">${escape_html(cluster.name)}</h4> <div class="flex items-center gap-3 mt-1 text-xs text-text-muted"><span>${escape_html(clusterRisks.length)} risk${escape_html(clusterRisks.length !== 1 ? "s" : "")}</span> <span class="text-border-light">|</span> <span>${escape_html(clusterAssumptions.length)} assumption${escape_html(clusterAssumptions.length !== 1 ? "s" : "")}</span> <span class="text-border-light">|</span> <span>worst: <span class="font-bold"${attr_style("", { color: severityAccent(maxSeverity) })}>${escape_html(maxSeverity)}</span></span></div></div> <span class="text-sm font-mono font-bold text-danger shrink-0">+${escape_html(cluster.combined_widening_hours ?? 0)}h</span></div></button> `);
                if (!expanded && clusterRisks.length > 0) {
                  $$renderer3.push("<!--[-->");
                  $$renderer3.push(`<div class="border-t border-border-light px-4 py-2 flex flex-wrap gap-1.5"><!--[-->`);
                  const each_array_6 = ensure_array_like(clusterRisks.slice(0, 4));
                  for (let $$index_5 = 0, $$length2 = each_array_6.length; $$index_5 < $$length2; $$index_5++) {
                    let risk = each_array_6[$$index_5];
                    $$renderer3.push(`<span class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold border bg-bg"${attr_style("", {
                      "border-color": severityAccent(risk.severity),
                      color: severityAccent(risk.severity)
                    })}>${escape_html(risk.severity)} · ${escape_html(risk.category)}</span>`);
                  }
                  $$renderer3.push(`<!--]--> `);
                  if (clusterRisks.length > 4) {
                    $$renderer3.push("<!--[-->");
                    $$renderer3.push(`<span class="px-2 py-0.5 text-[10px] text-text-muted">+${escape_html(clusterRisks.length - 4)} more</span>`);
                  } else {
                    $$renderer3.push("<!--[!-->");
                  }
                  $$renderer3.push(`<!--]--></div>`);
                } else {
                  $$renderer3.push("<!--[!-->");
                }
                $$renderer3.push(`<!--]--> `);
                if (expanded) {
                  $$renderer3.push("<!--[-->");
                  $$renderer3.push(`<div class="border-t-2 border-border-light">`);
                  if (clusterRisks.length > 0) {
                    $$renderer3.push("<!--[-->");
                    $$renderer3.push(`<div class="px-4 py-3"><h5 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-2">Correlated Risks</h5> <div class="space-y-2"><!--[-->`);
                    const each_array_7 = ensure_array_like(clusterRisks);
                    for (let $$index_6 = 0, $$length2 = each_array_7.length; $$index_6 < $$length2; $$index_6++) {
                      let risk = each_array_7[$$index_6];
                      $$renderer3.push(`<div class="flex items-start gap-2.5 px-3 py-2 border border-border-light bg-bg text-xs">`);
                      Badge($$renderer3, {
                        variant: severityVariant(risk.severity),
                        children: ($$renderer4) => {
                          $$renderer4.push(`<!---->${escape_html(risk.severity)}`);
                        }
                      });
                      $$renderer3.push(`<!----> <div class="flex-1 min-w-0"><p class="text-text-secondary">${escape_html(risk.description)}</p> `);
                      if (risk.mitigation) {
                        $$renderer3.push("<!--[-->");
                        $$renderer3.push(`<p class="text-text-muted mt-1"><span class="font-bold">Mitigation:</span> ${escape_html(risk.mitigation)}</p>`);
                      } else {
                        $$renderer3.push("<!--[!-->");
                      }
                      $$renderer3.push(`<!--]--></div> <span class="font-mono font-bold text-danger shrink-0">+${escape_html(risk.estimated_hours_impact)}h</span></div>`);
                    }
                    $$renderer3.push(`<!--]--></div></div>`);
                  } else {
                    $$renderer3.push("<!--[!-->");
                  }
                  $$renderer3.push(`<!--]--> `);
                  if (clusterAssumptions.length > 0) {
                    $$renderer3.push("<!--[-->");
                    $$renderer3.push(`<div${attr_class(`px-4 py-3 ${stringify(clusterRisks.length > 0 ? "border-t border-border-light" : "")}`)}><h5 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-2">Linked Assumptions</h5> <div class="space-y-2"><!--[-->`);
                    const each_array_8 = ensure_array_like(clusterAssumptions);
                    for (let $$index_7 = 0, $$length2 = each_array_8.length; $$index_7 < $$length2; $$index_7++) {
                      let assumption = each_array_8[$$index_7];
                      $$renderer3.push(`<div class="flex items-center justify-between gap-2 px-3 py-2 border border-border-light bg-bg text-xs"><div class="flex items-center gap-2 min-w-0">`);
                      Badge($$renderer3, {
                        variant: assumption.validation_status === "validated" ? "success" : assumption.validation_status === "invalidated" ? "danger" : "warning",
                        children: ($$renderer4) => {
                          $$renderer4.push(`<!---->${escape_html(assumption.validation_status)}`);
                        }
                      });
                      $$renderer3.push(`<!----> <span class="text-text-secondary">${escape_html(assumption.assumed_value || assumption.id)}</span></div> `);
                      if (assumption.validation_status !== "validated") {
                        $$renderer3.push("<!--[-->");
                        $$renderer3.push(`<span class="font-mono font-bold text-danger shrink-0">+${escape_html(assumption.pessimistic_widening_hours ?? 0)}h</span>`);
                      } else {
                        $$renderer3.push("<!--[!-->");
                      }
                      $$renderer3.push(`<!--]--></div>`);
                    }
                    $$renderer3.push(`<!--]--></div></div>`);
                  } else {
                    $$renderer3.push("<!--[!-->");
                  }
                  $$renderer3.push(`<!--]--></div>`);
                } else {
                  $$renderer3.push("<!--[!-->");
                }
                $$renderer3.push(`<!--]--></div>`);
              }
              $$renderer3.push(`<!--]--></div></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--> `);
            if (knownGotchas().length > 0) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="mt-8"><div class="flex items-center justify-between mb-1"><h3 class="text-xs font-extrabold uppercase tracking-wider pb-1.5 border-b-3 border-warning text-warning">Gotcha Patterns (${escape_html(knownGotchas().length)})</h3> <button class="text-[10px] font-mono text-text-muted hover:text-primary transition-colors cursor-pointer">What are gotchas?</button></div> <p class="text-xs text-text-muted mb-4">Known pitfalls from past migrations. Triggered patterns are adding buffer hours to your estimate. Untriggered ones show what could surface.</p> `);
              if (triggeredGotchasList().length > 0) {
                $$renderer3.push("<!--[-->");
                const triggeredTotal = triggeredGotchasList().reduce((sum, g) => sum + (g.hours_impact ?? 0), 0);
                $$renderer3.push(`<div class="flex items-center justify-between mb-2"><span class="text-xs font-extrabold uppercase tracking-wider text-danger">Triggered (${escape_html(triggeredGotchasList().length)})</span> <span class="text-xs font-mono font-bold text-danger">+${escape_html(triggeredTotal)}h total buffer</span></div> <div class="brutal-border bg-surface shadow-sm overflow-hidden mb-4"${attr_style("", { "border-left": "5px solid var(--color-danger)" })}><!--[-->`);
                const each_array_9 = ensure_array_like(triggeredGotchasList());
                for (let i = 0, $$length = each_array_9.length; i < $$length; i++) {
                  let gotcha = each_array_9[i];
                  const expanded = expandedRows[`gotcha-${gotcha.id}`];
                  $$renderer3.push(`<div${attr_class(i > 0 ? "border-t border-border-light" : "")}><button${attr_class(`w-full px-4 py-3 text-left hover:bg-surface-hover transition-colors cursor-pointer select-none ${stringify(expanded ? "bg-surface-hover" : "")}`)}${attr("aria-expanded", expanded)}><div class="flex items-start gap-3"><span${attr_class(`inline-block text-xs text-text-muted transition-transform duration-200 shrink-0 mt-0.5 ${stringify(expanded ? "rotate-90" : "")}`)} aria-hidden="true">▶</span> <div class="flex-1 min-w-0"><div class="flex items-center gap-2 mb-0.5">`);
                  Badge($$renderer3, {
                    variant: gotcha.risk === "high" ? "danger" : gotcha.risk === "medium" ? "warning" : "default",
                    children: ($$renderer4) => {
                      $$renderer4.push(`<!---->${escape_html(gotcha.risk)}`);
                    }
                  });
                  $$renderer3.push(`<!----> <span class="text-xs font-mono text-text-muted">${escape_html(gotcha.id)}</span></div> <p class="text-sm text-text-secondary">${escape_html(gotcha.description)}</p></div> <span class="text-sm font-mono font-bold text-danger shrink-0">+${escape_html(gotcha.hours_impact)}h</span></div></button> `);
                  if (expanded) {
                    $$renderer3.push("<!--[-->");
                    $$renderer3.push(`<div class="border-t border-border-light px-4 py-3 bg-bg space-y-3"${attr_style("", { "margin-left": "5px" })}><div><h5 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-0.5">Trigger Condition</h5> <p class="text-xs font-mono text-text-secondary">${escape_html(gotcha.pattern)}</p></div> <div><h5 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-0.5">Mitigation</h5> <p class="text-xs text-text-secondary">${escape_html(gotcha.mitigation)}</p></div> `);
                    if (gotcha.affected_components?.length > 0) {
                      $$renderer3.push("<!--[-->");
                      $$renderer3.push(`<div><h5 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-0.5">Affected Components</h5> <div class="flex flex-wrap gap-1"><!--[-->`);
                      const each_array_10 = ensure_array_like(gotcha.affected_components);
                      for (let $$index_9 = 0, $$length2 = each_array_10.length; $$index_9 < $$length2; $$index_9++) {
                        let comp = each_array_10[$$index_9];
                        $$renderer3.push(`<span class="px-1.5 py-0.5 text-[10px] font-mono bg-warning-light text-warning border border-warning">${escape_html(comp)}</span>`);
                      }
                      $$renderer3.push(`<!--]--></div></div>`);
                    } else {
                      $$renderer3.push("<!--[!-->");
                    }
                    $$renderer3.push(`<!--]--></div>`);
                  } else {
                    $$renderer3.push("<!--[!-->");
                  }
                  $$renderer3.push(`<!--]--></div>`);
                }
                $$renderer3.push(`<!--]--></div>`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--> `);
              if (untriggeredGotchasList().length > 0) {
                $$renderer3.push("<!--[-->");
                CollapsibleSection($$renderer3, {
                  title: "Not Triggered",
                  subtitle: `${stringify(untriggeredGotchasList().length)} patterns — not currently adding hours`,
                  open: false,
                  children: ($$renderer4) => {
                    $$renderer4.push(`<div class="border-2 border-border-light bg-surface overflow-hidden"><!--[-->`);
                    const each_array_11 = ensure_array_like(untriggeredGotchasList());
                    for (let i = 0, $$length = each_array_11.length; i < $$length; i++) {
                      let gotcha = each_array_11[i];
                      const expanded = expandedRows[`gotcha-${gotcha.id}`];
                      $$renderer4.push(`<div${attr_class(`${stringify(i > 0 ? "border-t border-border-light" : "")} opacity-70 hover:opacity-100 transition-opacity`)}><button${attr_class(`w-full px-4 py-2.5 text-left hover:bg-surface-hover transition-colors cursor-pointer select-none ${stringify(expanded ? "bg-surface-hover !opacity-100" : "")}`)}${attr("aria-expanded", expanded)}><div class="flex items-start gap-3"><span${attr_class(`inline-block text-xs text-text-muted transition-transform duration-200 shrink-0 mt-0.5 ${stringify(expanded ? "rotate-90" : "")}`)} aria-hidden="true">▶</span> <div class="flex-1 min-w-0"><div class="flex items-center gap-2 mb-0.5">`);
                      Badge($$renderer4, {
                        variant: gotcha.risk === "high" ? "danger" : gotcha.risk === "medium" ? "warning" : "default",
                        children: ($$renderer5) => {
                          $$renderer5.push(`<!---->${escape_html(gotcha.risk)}`);
                        }
                      });
                      $$renderer4.push(`<!----> <span class="text-xs font-mono text-text-muted">${escape_html(gotcha.id)}</span></div> <p class="text-xs text-text-secondary">${escape_html(gotcha.description)}</p></div> <span class="text-xs font-mono text-text-muted shrink-0">+${escape_html(gotcha.hours_impact)}h</span></div></button> `);
                      if (expanded) {
                        $$renderer4.push("<!--[-->");
                        $$renderer4.push(`<div class="border-t border-border-light px-4 py-2.5 bg-bg space-y-2"${attr_style("", { "margin-left": "5px" })}><div><h5 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-0.5">Trigger Condition</h5> <p class="text-xs font-mono text-text-secondary">${escape_html(gotcha.pattern)}</p></div> <div><h5 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-0.5">Mitigation</h5> <p class="text-xs text-text-secondary">${escape_html(gotcha.mitigation)}</p></div> `);
                        if (gotcha.affected_components?.length > 0) {
                          $$renderer4.push("<!--[-->");
                          $$renderer4.push(`<div><h5 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-0.5">Affected Components</h5> <div class="flex flex-wrap gap-1"><!--[-->`);
                          const each_array_12 = ensure_array_like(gotcha.affected_components);
                          for (let $$index_11 = 0, $$length2 = each_array_12.length; $$index_11 < $$length2; $$index_11++) {
                            let comp = each_array_12[$$index_11];
                            $$renderer4.push(`<span class="px-1.5 py-0.5 text-[10px] font-mono bg-warning-light text-warning border border-warning">${escape_html(comp)}</span>`);
                          }
                          $$renderer4.push(`<!--]--></div></div>`);
                        } else {
                          $$renderer4.push("<!--[!-->");
                        }
                        $$renderer4.push(`<!--]--></div>`);
                      } else {
                        $$renderer4.push("<!--[!-->");
                      }
                      $$renderer4.push(`<!--]--></div>`);
                    }
                    $$renderer4.push(`<!--]--></div>`);
                  }
                });
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--> `);
            if (risks().length === 0 && knownGotchas().length === 0 && clusters().length === 0) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="brutal-border bg-surface px-5 py-10 text-center"><p class="text-lg font-extrabold uppercase tracking-wider text-text-secondary">No Risk Data</p> <p class="mt-2 text-sm text-text-muted max-w-md mx-auto">Run <code class="brutal-border-thin bg-bg px-1.5 py-0.5 text-xs font-mono">/migrate analyze</code> to identify risks, gotcha patterns, and risk clusters.</p></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]-->`);
          } else if (activeTab === "assumptions") {
            $$renderer3.push("<!--[1-->");
            $$renderer3.push(`<p class="text-sm text-text-secondary mb-4">Unconfirmed inputs that widen the estimate. Validate each one to remove its buffer hours and tighten the range.</p> `);
            if (summary().assumptions.unvalidated > 0) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="brutal-border bg-warning-light px-5 py-4 mb-5"${attr_style("", { "border-left": "6px solid var(--color-warning)" })}><div class="flex items-start justify-between gap-4"><div><h3 class="text-sm font-extrabold uppercase tracking-wider"${attr_style("", { color: "var(--color-warning)" })}>${escape_html(summary().assumptions.unvalidated)} assumption${escape_html(summary().assumptions.unvalidated > 1 ? "s" : "")} need validation</h3> <p class="text-xs text-text-secondary mt-1">Unvalidated assumptions add <span class="font-mono font-bold text-danger">+${escape_html(Math.round(totalWidening()))}h</span> to the pessimistic estimate. Validate the highest-impact items first.</p></div> <div class="text-right shrink-0"><span class="text-2xl font-extrabold font-mono">${escape_html(validationProgress())}%</span> <span class="block text-[10px] font-bold uppercase tracking-wider text-text-muted">complete</span></div></div> <div class="mt-3"><div class="w-full h-2 bg-white border border-brutal overflow-hidden"><div class="h-full bg-success transition-all duration-500"${attr_style("", { width: `${stringify(validationProgress())}%` })}></div></div> <div class="flex justify-between mt-1"><span class="text-[10px] font-mono text-text-secondary">${escape_html(validatedCount())}/${escape_html(assumptionsList.length)} validated</span> <span class="text-[10px] font-mono text-danger">+${escape_html(Math.round(totalWidening()))}h at risk</span></div></div></div>`);
            } else if (assumptionsList.length > 0) {
              $$renderer3.push("<!--[1-->");
              $$renderer3.push(`<div class="brutal-border bg-success-light px-5 py-3 mb-5 flex items-center gap-3"${attr_style("", { "border-left": "6px solid var(--color-success)" })}><span class="text-success text-lg">✓</span> <div><h3 class="text-sm font-extrabold uppercase tracking-wider text-success">All assumptions validated</h3> <p class="text-xs text-text-secondary mt-0.5">No additional widening hours in the estimate.</p></div></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--> <div class="flex items-center gap-2 mb-4"><!--[-->`);
            const each_array_13 = ensure_array_like([
              { id: "all", label: "All", count: assumptionsList.length },
              {
                id: "unvalidated",
                label: "Needs Review",
                count: assumptionsList.filter((a) => a.validation_status !== "validated").length
              },
              { id: "validated", label: "Validated", count: validatedCount() }
            ]);
            for (let $$index_13 = 0, $$length = each_array_13.length; $$index_13 < $$length; $$index_13++) {
              let f = each_array_13[$$index_13];
              $$renderer3.push(`<button${attr_class(`px-3 py-1.5 text-xs font-bold uppercase border-2 border-brutal transition-all duration-150 ${stringify(assumptionFilter === f.id ? "bg-primary text-white shadow-sm -translate-x-px -translate-y-px" : "bg-surface text-text-muted hover:bg-surface-hover")} focus-visible:outline-2 focus-visible:outline-primary`)}>${escape_html(f.label)} <span class="ml-1 font-mono">${escape_html(f.count)}</span></button>`);
            }
            $$renderer3.push(`<!--]--> <button class="ml-auto flex items-center gap-1 text-xs text-text-muted hover:text-primary transition-colors"><span class="text-[10px] font-mono opacity-60">(i)</span> Help</button></div> <div class="space-y-3"><!--[-->`);
            const each_array_14 = ensure_array_like(sortedFilteredAssumptions());
            for (let $$index_15 = 0, $$length = each_array_14.length; $$index_15 < $$length; $$index_15++) {
              let assumption = each_array_14[$$index_15];
              const expanded = expandedRows[`a-${assumption.id}`];
              const isValidated = assumption.validation_status === "validated";
              const isInvalidated = assumption.validation_status === "invalidated";
              const isSaving = savingAssumption === assumption.id;
              $$renderer3.push(`<div${attr_class(`brutal-border bg-surface shadow-sm overflow-hidden transition-opacity duration-300 ${stringify(isValidated ? "opacity-60 hover:opacity-100" : "")}`)}${attr_style("", {
                "border-left": `5px solid ${stringify(validationAccent(assumption.validation_status))}`
              })}><div class="px-4 py-3"><div class="flex items-start justify-between gap-3"><div class="flex-1 min-w-0"><div class="flex items-center gap-2 flex-wrap"><span class="text-xs font-mono font-bold text-text-muted">${escape_html(assumption.id)}</span> `);
              if (assumption.dimension) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<span class="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-info-light text-info border border-info">${escape_html(assumption.dimension)}</span>`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--> `);
              Badge($$renderer3, {
                variant: isValidated ? "success" : isInvalidated ? "danger" : "warning",
                children: ($$renderer4) => {
                  $$renderer4.push(`<!---->${escape_html(assumption.validation_status)}`);
                }
              });
              $$renderer3.push(`<!----></div> <p class="text-sm mt-2 font-bold">${escape_html(assumption.assumed_value)}</p> `);
              if (assumption.basis) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<p class="text-xs text-text-muted mt-1">Basis: ${escape_html(assumption.basis)}</p>`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--></div> <div class="text-right shrink-0">`);
              if (!isValidated) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<span class="text-lg font-mono font-extrabold text-danger">+${escape_html(assumption.pessimistic_widening_hours ?? 0)}h</span> <span class="block text-[10px] text-text-muted">widening</span>`);
              } else {
                $$renderer3.push("<!--[!-->");
                $$renderer3.push(`<span class="text-lg font-mono font-extrabold text-success">0h</span> <span class="block text-[10px] text-text-muted">resolved</span>`);
              }
              $$renderer3.push(`<!--]--></div></div> <button class="mt-2 text-xs font-bold text-primary hover:text-primary-hover cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"><span${attr_class(`inline-block transition-transform duration-200 ${stringify(expanded ? "rotate-90" : "")}`)} aria-hidden="true">▶</span> ${escape_html(expanded ? "Hide details" : "Show details")}</button></div> `);
              if (expanded) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<div class="border-t border-border-light px-4 py-3 bg-bg"><div class="grid gap-3 sm:grid-cols-2"><div><h5 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-1">Validation Method</h5> <p class="text-sm text-text-secondary">${escape_html(assumption.validation_method || "Not specified")}</p></div> <div><h5 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-1">Confidence</h5> <p class="text-sm font-bold">${escape_html(assumption.confidence)}</p></div> `);
                if (assumption.affected_components?.length > 0) {
                  $$renderer3.push("<!--[-->");
                  $$renderer3.push(`<div class="sm:col-span-2"><h5 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-1">Affected Components</h5> <div class="flex flex-wrap gap-1"><!--[-->`);
                  const each_array_15 = ensure_array_like(assumption.affected_components);
                  for (let $$index_14 = 0, $$length2 = each_array_15.length; $$index_14 < $$length2; $$index_14++) {
                    let comp = each_array_15[$$index_14];
                    $$renderer3.push(`<span class="px-2 py-0.5 text-xs font-mono bg-primary-light text-primary border border-primary">${escape_html(comp)}</span>`);
                  }
                  $$renderer3.push(`<!--]--></div></div>`);
                } else {
                  $$renderer3.push("<!--[!-->");
                }
                $$renderer3.push(`<!--]--> `);
                if (assumption.actual_value) {
                  $$renderer3.push("<!--[-->");
                  $$renderer3.push(`<div><h5 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-1">Actual Value</h5> <p class="text-sm font-bold text-success">${escape_html(assumption.actual_value)}</p></div>`);
                } else {
                  $$renderer3.push("<!--[!-->");
                }
                $$renderer3.push(`<!--]--></div></div>`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--> `);
              if (!isValidated) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<div class="border-t-2 border-brutal bg-success-light px-4 py-2.5"><button class="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-extrabold uppercase tracking-wider bg-success text-white border-3 border-brutal hover:-translate-y-px hover:shadow-md active:translate-y-0 active:shadow-none transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"${attr("disabled", isSaving, true)}>`);
                if (isSaving) {
                  $$renderer3.push("<!--[-->");
                  $$renderer3.push(`Validating...`);
                } else {
                  $$renderer3.push("<!--[!-->");
                  $$renderer3.push(`<span class="text-base">✓</span> Validate — saves +${escape_html(assumption.pessimistic_widening_hours ?? 0)}h widening`);
                }
                $$renderer3.push(`<!--]--></button></div>`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--></div>`);
            }
            $$renderer3.push(`<!--]--></div> `);
            if (sortedFilteredAssumptions().length === 0) {
              $$renderer3.push("<!--[-->");
              Card($$renderer3, {
                children: ($$renderer4) => {
                  $$renderer4.push(`<div class="py-6 text-center"><p class="text-sm text-text-muted">No assumptions match the current filter.</p></div>`);
                }
              });
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]-->`);
          } else if (activeTab === "complexity") {
            $$renderer3.push("<!--[2-->");
            $$renderer3.push(`<p class="text-sm text-text-secondary mb-4">Active complexity factors and ordering constraints that affect the estimate.</p> <button class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider mb-3 pb-1.5 border-b-3 border-warning text-warning w-full text-left cursor-pointer hover:opacity-80 transition-opacity">Active Multipliers (${escape_html(multipliers().length)}) <span class="text-[10px] font-mono opacity-60">(i)</span></button> `);
            if (multipliers().length > 0) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="brutal-border bg-surface shadow-sm overflow-hidden"><!--[-->`);
              const each_array_16 = ensure_array_like(multipliers());
              for (let i = 0, $$length = each_array_16.length; i < $$length; i++) {
                let mult = each_array_16[i];
                const expanded = expandedRows[`mult-${mult.multiplier_id ?? mult.id}`];
                $$renderer3.push(`<button${attr_class(`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-hover transition-colors cursor-pointer select-none ${stringify(i > 0 ? "border-t border-border-light" : "")} ${stringify(expanded ? "bg-surface-hover" : "")}`)}${attr("aria-expanded", expanded)}><span${attr_class(`inline-block text-xs text-text-muted transition-transform duration-200 shrink-0 ${stringify(expanded ? "rotate-90" : "")}`)} aria-hidden="true">▶</span> <span class="flex-1 min-w-0 font-bold text-sm">${escape_html(mult.name || mult.multiplier_id)}</span> <div class="w-16 h-2 bg-border-light overflow-hidden shrink-0"><div class="h-full bg-warning transition-all duration-300"${attr_style("", {
                  width: `${stringify(Math.min(100, (mult.factor - 1) / 0.5 * 100))}%`
                })}></div></div> <span class="text-base font-extrabold font-mono text-warning shrink-0">×${escape_html(mult.factor)}</span></button> `);
                if (expanded) {
                  $$renderer3.push("<!--[-->");
                  $$renderer3.push(`<div${attr_class(`border-t border-border-light px-4 py-3 bg-bg ${stringify(i < multipliers().length - 1 ? "border-b border-border-light" : "")}`)}><p class="text-xs text-text-secondary mb-2">${escape_html(mult.trigger_condition)}</p> `);
                  if (mult.affected_components?.length > 0) {
                    $$renderer3.push("<!--[-->");
                    $$renderer3.push(`<div><h5 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-1">Affected Components</h5> <div class="flex flex-wrap gap-1"><!--[-->`);
                    const each_array_17 = ensure_array_like(mult.affected_components);
                    for (let $$index_16 = 0, $$length2 = each_array_17.length; $$index_16 < $$length2; $$index_16++) {
                      let comp = each_array_17[$$index_16];
                      $$renderer3.push(`<span class="px-1.5 py-0.5 text-[10px] font-mono bg-warning-light text-warning border border-warning">${escape_html(comp)}</span>`);
                    }
                    $$renderer3.push(`<!--]--></div></div>`);
                  } else {
                    $$renderer3.push("<!--[!-->");
                  }
                  $$renderer3.push(`<!--]--></div>`);
                } else {
                  $$renderer3.push("<!--[!-->");
                }
                $$renderer3.push(`<!--]-->`);
              }
              $$renderer3.push(`<!--]--></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
              Card($$renderer3, {
                children: ($$renderer4) => {
                  $$renderer4.push(`<div class="py-4 text-center text-sm text-text-muted">No active multipliers — no complexity factors are scaling your estimate.</div>`);
                }
              });
            }
            $$renderer3.push(`<!--]--> `);
            if (knownMultipliers().length > 0) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="mt-4">`);
              CollapsibleSection($$renderer3, {
                title: "All Known Multipliers",
                subtitle: `${stringify(knownMultipliers().length)} defined — ${stringify(multipliers().length)} active`,
                open: false,
                children: ($$renderer4) => {
                  $$renderer4.push(`<div class="overflow-x-auto -mx-4"><table class="w-full text-sm"><thead><tr class="bg-[#1a1a1a] text-white text-xs font-extrabold uppercase tracking-wider"><th class="text-left px-4 py-2">ID</th><th class="text-left px-4 py-2">Name</th><th class="text-center px-4 py-2 w-20">Factor</th><th class="text-left px-4 py-2">Trigger</th><th class="text-left px-4 py-2 w-28">Category</th><th class="text-center px-4 py-2 w-20">Status</th></tr></thead><tbody><!--[-->`);
                  const each_array_18 = ensure_array_like(knownMultipliers());
                  for (let $$index_18 = 0, $$length = each_array_18.length; $$index_18 < $$length; $$index_18++) {
                    let km = each_array_18[$$index_18];
                    const isActive = activeMultiplierIds().has(km.id);
                    $$renderer4.push(`<tr${attr_class(`border-b border-border-light ${stringify(isActive ? "bg-warning-light" : "opacity-60")}`)}><td class="px-4 py-2 font-mono font-bold text-xs">${escape_html(km.id)}</td><td class="px-4 py-2 font-bold">${escape_html(km.name)}</td><td class="px-4 py-2 text-center font-mono font-bold">×${escape_html(km.factor)}</td><td class="px-4 py-2 text-xs text-text-secondary">${escape_html(km.trigger)}</td><td class="px-4 py-2 text-xs">${escape_html(km.category)}</td><td class="px-4 py-2 text-center">`);
                    if (isActive) {
                      $$renderer4.push("<!--[-->");
                      Badge($$renderer4, {
                        variant: "warning",
                        children: ($$renderer5) => {
                          $$renderer5.push(`<!---->Active`);
                        }
                      });
                    } else {
                      $$renderer4.push("<!--[!-->");
                      $$renderer4.push(`<span class="text-[10px] text-text-muted uppercase">Inactive</span>`);
                    }
                    $$renderer4.push(`<!--]--></td></tr>`);
                  }
                  $$renderer4.push(`<!--]--></tbody></table></div>`);
                }
              });
              $$renderer3.push(`<!----></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--> <div class="mt-8 pt-6 border-t-3 border-border-light"><button class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider mb-3 pb-1.5 border-b-3 border-danger text-danger w-full text-left cursor-pointer hover:opacity-80 transition-opacity">Dependency Chains (${escape_html(chains().length)}) <span class="text-[10px] font-mono opacity-60">(i)</span></button> <div class="flex items-center gap-4 mb-5"><div class="flex items-center gap-1.5"><span class="w-3 h-3 bg-danger"></span> <span class="text-xs font-bold"><span class="font-mono">${escape_html(hardDeps().length)}</span> hard</span></div> <div class="flex items-center gap-1.5"><span class="w-3 h-3 border-2 border-border-light"></span> <span class="text-xs font-bold"><span class="font-mono">${escape_html(softDeps().length)}</span> soft</span></div></div> `);
            if (criticalPath().length > 0) {
              $$renderer3.push("<!--[-->");
              Card($$renderer3, {
                padding: "p-4",
                children: ($$renderer4) => {
                  $$renderer4.push(`<h4 class="text-xs font-extrabold uppercase tracking-wider mb-3 pb-1.5 border-b-3 border-danger text-danger">Critical Path (${escape_html(criticalPath().length)} steps)</h4> <div class="flex items-center gap-1 flex-wrap"><!--[-->`);
                  const each_array_19 = ensure_array_like(criticalPath());
                  for (let i = 0, $$length = each_array_19.length; i < $$length; i++) {
                    let step = each_array_19[i];
                    $$renderer4.push(`<span class="font-mono font-bold text-xs px-2 py-1 bg-danger-light text-danger border-2 border-danger">${escape_html(step)}</span> `);
                    if (i < criticalPath().length - 1) {
                      $$renderer4.push("<!--[-->");
                      $$renderer4.push(`<span class="text-danger font-bold">→</span>`);
                    } else {
                      $$renderer4.push("<!--[!-->");
                    }
                    $$renderer4.push(`<!--]-->`);
                  }
                  $$renderer4.push(`<!--]--></div> `);
                  if (depChainsData()?.critical_path_template?.description) {
                    $$renderer4.push("<!--[-->");
                    $$renderer4.push(`<p class="mt-2 text-xs text-text-muted">${escape_html(depChainsData().critical_path_template.description)}</p>`);
                  } else {
                    $$renderer4.push("<!--[!-->");
                  }
                  $$renderer4.push(`<!--]--> `);
                  if (depChainsData()?.critical_path_template?.parallel_tracks?.length > 0) {
                    $$renderer4.push("<!--[-->");
                    $$renderer4.push(`<div class="mt-3 pt-3 border-t border-border-light"><h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-2">Parallel Tracks</h4> <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);
                    const each_array_20 = ensure_array_like(depChainsData().critical_path_template.parallel_tracks);
                    for (let $$index_21 = 0, $$length = each_array_20.length; $$index_21 < $$length; $$index_21++) {
                      let track = each_array_20[$$index_21];
                      $$renderer4.push(`<div class="px-3 py-2 border-2 border-border-light bg-surface"><span class="text-xs font-bold">${escape_html(track.name)}</span> <span class="block text-[10px] text-text-muted font-mono mt-0.5">after ${escape_html(track.starts_after)}</span> <div class="flex items-center gap-1 mt-1"><!--[-->`);
                      const each_array_21 = ensure_array_like(track.path);
                      for (let i = 0, $$length2 = each_array_21.length; i < $$length2; i++) {
                        let step = each_array_21[i];
                        $$renderer4.push(`<span class="text-[10px] font-mono font-bold">${escape_html(step)}</span> `);
                        if (i < track.path.length - 1) {
                          $$renderer4.push("<!--[-->");
                          $$renderer4.push(`<span class="text-text-muted text-[10px]">→</span>`);
                        } else {
                          $$renderer4.push("<!--[!-->");
                        }
                        $$renderer4.push(`<!--]-->`);
                      }
                      $$renderer4.push(`<!--]--></div></div>`);
                    }
                    $$renderer4.push(`<!--]--></div></div>`);
                  } else {
                    $$renderer4.push("<!--[!-->");
                  }
                  $$renderer4.push(`<!--]-->`);
                }
              });
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--> `);
            if (hardDeps().length > 0) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="mt-4"><h3 class="text-xs font-extrabold uppercase tracking-wider mb-3 pb-1.5 border-b-3 border-danger text-danger">Hard Dependencies (${escape_html(hardDeps().length)})</h3> <div class="space-y-2"><!--[-->`);
              const each_array_22 = ensure_array_like(hardDeps());
              for (let $$index_23 = 0, $$length = each_array_22.length; $$index_23 < $$length; $$index_23++) {
                let chain = each_array_22[$$index_23];
                $$renderer3.push(`<div class="brutal-border bg-surface shadow-sm overflow-hidden p-3"${attr_style("", { "border-left": "5px solid var(--color-danger)" })}><div class="flex items-center gap-2 text-sm"><span class="font-mono font-bold px-2 py-1 bg-surface border-2 border-brutal">${escape_html(chain.from)}</span> <span class="font-bold text-danger">→</span> <div class="flex flex-wrap gap-1"><!--[-->`);
                const each_array_23 = ensure_array_like(Array.isArray(chain.to) ? chain.to : [chain.to]);
                for (let $$index_22 = 0, $$length2 = each_array_23.length; $$index_22 < $$length2; $$index_22++) {
                  let target = each_array_23[$$index_22];
                  $$renderer3.push(`<span class="font-mono font-bold px-2 py-1 bg-surface border-2 border-brutal">${escape_html(target)}</span>`);
                }
                $$renderer3.push(`<!--]--></div> `);
                Badge($$renderer3, {
                  variant: "danger",
                  children: ($$renderer4) => {
                    $$renderer4.push(`<!---->hard`);
                  }
                });
                $$renderer3.push(`<!----></div> `);
                if (chain.reason) {
                  $$renderer3.push("<!--[-->");
                  $$renderer3.push(`<p class="mt-1.5 text-xs text-text-secondary pl-1">${escape_html(chain.reason)}</p>`);
                } else {
                  $$renderer3.push("<!--[!-->");
                }
                $$renderer3.push(`<!--]--></div>`);
              }
              $$renderer3.push(`<!--]--></div></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--> `);
            if (softDeps().length > 0) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="mt-4">`);
              CollapsibleSection($$renderer3, {
                title: "Soft Dependencies",
                subtitle: `${stringify(softDeps().length)} chains`,
                open: softDeps().length <= 5,
                children: ($$renderer4) => {
                  $$renderer4.push(`<div class="space-y-2"><!--[-->`);
                  const each_array_24 = ensure_array_like(softDeps());
                  for (let $$index_25 = 0, $$length = each_array_24.length; $$index_25 < $$length; $$index_25++) {
                    let chain = each_array_24[$$index_25];
                    $$renderer4.push(`<div class="flex items-center gap-2 text-sm px-2 py-2 border-b border-border-light last:border-0"><span class="font-mono font-bold px-2 py-1 bg-surface border-2 border-border-light">${escape_html(chain.from)}</span> <span class="text-text-muted">⇒</span> <div class="flex flex-wrap gap-1"><!--[-->`);
                    const each_array_25 = ensure_array_like(Array.isArray(chain.to) ? chain.to : [chain.to]);
                    for (let $$index_24 = 0, $$length2 = each_array_25.length; $$index_24 < $$length2; $$index_24++) {
                      let target = each_array_25[$$index_24];
                      $$renderer4.push(`<span class="font-mono font-bold px-2 py-1 bg-surface border-2 border-border-light">${escape_html(target)}</span>`);
                    }
                    $$renderer4.push(`<!--]--></div> `);
                    Badge($$renderer4, {
                      variant: "muted",
                      children: ($$renderer5) => {
                        $$renderer5.push(`<!---->soft`);
                      }
                    });
                    $$renderer4.push(`<!----></div>`);
                  }
                  $$renderer4.push(`<!--]--></div>`);
                }
              });
              $$renderer3.push(`<!----></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--> `);
            if (chains().length === 0) {
              $$renderer3.push("<!--[-->");
              Card($$renderer3, {
                children: ($$renderer4) => {
                  $$renderer4.push(`<div class="py-4 text-center text-sm text-text-muted">No dependency chains defined</div>`);
                }
              });
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--></div>`);
          } else if (activeTab === "reference") {
            $$renderer3.push("<!--[3-->");
            $$renderer3.push(`<p class="text-sm text-text-secondary mb-4">Supporting data: confidence breakdown, data gaps, AI tool selections, platform incompatibilities, and estimation methodology.</p> <h3 class="text-xs font-extrabold uppercase tracking-wider mb-3 pb-1.5 border-b-3 border-primary text-primary">Data Quality</h3> <div class="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 brutal-border bg-surface mb-5"><div class="flex items-center gap-2"><span class="text-xs font-extrabold uppercase tracking-widest text-text-muted">Confidence</span> <span${attr_class(`text-lg font-extrabold font-mono ${stringify(confidenceColor(summary().confidence))}`)}>${escape_html(summary().confidence)}%</span> <span class="text-[10px] text-text-muted font-mono">(${escape_html(gaps()?.confirmed_answers ?? 0)}/${escape_html(gaps()?.total_answers ?? 0)})</span></div> <span class="hidden sm:inline text-border-light">|</span> <div class="flex items-center gap-2"><span class="text-xs font-extrabold uppercase tracking-widest text-text-muted">Unknown</span> <span class="text-lg font-extrabold font-mono text-danger">${escape_html(gaps()?.unknown_answers ?? 0)}</span></div> <span class="hidden sm:inline text-border-light">|</span> <div class="flex items-center gap-2"><span class="text-xs font-extrabold uppercase tracking-widest text-text-muted">Assumed</span> <span class="text-lg font-extrabold font-mono text-warning">${escape_html(gaps()?.assumed_answers ?? 0)}</span></div> <span class="hidden sm:inline text-border-light">|</span> <div class="flex items-center gap-2"><span class="text-xs font-extrabold uppercase tracking-widest text-text-muted">Widening</span> <span class="text-lg font-extrabold font-mono text-danger">+${escape_html(Math.round(totalWidening()))}h</span></div></div> <div class="brutal-border bg-primary-light px-5 py-4 mb-5"${attr_style("", { "border-left": "6px solid var(--color-primary)" })}><h3 class="text-xs font-extrabold uppercase tracking-wider mb-2 text-primary">How to Improve Confidence</h3> `);
            ConfidenceImprovementPath($$renderer3, {
              discovery: discovery(),
              unvalidatedCount: summary().assumptions.unvalidated,
              totalWidening: totalWidening(),
              unknownCount: unknownCount()()
            });
            $$renderer3.push(`<!----></div> `);
            if (missingDimensions().length > 0) {
              $$renderer3.push("<!--[-->");
              Card($$renderer3, {
                children: ($$renderer4) => {
                  $$renderer4.push(`<button class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider mb-3 pb-1.5 border-b-3 border-danger text-danger w-full text-left cursor-pointer hover:opacity-80 transition-opacity">Missing Dimensions (${escape_html(missingDimensions().length)}) <span class="text-[10px] font-mono opacity-60">(i)</span></button> <div class="grid gap-2 sm:grid-cols-3 lg:grid-cols-4"><!--[-->`);
                  const each_array_26 = ensure_array_like(missingDimensions());
                  for (let $$index_26 = 0, $$length = each_array_26.length; $$index_26 < $$length; $$index_26++) {
                    let dim = each_array_26[$$index_26];
                    $$renderer4.push(`<div class="flex items-center gap-2 px-3 py-2 border-2 border-danger bg-danger-light"><span class="text-danger font-bold text-xs">✗</span> <span class="text-sm font-bold">${escape_html(DIMENSION_LABELS[dim] ?? dim)}</span></div>`);
                  }
                  $$renderer4.push(`<!--]--></div> <p class="mt-3 text-xs text-text-muted">Run <code class="brutal-border-thin bg-surface px-1 py-0.5 text-xs font-mono">/migrate discover</code> to fill these in.</p>`);
                }
              });
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--> <div class="mb-6"><button class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider mb-3 pb-1.5 border-b-3 border-warning text-warning w-full text-left cursor-pointer hover:opacity-80 transition-opacity">Gaps by Dimension <span class="text-[10px] font-mono opacity-60">(i)</span></button> `);
            GapsDimensionList($$renderer3, { discovery: discovery() });
            $$renderer3.push(`<!----></div> `);
            if (summary().assumptions.unvalidated > 0) {
              $$renderer3.push("<!--[-->");
              Card($$renderer3, {
                padding: "p-4",
                children: ($$renderer4) => {
                  $$renderer4.push(`<div class="flex items-center justify-between"><span class="text-sm text-text-secondary">${escape_html(summary().assumptions.unvalidated)} unvalidated assumption${escape_html(summary().assumptions.unvalidated > 1 ? "s" : "")} contributing <span class="font-mono font-bold text-danger">+${escape_html(Math.round(totalWidening()))}h</span> widening</span> <button class="px-3 py-1.5 text-xs font-bold uppercase bg-primary text-white border-2 border-brutal hover:-translate-y-px hover:shadow-sm transition-all duration-150 focus-visible:outline-2 focus-visible:outline-primary">Review assumptions →</button></div>`);
                }
              });
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--> <h3 class="text-xs font-extrabold uppercase tracking-wider mt-8 mb-3 pb-1.5 border-b-3 border-success text-success">Estimate Inputs</h3> `);
            Card($$renderer3, {
              children: ($$renderer4) => {
                $$renderer4.push(`<h4 class="text-xs font-extrabold uppercase tracking-wider mb-3 pb-1.5 border-b-2 border-border-light">AI Tool Selections (${escape_html(enabledAiTools().length)}/${escape_html(aiTools().length)} enabled)</h4> `);
                if (enabledAiTools().length > 0) {
                  $$renderer4.push("<!--[-->");
                  $$renderer4.push(`<div class="space-y-2"><!--[-->`);
                  const each_array_27 = ensure_array_like(enabledAiTools());
                  for (let $$index_27 = 0, $$length = each_array_27.length; $$index_27 < $$length; $$index_27++) {
                    let tool = each_array_27[$$index_27];
                    $$renderer4.push(`<div class="flex items-center justify-between py-1.5 border-b border-border-light last:border-0"><div><span class="text-sm font-bold">${escape_html(tool.name)}</span> `);
                    if (tool.vendor) {
                      $$renderer4.push("<!--[-->");
                      $$renderer4.push(`<span class="text-xs text-text-muted ml-1">by ${escape_html(tool.vendor)}</span>`);
                    } else {
                      $$renderer4.push("<!--[!-->");
                    }
                    $$renderer4.push(`<!--]--></div> <span class="text-xs font-mono font-bold text-success">-${escape_html(tool.hours_saved?.expected ?? 0)}h</span></div>`);
                  }
                  $$renderer4.push(`<!--]--></div>`);
                } else {
                  $$renderer4.push("<!--[!-->");
                  $$renderer4.push(`<p class="text-sm text-text-muted">No AI tools are enabled.</p>`);
                }
                $$renderer4.push(`<!--]-->`);
              }
            });
            $$renderer3.push(`<!----> `);
            if (excludedSet().size > 0) {
              $$renderer3.push("<!--[-->");
              Card($$renderer3, {
                children: ($$renderer4) => {
                  $$renderer4.push(`<h4 class="text-xs font-extrabold uppercase tracking-wider mb-3 pb-1.5 border-b-2 border-border-light">Scope Exclusions (${escape_html(excludedSet().size)})</h4> <div class="flex flex-wrap gap-1"><!--[-->`);
                  const each_array_28 = ensure_array_like([...excludedSet()]);
                  for (let $$index_28 = 0, $$length = each_array_28.length; $$index_28 < $$length; $$index_28++) {
                    let compId = each_array_28[$$index_28];
                    $$renderer4.push(`<span class="px-2 py-0.5 text-xs font-mono bg-danger-light text-danger border border-danger">${escape_html(compId)}</span>`);
                  }
                  $$renderer4.push(`<!--]--></div>`);
                }
              });
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--> `);
            if (knownIncompatibilities().length > 0) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<h3 class="text-xs font-extrabold uppercase tracking-wider mt-8 mb-3 pb-1.5 border-b-3 border-text-muted text-text-muted">Platform Knowledge</h3> `);
              Card($$renderer3, {
                children: ($$renderer4) => {
                  $$renderer4.push(`<button class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider mb-3 pb-1.5 border-b-2 border-border-light w-full text-left cursor-pointer hover:opacity-80 transition-opacity">Known Incompatibilities <span class="text-[10px] font-mono opacity-60">(i)</span></button> <div class="space-y-4"><!--[-->`);
                  const each_array_29 = ensure_array_like(knownIncompatibilities());
                  for (let $$index_30 = 0, $$length = each_array_29.length; $$index_30 < $$length; $$index_30++) {
                    let section = each_array_29[$$index_30];
                    CollapsibleSection($$renderer4, {
                      title: section.heading,
                      subtitle: `${stringify(section.entries.length)} items`,
                      open: false,
                      children: ($$renderer5) => {
                        $$renderer5.push(`<div class="space-y-3"><!--[-->`);
                        const each_array_30 = ensure_array_like(section.entries);
                        for (let $$index_29 = 0, $$length2 = each_array_30.length; $$index_29 < $$length2; $$index_29++) {
                          let entry = each_array_30[$$index_29];
                          $$renderer5.push(`<div class="border-b border-border-light pb-3 last:border-0 last:pb-0"><h4 class="text-sm font-bold mb-1">${escape_html(entry.title)}</h4> `);
                          if (entry.aws) {
                            $$renderer5.push("<!--[-->");
                            $$renderer5.push(`<div class="text-xs mb-0.5"><span class="font-bold text-text-muted">AWS:</span> <span class="text-text-secondary">${escape_html(entry.aws)}</span></div>`);
                          } else {
                            $$renderer5.push("<!--[!-->");
                          }
                          $$renderer5.push(`<!--]--> `);
                          if (entry.azure) {
                            $$renderer5.push("<!--[-->");
                            $$renderer5.push(`<div class="text-xs mb-0.5"><span class="font-bold text-text-muted">Azure:</span> <span class="text-text-secondary">${escape_html(entry.azure)}</span></div>`);
                          } else {
                            $$renderer5.push("<!--[!-->");
                          }
                          $$renderer5.push(`<!--]--> `);
                          if (entry.impact) {
                            $$renderer5.push("<!--[-->");
                            $$renderer5.push(`<div class="text-xs mt-1 px-2 py-1 bg-warning-light border border-warning"><span class="font-bold text-warning">Impact:</span> <span class="text-text-secondary">${escape_html(entry.impact)}</span></div>`);
                          } else {
                            $$renderer5.push("<!--[!-->");
                          }
                          $$renderer5.push(`<!--]--></div>`);
                        }
                        $$renderer5.push(`<!--]--></div>`);
                      }
                    });
                  }
                  $$renderer4.push(`<!--]--></div>`);
                }
              });
              $$renderer3.push(`<!---->`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--> `);
            CollapsibleSection($$renderer3, {
              title: "Methodology Notes",
              subtitle: "Estimation approach",
              open: false,
              children: ($$renderer4) => {
                $$renderer4.push(`<div class="space-y-4 text-sm text-text-secondary"><div><h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-1">Three-Point Estimation</h4> <p>Each component is estimated with optimistic, expected, and pessimistic values. The expected value is used for totals. The pessimistic value includes assumption widening and gotcha buffers.</p></div> <div><h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-1">Confidence Score</h4> <p>Calculated as the ratio of confirmed answers to total discovery answers. Higher confidence means fewer assumptions and a narrower estimate range.</p></div> <div><h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-1">Multiplier Compounding</h4> <p>Multipliers compound multiplicatively. If a component has a ×1.3 and ×1.5 multiplier, the effective factor is ×1.95 (1.3 × 1.5). This reflects real-world complexity stacking.</p></div> <div><h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-1">AI Savings Cap</h4> <p>AI tool savings are capped at 50% per component to prevent over-optimistic projections. Even with multiple AI tools enabled, no component can have more than half its hours reduced.</p></div></div>`);
              }
            });
            $$renderer3.push(`<!---->`);
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]-->`);
        }
      });
      $$renderer2.push(`<!---->`);
    }
    $$renderer2.push(`<!--]--></div> `);
    InfoDrawer($$renderer2, {
      open: drawerSection !== null,
      onclose: () => drawerSection = null,
      title: drawerSection === "page" ? "About Analysis" : drawerSection === "risks" ? "Risks & Clusters" : drawerSection === "assumptions" ? "Assumptions" : drawerSection === "multipliers" ? "Multipliers" : drawerSection === "dependencies" ? "Dependency Chains" : drawerSection === "gaps" ? "Gaps & Missing Data" : drawerSection === "gotchas" ? "Gotcha Patterns" : drawerSection === "decisions" ? "Known Incompatibilities" : "",
      children: ($$renderer3) => {
        if (drawerSection === "page") {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<div class="space-y-4 text-sm"><p>The <strong>Analysis</strong> page is the data-dense deep dive into your migration assessment. The executive summary shows confidence and top actions, then four tabs organize the detail.</p> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">Tabs</h3> <ul class="list-disc list-inside space-y-1 text-text-secondary"><li><strong>Risk Register</strong> — Risks with severity, likelihood, hours impact, and mitigation. Includes risk clusters and gotcha patterns.</li> <li><strong>Assumptions</strong> — Unconfirmed inputs. Validate them to reduce estimate uncertainty and increase confidence.</li> <li><strong>Complexity</strong> — Multipliers that scale component hours, plus dependency chains and critical path.</li> <li><strong>Reference</strong> — Data gaps, AI tool selections, scope exclusions, platform incompatibilities, and methodology.</li></ul></div> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">How Analysis Feeds Into Estimates</h3> <p class="text-text-secondary">Multipliers scale base component hours. Gotcha patterns add buffer hours. Assumptions widen the pessimistic estimate. All of this flows into the Estimate page totals.</p></div> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">Related Pages</h3> <ul class="list-disc list-inside space-y-1 text-text-secondary"><li><a${attr("href", `/assessments/${stringify(page.params.id)}/estimate`)} class="text-primary font-bold">Estimate</a> — See how analysis data affects hours</li> <li><a${attr("href", `/assessments/${stringify(page.params.id)}/discovery`)} class="text-primary font-bold">Discovery</a> — Fill data gaps to improve confidence</li> <li><a${attr("href", `/assessments/${stringify(page.params.id)}/refine`)} class="text-primary font-bold">Refine</a> — Exclude components and see cascade impact</li></ul></div></div>`);
        } else if (drawerSection === "risks") {
          $$renderer3.push("<!--[1-->");
          $$renderer3.push(`<div class="space-y-4 text-sm"><p><strong>Risks</strong> are factors that could increase migration effort beyond the current estimate.</p> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">Severity Levels</h3> <div class="space-y-1 font-mono text-xs"><p><span class="inline-block w-3 h-3 bg-danger border border-danger mr-1.5"></span> <strong>Critical / High</strong> — Likely to cause significant delays or rework.</p> <p><span class="inline-block w-3 h-3 bg-warning border border-warning mr-1.5"></span> <strong>Medium</strong> — May add hours. Should have a mitigation plan.</p> <p><span class="inline-block w-3 h-3 bg-success border border-success mr-1.5"></span> <strong>Low</strong> — Minor impact. Monitor but unlikely to derail.</p></div></div> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">Risk Clusters</h3> <p class="text-text-secondary">Clusters group related risks and assumptions that compound each other. The combined widening hours show the total additional effort if the cluster materializes.</p></div></div>`);
        } else if (drawerSection === "assumptions") {
          $$renderer3.push("<!--[2-->");
          $$renderer3.push(`<div class="space-y-4 text-sm"><p><strong>Assumptions</strong> are unconfirmed inputs used to build the estimate.</p> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">Validation Status</h3> <div class="space-y-2 text-text-secondary"><p><strong class="text-success">Validated</strong> — Confirmed correct. Removes uncertainty from the estimate.</p> <p><strong class="text-warning">Unvalidated</strong> — Pending. Adds widening hours to the pessimistic estimate.</p> <p><strong class="text-danger">Invalidated</strong> — Proven wrong. Affected components need re-estimation.</p></div></div> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">Widening Hours</h3> <p class="text-text-secondary">Each unvalidated assumption adds a widening buffer to the pessimistic estimate. Validating assumptions is the fastest way to narrow the estimate range and increase confidence.</p></div></div>`);
        } else if (drawerSection === "multipliers") {
          $$renderer3.push("<!--[3-->");
          $$renderer3.push(`<div class="space-y-4 text-sm"><p><strong>Multipliers</strong> are complexity factors that scale component hours up or down.</p> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">How They Work</h3> <p class="text-text-secondary">Each multiplier has a trigger condition (e.g., "legacy codebase", "custom integrations") and a factor (×1.2, ×1.5, etc.). When triggered, the factor multiplies the base hours of affected components.</p></div> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">Compounding</h3> <p class="text-text-secondary">Multiple multipliers on the same component compound multiplicatively. For example, ×1.3 and ×1.5 result in ×1.95 effective factor.</p></div></div>`);
        } else if (drawerSection === "dependencies") {
          $$renderer3.push("<!--[4-->");
          $$renderer3.push(`<div class="space-y-4 text-sm"><p><strong>Dependency chains</strong> define ordering constraints between migration components.</p> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">Dependency Types</h3> <div class="space-y-2 text-text-secondary"><p><strong class="text-danger">Hard</strong> — Strict ordering. The target cannot start until the source completes.</p> <p><strong class="text-text">Soft</strong> — Preferred ordering. Can be parallelized with some risk.</p></div></div> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">Critical Path</h3> <p class="text-text-secondary">The longest chain of hard dependencies. It determines the minimum calendar duration of the migration.</p></div></div>`);
        } else if (drawerSection === "gaps") {
          $$renderer3.push("<!--[5-->");
          $$renderer3.push(`<div class="space-y-4 text-sm"><p><strong>Gaps</strong> represent missing or unverified data that reduces estimate confidence.</p> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">Missing Dimensions</h3> <p class="text-text-secondary">Entire discovery dimensions with no data. These are the biggest gaps — run <code class="brutal-border-thin bg-surface px-1 py-0.5 text-xs font-mono">/migrate discover</code> to fill them in.</p></div> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">Unknown vs Assumed</h3> <p class="text-text-secondary">Unknown answers have no data. Assumed answers are educated guesses that add widening hours until validated.</p></div></div>`);
        } else if (drawerSection === "gotchas") {
          $$renderer3.push("<!--[6-->");
          $$renderer3.push(`<div class="space-y-4 text-sm"><p><strong>Gotcha patterns</strong> are known pitfalls that add buffer hours to specific components when their trigger conditions are met.</p> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">Triggered vs. Not Triggered</h3> <p class="text-text-secondary">Patterns are cross-referenced with your estimate data. "Triggered" patterns have matching components with gotcha hours. "Not triggered" patterns show what could trigger under different conditions.</p></div></div>`);
        } else if (drawerSection === "decisions") {
          $$renderer3.push("<!--[7-->");
          $$renderer3.push(`<div class="space-y-4 text-sm"><p><strong>Known incompatibilities</strong> are documented differences between source and target platforms that affect the migration.</p> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">Using This Data</h3> <p class="text-text-secondary">Review incompatibilities relevant to your migration scope. Each entry includes the impact and what needs to change. Use this to validate assumptions and identify risks you may have missed.</p></div></div>`);
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
//# sourceMappingURL=_page.svelte-BF_0zhN4.js.map
