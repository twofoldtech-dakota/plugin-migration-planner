CREATE TABLE "active_multipliers" (
	"assessment_id" text NOT NULL,
	"multiplier_id" text NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"factor" real DEFAULT 1 NOT NULL,
	"trigger_condition" text DEFAULT '' NOT NULL,
	"affected_components" jsonb DEFAULT '[]'::jsonb NOT NULL,
	CONSTRAINT "active_multipliers_assessment_id_multiplier_id_pk" PRIMARY KEY("assessment_id","multiplier_id")
);
--> statement-breakpoint
CREATE TABLE "ai_selections" (
	"assessment_id" text NOT NULL,
	"tool_id" text NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"reason" text,
	CONSTRAINT "ai_selections_assessment_id_tool_id_pk" PRIMARY KEY("assessment_id","tool_id")
);
--> statement-breakpoint
CREATE TABLE "assessments" (
	"id" text PRIMARY KEY NOT NULL,
	"project_name" text NOT NULL,
	"client_name" text DEFAULT '' NOT NULL,
	"architect" text DEFAULT '' NOT NULL,
	"project_path" text NOT NULL,
	"sitecore_version" text DEFAULT '' NOT NULL,
	"topology" text DEFAULT '' NOT NULL,
	"source_cloud" text DEFAULT 'aws' NOT NULL,
	"target_cloud" text DEFAULT 'azure' NOT NULL,
	"target_timeline" text DEFAULT '' NOT NULL,
	"environment_count" integer DEFAULT 1 NOT NULL,
	"environments" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'discovery' NOT NULL,
	"challenge_required" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assumptions" (
	"id" text NOT NULL,
	"assessment_id" text NOT NULL,
	"dimension" text DEFAULT '' NOT NULL,
	"question_id" text,
	"assumed_value" text DEFAULT '' NOT NULL,
	"basis" text DEFAULT '' NOT NULL,
	"confidence" text DEFAULT 'unknown' NOT NULL,
	"validation_status" text DEFAULT 'unvalidated' NOT NULL,
	"validation_method" text DEFAULT '' NOT NULL,
	"pessimistic_widening_hours" real DEFAULT 0 NOT NULL,
	"affected_components" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"validated_at" timestamp,
	"actual_value" text,
	CONSTRAINT "assumptions_id_assessment_id_pk" PRIMARY KEY("id","assessment_id")
);
--> statement-breakpoint
CREATE TABLE "calibration_ai_tools" (
	"calibration_id" integer NOT NULL,
	"tool_id" text NOT NULL,
	"tool_name" text DEFAULT '' NOT NULL,
	"was_used" boolean DEFAULT false NOT NULL,
	"estimated_savings_hours" real DEFAULT 0 NOT NULL,
	"actual_savings_hours" real DEFAULT 0 NOT NULL,
	"variance_percent" real DEFAULT 0 NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	CONSTRAINT "calibration_ai_tools_calibration_id_tool_id_pk" PRIMARY KEY("calibration_id","tool_id")
);
--> statement-breakpoint
CREATE TABLE "calibration_components" (
	"calibration_id" integer NOT NULL,
	"component_id" text NOT NULL,
	"estimated_hours" real DEFAULT 0 NOT NULL,
	"actual_hours" real DEFAULT 0 NOT NULL,
	"variance_percent" real DEFAULT 0 NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	CONSTRAINT "calibration_components_calibration_id_component_id_pk" PRIMARY KEY("calibration_id","component_id")
);
--> statement-breakpoint
CREATE TABLE "calibration_phases" (
	"calibration_id" integer NOT NULL,
	"phase_id" text NOT NULL,
	"phase_name" text DEFAULT '' NOT NULL,
	"estimated_hours" real DEFAULT 0 NOT NULL,
	"actual_hours" real DEFAULT 0 NOT NULL,
	"variance_percent" real DEFAULT 0 NOT NULL,
	"variance_direction" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	CONSTRAINT "calibration_phases_calibration_id_phase_id_pk" PRIMARY KEY("calibration_id","phase_id")
);
--> statement-breakpoint
CREATE TABLE "calibrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"assessment_id" text NOT NULL,
	"engagement_name" text DEFAULT '' NOT NULL,
	"estimate_date" text DEFAULT '' NOT NULL,
	"calibration_date" timestamp DEFAULT now() NOT NULL,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"total_estimated" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"total_actual" real,
	"surprises" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"smoother" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"suggested_adjustments" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challenge_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"assessment_id" text NOT NULL,
	"step" text NOT NULL,
	"round" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"confidence_score" real DEFAULT 0 NOT NULL,
	"score_breakdown" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"acceptance_criteria_met" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"challenges" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"findings" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "deliverables" (
	"assessment_id" text NOT NULL,
	"name" text NOT NULL,
	"file_path" text DEFAULT '' NOT NULL,
	"generated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "deliverables_assessment_id_name_pk" PRIMARY KEY("assessment_id","name")
);
--> statement-breakpoint
CREATE TABLE "dependency_chains" (
	"assessment_id" text NOT NULL,
	"from_component" text NOT NULL,
	"to_component" text NOT NULL,
	"dependency_type" text DEFAULT 'hard' NOT NULL,
	CONSTRAINT "dependency_chains_assessment_id_from_component_to_component_pk" PRIMARY KEY("assessment_id","from_component","to_component")
);
--> statement-breakpoint
CREATE TABLE "discovery_answers" (
	"assessment_id" text NOT NULL,
	"dimension" text NOT NULL,
	"question_id" text NOT NULL,
	"value" jsonb DEFAULT 'null'::jsonb NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"confidence" text DEFAULT 'unknown' NOT NULL,
	"basis" text,
	CONSTRAINT "discovery_answers_assessment_id_dimension_question_id_pk" PRIMARY KEY("assessment_id","dimension","question_id")
);
--> statement-breakpoint
CREATE TABLE "discovery_dimensions" (
	"assessment_id" text NOT NULL,
	"dimension" text NOT NULL,
	"status" text DEFAULT 'not_started' NOT NULL,
	"completed_at" timestamp,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "discovery_dimensions_assessment_id_dimension_pk" PRIMARY KEY("assessment_id","dimension")
);
--> statement-breakpoint
CREATE TABLE "estimate_components" (
	"snapshot_id" integer NOT NULL,
	"phase_id" text NOT NULL,
	"phase_name" text DEFAULT '' NOT NULL,
	"component_id" text NOT NULL,
	"component_name" text DEFAULT '' NOT NULL,
	"units" integer DEFAULT 1 NOT NULL,
	"base_hours" real DEFAULT 0 NOT NULL,
	"multipliers_applied" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"gotcha_hours" real DEFAULT 0 NOT NULL,
	"final_hours" real DEFAULT 0 NOT NULL,
	"firm_hours" real DEFAULT 0 NOT NULL,
	"assumption_dependent_hours" real DEFAULT 0 NOT NULL,
	"assumptions_affecting" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"hours" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ai_alternatives" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"by_role" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "estimate_components_snapshot_id_component_id_pk" PRIMARY KEY("snapshot_id","component_id")
);
--> statement-breakpoint
CREATE TABLE "estimate_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"assessment_id" text NOT NULL,
	"version" integer NOT NULL,
	"confidence_score" real DEFAULT 0 NOT NULL,
	"total_base_hours" real DEFAULT 0 NOT NULL,
	"total_gotcha_hours" real DEFAULT 0 NOT NULL,
	"total_expected_hours" real DEFAULT 0 NOT NULL,
	"assumption_widening_hours" real DEFAULT 0 NOT NULL,
	"totals" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"total_by_role" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"client_summary" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"phases_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_estimate_version" UNIQUE("assessment_id","version")
);
--> statement-breakpoint
CREATE TABLE "risk_clusters" (
	"assessment_id" text NOT NULL,
	"name" text NOT NULL,
	"risks" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"assumptions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"combined_widening_hours" real DEFAULT 0 NOT NULL,
	CONSTRAINT "risk_clusters_assessment_id_name_pk" PRIMARY KEY("assessment_id","name")
);
--> statement-breakpoint
CREATE TABLE "risks" (
	"id" text NOT NULL,
	"assessment_id" text NOT NULL,
	"category" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"likelihood" text DEFAULT '' NOT NULL,
	"impact" text DEFAULT '' NOT NULL,
	"severity" text DEFAULT '' NOT NULL,
	"estimated_hours_impact" real DEFAULT 0 NOT NULL,
	"linked_assumptions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"mitigation" text DEFAULT '' NOT NULL,
	"contingency" text DEFAULT '' NOT NULL,
	"owner" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	CONSTRAINT "risks_id_assessment_id_pk" PRIMARY KEY("id","assessment_id")
);
--> statement-breakpoint
CREATE TABLE "scope_exclusions" (
	"assessment_id" text NOT NULL,
	"component_id" text NOT NULL,
	"excluded" boolean DEFAULT false NOT NULL,
	"reason" text,
	CONSTRAINT "scope_exclusions_assessment_id_component_id_pk" PRIMARY KEY("assessment_id","component_id")
);
--> statement-breakpoint
ALTER TABLE "active_multipliers" ADD CONSTRAINT "active_multipliers_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_selections" ADD CONSTRAINT "ai_selections_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assumptions" ADD CONSTRAINT "assumptions_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calibration_ai_tools" ADD CONSTRAINT "calibration_ai_tools_calibration_id_calibrations_id_fk" FOREIGN KEY ("calibration_id") REFERENCES "public"."calibrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calibration_components" ADD CONSTRAINT "calibration_components_calibration_id_calibrations_id_fk" FOREIGN KEY ("calibration_id") REFERENCES "public"."calibrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calibration_phases" ADD CONSTRAINT "calibration_phases_calibration_id_calibrations_id_fk" FOREIGN KEY ("calibration_id") REFERENCES "public"."calibrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calibrations" ADD CONSTRAINT "calibrations_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_reviews" ADD CONSTRAINT "challenge_reviews_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dependency_chains" ADD CONSTRAINT "dependency_chains_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discovery_answers" ADD CONSTRAINT "discovery_answers_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discovery_dimensions" ADD CONSTRAINT "discovery_dimensions_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estimate_components" ADD CONSTRAINT "estimate_components_snapshot_id_estimate_snapshots_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."estimate_snapshots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estimate_snapshots" ADD CONSTRAINT "estimate_snapshots_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_clusters" ADD CONSTRAINT "risk_clusters_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risks" ADD CONSTRAINT "risks_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scope_exclusions" ADD CONSTRAINT "scope_exclusions_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_assessments_project_path" ON "assessments" USING btree ("project_path");--> statement-breakpoint
CREATE INDEX "idx_challenge_reviews_assessment" ON "challenge_reviews" USING btree ("assessment_id");--> statement-breakpoint
CREATE INDEX "idx_challenge_reviews_step" ON "challenge_reviews" USING btree ("assessment_id","step");