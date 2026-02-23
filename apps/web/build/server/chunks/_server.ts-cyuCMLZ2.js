import { j as json } from './index-wpIsICWW.js';
import { d as db } from './db-BWpbog7L.js';
import { g as getProficiencies, b as saveProficiencies } from './clients-DrQYkYt7.js';
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

const GET = async ({ params }) => {
  const proficiencies = await getProficiencies(db(), params.id);
  return json(proficiencies);
};
const PUT = async ({ params, request }) => {
  const body = await request.json();
  const { proficiencies } = body;
  if (!proficiencies) {
    return json({ error: "proficiencies object is required" }, { status: 400 });
  }
  await saveProficiencies(db(), {
    client_id: params.id,
    proficiencies
  });
  return json({ success: true });
};

export { GET, PUT };
//# sourceMappingURL=_server.ts-cyuCMLZ2.js.map
