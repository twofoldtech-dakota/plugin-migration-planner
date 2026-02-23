import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { getWBSSnapshot } from '@migration-planner/db';

export const GET: RequestHandler = async ({ url }) => {
    const assessmentId = url.searchParams.get('assessment');
    const format = url.searchParams.get('format') ?? 'csv';
    const version = url.searchParams.get('version');

    if (!assessmentId) return error(400, 'Missing assessment param');

    const snapshot = await getWBSSnapshot(
        db(),
        assessmentId,
        version ? parseInt(version, 10) : undefined
    );
    if (!snapshot) return error(404, 'No WBS snapshot found');

    const flatItems = snapshot.flat_items as any[];

    if (format === 'json') {
        return new Response(JSON.stringify(snapshot, null, 2), {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="wbs-v${snapshot.version}.json"`,
            },
        });
    }

    if (format === 'md') {
        const lines = ['# Work Breakdown Structure', '', `Version: ${snapshot.version}`, `Total Items: ${snapshot.total_items}`, `Total Hours: ${snapshot.total_hours}`, ''];
        for (const item of flatItems) {
            const indent = item.parent_id ? '  ' : '';
            const typeTag = `[${(item.type as string).toUpperCase()}]`;
            lines.push(`${indent}- ${typeTag} **${item.title}** — ${item.hours}h${item.role ? ` (${item.role})` : ''}`);
            if (item.description) lines.push(`${indent}  ${item.description}`);
        }
        return new Response(lines.join('\n'), {
            headers: {
                'Content-Type': 'text/markdown',
                'Content-Disposition': `attachment; filename="wbs-v${snapshot.version}.md"`,
            },
        });
    }

    // CSV — Jira-compatible format
    const headers = ['Issue Type', 'Summary', 'Description', 'Story Points', 'Priority', 'Labels', 'Parent ID', 'Component', 'Assignee Role', 'Acceptance Criteria'];
    const typeMap: Record<string, string> = {
        epic: 'Epic',
        feature: 'Feature',
        story: 'Story',
        task: 'Task',
        spike: 'Spike',
    };

    const rows = flatItems.map((item) => {
        const ac = Array.isArray(item.acceptance_criteria)
            ? (item.acceptance_criteria as string[]).join('; ')
            : '';
        const labels = Array.isArray(item.labels)
            ? (item.labels as string[]).join(' ')
            : '';
        return [
            typeMap[item.type as string] ?? item.type,
            `"${(item.title as string).replace(/"/g, '""')}"`,
            `"${(item.description as string).replace(/"/g, '""')}"`,
            String(item.hours),
            item.priority,
            labels,
            item.parent_id ?? '',
            item.component_id ?? '',
            item.role ?? '',
            `"${ac.replace(/"/g, '""')}"`,
        ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    return new Response(csv, {
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="wbs-v${snapshot.version}.csv"`,
        },
    });
};
