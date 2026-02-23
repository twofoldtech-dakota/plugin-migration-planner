import { type Database } from "../connection.js";
export interface SaveScopeExclusionsInput {
    assessment_id: string;
    exclusions: Record<string, boolean>;
    reasons?: Record<string, string>;
}
export declare function saveScopeExclusions(db: Database, input: SaveScopeExclusionsInput): Promise<{
    success: boolean;
    total: number;
}>;
export declare function getScopeExclusions(db: Database, assessmentId: string): Promise<{
    exclusions: Record<string, boolean>;
    reasons: Record<string, string>;
}>;
//# sourceMappingURL=scope-exclusions.d.ts.map