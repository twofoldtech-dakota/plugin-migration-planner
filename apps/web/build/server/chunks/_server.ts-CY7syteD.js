import { j as json } from './index-wpIsICWW.js';
import { d as db } from './db-BWpbog7L.js';
import { u as updateAssumption } from './assumptions-Czeu5zeL.js';
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
import './discovery-ZQezVmz4.js';
import './analysis-BcZv0btd.js';
import './estimates-zTf3XwgF.js';
import './aggregate-B2GxRiPZ.js';
import './knowledge-CxzzbHNI.js';
import 'url';

const PATCH = async ({ params, request }) => {
  const body = await request.json();
  const { validation_status, actual_value } = body;
  const result = await updateAssumption(db(), {
    assessment_id: params.id,
    assumption_id: params.assumptionId,
    validation_status,
    actual_value
  });
  const recomputed = await recomputeAll(params.id);
  return json({ ...result, recomputed });
};

export { PATCH };
//# sourceMappingURL=_server.ts-CY7syteD.js.map
