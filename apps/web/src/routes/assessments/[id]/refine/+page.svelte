<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import Card from '$lib/components/ui/Card.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import CollapsibleSection from '$lib/components/ui/CollapsibleSection.svelte';
	import ScenarioSelector from '$lib/components/ScenarioSelector.svelte';
	import Tooltip from '$lib/components/ui/Tooltip.svelte';
	import InfoDrawer from '$lib/components/ui/InfoDrawer.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { computeRefinedTotals, getComponentHours } from '$lib/utils/scenario-engine';
	import { computeScopeCascade } from '$lib/utils/scope-cascade';
	import { formatRole } from '$lib/utils/migration-stats';
	import Badge from '$lib/components/ui/Badge.svelte';
	import type { Scenario } from '$lib/utils/scenario-engine';

	let { data } = $props();

	const assessment = $derived(data.assessment);
	const estimate   = $derived(data.estimate as any);

	const statusBadge = $derived(
		assessment.status === 'complete'
			? { variant: 'success' as const, label: 'Finalized' }
			: estimate
			? { variant: 'default' as const, label: 'In Progress' }
			: { variant: 'muted'   as const, label: 'Not Started' }
	);
	const analysis   = $derived(data.analysis as any);
	const phases     = $derived((estimate?.phases ?? []) as any[]);
	const assumptions= $derived((analysis?.assumptions ?? []) as any[]);
	const risks      = $derived((analysis?.risks ?? []) as any[]);
	const aiTools    = $derived((data.aiAlternatives ?? []) as any[]);

	// ── Core scope state ──────────────────────────────────────────────────
	let aiToggles  = $state<Record<string, boolean>>({});
	let exclusions = $state<Record<string, boolean>>({});
	let reasons    = $state<Record<string, string>>({});
	let scenario   = $state<Scenario>('ai_assisted');

	// ── Role refinement state ─────────────────────────────────────────────
	// roleOverrides: compId → role → override hours (null = use base)
	let roleOverrides = $state<Record<string, Record<string, number>>>({});
	// roleTasks: compId → role → string[]
	let roleTasks = $state<Record<string, Record<string, string[]>>>({});

	$effect(() => {
		aiToggles  = { ...(data.aiSelections?.selections ?? {}) };
		exclusions = { ...(data.scopeExclusions?.exclusions ?? {}) };
		reasons    = { ...(data.scopeExclusions?.reasons   ?? {}) };
		roleOverrides = { ...(data.refinements?.roleOverrides ?? {}) };
		roleTasks     = { ...(data.refinements?.roleTasks ?? {}) };
	});
	// newTaskInputs: `${compId}__${role}` → current draft text
	let newTaskInputs = $state<Record<string, string>>({});

	// ── UI state ──────────────────────────────────────────────────────────
	let expandedComponents = $state<Record<string, boolean>>({});
	let filterTab   = $state<'all' | 'in_scope' | 'excluded'>('all');
	let searchQuery = $state('');
	let drawerSection = $state<'page' | 'cascade' | null>(null);

	// Finalize modal
	let finalizeModalOpen = $state(false);
	let finalizing        = $state(false);
	let finalizeError     = $state('');
	let finalizeSuccess   = $state(false);

	// ── Derived values ────────────────────────────────────────────────────
	const excludedSet = $derived(new Set(
		Object.entries(exclusions).filter(([, v]) => v).map(([k]) => k)
	));

	const allComponents = $derived(
		phases.flatMap((p: any) => (p.components ?? []).map((c: any) => c.id))
	);
	const inScopeCount = $derived(allComponents.length - excludedSet.size);

	const scenarioTotals = $derived(computeRefinedTotals(phases, aiToggles, excludedSet));
	const activeTotal = $derived(
		scenario === 'manual' ? scenarioTotals.manual
		: scenario === 'best_case' ? scenarioTotals.bestCase
		: scenarioTotals.aiAssisted
	);

	// Total override delta across all in-scope components
	const overrideDelta = $derived(() => {
		let delta = 0;
		for (const phase of phases) {
			for (const comp of (phase.components ?? []) as any[]) {
				if (excludedSet.has(comp.id)) continue;
				const byRole = comp.by_role as Record<string, number> | undefined;
				if (!byRole || !roleOverrides[comp.id]) continue;
				for (const [role, baseH] of Object.entries(byRole)) {
					const ov = roleOverrides[comp.id]?.[role];
					if (ov !== undefined) delta += ov - baseH;
				}
			}
		}
		return delta;
	});

	const hasAnyOverride = $derived(() => {
		return Object.values(roleOverrides).some(r => Object.keys(r).length > 0);
	});

	const cascade = $derived(computeScopeCascade(excludedSet, aiTools, assumptions, risks));

	const canFinalize = $derived(!!estimate);
	const finalizeWarnings = $derived(() => {
		const w: string[] = [];
		const unvalidated = assumptions.filter((a: any) => a.validation_status !== 'validated').length;
		const highRisks   = risks.filter((r: any) => r.severity === 'critical' || r.severity === 'high').length;
		if (unvalidated > 0) w.push(`${unvalidated} unvalidated assumption(s) will widen the estimate range`);
		if (highRisks > 0)   w.push(`${highRisks} high-severity risk(s) require active mitigation`);
		if (hasAnyOverride()) w.push('Hour overrides are applied — deliverables will reflect refined totals');
		return w;
	});

	// ── Default task generator ────────────────────────────────────────────
	function getDefaultTasks(role: string, compId: string, compName: string): string[] {
		const ctx = (compId + ' ' + compName).toLowerCase();
		const r   = role.toLowerCase().replace(/-/g, '_');
		const isDb      = /database|db|sql|mysql|postgres|mssql/.test(ctx);
		const isCompute = /compute|vm|server|ec2|container|app.?service/.test(ctx);
		const isNet     = /network|dns|ssl|tls|cdn|load.?balanc|firewall/.test(ctx);
		const isCicd    = /ci.?cd|pipeline|deploy|build|release/.test(ctx);
		const isSearch  = /search|solr|elastic/.test(ctx);
		const isCaching = /cach|redis|session/.test(ctx);
		const isStorage = /storage|blob|s3|file/.test(ctx);
		const isMon     = /monitor|log|alert|observ/.test(ctx);
		const isIdentity= /identity|auth|sso|oauth|oidc/.test(ctx);
		const isXconnect= /xconnect|xdb|analytic|tracker/.test(ctx);

		if (r.includes('infrastructure') || r === 'infra_eng') {
			if (isDb)      return ['Provision target database service', 'Configure VNet integration and NSGs', 'Set up automated backup policy', 'Validate connectivity from app tier'];
			if (isCompute) return ['Provision VMs with correct SKU and disk config', 'Configure auto-scaling and health probes', 'Set up load balancer rules', 'Validate internet egress and DNS resolution'];
			if (isNet)     return ['Configure DNS records and TTL reduction', 'Upload SSL certificates to Key Vault', 'Apply NSG and firewall rules', 'Validate end-to-end TLS chain'];
			if (isCicd)    return ['Provision build agent pool', 'Configure pipeline secret variables', 'Set up deployment environments', 'Test full pipeline run'];
			if (isSearch)  return ['Provision Solr cluster nodes', 'Configure ZooKeeper ensemble', 'Tune JVM heap and GC settings', 'Verify cross-node replication'];
			if (isCaching) return ['Provision Redis tier with HA config', 'Configure eviction and persistence', 'Enable TLS in-transit', 'Set connection pool limits'];
			if (isStorage) return ['Create storage account with correct redundancy', 'Configure lifecycle management rules', 'Set CORS and access policies', 'Validate read/write from app tier'];
			if (isMon)     return ['Deploy monitoring agents and collectors', 'Configure alert rules and thresholds', 'Set up notification channels', 'Build baseline dashboards'];
			return ['Provision required Azure resources', 'Configure networking and security boundaries', 'Validate service connectivity', 'Document final resource config'];
		}
		if (r === 'dba' || r.includes('database')) {
			if (isDb)      return ['Run schema compatibility assessment', 'Generate and validate migration scripts', 'Execute data migration with checksums', 'Verify row counts and referential integrity', 'Tune slow queries on target'];
			if (isXconnect)return ['Export xDB collections with counts', 'Validate analytics records completeness', 'Migrate custom schema extensions', 'Verify collection service on target'];
			return ['Assess data dependencies and schema', 'Convert schema to target dialect', 'Validate data integrity post-migration', 'Tune query performance on target'];
		}
		if (r.includes('sitecore') || r.includes('developer') || r.includes('dev')) {
			if (isIdentity) return ['Update Identity Server configuration', 'Reconfigure SSO provider settings', 'Validate token issuance and expiry', 'Test role claim mapping'];
			if (isXconnect) return ['Update xConnect connection strings', 'Configure collection service settings', 'Test tracker pipeline end-to-end', 'Validate analytics data flow'];
			if (isSearch)   return ['Reconfigure Sitecore search providers', 'Rebuild all Sitecore indexes', 'Test content search queries', 'Validate search result accuracy'];
			if (isCaching)  return ['Update Redis connection strings', 'Reconfigure session state provider', 'Test distributed cache behavior', 'Validate session persistence under load'];
			if (isCicd)     return ['Update deployment scripts and transforms', 'Configure environment-specific settings', 'Update publish targets', 'Validate pipeline end-to-end'];
			if (isDb)       return ['Update connection strings', 'Validate ORM mappings against new schema', 'Test all data access paths', 'Fix any compatibility issues found'];
			return ['Update environment configuration files', 'Resolve custom code compatibility issues', 'Validate Sitecore functionality', 'Test all custom modules on target'];
		}
		if (r.includes('qa') || r.includes('test')) {
			if (isDb)   return ['Write data integrity validation queries', 'Verify row counts match source', 'Test application data access on target', 'Document and sign off results'];
			if (isNet)  return ['Validate SSL certificate chain and expiry', 'Test DNS resolution and TTL propagation', 'Run connectivity and redirect smoke tests', 'Document all test outcomes'];
			if (isMon)  return ['Verify alert rules fire correctly', 'Confirm dashboard metric accuracy', 'Run synthetic monitoring tests', 'Sign off on monitoring coverage'];
			return ['Execute smoke test suite', 'Run full regression against acceptance criteria', 'Document pass/fail status per test case', 'Obtain stakeholder sign-off'];
		}
		if (r.includes('project') || r === 'pm' || r.includes('manager')) {
			return ['Coordinate cross-team dependencies', 'Track milestone progress against plan', 'Communicate status updates to stakeholders', 'Maintain risk and issue log'];
		}
		return ['Complete assigned component tasks', 'Collaborate with other roles on blockers', 'Validate completion against acceptance criteria'];
	}

	function ensureRoleTasks(compId: string, role: string, compName: string) {
		if (!roleTasks[compId]?.[role]) {
			roleTasks[compId] = { ...(roleTasks[compId] ?? {}) };
			roleTasks[compId][role] = getDefaultTasks(role, compId, compName);
			roleTasks = { ...roleTasks };
			debouncePersistRefinements();
		}
	}

	// ── Scope helpers ────────────────────────────────────────────────────
	function phaseToggleState(phase: any): 'all' | 'none' | 'partial' {
		const comps = (phase.components ?? []) as any[];
		if (comps.length === 0) return 'all';
		const n = comps.filter((c: any) => excludedSet.has(c.id)).length;
		if (n === 0) return 'all';
		if (n === comps.length) return 'none';
		return 'partial';
	}

	function toggleComponent(compId: string, included: boolean) {
		exclusions[compId] = !included;
		exclusions = { ...exclusions };
		persistScope();
	}

	function togglePhase(phase: any, included: boolean) {
		for (const c of (phase.components ?? []) as any[]) exclusions[c.id] = !included;
		exclusions = { ...exclusions };
		persistScope();
	}

	function setReason(compId: string, reason: string) {
		reasons[compId] = reason;
		reasons = { ...reasons };
		persistScope();
	}

	async function persistScope() {
		await fetch(`/api/assessments/${page.params.id}/scope-exclusions`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ exclusions, reasons }),
		});
	}

	// ── Role override helpers ─────────────────────────────────────────────
	function setRoleOverride(compId: string, role: string, value: number) {
		roleOverrides[compId] = { ...(roleOverrides[compId] ?? {}) };
		roleOverrides[compId][role] = value;
		roleOverrides = { ...roleOverrides };
		debouncePersistRefinements();
	}

	function clearRoleOverride(compId: string, role: string) {
		if (!roleOverrides[compId]) return;
		delete roleOverrides[compId][role];
		if (Object.keys(roleOverrides[compId]).length === 0) delete roleOverrides[compId];
		roleOverrides = { ...roleOverrides };
		debouncePersistRefinements();
	}

	// ── Task helpers ──────────────────────────────────────────────────────
	function addTask(compId: string, role: string, compName: string) {
		const key = `${compId}__${role}`;
		const text = newTaskInputs[key]?.trim();
		if (!text) return;
		ensureRoleTasks(compId, role, compName);
		roleTasks[compId][role] = [...(roleTasks[compId][role] ?? []), text];
		roleTasks = { ...roleTasks };
		newTaskInputs[key] = '';
		newTaskInputs = { ...newTaskInputs };
		debouncePersistRefinements();
	}

	function removeTask(compId: string, role: string, idx: number) {
		if (!roleTasks[compId]?.[role]) return;
		roleTasks[compId][role] = roleTasks[compId][role].filter((_, i) => i !== idx);
		roleTasks = { ...roleTasks };
		debouncePersistRefinements();
	}

	function updateTask(compId: string, role: string, idx: number, value: string) {
		if (!roleTasks[compId]?.[role]) return;
		roleTasks[compId][role][idx] = value;
		roleTasks = { ...roleTasks };
		debouncePersistRefinements();
	}

	// ── Persist refinements (debounced) ───────────────────────────────────
	let persistRefinementsTimer: ReturnType<typeof setTimeout> | null = null;
	function debouncePersistRefinements() {
		if (persistRefinementsTimer) clearTimeout(persistRefinementsTimer);
		persistRefinementsTimer = setTimeout(persistRefinements, 600);
	}

	async function persistRefinements() {
		await fetch(`/api/assessments/${page.params.id}/component-refinements`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ roleOverrides, roleTasks }),
		});
	}

	// ── Filter helpers ────────────────────────────────────────────────────
	function filterComponents(comps: any[]): any[] {
		return comps.filter((c: any) => {
			const tab =
				filterTab === 'all' ||
				(filterTab === 'in_scope' && !excludedSet.has(c.id)) ||
				(filterTab === 'excluded' && excludedSet.has(c.id));
			const q = !searchQuery ||
				c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				c.id?.toLowerCase().includes(searchQuery.toLowerCase());
			return tab && q;
		});
	}

	function getLinkedAssumptions(compId: string): any[] {
		return assumptions.filter((a: any) => (a.affected_components ?? []).includes(compId));
	}

	function getLinkedRisks(compId: string): any[] {
		return risks.filter((r: any) =>
			(r.linked_assumptions ?? []).some((aId: string) =>
				assumptions.find((a: any) => a.id === aId && (a.affected_components ?? []).includes(compId))
			)
		);
	}

	// ── Component override delta ──────────────────────────────────────────
	function getCompOverrideDelta(comp: any): number {
		const byRole = comp.by_role as Record<string, number> | undefined;
		if (!byRole || !roleOverrides[comp.id]) return 0;
		return Object.entries(byRole).reduce((delta, [role, baseH]) => {
			const ov = roleOverrides[comp.id]?.[role];
			return delta + (ov !== undefined ? ov - baseH : 0);
		}, 0);
	}

	function getRoleDelta(compId: string, role: string, baseH: number): number {
		const ov = roleOverrides[compId]?.[role];
		return ov !== undefined ? ov - baseH : 0;
	}

	// ── Finalize ──────────────────────────────────────────────────────────
	async function finalize() {
		finalizing = true;
		finalizeError = '';
		try {
			// Flush any pending refinements first
			if (persistRefinementsTimer) {
				clearTimeout(persistRefinementsTimer);
				await persistRefinements();
			}
			const res = await fetch(`/api/assessments/${page.params.id}/finalize`, { method: 'POST' });
			if (!res.ok) {
				const err = await res.json().catch(() => ({ message: `Error ${res.status}` }));
				finalizeError = err.message ?? `Error ${res.status}`;
				return;
			}
			finalizeSuccess = true;
			setTimeout(() => goto(`/planning/?assessment=${page.params.id}&tab=documents`), 1400);
		} catch (e: any) {
			finalizeError = e.message ?? 'Network error';
		} finally {
			finalizing = false;
		}
	}

	// ── Constants ─────────────────────────────────────────────────────────
	const EXCLUSION_PRESETS = [
		'Already migrated',
		'Out of scope',
		'Deferred to phase 2',
		'Client decision',
		'Handled by third party',
		'Not applicable',
	];

	// Role accent colors for visual distinction
	const ROLE_ACCENTS: Record<string, string> = {
		infrastructure_engineer: 'border-l-primary',
		infra_eng: 'border-l-primary',
		dba: 'border-l-warning-dark',
		sitecore_developer: 'border-l-[#7c3aed]',
		sitecore_dev: 'border-l-[#7c3aed]',
		qa_engineer: 'border-l-success',
		qa_eng: 'border-l-success',
		project_manager: 'border-l-[#ea580c]',
	};
	function roleAccent(role: string) {
		return ROLE_ACCENTS[role] ?? 'border-l-text-muted';
	}

	// Key handler for tab navigation in filter group
	function handleFilterKey(e: KeyboardEvent) {
		const tabs = ['all', 'in_scope', 'excluded'] as const;
		const idx = tabs.indexOf(filterTab);
		if (e.key === 'ArrowRight') { e.preventDefault(); filterTab = tabs[(idx + 1) % 3]; }
		if (e.key === 'ArrowLeft')  { e.preventDefault(); filterTab = tabs[(idx + 2) % 3]; }
	}
</script>

<svelte:head>
	<title>{assessment.project_name} — Refine Scope</title>
</svelte:head>

<!-- Skip nav -->
<a href="#phase-list" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-1.5 focus:bg-primary focus:text-white focus:text-xs focus:font-bold">
	Skip to phase list
</a>

<div class="p-6 space-y-5 animate-enter">

	<!-- ── Header ──────────────────────────────────────────────────────────── -->
	<div class="flex items-start gap-4 flex-wrap">
		<div>
			<div class="flex items-center gap-2">
				<h1 class="text-xl font-extrabold uppercase tracking-wider">Refine Scope</h1>
				<Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
				<button
					onclick={() => drawerSection = 'page'}
					class="flex items-center justify-center w-5 h-5 text-text-muted hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-primary"
					aria-label="About this page"
				>(i)</button>
			</div>
			<p class="text-xs text-text-muted mt-0.5 font-mono">
				Toggle components, adjust role hours &amp; tasks, add exclusion reasons — then mark complete.
			</p>
		</div>
	</div>

	{#if !estimate}
		<Card>
			<div class="py-10 text-center space-y-2">
				<p class="text-base font-extrabold uppercase tracking-wider text-text-muted">No Estimate Yet</p>
				<p class="text-sm text-text-muted max-w-sm mx-auto">
					Run <code class="brutal-border-thin bg-surface px-1.5 py-0.5 text-xs font-mono">/migrate estimate</code> first, then refine scope here.
				</p>
			</div>
		</Card>
	{:else}

		<!-- ── Finalize callout ──────────────────────────────────────────────── -->
		{#if canFinalize}
			{@const confScore = estimate.confidence_score ?? 0}
			{@const confVariant = confScore >= 70 ? 'success' : confScore >= 40 ? 'warning' : 'danger'}
			<div class="flex items-center gap-4 border-l-[5px] border-l-success bg-success/[0.06] px-5 py-3.5">
				<!-- Check icon -->
				<div class="shrink-0 flex items-center justify-center w-8 h-8 bg-success border-2 border-[#000] shadow-[2px_2px_0_#000]">
					<svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
						<path d="M4 10l4 4 8-8" stroke="white" stroke-width="3" stroke-linecap="square" stroke-linejoin="miter"/>
					</svg>
				</div>

				<div class="flex-1 min-w-0">
					<p class="text-sm font-extrabold uppercase tracking-wider leading-tight">Ready to Complete</p>
					<p class="text-xs text-text-muted mt-0.5">
						<span class="font-mono font-bold text-text">{inScopeCount}</span> components &middot;
						<span class="font-mono font-bold text-text">{Math.round(activeTotal).toLocaleString()}h</span> refined &middot;
						<span class="font-mono font-bold text-{confVariant}">{confScore}%</span> confidence
						{#if excludedSet.size > 0}
							&middot; <span class="font-mono">{excludedSet.size}</span> excluded
						{/if}
						&mdash;
						<a href="#finalize-cta" class="font-bold text-primary hover:underline">Complete Assessment ↓</a>
					</p>
				</div>
			</div>
		{/if}

		<!-- ── Summary Bar ───────────────────────────────────────────────────── -->
		<div class="brutal-border bg-surface px-5 py-3 flex items-center gap-6 flex-wrap">
			<Tooltip text="Components included in the migration scope." position="bottom">
				<div class="flex items-baseline gap-1.5 cursor-help">
					<span class="text-2xl font-extrabold font-mono tracking-tight">{inScopeCount}<span class="text-sm text-text-muted font-normal">/{allComponents.length}</span></span>
					<span class="text-xs font-bold uppercase tracking-wider text-text-muted">in scope</span>
				</div>
			</Tooltip>

			<span class="w-px h-6 bg-border-light hidden sm:block" aria-hidden="true"></span>

			<Tooltip text="Total hours after scope exclusions and role overrides." position="bottom">
				<div class="flex items-baseline gap-1.5 cursor-help">
					<span class="text-sm font-extrabold font-mono">{Math.round(activeTotal).toLocaleString()}h</span>
					<span class="text-xs text-text-muted">refined</span>
					{#if hasAnyOverride() && overrideDelta() !== 0}
						{@const d = overrideDelta()}
						<span class="text-[10px] font-bold font-mono {d > 0 ? 'text-danger' : 'text-success'}">
							({d > 0 ? '+' : ''}{Math.round(d)}h override)
						</span>
					{/if}
				</div>
			</Tooltip>

			<span class="w-px h-6 bg-border-light hidden sm:block" aria-hidden="true"></span>

			<Tooltip text="Components removed from scope." position="bottom">
				<div class="flex items-baseline gap-1.5 cursor-help">
					<span class="text-sm font-extrabold font-mono {excludedSet.size > 0 ? 'text-danger' : 'text-text-muted'}">{excludedSet.size}</span>
					<span class="text-xs text-text-muted">excluded</span>
				</div>
			</Tooltip>

			<span class="w-px h-6 bg-border-light hidden sm:block" aria-hidden="true"></span>

			<Tooltip text="Estimate confidence based on confirmed vs. assumed answers." position="bottom">
				<div class="flex items-center gap-2 cursor-help">
					<span class="text-sm font-extrabold font-mono">{estimate.confidence_score ?? 0}%</span>
					<div class="w-16 h-1.5 bg-border-light border border-brutal">
						<div
							class="h-full transition-all duration-300
								{(estimate.confidence_score ?? 0) >= 70 ? 'bg-success' : (estimate.confidence_score ?? 0) >= 40 ? 'bg-warning' : 'bg-danger'}"
							style="width: {estimate.confidence_score ?? 0}%"
						></div>
					</div>
					<span class="text-xs text-text-muted">confidence</span>
				</div>
			</Tooltip>
		</div>

		<!-- Scenario selector -->
		<ScenarioSelector {scenario} onchange={(s) => scenario = s} totals={scenarioTotals} />

		<!-- ── Filter Bar ────────────────────────────────────────────────────── -->
		<div class="flex items-center gap-3 flex-wrap">
			<!-- Tab group -->
			<div
				role="tablist"
				tabindex="0"
				aria-label="Component filter"
				class="flex brutal-border overflow-hidden shadow-[2px_2px_0_#000]"
				onkeydown={handleFilterKey}
			>
				{#each [['all', 'All', allComponents.length], ['in_scope', 'In Scope', inScopeCount], ['excluded', 'Excluded', excludedSet.size]] as [tab, label, count]}
					<button
						role="tab"
						aria-selected={filterTab === tab}
						tabindex={filterTab === tab ? 0 : -1}
						class="px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider transition-colors duration-100 focus-visible:outline-2 focus-visible:outline-primary
							{filterTab === tab
								? 'bg-[#1a1a1a] text-white'
								: 'bg-surface text-text-muted hover:bg-surface-raised'}"
						onclick={() => filterTab = tab as any}
					>{label} <span class="opacity-60 font-mono">{count}</span></button>
				{/each}
			</div>

			<!-- Search -->
			<div class="relative flex-1 min-w-[180px]">
				<span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-xs select-none" aria-hidden="true">/</span>
				<input
					id="refine-search"
					type="search"
					placeholder="Search components…"
					bind:value={searchQuery}
					class="w-full pl-7 pr-3 py-1.5 text-xs font-mono brutal-border bg-bg shadow-[2px_2px_0_#000]
						placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-primary"
					aria-label="Search components"
				/>
			</div>

			{#if searchQuery || filterTab !== 'all'}
				<button
					class="text-xs font-bold text-text-muted hover:text-danger transition-colors focus-visible:outline-2 focus-visible:outline-primary"
					onclick={() => { searchQuery = ''; filterTab = 'all'; }}
					aria-label="Clear filters"
				>✕ Clear</button>
			{/if}
		</div>

		<!-- ── Phase / Component List ────────────────────────────────────────── -->
		<div id="phase-list" class="space-y-3" role="list" aria-label="Migration phases">
			{#each phases as phase}
				{@const state        = phaseToggleState(phase)}
				{@const phaseComps   = (phase.components ?? []) as any[]}
				{@const filtered     = filterComponents(phaseComps)}
				{@const inScopeComps = phaseComps.filter((c: any) => !excludedSet.has(c.id))}
				{@const phaseHours   = inScopeComps.reduce((s: number, c: any) => s + getComponentHours(c, scenario, aiToggles), 0)}

				{#if filtered.length > 0}
					<div role="listitem">
						<CollapsibleSection
							title={phase.name}
							subtitle="{inScopeComps.length}/{phaseComps.length} components · {Math.round(phaseHours)}h"
							open={true}
							badge={state === 'none' ? 'excluded' : state === 'partial' ? 'partial' : undefined}
							badgeVariant={state === 'none' ? 'danger' : 'warning'}
						>
							<!-- Phase header: master toggle -->
							<div class="flex items-center justify-between pb-3 mb-3 border-b-2 border-border-light">
								<span class="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">
									{state === 'all' ? 'All in scope' : state === 'none' ? 'All excluded' : 'Partial scope'}
								</span>
								<Toggle
									checked={state !== 'none'}
									onchange={(v) => togglePhase(phase, v)}
									label={state === 'none' ? 'Include all' : 'Exclude all'}
									size="sm"
								/>
							</div>

							<!-- Component rows -->
							<div class="space-y-2" role="list" aria-label="{phase.name} components">
								{#each filtered as comp}
									{@const excluded        = excludedSet.has(comp.id)}
									{@const expanded        = expandedComponents[comp.id]}
									{@const compHours       = getComponentHours(comp, scenario, aiToggles)}
									{@const byRole          = (comp.by_role ?? {}) as Record<string, number>}
									{@const hasRoles        = Object.keys(byRole).length > 0}
									{@const linkedAssumps   = getLinkedAssumptions(comp.id)}
									{@const linkedRisks     = getLinkedRisks(comp.id)}
									{@const compTools       = aiTools.filter((t: any) => t.applicable_components?.includes(comp.id))}
									{@const overrideDeltaV  = getCompOverrideDelta(comp)}
									{@const hasOverride     = overrideDeltaV !== 0}

									<div
										role="listitem"
										class="border-2 border-[#000] transition-all duration-150
											{excluded ? 'bg-surface opacity-70' : 'bg-bg'}
											{expanded  ? 'shadow-[3px_3px_0_#000]' : 'shadow-[2px_2px_0_#000] hover:shadow-[3px_3px_0_#000]'}"
									>
										<!-- ── Main row (click anywhere to expand) ───────────── -->
										<button
											class="flex items-center gap-3 px-3 py-2.5 w-full text-left cursor-pointer
												hover:bg-surface-raised/40 transition-colors duration-100
												focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[-2px]"
											onclick={() => {
												const wasExpanded = !!expandedComponents[comp.id];
												expandedComponents[comp.id] = !wasExpanded;
												if (!wasExpanded && hasRoles) {
													for (const role of Object.keys(byRole)) {
														ensureRoleTasks(comp.id, role, comp.name);
													}
												}
											}}
											aria-expanded={expanded}
										aria-label="{expanded ? 'Collapse' : 'Expand'} details for {comp.name}"
										>
											<!-- Stop toggle clicks from also triggering row expand -->
											<span role="presentation" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
												<Toggle
													checked={!excluded}
													onchange={(v) => toggleComponent(comp.id, v)}
													size="sm"
												/>
											</span>

											<div class="flex-1 min-w-0">
												<span class="text-sm font-bold {excluded ? 'line-through text-text-muted' : ''} truncate block">
													{comp.name}
												</span>
												{#if excluded && reasons[comp.id]}
													<span class="text-[10px] font-mono text-danger">{reasons[comp.id]}</span>
												{/if}
											</div>

											<!-- Badges -->
											<div class="flex items-center gap-2 shrink-0">
												{#if linkedAssumps.length > 0}
													<Tooltip text="{linkedAssumps.length} assumption(s)" position="top">
														<span role="presentation" class="text-[10px] font-extrabold font-mono text-warning-dark bg-warning-light px-1.5 py-0.5 border border-[#a16207] cursor-default" onclick={(e) => e.stopPropagation()}>
															{linkedAssumps.length}A
														</span>
													</Tooltip>
												{/if}
												{#if linkedRisks.length > 0}
													<Tooltip text="{linkedRisks.length} risk(s)" position="top">
														<span role="presentation" class="text-[10px] font-extrabold font-mono text-danger bg-danger-light px-1.5 py-0.5 border border-danger cursor-default" onclick={(e) => e.stopPropagation()}>
															{linkedRisks.length}R
														</span>
													</Tooltip>
												{/if}
												{#if compTools.length > 0}
													<Tooltip text="{compTools.length} AI tool(s)" position="top">
														<span role="presentation" class="text-[10px] font-extrabold font-mono text-success bg-[#dcfce7] px-1.5 py-0.5 border border-success cursor-default" onclick={(e) => e.stopPropagation()}>
															{compTools.length}AI
														</span>
													</Tooltip>
												{/if}

												<!-- Hours (with override delta) -->
												<div class="text-right w-20">
													<span class="text-sm font-extrabold font-mono {excluded ? 'line-through text-text-muted' : ''}">
														{Math.round(compHours)}h
													</span>
													{#if hasOverride && !excluded}
														<span class="block text-[10px] font-bold font-mono {overrideDeltaV > 0 ? 'text-danger' : 'text-success'}">
															{overrideDeltaV > 0 ? '+' : ''}{Math.round(overrideDeltaV)}h override
														</span>
													{/if}
												</div>

												<!-- Caret indicator -->
												<span class="ml-1 w-6 h-6 flex items-center justify-center text-xs text-text-muted" aria-hidden="true">
													<span class="inline-block transition-transform duration-150 {expanded ? 'rotate-90' : ''}">▶</span>
												</span>
											</div>
										</button>

										<!-- ── Exclusion reason bar ───────────────────────────── -->
										{#if excluded}
											<div class="px-3 pb-3 pt-0 border-t border-border-light bg-danger-light/20">
												<div class="flex items-start gap-2 mt-2 flex-wrap">
													<span class="text-[10px] font-extrabold uppercase tracking-wider text-danger mt-0.5 shrink-0">Reason:</span>
													<div class="flex flex-wrap gap-1.5 flex-1">
														{#each EXCLUSION_PRESETS as preset}
															<button
																class="text-[10px] px-2 py-0.5 font-bold border transition-all duration-100 focus-visible:outline-2 focus-visible:outline-primary
																	{reasons[comp.id] === preset
																	? 'bg-danger text-white border-danger shadow-[1px_1px_0_#000]'
																	: 'bg-surface text-text-muted border-border-light hover:border-danger hover:text-danger'}"
																onclick={() => setReason(comp.id, preset)}
															>{preset}</button>
														{/each}
														<input
															type="text"
															placeholder="Custom…"
															value={reasons[comp.id] ?? ''}
															oninput={(e) => setReason(comp.id, (e.target as HTMLInputElement).value)}
															class="flex-1 min-w-[120px] px-2 py-0.5 text-[10px] font-mono
																brutal-border-thin bg-surface placeholder:text-text-faint
																focus:outline-none focus:ring-2 focus:ring-danger"
															aria-label="Custom exclusion reason for {comp.name}"
														/>
													</div>
												</div>
											</div>
										{/if}

										<!-- ── Expanded detail ───────────────────────────────── -->
										{#if expanded}
											<div class="border-t-2 border-[#000] bg-bg">

												<!-- Hours overview strip -->
												<div class="flex items-center gap-0 border-b border-border-light overflow-x-auto">
													{#each [
														['Base', `${comp.base_hours ?? 0}h`, ''],
														['Effective', `${Math.round(compHours)}h`, 'font-extrabold'],
														...(comp.gotcha_hours > 0 ? [['Gotcha', `+${comp.gotcha_hours}h`, 'text-warning-dark']] : []),
														...(comp.assumption_dependent_hours > 0 ? [['At-risk', `${comp.assumption_dependent_hours}h`, 'text-danger']] : []),
														...(comp.units > 1 ? [['Units', String(comp.units), 'text-text-muted']] : []),
													] as strip}
														{@const [label, value, cls] = strip as [string, string, string]}
														<div class="flex-1 min-w-[80px] px-3 py-2 border-r border-border-light last:border-r-0 text-center">
															<p class="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">{label}</p>
															<p class="text-sm font-mono {cls}">{value}</p>
														</div>
													{/each}
													{#if compTools.length > 0}
														<div class="flex-1 min-w-[80px] px-3 py-2 text-center">
															<p class="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">AI Tools</p>
															<p class="text-sm font-mono text-success">{compTools.filter(t => aiToggles[t.id] !== false).length}/{compTools.length}</p>
														</div>
													{/if}
												</div>

												{#if hasRoles}
													<!-- Role breakdown header -->
													<div class="px-3 pt-3 pb-1.5 flex items-center justify-between">
														<h4 class="text-[10px] font-extrabold uppercase tracking-wider text-text-muted tracking-widest">
															Role Breakdown &amp; Tasks
														</h4>
														<span class="text-[10px] font-mono text-text-faint">
															{Object.values(byRole).reduce((s, h) => s + h, 0)}h allocated
														</span>
													</div>

													<!-- Role cards grid -->
													<div class="px-3 pb-3 grid gap-2 sm:grid-cols-2">
														{#each Object.entries(byRole) as [role, baseH]}
															{@const overrideVal = roleOverrides[comp.id]?.[role]}
															{@const effectiveH  = overrideVal ?? baseH}
															{@const delta       = getRoleDelta(comp.id, role, baseH)}
															{@const tasks       = roleTasks[comp.id]?.[role] ?? []}
															{@const inputKey    = `${comp.id}__${role}`}

															<div class="border-2 border-[#000] {roleAccent(role)} border-l-4 bg-surface shadow-[2px_2px_0_#000]">

																<!-- Role card header -->
																<div class="bg-[#1a1a1a] px-3 py-2 flex items-center justify-between gap-3">
																	<span class="text-xs font-extrabold uppercase tracking-wider text-white truncate">
																		{formatRole(role)}
																	</span>

																	<!-- Hours control -->
																	<div class="flex items-center gap-2 shrink-0">
																		<span class="text-[10px] font-mono text-white/60 line-through">{baseH}h</span>
																		<div class="flex items-center gap-1">
																			<input
																				type="number"
																				min="0"
																				step="0.5"
																				value={effectiveH}
																				onchange={(e) => {
																					const v = parseFloat((e.target as HTMLInputElement).value);
																					if (!isNaN(v) && v >= 0) setRoleOverride(comp.id, role, v);
																				}}
																				class="w-14 px-1.5 py-0.5 text-xs font-extrabold font-mono text-right
																					bg-[#2d2d2d] text-white border border-white/30
																					focus:outline-none focus:border-primary [appearance:textfield]
																					[&::-webkit-inner-spin-button]:appearance-none"
																				aria-label="Hours for {formatRole(role)} on {comp.name}"
																			/>
																			<span class="text-[10px] text-white/70 font-mono">h</span>
																		</div>
																		{#if overrideVal !== undefined}
																			<div class="flex items-center gap-1">
																				<span class="text-[10px] font-bold font-mono {delta > 0 ? 'text-[#fca5a5]' : 'text-[#86efac]'}">
																					{delta > 0 ? '+' : ''}{Math.round(delta * 10) / 10}h
																				</span>
																				<button
																					class="text-[10px] text-white/50 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-white"
																					onclick={() => clearRoleOverride(comp.id, role)}
																					aria-label="Reset hours for {formatRole(role)}"
																				>↺</button>
																			</div>
																		{/if}
																	</div>
																</div>

																<!-- Task list -->
																<div class="p-2.5 space-y-1">
																	{#if tasks.length === 0 && !(roleTasks[comp.id]?.[role])}
																		<p class="text-[10px] text-text-faint font-mono italic px-1">No tasks — click + to add</p>
																	{/if}

																	{#each tasks as task, idx}
																		<div class="flex items-start gap-1.5 group">
																			<span class="text-[10px] text-text-muted mt-0.5 shrink-0 select-none" aria-hidden="true">◆</span>
																			<input
																				type="text"
																				value={task}
																				onblur={(e) => updateTask(comp.id, role, idx, (e.target as HTMLInputElement).value)}
																				class="flex-1 text-[11px] font-mono bg-transparent border-b border-transparent
																					hover:border-border-light focus:border-primary focus:outline-none
																					text-text-secondary leading-relaxed"
																				aria-label="Task {idx + 1} for {formatRole(role)}"
																			/>
																			<button
																				class="opacity-0 group-hover:opacity-100 focus-visible:opacity-100
																					text-[10px] text-text-muted hover:text-danger transition-all
																					focus-visible:outline-2 focus-visible:outline-danger shrink-0 mt-0.5"
																				onclick={() => removeTask(comp.id, role, idx)}
																				aria-label="Remove task {idx + 1} for {formatRole(role)}"
																			>✕</button>
																		</div>
																	{/each}

																	<!-- Add task input -->
																	<div class="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-border-light">
																		<span class="text-[10px] text-text-faint shrink-0" aria-hidden="true">+</span>
																		<input
																			type="text"
																			placeholder="Add task… ↵"
																			value={newTaskInputs[inputKey] ?? ''}
																			oninput={(e) => {
																				newTaskInputs[inputKey] = (e.target as HTMLInputElement).value;
																				newTaskInputs = { ...newTaskInputs };
																			}}
																			onkeydown={(e) => {
																				if (e.key === 'Enter') {
																					e.preventDefault();
																					addTask(comp.id, role, comp.name);
																				}
																			}}
																			class="flex-1 text-[11px] font-mono bg-transparent border-b border-border-light
																				placeholder:text-text-faint text-text-secondary
																				focus:border-primary focus:outline-none"
																			aria-label="New task for {formatRole(role)}"
																		/>
																	</div>
																</div>
															</div>
														{/each}
													</div>
												{:else}
													<div class="px-3 py-3 text-xs text-text-faint font-mono italic">
														No role breakdown available for this component.
													</div>
												{/if}

												<!-- Footer chips: multipliers, assumptions, risks -->
												{#if (comp.multipliers_applied ?? []).length > 0 || linkedAssumps.length > 0 || linkedRisks.length > 0}
													<div class="px-3 pb-3 pt-0 border-t border-border-light flex flex-wrap gap-1.5 mt-0 pt-2.5">
														{#each (comp.multipliers_applied ?? []) as mult}
															<span class="inline-flex items-center px-2 py-0.5 text-[10px] font-bold bg-warning-light text-warning-dark border border-[#a16207]">
																×{typeof mult === 'string' ? mult : (mult as any).name ?? (mult as any).id}
																{#if typeof mult === 'object' && (mult as any).factor}{(mult as any).factor}{/if}
															</span>
														{/each}
														{#each linkedAssumps as a}
															<Tooltip text={a.assumed_value || a.basis || a.id} position="top">
																<span class="inline-flex items-center px-2 py-0.5 text-[10px] font-mono cursor-help
																	{a.validation_status === 'validated'
																		? 'bg-[#dcfce7] text-success border border-success'
																		: 'bg-warning-light text-warning-dark border border-[#a16207]'}">
																	{a.id}
																</span>
															</Tooltip>
														{/each}
														{#each linkedRisks as r}
															<Tooltip text={r.description || r.id} position="top">
																<span class="inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-danger bg-danger-light border border-danger cursor-help">
																	{r.id}
																</span>
															</Tooltip>
														{/each}
													</div>
												{/if}

											</div>
										{/if}
									</div>
								{/each}
							</div>
						</CollapsibleSection>
					</div>
				{/if}
			{/each}

			{#if phases.every((p: any) => filterComponents(p.components ?? []).length === 0)}
				<div class="brutal-border-thin bg-surface py-8 text-center text-sm text-text-muted font-mono">
					No components match this filter.
				</div>
			{/if}
		</div>

		<!-- ── Cascade Impact ────────────────────────────────────────────────── -->
		{#if excludedSet.size > 0}
			<Card>
				<button
					class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider mb-4 pb-2 border-b-3 border-primary text-primary w-full text-left hover:opacity-80 transition-opacity focus-visible:outline-2 focus-visible:outline-primary"
					onclick={() => drawerSection = 'cascade'}
				>
					Cascade Impact
					<span class="text-[10px] font-mono opacity-60">(i)</span>
				</button>
				<div class="grid gap-4 sm:grid-cols-3">
					{#each [
						['Assumptions', cascade.outOfScopeAssumptions.size, 'out of scope', 'Assumptions linked only to excluded components.'],
						['Risks', cascade.outOfScopeRisks.size, 'out of scope', 'Risks linked only to excluded components.'],
						['AI Tools', cascade.inactiveAiTools.size, 'inactive', 'AI tools that only apply to excluded components.'],
					] as [label, count, suffix, tip]}
						<div>
							<Tooltip text={String(tip)} position="bottom">
								<span class="text-xs font-extrabold uppercase tracking-wider text-text-muted cursor-help">{label}</span>
							</Tooltip>
							<p class="text-lg font-extrabold font-mono">{count} <span class="text-sm text-text-muted font-normal">{suffix}</span></p>
						</div>
					{/each}
				</div>

				{#if cascade.outOfScopeAssumptions.size > 0}
					<details class="mt-4">
						<summary class="text-xs font-extrabold uppercase tracking-wider text-text-muted cursor-pointer hover:text-text">
							Out-of-scope assumptions ({cascade.outOfScopeAssumptions.size})
						</summary>
						<ul class="mt-2 space-y-1">
							{#each assumptions.filter((a: any) => cascade.outOfScopeAssumptions.has(a.id)) as a}
								<li class="text-xs font-mono text-text-muted px-2 py-1 bg-surface-raised">
									<span class="font-bold text-text">{a.id}</span> — {a.assumed_value || a.basis || 'No description'}
								</li>
							{/each}
						</ul>
					</details>
				{/if}
				{#if cascade.outOfScopeRisks.size > 0}
					<details class="mt-3">
						<summary class="text-xs font-extrabold uppercase tracking-wider text-text-muted cursor-pointer hover:text-text">
							Out-of-scope risks ({cascade.outOfScopeRisks.size})
						</summary>
						<ul class="mt-2 space-y-1">
							{#each risks.filter((r: any) => cascade.outOfScopeRisks.has(r.id)) as r}
								<li class="text-xs font-mono text-text-muted px-2 py-1 bg-surface-raised">
									<span class="font-bold text-text">{r.id}</span> — {r.description || 'No description'}
								</li>
							{/each}
						</ul>
					</details>
				{/if}
			</Card>
		{/if}

	<!-- ── Complete Assessment ──────────────────────────────────────────────── -->
	{#if canFinalize && estimate}
		<div id="finalize-cta" class="border-3 border-[#000] bg-surface shadow-[4px_4px_0_#000]">
			<div class="bg-[#1a1a1a] px-5 py-3 flex items-center gap-3">
				<div class="flex items-center justify-center w-8 h-8 bg-primary border-2 border-white/20 shadow-[2px_2px_0_rgba(0,0,0,0.3)]">
					<svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
						<path d="M4 10l4 4 8-8" stroke="white" stroke-width="3" stroke-linecap="square" stroke-linejoin="miter"/>
					</svg>
				</div>
				<h2 class="text-sm font-extrabold uppercase tracking-wider text-white">Complete Assessment</h2>
			</div>

			<div class="px-5 py-5 space-y-4">
				<p class="text-sm text-text-secondary leading-relaxed max-w-2xl">
					When you're satisfied with the scope, role assignments, and hour adjustments above, mark this assessment as complete. This locks in your current configuration as the final assessment snapshot.
				</p>

				<div class="flex items-start gap-2 px-3 py-2.5 bg-surface-raised border-2 border-border-light">
					<span class="text-text-muted text-xs mt-0.5 shrink-0">*</span>
					<p class="text-xs text-text-muted leading-relaxed">
						Deliverables such as migration plans, risk registers, and runbooks can be generated afterward using the
						<code class="font-mono bg-bg px-1.5 py-0.5 text-[10px] border border-border-light">/migrate plan</code> skill
						in the planning tool.
					</p>
				</div>

				<!-- Snapshot stats -->
				<div class="flex items-center gap-4 flex-wrap text-xs">
					<span class="font-mono font-bold">{inScopeCount} <span class="text-text-muted font-normal">components</span></span>
					<span class="w-px h-4 bg-border-light" aria-hidden="true"></span>
					<span class="font-mono font-bold">{Math.round(activeTotal).toLocaleString()}h <span class="text-text-muted font-normal">estimated</span></span>
					<span class="w-px h-4 bg-border-light" aria-hidden="true"></span>
					<span class="font-mono font-bold {(estimate.confidence_score ?? 0) >= 70 ? 'text-success' : (estimate.confidence_score ?? 0) >= 40 ? 'text-warning-dark' : 'text-danger'}">{estimate.confidence_score ?? 0}% <span class="text-text-muted font-normal">confidence</span></span>
					{#if excludedSet.size > 0}
						<span class="w-px h-4 bg-border-light" aria-hidden="true"></span>
						<span class="font-mono font-bold text-text-muted">{excludedSet.size} <span class="font-normal">excluded</span></span>
					{/if}
				</div>

				<div class="flex items-center justify-end pt-1">
					<button
						class="px-5 py-2 text-xs font-extrabold uppercase tracking-wider
							bg-primary text-white border-2 border-brutal shadow-[3px_3px_0_#000]
							hover:bg-primary-hover hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#000]
							active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_#000]
							transition-all duration-100
							focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2
							disabled:opacity-50 disabled:cursor-not-allowed"
						onclick={() => finalizeModalOpen = true}
						disabled={assessment.status === 'complete'}
					>
						{#if assessment.status === 'complete'}
							Assessment Complete
						{:else}
							Mark Assessment Complete
						{/if}
					</button>
				</div>
			</div>
		</div>
	{/if}

	{/if}
</div>

<!-- ── Finalize Modal ──────────────────────────────────────────────────────── -->
<Modal open={finalizeModalOpen} onclose={() => { if (!finalizing) finalizeModalOpen = false; }} title="Complete Assessment">
	{#if finalizeSuccess}
		<div class="py-12 text-center space-y-3">
			<div class="inline-flex items-center justify-center w-14 h-14 border-3 border-brutal bg-[#dcfce7] text-success text-2xl shadow-[3px_3px_0_#000]">✓</div>
			<p class="text-sm font-extrabold uppercase tracking-wider text-success">Assessment Complete</p>
			<p class="text-xs text-text-muted font-mono">Redirecting to planning…</p>
		</div>
	{:else}
		<div class="space-y-5 text-sm">
			<p class="text-text-secondary">
				This will mark the assessment as <strong>complete</strong>, locking in your current scope, role assignments, and hour adjustments as the final snapshot.
			</p>

			<!-- Scope snapshot -->
			<div class="grid grid-cols-3 gap-2">
				{#each [
					[String(inScopeCount), 'In-scope components'],
					[`${Math.round(activeTotal)}h`, 'Total hours'],
					[`${estimate?.confidence_score ?? 0}%`, 'Confidence'],
				] as [val, lbl]}
					<div class="border-2 border-[#000] p-3 text-center bg-surface shadow-[2px_2px_0_#000]">
						<p class="text-lg font-extrabold font-mono">{val}</p>
						<p class="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">{lbl}</p>
					</div>
				{/each}
			</div>

			<!-- What happens next -->
			<div class="flex items-start gap-2 px-3 py-2.5 bg-surface-raised border-2 border-border-light">
				<span class="text-text-muted text-xs mt-0.5 shrink-0">*</span>
				<p class="text-xs text-text-muted leading-relaxed">
					After completing, you can generate deliverables (migration plans, risk registers, runbooks) using the
					<code class="font-mono bg-bg px-1 py-0.5 text-[10px] border border-border-light">/migrate plan</code> skill.
				</p>
			</div>

			<!-- Warnings -->
			{#each finalizeWarnings() as warning}
				<div class="flex items-start gap-2 px-3 py-2 bg-warning-light border-2 border-[#a16207] text-xs text-warning-dark">
					<span class="font-bold shrink-0 mt-0.5">⚠</span>
					<span>{warning}</span>
				</div>
			{/each}

			{#if finalizeError}
				<div class="px-3 py-2 bg-danger-light border-2 border-danger text-xs text-danger font-bold">
					{finalizeError}
				</div>
			{/if}
		</div>
	{/if}

	{#snippet footer()}
		{#if !finalizeSuccess}
			<div class="flex items-center justify-end gap-3">
				<button
					class="px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider brutal-border-thin
						bg-surface text-text-muted hover:bg-surface-raised transition-colors
						focus-visible:outline-2 focus-visible:outline-primary"
					onclick={() => finalizeModalOpen = false}
					disabled={finalizing}
				>Cancel</button>
				<button
					class="px-5 py-1.5 text-xs font-extrabold uppercase tracking-wider
						bg-primary text-white border-2 border-brutal shadow-[2px_2px_0_#000]
						hover:bg-primary-hover hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_#000]
						active:translate-x-px active:translate-y-px active:shadow-none
						transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed
						focus-visible:outline-2 focus-visible:outline-primary"
					onclick={finalize}
					disabled={finalizing}
				>
					{#if finalizing}
						<span class="inline-flex items-center gap-2">
							<span class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
							Completing…
						</span>
					{:else}
						Confirm &amp; Complete
					{/if}
				</button>
			</div>
		{/if}
	{/snippet}
</Modal>

<!-- ── Info Drawer ─────────────────────────────────────────────────────────── -->
<InfoDrawer
	open={drawerSection !== null}
	onclose={() => drawerSection = null}
	title={drawerSection === 'page' ? 'About Refine Scope' : 'Cascade Impact'}
>
	{#if drawerSection === 'page'}
		<div class="space-y-4 text-sm">
			<p><strong>Refine Scope</strong> gives you granular control over every aspect of the migration before generating deliverables.</p>
			<div class="space-y-1.5">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Scope Control</h3>
				<ul class="list-disc list-inside space-y-1 text-text-secondary text-xs">
					<li>Toggle individual components or entire phases in/out of scope</li>
					<li>Add exclusion reasons — select a preset or type a custom note</li>
					<li>Filter to view only in-scope or excluded components</li>
					<li>Search by component name</li>
				</ul>
			</div>
			<div class="space-y-1.5">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Role Hours & Tasks</h3>
				<ul class="list-disc list-inside space-y-1 text-text-secondary text-xs">
					<li>Expand any component to see its role breakdown</li>
					<li>Override hours per role — the delta is shown in real time</li>
					<li>Each role has auto-generated default tasks based on its type</li>
					<li>Add, edit, or remove tasks per role with keyboard support</li>
					<li>All changes persist to <code class="font-mono bg-surface-raised px-1">.migration/refinements.json</code></li>
				</ul>
			</div>
			<div class="space-y-1.5">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">Completing</h3>
				<p class="text-text-secondary text-xs">Click <strong>Mark Assessment Complete</strong> at the bottom to finalize your scope and lock in all refinements. Deliverables can be generated afterward using the <code class="font-mono bg-surface-raised px-1">/migrate plan</code> skill.</p>
			</div>
		</div>
	{:else if drawerSection === 'cascade'}
		<div class="space-y-4 text-sm">
			<p>Excluding components automatically cascades related items out of scope.</p>
			<div class="space-y-1.5">
				<h3 class="text-xs font-extrabold uppercase tracking-wider">What Gets Cascaded</h3>
				<ul class="list-disc list-inside space-y-1 text-text-secondary text-xs">
					<li><strong>Assumptions</strong> — Out if all affected components are excluded. Widening hours removed.</li>
					<li><strong>Risks</strong> — Out if linked only to excluded components.</li>
					<li><strong>AI Tools</strong> — Inactive if only apply to excluded components.</li>
				</ul>
			</div>
			<p class="text-text-secondary text-xs">Re-including a component immediately restores all its associated items.</p>
		</div>
	{/if}
</InfoDrawer>
