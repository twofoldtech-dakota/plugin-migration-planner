import { type Database } from "../connection.js";
export interface SaveClientInput {
    id: string;
    name: string;
    industry?: string;
    notes?: string;
}
export declare function saveClient(db: Database, input: SaveClientInput): Promise<{
    success: boolean;
    id: string;
}>;
export declare function getClientById(db: Database, id: string): Promise<{
    proficiencies: Record<string, ProficiencyEntry>;
    id: string;
    name: string;
    industry: string;
    notes: string;
    created_at: string;
    updated_at: string;
} | null>;
export declare function listClients(db: Database, search?: string): Promise<{
    id: string;
    name: string;
    industry: string;
    notes: string;
    created_at: string;
    updated_at: string;
}[]>;
export interface ProficiencyEntry {
    proficiency: string;
    notes: string;
}
export interface SaveProficienciesInput {
    client_id: string;
    proficiencies: Record<string, {
        proficiency: string;
        notes?: string;
    }>;
}
export declare function saveProficiencies(db: Database, input: SaveProficienciesInput): Promise<{
    success: boolean;
    total: number;
}>;
export declare function getProficiencies(db: Database, clientId: string): Promise<Record<string, ProficiencyEntry>>;
export declare function deleteClient(db: Database, id: string): Promise<{
    success: boolean;
}>;
//# sourceMappingURL=clients.d.ts.map