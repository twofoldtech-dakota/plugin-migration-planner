import { eq, and, lt, or, isNull } from "drizzle-orm";
import { knowledgeSourceUrls } from "../schema.js";
export async function saveSourceUrls(db, input) {
    const now = new Date().toISOString();
    for (const url of input.urls) {
        await db.insert(knowledgeSourceUrls).values({
            pack_id: input.pack_id ?? null,
            migration_path_id: input.migration_path_id ?? null,
            source_url: url.source_url,
            title: url.title ?? "",
            source_type: url.source_type ?? "vendor-docs",
            accessed_at: now,
            claims: url.claims ?? [],
            confidence: url.confidence ?? "medium",
            still_accessible: url.still_accessible ?? true,
        });
    }
    return { success: true, count: input.urls.length };
}
export async function getSourceUrls(db, input) {
    if (input.pack_id) {
        return db
            .select()
            .from(knowledgeSourceUrls)
            .where(eq(knowledgeSourceUrls.pack_id, input.pack_id));
    }
    if (input.migration_path_id) {
        return db
            .select()
            .from(knowledgeSourceUrls)
            .where(eq(knowledgeSourceUrls.migration_path_id, input.migration_path_id));
    }
    return [];
}
/**
 * Check all (or filtered) source URLs for accessibility.
 * Uses HEAD requests with fallback to GET. Updates `still_accessible` and `accessed_at`.
 */
export async function checkUrlFreshness(db, input = {}) {
    const thresholdDays = input.stale_threshold_days ?? 7;
    const timeoutMs = input.timeout_ms ?? 10000;
    const cutoff = new Date(Date.now() - thresholdDays * 86400000).toISOString();
    // Build filters
    const conditions = [
        or(lt(knowledgeSourceUrls.accessed_at, cutoff), isNull(knowledgeSourceUrls.accessed_at)),
    ];
    if (input.pack_id) {
        conditions.push(eq(knowledgeSourceUrls.pack_id, input.pack_id));
    }
    if (input.migration_path_id) {
        conditions.push(eq(knowledgeSourceUrls.migration_path_id, input.migration_path_id));
    }
    const rows = await db
        .select({ id: knowledgeSourceUrls.id, source_url: knowledgeSourceUrls.source_url })
        .from(knowledgeSourceUrls)
        .where(and(...conditions));
    const now = new Date().toISOString();
    const errors = [];
    let accessible = 0;
    let inaccessible = 0;
    // Check in batches of 5 to avoid overwhelming targets
    for (let i = 0; i < rows.length; i += 5) {
        const batch = rows.slice(i, i + 5);
        const results = await Promise.allSettled(batch.map(async (row) => {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), timeoutMs);
            try {
                // Try HEAD first (lighter), fall back to GET
                let response = await fetch(row.source_url, {
                    method: "HEAD",
                    signal: controller.signal,
                    redirect: "follow",
                });
                // Some servers reject HEAD — retry with GET
                if (response.status === 405 || response.status === 403) {
                    response = await fetch(row.source_url, {
                        method: "GET",
                        signal: controller.signal,
                        redirect: "follow",
                    });
                }
                const ok = response.status >= 200 && response.status < 400;
                return { id: row.id, url: row.source_url, ok, status: response.status };
            }
            catch (err) {
                return {
                    id: row.id,
                    url: row.source_url,
                    ok: false,
                    status: null,
                    error: err.name === "AbortError" ? "timeout" : (err.message ?? "unknown"),
                };
            }
            finally {
                clearTimeout(timer);
            }
        }));
        for (const result of results) {
            if (result.status === "rejected")
                continue;
            const { id, url, ok, status } = result.value;
            const errorMsg = "error" in result.value ? result.value.error : undefined;
            await db
                .update(knowledgeSourceUrls)
                .set({ still_accessible: ok, accessed_at: now })
                .where(eq(knowledgeSourceUrls.id, id));
            if (ok) {
                accessible++;
            }
            else {
                inaccessible++;
                errors.push({ id, url, status, error: errorMsg ?? `HTTP ${status}` });
            }
        }
    }
    return {
        total_checked: rows.length,
        still_accessible: accessible,
        now_inaccessible: inaccessible,
        errors,
    };
}
//# sourceMappingURL=knowledge-sources.js.map