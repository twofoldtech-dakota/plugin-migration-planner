import { j as json } from './index-wpIsICWW.js';
import { d as db } from './db-BWpbog7L.js';
import { a as getKnowledgePackById, s as saveKnowledgePack } from './knowledge-packs-PreH8nWI.js';
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

const POST = async ({ params }) => {
  const pack = await getKnowledgePackById(db(), params.id);
  if (!pack) {
    return json({ error: "Knowledge pack not found" }, { status: 404 });
  }
  await saveKnowledgePack(db(), {
    ...pack,
    supported_versions: pack.supported_versions ?? [],
    eol_versions: pack.eol_versions ?? {},
    valid_topologies: pack.valid_topologies ?? [],
    deployment_models: pack.deployment_models ?? [],
    compatible_targets: pack.compatible_targets ?? [],
    compatible_infrastructure: pack.compatible_infrastructure ?? [],
    required_services: pack.required_services ?? [],
    optional_services: pack.optional_services ?? [],
    confidence: "draft",
    last_researched: null,
    change_summary: "Queued for re-research"
  });
  return json({ success: true });
};

export { POST };
//# sourceMappingURL=_server.ts-DCAxVaGl.js.map
