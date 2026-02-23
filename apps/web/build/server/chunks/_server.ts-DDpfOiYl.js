import { j as json } from './index-wpIsICWW.js';
import { d as db } from './db-BWpbog7L.js';
import { s as saveAssessment } from './assessments-DKcL9-FM.js';
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

const POST = async ({ request }) => {
  const body = await request.json();
  const { id, project_name, client_id, client_name, source_stack, target_stack, migration_scope, sitecore_version, topology, source_cloud, target_cloud, target_timeline, project_path } = body;
  if (!id || !project_name) {
    return json({ error: "id and project_name are required" }, { status: 400 });
  }
  await saveAssessment(db(), {
    id,
    project_name,
    client_id: client_id ?? null,
    client_name: client_name ?? "",
    project_path: project_path ?? "",
    source_stack: source_stack ?? {},
    target_stack: target_stack ?? {},
    migration_scope: migration_scope ?? {},
    sitecore_version: sitecore_version ?? "",
    topology: topology ?? "",
    source_cloud: source_cloud ?? "aws",
    target_cloud: target_cloud ?? "azure",
    target_timeline: target_timeline ?? ""
  });
  return json({ success: true, id });
};

export { POST };
//# sourceMappingURL=_server.ts-DDpfOiYl.js.map
