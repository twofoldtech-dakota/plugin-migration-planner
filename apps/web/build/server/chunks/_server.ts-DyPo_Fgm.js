import { j as json } from './index-wpIsICWW.js';
import { d as db } from './db-BWpbog7L.js';
import { l as listClients, s as saveClient, b as saveProficiencies } from './clients-DrQYkYt7.js';
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

const GET = async ({ url }) => {
  const search = url.searchParams.get("search") ?? void 0;
  const clients = await listClients(db(), search);
  return json(clients);
};
const POST = async ({ request }) => {
  const body = await request.json();
  const { id, name, industry, notes, proficiencies } = body;
  if (!id || !name) {
    return json({ error: "id and name are required" }, { status: 400 });
  }
  await saveClient(db(), { id, name, industry, notes });
  if (proficiencies && Object.keys(proficiencies).length > 0) {
    await saveProficiencies(db(), { client_id: id, proficiencies });
  }
  return json({ success: true, id });
};

export { GET, POST };
//# sourceMappingURL=_server.ts-DyPo_Fgm.js.map
