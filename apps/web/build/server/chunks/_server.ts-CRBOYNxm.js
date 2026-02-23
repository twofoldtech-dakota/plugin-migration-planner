import { e as error, j as json } from './index-wpIsICWW.js';
import { d as db } from './db-BWpbog7L.js';
import { d as deleteTeamRole, u as updateTeamRole } from './team-Utu5T08G.js';
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
  const roleId = parseInt(params.roleId, 10);
  if (isNaN(roleId)) return error(400, "Invalid role ID");
  const updates = await request.json();
  const result = await updateTeamRole(db(), roleId, updates);
  return json(result);
};
const DELETE = async ({ params }) => {
  const roleId = parseInt(params.roleId, 10);
  if (isNaN(roleId)) return error(400, "Invalid role ID");
  const result = await deleteTeamRole(db(), roleId);
  return json(result);
};

export { DELETE, PATCH };
//# sourceMappingURL=_server.ts-CRBOYNxm.js.map
