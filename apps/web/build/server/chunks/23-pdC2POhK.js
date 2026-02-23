import { d as db } from './db-BWpbog7L.js';
import { a as getChallengeReviews } from './challenge-reviews-NXl75WQY.js';
import 'events';
import 'util';
import 'crypto';
import 'dns';
import 'fs';
import 'net';
import 'tls';
import 'path';
import 'stream';
import 'string_decoder';
import './shared-server-DaWdgxVh.js';

const load = async ({ params }) => {
  const reviews = await getChallengeReviews(db(), params.id, "refine");
  return { reviews, step: "refine" };
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 23;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BCsSnZ-W.js')).default;
const server_id = "src/routes/assessments/[id]/refine/review/+page.server.ts";
const imports = ["_app/immutable/nodes/23.CyEChFdb.js","_app/immutable/chunks/Nq2m2xDw.js","_app/immutable/chunks/DcamcR-f.js","_app/immutable/chunks/BaMsmqDw.js","_app/immutable/chunks/tZfpQL7D.js","_app/immutable/chunks/D62f41K-.js","_app/immutable/chunks/DOdfwfvb.js","_app/immutable/chunks/B489Hgvz.js","_app/immutable/chunks/CTZ8dTRF.js","_app/immutable/chunks/COtyJqkZ.js","_app/immutable/chunks/D-Fef6i9.js","_app/immutable/chunks/jfJYy30P.js","_app/immutable/chunks/D4Xvn_HC.js","_app/immutable/chunks/bllHAThW.js","_app/immutable/chunks/DsmKcCbW.js","_app/immutable/chunks/DwGCDbOQ.js","_app/immutable/chunks/DrfDtZDJ.js","_app/immutable/chunks/DIDNRxIi.js","_app/immutable/chunks/DjBhgMx0.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=23-pdC2POhK.js.map
