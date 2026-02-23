import { e as error, j as json } from './index-wpIsICWW.js';
import { d as db } from './db-BWpbog7L.js';
import { d as deleteWorkItem, u as updateWorkItem } from './wbs-_BnBrxIn.js';
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

const PATCH = async ({ params, request }) => {
  const itemId = parseInt(params.itemId, 10);
  if (isNaN(itemId)) return error(400, "Invalid item ID");
  const updates = await request.json();
  const result = await updateWorkItem(db(), itemId, updates);
  return json(result);
};
const DELETE = async ({ params }) => {
  const itemId = parseInt(params.itemId, 10);
  if (isNaN(itemId)) return error(400, "Invalid item ID");
  const result = await deleteWorkItem(db(), itemId);
  return json(result);
};

export { DELETE, PATCH };
//# sourceMappingURL=_server.ts-DpqtK-hW.js.map
