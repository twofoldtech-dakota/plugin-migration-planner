import { aa as head, ab as escape_html, ad as attr, ac as ensure_array_like, a7 as stringify, a6 as attr_class, a1 as derived } from './index4-DG1itRH8.js';
import { C as Card } from './Card-w7RlWvYA.js';
import { R as RadarChart } from './RadarChart-BEXblXiD.js';

function ConfidenceLineChart($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { buckets, assessmentLines = [], showAssessments = false } = $$props;
    let containerWidth = 800;
    const margin = { top: 24, right: 24, bottom: 44, left: 52 };
    const chartHeight = 340;
    const innerW = derived(() => Math.max(containerWidth - margin.left - margin.right, 100));
    const innerH = chartHeight - margin.top - margin.bottom;
    const yRange = derived(() => {
      if (buckets.length < 2) return { min: 0, max: 100 };
      const vals = buckets.map((b) => b.avg);
      const dataMin = Math.min(...vals);
      const dataMax = Math.max(...vals);
      const span = dataMax - dataMin;
      const pad = Math.max(span * 0.3, 8);
      return {
        min: Math.max(0, Math.floor((dataMin - pad) / 5) * 5),
        max: Math.min(100, Math.ceil((dataMax + pad) / 5) * 5)
      };
    });
    const gridLines = derived(() => {
      const range = yRange().max - yRange().min;
      const step = range <= 20 ? 5 : range <= 50 ? 10 : 25;
      const lines = [];
      for (let v = yRange().min; v <= yRange().max; v += step) {
        lines.push(v);
      }
      if (lines[lines.length - 1] !== yRange().max) lines.push(yRange().max);
      return lines;
    });
    const thresholds = derived(() => {
      const t = [];
      if (yRange().min <= 40 && yRange().max >= 40) {
        t.push({ val: 40, label: "Low", color: "var(--color-danger)" });
      }
      if (yRange().min <= 70 && yRange().max >= 70) {
        t.push({ val: 70, label: "Good", color: "var(--color-success)" });
      }
      return t;
    });
    function yPos(val) {
      const range = yRange().max - yRange().min;
      if (range === 0) return margin.top + innerH / 2;
      return margin.top + innerH - (val - yRange().min) / range * innerH;
    }
    function xPos(i) {
      if (buckets.length <= 1) return margin.left + innerW() / 2;
      return margin.left + i / (buckets.length - 1) * innerW();
    }
    const portfolioPath = derived(() => {
      if (buckets.length < 2) return "";
      return buckets.map((b, i) => `${i === 0 ? "M" : "L"} ${xPos(i)} ${yPos(b.avg)}`).join(" ");
    });
    const fillPath = derived(() => {
      if (buckets.length < 2) return "";
      const bottom = margin.top + innerH;
      const parts = buckets.map((b, i) => `${i === 0 ? "M" : "L"} ${xPos(i)} ${yPos(b.avg)}`);
      const last = xPos(buckets.length - 1);
      const first = xPos(0);
      return `${parts.join(" ")} L ${last} ${bottom} L ${first} ${bottom} Z`;
    });
    let hoveredIndex = null;
    const columnWidth = derived(() => buckets.length > 1 ? innerW() / (buckets.length - 1) : innerW());
    const lineColors = [
      "#6366f1",
      "#ec4899",
      "#f59e0b",
      "#10b981",
      "#8b5cf6",
      "#ef4444",
      "#06b6d4",
      "#84cc16"
    ];
    function assessmentPath(line) {
      if (line.points.length < 2) return "";
      const labelToIdx = new Map(buckets.map((b, i) => [b.label, i]));
      return line.points.filter((p) => labelToIdx.has(p.label)).map((p, i) => {
        const idx = labelToIdx.get(p.label);
        return `${i === 0 ? "M" : "L"} ${xPos(idx)} ${yPos(p.score)}`;
      }).join(" ");
    }
    const labelEvery = derived(() => Math.max(1, Math.ceil(buckets.length / 8)));
    function formatLabel(label) {
      if (/^\d{4}-\d{2}$/.test(label)) {
        const [y, m] = label.split("-");
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec"
        ];
        return `${months[parseInt(m) - 1]} '${y.slice(2)}`;
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(label)) {
        const d = /* @__PURE__ */ new Date(label + "T00:00:00");
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec"
        ];
        return `${months[d.getMonth()]} ${d.getDate()}`;
      }
      return label;
    }
    const showDots = derived(() => buckets.length <= 24);
    const gradId = `chart-fill-${Math.random().toString(36).slice(2, 6)}`;
    $$renderer2.push(`<div class="w-full">`);
    if (buckets.length < 2) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex items-center justify-center h-64 text-text-muted text-sm">Not enough data points for a chart. At least 2 estimate snapshots are needed.</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<svg${attr("width", containerWidth)}${attr("height", chartHeight)} class="block"><defs><linearGradient${attr("id", gradId)} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--color-primary)" stop-opacity="0.15"></stop><stop offset="100%" stop-color="var(--color-primary)" stop-opacity="0.01"></stop></linearGradient></defs><!--[-->`);
      const each_array = ensure_array_like(gridLines());
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let val = each_array[$$index];
        $$renderer2.push(`<line${attr("x1", margin.left)}${attr("y1", yPos(val))}${attr("x2", margin.left + innerW())}${attr("y2", yPos(val))} stroke="var(--color-border-light)" stroke-width="1"${attr("stroke-dasharray", val === yRange().min || val === yRange().max ? "none" : "4,3")}></line><text${attr("x", margin.left - 10)}${attr("y", yPos(val) + 4)} text-anchor="end" class="text-[10px] font-mono" fill="var(--color-text-muted)">${escape_html(val)}%</text>`);
      }
      $$renderer2.push(`<!--]--><!--[-->`);
      const each_array_1 = ensure_array_like(thresholds());
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let th = each_array_1[$$index_1];
        $$renderer2.push(`<line${attr("x1", margin.left)}${attr("y1", yPos(th.val))}${attr("x2", margin.left + innerW())}${attr("y2", yPos(th.val))}${attr("stroke", th.color)} stroke-width="1" stroke-dasharray="6,4" opacity="0.4"></line><text${attr("x", margin.left + innerW() + 4)}${attr("y", yPos(th.val) + 3)} class="text-[9px] font-mono font-bold"${attr("fill", th.color)} opacity="0.6">${escape_html(th.label)}</text>`);
      }
      $$renderer2.push(`<!--]--><!--[-->`);
      const each_array_2 = ensure_array_like(buckets);
      for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
        each_array_2[i];
        $$renderer2.push(`<rect${attr("x", xPos(i) - columnWidth() / 2)}${attr("y", margin.top)}${attr("width", columnWidth())}${attr("height", innerH)}${attr("fill", hoveredIndex === i ? "var(--color-primary)" : "transparent")}${attr("opacity", hoveredIndex === i ? 0.04 : 0)} role="presentation" class="cursor-crosshair"></rect>`);
      }
      $$renderer2.push(`<!--]--><path${attr("d", fillPath())}${attr("fill", `url(#${stringify(gradId)})`)}></path>`);
      if (showAssessments) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<!--[-->`);
        const each_array_3 = ensure_array_like(assessmentLines);
        for (let i = 0, $$length = each_array_3.length; i < $$length; i++) {
          let line = each_array_3[i];
          const path = assessmentPath(line);
          if (path) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<path${attr("d", path)} fill="none"${attr("stroke", lineColors[i % lineColors.length])} stroke-width="1.5" stroke-dasharray="6,3" opacity="0.6"></path>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]-->`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--><path${attr("d", portfolioPath())} fill="none" stroke="var(--color-primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path>`);
      if (showDots()) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<!--[-->`);
        const each_array_4 = ensure_array_like(buckets);
        for (let i = 0, $$length = each_array_4.length; i < $$length; i++) {
          let bucket = each_array_4[i];
          $$renderer2.push(`<circle${attr("cx", xPos(i))}${attr("cy", yPos(bucket.avg))}${attr("r", hoveredIndex === i ? 5 : 3)}${attr("fill", hoveredIndex === i ? "var(--color-primary)" : "var(--color-surface)")} stroke="var(--color-primary)" stroke-width="2"></circle>`);
        }
        $$renderer2.push(`<!--]-->`);
      } else {
        $$renderer2.push("<!--[!-->");
        {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--><!--[-->`);
      const each_array_5 = ensure_array_like(buckets);
      for (let i = 0, $$length = each_array_5.length; i < $$length; i++) {
        let bucket = each_array_5[i];
        if (i % labelEvery() === 0 || i === buckets.length - 1) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<text${attr("x", xPos(i))}${attr("y", chartHeight - 10)} text-anchor="middle" class="text-[10px] font-mono" fill="var(--color-text-muted)">${escape_html(formatLabel(bucket.label))}</text>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></svg>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    let showAssessments = true;
    const chartBuckets = derived(() => data.events.map((ev) => ({ label: formatShortDate(ev.created_at), avg: ev.portfolioAvg })));
    const chartAssessmentLines = derived(() => data.assessments.map((a) => ({
      assessment_id: a.assessment_id,
      project_name: a.project_name,
      points: a.runs.map((r) => ({ label: formatShortDate(r.created_at), score: r.score })),
      current: a.currentScore,
      delta: a.delta
    })));
    function formatShortDate(dateStr) {
      const d = new Date(dateStr);
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ];
      return `${months[d.getMonth()]} ${d.getDate()}`;
    }
    function formatDateTime(dateStr) {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
      });
    }
    function deltaClass(delta) {
      if (delta > 3) return "text-success";
      if (delta < -3) return "text-danger";
      return "text-text-muted";
    }
    function deltaPrefix(delta) {
      return delta > 0 ? "+" : "";
    }
    function confidenceColor(score) {
      if (score >= 70) return "text-success";
      if (score >= 40) return "text-warning";
      return "text-danger";
    }
    function runTypeLabel(type) {
      return type === "initial" ? "Initial" : "Refinement";
    }
    function runTypeBadge(type) {
      return type === "initial" ? "bg-primary text-white" : "bg-surface-hover text-text-muted";
    }
    head("veq9my", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Confidence Over Time | MigrateIQ</title>`);
      });
    });
    $$renderer2.push(`<div><div class="flex items-center justify-between mb-6"><div><h2 class="text-lg font-extrabold uppercase tracking-wider">Confidence Over Time</h2> <p class="text-sm text-text-muted mt-1">${escape_html(data.assessments.length)} assessment${escape_html(data.assessments.length !== 1 ? "s" : "")}
				· ${escape_html(data.totalRuns)} estimation run${escape_html(data.totalRuns !== 1 ? "s" : "")}</p></div></div> `);
    if (data.events.length < 2) {
      $$renderer2.push("<!--[-->");
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="flex flex-col items-center gap-4 py-12 text-center"><div class="flex h-16 w-16 items-center justify-center brutal-border bg-primary-light text-3xl text-primary shadow-sm">☰</div> <h2 class="text-lg font-extrabold uppercase tracking-wider">No Trend Data Yet</h2> <p class="text-sm text-text-muted max-w-md">Confidence trends require at least 2 estimation runs across your portfolio.
					Run estimates on your assessments to start building the timeline.</p> <a href="/assessments" class="brutal-border-thin px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-primary text-white border-primary hover:bg-primary-hover transition-colors no-underline">View Assessments</a></div>`);
        }
      });
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">`);
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<span class="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Assessments</span> <p class="text-2xl font-extrabold font-mono mt-0.5">${escape_html(data.assessments.length)}</p>`);
        }
      });
      $$renderer2.push(`<!----> `);
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<span class="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Total Runs</span> <p class="text-2xl font-extrabold font-mono mt-0.5">${escape_html(data.totalRuns)}</p>`);
        }
      });
      $$renderer2.push(`<!----> `);
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<span class="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Initial Estimates</span> <p class="text-2xl font-extrabold font-mono mt-0.5">${escape_html(data.events.filter((e) => e.type === "initial").length)}</p>`);
        }
      });
      $$renderer2.push(`<!----> `);
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<span class="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Refinements</span> <p class="text-2xl font-extrabold font-mono mt-0.5">${escape_html(data.events.filter((e) => e.type === "refinement").length)}</p>`);
        }
      });
      $$renderer2.push(`<!----></div> `);
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="flex items-center justify-between mb-4"><h2 class="text-sm font-extrabold uppercase tracking-wider">Portfolio Trend</h2> `);
          if (data.assessments.length > 1) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<label class="flex items-center gap-2 cursor-pointer"><input type="checkbox"${attr("checked", showAssessments, true)} class="accent-primary"/> <span class="text-xs font-bold text-text-muted uppercase tracking-wider">Per-assessment lines</span></label>`);
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]--></div> `);
          ConfidenceLineChart($$renderer3, {
            buckets: chartBuckets(),
            assessmentLines: chartAssessmentLines(),
            showAssessments
          });
          $$renderer3.push(`<!----> <div class="flex items-center gap-4 mt-4 pt-3 border-t-2 border-border-light"><div class="flex items-center gap-1.5"><div class="w-6 h-0.5 bg-primary"></div> <span class="text-[10px] font-bold text-text-muted uppercase">Portfolio avg</span></div> `);
          if (data.assessments.length > 1) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="flex items-center gap-1.5"><div class="w-6 h-0.5 border-t-2 border-dashed border-text-muted"></div> <span class="text-[10px] font-bold text-text-muted uppercase">Per-assessment</span></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]--></div>`);
        }
      });
      $$renderer2.push(`<!----> <div class="mt-6">`);
      Card($$renderer2, {
        padding: "p-0",
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="flex items-center justify-between px-6 pt-5 pb-4"><h2 class="text-sm font-extrabold uppercase tracking-wider">Estimation Runs</h2> <span class="text-xs font-mono text-text-muted">${escape_html(data.totalRuns)} run${escape_html(data.totalRuns !== 1 ? "s" : "")}</span></div> <div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="bg-brutal text-white text-left"><th class="px-6 py-2.5 text-[10px] font-extrabold uppercase tracking-wider">When</th><th class="px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-wider">Project</th><th class="px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-wider">Type</th><th class="px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-right">Score</th><th class="px-6 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-right">Portfolio Avg</th></tr></thead><tbody><!--[-->`);
          const each_array = ensure_array_like(data.events);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let event = each_array[$$index];
            $$renderer3.push(`<tr class="border-b-2 border-border-light hover:bg-surface-hover transition-colors"><td class="px-6 py-3 font-mono text-xs text-text-muted whitespace-nowrap">${escape_html(formatDateTime(event.created_at))}</td><td class="px-4 py-3"><a${attr("href", `/assessments/${stringify(event.assessment_id)}`)} class="font-bold text-text hover:text-primary transition-colors no-underline">${escape_html(event.project_name)}</a></td><td class="px-4 py-3"><span${attr_class(`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border-2 border-brutal ${stringify(runTypeBadge(event.type))}`)}>${escape_html(runTypeLabel(event.type))}</span></td><td${attr_class(`px-4 py-3 text-right font-mono font-bold ${stringify(confidenceColor(event.score))}`)}>${escape_html(Math.round(event.score))}%</td><td${attr_class(`px-6 py-3 text-right font-mono font-bold ${stringify(confidenceColor(event.portfolioAvg))}`)}>${escape_html(event.portfolioAvg)}%</td></tr>`);
          }
          $$renderer3.push(`<!--]--></tbody></table></div>`);
        }
      });
      $$renderer2.push(`<!----></div> `);
      if (data.assessments.length > 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="mt-6">`);
        Card($$renderer2, {
          padding: "p-0",
          children: ($$renderer3) => {
            $$renderer3.push(`<div class="flex items-center justify-between px-6 pt-5 pb-4"><h2 class="text-sm font-extrabold uppercase tracking-wider">Per-Assessment Summary</h2> <span class="text-xs font-mono text-text-muted">${escape_html(data.assessments.length)} assessment${escape_html(data.assessments.length !== 1 ? "s" : "")}</span></div> <div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="bg-brutal text-white text-left"><th class="px-6 py-2.5 text-[10px] font-extrabold uppercase tracking-wider">Project</th><th class="px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-right">Initial</th><th class="px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-right">Current</th><th class="px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-right">Change</th><th class="px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-right">Runs</th><th class="px-6 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-right">Last Run</th></tr></thead><tbody><!--[-->`);
            const each_array_1 = ensure_array_like(data.assessments);
            for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
              let assessment = each_array_1[$$index_1];
              $$renderer3.push(`<tr class="border-b-2 border-border-light hover:bg-surface-hover transition-colors"><td class="px-6 py-3"><a${attr("href", `/assessments/${stringify(assessment.assessment_id)}`)} class="font-bold text-text hover:text-primary transition-colors no-underline">${escape_html(assessment.project_name)}</a></td><td class="px-4 py-3 text-right font-mono text-text-muted">${escape_html(Math.round(assessment.initialScore))}%</td><td${attr_class(`px-4 py-3 text-right font-mono font-bold ${stringify(confidenceColor(assessment.currentScore))}`)}>${escape_html(Math.round(assessment.currentScore))}%</td><td${attr_class(`px-4 py-3 text-right font-mono font-bold ${stringify(deltaClass(assessment.delta))}`)}>`);
              if (assessment.totalRuns > 1) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`${escape_html(deltaPrefix(assessment.delta))}${escape_html(assessment.delta)}`);
              } else {
                $$renderer3.push("<!--[!-->");
                $$renderer3.push(`<span class="text-text-muted">---</span>`);
              }
              $$renderer3.push(`<!--]--></td><td class="px-4 py-3 text-right font-mono"><span class="font-bold">${escape_html(assessment.totalRuns)}</span> `);
              if (assessment.totalRuns > 1) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<span class="text-text-muted text-xs ml-0.5">(${escape_html(assessment.totalRuns - 1)} refinement${escape_html(assessment.totalRuns - 1 !== 1 ? "s" : "")})</span>`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--></td><td class="px-6 py-3 text-right font-mono text-xs text-text-muted whitespace-nowrap">${escape_html(formatDateTime(assessment.lastEstimate))}</td></tr>`);
            }
            $$renderer3.push(`<!--]--></tbody></table></div>`);
          }
        });
        $$renderer2.push(`<!----></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (data.radarData && data.radarData.length > 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="mt-6">`);
        Card($$renderer2, {
          children: ($$renderer3) => {
            $$renderer3.push(`<h2 class="text-sm font-extrabold uppercase tracking-wider mb-4">Confidence Score Breakdown</h2> <p class="text-xs text-text-muted mb-6">Radar profiles from challenge reviews showing 5 quality dimensions per assessment.</p> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><!--[-->`);
            const each_array_2 = ensure_array_like(data.radarData);
            for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
              let radar = each_array_2[$$index_2];
              $$renderer3.push(`<div class="text-center"><h3 class="text-xs font-bold mb-2 truncate"${attr("title", radar.project_name)}>${escape_html(radar.project_name)}</h3> `);
              RadarChart($$renderer3, {
                dimensions: radar.dimensions.map((d) => ({ ...d, maxValue: 100 })),
                size: 200
              });
              $$renderer3.push(`<!----> <p${attr_class(`text-xs font-mono font-bold mt-1 ${stringify(radar.confidence >= 70 ? "text-success" : radar.confidence >= 40 ? "text-warning" : "text-danger")}`)}>${escape_html(Math.round(radar.confidence))}%</p></div>`);
            }
            $$renderer3.push(`<!--]--></div>`);
          }
        });
        $$renderer2.push(`<!----></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-D6nmDHGw.js.map
