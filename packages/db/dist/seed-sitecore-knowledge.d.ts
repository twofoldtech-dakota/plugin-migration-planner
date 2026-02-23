/**
 * Seed script: loads existing hand-built Sitecore XP knowledge from JSON files
 * into the DB via the exported query functions.
 *
 * Creates:
 *   - "sitecore-xp" knowledge pack (CMS)
 *   - "aws" knowledge pack (infrastructure)
 *   - "azure" knowledge pack (infrastructure)
 *   - Discovery trees for both aws (13 infra dims) and sitecore-xp (4 infra + 6 platform dims)
 *   - Heuristics split between aws (11 components) and sitecore-xp (16 components)
 *   - Migration path: aws -> azure
 *
 * Usage:
 *   DATABASE_URL=postgresql://... npx tsx src/seed-sitecore-knowledge.ts
 */
export {};
//# sourceMappingURL=seed-sitecore-knowledge.d.ts.map