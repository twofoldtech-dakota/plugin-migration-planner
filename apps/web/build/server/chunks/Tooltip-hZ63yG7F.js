import { a6 as attr_class } from './index4-DG1itRH8.js';
import { o as onDestroy } from './index-server-CVwIEJCx.js';

function Tooltip($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { text, position = "top", delay = 350, block = false, children } = $$props;
    onDestroy(() => {
    });
    $$renderer2.push(`<span role="presentation"${attr_class(block ? "flex min-w-0" : "inline-flex")}>`);
    children($$renderer2);
    $$renderer2.push(`<!----></span>`);
  });
}

export { Tooltip as T };
//# sourceMappingURL=Tooltip-hZ63yG7F.js.map
