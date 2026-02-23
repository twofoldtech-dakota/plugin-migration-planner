import { e as error, j as json } from './index-wpIsICWW.js';
import { d as db } from './db-BWpbog7L.js';
import { c as createTeamRole } from './team-Utu5T08G.js';
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
  const { snapshot_id, ...role } = body;
  if (!snapshot_id) return error(400, "Missing snapshot_id");
  if (!role.role_id) return error(400, "Missing role_id");
  const result = await createTeamRole(db(), snapshot_id, role);
  return json(result);
};

export { POST };
//# sourceMappingURL=_server.ts-BHz5qtC5.js.map
