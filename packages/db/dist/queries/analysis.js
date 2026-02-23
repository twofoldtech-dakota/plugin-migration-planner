import { eq, sql } from "drizzle-orm";
import { risks, activeMultipliers, dependencyChains, riskClusters, assumptions, assessments, discoveryAnswers, } from "../schema.js";
export async function saveAnalysis(db, input) {
    const now = new Date().toISOString();
    await db.transaction(async (tx) => {
        // Clear existing analysis data
        await tx.delete(risks).where(eq(risks.assessment_id, input.assessment_id));
        await tx.delete(activeMultipliers).where(eq(activeMultipliers.assessment_id, input.assessment_id));
        await tx.delete(dependencyChains).where(eq(dependencyChains.assessment_id, input.assessment_id));
        await tx.delete(riskClusters).where(eq(riskClusters.assessment_id, input.assessment_id));
        await tx.delete(assumptions).where(eq(assumptions.assessment_id, input.assessment_id));
        // Insert risks
        for (const r of input.risks ?? []) {
            await tx.insert(risks).values({
                id: r.id,
                assessment_id: input.assessment_id,
                category: r.category ?? "",
                description: r.description ?? "",
                likelihood: r.likelihood ?? "",
                impact: r.impact ?? "",
                severity: r.severity ?? "",
                estimated_hours_impact: r.estimated_hours_impact ?? 0,
                linked_assumptions: r.linked_assumptions ?? [],
                mitigation: r.mitigation ?? "",
                contingency: r.contingency ?? "",
                owner: r.owner ?? "",
                status: r.status ?? "open",
            });
        }
        // Insert multipliers
        for (const m of input.active_multipliers ?? []) {
            await tx.insert(activeMultipliers).values({
                assessment_id: input.assessment_id,
                multiplier_id: m.id,
                name: m.name ?? "",
                factor: m.factor ?? 1.0,
                trigger_condition: m.trigger ?? "",
                affected_components: m.affected_components ?? [],
            });
        }
        // Insert dependency chains
        for (const dc of input.dependency_chains ?? []) {
            const toArr = Array.isArray(dc.to) ? dc.to : [dc.to];
            for (const to of toArr) {
                await tx.insert(dependencyChains).values({
                    assessment_id: input.assessment_id,
                    from_component: dc.from,
                    to_component: to,
                    dependency_type: dc.type ?? "hard",
                });
            }
        }
        // Insert risk clusters
        for (const rc of input.risk_clusters ?? []) {
            await tx.insert(riskClusters).values({
                assessment_id: input.assessment_id,
                name: rc.name,
                risks: rc.risks ?? [],
                assumptions: rc.assumptions ?? [],
                combined_widening_hours: rc.combined_widening_hours ?? 0,
            });
        }
        // Insert assumptions
        for (const a of input.assumptions ?? []) {
            await tx.insert(assumptions).values({
                id: a.id,
                assessment_id: input.assessment_id,
                dimension: a.dimension ?? "",
                question_id: a.question_id ?? null,
                assumed_value: a.assumed_value ?? "",
                basis: a.basis ?? "",
                confidence: a.confidence ?? "unknown",
                validation_status: a.validation_status ?? "unvalidated",
                validation_method: a.validation_method ?? "",
                pessimistic_widening_hours: a.pessimistic_widening_hours ?? 0,
                affected_components: a.affected_components ?? [],
                created_at: now,
            });
        }
        await tx
            .update(assessments)
            .set({ updated_at: now })
            .where(eq(assessments.id, input.assessment_id));
    });
    return {
        success: true,
        risks: (input.risks ?? []).length,
        assumptions: (input.assumptions ?? []).length,
    };
}
export async function getAnalysis(db, assessmentId) {
    const [riskRows, multRows, chainRows, clusterRows, assumRows] = await Promise.all([
        db.select().from(risks).where(eq(risks.assessment_id, assessmentId)),
        db.select().from(activeMultipliers).where(eq(activeMultipliers.assessment_id, assessmentId)),
        db.select().from(dependencyChains).where(eq(dependencyChains.assessment_id, assessmentId)),
        db.select().from(riskClusters).where(eq(riskClusters.assessment_id, assessmentId)),
        db.select().from(assumptions).where(eq(assumptions.assessment_id, assessmentId)),
    ]);
    // Gap summary
    const gapRows = await db
        .select({
        unknown_answers: sql `sum(case when ${discoveryAnswers.confidence} = 'unknown' then 1 else 0 end)`,
        assumed_answers: sql `sum(case when ${discoveryAnswers.confidence} = 'assumed' then 1 else 0 end)`,
        confirmed_answers: sql `sum(case when ${discoveryAnswers.confidence} = 'confirmed' then 1 else 0 end)`,
        total_answers: sql `count(*)`,
    })
        .from(discoveryAnswers)
        .where(eq(discoveryAnswers.assessment_id, assessmentId));
    if (riskRows.length === 0 && assumRows.length === 0)
        return null;
    // Aggregate chains
    const chainMap = {};
    for (const c of chainRows) {
        if (!chainMap[c.from_component]) {
            chainMap[c.from_component] = { to: [], type: c.dependency_type };
        }
        chainMap[c.from_component].to.push(c.to_component);
    }
    const gapRow = gapRows[0];
    return {
        risks: riskRows,
        active_multipliers: multRows,
        dependency_chains: Object.entries(chainMap).map(([from, v]) => ({
            from,
            to: v.to,
            type: v.type,
        })),
        risk_clusters: clusterRows,
        assumptions: assumRows,
        gaps: gapRow
            ? {
                unknown_answers: gapRow.unknown_answers ?? 0,
                assumed_answers: gapRow.assumed_answers ?? 0,
                confirmed_answers: gapRow.confirmed_answers ?? 0,
                total_answers: gapRow.total_answers ?? 0,
            }
            : null,
    };
}
//# sourceMappingURL=analysis.js.map