import { j as json } from './index-wpIsICWW.js';
import { d as db } from './db-BWpbog7L.js';
import { d as deleteClient, a as getClientById, s as saveClient } from './clients-DrQYkYt7.js';
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
  const client = await getClientById(db(), params.id);
  if (!client) {
    return json({ error: "Client not found" }, { status: 404 });
  }
  return json(client);
};
const PATCH = async ({ params, request }) => {
  const body = await request.json();
  const { name, industry, notes } = body;
  if (!name) {
    return json({ error: "name is required" }, { status: 400 });
  }
  await saveClient(db(), { id: params.id, name, industry, notes });
  return json({ success: true });
};
const DELETE = async ({ params }) => {
  await deleteClient(db(), params.id);
  return json({ success: true });
};

export { DELETE, GET, PATCH };
//# sourceMappingURL=_server.ts-3Tjp0KhU.js.map
