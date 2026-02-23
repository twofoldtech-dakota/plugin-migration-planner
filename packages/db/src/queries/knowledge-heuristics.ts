import { eq, inArray } from "drizzle-orm";
import { type Database } from "../connection.js";
import {
  knowledgeEffortHours,
  knowledgeMultipliers,
  knowledgeGotchaPatterns,
  knowledgeDependencyChains,
  knowledgePhaseMappings,
  knowledgeRoles,
} from "../schema.js";

export interface SaveHeuristicsInput {
  pack_id: string;
  effort_hours?: Array<{
    component_id: string;
    component_name?: string;
    base_hours?: number;
    unit?: string;
    includes?: string;
    role_breakdown?: unknown;
    phase_id?: string;
  }>;
  multipliers?: Array<{
    multiplier_id: string;
    condition?: string;
    factor?: number;
    applies_to?: unknown;
    reason?: string;
    supersedes?: string | null;
  }>;
  gotcha_patterns?: Array<{
    pattern_id: string;
    pattern_condition?: string;
    risk_level?: string;
    hours_impact?: number;
    description?: string;
    mitigation?: string;
    affected_components?: unknown;
  }>;
  dependency_chains?: Array<{
    chain_id: string;
    predecessor: string;
    successors?: unknown;
    dependency_type?: string;
    reason?: string;
  }>;
  phase_mappings?: Array<{
    phase_id: string;
    phase_name?: string;
    phase_order?: number;
    component_ids?: unknown;
  }>;
  roles?: Array<{
    role_id: string;
    description?: string;
    typical_rate_range?: string;
  }>;
}

export async function saveHeuristics(db: Database, input: SaveHeuristicsInput) {
  await db.transaction(async (tx) => {
    // Delete existing heuristics for this pack
    await Promise.all([
      tx.delete(knowledgeEffortHours).where(eq(knowledgeEffortHours.pack_id, input.pack_id)),
      tx.delete(knowledgeMultipliers).where(eq(knowledgeMultipliers.pack_id, input.pack_id)),
      tx.delete(knowledgeGotchaPatterns).where(eq(knowledgeGotchaPatterns.pack_id, input.pack_id)),
      tx.delete(knowledgeDependencyChains).where(eq(knowledgeDependencyChains.pack_id, input.pack_id)),
      tx.delete(knowledgePhaseMappings).where(eq(knowledgePhaseMappings.pack_id, input.pack_id)),
      tx.delete(knowledgeRoles).where(eq(knowledgeRoles.pack_id, input.pack_id)),
    ]);

    // Insert new heuristics
    for (const e of input.effort_hours ?? []) {
      await tx.insert(knowledgeEffortHours).values({
        pack_id: input.pack_id,
        component_id: e.component_id,
        component_name: e.component_name ?? "",
        base_hours: e.base_hours ?? 0,
        unit: e.unit ?? "",
        includes: e.includes ?? "",
        role_breakdown: e.role_breakdown ?? {},
        phase_id: e.phase_id ?? "",
      });
    }

    for (const m of input.multipliers ?? []) {
      await tx.insert(knowledgeMultipliers).values({
        pack_id: input.pack_id,
        multiplier_id: m.multiplier_id,
        condition: m.condition ?? "",
        factor: m.factor ?? 1.0,
        applies_to: m.applies_to ?? [],
        reason: m.reason ?? "",
        supersedes: m.supersedes ?? null,
      });
    }

    for (const g of input.gotcha_patterns ?? []) {
      await tx.insert(knowledgeGotchaPatterns).values({
        pack_id: input.pack_id,
        pattern_id: g.pattern_id,
        pattern_condition: g.pattern_condition ?? "",
        risk_level: g.risk_level ?? "medium",
        hours_impact: g.hours_impact ?? 0,
        description: g.description ?? "",
        mitigation: g.mitigation ?? "",
        affected_components: g.affected_components ?? [],
      });
    }

    for (const c of input.dependency_chains ?? []) {
      await tx.insert(knowledgeDependencyChains).values({
        pack_id: input.pack_id,
        chain_id: c.chain_id,
        predecessor: c.predecessor,
        successors: c.successors ?? [],
        dependency_type: c.dependency_type ?? "hard",
        reason: c.reason ?? "",
      });
    }

    for (const p of input.phase_mappings ?? []) {
      await tx.insert(knowledgePhaseMappings).values({
        pack_id: input.pack_id,
        phase_id: p.phase_id,
        phase_name: p.phase_name ?? "",
        phase_order: p.phase_order ?? 0,
        component_ids: p.component_ids ?? [],
      });
    }

    for (const r of input.roles ?? []) {
      await tx.insert(knowledgeRoles).values({
        pack_id: input.pack_id,
        role_id: r.role_id,
        description: r.description ?? "",
        typical_rate_range: r.typical_rate_range ?? "",
      });
    }
  });

  return { success: true, pack_id: input.pack_id };
}

export type HeuristicType = "effort" | "multipliers" | "gotchas" | "chains" | "phases" | "roles";

export async function getHeuristicsForPacks(
  db: Database,
  packIds: string[],
  type?: HeuristicType
) {
  const result: Record<string, Record<string, unknown[]>> = {};

  for (const packId of packIds) {
    result[packId] = {};
  }

  const fetches: Promise<void>[] = [];

  if (!type || type === "effort") {
    fetches.push(
      (async () => {
        const rows = await db
          .select()
          .from(knowledgeEffortHours)
          .where(inArray(knowledgeEffortHours.pack_id, packIds));
        for (const r of rows) {
          if (!result[r.pack_id]) result[r.pack_id] = {};
          if (!result[r.pack_id].effort_hours) result[r.pack_id].effort_hours = [];
          result[r.pack_id].effort_hours.push(r);
        }
      })()
    );
  }

  if (!type || type === "multipliers") {
    fetches.push(
      (async () => {
        const rows = await db
          .select()
          .from(knowledgeMultipliers)
          .where(inArray(knowledgeMultipliers.pack_id, packIds));
        for (const r of rows) {
          if (!result[r.pack_id]) result[r.pack_id] = {};
          if (!result[r.pack_id].multipliers) result[r.pack_id].multipliers = [];
          result[r.pack_id].multipliers.push(r);
        }
      })()
    );
  }

  if (!type || type === "gotchas") {
    fetches.push(
      (async () => {
        const rows = await db
          .select()
          .from(knowledgeGotchaPatterns)
          .where(inArray(knowledgeGotchaPatterns.pack_id, packIds));
        for (const r of rows) {
          if (!result[r.pack_id]) result[r.pack_id] = {};
          if (!result[r.pack_id].gotcha_patterns) result[r.pack_id].gotcha_patterns = [];
          result[r.pack_id].gotcha_patterns.push(r);
        }
      })()
    );
  }

  if (!type || type === "chains") {
    fetches.push(
      (async () => {
        const rows = await db
          .select()
          .from(knowledgeDependencyChains)
          .where(inArray(knowledgeDependencyChains.pack_id, packIds));
        for (const r of rows) {
          if (!result[r.pack_id]) result[r.pack_id] = {};
          if (!result[r.pack_id].dependency_chains) result[r.pack_id].dependency_chains = [];
          result[r.pack_id].dependency_chains.push(r);
        }
      })()
    );
  }

  if (!type || type === "phases") {
    fetches.push(
      (async () => {
        const rows = await db
          .select()
          .from(knowledgePhaseMappings)
          .where(inArray(knowledgePhaseMappings.pack_id, packIds));
        for (const r of rows) {
          if (!result[r.pack_id]) result[r.pack_id] = {};
          if (!result[r.pack_id].phase_mappings) result[r.pack_id].phase_mappings = [];
          result[r.pack_id].phase_mappings.push(r);
        }
      })()
    );
  }

  if (!type || type === "roles") {
    fetches.push(
      (async () => {
        const rows = await db
          .select()
          .from(knowledgeRoles)
          .where(inArray(knowledgeRoles.pack_id, packIds));
        for (const r of rows) {
          if (!result[r.pack_id]) result[r.pack_id] = {};
          if (!result[r.pack_id].roles) result[r.pack_id].roles = [];
          result[r.pack_id].roles.push(r);
        }
      })()
    );
  }

  await Promise.all(fetches);
  return result;
}
