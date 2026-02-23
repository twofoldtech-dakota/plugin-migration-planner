import { type Database } from "../connection.js";
export interface SaveAiSelectionsInput {
    assessment_id: string;
    selections: Record<string, boolean>;
    disabled_reasons?: Record<string, string>;
}
export declare function saveAiSelections(db: Database, input: SaveAiSelectionsInput): Promise<{
    success: boolean;
    total: number;
}>;
export declare function getAiSelections(db: Database, assessmentId: string): Promise<{
    selections: Record<string, boolean>;
    disabled_reasons: Record<string, string>;
}>;
//# sourceMappingURL=ai-selections.d.ts.map