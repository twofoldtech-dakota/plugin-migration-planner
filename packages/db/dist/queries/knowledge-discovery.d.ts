import { type Database } from "../connection.js";
export interface SaveDiscoveryTreeInput {
    pack_id: string;
    dimensions?: unknown;
}
export declare function saveDiscoveryTree(db: Database, input: SaveDiscoveryTreeInput): Promise<{
    success: boolean;
    pack_id: string;
    version: number;
}>;
export declare function getDiscoveryTree(db: Database, packIds: string[], version?: number): Promise<{
    packs: {
        pack_id: string;
        version: number;
        dimensions: unknown;
    }[];
    dimensions: unknown[];
}>;
//# sourceMappingURL=knowledge-discovery.d.ts.map