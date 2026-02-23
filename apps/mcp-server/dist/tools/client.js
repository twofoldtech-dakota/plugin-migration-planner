import { z } from "zod";
import { getDb, saveClient as dbSaveClient, getClientById, listClients as dbListClients, saveProficiencies as dbSaveProficiencies, getProficiencies as dbGetProficiencies, } from "@migration-planner/db";
// ── Save Client ──────────────────────────────────────────────
export const saveClientSchema = z.object({
    id: z.string(),
    name: z.string(),
    industry: z.string().default(""),
    notes: z.string().default(""),
});
export async function saveClient(input) {
    const db = getDb();
    return dbSaveClient(db, input);
}
// ── Get Client ───────────────────────────────────────────────
export const getClientSchema = z.object({
    id: z.string().optional(),
    name: z.string().optional(),
});
export async function getClient(input) {
    const db = getDb();
    if (input.id) {
        return getClientById(db, input.id);
    }
    if (input.name) {
        const results = await dbListClients(db, input.name);
        return results[0] ?? null;
    }
    return null;
}
// ── List Clients ─────────────────────────────────────────────
export const listClientsSchema = z.object({
    search: z.string().optional(),
});
export async function listClients(input) {
    const db = getDb();
    return dbListClients(db, input.search);
}
// ── Save Client Proficiencies ────────────────────────────────
export const saveClientProficienciesSchema = z.object({
    client_id: z.string(),
    proficiencies: z.record(z.string(), z.object({
        proficiency: z.string(),
        notes: z.string().default(""),
    })),
});
export async function saveClientProficiencies(input) {
    const db = getDb();
    return dbSaveProficiencies(db, input);
}
// ── Get Client Proficiencies ─────────────────────────────────
export const getClientProficienciesSchema = z.object({
    client_id: z.string(),
});
export async function getClientProficiencies(input) {
    const db = getDb();
    return dbGetProficiencies(db, input.client_id);
}
//# sourceMappingURL=client.js.map