import { e as error } from './index-wpIsICWW.js';
import { d as db } from './db-BWpbog7L.js';
import { g as getWBSSnapshot } from './wbs-_BnBrxIn.js';
import 'events';
import 'util';
import 'crypto';
import 'dns';
import 'fs';
import 'net';
import 'tls';
import 'path';
import 'stream';
import 'string_decoder';
import './shared-server-DaWdgxVh.js';
import './aggregate-B2GxRiPZ.js';

const GET = async ({ url }) => {
  const assessmentId = url.searchParams.get("assessment");
  const format = url.searchParams.get("format") ?? "csv";
  const version = url.searchParams.get("version");
  if (!assessmentId) return error(400, "Missing assessment param");
  const snapshot = await getWBSSnapshot(
    db(),
    assessmentId,
    version ? parseInt(version, 10) : void 0
  );
  if (!snapshot) return error(404, "No WBS snapshot found");
  const flatItems = snapshot.flat_items;
  if (format === "json") {
    return new Response(JSON.stringify(snapshot, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="wbs-v${snapshot.version}.json"`
      }
    });
  }
  if (format === "md") {
    const lines = ["# Work Breakdown Structure", "", `Version: ${snapshot.version}`, `Total Items: ${snapshot.total_items}`, `Total Hours: ${snapshot.total_hours}`, ""];
    for (const item of flatItems) {
      const indent = item.parent_id ? "  " : "";
      const typeTag = `[${item.type.toUpperCase()}]`;
      lines.push(`${indent}- ${typeTag} **${item.title}** — ${item.hours}h${item.role ? ` (${item.role})` : ""}`);
      if (item.description) lines.push(`${indent}  ${item.description}`);
    }
    return new Response(lines.join("\n"), {
      headers: {
        "Content-Type": "text/markdown",
        "Content-Disposition": `attachment; filename="wbs-v${snapshot.version}.md"`
      }
    });
  }
  const headers = ["Issue Type", "Summary", "Description", "Story Points", "Priority", "Labels", "Parent ID", "Component", "Assignee Role", "Acceptance Criteria"];
  const typeMap = {
    epic: "Epic",
    feature: "Feature",
    story: "Story",
    task: "Task",
    spike: "Spike"
  };
  const rows = flatItems.map((item) => {
    const ac = Array.isArray(item.acceptance_criteria) ? item.acceptance_criteria.join("; ") : "";
    const labels = Array.isArray(item.labels) ? item.labels.join(" ") : "";
    return [
      typeMap[item.type] ?? item.type,
      `"${item.title.replace(/"/g, '""')}"`,
      `"${item.description.replace(/"/g, '""')}"`,
      String(item.hours),
      item.priority,
      labels,
      item.parent_id ?? "",
      item.component_id ?? "",
      item.role ?? "",
      `"${ac.replace(/"/g, '""')}"`
    ].join(",");
  });
  const csv = [headers.join(","), ...rows].join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="wbs-v${snapshot.version}.csv"`
    }
  });
};

export { GET };
//# sourceMappingURL=_server.ts-CY5DMXcL.js.map
