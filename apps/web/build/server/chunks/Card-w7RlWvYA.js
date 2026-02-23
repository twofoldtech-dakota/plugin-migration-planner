import { a6 as attr_class, a7 as stringify } from './index4-DG1itRH8.js';

function Card($$renderer, $$props) {
  let { hover = false, padding = "p-6", children } = $$props;
  $$renderer.push(`<div${attr_class(`brutal-border bg-surface shadow-md overflow-hidden ${stringify(padding)} ${stringify(hover ? "transition-all duration-150 hover:-translate-x-px hover:-translate-y-px hover:shadow-lg active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none" : "")}`)}>`);
  children($$renderer);
  $$renderer.push(`<!----></div>`);
}

export { Card as C };
//# sourceMappingURL=Card-w7RlWvYA.js.map
