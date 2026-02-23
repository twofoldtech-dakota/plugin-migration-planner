CREATE TABLE "team_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"snapshot_id" integer NOT NULL,
	"role_id" text NOT NULL,
	"role_name" text DEFAULT '' NOT NULL,
	"total_hours" real DEFAULT 0 NOT NULL,
	"base_hours" real DEFAULT 0 NOT NULL,
	"headcount" integer DEFAULT 1 NOT NULL,
	"allocation" text DEFAULT 'full-time' NOT NULL,
	"seniority" text DEFAULT 'mid' NOT NULL,
	"rate_min" real DEFAULT 0 NOT NULL,
	"rate_max" real DEFAULT 0 NOT NULL,
	"rate_override" real,
	"phases" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"source" text DEFAULT 'generated' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"assessment_id" text NOT NULL,
	"version" integer NOT NULL,
	"estimate_version" integer DEFAULT 1 NOT NULL,
	"assumptions" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"cost_projection" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"phase_staffing" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"hiring_notes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_team_version" UNIQUE("assessment_id","version")
);
--> statement-breakpoint
CREATE TABLE "wbs_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"assessment_id" text NOT NULL,
	"version" integer NOT NULL,
	"estimate_version" integer DEFAULT 1 NOT NULL,
	"total_items" integer DEFAULT 0 NOT NULL,
	"total_hours" real DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_wbs_version" UNIQUE("assessment_id","version")
);
--> statement-breakpoint
CREATE TABLE "work_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"snapshot_id" integer NOT NULL,
	"parent_id" integer,
	"type" text DEFAULT 'story' NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"hours" real DEFAULT 0 NOT NULL,
	"base_hours" real DEFAULT 0 NOT NULL,
	"role" text,
	"phase_id" text DEFAULT '' NOT NULL,
	"component_id" text DEFAULT '' NOT NULL,
	"labels" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"acceptance_criteria" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"confidence" text DEFAULT 'medium' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"source" text DEFAULT 'generated' NOT NULL,
	"blocked_by" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"blocks" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "team_roles" ADD CONSTRAINT "team_roles_snapshot_id_team_snapshots_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."team_snapshots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_snapshots" ADD CONSTRAINT "team_snapshots_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wbs_snapshots" ADD CONSTRAINT "wbs_snapshots_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_items" ADD CONSTRAINT "work_items_snapshot_id_wbs_snapshots_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."wbs_snapshots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_team_roles_snapshot" ON "team_roles" USING btree ("snapshot_id");--> statement-breakpoint
CREATE INDEX "idx_work_items_snapshot" ON "work_items" USING btree ("snapshot_id");--> statement-breakpoint
CREATE INDEX "idx_work_items_parent" ON "work_items" USING btree ("parent_id");