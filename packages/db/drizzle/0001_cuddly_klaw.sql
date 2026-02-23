CREATE TABLE "workspace_state" (
	"project_path" text PRIMARY KEY NOT NULL,
	"active_assessment_id" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workspace_state" ADD CONSTRAINT "workspace_state_active_assessment_id_assessments_id_fk" FOREIGN KEY ("active_assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;