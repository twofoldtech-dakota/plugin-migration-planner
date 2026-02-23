import { ad as attr, ac as ensure_array_like, ab as escape_html, a1 as derived } from './index4-DG1itRH8.js';

function HorizontalBarChart($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      bars,
      maxValue,
      showValues = true,
      valueFormat = "number",
      barHeight = 28
    } = $$props;
    let containerWidth = 800;
    const margin = { top: 8, right: 16, bottom: 8, left: 120 };
    const computedMax = derived(() => maxValue ?? Math.max(...bars.map((b) => b.value), 1));
    const chartHeight = derived(() => margin.top + bars.length * (barHeight + 8) + margin.bottom);
    const innerW = derived(() => Math.max(containerWidth - margin.left - margin.right, 60));
    function barWidth(value) {
      return value / computedMax() * innerW();
    }
    function barY(index) {
      return margin.top + index * (barHeight + 8);
    }
    function formatValue(value) {
      if (valueFormat === "hours") return `${Math.round(value)}h`;
      if (valueFormat === "percent") return `${Math.round(value)}%`;
      return value % 1 === 0 ? String(value) : value.toFixed(1);
    }
    const sortedBars = derived(() => [...bars].sort((a, b) => b.value - a.value));
    let hoveredIndex = null;
    const tooltipData = derived(() => {
      return null;
    });
    $$renderer2.push(`<div class="w-full">`);
    if (bars.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex items-center justify-center h-32 text-text-muted text-sm">No data available</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<svg${attr("width", containerWidth)}${attr("height", chartHeight())} class="block"><!--[-->`);
      const each_array = ensure_array_like(sortedBars());
      for (let i = 0, $$length = each_array.length; i < $$length; i++) {
        let bar = each_array[i];
        const by = barY(i);
        const bw = barWidth(bar.value);
        const barColor = bar.color ?? "var(--color-primary)";
        $$renderer2.push(`<text${attr("x", margin.left - 8)}${attr("y", by + barHeight / 2 + 4)} text-anchor="end" class="text-[11px]" fill="var(--color-text-muted)">${escape_html(bar.label.length > 16 ? bar.label.slice(0, 15) + "…" : bar.label)}</text><rect${attr("x", margin.left)}${attr("y", by)}${attr("width", innerW())}${attr("height", barHeight)} fill="var(--color-border-light)" rx="2"></rect><rect${attr("x", margin.left)}${attr("y", by)}${attr("width", Math.max(bw, 2))}${attr("height", barHeight)}${attr("fill", barColor)} rx="2"${attr("opacity", hoveredIndex === i ? 1 : 0.85)} class="transition-opacity duration-150"></rect><rect${attr("x", margin.left)}${attr("y", by)}${attr("width", Math.max(bw, 2))}${attr("height", barHeight)} fill="none" stroke="var(--color-brutal)" stroke-width="1.5" rx="2" opacity="0.2"></rect>`);
        if (showValues) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<text${attr("x", margin.left + Math.max(bw, 2) + 6)}${attr("y", by + barHeight / 2 + 4)} class="text-[11px] font-mono font-bold" fill="var(--color-text-muted)">${escape_html(formatValue(bar.value))}</text>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--><rect${attr("x", margin.left)}${attr("y", by)}${attr("width", innerW())}${attr("height", barHeight)} fill="transparent" role="presentation" class="cursor-crosshair"></rect>`);
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

export { HorizontalBarChart as H };
//# sourceMappingURL=HorizontalBarChart-Bhs5XmzU.js.map
