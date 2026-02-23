import { e as error, j as json } from './index-wpIsICWW.js';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { d as db } from './db-BWpbog7L.js';
import { g as getAssessmentById } from './assessments-DKcL9-FM.js';
import 'events';
import 'util';
import 'crypto';
import 'dns';
import 'net';
import 'tls';
import 'stream';
import 'string_decoder';
import './shared-server-DaWdgxVh.js';

const GET = async ({ url, params }) => {
  const filePath = url.searchParams.get("path");
  if (!filePath) throw error(400, "Missing path parameter");
  if (!filePath.includes(".migration/") || filePath.includes("..")) {
    throw error(403, "Access denied");
  }
  let absolutePath = filePath;
  if (!filePath.startsWith("/")) {
    const assessment = await getAssessmentById(db(), params.id);
    if (!assessment?.project_path) {
      throw error(404, "Assessment not found");
    }
    absolutePath = resolve(assessment.project_path, filePath);
  }
  if (!absolutePath.includes(".migration/")) {
    throw error(403, "Access denied");
  }
  if (!existsSync(absolutePath)) {
    throw error(404, "File not found");
  }
  const content = await readFile(absolutePath, "utf-8");
  return json({ content });
};

export { GET };
//# sourceMappingURL=_server.ts-DFpYcKRR.js.map
