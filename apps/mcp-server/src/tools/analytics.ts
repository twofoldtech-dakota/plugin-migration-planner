import { z } from "zod";
import {
  getDb,
  queryProjects as dbQueryProjects,
  queryConfidenceTimeline as dbQueryConfidenceTimeline,
} from "@migration-planner/db";

export const queryProjectsSchema = z.object({
  status: z.string().optional(),
  client_name: z.string().optional(),
  limit: z.number().default(50),
});

export async function queryProjects(input: z.infer<typeof queryProjectsSchema>) {
  const db = getDb();
  return dbQueryProjects(db, input);
}

export const queryConfidenceTimelineSchema = z.object({
  from: z.string().optional().describe("Filter for points after this ISO 8601 timestamp"),
  to: z.string().optional().describe("Filter for points before this ISO 8601 timestamp"),
  limit: z.number().default(500).describe("Maximum number of points to return"),
});

export async function queryConfidenceTimeline(input: z.infer<typeof queryConfidenceTimelineSchema>) {
  const db = getDb();
  return dbQueryConfidenceTimeline(db, input);
}
