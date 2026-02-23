import { readFileSync, existsSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename$1 = fileURLToPath(import.meta.url);
const __dirname$1 = dirname(__filename$1);
const HEURISTICS_SUBPATH = join("skills", "migrate-knowledge", "heuristics");
const MARKER_FILE = "ai-alternatives.json";
function walkUpFind(startDir) {
  let dir = resolve(startDir);
  for (let i = 0; i < 10; i++) {
    const candidate = join(dir, HEURISTICS_SUBPATH);
    if (existsSync(join(candidate, MARKER_FILE))) return candidate;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}
function findHeuristicsDir() {
  return walkUpFind(__dirname$1) ?? walkUpFind(process.cwd()) ?? (() => {
    throw new Error(`Cannot find heuristics. __dirname=${__dirname$1}, cwd=${process.cwd()}`);
  })();
}
let _heuristicsDir = null;
function getHeuristicsDir() {
  if (!_heuristicsDir) {
    _heuristicsDir = findHeuristicsDir();
  }
  return _heuristicsDir;
}
function loadJson(filename) {
  const path = resolve(getHeuristicsDir(), filename);
  return JSON.parse(readFileSync(path, "utf-8"));
}
let _aiAlternatives = null;
let _baseEffort = null;
let _multipliers = null;
let _gotchas = null;
function getAiAlternatives() {
  if (!_aiAlternatives) {
    const data = loadJson("ai-alternatives.json");
    _aiAlternatives = data.alternatives ?? data.tools ?? [];
  }
  return _aiAlternatives;
}
function getBaseEffort() {
  if (!_baseEffort) {
    const raw = loadJson("base-effort-hours.json");
    _baseEffort = {
      components: raw.components ?? [],
      phases: raw.phase_mapping ?? raw.phases ?? {},
      roles: raw.roles ?? {}
    };
  }
  return _baseEffort;
}
function getComplexityMultipliers() {
  if (!_multipliers) {
    _multipliers = loadJson("complexity-multipliers.json");
  }
  return _multipliers.multipliers;
}
function getGotchaPatterns() {
  if (!_gotchas) {
    _gotchas = loadJson("gotcha-patterns.json");
  }
  return _gotchas.patterns;
}
let _dependencyChains = null;
function getDependencyChains() {
  if (!_dependencyChains) {
    _dependencyChains = loadJson("dependency-chains.json");
  }
  return _dependencyChains;
}
let _techProficiencyCatalog = null;
function getTechProficiencyCatalog() {
  if (!_techProficiencyCatalog) {
    _techProficiencyCatalog = loadJson("tech-proficiency-catalog.json");
  }
  return _techProficiencyCatalog;
}
function loadMarkdown(filename) {
  const heuristicsDir = getHeuristicsDir();
  const knowledgeDir = resolve(heuristicsDir, "..", "knowledge");
  const path = resolve(knowledgeDir, filename);
  return readFileSync(path, "utf-8");
}
let _incompatibilities = null;
function getKnownIncompatibilities() {
  if (!_incompatibilities) {
    const md = loadMarkdown("known-incompatibilities.md");
    _incompatibilities = parseIncompatibilitiesMarkdown(md);
  }
  return _incompatibilities;
}
async function getComposedKnowledge(assessmentId) {
  const { composeHeuristics } = await import('./index2-Ds-j4PBQ.js');
  const { db } = await import('./db-BWpbog7L.js').then(function (n) { return n.a5; }).then((n) => n.R);
  return composeHeuristics(db(), assessmentId);
}
function parseIncompatibilitiesMarkdown(md) {
  const sections = [];
  let currentSection = null;
  let currentEntry = null;
  let collectingField = null;
  for (const line of md.split("\n")) {
    if (line.startsWith("## ") && !line.startsWith("### ")) {
      if (currentEntry?.title && currentSection) {
        currentSection.entries.push(currentEntry);
      }
      currentEntry = null;
      collectingField = null;
      currentSection = { heading: line.replace(/^##\s+/, ""), entries: [] };
      sections.push(currentSection);
      continue;
    }
    if (line.startsWith("### ")) {
      if (currentEntry?.title && currentSection) {
        currentSection.entries.push(currentEntry);
      }
      currentEntry = { title: line.replace(/^###\s+/, ""), aws: "", azure: "", impact: "" };
      collectingField = null;
      continue;
    }
    if (!currentEntry) continue;
    if (line.startsWith("- **AWS")) {
      collectingField = "aws";
      currentEntry.aws = line.replace(/^- \*\*AWS[^:]*\*\*:\s*/, "");
    } else if (line.startsWith("- **Azure")) {
      collectingField = "azure";
      currentEntry.azure = line.replace(/^- \*\*Azure[^:]*\*\*:\s*/, "");
    } else if (line.startsWith("- **Impact")) {
      collectingField = "impact";
      currentEntry.impact = line.replace(/^- \*\*Impact\*\*:\s*/, "");
    } else if (line.startsWith("---")) {
      collectingField = null;
    } else if (line.startsWith("  - ") && collectingField === "impact") {
      currentEntry.impact += " " + line.trim().replace(/^- /, "");
    }
  }
  if (currentEntry?.title && currentSection) {
    currentSection.entries.push(currentEntry);
  }
  return sections;
}

export { getAiAlternatives, getBaseEffort, getComplexityMultipliers, getComposedKnowledge, getDependencyChains, getGotchaPatterns, getKnownIncompatibilities, getTechProficiencyCatalog };
//# sourceMappingURL=knowledge-CxzzbHNI.js.map
