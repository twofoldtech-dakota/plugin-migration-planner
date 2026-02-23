/**
 * Knowledge pack thoroughness grading.
 * Scores 9 dimensions on an A–F scale, producing both letter grades
 * and numeric 0–100 scores suitable for RadarChart visualization.
 */

export type LetterGrade = 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'D' | 'F';

export interface DimensionGrade {
	dimension: string;
	label: string;
	count: number;
	grade: LetterGrade;
	score: number; // 0–100, for RadarChart
}

export interface PackGrade {
	packId: string;
	packName: string;
	overall: LetterGrade;
	overallScore: number; // 0–100
	dimensions: DimensionGrade[];
}

export interface PackHealthInput {
	packId: string;
	packName: string;
	discoveryDimensions: number;
	discoveryQuestions: number;
	effortHours: number;
	multipliers: number;
	gotchas: number;
	chains: number;
	phases: number;
	roles: number;
	aiAlternatives: number;
	sourceUrls: number;
	lastResearched: boolean;
}

// ── Thresholds per dimension ────────────────────────────────
// Each entry: [A, A-, B+, B, B-, C+, C, D]  (F = 0)
const THRESHOLDS: Record<string, number[]> = {
	discoveryDimensions: [15, 12, 10, 8, 6, 4, 3, 1],
	effortHours:         [14, 12, 10, 8, 6, 4, 3, 1],
	multipliers:         [20, 15, 12, 10, 8, 5, 3, 1],
	gotchas:             [14, 12, 10, 8, 6, 4, 2, 1],
	chains:              [12, 10, 8, 7, 5, 4, 3, 1],
	phases:              [5,  5,  5,  4, 4, 3, 3, 1],
	roles:               [5,  5,  5,  4, 4, 3, 3, 1],
	aiAlternatives:      [20, 15, 10, 8, 5, 3, 2, 1],
	sourceUrls:          [20, 15, 10, 8, 5, 3, 2, 1],
};

const LABELS: Record<string, string> = {
	discoveryDimensions: 'Discovery Tree',
	effortHours:         'Effort Hours',
	multipliers:         'Multipliers',
	gotchas:             'Gotcha Patterns',
	chains:              'Dependency Chains',
	phases:              'Phase Mappings',
	roles:               'Roles',
	aiAlternatives:      'AI Alternatives',
	sourceUrls:          'Source URLs',
};

const GRADES: LetterGrade[] = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D'];
const SCORES: number[]      = [100,  92,   85,  78,  70,   62,  55,  35];

function gradeValue(count: number, thresholds: number[]): { grade: LetterGrade; score: number } {
	if (count === 0) return { grade: 'F', score: 0 };
	for (let i = 0; i < thresholds.length; i++) {
		if (count >= thresholds[i]) return { grade: GRADES[i], score: SCORES[i] };
	}
	return { grade: 'D', score: 35 };
}

// ── Weights (used for overall score) ────────────────────────
const WEIGHTS: Record<string, number> = {
	discoveryDimensions: 20,
	effortHours:         15,
	multipliers:         12,
	gotchas:             12,
	chains:              10,
	phases:              8,
	roles:               5,
	aiAlternatives:      8,
	sourceUrls:          10,
};

function overallLetterGrade(score: number): LetterGrade {
	if (score >= 95)  return 'A';
	if (score >= 88)  return 'A-';
	if (score >= 82)  return 'B+';
	if (score >= 75)  return 'B';
	if (score >= 68)  return 'B-';
	if (score >= 58)  return 'C+';
	if (score >= 45)  return 'C';
	if (score >= 20)  return 'D';
	return 'F';
}

export function gradeKnowledgePack(input: PackHealthInput): PackGrade {
	const dimensionKeys = Object.keys(THRESHOLDS) as (keyof typeof THRESHOLDS)[];
	const valueMap: Record<string, number> = {
		discoveryDimensions: input.discoveryDimensions,
		effortHours:         input.effortHours,
		multipliers:         input.multipliers,
		gotchas:             input.gotchas,
		chains:              input.chains,
		phases:              input.phases,
		roles:               input.roles,
		aiAlternatives:      input.aiAlternatives,
		sourceUrls:          input.sourceUrls,
	};

	const dimensions: DimensionGrade[] = dimensionKeys.map((key) => {
		const { grade, score } = gradeValue(valueMap[key], THRESHOLDS[key]);
		return {
			dimension: key,
			label: LABELS[key],
			count: valueMap[key],
			grade,
			score,
		};
	});

	// Weighted average
	let totalWeight = 0;
	let weightedSum = 0;
	for (const dim of dimensions) {
		const w = WEIGHTS[dim.dimension] ?? 10;
		weightedSum += dim.score * w;
		totalWeight += w;
	}

	const overallScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

	return {
		packId: input.packId,
		packName: input.packName,
		overall: overallLetterGrade(overallScore),
		overallScore,
		dimensions,
	};
}

/** CSS class for a letter grade badge */
export function gradeColor(grade: LetterGrade): string {
	if (grade.startsWith('A')) return 'bg-success-light text-success border-success';
	if (grade.startsWith('B')) return 'bg-primary-light text-primary border-primary';
	if (grade.startsWith('C')) return 'bg-warning-light text-warning border-warning';
	return 'bg-danger-light text-danger border-danger';
}

/** Variant name for KpiCard or Badge */
export function gradeVariant(grade: LetterGrade): 'success' | 'primary' | 'warning' | 'danger' {
	if (grade.startsWith('A')) return 'success';
	if (grade.startsWith('B')) return 'primary';
	if (grade.startsWith('C')) return 'warning';
	return 'danger';
}
