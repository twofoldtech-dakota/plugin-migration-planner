/**
 * Migration script: populate source_stack / target_stack / migration_scope
 * from existing legacy fields (sitecore_version, topology, source_cloud, target_cloud).
 *
 * Run with: npx tsx src/migrate-stacks.ts
 *
 * Safe to run multiple times — only updates assessments where source_stack is empty.
 */
import { eq, sql } from "drizzle-orm";
import { getDb, closeDb } from "./connection.js";
import { assessments } from "./schema.js";

async function main() {
  const db = getDb();

  // Find assessments with empty source_stack (not yet migrated)
  const rows = await db
    .select()
    .from(assessments)
    .where(sql`${assessments.source_stack} = '{}'::jsonb`);

  if (rows.length === 0) {
    console.log("No assessments need migration — all already have source_stack populated.");
    await closeDb();
    return;
  }

  console.log(`Migrating ${rows.length} assessment(s) to stack model...\n`);

  for (const row of rows) {
    const sourceStack: Record<string, unknown> = {};
    const targetStack: Record<string, unknown> = {};
    const migrationScope: Record<string, unknown> = {};

    // Build source_stack from legacy fields
    if (row.sitecore_version) {
      sourceStack.platform = "sitecore-xp";
      sourceStack.platform_version = row.sitecore_version;
    }
    if (row.topology) {
      sourceStack.topology = row.topology;
    }
    if (row.source_cloud) {
      sourceStack.infrastructure = row.source_cloud;
    }
    // Services are discovered later, leave empty
    sourceStack.services = [];

    // Build target_stack from legacy fields
    if (row.target_cloud) {
      targetStack.infrastructure = row.target_cloud;
    }
    // Target platform not tracked in legacy model — leave empty for user to fill
    targetStack.services = [];

    // Derive migration_scope
    if (sourceStack.platform && sourceStack.infrastructure && targetStack.infrastructure) {
      migrationScope.type = "cloud-migration";
      migrationScope.layers_affected = ["infrastructure", "services", "data"];
      if (sourceStack.infrastructure !== targetStack.infrastructure) {
        migrationScope.complexity = "major";
      } else {
        migrationScope.complexity = "moderate";
      }
    }

    await db
      .update(assessments)
      .set({
        source_stack: sourceStack,
        target_stack: targetStack,
        migration_scope: migrationScope,
        updated_at: new Date().toISOString(),
      })
      .where(eq(assessments.id, row.id));

    console.log(`  [${row.id}] ${row.project_name}`);
    console.log(`    source: ${JSON.stringify(sourceStack)}`);
    console.log(`    target: ${JSON.stringify(targetStack)}`);
    console.log(`    scope:  ${JSON.stringify(migrationScope)}`);
  }

  console.log(`\nMigration complete. ${rows.length} assessment(s) updated.`);
  console.log("Legacy fields preserved for backward compatibility.");
  await closeDb();
}

main().catch((err) => {
  console.error("Stack migration failed:", err);
  process.exit(1);
});
