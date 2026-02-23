import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { db } from '$lib/server/db';
import { getAssessmentById } from '@migration-planner/db';

export interface ComponentRefinements {
	roleOverrides: Record<string, Record<string, number>>;   // compId → role → hours
	roleTasks:     Record<string, Record<string, string[]>>; // compId → role → tasks
}

async function getRefinementsPath(assessmentId: string): Promise<string | null> {
	const assessment = await getAssessmentById(db(), assessmentId);
	if (!assessment?.project_path) return null;
	return join(assessment.project_path, '.migration', 'refinements.json');
}

async function readRefinements(path: string): Promise<ComponentRefinements> {
	if (!existsSync(path)) return { roleOverrides: {}, roleTasks: {} };
	try {
		const raw = await readFile(path, 'utf-8');
		return JSON.parse(raw);
	} catch {
		return { roleOverrides: {}, roleTasks: {} };
	}
}

export const GET: RequestHandler = async ({ params }) => {
	const path = await getRefinementsPath(params.id);
	if (!path) throw error(404, 'Assessment not found');
	const data = await readRefinements(path);
	return json(data);
};

export const PATCH: RequestHandler = async ({ params, request }) => {
	const path = await getRefinementsPath(params.id);
	if (!path) throw error(404, 'Assessment not found');

	const body = await request.json() as Partial<ComponentRefinements>;
	const current = await readRefinements(path);

	const updated: ComponentRefinements = {
		roleOverrides: { ...current.roleOverrides, ...(body.roleOverrides ?? {}) },
		roleTasks:     { ...current.roleTasks,     ...(body.roleTasks ?? {}) },
	};

	await mkdir(join(path, '..'), { recursive: true });
	await writeFile(path, JSON.stringify(updated, null, 2), 'utf-8');

	return json({ success: true });
};
