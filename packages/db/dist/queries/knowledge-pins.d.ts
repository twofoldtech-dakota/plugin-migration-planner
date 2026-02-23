import { type Database } from "../connection.js";
export interface PinKnowledgeVersionInput {
    assessment_id: string;
    pack_ids: string[];
}
export declare function pinKnowledgeVersion(db: Database, input: PinKnowledgeVersionInput): Promise<{
    success: boolean;
    pins: {
        pack_id: string;
        pinned_version: number;
    }[];
}>;
export declare function getPinnedKnowledge(db: Database, assessmentId: string): Promise<{
    assessment_id: string;
    pack_id: string;
    pinned_version: number;
    pinned_at: string;
    pack_name: string;
    pack_category: string;
}[]>;
//# sourceMappingURL=knowledge-pins.d.ts.map