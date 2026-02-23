import { e as error, j as json } from './index-wpIsICWW.js';
import { mkdir, writeFile, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
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

async function getRefinementsPath(assessmentId) {
  const assessment = await getAssessmentById(db(), assessmentId);
  if (!assessment?.project_path) return null;
  return join(assessment.project_path, ".migration", "refinements.json");
}
async function readRefinements(path) {
  if (!existsSync(path)) return { roleOverrides: {}, roleTasks: {} };
  try {
    const raw = await readFile(path, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { roleOverrides: {}, roleTasks: {} };
  }
}
const GET = async ({ params }) => {
  const path = await getRefinementsPath(params.id);
  if (!path) throw error(404, "Assessment not found");
  const data = await readRefinements(path);
  return json(data);
};
const PATCH = async ({ params, request }) => {
  const path = await getRefinementsPath(params.id);
  if (!path) throw error(404, "Assessment not found");
  const body = await request.json();
  const current = await readRefinements(path);
  const updated = {
    roleOverrides: { ...current.roleOverrides, ...body.roleOverrides ?? {} },
    roleTasks: { ...current.roleTasks, ...body.roleTasks ?? {} }
  };
  await mkdir(join(path, ".."), { recursive: true });
  await writeFile(path, JSON.stringify(updated, null, 2), "utf-8");
  return json({ success: true });
};

export { GET, PATCH };
//# sourceMappingURL=_server.ts-CF5o1suI.js.map
