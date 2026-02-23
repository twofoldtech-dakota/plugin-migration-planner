import { j as json } from './index-wpIsICWW.js';
import { d as db } from './db-BWpbog7L.js';
import { g as getAiSelections, s as saveAiSelections } from './ai-selections-81CCgTAS.js';
import { r as recomputeEstimate } from './recompute-CMorG61U.js';
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
  const { selections, disabled_reasons } = body;
  await saveAiSelections(db(), {
    assessment_id: params.id,
    selections,
    disabled_reasons
  });
  const recomputed = await recomputeEstimate(params.id);
  return json({ success: true, recomputed });
};
const GET = async ({ params }) => {
  const data = await getAiSelections(db(), params.id);
  return json(data);
};

export { GET, PATCH };
//# sourceMappingURL=_server.ts-CWF9T7sV.js.map
