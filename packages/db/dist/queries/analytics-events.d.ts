import type { Database } from "../connection.js";
export interface AnalyticsEventInput {
    session_id: string;
    event: string;
    category?: string;
    properties?: Record<string, unknown>;
    path?: string;
    assessment_id?: string | null;
    created_at?: string;
}
export declare function insertAnalyticsEvents(db: Database, events: AnalyticsEventInput[]): Promise<void>;
export interface PageViewBucket {
    bucket: string;
    count: number;
}
export declare function getPageViewsOverTime(db: Database, hours?: number): Promise<PageViewBucket[]>;
export declare function getTopPages(db: Database, days?: number, limit?: number): Promise<{
    path: string;
    count: number;
}[]>;
export declare function getTopFeatures(db: Database, days?: number, limit?: number): Promise<{
    event: string;
    count: number;
}[]>;
export declare function getSessionCount(db: Database, days?: number): Promise<number>;
export declare function getPageViewCount(db: Database, hours?: number): Promise<number>;
export declare function getMostEngagedAssessments(db: Database, days?: number, limit?: number): Promise<{
    assessment_id: string;
    count: number;
}[]>;
//# sourceMappingURL=analytics-events.d.ts.map