import { ad as attr, ac as ensure_array_like, ab as escape_html, a1 as derived } from './index4-DG1itRH8.js';

function RadarChart($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { dimensions, size = 240, fillColor = "var(--color-primary)" } = $$props;
    let containerWidth = 800;
    const effectiveSize = derived(() => Math.min(containerWidth, size));
    const cx = derived(() => effectiveSize() / 2);
    const cy = derived(() => effectiveSize() / 2);
    const radius = derived(() => effectiveSize() / 2 - 36);
    const ringLevels = [0.25, 0.5, 0.75, 1];
    function angleFor(i, total) {
      return Math.PI * 2 * i / total - Math.PI / 2;
    }
    function pointAt(i, fraction) {
      const angle = angleFor(i, dimensions.length);
      return {
        x: cx() + Math.cos(angle) * radius() * fraction,
        y: cy() + Math.sin(angle) * radius() * fraction
      };
    }
    const ringPaths = derived(() => {
      if (dimensions.length < 3) return [];
      return ringLevels.map((level) => {
        const pts = dimensions.map((_, i) => {
          const p = pointAt(i, level);
          return `${p.x},${p.y}`;
        }).join(" ");
        return pts;
      });
    });
    const valuePoly = derived(() => {
      if (dimensions.length < 3) return "";
      return dimensions.map((d, i) => {
        const max = d.maxValue ?? 100;
        const fraction = max > 0 ? Math.min(d.value / max, 1) : 0;
        const p = pointAt(i, fraction);
        return `${p.x},${p.y}`;
      }).join(" ");
    });
    const vertices = derived(() => {
      return dimensions.map((d, i) => {
        const max = d.maxValue ?? 100;
        const fraction = max > 0 ? Math.min(d.value / max, 1) : 0;
        const p = pointAt(i, fraction);
        return { ...p, label: d.label, value: d.value, max };
      });
    });
    const labels = derived(() => {
      return dimensions.map((d, i) => {
        const angle = angleFor(i, dimensions.length);
        const labelRadius = radius() + 20;
        const x = cx() + Math.cos(angle) * labelRadius;
        const y = cy() + Math.sin(angle) * labelRadius;
        let anchor = "middle";
        if (Math.cos(angle) < -0.1) anchor = "end";
        else if (Math.cos(angle) > 0.1) anchor = "start";
        return { x, y, label: d.label, anchor };
      });
    });
    let hoveredIndex = null;
    const tooltip = derived(() => {
      return null;
    });
    `radar-fill-${Math.random().toString(36).slice(2, 6)}`;
    $$renderer2.push(`<div class="w-full">`);
    if (dimensions.length < 3) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex items-center justify-center h-64 text-text-muted text-sm">No data available</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<svg${attr("width", effectiveSize())}${attr("height", effectiveSize())} class="block mx-auto" role="img" aria-label="Radar chart"><!--[-->`);
      const each_array = ensure_array_like(ringPaths());
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let pts = each_array[$$index];
        $$renderer2.push(`<polygon${attr("points", pts)} fill="none" stroke="var(--color-border-light)" stroke-width="1"></polygon>`);
      }
      $$renderer2.push(`<!--]--><!--[-->`);
      const each_array_1 = ensure_array_like(dimensions);
      for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
        each_array_1[i];
        const outer = pointAt(i, 1);
        $$renderer2.push(`<line${attr("x1", cx())}${attr("y1", cy())}${attr("x2", outer.x)}${attr("y2", outer.y)} stroke="var(--color-border-light)" stroke-width="1"></line>`);
      }
      $$renderer2.push(`<!--]--><polygon${attr("points", valuePoly())}${attr("fill", fillColor)} fill-opacity="0.2"${attr("stroke", fillColor)} stroke-width="2" stroke-linejoin="round"></polygon><!--[-->`);
      const each_array_2 = ensure_array_like(vertices());
      for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
        let v = each_array_2[i];
        $$renderer2.push(`<circle role="img"${attr("aria-label", labels()[i] ?? `Dimension ${i + 1}`)}${attr("cx", v.x)}${attr("cy", v.y)}${attr("r", hoveredIndex === i ? 6 : 4)}${attr("fill", hoveredIndex === i ? fillColor : "var(--color-surface)")}${attr("stroke", fillColor)} stroke-width="2" class="cursor-pointer"></circle>`);
      }
      $$renderer2.push(`<!--]--><!--[-->`);
      const each_array_3 = ensure_array_like(labels());
      for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
        let lbl = each_array_3[$$index_3];
        $$renderer2.push(`<text${attr("x", lbl.x)}${attr("y", lbl.y)}${attr("text-anchor", lbl.anchor)} dominant-baseline="middle" class="text-[10px] font-mono" fill="var(--color-text-muted)">${escape_html(lbl.label)}</text>`);
      }
      $$renderer2.push(`<!--]-->`);
      if (tooltip()) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<rect${attr("x", tooltip().x)}${attr("y", tooltip().y)}${attr("width", tooltip().w)} height="22" rx="3" fill="var(--color-brutal)" opacity="0.92"></rect><text${attr("x", tooltip().x + tooltip().w / 2)}${attr("y", tooltip().y + 15)} text-anchor="middle" class="text-[11px] font-mono font-bold" fill="white">${escape_html(tooltip().text)}</text>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></svg>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}

export { RadarChart as R };
//# sourceMappingURL=RadarChart-BEXblXiD.js.map
