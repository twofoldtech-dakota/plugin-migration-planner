import { j as json } from './index-wpIsICWW.js';
import { d as db } from './db-BWpbog7L.js';
import { s as saveDiscovery } from './discovery-ZQezVmz4.js';
import { a as recomputeAll } from './recompute-CMorG61U.js';
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
import './assessments-DKcL9-FM.js';
import './analysis-BcZv0btd.js';
import './estimates-zTf3XwgF.js';
import './aggregate-B2GxRiPZ.js';
import './knowledge-CxzzbHNI.js';
import 'url';

const PATCH = async ({ params, request }) => {
  const body = await request.json();
  const { dimension, answers, status } = body;
  const result = await saveDiscovery(db(), {
    assessment_id: params.id,
    dimension,
    status,
    answers
  });
  const recomputed = await recomputeAll(params.id);
  return json({ ...result, recomputed });
};

export { PATCH };
//# sourceMappingURL=_server.ts-_Hm-RoxN.js.map
