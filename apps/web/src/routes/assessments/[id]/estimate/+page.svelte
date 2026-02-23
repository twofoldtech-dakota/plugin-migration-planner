<script lang="ts">
	import { page } from '$app/state';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import CollapsibleSection from '$lib/components/ui/CollapsibleSection.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import ScenarioSelector from '$lib/components/ScenarioSelector.svelte';
	import AiToolToggles from '$lib/components/AiToolToggles.svelte';
	import Tooltip from '$lib/components/ui/Tooltip.svelte';
	import InfoDrawer from '$lib/components/ui/InfoDrawer.svelte';
	import DeltaBadge from '$lib/components/ui/DeltaBadge.svelte';
	import VersionSwitcher from '$lib/components/VersionSwitcher.svelte';
	import VersionComparisonBanner from '$lib/components/VersionComparisonBanner.svelte';
	import { confidenceVariant, formatRole } from '$lib/utils/migration-stats';
	import { getComponentHours, getPhaseHours, computeScenarioTotals, getToolAdoptionOverhead } from '$lib/utils/scenario-engine';
	import type { Scenario, ProficiencyData } from '$lib/utils/scenario-engine';
	import { computeEstimateComparison } from '$lib/utils/estimate-diff';
	import type { EstimateComparison, ComponentDiff } from '$lib/utils/estimate-diff';

	let { data } = $props();

	const estimate = $derived(data.estimate as any);
	const phases = $derived((estimate?.phases ?? []) as any[]);
	const assumptions = $derived((data.analysis?.assumptions ?? []) as any[]);
	const estimateVersions = $derived(data.estimateVersions ?? []);

	const statusBadge = $derived(
		estimate
			? { variant: 'success' as const, label: 'Estimated' }
			: { variant: 'muted'   as const, label: 'No Estimate' }
	);

	// Compare mode
	const compareEstimate = $derived(data.compareEstimate as any);
	const isCompareMode = $derived(!!compareEstimate);
	const comparison: EstimateComparison | null = $derived(
		isCompareMode && compareEstimate && estimate
			? computeEstimateComparison(compareEstimate, estimate)
			: null
	);

	// AI tool state
	let aiToggles = $state<Record<string, boolean>>({});
	const aiTools = $derived((data.aiAlternatives ?? []) as any[]);

	$effect(() => {
		aiToggles = { ...(data.aiSelections?.selections ?? {}) };
	});

	// Proficiency data for adoption overhead
	const profData = $derived(data.proficiencyData as ProficiencyData | undefined);

	// Scenario selector
	let scenario = $state<Scenario>('ai_assisted');

	// Track expanded components
	let expandedComponents = $state<Record<string, boolean>>({});
	let drawerSection = $state<'page' | 'hours' | 'roles' | null>(null);

	// Tab from URL param or default
	const urlTab = $derived(page.url.searchParams.get('tab'));
	let activeTab = $state('phases');

	$effect(() => {
		if (urlTab && ['phases', 'ai-tools', 'roles'].includes(urlTab)) {
			activeTab = urlTab;
		}
	});

	const tabs = $derived([
		{ id: 'phases', label: 'Phases' },
		{ id: 'ai-tools', label: 'AI Tools', count: aiTools.length },
		{ id: 'roles', label: 'By Role' }
	]);

	// Scenario totals from shared engine
	const scenarioTotals = $derived(computeScenarioTotals(phases, aiToggles, profData));

	const totalHours = $derived(
		scenario === 'manual' ? scenarioTotals.manual
		: scenario === 'best_case' ? scenarioTotals.bestCase
		: scenarioTotals.aiAssisted
	);

	const savings = $derived(scenarioTotals.manual - totalHours);
	const savingsPercent = $derived(scenarioTotals.manual > 0 ? Math.round((savings / scenarioTotals.manual) * 100) : 0);

	// Role aggregation
	const roleBreakdown = $derived(() => {
		const roles: Record<string, number> = {};
		for (const phase of phases) {
			for (const comp of (phase.components ?? []) as any[]) {
				const byRole = comp.by_role as Record<string, number> | undefined;
				if (byRole) {
					for (const [role, hours] of Object.entries(byRole)) {
						roles[role] = (roles[role] ?? 0) + hours;
					}
				}
			}
		}
		return roles;
	});

	// Persist AI toggle changes
	async function toggleAiTool(toolId: string, enabled: boolean) {
		aiToggles[toolId] = enabled;
		aiToggles = { ...aiToggles };
		await fetch(`/api/assessments/${page.params.id}/ai-selections`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ selections: aiToggles })
		});
	}

	function getToolsForComponent(comp: any) {
		return aiTools.filter((t: any) => t.applicable_components?.includes(comp.id));
	}

	function getRoleDescription(role: string, compId: string, compName: string): string {
		const ctx = (compId + ' ' + compName).toLowerCase();
		const isDb = /database|db|sql|mysql|postgres|mssql/.test(ctx);
		const isCompute = /compute|vm|server|ec2|container|app.?service/.test(ctx);
		const isNetworking = /network|dns|ssl|tls|cdn|load.?balanc|firewall/.test(ctx);
		const isCicd = /ci.?cd|pipeline|deploy|build|release/.test(ctx);
		const isMonitoring = /monitor|log|alert|observ|telemetry/.test(ctx);
		const isStorage = /storage|blob|s3|file.?share/.test(ctx);
		const isSearch = /search|solr|elastic/.test(ctx);
		const isIdentity = /identity|auth|sso|oauth|oidc/.test(ctx);
		const isCaching = /cach|redis|session/.test(ctx);
		const isXconnect = /xconnect|xdb|analytic|tracker/.test(ctx);

		const r = role.toLowerCase().replace(/-/g, '_');

		if (r.includes('infrastructure') || r === 'infra_eng') {
			if (isDb) return 'Provision the target database service, configure networking and security groups, set up backup and high-availability policies.';
			if (isCompute) return 'Size and provision target compute resources, configure auto-scaling groups, set up load balancers and health checks.';
			if (isNetworking) return 'Configure DNS records, SSL/TLS certificates, firewall rules, and network peering between source and target environments.';
			if (isCicd) return 'Set up build agents and runners, configure deployment pipeline infrastructure, manage secrets and environment variable injection.';
			if (isMonitoring) return 'Deploy monitoring agents and collectors, configure dashboards, set up alerting rules and on-call escalation paths.';
			if (isStorage) return 'Provision storage accounts, configure replication and geo-redundancy, define access policies and lifecycle management rules.';
			if (isSearch) return 'Provision and configure search cluster, set up node roles and replication, tune JVM heap and memory settings.';
			if (isCaching) return 'Provision cache cluster, configure eviction policies and persistence mode, set up connection pooling and failover.';
			return 'Provision required infrastructure resources, configure networking and security boundaries, validate service connectivity.';
		}

		if (r === 'dba' || r.includes('database')) {
			if (isDb) return 'Assess schema compatibility, execute data migration scripts, validate row counts and referential integrity, tune query performance on target.';
			if (isXconnect) return 'Migrate xDB collections, validate analytics records completeness, assess and convert any custom schema extensions.';
			return 'Assess data dependencies, support schema conversion, validate data integrity and query correctness post-migration.';
		}

		if (r.includes('sitecore') || r.includes('developer') || r.includes('dev')) {
			if (isIdentity) return 'Reconfigure Sitecore Identity Server, update SSO provider settings, validate token issuance and role claim mapping.';
			if (isXconnect) return 'Update xConnect connection strings and certificates, validate tracker and collection service configuration, test analytics pipeline end-to-end.';
			if (isSearch) return 'Reconfigure Sitecore search providers for target environment, rebuild indexes, validate content search queries and results.';
			if (isCaching) return 'Update cache provider connection strings and session state configuration, validate caching behaviour under load.';
			if (isCicd) return 'Update deployment scripts and environment transforms for target, configure publish targets, validate end-to-end release pipeline.';
			if (isDb) return 'Update connection strings and ORM configuration, validate data access layer against migrated schema, fix any compatibility issues.';
			return 'Update application configuration for the target environment, validate Sitecore functionality, resolve any custom code compatibility issues.';
		}

		if (r.includes('qa') || r.includes('test')) {
			if (isDb) return 'Validate data completeness and integrity via regression queries, verify application behaviour against migrated data set.';
			if (isNetworking) return 'Validate SSL certificate chain and expiry, confirm DNS propagation, run end-to-end connectivity and redirect tests.';
			if (isMonitoring) return 'Verify alert firing and routing, confirm dashboards reflect accurate metrics, execute synthetic monitoring tests.';
			if (isCicd) return 'Validate pipeline stages and approval gates, run integration tests in the new environment, document pass/fail criteria.';
			return 'Execute smoke tests and regression suite, validate functional requirements against acceptance criteria, document sign-off status.';
		}

		if (r.includes('project') || r === 'pm' || r.includes('manager')) {
			return 'Coordinate cross-team dependencies and sequencing, track progress against milestones, communicate status to stakeholders, update the risk log.';
		}

		return 'Execute assigned tasks, collaborate with other roles on blockers, and validate completion against acceptance criteria.';
	}

	async function setAllTools(enabled: boolean) {
		const all: Record<string, boolean> = {};
		aiTools.forEach((t: any) => all[t.id] = enabled);
		aiToggles = all;
		await fetch(`/api/assessments/${page.params.id}/ai-selections`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ selections: all })
		});
	}

	function statusBadgeClass(status: string): string {
		if (status === 'added') return 'bg-success-light text-success border-success';
		if (status === 'removed') return 'bg-danger-light text-danger border-danger';
		if (status === 'modified') return 'bg-warning-light text-warning border-warning';
		return 'bg-border-light text-text-muted border-border-light';
	}
</script>

<svelte:head>
	<title>{data.assessment.project_name} — Estimate</title>
</svelte:head>

<div class="p-6 space-y-6 animate-enter">
	<div class="flex items-center justify-between">
		<div>
			<div class="flex items-center gap-2">
				<h1 class="text-xl font-extrabold uppercase tracking-wider">Estimate</h1>
				<Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
				<button onclick={() => drawerSection = 'page'} class="flex items-center justify-center w-5 h-5 text-text-muted hover:text-primary transition-colors" aria-label="About this page">
					<span class="text-[10px] font-mono opacity-60">(i)</span>
				</button>
			</div>
			<p class="text-sm font-bold text-text-secondary mt-0.5">
				Phase and component breakdown
			</p>
		</div>
		{#if estimate && estimateVersions.length > 0}
			<VersionSwitcher versions={estimateVersions} currentVersion={estimate.version} />
		{/if}
	</div>

	{#if isCompareMode && comparison}
		<VersionComparisonBanner fromVersion={comparison.from_version} toVersion={comparison.to_version} />
	{/if}

	{#if !estimate}
		<Card>
			<div class="py-8 text-center">
				<p class="text-lg font-extrabold uppercase tracking-wider text-text-secondary">No Estimate Data</p>
				<p class="mt-2 text-sm text-text-muted max-w-md mx-auto">
					Run <code class="brutal-border-thin bg-surface px-1.5 py-0.5 text-xs font-mono">/migrate estimate</code> to generate.
				</p>
			</div>
		</Card>
	{:else if isCompareMode && comparison}
		<!-- ═══════════════════ COMPARE MODE ═══════════════════ -->

		<!-- Summary Delta Cards -->
		<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
			<Card>
				<div class="space-y-1">
					<span class="text-[10px] font-extrabold uppercase tracking-wider text-text-muted block">Total Hours</span>
					<div class="flex items-center gap-2">
						<span class="text-lg font-extrabold font-mono">{Math.round(comparison.summary.total_expected_hours.to)}h</span>
						<DeltaBadge delta={comparison.summary.total_expected_hours.delta} format="hours" />
					</div>
					<span class="text-[10px] text-text-muted font-mono">from {Math.round(comparison.summary.total_expected_hours.from)}h</span>
				</div>
			</Card>
			<Card>
				<div class="space-y-1">
					<span class="text-[10px] font-extrabold uppercase tracking-wider text-text-muted block">Gotcha Hours</span>
					<div class="flex items-center gap-2">
						<span class="text-lg font-extrabold font-mono">{Math.round(comparison.summary.total_gotcha_hours.to)}h</span>
						<DeltaBadge delta={comparison.summary.total_gotcha_hours.delta} format="hours" />
					</div>
					<span class="text-[10px] text-text-muted font-mono">from {Math.round(comparison.summary.total_gotcha_hours.from)}h</span>
				</div>
			</Card>
			<Card>
				<div class="space-y-1">
					<span class="text-[10px] font-extrabold uppercase tracking-wider text-text-muted block">Confidence</span>
					<div class="flex items-center gap-2">
						<span class="text-lg font-extrabold font-mono">{Math.round(comparison.summary.confidence_score.to)}%</span>
						<DeltaBadge delta={comparison.summary.confidence_score.delta} format="percent" invertColor={false} />
					</div>
					<span class="text-[10px] text-text-muted font-mono">from {Math.round(comparison.summary.confidence_score.from)}%</span>
				</div>
			</Card>
			<Card>
				<div class="space-y-1">
					<span class="text-[10px] font-extrabold uppercase tracking-wider text-text-muted block">Assumption Widening</span>
					<div class="flex items-center gap-2">
						<span class="text-lg font-extrabold font-mono">{Math.round(comparison.summary.assumption_widening_hours.to)}h</span>
						<DeltaBadge delta={comparison.summary.assumption_widening_hours.delta} format="hours" />
					</div>
					<span class="text-[10px] text-text-muted font-mono">from {Math.round(comparison.summary.assumption_widening_hours.from)}h</span>
				</div>
			</Card>
		</div>

		<!-- Comparison Tabs -->
		<Tabs {tabs} active={activeTab} onchange={(id) => activeTab = id}>
			{#if activeTab === 'phases'}
				<div class="space-y-3">
					{#each comparison.phases as phaseDiff}
						<CollapsibleSection
							title={phaseDiff.name}
							subtitle="{Math.round(phaseDiff.total_hours.to)}h"
							open={true}
							badge={phaseDiff.status === 'added' ? 'NEW' : phaseDiff.status === 'removed' ? 'REMOVED' : `${phaseDiff.components.length} components`}
							badgeVariant={phaseDiff.status === 'added' ? 'success' : phaseDiff.status === 'removed' ? 'danger' : 'default'}
						>
							{#if phaseDiff.total_hours.delta !== 0}
								<div class="mb-4 flex items-center gap-2 text-xs">
									<span class="text-text-muted font-bold uppercase">v{comparison.from_version}:</span>
									<span class="font-mono font-bold">{Math.round(phaseDiff.total_hours.from)}h</span>
									<span class="text-text-muted">&rarr;</span>
									<span class="font-mono font-bold">{Math.round(phaseDiff.total_hours.to)}h</span>
									<DeltaBadge delta={phaseDiff.total_hours.delta} format="hours" />
								</div>
							{/if}

							<div class="overflow-x-auto -mx-4">
								<table class="w-full text-sm">
									<thead>
										<tr class="bg-[#1a1a1a] text-white text-xs font-extrabold uppercase tracking-wider">
											<th class="text-left px-4 py-2.5">Component</th>
											<th class="text-center px-4 py-2.5 w-24">Status</th>
											<th class="text-right px-4 py-2.5 w-24">v{comparison.from_version}</th>
											<th class="text-right px-4 py-2.5 w-24">v{comparison.to_version}</th>
											<th class="text-right px-4 py-2.5 w-24">Delta</th>
											<th class="text-center px-4 py-2.5 w-16"></th>
										</tr>
									</thead>
									<tbody>
										{#each phaseDiff.components as comp}
											{@const expanded = expandedComponents[comp.id]}
											<tr
												class="border-b border-border-light hover:bg-surface-hover transition-colors duration-100 cursor-pointer select-none
													{expanded ? 'bg-surface-hover' : ''}
													{comp.status === 'removed' ? 'opacity-60' : ''}"
												onclick={() => expandedComponents[comp.id] = !expanded}
												aria-expanded={expanded}
												aria-label="Toggle details for {comp.name}"
											>
												<td class="px-4 py-2.5 font-bold {comp.status === 'removed' ? 'line-through' : ''}">
													{comp.name}
												</td>
												<td class="px-4 py-2.5 text-center">
													{#if comp.status !== 'unchanged'}
														<span class="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold uppercase border {statusBadgeClass(comp.status)}">
															{comp.status === 'added' ? 'NEW' : comp.status === 'removed' ? 'REMOVED' : 'CHANGED'}
														</span>
													{/if}
												</td>
												<td class="px-4 py-2.5 text-right font-mono text-text-muted">{Math.round(comp.final_hours.from)}h</td>
												<td class="px-4 py-2.5 text-right font-mono font-bold">{Math.round(comp.final_hours.to)}h</td>
												<td class="px-4 py-2.5 text-right">
													<DeltaBadge delta={comp.final_hours.delta} format="hours" />
												</td>
												<td class="px-4 py-2.5 text-center">
													<span class="inline-block text-xs text-text-muted transition-transform duration-200 {expanded ? 'rotate-90' : ''}" aria-hidden="true">&#9654;</span>
												</td>
											</tr>
											{#if expanded}
												{@const cd = comp as ComponentDiff}
												<tr>
													<td colspan="6" class="px-4 py-4 bg-bg border-b border-border-light">
														<div class="grid gap-4 sm:grid-cols-2">
															<!-- Per-field deltas -->
															<div>
																<h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-2">Hour Deltas</h4>
																<div class="space-y-1.5 text-xs font-mono">
																	<div class="flex justify-between items-center">
																		<span class="text-text-muted">Base hours</span>
																		<div class="flex items-center gap-2">
																			<span>{Math.round(cd.base_hours.from)} &rarr; {Math.round(cd.base_hours.to)}</span>
																			<DeltaBadge delta={cd.base_hours.delta} format="hours" />
																		</div>
																	</div>
																	<div class="flex justify-between items-center">
																		<span class="text-text-muted">Final hours</span>
																		<div class="flex items-center gap-2">
																			<span>{Math.round(cd.final_hours.from)} &rarr; {Math.round(cd.final_hours.to)}</span>
																			<DeltaBadge delta={cd.final_hours.delta} format="hours" />
																		</div>
																	</div>
																	{#if cd.gotcha_hours.from > 0 || cd.gotcha_hours.to > 0}
																		<div class="flex justify-between items-center text-warning">
																			<span>Gotcha hours</span>
																			<div class="flex items-center gap-2">
																				<span>{Math.round(cd.gotcha_hours.from)} &rarr; {Math.round(cd.gotcha_hours.to)}</span>
																				<DeltaBadge delta={cd.gotcha_hours.delta} format="hours" />
																			</div>
																		</div>
																	{/if}
																	{#if cd.assumption_dependent_hours.from > 0 || cd.assumption_dependent_hours.to > 0}
																		<div class="flex justify-between items-center text-danger">
																			<span>Assumption-dependent</span>
																			<div class="flex items-center gap-2">
																				<span>{Math.round(cd.assumption_dependent_hours.from)} &rarr; {Math.round(cd.assumption_dependent_hours.to)}</span>
																				<DeltaBadge delta={cd.assumption_dependent_hours.delta} format="hours" />
																			</div>
																		</div>
																	{/if}
																	{#if cd.hours.without_ai}
																		<div class="mt-2 pt-2 border-t border-border-light">
																			<span class="text-text-muted text-[10px] uppercase">Manual (opt/exp/pess)</span>
																			<div class="flex justify-between">
																				<span class="text-text-muted">v{comparison.from_version}</span>
																				<span>{Math.round(cd.hours.without_ai.optimistic.from)} / {Math.round(cd.hours.without_ai.expected.from)} / {Math.round(cd.hours.without_ai.pessimistic.from)}</span>
																			</div>
																			<div class="flex justify-between">
																				<span class="text-text-muted">v{comparison.to_version}</span>
																				<span>{Math.round(cd.hours.without_ai.optimistic.to)} / {Math.round(cd.hours.without_ai.expected.to)} / {Math.round(cd.hours.without_ai.pessimistic.to)}</span>
																			</div>
																		</div>
																	{/if}
																</div>
															</div>

															<!-- Multiplier & assumption diffs -->
															<div class="space-y-3">
																{#if cd.multipliers.added.length > 0 || cd.multipliers.removed.length > 0}
																	<div>
																		<h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-2">Multipliers</h4>
																		<div class="flex flex-wrap gap-1">
																			{#each cd.multipliers.added as m}
																				<span class="inline-flex items-center px-2 py-0.5 text-xs font-bold bg-success-light text-success border border-success">+ {m}</span>
																			{/each}
																			{#each cd.multipliers.removed as m}
																				<span class="inline-flex items-center px-2 py-0.5 text-xs font-bold bg-danger-light text-danger border border-danger line-through">- {m}</span>
																			{/each}
																			{#each cd.multipliers.unchanged as m}
																				<span class="inline-flex items-center px-2 py-0.5 text-xs font-bold bg-border-light text-text-muted border border-border-light">{m}</span>
																			{/each}
																		</div>
																	</div>
																{/if}
																{#if cd.assumptions.added.length > 0 || cd.assumptions.removed.length > 0}
																	<div>
																		<h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-2">Assumptions</h4>
																		<div class="flex flex-wrap gap-1">
																			{#each cd.assumptions.added as a}
																				<span class="inline-flex items-center px-2 py-0.5 text-xs font-mono bg-success-light text-success border border-success">+ {a}</span>
																			{/each}
																			{#each cd.assumptions.removed as a}
																				<span class="inline-flex items-center px-2 py-0.5 text-xs font-mono bg-danger-light text-danger border border-danger line-through">- {a}</span>
																			{/each}
																			{#each cd.assumptions.unchanged as a}
																				<span class="inline-flex items-center px-2 py-0.5 text-xs font-mono bg-border-light text-text-muted border border-border-light">{a}</span>
																			{/each}
																		</div>
																	</div>
																{/if}
																{#if Object.keys(cd.roles).length > 0 && Object.values(cd.roles).some(r => r.delta !== 0)}
																	<div>
																		<h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-2">Roles</h4>
																		<div class="space-y-1 text-xs">
																			{#each Object.entries(cd.roles).filter(([, r]) => r.delta !== 0) as [role, rd]}
																				<div class="flex justify-between items-center">
																					<span class="text-text-secondary">{formatRole(role)}</span>
																					<div class="flex items-center gap-2">
																						<span class="font-mono">{Math.round(rd.from)} &rarr; {Math.round(rd.to)}</span>
																						<DeltaBadge delta={rd.delta} format="hours" />
																					</div>
																				</div>
																			{/each}
																		</div>
																	</div>
																{/if}
															</div>
														</div>
													</td>
												</tr>
											{/if}
										{/each}
									</tbody>
									<tfoot>
										<tr class="border-t-3 border-brutal font-extrabold">
											<td class="px-4 py-2.5 uppercase text-xs tracking-wider">Phase Total</td>
											<td class="px-4 py-2.5"></td>
											<td class="px-4 py-2.5 text-right font-mono text-text-muted">{Math.round(phaseDiff.total_hours.from)}h</td>
											<td class="px-4 py-2.5 text-right font-mono">{Math.round(phaseDiff.total_hours.to)}h</td>
											<td class="px-4 py-2.5 text-right">
												<DeltaBadge delta={phaseDiff.total_hours.delta} format="hours" />
											</td>
											<td class="px-4 py-2.5"></td>
										</tr>
									</tfoot>
								</table>
							</div>
						</CollapsibleSection>
					{/each}

					<Card padding="p-4">
						<div class="flex items-center justify-between">
							<span class="text-sm font-extrabold uppercase tracking-wider">Grand Total</span>
							<div class="flex items-center gap-3">
								<span class="text-text-muted font-mono">{Math.round(comparison.summary.total_expected_hours.from)}h</span>
								<span class="text-text-muted">&rarr;</span>
								<span class="text-2xl font-extrabold font-mono">{Math.round(comparison.summary.total_expected_hours.to)}h</span>
								<DeltaBadge delta={comparison.summary.total_expected_hours.delta} format="hours" />
							</div>
						</div>
					</Card>
				</div>

			{:else if activeTab === 'ai-tools'}
				<Card>
					<div class="py-4 text-center text-sm text-text-muted">
						AI tool selections are separate from estimate snapshots. Switch to normal view to manage tools.
					</div>
				</Card>

			{:else if activeTab === 'roles'}
				<Card>
					<h3 class="text-xs font-extrabold uppercase tracking-wider mb-4 pb-2 border-b-3 border-primary text-primary">
						Hours by Role — Comparison
					</h3>
					{@const maxRoleHours = Math.max(...comparison.roles.map(r => Math.max(r.delta.from, r.delta.to)), 1)}
					<div class="space-y-4">
						{#each comparison.roles as { role, delta: rd }}
							<div>
								<div class="flex items-center justify-between mb-1">
									<span class="text-sm font-bold">{formatRole(role)}</span>
									<div class="flex items-center gap-2">
										<span class="text-xs font-mono text-text-muted">{Math.round(rd.from)}h</span>
										<span class="text-xs text-text-muted">&rarr;</span>
										<span class="text-sm font-mono font-bold">{Math.round(rd.to)}h</span>
										<DeltaBadge delta={rd.delta} format="hours" />
									</div>
								</div>
								<div class="relative h-4 w-full bg-border-light border border-brutal">
									<div
										class="absolute top-0 left-0 h-full bg-text-muted/30 transition-all duration-300"
										style="width: {(rd.from / maxRoleHours) * 100}%"
									></div>
									<div
										class="absolute top-0 left-0 h-full bg-primary transition-all duration-300"
										style="width: {(rd.to / maxRoleHours) * 100}%"
									></div>
								</div>
							</div>
						{/each}
					</div>
					<div class="mt-4 pt-3 border-t-2 border-brutal flex justify-between items-center">
						<span class="text-xs font-extrabold uppercase tracking-wider text-text-muted">Total</span>
						<div class="flex items-center gap-2">
							<span class="text-sm font-mono text-text-muted">{Math.round(comparison.summary.total_expected_hours.from)}h</span>
							<span class="text-xs text-text-muted">&rarr;</span>
							<span class="text-lg font-extrabold font-mono">{Math.round(comparison.summary.total_expected_hours.to)}h</span>
							<DeltaBadge delta={comparison.summary.total_expected_hours.delta} format="hours" />
						</div>
					</div>
				</Card>
			{/if}
		</Tabs>

	{:else}
		<!-- ═══════════════════ NORMAL MODE ═══════════════════ -->

		<!-- Scenario Selector -->
		<ScenarioSelector {scenario} onchange={(s) => scenario = s} totals={scenarioTotals} />

		<!-- Summary Bar -->
		<div class="brutal-border bg-surface px-5 py-3 flex items-center gap-6 flex-wrap">
			<Tooltip text="Sum of all component hours for the active scenario, after multipliers and AI savings." position="bottom">
				<div class="flex items-baseline gap-1.5 cursor-help">
					<span class="text-2xl font-extrabold font-mono tracking-tight">{Math.round(totalHours).toLocaleString()}h</span>
					<span class="text-xs font-bold uppercase tracking-wider text-text-muted">{phases.length} phases</span>
				</div>
			</Tooltip>

			<span class="w-px h-6 bg-border-light hidden sm:block" aria-hidden="true"></span>

			{#if savings > 0}
				<Tooltip text="Hours reduced by enabled AI tools vs. manual baseline. Capped at 50% per component." position="bottom">
					<div class="flex items-baseline gap-1.5 cursor-help">
						<span class="text-sm font-extrabold font-mono text-success">-{Math.round(savings)}h</span>
						<span class="text-xs text-text-muted">AI savings ({savingsPercent}%)</span>
					</div>
				</Tooltip>

				<span class="w-px h-6 bg-border-light hidden sm:block" aria-hidden="true"></span>
			{/if}

			<Tooltip text="Based on confirmed vs. assumed answers. Higher = more reliable estimate." position="bottom">
				<div class="flex items-center gap-2 cursor-help">
					<span class="text-sm font-extrabold font-mono">{estimate.confidence_score}%</span>
					<div class="w-20 h-1.5 bg-border-light border border-brutal">
						<div
							class="h-full transition-all duration-300
								{estimate.confidence_score >= 70 ? 'bg-success' : estimate.confidence_score >= 40 ? 'bg-warning' : 'bg-danger'}"
							style="width: {estimate.confidence_score}%"
						></div>
					</div>
					<span class="text-xs text-text-muted">confidence</span>
				</div>
			</Tooltip>

			<span class="w-px h-6 bg-border-light hidden sm:block" aria-hidden="true"></span>

			<Tooltip text="Unconfirmed inputs. Each unvalidated assumption adds widening hours." position="bottom">
				<div class="flex items-baseline gap-1.5 cursor-help">
					<span class="text-sm font-extrabold font-mono">{assumptions.length}</span>
					<span class="text-xs text-text-muted">assumptions</span>
					<span class="text-[10px] font-mono text-success">({assumptions.filter((a: any) => a.validation_status === 'validated').length} validated)</span>
				</div>
			</Tooltip>
		</div>

		<!-- Main Content Tabs -->
		<Tabs {tabs} active={activeTab} onchange={(id) => activeTab = id}>
			{#if activeTab === 'phases'}
				<div class="space-y-3">
					{#each phases as phase, phaseIdx}
						{@const phaseHrs = getPhaseHours(phase, scenario, aiToggles, profData)}
						{@const phaseManual = (phase.components ?? []).reduce((s: number, c: any) => {
							const h = c.hours as any;
							return s + (h?.without_ai?.expected ?? c.final_hours ?? 0);
						}, 0)}
						{@const phaseSavings = phaseManual - phaseHrs}
						<CollapsibleSection
							title={phase.name}
							subtitle="{Math.round(phaseHrs)}h"
							open={phaseIdx === 0}
							badge="{(phase.components ?? []).length} components"
						>
							{#if phaseSavings > 0}
								<div class="mb-4 flex items-center gap-2 text-xs">
									<span class="text-text-muted font-bold uppercase">Manual:</span>
									<span class="font-mono font-bold">{Math.round(phaseManual)}h</span>
									<span class="text-success font-bold">-{Math.round(phaseSavings)}h AI savings</span>
								</div>
							{/if}

							<div class="overflow-x-auto -mx-4">
								<table class="w-full text-sm">
									<thead>
										<tr class="bg-[#1a1a1a] text-white text-xs font-extrabold uppercase tracking-wider">
											<th class="text-left px-4 py-2.5">Component</th>
											<th class="text-right px-4 py-2.5 w-20">Units</th>
											<th class="text-right px-4 py-2.5 w-24">Base</th>
											<th class="text-right px-4 py-2.5 w-24">Effective</th>
											<th class="text-right px-4 py-2.5 w-20">AI</th>
											<th class="text-center px-4 py-2.5 w-16"></th>
										</tr>
									</thead>
									<tbody>
										{#each (phase.components ?? []) as comp}
											{@const effectiveHours = getComponentHours(comp, scenario, aiToggles, profData)}
											{@const compTools = getToolsForComponent(comp)}
											{@const hasAi = compTools.length > 0}
											{@const expanded = expandedComponents[comp.id]}
											<tr
												class="border-b border-border-light hover:bg-surface-hover transition-colors duration-100 cursor-pointer select-none {expanded ? 'bg-surface-hover' : ''}"
												onclick={() => expandedComponents[comp.id] = !expanded}
												aria-expanded={expanded}
												aria-label="Toggle details for {comp.name}"
											>
												<td class="px-4 py-2.5 font-bold">{comp.name}</td>
												<td class="px-4 py-2.5 text-right font-mono">{comp.units ?? 1}</td>
												<td class="px-4 py-2.5 text-right font-mono">{comp.base_hours ?? 0}h</td>
												<td class="px-4 py-2.5 text-right font-mono font-bold {effectiveHours < (comp.base_hours ?? 0) ? 'text-success' : ''}">
													{Math.round(effectiveHours)}h
												</td>
												<td class="px-4 py-2.5 text-right">
													{#if hasAi}
														<span class="inline-flex items-center px-1.5 py-0.5 text-xs font-bold bg-success-light text-success border border-success">
															{compTools.filter(t => aiToggles[t.id] !== false).length}/{compTools.length}
														</span>
													{:else}
														<span class="text-text-muted text-xs">--</span>
													{/if}
												</td>
												<td class="px-4 py-2.5 text-center">
													<span class="inline-block text-xs text-text-muted transition-transform duration-200 {expanded ? 'rotate-90' : ''}" aria-hidden="true">&#9654;</span>
												</td>
											</tr>
											{#if expanded}
												{@const compHours = comp.hours as any}
												{@const linkedAssumptions = (comp.assumptions_affecting ?? []) as string[]}
												{@const validatedCount = linkedAssumptions.filter(id => assumptions.find((a: any) => a.id === id)?.validation_status === 'validated').length}
												{@const multipliers = (comp.multipliers_applied ?? []) as any[]}
												{@const roles = Object.entries(comp.by_role ?? {}) as [string, number][]}
												{@const maxRoleH = Math.max(...roles.map(([,h]) => h), 1)}
												<tr>
													<td colspan="6" class="px-4 py-4 bg-bg border-b border-border-light">
														<!-- ── Metric cards ──────────────────────── -->
														<div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
															<div class="bg-surface brutal-border-thin px-3 py-2">
																<span class="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Manual</span>
																<span class="text-sm font-extrabold font-mono">{compHours?.without_ai?.expected ?? comp.base_hours ?? '-'}h</span>
																{#if compHours?.without_ai}
																	<span class="text-[10px] font-mono text-text-faint block">{compHours.without_ai.optimistic} – {compHours.without_ai.pessimistic}</span>
																{/if}
															</div>
															<div class="bg-surface brutal-border-thin px-3 py-2">
																<span class="text-[10px] font-bold uppercase tracking-wider text-text-muted block">AI-Assisted</span>
																<span class="text-sm font-extrabold font-mono text-success">{compHours?.with_ai?.expected ?? '-'}h</span>
																{#if compHours?.with_ai}
																	<span class="text-[10px] font-mono text-text-faint block">{compHours.with_ai.optimistic} – {compHours.with_ai.pessimistic}</span>
																{/if}
															</div>
															{#if comp.gotcha_hours > 0}
																<div class="bg-surface brutal-border-thin px-3 py-2">
																	<span class="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Gotcha</span>
																	<span class="text-sm font-extrabold font-mono text-warning">+{comp.gotcha_hours}h</span>
																	<span class="text-[10px] text-text-faint block">known pitfalls</span>
																</div>
															{/if}
															{#if comp.assumption_dependent_hours > 0}
																<div class="bg-surface brutal-border-thin px-3 py-2">
																	<span class="text-[10px] font-bold uppercase tracking-wider text-text-muted block">At Risk</span>
																	<span class="text-sm font-extrabold font-mono text-danger">{comp.assumption_dependent_hours}h</span>
																	<span class="text-[10px] text-text-faint block">assumption-dep.</span>
																</div>
															{/if}
														</div>

														<!-- ── Compact metadata strip ───────────── -->
														<div class="flex flex-wrap items-start gap-x-6 gap-y-3 text-xs">
															<!-- Multipliers -->
															{#if multipliers.length > 0}
																<div>
																	<span class="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">Multipliers</span>
																	<div class="flex flex-wrap gap-1">
																		{#each multipliers as mult}
																			{@const name = typeof mult === 'string' ? mult : (mult.name ?? mult.id ?? '')}
																			{@const factor = typeof mult === 'object' ? mult.factor : null}
																			{@const shortName = name.length > 30 ? name.split(/\s/).slice(0, 3).join(' ') + '...' : name}
																			<Tooltip text={name} position="top">
																				<span class="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold bg-warning-light text-warning border border-warning cursor-help">
																					{shortName}{#if factor}&nbsp;&times;{factor}{/if}
																				</span>
																			</Tooltip>
																		{/each}
																	</div>
																</div>
															{/if}

															<!-- Linked Assumptions -->
															{#if linkedAssumptions.length > 0}
																<div>
																	<span class="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">Assumptions</span>
																	<a href="/assessments/{data.assessment.id}/analysis?tab=assumptions" class="inline-flex items-center gap-1.5 px-2 py-0.5 font-bold border no-underline hover:opacity-80 transition-opacity
																		{validatedCount === linkedAssumptions.length
																			? 'bg-success-light text-success border-success'
																			: 'bg-warning-light text-warning border-warning'}">
																		{linkedAssumptions.length} linked
																		<span class="text-[10px] font-normal">({validatedCount} validated)</span>
																	</a>
																</div>
															{/if}
														</div>

														<!-- ── Effort by Role (full width) ──────── -->
														{#if roles.length > 0}
															<div class="mt-3">
																<span class="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">Effort by Role</span>
																<div class="space-y-2">
																	{#each roles.sort((a, b) => b[1] - a[1]) as [role, hours]}
																		<div>
																			<div class="flex items-center gap-2">
																				<span class="text-[11px] font-bold w-[140px] shrink-0 truncate">{formatRole(role)}</span>
																				<div class="flex-1 h-[6px] bg-border-light">
																					<div class="h-full bg-primary transition-all duration-300" style="width: {(hours / maxRoleH) * 100}%"></div>
																				</div>
																				<span class="text-[11px] font-mono font-bold w-10 shrink-0 text-right">{hours}h</span>
																			</div>
																			<p class="text-[10px] text-text-muted leading-snug mt-0.5 ml-[148px]">{getRoleDescription(role, comp.id ?? '', comp.name ?? '')}</p>
																		</div>
																	{/each}
																</div>
															</div>
														{/if}

														<!-- ── AI Acceleration (full width) ──────── -->
														{#if compTools.length > 0}
															{@const enabledTools = compTools.filter(t => aiToggles[t.id] !== false)}
															{@const totalSavings = enabledTools.reduce((s, t) => s + (t.hours_saved?.expected ?? 0), 0)}
															<div class="mt-3">
																<div class="flex items-center justify-between mb-1.5">
																	<span class="text-[10px] font-bold uppercase tracking-wider text-text-muted">AI Acceleration</span>
																	{#if totalSavings > 0}
																		<span class="text-[10px] font-mono font-bold text-success">-{totalSavings}h with {enabledTools.length} tool{enabledTools.length !== 1 ? 's' : ''}</span>
																	{:else}
																		<span class="text-[10px] font-mono text-text-faint">no tools enabled</span>
																	{/if}
																</div>
																<div class="grid gap-px bg-border-light brutal-border-thin overflow-hidden">
																	{#each compTools as tool}
																		{@const isEnabled = aiToggles[tool.id] !== false}
																		<div class="px-3 py-2 bg-surface {isEnabled ? '' : 'opacity-50'}">
																			<div class="flex items-center justify-between gap-3">
																				<div class="flex items-center gap-2 min-w-0">
																					<span class="text-xs font-bold">{tool.name}</span>
																					{#if tool.vendor}
																						<span class="text-[10px] text-text-faint">{tool.vendor}</span>
																					{/if}
																				</div>
																				<div class="flex items-center gap-2 shrink-0">
																					<span class="text-[10px] font-mono font-bold {isEnabled ? 'text-success' : 'text-text-faint'}">-{tool.hours_saved?.expected ?? 0}h</span>
																					{#if tool.cost}
																						<span class="text-[10px] px-1 py-px border border-border-light text-text-muted">{tool.cost.type === 'free' ? 'Free' : tool.cost.type}</span>
																					{/if}
																				</div>
																			</div>
																			{#if tool.description}
																				<p class="text-[10px] text-text-muted leading-snug mt-1">{tool.description}</p>
																			{/if}
																		</div>
																	{/each}
																</div>
															</div>
														{/if}
													</td>
												</tr>
											{/if}
										{/each}
									</tbody>
									<tfoot>
										<tr class="border-t-3 border-brutal font-extrabold">
											<td class="px-4 py-2.5 uppercase text-xs tracking-wider">Phase Total</td>
											<td class="px-4 py-2.5"></td>
											<td class="px-4 py-2.5 text-right font-mono">{Math.round(phaseManual)}h</td>
											<td class="px-4 py-2.5 text-right font-mono {phaseSavings > 0 ? 'text-success' : ''}">{Math.round(phaseHrs)}h</td>
											<td class="px-4 py-2.5"></td>
											<td class="px-4 py-2.5"></td>
										</tr>
									</tfoot>
								</table>
							</div>
						</CollapsibleSection>
					{/each}

					<Card padding="p-4">
						<div class="flex items-center justify-between">
							<span class="text-sm font-extrabold uppercase tracking-wider">Grand Total</span>
							<div class="text-right">
								<span class="text-2xl font-extrabold font-mono">{Math.round(totalHours).toLocaleString()}h</span>
								{#if savings > 0}
									<span class="block text-xs text-success font-bold">-{Math.round(savings)}h ({savingsPercent}%) with AI</span>
								{/if}
							</div>
						</div>
					</Card>
				</div>

			{:else if activeTab === 'ai-tools'}
				<div class="space-y-4">
					<div class="flex items-center gap-3">
						<button
							class="px-3 py-1.5 text-xs font-bold uppercase border-2 border-brutal bg-success-light text-success
								hover:bg-success hover:text-white transition-colors duration-150
								focus-visible:outline-2 focus-visible:outline-primary"
							onclick={() => setAllTools(true)}
						>Enable All</button>
						<button
							class="px-3 py-1.5 text-xs font-bold uppercase border-2 border-brutal bg-danger-light text-danger
								hover:bg-danger hover:text-white transition-colors duration-150
								focus-visible:outline-2 focus-visible:outline-primary"
							onclick={() => setAllTools(false)}
						>Disable All</button>
						<span class="text-xs text-text-muted font-mono ml-auto">
							{Object.values(aiToggles).filter(Boolean).length}/{aiTools.length} enabled
						</span>
					</div>

					{#if profData}
						<div class="brutal-border-thin bg-bg p-3">
							<p class="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">AI Adoption Overhead</p>
							<p class="text-xs text-text-secondary mb-3">Tool savings are adjusted based on your team's technology proficiency. Tools where adoption cost exceeds savings show a warning.</p>
							<div class="space-y-1.5">
								{#each aiTools as tool}
									{@const overhead = getToolAdoptionOverhead(tool.id, profData)}
									{@const grossSavings = tool.hours_saved?.expected ?? 0}
									{@const netSavings = Math.max(grossSavings - overhead, 0)}
									{@const overheadExceedsSavings = overhead >= grossSavings && grossSavings > 0}
									<div class="flex items-center justify-between text-xs {overheadExceedsSavings ? 'text-warning' : ''}">
										<span class="font-mono">{tool.name}</span>
										<span class="font-mono">
											{#if overhead > 0}
												<span class="text-text-muted">Saves {grossSavings}h</span>
												<span class="text-danger"> -{overhead}h adoption</span>
												<span class="font-bold"> = net {netSavings}h</span>
												{#if overheadExceedsSavings}
													<span class="ml-1 px-1 py-0.5 text-[10px] font-bold bg-warning-light text-warning border border-warning">LOW ROI</span>
												{/if}
											{:else}
												<span class="text-success">{grossSavings}h savings</span>
											{/if}
										</span>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<AiToolToggles
						tools={aiTools}
						toggles={aiToggles}
						ontoggle={toggleAiTool}
						mode="full"
					/>
				</div>

			{:else if activeTab === 'roles'}
				<Card>
					<button class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider mb-4 pb-2 border-b-3 border-primary text-primary w-full text-left cursor-pointer hover:opacity-80 transition-opacity" onclick={() => drawerSection = 'roles'}>
					Hours by Role
					<span class="text-[10px] font-mono opacity-60">(i)</span>
				</button>
					{@const roles = roleBreakdown()}
					{@const maxRoleHours = Math.max(...Object.values(roles), 1)}
					<div class="space-y-3">
						{#each Object.entries(roles).sort((a, b) => b[1] - a[1]) as [role, hours]}
							<div>
								<div class="flex items-center justify-between mb-1">
									<span class="text-sm font-bold">{formatRole(role)}</span>
									<span class="text-sm font-mono font-bold">{Math.round(hours)}h</span>
								</div>
								<div class="h-4 w-full bg-border-light border border-brutal">
									<div
										class="h-full bg-primary transition-all duration-300"
										style="width: {(hours / maxRoleHours) * 100}%"
									></div>
								</div>
							</div>
						{/each}
					</div>
					<div class="mt-4 pt-3 border-t-2 border-brutal flex justify-between items-center">
						<span class="text-xs font-extrabold uppercase tracking-wider text-text-muted">Total</span>
						<span class="text-lg font-extrabold font-mono">{Math.round(Object.values(roles).reduce((a, b) => a + b, 0))}h</span>
					</div>
				</Card>
			{/if}
		</Tabs>
	{/if}
</div>

<InfoDrawer
	open={drawerSection !== null}
	onclose={() => drawerSection = null}
	title={drawerSection === 'page' ? 'About Estimate' : drawerSection === 'hours' ? 'Hours Breakdown' : drawerSection === 'roles' ? 'Hours by Role' : ''}
>
	{#if drawerSection === 'page'}
		<div class="space-y-4 text-sm">
			<p>The <strong>Estimate</strong> page shows the detailed effort breakdown for your migration, organized by phases and components.</p>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">How Hours Are Calculated</h3>
				<p class="text-text-secondary">Each component starts with base hours, which are then scaled by complexity multipliers. Gotcha pattern hours are added as buffers. AI tool savings are subtracted (capped at 50% per component).</p>
				<p class="text-text-secondary font-mono text-xs">effective = (base &times; multipliers) + gotcha - AI savings</p>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Three-Point Estimation</h3>
				<p class="text-text-secondary">Each component has optimistic, expected, and pessimistic values. The expected value is used for totals. Expand any component to see all three scenarios.</p>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Scenarios</h3>
				<div class="space-y-1 text-text-secondary">
					<p><strong>Manual</strong> — Full effort, no AI tooling</p>
					<p><strong>AI-Assisted</strong> — Hours reduced by enabled AI tools (default view)</p>
					<p><strong>Best Case</strong> — All AI tools at optimistic savings</p>
				</div>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Version History</h3>
				<p class="text-text-secondary">Each time <code class="brutal-border-thin bg-surface px-1 py-0.5 text-xs font-mono">/migrate estimate</code> runs, a new version is saved. Use the version switcher to browse past estimates or compare two versions side by side.</p>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Customization</h3>
				<p class="text-text-secondary">Toggle AI tools on/off in the AI Tools tab. Exclude components on the <a href="/assessments/{page.params.id}/refine" class="text-primary font-bold">Refine</a> page. Both update totals in real time.</p>
			</div>
		</div>
	{:else if drawerSection === 'hours'}
		<div class="space-y-4 text-sm">
			<p><strong>Hours Breakdown</strong> shows optimistic, expected, and pessimistic estimates for each component.</p>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Three-Point Estimate</h3>
				<ul class="list-disc list-inside space-y-1 text-text-secondary">
					<li><strong>Optimistic</strong> — Best case, everything goes smoothly</li>
					<li><strong>Expected</strong> — Most likely outcome, used for totals</li>
					<li><strong>Pessimistic</strong> — Worst case, includes assumption widening</li>
				</ul>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Special Hour Types</h3>
				<ul class="list-disc list-inside space-y-1 text-text-secondary">
					<li><strong class="text-warning">Gotcha hours</strong> — Additional effort from known pitfall patterns</li>
					<li><strong class="text-danger">Assumption-dependent</strong> — Hours that may change when assumptions are validated</li>
				</ul>
			</div>
		</div>
	{:else if drawerSection === 'roles'}
		<div class="space-y-4 text-sm">
			<p><strong>Hours by Role</strong> aggregates effort across all components by team role.</p>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">How Roles Are Assigned</h3>
				<p class="text-text-secondary">Each component breaks down its hours by role (e.g., developer, devops, QA, architect). This view sums those across all phases to help with team planning and staffing.</p>
			</div>
			<div class="space-y-2">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Usage</h3>
				<p class="text-text-secondary">Use this breakdown to estimate team composition, identify bottleneck roles, and plan parallel workstreams.</p>
			</div>
		</div>
	{/if}
</InfoDrawer>
