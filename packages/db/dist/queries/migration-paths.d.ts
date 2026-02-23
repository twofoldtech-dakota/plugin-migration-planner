import { type Database } from "../connection.js";
export interface SaveMigrationPathInput {
    id: string;
    source_pack_id: string;
    target_pack_id: string;
    prevalence?: string;
    complexity?: string;
    typical_duration?: string;
    primary_drivers?: unknown;
    prerequisites?: unknown;
    service_map?: unknown;
    migration_tools?: unknown;
    path_gotcha_patterns?: unknown;
    path_effort_adjustments?: unknown;
    step_by_step?: string;
    decision_points?: string;
    case_studies?: string;
    incompatibilities?: string;
    confidence?: string;
    last_researched?: string | null;
    version?: string;
}
export declare function saveMigrationPath(db: Database, input: SaveMigrationPathInput): Promise<{
    success: boolean;
    id: string;
}>;
export interface GetMigrationPathInput {
    id?: string;
    source_pack_id?: string;
    target_pack_id?: string;
}
export declare function getMigrationPath(db: Database, input: GetMigrationPathInput): Promise<{
    id: string;
    source_pack_id: string;
    target_pack_id: string;
    prevalence: string;
    complexity: string;
    typical_duration: string;
    primary_drivers: unknown;
    prerequisites: unknown;
    service_map: unknown;
    migration_tools: unknown;
    path_gotcha_patterns: unknown;
    path_effort_adjustments: unknown;
    step_by_step: string;
    decision_points: string;
    case_studies: string;
    incompatibilities: string;
    confidence: string;
    last_researched: string | null;
    version: string;
    created_at: string;
    updated_at: string;
} | null>;
export interface ListMigrationPathsFilters {
    source_pack_id?: string;
    target_pack_id?: string;
    complexity?: string;
    prevalence?: string;
}
export declare function listMigrationPaths(db: Database, filters?: ListMigrationPathsFilters): Promise<{
    id: string;
    source_pack_id: string;
    target_pack_id: string;
    prevalence: string;
    complexity: string;
    typical_duration: string;
    primary_drivers: unknown;
    prerequisites: unknown;
    service_map: unknown;
    migration_tools: unknown;
    path_gotcha_patterns: unknown;
    path_effort_adjustments: unknown;
    step_by_step: string;
    decision_points: string;
    case_studies: string;
    incompatibilities: string;
    confidence: string;
    last_researched: string | null;
    version: string;
    created_at: string;
    updated_at: string;
}[]>;
//# sourceMappingURL=migration-paths.d.ts.map