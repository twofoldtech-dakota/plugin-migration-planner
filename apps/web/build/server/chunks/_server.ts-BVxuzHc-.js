import { e as error, j as json } from './index-wpIsICWW.js';
import { d as db } from './db-BWpbog7L.js';
import { g as getAssessmentById, s as saveAssessment } from './assessments-DKcL9-FM.js';
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

const POST = async ({ params }) => {
  const assessment = await getAssessmentById(db(), params.id);
  if (!assessment) throw error(404, "Assessment not found");
  await saveAssessment(db(), {
    ...assessment,
    environments: assessment.environments ?? [],
    status: "complete"
  });
  return json({ success: true });
};

export { POST };
//# sourceMappingURL=_server.ts-BVxuzHc-.js.map
