import { ac as ensure_array_like, a6 as attr_class, a7 as stringify, ad as attr, ab as escape_html, a1 as derived } from './index4-DG1itRH8.js';

function Toggle($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      checked = false,
      onchange,
      disabled = false,
      label,
      size = "md"
    } = $$props;
    const trackSize = derived(() => size === "sm" ? "w-8 h-4" : "w-11 h-6");
    const knobSize = derived(() => size === "sm" ? "w-3 h-3" : "w-4.5 h-4.5");
    const knobTranslate = derived(() => checked ? size === "sm" ? "translate-x-4" : "translate-x-5" : "translate-x-0.5");
    $$renderer2.push(`<button type="button" role="switch"${attr("aria-checked", checked)}${attr("aria-label", label)}${attr("disabled", disabled, true)}${attr_class(`inline-flex items-center gap-2 ${stringify(disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer")} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`)}><span${attr_class(`relative inline-flex shrink-0 ${stringify(trackSize())} items-center border-2 border-brutal transition-colors duration-150 ${stringify(checked ? "bg-primary" : "bg-border-light")}`)}><span${attr_class(`inline-block ${stringify(knobSize())} transform bg-white border border-brutal transition-transform duration-150 ${stringify(knobTranslate())}`)}></span></span> `);
    if (label) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<span class="text-sm font-bold select-none">${escape_html(label)}</span>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></button>`);
  });
}
function ScenarioSelector($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { scenario, onchange, totals } = $$props;
    const scenarios = [
      {
        id: "manual",
        label: "Manual",
        desc: "Full effort, no AI tooling",
        icon: "⛏"
      },
      {
        id: "ai_assisted",
        label: "AI-Assisted",
        desc: "Selected tools enabled",
        icon: "⚡"
      },
      {
        id: "best_case",
        label: "Best Case",
        desc: "All AI tools, optimistic estimates",
        icon: "🎯"
      }
    ];
    function hoursFor(id) {
      if (!totals) return null;
      if (id === "manual") return totals.manual;
      if (id === "ai_assisted") return totals.aiAssisted;
      return totals.bestCase;
    }
    function savingsFor(id) {
      if (!totals || id === "manual" || totals.manual === 0) return null;
      const hours = totals.manual - (hoursFor(id) ?? 0);
      if (hours <= 0) return null;
      return { hours, percent: Math.round(hours / totals.manual * 100) };
    }
    $$renderer2.push(`<div role="radiogroup" aria-label="Estimation scenario" class="grid grid-cols-3 gap-3"><!--[-->`);
    const each_array = ensure_array_like(scenarios);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let s = each_array[$$index];
      const active = scenario === s.id;
      const hours = hoursFor(s.id);
      const saved = savingsFor(s.id);
      $$renderer2.push(`<button${attr_class(`relative text-left px-4 py-3.5 border-3 transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${stringify(active ? "border-primary bg-primary text-white shadow-[4px_4px_0_theme(colors.primary/0.4)]" : "border-brutal bg-surface hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_#000] active:translate-x-0 active:translate-y-0 active:shadow-none")}`)} role="radio"${attr("aria-checked", active)}><div class="flex items-center justify-between mb-2"><div class="flex items-center gap-1.5"><span class="text-sm" aria-hidden="true">${escape_html(s.icon)}</span> <span class="text-xs font-extrabold uppercase tracking-wider">${escape_html(s.label)}</span></div> `);
      if (active) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<span class="w-4 h-4 flex items-center justify-center border-2 border-white/50 bg-white/20 text-[10px] leading-none" aria-hidden="true">✓</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div> `);
      if (hours !== null) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<span class="block text-2xl font-extrabold font-mono tracking-tight leading-none">${escape_html(Math.round(hours).toLocaleString())}h</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> <div class="mt-1.5 h-4">`);
      if (saved) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<span${attr_class(`text-xs font-bold font-mono ${stringify(active ? "text-white/70" : "text-success")}`)}>-${escape_html(Math.round(saved.hours).toLocaleString())}h (${escape_html(saved.percent)}%)</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div> <span${attr_class(`block text-[10px] mt-1 ${stringify(active ? "text-white/60" : "text-text-muted")}`)}>${escape_html(s.desc)}</span></button>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}

export { ScenarioSelector as S, Toggle as T };
//# sourceMappingURL=ScenarioSelector-BS91ifSW.js.map
