import { d as db } from './db-BWpbog7L.js';
import { q as queryProjects } from './analytics-BZLNJxd8.js';
import { l as listClients, g as getProficiencies } from './clients-DrQYkYt7.js';
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

const load = async () => {
  const clients = await listClients(db());
  const { projects } = await queryProjects(db(), { limit: 500 });
  const assessmentCounts = {};
  for (const client of clients) {
    assessmentCounts[client.id] = projects.filter(
      (p) => p.client_name === client.name
    ).length;
  }
  const proficiencySummaries = {};
  for (const client of clients) {
    const profs = await getProficiencies(db(), client.id);
    const entries = Object.values(profs);
    const filled = entries.filter((p) => p.proficiency && p.proficiency !== "none").length;
    proficiencySummaries[client.id] = { filled, total: entries.length };
  }
  return { clients, assessmentCounts, proficiencySummaries };
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 24;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-Dm27_Hql.js')).default;
const server_id = "src/routes/clients/+page.server.ts";
const imports = ["_app/immutable/nodes/24.yxSwl5Ri.js","_app/immutable/chunks/Nq2m2xDw.js","_app/immutable/chunks/DcamcR-f.js","_app/immutable/chunks/tZfpQL7D.js","_app/immutable/chunks/D62f41K-.js","_app/immutable/chunks/DOdfwfvb.js","_app/immutable/chunks/B489Hgvz.js","_app/immutable/chunks/COtyJqkZ.js","_app/immutable/chunks/CTZ8dTRF.js","_app/immutable/chunks/D8cY5i6L.js","_app/immutable/chunks/DwGCDbOQ.js","_app/immutable/chunks/D-Fef6i9.js","_app/immutable/chunks/jfJYy30P.js","_app/immutable/chunks/D4Xvn_HC.js","_app/immutable/chunks/CbvwqsEx.js","_app/immutable/chunks/bllHAThW.js","_app/immutable/chunks/DsmKcCbW.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=24-BkT9Uhzo.js.map
