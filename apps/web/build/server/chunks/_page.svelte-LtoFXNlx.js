import { aa as head, a1 as derived, ab as escape_html, a6 as attr_class, a7 as stringify, ac as ensure_array_like, ad as attr, ae as attr_style } from './index4-DG1itRH8.js';
import { C as Card } from './Card-w7RlWvYA.js';
import { B as Badge } from './Badge-CWejdkwM.js';
import { T as Tabs } from './Tabs-CIZXvs-S.js';
import { T as Tooltip } from './Tooltip-hZ63yG7F.js';
import { M as Modal } from './Modal-CbyfWmrz.js';
import { C as CollapsibleSection } from './CollapsibleSection-DwE4ccwC.js';
import { R as RadarChart } from './RadarChart-BEXblXiD.js';
import { a as gradeColor } from './pack-grading-B-ZgwrAj.js';
import './index-server-CVwIEJCx.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    let pack = { ...data.pack };
    let activeTab = "heuristics";
    let showResearchModal = false;
    let researching = false;
    const effortHours = derived(() => pack.effort_hours ?? []);
    const multipliers = derived(() => pack.multipliers ?? []);
    const gotchaPatterns = derived(() => pack.gotcha_patterns ?? []);
    const dependencyChains = derived(() => pack.dependency_chains ?? []);
    const phaseMappings = derived(() => pack.phase_mappings ?? []);
    const roles = derived(() => pack.roles ?? []);
    const sourceUrls = derived(() => pack.source_urls ?? []);
    const totalPaths = derived(() => data.pathsAsSource.length + data.pathsAsTarget.length);
    const tabs = derived(() => [
      {
        id: "heuristics",
        label: "Heuristics",
        count: effortHours().length + multipliers().length + gotchaPatterns().length
      },
      { id: "paths", label: "Migration Paths", count: totalPaths() },
      { id: "sources", label: "Sources", count: sourceUrls().length },
      { id: "details", label: "Details" }
    ]);
    function formatDate(dateStr) {
      if (!dateStr) return "Never";
      return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
    const categoryVariant = {
      platform: "default",
      cms: "default",
      commerce: "info",
      infrastructure: "warning",
      martech: "success",
      ai_dev: "danger",
      service: "muted",
      services: "muted"
    };
    const confidenceVariant = { verified: "success", preliminary: "warning", draft: "muted" };
    const complexityVariant = {
      low: "success",
      medium: "warning",
      high: "danger",
      critical: "danger"
    };
    const riskVariant = {
      low: "success",
      medium: "warning",
      high: "danger",
      critical: "danger"
    };
    function getRelatedPackName(packId) {
      return data.relatedPacks[packId]?.name ?? packId;
    }
    function jsonArray(val) {
      if (Array.isArray(val)) return val.map(String);
      return [];
    }
    head("1kcrs8z", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html(pack.name)} | Knowledge | MigrateIQ</title>`);
      });
    });
    $$renderer2.push(`<div class="mx-auto max-w-7xl px-6 py-8 animate-enter"><a href="/knowledge" class="inline-flex items-center gap-1.5 text-sm font-bold text-text-secondary hover:text-primary transition-colors no-underline mb-6">← All Platforms</a> `);
    Card($$renderer2, {
      children: ($$renderer3) => {
        $$renderer3.push(`<div class="flex flex-col gap-5"><div class="flex items-start justify-between gap-4"><div class="flex-1 min-w-0"><div class="flex items-center gap-3 mb-1"><div class="flex h-10 w-10 items-center justify-center brutal-border-thin bg-primary-light text-lg text-primary font-extrabold shrink-0">${escape_html(pack.name.charAt(0).toUpperCase())}</div> <div class="flex-1 min-w-0"><h1 class="text-xl font-extrabold uppercase tracking-wider truncate">${escape_html(pack.name)}</h1> `);
        if (pack.vendor || pack.latest_version) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<p class="text-sm text-text-secondary">${escape_html(pack.vendor)}${escape_html(pack.vendor && pack.latest_version ? " · " : "")}
									${escape_html(pack.latest_version ? `v${pack.latest_version}` : "")}</p>`);
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--></div></div></div> <button class="brutal-border-thin px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-warning-light text-warning border-warning hover:bg-warning hover:text-white transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Re-Research</button></div> <div class="flex flex-wrap items-center gap-2">`);
        Badge($$renderer3, {
          variant: categoryVariant[pack.category] ?? "default",
          children: ($$renderer4) => {
            $$renderer4.push(`<!---->${escape_html(pack.category)}`);
          }
        });
        $$renderer3.push(`<!----> `);
        Badge($$renderer3, {
          variant: confidenceVariant[pack.confidence] ?? "muted",
          children: ($$renderer4) => {
            $$renderer4.push(`<!---->${escape_html(pack.confidence)}`);
          }
        });
        $$renderer3.push(`<!----> `);
        if (pack.direction && pack.direction !== "both") {
          $$renderer3.push("<!--[-->");
          Badge($$renderer3, {
            variant: "muted",
            children: ($$renderer4) => {
              $$renderer4.push(`<!---->${escape_html(pack.direction)}`);
            }
          });
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--> `);
        if (data.grade) {
          $$renderer3.push("<!--[-->");
          Tooltip($$renderer3, {
            text: `Thoroughness grade: ${stringify(data.grade.overallScore)}/100 across 9 dimensions`,
            position: "bottom",
            children: ($$renderer4) => {
              $$renderer4.push(`<span${attr_class(`text-sm font-extrabold font-mono px-2 py-0.5 border-2 cursor-help ${stringify(gradeColor(data.grade.overall))}`)}>${escape_html(data.grade.overall)}</span>`);
            }
          });
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--></div> `);
        if (pack.description) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<p class="text-sm text-text-secondary">${escape_html(pack.description)}</p>`);
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--> `);
        if (data.grade) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<div class="border-t-2 border-border-light pt-4"><h3 class="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-3">Thoroughness Profile</h3> <div class="flex flex-col sm:flex-row items-center gap-6"><div class="shrink-0">`);
          RadarChart($$renderer3, {
            dimensions: data.grade.dimensions.map((d) => ({
              label: d.label.replace("Dependency ", "Dep. ").replace("Alternatives", "Alt.").replace("Patterns", "Pat.").replace("Mappings", "Map."),
              value: d.score,
              maxValue: 100
            })),
            size: 200
          });
          $$renderer3.push(`<!----></div> <div class="grid grid-cols-3 gap-x-4 gap-y-1.5 text-xs"><!--[-->`);
          const each_array = ensure_array_like(data.grade.dimensions);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let dim = each_array[$$index];
            $$renderer3.push(`<div class="flex items-center gap-1.5"><span${attr_class(`text-[10px] font-bold font-mono px-1 py-0.5 border ${stringify(gradeColor(dim.grade))}`)}>${escape_html(dim.grade)}</span> <span class="text-text-muted">${escape_html(dim.label)}</span> <span class="font-mono text-text-secondary">(${escape_html(dim.count)})</span></div>`);
          }
          $$renderer3.push(`<!--]--></div></div></div>`);
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--> <div class="flex flex-wrap gap-3 border-t-2 border-border-light pt-4">`);
        Tooltip($$renderer3, {
          text: "Effort hour components defined for this platform",
          position: "bottom",
          children: ($$renderer4) => {
            $$renderer4.push(`<div class="flex items-center gap-2 brutal-border-thin px-3 py-1.5 bg-bg cursor-help"><span class="text-[10px] font-bold uppercase tracking-wider text-text-muted">Components</span> <span class="text-sm font-extrabold font-mono">${escape_html(effortHours().length)}</span></div>`);
          }
        });
        $$renderer3.push(`<!----> `);
        Tooltip($$renderer3, {
          text: "Gotcha patterns that add risk hours",
          position: "bottom",
          children: ($$renderer4) => {
            $$renderer4.push(`<div class="flex items-center gap-2 brutal-border-thin px-3 py-1.5 bg-bg cursor-help"><span class="text-[10px] font-bold uppercase tracking-wider text-text-muted">Gotchas</span> <span class="text-sm font-extrabold font-mono">${escape_html(gotchaPatterns().length)}</span></div>`);
          }
        });
        $$renderer3.push(`<!----> `);
        Tooltip($$renderer3, {
          text: "Source URLs documenting this knowledge",
          position: "bottom",
          children: ($$renderer4) => {
            $$renderer4.push(`<div class="flex items-center gap-2 brutal-border-thin px-3 py-1.5 bg-bg cursor-help"><span class="text-[10px] font-bold uppercase tracking-wider text-text-muted">Sources</span> <span class="text-sm font-extrabold font-mono">${escape_html(sourceUrls().length)}</span></div>`);
          }
        });
        $$renderer3.push(`<!----> `);
        Tooltip($$renderer3, {
          text: "Migration paths involving this platform",
          position: "bottom",
          children: ($$renderer4) => {
            $$renderer4.push(`<div class="flex items-center gap-2 brutal-border-thin px-3 py-1.5 bg-bg cursor-help"><span class="text-[10px] font-bold uppercase tracking-wider text-text-muted">Paths</span> <span class="text-sm font-extrabold font-mono">${escape_html(totalPaths())}</span></div>`);
          }
        });
        $$renderer3.push(`<!----> <div class="flex-1"></div> <span class="text-xs font-mono text-text-muted self-center">Updated ${escape_html(formatDate(pack.updated_at))} `);
        if (pack.last_researched) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`· Researched ${escape_html(formatDate(pack.last_researched))}`);
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--></span></div></div>`);
      }
    });
    $$renderer2.push(`<!----> <div class="mt-8">`);
    Tabs($$renderer2, {
      tabs: tabs(),
      active: activeTab,
      onchange: (id) => activeTab = id,
      children: ($$renderer3) => {
        if (activeTab === "paths") {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<div id="panel-paths" role="tabpanel">`);
          if (totalPaths() === 0) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="py-12 text-center"><div class="flex h-14 w-14 mx-auto items-center justify-center brutal-border-thin bg-bg text-2xl text-text-muted mb-4">⇄</div> <p class="text-sm font-bold text-text-muted">No migration paths documented yet.</p> <p class="text-xs text-text-muted mt-1">Run the research pipeline to discover migration paths.</p></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
            if (data.pathsAsSource.length > 0) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="mb-8"><h3 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-3 pb-1.5 border-b-2 border-border-light">Migrate From ${escape_html(pack.name)} →</h3> <div class="grid gap-4 lg:grid-cols-2 stagger-grid"><!--[-->`);
              const each_array_1 = ensure_array_like(data.pathsAsSource);
              for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
                let path = each_array_1[i];
                $$renderer3.push(`<a${attr("href", `/knowledge/${stringify(path.target_pack_id)}`)} class="no-underline group"${attr_style(`--stagger-i: ${stringify(i)};`)}>`);
                Card($$renderer3, {
                  hover: true,
                  children: ($$renderer4) => {
                    $$renderer4.push(`<div class="flex flex-col gap-3"><div class="flex items-start justify-between gap-3"><div class="min-w-0"><h4 class="font-extrabold text-text truncate group-hover:text-primary transition-colors">→ ${escape_html(getRelatedPackName(path.target_pack_id))}</h4> `);
                    if (path.typical_duration) {
                      $$renderer4.push("<!--[-->");
                      $$renderer4.push(`<p class="text-xs text-text-muted mt-0.5">${escape_html(path.typical_duration)}</p>`);
                    } else {
                      $$renderer4.push("<!--[!-->");
                    }
                    $$renderer4.push(`<!--]--></div> <div class="flex gap-1.5 shrink-0">`);
                    if (path.complexity) {
                      $$renderer4.push("<!--[-->");
                      Badge($$renderer4, {
                        variant: complexityVariant[path.complexity] ?? "default",
                        children: ($$renderer5) => {
                          $$renderer5.push(`<!---->${escape_html(path.complexity)}`);
                        }
                      });
                    } else {
                      $$renderer4.push("<!--[!-->");
                    }
                    $$renderer4.push(`<!--]--> `);
                    if (path.confidence) {
                      $$renderer4.push("<!--[-->");
                      Badge($$renderer4, {
                        variant: confidenceVariant[path.confidence] ?? "muted",
                        children: ($$renderer5) => {
                          $$renderer5.push(`<!---->${escape_html(path.confidence)}`);
                        }
                      });
                    } else {
                      $$renderer4.push("<!--[!-->");
                    }
                    $$renderer4.push(`<!--]--></div></div> `);
                    if (path.prevalence) {
                      $$renderer4.push("<!--[-->");
                      $$renderer4.push(`<div class="flex items-center gap-2 text-xs text-text-secondary"><span class="font-bold uppercase tracking-wider text-text-muted">Prevalence</span> <span class="font-mono">${escape_html(path.prevalence)}</span></div>`);
                    } else {
                      $$renderer4.push("<!--[!-->");
                    }
                    $$renderer4.push(`<!--]--></div>`);
                  }
                });
                $$renderer3.push(`<!----></a>`);
              }
              $$renderer3.push(`<!--]--></div></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--> `);
            if (data.pathsAsTarget.length > 0) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div><h3 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-3 pb-1.5 border-b-2 border-border-light">← Migrate To ${escape_html(pack.name)}</h3> <div class="grid gap-4 lg:grid-cols-2 stagger-grid"><!--[-->`);
              const each_array_2 = ensure_array_like(data.pathsAsTarget);
              for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
                let path = each_array_2[i];
                $$renderer3.push(`<a${attr("href", `/knowledge/${stringify(path.source_pack_id)}`)} class="no-underline group"${attr_style(`--stagger-i: ${stringify(i)};`)}>`);
                Card($$renderer3, {
                  hover: true,
                  children: ($$renderer4) => {
                    $$renderer4.push(`<div class="flex flex-col gap-3"><div class="flex items-start justify-between gap-3"><div class="min-w-0"><h4 class="font-extrabold text-text truncate group-hover:text-primary transition-colors">${escape_html(getRelatedPackName(path.source_pack_id))} →</h4> `);
                    if (path.typical_duration) {
                      $$renderer4.push("<!--[-->");
                      $$renderer4.push(`<p class="text-xs text-text-muted mt-0.5">${escape_html(path.typical_duration)}</p>`);
                    } else {
                      $$renderer4.push("<!--[!-->");
                    }
                    $$renderer4.push(`<!--]--></div> <div class="flex gap-1.5 shrink-0">`);
                    if (path.complexity) {
                      $$renderer4.push("<!--[-->");
                      Badge($$renderer4, {
                        variant: complexityVariant[path.complexity] ?? "default",
                        children: ($$renderer5) => {
                          $$renderer5.push(`<!---->${escape_html(path.complexity)}`);
                        }
                      });
                    } else {
                      $$renderer4.push("<!--[!-->");
                    }
                    $$renderer4.push(`<!--]--> `);
                    if (path.confidence) {
                      $$renderer4.push("<!--[-->");
                      Badge($$renderer4, {
                        variant: confidenceVariant[path.confidence] ?? "muted",
                        children: ($$renderer5) => {
                          $$renderer5.push(`<!---->${escape_html(path.confidence)}`);
                        }
                      });
                    } else {
                      $$renderer4.push("<!--[!-->");
                    }
                    $$renderer4.push(`<!--]--></div></div> `);
                    if (path.prevalence) {
                      $$renderer4.push("<!--[-->");
                      $$renderer4.push(`<div class="flex items-center gap-2 text-xs text-text-secondary"><span class="font-bold uppercase tracking-wider text-text-muted">Prevalence</span> <span class="font-mono">${escape_html(path.prevalence)}</span></div>`);
                    } else {
                      $$renderer4.push("<!--[!-->");
                    }
                    $$renderer4.push(`<!--]--></div>`);
                  }
                });
                $$renderer3.push(`<!----></a>`);
              }
              $$renderer3.push(`<!--]--></div></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]-->`);
          }
          $$renderer3.push(`<!--]--></div>`);
        } else if (activeTab === "heuristics") {
          $$renderer3.push("<!--[1-->");
          $$renderer3.push(`<div id="panel-heuristics" role="tabpanel" class="space-y-4">`);
          if (effortHours().length === 0 && multipliers().length === 0 && gotchaPatterns().length === 0) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="py-12 text-center"><div class="flex h-14 w-14 mx-auto items-center justify-center brutal-border-thin bg-bg text-2xl text-text-muted mb-4">⚙</div> <p class="text-sm font-bold text-text-muted">No heuristics data yet.</p> <p class="text-xs text-text-muted mt-1">Research agents populate effort hours, multipliers, and gotcha patterns.</p></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
            if (effortHours().length > 0) {
              $$renderer3.push("<!--[-->");
              CollapsibleSection($$renderer3, {
                title: "Effort Hours",
                subtitle: `${stringify(effortHours().length)} components`,
                badge: `${stringify(effortHours().reduce((s, e) => s + (e.base_hours ?? 0), 0))}h total`,
                badgeVariant: "default",
                open: false,
                children: ($$renderer4) => {
                  $$renderer4.push(`<div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="bg-brutal text-white text-left"><th class="px-3 py-2 font-bold uppercase tracking-wider text-xs">Component</th><th class="px-3 py-2 font-bold uppercase tracking-wider text-xs text-right">Base Hours</th><th class="px-3 py-2 font-bold uppercase tracking-wider text-xs">Unit</th><th class="px-3 py-2 font-bold uppercase tracking-wider text-xs">Phase</th></tr></thead><tbody><!--[-->`);
                  const each_array_3 = ensure_array_like(effortHours());
                  for (let i = 0, $$length = each_array_3.length; i < $$length; i++) {
                    let item = each_array_3[i];
                    $$renderer4.push(`<tr${attr_class(`border-b border-border-light hover:bg-surface-hover transition-colors ${stringify(i % 2 === 0 ? "bg-surface" : "bg-bg")}`)}><td class="px-3 py-2 font-bold">${escape_html(item.component_name || item.component_id)}</td><td class="px-3 py-2 text-right font-mono font-bold">${escape_html(item.base_hours)}</td><td class="px-3 py-2 text-text-muted font-mono">${escape_html(item.unit || "—")}</td><td class="px-3 py-2 text-text-muted font-mono text-xs">${escape_html(item.phase_id || "—")}</td></tr>`);
                  }
                  $$renderer4.push(`<!--]--></tbody></table></div>`);
                }
              });
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--> `);
            if (gotchaPatterns().length > 0) {
              $$renderer3.push("<!--[-->");
              CollapsibleSection($$renderer3, {
                title: "Gotcha Patterns",
                subtitle: `${stringify(gotchaPatterns().length)} patterns`,
                badge: `${stringify(gotchaPatterns().reduce((s, g) => s + (g.hours_impact ?? 0), 0))}h risk`,
                badgeVariant: "danger",
                open: false,
                children: ($$renderer4) => {
                  $$renderer4.push(`<div class="space-y-2"><!--[-->`);
                  const each_array_4 = ensure_array_like(gotchaPatterns());
                  for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
                    let gotcha = each_array_4[$$index_4];
                    $$renderer4.push(`<div class="flex gap-3 px-3 py-2.5 border-2 border-border-light hover:border-brutal transition-colors bg-surface"><div class="shrink-0 mt-0.5">`);
                    Badge($$renderer4, {
                      variant: riskVariant[gotcha.risk_level] ?? "warning",
                      children: ($$renderer5) => {
                        $$renderer5.push(`<!---->${escape_html(gotcha.risk_level)}`);
                      }
                    });
                    $$renderer4.push(`<!----></div> <div class="flex-1 min-w-0"><div class="flex items-center gap-2"><span class="text-sm font-bold">${escape_html(gotcha.pattern_condition || gotcha.pattern_id)}</span> <span class="text-xs font-mono font-bold text-danger">+${escape_html(gotcha.hours_impact ?? 0)}h</span></div> `);
                    if (gotcha.description) {
                      $$renderer4.push("<!--[-->");
                      $$renderer4.push(`<p class="text-xs text-text-secondary mt-0.5">${escape_html(gotcha.description)}</p>`);
                    } else {
                      $$renderer4.push("<!--[!-->");
                    }
                    $$renderer4.push(`<!--]--> `);
                    if (gotcha.mitigation) {
                      $$renderer4.push("<!--[-->");
                      $$renderer4.push(`<p class="text-xs text-success mt-1"><span class="font-bold uppercase tracking-wider">Mitigation:</span> ${escape_html(gotcha.mitigation)}</p>`);
                    } else {
                      $$renderer4.push("<!--[!-->");
                    }
                    $$renderer4.push(`<!--]--></div></div>`);
                  }
                  $$renderer4.push(`<!--]--></div>`);
                }
              });
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--> `);
            if (multipliers().length > 0) {
              $$renderer3.push("<!--[-->");
              CollapsibleSection($$renderer3, {
                title: "Complexity Multipliers",
                subtitle: `${stringify(multipliers().length)} multipliers`,
                open: false,
                children: ($$renderer4) => {
                  $$renderer4.push(`<div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="bg-brutal text-white text-left"><th class="px-3 py-2 font-bold uppercase tracking-wider text-xs">Condition</th><th class="px-3 py-2 font-bold uppercase tracking-wider text-xs text-right">Factor</th><th class="px-3 py-2 font-bold uppercase tracking-wider text-xs">Reason</th></tr></thead><tbody><!--[-->`);
                  const each_array_5 = ensure_array_like(multipliers());
                  for (let i = 0, $$length = each_array_5.length; i < $$length; i++) {
                    let m = each_array_5[i];
                    $$renderer4.push(`<tr${attr_class(`border-b border-border-light hover:bg-surface-hover transition-colors ${stringify(i % 2 === 0 ? "bg-surface" : "bg-bg")}`)}><td class="px-3 py-2 font-bold">${escape_html(m.condition || m.multiplier_id)}</td><td${attr_class(`px-3 py-2 text-right font-mono font-bold ${stringify(m.factor > 1.3 ? "text-danger" : m.factor > 1 ? "text-warning" : "text-success")}`)}>${escape_html(m.factor)}x</td><td class="px-3 py-2 text-text-secondary text-xs">${escape_html(m.reason || "—")}</td></tr>`);
                  }
                  $$renderer4.push(`<!--]--></tbody></table></div>`);
                }
              });
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--> `);
            if (dependencyChains().length > 0) {
              $$renderer3.push("<!--[-->");
              CollapsibleSection($$renderer3, {
                title: "Dependency Chains",
                subtitle: `${stringify(dependencyChains().length)} chains`,
                open: false,
                children: ($$renderer4) => {
                  $$renderer4.push(`<div class="space-y-2"><!--[-->`);
                  const each_array_6 = ensure_array_like(dependencyChains());
                  for (let $$index_6 = 0, $$length = each_array_6.length; $$index_6 < $$length; $$index_6++) {
                    let chain = each_array_6[$$index_6];
                    $$renderer4.push(`<div class="flex items-center gap-3 px-3 py-2 border-2 border-border-light bg-surface text-sm"><span class="font-bold font-mono">${escape_html(chain.predecessor)}</span> <span class="text-text-muted">→</span> <span class="font-mono text-text-secondary">${escape_html(jsonArray(chain.successors).join(", "))}</span> `);
                    Badge($$renderer4, {
                      variant: chain.dependency_type === "hard" ? "danger" : "warning",
                      children: ($$renderer5) => {
                        $$renderer5.push(`<!---->${escape_html(chain.dependency_type)}`);
                      }
                    });
                    $$renderer4.push(`<!----></div>`);
                  }
                  $$renderer4.push(`<!--]--></div>`);
                }
              });
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--> `);
            if (phaseMappings().length > 0) {
              $$renderer3.push("<!--[-->");
              CollapsibleSection($$renderer3, {
                title: "Phase Mappings",
                subtitle: `${stringify(phaseMappings().length)} phases`,
                open: false,
                children: ($$renderer4) => {
                  $$renderer4.push(`<div class="space-y-2"><!--[-->`);
                  const each_array_7 = ensure_array_like(phaseMappings().toSorted((a, b) => (a.phase_order ?? 0) - (b.phase_order ?? 0)));
                  for (let $$index_7 = 0, $$length = each_array_7.length; $$index_7 < $$length; $$index_7++) {
                    let phase = each_array_7[$$index_7];
                    $$renderer4.push(`<div class="flex items-start gap-3 px-3 py-2.5 border-2 border-border-light bg-surface"><span class="brutal-border-thin bg-primary text-white text-xs font-bold px-2 py-0.5 shrink-0">${escape_html(phase.phase_order ?? "?")}</span> <div class="flex-1 min-w-0"><span class="text-sm font-bold">${escape_html(phase.phase_name || phase.phase_id)}</span> `);
                    if (jsonArray(phase.component_ids).length > 0) {
                      $$renderer4.push("<!--[-->");
                      $$renderer4.push(`<p class="text-xs text-text-muted mt-0.5 font-mono">${escape_html(jsonArray(phase.component_ids).join(", "))}</p>`);
                    } else {
                      $$renderer4.push("<!--[!-->");
                    }
                    $$renderer4.push(`<!--]--></div></div>`);
                  }
                  $$renderer4.push(`<!--]--></div>`);
                }
              });
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--> `);
            if (roles().length > 0) {
              $$renderer3.push("<!--[-->");
              CollapsibleSection($$renderer3, {
                title: "Roles",
                subtitle: `${stringify(roles().length)} roles`,
                open: false,
                children: ($$renderer4) => {
                  $$renderer4.push(`<div class="grid gap-3 md:grid-cols-2"><!--[-->`);
                  const each_array_8 = ensure_array_like(roles());
                  for (let $$index_8 = 0, $$length = each_array_8.length; $$index_8 < $$length; $$index_8++) {
                    let role = each_array_8[$$index_8];
                    $$renderer4.push(`<div class="px-3 py-2.5 border-2 border-border-light bg-surface"><span class="text-sm font-bold">${escape_html(role.role_id)}</span> `);
                    if (role.description) {
                      $$renderer4.push("<!--[-->");
                      $$renderer4.push(`<p class="text-xs text-text-secondary mt-0.5">${escape_html(role.description)}</p>`);
                    } else {
                      $$renderer4.push("<!--[!-->");
                    }
                    $$renderer4.push(`<!--]--> `);
                    if (role.typical_rate_range) {
                      $$renderer4.push("<!--[-->");
                      $$renderer4.push(`<p class="text-xs font-mono text-text-muted mt-1">${escape_html(role.typical_rate_range)}</p>`);
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
            $$renderer3.push(`<!--]-->`);
          }
          $$renderer3.push(`<!--]--></div>`);
        } else if (activeTab === "sources") {
          $$renderer3.push("<!--[2-->");
          $$renderer3.push(`<div id="panel-sources" role="tabpanel">`);
          if (sourceUrls().length === 0) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="py-12 text-center"><div class="flex h-14 w-14 mx-auto items-center justify-center brutal-border-thin bg-bg text-2xl text-text-muted mb-4">🔗</div> <p class="text-sm font-bold text-text-muted">No sources documented yet.</p> <p class="text-xs text-text-muted mt-1">Research agents attach source URLs for traceability.</p></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
            $$renderer3.push(`<div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="bg-brutal text-white text-left"><th class="px-3 py-2 font-bold uppercase tracking-wider text-xs">Title</th><th class="px-3 py-2 font-bold uppercase tracking-wider text-xs">Type</th><th class="px-3 py-2 font-bold uppercase tracking-wider text-xs">Confidence</th><th class="px-3 py-2 font-bold uppercase tracking-wider text-xs text-center">Accessible</th></tr></thead><tbody><!--[-->`);
            const each_array_9 = ensure_array_like(sourceUrls());
            for (let i = 0, $$length = each_array_9.length; i < $$length; i++) {
              let src = each_array_9[i];
              $$renderer3.push(`<tr${attr_class(`border-b border-border-light hover:bg-surface-hover transition-colors ${stringify(i % 2 === 0 ? "bg-surface" : "bg-bg")}`)}><td class="px-3 py-2">`);
              if (src.url) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<a${attr("href", src.url)} target="_blank" rel="noopener noreferrer" class="font-bold text-primary hover:text-primary-hover no-underline hover:underline">${escape_html(src.title || src.url)}</a>`);
              } else {
                $$renderer3.push("<!--[!-->");
                $$renderer3.push(`<span class="font-bold">${escape_html(src.title || "Untitled")}</span>`);
              }
              $$renderer3.push(`<!--]--></td><td class="px-3 py-2">`);
              if (src.source_type) {
                $$renderer3.push("<!--[-->");
                Badge($$renderer3, {
                  variant: "muted",
                  children: ($$renderer4) => {
                    $$renderer4.push(`<!---->${escape_html(src.source_type)}`);
                  }
                });
              } else {
                $$renderer3.push("<!--[!-->");
                $$renderer3.push(`<span class="text-text-muted">—</span>`);
              }
              $$renderer3.push(`<!--]--></td><td class="px-3 py-2">`);
              if (src.confidence) {
                $$renderer3.push("<!--[-->");
                Badge($$renderer3, {
                  variant: confidenceVariant[src.confidence] ?? "muted",
                  children: ($$renderer4) => {
                    $$renderer4.push(`<!---->${escape_html(src.confidence)}`);
                  }
                });
              } else {
                $$renderer3.push("<!--[!-->");
                $$renderer3.push(`<span class="text-text-muted">—</span>`);
              }
              $$renderer3.push(`<!--]--></td><td class="px-3 py-2 text-center">`);
              if (src.still_accessible === true) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<span class="text-success font-bold" title="URL verified accessible">✓</span>`);
              } else if (src.still_accessible === false) {
                $$renderer3.push("<!--[1-->");
                $$renderer3.push(`<span class="text-danger font-bold" title="URL not accessible">✗</span>`);
              } else {
                $$renderer3.push("<!--[!-->");
                $$renderer3.push(`<span class="text-text-muted" title="Not checked">—</span>`);
              }
              $$renderer3.push(`<!--]--></td></tr>`);
            }
            $$renderer3.push(`<!--]--></tbody></table></div>`);
          }
          $$renderer3.push(`<!--]--></div>`);
        } else if (activeTab === "details") {
          $$renderer3.push("<!--[3-->");
          $$renderer3.push(`<div id="panel-details" role="tabpanel" class="space-y-6"><div class="grid gap-4 md:grid-cols-2"><div class="px-4 py-3 border-2 border-border-light bg-surface"><h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-2">Supported Versions</h4> `);
          if (jsonArray(pack.supported_versions).length > 0) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="flex flex-wrap gap-1.5"><!--[-->`);
            const each_array_10 = ensure_array_like(jsonArray(pack.supported_versions));
            for (let $$index_10 = 0, $$length = each_array_10.length; $$index_10 < $$length; $$index_10++) {
              let ver = each_array_10[$$index_10];
              $$renderer3.push(`<span class="brutal-border-thin px-2 py-0.5 text-xs font-mono bg-bg">${escape_html(ver)}</span>`);
            }
            $$renderer3.push(`<!--]--></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
            $$renderer3.push(`<p class="text-sm text-text-muted">—</p>`);
          }
          $$renderer3.push(`<!--]--></div> <div class="px-4 py-3 border-2 border-border-light bg-surface"><h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-2">EOL Versions</h4> `);
          if (pack.eol_versions && typeof pack.eol_versions === "object" && Object.keys(pack.eol_versions).length > 0) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="flex flex-wrap gap-1.5"><!--[-->`);
            const each_array_11 = ensure_array_like(Object.entries(pack.eol_versions));
            for (let $$index_11 = 0, $$length = each_array_11.length; $$index_11 < $$length; $$index_11++) {
              let [ver, date] = each_array_11[$$index_11];
              Tooltip($$renderer3, {
                text: `EOL: ${stringify(date)}`,
                position: "bottom",
                children: ($$renderer4) => {
                  $$renderer4.push(`<span class="brutal-border-thin px-2 py-0.5 text-xs font-mono bg-danger-light text-danger border-danger cursor-help">${escape_html(ver)}</span>`);
                }
              });
            }
            $$renderer3.push(`<!--]--></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
            $$renderer3.push(`<p class="text-sm text-text-muted">—</p>`);
          }
          $$renderer3.push(`<!--]--></div> <div class="px-4 py-3 border-2 border-border-light bg-surface"><h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-2">Deployment Models</h4> `);
          if (jsonArray(pack.deployment_models).length > 0) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="flex flex-wrap gap-1.5"><!--[-->`);
            const each_array_12 = ensure_array_like(jsonArray(pack.deployment_models));
            for (let $$index_12 = 0, $$length = each_array_12.length; $$index_12 < $$length; $$index_12++) {
              let model = each_array_12[$$index_12];
              Badge($$renderer3, {
                variant: "info",
                children: ($$renderer4) => {
                  $$renderer4.push(`<!---->${escape_html(model)}`);
                }
              });
            }
            $$renderer3.push(`<!--]--></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
            $$renderer3.push(`<p class="text-sm text-text-muted">—</p>`);
          }
          $$renderer3.push(`<!--]--></div> <div class="px-4 py-3 border-2 border-border-light bg-surface"><h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-2">Valid Topologies</h4> `);
          if (jsonArray(pack.valid_topologies).length > 0) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="flex flex-wrap gap-1.5"><!--[-->`);
            const each_array_13 = ensure_array_like(jsonArray(pack.valid_topologies));
            for (let $$index_13 = 0, $$length = each_array_13.length; $$index_13 < $$length; $$index_13++) {
              let topo = each_array_13[$$index_13];
              $$renderer3.push(`<span class="brutal-border-thin px-2 py-0.5 text-xs font-mono bg-bg">${escape_html(topo)}</span>`);
            }
            $$renderer3.push(`<!--]--></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
            $$renderer3.push(`<p class="text-sm text-text-muted">—</p>`);
          }
          $$renderer3.push(`<!--]--></div> <div class="px-4 py-3 border-2 border-border-light bg-surface"><h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-2">Compatible Targets</h4> `);
          if (jsonArray(pack.compatible_targets).length > 0) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="flex flex-wrap gap-1.5"><!--[-->`);
            const each_array_14 = ensure_array_like(jsonArray(pack.compatible_targets));
            for (let $$index_14 = 0, $$length = each_array_14.length; $$index_14 < $$length; $$index_14++) {
              let target = each_array_14[$$index_14];
              Badge($$renderer3, {
                variant: "success",
                children: ($$renderer4) => {
                  $$renderer4.push(`<!---->${escape_html(target)}`);
                }
              });
            }
            $$renderer3.push(`<!--]--></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
            $$renderer3.push(`<p class="text-sm text-text-muted">—</p>`);
          }
          $$renderer3.push(`<!--]--></div> <div class="px-4 py-3 border-2 border-border-light bg-surface"><h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-2">Compatible Infrastructure</h4> `);
          if (jsonArray(pack.compatible_infrastructure).length > 0) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="flex flex-wrap gap-1.5"><!--[-->`);
            const each_array_15 = ensure_array_like(jsonArray(pack.compatible_infrastructure));
            for (let $$index_15 = 0, $$length = each_array_15.length; $$index_15 < $$length; $$index_15++) {
              let infra = each_array_15[$$index_15];
              Badge($$renderer3, {
                variant: "warning",
                children: ($$renderer4) => {
                  $$renderer4.push(`<!---->${escape_html(infra)}`);
                }
              });
            }
            $$renderer3.push(`<!--]--></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
            $$renderer3.push(`<p class="text-sm text-text-muted">—</p>`);
          }
          $$renderer3.push(`<!--]--></div> <div class="px-4 py-3 border-2 border-border-light bg-surface"><h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-2">Required Services</h4> `);
          if (jsonArray(pack.required_services).length > 0) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="flex flex-wrap gap-1.5"><!--[-->`);
            const each_array_16 = ensure_array_like(jsonArray(pack.required_services));
            for (let $$index_16 = 0, $$length = each_array_16.length; $$index_16 < $$length; $$index_16++) {
              let svc = each_array_16[$$index_16];
              Badge($$renderer3, {
                variant: "danger",
                children: ($$renderer4) => {
                  $$renderer4.push(`<!---->${escape_html(svc)}`);
                }
              });
            }
            $$renderer3.push(`<!--]--></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
            $$renderer3.push(`<p class="text-sm text-text-muted">—</p>`);
          }
          $$renderer3.push(`<!--]--></div> <div class="px-4 py-3 border-2 border-border-light bg-surface"><h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-2">Optional Services</h4> `);
          if (jsonArray(pack.optional_services).length > 0) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="flex flex-wrap gap-1.5"><!--[-->`);
            const each_array_17 = ensure_array_like(jsonArray(pack.optional_services));
            for (let $$index_17 = 0, $$length = each_array_17.length; $$index_17 < $$length; $$index_17++) {
              let svc = each_array_17[$$index_17];
              Badge($$renderer3, {
                variant: "muted",
                children: ($$renderer4) => {
                  $$renderer4.push(`<!---->${escape_html(svc)}`);
                }
              });
            }
            $$renderer3.push(`<!--]--></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
            $$renderer3.push(`<p class="text-sm text-text-muted">—</p>`);
          }
          $$renderer3.push(`<!--]--></div></div> <div class="border-t-2 border-border-light pt-4"><div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs"><div><span class="font-bold uppercase tracking-wider text-text-muted block">Pack ID</span> <span class="font-mono mt-0.5 block break-all">${escape_html(pack.id)}</span></div> <div><span class="font-bold uppercase tracking-wider text-text-muted block">Version</span> <span class="font-mono mt-0.5 block">${escape_html(pack.pack_version ?? "—")}</span></div> <div><span class="font-bold uppercase tracking-wider text-text-muted block">Created</span> <span class="font-mono mt-0.5 block">${escape_html(formatDate(pack.created_at))}</span></div> <div><span class="font-bold uppercase tracking-wider text-text-muted block">Last Researched</span> <span class="font-mono mt-0.5 block">${escape_html(formatDate(pack.last_researched))}</span></div></div></div></div>`);
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]-->`);
      }
    });
    $$renderer2.push(`<!----></div></div> `);
    {
      let footer = function($$renderer3) {
        $$renderer3.push(`<div class="flex justify-end gap-3"><button class="brutal-border-thin px-4 py-2 text-xs font-bold uppercase tracking-wider bg-surface hover:bg-surface-hover transition-colors">Cancel</button> <button${attr("disabled", researching, true)} class="brutal-border-thin px-4 py-2 text-xs font-bold uppercase tracking-wider bg-warning text-white border-warning hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">${escape_html("Queue Research")}</button></div>`);
      };
      Modal($$renderer2, {
        open: showResearchModal,
        onclose: () => showResearchModal = false,
        title: "Re-Research Pack",
        size: "sm",
        footer,
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="space-y-4"><p class="text-sm">Queue <strong>${escape_html(pack.name)}</strong> for re-research? This will:</p> <ul class="text-sm space-y-1 ml-4 list-disc text-text-secondary"><li>Reset confidence to `);
          Badge($$renderer3, {
            variant: "muted",
            children: ($$renderer4) => {
              $$renderer4.push(`<!---->draft`);
            }
          });
          $$renderer3.push(`<!----></li> <li>Clear the last researched timestamp</li> <li>Research agents will pick up this pack on their next run</li></ul></div>`);
        }
      });
    }
    $$renderer2.push(`<!---->`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-LtoFXNlx.js.map
