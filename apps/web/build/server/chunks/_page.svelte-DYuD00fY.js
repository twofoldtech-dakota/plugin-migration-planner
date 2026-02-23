import { aa as head, a1 as derived, ab as escape_html, ac as ensure_array_like, ae as attr_style, a7 as stringify, a6 as attr_class, ad as attr } from './index4-DG1itRH8.js';
import './root-DQzxKDPP.js';
import './state.svelte-DeAIIc79.js';
import { C as Card } from './Card-w7RlWvYA.js';
import { B as Badge } from './Badge-CWejdkwM.js';
import { M as Modal } from './Modal-CbyfWmrz.js';
import { P as ProgressBar } from './ProgressBar-BC01P1QB.js';
import { T as Tabs } from './Tabs-CIZXvs-S.js';
import { T as Tooltip } from './Tooltip-hZ63yG7F.js';
import './index-server-CVwIEJCx.js';

function InlineEdit($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { value, type = "text", onsave, placeholder = "", size = "md" } = $$props;
    const textSize = derived(() => size === "sm" ? "text-xs" : "text-sm");
    {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<button type="button"${attr_class(`${stringify(textSize())} font-mono font-bold text-left px-1.5 py-0.5 w-full border-2 border-transparent hover:border-border-light hover:bg-surface-hover cursor-text transition-colors duration-100 focus-visible:outline-2 focus-visible:outline-primary`)} title="Click to edit">${escape_html(value || placeholder)}</button>`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    let client = {};
    let proficiencies = {};
    const categories = derived(() => data.catalog?.categories ?? {});
    const proficiencyLevels = derived(() => data.catalog?.proficiency_levels ?? ["none", "beginner", "intermediate", "advanced", "expert"]);
    const platformCatIds = ["azure_services", "aws_services"];
    const generalCatIds = derived(() => Object.keys(categories()).filter((id) => !platformCatIds.includes(id)));
    let activeTab = "general";
    const tabs = derived(() => [
      {
        id: "general",
        label: "General Tech",
        count: generalCatIds().length
      },
      {
        id: "platform",
        label: "Platform Skills",
        count: platformCatIds.length
      },
      {
        id: "ai",
        label: "AI Tooling",
        count: data.aiTools?.length ?? 0
      },
      {
        id: "assessments",
        label: "Assessments",
        count: data.linkedAssessments.length
      }
    ]);
    const aiTools = derived(() => data.aiTools ?? []);
    const aiCategoryNames = {
      discovery_assessment: "Discovery & Assessment",
      data_migration: "Data Migration",
      storage_migration: "Storage Migration",
      code_assistance: "Code Assistance",
      infrastructure_automation: "Infrastructure Automation",
      testing_validation: "Testing & Validation",
      monitoring_observability: "Monitoring & Observability",
      security_compliance: "Security & Compliance",
      cicd_devops: "CI/CD & DevOps",
      backup_dr: "Backup & DR",
      network_dns: "Network & DNS"
    };
    function getAiCategories() {
      const map = /* @__PURE__ */ new Map();
      for (const tool of aiTools()) {
        const catId = tool.category ?? "other";
        if (!map.has(catId)) {
          const catName = aiCategoryNames[catId] ?? catId.replace(/_/g, " ");
          map.set(catId, { name: catName, tools: [] });
        }
        map.get(catId).tools.push(tool);
      }
      return [...map.entries()];
    }
    const aiCategoryList = getAiCategories();
    const AI_PREFIX = "aitool_";
    const stances = ["include", "exclude", "open"];
    function getToolStance(toolId) {
      const val = proficiencies[AI_PREFIX + toolId]?.proficiency;
      if (val === "include" || val === "exclude" || val === "open") return val;
      return "open";
    }
    let showDeleteModal = false;
    let deleting = false;
    async function saveField(field, value) {
      const updated = { ...client, [field]: value };
      client[field] = value;
      await fetch(`/api/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: updated.name,
          industry: updated.industry,
          notes: updated.notes
        })
      });
    }
    let proficiencyStats = derived(() => {
      const allCatIds = Object.keys(categories());
      let filled = 0;
      let total = allCatIds.length;
      let levelSum = 0;
      for (const catId of allCatIds) {
        const p = proficiencies[catId]?.proficiency ?? "none";
        if (p !== "none") {
          filled++;
          levelSum += proficiencyLevels().indexOf(p);
        }
      }
      const avgLevel = filled > 0 ? levelSum / filled : 0;
      return { filled, total, avgLevel };
    });
    let aiToolStats = derived(() => {
      let included = 0;
      let excluded = 0;
      let open = 0;
      for (const tool of aiTools()) {
        const s = getToolStance(tool.id);
        if (s === "include") included++;
        else if (s === "exclude") excluded++;
        else open++;
      }
      return { included, excluded, open, total: aiTools().length };
    });
    const proficiencyColors = {
      none: "bg-border-light text-text-muted border-border-light",
      beginner: "bg-danger-light text-danger border-danger",
      intermediate: "bg-warning-light text-warning border-warning",
      advanced: "bg-info-light text-info border-info",
      expert: "bg-success-light text-success border-success"
    };
    const stanceConfig = {
      include: {
        label: "Include",
        color: "bg-success-light text-success border-success",
        icon: "+"
      },
      open: {
        label: "Open",
        color: "bg-warning-light text-warning border-warning",
        icon: "~"
      },
      exclude: {
        label: "Exclude",
        color: "bg-danger-light text-danger border-danger",
        icon: "-"
      }
    };
    function proficiencyBarWidth(level) {
      const idx = proficiencyLevels().indexOf(level);
      if (idx <= 0) return 0;
      return idx / (proficiencyLevels().length - 1) * 100;
    }
    function proficiencyBarColor(level) {
      switch (level) {
        case "expert":
          return "bg-success";
        case "advanced":
          return "bg-info";
        case "intermediate":
          return "bg-warning";
        case "beginner":
          return "bg-danger";
        default:
          return "bg-border-light";
      }
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
    const statusVariant = {
      planning: "default",
      discovery: "info",
      analysis: "warning",
      estimation: "default",
      complete: "success"
    };
    const industryVariant = {
      healthcare: "danger",
      finance: "warning",
      retail: "info",
      technology: "success",
      education: "default",
      manufacturing: "warning",
      government: "info"
    };
    function parseIndustries(raw) {
      return raw.split(",").map((s) => s.trim()).filter(Boolean);
    }
    head("ohfhwn", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html(client.name)} | Clients | MigrateIQ</title>`);
      });
    });
    $$renderer2.push(`<div class="mx-auto max-w-7xl px-6 py-8 animate-enter"><a href="/clients" class="inline-flex items-center gap-1.5 text-sm font-bold text-text-secondary hover:text-primary transition-colors no-underline mb-6">← All Clients</a> `);
    Card($$renderer2, {
      children: ($$renderer3) => {
        $$renderer3.push(`<div class="flex flex-col gap-5"><div class="flex items-start justify-between gap-4"><div class="flex-1 min-w-0"><div class="flex items-center gap-3 mb-1"><div class="flex h-10 w-10 items-center justify-center brutal-border-thin bg-primary-light text-lg text-primary font-extrabold shrink-0">${escape_html(client.name.charAt(0).toUpperCase())}</div> <div class="flex-1 min-w-0">`);
        InlineEdit($$renderer3, {
          value: client.name,
          onsave: (v) => saveField("name", v),
          placeholder: "Client name"
        });
        $$renderer3.push(`<!----></div> `);
        if (client.industry) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<div class="flex flex-wrap gap-1"><!--[-->`);
          const each_array = ensure_array_like(parseIndustries(client.industry));
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let tag = each_array[$$index];
            Badge($$renderer3, {
              variant: industryVariant[tag.toLowerCase()] ?? "default",
              children: ($$renderer4) => {
                $$renderer4.push(`<!---->${escape_html(tag)}`);
              }
            });
          }
          $$renderer3.push(`<!--]--></div>`);
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--></div></div> <button class="brutal-border-thin px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-danger border-danger hover:bg-danger-light transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Delete</button></div> <div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div><span class="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-0.5">Industry</span> `);
        InlineEdit($$renderer3, {
          value: client.industry,
          onsave: (v) => saveField("industry", v),
          placeholder: "e.g. Healthcare, Finance, Retail (comma-separated)",
          size: "sm"
        });
        $$renderer3.push(`<!----></div> <div><span class="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-0.5">Notes</span> `);
        InlineEdit($$renderer3, {
          value: client.notes,
          onsave: (v) => saveField("notes", v),
          placeholder: "Key contacts, special considerations...",
          size: "sm"
        });
        $$renderer3.push(`<!----></div></div> <div class="flex flex-wrap gap-3 border-t-2 border-border-light pt-4">`);
        Tooltip($$renderer3, {
          text: "Technology categories with proficiency set above 'none'",
          position: "bottom",
          children: ($$renderer4) => {
            $$renderer4.push(`<div class="flex items-center gap-2 brutal-border-thin px-3 py-1.5 bg-bg cursor-help"><span class="text-[10px] font-bold uppercase tracking-wider text-text-muted">Proficiencies</span> <span class="text-sm font-extrabold font-mono">${escape_html(proficiencyStats().filled)}/${escape_html(proficiencyStats().total)}</span></div>`);
          }
        });
        $$renderer3.push(`<!----> `);
        Tooltip($$renderer3, {
          text: "AI tools marked as Include for this client",
          position: "bottom",
          children: ($$renderer4) => {
            $$renderer4.push(`<div class="flex items-center gap-2 brutal-border-thin px-3 py-1.5 bg-bg cursor-help"><span class="text-[10px] font-bold uppercase tracking-wider text-text-muted">AI Included</span> <span class="text-sm font-extrabold font-mono text-success">${escape_html(aiToolStats().included)}</span></div>`);
          }
        });
        $$renderer3.push(`<!----> `);
        Tooltip($$renderer3, {
          text: "AI tools excluded by this client",
          position: "bottom",
          children: ($$renderer4) => {
            $$renderer4.push(`<div class="flex items-center gap-2 brutal-border-thin px-3 py-1.5 bg-bg cursor-help"><span class="text-[10px] font-bold uppercase tracking-wider text-text-muted">AI Excluded</span> <span class="text-sm font-extrabold font-mono text-danger">${escape_html(aiToolStats().excluded)}</span></div>`);
          }
        });
        $$renderer3.push(`<!----> `);
        Tooltip($$renderer3, {
          text: "Assessments linked to this client",
          position: "bottom",
          children: ($$renderer4) => {
            $$renderer4.push(`<div class="flex items-center gap-2 brutal-border-thin px-3 py-1.5 bg-bg cursor-help"><span class="text-[10px] font-bold uppercase tracking-wider text-text-muted">Assessments</span> <span class="text-sm font-extrabold font-mono">${escape_html(data.linkedAssessments.length)}</span></div>`);
          }
        });
        $$renderer3.push(`<!----> <div class="flex-1"></div> <span class="text-xs font-mono text-text-muted self-center">Created ${escape_html(formatDate(client.created_at))} · Updated ${escape_html(formatDate(client.updated_at))}</span></div></div>`);
      }
    });
    $$renderer2.push(`<!----> <div class="mt-8">`);
    Tabs($$renderer2, {
      tabs: tabs(),
      active: activeTab,
      onchange: (id) => activeTab = id,
      children: ($$renderer3) => {
        if (activeTab === "general") {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<div id="panel-general" role="tabpanel"><p class="text-xs text-text-secondary mb-4">Rate your client team's proficiency in each technology area. This calibrates adoption overhead in estimates.</p> <div class="space-y-1"><!--[-->`);
          const each_array_1 = ensure_array_like(generalCatIds());
          for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
            let catId = each_array_1[i];
            const cat = categories()[catId];
            const current = proficiencies[catId]?.proficiency ?? "none";
            if (cat) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="flex items-center gap-4 px-4 py-3 border-2 border-border-light hover:border-brutal transition-colors duration-100 bg-surface"${attr_style(`--stagger-i: ${stringify(i)};`)}><div class="flex-1 min-w-0"><div class="flex items-center gap-2"><span class="text-sm font-bold">${escape_html(cat.name)}</span> <span class="text-xs text-text-muted hidden sm:inline">${escape_html(cat.description)}</span></div> <div class="mt-1.5 flex items-center gap-2"><div class="h-1.5 flex-1 max-w-[120px] bg-border-light"><div${attr_class(`h-full ${stringify(proficiencyBarColor(current))} transition-all duration-200`)}${attr_style(`width: ${stringify(proficiencyBarWidth(current))}%`)}></div></div> `);
              if (current !== "none") {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<span${attr_class(`text-[10px] font-bold uppercase tracking-wider ${stringify(proficiencyColors[current].split(" ")[1])}`)}>${escape_html(current)}</span>`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--></div></div> <div class="flex gap-0.5 shrink-0"><!--[-->`);
              const each_array_2 = ensure_array_like(proficiencyLevels());
              for (let $$index_1 = 0, $$length2 = each_array_2.length; $$index_1 < $$length2; $$index_1++) {
                let level = each_array_2[$$index_1];
                $$renderer3.push(`<button${attr_class(`w-7 h-7 flex items-center justify-center text-[9px] font-extrabold uppercase border-2 transition-all duration-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${stringify(current === level ? proficiencyColors[level] + " -translate-y-px shadow-sm" : "border-transparent text-text-muted hover:border-border-light hover:bg-surface-hover")}`)}${attr("aria-label", `${stringify(cat.name)}: ${stringify(level)}`)}${attr("title", level)}>${escape_html(level.charAt(0).toUpperCase())}</button>`);
              }
              $$renderer3.push(`<!--]--></div></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]-->`);
          }
          $$renderer3.push(`<!--]--></div></div>`);
        } else if (activeTab === "platform") {
          $$renderer3.push("<!--[1-->");
          $$renderer3.push(`<div id="panel-platform" role="tabpanel"><p class="text-xs text-text-secondary mb-4">Rate familiarity with each cloud platform. This affects infrastructure migration overhead calculations.</p> <div class="grid gap-4 md:grid-cols-2"><!--[-->`);
          const each_array_3 = ensure_array_like(platformCatIds);
          for (let $$index_4 = 0, $$length = each_array_3.length; $$index_4 < $$length; $$index_4++) {
            let catId = each_array_3[$$index_4];
            const cat = categories()[catId];
            const current = proficiencies[catId]?.proficiency ?? "none";
            if (cat) {
              $$renderer3.push("<!--[-->");
              Card($$renderer3, {
                children: ($$renderer4) => {
                  $$renderer4.push(`<div class="space-y-4"><div><h3 class="text-sm font-extrabold uppercase tracking-wider">${escape_html(cat.name)}</h3> <p class="text-xs text-text-secondary mt-1">${escape_html(cat.description)}</p></div> <div class="space-y-2"><!--[-->`);
                  const each_array_4 = ensure_array_like(proficiencyLevels());
                  for (let $$index_3 = 0, $$length2 = each_array_4.length; $$index_3 < $$length2; $$index_3++) {
                    let level = each_array_4[$$index_3];
                    const isActive = current === level;
                    $$renderer4.push(`<button${attr_class(`w-full flex items-center gap-3 px-3 py-2.5 border-2 text-left transition-all duration-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${stringify(isActive ? proficiencyColors[level] + " -translate-x-px -translate-y-px shadow-sm" : "border-border-light hover:border-brutal hover:bg-surface-hover")}`)}><div${attr_class(`w-2.5 h-2.5 border-2 ${stringify(isActive ? proficiencyColors[level] : "border-border-light bg-bg")}`)}></div> <span class="text-sm font-bold capitalize flex-1">${escape_html(level)}</span> `);
                    if (isActive) {
                      $$renderer4.push("<!--[-->");
                      $$renderer4.push(`<span class="text-[10px] font-mono text-text-muted">${escape_html(cat.adoption_base_hours)}h base overhead</span>`);
                    } else {
                      $$renderer4.push("<!--[!-->");
                    }
                    $$renderer4.push(`<!--]--></button>`);
                  }
                  $$renderer4.push(`<!--]--></div> <div class="border-t-2 border-border-light pt-3"><div class="flex items-center gap-2"><span class="text-xs font-bold text-text-muted">Level:</span> <div class="flex-1 h-2 bg-border-light"><div${attr_class(`h-full ${stringify(proficiencyBarColor(current))} transition-all duration-300`)}${attr_style(`width: ${stringify(proficiencyBarWidth(current))}%`)}></div></div> `);
                  Badge($$renderer4, {
                    variant: current === "none" ? "default" : current === "expert" || current === "advanced" ? "success" : current === "intermediate" ? "warning" : "danger",
                    children: ($$renderer5) => {
                      $$renderer5.push(`<!---->${escape_html(current)}`);
                    }
                  });
                  $$renderer4.push(`<!----></div></div></div>`);
                }
              });
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]-->`);
          }
          $$renderer3.push(`<!--]--></div></div>`);
        } else if (activeTab === "ai") {
          $$renderer3.push("<!--[2-->");
          $$renderer3.push(`<div id="panel-ai" role="tabpanel"><div class="flex items-start justify-between gap-4 mb-4"><p class="text-xs text-text-secondary">Set your client's stance on each AI/automation tool. These preferences carry into assessment estimates.</p> <div class="flex gap-1 shrink-0"><!--[-->`);
          const each_array_5 = ensure_array_like(stances);
          for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
            let stance = each_array_5[$$index_5];
            const cfg = stanceConfig[stance];
            $$renderer3.push(`<button${attr_class(`brutal-border-thin px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all duration-100 hover:-translate-y-px hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${stringify(cfg.color)}`)}>All ${escape_html(cfg.label)}</button>`);
          }
          $$renderer3.push(`<!--]--></div></div> `);
          if (aiTools().length > 0) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="flex h-2 mb-5 border-2 border-brutal overflow-hidden">`);
            if (aiToolStats().included > 0) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="bg-success transition-all duration-300"${attr_style(`width: ${stringify(aiToolStats().included / aiToolStats().total * 100)}%`)}></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--> `);
            if (aiToolStats().open > 0) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="bg-warning transition-all duration-300"${attr_style(`width: ${stringify(aiToolStats().open / aiToolStats().total * 100)}%`)}></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--> `);
            if (aiToolStats().excluded > 0) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="bg-danger transition-all duration-300"${attr_style(`width: ${stringify(aiToolStats().excluded / aiToolStats().total * 100)}%`)}></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--></div> <div class="flex gap-4 mb-5 text-[10px] font-bold uppercase tracking-wider"><span class="flex items-center gap-1.5"><span class="w-3 h-3 bg-success border border-brutal"></span> Include (${escape_html(aiToolStats().included)})</span> <span class="flex items-center gap-1.5"><span class="w-3 h-3 bg-warning border border-brutal"></span> Open (${escape_html(aiToolStats().open)})</span> <span class="flex items-center gap-1.5"><span class="w-3 h-3 bg-danger border border-brutal"></span> Exclude (${escape_html(aiToolStats().excluded)})</span></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]--> <div class="space-y-6"><!--[-->`);
          const each_array_6 = ensure_array_like(aiCategoryList);
          for (let $$index_8 = 0, $$length = each_array_6.length; $$index_8 < $$length; $$index_8++) {
            let [catId, group] = each_array_6[$$index_8];
            $$renderer3.push(`<div><h3 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-2 pb-1 border-b-2 border-border-light">${escape_html(group.name)}</h3> <div class="space-y-1"><!--[-->`);
            const each_array_7 = ensure_array_like(group.tools);
            for (let $$index_7 = 0, $$length2 = each_array_7.length; $$index_7 < $$length2; $$index_7++) {
              let tool = each_array_7[$$index_7];
              const stance = getToolStance(tool.id);
              $$renderer3.push(`<div class="flex items-center gap-3 px-4 py-2.5 border-2 border-border-light hover:border-brutal transition-colors duration-100 bg-surface"><div class="flex-1 min-w-0"><div class="flex items-center gap-2"><span class="text-sm font-bold">${escape_html(tool.name)}</span> <span class="text-[10px] font-mono text-text-muted">${escape_html(tool.vendor)}</span> `);
              if (tool.recommendation === "recommended") {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<span class="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-success-light text-success border border-success leading-none">Rec</span>`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--> `);
              if (tool.cost?.type === "free") {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<span class="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-info-light text-info border border-info leading-none">Free</span>`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--></div> <p class="text-[11px] text-text-secondary mt-0.5 truncate">${escape_html(tool.description)}</p></div> `);
              Tooltip($$renderer3, {
                text: `Expected hours saved: ${stringify(tool.hours_saved?.optimistic ?? "?")} optimistic / ${stringify(tool.hours_saved?.expected ?? "?")} expected / ${stringify(tool.hours_saved?.pessimistic ?? "?")} pessimistic`,
                position: "left",
                children: ($$renderer4) => {
                  $$renderer4.push(`<span class="text-xs font-mono font-bold text-success shrink-0 cursor-help">-${escape_html(tool.hours_saved?.expected ?? 0)}h</span>`);
                }
              });
              $$renderer3.push(`<!----> <div class="flex gap-0.5 shrink-0"><!--[-->`);
              const each_array_8 = ensure_array_like(stances);
              for (let $$index_6 = 0, $$length3 = each_array_8.length; $$index_6 < $$length3; $$index_6++) {
                let s = each_array_8[$$index_6];
                const sCfg = stanceConfig[s];
                $$renderer3.push(`<button${attr_class(`px-2 py-1 text-[10px] font-bold uppercase border-2 transition-all duration-100 min-w-[4rem] text-center focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${stringify(stance === s ? sCfg.color + " -translate-y-px shadow-sm" : "border-transparent text-text-muted hover:border-border-light hover:bg-surface-hover")}`)}${attr("aria-label", `${stringify(tool.name)}: ${stringify(s)}`)}>${escape_html(sCfg.label)}</button>`);
              }
              $$renderer3.push(`<!--]--></div></div>`);
            }
            $$renderer3.push(`<!--]--></div></div>`);
          }
          $$renderer3.push(`<!--]--></div></div>`);
        } else if (activeTab === "assessments") {
          $$renderer3.push("<!--[3-->");
          $$renderer3.push(`<div id="panel-assessments" role="tabpanel">`);
          if (data.linkedAssessments.length === 0) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="py-12 text-center"><div class="flex h-14 w-14 mx-auto items-center justify-center brutal-border-thin bg-bg text-2xl text-text-muted mb-4">☰</div> <p class="text-sm font-bold text-text-muted">No assessments linked to this client.</p> <p class="text-xs text-text-muted mt-1">Create an assessment and select this client to link it.</p></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
            $$renderer3.push(`<div class="grid gap-4 lg:grid-cols-2 stagger-grid"><!--[-->`);
            const each_array_9 = ensure_array_like(data.linkedAssessments);
            for (let i = 0, $$length = each_array_9.length; i < $$length; i++) {
              let project = each_array_9[i];
              $$renderer3.push(`<a${attr("href", `/assessments/${stringify(project.id)}`)} class="no-underline group"${attr_style(`--stagger-i: ${stringify(i)};`)}>`);
              Card($$renderer3, {
                hover: true,
                children: ($$renderer4) => {
                  $$renderer4.push(`<div class="flex flex-col gap-3"><div class="flex items-start justify-between gap-3"><h3 class="font-extrabold text-text truncate group-hover:text-primary transition-colors">${escape_html(project.project_name)}</h3> `);
                  Badge($$renderer4, {
                    variant: statusVariant[project.status] ?? "default",
                    children: ($$renderer5) => {
                      $$renderer5.push(`<!---->${escape_html(project.status)}`);
                    }
                  });
                  $$renderer4.push(`<!----></div> <div class="grid grid-cols-3 gap-3 text-xs"><div><span class="font-bold uppercase tracking-wider text-text-muted">Confidence</span> `);
                  if (project.confidence_score != null) {
                    $$renderer4.push("<!--[-->");
                    $$renderer4.push(`<p class="font-extrabold font-mono mt-0.5">${escape_html(Math.round(project.confidence_score))}%</p> `);
                    ProgressBar($$renderer4, {
                      value: project.confidence_score,
                      variant: confidenceVariant(project.confidence_score)
                    });
                    $$renderer4.push(`<!---->`);
                  } else {
                    $$renderer4.push("<!--[!-->");
                    $$renderer4.push(`<p class="font-mono text-text-muted mt-0.5">—</p>`);
                  }
                  $$renderer4.push(`<!--]--></div> <div><span class="font-bold uppercase tracking-wider text-text-muted">Est. Hours</span> <p class="font-extrabold font-mono mt-0.5">${escape_html(project.total_expected_hours != null ? formatHours(project.total_expected_hours) : "—")}</p></div> <div><span class="font-bold uppercase tracking-wider text-text-muted">Created</span> <p class="font-mono text-text-secondary mt-0.5">${escape_html(formatDate(project.created_at))}</p></div></div></div>`);
                }
              });
              $$renderer3.push(`<!----></a>`);
            }
            $$renderer3.push(`<!--]--></div>`);
          }
          $$renderer3.push(`<!--]--></div>`);
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]-->`);
      }
    });
    $$renderer2.push(`<!----></div></div> `);
    {
      let footer = function($$renderer3) {
        $$renderer3.push(`<div class="flex justify-end gap-3"><button class="brutal-border-thin px-4 py-2 text-xs font-bold uppercase tracking-wider bg-surface hover:bg-surface-hover transition-colors">Cancel</button> <button${attr("disabled", deleting, true)} class="brutal-border-thin px-4 py-2 text-xs font-bold uppercase tracking-wider bg-danger text-white border-danger hover:opacity-90 transition-colors disabled:opacity-50">${escape_html("Delete Client")}</button></div>`);
      };
      Modal($$renderer2, {
        open: showDeleteModal,
        onclose: () => showDeleteModal = false,
        title: "Delete Client",
        size: "sm",
        footer,
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="space-y-4"><p class="text-sm">Are you sure you want to delete <strong>${escape_html(client.name)}</strong>? This action cannot be undone.</p> `);
          if (data.linkedAssessments.length > 0) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="brutal-border-thin bg-warning-light p-3 text-xs"><strong>Warning:</strong> This client has ${escape_html(data.linkedAssessments.length)} linked assessment${escape_html(data.linkedAssessments.length === 1 ? "" : "s")}.
				The assessments will not be deleted, but their client link will be removed.</div>`);
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]--></div>`);
        }
      });
    }
    $$renderer2.push(`<!---->`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-DYuD00fY.js.map
