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
  environments: string[];  // stored as JSON
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DiscoveryDimension {
  assessment_id: string;
  dimension: string;
  status: string;  // complete | partial | not_started
  completed_at: string | null;
  last_updated: string;
}

export interface DiscoveryAnswer {
  assessment_id: string;
  dimension: string;
  question_id: string;
  value: unknown;       // stored as JSON
  notes: string;
  confidence: string;   // confirmed | assumed | unknown
  basis: string | null;  // for inferred values
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
  linked_assumptions: string[];  // stored as JSON
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
  confidence: string;  // assumed | unknown
  validation_status: string;  // unvalidated | validated | invalidated
  validation_method: string;
  pessimistic_widening_hours: number;
  affected_components: string[];  // stored as JSON
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
  affected_components: string[];  // stored as JSON
}

export interface DependencyChain {
  assessment_id: string;
  from_component: string;
  to_component: string;
  dependency_type: string;  // hard | soft
}

export interface RiskCluster {
  assessment_id: string;
  name: string;
  risks: string[];           // stored as JSON
  assumptions: string[];     // stored as JSON
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
  totals: unknown;          // stored as JSON (without_ai, with_ai, ai_savings)
  total_by_role: unknown;   // stored as JSON
  client_summary: unknown;  // stored as JSON
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
  multipliers_applied: unknown[];  // stored as JSON
  gotcha_hours: number;
  final_hours: number;
  firm_hours: number;
  assumption_dependent_hours: number;
  assumptions_affecting: string[];  // stored as JSON
  hours: unknown;                  // stored as JSON (without_ai, with_ai)
  ai_alternatives: unknown[];     // stored as JSON
  by_role: unknown;               // stored as JSON
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
  status: string;  // complete | in_progress
  total_estimated: unknown;   // stored as JSON
  total_actual: number | null;
  surprises: unknown[];       // stored as JSON
  smoother: unknown[];        // stored as JSON
  suggested_adjustments: unknown[];  // stored as JSON
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
  top_gaps: Array<{ dimension: string; question: string; impact: string }>;
}
