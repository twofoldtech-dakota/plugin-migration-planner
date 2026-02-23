import { readFileSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const HEURISTICS_SUBPATH = join('skills', 'migrate-knowledge', 'heuristics');
const MARKER_FILE = 'ai-alternatives.json';

function walkUpFind(startDir: string): string | null {
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

function findHeuristicsDir(): string {
    return walkUpFind(__dirname)
        ?? walkUpFind(process.cwd())
        ?? (() => { throw new Error(`Cannot find heuristics. __dirname=${__dirname}, cwd=${process.cwd()}`); })();
}

let _heuristicsDir: string | null = null;

function getHeuristicsDir(): string {
    if (!_heuristicsDir) {
        _heuristicsDir = findHeuristicsDir();
    }
    return _heuristicsDir;
}

function loadJson<T>(filename: string): T {
    const path = resolve(getHeuristicsDir(), filename);
    return JSON.parse(readFileSync(path, 'utf-8')) as T;
}

export interface AiAlternative {
    id: string;
    name: string;
    vendor: string;
    category: string;
    description: string;
    url: string;
    applicable_components: string[];
    applicable_phases: string[];
    hours_saved: { optimistic: number; expected: number; pessimistic: number };
    cost: { type: string; details: string };
    pros: string[];
    cons: string[];
    prerequisites: string[];
    recommendation: string;
    applicability_conditions?: string;
}

export interface BaseComponent {
    id: string;
    name: string;
    base_hours: number;
    unit: string;
    phase: string;
    roles: Record<string, number>;
    description: string;
}

export interface ComplexityMultiplier {
    id: string;
    name: string;
    factor: number;
    trigger: string;
    affected_components: string[];
    category: string;
    supersedes?: string[];
}

export interface GotchaPattern {
    id: string;
    name: string;
    trigger: string;
    risk_level: string;
    hours_impact: number;
    affected_components: string[];
    description: string;
    mitigation: string;
}

let _aiAlternatives: AiAlternative[] | null = null;
let _baseEffort: { components: BaseComponent[]; phases: Record<string, any>; roles: Record<string, any> } | null = null;
let _multipliers: { multipliers: ComplexityMultiplier[] } | null = null;
let _gotchas: { patterns: GotchaPattern[] } | null = null;

export function getAiAlternatives(): AiAlternative[] {
    if (!_aiAlternatives) {
        const data = loadJson<Record<string, any>>('ai-alternatives.json');
        _aiAlternatives = data.alternatives ?? data.tools ?? [];
    }
    return _aiAlternatives!;
}

export function getBaseEffort() {
    if (!_baseEffort) {
        const raw = loadJson<Record<string, any>>('base-effort-hours.json');
        _baseEffort = {
            components: raw.components ?? [],
            phases: raw.phase_mapping ?? raw.phases ?? {},
            roles: raw.roles ?? {}
        };
    }
    return _baseEffort!;
}

export function getComplexityMultipliers(): ComplexityMultiplier[] {
    if (!_multipliers) {
        _multipliers = loadJson('complexity-multipliers.json');
    }
    return _multipliers!.multipliers;
}

export function getGotchaPatterns(): GotchaPattern[] {
    if (!_gotchas) {
        _gotchas = loadJson('gotcha-patterns.json');
    }
    return _gotchas!.patterns;
}

export interface DependencyChain {
    id: string;
    predecessor: string;
    successors: string[];
    type: 'hard' | 'soft';
    reason: string;
}

export interface DependencyChainsData {
    dependencies: DependencyChain[];
    critical_path_template: {
        description: string;
        path: string[];
        parallel_tracks: { name: string; path: string[]; starts_after: string }[];
    };
}

let _dependencyChains: DependencyChainsData | null = null;

export function getDependencyChains(): DependencyChainsData {
    if (!_dependencyChains) {
        _dependencyChains = loadJson<DependencyChainsData>('dependency-chains.json');
    }
    return _dependencyChains;
}

export interface TechProficiencyCatalog {
    proficiency_levels: string[];
    adoption_overhead_factors: Record<string, number>;
    categories: Record<string, {
        name: string;
        description: string;
        adoption_base_hours: number;
        maps_to_tools: string[];
    }>;
}

let _techProficiencyCatalog: TechProficiencyCatalog | null = null;

export function getTechProficiencyCatalog(): TechProficiencyCatalog {
    if (!_techProficiencyCatalog) {
        _techProficiencyCatalog = loadJson<TechProficiencyCatalog>('tech-proficiency-catalog.json');
    }
    return _techProficiencyCatalog;
}

function loadMarkdown(filename: string): string {
    const heuristicsDir = getHeuristicsDir();
    // knowledge files are in a sibling 'knowledge' directory next to heuristics
    const knowledgeDir = resolve(heuristicsDir, '..', 'knowledge');
    const path = resolve(knowledgeDir, filename);
    return readFileSync(path, 'utf-8');
}

export interface IncompatibilitySection {
    heading: string;
    entries: IncompatibilityEntry[];
}

export interface IncompatibilityEntry {
    title: string;
    aws: string;
    azure: string;
    impact: string;
}

let _incompatibilities: IncompatibilitySection[] | null = null;

export function getKnownIncompatibilities(): IncompatibilitySection[] {
    if (!_incompatibilities) {
        const md = loadMarkdown('known-incompatibilities.md');
        _incompatibilities = parseIncompatibilitiesMarkdown(md);
    }
    return _incompatibilities;
}

// ── DB-backed composition loader ────────────────────────────

export async function getComposedKnowledge(assessmentId: string) {
    const { composeHeuristics } = await import('@migration-planner/db');
    const { db } = await import('./db.js');
    return composeHeuristics(db(), assessmentId);
}

function parseIncompatibilitiesMarkdown(md: string): IncompatibilitySection[] {
    const sections: IncompatibilitySection[] = [];
    let currentSection: IncompatibilitySection | null = null;
    let currentEntry: Partial<IncompatibilityEntry> | null = null;
    let collectingField: 'aws' | 'azure' | 'impact' | null = null;

    for (const line of md.split('\n')) {
        // ## level heading = section
        if (line.startsWith('## ') && !line.startsWith('### ')) {
            if (currentEntry?.title && currentSection) {
                currentSection.entries.push(currentEntry as IncompatibilityEntry);
            }
            currentEntry = null;
            collectingField = null;
            currentSection = { heading: line.replace(/^##\s+/, ''), entries: [] };
            sections.push(currentSection);
            continue;
        }

        // ### level heading = entry title
        if (line.startsWith('### ')) {
            if (currentEntry?.title && currentSection) {
                currentSection.entries.push(currentEntry as IncompatibilityEntry);
            }
            currentEntry = { title: line.replace(/^###\s+/, ''), aws: '', azure: '', impact: '' };
            collectingField = null;
            continue;
        }

        if (!currentEntry) continue;

        // Field markers
        if (line.startsWith('- **AWS')) {
            collectingField = 'aws';
            currentEntry.aws = line.replace(/^- \*\*AWS[^:]*\*\*:\s*/, '');
        } else if (line.startsWith('- **Azure')) {
            collectingField = 'azure';
            currentEntry.azure = line.replace(/^- \*\*Azure[^:]*\*\*:\s*/, '');
        } else if (line.startsWith('- **Impact')) {
            collectingField = 'impact';
            currentEntry.impact = line.replace(/^- \*\*Impact\*\*:\s*/, '');
        } else if (line.startsWith('---')) {
            collectingField = null;
        } else if (line.startsWith('  - ') && collectingField === 'impact') {
            currentEntry.impact += ' ' + line.trim().replace(/^- /, '');
        }
    }

    // Push last entry
    if (currentEntry?.title && currentSection) {
        currentSection.entries.push(currentEntry as IncompatibilityEntry);
    }

    return sections;
}
