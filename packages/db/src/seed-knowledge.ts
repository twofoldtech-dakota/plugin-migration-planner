/**
 * Seed script: loads existing Sitecore XP + AWS knowledge files into the DB.
 * Run with: npx tsx src/seed-knowledge.ts
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { getDb, closeDb } from "./connection.js";
import { saveKnowledgePack } from "./queries/knowledge-packs.js";
import { saveHeuristics } from "./queries/knowledge-heuristics.js";
import { saveDiscoveryTree } from "./queries/knowledge-discovery.js";
import { saveMigrationPath } from "./queries/migration-paths.js";
import { saveSourceUrls } from "./queries/knowledge-sources.js";
import {
  knowledgeAiAlternatives,
  knowledgeProficiencyCatalog,
} from "./schema.js";
import { eq } from "drizzle-orm";

const KNOWLEDGE_DIR = resolve(import.meta.dirname, "../../../skills/migrate-knowledge");

function loadJson(relativePath: string) {
  return JSON.parse(readFileSync(resolve(KNOWLEDGE_DIR, relativePath), "utf-8"));
}

function loadMd(relativePath: string) {
  return readFileSync(resolve(KNOWLEDGE_DIR, relativePath), "utf-8");
}

async function main() {
  const db = getDb();
  console.log("Seeding knowledge base...\n");

  // ── 1. Knowledge Packs ──────────────────────────────────────

  const topologies = loadJson("knowledge/sitecore-xp-topologies.json");

  console.log("  [1/8] Saving knowledge pack: sitecore-xp");
  await saveKnowledgePack(db, {
    id: "sitecore-xp",
    name: "Sitecore XP",
    vendor: "Sitecore",
    category: "platform",
    subcategory: "enterprise-dxp",
    description: "Sitecore Experience Platform — full DXP with xConnect, analytics, marketing automation, personalization. Versions 10.0–10.4.",
    direction: "source",
    latest_version: "10.4",
    supported_versions: ["10.0", "10.1", "10.2", "10.3", "10.4"],
    eol_versions: { "9.3": "2024-12-31", "9.2": "2023-12-31", "9.1": "2023-06-30" },
    valid_topologies: Object.keys(topologies.topologies),
    deployment_models: ["IaaS (VMs)", "PaaS (App Service)", "Containers (AKS)"],
    compatible_targets: ["sitecore-xm-cloud", "sitecore-ai", "optimizely", "contentful"],
    compatible_infrastructure: ["aws", "azure", "gcp"],
    required_services: ["sql-server", "solr"],
    optional_services: ["redis", "azure-cognitive-search"],
    confidence: "high",
    last_researched: new Date().toISOString(),
    pack_version: "1",
    created_by: "seed-script",
    change_summary: "Initial seed from existing knowledge files",
  });

  console.log("  [2/8] Saving knowledge pack: aws");
  await saveKnowledgePack(db, {
    id: "aws",
    name: "Amazon Web Services",
    vendor: "Amazon",
    category: "infrastructure",
    subcategory: "hyperscaler",
    description: "AWS cloud infrastructure — EC2, RDS, S3, ElastiCache, VPC, Route 53, CloudFront, and supporting services.",
    direction: "source",
    latest_version: "",
    supported_versions: [],
    eol_versions: {},
    valid_topologies: [],
    deployment_models: ["EC2 (VMs)", "ECS (Containers)", "EKS (Kubernetes)", "Elastic Beanstalk"],
    compatible_targets: ["azure", "gcp"],
    compatible_infrastructure: [],
    required_services: [],
    optional_services: [],
    confidence: "high",
    last_researched: new Date().toISOString(),
    pack_version: "1",
    created_by: "seed-script",
    change_summary: "Initial seed from existing knowledge files",
  });

  console.log("  [2/8] Saving knowledge pack: azure");
  await saveKnowledgePack(db, {
    id: "azure",
    name: "Microsoft Azure",
    vendor: "Microsoft",
    category: "infrastructure",
    subcategory: "hyperscaler",
    description: "Azure cloud infrastructure — Virtual Machines, SQL MI, Blob Storage, Azure Cache for Redis, VNet, Azure DNS, Front Door, and supporting services.",
    direction: "target",
    latest_version: "",
    supported_versions: [],
    eol_versions: {},
    valid_topologies: [],
    deployment_models: ["VMs (IaaS)", "App Service (PaaS)", "AKS (Kubernetes)", "Container Apps"],
    compatible_targets: [],
    compatible_infrastructure: [],
    required_services: [],
    optional_services: [],
    confidence: "high",
    last_researched: new Date().toISOString(),
    pack_version: "1",
    created_by: "seed-script",
    change_summary: "Initial seed from existing knowledge files",
  });

  // ── 2. Heuristics for sitecore-xp ────────────────────────────

  console.log("  [3/8] Saving heuristics for sitecore-xp");

  const effortData = loadJson("heuristics/base-effort-hours.json");
  const multiplierData = loadJson("heuristics/complexity-multipliers.json");
  const gotchaData = loadJson("heuristics/gotcha-patterns.json");
  const chainData = loadJson("heuristics/dependency-chains.json");

  // Build effort_hours array
  const effort_hours = Object.entries(effortData.components).map(([id, comp]: [string, any]) => ({
    component_id: id,
    component_name: id.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
    base_hours: comp.base_hours,
    unit: comp.unit,
    includes: comp.includes,
    role_breakdown: comp.role_breakdown,
    phase_id: Object.entries(effortData.phase_mapping as Record<string, string[]>)
      .find(([, components]) => components.includes(id))?.[0] ?? "",
  }));

  // Build multipliers array
  const multipliers = multiplierData.multipliers.map((m: any) => ({
    multiplier_id: m.id,
    condition: m.condition,
    factor: m.multiplier,
    applies_to: m.applies_to,
    reason: m.reason,
    supersedes: m.supersedes ?? null,
  }));

  // Build gotcha_patterns array
  const gotcha_patterns = gotchaData.patterns.map((p: any) => ({
    pattern_id: p.id,
    pattern_condition: p.pattern,
    risk_level: p.risk,
    hours_impact: p.hours_impact,
    description: p.description,
    mitigation: p.mitigation,
    affected_components: p.affected_components ?? [],
  }));

  // Build dependency_chains array
  const dependency_chains = chainData.dependencies.map((d: any) => ({
    chain_id: d.id,
    predecessor: d.predecessor,
    successors: d.successors,
    dependency_type: d.type,
    reason: d.reason,
  }));

  // Build phase_mappings array
  const phase_mappings = Object.entries(effortData.phase_mapping as Record<string, string[]>).map(
    ([phaseId, componentIds], idx) => ({
      phase_id: phaseId,
      phase_name: phaseId.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
      phase_order: idx + 1,
      component_ids: componentIds,
    })
  );

  // Build roles array
  const roles = Object.entries(effortData.roles as Record<string, any>).map(
    ([roleId, role]) => ({
      role_id: roleId,
      description: role.description,
      typical_rate_range: role.typical_rate_range,
    })
  );

  await saveHeuristics(db, {
    pack_id: "sitecore-xp",
    effort_hours,
    multipliers,
    gotcha_patterns,
    dependency_chains,
    phase_mappings,
    roles,
  });

  // ── 3. Discovery tree ─────────────────────────────────────────

  console.log("  [4/8] Saving discovery tree for sitecore-xp");

  const discoveryTree = loadJson("discovery/discovery-tree.json");
  await saveDiscoveryTree(db, {
    pack_id: "sitecore-xp",
    dimensions: discoveryTree.dimensions,
  });

  // ── 4. AI alternatives ────────────────────────────────────────

  console.log("  [5/8] Saving AI alternatives for sitecore-xp");

  const aiData = loadJson("heuristics/ai-alternatives.json");

  // Delete existing and insert fresh
  await db.delete(knowledgeAiAlternatives).where(eq(knowledgeAiAlternatives.pack_id, "sitecore-xp"));

  for (const alt of aiData.alternatives) {
    await db.insert(knowledgeAiAlternatives).values({
      pack_id: "sitecore-xp",
      tool_id: alt.id,
      name: alt.name,
      vendor: alt.vendor,
      category: alt.category,
      description: alt.description,
      url: alt.url,
      applicable_components: alt.applicable_components ?? [],
      applicable_phases: alt.applicable_phases ?? [],
      hours_saved: alt.hours_saved ?? {},
      cost: alt.cost ?? {},
      pros: alt.pros ?? [],
      cons: alt.cons ?? [],
      prerequisites: alt.prerequisites ?? [],
      recommendation: alt.recommendation ?? "conditional",
      applicability_conditions: alt.applicability_conditions ?? {},
      mutual_exclusion_group: alt.mutual_exclusion ?? null,
    });
  }

  // ── 5. Proficiency catalog ────────────────────────────────────

  console.log("  [6/8] Saving proficiency catalog");

  const profData = loadJson("heuristics/tech-proficiency-catalog.json");

  for (const [catId, cat] of Object.entries(profData.categories as Record<string, any>)) {
    await db
      .insert(knowledgeProficiencyCatalog)
      .values({
        category_id: catId,
        name: cat.name,
        description: cat.description,
        adoption_base_hours: cat.adoption_base_hours,
        maps_to_tools: cat.maps_to_tools ?? [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .onConflictDoUpdate({
        target: knowledgeProficiencyCatalog.category_id,
        set: {
          name: cat.name,
          description: cat.description,
          adoption_base_hours: cat.adoption_base_hours,
          maps_to_tools: cat.maps_to_tools ?? [],
          updated_at: new Date().toISOString(),
        },
      });
  }

  // ── 6. Migration path: sitecore-xp → azure (AWS→Azure) ───────

  console.log("  [7/8] Saving migration path: aws->azure");

  const serviceMap = loadJson("knowledge/aws-to-azure-service-map.json");
  const incompatibilities = loadMd("knowledge/known-incompatibilities.md");
  const azureReqs = loadMd("knowledge/azure-sitecore-requirements.md");
  const topologyDecisionTree = loadMd("knowledge/topology-decision-tree.md");

  await saveMigrationPath(db, {
    id: "sitecore-xp-aws->azure",
    source_pack_id: "sitecore-xp",
    target_pack_id: "azure",
    prevalence: "very-common",
    complexity: "major",
    typical_duration: "8-16 weeks",
    primary_drivers: [
      "Microsoft partnership / licensing alignment",
      "Azure-native Sitecore products (XM Cloud)",
      "Cost optimization",
      "Compliance requirements (Azure Government, EU data residency)",
      "Consolidation of cloud providers",
    ],
    prerequisites: [
      "Azure subscription provisioned",
      "Network connectivity plan (VPN/ExpressRoute or public)",
      "Sitecore license valid for target deployment",
      "Source environment inventory completed",
    ],
    service_map: serviceMap,
    migration_tools: [
      "Azure Migrate",
      "Azure Database Migration Service",
      "AzCopy",
      "Azure Site Recovery",
    ],
    path_gotcha_patterns: gotchaData.patterns.map((p: any) => p.id),
    path_effort_adjustments: [],
    step_by_step: azureReqs,
    decision_points: topologyDecisionTree,
    case_studies: "",
    incompatibilities,
    confidence: "high",
    last_researched: new Date().toISOString(),
    version: "1",
  });

  // ── 7. Source URLs ────────────────────────────────────────────

  console.log("  [8/8] Saving source URLs");

  await saveSourceUrls(db, {
    pack_id: "sitecore-xp",
    urls: [
      {
        source_url: "https://doc.sitecore.com/xp/en/developers/latest/platform-administration-and-architecture/index-en.html",
        title: "Sitecore XP Documentation",
        source_type: "vendor-docs",
        confidence: "high",
      },
      {
        source_url: "https://doc.sitecore.com/xp/en/developers/latest/platform-administration-and-architecture/the-sitecore-xp-topologies.html",
        title: "Sitecore XP Topologies",
        source_type: "vendor-docs",
        confidence: "high",
      },
      {
        source_url: "https://doc.sitecore.com/xp/en/developers/latest/platform-administration-and-architecture/system-requirements.html",
        title: "Sitecore XP System Requirements",
        source_type: "vendor-docs",
        confidence: "high",
      },
    ],
  });

  await saveSourceUrls(db, {
    migration_path_id: "sitecore-xp-aws->azure",
    urls: [
      {
        source_url: "https://learn.microsoft.com/en-us/azure/migrate/",
        title: "Azure Migrate Documentation",
        source_type: "vendor-docs",
        confidence: "high",
      },
      {
        source_url: "https://learn.microsoft.com/en-us/azure/azure-sql/managed-instance/",
        title: "Azure SQL Managed Instance",
        source_type: "vendor-docs",
        confidence: "high",
      },
      {
        source_url: "https://learn.microsoft.com/en-us/azure/virtual-network/",
        title: "Azure Virtual Network",
        source_type: "vendor-docs",
        confidence: "high",
      },
    ],
  });

  // ── Done ──────────────────────────────────────────────────────

  console.log("\nSeed complete! Summary:");
  console.log("  - 3 knowledge packs (sitecore-xp, aws, azure)");
  console.log(`  - ${effort_hours.length} effort hour components`);
  console.log(`  - ${multipliers.length} complexity multipliers`);
  console.log(`  - ${gotcha_patterns.length} gotcha patterns`);
  console.log(`  - ${dependency_chains.length} dependency chains`);
  console.log(`  - ${phase_mappings.length} phase mappings`);
  console.log(`  - ${roles.length} roles`);
  console.log(`  - ${discoveryTree.dimensions.length} discovery dimensions`);
  console.log(`  - ${aiData.alternatives.length} AI alternatives`);
  console.log(`  - ${Object.keys(profData.categories).length} proficiency categories`);
  console.log("  - 1 migration path (sitecore-xp-aws -> azure)");
  console.log("  - 6 source URLs");

  await closeDb();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
