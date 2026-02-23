import { type Database } from "../connection.js";
export interface QueryProjectsInput {
    status?: string;
    client_name?: string;
    limit?: number;
}
export declare function queryProjects(db: Database, input: QueryProjectsInput): Promise<{
    projects: {
        completeness_pct: number | null;
        total_assumptions: number;
        validated_assumptions: number;
        estimate_version: number;
        confidence_score: number;
        total_expected_hours: number;
        recommended_hours: {} | null;
        id: string;
        project_name: string;
        client_name: string;
        status: string;
        topology: string;
        source_cloud: string;
        target_cloud: string;
        source_stack: unknown;
        target_stack: unknown;
        created_at: string;
    }[];
    total: number;
}>;
export interface QueryConfidenceTimelineInput {
    from?: string;
    to?: string;
    limit?: number;
}
export interface ConfidenceTimelinePoint {
    assessment_id: string;
    project_name: string;
    confidence_score: number;
    version: number;
    created_at: string;
}
export declare function queryConfidenceTimeline(db: Database, input?: QueryConfidenceTimelineInput): Promise<ConfidenceTimelinePoint[]>;
//# sourceMappingURL=analytics.d.ts.map