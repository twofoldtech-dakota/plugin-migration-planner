import { ad as attr, a7 as stringify, ab as escape_html, a1 as derived } from './index4-DG1itRH8.js';
import { T as Tooltip } from './Tooltip-hZ63yG7F.js';

function ConfidenceGauge($$renderer, $$props) {
  let { score, confirmed = 0, assumed = 0, unknown = 0, size = "md" } = $$props;
  const angle = derived(() => score / 100 * 180);
  const rad = derived(() => angle() * Math.PI / 180);
  const endX = derived(() => 100 - 80 * Math.cos(rad()));
  const endY = derived(() => 100 - 80 * Math.sin(rad()));
  const largeArc = derived(() => angle() > 180 ? 1 : 0);
  const color = derived(() => score >= 70 ? "var(--color-success)" : score >= 40 ? "var(--color-warning)" : "var(--color-danger)");
  const width = derived(() => size === "sm" ? 150 : 200);
  const height = derived(() => size === "sm" ? 90 : 120);
  $$renderer.push(`<div class="flex flex-col items-center"><svg${attr("width", width())}${attr("height", height())} viewBox="0 0 200 120"><path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="var(--color-border-light)" stroke-width="12" stroke-linecap="round"></path><path${attr("d", `M 20 100 A 80 80 0 ${stringify(largeArc())} 1 ${stringify(endX())} ${stringify(endY())}`)} fill="none"${attr("stroke", color())} stroke-width="12" stroke-linecap="round"></path><text x="100" y="90" text-anchor="middle" class="text-3xl font-extrabold font-mono" fill="var(--color-text)">${escape_html(score)}%</text><text x="100" y="108" text-anchor="middle" class="text-xs font-bold" fill="var(--color-text-muted)">CONFIDENCE</text></svg> `);
  if (confirmed > 0 || assumed > 0 || unknown > 0) {
    $$renderer.push("<!--[-->");
    $$renderer.push(`<div class="grid grid-cols-3 gap-2 mt-2 text-center text-xs w-full">`);
    Tooltip($$renderer, {
      text: "Answers verified by the client or evidence",
      position: "bottom",
      children: ($$renderer2) => {
        $$renderer2.push(`<div><span class="font-bold text-success">${escape_html(confirmed)}</span> <span class="block text-text-muted cursor-help">Confirmed</span></div>`);
      }
    });
    $$renderer.push(`<!----> `);
    Tooltip($$renderer, {
      text: "Answers based on assumptions that need validation",
      position: "bottom",
      children: ($$renderer2) => {
        $$renderer2.push(`<div><span class="font-bold text-warning">${escape_html(assumed)}</span> <span class="block text-text-muted cursor-help">Assumed</span></div>`);
      }
    });
    $$renderer.push(`<!----> `);
    Tooltip($$renderer, {
      text: "Missing data points that reduce confidence",
      position: "bottom",
      children: ($$renderer2) => {
        $$renderer2.push(`<div><span class="font-bold text-danger">${escape_html(unknown)}</span> <span class="block text-text-muted cursor-help">Unknown</span></div>`);
      }
    });
    $$renderer.push(`<!----></div>`);
  } else {
    $$renderer.push("<!--[!-->");
  }
  $$renderer.push(`<!--]--></div>`);
}

export { ConfidenceGauge as C };
//# sourceMappingURL=ConfidenceGauge-CfeVxdrW.js.map
