const THRESHOLDS = {
  discoveryDimensions: [15, 12, 10, 8, 6, 4, 3, 1],
  effortHours: [14, 12, 10, 8, 6, 4, 3, 1],
  multipliers: [20, 15, 12, 10, 8, 5, 3, 1],
  gotchas: [14, 12, 10, 8, 6, 4, 2, 1],
  chains: [12, 10, 8, 7, 5, 4, 3, 1],
  phases: [5, 5, 5, 4, 4, 3, 3, 1],
  roles: [5, 5, 5, 4, 4, 3, 3, 1],
  aiAlternatives: [20, 15, 10, 8, 5, 3, 2, 1],
  sourceUrls: [20, 15, 10, 8, 5, 3, 2, 1]
};
const LABELS = {
  discoveryDimensions: "Discovery Tree",
  effortHours: "Effort Hours",
  multipliers: "Multipliers",
  gotchas: "Gotcha Patterns",
  chains: "Dependency Chains",
  phases: "Phase Mappings",
  roles: "Roles",
  aiAlternatives: "AI Alternatives",
  sourceUrls: "Source URLs"
};
const GRADES = ["A", "A-", "B+", "B", "B-", "C+", "C", "D"];
const SCORES = [100, 92, 85, 78, 70, 62, 55, 35];
function gradeValue(count, thresholds) {
  if (count === 0) return { grade: "F", score: 0 };
  for (let i = 0; i < thresholds.length; i++) {
    if (count >= thresholds[i]) return { grade: GRADES[i], score: SCORES[i] };
  }
  return { grade: "D", score: 35 };
}
const WEIGHTS = {
  discoveryDimensions: 20,
  effortHours: 15,
  multipliers: 12,
  gotchas: 12,
  chains: 10,
  phases: 8,
  roles: 5,
  aiAlternatives: 8,
  sourceUrls: 10
};
function overallLetterGrade(score) {
  if (score >= 95) return "A";
  if (score >= 88) return "A-";
  if (score >= 82) return "B+";
  if (score >= 75) return "B";
  if (score >= 68) return "B-";
  if (score >= 58) return "C+";
  if (score >= 45) return "C";
  if (score >= 20) return "D";
  return "F";
}
function gradeKnowledgePack(input) {
  const dimensionKeys = Object.keys(THRESHOLDS);
  const valueMap = {
    discoveryDimensions: input.discoveryDimensions,
    effortHours: input.effortHours,
    multipliers: input.multipliers,
    gotchas: input.gotchas,
    chains: input.chains,
    phases: input.phases,
    roles: input.roles,
    aiAlternatives: input.aiAlternatives,
    sourceUrls: input.sourceUrls
  };
  const dimensions = dimensionKeys.map((key) => {
    const { grade, score } = gradeValue(valueMap[key], THRESHOLDS[key]);
    return {
      dimension: key,
      label: LABELS[key],
      count: valueMap[key],
      grade,
      score
    };
  });
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
    dimensions
  };
}
function gradeColor(grade) {
  if (grade.startsWith("A")) return "bg-success-light text-success border-success";
  if (grade.startsWith("B")) return "bg-primary-light text-primary border-primary";
  if (grade.startsWith("C")) return "bg-warning-light text-warning border-warning";
  return "bg-danger-light text-danger border-danger";
}

export { gradeColor as a, gradeKnowledgePack as g };
//# sourceMappingURL=pack-grading-B-ZgwrAj.js.map
