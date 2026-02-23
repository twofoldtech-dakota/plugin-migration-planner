import { ac as ensure_array_like, ae as attr_style, a7 as stringify, ab as escape_html, ad as attr, a1 as derived } from './index4-DG1itRH8.js';

function AreaChart($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { series, stacked = false, yLabel = "" } = $$props;
    let containerWidth = 800;
    const margin = { top: 24, right: 24, bottom: 44, left: 52 };
    const chartHeight = 340;
    const innerW = derived(() => Math.max(containerWidth - margin.left - margin.right, 100));
    const innerH = chartHeight - margin.top - margin.bottom;
    const xLabels = derived(() => series.length > 0 ? series[0].data.map((d) => d.label) : []);
    const pointCount = derived(() => xLabels().length);
    const stackedValues = derived(() => {
      if (!stacked || series.length === 0 || pointCount() === 0) return null;
      const cumulative = Array.from({ length: series.length }, () => Array(pointCount()).fill(0));
      for (let xi = 0; xi < pointCount(); xi++) {
        let running = 0;
        for (let si = 0; si < series.length; si++) {
          const val = series[si].data[xi]?.value ?? 0;
          cumulative[si][xi] = running + val;
          running += val;
        }
      }
      return cumulative;
    });
    const yRange = derived(() => {
      if (series.length === 0 || pointCount() === 0) return { min: 0, max: 100 };
      let maxVal = 0;
      if (stacked && stackedValues()) {
        const lastSeries = stackedValues()[series.length - 1];
        maxVal = Math.max(...lastSeries);
      } else {
        for (const s of series) {
          for (const d of s.data) {
            if (d.value > maxVal) maxVal = d.value;
          }
        }
      }
      const pad = Math.max(maxVal * 0.1, 1);
      return { min: 0, max: maxVal + pad };
    });
    function xPos(i) {
      if (pointCount() <= 1) return margin.left + innerW() / 2;
      return margin.left + i / (pointCount() - 1) * innerW();
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
    const yGridLines = derived(() => {
      const range = yRange().max - yRange().min;
      if (range === 0) return [0];
      const step = niceStep(range);
      const lines = [];
      for (let v = 0; v <= yRange().max; v += step) {
        lines.push(v);
      }
      return lines;
    });
    const seriesPaths = derived(() => {
      return series.map((s, si) => {
        const linePoints = [];
        const areaPoints = [];
        for (let xi = 0; xi < pointCount(); xi++) {
          let topY;
          if (stacked && stackedValues()) {
            topY = stackedValues()[si][xi];
            si > 0 ? stackedValues()[si - 1][xi] : 0;
          } else {
            topY = s.data[xi]?.value ?? 0;
          }
          const px = xPos(xi);
          linePoints.push(`${xi === 0 ? "M" : "L"} ${px} ${yPos(topY)}`);
          areaPoints.push(`${px},${yPos(topY)}`);
        }
        const areaTop = areaPoints.join(" ");
        let areaBottom;
        if (stacked && stackedValues() && si > 0) {
          const bottomPts = [];
          for (let xi = pointCount() - 1; xi >= 0; xi--) {
            bottomPts.push(`${xPos(xi)},${yPos(stackedValues()[si - 1][xi])}`);
          }
          areaBottom = bottomPts.join(" ");
        } else {
          const base = margin.top + innerH;
          areaBottom = `${xPos(pointCount() - 1)},${base} ${xPos(0)},${base}`;
        }
        return {
          linePath: linePoints.join(" "),
          areaPolygon: `${areaTop} ${areaBottom}`,
          color: s.color
        };
      });
    });
    const labelEvery = derived(() => Math.max(1, Math.ceil(pointCount() / 10)));
    let hoveredIndex = null;
    const columnWidth = derived(() => pointCount() > 1 ? innerW() / (pointCount() - 1) : innerW());
    const tooltip = derived(() => {
      return null;
    });
    Math.random().toString(36).slice(2, 6);
    $$renderer2.push(`<div class="w-full">`);
    if (series.length === 0 || pointCount() < 2) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex items-center justify-center h-64 text-text-muted text-sm">No data available</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="flex flex-wrap gap-4 mb-2 ml-[52px]"><!--[-->`);
      const each_array = ensure_array_like(series);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let s = each_array[$$index];
        $$renderer2.push(`<div class="flex items-center gap-1.5 text-xs font-mono"><span class="inline-block w-3 h-3 border border-brutal"${attr_style(`background-color: ${stringify(s.color)};`)}></span> <span style="color: var(--color-text-secondary)">${escape_html(s.label)}</span></div>`);
      }
      $$renderer2.push(`<!--]--></div> <svg${attr("width", containerWidth)}${attr("height", chartHeight)} class="block"><!--[-->`);
      const each_array_1 = ensure_array_like(yGridLines());
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let val = each_array_1[$$index_1];
        $$renderer2.push(`<line${attr("x1", margin.left)}${attr("y1", yPos(val))}${attr("x2", margin.left + innerW())}${attr("y2", yPos(val))} stroke="var(--color-border-light)" stroke-width="1" stroke-dasharray="4,3"></line><text${attr("x", margin.left - 10)}${attr("y", yPos(val) + 4)} text-anchor="end" class="text-[10px] font-mono" fill="var(--color-text-muted)">${escape_html(Math.round(val))}</text>`);
      }
      $$renderer2.push(`<!--]--><line${attr("x1", margin.left)}${attr("y1", margin.top)}${attr("x2", margin.left)}${attr("y2", margin.top + innerH)} stroke="var(--color-border-light)" stroke-width="1"></line><line${attr("x1", margin.left)}${attr("y1", margin.top + innerH)}${attr("x2", margin.left + innerW())}${attr("y2", margin.top + innerH)} stroke="var(--color-border-light)" stroke-width="1"></line><!--[-->`);
      const each_array_2 = ensure_array_like(xLabels());
      for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
        each_array_2[i];
        $$renderer2.push(`<rect${attr("x", xPos(i) - columnWidth() / 2)}${attr("y", margin.top)}${attr("width", columnWidth())}${attr("height", innerH)}${attr("fill", hoveredIndex === i ? "var(--color-primary)" : "transparent")}${attr("opacity", hoveredIndex === i ? 0.04 : 0)} role="presentation" class="cursor-crosshair"></rect>`);
      }
      $$renderer2.push(`<!--]--><!--[-->`);
      const each_array_3 = ensure_array_like(seriesPaths());
      for (let si = 0, $$length = each_array_3.length; si < $$length; si++) {
        let sp = each_array_3[si];
        $$renderer2.push(`<polygon${attr("points", sp.areaPolygon)}${attr("fill", sp.color)} fill-opacity="0.1"></polygon><path${attr("d", sp.linePath)} fill="none"${attr("stroke", sp.color)} stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></path>`);
      }
      $$renderer2.push(`<!--]--><!--[-->`);
      const each_array_4 = ensure_array_like(xLabels());
      for (let i = 0, $$length = each_array_4.length; i < $$length; i++) {
        let label = each_array_4[i];
        if (i % labelEvery() === 0 || i === pointCount() - 1) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<text${attr("x", xPos(i))}${attr("y", chartHeight - 10)} text-anchor="middle" class="text-[10px] font-mono" fill="var(--color-text-muted)">${escape_html(label)}</text>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
      if (yLabel) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<text${attr("x", 14)}${attr("y", margin.top + innerH / 2)} text-anchor="middle" class="text-[11px] font-mono font-bold" fill="var(--color-text-muted)"${attr("transform", `rotate(-90, 14, ${stringify(margin.top + innerH / 2)})`)}>${escape_html(yLabel)}</text>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
      if (tooltip()) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<rect${attr("x", tooltip().x)}${attr("y", tooltip().y)}${attr("width", tooltip().w)}${attr("height", tooltip().h)} rx="3" fill="var(--color-brutal)" opacity="0.92"></rect><text${attr("x", tooltip().x + tooltip().w / 2)}${attr("y", tooltip().y + 14)} text-anchor="middle" class="text-[11px] font-mono font-bold" fill="white">${escape_html(tooltip().xLabel)}</text><!--[-->`);
        const each_array_5 = ensure_array_like(tooltip().lines);
        for (let li = 0, $$length = each_array_5.length; li < $$length; li++) {
          let line = each_array_5[li];
          $$renderer2.push(`<circle${attr("cx", tooltip().x + 10)}${attr("cy", tooltip().y + 26 + li * 16)} r="4"${attr("fill", line.color)}></circle><text${attr("x", tooltip().x + 20)}${attr("y", tooltip().y + 30 + li * 16)} class="text-[10px] font-mono" fill="white" opacity="0.85">${escape_html(line.label)}: ${escape_html(Math.round(line.value))}</text>`);
        }
        $$renderer2.push(`<!--]-->`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></svg>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}

export { AreaChart as A };
//# sourceMappingURL=AreaChart-BrBX_7Fj.js.map
