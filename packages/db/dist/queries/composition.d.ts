/**
 * Discovery Tree & Heuristics Composition Engine.
 *
 * Resolves all knowledge packs for an assessment, then merges their
 * discovery trees and heuristics into single, deduplicated result sets.
 * Higher-priority packs (lower tier number) win on ID conflicts.
 */
import { type Database } from "../connection.js";
import { type HeuristicType } from "./knowledge-heuristics.js";
export interface ResolvedPacks {
    packIds: string[];
    migrationPathId: string | null;
    packPriority: Record<string, number>;
    pinnedVersions: Record<string, number>;
}
export interface ComposedDimension {
    id: string;
    name: string;
    order: number;
    description: string;
    source_packs: string[];
    required_questions: any[];
    conditional_questions: any[];
    inference_rules: any[];
}
export interface ComposedDiscoveryTree {
    dimensions: ComposedDimension[];
    packs_used: Array<{
        pack_id: string;
        version: number;
    }>;
    migration_path_id?: string;
}
export interface ComposedHeuristics {
    effort_hours: Array<Record<string, unknown> & {
        source_pack_id: string;
    }>;
    multipliers: Array<Record<string, unknown> & {
        source_pack_id: string;
    }>;
    gotcha_patterns: Array<Record<string, unknown> & {
        source_pack_id: string;
    }>;
    dependency_chains: Array<Record<string, unknown> & {
        source_pack_id: string;
    }>;
    phase_mappings: Array<Record<string, unknown> & {
        source_pack_id: string;
    }>;
    roles: Array<Record<string, unknown> & {
        source_pack_id: string;
    }>;
    packs_used: Array<{
        pack_id: string;
        version: number;
    }>;
    migration_path_id?: string;
}
export declare function resolvePackIds(db: Database, assessmentId: string): Promise<ResolvedPacks>;
export declare function composeDiscoveryTree(db: Database, assessmentId: string): Promise<ComposedDiscoveryTree>;
export declare function composeHeuristics(db: Database, assessmentId: string, type?: HeuristicType): Promise<ComposedHeuristics>;
//# sourceMappingURL=composition.d.ts.map