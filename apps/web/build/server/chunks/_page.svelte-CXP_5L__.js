import { aa as head, ad as attr, ac as ensure_array_like, ab as escape_html, a1 as derived } from './index4-DG1itRH8.js';
import { K as KpiCard } from './KpiCard-D-WYJRm6.js';
import { C as Card } from './Card-w7RlWvYA.js';
import { H as HorizontalBarChart } from './HorizontalBarChart-Bhs5XmzU.js';
import { D as DonutChart } from './DonutChart-Dlc0pZpB.js';
import { A as AreaChart } from './AreaChart-BrBX_7Fj.js';
import './ProgressBar-BC01P1QB.js';
import './Tooltip-hZ63yG7F.js';
import './index-server-CVwIEJCx.js';

function HeatmapGrid($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { cells, rows, cols, colorScale = "danger", showValues = true } = $$props;
    let containerWidth = 800;
    const margin = { top: 48, right: 16, bottom: 16, left: 120 };
    const cellPad = 2;
    const minCellSize = 28;
    const valueRange = derived(() => {
      if (cells.length === 0) return { min: 0, max: 1 };
      const vals = cells.map((c) => c.value);
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      return { min, max: max === min ? min + 1 : max };
    });
    function normalize(value) {
      return (value - valueRange().min) / (valueRange().max - valueRange().min);
    }
    const cellW = derived(() => Math.max((containerWidth - margin.left - margin.right - (cols.length - 1) * cellPad) / cols.length, minCellSize));
    const cellH = derived(() => Math.max(cellW() * 0.75, minCellSize));
    const chartHeight = derived(() => margin.top + rows.length * (cellH() + cellPad) + margin.bottom);
    const cellMap = derived(() => {
      const map = /* @__PURE__ */ new Map();
      for (const cell of cells) {
        map.set(`${cell.row}|${cell.col}`, cell);
      }
      return map;
    });
    function cellColor(value) {
      const n = normalize(value);
      if (colorScale === "danger") {
        return `rgba(220, 38, 38, ${0.1 + n * 0.8})`;
      }
      if (colorScale === "primary") {
        return `rgba(79, 70, 229, ${0.1 + n * 0.8})`;
      }
      if (n < 0.5) {
        const t = n * 2;
        const r = Math.round(37 + t * (234 - 37));
        const g = Math.round(99 + t * (179 - 99));
        const b = Math.round(235 + t * (8 - 235));
        return `rgb(${r}, ${g}, ${b})`;
      } else {
        const t = (n - 0.5) * 2;
        const r = Math.round(234 + t * (220 - 234));
        const g = Math.round(179 + t * (38 - 179));
        const b = Math.round(8 + t * (38 - 8));
        return `rgb(${r}, ${g}, ${b})`;
      }
    }
    function textColor(value) {
      const n = normalize(value);
      if (colorScale === "sequential") {
        return n > 0.3 ? "white" : "var(--color-text)";
      }
      return n > 0.5 ? "white" : "var(--color-text)";
    }
    function colX(ci) {
      return margin.left + ci * (cellW() + cellPad);
    }
    function rowY(ri) {
      return margin.top + ri * (cellH() + cellPad);
    }
    let hoveredCell = null;
    const tooltipData = derived(() => {
      return null;
    });
    $$renderer2.push(`<div class="w-full">`);
    if (cells.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex items-center justify-center h-32 text-text-muted text-sm">No data available</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<svg${attr("width", containerWidth)}${attr("height", chartHeight())} class="block"><!--[-->`);
      const each_array = ensure_array_like(cols);
      for (let ci = 0, $$length = each_array.length; ci < $$length; ci++) {
        let col = each_array[ci];
        $$renderer2.push(`<text${attr("x", colX(ci) + cellW() / 2)}${attr("y", margin.top - 10)} text-anchor="middle" class="text-[10px] font-bold" fill="var(--color-text-muted)">${escape_html(col.length > 10 ? col.slice(0, 9) + "…" : col)}</text>`);
      }
      $$renderer2.push(`<!--]--><!--[-->`);
      const each_array_1 = ensure_array_like(rows);
      for (let ri = 0, $$length = each_array_1.length; ri < $$length; ri++) {
        let row = each_array_1[ri];
        $$renderer2.push(`<text${attr("x", margin.left - 8)}${attr("y", rowY(ri) + cellH() / 2 + 4)} text-anchor="end" class="text-[11px]" fill="var(--color-text-muted)">${escape_html(row.length > 16 ? row.slice(0, 15) + "…" : row)}</text><!--[-->`);
        const each_array_2 = ensure_array_like(cols);
        for (let ci = 0, $$length2 = each_array_2.length; ci < $$length2; ci++) {
          let col = each_array_2[ci];
          const cell = cellMap().get(`${row}|${col}`);
          const cx = colX(ci);
          const cy = rowY(ri);
          const isHovered = hoveredCell?.row === row && hoveredCell?.col === col;
          $$renderer2.push(`<rect${attr("x", cx)}${attr("y", cy)}${attr("width", cellW())}${attr("height", cellH())}${attr("fill", cell ? cellColor(cell.value) : "var(--color-border-light)")} rx="2"${attr("stroke", isHovered ? "var(--color-brutal)" : "none")}${attr("stroke-width", isHovered ? 2 : 0)}></rect>`);
          if (showValues && cell) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<text${attr("x", cx + cellW() / 2)}${attr("y", cy + cellH() / 2 + 4)} text-anchor="middle" class="text-[10px] font-mono font-bold"${attr("fill", textColor(cell.value))}>${escape_html(cell.label ?? cell.value.toFixed(1))}</text>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--><rect${attr("x", cx)}${attr("y", cy)}${attr("width", cellW())}${attr("height", cellH())} fill="transparent" role="presentation" class="cursor-crosshair"></rect>`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
      if (tooltipData()) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<rect${attr("x", tooltipData().x)}${attr("y", tooltipData().y)}${attr("width", tooltipData().w)} height="22" rx="3" fill="var(--color-brutal)" opacity="0.92"></rect><text${attr("x", tooltipData().x + tooltipData().w / 2)}${attr("y", tooltipData().y + 15)} text-anchor="middle" class="text-[11px] font-mono font-bold" fill="white">${escape_html(tooltipData().text)}</text>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></svg>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    head("c63w44", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Portfolio Intelligence | MigrateIQ</title>`);
      });
    });
    $$renderer2.push(`<div><p class="text-sm text-text-muted mb-6">Cross-portfolio pipeline health, risk exposure, and client distribution.</p> <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">`);
    KpiCard($$renderer2, {
      label: "Total Assessments",
      value: data.kpis.totalAssessments,
      tooltip: "Active assessments across all clients"
    });
    $$renderer2.push(`<!----> `);
    KpiCard($$renderer2, {
      label: "Total Estimated Hours",
      value: data.kpis.totalHours.toLocaleString() + "h",
      tooltip: "Sum of expected hours across all projects"
    });
    $$renderer2.push(`<!----> `);
    KpiCard($$renderer2, {
      label: "Open Risks",
      value: data.kpis.openRisks,
      variant: data.kpis.openRisks > 10 ? "danger" : data.kpis.openRisks > 5 ? "warning" : "success",
      tooltip: "Risks with status 'open' across all assessments"
    });
    $$renderer2.push(`<!----> `);
    KpiCard($$renderer2, {
      label: "Assumptions Validated",
      value: data.kpis.assumptionValidationPct + "%",
      variant: data.kpis.assumptionValidationPct >= 70 ? "success" : data.kpis.assumptionValidationPct >= 40 ? "warning" : "danger",
      progress: data.kpis.assumptionValidationPct,
      tooltip: "Percentage of assumptions that have been validated"
    });
    $$renderer2.push(`<!----></div> <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">`);
    Card($$renderer2, {
      children: ($$renderer3) => {
        $$renderer3.push(`<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4">Assessment Pipeline</h2> `);
        if (data.pipeline.some((p) => p.value > 0)) {
          $$renderer3.push("<!--[-->");
          HorizontalBarChart($$renderer3, { bars: data.pipeline });
        } else {
          $$renderer3.push("<!--[!-->");
          $$renderer3.push(`<div class="flex items-center justify-center h-32 text-text-muted text-sm">No assessments found.</div>`);
        }
        $$renderer3.push(`<!--]-->`);
      }
    });
    $$renderer2.push(`<!----> `);
    Card($$renderer2, {
      children: ($$renderer3) => {
        $$renderer3.push(`<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4">Hours by Project</h2> `);
        if (data.hoursPerProject.length > 0) {
          $$renderer3.push("<!--[-->");
          HorizontalBarChart($$renderer3, { bars: data.hoursPerProject, valueFormat: "hours" });
        } else {
          $$renderer3.push("<!--[!-->");
          $$renderer3.push(`<div class="flex items-center justify-center h-32 text-text-muted text-sm">No estimated hours yet.</div>`);
        }
        $$renderer3.push(`<!--]-->`);
      }
    });
    $$renderer2.push(`<!----> `);
    Card($$renderer2, {
      children: ($$renderer3) => {
        $$renderer3.push(`<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4">Risk Matrix</h2> `);
        if (data.riskMatrix.cells.length > 0) {
          $$renderer3.push("<!--[-->");
          HeatmapGrid($$renderer3, {
            cells: data.riskMatrix.cells,
            rows: data.riskMatrix.rows,
            cols: data.riskMatrix.cols,
            colorScale: "danger"
          });
        } else {
          $$renderer3.push("<!--[!-->");
          $$renderer3.push(`<div class="flex items-center justify-center h-32 text-text-muted text-sm">No risks recorded yet.</div>`);
        }
        $$renderer3.push(`<!--]-->`);
      }
    });
    $$renderer2.push(`<!----> `);
    Card($$renderer2, {
      children: ($$renderer3) => {
        $$renderer3.push(`<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4">Client Distribution</h2> `);
        if (data.clientDistribution.length > 0) {
          $$renderer3.push("<!--[-->");
          DonutChart($$renderer3, {
            segments: data.clientDistribution,
            centerLabel: "Clients",
            centerValue: String(data.clientDistribution.length)
          });
        } else {
          $$renderer3.push("<!--[!-->");
          $$renderer3.push(`<div class="flex items-center justify-center h-32 text-text-muted text-sm">No client data available.</div>`);
        }
        $$renderer3.push(`<!--]-->`);
      }
    });
    $$renderer2.push(`<!----></div> `);
    if (data.validationVelocity.length >= 2) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="mt-6">`);
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4">Assumption Validation Velocity</h2> `);
          AreaChart($$renderer3, {
            series: [
              {
                id: "validated",
                label: "Validated",
                color: "#10b981",
                data: data.validationVelocity
              }
            ],
            yLabel: "Count"
          });
          $$renderer3.push(`<!---->`);
        }
      });
      $$renderer2.push(`<!----></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-CXP_5L__.js.map
