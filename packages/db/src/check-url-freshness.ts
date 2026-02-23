/**
 * URL freshness checker — verifies all knowledge source URLs are still accessible.
 * Run with: npx tsx src/check-url-freshness.ts [--days N] [--pack PACK_ID] [--path PATH_ID]
 */
import { getDb, closeDb } from "./connection.js";
import { checkUrlFreshness } from "./queries/knowledge-sources.js";

async function main() {
  const args = process.argv.slice(2);
  const daysIdx = args.indexOf("--days");
  const packIdx = args.indexOf("--pack");
  const pathIdx = args.indexOf("--path");

  const days = daysIdx !== -1 ? parseInt(args[daysIdx + 1], 10) : 7;
  const packId = packIdx !== -1 ? args[packIdx + 1] : undefined;
  const pathId = pathIdx !== -1 ? args[pathIdx + 1] : undefined;

  const db = getDb();

  console.log(`Checking URL freshness (stale threshold: ${days} days)...`);
  if (packId) console.log(`  Filtering by pack: ${packId}`);
  if (pathId) console.log(`  Filtering by migration path: ${pathId}`);
  console.log();

  const result = await checkUrlFreshness(db, {
    stale_threshold_days: days,
    pack_id: packId,
    migration_path_id: pathId,
  });

  console.log(`Results:`);
  console.log(`  Total checked:      ${result.total_checked}`);
  console.log(`  Still accessible:   ${result.still_accessible}`);
  console.log(`  Now inaccessible:   ${result.now_inaccessible}`);

  if (result.errors.length > 0) {
    console.log(`\nInaccessible URLs:`);
    for (const err of result.errors) {
      console.log(`  [${err.id}] ${err.url}`);
      console.log(`       Error: ${err.error}`);
    }
  }

  if (result.total_checked === 0) {
    console.log(`\n  No stale URLs found (all checked within the last ${days} days).`);
  }

  await closeDb();
}

main().catch((err) => {
  console.error("URL freshness check failed:", err);
  process.exit(1);
});
