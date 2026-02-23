import { type Database } from "../connection.js";
export interface WBSVersionSummary {
    version: number;
    estimate_version: number;
    total_items: number;
    total_hours: number;
    created_at: string;
}
export interface WorkItemInput {
    temp_id?: number;
    parent_temp_id?: number | null;
    type: string;
    title: string;
    description?: string;
    hours?: number;
    base_hours?: number;
    role?: string | null;
    phase_id?: string;
    component_id?: string;
    labels?: unknown[];
    acceptance_criteria?: unknown[];
    priority?: string;
    confidence?: string;
    sort_order?: number;
    source?: string;
    blocked_by?: unknown[];
    blocks?: unknown[];
}
export interface SaveWBSSnapshotInput {
    assessment_id: string;
    estimate_version?: number;
    items: WorkItemInput[];
}
export interface UpdateWorkItemInput {
    title?: string;
    type?: string;
    description?: string;
    hours?: number;
    role?: string | null;
    priority?: string;
    confidence?: string;
    labels?: unknown[];
    acceptance_criteria?: unknown[];
    blocked_by?: unknown[];
    blocks?: unknown[];
}
export declare function listWBSVersions(db: Database, assessmentId: string): Promise<WBSVersionSummary[]>;
export declare function saveWBSSnapshot(db: Database, input: SaveWBSSnapshotInput): Promise<{
    success: boolean;
    version: number;
    snapshot_id: number;
}>;
export declare function getWBSSnapshot(db: Database, assessmentId: string, version?: number): Promise<{
    id: number;
    assessment_id: string;
    version: number;
    estimate_version: number;
    total_items: number;
    total_hours: number;
    items: any[];
    flat_items: {
        id: number;
        snapshot_id: number;
        parent_id: number | null;
        type: string;
        title: string;
        description: string;
        hours: number;
        base_hours: number;
        role: string | null;
        phase_id: string;
        component_id: string;
        labels: unknown;
        acceptance_criteria: unknown;
        priority: string;
        confidence: string;
        sort_order: number;
        source: string;
        blocked_by: unknown;
        blocks: unknown;
    }[];
    created_at: string;
    updated_at: string;
} | null>;
export declare function updateWorkItem(db: Database, itemId: number, updates: UpdateWorkItemInput): Promise<{
    success: boolean;
}>;
export declare function createWorkItem(db: Database, snapshotId: number, item: Omit<WorkItemInput, "temp_id" | "parent_temp_id"> & {
    parent_id?: number | null;
}): Promise<{
    success: boolean;
    id: number;
}>;
export declare function deleteWorkItem(db: Database, itemId: number): Promise<{
    success: boolean;
    error: string;
} | {
    success: boolean;
    error?: undefined;
}>;
export declare function reorderWorkItems(db: Database, snapshotId: number, orderedIds: number[]): Promise<{
    success: boolean;
}>;
//# sourceMappingURL=wbs.d.ts.map