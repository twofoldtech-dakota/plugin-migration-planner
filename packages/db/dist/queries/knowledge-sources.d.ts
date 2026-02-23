import { type Database } from "../connection.js";
export interface SaveSourceUrlsInput {
    pack_id?: string | null;
    migration_path_id?: string | null;
    urls: Array<{
        source_url: string;
        title?: string;
        source_type?: string;
        claims?: unknown;
        confidence?: string;
        still_accessible?: boolean;
    }>;
}
export declare function saveSourceUrls(db: Database, input: SaveSourceUrlsInput): Promise<{
    success: boolean;
    count: number;
}>;
export interface GetSourceUrlsInput {
    pack_id?: string;
    migration_path_id?: string;
}
export declare function getSourceUrls(db: Database, input: GetSourceUrlsInput): Promise<{
    id: number;
    pack_id: string | null;
    migration_path_id: string | null;
    source_url: string;
    title: string;
    source_type: string;
    accessed_at: string;
    claims: unknown;
    confidence: string;
    still_accessible: boolean;
}[]>;
export interface CheckUrlFreshnessInput {
    /** Only check URLs not accessed since this date. Defaults to 7 days ago. */
    stale_threshold_days?: number;
    /** Only check URLs for a specific pack. */
    pack_id?: string;
    /** Only check URLs for a specific migration path. */
    migration_path_id?: string;
    /** Request timeout in ms. Defaults to 10000 (10s). */
    timeout_ms?: number;
}
export interface UrlFreshnessResult {
    total_checked: number;
    still_accessible: number;
    now_inaccessible: number;
    errors: Array<{
        id: number;
        url: string;
        status: number | null;
        error: string;
    }>;
}
/**
 * Check all (or filtered) source URLs for accessibility.
 * Uses HEAD requests with fallback to GET. Updates `still_accessible` and `accessed_at`.
 */
export declare function checkUrlFreshness(db: Database, input?: CheckUrlFreshnessInput): Promise<UrlFreshnessResult>;
//# sourceMappingURL=knowledge-sources.d.ts.map