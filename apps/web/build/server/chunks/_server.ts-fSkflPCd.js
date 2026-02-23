import { e as error, j as json } from './index-wpIsICWW.js';
import { d as db } from './db-BWpbog7L.js';
import { c as createWorkItem } from './wbs-_BnBrxIn.js';
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

const POST = async ({ request }) => {
  const body = await request.json();
  const { snapshot_id, ...item } = body;
  if (!snapshot_id) return error(400, "Missing snapshot_id");
  if (!item.title) return error(400, "Missing title");
  const result = await createWorkItem(db(), snapshot_id, item);
  return json(result);
};

export { POST };
//# sourceMappingURL=_server.ts-fSkflPCd.js.map
