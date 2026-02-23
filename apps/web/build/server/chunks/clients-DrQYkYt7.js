import { I as clients, J as ilike, b as desc, K as clientProficiencies, t as eq } from './db-BWpbog7L.js';

async function saveClient(db, input) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await db.insert(clients).values({
    id: input.id,
    name: input.name,
    industry: input.industry ?? "",
    notes: input.notes ?? "",
    created_at: now,
    updated_at: now
  }).onConflictDoUpdate({
    target: clients.id,
    set: {
      name: input.name,
      industry: input.industry ?? "",
      notes: input.notes ?? "",
      updated_at: now
    }
  });
  return { success: true, id: input.id };
}
async function getClientById(db, id) {
  const rows = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  const client = rows[0] ?? null;
  if (!client)
    return null;
  const proficiencies = await getProficiencies(db, id);
  return { ...client, proficiencies };
}
async function listClients(db, search) {
  if (search) {
    return db.select().from(clients).where(ilike(clients.name, `%${search}%`)).orderBy(desc(clients.updated_at));
  }
  return db.select().from(clients).orderBy(desc(clients.updated_at));
}
async function saveProficiencies(db, input) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await db.transaction(async (tx) => {
    await tx.delete(clientProficiencies).where(eq(clientProficiencies.client_id, input.client_id));
    for (const [categoryId, data] of Object.entries(input.proficiencies)) {
      await tx.insert(clientProficiencies).values({
        client_id: input.client_id,
        category_id: categoryId,
        proficiency: data.proficiency,
        notes: data.notes ?? ""
      });
    }
    await tx.update(clients).set({ updated_at: now }).where(eq(clients.id, input.client_id));
  });
  return { success: true, total: Object.keys(input.proficiencies).length };
}
async function getProficiencies(db, clientId) {
  const rows = await db.select().from(clientProficiencies).where(eq(clientProficiencies.client_id, clientId));
  const result = {};
  for (const row of rows) {
    result[row.category_id] = {
      proficiency: row.proficiency,
      notes: row.notes
    };
  }
  return result;
}
async function deleteClient(db, id) {
  await db.delete(clients).where(eq(clients.id, id));
  return { success: true };
}

export { getClientById as a, saveProficiencies as b, deleteClient as d, getProficiencies as g, listClients as l, saveClient as s };
//# sourceMappingURL=clients-DrQYkYt7.js.map
