import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { db } from '$lib/server/db';
import { getAssessmentById } from '@migration-planner/db';

export const GET: RequestHandler = async ({ url, params }) => {
    const filePath = url.searchParams.get('path');
    if (!filePath) throw error(400, 'Missing path parameter');

    // Prevent directory traversal — only allow paths inside .migration/
    if (!filePath.includes('.migration/') || filePath.includes('..')) {
        throw error(403, 'Access denied');
    }

    // Resolve relative paths against the assessment's project_path
    let absolutePath = filePath;
    if (!filePath.startsWith('/')) {
        const assessment = await getAssessmentById(db(), params.id);
        if (!assessment?.project_path) {
            throw error(404, 'Assessment not found');
        }
        absolutePath = resolve(assessment.project_path, filePath);
    }

    // Re-validate the resolved path is still inside .migration/
    if (!absolutePath.includes('.migration/')) {
        throw error(403, 'Access denied');
    }

    if (!existsSync(absolutePath)) {
        throw error(404, 'File not found');
    }

    const content = await readFile(absolutePath, 'utf-8');
    return json({ content });
};
