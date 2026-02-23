import { aa as head, a1 as derived, ad as attr, ab as escape_html, ac as ensure_array_like, a7 as stringify, ae as attr_style, a6 as attr_class } from './index4-DG1itRH8.js';
import { p as page } from './index3-fupcZyp6.js';
import { C as Card } from './Card-w7RlWvYA.js';
import { B as Badge } from './Badge-CWejdkwM.js';
import { T as Tabs } from './Tabs-CIZXvs-S.js';
import { C as CollapsibleSection } from './CollapsibleSection-DwE4ccwC.js';
import { S as ScenarioSelector, T as Toggle } from './ScenarioSelector-BS91ifSW.js';
import { T as Tooltip } from './Tooltip-hZ63yG7F.js';
import { I as InfoDrawer } from './InfoDrawer-WPURexns.js';
import './client-Cm3t_ao5.js';
import { d as formatRole } from './migration-stats-BAGrJ4E5.js';
import { a as computeScenarioTotals, g as getPhaseHours, b as getToolAdoptionOverhead, d as getComponentHours } from './scenario-engine-BY9xcCE7.js';
import './index-server-CVwIEJCx.js';
import './state.svelte-DeAIIc79.js';
import './root-DQzxKDPP.js';
import './index-mV5xf0Xo.js';

function AiToolToggles($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { tools, toggles, ontoggle, mode = "compact", initialLimit = 6 } = $$props;
    const rankedTools = derived(() => [...tools].sort((a, b) => (b.hours_saved?.expected ?? 0) - (a.hours_saved?.expected ?? 0)));
    const displayedTools = derived(() => mode === "compact" && true ? rankedTools().slice(0, initialLimit) : rankedTools());
    const categories = derived(() => [...new Set(rankedTools().map((t) => t.category))]);
    function getCategoryTools(category) {
      return rankedTools().filter((t) => t.category === category);
    }
    function getCategoryTotalSavings(category) {
      return getCategoryTools(category).reduce((s, t) => s + (t.hours_saved?.expected ?? 0), 0);
    }
    const rankMap = derived(() => () => {
      const map = /* @__PURE__ */ new Map();
      rankedTools().forEach((t, i) => map.set(t.id, i + 1));
      return map;
    });
    if (mode === "compact") {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-2">Ranked by estimated hours saved</p> <div class="space-y-2"><!--[-->`);
      const each_array = ensure_array_like(displayedTools());
      for (let i = 0, $$length = each_array.length; i < $$length; i++) {
        let tool = each_array[i];
        const isOn = toggles[tool.id] !== false;
        const rank = rankMap()().get(tool.id) ?? i + 1;
        $$renderer2.push(`<div class="flex items-center justify-between gap-2"><div class="flex items-center gap-2 flex-1 min-w-0">`);
        Tooltip($$renderer2, {
          text: rank <= 3 ? "Top 3 by hours saved" : `Ranked #${rank} of ${rankedTools().length} by hours saved`,
          children: ($$renderer3) => {
            $$renderer3.push(`<span${attr_class(`w-5 text-center text-[10px] font-extrabold font-mono ${stringify(rank <= 3 ? "text-success" : "text-text-muted")}`)}>#${escape_html(rank)}</span>`);
          }
        });
        $$renderer2.push(`<!----> <span${attr_class(`text-sm font-bold ${stringify(isOn ? "" : "text-text-muted")} truncate`)}>${escape_html(tool.name)}</span> <span class="text-xs text-success font-mono font-bold shrink-0">-${escape_html(tool.hours_saved?.expected ?? 0)}h</span></div> `);
        Toggle($$renderer2, {
          checked: isOn,
          onchange: (v) => ontoggle(tool.id, v),
          size: "sm"
        });
        $$renderer2.push(`<!----></div>`);
      }
      $$renderer2.push(`<!--]--> `);
      if (tools.length > initialLimit) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<button class="w-full text-center text-xs font-bold text-primary hover:text-primary-hover pt-1">${escape_html(`Show all ${tools.length} tools`)}</button>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<p class="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-3">Ranked by estimated hours saved</p> <div class="space-y-4"><!--[-->`);
      const each_array_1 = ensure_array_like(categories());
      for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
        let category = each_array_1[$$index_2];
        const categoryTools = getCategoryTools(category);
        const catSavings = getCategoryTotalSavings(category);
        CollapsibleSection($$renderer2, {
          title: category.replace(/_/g, " "),
          subtitle: `-${stringify(Math.round(catSavings))}h`,
          open: true,
          badge: `${stringify(categoryTools.filter((t) => toggles[t.id] !== false).length)}/${stringify(categoryTools.length)} on`,
          badgeVariant: categoryTools.every((t) => toggles[t.id] !== false) ? "success" : "warning",
          children: ($$renderer3) => {
            $$renderer3.push(`<div class="space-y-3"><!--[-->`);
            const each_array_2 = ensure_array_like(categoryTools);
            for (let $$index_1 = 0, $$length2 = each_array_2.length; $$index_1 < $$length2; $$index_1++) {
              let tool = each_array_2[$$index_1];
              const isOn = toggles[tool.id] !== false;
              const rank = rankMap()().get(tool.id) ?? 0;
              $$renderer3.push(`<div${attr_class(`border-2 ${stringify(rank <= 3 ? "border-success" : "border-border-light")} ${stringify(isOn ? "bg-surface" : "bg-bg opacity-70")} transition-all duration-150`)}><div class="flex items-center gap-3 px-4 py-3"><div class="flex flex-col items-center shrink-0 w-8">`);
              Tooltip($$renderer3, {
                text: rank <= 3 ? "Top 3 by hours saved" : `Ranked #${rank} of ${rankedTools().length} by hours saved`,
                position: "right",
                children: ($$renderer4) => {
                  $$renderer4.push(`<span${attr_class(`text-xs font-extrabold font-mono ${stringify(rank <= 3 ? "text-success" : "text-text-muted")}`)}>#${escape_html(rank)}</span>`);
                }
              });
              $$renderer3.push(`<!----></div> `);
              Toggle($$renderer3, { checked: isOn, onchange: (v) => ontoggle(tool.id, v) });
              $$renderer3.push(`<!----> <div class="flex-1 min-w-0"><div class="flex items-center gap-2"><span class="text-sm font-bold">${escape_html(tool.name)}</span> <span class="text-xs text-text-muted font-mono">${escape_html(tool.vendor)}</span> `);
              if (rank === 1) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<span class="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-success-light text-success border border-success">Top Pick</span>`);
              } else if (tool.recommendation === "recommended") {
                $$renderer3.push("<!--[1-->");
                $$renderer3.push(`<span class="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-success-light text-success border border-success">Recommended</span>`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--></div> <p class="text-xs text-text-secondary mt-0.5 truncate">${escape_html(tool.description)}</p></div> <div class="text-right shrink-0"><span class="text-sm font-mono font-bold text-success">-${escape_html(tool.hours_saved?.expected ?? 0)}h</span> <span class="block text-[10px] text-text-muted font-mono">${escape_html(tool.hours_saved?.optimistic ?? 0)}-${escape_html(tool.hours_saved?.pessimistic ?? 0)}h range</span></div></div></div>`);
            }
            $$renderer3.push(`<!--]--></div>`);
          }
        });
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function DeltaBadge($$renderer, $$props) {
  let { delta, format = "hours", invertColor = true } = $$props;
  const sign = derived(() => delta > 0 ? "+" : "");
  const rounded = derived(() => Math.round(delta * 10) / 10);
  const suffix = derived(() => format === "hours" ? "h" : format === "percent" ? "%" : "");
  const colorClass = derived(() => () => {
    if (delta === 0) return "bg-border-light text-text-muted border-border-light";
    const isPositive = delta > 0;
    const isGood = invertColor ? !isPositive : isPositive;
    return isGood ? "bg-success-light text-success border-success" : "bg-danger-light text-danger border-danger";
  });
  if (delta !== 0) {
    $$renderer.push("<!--[-->");
    $$renderer.push(`<span${attr_class(`inline-flex items-center px-1.5 py-0.5 text-xs font-bold font-mono border ${stringify(colorClass()())}`)}>${escape_html(sign())}${escape_html(rounded())}${escape_html(suffix())}</span>`);
  } else {
    $$renderer.push("<!--[!-->");
  }
  $$renderer.push(`<!--]-->`);
}
function VersionSwitcher($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { versions, currentVersion } = $$props;
    let open = false;
    function formatDate(iso) {
      const d = new Date(iso);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    }
    $$renderer2.push(`<div class="relative" data-version-switcher=""><button class="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-2 border-primary bg-primary-light text-primary hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_theme(colors.primary)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"${attr("aria-expanded", open)} aria-haspopup="true"><span class="font-mono font-extrabold">v${escape_html(currentVersion)}</span> `);
    if (versions.length > 0) {
      $$renderer2.push("<!--[-->");
      const current = versions.find((v) => v.version === currentVersion);
      if (current) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<span class="text-primary/60 font-normal">${escape_html(formatDate(current.created_at))}</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <span class="ml-0.5 text-[10px] text-primary/50" aria-hidden="true">${escape_html("▼")}</span></button> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function VersionComparisonBanner($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { fromVersion, toVersion } = $$props;
    const exitUrl = derived(() => () => {
      const base = `/assessments/${page.params.id}/estimate`;
      const params = new URLSearchParams();
      params.set("v", String(toVersion));
      const tab = page.url.searchParams.get("tab");
      if (tab) params.set("tab", tab);
      return `${base}?${params.toString()}`;
    });
    $$renderer2.push(`<div class="brutal-border bg-primary-light border-primary flex items-center justify-between px-4 py-2.5"><div class="flex items-center gap-2"><span class="text-xs font-extrabold uppercase tracking-wider text-primary">Comparing</span> <span class="font-mono font-bold text-sm text-primary">v${escape_html(fromVersion)}</span> <span class="text-text-muted text-xs">→</span> <span class="font-mono font-bold text-sm text-primary">v${escape_html(toVersion)}</span></div> <a${attr("href", exitUrl()())} class="px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 border-brutal bg-surface text-text hover:bg-surface-hover transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-primary">Exit Compare</a></div>`);
  });
}
function direction(delta) {
  if (delta > 0) return "increased";
  if (delta < 0) return "decreased";
  return "unchanged";
}
function numericDelta(from, to) {
  const delta = to - from;
  const deltaPercent = from !== 0 ? delta / Math.abs(from) * 100 : to !== 0 ? 100 : 0;
  return { from, to, delta, deltaPercent, direction: direction(delta) };
}
function normalizeMultiplier(mult) {
  if (typeof mult === "string") return mult;
  if (mult && typeof mult === "object") {
    const obj = mult;
    return obj.id ?? obj.name ?? JSON.stringify(mult);
  }
  return String(mult);
}
function diffSets(from, to) {
  const fromSet = new Set(from);
  const toSet = new Set(to);
  return {
    added: to.filter((x) => !fromSet.has(x)),
    removed: from.filter((x) => !toSet.has(x)),
    unchanged: from.filter((x) => toSet.has(x))
  };
}
function diffRoles(fromRoles, toRoles) {
  const allKeys = /* @__PURE__ */ new Set([...Object.keys(fromRoles), ...Object.keys(toRoles)]);
  const result = {};
  for (const key of allKeys) {
    result[key] = numericDelta(fromRoles[key] ?? 0, toRoles[key] ?? 0);
  }
  return result;
}
function diffThreePoint(from, to) {
  if (!from && !to) return void 0;
  const f = from ?? {};
  const t = to ?? {};
  return {
    optimistic: numericDelta(f.optimistic ?? 0, t.optimistic ?? 0),
    expected: numericDelta(f.expected ?? 0, t.expected ?? 0),
    pessimistic: numericDelta(f.pessimistic ?? 0, t.pessimistic ?? 0)
  };
}
function diffComponent(from, to) {
  const f = from ?? {};
  const t = to ?? {};
  const fromMults = (f.multipliers_applied ?? []).map(normalizeMultiplier);
  const toMults = (t.multipliers_applied ?? []).map(normalizeMultiplier);
  const fromAssumptions = f.assumptions_affecting ?? [];
  const toAssumptions = t.assumptions_affecting ?? [];
  const fromRoles = f.by_role ?? {};
  const toRoles = t.by_role ?? {};
  const fromHours = f.hours ?? {};
  const toHours = t.hours ?? {};
  let status;
  if (!from) status = "added";
  else if (!to) status = "removed";
  else {
    const base = numericDelta(f.base_hours ?? 0, t.base_hours ?? 0);
    const final = numericDelta(f.final_hours ?? 0, t.final_hours ?? 0);
    const gotcha = numericDelta(f.gotcha_hours ?? 0, t.gotcha_hours ?? 0);
    const multDiff = diffSets(fromMults, toMults);
    const assumpDiff = diffSets(fromAssumptions, toAssumptions);
    const hasChanges = base.delta !== 0 || final.delta !== 0 || gotcha.delta !== 0 || multDiff.added.length > 0 || multDiff.removed.length > 0 || assumpDiff.added.length > 0 || assumpDiff.removed.length > 0;
    status = hasChanges ? "modified" : "unchanged";
  }
  return {
    id: t.id ?? f.id ?? "",
    name: t.name ?? f.name ?? "",
    status,
    base_hours: numericDelta(f.base_hours ?? 0, t.base_hours ?? 0),
    final_hours: numericDelta(f.final_hours ?? 0, t.final_hours ?? 0),
    gotcha_hours: numericDelta(f.gotcha_hours ?? 0, t.gotcha_hours ?? 0),
    firm_hours: numericDelta(f.firm_hours ?? 0, t.firm_hours ?? 0),
    assumption_dependent_hours: numericDelta(
      f.assumption_dependent_hours ?? 0,
      t.assumption_dependent_hours ?? 0
    ),
    units: numericDelta(f.units ?? 1, t.units ?? 1),
    multipliers: diffSets(fromMults, toMults),
    assumptions: diffSets(fromAssumptions, toAssumptions),
    roles: diffRoles(fromRoles, toRoles),
    hours: {
      without_ai: diffThreePoint(fromHours.without_ai, toHours.without_ai),
      with_ai: diffThreePoint(fromHours.with_ai, toHours.with_ai)
    }
  };
}
function diffPhase(fromPhase, toPhase) {
  const f = fromPhase ?? {};
  const t = toPhase ?? {};
  const fromComps = f.components ?? [];
  const toComps = t.components ?? [];
  const fromMap = new Map(fromComps.map((c) => [c.id, c]));
  const toMap = new Map(toComps.map((c) => [c.id, c]));
  const allIds = /* @__PURE__ */ new Set([...fromMap.keys(), ...toMap.keys()]);
  const components = [];
  for (const id of allIds) {
    components.push(diffComponent(fromMap.get(id) ?? null, toMap.get(id) ?? null));
  }
  const fromTotal = fromComps.reduce((s, c) => s + (c.final_hours ?? 0), 0);
  const toTotal = toComps.reduce((s, c) => s + (c.final_hours ?? 0), 0);
  let status;
  if (!fromPhase) status = "added";
  else if (!toPhase) status = "removed";
  else {
    const hasChanges = components.some((c) => c.status !== "unchanged");
    status = hasChanges ? "modified" : "unchanged";
  }
  return {
    id: t.id ?? f.id ?? "",
    name: t.name ?? f.name ?? "",
    status,
    total_hours: numericDelta(fromTotal, toTotal),
    components
  };
}
function computeEstimateComparison(from, to) {
  const fromPhases = from.phases ?? [];
  const toPhases = to.phases ?? [];
  const fromPhaseMap = new Map(fromPhases.map((p) => [p.id, p]));
  const toPhaseMap = new Map(toPhases.map((p) => [p.id, p]));
  const orderedIds = [];
  const seen = /* @__PURE__ */ new Set();
  for (const p of toPhases) {
    orderedIds.push(p.id);
    seen.add(p.id);
  }
  for (const p of fromPhases) {
    if (!seen.has(p.id)) {
      orderedIds.push(p.id);
    }
  }
  const phases = orderedIds.map(
    (id) => diffPhase(fromPhaseMap.get(id) ?? null, toPhaseMap.get(id) ?? null)
  );
  const fromRoles = {};
  const toRoles = {};
  for (const p of fromPhases) {
    for (const c of p.components ?? []) {
      const byRole = c.by_role ?? {};
      for (const [role, hours] of Object.entries(byRole)) {
        fromRoles[role] = (fromRoles[role] ?? 0) + hours;
      }
    }
  }
  for (const p of toPhases) {
    for (const c of p.components ?? []) {
      const byRole = c.by_role ?? {};
      for (const [role, hours] of Object.entries(byRole)) {
        toRoles[role] = (toRoles[role] ?? 0) + hours;
      }
    }
  }
  const roleDiffs = diffRoles(fromRoles, toRoles);
  const roles = Object.entries(roleDiffs).map(([role, delta]) => ({ role, delta })).sort((a, b) => Math.abs(b.delta.delta) - Math.abs(a.delta.delta));
  return {
    from_version: from.version ?? 0,
    to_version: to.version ?? 0,
    summary: {
      total_expected_hours: numericDelta(
        from.total_expected_hours ?? 0,
        to.total_expected_hours ?? 0
      ),
      total_base_hours: numericDelta(
        from.total_base_hours ?? 0,
        to.total_base_hours ?? 0
      ),
      total_gotcha_hours: numericDelta(
        from.total_gotcha_hours ?? 0,
        to.total_gotcha_hours ?? 0
      ),
      assumption_widening_hours: numericDelta(
        from.assumption_widening_hours ?? 0,
        to.assumption_widening_hours ?? 0
      ),
      confidence_score: numericDelta(
        from.confidence_score ?? 0,
        to.confidence_score ?? 0
      )
    },
    phases,
    roles
  };
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    const estimate = derived(() => data.estimate);
    const phases = derived(() => estimate()?.phases ?? []);
    const assumptions = derived(() => data.analysis?.assumptions ?? []);
    const estimateVersions = derived(() => data.estimateVersions ?? []);
    const statusBadge = derived(() => estimate() ? { variant: "success", label: "Estimated" } : { variant: "muted", label: "No Estimate" });
    const compareEstimate = derived(() => data.compareEstimate);
    const isCompareMode = derived(() => !!compareEstimate());
    const comparison = derived(() => isCompareMode() && compareEstimate() && estimate() ? computeEstimateComparison(compareEstimate(), estimate()) : null);
    let aiToggles = {};
    const aiTools = derived(() => data.aiAlternatives ?? []);
    const profData = derived(() => data.proficiencyData);
    let scenario = "ai_assisted";
    let expandedComponents = {};
    let drawerSection = null;
    let activeTab = "phases";
    const tabs = derived(() => [
      { id: "phases", label: "Phases" },
      { id: "ai-tools", label: "AI Tools", count: aiTools().length },
      { id: "roles", label: "By Role" }
    ]);
    const scenarioTotals = derived(() => computeScenarioTotals(phases(), aiToggles, profData()));
    const totalHours = derived(() => scenario === "manual" ? scenarioTotals().manual : scenario === "best_case" ? scenarioTotals().bestCase : scenarioTotals().aiAssisted);
    const savings = derived(() => scenarioTotals().manual - totalHours());
    const savingsPercent = derived(() => scenarioTotals().manual > 0 ? Math.round(savings() / scenarioTotals().manual * 100) : 0);
    const roleBreakdown = derived(() => () => {
      const roles = {};
      for (const phase of phases()) {
        for (const comp of phase.components ?? []) {
          const byRole = comp.by_role;
          if (byRole) {
            for (const [role, hours] of Object.entries(byRole)) {
              roles[role] = (roles[role] ?? 0) + hours;
            }
          }
        }
      }
      return roles;
    });
    async function toggleAiTool(toolId, enabled) {
      aiToggles[toolId] = enabled;
      aiToggles = { ...aiToggles };
      await fetch(`/api/assessments/${page.params.id}/ai-selections`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selections: aiToggles })
      });
    }
    function getToolsForComponent(comp) {
      return aiTools().filter((t) => t.applicable_components?.includes(comp.id));
    }
    function getRoleDescription(role, compId, compName) {
      const ctx = (compId + " " + compName).toLowerCase();
      const isDb = /database|db|sql|mysql|postgres|mssql/.test(ctx);
      const isCompute = /compute|vm|server|ec2|container|app.?service/.test(ctx);
      const isNetworking = /network|dns|ssl|tls|cdn|load.?balanc|firewall/.test(ctx);
      const isCicd = /ci.?cd|pipeline|deploy|build|release/.test(ctx);
      const isMonitoring = /monitor|log|alert|observ|telemetry/.test(ctx);
      const isStorage = /storage|blob|s3|file.?share/.test(ctx);
      const isSearch = /search|solr|elastic/.test(ctx);
      const isIdentity = /identity|auth|sso|oauth|oidc/.test(ctx);
      const isCaching = /cach|redis|session/.test(ctx);
      const isXconnect = /xconnect|xdb|analytic|tracker/.test(ctx);
      const r = role.toLowerCase().replace(/-/g, "_");
      if (r.includes("infrastructure") || r === "infra_eng") {
        if (isDb) return "Provision the target database service, configure networking and security groups, set up backup and high-availability policies.";
        if (isCompute) return "Size and provision target compute resources, configure auto-scaling groups, set up load balancers and health checks.";
        if (isNetworking) return "Configure DNS records, SSL/TLS certificates, firewall rules, and network peering between source and target environments.";
        if (isCicd) return "Set up build agents and runners, configure deployment pipeline infrastructure, manage secrets and environment variable injection.";
        if (isMonitoring) return "Deploy monitoring agents and collectors, configure dashboards, set up alerting rules and on-call escalation paths.";
        if (isStorage) return "Provision storage accounts, configure replication and geo-redundancy, define access policies and lifecycle management rules.";
        if (isSearch) return "Provision and configure search cluster, set up node roles and replication, tune JVM heap and memory settings.";
        if (isCaching) return "Provision cache cluster, configure eviction policies and persistence mode, set up connection pooling and failover.";
        return "Provision required infrastructure resources, configure networking and security boundaries, validate service connectivity.";
      }
      if (r === "dba" || r.includes("database")) {
        if (isDb) return "Assess schema compatibility, execute data migration scripts, validate row counts and referential integrity, tune query performance on target.";
        if (isXconnect) return "Migrate xDB collections, validate analytics records completeness, assess and convert any custom schema extensions.";
        return "Assess data dependencies, support schema conversion, validate data integrity and query correctness post-migration.";
      }
      if (r.includes("sitecore") || r.includes("developer") || r.includes("dev")) {
        if (isIdentity) return "Reconfigure Sitecore Identity Server, update SSO provider settings, validate token issuance and role claim mapping.";
        if (isXconnect) return "Update xConnect connection strings and certificates, validate tracker and collection service configuration, test analytics pipeline end-to-end.";
        if (isSearch) return "Reconfigure Sitecore search providers for target environment, rebuild indexes, validate content search queries and results.";
        if (isCaching) return "Update cache provider connection strings and session state configuration, validate caching behaviour under load.";
        if (isCicd) return "Update deployment scripts and environment transforms for target, configure publish targets, validate end-to-end release pipeline.";
        if (isDb) return "Update connection strings and ORM configuration, validate data access layer against migrated schema, fix any compatibility issues.";
        return "Update application configuration for the target environment, validate Sitecore functionality, resolve any custom code compatibility issues.";
      }
      if (r.includes("qa") || r.includes("test")) {
        if (isDb) return "Validate data completeness and integrity via regression queries, verify application behaviour against migrated data set.";
        if (isNetworking) return "Validate SSL certificate chain and expiry, confirm DNS propagation, run end-to-end connectivity and redirect tests.";
        if (isMonitoring) return "Verify alert firing and routing, confirm dashboards reflect accurate metrics, execute synthetic monitoring tests.";
        if (isCicd) return "Validate pipeline stages and approval gates, run integration tests in the new environment, document pass/fail criteria.";
        return "Execute smoke tests and regression suite, validate functional requirements against acceptance criteria, document sign-off status.";
      }
      if (r.includes("project") || r === "pm" || r.includes("manager")) {
        return "Coordinate cross-team dependencies and sequencing, track progress against milestones, communicate status to stakeholders, update the risk log.";
      }
      return "Execute assigned tasks, collaborate with other roles on blockers, and validate completion against acceptance criteria.";
    }
    function statusBadgeClass(status) {
      if (status === "added") return "bg-success-light text-success border-success";
      if (status === "removed") return "bg-danger-light text-danger border-danger";
      if (status === "modified") return "bg-warning-light text-warning border-warning";
      return "bg-border-light text-text-muted border-border-light";
    }
    head("e9m9ot", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html(data.assessment.project_name)} — Estimate</title>`);
      });
    });
    $$renderer2.push(`<div class="p-6 space-y-6 animate-enter"><div class="flex items-center justify-between"><div><div class="flex items-center gap-2"><h1 class="text-xl font-extrabold uppercase tracking-wider">Estimate</h1> `);
    Badge($$renderer2, {
      variant: statusBadge().variant,
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->${escape_html(statusBadge().label)}`);
      }
    });
    $$renderer2.push(`<!----> <button class="flex items-center justify-center w-5 h-5 text-text-muted hover:text-primary transition-colors" aria-label="About this page"><span class="text-[10px] font-mono opacity-60">(i)</span></button></div> <p class="text-sm font-bold text-text-secondary mt-0.5">Phase and component breakdown</p></div> `);
    if (estimate() && estimateVersions().length > 0) {
      $$renderer2.push("<!--[-->");
      VersionSwitcher($$renderer2, {
        versions: estimateVersions(),
        currentVersion: estimate().version
      });
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    if (isCompareMode() && comparison()) {
      $$renderer2.push("<!--[-->");
      VersionComparisonBanner($$renderer2, {
        fromVersion: comparison().from_version,
        toVersion: comparison().to_version
      });
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (!estimate()) {
      $$renderer2.push("<!--[-->");
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="py-8 text-center"><p class="text-lg font-extrabold uppercase tracking-wider text-text-secondary">No Estimate Data</p> <p class="mt-2 text-sm text-text-muted max-w-md mx-auto">Run <code class="brutal-border-thin bg-surface px-1.5 py-0.5 text-xs font-mono">/migrate estimate</code> to generate.</p></div>`);
        }
      });
    } else if (isCompareMode() && comparison()) {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">`);
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="space-y-1"><span class="text-[10px] font-extrabold uppercase tracking-wider text-text-muted block">Total Hours</span> <div class="flex items-center gap-2"><span class="text-lg font-extrabold font-mono">${escape_html(Math.round(comparison().summary.total_expected_hours.to))}h</span> `);
          DeltaBadge($$renderer3, {
            delta: comparison().summary.total_expected_hours.delta,
            format: "hours"
          });
          $$renderer3.push(`<!----></div> <span class="text-[10px] text-text-muted font-mono">from ${escape_html(Math.round(comparison().summary.total_expected_hours.from))}h</span></div>`);
        }
      });
      $$renderer2.push(`<!----> `);
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="space-y-1"><span class="text-[10px] font-extrabold uppercase tracking-wider text-text-muted block">Gotcha Hours</span> <div class="flex items-center gap-2"><span class="text-lg font-extrabold font-mono">${escape_html(Math.round(comparison().summary.total_gotcha_hours.to))}h</span> `);
          DeltaBadge($$renderer3, {
            delta: comparison().summary.total_gotcha_hours.delta,
            format: "hours"
          });
          $$renderer3.push(`<!----></div> <span class="text-[10px] text-text-muted font-mono">from ${escape_html(Math.round(comparison().summary.total_gotcha_hours.from))}h</span></div>`);
        }
      });
      $$renderer2.push(`<!----> `);
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="space-y-1"><span class="text-[10px] font-extrabold uppercase tracking-wider text-text-muted block">Confidence</span> <div class="flex items-center gap-2"><span class="text-lg font-extrabold font-mono">${escape_html(Math.round(comparison().summary.confidence_score.to))}%</span> `);
          DeltaBadge($$renderer3, {
            delta: comparison().summary.confidence_score.delta,
            format: "percent",
            invertColor: false
          });
          $$renderer3.push(`<!----></div> <span class="text-[10px] text-text-muted font-mono">from ${escape_html(Math.round(comparison().summary.confidence_score.from))}%</span></div>`);
        }
      });
      $$renderer2.push(`<!----> `);
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="space-y-1"><span class="text-[10px] font-extrabold uppercase tracking-wider text-text-muted block">Assumption Widening</span> <div class="flex items-center gap-2"><span class="text-lg font-extrabold font-mono">${escape_html(Math.round(comparison().summary.assumption_widening_hours.to))}h</span> `);
          DeltaBadge($$renderer3, {
            delta: comparison().summary.assumption_widening_hours.delta,
            format: "hours"
          });
          $$renderer3.push(`<!----></div> <span class="text-[10px] text-text-muted font-mono">from ${escape_html(Math.round(comparison().summary.assumption_widening_hours.from))}h</span></div>`);
        }
      });
      $$renderer2.push(`<!----></div> `);
      Tabs($$renderer2, {
        tabs: tabs(),
        active: activeTab,
        onchange: (id) => activeTab = id,
        children: ($$renderer3) => {
          if (activeTab === "phases") {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="space-y-3"><!--[-->`);
            const each_array = ensure_array_like(comparison().phases);
            for (let $$index_8 = 0, $$length = each_array.length; $$index_8 < $$length; $$index_8++) {
              let phaseDiff = each_array[$$index_8];
              CollapsibleSection($$renderer3, {
                title: phaseDiff.name,
                subtitle: `${stringify(Math.round(phaseDiff.total_hours.to))}h`,
                open: true,
                badge: phaseDiff.status === "added" ? "NEW" : phaseDiff.status === "removed" ? "REMOVED" : `${phaseDiff.components.length} components`,
                badgeVariant: phaseDiff.status === "added" ? "success" : phaseDiff.status === "removed" ? "danger" : "default",
                children: ($$renderer4) => {
                  if (phaseDiff.total_hours.delta !== 0) {
                    $$renderer4.push("<!--[-->");
                    $$renderer4.push(`<div class="mb-4 flex items-center gap-2 text-xs"><span class="text-text-muted font-bold uppercase">v${escape_html(comparison().from_version)}:</span> <span class="font-mono font-bold">${escape_html(Math.round(phaseDiff.total_hours.from))}h</span> <span class="text-text-muted">→</span> <span class="font-mono font-bold">${escape_html(Math.round(phaseDiff.total_hours.to))}h</span> `);
                    DeltaBadge($$renderer4, { delta: phaseDiff.total_hours.delta, format: "hours" });
                    $$renderer4.push(`<!----></div>`);
                  } else {
                    $$renderer4.push("<!--[!-->");
                  }
                  $$renderer4.push(`<!--]--> <div class="overflow-x-auto -mx-4"><table class="w-full text-sm"><thead><tr class="bg-[#1a1a1a] text-white text-xs font-extrabold uppercase tracking-wider"><th class="text-left px-4 py-2.5">Component</th><th class="text-center px-4 py-2.5 w-24">Status</th><th class="text-right px-4 py-2.5 w-24">v${escape_html(comparison().from_version)}</th><th class="text-right px-4 py-2.5 w-24">v${escape_html(comparison().to_version)}</th><th class="text-right px-4 py-2.5 w-24">Delta</th><th class="text-center px-4 py-2.5 w-16"></th></tr></thead><tbody><!--[-->`);
                  const each_array_1 = ensure_array_like(phaseDiff.components);
                  for (let $$index_7 = 0, $$length2 = each_array_1.length; $$index_7 < $$length2; $$index_7++) {
                    let comp = each_array_1[$$index_7];
                    const expanded = expandedComponents[comp.id];
                    $$renderer4.push(`<tr${attr_class(`border-b border-border-light hover:bg-surface-hover transition-colors duration-100 cursor-pointer select-none ${stringify(expanded ? "bg-surface-hover" : "")} ${stringify(comp.status === "removed" ? "opacity-60" : "")}`)}${attr("aria-expanded", expanded)}${attr("aria-label", `Toggle details for ${stringify(comp.name)}`)}><td${attr_class(`px-4 py-2.5 font-bold ${stringify(comp.status === "removed" ? "line-through" : "")}`)}>${escape_html(comp.name)}</td><td class="px-4 py-2.5 text-center">`);
                    if (comp.status !== "unchanged") {
                      $$renderer4.push("<!--[-->");
                      $$renderer4.push(`<span${attr_class(`inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold uppercase border ${stringify(statusBadgeClass(comp.status))}`)}>${escape_html(comp.status === "added" ? "NEW" : comp.status === "removed" ? "REMOVED" : "CHANGED")}</span>`);
                    } else {
                      $$renderer4.push("<!--[!-->");
                    }
                    $$renderer4.push(`<!--]--></td><td class="px-4 py-2.5 text-right font-mono text-text-muted">${escape_html(Math.round(comp.final_hours.from))}h</td><td class="px-4 py-2.5 text-right font-mono font-bold">${escape_html(Math.round(comp.final_hours.to))}h</td><td class="px-4 py-2.5 text-right">`);
                    DeltaBadge($$renderer4, { delta: comp.final_hours.delta, format: "hours" });
                    $$renderer4.push(`<!----></td><td class="px-4 py-2.5 text-center"><span${attr_class(`inline-block text-xs text-text-muted transition-transform duration-200 ${stringify(expanded ? "rotate-90" : "")}`)} aria-hidden="true">▶</span></td></tr> `);
                    if (expanded) {
                      $$renderer4.push("<!--[-->");
                      const cd = comp;
                      $$renderer4.push(`<tr><td colspan="6" class="px-4 py-4 bg-bg border-b border-border-light"><div class="grid gap-4 sm:grid-cols-2"><div><h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-2">Hour Deltas</h4> <div class="space-y-1.5 text-xs font-mono"><div class="flex justify-between items-center"><span class="text-text-muted">Base hours</span> <div class="flex items-center gap-2"><span>${escape_html(Math.round(cd.base_hours.from))} → ${escape_html(Math.round(cd.base_hours.to))}</span> `);
                      DeltaBadge($$renderer4, { delta: cd.base_hours.delta, format: "hours" });
                      $$renderer4.push(`<!----></div></div> <div class="flex justify-between items-center"><span class="text-text-muted">Final hours</span> <div class="flex items-center gap-2"><span>${escape_html(Math.round(cd.final_hours.from))} → ${escape_html(Math.round(cd.final_hours.to))}</span> `);
                      DeltaBadge($$renderer4, { delta: cd.final_hours.delta, format: "hours" });
                      $$renderer4.push(`<!----></div></div> `);
                      if (cd.gotcha_hours.from > 0 || cd.gotcha_hours.to > 0) {
                        $$renderer4.push("<!--[-->");
                        $$renderer4.push(`<div class="flex justify-between items-center text-warning"><span>Gotcha hours</span> <div class="flex items-center gap-2"><span>${escape_html(Math.round(cd.gotcha_hours.from))} → ${escape_html(Math.round(cd.gotcha_hours.to))}</span> `);
                        DeltaBadge($$renderer4, { delta: cd.gotcha_hours.delta, format: "hours" });
                        $$renderer4.push(`<!----></div></div>`);
                      } else {
                        $$renderer4.push("<!--[!-->");
                      }
                      $$renderer4.push(`<!--]--> `);
                      if (cd.assumption_dependent_hours.from > 0 || cd.assumption_dependent_hours.to > 0) {
                        $$renderer4.push("<!--[-->");
                        $$renderer4.push(`<div class="flex justify-between items-center text-danger"><span>Assumption-dependent</span> <div class="flex items-center gap-2"><span>${escape_html(Math.round(cd.assumption_dependent_hours.from))} → ${escape_html(Math.round(cd.assumption_dependent_hours.to))}</span> `);
                        DeltaBadge($$renderer4, { delta: cd.assumption_dependent_hours.delta, format: "hours" });
                        $$renderer4.push(`<!----></div></div>`);
                      } else {
                        $$renderer4.push("<!--[!-->");
                      }
                      $$renderer4.push(`<!--]--> `);
                      if (cd.hours.without_ai) {
                        $$renderer4.push("<!--[-->");
                        $$renderer4.push(`<div class="mt-2 pt-2 border-t border-border-light"><span class="text-text-muted text-[10px] uppercase">Manual (opt/exp/pess)</span> <div class="flex justify-between"><span class="text-text-muted">v${escape_html(comparison().from_version)}</span> <span>${escape_html(Math.round(cd.hours.without_ai.optimistic.from))} / ${escape_html(Math.round(cd.hours.without_ai.expected.from))} / ${escape_html(Math.round(cd.hours.without_ai.pessimistic.from))}</span></div> <div class="flex justify-between"><span class="text-text-muted">v${escape_html(comparison().to_version)}</span> <span>${escape_html(Math.round(cd.hours.without_ai.optimistic.to))} / ${escape_html(Math.round(cd.hours.without_ai.expected.to))} / ${escape_html(Math.round(cd.hours.without_ai.pessimistic.to))}</span></div></div>`);
                      } else {
                        $$renderer4.push("<!--[!-->");
                      }
                      $$renderer4.push(`<!--]--></div></div> <div class="space-y-3">`);
                      if (cd.multipliers.added.length > 0 || cd.multipliers.removed.length > 0) {
                        $$renderer4.push("<!--[-->");
                        $$renderer4.push(`<div><h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-2">Multipliers</h4> <div class="flex flex-wrap gap-1"><!--[-->`);
                        const each_array_2 = ensure_array_like(cd.multipliers.added);
                        for (let $$index = 0, $$length3 = each_array_2.length; $$index < $$length3; $$index++) {
                          let m = each_array_2[$$index];
                          $$renderer4.push(`<span class="inline-flex items-center px-2 py-0.5 text-xs font-bold bg-success-light text-success border border-success">+ ${escape_html(m)}</span>`);
                        }
                        $$renderer4.push(`<!--]--> <!--[-->`);
                        const each_array_3 = ensure_array_like(cd.multipliers.removed);
                        for (let $$index_1 = 0, $$length3 = each_array_3.length; $$index_1 < $$length3; $$index_1++) {
                          let m = each_array_3[$$index_1];
                          $$renderer4.push(`<span class="inline-flex items-center px-2 py-0.5 text-xs font-bold bg-danger-light text-danger border border-danger line-through">- ${escape_html(m)}</span>`);
                        }
                        $$renderer4.push(`<!--]--> <!--[-->`);
                        const each_array_4 = ensure_array_like(cd.multipliers.unchanged);
                        for (let $$index_2 = 0, $$length3 = each_array_4.length; $$index_2 < $$length3; $$index_2++) {
                          let m = each_array_4[$$index_2];
                          $$renderer4.push(`<span class="inline-flex items-center px-2 py-0.5 text-xs font-bold bg-border-light text-text-muted border border-border-light">${escape_html(m)}</span>`);
                        }
                        $$renderer4.push(`<!--]--></div></div>`);
                      } else {
                        $$renderer4.push("<!--[!-->");
                      }
                      $$renderer4.push(`<!--]--> `);
                      if (cd.assumptions.added.length > 0 || cd.assumptions.removed.length > 0) {
                        $$renderer4.push("<!--[-->");
                        $$renderer4.push(`<div><h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-2">Assumptions</h4> <div class="flex flex-wrap gap-1"><!--[-->`);
                        const each_array_5 = ensure_array_like(cd.assumptions.added);
                        for (let $$index_3 = 0, $$length3 = each_array_5.length; $$index_3 < $$length3; $$index_3++) {
                          let a = each_array_5[$$index_3];
                          $$renderer4.push(`<span class="inline-flex items-center px-2 py-0.5 text-xs font-mono bg-success-light text-success border border-success">+ ${escape_html(a)}</span>`);
                        }
                        $$renderer4.push(`<!--]--> <!--[-->`);
                        const each_array_6 = ensure_array_like(cd.assumptions.removed);
                        for (let $$index_4 = 0, $$length3 = each_array_6.length; $$index_4 < $$length3; $$index_4++) {
                          let a = each_array_6[$$index_4];
                          $$renderer4.push(`<span class="inline-flex items-center px-2 py-0.5 text-xs font-mono bg-danger-light text-danger border border-danger line-through">- ${escape_html(a)}</span>`);
                        }
                        $$renderer4.push(`<!--]--> <!--[-->`);
                        const each_array_7 = ensure_array_like(cd.assumptions.unchanged);
                        for (let $$index_5 = 0, $$length3 = each_array_7.length; $$index_5 < $$length3; $$index_5++) {
                          let a = each_array_7[$$index_5];
                          $$renderer4.push(`<span class="inline-flex items-center px-2 py-0.5 text-xs font-mono bg-border-light text-text-muted border border-border-light">${escape_html(a)}</span>`);
                        }
                        $$renderer4.push(`<!--]--></div></div>`);
                      } else {
                        $$renderer4.push("<!--[!-->");
                      }
                      $$renderer4.push(`<!--]--> `);
                      if (Object.keys(cd.roles).length > 0 && Object.values(cd.roles).some((r) => r.delta !== 0)) {
                        $$renderer4.push("<!--[-->");
                        $$renderer4.push(`<div><h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-2">Roles</h4> <div class="space-y-1 text-xs"><!--[-->`);
                        const each_array_8 = ensure_array_like(Object.entries(cd.roles).filter(([, r]) => r.delta !== 0));
                        for (let $$index_6 = 0, $$length3 = each_array_8.length; $$index_6 < $$length3; $$index_6++) {
                          let [role, rd] = each_array_8[$$index_6];
                          $$renderer4.push(`<div class="flex justify-between items-center"><span class="text-text-secondary">${escape_html(formatRole(role))}</span> <div class="flex items-center gap-2"><span class="font-mono">${escape_html(Math.round(rd.from))} → ${escape_html(Math.round(rd.to))}</span> `);
                          DeltaBadge($$renderer4, { delta: rd.delta, format: "hours" });
                          $$renderer4.push(`<!----></div></div>`);
                        }
                        $$renderer4.push(`<!--]--></div></div>`);
                      } else {
                        $$renderer4.push("<!--[!-->");
                      }
                      $$renderer4.push(`<!--]--></div></div></td></tr>`);
                    } else {
                      $$renderer4.push("<!--[!-->");
                    }
                    $$renderer4.push(`<!--]-->`);
                  }
                  $$renderer4.push(`<!--]--></tbody><tfoot><tr class="border-t-3 border-brutal font-extrabold"><td class="px-4 py-2.5 uppercase text-xs tracking-wider">Phase Total</td><td class="px-4 py-2.5"></td><td class="px-4 py-2.5 text-right font-mono text-text-muted">${escape_html(Math.round(phaseDiff.total_hours.from))}h</td><td class="px-4 py-2.5 text-right font-mono">${escape_html(Math.round(phaseDiff.total_hours.to))}h</td><td class="px-4 py-2.5 text-right">`);
                  DeltaBadge($$renderer4, { delta: phaseDiff.total_hours.delta, format: "hours" });
                  $$renderer4.push(`<!----></td><td class="px-4 py-2.5"></td></tr></tfoot></table></div>`);
                }
              });
            }
            $$renderer3.push(`<!--]--> `);
            Card($$renderer3, {
              padding: "p-4",
              children: ($$renderer4) => {
                $$renderer4.push(`<div class="flex items-center justify-between"><span class="text-sm font-extrabold uppercase tracking-wider">Grand Total</span> <div class="flex items-center gap-3"><span class="text-text-muted font-mono">${escape_html(Math.round(comparison().summary.total_expected_hours.from))}h</span> <span class="text-text-muted">→</span> <span class="text-2xl font-extrabold font-mono">${escape_html(Math.round(comparison().summary.total_expected_hours.to))}h</span> `);
                DeltaBadge($$renderer4, {
                  delta: comparison().summary.total_expected_hours.delta,
                  format: "hours"
                });
                $$renderer4.push(`<!----></div></div>`);
              }
            });
            $$renderer3.push(`<!----></div>`);
          } else if (activeTab === "ai-tools") {
            $$renderer3.push("<!--[1-->");
            Card($$renderer3, {
              children: ($$renderer4) => {
                $$renderer4.push(`<div class="py-4 text-center text-sm text-text-muted">AI tool selections are separate from estimate snapshots. Switch to normal view to manage tools.</div>`);
              }
            });
          } else if (activeTab === "roles") {
            $$renderer3.push("<!--[2-->");
            Card($$renderer3, {
              children: ($$renderer4) => {
                const maxRoleHours = Math.max(...comparison().roles.map((r) => Math.max(r.delta.from, r.delta.to)), 1);
                $$renderer4.push(`<h3 class="text-xs font-extrabold uppercase tracking-wider mb-4 pb-2 border-b-3 border-primary text-primary">Hours by Role — Comparison</h3> <div class="space-y-4"><!--[-->`);
                const each_array_9 = ensure_array_like(comparison().roles);
                for (let $$index_9 = 0, $$length = each_array_9.length; $$index_9 < $$length; $$index_9++) {
                  let { role, delta: rd } = each_array_9[$$index_9];
                  $$renderer4.push(`<div><div class="flex items-center justify-between mb-1"><span class="text-sm font-bold">${escape_html(formatRole(role))}</span> <div class="flex items-center gap-2"><span class="text-xs font-mono text-text-muted">${escape_html(Math.round(rd.from))}h</span> <span class="text-xs text-text-muted">→</span> <span class="text-sm font-mono font-bold">${escape_html(Math.round(rd.to))}h</span> `);
                  DeltaBadge($$renderer4, { delta: rd.delta, format: "hours" });
                  $$renderer4.push(`<!----></div></div> <div class="relative h-4 w-full bg-border-light border border-brutal"><div class="absolute top-0 left-0 h-full bg-text-muted/30 transition-all duration-300"${attr_style(`width: ${stringify(rd.from / maxRoleHours * 100)}%`)}></div> <div class="absolute top-0 left-0 h-full bg-primary transition-all duration-300"${attr_style(`width: ${stringify(rd.to / maxRoleHours * 100)}%`)}></div></div></div>`);
                }
                $$renderer4.push(`<!--]--></div> <div class="mt-4 pt-3 border-t-2 border-brutal flex justify-between items-center"><span class="text-xs font-extrabold uppercase tracking-wider text-text-muted">Total</span> <div class="flex items-center gap-2"><span class="text-sm font-mono text-text-muted">${escape_html(Math.round(comparison().summary.total_expected_hours.from))}h</span> <span class="text-xs text-text-muted">→</span> <span class="text-lg font-extrabold font-mono">${escape_html(Math.round(comparison().summary.total_expected_hours.to))}h</span> `);
                DeltaBadge($$renderer4, {
                  delta: comparison().summary.total_expected_hours.delta,
                  format: "hours"
                });
                $$renderer4.push(`<!----></div></div>`);
              }
            });
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]-->`);
        }
      });
      $$renderer2.push(`<!---->`);
    } else {
      $$renderer2.push("<!--[!-->");
      ScenarioSelector($$renderer2, {
        scenario,
        onchange: (s) => scenario = s,
        totals: scenarioTotals()
      });
      $$renderer2.push(`<!----> <div class="brutal-border bg-surface px-5 py-3 flex items-center gap-6 flex-wrap">`);
      Tooltip($$renderer2, {
        text: "Sum of all component hours for the active scenario, after multipliers and AI savings.",
        position: "bottom",
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="flex items-baseline gap-1.5 cursor-help"><span class="text-2xl font-extrabold font-mono tracking-tight">${escape_html(Math.round(totalHours()).toLocaleString())}h</span> <span class="text-xs font-bold uppercase tracking-wider text-text-muted">${escape_html(phases().length)} phases</span></div>`);
        }
      });
      $$renderer2.push(`<!----> <span class="w-px h-6 bg-border-light hidden sm:block" aria-hidden="true"></span> `);
      if (savings() > 0) {
        $$renderer2.push("<!--[-->");
        Tooltip($$renderer2, {
          text: "Hours reduced by enabled AI tools vs. manual baseline. Capped at 50% per component.",
          position: "bottom",
          children: ($$renderer3) => {
            $$renderer3.push(`<div class="flex items-baseline gap-1.5 cursor-help"><span class="text-sm font-extrabold font-mono text-success">-${escape_html(Math.round(savings()))}h</span> <span class="text-xs text-text-muted">AI savings (${escape_html(savingsPercent())}%)</span></div>`);
          }
        });
        $$renderer2.push(`<!----> <span class="w-px h-6 bg-border-light hidden sm:block" aria-hidden="true"></span>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      Tooltip($$renderer2, {
        text: "Based on confirmed vs. assumed answers. Higher = more reliable estimate.",
        position: "bottom",
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="flex items-center gap-2 cursor-help"><span class="text-sm font-extrabold font-mono">${escape_html(estimate().confidence_score)}%</span> <div class="w-20 h-1.5 bg-border-light border border-brutal"><div${attr_class(`h-full transition-all duration-300 ${stringify(estimate().confidence_score >= 70 ? "bg-success" : estimate().confidence_score >= 40 ? "bg-warning" : "bg-danger")}`)}${attr_style(`width: ${stringify(estimate().confidence_score)}%`)}></div></div> <span class="text-xs text-text-muted">confidence</span></div>`);
        }
      });
      $$renderer2.push(`<!----> <span class="w-px h-6 bg-border-light hidden sm:block" aria-hidden="true"></span> `);
      Tooltip($$renderer2, {
        text: "Unconfirmed inputs. Each unvalidated assumption adds widening hours.",
        position: "bottom",
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="flex items-baseline gap-1.5 cursor-help"><span class="text-sm font-extrabold font-mono">${escape_html(assumptions().length)}</span> <span class="text-xs text-text-muted">assumptions</span> <span class="text-[10px] font-mono text-success">(${escape_html(assumptions().filter((a) => a.validation_status === "validated").length)} validated)</span></div>`);
        }
      });
      $$renderer2.push(`<!----></div> `);
      Tabs($$renderer2, {
        tabs: tabs(),
        active: activeTab,
        onchange: (id) => activeTab = id,
        children: ($$renderer3) => {
          if (activeTab === "phases") {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="space-y-3"><!--[-->`);
            const each_array_10 = ensure_array_like(phases());
            for (let phaseIdx = 0, $$length = each_array_10.length; phaseIdx < $$length; phaseIdx++) {
              let phase = each_array_10[phaseIdx];
              const phaseHrs = getPhaseHours(phase, scenario, aiToggles, profData());
              const phaseManual = (phase.components ?? []).reduce(
                (s, c) => {
                  const h = c.hours;
                  return s + (h?.without_ai?.expected ?? c.final_hours ?? 0);
                },
                0
              );
              const phaseSavings = phaseManual - phaseHrs;
              CollapsibleSection($$renderer3, {
                title: phase.name,
                subtitle: `${stringify(Math.round(phaseHrs))}h`,
                open: phaseIdx === 0,
                badge: `${stringify((phase.components ?? []).length)} components`,
                children: ($$renderer4) => {
                  if (phaseSavings > 0) {
                    $$renderer4.push("<!--[-->");
                    $$renderer4.push(`<div class="mb-4 flex items-center gap-2 text-xs"><span class="text-text-muted font-bold uppercase">Manual:</span> <span class="font-mono font-bold">${escape_html(Math.round(phaseManual))}h</span> <span class="text-success font-bold">-${escape_html(Math.round(phaseSavings))}h AI savings</span></div>`);
                  } else {
                    $$renderer4.push("<!--[!-->");
                  }
                  $$renderer4.push(`<!--]--> <div class="overflow-x-auto -mx-4"><table class="w-full text-sm"><thead><tr class="bg-[#1a1a1a] text-white text-xs font-extrabold uppercase tracking-wider"><th class="text-left px-4 py-2.5">Component</th><th class="text-right px-4 py-2.5 w-20">Units</th><th class="text-right px-4 py-2.5 w-24">Base</th><th class="text-right px-4 py-2.5 w-24">Effective</th><th class="text-right px-4 py-2.5 w-20">AI</th><th class="text-center px-4 py-2.5 w-16"></th></tr></thead><tbody><!--[-->`);
                  const each_array_11 = ensure_array_like(phase.components ?? []);
                  for (let $$index_13 = 0, $$length2 = each_array_11.length; $$index_13 < $$length2; $$index_13++) {
                    let comp = each_array_11[$$index_13];
                    const effectiveHours = getComponentHours(comp, scenario, aiToggles, profData());
                    const compTools = getToolsForComponent(comp);
                    const hasAi = compTools.length > 0;
                    const expanded = expandedComponents[comp.id];
                    $$renderer4.push(`<tr${attr_class(`border-b border-border-light hover:bg-surface-hover transition-colors duration-100 cursor-pointer select-none ${stringify(expanded ? "bg-surface-hover" : "")}`)}${attr("aria-expanded", expanded)}${attr("aria-label", `Toggle details for ${stringify(comp.name)}`)}><td class="px-4 py-2.5 font-bold">${escape_html(comp.name)}</td><td class="px-4 py-2.5 text-right font-mono">${escape_html(comp.units ?? 1)}</td><td class="px-4 py-2.5 text-right font-mono">${escape_html(comp.base_hours ?? 0)}h</td><td${attr_class(`px-4 py-2.5 text-right font-mono font-bold ${stringify(effectiveHours < (comp.base_hours ?? 0) ? "text-success" : "")}`)}>${escape_html(Math.round(effectiveHours))}h</td><td class="px-4 py-2.5 text-right">`);
                    if (hasAi) {
                      $$renderer4.push("<!--[-->");
                      $$renderer4.push(`<span class="inline-flex items-center px-1.5 py-0.5 text-xs font-bold bg-success-light text-success border border-success">${escape_html(compTools.filter((t) => aiToggles[t.id] !== false).length)}/${escape_html(compTools.length)}</span>`);
                    } else {
                      $$renderer4.push("<!--[!-->");
                      $$renderer4.push(`<span class="text-text-muted text-xs">--</span>`);
                    }
                    $$renderer4.push(`<!--]--></td><td class="px-4 py-2.5 text-center"><span${attr_class(`inline-block text-xs text-text-muted transition-transform duration-200 ${stringify(expanded ? "rotate-90" : "")}`)} aria-hidden="true">▶</span></td></tr> `);
                    if (expanded) {
                      $$renderer4.push("<!--[-->");
                      const compHours = comp.hours;
                      const linkedAssumptions = comp.assumptions_affecting ?? [];
                      const validatedCount = linkedAssumptions.filter((id) => assumptions().find((a) => a.id === id)?.validation_status === "validated").length;
                      const multipliers = comp.multipliers_applied ?? [];
                      const roles = Object.entries(comp.by_role ?? {});
                      const maxRoleH = Math.max(...roles.map(([, h]) => h), 1);
                      $$renderer4.push(`<tr><td colspan="6" class="px-4 py-4 bg-bg border-b border-border-light"><div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4"><div class="bg-surface brutal-border-thin px-3 py-2"><span class="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Manual</span> <span class="text-sm font-extrabold font-mono">${escape_html(compHours?.without_ai?.expected ?? comp.base_hours ?? "-")}h</span> `);
                      if (compHours?.without_ai) {
                        $$renderer4.push("<!--[-->");
                        $$renderer4.push(`<span class="text-[10px] font-mono text-text-faint block">${escape_html(compHours.without_ai.optimistic)} – ${escape_html(compHours.without_ai.pessimistic)}</span>`);
                      } else {
                        $$renderer4.push("<!--[!-->");
                      }
                      $$renderer4.push(`<!--]--></div> <div class="bg-surface brutal-border-thin px-3 py-2"><span class="text-[10px] font-bold uppercase tracking-wider text-text-muted block">AI-Assisted</span> <span class="text-sm font-extrabold font-mono text-success">${escape_html(compHours?.with_ai?.expected ?? "-")}h</span> `);
                      if (compHours?.with_ai) {
                        $$renderer4.push("<!--[-->");
                        $$renderer4.push(`<span class="text-[10px] font-mono text-text-faint block">${escape_html(compHours.with_ai.optimistic)} – ${escape_html(compHours.with_ai.pessimistic)}</span>`);
                      } else {
                        $$renderer4.push("<!--[!-->");
                      }
                      $$renderer4.push(`<!--]--></div> `);
                      if (comp.gotcha_hours > 0) {
                        $$renderer4.push("<!--[-->");
                        $$renderer4.push(`<div class="bg-surface brutal-border-thin px-3 py-2"><span class="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Gotcha</span> <span class="text-sm font-extrabold font-mono text-warning">+${escape_html(comp.gotcha_hours)}h</span> <span class="text-[10px] text-text-faint block">known pitfalls</span></div>`);
                      } else {
                        $$renderer4.push("<!--[!-->");
                      }
                      $$renderer4.push(`<!--]--> `);
                      if (comp.assumption_dependent_hours > 0) {
                        $$renderer4.push("<!--[-->");
                        $$renderer4.push(`<div class="bg-surface brutal-border-thin px-3 py-2"><span class="text-[10px] font-bold uppercase tracking-wider text-text-muted block">At Risk</span> <span class="text-sm font-extrabold font-mono text-danger">${escape_html(comp.assumption_dependent_hours)}h</span> <span class="text-[10px] text-text-faint block">assumption-dep.</span></div>`);
                      } else {
                        $$renderer4.push("<!--[!-->");
                      }
                      $$renderer4.push(`<!--]--></div> <div class="flex flex-wrap items-start gap-x-6 gap-y-3 text-xs">`);
                      if (multipliers.length > 0) {
                        $$renderer4.push("<!--[-->");
                        $$renderer4.push(`<div><span class="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">Multipliers</span> <div class="flex flex-wrap gap-1"><!--[-->`);
                        const each_array_12 = ensure_array_like(multipliers);
                        for (let $$index_10 = 0, $$length3 = each_array_12.length; $$index_10 < $$length3; $$index_10++) {
                          let mult = each_array_12[$$index_10];
                          const name = typeof mult === "string" ? mult : mult.name ?? mult.id ?? "";
                          const factor = typeof mult === "object" ? mult.factor : null;
                          const shortName = name.length > 30 ? name.split(/\s/).slice(0, 3).join(" ") + "..." : name;
                          Tooltip($$renderer4, {
                            text: name,
                            position: "top",
                            children: ($$renderer5) => {
                              $$renderer5.push(`<span class="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold bg-warning-light text-warning border border-warning cursor-help">${escape_html(shortName)}`);
                              if (factor) {
                                $$renderer5.push("<!--[-->");
                                $$renderer5.push(` ×${escape_html(factor)}`);
                              } else {
                                $$renderer5.push("<!--[!-->");
                              }
                              $$renderer5.push(`<!--]--></span>`);
                            }
                          });
                        }
                        $$renderer4.push(`<!--]--></div></div>`);
                      } else {
                        $$renderer4.push("<!--[!-->");
                      }
                      $$renderer4.push(`<!--]--> `);
                      if (linkedAssumptions.length > 0) {
                        $$renderer4.push("<!--[-->");
                        $$renderer4.push(`<div><span class="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">Assumptions</span> <a${attr("href", `/assessments/${stringify(data.assessment.id)}/analysis?tab=assumptions`)}${attr_class(`inline-flex items-center gap-1.5 px-2 py-0.5 font-bold border no-underline hover:opacity-80 transition-opacity ${stringify(validatedCount === linkedAssumptions.length ? "bg-success-light text-success border-success" : "bg-warning-light text-warning border-warning")}`)}>${escape_html(linkedAssumptions.length)} linked <span class="text-[10px] font-normal">(${escape_html(validatedCount)} validated)</span></a></div>`);
                      } else {
                        $$renderer4.push("<!--[!-->");
                      }
                      $$renderer4.push(`<!--]--></div> `);
                      if (roles.length > 0) {
                        $$renderer4.push("<!--[-->");
                        $$renderer4.push(`<div class="mt-3"><span class="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">Effort by Role</span> <div class="space-y-2"><!--[-->`);
                        const each_array_13 = ensure_array_like(roles.sort((a, b) => b[1] - a[1]));
                        for (let $$index_11 = 0, $$length3 = each_array_13.length; $$index_11 < $$length3; $$index_11++) {
                          let [role, hours] = each_array_13[$$index_11];
                          $$renderer4.push(`<div><div class="flex items-center gap-2"><span class="text-[11px] font-bold w-[140px] shrink-0 truncate">${escape_html(formatRole(role))}</span> <div class="flex-1 h-[6px] bg-border-light"><div class="h-full bg-primary transition-all duration-300"${attr_style(`width: ${stringify(hours / maxRoleH * 100)}%`)}></div></div> <span class="text-[11px] font-mono font-bold w-10 shrink-0 text-right">${escape_html(hours)}h</span></div> <p class="text-[10px] text-text-muted leading-snug mt-0.5 ml-[148px]">${escape_html(getRoleDescription(role, comp.id ?? "", comp.name ?? ""))}</p></div>`);
                        }
                        $$renderer4.push(`<!--]--></div></div>`);
                      } else {
                        $$renderer4.push("<!--[!-->");
                      }
                      $$renderer4.push(`<!--]--> `);
                      if (compTools.length > 0) {
                        $$renderer4.push("<!--[-->");
                        const enabledTools = compTools.filter((t) => aiToggles[t.id] !== false);
                        const totalSavings = enabledTools.reduce((s, t) => s + (t.hours_saved?.expected ?? 0), 0);
                        $$renderer4.push(`<div class="mt-3"><div class="flex items-center justify-between mb-1.5"><span class="text-[10px] font-bold uppercase tracking-wider text-text-muted">AI Acceleration</span> `);
                        if (totalSavings > 0) {
                          $$renderer4.push("<!--[-->");
                          $$renderer4.push(`<span class="text-[10px] font-mono font-bold text-success">-${escape_html(totalSavings)}h with ${escape_html(enabledTools.length)} tool${escape_html(enabledTools.length !== 1 ? "s" : "")}</span>`);
                        } else {
                          $$renderer4.push("<!--[!-->");
                          $$renderer4.push(`<span class="text-[10px] font-mono text-text-faint">no tools enabled</span>`);
                        }
                        $$renderer4.push(`<!--]--></div> <div class="grid gap-px bg-border-light brutal-border-thin overflow-hidden"><!--[-->`);
                        const each_array_14 = ensure_array_like(compTools);
                        for (let $$index_12 = 0, $$length3 = each_array_14.length; $$index_12 < $$length3; $$index_12++) {
                          let tool = each_array_14[$$index_12];
                          const isEnabled = aiToggles[tool.id] !== false;
                          $$renderer4.push(`<div${attr_class(`px-3 py-2 bg-surface ${stringify(isEnabled ? "" : "opacity-50")}`)}><div class="flex items-center justify-between gap-3"><div class="flex items-center gap-2 min-w-0"><span class="text-xs font-bold">${escape_html(tool.name)}</span> `);
                          if (tool.vendor) {
                            $$renderer4.push("<!--[-->");
                            $$renderer4.push(`<span class="text-[10px] text-text-faint">${escape_html(tool.vendor)}</span>`);
                          } else {
                            $$renderer4.push("<!--[!-->");
                          }
                          $$renderer4.push(`<!--]--></div> <div class="flex items-center gap-2 shrink-0"><span${attr_class(`text-[10px] font-mono font-bold ${stringify(isEnabled ? "text-success" : "text-text-faint")}`)}>-${escape_html(tool.hours_saved?.expected ?? 0)}h</span> `);
                          if (tool.cost) {
                            $$renderer4.push("<!--[-->");
                            $$renderer4.push(`<span class="text-[10px] px-1 py-px border border-border-light text-text-muted">${escape_html(tool.cost.type === "free" ? "Free" : tool.cost.type)}</span>`);
                          } else {
                            $$renderer4.push("<!--[!-->");
                          }
                          $$renderer4.push(`<!--]--></div></div> `);
                          if (tool.description) {
                            $$renderer4.push("<!--[-->");
                            $$renderer4.push(`<p class="text-[10px] text-text-muted leading-snug mt-1">${escape_html(tool.description)}</p>`);
                          } else {
                            $$renderer4.push("<!--[!-->");
                          }
                          $$renderer4.push(`<!--]--></div>`);
                        }
                        $$renderer4.push(`<!--]--></div></div>`);
                      } else {
                        $$renderer4.push("<!--[!-->");
                      }
                      $$renderer4.push(`<!--]--></td></tr>`);
                    } else {
                      $$renderer4.push("<!--[!-->");
                    }
                    $$renderer4.push(`<!--]-->`);
                  }
                  $$renderer4.push(`<!--]--></tbody><tfoot><tr class="border-t-3 border-brutal font-extrabold"><td class="px-4 py-2.5 uppercase text-xs tracking-wider">Phase Total</td><td class="px-4 py-2.5"></td><td class="px-4 py-2.5 text-right font-mono">${escape_html(Math.round(phaseManual))}h</td><td${attr_class(`px-4 py-2.5 text-right font-mono ${stringify(phaseSavings > 0 ? "text-success" : "")}`)}>${escape_html(Math.round(phaseHrs))}h</td><td class="px-4 py-2.5"></td><td class="px-4 py-2.5"></td></tr></tfoot></table></div>`);
                }
              });
            }
            $$renderer3.push(`<!--]--> `);
            Card($$renderer3, {
              padding: "p-4",
              children: ($$renderer4) => {
                $$renderer4.push(`<div class="flex items-center justify-between"><span class="text-sm font-extrabold uppercase tracking-wider">Grand Total</span> <div class="text-right"><span class="text-2xl font-extrabold font-mono">${escape_html(Math.round(totalHours()).toLocaleString())}h</span> `);
                if (savings() > 0) {
                  $$renderer4.push("<!--[-->");
                  $$renderer4.push(`<span class="block text-xs text-success font-bold">-${escape_html(Math.round(savings()))}h (${escape_html(savingsPercent())}%) with AI</span>`);
                } else {
                  $$renderer4.push("<!--[!-->");
                }
                $$renderer4.push(`<!--]--></div></div>`);
              }
            });
            $$renderer3.push(`<!----></div>`);
          } else if (activeTab === "ai-tools") {
            $$renderer3.push("<!--[1-->");
            $$renderer3.push(`<div class="space-y-4"><div class="flex items-center gap-3"><button class="px-3 py-1.5 text-xs font-bold uppercase border-2 border-brutal bg-success-light text-success hover:bg-success hover:text-white transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-primary">Enable All</button> <button class="px-3 py-1.5 text-xs font-bold uppercase border-2 border-brutal bg-danger-light text-danger hover:bg-danger hover:text-white transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-primary">Disable All</button> <span class="text-xs text-text-muted font-mono ml-auto">${escape_html(Object.values(aiToggles).filter(Boolean).length)}/${escape_html(aiTools().length)} enabled</span></div> `);
            if (profData()) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="brutal-border-thin bg-bg p-3"><p class="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">AI Adoption Overhead</p> <p class="text-xs text-text-secondary mb-3">Tool savings are adjusted based on your team's technology proficiency. Tools where adoption cost exceeds savings show a warning.</p> <div class="space-y-1.5"><!--[-->`);
              const each_array_15 = ensure_array_like(aiTools());
              for (let $$index_15 = 0, $$length = each_array_15.length; $$index_15 < $$length; $$index_15++) {
                let tool = each_array_15[$$index_15];
                const overhead = getToolAdoptionOverhead(tool.id, profData());
                const grossSavings = tool.hours_saved?.expected ?? 0;
                const netSavings = Math.max(grossSavings - overhead, 0);
                const overheadExceedsSavings = overhead >= grossSavings && grossSavings > 0;
                $$renderer3.push(`<div${attr_class(`flex items-center justify-between text-xs ${stringify(overheadExceedsSavings ? "text-warning" : "")}`)}><span class="font-mono">${escape_html(tool.name)}</span> <span class="font-mono">`);
                if (overhead > 0) {
                  $$renderer3.push("<!--[-->");
                  $$renderer3.push(`<span class="text-text-muted">Saves ${escape_html(grossSavings)}h</span> <span class="text-danger">-${escape_html(overhead)}h adoption</span> <span class="font-bold">= net ${escape_html(netSavings)}h</span> `);
                  if (overheadExceedsSavings) {
                    $$renderer3.push("<!--[-->");
                    $$renderer3.push(`<span class="ml-1 px-1 py-0.5 text-[10px] font-bold bg-warning-light text-warning border border-warning">LOW ROI</span>`);
                  } else {
                    $$renderer3.push("<!--[!-->");
                  }
                  $$renderer3.push(`<!--]-->`);
                } else {
                  $$renderer3.push("<!--[!-->");
                  $$renderer3.push(`<span class="text-success">${escape_html(grossSavings)}h savings</span>`);
                }
                $$renderer3.push(`<!--]--></span></div>`);
              }
              $$renderer3.push(`<!--]--></div></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--> `);
            AiToolToggles($$renderer3, {
              tools: aiTools(),
              toggles: aiToggles,
              ontoggle: toggleAiTool,
              mode: "full"
            });
            $$renderer3.push(`<!----></div>`);
          } else if (activeTab === "roles") {
            $$renderer3.push("<!--[2-->");
            Card($$renderer3, {
              children: ($$renderer4) => {
                const roles = roleBreakdown()();
                const maxRoleHours = Math.max(...Object.values(roles), 1);
                $$renderer4.push(`<button class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider mb-4 pb-2 border-b-3 border-primary text-primary w-full text-left cursor-pointer hover:opacity-80 transition-opacity">Hours by Role <span class="text-[10px] font-mono opacity-60">(i)</span></button>  <div class="space-y-3"><!--[-->`);
                const each_array_16 = ensure_array_like(Object.entries(roles).sort((a, b) => b[1] - a[1]));
                for (let $$index_16 = 0, $$length = each_array_16.length; $$index_16 < $$length; $$index_16++) {
                  let [role, hours] = each_array_16[$$index_16];
                  $$renderer4.push(`<div><div class="flex items-center justify-between mb-1"><span class="text-sm font-bold">${escape_html(formatRole(role))}</span> <span class="text-sm font-mono font-bold">${escape_html(Math.round(hours))}h</span></div> <div class="h-4 w-full bg-border-light border border-brutal"><div class="h-full bg-primary transition-all duration-300"${attr_style(`width: ${stringify(hours / maxRoleHours * 100)}%`)}></div></div></div>`);
                }
                $$renderer4.push(`<!--]--></div> <div class="mt-4 pt-3 border-t-2 border-brutal flex justify-between items-center"><span class="text-xs font-extrabold uppercase tracking-wider text-text-muted">Total</span> <span class="text-lg font-extrabold font-mono">${escape_html(Math.round(Object.values(roles).reduce((a, b) => a + b, 0)))}h</span></div>`);
              }
            });
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
      title: drawerSection === "page" ? "About Estimate" : drawerSection === "hours" ? "Hours Breakdown" : drawerSection === "roles" ? "Hours by Role" : "",
      children: ($$renderer3) => {
        if (drawerSection === "page") {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<div class="space-y-4 text-sm"><p>The <strong>Estimate</strong> page shows the detailed effort breakdown for your migration, organized by phases and components.</p> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">How Hours Are Calculated</h3> <p class="text-text-secondary">Each component starts with base hours, which are then scaled by complexity multipliers. Gotcha pattern hours are added as buffers. AI tool savings are subtracted (capped at 50% per component).</p> <p class="text-text-secondary font-mono text-xs">effective = (base × multipliers) + gotcha - AI savings</p></div> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">Three-Point Estimation</h3> <p class="text-text-secondary">Each component has optimistic, expected, and pessimistic values. The expected value is used for totals. Expand any component to see all three scenarios.</p></div> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">Scenarios</h3> <div class="space-y-1 text-text-secondary"><p><strong>Manual</strong> — Full effort, no AI tooling</p> <p><strong>AI-Assisted</strong> — Hours reduced by enabled AI tools (default view)</p> <p><strong>Best Case</strong> — All AI tools at optimistic savings</p></div></div> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">Version History</h3> <p class="text-text-secondary">Each time <code class="brutal-border-thin bg-surface px-1 py-0.5 text-xs font-mono">/migrate estimate</code> runs, a new version is saved. Use the version switcher to browse past estimates or compare two versions side by side.</p></div> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">Customization</h3> <p class="text-text-secondary">Toggle AI tools on/off in the AI Tools tab. Exclude components on the <a${attr("href", `/assessments/${stringify(page.params.id)}/refine`)} class="text-primary font-bold">Refine</a> page. Both update totals in real time.</p></div></div>`);
        } else if (drawerSection === "hours") {
          $$renderer3.push("<!--[1-->");
          $$renderer3.push(`<div class="space-y-4 text-sm"><p><strong>Hours Breakdown</strong> shows optimistic, expected, and pessimistic estimates for each component.</p> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">Three-Point Estimate</h3> <ul class="list-disc list-inside space-y-1 text-text-secondary"><li><strong>Optimistic</strong> — Best case, everything goes smoothly</li> <li><strong>Expected</strong> — Most likely outcome, used for totals</li> <li><strong>Pessimistic</strong> — Worst case, includes assumption widening</li></ul></div> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">Special Hour Types</h3> <ul class="list-disc list-inside space-y-1 text-text-secondary"><li><strong class="text-warning">Gotcha hours</strong> — Additional effort from known pitfall patterns</li> <li><strong class="text-danger">Assumption-dependent</strong> — Hours that may change when assumptions are validated</li></ul></div></div>`);
        } else if (drawerSection === "roles") {
          $$renderer3.push("<!--[2-->");
          $$renderer3.push(`<div class="space-y-4 text-sm"><p><strong>Hours by Role</strong> aggregates effort across all components by team role.</p> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">How Roles Are Assigned</h3> <p class="text-text-secondary">Each component breaks down its hours by role (e.g., developer, devops, QA, architect). This view sums those across all phases to help with team planning and staffing.</p></div> <div class="space-y-2"><h3 class="text-xs font-extrabold uppercase tracking-wider">Usage</h3> <p class="text-text-secondary">Use this breakdown to estimate team composition, identify bottleneck roles, and plan parallel workstreams.</p></div></div>`);
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
//# sourceMappingURL=_page.svelte-eW6ZED6E.js.map
