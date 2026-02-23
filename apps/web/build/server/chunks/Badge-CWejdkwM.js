import { a6 as attr_class, a7 as stringify } from './index4-DG1itRH8.js';

function Badge($$renderer, $$props) {
  let { variant = "default", children } = $$props;
  const colors = {
    default: "bg-primary-light text-primary border-primary",
    success: "bg-success-light text-success border-success",
    warning: "bg-warning-light text-warning border-warning",
    danger: "bg-danger-light text-danger border-danger",
    info: "bg-info-light text-info border-info",
    muted: "bg-surface text-text-muted border-border-light"
  };
  $$renderer.push(`<span${attr_class(`inline-flex items-center rounded-none px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest border-2 ${stringify(colors[variant])}`)}>`);
  children($$renderer);
  $$renderer.push(`<!----></span>`);
}

export { Badge as B };
//# sourceMappingURL=Badge-CWejdkwM.js.map
