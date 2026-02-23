import { r as redirect } from './index-wpIsICWW.js';

const load = async ({ params }) => {
  redirect(301, `/assessments/${params.id}`);
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 16;
const server_id = "src/routes/assessments/[id]/dashboard/+page.server.ts";
const imports = [];
const stylesheets = [];
const fonts = [];

export { fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=16-DCOV3-0p.js.map
