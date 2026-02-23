import { eq, sql, desc, like, and, gt, gte, lte, asc } from "drizzle-orm";
import { assessments, discoveryDimensions, assumptions, estimateSnapshots, } from "../schema.js";
export async function queryProjects(db, input) {
    // Build the query with left joins similar to the old v_project_analytics view
    const conditions = [];
    if (input.status) {
        conditions.push(eq(assessments.status, input.status));
    }
    if (input.client_name) {
        conditions.push(like(assessments.client_name, `%${input.client_name}%`));
    }
    const rows = await db
        .select({
        id: assessments.id,
        project_name: assessments.project_name,
        client_name: assessments.client_name,
        status: assessments.status,
        topology: assessments.topology,
        source_cloud: assessments.source_cloud,
        target_cloud: assessments.target_cloud,
        source_stack: assessments.source_stack,
        target_stack: assessments.target_stack,
        created_at: assessments.created_at,
    })
        .from(assessments)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(assessments.created_at))
        .limit(input.limit ?? 50);
    // Enrich with discovery progress, assumption summary, and latest estimate
    const projects = await Promise.all(rows.map(async (row) => {
        // Discovery progress
        const dpRows = await db
            .select({
            total_dimensions: sql `count(*)`,
            complete: sql `sum(case when ${discoveryDimensions.status} = 'complete' then 1 else 0 end)`,
            partial: sql `sum(case when ${discoveryDimensions.status} = 'partial' then 1 else 0 end)`,
        })
            .from(discoveryDimensions)
            .where(eq(discoveryDimensions.assessment_id, row.id));
        const dp = dpRows[0];
        const completeness_pct = dp && dp.total_dimensions > 0
            ? Math.round((((dp.complete ?? 0) + (dp.partial ?? 0) * 0.5) / dp.total_dimensions) * 1000) / 10
            : null;
        // Assumption summary
        const asmpRows = await db
            .select({
            total_assumptions: sql `count(*)`,
            validated: sql `sum(case when ${assumptions.validation_status} = 'validated' then 1 else 0 end)`,
        })
            .from(assumptions)
            .where(eq(assumptions.assessment_id, row.id));
        const asmp = asmpRows[0];
        // Latest estimate
        const estRows = await db
            .select({
            version: estimateSnapshots.version,
            confidence_score: estimateSnapshots.confidence_score,
            total_expected_hours: estimateSnapshots.total_expected_hours,
            client_summary: estimateSnapshots.client_summary,
        })
            .from(estimateSnapshots)
            .where(eq(estimateSnapshots.assessment_id, row.id))
            .orderBy(desc(estimateSnapshots.version))
            .limit(1);
        const est = estRows[0];
        return {
            ...row,
            completeness_pct,
            total_assumptions: asmp?.total_assumptions ?? null,
            validated_assumptions: asmp?.validated ?? null,
            estimate_version: est?.version ?? null,
            confidence_score: est?.confidence_score ?? null,
            total_expected_hours: est?.total_expected_hours ?? null,
            recommended_hours: est?.client_summary &&
                typeof est.client_summary === "object" &&
                est.client_summary !== null
                ? est.client_summary.recommended_hours ?? null
                : null,
        };
    }));
    return { projects, total: projects.length };
}
export async function queryConfidenceTimeline(db, input = {}) {
    const conditions = [gt(estimateSnapshots.confidence_score, 0)];
    if (input.from) {
        conditions.push(gte(estimateSnapshots.created_at, input.from));
    }
    if (input.to) {
        conditions.push(lte(estimateSnapshots.created_at, input.to));
    }
    const rows = await db
        .select({
        assessment_id: estimateSnapshots.assessment_id,
        project_name: assessments.project_name,
        confidence_score: estimateSnapshots.confidence_score,
        version: estimateSnapshots.version,
        created_at: estimateSnapshots.created_at,
    })
        .from(estimateSnapshots)
        .innerJoin(assessments, eq(estimateSnapshots.assessment_id, assessments.id))
        .where(and(...conditions))
        .orderBy(asc(estimateSnapshots.created_at))
        .limit(input.limit ?? 500);
    return rows;
}
//# sourceMappingURL=analytics.js.map