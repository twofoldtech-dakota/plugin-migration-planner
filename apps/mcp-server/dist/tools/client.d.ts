import { z } from "zod";
export declare const saveClientSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    industry: z.ZodDefault<z.ZodString>;
    notes: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    notes: string;
    id: string;
    name: string;
    industry: string;
}, {
    id: string;
    name: string;
    notes?: string | undefined;
    industry?: string | undefined;
}>;
export declare function saveClient(input: z.infer<typeof saveClientSchema>): Promise<{
    success: boolean;
    id: string;
}>;
export declare const getClientSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id?: string | undefined;
    name?: string | undefined;
}, {
    id?: string | undefined;
    name?: string | undefined;
}>;
export declare function getClient(input: z.infer<typeof getClientSchema>): Promise<{
    id: string;
    name: string;
    industry: string;
    notes: string;
    created_at: string;
    updated_at: string;
} | null>;
export declare const listClientsSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    search?: string | undefined;
}, {
    search?: string | undefined;
}>;
export declare function listClients(input: z.infer<typeof listClientsSchema>): Promise<{
    id: string;
    name: string;
    industry: string;
    notes: string;
    created_at: string;
    updated_at: string;
}[]>;
export declare const saveClientProficienciesSchema: z.ZodObject<{
    client_id: z.ZodString;
    proficiencies: z.ZodRecord<z.ZodString, z.ZodObject<{
        proficiency: z.ZodString;
        notes: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        notes: string;
        proficiency: string;
    }, {
        proficiency: string;
        notes?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    client_id: string;
    proficiencies: Record<string, {
        notes: string;
        proficiency: string;
    }>;
}, {
    client_id: string;
    proficiencies: Record<string, {
        proficiency: string;
        notes?: string | undefined;
    }>;
}>;
export declare function saveClientProficiencies(input: z.infer<typeof saveClientProficienciesSchema>): Promise<{
    success: boolean;
    total: number;
}>;
export declare const getClientProficienciesSchema: z.ZodObject<{
    client_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    client_id: string;
}, {
    client_id: string;
}>;
export declare function getClientProficiencies(input: z.infer<typeof getClientProficienciesSchema>): Promise<Record<string, import("@migration-planner/db").ProficiencyEntry>>;
//# sourceMappingURL=client.d.ts.map