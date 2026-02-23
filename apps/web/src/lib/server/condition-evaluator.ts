/**
 * Condition Evaluator — parses heuristic condition strings and evaluates them
 * against flattened discovery answers.
 *
 * Condition strings use flat discovery question IDs directly (e.g.
 * "compute_cd_instance_count > 2", "search_provider == 'SolrCloud'").
 */

// ── Types ──────────────────────────────────────────────────

export interface DiscoveryAnswer {
	value: unknown;
	confidence?: string;
	notes?: string;
	basis?: string | null;
}

export interface DiscoveryDimension {
	answers?: Record<string, DiscoveryAnswer>;
	status?: string;
	[key: string]: unknown;
}

export type DiscoveryData = Record<string, DiscoveryDimension>;
export type FlatAnswers = Record<string, unknown>;

// ── Flatten discovery ──────────────────────────────────────

/**
 * Takes DB-shaped discovery { dimension: { answers: { qId: { value, confidence } } } }
 * and flattens it to a simple Record<string, unknown> mapping question IDs to values.
 */
export function flattenDiscovery(discovery: DiscoveryData | null | undefined): FlatAnswers {
	if (!discovery) return {};

	const flat: FlatAnswers = {};
	for (const dim of Object.values(discovery)) {
		if (!dim?.answers) continue;
		for (const [qId, answer] of Object.entries(dim.answers)) {
			const ans = answer as DiscoveryAnswer;
			flat[qId] = ans.value;
		}
	}
	return flat;
}

/**
 * Resolves a condition key to a discovery value.
 * Conditions use flat question IDs directly, so this is a simple lookup.
 */
function resolveValue(key: string, answers: FlatAnswers): unknown {
	return answers[key];
}

// ── Condition parser & evaluator ───────────────────────────

type Token =
	| { type: 'key'; value: string }
	| { type: 'op'; value: string }
	| { type: 'literal'; value: string | number | boolean }
	| { type: 'logic'; value: 'AND' | 'OR' }
	| { type: 'contains' };

function tokenize(condition: string): Token[] {
	const tokens: Token[] = [];
	const parts = condition.match(
		/(?:'[^']*'|"[^"]*"|>=|<=|!=|==|>|<|\bAND\b|\bOR\b|\bcontains\b|[^\s'"><=!]+)/g
	);
	if (!parts) return tokens;

	for (const part of parts) {
		if (part === 'AND' || part === 'OR') {
			tokens.push({ type: 'logic', value: part });
		} else if (part === 'contains') {
			tokens.push({ type: 'contains' });
		} else if (['==', '!=', '>', '>=', '<', '<='].includes(part)) {
			tokens.push({ type: 'op', value: part });
		} else if (/^'.*'$/.test(part) || /^".*"$/.test(part)) {
			tokens.push({ type: 'literal', value: part.slice(1, -1) });
		} else if (part === 'true') {
			tokens.push({ type: 'literal', value: true });
		} else if (part === 'false') {
			tokens.push({ type: 'literal', value: false });
		} else if (/^-?\d+(\.\d+)?$/.test(part)) {
			tokens.push({ type: 'literal', value: Number(part) });
		} else {
			tokens.push({ type: 'key', value: part });
		}
	}

	return tokens;
}

function evaluateComparison(left: unknown, op: string, right: unknown): boolean {
	// Coerce for numeric comparisons
	const numLeft = Number(left);
	const numRight = Number(right);
	const bothNumeric = !isNaN(numLeft) && !isNaN(numRight) && left !== '' && left !== null && left !== undefined;

	switch (op) {
		case '==':
			if (bothNumeric) return numLeft === numRight;
			return String(left) === String(right);
		case '!=':
			if (bothNumeric) return numLeft !== numRight;
			return String(left) !== String(right);
		case '>':
			return bothNumeric && numLeft > numRight;
		case '>=':
			return bothNumeric && numLeft >= numRight;
		case '<':
			return bothNumeric && numLeft < numRight;
		case '<=':
			return bothNumeric && numLeft <= numRight;
		default:
			return false;
	}
}

function evaluateContains(left: unknown, right: unknown): boolean {
	if (Array.isArray(left)) {
		return left.some((item) => String(item) === String(right));
	}
	if (typeof left === 'string') {
		return left.includes(String(right));
	}
	return false;
}

/**
 * Evaluates a single clause: "key op value", "key contains value", or bare "key" (truthy).
 */
function evaluateClause(tokens: Token[], answers: FlatAnswers): boolean {
	if (tokens.length === 0) return false;

	// Bare truthy check: just a key name
	if (tokens.length === 1 && tokens[0].type === 'key') {
		const val = resolveValue(tokens[0].value, answers);
		return isTruthy(val);
	}

	// "key contains value"
	if (tokens.length === 3 && tokens[1].type === 'contains') {
		const t0 = tokens[0];
		const t2 = tokens[2];
		if (t0.type !== 'key' && t0.type !== 'literal') return false;
		const left = t0.type === 'key' ? resolveValue(t0.value, answers) : t0.value;
		const right = t2.type === 'literal' ? t2.value : (t2.type === 'key' ? resolveValue(t2.value, answers) : undefined);
		return evaluateContains(left, right);
	}

	// "key op value"
	if (tokens.length === 3 && tokens[1].type === 'op') {
		const t0 = tokens[0];
		const t2 = tokens[2];
		if (t0.type !== 'key' && t0.type !== 'literal') return false;
		const left = t0.type === 'key' ? resolveValue(t0.value, answers) : t0.value;
		const right = t2.type === 'literal' ? t2.value : (t2.type === 'key' ? resolveValue(t2.value, answers) : undefined);
		return evaluateComparison(left, tokens[1].value, right);
	}

	return false;
}

function isTruthy(val: unknown): boolean {
	if (val === null || val === undefined || val === '' || val === false || val === 0) return false;
	if (Array.isArray(val)) return val.length > 0;
	return true;
}

/**
 * Evaluates a condition string against flattened discovery answers.
 *
 * Supports:
 * - Numeric comparisons: "compute_cd_instance_count > 2"
 * - String equality: "search_provider == 'SolrCloud'"
 * - Boolean checks: "ssl_certificate_pinning == true"
 * - Not-equal: "database_ha_config != 'No HA configured'"
 * - Contains (array/string): "integrations_sitecore_modules contains 'Sitecore JavaScript Services (JSS)'"
 * - AND/OR logic: "compute_cd_instance_count >= 4 AND session_private_provider != 'Redis (via Sitecore Redis session provider)'"
 * - Bare truthy: "xconnect_enabled"
 *
 * AND binds tighter than OR — split on AND first, then evaluate OR within each group.
 */
export function evaluateCondition(answers: FlatAnswers, condition: string): boolean {
	if (!condition || !condition.trim()) return false;

	const tokens = tokenize(condition.trim());
	if (tokens.length === 0) return false;

	// Split into AND-groups, then split each group by OR
	const andGroups: Token[][] = [];
	let current: Token[] = [];

	for (const token of tokens) {
		if (token.type === 'logic' && token.value === 'AND') {
			andGroups.push(current);
			current = [];
		} else {
			current.push(token);
		}
	}
	andGroups.push(current);

	// Each AND-group must be true; within a group, OR means any clause is true
	for (const group of andGroups) {
		const orClauses: Token[][] = [];
		let clause: Token[] = [];

		for (const token of group) {
			if (token.type === 'logic' && token.value === 'OR') {
				orClauses.push(clause);
				clause = [];
			} else {
				clause.push(token);
			}
		}
		orClauses.push(clause);

		const groupResult = orClauses.some((c) => evaluateClause(c, answers));
		if (!groupResult) return false;
	}

	return true;
}
