const fs = require('fs');
const path = require('path');

const BASE = path.resolve(__dirname, '..');
const SKILLS = path.resolve(BASE, '..', 'skills', 'migrate-knowledge');

// Read all data files
const assessment = fs.readFileSync(path.join(BASE, 'assessment.json'), 'utf8');
const estimate = fs.readFileSync(path.join(BASE, 'estimate.json'), 'utf8');
const assumptions = fs.readFileSync(path.join(BASE, 'assumptions-registry.json'), 'utf8');
const analysis = fs.readFileSync(path.join(BASE, 'analysis.json'), 'utf8');
const aiAlternatives = fs.readFileSync(path.join(SKILLS, 'heuristics', 'ai-alternatives.json'), 'utf8');
const aiSelections = fs.readFileSync(path.join(BASE, 'ai-alternatives-selection.json'), 'utf8');

// Parse assessment for individual fields
const assessmentObj = JSON.parse(assessment);

// Read template
const template = fs.readFileSync(
  path.join(SKILLS, 'templates', 'dashboard-template.html'),
  'utf8'
);

// Current date in readable format
const now = new Date();
const dateStr = now.toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

// Perform replacements
let output = template;
output = output.replaceAll('{{PROJECT_NAME}}', assessmentObj.project_name || '');
output = output.replaceAll('{{CLIENT_NAME}}', assessmentObj.client_name || '');
output = output.replaceAll('{{DATE}}', dateStr);
output = output.replaceAll('{{ASSESSMENT_ID}}', assessmentObj.id || '');
output = output.replaceAll('{{PROJECT_DATA_JSON}}', assessment.trim());
output = output.replaceAll('{{ESTIMATE_DATA_JSON}}', estimate.trim());
output = output.replaceAll('{{ASSUMPTIONS_DATA_JSON}}', assumptions.trim());
output = output.replaceAll('{{ANALYSIS_DATA_JSON}}', analysis.trim());
output = output.replaceAll('{{AI_ALTERNATIVES_JSON}}', aiAlternatives.trim());
output = output.replaceAll('{{AI_SELECTIONS_JSON}}', aiSelections.trim());

// Write output
const outPath = path.join(__dirname, 'dashboard.html');
fs.writeFileSync(outPath, output, 'utf8');

console.log('Dashboard written to:', outPath);
console.log('Project:', assessmentObj.project_name);
console.log('Client:', assessmentObj.client_name);
console.log('Date:', dateStr);
console.log('Size:', (Buffer.byteLength(output) / 1024).toFixed(1), 'KB');
