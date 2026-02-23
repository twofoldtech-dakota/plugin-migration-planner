import { r as redirect } from './index-wpIsICWW.js';

const load = async ({ params }) => {
  redirect(301, `/assessments/${params.id}/analysis?tab=gaps`);
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 21;
const server_id = "src/routes/assessments/[id]/gaps/+page.server.ts";
const imports = [];
const stylesheets = [];
const fonts = [];

export { fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=21-Di0M7sLN.js.map
