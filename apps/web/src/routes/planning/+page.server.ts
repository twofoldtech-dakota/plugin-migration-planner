import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import {
    listAssessments,
    getAssessmentById,
    getEstimate,
    getAnalysis,
    getDeliverables,
    getWBSSnapshot,
    listWBSVersions,
    getTeamSnapshot,
    listTeamVersions,
} from '@migration-planner/db';

export const load: PageServerLoad = async ({ url }) => {
    const assessmentId = url.searchParams.get('assessment');
    const tab = url.searchParams.get('tab') ?? 'documents';
    const wbsVersion = url.searchParams.get('wbsVersion');
    const teamVersion = url.searchParams.get('teamVersion');

    // Always load assessment list for dropdown
    const allAssessments = await listAssessments(db());

    if (!assessmentId) {
        return { assessments: allAssessments, tab };
    }

    const assessment = await getAssessmentById(db(), assessmentId);
    if (!assessment) {
        return { assessments: allAssessments, tab, error: 'Assessment not found' };
    }

    // Parallel load all data
    const [estimate, analysis, deliverables, wbs, wbsVersions, team, teamVersions] =
        await Promise.all([
            getEstimate(db(), assessmentId),
            getAnalysis(db(), assessmentId),
            getDeliverables(db(), assessmentId),
            getWBSSnapshot(
                db(),
                assessmentId,
                wbsVersion ? parseInt(wbsVersion, 10) : undefined
            ),
            listWBSVersions(db(), assessmentId),
            getTeamSnapshot(
                db(),
                assessmentId,
                teamVersion ? parseInt(teamVersion, 10) : undefined
            ),
            listTeamVersions(db(), assessmentId),
        ]);

    return {
        assessments: allAssessments,
        assessment,
        estimate,
        analysis,
        deliverables,
        wbs,
        wbsVersions,
        team,
        teamVersions,
        tab,
    };
};
