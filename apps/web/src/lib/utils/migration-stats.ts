// Shared constants and computations extracted from across pages

export const KNOWN_DIMENSIONS = [
	'compute', 'database', 'search', 'caching', 'cdn', 'dns', 'ssl_tls',
	'storage', 'email', 'xconnect', 'identity', 'session_state',
	'custom_integrations', 'cicd', 'monitoring', 'networking', 'backup_dr'
] as const;

export const DIMENSION_LABELS: Record<string, string> = {
	compute: 'Compute',
	database: 'Database',
	search: 'Search (Solr)',
	caching: 'Caching (Redis)',
	cdn: 'CDN',
	dns: 'DNS',
	ssl_tls: 'SSL/TLS',
	ssl: 'SSL/TLS',
	storage: 'Storage',
	email: 'Email (EXM)',
	xconnect: 'xConnect / xDB',
	identity: 'Identity Server',
	session_state: 'Session State',
	session: 'Session State',
	custom_integrations: 'Custom Integrations',
	integrations: 'Custom Integrations',
	cicd: 'CI/CD Pipeline',
	monitoring: 'Monitoring',
	networking: 'Networking',
	backup_dr: 'Backup & DR'
};

// Maps short/alternate dimension keys (as stored by some callers) to
// the canonical KNOWN_DIMENSIONS key so grid and detail views agree.
export const DIMENSION_ALIASES: Record<string, string> = {
	ssl: 'ssl_tls',
	session: 'session_state',
	integrations: 'custom_integrations',
};

export const ROLE_LABELS: Record<string, string> = {
	infrastructure_engineer: 'Infrastructure Engineer',
	infra_eng: 'Infrastructure Engineer',
	dba: 'Database Administrator',
	sitecore_developer: 'Sitecore Developer',
	sitecore_dev: 'Sitecore Developer',
	qa_engineer: 'QA Engineer',
	qa_eng: 'QA Engineer',
	project_manager: 'Project Manager'
};

export interface DiscoveryStats {
	totalDimensions: number;
	completedDimensions: number;
	discoveryPercent: number;
	totalAnswers: number;
	confirmedAnswers: number;
	assumedAnswers: number;
	unknownAnswers: number;
}

/** Re-key discovery data so aliased dimension names map to their canonical key. */
export function normalizeDiscovery(discovery: Record<string, any> | null | undefined): Record<string, any> {
	const raw = discovery && typeof discovery === 'object' ? discovery : {};
	const out: Record<string, any> = {};
	for (const [key, value] of Object.entries(raw)) {
		const canonical = DIMENSION_ALIASES[key] ?? key;
		// If both alias and canonical exist, prefer the canonical entry
		if (!out[canonical]) {
			out[canonical] = value;
		}
	}
	return out;
}

export function computeDiscoveryStats(discovery: Record<string, any> | null | undefined): DiscoveryStats {
	const data = normalizeDiscovery(discovery);
	const keys = Object.keys(data);
	const totalDimensions = Math.max(KNOWN_DIMENSIONS.length, keys.length);
	const completedDimensions = keys.filter(k => data[k]?.status === 'complete').length;
	const discoveryPercent = totalDimensions > 0 ? Math.round((completedDimensions / totalDimensions) * 100) : 0;

	let totalAnswers = 0, confirmedAnswers = 0, assumedAnswers = 0, unknownAnswers = 0;
	for (const dim of Object.values(data)) {
		const answers = dim?.answers ?? {};
		for (const a of Object.values(answers) as any[]) {
			totalAnswers++;
			if (a.confidence === 'confirmed') confirmedAnswers++;
			else if (a.confidence === 'assumed') assumedAnswers++;
			else unknownAnswers++;
		}
	}

	return { totalDimensions, completedDimensions, discoveryPercent, totalAnswers, confirmedAnswers, assumedAnswers, unknownAnswers };
}

export interface RiskStats {
	total: number;
	open: number;
	critical: number;
}

export function computeRiskStats(risks: any[] | null | undefined): RiskStats {
	const list = risks ?? [];
	return {
		total: list.length,
		open: list.filter(r => r.status === 'open').length,
		critical: list.filter(r => r.severity === 'critical' || r.severity === 'high').length
	};
}

export interface AssumptionStats {
	total: number;
	validated: number;
	unvalidated: number;
	invalidated: number;
	totalWidening: number;
}

export function computeAssumptionStats(assumptions: any[] | null | undefined): AssumptionStats {
	const list = assumptions ?? [];
	const validated = list.filter(a => a.validation_status === 'validated').length;
	const invalidated = list.filter(a => a.validation_status === 'invalidated').length;
	const unvalidated = list.length - validated - invalidated;
	const totalWidening = list
		.filter(a => a.validation_status !== 'validated')
		.reduce((sum, a) => sum + (a.pessimistic_widening_hours ?? 0), 0);
	return { total: list.length, validated, unvalidated, invalidated, totalWidening };
}

export function confidenceVariant(score: number): 'success' | 'warning' | 'danger' {
	if (score >= 70) return 'success';
	if (score >= 40) return 'warning';
	return 'danger';
}

export function severityVariant(severity: string): 'default' | 'success' | 'warning' | 'danger' {
	switch (severity?.toLowerCase()) {
		case 'critical': return 'danger';
		case 'high': return 'danger';
		case 'medium': return 'warning';
		case 'low': return 'success';
		default: return 'default';
	}
}

export function formatQuestionId(id: string): string {
	return id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function formatRole(role: string): string {
	return ROLE_LABELS[role] ?? role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ── Dimension Impact Metadata ─────────────────────────────────────
// Sourced from the Confidence Impact Matrix in dimension-descriptions.md.
// Used to prioritize discovery dimensions by their effect on estimate accuracy.

export type ImpactTier = 'critical' | 'high' | 'medium' | 'lower';

export interface DimensionMeta {
	priority: number;
	tier: ImpactTier;
	hoursSwing: [number, number]; // [min, max] typical hours swing
	whyItMatters: string;
}

export const DIMENSION_META: Record<string, DimensionMeta> = {
	database:              { priority: 1,  tier: 'critical', hoursSwing: [40, 120], whyItMatters: 'Size determines migration window, HA topology drives architecture, collation issues are late-stage blockers' },
	custom_integrations:   { priority: 2,  tier: 'critical', hoursSwing: [24, 80],  whyItMatters: 'Every undiscovered integration is a cutover-day failure. Most common source of timeline overruns' },
	compute:               { priority: 3,  tier: 'critical', hoursSwing: [16, 48],  whyItMatters: 'Instance counts and types drive Azure sizing costs and architecture' },
	xconnect:              { priority: 4,  tier: 'high',     hoursSwing: [16, 60],  whyItMatters: 'Shard migration, custom facets, and contact volume dominate Phase 2 duration' },
	networking:            { priority: 5,  tier: 'high',     hoursSwing: [12, 40],  whyItMatters: 'CIDR conflicts and security rule translation are day-one outage risks' },
	search:                { priority: 6,  tier: 'high',     hoursSwing: [8, 32],   whyItMatters: 'Index rebuild time directly affects cutover window duration' },
	caching:               { priority: 7,  tier: 'medium',   hoursSwing: [8, 24],   whyItMatters: 'Tier selection affects cost and performance. Custom Lua scripts add complexity' },
	session_state:         { priority: 8,  tier: 'medium',   hoursSwing: [8, 20],   whyItMatters: 'Incorrect migration causes intermittent user-facing failures' },
	cicd:                  { priority: 9,  tier: 'medium',   hoursSwing: [8, 24],   whyItMatters: 'AWS-native pipelines require full rebuild, blocking Azure deployment' },
	identity:              { priority: 10, tier: 'medium',   hoursSwing: [8, 20],   whyItMatters: 'SSO integrations require cross-org coordination with external lead times' },
	ssl_tls:               { priority: 11, tier: 'medium',   hoursSwing: [4, 16],   whyItMatters: 'ACM certs are non-transferable. Certificate pinning causes hard failures' },
	monitoring:            { priority: 12, tier: 'lower',    hoursSwing: [4, 12],   whyItMatters: 'Must be rebuilt but rarely blocks migration' },
	storage:               { priority: 13, tier: 'lower',    hoursSwing: [4, 16],   whyItMatters: 'Usually straightforward but large media libraries need transfer planning' },
	cdn:                   { priority: 14, tier: 'lower',    hoursSwing: [4, 16],   whyItMatters: 'Lambda@Edge functions are the wild card — simple configs migrate easily' },
	dns:                   { priority: 15, tier: 'lower',    hoursSwing: [2, 8],    whyItMatters: 'Critical for cutover but low effort. Main risk is undiscovered high TTLs' },
	email:                 { priority: 15, tier: 'lower',    hoursSwing: [2, 8],    whyItMatters: 'SMTP relay replacement and DNS record updates for email authentication' },
	backup_dr:             { priority: 16, tier: 'lower',    hoursSwing: [4, 40],   whyItMatters: 'Simple for backup-restore DR, but active-active fundamentally changes architecture' },
};

export const TIER_LABELS: Record<ImpactTier, string> = {
	critical: 'Must-Have Before Estimation',
	high: 'Should-Have for Accuracy',
	medium: 'Important for Completeness',
	lower: 'Lower Priority',
};

export const TIER_COLORS: Record<ImpactTier, { border: string; bg: string; text: string; dot: string }> = {
	critical: { border: 'border-l-danger',   bg: 'bg-danger-light',  text: 'text-danger',  dot: 'bg-danger' },
	high:     { border: 'border-l-warning',  bg: 'bg-warning-light', text: 'text-warning', dot: 'bg-warning' },
	medium:   { border: 'border-l-primary',  bg: 'bg-primary-light', text: 'text-primary', dot: 'bg-primary' },
	lower:    { border: 'border-l-text-muted', bg: 'bg-surface',      text: 'text-text-muted', dot: 'bg-text-muted' },
};

/** Get dimensions sorted by priority with their metadata. */
export function getDimensionsByPriority(): Array<{ key: string; label: string; meta: DimensionMeta }> {
	return KNOWN_DIMENSIONS
		.map(key => ({
			key,
			label: DIMENSION_LABELS[key] ?? key,
			meta: DIMENSION_META[key] ?? { priority: 99, tier: 'lower' as ImpactTier, hoursSwing: [0, 0], whyItMatters: '' },
		}))
		.sort((a, b) => a.meta.priority - b.meta.priority);
}

/** Group dimensions by impact tier, sorted by priority within each tier. */
export function getDimensionsByTier(): Array<{ tier: ImpactTier; label: string; dimensions: Array<{ key: string; label: string; meta: DimensionMeta }> }> {
	const sorted = getDimensionsByPriority();
	const tiers: ImpactTier[] = ['critical', 'high', 'medium', 'lower'];
	return tiers
		.map(tier => ({
			tier,
			label: TIER_LABELS[tier],
			dimensions: sorted.filter(d => d.meta.tier === tier),
		}))
		.filter(g => g.dimensions.length > 0);
}
