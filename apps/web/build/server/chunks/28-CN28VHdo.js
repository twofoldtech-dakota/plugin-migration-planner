import { d as db } from './db-BWpbog7L.js';
import { l as listClients } from './clients-DrQYkYt7.js';
import { l as listKnowledgePacks } from './knowledge-packs-PreH8nWI.js';
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
import './aggregate-B2GxRiPZ.js';

const load = async () => {
  const [clients, packs] = await Promise.all([
    listClients(db()),
    listKnowledgePacks(db())
  ]);
  const platforms = packs.filter((p) => p.category === "platform");
  const infrastructure = packs.filter((p) => p.category === "infrastructure");
  let catalog = null;
  try {
    const { getTechProficiencyCatalog } = await import('./knowledge-CxzzbHNI.js');
    catalog = getTechProficiencyCatalog();
  } catch (e) {
    console.error("Failed to load tech proficiency catalog:", e);
  }
  return { clients, catalog, platforms, infrastructure };
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 28;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-CYsvIUUb.js')).default;
const server_id = "src/routes/new/+page.server.ts";
const imports = ["_app/immutable/nodes/28.BKl-0zAX.js","_app/immutable/chunks/Nq2m2xDw.js","_app/immutable/chunks/DcamcR-f.js","_app/immutable/chunks/tZfpQL7D.js","_app/immutable/chunks/D62f41K-.js","_app/immutable/chunks/DOdfwfvb.js","_app/immutable/chunks/B489Hgvz.js","_app/immutable/chunks/CTZ8dTRF.js","_app/immutable/chunks/D8cY5i6L.js","_app/immutable/chunks/DTyJUmrG.js","_app/immutable/chunks/5_lFXlvf.js","_app/immutable/chunks/DsmKcCbW.js","_app/immutable/chunks/D-Fef6i9.js","_app/immutable/chunks/jfJYy30P.js","_app/immutable/chunks/D4Xvn_HC.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=28-CN28VHdo.js.map
