import { ab as escape_html, ad as attr, a7 as stringify, a1 as derived } from './index4-DG1itRH8.js';
import { D as DIMENSION_LABELS, K as KNOWN_DIMENSIONS } from './migration-stats-BAGrJ4E5.js';

function ConfidenceImprovementPath($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      discovery,
      unvalidatedCount,
      totalWidening,
      unknownCount,
      assessmentId
    } = $$props;
    const missingDimensions = derived(() => KNOWN_DIMENSIONS.filter((d) => !discovery[d]));
    const basePath = derived(() => assessmentId ? `/assessments/${assessmentId}` : "");
    $$renderer2.push(`<div class="space-y-2 text-sm text-text-secondary">`);
    if (missingDimensions().length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex items-center gap-2"><span class="text-danger font-bold">1.</span> <span class="flex-1">Complete ${escape_html(missingDimensions().length)} missing dimension${escape_html(missingDimensions().length > 1 ? "s" : "")}: <span class="font-bold">${escape_html(missingDimensions().map((d) => DIMENSION_LABELS[d] ?? d).join(", "))}</span></span> `);
      if (basePath()) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<a${attr("href", `${stringify(basePath())}/discovery?dimension=${stringify(missingDimensions()[0])}`)} class="shrink-0 text-[10px] font-bold text-primary hover:text-primary-hover">Go →</a>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (unvalidatedCount > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex items-center gap-2"><span class="text-warning font-bold">${escape_html(missingDimensions().length > 0 ? "2" : "1")}.</span> <span class="flex-1">Validate ${escape_html(unvalidatedCount)} assumption${escape_html(unvalidatedCount > 1 ? "s" : "")} to remove <span class="font-mono font-bold text-danger">+${escape_html(Math.round(totalWidening))}h</span> pessimistic widening</span> `);
      if (basePath()) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<a${attr("href", `${stringify(basePath())}/analysis?tab=assumptions&filter=unvalidated`)} class="shrink-0 text-[10px] font-bold text-primary hover:text-primary-hover">Go →</a>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (unknownCount > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex items-center gap-2"><span class="text-info font-bold">${escape_html((missingDimensions().length > 0 ? 2 : 1) + (unvalidatedCount > 0 ? 1 : 0))}.</span> <span class="flex-1">Resolve ${escape_html(unknownCount)} unknown answer${escape_html(unknownCount > 1 ? "s" : "")} across discovery dimensions</span> `);
      if (basePath()) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<a${attr("href", `${stringify(basePath())}/analysis?tab=gaps`)} class="shrink-0 text-[10px] font-bold text-primary hover:text-primary-hover">Go →</a>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (missingDimensions().length === 0 && unvalidatedCount === 0 && unknownCount === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="text-success font-bold">All data points are confirmed. Confidence is maximized.</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}

export { ConfidenceImprovementPath as C };
//# sourceMappingURL=ConfidenceImprovementPath-Bby9a7kW.js.map
