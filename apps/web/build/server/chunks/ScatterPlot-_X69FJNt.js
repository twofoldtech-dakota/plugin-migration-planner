import { ad as attr, ac as ensure_array_like, ab as escape_html, a7 as stringify, a1 as derived } from './index4-DG1itRH8.js';

function ScatterPlot($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      points,
      xLabel,
      yLabel,
      showDiagonal = false,
      xFormat = "hours",
      yFormat = "hours"
    } = $$props;
    let containerWidth = 800;
    const margin = { top: 24, right: 24, bottom: 44, left: 52 };
    const chartHeight = 340;
    const innerW = derived(() => Math.max(containerWidth - margin.left - margin.right, 100));
    const innerH = chartHeight - margin.top - margin.bottom;
    function formatValue(val, fmt) {
      if (fmt === "percent") return `${val.toFixed(1)}%`;
      if (val >= 1e3) return `${(val / 1e3).toFixed(1)}kh`;
      return `${Math.round(val)}h`;
    }
    const xRange = derived(() => {
      if (points.length === 0) return { min: 0, max: 100 };
      const vals = points.map((p) => p.x);
      const dataMin = Math.min(...vals);
      const dataMax = Math.max(...vals);
      const span = dataMax - dataMin;
      const pad = Math.max(span * 0.1, 1);
      return { min: Math.max(0, dataMin - pad), max: dataMax + pad };
    });
    const yRange = derived(() => {
      if (points.length === 0) return { min: 0, max: 100 };
      const vals = points.map((p) => p.y);
      const dataMin = Math.min(...vals);
      const dataMax = Math.max(...vals);
      const span = dataMax - dataMin;
      const pad = Math.max(span * 0.1, 1);
      return { min: Math.max(0, dataMin - pad), max: dataMax + pad };
    });
    function xPos(val) {
      const range = xRange().max - xRange().min;
      if (range === 0) return margin.left + innerW() / 2;
      return margin.left + (val - xRange().min) / range * innerW();
    }
    function yPos(val) {
      const range = yRange().max - yRange().min;
      if (range === 0) return margin.top + innerH / 2;
      return margin.top + innerH - (val - yRange().min) / range * innerH;
    }
    function niceStep(range) {
      const rough = range / 5;
      const pow = Math.pow(10, Math.floor(Math.log10(rough)));
      const norm = rough / pow;
      if (norm <= 1.5) return pow;
      if (norm <= 3.5) return 2 * pow;
      if (norm <= 7.5) return 5 * pow;
      return 10 * pow;
    }
    const xGridLines = derived(() => {
      const range = xRange().max - xRange().min;
      if (range === 0) return [0];
      const step = niceStep(range);
      const lines = [];
      const start = Math.ceil(xRange().min / step) * step;
      for (let v = start; v <= xRange().max; v += step) {
        lines.push(v);
      }
      return lines;
    });
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
    const diagonal = derived(() => {
      if (!showDiagonal) return null;
      const commonMin = Math.max(xRange().min, yRange().min);
      const commonMax = Math.min(xRange().max, yRange().max);
      if (commonMin >= commonMax) return null;
      return {
        x1: xPos(commonMin),
        y1: yPos(commonMin),
        x2: xPos(commonMax),
        y2: yPos(commonMax)
      };
    });
    let hoveredIndex = null;
    const tooltip = derived(() => {
      return null;
    });
    $$renderer2.push(`<div class="w-full">`);
    if (points.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex items-center justify-center h-64 text-text-muted text-sm">No data available</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<svg${attr("width", containerWidth)}${attr("height", chartHeight)} class="block"><!--[-->`);
      const each_array = ensure_array_like(yGridLines());
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let val = each_array[$$index];
        $$renderer2.push(`<line${attr("x1", margin.left)}${attr("y1", yPos(val))}${attr("x2", margin.left + innerW())}${attr("y2", yPos(val))} stroke="var(--color-border-light)" stroke-width="1" stroke-dasharray="4,3"></line><text${attr("x", margin.left - 10)}${attr("y", yPos(val) + 4)} text-anchor="end" class="text-[10px] font-mono" fill="var(--color-text-muted)">${escape_html(formatValue(val, yFormat))}</text>`);
      }
      $$renderer2.push(`<!--]--><!--[-->`);
      const each_array_1 = ensure_array_like(xGridLines());
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let val = each_array_1[$$index_1];
        $$renderer2.push(`<line${attr("x1", xPos(val))}${attr("y1", margin.top)}${attr("x2", xPos(val))}${attr("y2", margin.top + innerH)} stroke="var(--color-border-light)" stroke-width="1" stroke-dasharray="4,3"></line><text${attr("x", xPos(val))}${attr("y", chartHeight - 10)} text-anchor="middle" class="text-[10px] font-mono" fill="var(--color-text-muted)">${escape_html(formatValue(val, xFormat))}</text>`);
      }
      $$renderer2.push(`<!--]--><line${attr("x1", margin.left)}${attr("y1", margin.top)}${attr("x2", margin.left)}${attr("y2", margin.top + innerH)} stroke="var(--color-border-light)" stroke-width="1"></line><line${attr("x1", margin.left)}${attr("y1", margin.top + innerH)}${attr("x2", margin.left + innerW())}${attr("y2", margin.top + innerH)} stroke="var(--color-border-light)" stroke-width="1"></line>`);
      if (diagonal()) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<line${attr("x1", diagonal().x1)}${attr("y1", diagonal().y1)}${attr("x2", diagonal().x2)}${attr("y2", diagonal().y2)} stroke="var(--color-text-muted)" stroke-width="1" stroke-dasharray="6,4" opacity="0.3"></line>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--><!--[-->`);
      const each_array_2 = ensure_array_like(points);
      for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
        let pt = each_array_2[i];
        $$renderer2.push(`<circle role="img"${attr("aria-label", pt.label ?? `Point ${i + 1}`)}${attr("cx", xPos(pt.x))}${attr("cy", yPos(pt.y))}${attr("r", hoveredIndex === i ? 7 : 5)}${attr("fill", hoveredIndex === i ? pt.color ?? "var(--color-primary)" : pt.color ?? "var(--color-primary)")}${attr("fill-opacity", hoveredIndex === i ? 1 : 0.7)} stroke="var(--color-surface)" stroke-width="2" class="cursor-pointer"></circle>`);
      }
      $$renderer2.push(`<!--]--><text${attr("x", margin.left + innerW() / 2)}${attr("y", chartHeight - 0)} text-anchor="middle" class="text-[11px] font-mono font-bold" fill="var(--color-text-muted)">${escape_html(xLabel)}</text><text${attr("x", 14)}${attr("y", margin.top + innerH / 2)} text-anchor="middle" class="text-[11px] font-mono font-bold" fill="var(--color-text-muted)"${attr("transform", `rotate(-90, 14, ${stringify(margin.top + innerH / 2)})`)}>${escape_html(yLabel)}</text>`);
      if (tooltip()) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<rect${attr("x", tooltip().x)}${attr("y", tooltip().y)}${attr("width", tooltip().w)}${attr("height", tooltip().h)} rx="3" fill="var(--color-brutal)" opacity="0.92"></rect><text${attr("x", tooltip().x + tooltip().w / 2)}${attr("y", tooltip().y + 14)} text-anchor="middle" class="text-[11px] font-mono font-bold" fill="white">${escape_html(tooltip().line1)}</text><text${attr("x", tooltip().x + tooltip().w / 2)}${attr("y", tooltip().y + 28)} text-anchor="middle" class="text-[10px] font-mono" fill="white" opacity="0.8">${escape_html(tooltip().line2)}</text><text${attr("x", tooltip().x + tooltip().w / 2)}${attr("y", tooltip().y + 42)} text-anchor="middle" class="text-[10px] font-mono" fill="white" opacity="0.8">${escape_html(tooltip().line3)}</text>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></svg>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}

export { ScatterPlot as S };
//# sourceMappingURL=ScatterPlot-_X69FJNt.js.map
