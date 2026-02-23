import { a6 as attr_class, a7 as stringify, ae as attr_style, a1 as derived } from './index4-DG1itRH8.js';

function ProgressBar($$renderer, $$props) {
  let { value, max = 100, variant = "primary" } = $$props;
  let percent = derived(() => Math.min(100, Math.max(0, value / max * 100)));
  const barColors = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger"
  };
  $$renderer.push(`<div class="h-3 w-full overflow-hidden rounded brutal-border-thin bg-border-light"><div${attr_class(`h-full transition-all duration-300 ${stringify(barColors[variant])}`)}${attr_style(`width: ${stringify(percent())}%`)}></div></div>`);
}

export { ProgressBar as P };
//# sourceMappingURL=ProgressBar-BC01P1QB.js.map
