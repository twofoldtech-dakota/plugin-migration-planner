import { type Database } from "../connection.js";
export interface TeamVersionSummary {
    version: number;
    estimate_version: number;
    created_at: string;
}
export interface TeamRoleInput {
    role_id: string;
    role_name?: string;
    total_hours?: number;
    base_hours?: number;
    headcount?: number;
    allocation?: string;
    seniority?: string;
    rate_min?: number;
    rate_max?: number;
    rate_override?: number | null;
    phases?: unknown[];
    notes?: string;
    source?: string;
    sort_order?: number;
}
export interface SaveTeamSnapshotInput {
    assessment_id: string;
    estimate_version?: number;
    assumptions?: unknown;
    cost_projection?: unknown;
    phase_staffing?: unknown[];
    hiring_notes?: unknown[];
    notes?: string;
    roles: TeamRoleInput[];
}
export interface UpdateTeamRoleInput {
    role_name?: string;
    total_hours?: number;
    headcount?: number;
    allocation?: string;
    seniority?: string;
    rate_min?: number;
    rate_max?: number;
    rate_override?: number | null;
    phases?: unknown[];
    notes?: string;
}
export declare function listTeamVersions(db: Database, assessmentId: string): Promise<TeamVersionSummary[]>;
export declare function saveTeamSnapshot(db: Database, input: SaveTeamSnapshotInput): Promise<{
    success: boolean;
    version: number;
    snapshot_id: number;
}>;
export declare function getTeamSnapshot(db: Database, assessmentId: string, version?: number): Promise<{
    id: number;
    assessment_id: string;
    version: number;
    estimate_version: number;
    assumptions: unknown;
    cost_projection: unknown;
    phase_staffing: unknown;
    hiring_notes: unknown;
    notes: string;
    roles: {
        id: number;
        snapshot_id: number;
        role_id: string;
        role_name: string;
        total_hours: number;
        base_hours: number;
        headcount: number;
        allocation: string;
        seniority: string;
        rate_min: number;
        rate_max: number;
        rate_override: number | null;
        phases: unknown;
        notes: string;
        source: string;
        sort_order: number;
    }[];
    created_at: string;
    updated_at: string;
} | null>;
export declare function updateTeamRole(db: Database, roleId: number, updates: UpdateTeamRoleInput): Promise<{
    success: boolean;
}>;
export declare function createTeamRole(db: Database, snapshotId: number, role: TeamRoleInput): Promise<{
    success: boolean;
    id: number;
}>;
export declare function deleteTeamRole(db: Database, roleId: number): Promise<{
    success: boolean;
    error: string;
} | {
    success: boolean;
    error?: undefined;
}>;
//# sourceMappingURL=team.d.ts.map