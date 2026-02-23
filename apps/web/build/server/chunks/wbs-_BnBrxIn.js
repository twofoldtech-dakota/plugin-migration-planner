import { X as wbsSnapshots, t as eq, b as desc, Y as workItems, j as assessments, x as and, s as sql } from './db-BWpbog7L.js';
import { m as max } from './aggregate-B2GxRiPZ.js';

async function listWBSVersions(db, assessmentId) {
  const rows = await db.select({
    version: wbsSnapshots.version,
    estimate_version: wbsSnapshots.estimate_version,
    total_items: wbsSnapshots.total_items,
    total_hours: wbsSnapshots.total_hours,
    created_at: wbsSnapshots.created_at
  }).from(wbsSnapshots).where(eq(wbsSnapshots.assessment_id, assessmentId)).orderBy(desc(wbsSnapshots.version));
  return rows;
}
async function saveWBSSnapshot(db, input) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const maxVersionRows = await db.select({ v: max(wbsSnapshots.version) }).from(wbsSnapshots).where(eq(wbsSnapshots.assessment_id, input.assessment_id));
  const version = (maxVersionRows[0]?.v ?? 0) + 1;
  let snapshotId = 0;
  const totalHours = input.items.reduce((s, i) => s + (i.hours ?? 0), 0);
  await db.transaction(async (tx) => {
    const inserted = await tx.insert(wbsSnapshots).values({
      assessment_id: input.assessment_id,
      version,
      estimate_version: input.estimate_version ?? 1,
      total_items: input.items.length,
      total_hours: totalHours,
      created_at: now,
      updated_at: now
    }).returning({ id: wbsSnapshots.id });
    snapshotId = inserted[0].id;
    const tempIdToRealId = /* @__PURE__ */ new Map();
    const roots = input.items.filter((i) => !i.parent_temp_id);
    const children = input.items.filter((i) => !!i.parent_temp_id);
    for (const item of roots) {
      const [row] = await tx.insert(workItems).values({
        snapshot_id: snapshotId,
        parent_id: null,
        type: item.type,
        title: item.title,
        description: item.description ?? "",
        hours: item.hours ?? 0,
        base_hours: item.base_hours ?? 0,
        role: item.role ?? null,
        phase_id: item.phase_id ?? "",
        component_id: item.component_id ?? "",
        labels: item.labels ?? [],
        acceptance_criteria: item.acceptance_criteria ?? [],
        priority: item.priority ?? "medium",
        confidence: item.confidence ?? "medium",
        sort_order: item.sort_order ?? 0,
        source: item.source ?? "generated",
        blocked_by: item.blocked_by ?? [],
        blocks: item.blocks ?? []
      }).returning({ id: workItems.id });
      if (item.temp_id !== void 0) {
        tempIdToRealId.set(item.temp_id, row.id);
      }
    }
    for (const item of children) {
      const resolvedParentId = item.parent_temp_id ? tempIdToRealId.get(item.parent_temp_id) ?? null : null;
      const [row] = await tx.insert(workItems).values({
        snapshot_id: snapshotId,
        parent_id: resolvedParentId,
        type: item.type,
        title: item.title,
        description: item.description ?? "",
        hours: item.hours ?? 0,
        base_hours: item.base_hours ?? 0,
        role: item.role ?? null,
        phase_id: item.phase_id ?? "",
        component_id: item.component_id ?? "",
        labels: item.labels ?? [],
        acceptance_criteria: item.acceptance_criteria ?? [],
        priority: item.priority ?? "medium",
        confidence: item.confidence ?? "medium",
        sort_order: item.sort_order ?? 0,
        source: item.source ?? "generated",
        blocked_by: item.blocked_by ?? [],
        blocks: item.blocks ?? []
      }).returning({ id: workItems.id });
      if (item.temp_id !== void 0) {
        tempIdToRealId.set(item.temp_id, row.id);
      }
    }
    await tx.update(assessments).set({ updated_at: now }).where(eq(assessments.id, input.assessment_id));
  });
  return { success: true, version, snapshot_id: snapshotId };
}
async function getWBSSnapshot(db, assessmentId, version) {
  let snapshot;
  if (version) {
    const rows = await db.select().from(wbsSnapshots).where(and(eq(wbsSnapshots.assessment_id, assessmentId), eq(wbsSnapshots.version, version))).limit(1);
    snapshot = rows[0];
  } else {
    const rows = await db.select().from(wbsSnapshots).where(eq(wbsSnapshots.assessment_id, assessmentId)).orderBy(sql`${wbsSnapshots.version} DESC`).limit(1);
    snapshot = rows[0];
  }
  if (!snapshot)
    return null;
  const items = await db.select().from(workItems).where(eq(workItems.snapshot_id, snapshot.id)).orderBy(workItems.sort_order);
  const itemMap = /* @__PURE__ */ new Map();
  const roots = [];
  for (const item of items) {
    const node = { ...item, children: [] };
    itemMap.set(item.id, node);
  }
  for (const item of items) {
    const node = itemMap.get(item.id);
    if (item.parent_id && itemMap.has(item.parent_id)) {
      itemMap.get(item.parent_id).children.push(node);
    } else {
      roots.push(node);
    }
  }
  return {
    id: snapshot.id,
    assessment_id: snapshot.assessment_id,
    version: snapshot.version,
    estimate_version: snapshot.estimate_version,
    total_items: snapshot.total_items,
    total_hours: snapshot.total_hours,
    items: roots,
    flat_items: items,
    created_at: snapshot.created_at,
    updated_at: snapshot.updated_at
  };
}
async function updateWorkItem(db, itemId, updates) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await db.update(workItems).set(updates).where(eq(workItems.id, itemId));
  const [item] = await db.select({ snapshot_id: workItems.snapshot_id }).from(workItems).where(eq(workItems.id, itemId)).limit(1);
  if (item) {
    await db.update(wbsSnapshots).set({ updated_at: now }).where(eq(wbsSnapshots.id, item.snapshot_id));
  }
  return { success: true };
}
async function createWorkItem(db, snapshotId, item) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const [maxRow] = await db.select({ v: max(workItems.sort_order) }).from(workItems).where(eq(workItems.snapshot_id, snapshotId));
  const sortOrder = (maxRow?.v ?? 0) + 1;
  const [inserted] = await db.insert(workItems).values({
    snapshot_id: snapshotId,
    parent_id: item.parent_id ?? null,
    type: item.type,
    title: item.title,
    description: item.description ?? "",
    hours: item.hours ?? 0,
    base_hours: item.base_hours ?? 0,
    role: item.role ?? null,
    phase_id: item.phase_id ?? "",
    component_id: item.component_id ?? "",
    labels: item.labels ?? [],
    acceptance_criteria: item.acceptance_criteria ?? [],
    priority: item.priority ?? "medium",
    confidence: item.confidence ?? "medium",
    sort_order: sortOrder,
    source: item.source ?? "custom",
    blocked_by: item.blocked_by ?? [],
    blocks: item.blocks ?? []
  }).returning({ id: workItems.id });
  await db.update(wbsSnapshots).set({
    total_items: sql`${wbsSnapshots.total_items} + 1`,
    total_hours: sql`${wbsSnapshots.total_hours} + ${item.hours ?? 0}`,
    updated_at: now
  }).where(eq(wbsSnapshots.id, snapshotId));
  return { success: true, id: inserted.id };
}
async function deleteWorkItem(db, itemId) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const [item] = await db.select().from(workItems).where(eq(workItems.id, itemId)).limit(1);
  if (!item)
    return { success: false, error: "Item not found" };
  const children = await db.select().from(workItems).where(eq(workItems.parent_id, itemId));
  const totalDeletedHours = item.hours + children.reduce((s, c) => s + c.hours, 0);
  const totalDeletedItems = 1 + children.length;
  if (children.length > 0) {
    await db.delete(workItems).where(eq(workItems.parent_id, itemId));
  }
  await db.delete(workItems).where(eq(workItems.id, itemId));
  await db.update(wbsSnapshots).set({
    total_items: sql`${wbsSnapshots.total_items} - ${totalDeletedItems}`,
    total_hours: sql`${wbsSnapshots.total_hours} - ${totalDeletedHours}`,
    updated_at: now
  }).where(eq(wbsSnapshots.id, item.snapshot_id));
  return { success: true };
}
async function reorderWorkItems(db, snapshotId, orderedIds) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await db.transaction(async (tx) => {
    for (let i = 0; i < orderedIds.length; i++) {
      await tx.update(workItems).set({ sort_order: i }).where(and(eq(workItems.id, orderedIds[i]), eq(workItems.snapshot_id, snapshotId)));
    }
  });
  await db.update(wbsSnapshots).set({ updated_at: now }).where(eq(wbsSnapshots.id, snapshotId));
  return { success: true };
}

export { createWorkItem as c, deleteWorkItem as d, getWBSSnapshot as g, listWBSVersions as l, reorderWorkItems as r, saveWBSSnapshot as s, updateWorkItem as u };
//# sourceMappingURL=wbs-_BnBrxIn.js.map
