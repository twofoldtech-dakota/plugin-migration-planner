import { e as error, j as json } from './index-wpIsICWW.js';
import { d as db } from './db-BWpbog7L.js';
import { g as getTeamSnapshot } from './team-Utu5T08G.js';
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

const GET = async ({ url, params }) => {
  const assessmentId = url.searchParams.get("assessment");
  if (!assessmentId) return error(400, "Missing assessment param");
  const version = parseInt(params.snapshotId, 10);
  if (isNaN(version)) return error(400, "Invalid snapshot version");
  const snapshot = await getTeamSnapshot(db(), assessmentId, version);
  if (!snapshot) return error(404, "Team snapshot not found");
  return json(snapshot);
};

export { GET };
//# sourceMappingURL=_server.ts-Bwoy7puH.js.map
