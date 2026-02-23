import './state.svelte-DeAIIc79.js';
import './root-DQzxKDPP.js';
import { w as writable } from './index-mV5xf0Xo.js';

function create_updated_store() {
  const { set, subscribe } = writable(false);
  {
    return {
      subscribe,
      // eslint-disable-next-line @typescript-eslint/require-await
      check: async () => false
    };
  }
}
const stores = {
  updated: /* @__PURE__ */ create_updated_store()
};
function goto(url, opts = {}) {
  {
    throw new Error("Cannot call goto(...) on the server");
  }
}
({
  check: stores.updated.check
});

export { goto as g };
//# sourceMappingURL=client-Cm3t_ao5.js.map
