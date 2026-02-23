// Re-export from shared db package
export { getDb } from "@migration-planner/db";

// Auto-import from .migration/ JSON files is handled separately
// since it depends on filesystem access and is MCP-server specific
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  getDb,
  saveAssessment,
  saveDiscovery,
  saveAnalysis,
  saveEstimate,
  saveAiSelections,
  saveCalibration,
  setActiveAssessment,
} from "@migration-planner/db";

export async function autoImportFromJson(
  assessmentId: string,
  projectPath: string
): Promise<boolean> {
  const migDir = join(projectPath, ".migration");
  const markerPath = join(migDir, ".sqlite-imported");

  if (!existsSync(migDir) || existsSync(markerPath)) return false;
  const assessmentPath = join(migDir, "assessment.json");
  if (!existsSync(assessmentPath)) return false;

  const db = getDb();

  // 1. Import assessment
  const raw = readFileSync(assessmentPath, "utf-8");
  const a = JSON.parse(raw);
  const aid = a.id ?? assessmentId;

  await saveAssessment(db, {
    id: aid,
    project_name: a.project_name ?? a.name ?? "",
    client_name: a.client_name ?? a.client ?? "",
    architect: a.architect ?? "",
    project_path: projectPath,
    sitecore_version: a.sitecore_version ?? "",
    topology: a.topology ?? "",
    source_cloud: a.source_cloud ?? "aws",
    target_cloud: a.target_cloud ?? "azure",
    target_timeline: a.target_timeline ?? "",
    environment_count: a.environment_count ?? 1,
    environments: a.environments ?? [],
    status: a.status ?? "discovery",
  });

  // 2. Import discovery files
  const discDir = join(migDir, "discovery");
  if (existsSync(discDir)) {
    for (const file of readdirSync(discDir)) {
      if (!file.endsWith(".json")) continue;
      const dim = file.replace(".json", "");
      const data = JSON.parse(readFileSync(join(discDir, file), "utf-8"));

      const answers: Record<string, { value: unknown; notes?: string; confidence?: string; basis?: string | null }> = {};

      for (const [qid, ans] of Object.entries(data.answers ?? {})) {
        const a2 = ans as Record<string, unknown>;
        answers[qid] = {
          value: a2.value ?? null,
          notes: (a2.notes as string) ?? "",
          confidence: (a2.confidence as string) ?? "unknown",
          basis: null,
        };
      }

      // Import inferred values
      for (const [qid, inf] of Object.entries(data.inferred ?? {})) {
        const i = inf as Record<string, unknown>;
        answers[qid] = {
          value: i.value ?? null,
          notes: "",
          confidence: (i.confidence as string) ?? "assumed",
          basis: (i.basis as string) ?? null,
        };
      }

      await saveDiscovery(db, {
        assessment_id: aid,
        dimension: dim,
        status: data.status ?? "not_started",
        completed_at: data.completed_at ?? null,
        answers,
      });
    }
  }

  // 3. Import analysis + assumptions
  const analysisPath = join(migDir, "analysis.json");
  const assumPath = join(migDir, "assumptions-registry.json");

  const analysisInput: Parameters<typeof saveAnalysis>[1] = {
    assessment_id: aid,
    risks: [],
    active_multipliers: [],
    dependency_chains: [],
    risk_clusters: [],
    assumptions: [],
  };

  if (existsSync(analysisPath)) {
    const an = JSON.parse(readFileSync(analysisPath, "utf-8"));
    analysisInput.risks = (an.risks ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      category: (r.category as string) ?? "",
      description: (r.description as string) ?? "",
      likelihood: (r.likelihood as string) ?? "",
      impact: (r.impact as string) ?? "",
      severity: (r.severity as string) ?? "",
      estimated_hours_impact: (r.estimated_hours_impact as number) ?? 0,
      linked_assumptions: (r.linked_assumptions as string[]) ?? [],
      mitigation: (r.mitigation as string) ?? "",
      contingency: (r.contingency as string) ?? "",
      owner: (r.owner as string) ?? "",
      status: (r.status as string) ?? "open",
    }));
    analysisInput.active_multipliers = (an.active_multipliers ?? []).map((m: Record<string, unknown>) => ({
      id: (m.id as string),
      name: (m.name as string) ?? "",
      factor: (m.factor as number) ?? 1.0,
      trigger: (m.trigger as string) ?? "",
      affected_components: (m.affected_components as string[]) ?? [],
    }));
    analysisInput.dependency_chains = (an.dependency_chains ?? []).map((dc: Record<string, unknown>) => ({
      from: (dc.from ?? dc.from_component) as string,
      to: (dc.to ?? dc.to_component) as string | string[],
      type: (dc.type ?? dc.dependency_type ?? "hard") as string,
    }));
    analysisInput.risk_clusters = (an.risk_clusters ?? []).map((rc: Record<string, unknown>) => ({
      name: rc.name as string,
      risks: (rc.risks as string[]) ?? [],
      assumptions: (rc.assumptions as string[]) ?? [],
      combined_widening_hours: (rc.combined_widening_hours as number) ?? 0,
    }));
  }

  if (existsSync(assumPath)) {
    const ar = JSON.parse(readFileSync(assumPath, "utf-8"));
    analysisInput.assumptions = (ar.assumptions ?? []).map((asmp: Record<string, unknown>) => ({
      id: asmp.id as string,
      dimension: (asmp.dimension as string) ?? "",
      question_id: (asmp.question_id as string) ?? null,
      assumed_value: (asmp.assumed_value as string) ?? "",
      basis: (asmp.basis as string) ?? "",
      confidence: (asmp.confidence as string) ?? "unknown",
      validation_status: (asmp.validation_status as string) ?? "unvalidated",
      validation_method: (asmp.validation_method as string) ?? "",
      pessimistic_widening_hours: (asmp.pessimistic_widening_hours as number) ?? 0,
      affected_components: (asmp.affected_components as string[]) ?? [],
    }));
  }

  if ((analysisInput.risks?.length ?? 0) > 0 || (analysisInput.assumptions?.length ?? 0) > 0) {
    await saveAnalysis(db, analysisInput);
  }

  // 5. Import estimate
  const estimatePath = join(migDir, "estimate.json");
  if (existsSync(estimatePath)) {
    const est = JSON.parse(readFileSync(estimatePath, "utf-8"));
    await saveEstimate(db, {
      assessment_id: aid,
      confidence_score: est.confidence_score ?? 0,
      total_base_hours: est.total_base_hours ?? 0,
      total_gotcha_hours: est.total_gotcha_hours ?? 0,
      total_expected_hours: est.total_expected_hours ?? 0,
      assumption_widening_hours: est.assumption_widening_hours ?? 0,
      totals: est.totals ?? {},
      total_by_role: est.total_by_role ?? {},
      client_summary: est.client_summary ?? {},
      phases: (est.phases ?? []).map((phase: Record<string, unknown>) => ({
        id: phase.id as string,
        name: phase.name as string,
        duration: phase.duration as string | undefined,
        components: ((phase.components as Array<Record<string, unknown>>) ?? []).map((comp) => ({
          id: comp.id as string,
          name: comp.name as string,
          units: (comp.units as number) ?? 1,
          base_hours: (comp.base_hours as number) ?? 0,
          multipliers_applied: comp.multipliers_applied ?? [],
          gotcha_hours: (comp.gotcha_hours as number) ?? 0,
          final_hours: (comp.final_hours as number) ?? 0,
          firm_hours: (comp.firm_hours as number) ?? 0,
          assumption_dependent_hours: (comp.assumption_dependent_hours as number) ?? 0,
          assumptions_affecting: (comp.assumptions_affecting as string[]) ?? [],
          hours: comp.hours ?? {},
          ai_alternatives: comp.ai_alternatives ?? [],
          by_role: comp.by_role ?? {},
        })),
      })),
    });
  }

  // 6. Import AI selections
  const aiSelPath = join(migDir, "ai-alternatives-selection.json");
  if (existsSync(aiSelPath)) {
    const sel = JSON.parse(readFileSync(aiSelPath, "utf-8"));
    await saveAiSelections(db, {
      assessment_id: aid,
      selections: sel.selections ?? {},
      disabled_reasons: sel.disabled_reasons ?? {},
    });
  }

  // 7. Import calibration files
  const calDir = join(migDir, "calibration");
  if (existsSync(calDir)) {
    for (const file of readdirSync(calDir)) {
      if (!file.endsWith(".json")) continue;
      const cal = JSON.parse(readFileSync(join(calDir, file), "utf-8"));
      await saveCalibration(db, {
        assessment_id: aid,
        engagement_name: cal.engagement ?? "",
        estimate_date: cal.estimate_date ?? "",
        status: cal.status ?? "in_progress",
        total_estimated: cal.actuals?.total?.estimated ?? {},
        total_actual: cal.actuals?.total?.actual ?? null,
        surprises: cal.surprises ?? [],
        smoother: cal.smoother_than_expected ?? [],
        suggested_adjustments: cal.suggested_heuristic_adjustments ?? [],
        phases: (cal.actuals?.phases ?? []).map((p: Record<string, unknown>) => ({
          id: p.id as string,
          name: (p.name as string) ?? "",
          estimated_hours: (p.estimated_hours as number) ?? 0,
          actual_hours: (p.actual_hours as number) ?? 0,
          variance_percent: (p.variance_percent as number) ?? 0,
          variance_direction: (p.variance_direction as string) ?? "",
          notes: (p.notes as string) ?? "",
        })),
        components: (cal.actuals?.components ?? []).map((c: Record<string, unknown>) => ({
          id: c.id as string,
          estimated_hours: (c.estimated_hours as number) ?? 0,
          actual_hours: (c.actual_hours as number) ?? 0,
          variance_percent: (c.variance_percent as number) ?? 0,
          notes: (c.notes as string) ?? "",
        })),
        ai_tools: (cal.ai_tools_actuals ?? []).map((t: Record<string, unknown>) => ({
          id: t.id as string,
          name: (t.name as string) ?? "",
          was_used: (t.was_used as boolean) ?? false,
          estimated_savings_hours: (t.estimated_savings_hours as number) ?? 0,
          actual_savings_hours: (t.actual_savings_hours as number) ?? 0,
          variance_percent: (t.variance_percent as number) ?? 0,
          notes: (t.notes as string) ?? "",
        })),
      });
    }
  }

  // Set imported assessment as active for this path
  await setActiveAssessment(db, projectPath, aid);

  // Write marker
  writeFileSync(markerPath, new Date().toISOString(), "utf-8");
  return true;
}
