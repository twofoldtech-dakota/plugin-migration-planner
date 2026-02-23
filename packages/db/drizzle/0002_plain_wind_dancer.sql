CREATE TABLE "analytics_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"event" text NOT NULL,
	"category" text DEFAULT '' NOT NULL,
	"properties" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"path" text DEFAULT '' NOT NULL,
	"assessment_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_knowledge_pins" (
	"assessment_id" text NOT NULL,
	"pack_id" text NOT NULL,
	"pinned_version" integer NOT NULL,
	"pinned_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "assessment_knowledge_pins_assessment_id_pack_id_pk" PRIMARY KEY("assessment_id","pack_id")
);
--> statement-breakpoint
CREATE TABLE "client_proficiencies" (
	"client_id" text NOT NULL,
	"category_id" text NOT NULL,
	"proficiency" text DEFAULT 'beginner' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	CONSTRAINT "client_proficiencies_client_id_category_id_pk" PRIMARY KEY("client_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"industry" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_ai_alternatives" (
	"pack_id" text NOT NULL,
	"tool_id" text NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"vendor" text DEFAULT '' NOT NULL,
	"category" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"url" text DEFAULT '' NOT NULL,
	"applicable_components" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"applicable_phases" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"hours_saved" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"cost" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"pros" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"cons" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"prerequisites" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"recommendation" text DEFAULT 'conditional' NOT NULL,
	"applicability_conditions" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"mutual_exclusion_group" text,
	CONSTRAINT "knowledge_ai_alternatives_pack_id_tool_id_pk" PRIMARY KEY("pack_id","tool_id")
);
--> statement-breakpoint
CREATE TABLE "knowledge_dependency_chains" (
	"pack_id" text NOT NULL,
	"chain_id" text NOT NULL,
	"predecessor" text NOT NULL,
	"successors" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"dependency_type" text DEFAULT 'hard' NOT NULL,
	"reason" text DEFAULT '' NOT NULL,
	CONSTRAINT "knowledge_dependency_chains_pack_id_chain_id_pk" PRIMARY KEY("pack_id","chain_id")
);
--> statement-breakpoint
CREATE TABLE "knowledge_discovery_trees" (
	"pack_id" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"dimensions_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "knowledge_discovery_trees_pack_id_version_pk" PRIMARY KEY("pack_id","version")
);
--> statement-breakpoint
CREATE TABLE "knowledge_effort_hours" (
	"pack_id" text NOT NULL,
	"component_id" text NOT NULL,
	"component_name" text DEFAULT '' NOT NULL,
	"base_hours" real DEFAULT 0 NOT NULL,
	"unit" text DEFAULT '' NOT NULL,
	"includes" text DEFAULT '' NOT NULL,
	"role_breakdown" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"phase_id" text DEFAULT '' NOT NULL,
	CONSTRAINT "knowledge_effort_hours_pack_id_component_id_pk" PRIMARY KEY("pack_id","component_id")
);
--> statement-breakpoint
CREATE TABLE "knowledge_gotcha_patterns" (
	"pack_id" text NOT NULL,
	"pattern_id" text NOT NULL,
	"pattern_condition" text DEFAULT '' NOT NULL,
	"risk_level" text DEFAULT 'medium' NOT NULL,
	"hours_impact" real DEFAULT 0 NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"mitigation" text DEFAULT '' NOT NULL,
	"affected_components" jsonb DEFAULT '[]'::jsonb NOT NULL,
	CONSTRAINT "knowledge_gotcha_patterns_pack_id_pattern_id_pk" PRIMARY KEY("pack_id","pattern_id")
);
--> statement-breakpoint
CREATE TABLE "knowledge_multipliers" (
	"pack_id" text NOT NULL,
	"multiplier_id" text NOT NULL,
	"condition" text DEFAULT '' NOT NULL,
	"factor" real DEFAULT 1 NOT NULL,
	"applies_to" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"reason" text DEFAULT '' NOT NULL,
	"supersedes" text,
	CONSTRAINT "knowledge_multipliers_pack_id_multiplier_id_pk" PRIMARY KEY("pack_id","multiplier_id")
);
--> statement-breakpoint
CREATE TABLE "knowledge_pack_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"pack_id" text NOT NULL,
	"version" integer NOT NULL,
	"created_by" text DEFAULT '' NOT NULL,
	"change_summary" text DEFAULT '' NOT NULL,
	"snapshot_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_pack_version" UNIQUE("pack_id","version")
);
--> statement-breakpoint
CREATE TABLE "knowledge_packs" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"vendor" text DEFAULT '' NOT NULL,
	"category" text NOT NULL,
	"subcategory" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"direction" text DEFAULT 'both' NOT NULL,
	"latest_version" text DEFAULT '' NOT NULL,
	"supported_versions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"eol_versions" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"valid_topologies" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"deployment_models" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"compatible_targets" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"compatible_infrastructure" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"required_services" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"optional_services" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"confidence" text DEFAULT 'draft' NOT NULL,
	"last_researched" timestamp,
	"pack_version" text DEFAULT '1' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_phase_mappings" (
	"pack_id" text NOT NULL,
	"phase_id" text NOT NULL,
	"phase_name" text DEFAULT '' NOT NULL,
	"phase_order" integer DEFAULT 0 NOT NULL,
	"component_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	CONSTRAINT "knowledge_phase_mappings_pack_id_phase_id_pk" PRIMARY KEY("pack_id","phase_id")
);
--> statement-breakpoint
CREATE TABLE "knowledge_proficiency_catalog" (
	"category_id" text PRIMARY KEY NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"adoption_base_hours" real DEFAULT 0 NOT NULL,
	"maps_to_tools" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_roles" (
	"pack_id" text NOT NULL,
	"role_id" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"typical_rate_range" text DEFAULT '' NOT NULL,
	CONSTRAINT "knowledge_roles_pack_id_role_id_pk" PRIMARY KEY("pack_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "knowledge_source_urls" (
	"id" serial PRIMARY KEY NOT NULL,
	"pack_id" text,
	"migration_path_id" text,
	"source_url" text NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"source_type" text DEFAULT 'vendor-docs' NOT NULL,
	"accessed_at" timestamp DEFAULT now() NOT NULL,
	"claims" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"confidence" text DEFAULT 'medium' NOT NULL,
	"still_accessible" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "migration_paths" (
	"id" text PRIMARY KEY NOT NULL,
	"source_pack_id" text NOT NULL,
	"target_pack_id" text NOT NULL,
	"prevalence" text DEFAULT '' NOT NULL,
	"complexity" text DEFAULT '' NOT NULL,
	"typical_duration" text DEFAULT '' NOT NULL,
	"primary_drivers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"prerequisites" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"service_map" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"migration_tools" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"path_gotcha_patterns" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"path_effort_adjustments" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"step_by_step" text DEFAULT '' NOT NULL,
	"decision_points" text DEFAULT '' NOT NULL,
	"case_studies" text DEFAULT '' NOT NULL,
	"incompatibilities" text DEFAULT '' NOT NULL,
	"confidence" text DEFAULT 'draft' NOT NULL,
	"last_researched" timestamp,
	"version" text DEFAULT '1' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_migration_path_pair" UNIQUE("source_pack_id","target_pack_id")
);
--> statement-breakpoint
ALTER TABLE "assessments" ALTER COLUMN "project_path" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "assessments" ADD COLUMN "client_id" text;--> statement-breakpoint
ALTER TABLE "assessments" ADD COLUMN "source_stack" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "assessments" ADD COLUMN "target_stack" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "assessments" ADD COLUMN "migration_scope" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "assessment_knowledge_pins" ADD CONSTRAINT "assessment_knowledge_pins_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_knowledge_pins" ADD CONSTRAINT "assessment_knowledge_pins_pack_id_knowledge_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."knowledge_packs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_proficiencies" ADD CONSTRAINT "client_proficiencies_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_ai_alternatives" ADD CONSTRAINT "knowledge_ai_alternatives_pack_id_knowledge_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."knowledge_packs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_dependency_chains" ADD CONSTRAINT "knowledge_dependency_chains_pack_id_knowledge_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."knowledge_packs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_discovery_trees" ADD CONSTRAINT "knowledge_discovery_trees_pack_id_knowledge_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."knowledge_packs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_effort_hours" ADD CONSTRAINT "knowledge_effort_hours_pack_id_knowledge_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."knowledge_packs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_gotcha_patterns" ADD CONSTRAINT "knowledge_gotcha_patterns_pack_id_knowledge_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."knowledge_packs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_multipliers" ADD CONSTRAINT "knowledge_multipliers_pack_id_knowledge_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."knowledge_packs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_pack_versions" ADD CONSTRAINT "knowledge_pack_versions_pack_id_knowledge_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."knowledge_packs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_phase_mappings" ADD CONSTRAINT "knowledge_phase_mappings_pack_id_knowledge_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."knowledge_packs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_roles" ADD CONSTRAINT "knowledge_roles_pack_id_knowledge_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."knowledge_packs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_source_urls" ADD CONSTRAINT "knowledge_source_urls_pack_id_knowledge_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."knowledge_packs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_source_urls" ADD CONSTRAINT "knowledge_source_urls_migration_path_id_migration_paths_id_fk" FOREIGN KEY ("migration_path_id") REFERENCES "public"."migration_paths"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "migration_paths" ADD CONSTRAINT "migration_paths_source_pack_id_knowledge_packs_id_fk" FOREIGN KEY ("source_pack_id") REFERENCES "public"."knowledge_packs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "migration_paths" ADD CONSTRAINT "migration_paths_target_pack_id_knowledge_packs_id_fk" FOREIGN KEY ("target_pack_id") REFERENCES "public"."knowledge_packs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_analytics_events_session" ON "analytics_events" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_analytics_events_event" ON "analytics_events" USING btree ("event");--> statement-breakpoint
CREATE INDEX "idx_analytics_events_created_at" ON "analytics_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_pack_versions_pack_id" ON "knowledge_pack_versions" USING btree ("pack_id");--> statement-breakpoint
CREATE INDEX "idx_knowledge_packs_category" ON "knowledge_packs" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_knowledge_packs_direction" ON "knowledge_packs" USING btree ("direction");--> statement-breakpoint
CREATE INDEX "idx_source_urls_pack" ON "knowledge_source_urls" USING btree ("pack_id");--> statement-breakpoint
CREATE INDEX "idx_source_urls_path" ON "knowledge_source_urls" USING btree ("migration_path_id");--> statement-breakpoint
CREATE INDEX "idx_migration_paths_source" ON "migration_paths" USING btree ("source_pack_id");--> statement-breakpoint
CREATE INDEX "idx_migration_paths_target" ON "migration_paths" USING btree ("target_pack_id");--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;