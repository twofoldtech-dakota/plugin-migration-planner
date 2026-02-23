import { type Database } from "../connection.js";
export interface SaveKnowledgePackInput {
    id: string;
    name: string;
    vendor?: string;
    category: string;
    subcategory?: string;
    description?: string;
    direction?: string;
    latest_version?: string;
    supported_versions?: unknown;
    eol_versions?: unknown;
    valid_topologies?: unknown;
    deployment_models?: unknown;
    compatible_targets?: unknown;
    compatible_infrastructure?: unknown;
    required_services?: unknown;
    optional_services?: unknown;
    confidence?: string;
    last_researched?: string | null;
    pack_version?: string;
    created_by?: string;
    change_summary?: string;
}
export declare function saveKnowledgePack(db: Database, input: SaveKnowledgePackInput): Promise<{
    success: boolean;
    id: string;
    version: number;
}>;
export declare function getKnowledgePackById(db: Database, id: string): Promise<{
    id: string;
    name: string;
    vendor: string;
    category: string;
    subcategory: string;
    description: string;
    direction: string;
    latest_version: string;
    supported_versions: unknown;
    eol_versions: unknown;
    valid_topologies: unknown;
    deployment_models: unknown;
    compatible_targets: unknown;
    compatible_infrastructure: unknown;
    required_services: unknown;
    optional_services: unknown;
    confidence: string;
    last_researched: string | null;
    pack_version: string;
    created_at: string;
    updated_at: string;
}>;
export type IncludeSection = "heuristics" | "discovery" | "ai_alternatives" | "sources";
export declare function getKnowledgePackFull(db: Database, id: string, include?: IncludeSection[], version?: number): Promise<Record<string, unknown> | null>;
export interface ListKnowledgePacksFilters {
    category?: string;
    direction?: string;
    subcategory?: string;
    search?: string;
}
export declare function listKnowledgePacks(db: Database, filters?: ListKnowledgePacksFilters): Promise<{
    id: string;
    name: string;
    vendor: string;
    category: string;
    subcategory: string;
    description: string;
    direction: string;
    latest_version: string;
    supported_versions: unknown;
    eol_versions: unknown;
    valid_topologies: unknown;
    deployment_models: unknown;
    compatible_targets: unknown;
    compatible_infrastructure: unknown;
    required_services: unknown;
    optional_services: unknown;
    confidence: string;
    last_researched: string | null;
    pack_version: string;
    created_at: string;
    updated_at: string;
}[]>;
export declare function deleteKnowledgePack(db: Database, id: string): Promise<{
    success: boolean;
}>;
//# sourceMappingURL=knowledge-packs.d.ts.map