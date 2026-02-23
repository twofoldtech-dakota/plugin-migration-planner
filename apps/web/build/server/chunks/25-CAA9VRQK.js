import { d as db } from './db-BWpbog7L.js';
import { q as queryProjects } from './analytics-BZLNJxd8.js';
import { a as getClientById } from './clients-DrQYkYt7.js';
import { getTechProficiencyCatalog, getAiAlternatives } from './knowledge-CxzzbHNI.js';
import { e as error } from './index-wpIsICWW.js';
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
import 'url';

const load = async ({ params }) => {
  const client = await getClientById(db(), params.id);
  if (!client) {
    throw error(404, "Client not found");
  }
  let catalog = null;
  try {
    catalog = getTechProficiencyCatalog();
  } catch (e) {
    console.error("Failed to load tech proficiency catalog:", e);
  }
  let aiTools = [];
  try {
    aiTools = getAiAlternatives();
  } catch (e) {
    console.error("Failed to load AI alternatives:", e);
  }
  const { projects: allProjects } = await queryProjects(db(), { limit: 200 });
  const linkedAssessments = allProjects.filter(
    (p) => p.client_name === client.name
  );
  return { client, catalog, aiTools, linkedAssessments };
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 25;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DYuD00fY.js')).default;
const server_id = "src/routes/clients/[id]/+page.server.ts";
const imports = ["_app/immutable/nodes/25.BuStBVBC.js","_app/immutable/chunks/Nq2m2xDw.js","_app/immutable/chunks/DcamcR-f.js","_app/immutable/chunks/tZfpQL7D.js","_app/immutable/chunks/D62f41K-.js","_app/immutable/chunks/DOdfwfvb.js","_app/immutable/chunks/B489Hgvz.js","_app/immutable/chunks/CTZ8dTRF.js","_app/immutable/chunks/COtyJqkZ.js","_app/immutable/chunks/5_lFXlvf.js","_app/immutable/chunks/DsmKcCbW.js","_app/immutable/chunks/D-Fef6i9.js","_app/immutable/chunks/jfJYy30P.js","_app/immutable/chunks/D4Xvn_HC.js","_app/immutable/chunks/D8cY5i6L.js","_app/immutable/chunks/DwGCDbOQ.js","_app/immutable/chunks/CbvwqsEx.js","_app/immutable/chunks/Dt-GL34s.js","_app/immutable/chunks/DrfDtZDJ.js","_app/immutable/chunks/bllHAThW.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=25-CAA9VRQK.js.map
