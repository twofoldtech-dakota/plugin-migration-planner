import { j as json } from './index-wpIsICWW.js';
import { d as db } from './db-BWpbog7L.js';
import { l as listEstimateVersions } from './estimates-zTf3XwgF.js';
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

const GET = async ({ params }) => {
  const versions = await listEstimateVersions(db(), params.id);
  return json(versions);
};

export { GET };
//# sourceMappingURL=_server.ts-0mpg9yUH.js.map
