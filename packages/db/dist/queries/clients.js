import { eq, desc, ilike } from "drizzle-orm";
import { clients, clientProficiencies } from "../schema.js";
export async function saveClient(db, input) {
    const now = new Date().toISOString();
    await db
        .insert(clients)
        .values({
        id: input.id,
        name: input.name,
        industry: input.industry ?? "",
        notes: input.notes ?? "",
        created_at: now,
        updated_at: now,
    })
        .onConflictDoUpdate({
        target: clients.id,
        set: {
            name: input.name,
            industry: input.industry ?? "",
            notes: input.notes ?? "",
            updated_at: now,
        },
    });
    return { success: true, id: input.id };
}
export async function getClientById(db, id) {
    const rows = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
    const client = rows[0] ?? null;
    if (!client)
        return null;
    const proficiencies = await getProficiencies(db, id);
    return { ...client, proficiencies };
}
export async function listClients(db, search) {
    if (search) {
        return db
            .select()
            .from(clients)
            .where(ilike(clients.name, `%${search}%`))
            .orderBy(desc(clients.updated_at));
    }
    return db.select().from(clients).orderBy(desc(clients.updated_at));
}
export async function saveProficiencies(db, input) {
    const now = new Date().toISOString();
    await db.transaction(async (tx) => {
        await tx.delete(clientProficiencies).where(eq(clientProficiencies.client_id, input.client_id));
        for (const [categoryId, data] of Object.entries(input.proficiencies)) {
            await tx.insert(clientProficiencies).values({
                client_id: input.client_id,
                category_id: categoryId,
                proficiency: data.proficiency,
                notes: data.notes ?? "",
            });
        }
        await tx
            .update(clients)
            .set({ updated_at: now })
            .where(eq(clients.id, input.client_id));
    });
    return { success: true, total: Object.keys(input.proficiencies).length };
}
export async function getProficiencies(db, clientId) {
    const rows = await db
        .select()
        .from(clientProficiencies)
        .where(eq(clientProficiencies.client_id, clientId));
    const result = {};
    for (const row of rows) {
        result[row.category_id] = {
            proficiency: row.proficiency,
            notes: row.notes,
        };
    }
    return result;
}
export async function deleteClient(db, id) {
    await db.delete(clients).where(eq(clients.id, id));
    return { success: true };
}
//# sourceMappingURL=clients.js.map