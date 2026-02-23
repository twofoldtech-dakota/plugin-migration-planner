import { type Database } from "../connection.js";
export declare function getDeliverables(db: Database, assessmentId: string): Promise<{
    assessment_id: string;
    name: string;
    file_path: string;
    generated_at: string;
}[]>;
export declare function upsertDeliverable(db: Database, assessmentId: string, name: string, filePath: string): Promise<void>;
//# sourceMappingURL=deliverables.d.ts.map