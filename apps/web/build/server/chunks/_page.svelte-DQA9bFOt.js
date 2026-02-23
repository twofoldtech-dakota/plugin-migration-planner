import { aa as head, ad as attr, ac as ensure_array_like, ab as escape_html, a7 as stringify, a1 as derived } from './index4-DG1itRH8.js';
import { K as KpiCard } from './KpiCard-D-WYJRm6.js';
import { C as Card } from './Card-w7RlWvYA.js';
import { H as HorizontalBarChart } from './HorizontalBarChart-Bhs5XmzU.js';
import { S as ScatterPlot } from './ScatterPlot-_X69FJNt.js';
import './ProgressBar-BC01P1QB.js';
import './Tooltip-hZ63yG7F.js';
import './index-server-CVwIEJCx.js';

function WaterfallChart($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { steps, valueFormat = "hours" } = $$props;
    let containerWidth = 800;
    const margin = { top: 24, right: 24, bottom: 44, left: 52 };
    const chartHeight = 340;
    const innerW = derived(() => Math.max(containerWidth - margin.left - margin.right, 100));
    const innerH = chartHeight - margin.top - margin.bottom;
    function formatValue(val) {
      if (valueFormat === "percent") return `${val.toFixed(1)}%`;
      if (valueFormat === "hours") {
        if (Math.abs(val) >= 1e3) return `${(val / 1e3).toFixed(1)}kh`;
        return `${Math.round(val)}h`;
      }
      return `${Math.round(val)}`;
    }
    const bars = derived(() => {
      if (steps.length === 0) return [];
      let running = 0;
      return steps.map((step) => {
        let barStart;
        let barEnd;
        if (step.isTotal) {
          barStart = 0;
          barEnd = running;
        } else {
          barStart = running;
          barEnd = running + step.value;
          running += step.value;
        }
        let color;
        if (step.color) {
          color = step.color;
        } else if (step.isTotal) {
          color = "var(--color-primary)";
        } else if (step.value >= 0) {
          color = "var(--color-success)";
        } else {
          color = "var(--color-danger)";
        }
        return {
          label: step.label,
          value: step.value,
          isTotal: step.isTotal ?? false,
          start: barStart,
          end: barEnd,
          color,
          runningAfter: step.isTotal ? running : barEnd
        };
      });
    });
    const yRange = derived(() => {
      if (bars().length === 0) return { min: 0, max: 100 };
      let minVal = 0;
      let maxVal = 0;
      for (const b of bars()) {
        minVal = Math.min(minVal, b.start, b.end);
        maxVal = Math.max(maxVal, b.start, b.end);
      }
      const span = maxVal - minVal;
      const pad = Math.max(span * 0.15, 1);
      return { min: Math.min(0, minVal - pad), max: maxVal + pad };
    });
    function yPos(val) {
      const range = yRange().max - yRange().min;
      if (range === 0) return margin.top + innerH / 2;
      return margin.top + innerH - (val - yRange().min) / range * innerH;
    }
    const barWidth = derived(() => steps.length > 0 ? Math.min(innerW() / steps.length * 0.6, 60) : 40);
    function barX(i) {
      if (steps.length <= 1) return margin.left + innerW() / 2;
      const totalBarSpace = innerW();
      const slotWidth = totalBarSpace / steps.length;
      return margin.left + slotWidth * i + slotWidth / 2;
    }
    function niceStep(range) {
      const rough = range / 5;
      const pow = Math.pow(10, Math.floor(Math.log10(Math.abs(rough) || 1)));
      const norm = rough / pow;
      if (norm <= 1.5) return pow;
      if (norm <= 3.5) return 2 * pow;
      if (norm <= 7.5) return 5 * pow;
      return 10 * pow;
    }
    const yGridLines = derived(() => {
      const range = yRange().max - yRange().min;
      if (range === 0) return [0];
      const step = niceStep(range);
      const lines = [];
      const start = Math.ceil(yRange().min / step) * step;
      for (let v = start; v <= yRange().max; v += step) {
        lines.push(v);
      }
      return lines;
    });
    const tooltip = derived(() => {
      return null;
    });
    $$renderer2.push(`<div class="w-full">`);
    if (steps.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex items-center justify-center h-64 text-text-muted text-sm">No data available</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<svg${attr("width", containerWidth)}${attr("height", chartHeight)} class="block"><!--[-->`);
      const each_array = ensure_array_like(yGridLines());
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let val = each_array[$$index];
        $$renderer2.push(`<line${attr("x1", margin.left)}${attr("y1", yPos(val))}${attr("x2", margin.left + innerW())}${attr("y2", yPos(val))} stroke="var(--color-border-light)" stroke-width="1" stroke-dasharray="4,3"></line><text${attr("x", margin.left - 10)}${attr("y", yPos(val) + 4)} text-anchor="end" class="text-[10px] font-mono" fill="var(--color-text-muted)">${escape_html(formatValue(val))}</text>`);
      }
      $$renderer2.push(`<!--]-->`);
      if (yRange().min < 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<line${attr("x1", margin.left)}${attr("y1", yPos(0))}${attr("x2", margin.left + innerW())}${attr("y2", yPos(0))} stroke="var(--color-border-light)" stroke-width="1.5"></line>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--><line${attr("x1", margin.left)}${attr("y1", margin.top)}${attr("x2", margin.left)}${attr("y2", margin.top + innerH)} stroke="var(--color-border-light)" stroke-width="1"></line><line${attr("x1", margin.left)}${attr("y1", margin.top + innerH)}${attr("x2", margin.left + innerW())}${attr("y2", margin.top + innerH)} stroke="var(--color-border-light)" stroke-width="1"></line><!--[-->`);
      const each_array_1 = ensure_array_like(bars());
      for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
        let bar = each_array_1[i];
        if (i < bars().length - 1 && !bars()[i + 1].isTotal) {
          $$renderer2.push("<!--[-->");
          bars()[i + 1];
          const connY = yPos(bar.runningAfter);
          $$renderer2.push(`<line${attr("x1", barX(i) + barWidth() / 2)}${attr("y1", connY)}${attr("x2", barX(i + 1) - barWidth() / 2)}${attr("y2", connY)} stroke="var(--color-text-muted)" stroke-width="1" stroke-dasharray="3,3" opacity="0.4"></line>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--><!--[-->`);
      const each_array_2 = ensure_array_like(bars());
      for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
        let bar = each_array_2[i];
        const topVal = Math.max(bar.start, bar.end);
        const bottomVal = Math.min(bar.start, bar.end);
        const barTop = yPos(topVal);
        const barBottom = yPos(bottomVal);
        const barH = Math.max(barBottom - barTop, 1);
        $$renderer2.push(`<rect role="img"${attr("aria-label", `${stringify(bar.label)}: ${stringify(bar.value)}`)}${attr("x", barX(i) - barWidth() / 2)}${attr("y", barTop)}${attr("width", barWidth())}${attr("height", barH)}${attr("fill", bar.color)}${attr("fill-opacity", bar.isTotal ? 0.85 : 0.7)}${attr("stroke", bar.isTotal ? "var(--color-brutal)" : bar.color)}${attr("stroke-width", bar.isTotal ? 2 : 1)} class="cursor-pointer"></rect><text${attr("x", barX(i))}${attr("y", barTop - 6)} text-anchor="middle" class="text-[10px] font-mono font-bold"${attr("fill", bar.color)}>${escape_html(bar.isTotal ? formatValue(bar.end) : `${bar.value >= 0 ? "+" : ""}${formatValue(bar.value)}`)}</text><text${attr("x", barX(i))}${attr("y", chartHeight - 10)} text-anchor="middle" class="text-[10px] font-mono" fill="var(--color-text-muted)">${escape_html(bar.label)}</text>`);
      }
      $$renderer2.push(`<!--]-->`);
      if (tooltip()) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<rect${attr("x", tooltip().x)}${attr("y", tooltip().y)}${attr("width", tooltip().w)}${attr("height", tooltip().h)} rx="3" fill="var(--color-brutal)" opacity="0.92"></rect><text${attr("x", tooltip().x + tooltip().w / 2)}${attr("y", tooltip().y + 14)} text-anchor="middle" class="text-[11px] font-mono font-bold" fill="white">${escape_html(tooltip().line1)}</text><text${attr("x", tooltip().x + tooltip().w / 2)}${attr("y", tooltip().y + 30)} text-anchor="middle" class="text-[10px] font-mono" fill="white" opacity="0.8">${escape_html(tooltip().line2)}</text>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></svg>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function StackedBarChart($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      data,
      series,
      orientation = "vertical",
      showLegend = true,
      valueFormat = "number"
    } = $$props;
    let containerWidth = 800;
    const marginV = { top: 24, right: 16, bottom: 48, left: 52 };
    const marginH = { top: 16, right: 16, bottom: 16, left: 120 };
    const barThickness = 28;
    const barGap = 12;
    const legendRowHeight = 24;
    const isVertical = derived(() => orientation === "vertical");
    const margin = derived(() => isVertical() ? marginV : marginH);
    const maxTotal = derived(() => Math.max(...data.map((d) => series.reduce((sum, s) => sum + (d.values[s.id] ?? 0), 0)), 1));
    const gridLines = derived(() => {
      const lines = [];
      const step = maxTotal() <= 10 ? 2 : maxTotal() <= 50 ? 10 : maxTotal() <= 200 ? 25 : maxTotal() <= 1e3 ? 100 : 250;
      for (let v = 0; v <= maxTotal(); v += step) {
        lines.push(v);
      }
      if (lines[lines.length - 1] < maxTotal()) {
        lines.push(Math.ceil(maxTotal() / step) * step);
      }
      return lines;
    });
    const gridMax = derived(() => gridLines()[gridLines().length - 1] || maxTotal());
    const innerW = derived(() => Math.max(containerWidth - margin().left - margin().right, 100));
    const chartHeight = derived(() => {
      if (isVertical()) {
        return 300;
      }
      return margin().top + data.length * (barThickness + barGap) + margin().bottom;
    });
    const innerH = derived(() => chartHeight() - margin().top - margin().bottom);
    const legendH = derived(() => showLegend ? legendRowHeight + 12 : 0);
    const svgHeight = derived(() => chartHeight() + legendH());
    const barW = derived(() => {
      if (!isVertical()) return 0;
      const available = innerW() - (data.length - 1) * barGap;
      return Math.min(Math.max(available / data.length, 12), 60);
    });
    function vBarX(index) {
      const totalBarArea = data.length * barW() + (data.length - 1) * barGap;
      const offsetX = (innerW() - totalBarArea) / 2;
      return margin().left + offsetX + index * (barW() + barGap);
    }
    function vBarY(value) {
      return margin().top + innerH() - value / gridMax() * innerH();
    }
    function vBarH(value) {
      return value / gridMax() * innerH();
    }
    function hBarX(value) {
      return value / gridMax() * innerW();
    }
    function hBarY(index) {
      return margin().top + index * (barThickness + barGap);
    }
    function formatValue(value) {
      if (valueFormat === "hours") return `${Math.round(value)}h`;
      if (valueFormat === "percent") return `${Math.round(value)}%`;
      return value % 1 === 0 ? String(value) : value.toFixed(1);
    }
    const tooltipData = derived(() => {
      return null;
    });
    $$renderer2.push(`<div class="w-full">`);
    if (data.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex items-center justify-center h-32 text-text-muted text-sm">No data available</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<svg${attr("width", containerWidth)}${attr("height", svgHeight())} class="block">`);
      if (isVertical()) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<!--[-->`);
        const each_array = ensure_array_like(gridLines());
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let val = each_array[$$index];
          $$renderer2.push(`<line${attr("x1", margin().left)}${attr("y1", vBarY(val))}${attr("x2", margin().left + innerW())}${attr("y2", vBarY(val))} stroke="var(--color-border-light)" stroke-width="1"${attr("stroke-dasharray", val === 0 ? "none" : "4,3")}></line><text${attr("x", margin().left - 8)}${attr("y", vBarY(val) + 4)} text-anchor="end" class="text-[10px] font-mono" fill="var(--color-text-muted)">${escape_html(formatValue(val))}</text>`);
        }
        $$renderer2.push(`<!--]--><!--[-->`);
        const each_array_1 = ensure_array_like(data);
        for (let di = 0, $$length = each_array_1.length; di < $$length; di++) {
          let dp = each_array_1[di];
          const bx = vBarX(di);
          $$renderer2.push(`<!--[-->`);
          const each_array_2 = ensure_array_like(series);
          for (let si = 0, $$length2 = each_array_2.length; si < $$length2; si++) {
            let s = each_array_2[si];
            const val = dp.values[s.id] ?? 0;
            const cumBefore = series.slice(0, si).reduce((sum, sr) => sum + (dp.values[sr.id] ?? 0), 0);
            if (val > 0) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<rect${attr("x", bx)}${attr("y", vBarY(cumBefore + val))}${attr("width", barW())}${attr("height", vBarH(val))}${attr("fill", s.color)}${attr("opacity", 0.9)} class="transition-opacity duration-150"></rect><rect${attr("x", bx)}${attr("y", vBarY(cumBefore + val))}${attr("width", barW())}${attr("height", vBarH(val))} fill="none" stroke="var(--color-brutal)" stroke-width="1" opacity="0.15"></rect><rect${attr("x", bx)}${attr("y", vBarY(cumBefore + val))}${attr("width", barW())}${attr("height", vBarH(val))} fill="transparent" role="presentation" class="cursor-crosshair"></rect>`);
            } else {
              $$renderer2.push("<!--[!-->");
            }
            $$renderer2.push(`<!--]-->`);
          }
          $$renderer2.push(`<!--]--><text${attr("x", bx + barW() / 2)}${attr("y", chartHeight() - 10)} text-anchor="middle" class="text-[10px]" fill="var(--color-text-muted)">${escape_html(dp.label.length > 10 ? dp.label.slice(0, 9) + "…" : dp.label)}</text>`);
        }
        $$renderer2.push(`<!--]-->`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<!--[-->`);
        const each_array_3 = ensure_array_like(gridLines());
        for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
          let val = each_array_3[$$index_3];
          $$renderer2.push(`<line${attr("x1", margin().left + hBarX(val))}${attr("y1", margin().top)}${attr("x2", margin().left + hBarX(val))}${attr("y2", margin().top + innerH())} stroke="var(--color-border-light)" stroke-width="1"${attr("stroke-dasharray", val === 0 ? "none" : "4,3")}></line><text${attr("x", margin().left + hBarX(val))}${attr("y", margin().top - 6)} text-anchor="middle" class="text-[10px] font-mono" fill="var(--color-text-muted)">${escape_html(formatValue(val))}</text>`);
        }
        $$renderer2.push(`<!--]--><!--[-->`);
        const each_array_4 = ensure_array_like(data);
        for (let di = 0, $$length = each_array_4.length; di < $$length; di++) {
          let dp = each_array_4[di];
          const by = hBarY(di);
          $$renderer2.push(`<rect${attr("x", margin().left)}${attr("y", by)}${attr("width", innerW())}${attr("height", barThickness)} fill="var(--color-border-light)" rx="2"></rect><text${attr("x", margin().left - 8)}${attr("y", by + barThickness / 2 + 4)} text-anchor="end" class="text-[11px]" fill="var(--color-text-muted)">${escape_html(dp.label.length > 16 ? dp.label.slice(0, 15) + "…" : dp.label)}</text><!--[-->`);
          const each_array_5 = ensure_array_like(series);
          for (let si = 0, $$length2 = each_array_5.length; si < $$length2; si++) {
            let s = each_array_5[si];
            const val = dp.values[s.id] ?? 0;
            const cumBefore = series.slice(0, si).reduce((sum, sr) => sum + (dp.values[sr.id] ?? 0), 0);
            if (val > 0) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<rect${attr("x", margin().left + hBarX(cumBefore))}${attr("y", by)}${attr("width", hBarX(val))}${attr("height", barThickness)}${attr("fill", s.color)}${attr("opacity", 0.9)} rx="2" class="transition-opacity duration-150"></rect><rect${attr("x", margin().left + hBarX(cumBefore))}${attr("y", by)}${attr("width", hBarX(val))}${attr("height", barThickness)} fill="none" stroke="var(--color-brutal)" stroke-width="1" opacity="0.15" rx="2"></rect><rect${attr("x", margin().left + hBarX(cumBefore))}${attr("y", by)}${attr("width", hBarX(val))}${attr("height", barThickness)} fill="transparent" role="presentation" class="cursor-crosshair"></rect>`);
            } else {
              $$renderer2.push("<!--[!-->");
            }
            $$renderer2.push(`<!--]-->`);
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
      if (showLegend) {
        $$renderer2.push("<!--[-->");
        const legendY = chartHeight() + 4;
        const itemW = Math.min(160, containerWidth / series.length);
        const totalLegendW = series.length * itemW;
        const legendStartX = (containerWidth - totalLegendW) / 2;
        $$renderer2.push(`<!--[-->`);
        const each_array_6 = ensure_array_like(series);
        for (let i = 0, $$length = each_array_6.length; i < $$length; i++) {
          let s = each_array_6[i];
          const lx = legendStartX + i * itemW;
          $$renderer2.push(`<rect${attr("x", lx)}${attr("y", legendY + 2)} width="12" height="12"${attr("fill", s.color)} stroke="var(--color-brutal)" stroke-width="1" rx="2"></rect><text${attr("x", lx + 18)}${attr("y", legendY + 12)} class="text-[11px]" fill="var(--color-text-muted)">${escape_html(s.label)}</text>`);
        }
        $$renderer2.push(`<!--]-->`);
      } else {
        $$renderer2.push("<!--[!-->");
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
    head("1se1mrf", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Estimation Accuracy | MigrateIQ</title>`);
      });
    });
    $$renderer2.push(`<div><p class="text-sm text-text-muted mb-6">Hours buildup analysis, role distribution, multiplier impact, and component-level accuracy.</p> <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">`);
    KpiCard($$renderer2, {
      label: "Estimate Versions",
      value: data.kpis.totalVersions,
      tooltip: "Total estimate snapshots across all assessments"
    });
    $$renderer2.push(`<!----> `);
    KpiCard($$renderer2, {
      label: "Avg Confidence",
      value: data.kpis.avgConfidence + "%",
      variant: data.kpis.avgConfidence >= 70 ? "success" : data.kpis.avgConfidence >= 40 ? "warning" : "danger",
      progress: data.kpis.avgConfidence,
      tooltip: "Average confidence score across latest estimate snapshots"
    });
    $$renderer2.push(`<!----> `);
    KpiCard($$renderer2, {
      label: "Total Estimated Hours",
      value: data.kpis.totalHours.toLocaleString() + "h",
      tooltip: "Sum of expected hours across all latest estimates"
    });
    $$renderer2.push(`<!----> `);
    KpiCard($$renderer2, {
      label: "Avg Gotcha %",
      value: data.kpis.avgGotchaPct + "%",
      variant: data.kpis.avgGotchaPct > 20 ? "danger" : data.kpis.avgGotchaPct > 10 ? "warning" : "success",
      tooltip: "Gotcha hours as a percentage of base hours"
    });
    $$renderer2.push(`<!----></div> <div class="mb-6">`);
    Card($$renderer2, {
      children: ($$renderer3) => {
        $$renderer3.push(`<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4">Hours Buildup</h2> `);
        if (data.waterfallData.some((s) => s.value > 0)) {
          $$renderer3.push("<!--[-->");
          WaterfallChart($$renderer3, { steps: data.waterfallData, valueFormat: "hours" });
        } else {
          $$renderer3.push("<!--[!-->");
          $$renderer3.push(`<div class="flex items-center justify-center h-64 text-text-muted text-sm">No estimate data available yet.</div>`);
        }
        $$renderer3.push(`<!--]-->`);
      }
    });
    $$renderer2.push(`<!----></div> <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">`);
    Card($$renderer2, {
      children: ($$renderer3) => {
        $$renderer3.push(`<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4">Hours by Role</h2> `);
        if (data.roleBreakdown.data.length > 0 && data.roleBreakdown.series.length > 0) {
          $$renderer3.push("<!--[-->");
          StackedBarChart($$renderer3, {
            data: data.roleBreakdown.data,
            series: data.roleBreakdown.series,
            orientation: "horizontal",
            valueFormat: "hours"
          });
        } else {
          $$renderer3.push("<!--[!-->");
          $$renderer3.push(`<div class="flex items-center justify-center h-32 text-text-muted text-sm">No role breakdown data available.</div>`);
        }
        $$renderer3.push(`<!--]-->`);
      }
    });
    $$renderer2.push(`<!----> `);
    Card($$renderer2, {
      children: ($$renderer3) => {
        $$renderer3.push(`<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4">Multiplier Impact</h2> `);
        if (data.multiplierImpact.length > 0) {
          $$renderer3.push("<!--[-->");
          HorizontalBarChart($$renderer3, { bars: data.multiplierImpact });
        } else {
          $$renderer3.push("<!--[!-->");
          $$renderer3.push(`<div class="flex items-center justify-center h-32 text-text-muted text-sm">No active multipliers recorded.</div>`);
        }
        $$renderer3.push(`<!--]-->`);
      }
    });
    $$renderer2.push(`<!----></div> `);
    Card($$renderer2, {
      children: ($$renderer3) => {
        $$renderer3.push(`<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4">Base vs Final Hours by Component</h2> `);
        if (data.componentScatter.length > 0) {
          $$renderer3.push("<!--[-->");
          ScatterPlot($$renderer3, {
            points: data.componentScatter,
            xLabel: "Base Hours",
            yLabel: "Final Hours",
            showDiagonal: true
          });
        } else {
          $$renderer3.push("<!--[!-->");
          $$renderer3.push(`<div class="flex items-center justify-center h-64 text-text-muted text-sm">No component-level estimate data available.</div>`);
        }
        $$renderer3.push(`<!--]-->`);
      }
    });
    $$renderer2.push(`<!----></div>`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-DQA9bFOt.js.map
