/** Core domain types for the migration-planner SQLite persistence layer. */
export interface Assessment {
    id: string;
    project_name: string;
    client_name: string;
    architect: string;
    project_path: string;
    sitecore_version: string;
    topology: string;
    source_cloud: string;
    target_cloud: string;
    target_timeline: string;
    environment_count: number;
    environments: string[];
    status: string;
    created_at: string;
    updated_at: string;
}
export interface DiscoveryDimension {
    assessment_id: string;
    dimension: string;
    status: string;
    completed_at: string | null;
    last_updated: string;
}
export interface DiscoveryAnswer {
    assessment_id: string;
    dimension: string;
    question_id: string;
    value: unknown;
    notes: string;
    confidence: string;
    basis: string | null;
}
export interface Risk {
    id: string;
    assessment_id: string;
    category: string;
    description: string;
    likelihood: string;
    impact: string;
    severity: string;
    estimated_hours_impact: number;
    linked_assumptions: string[];
    mitigation: string;
    contingency: string;
    owner: string;
    status: string;
}
export interface Assumption {
    id: string;
    assessment_id: string;
    dimension: string;
    question_id: string | null;
    assumed_value: string;
    basis: string;
    confidence: string;
    validation_status: string;
    validation_method: string;
    pessimistic_widening_hours: number;
    affected_components: string[];
    created_at: string;
    validated_at: string | null;
    actual_value: string | null;
}
export interface ActiveMultiplier {
    assessment_id: string;
    multiplier_id: string;
    name: string;
    factor: number;
    trigger_condition: string;
    affected_components: string[];
}
export interface DependencyChain {
    assessment_id: string;
    from_component: string;
    to_component: string;
    dependency_type: string;
}
export interface RiskCluster {
    assessment_id: string;
    name: string;
    risks: string[];
    assumptions: string[];
    combined_widening_hours: number;
}
export interface EstimateSnapshot {
    id: number;
    assessment_id: string;
    version: number;
    confidence_score: number;
    total_base_hours: number;
    total_gotcha_hours: number;
    total_expected_hours: number;
    assumption_widening_hours: number;
    totals: unknown;
    total_by_role: unknown;
    client_summary: unknown;
    created_at: string;
}
export interface EstimateComponent {
    snapshot_id: number;
    phase_id: string;
    phase_name: string;
    component_id: string;
    component_name: string;
    units: number;
    base_hours: number;
    multipliers_applied: unknown[];
    gotcha_hours: number;
    final_hours: number;
    firm_hours: number;
    assumption_dependent_hours: number;
    assumptions_affecting: string[];
    hours: unknown;
    ai_alternatives: unknown[];
    by_role: unknown;
}
export interface AiSelection {
    assessment_id: string;
    tool_id: string;
    enabled: boolean;
    reason: string | null;
}
export interface Calibration {
    id: number;
    assessment_id: string;
    engagement_name: string;
    estimate_date: string;
    calibration_date: string;
    status: string;
    total_estimated: unknown;
    total_actual: number | null;
    surprises: unknown[];
    smoother: unknown[];
    suggested_adjustments: unknown[];
    created_at: string;
}
export interface CalibrationPhase {
    calibration_id: number;
    phase_id: string;
    phase_name: string;
    estimated_hours: number;
    actual_hours: number;
    variance_percent: number;
    variance_direction: string;
    notes: string;
}
export interface CalibrationComponent {
    calibration_id: number;
    component_id: string;
    estimated_hours: number;
    actual_hours: number;
    variance_percent: number;
    notes: string;
}
export interface CalibrationAiTool {
    calibration_id: number;
    tool_id: string;
    tool_name: string;
    was_used: boolean;
    estimated_savings_hours: number;
    actual_savings_hours: number;
    variance_percent: number;
    notes: string;
}
export interface Deliverable {
    assessment_id: string;
    name: string;
    file_path: string;
    generated_at: string;
}
export interface AnalysisGaps {
    unknown_answers: number;
    assumed_answers: number;
    confirmed_answers: number;
    total_answers: number;
    top_gaps: Array<{
        dimension: string;
        question: string;
        impact: string;
    }>;
}
//# sourceMappingURL=types.d.ts.map