import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { getTeamSnapshot } from '@migration-planner/db';

export const GET: RequestHandler = async ({ url }) => {
    const assessmentId = url.searchParams.get('assessment');
    const format = url.searchParams.get('format') ?? 'csv';
    const version = url.searchParams.get('version');

    if (!assessmentId) return error(400, 'Missing assessment param');

    const snapshot = await getTeamSnapshot(
        db(),
        assessmentId,
        version ? parseInt(version, 10) : undefined
    );
    if (!snapshot) return error(404, 'No team snapshot found');

    if (format === 'json') {
        return new Response(JSON.stringify(snapshot, null, 2), {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="team-v${snapshot.version}.json"`,
            },
        });
    }

    if (format === 'md') {
        const lines = [
            '# Team Composition',
            '',
            `Version: ${snapshot.version}`,
            '',
            '| Role | Hours | Headcount | Allocation | Seniority | Rate Range |',
            '|------|-------|-----------|------------|-----------|------------|',
        ];
        for (const role of snapshot.roles) {
            lines.push(
                `| ${role.role_name} | ${role.total_hours}h | ${role.headcount} | ${role.allocation} | ${role.seniority} | $${role.rate_min}-$${role.rate_max}/h |`
            );
        }

        const cost = snapshot.cost_projection as any;
        if (cost?.low) {
            lines.push('', '## Cost Projection', '');
            lines.push(`- **Low:** $${cost.low.toLocaleString()}`);
            lines.push(`- **Expected:** $${cost.expected.toLocaleString()}`);
            lines.push(`- **High:** $${cost.high.toLocaleString()}`);
        }

        return new Response(lines.join('\n'), {
            headers: {
                'Content-Type': 'text/markdown',
                'Content-Disposition': `attachment; filename="team-v${snapshot.version}.md"`,
            },
        });
    }

    // CSV
    const headers = ['Role ID', 'Role Name', 'Total Hours', 'Headcount', 'Allocation', 'Seniority', 'Rate Min', 'Rate Max', 'Notes'];
    const rows = snapshot.roles.map((role) => [
        role.role_id,
        `"${role.role_name.replace(/"/g, '""')}"`,
        String(role.total_hours),
        String(role.headcount),
        role.allocation,
        role.seniority,
        String(role.rate_min),
        String(role.rate_max),
        `"${(role.notes ?? '').replace(/"/g, '""')}"`,
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    return new Response(csv, {
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="team-v${snapshot.version}.csv"`,
        },
    });
};
