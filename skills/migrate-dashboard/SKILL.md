# /migrate dashboard — Generate Interactive Dashboard

Generate a self-contained interactive HTML dashboard that visualizes the migration estimate with toggleable scope, AI alternatives, assumption scenarios, and real-time recalculation.

## Instructions

### 1. Load Data

Load data from MCP tools first, falling back to JSON files:

1. Call `get_assessment` with `project_path` (current working directory). Fall back to `.migration/assessment.json`.
2. Call `get_estimate` with the assessment ID. Fall back to `.migration/estimate.json`. If neither exists, tell the user to run `/migrate estimate` first — the dashboard requires estimate data.
3. Call `get_analysis` with the assessment ID (includes assumptions). Fall back to `.migration/analysis.json` and `.migration/assumptions-registry.json`. If unavailable, proceed but note that assumption tracking will be unavailable in the dashboard.
4. Read AI selections from the analysis response or fall back to `.migration/ai-alternatives-selection.json`.
5. Read `skills/migrate-knowledge/heuristics/ai-alternatives.json` — full AI alternatives catalog with descriptions, pros/cons, costs

### 2. Read the Dashboard Template

Read `skills/migrate-knowledge/templates/dashboard-template.html` — this is the full HTML template with inline CSS and JavaScript.

### 3. Prepare Data for Injection

The template contains placeholder tokens that must be replaced with actual data:

#### Header Placeholders
- `{{PROJECT_NAME}}` — from assessment.json `project_name`
- `{{CLIENT_NAME}}` — from assessment.json `client_name`
- `{{DATE}}` — current date in readable format
- `{{ASSESSMENT_ID}}` — from assessment.json `id`

#### JSON Data Placeholders
These are injected as JavaScript objects directly into the template's `<script>` block. Each must be valid JSON:

- `{{PROJECT_DATA_JSON}}` — assessment.json content (or `{}` if unavailable)
- `{{ESTIMATE_DATA_JSON}}` — estimate.json content (required)
- `{{ASSUMPTIONS_DATA_JSON}}` — assumptions-registry.json content (or `{"summary":{"total_assumptions":0,"validated":0,"unvalidated":0,"confirmed_answers":0,"total_hours_at_risk":0,"total_pessimistic_widening":0,"confidence_score":0},"assumptions":[]}` if unavailable)
- `{{ANALYSIS_DATA_JSON}}` — analysis.json content (or `{"risks":[],"dependency_chains":[],"complexity_multipliers_active":[]}` if unavailable)
- `{{AI_ALTERNATIVES_JSON}}` — ai-alternatives.json catalog content (required)
- `{{AI_SELECTIONS_JSON}}` — ai-alternatives-selection.json content (or `{"selections":{}}` if unavailable)

### 4. Perform Replacement

Replace all `{{PLACEHOLDER}}` tokens in the template with the prepared data. Ensure:
- JSON data is valid — no trailing commas, no comments, properly escaped strings
- Header text placeholders are plain text (HTML-escaped if they contain special characters)
- The resulting HTML is a complete, valid document

### 5. Write Output

Write the completed dashboard to `.migration/deliverables/dashboard.html`.

Create the `.migration/deliverables/` directory if it doesn't exist.

### 6. Present Results

Tell the user:
- The dashboard has been generated at `.migration/deliverables/dashboard.html`
- They can open it in any modern browser — it's fully self-contained (no external dependencies)
- Describe what they can do with it:
  - **Toggle components** to include/exclude scope items and see recalculated totals
  - **Toggle AI tools** to compare manual vs AI-assisted estimates
  - **View assumptions** sorted by impact, with pessimistic widening per assumption
  - **Compare scenarios** — Manual Only vs AI-Assisted vs Best Case (all validated + AI)
  - **View role breakdown** with rate ranges
  - **Print/PDF** — use browser print (Ctrl/Cmd+P) for a clean client-ready layout with controls hidden
- The dashboard reads embedded data — to update it after changes (new discovery, validated assumptions, re-estimation), re-run `/migrate dashboard`

## Dashboard Features Reference

The generated dashboard is a **neo-brutalist light-themed**, tabbed layout with bold borders, solid offset shadows, and high-contrast design:

### Layout
- **Header**: Project title + Edit Mode toggle + Export JSON button
- **Edit Toolbar**: Shown when Edit Mode is active — indicates editing state with Reset and Export actions
- **Summary Bar** (sticky top): 4 KPI cards — Recommended Estimate, Range, Confidence %, AI Savings — always visible, with animated number transitions
- **Tab Bar** (sticky below summary): Overview, Estimate, AI Tools, Risk
- **Status Bar** (sticky bottom): generation date + data source counts + modified data indicator

### Tabs
| Tab | Contents |
|-----|----------|
| **Overview** `[1]` | SVG confidence gauge with narrative, SVG donut chart (hours by phase), Scenario toggle bar (Manual/AI-Assisted/Best Case), Scenario Comparison table |
| **Estimate** `[2]` | Filter bar (search + phase/risk chips), Phase Breakdown (expandable with black headers), Component Scope toggles, Role Breakdown |
| **AI Tools** `[3]` | AI tool cards with toggles, AI Savings Summary |
| **Risk** `[4]` | Assumptions panel (Unvalidated/Validated/All sub-tabs), Risk Summary |

### New Interactive Features

#### Edit Mode
- Toggle via header button — adds `contenteditable` to key numeric values (hours, confidence)
- Validates numeric input on blur (rejects NaN/negative)
- Tracks original data for full reset
- Triggers recalculation on every change
- Status bar shows "Data Modified" indicator when edits are active

#### SVG Donut Chart
- 200×200 SVG donut chart showing hours by phase
- Bold phase colors with 2px black stroke separators
- Center label displays total hours
- Accompanying legend with color swatches and per-phase hours

#### SVG Confidence Gauge
- Semi-circle gauge replacing the thin progress bar
- Color-coded: green (≥80%), yellow (≥60%), red (<60%)
- Large centered percentage label

#### Filter Bar (Estimate Tab)
- Text search filters components by name
- Phase filter chips toggle visibility of phase groups
- Risk filter chips toggle by risk level (high/medium/low)
- Filter state persists across tab switches

#### Scenario Toggle
- Manual Only / AI-Assisted / Best Case toggle bar
- Switches which values display in summary cards and comparison table
- Comparison table highlights the active scenario row

#### Animated Values
- Summary card numbers animate with ease-out cubic transitions on recalculation

#### JSON Export
- Downloads current state as `migration-estimate-export.json`
- Includes: estimate data, AI selections, component states, calculated totals, modification flag

### Keyboard Shortcuts
- Press `1`–`4` to switch tabs (ignored when focused on inputs or contenteditable elements in Edit Mode)

### Neo-Brutalist Theme
- Off-white base (`#f5f5f0`), pure white surfaces, thick 3px black borders
- Solid offset shadows (`4px 4px 0 #000`) with hover lift and active press effects
- No border-radius (0px everywhere)
- Bold primaries: Blue `#2563eb`, Red `#dc2626`, Yellow `#facc15`, Green `#16a34a`
- 800-weight headings, monospace for all numbers, uppercase labels
- Dark table headers (`#1a1a1a` background, white text) with 2px row dividers
- Solid-fill badges with black borders

### Print Mode
- `Ctrl/Cmd+P` shows clean layout — all tab panels visible, interactive controls hidden
- Borders reduced to 1px, shadows removed (base theme is already light = print-friendly)
- Edit toolbar, filter bar, scenario bar, and header actions all hidden in print
