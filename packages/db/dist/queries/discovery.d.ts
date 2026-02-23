import { type Database } from "../connection.js";
export interface SaveDiscoveryInput {
    assessment_id: string;
    dimension: string;
    status?: string;
    completed_at?: string | null;
    answers?: Record<string, {
        value: unknown;
        notes?: string;
        confidence?: string;
        basis?: string | null;
    }>;
}
export declare function saveDiscovery(db: Database, input: SaveDiscoveryInput): Promise<{
    success: boolean;
    dimension: string;
}>;
export declare function getDiscovery(db: Database, assessmentId: string, dimension?: string): Promise<Record<string, unknown> | null>;
//# sourceMappingURL=discovery.d.ts.map