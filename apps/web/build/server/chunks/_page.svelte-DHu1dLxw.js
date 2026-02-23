import { aa as head, ac as ensure_array_like, ab as escape_html, ad as attr, a6 as attr_class, a7 as stringify, a1 as derived, ae as attr_style } from './index4-DG1itRH8.js';
import { g as goto } from './client-Cm3t_ao5.js';
import { p as page } from './index3-fupcZyp6.js';
import { C as Card } from './Card-w7RlWvYA.js';
import { B as Badge } from './Badge-CWejdkwM.js';
import { M as Modal } from './Modal-CbyfWmrz.js';
import { marked } from 'marked';
import { T as Tooltip } from './Tooltip-hZ63yG7F.js';
import './state.svelte-DeAIIc79.js';
import './root-DQzxKDPP.js';
import './index-mV5xf0Xo.js';
import './index-server-CVwIEJCx.js';

function html(value) {
  var html2 = String(value ?? "");
  var open = "<!---->";
  return open + html2 + "<!---->";
}
function MarkdownRenderer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { content, class: className = "" } = $$props;
    const html$1 = derived(() => marked.parse(content, { gfm: true, breaks: false }));
    $$renderer2.push(`<div${attr_class(`md-root ${stringify(className)}`, "svelte-14fnod5")}>${html(html$1())}</div>`);
  });
}
function WorkBreakdownTree($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { items, onEdit, onDelete, onAddChild } = $$props;
    let collapsed = {};
    let editingTitle = null;
    let editValue = "";
    const typeIcons = {
      epic: "■",
      // filled square
      feature: "◆",
      // diamond
      story: "●",
      // circle
      task: "▶",
      // triangle
      spike: "⚡"
      // lightning
    };
    const typeColors = {
      epic: "text-primary",
      feature: "text-[#7c3aed]",
      story: "text-text",
      task: "text-text-muted",
      spike: "text-warning"
    };
    const priorityVariant = {
      critical: "danger",
      high: "warning",
      medium: "default",
      low: "muted"
    };
    const flatCount = derived(() => countItems(items));
    const totalHours = derived(() => sumHours(items));
    const typeCounts = derived(() => countByType(items));
    function countItems(list) {
      return list.reduce((s, i) => s + 1 + countItems(i.children ?? []), 0);
    }
    function sumHours(list) {
      return list.reduce(
        (s, i) => {
          if ((i.children ?? []).length > 0) return s + sumHours(i.children);
          return s + i.hours;
        },
        0
      );
    }
    function countByType(list) {
      const counts = {};
      for (const item of list) {
        counts[item.type] = (counts[item.type] ?? 0) + 1;
        const childCounts = countByType(item.children ?? []);
        for (const [t, c] of Object.entries(childCounts)) {
          counts[t] = (counts[t] ?? 0) + c;
        }
      }
      return counts;
    }
    function hoursDelta(item) {
      return item.hours - item.base_hours;
    }
    function treeNode($$renderer3, item, depth) {
      const hasChildren = (item.children ?? []).length > 0;
      const isCollapsed = collapsed[item.id];
      const delta = hoursDelta(item);
      const isEditing = editingTitle === item.id;
      $$renderer3.push(`<div role="treeitem"${attr("aria-expanded", hasChildren ? !isCollapsed : void 0)}${attr_class(`border-2 border-brutal bg-bg transition-all duration-100 ${stringify(depth === 0 ? "shadow-[2px_2px_0_#000]" : "shadow-[1px_1px_0_#000]")} ${stringify(item.source === "custom" ? "border-l-4 border-l-success" : "")}`)}${attr_style(`margin-left: ${stringify(depth * 20)}px`)}><div class="flex items-center gap-2 px-3 py-2">`);
      if (hasChildren) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<button class="w-5 h-5 flex items-center justify-center text-xs text-text-muted hover:text-text transition-colors"${attr("aria-label", `${stringify(isCollapsed ? "Expand" : "Collapse")} ${stringify(item.title)}`)}><span${attr_class(`inline-block transition-transform duration-150 ${stringify(isCollapsed ? "" : "rotate-90")}`)}>▶</span></button>`);
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push(`<span class="w-5"></span>`);
      }
      $$renderer3.push(`<!--]--> `);
      Tooltip($$renderer3, {
        text: item.type,
        position: "top",
        children: ($$renderer4) => {
          $$renderer4.push(`<span${attr_class(`text-sm ${stringify(typeColors[item.type] ?? "text-text-muted")} cursor-default`)}>${escape_html(typeIcons[item.type] ?? "○")}</span>`);
        }
      });
      $$renderer3.push(`<!----> `);
      if (isEditing) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<input type="text"${attr("value", editValue)} class="flex-1 text-sm font-bold bg-bg border-b-2 border-primary focus:outline-none font-mono" autofocus=""/>`);
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push(`<button class="flex-1 text-left text-sm font-bold truncate hover:text-primary transition-colors" title="Double-click to edit">${escape_html(item.title)}</button>`);
      }
      $$renderer3.push(`<!--]--> <div class="flex items-center gap-1.5 shrink-0">`);
      if (item.role) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<span class="text-[10px] font-bold font-mono text-text-muted bg-surface-raised px-1.5 py-0.5 border border-border-light">${escape_html(item.role)}</span>`);
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--> `);
      if (item.priority !== "medium") {
        $$renderer3.push("<!--[-->");
        Badge($$renderer3, {
          variant: priorityVariant[item.priority] ?? "default",
          children: ($$renderer4) => {
            $$renderer4.push(`<!---->${escape_html(item.priority)}`);
          }
        });
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--> `);
      if (item.source === "custom") {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<span class="text-[10px] font-bold text-success">custom</span>`);
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--> <div class="text-right min-w-[50px]"><span class="text-sm font-extrabold font-mono">${escape_html(Math.round(item.hours * 10) / 10)}h</span> `);
      if (delta !== 0) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<span${attr_class(`block text-[10px] font-bold font-mono ${stringify(delta > 0 ? "text-danger" : "text-success")}`)}>${escape_html(delta > 0 ? "+" : "")}${escape_html(Math.round(delta * 10) / 10)}h</span>`);
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--></div> <div class="flex items-center gap-0.5 ml-1">`);
      if (onEdit) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<button class="w-6 h-6 flex items-center justify-center text-[10px] text-text-muted hover:text-primary transition-colors"${attr("aria-label", `Edit ${stringify(item.title)}`)}>✎</button>`);
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--> `);
      if (onAddChild) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<button class="w-6 h-6 flex items-center justify-center text-[10px] text-text-muted hover:text-success transition-colors"${attr("aria-label", `Add child to ${stringify(item.title)}`)}>+</button>`);
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--> `);
      if (onDelete) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<button class="w-6 h-6 flex items-center justify-center text-[10px] text-text-muted hover:text-danger transition-colors"${attr("aria-label", `Delete ${stringify(item.title)}`)}>✕</button>`);
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--></div></div></div></div> `);
      if (hasChildren && !isCollapsed) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(item.children);
        for (let $$index_2 = 0, $$length = each_array.length; $$index_2 < $$length; $$index_2++) {
          let child = each_array[$$index_2];
          treeNode($$renderer3, child, depth + 1);
        }
        $$renderer3.push(`<!--]-->`);
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]-->`);
    }
    $$renderer2.push(`<div class="brutal-border bg-surface px-4 py-2.5 flex items-center gap-5 flex-wrap mb-4"><div class="flex items-baseline gap-1.5"><span class="text-xl font-extrabold font-mono">${escape_html(flatCount())}</span> <span class="text-xs font-bold uppercase tracking-wider text-text-muted">items</span></div> <span class="w-px h-5 bg-border-light" aria-hidden="true"></span> <div class="flex items-baseline gap-1.5"><span class="text-sm font-extrabold font-mono">${escape_html(Math.round(totalHours()).toLocaleString())}h</span> <span class="text-xs text-text-muted">total</span></div> <span class="w-px h-5 bg-border-light" aria-hidden="true"></span> <div class="flex items-center gap-2 flex-wrap"><!--[-->`);
    const each_array_1 = ensure_array_like(Object.entries(typeCounts()));
    for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
      let [type, count] = each_array_1[$$index];
      $$renderer2.push(`<span${attr_class(`text-[10px] font-bold uppercase tracking-wider ${stringify(typeColors[type] ?? "text-text-muted")}`)}>${escape_html(typeIcons[type] ?? "")} ${escape_html(count)} ${escape_html(type)}${escape_html(count !== 1 ? "s" : "")}</span>`);
    }
    $$renderer2.push(`<!--]--></div></div> <div class="space-y-1" role="tree" aria-label="Work breakdown structure"><!--[-->`);
    const each_array_2 = ensure_array_like(items);
    for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
      let item = each_array_2[$$index_1];
      treeNode($$renderer2, item, 0);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function WorkItemEditor($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { open, item, onclose } = $$props;
    let form = {
      type: "story",
      title: "",
      description: "",
      hours: 0,
      role: "",
      priority: "medium",
      confidence: "medium",
      labels: "",
      acceptance_criteria: ""
    };
    let saving = false;
    const isNew = derived(() => !item?.id);
    {
      let footer = function($$renderer3) {
        $$renderer3.push(`<div class="flex items-center justify-end gap-3"><button class="px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider brutal-border-thin bg-surface text-text-muted hover:bg-surface-raised transition-colors"${attr("disabled", saving, true)}>Cancel</button> <button class="px-5 py-1.5 text-xs font-extrabold uppercase tracking-wider bg-primary text-white border-2 border-brutal shadow-[2px_2px_0_#000] hover:bg-primary-hover hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_#000] active:translate-x-px active:translate-y-px active:shadow-none transition-all duration-100 disabled:opacity-50"${attr("disabled", !form.title.trim(), true)}>${escape_html(isNew() ? "Create" : "Save")}</button></div>`);
      };
      Modal($$renderer2, {
        open,
        onclose,
        title: isNew() ? "New Work Item" : "Edit Work Item",
        footer,
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="space-y-4"><div class="grid grid-cols-2 gap-3"><div><label class="block text-[10px] font-extrabold uppercase tracking-wider text-text-muted mb-1">Type</label> `);
          $$renderer3.select(
            {
              value: form.type,
              class: "w-full brutal-border-thin px-2 py-1.5 text-sm bg-bg focus:outline-none focus:ring-2 focus:ring-primary"
            },
            ($$renderer4) => {
              $$renderer4.option({ value: "epic" }, ($$renderer5) => {
                $$renderer5.push(`Epic`);
              });
              $$renderer4.option({ value: "feature" }, ($$renderer5) => {
                $$renderer5.push(`Feature`);
              });
              $$renderer4.option({ value: "story" }, ($$renderer5) => {
                $$renderer5.push(`Story`);
              });
              $$renderer4.option({ value: "task" }, ($$renderer5) => {
                $$renderer5.push(`Task`);
              });
              $$renderer4.option({ value: "spike" }, ($$renderer5) => {
                $$renderer5.push(`Spike`);
              });
            }
          );
          $$renderer3.push(`</div> <div><label class="block text-[10px] font-extrabold uppercase tracking-wider text-text-muted mb-1">Hours</label> <input type="number"${attr("value", form.hours)} min="0" step="0.5" class="w-full brutal-border-thin px-2 py-1.5 text-sm font-mono bg-bg focus:outline-none focus:ring-2 focus:ring-primary [appearance:textfield] [&amp;::-webkit-inner-spin-button]:appearance-none"/></div></div> <div><label class="block text-[10px] font-extrabold uppercase tracking-wider text-text-muted mb-1">Title</label> <input type="text"${attr("value", form.title)} class="w-full brutal-border-thin px-2 py-1.5 text-sm bg-bg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Work item title"/></div> <div><label class="block text-[10px] font-extrabold uppercase tracking-wider text-text-muted mb-1">Description</label> <textarea rows="3" class="w-full brutal-border-thin px-2 py-1.5 text-sm font-mono bg-bg focus:outline-none focus:ring-2 focus:ring-primary resize-y" placeholder="Optional description">`);
          const $$body = escape_html(form.description);
          if ($$body) {
            $$renderer3.push(`${$$body}`);
          }
          $$renderer3.push(`</textarea></div> <div class="grid grid-cols-3 gap-3"><div><label class="block text-[10px] font-extrabold uppercase tracking-wider text-text-muted mb-1">Role</label> <input type="text"${attr("value", form.role)} class="w-full brutal-border-thin px-2 py-1.5 text-sm font-mono bg-bg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. dba"/></div> <div><label class="block text-[10px] font-extrabold uppercase tracking-wider text-text-muted mb-1">Priority</label> `);
          $$renderer3.select(
            {
              value: form.priority,
              class: "w-full brutal-border-thin px-2 py-1.5 text-sm bg-bg focus:outline-none focus:ring-2 focus:ring-primary"
            },
            ($$renderer4) => {
              $$renderer4.option({ value: "critical" }, ($$renderer5) => {
                $$renderer5.push(`Critical`);
              });
              $$renderer4.option({ value: "high" }, ($$renderer5) => {
                $$renderer5.push(`High`);
              });
              $$renderer4.option({ value: "medium" }, ($$renderer5) => {
                $$renderer5.push(`Medium`);
              });
              $$renderer4.option({ value: "low" }, ($$renderer5) => {
                $$renderer5.push(`Low`);
              });
            }
          );
          $$renderer3.push(`</div> <div><label class="block text-[10px] font-extrabold uppercase tracking-wider text-text-muted mb-1">Confidence</label> `);
          $$renderer3.select(
            {
              value: form.confidence,
              class: "w-full brutal-border-thin px-2 py-1.5 text-sm bg-bg focus:outline-none focus:ring-2 focus:ring-primary"
            },
            ($$renderer4) => {
              $$renderer4.option({ value: "high" }, ($$renderer5) => {
                $$renderer5.push(`High`);
              });
              $$renderer4.option({ value: "medium" }, ($$renderer5) => {
                $$renderer5.push(`Medium`);
              });
              $$renderer4.option({ value: "low" }, ($$renderer5) => {
                $$renderer5.push(`Low`);
              });
            }
          );
          $$renderer3.push(`</div></div> <div><label class="block text-[10px] font-extrabold uppercase tracking-wider text-text-muted mb-1">Labels <span class="font-normal">(comma-separated)</span></label> <input type="text"${attr("value", form.labels)} class="w-full brutal-border-thin px-2 py-1.5 text-sm font-mono bg-bg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. phase, component"/></div> <div><label class="block text-[10px] font-extrabold uppercase tracking-wider text-text-muted mb-1">Acceptance Criteria <span class="font-normal">(one per line)</span></label> <textarea rows="3" class="w-full brutal-border-thin px-2 py-1.5 text-sm font-mono bg-bg focus:outline-none focus:ring-2 focus:ring-primary resize-y" placeholder="One criterion per line">`);
          const $$body_1 = escape_html(form.acceptance_criteria);
          if ($$body_1) {
            $$renderer3.push(`${$$body_1}`);
          }
          $$renderer3.push(`</textarea></div></div>`);
        }
      });
    }
  });
}
function TeamComposition($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { roles } = $$props;
    let editingCell = null;
    let editValue = "";
    const totalHours = derived(() => roles.reduce((s, r) => s + r.total_hours, 0));
    const totalHeadcount = derived(() => roles.reduce((s, r) => s + r.headcount, 0));
    const costLow = derived(() => roles.reduce((s, r) => s + r.total_hours * r.rate_min, 0));
    const costHigh = derived(() => roles.reduce((s, r) => s + r.total_hours * r.rate_max, 0));
    const allocationColors = {
      "full-time": "bg-success-light text-success border-success",
      "part-time": "bg-warning-light text-warning border-[#a16207]",
      contractor: "bg-primary-light text-primary border-primary"
    };
    const seniorityColors = {
      senior: "bg-[#faf5ff] text-[#7c3aed] border-[#7c3aed]",
      mid: "bg-surface text-text-muted border-border-light",
      junior: "bg-surface text-text-faint border-border-light"
    };
    $$renderer2.push(`<div class="brutal-border bg-surface px-4 py-2.5 flex items-center gap-5 flex-wrap mb-4"><div class="flex items-baseline gap-1.5"><span class="text-xl font-extrabold font-mono">${escape_html(roles.length)}</span> <span class="text-xs font-bold uppercase tracking-wider text-text-muted">roles</span></div> <span class="w-px h-5 bg-border-light" aria-hidden="true"></span> <div class="flex items-baseline gap-1.5"><span class="text-sm font-extrabold font-mono">${escape_html(totalHeadcount())}</span> <span class="text-xs text-text-muted">headcount</span></div> <span class="w-px h-5 bg-border-light" aria-hidden="true"></span> <div class="flex items-baseline gap-1.5"><span class="text-sm font-extrabold font-mono">${escape_html(Math.round(totalHours()).toLocaleString())}h</span> <span class="text-xs text-text-muted">total</span></div> <span class="w-px h-5 bg-border-light" aria-hidden="true"></span> <div class="flex items-baseline gap-1.5"><span class="text-sm font-extrabold font-mono">$${escape_html(Math.round(costLow()).toLocaleString())}</span> <span class="text-xs text-text-muted">–</span> <span class="text-sm font-extrabold font-mono">$${escape_html(Math.round(costHigh()).toLocaleString())}</span></div></div> <div class="brutal-border overflow-x-auto shadow-[3px_3px_0_#000]"><table class="w-full text-sm"><thead><tr class="bg-[#1a1a1a] text-white"><th class="px-3 py-2 text-left text-[10px] font-extrabold uppercase tracking-wider">Role</th><th class="px-3 py-2 text-right text-[10px] font-extrabold uppercase tracking-wider">Hours</th><th class="px-3 py-2 text-center text-[10px] font-extrabold uppercase tracking-wider">HC</th><th class="px-3 py-2 text-center text-[10px] font-extrabold uppercase tracking-wider">Allocation</th><th class="px-3 py-2 text-center text-[10px] font-extrabold uppercase tracking-wider">Seniority</th><th class="px-3 py-2 text-right text-[10px] font-extrabold uppercase tracking-wider">Rate Range</th><th class="px-3 py-2 text-left text-[10px] font-extrabold uppercase tracking-wider">Notes</th><th class="px-2 py-2 w-8"></th></tr></thead><tbody><!--[-->`);
    const each_array = ensure_array_like(roles);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let role = each_array[$$index];
      $$renderer2.push(`<tr class="border-t-2 border-brutal bg-bg hover:bg-surface-hover transition-colors"><td class="px-3 py-2 font-bold">`);
      if (editingCell === `${role.id}-role_name`) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<input type="text"${attr("value", editValue)} class="w-full bg-bg border-b-2 border-primary focus:outline-none text-sm font-bold" autofocus=""/>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<button class="text-left hover:text-primary transition-colors">${escape_html(role.role_name)}</button>`);
      }
      $$renderer2.push(`<!--]--></td><td class="px-3 py-2 text-right font-mono font-extrabold">`);
      if (editingCell === `${role.id}-total_hours`) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<input type="number"${attr("value", editValue)} min="0" step="0.5" class="w-16 bg-bg border-b-2 border-primary focus:outline-none text-sm font-mono text-right [appearance:textfield] [&amp;::-webkit-inner-spin-button]:appearance-none" autofocus=""/>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<button class="hover:text-primary transition-colors">${escape_html(Math.round(role.total_hours))}h</button>`);
      }
      $$renderer2.push(`<!--]--></td><td class="px-3 py-2 text-center font-mono font-bold">`);
      if (editingCell === `${role.id}-headcount`) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<input type="number"${attr("value", editValue)} min="1" class="w-10 bg-bg border-b-2 border-primary focus:outline-none text-sm font-mono text-center [appearance:textfield] [&amp;::-webkit-inner-spin-button]:appearance-none" autofocus=""/>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<button class="hover:text-primary transition-colors">${escape_html(role.headcount)}</button>`);
      }
      $$renderer2.push(`<!--]--></td><td class="px-3 py-2 text-center"><span${attr_class(`inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase border ${stringify(allocationColors[role.allocation] ?? "bg-surface text-text-muted border-border-light")}`)}>${escape_html(role.allocation)}</span></td><td class="px-3 py-2 text-center"><span${attr_class(`inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase border ${stringify(seniorityColors[role.seniority] ?? "bg-surface text-text-muted border-border-light")}`)}>${escape_html(role.seniority)}</span></td><td class="px-3 py-2 text-right font-mono text-xs text-text-muted">$${escape_html(role.rate_min)}–$${escape_html(role.rate_max)}/h</td><td class="px-3 py-2 text-xs text-text-muted max-w-[200px] truncate">${escape_html(role.notes)}</td><td class="px-2 py-2 text-center"><button class="text-[10px] text-text-muted hover:text-danger transition-colors"${attr("aria-label", `Delete ${stringify(role.role_name)}`)}>✕</button></td></tr>`);
    }
    $$renderer2.push(`<!--]--></tbody></table></div> <div class="mt-3 flex justify-end"><button class="px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider brutal-border-thin bg-surface text-text-muted hover:bg-surface-raised hover:text-text transition-colors">+ Add Role</button></div>`);
  });
}
function PhaseStaffingChart($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { staffing } = $$props;
    const roleColors = [
      "#4f46e5",
      // indigo
      "#7c3aed",
      // violet
      "#ea580c",
      // orange
      "#16a34a",
      // green
      "#0891b2",
      // cyan
      "#dc2626",
      // red
      "#ca8a04",
      // yellow
      "#6366f1"
      // blue
    ];
    const allRoles = derived(() => [
      ...new Set(staffing.flatMap((p) => p.roles.map((r) => r.role_id)))
    ].map((id) => {
      const role = staffing.flatMap((p) => p.roles).find((r) => r.role_id === id);
      return { id, name: role?.role_name ?? id };
    }));
    const maxHeadcount = derived(() => Math.max(1, ...staffing.map((p) => p.total_headcount)));
    const barWidth = derived(() => Math.max(40, Math.floor(600 / Math.max(staffing.length, 1))));
    const chartWidth = derived(() => staffing.length * (barWidth() + 12) + 60);
    const chartHeight = 200;
    const barMaxHeight = 160;
    function roleColor(roleId) {
      const idx = allRoles().findIndex((r) => r.id === roleId);
      return roleColors[idx % roleColors.length];
    }
    function cumulativeOffset(roles, index) {
      let sum = 0;
      for (let i = 0; i < index; i++) {
        sum += roles[i].headcount / maxHeadcount() * barMaxHeight;
      }
      return sum;
    }
    if (staffing.length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="brutal-border bg-surface p-4 shadow-[2px_2px_0_#000]"><h3 class="text-[10px] font-extrabold uppercase tracking-wider text-text-muted mb-3">Phase Staffing</h3> <div class="flex flex-wrap gap-3 mb-4"><!--[-->`);
      const each_array = ensure_array_like(allRoles());
      for (let i = 0, $$length = each_array.length; i < $$length; i++) {
        let role = each_array[i];
        $$renderer2.push(`<div class="flex items-center gap-1.5"><span class="w-3 h-3 border border-brutal"${attr_style(`background: ${stringify(roleColors[i % roleColors.length])}`)}></span> <span class="text-[10px] font-bold">${escape_html(role.name)}</span></div>`);
      }
      $$renderer2.push(`<!--]--></div> <div class="overflow-x-auto"><svg${attr("width", chartWidth())}${attr("height", chartHeight + 40)} class="block"><line x1="40" y1="10" x2="40"${attr("y2", chartHeight)} stroke="var(--color-brutal)" stroke-width="2"></line><!--[-->`);
      const each_array_1 = ensure_array_like(Array.from({ length: Math.ceil(maxHeadcount()) + 1 }, (_, i) => i));
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let tick = each_array_1[$$index_1];
        const y = chartHeight - tick / maxHeadcount() * barMaxHeight;
        $$renderer2.push(`<line x1="36"${attr("y1", y)} x2="40"${attr("y2", y)} stroke="var(--color-brutal)" stroke-width="2"></line><text x="32"${attr("y", y + 4)} text-anchor="end" class="text-[10px] font-mono fill-text-muted">${escape_html(tick)}</text>`);
      }
      $$renderer2.push(`<!--]--><!--[-->`);
      const each_array_2 = ensure_array_like(staffing);
      for (let pi = 0, $$length = each_array_2.length; pi < $$length; pi++) {
        let phase = each_array_2[pi];
        const x = 55 + pi * (barWidth() + 12);
        const sortedRoles = phase.roles.sort((a, b) => b.headcount - a.headcount);
        $$renderer2.push(`<!--[-->`);
        const each_array_3 = ensure_array_like(sortedRoles);
        for (let ri = 0, $$length2 = each_array_3.length; ri < $$length2; ri++) {
          let role = each_array_3[ri];
          const segHeight = role.headcount / maxHeadcount() * barMaxHeight;
          const yOffset = cumulativeOffset(sortedRoles, ri);
          const y = chartHeight - yOffset - segHeight;
          $$renderer2.push(`<rect${attr("x", x)}${attr("y", y)}${attr("width", barWidth())}${attr("height", segHeight)}${attr("fill", roleColor(role.role_id))} stroke="var(--color-brutal)" stroke-width="2"><title>${escape_html(role.role_name)}: ${escape_html(role.headcount)} (${escape_html(role.hours)}h)</title></rect>`);
          if (segHeight > 14) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<text${attr("x", x + barWidth() / 2)}${attr("y", y + segHeight / 2 + 4)} text-anchor="middle" class="text-[10px] font-bold" fill="white">${escape_html(role.headcount)}</text>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]--><text${attr("x", x + barWidth() / 2)}${attr("y", chartHeight + 16)} text-anchor="middle" class="text-[10px] font-bold fill-text-muted">${escape_html(phase.phase_name.length > 12 ? phase.phase_name.slice(0, 10) + "..." : phase.phase_name)}</text><text${attr("x", x + barWidth() / 2)}${attr("y", chartHeight - phase.total_headcount / maxHeadcount() * barMaxHeight - 4)} text-anchor="middle" class="text-[10px] font-extrabold font-mono fill-text">${escape_html(phase.total_headcount)}</text>`);
      }
      $$renderer2.push(`<!--]--></svg></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function CostProjectionCard($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { cost } = $$props;
    function fmt(n) {
      return "$" + Math.round(n).toLocaleString();
    }
    const byRole = derived(() => Object.entries(cost.by_role ?? {}).sort(([, a], [, b]) => b.hours - a.hours));
    $$renderer2.push(`<div class="brutal-border bg-surface shadow-[3px_3px_0_#000]"><div class="grid grid-cols-3 divide-x-2 divide-brutal"><div class="p-4 text-center"><p class="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">Low</p> <p class="text-lg font-extrabold font-mono text-success mt-1">${escape_html(fmt(cost.low))}</p></div> <div class="p-4 text-center bg-primary-light/30"><p class="text-[10px] font-extrabold uppercase tracking-wider text-primary">Expected</p> <p class="text-xl font-extrabold font-mono text-primary mt-1">${escape_html(fmt(cost.expected))}</p></div> <div class="p-4 text-center"><p class="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">High</p> <p class="text-lg font-extrabold font-mono text-danger mt-1">${escape_html(fmt(cost.high))}</p></div></div> `);
    if (byRole().length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="border-t-2 border-brutal px-4 py-3"><h4 class="text-[10px] font-extrabold uppercase tracking-wider text-text-muted mb-2">By Role</h4> <div class="space-y-1.5"><!--[-->`);
      const each_array = ensure_array_like(byRole());
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let [roleId, data] = each_array[$$index];
        const pct = cost.expected > 0 ? data.expected / cost.expected * 100 : 0;
        $$renderer2.push(`<div class="flex items-center gap-3"><span class="text-xs font-bold w-40 truncate">${escape_html(roleId.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))}</span> <div class="flex-1 h-2 bg-border-light border border-brutal overflow-hidden"><div class="h-full bg-primary transition-all duration-300"${attr_style(`width: ${stringify(pct)}%`)}></div></div> <span class="text-xs font-mono text-text-muted w-24 text-right">${escape_html(fmt(data.expected))}</span> <span class="text-[10px] font-mono text-text-faint w-10 text-right">${escape_html(data.hours)}h</span></div>`);
      }
      $$renderer2.push(`<!--]--></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    const assessments = derived(() => data.assessments ?? []);
    const assessment = derived(() => data.assessment);
    const tab = derived(() => data.tab ?? "documents");
    const deliverables = derived(() => data.deliverables ?? []);
    const wbs = derived(() => data.wbs);
    const wbsVersions = derived(() => data.wbsVersions ?? []);
    const team = derived(() => data.team);
    const teamVersions = derived(() => data.teamVersions ?? []);
    const estimate = derived(() => data.estimate);
    const selectedId = derived(() => assessment()?.id ?? "");
    function selectAssessment(id) {
      if (!id) {
        goto();
      } else {
        const params = new URLSearchParams();
        params.set("assessment", id);
        params.set("tab", tab());
        goto(`/planning/?${params.toString()}`);
      }
    }
    const deliverableIcons = {
      "migration-plan.md": "&#9997;",
      "risk-register.md": "&#9888;",
      "runbook.md": "&#9654;",
      "dashboard.html": "&#9635;"
    };
    const deliverableLabels = {
      "migration-plan.md": "Migration Plan",
      "risk-register.md": "Risk Register",
      "runbook.md": "Cutover Runbook",
      "dashboard.html": "Client Dashboard"
    };
    const deliverableDescriptions = {
      "migration-plan.md": "Phased migration plan with timelines, dependencies, and role assignments",
      "risk-register.md": "Complete risk register with mitigations, contingencies, and ownership",
      "runbook.md": "Step-by-step cutover runbook with rollback procedures",
      "dashboard.html": "Self-contained HTML dashboard for client presentations"
    };
    let docModalOpen = false;
    let docModalDeliverable = null;
    let docModalContent = "";
    let docModalError = "";
    const docIsHtml = derived(() => docModalDeliverable?.name?.endsWith(".html") ?? false);
    const docIsMarkdown = derived(() => docModalDeliverable?.name?.endsWith(".md") ?? false);
    function closeDocModal() {
      docModalOpen = false;
      docModalContent = "";
      docModalError = "";
      docModalDeliverable = null;
    }
    let editorOpen = false;
    let editorItem = null;
    function openEditor(item, parentId) {
      editorItem = item ?? null;
      editorOpen = true;
    }
    async function deleteItem(itemId) {
      await fetch(`/api/planning/wbs/items/${itemId}`, { method: "DELETE" });
      goto(page.url.href, {});
    }
    function formatDate(iso) {
      return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    }
    const tabs = [
      { id: "documents", label: "Documents" },
      { id: "wbs", label: "Work Breakdown" },
      { id: "team", label: "Team" }
    ];
    head("dy79yi", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Planning${escape_html(assessment() ? ` — ${assessment().project_name}` : "")} | MigrateIQ</title>`);
      });
    });
    $$renderer2.push(`<div class="p-6 space-y-5 animate-enter"><div class="flex items-start justify-between flex-wrap gap-3"><div><h1 class="text-xl font-extrabold uppercase tracking-wider">Planning</h1> <p class="text-xs text-text-muted font-mono mt-0.5">Documents, work breakdown, and team composition</p></div> <div class="flex items-center gap-2"><label for="assessment-select" class="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">Assessment:</label> `);
    $$renderer2.select(
      {
        id: "assessment-select",
        value: selectedId(),
        onchange: (e) => selectAssessment(e.target.value),
        class: "brutal-border-thin px-3 py-1.5 text-sm font-bold bg-bg min-w-[200px] focus:outline-none focus:ring-2 focus:ring-primary"
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`Select an assessment...`);
        });
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(assessments());
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let a = each_array[$$index];
          $$renderer3.option({ value: a.id }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(a.project_name)}${escape_html(a.client_name ? ` (${a.client_name})` : "")}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</div></div> `);
    if (!assessment()) {
      $$renderer2.push("<!--[-->");
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="py-12 text-center space-y-3"><div class="inline-flex items-center justify-center w-14 h-14 brutal-border bg-primary-light text-2xl text-primary shadow-sm">⚙</div> <p class="text-base font-extrabold uppercase tracking-wider text-text-muted">Select an Assessment</p> <p class="text-sm text-text-muted max-w-sm mx-auto">Choose an assessment from the dropdown above to view its planning deliverables, work breakdown, and team composition.</p></div>`);
        }
      });
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="flex brutal-border overflow-hidden shadow-[2px_2px_0_#000]" role="tablist"><!--[-->`);
      const each_array_1 = ensure_array_like(tabs);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let t = each_array_1[$$index_1];
        $$renderer2.push(`<button role="tab"${attr("aria-selected", tab() === t.id)}${attr_class(`flex-1 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider transition-colors duration-100 ${stringify(tab() === t.id ? "bg-[#1a1a1a] text-white" : "bg-surface text-text-muted hover:bg-surface-raised")}`)}>${escape_html(t.label)}</button>`);
      }
      $$renderer2.push(`<!--]--></div> `);
      if (tab() === "documents") {
        $$renderer2.push("<!--[-->");
        if (deliverables().length === 0) {
          $$renderer2.push("<!--[-->");
          Card($$renderer2, {
            children: ($$renderer3) => {
              $$renderer3.push(`<div class="py-8 text-center"><p class="text-lg font-extrabold uppercase tracking-wider text-text-secondary">No Documents</p> <p class="mt-2 text-sm text-text-muted max-w-md mx-auto">Run <code class="brutal-border-thin bg-surface px-1.5 py-0.5 text-xs font-mono">/migrate plan</code> to generate migration documents.</p></div>`);
            }
          });
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`<div class="grid gap-4 sm:grid-cols-2"><!--[-->`);
          const each_array_2 = ensure_array_like(deliverables());
          for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
            let deliverable = each_array_2[$$index_2];
            $$renderer2.push(`<button class="text-left w-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none">`);
            Card($$renderer2, {
              hover: true,
              padding: "p-5",
              children: ($$renderer3) => {
                $$renderer3.push(`<div class="flex items-start gap-4"><div class="flex h-12 w-12 shrink-0 items-center justify-center brutal-border bg-primary-light text-2xl text-primary shadow-sm">${html(deliverableIcons[deliverable.name] ?? "&#128196;")}</div> <div class="flex-1 min-w-0"><h3 class="font-extrabold text-sm">${escape_html(deliverableLabels[deliverable.name] ?? deliverable.name)}</h3> <p class="text-xs text-text-secondary mt-0.5">${escape_html(deliverableDescriptions[deliverable.name] ?? "Generated deliverable document")}</p> <span class="text-[10px] font-mono text-text-muted truncate block mt-1">${escape_html(deliverable.file_path)}</span> `);
                if (deliverable.generated_at) {
                  $$renderer3.push("<!--[-->");
                  $$renderer3.push(`<span class="text-[10px] text-text-muted font-mono block mt-0.5">Generated: ${escape_html(formatDate(deliverable.generated_at))}</span>`);
                } else {
                  $$renderer3.push("<!--[!-->");
                }
                $$renderer3.push(`<!--]--></div> `);
                Badge($$renderer3, {
                  variant: "success",
                  children: ($$renderer4) => {
                    $$renderer4.push(`<!---->Generated`);
                  }
                });
                $$renderer3.push(`<!----></div>`);
              }
            });
            $$renderer2.push(`<!----></button>`);
          }
          $$renderer2.push(`<!--]--></div>`);
        }
        $$renderer2.push(`<!--]-->`);
      } else if (tab() === "wbs") {
        $$renderer2.push("<!--[1-->");
        $$renderer2.push(`<div class="flex items-center justify-between flex-wrap gap-3"><div class="flex items-center gap-3">`);
        if (wbs()) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<span class="text-xs font-bold text-text-muted">v${escape_html(wbs().version)} · ${escape_html(formatDate(wbs().created_at))}</span> `);
          if (wbsVersions().length > 1) {
            $$renderer2.push("<!--[-->");
            $$renderer2.select(
              {
                value: wbs().version,
                onchange: (e) => {
                  const params = new URLSearchParams(page.url.searchParams);
                  params.set("wbsVersion", e.target.value);
                  goto(`/planning/?${params.toString()}`);
                },
                class: "brutal-border-thin px-2 py-1 text-xs font-mono bg-bg"
              },
              ($$renderer3) => {
                $$renderer3.push(`<!--[-->`);
                const each_array_3 = ensure_array_like(wbsVersions());
                for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
                  let v = each_array_3[$$index_3];
                  $$renderer3.option({ value: v.version }, ($$renderer4) => {
                    $$renderer4.push(`v${escape_html(v.version)} — ${escape_html(v.total_items)} items, ${escape_html(Math.round(v.total_hours))}h`);
                  });
                }
                $$renderer3.push(`<!--]-->`);
              }
            );
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]-->`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></div> <div class="flex items-center gap-2">`);
        if (wbs()) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<a${attr("href", `/api/planning/wbs/export?assessment=${stringify(assessment().id)}&format=csv`)} class="brutal-border-thin px-3 py-1 text-xs font-bold uppercase tracking-wider bg-surface text-text-muted hover:bg-surface-raised no-underline transition-colors">CSV</a> <a${attr("href", `/api/planning/wbs/export?assessment=${stringify(assessment().id)}&format=json`)} class="brutal-border-thin px-3 py-1 text-xs font-bold uppercase tracking-wider bg-surface text-text-muted hover:bg-surface-raised no-underline transition-colors">JSON</a> <a${attr("href", `/api/planning/wbs/export?assessment=${stringify(assessment().id)}&format=md`)} class="brutal-border-thin px-3 py-1 text-xs font-bold uppercase tracking-wider bg-surface text-text-muted hover:bg-surface-raised no-underline transition-colors">MD</a>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--> <button class="px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider bg-primary text-white border-2 border-brutal shadow-[2px_2px_0_#000] hover:bg-primary-hover hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_#000] active:translate-x-px active:translate-y-px active:shadow-none transition-all duration-100 disabled:opacity-50"${attr("disabled", !estimate(), true)}>`);
        {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`${escape_html(wbs() ? "Regenerate WBS" : "Generate WBS")}`);
        }
        $$renderer2.push(`<!--]--></button></div></div> `);
        if (!estimate()) {
          $$renderer2.push("<!--[-->");
          Card($$renderer2, {
            children: ($$renderer3) => {
              $$renderer3.push(`<div class="py-8 text-center"><p class="text-lg font-extrabold uppercase tracking-wider text-text-secondary">No Estimate</p> <p class="mt-2 text-sm text-text-muted">Run an estimate first to generate the work breakdown.</p></div>`);
            }
          });
        } else if (!wbs()) {
          $$renderer2.push("<!--[1-->");
          Card($$renderer2, {
            children: ($$renderer3) => {
              $$renderer3.push(`<div class="py-8 text-center"><p class="text-lg font-extrabold uppercase tracking-wider text-text-secondary">No WBS Yet</p> <p class="mt-2 text-sm text-text-muted">Click "Generate WBS" to create a work breakdown from your estimate.</p></div>`);
            }
          });
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`<div class="flex justify-end mb-2"><button class="brutal-border-thin px-3 py-1 text-xs font-bold uppercase tracking-wider bg-surface text-text-muted hover:bg-surface-raised transition-colors">+ Add Item</button></div> `);
          WorkBreakdownTree($$renderer2, {
            items: wbs().items,
            snapshotId: wbs().id,
            onEdit: (item) => openEditor(item),
            onDelete: deleteItem,
            onAddChild: (parentId) => openEditor(void 0)
          });
          $$renderer2.push(`<!---->`);
        }
        $$renderer2.push(`<!--]-->`);
      } else if (tab() === "team") {
        $$renderer2.push("<!--[2-->");
        $$renderer2.push(`<div class="flex items-center justify-between flex-wrap gap-3"><div class="flex items-center gap-3">`);
        if (team()) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<span class="text-xs font-bold text-text-muted">v${escape_html(team().version)} · ${escape_html(formatDate(team().created_at))}</span> `);
          if (teamVersions().length > 1) {
            $$renderer2.push("<!--[-->");
            $$renderer2.select(
              {
                value: team().version,
                onchange: (e) => {
                  const params = new URLSearchParams(page.url.searchParams);
                  params.set("teamVersion", e.target.value);
                  goto(`/planning/?${params.toString()}`);
                },
                class: "brutal-border-thin px-2 py-1 text-xs font-mono bg-bg"
              },
              ($$renderer3) => {
                $$renderer3.push(`<!--[-->`);
                const each_array_4 = ensure_array_like(teamVersions());
                for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
                  let v = each_array_4[$$index_4];
                  $$renderer3.option({ value: v.version }, ($$renderer4) => {
                    $$renderer4.push(`v${escape_html(v.version)} — ${escape_html(formatDate(v.created_at))}`);
                  });
                }
                $$renderer3.push(`<!--]-->`);
              }
            );
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]-->`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></div> <div class="flex items-center gap-2">`);
        if (team()) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<a${attr("href", `/api/planning/team/export?assessment=${stringify(assessment().id)}&format=csv`)} class="brutal-border-thin px-3 py-1 text-xs font-bold uppercase tracking-wider bg-surface text-text-muted hover:bg-surface-raised no-underline transition-colors">CSV</a> <a${attr("href", `/api/planning/team/export?assessment=${stringify(assessment().id)}&format=json`)} class="brutal-border-thin px-3 py-1 text-xs font-bold uppercase tracking-wider bg-surface text-text-muted hover:bg-surface-raised no-underline transition-colors">JSON</a> <a${attr("href", `/api/planning/team/export?assessment=${stringify(assessment().id)}&format=md`)} class="brutal-border-thin px-3 py-1 text-xs font-bold uppercase tracking-wider bg-surface text-text-muted hover:bg-surface-raised no-underline transition-colors">MD</a>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--> <button class="px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider bg-primary text-white border-2 border-brutal shadow-[2px_2px_0_#000] hover:bg-primary-hover hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_#000] active:translate-x-px active:translate-y-px active:shadow-none transition-all duration-100 disabled:opacity-50"${attr("disabled", !estimate(), true)}>`);
        {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`${escape_html(team() ? "Regenerate Team" : "Generate Team")}`);
        }
        $$renderer2.push(`<!--]--></button></div></div> `);
        if (!estimate()) {
          $$renderer2.push("<!--[-->");
          Card($$renderer2, {
            children: ($$renderer3) => {
              $$renderer3.push(`<div class="py-8 text-center"><p class="text-lg font-extrabold uppercase tracking-wider text-text-secondary">No Estimate</p> <p class="mt-2 text-sm text-text-muted">Run an estimate first to generate team composition.</p></div>`);
            }
          });
        } else if (!team()) {
          $$renderer2.push("<!--[1-->");
          Card($$renderer2, {
            children: ($$renderer3) => {
              $$renderer3.push(`<div class="py-8 text-center"><p class="text-lg font-extrabold uppercase tracking-wider text-text-secondary">No Team Yet</p> <p class="mt-2 text-sm text-text-muted">Click "Generate Team" to create a team composition from your estimate.</p></div>`);
            }
          });
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`<div class="space-y-5">`);
          TeamComposition($$renderer2, {
            roles: team().roles,
            snapshotId: team().id
          });
          $$renderer2.push(`<!----> `);
          if (team().cost_projection?.expected > 0) {
            $$renderer2.push("<!--[-->");
            CostProjectionCard($$renderer2, { cost: team().cost_projection });
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--> `);
          PhaseStaffingChart($$renderer2, { staffing: team().phase_staffing ?? [] });
          $$renderer2.push(`<!----> `);
          if (team().hiring_notes?.length > 0) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<div class="brutal-border bg-surface p-4 shadow-[2px_2px_0_#000]"><h3 class="text-[10px] font-extrabold uppercase tracking-wider text-text-muted mb-2">Hiring Notes</h3> <ul class="space-y-1.5"><!--[-->`);
            const each_array_5 = ensure_array_like(team().hiring_notes);
            for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
              let note = each_array_5[$$index_5];
              $$renderer2.push(`<li class="text-xs text-text-secondary flex items-start gap-2"><span class="text-warning shrink-0 mt-0.5">⚠</span> ${escape_html(note)}</li>`);
            }
            $$renderer2.push(`<!--]--></ul></div>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--></div>`);
        }
        $$renderer2.push(`<!--]-->`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      let footer = function($$renderer3) {
        $$renderer3.push(`<div class="flex justify-end"><button class="brutal-border-thin bg-primary text-white px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider hover:bg-primary-hover transition-colors">Close</button></div>`);
      };
      Modal($$renderer2, {
        open: docModalOpen,
        onclose: closeDocModal,
        title: deliverableLabels[docModalDeliverable?.name] ?? docModalDeliverable?.name ?? "",
        size: "lg",
        footer,
        children: ($$renderer3) => {
          if (docModalError) {
            $$renderer3.push("<!--[1-->");
            $$renderer3.push(`<div class="py-12 text-center"><p class="text-sm font-bold text-danger">${escape_html(docModalError)}</p></div>`);
          } else if (docIsHtml()) {
            $$renderer3.push("<!--[2-->");
            $$renderer3.push(`<iframe${attr("srcdoc", docModalContent)}${attr("title", docModalDeliverable?.name ?? "")} class="w-full border-2 border-brutal bg-white" style="height: 70vh;" sandbox="allow-scripts allow-same-origin"></iframe>`);
          } else if (docIsMarkdown()) {
            $$renderer3.push("<!--[3-->");
            MarkdownRenderer($$renderer3, { content: docModalContent });
          } else {
            $$renderer3.push("<!--[!-->");
            $$renderer3.push(`<pre class="text-xs font-mono leading-relaxed whitespace-pre-wrap break-words text-text-secondary bg-surface-hover border-2 border-brutal p-4 overflow-x-auto">${escape_html(docModalContent)}</pre>`);
          }
          $$renderer3.push(`<!--]-->`);
        }
      });
    }
    $$renderer2.push(`<!----> `);
    WorkItemEditor($$renderer2, {
      open: editorOpen,
      item: editorItem,
      snapshotId: wbs()?.id,
      onclose: () => editorOpen = false
    });
    $$renderer2.push(`<!---->`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-DHu1dLxw.js.map
