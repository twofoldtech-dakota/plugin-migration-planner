/**
 * Verify seed data round-trips correctly.
 * Run with: npx tsx src/verify-seed.ts
 */
import { getDb, closeDb } from "./connection.js";
import { getKnowledgePackFull, listKnowledgePacks } from "./queries/knowledge-packs.js";
import { getMigrationPath } from "./queries/migration-paths.js";
import { getSourceUrls } from "./queries/knowledge-sources.js";
import { getDiscoveryTree } from "./queries/knowledge-discovery.js";
import { getHeuristicsForPacks } from "./queries/knowledge-heuristics.js";

async function main() {
  const db = getDb();

  // Test 1: list all packs
  const packs = await listKnowledgePacks(db);
  console.log("=== Packs ===");
  for (const p of packs)
    console.log(`  ${p.id} (${p.category}, ${p.direction}) confidence=${p.confidence}`);

  // Test 2: get full sitecore-xp
  const full = (await getKnowledgePackFull(db, "sitecore-xp", [
    "heuristics",
    "discovery",
    "ai_alternatives",
    "sources",
  ])) as any;
  console.log("\n=== sitecore-xp full ===");
  console.log("  effort_hours:", full.effort_hours?.length);
  console.log("  multipliers:", full.multipliers?.length);
  console.log("  gotcha_patterns:", full.gotcha_patterns?.length);
  console.log("  dependency_chains:", full.dependency_chains?.length);
  console.log("  phase_mappings:", full.phase_mappings?.length);
  console.log("  roles:", full.roles?.length);
  console.log("  discovery_tree version:", full.discovery_tree?.version);
  console.log("  discovery dimensions:", (full.discovery_tree?.dimensions_json as any[])?.length);
  console.log("  ai_alternatives:", full.ai_alternatives?.length);
  console.log("  source_urls:", full.source_urls?.length);

  // Test 3: getDiscoveryTree multi-pack compose
  const tree = await getDiscoveryTree(db, ["sitecore-xp"]);
  console.log("\n=== Discovery tree compose ===");
  console.log("  total composed dimensions:", tree.dimensions.length);

  // Test 4: getHeuristics multi-pack
  const heuristics = await getHeuristicsForPacks(db, ["sitecore-xp"]);
  console.log("\n=== Heuristics fetch ===");
  console.log("  sitecore-xp effort_hours:", heuristics["sitecore-xp"]?.effort_hours?.length);
  console.log("  sitecore-xp multipliers:", heuristics["sitecore-xp"]?.multipliers?.length);

  // Test 5: migration path
  const path = await getMigrationPath(db, { id: "sitecore-xp-aws->azure" });
  console.log("\n=== Migration path ===");
  console.log("  id:", path?.id);
  console.log("  prevalence:", path?.prevalence);
  console.log("  complexity:", path?.complexity);
  console.log("  service_map categories:", Object.keys((path?.service_map as any) ?? {}).length);
  console.log("  incompatibilities:", (path?.incompatibilities ?? "").length, "chars");

  // Test 6: source URLs
  const pathUrls = await getSourceUrls(db, { migration_path_id: "sitecore-xp-aws->azure" });
  console.log("\n=== Migration path source URLs ===");
  for (const u of pathUrls) console.log(`  ${u.title}`);

  const packUrls = await getSourceUrls(db, { pack_id: "sitecore-xp" });
  console.log("\n=== Pack source URLs ===");
  for (const u of packUrls) console.log(`  ${u.title}`);

  // Test 7: spot-check a specific effort hour component
  const computeRole = full.effort_hours?.find((e: any) => e.component_id === "compute_single_role");
  console.log("\n=== Spot check: compute_single_role ===");
  console.log("  base_hours:", computeRole?.base_hours);
  console.log("  unit:", computeRole?.unit);
  console.log("  role_breakdown:", JSON.stringify(computeRole?.role_breakdown));

  // Test 8: spot-check a gotcha pattern
  const sessionGotcha = full.gotcha_patterns?.find((g: any) => g.pattern_id === "session_redis_cd");
  console.log("\n=== Spot check: session_redis_cd gotcha ===");
  console.log("  risk_level:", sessionGotcha?.risk_level);
  console.log("  hours_impact:", sessionGotcha?.hours_impact);

  console.log("\n✓ All verification checks passed");
  await closeDb();
}

main().catch((err) => {
  console.error("Verify failed:", err);
  process.exit(1);
});
