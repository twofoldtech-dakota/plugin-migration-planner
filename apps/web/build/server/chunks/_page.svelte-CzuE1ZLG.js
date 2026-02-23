import { aa as head, ab as escape_html, a6 as attr_class, ac as ensure_array_like, ad as attr, a7 as stringify, a1 as derived, ae as attr_style } from './index4-DG1itRH8.js';
import { p as page } from './index3-fupcZyp6.js';
import './root-DQzxKDPP.js';
import './state.svelte-DeAIIc79.js';
import { C as Card } from './Card-w7RlWvYA.js';
import { S as ScenarioSelector, T as Toggle } from './ScenarioSelector-BS91ifSW.js';
import { C as CollapsibleSection } from './CollapsibleSection-DwE4ccwC.js';
import { T as Tooltip } from './Tooltip-hZ63yG7F.js';
import { I as InfoDrawer } from './InfoDrawer-WPURexns.js';
import { M as Modal } from './Modal-CbyfWmrz.js';
import { d as getComponentHours, c as computeRefinedTotals } from './scenario-engine-BY9xcCE7.js';
import { d as formatRole } from './migration-stats-BAGrJ4E5.js';
import { B as Badge } from './Badge-CWejdkwM.js';
import './client-Cm3t_ao5.js';
import './index-mV5xf0Xo.js';
import './index-server-CVwIEJCx.js';

function computeScopeCascade(excludedComponents, aiTools, assumptions, risks) {
  const inactiveAiTools = /* @__PURE__ */ new Set();
  for (const tool of aiTools) {
    const applicable = tool.applicable_components ?? [];
    if (applicable.length > 0 && applicable.every((c) => excludedComponents.has(c))) {
      inactiveAiTools.add(tool.tool_id ?? tool.id);
    }
  }
  const outOfScopeAssumptions = /* @__PURE__ */ new Set();
  for (const assumption of assumptions) {
    const affected = assumption.affected_components ?? [];
    if (affected.length > 0 && affected.every((c) => excludedComponents.has(c))) {
      outOfScopeAssumptions.add(assumption.id);
    }
  }
  const outOfScopeRisks = /* @__PURE__ */ new Set();
  for (const risk of risks) {
    const linked = risk.linked_assumptions ?? [];
    if (linked.length > 0 && linked.every((a) => outOfScopeAssumptions.has(a))) {
      outOfScopeRisks.add(risk.id);
    }
  }
  return { excludedComponents, inactiveAiTools, outOfScopeAssumptions, outOfScopeRisks };
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    const assessment = derived(() => data.assessment);
    const estimate = derived(() => data.estimate);
    const statusBadge = derived(() => assessment().status === "complete" ? { variant: "success", label: "Finalized" } : estimate() ? { variant: "default", label: "In Progress" } : { variant: "muted", label: "Not Started" });
    const analysis = derived(() => data.analysis);
    const phases = derived(() => estimate()?.phases ?? []);
    const assumptions = derived(() => analysis()?.assumptions ?? []);
    const risks = derived(() => analysis()?.risks ?? []);
    const aiTools = derived(() => data.aiAlternatives ?? []);
    let aiToggles = {};
    let exclusions = {};
    let reasons = {};
    let scenario = "ai_assisted";
    let roleOverrides = {};
    let roleTasks = {};
    let newTaskInputs = {};
    let expandedComponents = {};
    let filterTab = "all";
    let searchQuery = "";
    let drawerSection = null;
    let finalizeModalOpen = false;
    let finalizing = false;
    const excludedSet = derived(() => new Set(Object.entries(exclusions).filter(([, v]) => v).map(([k]) => k)));
    const allComponents = derived(() => phases().flatMap((p) => (p.components ?? []).map((c) => c.id)));
    const inScopeCount = derived(() => allComponents().length - excludedSet().size);
    const scenarioTotals = derived(() => computeRefinedTotals(phases(), aiToggles, excludedSet()));
    const activeTotal = derived(() => scenario === "manual" ? scenarioTotals().manual : scenario === "best_case" ? scenarioTotals().bestCase : scenarioTotals().aiAssisted);
    const overrideDelta = derived(() => () => {
      let delta = 0;
      for (const phase of phases()) {
        for (const comp of phase.components ?? []) {
          if (excludedSet().has(comp.id)) continue;
          const byRole = comp.by_role;
          if (!byRole || !roleOverrides[comp.id]) continue;
          for (const [role, baseH] of Object.entries(byRole)) {
            const ov = roleOverrides[comp.id]?.[role];
            if (ov !== void 0) delta += ov - baseH;
          }
        }
      }
      return delta;
    });
    const hasAnyOverride = derived(() => () => {
      return Object.values(roleOverrides).some((r) => Object.keys(r).length > 0);
    });
    const cascade = derived(() => computeScopeCascade(excludedSet(), aiTools(), assumptions(), risks()));
    const canFinalize = derived(() => !!estimate());
    const finalizeWarnings = derived(() => () => {
      const w = [];
      const unvalidated = assumptions().filter((a) => a.validation_status !== "validated").length;
      const highRisks = risks().filter((r) => r.severity === "critical" || r.severity === "high").length;
      if (unvalidated > 0) w.push(`${unvalidated} unvalidated assumption(s) will widen the estimate range`);
      if (highRisks > 0) w.push(`${highRisks} high-severity risk(s) require active mitigation`);
      if (hasAnyOverride()()) w.push("Hour overrides are applied — deliverables will reflect refined totals");
      return w;
    });
    function phaseToggleState(phase) {
      const comps = phase.components ?? [];
      if (comps.length === 0) return "all";
      const n = comps.filter((c) => excludedSet().has(c.id)).length;
      if (n === 0) return "all";
      if (n === comps.length) return "none";
      return "partial";
    }
    function toggleComponent(compId, included) {
      exclusions[compId] = !included;
      exclusions = { ...exclusions };
      persistScope();
    }
    function togglePhase(phase, included) {
      for (const c of phase.components ?? []) exclusions[c.id] = !included;
      exclusions = { ...exclusions };
      persistScope();
    }
    async function persistScope() {
      await fetch(`/api/assessments/${page.params.id}/scope-exclusions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exclusions, reasons })
      });
    }
    function filterComponents(comps) {
      return comps.filter((c) => {
        const q = !searchQuery;
        return q;
      });
    }
    function getLinkedAssumptions(compId) {
      return assumptions().filter((a) => (a.affected_components ?? []).includes(compId));
    }
    function getLinkedRisks(compId) {
      return risks().filter((r) => (r.linked_assumptions ?? []).some((aId) => assumptions().find((a) => a.id === aId && (a.affected_components ?? []).includes(compId))));
    }
    function getCompOverrideDelta(comp) {
      const byRole = comp.by_role;
      if (!byRole || !roleOverrides[comp.id]) return 0;
      return Object.entries(byRole).reduce(
        (delta, [role, baseH]) => {
          const ov = roleOverrides[comp.id]?.[role];
          return delta + (ov !== void 0 ? ov - baseH : 0);
        },
        0
      );
    }
    function getRoleDelta(compId, role, baseH) {
      const ov = roleOverrides[compId]?.[role];
      return ov !== void 0 ? ov - baseH : 0;
    }
    const EXCLUSION_PRESETS = [
      "Already migrated",
      "Out of scope",
      "Deferred to phase 2",
      "Client decision",
      "Handled by third party",
      "Not applicable"
    ];
    const ROLE_ACCENTS = {
      infrastructure_engineer: "border-l-primary",
      infra_eng: "border-l-primary",
      dba: "border-l-warning-dark",
      sitecore_developer: "border-l-[#7c3aed]",
      sitecore_dev: "border-l-[#7c3aed]",
      qa_engineer: "border-l-success",
      qa_eng: "border-l-success",
      project_manager: "border-l-[#ea580c]"
    };
    function roleAccent(role) {
      return ROLE_ACCENTS[role] ?? "border-l-text-muted";
    }
    head("1mve00q", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html(assessment().project_name)} — Refine Scope</title>`);
      });
    });
    $$renderer2.push(`<a href="#phase-list" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-1.5 focus:bg-primary focus:text-white focus:text-xs focus:font-bold">Skip to phase list</a> <div class="p-6 space-y-5 animate-enter"><div class="flex items-start gap-4 flex-wrap"><div><div class="flex items-center gap-2"><h1 class="text-xl font-extrabold uppercase tracking-wider">Refine Scope</h1> `);
    Badge($$renderer2, {
      variant: statusBadge().variant,
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->${escape_html(statusBadge().label)}`);
      }
    });
    $$renderer2.push(`<!----> <button class="flex items-center justify-center w-5 h-5 text-text-muted hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-primary" aria-label="About this page">(i)</button></div> <p class="text-xs text-text-muted mt-0.5 font-mono">Toggle components, adjust role hours &amp; tasks, add exclusion reasons — then mark complete.</p></div></div> `);
    if (!estimate()) {
      $$renderer2.push("<!--[-->");
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="py-10 text-center space-y-2"><p class="text-base font-extrabold uppercase tracking-wider text-text-muted">No Estimate Yet</p> <p class="text-sm text-text-muted max-w-sm mx-auto">Run <code class="brutal-border-thin bg-surface px-1.5 py-0.5 text-xs font-mono">/migrate estimate</code> first, then refine scope here.</p></div>`);
        }
      });
    } else {
      $$renderer2.push("<!--[!-->");
      if (canFinalize()) {
        $$renderer2.push("<!--[-->");
        const confScore = estimate().confidence_score ?? 0;
        const confVariant = confScore >= 70 ? "success" : confScore >= 40 ? "warning" : "danger";
        $$renderer2.push(`<div class="flex items-center gap-4 border-l-[5px] border-l-success bg-success/[0.06] px-5 py-3.5"><div class="shrink-0 flex items-center justify-center w-8 h-8 bg-success border-2 border-[#000] shadow-[2px_2px_0_#000]"><svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10l4 4 8-8" stroke="white" stroke-width="3" stroke-linecap="square" stroke-linejoin="miter"></path></svg></div> <div class="flex-1 min-w-0"><p class="text-sm font-extrabold uppercase tracking-wider leading-tight">Ready to Complete</p> <p class="text-xs text-text-muted mt-0.5"><span class="font-mono font-bold text-text">${escape_html(inScopeCount())}</span> components · <span class="font-mono font-bold text-text">${escape_html(Math.round(activeTotal()).toLocaleString())}h</span> refined · <span${attr_class(`font-mono font-bold text-${stringify(confVariant)}`)}>${escape_html(confScore)}%</span> confidence `);
        if (excludedSet().size > 0) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`· <span class="font-mono">${escape_html(excludedSet().size)}</span> excluded`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--> — <a href="#finalize-cta" class="font-bold text-primary hover:underline">Complete Assessment ↓</a></p></div></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> <div class="brutal-border bg-surface px-5 py-3 flex items-center gap-6 flex-wrap">`);
      Tooltip($$renderer2, {
        text: "Components included in the migration scope.",
        position: "bottom",
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="flex items-baseline gap-1.5 cursor-help"><span class="text-2xl font-extrabold font-mono tracking-tight">${escape_html(inScopeCount())}<span class="text-sm text-text-muted font-normal">/${escape_html(allComponents().length)}</span></span> <span class="text-xs font-bold uppercase tracking-wider text-text-muted">in scope</span></div>`);
        }
      });
      $$renderer2.push(`<!----> <span class="w-px h-6 bg-border-light hidden sm:block" aria-hidden="true"></span> `);
      Tooltip($$renderer2, {
        text: "Total hours after scope exclusions and role overrides.",
        position: "bottom",
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="flex items-baseline gap-1.5 cursor-help"><span class="text-sm font-extrabold font-mono">${escape_html(Math.round(activeTotal()).toLocaleString())}h</span> <span class="text-xs text-text-muted">refined</span> `);
          if (hasAnyOverride()() && overrideDelta()() !== 0) {
            $$renderer3.push("<!--[-->");
            const d = overrideDelta()();
            $$renderer3.push(`<span${attr_class(`text-[10px] font-bold font-mono ${stringify(d > 0 ? "text-danger" : "text-success")}`)}>(${escape_html(d > 0 ? "+" : "")}${escape_html(Math.round(d))}h override)</span>`);
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]--></div>`);
        }
      });
      $$renderer2.push(`<!----> <span class="w-px h-6 bg-border-light hidden sm:block" aria-hidden="true"></span> `);
      Tooltip($$renderer2, {
        text: "Components removed from scope.",
        position: "bottom",
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="flex items-baseline gap-1.5 cursor-help"><span${attr_class(`text-sm font-extrabold font-mono ${stringify(excludedSet().size > 0 ? "text-danger" : "text-text-muted")}`)}>${escape_html(excludedSet().size)}</span> <span class="text-xs text-text-muted">excluded</span></div>`);
        }
      });
      $$renderer2.push(`<!----> <span class="w-px h-6 bg-border-light hidden sm:block" aria-hidden="true"></span> `);
      Tooltip($$renderer2, {
        text: "Estimate confidence based on confirmed vs. assumed answers.",
        position: "bottom",
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="flex items-center gap-2 cursor-help"><span class="text-sm font-extrabold font-mono">${escape_html(estimate().confidence_score ?? 0)}%</span> <div class="w-16 h-1.5 bg-border-light border border-brutal"><div${attr_class(`h-full transition-all duration-300 ${stringify((estimate().confidence_score ?? 0) >= 70 ? "bg-success" : (estimate().confidence_score ?? 0) >= 40 ? "bg-warning" : "bg-danger")}`)}${attr_style(`width: ${stringify(estimate().confidence_score ?? 0)}%`)}></div></div> <span class="text-xs text-text-muted">confidence</span></div>`);
        }
      });
      $$renderer2.push(`<!----></div> `);
      ScenarioSelector($$renderer2, {
        scenario,
        onchange: (s) => scenario = s,
        totals: scenarioTotals()
      });
      $$renderer2.push(`<!----> <div class="flex items-center gap-3 flex-wrap"><div role="tablist" tabindex="0" aria-label="Component filter" class="flex brutal-border overflow-hidden shadow-[2px_2px_0_#000]"><!--[-->`);
      const each_array = ensure_array_like([
        ["all", "All", allComponents().length],
        ["in_scope", "In Scope", inScopeCount()],
        ["excluded", "Excluded", excludedSet().size]
      ]);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let [tab, label, count] = each_array[$$index];
        $$renderer2.push(`<button role="tab"${attr("aria-selected", filterTab === tab)}${attr("tabindex", filterTab === tab ? 0 : -1)}${attr_class(`px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider transition-colors duration-100 focus-visible:outline-2 focus-visible:outline-primary ${stringify(filterTab === tab ? "bg-[#1a1a1a] text-white" : "bg-surface text-text-muted hover:bg-surface-raised")}`)}>${escape_html(label)} <span class="opacity-60 font-mono">${escape_html(count)}</span></button>`);
      }
      $$renderer2.push(`<!--]--></div> <div class="relative flex-1 min-w-[180px]"><span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-xs select-none" aria-hidden="true">/</span> <input id="refine-search" type="search" placeholder="Search components…"${attr("value", searchQuery)} class="w-full pl-7 pr-3 py-1.5 text-xs font-mono brutal-border bg-bg shadow-[2px_2px_0_#000] placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-primary" aria-label="Search components"/></div> `);
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div> <div id="phase-list" class="space-y-3" role="list" aria-label="Migration phases"><!--[-->`);
      const each_array_1 = ensure_array_like(phases());
      for (let $$index_9 = 0, $$length = each_array_1.length; $$index_9 < $$length; $$index_9++) {
        let phase = each_array_1[$$index_9];
        const state = phaseToggleState(phase);
        const phaseComps = phase.components ?? [];
        const filtered = filterComponents(phaseComps);
        const inScopeComps = phaseComps.filter((c) => !excludedSet().has(c.id));
        const phaseHours = inScopeComps.reduce((s, c) => s + getComponentHours(c, scenario, aiToggles), 0);
        if (filtered.length > 0) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div role="listitem">`);
          CollapsibleSection($$renderer2, {
            title: phase.name,
            subtitle: `${stringify(inScopeComps.length)}/${stringify(phaseComps.length)} components · ${stringify(Math.round(phaseHours))}h`,
            open: true,
            badge: state === "none" ? "excluded" : state === "partial" ? "partial" : void 0,
            badgeVariant: state === "none" ? "danger" : "warning",
            children: ($$renderer3) => {
              $$renderer3.push(`<div class="flex items-center justify-between pb-3 mb-3 border-b-2 border-border-light"><span class="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">${escape_html(state === "all" ? "All in scope" : state === "none" ? "All excluded" : "Partial scope")}</span> `);
              Toggle($$renderer3, {
                checked: state !== "none",
                onchange: (v) => togglePhase(phase, v),
                label: state === "none" ? "Include all" : "Exclude all",
                size: "sm"
              });
              $$renderer3.push(`<!----></div> <div class="space-y-2" role="list"${attr("aria-label", `${stringify(phase.name)} components`)}><!--[-->`);
              const each_array_2 = ensure_array_like(filtered);
              for (let $$index_8 = 0, $$length2 = each_array_2.length; $$index_8 < $$length2; $$index_8++) {
                let comp = each_array_2[$$index_8];
                const excluded = excludedSet().has(comp.id);
                const expanded = expandedComponents[comp.id];
                const compHours = getComponentHours(comp, scenario, aiToggles);
                const byRole = comp.by_role ?? {};
                const hasRoles = Object.keys(byRole).length > 0;
                const linkedAssumps = getLinkedAssumptions(comp.id);
                const linkedRisks = getLinkedRisks(comp.id);
                const compTools = aiTools().filter((t) => t.applicable_components?.includes(comp.id));
                const overrideDeltaV = getCompOverrideDelta(comp);
                const hasOverride = overrideDeltaV !== 0;
                $$renderer3.push(`<div role="listitem"${attr_class(`border-2 border-[#000] transition-all duration-150 ${stringify(excluded ? "bg-surface opacity-70" : "bg-bg")} ${stringify(expanded ? "shadow-[3px_3px_0_#000]" : "shadow-[2px_2px_0_#000] hover:shadow-[3px_3px_0_#000]")}`)}><button class="flex items-center gap-3 px-3 py-2.5 w-full text-left cursor-pointer hover:bg-surface-raised/40 transition-colors duration-100 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[-2px]"${attr("aria-expanded", expanded)}${attr("aria-label", `${stringify(expanded ? "Collapse" : "Expand")} details for ${stringify(comp.name)}`)}><span role="presentation">`);
                Toggle($$renderer3, {
                  checked: !excluded,
                  onchange: (v) => toggleComponent(comp.id, v),
                  size: "sm"
                });
                $$renderer3.push(`<!----></span> <div class="flex-1 min-w-0"><span${attr_class(`text-sm font-bold ${stringify(excluded ? "line-through text-text-muted" : "")} truncate block`)}>${escape_html(comp.name)}</span> `);
                if (excluded && reasons[comp.id]) {
                  $$renderer3.push("<!--[-->");
                  $$renderer3.push(`<span class="text-[10px] font-mono text-danger">${escape_html(reasons[comp.id])}</span>`);
                } else {
                  $$renderer3.push("<!--[!-->");
                }
                $$renderer3.push(`<!--]--></div> <div class="flex items-center gap-2 shrink-0">`);
                if (linkedAssumps.length > 0) {
                  $$renderer3.push("<!--[-->");
                  Tooltip($$renderer3, {
                    text: `${stringify(linkedAssumps.length)} assumption(s)`,
                    position: "top",
                    children: ($$renderer4) => {
                      $$renderer4.push(`<span role="presentation" class="text-[10px] font-extrabold font-mono text-warning-dark bg-warning-light px-1.5 py-0.5 border border-[#a16207] cursor-default">${escape_html(linkedAssumps.length)}A</span>`);
                    }
                  });
                } else {
                  $$renderer3.push("<!--[!-->");
                }
                $$renderer3.push(`<!--]--> `);
                if (linkedRisks.length > 0) {
                  $$renderer3.push("<!--[-->");
                  Tooltip($$renderer3, {
                    text: `${stringify(linkedRisks.length)} risk(s)`,
                    position: "top",
                    children: ($$renderer4) => {
                      $$renderer4.push(`<span role="presentation" class="text-[10px] font-extrabold font-mono text-danger bg-danger-light px-1.5 py-0.5 border border-danger cursor-default">${escape_html(linkedRisks.length)}R</span>`);
                    }
                  });
                } else {
                  $$renderer3.push("<!--[!-->");
                }
                $$renderer3.push(`<!--]--> `);
                if (compTools.length > 0) {
                  $$renderer3.push("<!--[-->");
                  Tooltip($$renderer3, {
                    text: `${stringify(compTools.length)} AI tool(s)`,
                    position: "top",
                    children: ($$renderer4) => {
                      $$renderer4.push(`<span role="presentation" class="text-[10px] font-extrabold font-mono text-success bg-[#dcfce7] px-1.5 py-0.5 border border-success cursor-default">${escape_html(compTools.length)}AI</span>`);
                    }
                  });
                } else {
                  $$renderer3.push("<!--[!-->");
                }
                $$renderer3.push(`<!--]--> <div class="text-right w-20"><span${attr_class(`text-sm font-extrabold font-mono ${stringify(excluded ? "line-through text-text-muted" : "")}`)}>${escape_html(Math.round(compHours))}h</span> `);
                if (hasOverride && !excluded) {
                  $$renderer3.push("<!--[-->");
                  $$renderer3.push(`<span${attr_class(`block text-[10px] font-bold font-mono ${stringify(overrideDeltaV > 0 ? "text-danger" : "text-success")}`)}>${escape_html(overrideDeltaV > 0 ? "+" : "")}${escape_html(Math.round(overrideDeltaV))}h override</span>`);
                } else {
                  $$renderer3.push("<!--[!-->");
                }
                $$renderer3.push(`<!--]--></div> <span class="ml-1 w-6 h-6 flex items-center justify-center text-xs text-text-muted" aria-hidden="true"><span${attr_class(`inline-block transition-transform duration-150 ${stringify(expanded ? "rotate-90" : "")}`)}>▶</span></span></div></button> `);
                if (excluded) {
                  $$renderer3.push("<!--[-->");
                  $$renderer3.push(`<div class="px-3 pb-3 pt-0 border-t border-border-light bg-danger-light/20"><div class="flex items-start gap-2 mt-2 flex-wrap"><span class="text-[10px] font-extrabold uppercase tracking-wider text-danger mt-0.5 shrink-0">Reason:</span> <div class="flex flex-wrap gap-1.5 flex-1"><!--[-->`);
                  const each_array_3 = ensure_array_like(EXCLUSION_PRESETS);
                  for (let $$index_1 = 0, $$length3 = each_array_3.length; $$index_1 < $$length3; $$index_1++) {
                    let preset = each_array_3[$$index_1];
                    $$renderer3.push(`<button${attr_class(`text-[10px] px-2 py-0.5 font-bold border transition-all duration-100 focus-visible:outline-2 focus-visible:outline-primary ${stringify(reasons[comp.id] === preset ? "bg-danger text-white border-danger shadow-[1px_1px_0_#000]" : "bg-surface text-text-muted border-border-light hover:border-danger hover:text-danger")}`)}>${escape_html(preset)}</button>`);
                  }
                  $$renderer3.push(`<!--]--> <input type="text" placeholder="Custom…"${attr("value", reasons[comp.id] ?? "")} class="flex-1 min-w-[120px] px-2 py-0.5 text-[10px] font-mono brutal-border-thin bg-surface placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-danger"${attr("aria-label", `Custom exclusion reason for ${stringify(comp.name)}`)}/></div></div></div>`);
                } else {
                  $$renderer3.push("<!--[!-->");
                }
                $$renderer3.push(`<!--]--> `);
                if (expanded) {
                  $$renderer3.push("<!--[-->");
                  $$renderer3.push(`<div class="border-t-2 border-[#000] bg-bg"><div class="flex items-center gap-0 border-b border-border-light overflow-x-auto"><!--[-->`);
                  const each_array_4 = ensure_array_like([
                    ["Base", `${comp.base_hours ?? 0}h`, ""],
                    ["Effective", `${Math.round(compHours)}h`, "font-extrabold"],
                    ...comp.gotcha_hours > 0 ? [["Gotcha", `+${comp.gotcha_hours}h`, "text-warning-dark"]] : [],
                    ...comp.assumption_dependent_hours > 0 ? [
                      [
                        "At-risk",
                        `${comp.assumption_dependent_hours}h`,
                        "text-danger"
                      ]
                    ] : [],
                    ...comp.units > 1 ? [["Units", String(comp.units), "text-text-muted"]] : []
                  ]);
                  for (let $$index_2 = 0, $$length3 = each_array_4.length; $$index_2 < $$length3; $$index_2++) {
                    let strip = each_array_4[$$index_2];
                    const [label, value, cls] = strip;
                    $$renderer3.push(`<div class="flex-1 min-w-[80px] px-3 py-2 border-r border-border-light last:border-r-0 text-center"><p class="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">${escape_html(label)}</p> <p${attr_class(`text-sm font-mono ${stringify(cls)}`)}>${escape_html(value)}</p></div>`);
                  }
                  $$renderer3.push(`<!--]--> `);
                  if (compTools.length > 0) {
                    $$renderer3.push("<!--[-->");
                    $$renderer3.push(`<div class="flex-1 min-w-[80px] px-3 py-2 text-center"><p class="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">AI Tools</p> <p class="text-sm font-mono text-success">${escape_html(compTools.filter((t) => aiToggles[t.id] !== false).length)}/${escape_html(compTools.length)}</p></div>`);
                  } else {
                    $$renderer3.push("<!--[!-->");
                  }
                  $$renderer3.push(`<!--]--></div> `);
                  if (hasRoles) {
                    $$renderer3.push("<!--[-->");
                    $$renderer3.push(`<div class="px-3 pt-3 pb-1.5 flex items-center justify-between"><h4 class="text-[10px] font-extrabold uppercase tracking-wider text-text-muted tracking-widest">Role Breakdown &amp; Tasks</h4> <span class="text-[10px] font-mono text-text-faint">${escape_html(Object.values(byRole).reduce((s, h) => s + h, 0))}h allocated</span></div> <div class="px-3 pb-3 grid gap-2 sm:grid-cols-2"><!--[-->`);
                    const each_array_5 = ensure_array_like(Object.entries(byRole));
                    for (let $$index_4 = 0, $$length3 = each_array_5.length; $$index_4 < $$length3; $$index_4++) {
                      let [role, baseH] = each_array_5[$$index_4];
                      const overrideVal = roleOverrides[comp.id]?.[role];
                      const effectiveH = overrideVal ?? baseH;
                      const delta = getRoleDelta(comp.id, role, baseH);
                      const tasks = roleTasks[comp.id]?.[role] ?? [];
                      const inputKey = `${comp.id}__${role}`;
                      $$renderer3.push(`<div${attr_class(`border-2 border-[#000] ${stringify(roleAccent(role))} border-l-4 bg-surface shadow-[2px_2px_0_#000]`)}><div class="bg-[#1a1a1a] px-3 py-2 flex items-center justify-between gap-3"><span class="text-xs font-extrabold uppercase tracking-wider text-white truncate">${escape_html(formatRole(role))}</span> <div class="flex items-center gap-2 shrink-0"><span class="text-[10px] font-mono text-white/60 line-through">${escape_html(baseH)}h</span> <div class="flex items-center gap-1"><input type="number" min="0" step="0.5"${attr("value", effectiveH)} class="w-14 px-1.5 py-0.5 text-xs font-extrabold font-mono text-right bg-[#2d2d2d] text-white border border-white/30 focus:outline-none focus:border-primary [appearance:textfield] [&amp;::-webkit-inner-spin-button]:appearance-none"${attr("aria-label", `Hours for ${stringify(formatRole(role))} on ${stringify(comp.name)}`)}/> <span class="text-[10px] text-white/70 font-mono">h</span></div> `);
                      if (overrideVal !== void 0) {
                        $$renderer3.push("<!--[-->");
                        $$renderer3.push(`<div class="flex items-center gap-1"><span${attr_class(`text-[10px] font-bold font-mono ${stringify(delta > 0 ? "text-[#fca5a5]" : "text-[#86efac]")}`)}>${escape_html(delta > 0 ? "+" : "")}${escape_html(Math.round(delta * 10) / 10)}h</span> <button class="text-[10px] text-white/50 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-white"${attr("aria-label", `Reset hours for ${stringify(formatRole(role))}`)}>↺</button></div>`);
                      } else {
                        $$renderer3.push("<!--[!-->");
                      }
                      $$renderer3.push(`<!--]--></div></div> <div class="p-2.5 space-y-1">`);
                      if (tasks.length === 0 && !roleTasks[comp.id]?.[role]) {
                        $$renderer3.push("<!--[-->");
                        $$renderer3.push(`<p class="text-[10px] text-text-faint font-mono italic px-1">No tasks — click + to add</p>`);
                      } else {
                        $$renderer3.push("<!--[!-->");
                      }
                      $$renderer3.push(`<!--]--> <!--[-->`);
                      const each_array_6 = ensure_array_like(tasks);
                      for (let idx = 0, $$length4 = each_array_6.length; idx < $$length4; idx++) {
                        let task = each_array_6[idx];
                        $$renderer3.push(`<div class="flex items-start gap-1.5 group"><span class="text-[10px] text-text-muted mt-0.5 shrink-0 select-none" aria-hidden="true">◆</span> <input type="text"${attr("value", task)} class="flex-1 text-[11px] font-mono bg-transparent border-b border-transparent hover:border-border-light focus:border-primary focus:outline-none text-text-secondary leading-relaxed"${attr("aria-label", `Task ${stringify(idx + 1)} for ${stringify(formatRole(role))}`)}/> <button class="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 text-[10px] text-text-muted hover:text-danger transition-all focus-visible:outline-2 focus-visible:outline-danger shrink-0 mt-0.5"${attr("aria-label", `Remove task ${stringify(idx + 1)} for ${stringify(formatRole(role))}`)}>✕</button></div>`);
                      }
                      $$renderer3.push(`<!--]--> <div class="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-border-light"><span class="text-[10px] text-text-faint shrink-0" aria-hidden="true">+</span> <input type="text" placeholder="Add task… ↵"${attr("value", newTaskInputs[inputKey] ?? "")} class="flex-1 text-[11px] font-mono bg-transparent border-b border-border-light placeholder:text-text-faint text-text-secondary focus:border-primary focus:outline-none"${attr("aria-label", `New task for ${stringify(formatRole(role))}`)}/></div></div></div>`);
                    }
                    $$renderer3.push(`<!--]--></div>`);
                  } else {
                    $$renderer3.push("<!--[!-->");
                    $$renderer3.push(`<div class="px-3 py-3 text-xs text-text-faint font-mono italic">No role breakdown available for this component.</div>`);
                  }
                  $$renderer3.push(`<!--]--> `);
                  if ((comp.multipliers_applied ?? []).length > 0 || linkedAssumps.length > 0 || linkedRisks.length > 0) {
                    $$renderer3.push("<!--[-->");
                    $$renderer3.push(`<div class="px-3 pb-3 pt-0 border-t border-border-light flex flex-wrap gap-1.5 mt-0 pt-2.5"><!--[-->`);
                    const each_array_7 = ensure_array_like(comp.multipliers_applied ?? []);
                    for (let $$index_5 = 0, $$length3 = each_array_7.length; $$index_5 < $$length3; $$index_5++) {
                      let mult = each_array_7[$$index_5];
                      $$renderer3.push(`<span class="inline-flex items-center px-2 py-0.5 text-[10px] font-bold bg-warning-light text-warning-dark border border-[#a16207]">×${escape_html(typeof mult === "string" ? mult : mult.name ?? mult.id)} `);
                      if (typeof mult === "object" && mult.factor) {
                        $$renderer3.push("<!--[-->");
                        $$renderer3.push(`${escape_html(mult.factor)}`);
                      } else {
                        $$renderer3.push("<!--[!-->");
                      }
                      $$renderer3.push(`<!--]--></span>`);
                    }
                    $$renderer3.push(`<!--]--> <!--[-->`);
                    const each_array_8 = ensure_array_like(linkedAssumps);
                    for (let $$index_6 = 0, $$length3 = each_array_8.length; $$index_6 < $$length3; $$index_6++) {
                      let a = each_array_8[$$index_6];
                      Tooltip($$renderer3, {
                        text: a.assumed_value || a.basis || a.id,
                        position: "top",
                        children: ($$renderer4) => {
                          $$renderer4.push(`<span${attr_class(`inline-flex items-center px-2 py-0.5 text-[10px] font-mono cursor-help ${stringify(a.validation_status === "validated" ? "bg-[#dcfce7] text-success border border-success" : "bg-warning-light text-warning-dark border border-[#a16207]")}`)}>${escape_html(a.id)}</span>`);
                        }
                      });
                    }
                    $$renderer3.push(`<!--]--> <!--[-->`);
                    const each_array_9 = ensure_array_like(linkedRisks);
                    for (let $$index_7 = 0, $$length3 = each_array_9.length; $$index_7 < $$length3; $$index_7++) {
                      let r = each_array_9[$$index_7];
                      Tooltip($$renderer3, {
                        text: r.description || r.id,
                        position: "top",
                        children: ($$renderer4) => {
                          $$renderer4.push(`<span class="inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-danger bg-danger-light border border-danger cursor-help">${escape_html(r.id)}</span>`);
                        }
                      });
                    }
                    $$renderer3.push(`<!--]--></div>`);
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
            }
          });
          $$renderer2.push(`<!----></div>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--> `);
      if (phases().every((p) => filterComponents(p.components ?? []).length === 0)) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="brutal-border-thin bg-surface py-8 text-center text-sm text-text-muted font-mono">No components match this filter.</div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div> `);
      if (excludedSet().size > 0) {
        $$renderer2.push("<!--[-->");
        Card($$renderer2, {
          children: ($$renderer3) => {
            $$renderer3.push(`<button class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider mb-4 pb-2 border-b-3 border-primary text-primary w-full text-left hover:opacity-80 transition-opacity focus-visible:outline-2 focus-visible:outline-primary">Cascade Impact <span class="text-[10px] font-mono opacity-60">(i)</span></button> <div class="grid gap-4 sm:grid-cols-3"><!--[-->`);
            const each_array_10 = ensure_array_like([
              [
                "Assumptions",
                cascade().outOfScopeAssumptions.size,
                "out of scope",
                "Assumptions linked only to excluded components."
              ],
              [
                "Risks",
                cascade().outOfScopeRisks.size,
                "out of scope",
                "Risks linked only to excluded components."
              ],
              [
                "AI Tools",
                cascade().inactiveAiTools.size,
                "inactive",
                "AI tools that only apply to excluded components."
              ]
            ]);
            for (let $$index_10 = 0, $$length = each_array_10.length; $$index_10 < $$length; $$index_10++) {
              let [label, count, suffix, tip] = each_array_10[$$index_10];
              $$renderer3.push(`<div>`);
              Tooltip($$renderer3, {
                text: String(tip),
                position: "bottom",
                children: ($$renderer4) => {
                  $$renderer4.push(`<span class="text-xs font-extrabold uppercase tracking-wider text-text-muted cursor-help">${escape_html(label)}</span>`);
                }
              });
              $$renderer3.push(`<!----> <p class="text-lg font-extrabold font-mono">${escape_html(count)} <span class="text-sm text-text-muted font-normal">${escape_html(suffix)}</span></p></div>`);
            }
            $$renderer3.push(`<!--]--></div> `);
            if (cascade().outOfScopeAssumptions.size > 0) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<details class="mt-4"><summary class="text-xs font-extrabold uppercase tracking-wider text-text-muted cursor-pointer hover:text-text">Out-of-scope assumptions (${escape_html(cascade().outOfScopeAssumptions.size)})</summary> <ul class="mt-2 space-y-1"><!--[-->`);
              const each_array_11 = ensure_array_like(assumptions().filter((a) => cascade().outOfScopeAssumptions.has(a.id)));
              for (let $$index_11 = 0, $$length = each_array_11.length; $$index_11 < $$length; $$index_11++) {
                let a = each_array_11[$$index_11];
                $$renderer3.push(`<li class="text-xs font-mono text-text-muted px-2 py-1 bg-surface-raised"><span class="font-bold text-text">${escape_html(a.id)}</span> — ${escape_html(a.assumed_value || a.basis || "No description")}</li>`);
              }
              $$renderer3.push(`<!--]--></ul></details>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--> `);
            if (cascade().outOfScopeRisks.size > 0) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<details class="mt-3"><summary class="text-xs font-extrabold uppercase tracking-wider text-text-muted cursor-pointer hover:text-text">Out-of-scope risks (${escape_html(cascade().outOfScopeRisks.size)})</summary> <ul class="mt-2 space-y-1"><!--[-->`);
              const each_array_12 = ensure_array_like(risks().filter((r) => cascade().outOfScopeRisks.has(r.id)));
              for (let $$index_12 = 0, $$length = each_array_12.length; $$index_12 < $$length; $$index_12++) {
                let r = each_array_12[$$index_12];
                $$renderer3.push(`<li class="text-xs font-mono text-text-muted px-2 py-1 bg-surface-raised"><span class="font-bold text-text">${escape_html(r.id)}</span> — ${escape_html(r.description || "No description")}</li>`);
              }
              $$renderer3.push(`<!--]--></ul></details>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]-->`);
          }
        });
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (canFinalize() && estimate()) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div id="finalize-cta" class="border-3 border-[#000] bg-surface shadow-[4px_4px_0_#000]"><div class="bg-[#1a1a1a] px-5 py-3 flex items-center gap-3"><div class="flex items-center justify-center w-8 h-8 bg-primary border-2 border-white/20 shadow-[2px_2px_0_rgba(0,0,0,0.3)]"><svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10l4 4 8-8" stroke="white" stroke-width="3" stroke-linecap="square" stroke-linejoin="miter"></path></svg></div> <h2 class="text-sm font-extrabold uppercase tracking-wider text-white">Complete Assessment</h2></div> <div class="px-5 py-5 space-y-4"><p class="text-sm text-text-secondary leading-relaxed max-w-2xl">When you're satisfied with the scope, role assignments, and hour adjustments above, mark this assessment as complete. This locks in your current configuration as the final assessment snapshot.</p> <div class="flex items-start gap-2 px-3 py-2.5 bg-surface-raised border-2 border-border-light"><span class="text-text-muted text-xs mt-0.5 shrink-0">*</span> <p class="text-xs text-text-muted leading-relaxed">Deliverables such as migration plans, risk registers, and runbooks can be generated afterward using the <code class="font-mono bg-bg px-1.5 py-0.5 text-[10px] border border-border-light">/migrate plan</code> skill
						in the planning tool.</p></div> <div class="flex items-center gap-4 flex-wrap text-xs"><span class="font-mono font-bold">${escape_html(inScopeCount())} <span class="text-text-muted font-normal">components</span></span> <span class="w-px h-4 bg-border-light" aria-hidden="true"></span> <span class="font-mono font-bold">${escape_html(Math.round(activeTotal()).toLocaleString())}h <span class="text-text-muted font-normal">estimated</span></span> <span class="w-px h-4 bg-border-light" aria-hidden="true"></span> <span${attr_class(`font-mono font-bold ${stringify((estimate().confidence_score ?? 0) >= 70 ? "text-success" : (estimate().confidence_score ?? 0) >= 40 ? "text-warning-dark" : "text-danger")}`)}>${escape_html(estimate().confidence_score ?? 0)}% <span class="text-text-muted font-normal">confidence</span></span> `);
        if (excludedSet().size > 0) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<span class="w-px h-4 bg-border-light" aria-hidden="true"></span> <span class="font-mono font-bold text-text-muted">${escape_html(excludedSet().size)} <span class="font-normal">excluded</span></span>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></div> <div class="flex items-center justify-end pt-1"><button class="px-5 py-2 text-xs font-extrabold uppercase tracking-wider bg-primary text-white border-2 border-brutal shadow-[3px_3px_0_#000] hover:bg-primary-hover hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#000] active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_#000] transition-all duration-100 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"${attr("disabled", assessment().status === "complete", true)}>`);
        if (assessment().status === "complete") {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`Assessment Complete`);
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`Mark Assessment Complete`);
        }
        $$renderer2.push(`<!--]--></button></div></div></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      let footer = function($$renderer3) {
        {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<div class="flex items-center justify-end gap-3"><button class="px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider brutal-border-thin bg-surface text-text-muted hover:bg-surface-raised transition-colors focus-visible:outline-2 focus-visible:outline-primary"${attr("disabled", finalizing, true)}>Cancel</button> <button class="px-5 py-1.5 text-xs font-extrabold uppercase tracking-wider bg-primary text-white border-2 border-brutal shadow-[2px_2px_0_#000] hover:bg-primary-hover hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_#000] active:translate-x-px active:translate-y-px active:shadow-none transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-primary"${attr("disabled", finalizing, true)}>`);
          {
            $$renderer3.push("<!--[!-->");
            $$renderer3.push(`Confirm &amp; Complete`);
          }
          $$renderer3.push(`<!--]--></button></div>`);
        }
        $$renderer3.push(`<!--]-->`);
      };
      Modal($$renderer2, {
        open: finalizeModalOpen,
        onclose: () => {
          finalizeModalOpen = false;
        },
        title: "Complete Assessment",
        footer,
        children: ($$renderer3) => {
          {
            $$renderer3.push("<!--[!-->");
            $$renderer3.push(`<div class="space-y-5 text-sm"><p class="text-text-secondary">This will mark the assessment as <strong>complete</strong>, locking in your current scope, role assignments, and hour adjustments as the final snapshot.</p> <div class="grid grid-cols-3 gap-2"><!--[-->`);
            const each_array_13 = ensure_array_like([
              [String(inScopeCount()), "In-scope components"],
              [`${Math.round(activeTotal())}h`, "Total hours"],
              [`${estimate()?.confidence_score ?? 0}%`, "Confidence"]
            ]);
            for (let $$index_13 = 0, $$length = each_array_13.length; $$index_13 < $$length; $$index_13++) {
              let [val, lbl] = each_array_13[$$index_13];
              $$renderer3.push(`<div class="border-2 border-[#000] p-3 text-center bg-surface shadow-[2px_2px_0_#000]"><p class="text-lg font-extrabold font-mono">${escape_html(val)}</p> <p class="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">${escape_html(lbl)}</p></div>`);
            }
            $$renderer3.push(`<!--]--></div> <div class="flex items-start gap-2 px-3 py-2.5 bg-surface-raised border-2 border-border-light"><span class="text-text-muted text-xs mt-0.5 shrink-0">*</span> <p class="text-xs text-text-muted leading-relaxed">After completing, you can generate deliverables (migration plans, risk registers, runbooks) using the <code class="font-mono bg-bg px-1 py-0.5 text-[10px] border border-border-light">/migrate plan</code> skill.</p></div> <!--[-->`);
            const each_array_14 = ensure_array_like(finalizeWarnings()());
            for (let $$index_14 = 0, $$length = each_array_14.length; $$index_14 < $$length; $$index_14++) {
              let warning = each_array_14[$$index_14];
              $$renderer3.push(`<div class="flex items-start gap-2 px-3 py-2 bg-warning-light border-2 border-[#a16207] text-xs text-warning-dark"><span class="font-bold shrink-0 mt-0.5">⚠</span> <span>${escape_html(warning)}</span></div>`);
            }
            $$renderer3.push(`<!--]--> `);
            {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--></div>`);
          }
          $$renderer3.push(`<!--]-->`);
        }
      });
    }
    $$renderer2.push(`<!----> `);
    InfoDrawer($$renderer2, {
      open: drawerSection !== null,
      onclose: () => drawerSection = null,
      title: drawerSection === "page" ? "About Refine Scope" : "Cascade Impact",
      children: ($$renderer3) => {
        if (drawerSection === "page") {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<div class="space-y-4 text-sm"><p><strong>Refine Scope</strong> gives you granular control over every aspect of the migration before generating deliverables.</p> <div class="space-y-1.5"><h3 class="text-xs font-extrabold uppercase tracking-wider">Scope Control</h3> <ul class="list-disc list-inside space-y-1 text-text-secondary text-xs"><li>Toggle individual components or entire phases in/out of scope</li> <li>Add exclusion reasons — select a preset or type a custom note</li> <li>Filter to view only in-scope or excluded components</li> <li>Search by component name</li></ul></div> <div class="space-y-1.5"><h3 class="text-xs font-extrabold uppercase tracking-wider">Role Hours &amp; Tasks</h3> <ul class="list-disc list-inside space-y-1 text-text-secondary text-xs"><li>Expand any component to see its role breakdown</li> <li>Override hours per role — the delta is shown in real time</li> <li>Each role has auto-generated default tasks based on its type</li> <li>Add, edit, or remove tasks per role with keyboard support</li> <li>All changes persist to <code class="font-mono bg-surface-raised px-1">.migration/refinements.json</code></li></ul></div> <div class="space-y-1.5"><h3 class="text-xs font-extrabold uppercase tracking-wider">Completing</h3> <p class="text-text-secondary text-xs">Click <strong>Mark Assessment Complete</strong> at the bottom to finalize your scope and lock in all refinements. Deliverables can be generated afterward using the <code class="font-mono bg-surface-raised px-1">/migrate plan</code> skill.</p></div></div>`);
        } else if (drawerSection === "cascade") {
          $$renderer3.push("<!--[1-->");
          $$renderer3.push(`<div class="space-y-4 text-sm"><p>Excluding components automatically cascades related items out of scope.</p> <div class="space-y-1.5"><h3 class="text-xs font-extrabold uppercase tracking-wider">What Gets Cascaded</h3> <ul class="list-disc list-inside space-y-1 text-text-secondary text-xs"><li><strong>Assumptions</strong> — Out if all affected components are excluded. Widening hours removed.</li> <li><strong>Risks</strong> — Out if linked only to excluded components.</li> <li><strong>AI Tools</strong> — Inactive if only apply to excluded components.</li></ul></div> <p class="text-text-secondary text-xs">Re-including a component immediately restores all its associated items.</p></div>`);
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
//# sourceMappingURL=_page.svelte-CzuE1ZLG.js.map
