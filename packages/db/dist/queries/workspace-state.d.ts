import { type Database } from "../connection.js";
export declare function getActiveAssessmentId(db: Database, projectPath: string): Promise<string | null>;
export declare function setActiveAssessment(db: Database, projectPath: string, assessmentId: string): Promise<void>;
export declare function clearActiveAssessment(db: Database, projectPath: string): Promise<void>;
//# sourceMappingURL=workspace-state.d.ts.map