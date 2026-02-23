import { aa as head, ab as escape_html, a7 as stringify, ac as ensure_array_like, a6 as attr_class, ae as attr_style, ad as attr, a1 as derived } from './index4-DG1itRH8.js';
import { C as Card } from './Card-w7RlWvYA.js';
import { B as Badge } from './Badge-CWejdkwM.js';
import { T as Tooltip } from './Tooltip-hZ63yG7F.js';
import { T as Tabs } from './Tabs-CIZXvs-S.js';
import { C as ConfidenceGauge } from './ConfidenceGauge-CfeVxdrW.js';

function Stat($$renderer, $$props) {
  let { label, value, detail, tooltip } = $$props;
  $$renderer.push(`<div class="flex flex-col gap-1">`);
  if (tooltip) {
    $$renderer.push("<!--[-->");
    Tooltip($$renderer, {
      text: tooltip,
      position: "bottom",
      children: ($$renderer2) => {
        $$renderer2.push(`<span class="text-xs font-bold uppercase tracking-wider text-text-muted cursor-help">${escape_html(label)}</span>`);
      }
    });
  } else {
    $$renderer.push("<!--[!-->");
    $$renderer.push(`<span class="text-xs font-bold uppercase tracking-wider text-text-muted">${escape_html(label)}</span>`);
  }
  $$renderer.push(`<!--]--> <span class="text-2xl font-extrabold tracking-tight font-mono">${escape_html(value)}</span> `);
  if (detail) {
    $$renderer.push("<!--[-->");
    $$renderer.push(`<span class="text-xs text-text-secondary">${escape_html(detail)}</span>`);
  } else {
    $$renderer.push("<!--[!-->");
  }
  $$renderer.push(`<!--]--></div>`);
}
function ChallengeReviewPage($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { step, stepLabel, reviews, assessmentId } = $$props;
    const latest = derived(() => reviews.length > 0 ? reviews[reviews.length - 1] : null);
    const score = derived(() => latest()?.confidence_score ?? 0);
    const breakdown = derived(() => latest()?.score_breakdown ?? {});
    const challenges = derived(() => latest()?.challenges ?? []);
    const findings = derived(() => latest()?.findings ?? []);
    const criteria = derived(() => latest()?.acceptance_criteria_met ?? {});
    const openChallenges = derived(() => challenges().filter((c) => c.status === "open"));
    const resolvedChallenges = derived(() => challenges().filter((c) => c.status === "resolved"));
    const criticalHigh = derived(() => challenges().filter((c) => c.severity === "critical" || c.severity === "high"));
    const webFindings = derived(() => findings().filter((f) => f.source_url));
    let activeTab = "overview";
    const tabs = derived(() => [
      { id: "overview", label: "Overview" },
      {
        id: "challenges",
        label: "Challenges",
        count: challenges().length
      },
      { id: "findings", label: "Research", count: findings().length },
      { id: "history", label: "Rounds", count: reviews.length }
    ]);
    let expandedRows = {};
    const dimensions = [
      "completeness",
      "consistency",
      "plausibility",
      "currency",
      "risk_coverage"
    ];
    const dimensionLabels = {
      completeness: "Completeness",
      consistency: "Consistency",
      plausibility: "Plausibility",
      currency: "Currency",
      risk_coverage: "Risk Coverage"
    };
    const dimensionWeights = {
      completeness: 25,
      consistency: 25,
      plausibility: 20,
      currency: 15,
      risk_coverage: 15
    };
    function severityVariant(severity) {
      switch (severity) {
        case "critical":
          return "danger";
        case "high":
          return "danger";
        case "medium":
          return "warning";
        case "low":
          return "default";
        default:
          return "default";
      }
    }
    function statusVariant(status) {
      switch (status) {
        case "passed":
          return "success";
        case "conditional_pass":
          return "warning";
        case "failed":
          return "danger";
        case "in_progress":
          return "info";
        case "resolved":
          return "success";
        case "open":
          return "warning";
        case "accepted":
          return "info";
        case "deferred":
          return "default";
        default:
          return "default";
      }
    }
    function barWidth(value) {
      return `${Math.max(0, Math.min(100, value))}%`;
    }
    function barColor(value) {
      if (value >= 80) return "bg-success";
      if (value >= 65) return "bg-warning";
      return "bg-danger";
    }
    head("1h8aqje", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html(stepLabel)} Agent Review</title>`);
      });
    });
    $$renderer2.push(`<div class="p-6 space-y-6"><div><div class="flex items-center gap-2"><h1 class="text-xl font-extrabold uppercase tracking-wider">${escape_html(stepLabel)} Agent Review</h1> `);
    if (latest()) {
      $$renderer2.push("<!--[-->");
      Badge($$renderer2, {
        variant: statusVariant(latest().status),
        children: ($$renderer3) => {
          $$renderer3.push(`<!---->${escape_html(latest().status.replace("_", " "))}`);
        }
      });
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> <p class="text-sm font-bold text-text-secondary mt-0.5">Agent review quality gate for the ${escape_html(step)} step</p></div> `);
    if (!latest()) {
      $$renderer2.push("<!--[-->");
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="py-8 text-center"><p class="text-lg font-extrabold uppercase tracking-wider text-text-secondary">No Agent Review Data</p> <p class="mt-2 text-sm text-text-muted max-w-md mx-auto">Run <code class="brutal-border-thin bg-surface px-1.5 py-0.5 text-xs font-mono">/migrate challenge ${escape_html(step)}</code> to generate an agent review.</p></div>`);
        }
      });
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">`);
      Card($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="flex flex-col items-center py-2">`);
          ConfidenceGauge($$renderer3, { score: Math.round(score()), size: "sm" });
          $$renderer3.push(`<!----></div>`);
        }
      });
      $$renderer2.push(`<!----> `);
      Card($$renderer2, {
        children: ($$renderer3) => {
          Stat($$renderer3, {
            label: "Challenges",
            value: challenges().length,
            detail: `${stringify(resolvedChallenges().length)} resolved, ${stringify(openChallenges().length)} open`
          });
        }
      });
      $$renderer2.push(`<!----> `);
      Card($$renderer2, {
        children: ($$renderer3) => {
          Stat($$renderer3, {
            label: "Critical/High",
            value: criticalHigh().length,
            detail: `${stringify(criticalHigh().filter((c) => c.status === "open").length)} still open`
          });
        }
      });
      $$renderer2.push(`<!----> `);
      Card($$renderer2, {
        children: ($$renderer3) => {
          Stat($$renderer3, {
            label: "Research Findings",
            value: findings().length,
            detail: `${stringify(webFindings().length)} web-verified`
          });
        }
      });
      $$renderer2.push(`<!----> `);
      Card($$renderer2, {
        children: ($$renderer3) => {
          Stat($$renderer3, {
            label: "Rounds",
            value: reviews.length,
            detail: `Round ${stringify(latest().round)} is latest`
          });
        }
      });
      $$renderer2.push(`<!----></div> `);
      Tabs($$renderer2, {
        tabs: tabs(),
        active: activeTab,
        onchange: (id) => activeTab = id,
        children: ($$renderer3) => {
          if (activeTab === "overview") {
            $$renderer3.push("<!--[-->");
            Card($$renderer3, {
              padding: "p-4",
              children: ($$renderer4) => {
                $$renderer4.push(`<h3 class="text-xs font-extrabold uppercase tracking-wider mb-4 pb-1.5 border-b-3 border-primary text-primary">Score Breakdown</h3> <div class="space-y-3"><!--[-->`);
                const each_array = ensure_array_like(dimensions);
                for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
                  let dim = each_array[$$index];
                  const value = breakdown()[dim] ?? 0;
                  $$renderer4.push(`<div class="flex items-center gap-3"><span class="w-28 text-xs font-bold text-text-secondary">${escape_html(dimensionLabels[dim])}</span> <span class="w-8 text-[10px] font-mono text-text-muted text-right">w${escape_html(dimensionWeights[dim])}</span> <div class="flex-1 h-5 bg-border-light border-2 border-brutal relative"><div${attr_class(`h-full ${stringify(barColor(value))} transition-all duration-300`)}${attr_style(`width: ${stringify(barWidth(value))}`)}></div> <span${attr_class(`absolute inset-0 flex items-center justify-center text-[10px] font-extrabold font-mono ${stringify(value > 50 ? "text-white" : "text-text")}`)}>${escape_html(Math.round(value))}%</span></div></div>`);
                }
                $$renderer4.push(`<!--]--></div>`);
              }
            });
            $$renderer3.push(`<!----> `);
            if (Object.keys(criteria()).length > 0) {
              $$renderer3.push("<!--[-->");
              Card($$renderer3, {
                padding: "p-4",
                children: ($$renderer4) => {
                  $$renderer4.push(`<h3 class="text-xs font-extrabold uppercase tracking-wider mb-3 pb-1.5 border-b-3 border-primary text-primary">Acceptance Criteria</h3> <div class="grid gap-2 sm:grid-cols-2"><!--[-->`);
                  const each_array_1 = ensure_array_like(Object.entries(criteria()));
                  for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
                    let [criterion, met] = each_array_1[$$index_1];
                    $$renderer4.push(`<div${attr_class(`flex items-center gap-2 px-3 py-2 border-2 ${stringify(met ? "border-success bg-success-light" : "border-danger bg-danger-light")}`)}><span${attr_class(`text-xs font-bold ${stringify(met ? "text-success" : "text-danger")}`)}>${escape_html(met ? "✓" : "✗")}</span> <span class="text-sm font-bold">${escape_html(criterion)}</span></div>`);
                  }
                  $$renderer4.push(`<!--]--></div>`);
                }
              });
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--> `);
            if (latest().summary) {
              $$renderer3.push("<!--[-->");
              Card($$renderer3, {
                padding: "p-4",
                children: ($$renderer4) => {
                  $$renderer4.push(`<h3 class="text-xs font-extrabold uppercase tracking-wider mb-3 pb-1.5 border-b-3 border-primary text-primary">Summary</h3> <p class="text-sm text-text-secondary whitespace-pre-wrap">${escape_html(latest().summary)}</p>`);
                }
              });
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]-->`);
          } else if (activeTab === "challenges") {
            $$renderer3.push("<!--[1-->");
            $$renderer3.push(`<div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="bg-[#1a1a1a] text-white text-xs font-extrabold uppercase tracking-wider"><th class="text-left px-4 py-2.5">ID</th><th class="text-left px-4 py-2.5">Category</th><th class="text-left px-4 py-2.5">Description</th><th class="text-center px-4 py-2.5 w-24">Severity</th><th class="text-center px-4 py-2.5 w-24">Status</th><th class="text-center px-4 py-2.5 w-16">Impact</th><th class="text-center px-4 py-2.5 w-12"></th></tr></thead><tbody><!--[-->`);
            const each_array_2 = ensure_array_like(challenges());
            for (let $$index_3 = 0, $$length = each_array_2.length; $$index_3 < $$length; $$index_3++) {
              let challenge = each_array_2[$$index_3];
              const expanded = expandedRows[challenge.id];
              $$renderer3.push(`<tr${attr_class(`border-b border-border-light hover:bg-surface-hover transition-colors cursor-pointer select-none ${stringify(expanded ? "bg-surface-hover" : "")}`)}${attr("aria-expanded", expanded)}><td class="px-4 py-2.5 font-mono font-bold text-xs">${escape_html(challenge.id)}</td><td class="px-4 py-2.5 text-text-secondary text-xs uppercase">${escape_html(challenge.category)}</td><td class="px-4 py-2.5 max-w-xs truncate">${escape_html(challenge.description)}</td><td class="px-4 py-2.5 text-center">`);
              Badge($$renderer3, {
                variant: severityVariant(challenge.severity),
                children: ($$renderer4) => {
                  $$renderer4.push(`<!---->${escape_html(challenge.severity)}`);
                }
              });
              $$renderer3.push(`<!----></td><td class="px-4 py-2.5 text-center">`);
              Badge($$renderer3, {
                variant: statusVariant(challenge.status),
                children: ($$renderer4) => {
                  $$renderer4.push(`<!---->${escape_html(challenge.status)}`);
                }
              });
              $$renderer3.push(`<!----></td><td class="px-4 py-2.5 text-center font-mono font-bold text-xs">+${escape_html(challenge.score_impact)}</td><td class="px-4 py-2.5 text-center"><span${attr_class(`inline-block text-xs text-text-muted transition-transform duration-200 ${stringify(expanded ? "rotate-90" : "")}`)} aria-hidden="true">▶</span></td></tr> `);
              if (expanded) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<tr><td colspan="7" class="px-4 py-4 bg-surface-hover border-b border-border-light"><div class="grid gap-4 sm:grid-cols-2"><div><h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-1">Data Reference</h4> <p class="text-sm text-text-secondary font-mono">${escape_html(challenge.data_reference || "None")}</p></div> `);
                if (challenge.resolution) {
                  $$renderer3.push("<!--[-->");
                  $$renderer3.push(`<div><h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-1">Resolution</h4> <p class="text-sm text-text-secondary">${escape_html(challenge.resolution)}</p></div>`);
                } else {
                  $$renderer3.push("<!--[!-->");
                }
                $$renderer3.push(`<!--]--> `);
                if (challenge.researcher_needed) {
                  $$renderer3.push("<!--[-->");
                  $$renderer3.push(`<div><h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-1">Researcher</h4> <span class="px-2 py-0.5 text-xs font-bold bg-info-light text-info border border-info">Web research needed</span></div>`);
                } else {
                  $$renderer3.push("<!--[!-->");
                }
                $$renderer3.push(`<!--]--> `);
                if (findings().filter((f) => f.challenge_id === challenge.id).length > 0) {
                  $$renderer3.push("<!--[-->");
                  const linkedFindings = findings().filter((f) => f.challenge_id === challenge.id);
                  $$renderer3.push(`<div class="sm:col-span-2"><h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-2">Research Findings</h4> <div class="space-y-2"><!--[-->`);
                  const each_array_3 = ensure_array_like(linkedFindings);
                  for (let $$index_2 = 0, $$length2 = each_array_3.length; $$index_2 < $$length2; $$index_2++) {
                    let finding = each_array_3[$$index_2];
                    $$renderer3.push(`<div class="border-2 border-border-light p-3 bg-bg"><p class="text-sm text-text-secondary">${escape_html(finding.finding)}</p> `);
                    if (finding.source_url) {
                      $$renderer3.push("<!--[-->");
                      $$renderer3.push(`<a${attr("href", finding.source_url)} target="_blank" rel="noopener noreferrer" class="text-xs text-primary font-bold mt-1 inline-block">${escape_html(finding.source_url)}</a>`);
                    } else if (finding.source) {
                      $$renderer3.push("<!--[1-->");
                      $$renderer3.push(`<span class="text-xs text-text-muted font-mono mt-1 block">${escape_html(finding.source)}</span>`);
                    } else {
                      $$renderer3.push("<!--[!-->");
                    }
                    $$renderer3.push(`<!--]--> <p class="text-xs text-text-muted mt-1">Verified: ${escape_html(finding.verified_date)}</p> `);
                    if (finding.recommendation) {
                      $$renderer3.push("<!--[-->");
                      $$renderer3.push(`<div class="mt-2 px-2 py-1.5 bg-success-light border border-success"><span class="text-xs font-bold text-success">Recommendation:</span> <p class="text-xs text-text-secondary mt-0.5">${escape_html(finding.recommendation)}</p></div>`);
                    } else {
                      $$renderer3.push("<!--[!-->");
                    }
                    $$renderer3.push(`<!--]--> `);
                    if (finding.data_update_suggested) {
                      $$renderer3.push("<!--[-->");
                      $$renderer3.push(`<span class="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold bg-warning-light text-warning border border-warning">Knowledge update suggested</span>`);
                    } else {
                      $$renderer3.push("<!--[!-->");
                    }
                    $$renderer3.push(`<!--]--></div>`);
                  }
                  $$renderer3.push(`<!--]--></div></div>`);
                } else {
                  $$renderer3.push("<!--[!-->");
                }
                $$renderer3.push(`<!--]--></div></td></tr>`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]-->`);
            }
            $$renderer3.push(`<!--]--></tbody></table></div> `);
            if (challenges().length === 0) {
              $$renderer3.push("<!--[-->");
              Card($$renderer3, {
                children: ($$renderer4) => {
                  $$renderer4.push(`<div class="py-4 text-center text-sm text-text-muted">No challenges recorded</div>`);
                }
              });
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]-->`);
          } else if (activeTab === "findings") {
            $$renderer3.push("<!--[2-->");
            $$renderer3.push(`<div class="space-y-3"><!--[-->`);
            const each_array_4 = ensure_array_like(findings());
            for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
              let finding = each_array_4[$$index_4];
              Card($$renderer3, {
                padding: "p-4",
                children: ($$renderer4) => {
                  $$renderer4.push(`<div class="flex items-start justify-between gap-3"><div class="flex-1"><div class="flex items-center gap-2 mb-2"><span class="text-xs font-mono font-bold text-text-muted">${escape_html(finding.challenge_id)}</span> `);
                  if (finding.source_url) {
                    $$renderer4.push("<!--[-->");
                    $$renderer4.push(`<span class="px-1.5 py-0.5 text-[10px] font-bold bg-info-light text-info border border-info">Web</span>`);
                  } else {
                    $$renderer4.push("<!--[!-->");
                    $$renderer4.push(`<span class="px-1.5 py-0.5 text-[10px] font-bold bg-surface text-text-muted border border-border-light">Local</span>`);
                  }
                  $$renderer4.push(`<!--]--> `);
                  if (finding.data_update_suggested) {
                    $$renderer4.push("<!--[-->");
                    $$renderer4.push(`<span class="px-1.5 py-0.5 text-[10px] font-bold bg-warning-light text-warning border border-warning">Update suggested</span>`);
                  } else {
                    $$renderer4.push("<!--[!-->");
                  }
                  $$renderer4.push(`<!--]--></div> <p class="text-sm text-text-secondary">${escape_html(finding.finding)}</p> `);
                  if (finding.recommendation) {
                    $$renderer4.push("<!--[-->");
                    $$renderer4.push(`<div class="mt-2 px-2 py-1.5 bg-success-light border border-success"><span class="text-xs font-bold text-success">Recommendation:</span> <p class="text-xs text-text-secondary mt-0.5">${escape_html(finding.recommendation)}</p></div>`);
                  } else {
                    $$renderer4.push("<!--[!-->");
                  }
                  $$renderer4.push(`<!--]--></div> <div class="text-right shrink-0">`);
                  if (finding.source_url) {
                    $$renderer4.push("<!--[-->");
                    $$renderer4.push(`<a${attr("href", finding.source_url)} target="_blank" rel="noopener noreferrer" class="text-xs text-primary font-bold block truncate max-w-[200px]">Source</a>`);
                  } else {
                    $$renderer4.push("<!--[!-->");
                    $$renderer4.push(`<span class="text-xs text-text-muted font-mono block truncate max-w-[200px]">${escape_html(finding.source)}</span>`);
                  }
                  $$renderer4.push(`<!--]--> <span class="text-[10px] text-text-muted block mt-0.5">${escape_html(finding.verified_date)}</span></div></div>`);
                }
              });
            }
            $$renderer3.push(`<!--]--></div> `);
            if (findings().length === 0) {
              $$renderer3.push("<!--[-->");
              Card($$renderer3, {
                children: ($$renderer4) => {
                  $$renderer4.push(`<div class="py-4 text-center text-sm text-text-muted">No research findings recorded</div>`);
                }
              });
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]-->`);
          } else if (activeTab === "history") {
            $$renderer3.push("<!--[3-->");
            $$renderer3.push(`<div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="bg-[#1a1a1a] text-white text-xs font-extrabold uppercase tracking-wider"><th class="text-center px-4 py-2.5 w-20">Round</th><th class="text-center px-4 py-2.5 w-24">Score</th><th class="text-center px-4 py-2.5 w-24">Delta</th><th class="text-center px-4 py-2.5 w-24">Status</th><th class="text-center px-4 py-2.5 w-24">Challenges</th><th class="text-center px-4 py-2.5 w-24">Findings</th><th class="text-left px-4 py-2.5">Date</th></tr></thead><tbody><!--[-->`);
            const each_array_5 = ensure_array_like(reviews);
            for (let i = 0, $$length = each_array_5.length; i < $$length; i++) {
              let review = each_array_5[i];
              const prevScore = i > 0 ? reviews[i - 1].confidence_score : 0;
              const delta = i > 0 ? review.confidence_score - prevScore : review.confidence_score;
              const roundChallenges = review.challenges ?? [];
              const roundFindings = review.findings ?? [];
              $$renderer3.push(`<tr${attr_class(`border-b border-border-light ${stringify(review.round === latest()?.round ? "bg-surface-hover" : "")}`)}><td class="px-4 py-2.5 text-center font-mono font-bold">${escape_html(review.round)}</td><td class="px-4 py-2.5 text-center"><span${attr_class(`font-mono font-bold ${stringify(review.confidence_score >= 80 ? "text-success" : review.confidence_score >= 65 ? "text-warning" : "text-danger")}`)}>${escape_html(Math.round(review.confidence_score))}%</span></td><td${attr_class(`px-4 py-2.5 text-center font-mono text-xs ${stringify(delta > 0 ? "text-success font-bold" : delta < 0 ? "text-danger font-bold" : "text-text-muted")}`)}>${escape_html(delta > 0 ? "+" : "")}${escape_html(Math.round(delta))}</td><td class="px-4 py-2.5 text-center">`);
              Badge($$renderer3, {
                variant: statusVariant(review.status),
                children: ($$renderer4) => {
                  $$renderer4.push(`<!---->${escape_html(review.status.replace("_", " "))}`);
                }
              });
              $$renderer3.push(`<!----></td><td class="px-4 py-2.5 text-center font-mono text-xs">${escape_html(roundChallenges.length)}</td><td class="px-4 py-2.5 text-center font-mono text-xs">${escape_html(roundFindings.length)}</td><td class="px-4 py-2.5 text-xs text-text-muted">${escape_html(review.created_at ? new Date(review.created_at).toLocaleDateString() : "-")}</td></tr>`);
            }
            $$renderer3.push(`<!--]--></tbody></table></div> `);
            if (reviews.length > 1) {
              $$renderer3.push("<!--[-->");
              Card($$renderer3, {
                padding: "p-4",
                children: ($$renderer4) => {
                  $$renderer4.push(`<h3 class="text-xs font-extrabold uppercase tracking-wider mb-3 pb-1.5 border-b-3 border-primary text-primary">Score Progression</h3> <div class="flex items-end gap-2 h-32"><!--[-->`);
                  const each_array_6 = ensure_array_like(reviews);
                  for (let i = 0, $$length = each_array_6.length; i < $$length; i++) {
                    let review = each_array_6[i];
                    const height = Math.max(4, review.confidence_score);
                    Tooltip($$renderer4, {
                      text: `Round ${stringify(review.round)}: ${stringify(Math.round(review.confidence_score))}%`,
                      position: "top",
                      children: ($$renderer5) => {
                        $$renderer5.push(`<div class="flex flex-col items-center gap-1 flex-1"><span class="text-[10px] font-mono font-bold">${escape_html(Math.round(review.confidence_score))}%</span> <div${attr_class(`w-full min-w-6 border-2 border-brutal transition-all duration-300 ${stringify(review.confidence_score >= 80 ? "bg-success" : review.confidence_score >= 65 ? "bg-warning" : "bg-danger")}`)}${attr_style(`height: ${stringify(height)}%`)}></div> <span class="text-[10px] text-text-muted">R${escape_html(review.round)}</span></div>`);
                      }
                    });
                  }
                  $$renderer4.push(`<!--]--></div> <div class="flex items-center gap-2 mt-2 text-[10px]"><span class="w-3 h-0.5 bg-success"></span> <span class="text-text-muted">Pass (80%)</span> <span class="w-3 h-0.5 bg-warning ml-2"></span> <span class="text-text-muted">Conditional (65%)</span></div>`);
                }
              });
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]-->`);
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]-->`);
        }
      });
      $$renderer2.push(`<!----> `);
      Card($$renderer2, {
        padding: "p-4",
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="flex items-center justify-between"><div class="text-sm text-text-secondary">Run <code class="brutal-border-thin bg-surface px-1.5 py-0.5 text-xs font-mono">/migrate challenge ${escape_html(step)}</code> to run another agent review round.</div></div>`);
        }
      });
      $$renderer2.push(`<!---->`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}

export { ChallengeReviewPage as C };
//# sourceMappingURL=ChallengeReviewPage-DT8xsqJW.js.map
