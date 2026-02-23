import { ad as attr, ac as ensure_array_like, a7 as stringify, ab as escape_html, a1 as derived } from './index4-DG1itRH8.js';

function DonutChart($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      segments,
      size = 200,
      innerRadius = 0.6,
      centerLabel = "",
      centerValue = ""
    } = $$props;
    let containerWidth = 800;
    const displaySize = derived(() => Math.min(size, containerWidth));
    const cx = derived(() => displaySize() / 2);
    const cy = derived(() => displaySize() / 2);
    const outerR = derived(() => displaySize() / 2 - 4);
    const innerR = derived(() => outerR() * innerRadius);
    const strokeW = derived(() => outerR() - innerR());
    const midR = derived(() => innerR() + strokeW() / 2);
    const total = derived(() => segments.reduce((sum, s) => sum + s.value, 0));
    const arcs = derived(() => {
      if (total() === 0) return [];
      const circumference = 2 * Math.PI * midR();
      let offset = 0;
      return segments.map((seg) => {
        const fraction = seg.value / total();
        const length = fraction * circumference;
        const gap = circumference - length;
        const rotation = offset;
        offset += fraction;
        return {
          ...seg,
          fraction,
          dasharray: `${length} ${gap}`,
          dashoffset: -rotation * circumference,
          pct: Math.round(fraction * 100)
        };
      });
    });
    let hoveredIndex = null;
    const tooltipData = derived(() => {
      return null;
    });
    const legendHeight = derived(() => Math.ceil(segments.length / 2) * 24 + 16);
    const svgHeight = derived(() => displaySize() + legendHeight());
    const legendY = derived(() => displaySize() + 8);
    const legendColW = derived(() => displaySize() / 2);
    $$renderer2.push(`<div class="w-full">`);
    if (segments.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex items-center justify-center h-32 text-text-muted text-sm">No data available</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<svg${attr("width", displaySize())}${attr("height", svgHeight())} class="block mx-auto"><circle${attr("cx", cx())}${attr("cy", cy())}${attr("r", midR())} fill="none" stroke="var(--color-border-light)"${attr("stroke-width", strokeW())}></circle><!--[-->`);
      const each_array = ensure_array_like(arcs());
      for (let i = 0, $$length = each_array.length; i < $$length; i++) {
        let arc = each_array[i];
        $$renderer2.push(`<circle${attr("cx", cx())}${attr("cy", cy())}${attr("r", midR())} fill="none"${attr("stroke", arc.color)}${attr("stroke-width", hoveredIndex === i ? strokeW() + 6 : strokeW())}${attr("stroke-dasharray", arc.dasharray)}${attr("stroke-dashoffset", arc.dashoffset)} stroke-linecap="butt"${attr("transform", `rotate(-90 ${stringify(cx())} ${stringify(cy())})`)}${attr("opacity", 1)} class="transition-all duration-150"></circle>`);
      }
      $$renderer2.push(`<!--]--><!--[-->`);
      const each_array_1 = ensure_array_like(arcs());
      for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
        let arc = each_array_1[i];
        $$renderer2.push(`<circle${attr("cx", cx())}${attr("cy", cy())}${attr("r", midR())} fill="none" stroke="transparent"${attr("stroke-width", strokeW() + 8)}${attr("stroke-dasharray", arc.dasharray)}${attr("stroke-dashoffset", arc.dashoffset)} stroke-linecap="butt"${attr("transform", `rotate(-90 ${stringify(cx())} ${stringify(cy())})`)} role="presentation" class="cursor-crosshair"></circle>`);
      }
      $$renderer2.push(`<!--]-->`);
      if (centerValue) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<text${attr("x", cx())}${attr("y", cy() - 2)} text-anchor="middle" dominant-baseline="middle" class="text-2xl font-extrabold font-mono" fill="var(--color-text)">${escape_html(centerValue)}</text>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
      if (centerLabel) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<text${attr("x", cx())}${attr("y", cy() + (centerValue ? 18 : 0))} text-anchor="middle" dominant-baseline="middle" class="text-[10px] font-bold uppercase tracking-wider" fill="var(--color-text-muted)">${escape_html(centerLabel)}</text>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--><!--[-->`);
      const each_array_2 = ensure_array_like(segments);
      for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
        let seg = each_array_2[i];
        const col = i % 2;
        const row = Math.floor(i / 2);
        const lx = col * legendColW() + 8;
        const ly = legendY() + row * 24;
        $$renderer2.push(`<circle${attr("cx", lx + 5)}${attr("cy", ly + 8)} r="5"${attr("fill", seg.color)} stroke="var(--color-brutal)" stroke-width="1"></circle><text${attr("x", lx + 16)}${attr("y", ly + 12)} class="text-[11px]" fill="var(--color-text-muted)">${escape_html(seg.label)}</text>`);
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

export { DonutChart as D };
//# sourceMappingURL=DonutChart-Dlc0pZpB.js.map
