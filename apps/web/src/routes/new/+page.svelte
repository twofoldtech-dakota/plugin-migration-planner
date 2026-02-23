<script lang="ts">
	import { goto } from '$app/navigation';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';

	let { data } = $props();

	// ── Step state ────────────────────────────────────────────
	let currentStep = $state(0);
	const steps = ['Client', 'Proficiency', 'Project', 'Review'] as const;

	// ── Step 1: Client ────────────────────────────────────────
	let clientMode = $state<'new' | 'existing'>('new');
	let newClientName = $state('');
	let newClientIndustry = $state('');
	let selectedClientId = $state<string | null>(null);
	let clientSearch = $state('');

	const filteredClients = $derived(
		data.clients.filter((c: any) =>
			c.name.toLowerCase().includes(clientSearch.toLowerCase())
		)
	);

	const selectedClient = $derived(
		clientMode === 'existing'
			? data.clients.find((c: any) => c.id === selectedClientId) ?? null
			: null
	);

	const clientName = $derived(
		clientMode === 'new' ? newClientName : (selectedClient?.name ?? '')
	);

	const step1Valid = $derived(
		clientMode === 'new' ? newClientName.trim().length > 0 : selectedClientId !== null
	);

	// ── Step 2: Proficiency ───────────────────────────────────
	const categories = $derived(data.catalog?.categories ?? {});
	const profLevels = $derived(data.catalog?.proficiency_levels ?? ['none', 'beginner', 'intermediate', 'advanced', 'expert']);

	let proficiencies = $state<Record<string, string>>({});

	// Initialize default proficiencies
	$effect(() => {
		if (Object.keys(categories).length > 0 && Object.keys(proficiencies).length === 0) {
			const defaults: Record<string, string> = {};
			for (const catId of Object.keys(categories)) {
				defaults[catId] = 'beginner';
			}
			proficiencies = defaults;
		}
	});

	const avgProficiency = $derived.by(() => {
		const values = Object.values(proficiencies);
		if (values.length === 0) return 'beginner';
		const order = ['none', 'beginner', 'intermediate', 'advanced', 'expert'];
		const avg = values.reduce((s, v) => s + order.indexOf(v), 0) / values.length;
		return order[Math.round(avg)] ?? 'beginner';
	});

	const shouldShowProficiency = $derived(
		clientMode === 'new' || (clientMode === 'existing' && selectedClient !== null)
	);

	// ── Step 3: Project ───────────────────────────────────────
	let projectName = $state('');
	let targetTimeline = $state('');
	let projectPath = $state('');

	// Source stack
	let sourcePlatform = $state('');
	let sourcePlatformVersion = $state('');
	let sourceTopology = $state('');
	let sourceInfrastructure = $state('');

	// Target stack
	let targetPlatform = $state('');
	let targetInfrastructure = $state('');

	// Derived pack data for dropdowns
	const selectedSourcePlatformPack = $derived(
		data.platforms.find((p: any) => p.id === sourcePlatform) ?? null
	);
	const sourceVersions = $derived(
		(selectedSourcePlatformPack?.supported_versions as string[]) ?? []
	);
	const sourceTopologies = $derived(
		(selectedSourcePlatformPack?.valid_topologies as string[]) ?? []
	);
	const targetPlatforms = $derived(
		selectedSourcePlatformPack
			? data.platforms.filter((p: any) => (selectedSourcePlatformPack.compatible_targets as string[])?.includes(p.id))
			: data.platforms
	);
	const targetInfraOptions = $derived(
		selectedSourcePlatformPack
			? data.infrastructure.filter((i: any) => (selectedSourcePlatformPack.compatible_infrastructure as string[])?.includes(i.id))
			: data.infrastructure
	);

	// Legacy compat fields (derived from stack selections)
	const sitecoreVersion = $derived(sourcePlatform === 'sitecore-xp' ? sourcePlatformVersion : '');
	const topology = $derived(sourceTopology);
	const sourceCloud = $derived(sourceInfrastructure || 'aws');
	const targetCloud = $derived(targetInfrastructure || 'azure');

	const step3Valid = $derived(projectName.trim().length > 0);

	// ── Step 4: Create ────────────────────────────────────────
	let creating = $state(false);
	let error = $state('');

	function generateId(prefix: string) {
		return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
	}

	async function createAssessment() {
		creating = true;
		error = '';

		try {
			let clientId: string;

			if (clientMode === 'new') {
				clientId = generateId('client');
				const profData: Record<string, { proficiency: string }> = {};
				for (const [catId, level] of Object.entries(proficiencies)) {
					profData[catId] = { proficiency: level };
				}

				const res = await fetch('/api/clients', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						id: clientId,
						name: newClientName.trim(),
						industry: newClientIndustry,
						proficiencies: profData
					})
				});
				if (!res.ok) throw new Error('Failed to create client');
			} else {
				clientId = selectedClientId!;
				// Save updated proficiencies for existing client
				const profData: Record<string, { proficiency: string }> = {};
				for (const [catId, level] of Object.entries(proficiencies)) {
					profData[catId] = { proficiency: level };
				}
				const res = await fetch(`/api/clients/${clientId}/proficiencies`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ proficiencies: profData })
				});
				if (!res.ok) throw new Error('Failed to save proficiencies');
			}

			const assessmentId = generateId('assess');

			// Build stack objects
			const sourceStackObj: Record<string, unknown> = {};
			if (sourcePlatform) {
				sourceStackObj.platform = sourcePlatform;
				if (sourcePlatformVersion) sourceStackObj.platform_version = sourcePlatformVersion;
				if (sourceTopology) sourceStackObj.topology = sourceTopology;
			}
			if (sourceInfrastructure) sourceStackObj.infrastructure = sourceInfrastructure;
			sourceStackObj.services = [];

			const targetStackObj: Record<string, unknown> = {};
			if (targetPlatform) targetStackObj.platform = targetPlatform;
			if (targetInfrastructure) targetStackObj.infrastructure = targetInfrastructure;
			targetStackObj.services = [];

			// Derive migration scope
			const migrationScopeObj: Record<string, unknown> = {};
			const layersAffected: string[] = [];
			if (sourcePlatform && targetPlatform && sourcePlatform !== targetPlatform) {
				migrationScopeObj.type = 're-platform';
				layersAffected.push('platform');
			} else if (sourcePlatform && !targetPlatform) {
				migrationScopeObj.type = 'cloud-migration';
			}
			if (sourceInfrastructure && targetInfrastructure && sourceInfrastructure !== targetInfrastructure) {
				layersAffected.push('infrastructure', 'services', 'data');
				if (!migrationScopeObj.type) migrationScopeObj.type = 'cloud-migration';
			}
			if (layersAffected.length > 0) migrationScopeObj.layers_affected = layersAffected;
			migrationScopeObj.complexity = layersAffected.length >= 3 ? 'major' : layersAffected.length >= 1 ? 'moderate' : 'minor';

			const res = await fetch('/api/assessments', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id: assessmentId,
					project_name: projectName.trim(),
					client_id: clientId,
					client_name: clientName,
					source_stack: sourceStackObj,
					target_stack: targetStackObj,
					migration_scope: migrationScopeObj,
					sitecore_version: sitecoreVersion,
					topology,
					source_cloud: sourceCloud,
					target_cloud: targetCloud,
					target_timeline: targetTimeline,
					project_path: projectPath.trim()
				})
			});
			if (!res.ok) throw new Error('Failed to create assessment');

			goto(`/assessments/${assessmentId}`);
		} catch (e: any) {
			error = e.message ?? 'Something went wrong';
			creating = false;
		}
	}

	function nextStep() {
		if (currentStep === 0 && !step1Valid) return;
		if (currentStep === 2 && !step3Valid) return;
		if (currentStep < steps.length - 1) currentStep++;
	}

	function prevStep() {
		if (currentStep > 0) currentStep--;
	}

	const profLevelLabels: Record<string, string> = {
		none: 'None',
		beginner: 'Beginner',
		intermediate: 'Intermediate',
		advanced: 'Advanced',
		expert: 'Expert'
	};

	const profLevelVariant: Record<string, 'danger' | 'warning' | 'default' | 'info' | 'success'> = {
		none: 'danger',
		beginner: 'warning',
		intermediate: 'default',
		advanced: 'info',
		expert: 'success'
	};
</script>

<svelte:head>
	<title>New Assessment | MigrateIQ</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-6 py-8 animate-enter">
	<!-- ── Header ─────────────────────────────────────────────── -->
	<div class="mb-8">
		<a href="/" class="text-sm font-bold text-text-muted hover:text-primary transition-colors">&larr; Back to Overview</a>
		<h1 class="text-2xl font-extrabold uppercase tracking-wider mt-4">New Assessment</h1>
	</div>

	<!-- ── Step indicator ─────────────────────────────────────── -->
	<div class="flex items-center gap-1 mb-8">
		{#each steps as step, i}
			<div class="flex-1 flex flex-col items-center gap-1.5">
				<div
					class="w-full h-2 rounded-sm transition-colors {i < currentStep ? 'bg-success' : i === currentStep ? 'bg-primary' : 'bg-border-light'}"
				></div>
				<span
					class="text-[10px] font-bold uppercase tracking-wider {i <= currentStep ? 'text-text' : 'text-text-muted'}"
				>
					{step}
				</span>
			</div>
			{#if i < steps.length - 1}
				<div class="w-2"></div>
			{/if}
		{/each}
	</div>

	<!-- ── Step 1: Client ─────────────────────────────────────── -->
	{#if currentStep === 0}
		<Card>
			<div class="space-y-6">
				<h2 class="text-lg font-extrabold uppercase tracking-wider">Select Client</h2>

				<!-- Radio: New / Existing -->
				<div class="flex gap-3">
					<button
						class="flex-1 brutal-border-thin px-4 py-3 text-sm font-bold uppercase tracking-wider transition-colors {clientMode === 'new' ? 'bg-primary text-white border-primary' : 'bg-surface hover:bg-surface-hover'}"
						onclick={() => clientMode = 'new'}
					>
						New Client
					</button>
					<button
						class="flex-1 brutal-border-thin px-4 py-3 text-sm font-bold uppercase tracking-wider transition-colors {clientMode === 'existing' ? 'bg-primary text-white border-primary' : 'bg-surface hover:bg-surface-hover'}"
						onclick={() => clientMode = 'existing'}
						disabled={data.clients.length === 0}
					>
						Existing Client
						{#if data.clients.length > 0}
							<span class="text-[10px] opacity-70">({data.clients.length})</span>
						{/if}
					</button>
				</div>

				{#if clientMode === 'new'}
					<div class="space-y-4">
						<div>
							<label class="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5" for="client-name">
								Client Name *
							</label>
							<input
								id="client-name"
								type="text"
								bind:value={newClientName}
								placeholder="e.g. Acme Corp"
								class="w-full brutal-border-thin bg-bg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-primary"
							/>
						</div>
						<div>
							<label class="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5" for="client-industry">
								Industry
							</label>
							<select
								id="client-industry"
								bind:value={newClientIndustry}
								class="w-full brutal-border-thin bg-bg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-primary"
							>
								<option value="">Select...</option>
								<option value="ecommerce">E-Commerce</option>
								<option value="finance">Finance</option>
								<option value="healthcare">Healthcare</option>
								<option value="manufacturing">Manufacturing</option>
								<option value="media">Media & Entertainment</option>
								<option value="retail">Retail</option>
								<option value="technology">Technology</option>
								<option value="other">Other</option>
							</select>
						</div>
					</div>
				{:else}
					<div class="space-y-3">
						<input
							type="text"
							bind:value={clientSearch}
							placeholder="Search clients..."
							class="w-full brutal-border-thin bg-bg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-primary"
						/>
						<div class="max-h-64 overflow-y-auto space-y-2">
							{#each filteredClients as client (client.id)}
								<button
									class="w-full text-left brutal-border-thin px-4 py-3 transition-colors {selectedClientId === client.id ? 'bg-primary-light border-primary' : 'bg-surface hover:bg-surface-hover'}"
									onclick={() => selectedClientId = client.id}
								>
									<span class="font-bold text-sm">{client.name}</span>
									{#if client.industry}
										<span class="text-xs text-text-muted ml-2">{client.industry}</span>
									{/if}
								</button>
							{:else}
								<p class="text-sm text-text-muted py-4 text-center">No clients found</p>
							{/each}
						</div>
					</div>
				{/if}

				<div class="flex justify-end pt-2">
					<button
						class="brutal-border-thin px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition-colors {step1Valid ? 'bg-primary text-white border-primary hover:bg-primary-hover' : 'bg-border-light text-text-muted cursor-not-allowed'}"
						onclick={nextStep}
						disabled={!step1Valid}
					>
						Next
					</button>
				</div>
			</div>
		</Card>
	{/if}

	<!-- ── Step 2: Proficiency ────────────────────────────────── -->
	{#if currentStep === 1}
		<Card>
			<div class="space-y-6">
				<div class="flex items-center justify-between">
					<h2 class="text-lg font-extrabold uppercase tracking-wider">Tech Proficiency</h2>
					<button
						class="text-xs font-bold text-text-muted hover:text-primary transition-colors uppercase tracking-wider"
						onclick={nextStep}
					>
						Skip (use defaults)
					</button>
				</div>
				<p class="text-sm text-text-secondary">
					Rate your team's experience in each technology area. This adjusts AI tool savings estimates to account for adoption overhead.
				</p>

				<div class="space-y-3">
					{#each Object.entries(categories) as [catId, cat] (catId)}
						<div class="brutal-border-thin bg-bg p-4">
							<div class="flex items-start justify-between gap-3 mb-2">
								<div class="min-w-0">
									<span class="text-sm font-bold">{cat.name}</span>
									<p class="text-xs text-text-muted">{cat.description}</p>
								</div>
							</div>
							<div class="flex gap-1">
								{#each profLevels as level}
									<button
										class="flex-1 px-1 py-1.5 text-[10px] font-bold uppercase tracking-wider brutal-border-thin transition-colors {proficiencies[catId] === level ? `bg-primary text-white border-primary` : 'bg-surface hover:bg-surface-hover'}"
										onclick={() => proficiencies[catId] = level}
									>
										{profLevelLabels[level] ?? level}
									</button>
								{/each}
							</div>
						</div>
					{/each}
				</div>

				<div class="flex justify-between pt-2">
					<button
						class="brutal-border-thin px-6 py-2.5 text-sm font-bold uppercase tracking-wider bg-surface hover:bg-surface-hover transition-colors"
						onclick={prevStep}
					>
						Back
					</button>
					<button
						class="brutal-border-thin px-6 py-2.5 text-sm font-bold uppercase tracking-wider bg-primary text-white border-primary hover:bg-primary-hover transition-colors"
						onclick={nextStep}
					>
						Next
					</button>
				</div>
			</div>
		</Card>
	{/if}

	<!-- ── Step 3: Project Details ────────────────────────────── -->
	{#if currentStep === 2}
		<Card>
			<div class="space-y-6">
				<h2 class="text-lg font-extrabold uppercase tracking-wider">Project Details</h2>

				<div class="space-y-4">
					<div>
						<label class="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5" for="project-name">
							Project Name *
						</label>
						<input
							id="project-name"
							type="text"
							bind:value={projectName}
							placeholder="e.g. Acme Corp Sitecore Migration"
							class="w-full brutal-border-thin bg-bg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-primary"
						/>
					</div>

					<!-- Source Stack -->
					<div class="brutal-border-thin bg-surface p-4 space-y-4">
						<span class="text-xs font-extrabold uppercase tracking-wider text-text-muted">Source Stack</span>
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label class="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5" for="source-platform">
									Platform
								</label>
								<select
									id="source-platform"
									bind:value={sourcePlatform}
									class="w-full brutal-border-thin bg-bg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-primary"
								>
									<option value="">Select...</option>
									{#each data.platforms as pack}
										<option value={pack.id}>{pack.name}</option>
									{/each}
								</select>
							</div>
							<div>
								<label class="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5" for="source-version">
									Version
								</label>
								<select
									id="source-version"
									bind:value={sourcePlatformVersion}
									disabled={sourceVersions.length === 0}
									class="w-full brutal-border-thin bg-bg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-primary disabled:opacity-50"
								>
									<option value="">Select...</option>
									{#each sourceVersions as v}
										<option value={v}>{v}</option>
									{/each}
								</select>
							</div>
						</div>
						<div class="grid grid-cols-2 gap-4">
							{#if sourceTopologies.length > 0}
								<div>
									<label class="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5" for="source-topology">
										Topology
									</label>
									<select
										id="source-topology"
										bind:value={sourceTopology}
										class="w-full brutal-border-thin bg-bg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-primary"
									>
										<option value="">Select...</option>
										{#each sourceTopologies as t}
											<option value={t}>{t.replace(/_/g, ' ').toUpperCase()}</option>
										{/each}
									</select>
								</div>
							{/if}
							<div>
								<label class="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5" for="source-infra">
									Infrastructure
								</label>
								<select
									id="source-infra"
									bind:value={sourceInfrastructure}
									class="w-full brutal-border-thin bg-bg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-primary"
								>
									<option value="">Select...</option>
									{#each data.infrastructure as infra}
										<option value={infra.id}>{infra.name}</option>
									{/each}
								</select>
							</div>
						</div>
					</div>

					<!-- Target Stack -->
					<div class="brutal-border-thin bg-surface p-4 space-y-4">
						<span class="text-xs font-extrabold uppercase tracking-wider text-text-muted">Target Stack</span>
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label class="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5" for="target-platform">
									Platform
								</label>
								<select
									id="target-platform"
									bind:value={targetPlatform}
									class="w-full brutal-border-thin bg-bg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-primary"
								>
									<option value="">Same / None</option>
									{#each targetPlatforms as pack}
										<option value={pack.id}>{pack.name}</option>
									{/each}
								</select>
							</div>
							<div>
								<label class="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5" for="target-infra">
									Infrastructure
								</label>
								<select
									id="target-infra"
									bind:value={targetInfrastructure}
									class="w-full brutal-border-thin bg-bg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-primary"
								>
									<option value="">Select...</option>
									{#each targetInfraOptions as infra}
										<option value={infra.id}>{infra.name}</option>
									{/each}
								</select>
							</div>
						</div>
					</div>

					<div>
						<label class="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5" for="timeline">
							Target Timeline
						</label>
						<input
							id="timeline"
							type="text"
							bind:value={targetTimeline}
							placeholder="e.g. Q3 2026"
							class="w-full brutal-border-thin bg-bg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-primary"
						/>
					</div>

					<div>
						<label class="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5" for="project-path">
							Project Path
						</label>
						<input
							id="project-path"
							type="text"
							bind:value={projectPath}
							placeholder="e.g. /Users/dev/projects/acme-sitecore (optional)"
							class="w-full brutal-border-thin bg-bg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-primary"
						/>
						<p class="text-[10px] text-text-muted mt-1">Enter the local path where this project lives, or leave blank to assign later.</p>
					</div>
				</div>

				<div class="flex justify-between pt-2">
					<button
						class="brutal-border-thin px-6 py-2.5 text-sm font-bold uppercase tracking-wider bg-surface hover:bg-surface-hover transition-colors"
						onclick={prevStep}
					>
						Back
					</button>
					<button
						class="brutal-border-thin px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition-colors {step3Valid ? 'bg-primary text-white border-primary hover:bg-primary-hover' : 'bg-border-light text-text-muted cursor-not-allowed'}"
						onclick={nextStep}
						disabled={!step3Valid}
					>
						Next
					</button>
				</div>
			</div>
		</Card>
	{/if}

	<!-- ── Step 4: Review & Create ────────────────────────────── -->
	{#if currentStep === 3}
		<Card>
			<div class="space-y-6">
				<h2 class="text-lg font-extrabold uppercase tracking-wider">Review & Create</h2>

				<!-- Client summary -->
				<div class="brutal-border-thin bg-bg p-4 space-y-2">
					<div class="flex items-center justify-between">
						<span class="text-xs font-bold uppercase tracking-wider text-text-muted">Client</span>
						<button class="text-xs font-bold text-primary hover:text-primary-hover" onclick={() => currentStep = 0}>Edit</button>
					</div>
					<p class="font-bold">{clientName}</p>
					{#if clientMode === 'new' && newClientIndustry}
						<p class="text-sm text-text-secondary">{newClientIndustry}</p>
					{/if}
				</div>

				<!-- Proficiency summary -->
				<div class="brutal-border-thin bg-bg p-4 space-y-2">
					<div class="flex items-center justify-between">
						<span class="text-xs font-bold uppercase tracking-wider text-text-muted">Tech Proficiency</span>
						<button class="text-xs font-bold text-primary hover:text-primary-hover" onclick={() => currentStep = 1}>Edit</button>
					</div>
					<div class="flex items-center gap-2">
						<span class="text-sm">{Object.keys(proficiencies).length} categories</span>
						<Badge variant={profLevelVariant[avgProficiency] ?? 'default'}>avg: {avgProficiency}</Badge>
					</div>
					<div class="flex flex-wrap gap-1 mt-1">
						{#each Object.entries(proficiencies) as [catId, level]}
							{@const cat = categories[catId]}
							{#if cat}
								<span class="text-[10px] brutal-border-thin px-1.5 py-0.5 bg-surface">
									{cat.name}: <strong>{level}</strong>
								</span>
							{/if}
						{/each}
					</div>
				</div>

				<!-- Project summary -->
				<div class="brutal-border-thin bg-bg p-4 space-y-2">
					<div class="flex items-center justify-between">
						<span class="text-xs font-bold uppercase tracking-wider text-text-muted">Project</span>
						<button class="text-xs font-bold text-primary hover:text-primary-hover" onclick={() => currentStep = 2}>Edit</button>
					</div>
					<p class="font-bold">{projectName}</p>
					<div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-secondary">
						{#if sourcePlatform}
							{@const pack = data.platforms.find((p: any) => p.id === sourcePlatform)}
							<span>{pack?.name ?? sourcePlatform}{sourcePlatformVersion ? ` ${sourcePlatformVersion}` : ''}</span>
						{/if}
						{#if sourceTopology}<span>{sourceTopology.replace(/_/g, ' ').toUpperCase()}</span>{/if}
						{#if sourceInfrastructure || targetInfrastructure}
							{@const srcName = data.infrastructure.find((i: any) => i.id === sourceInfrastructure)?.name ?? sourceInfrastructure}
							{@const tgtName = data.infrastructure.find((i: any) => i.id === targetInfrastructure)?.name ?? targetInfrastructure}
							<span>{srcName || '?'} &rarr; {tgtName || '?'}</span>
						{/if}
						{#if targetTimeline}<span>{targetTimeline}</span>{/if}
					</div>
					{#if projectPath}
						<p class="text-xs font-mono text-text-muted">{projectPath}</p>
					{/if}
				</div>

				{#if error}
					<div class="brutal-border-thin bg-danger-light text-danger px-4 py-3 text-sm font-bold">
						{error}
					</div>
				{/if}

				<div class="flex justify-between pt-2">
					<button
						class="brutal-border-thin px-6 py-2.5 text-sm font-bold uppercase tracking-wider bg-surface hover:bg-surface-hover transition-colors"
						onclick={prevStep}
					>
						Back
					</button>
					<button
						class="brutal-border-thin px-6 py-2.5 text-sm font-bold uppercase tracking-wider bg-primary text-white border-primary hover:bg-primary-hover transition-colors {creating ? 'opacity-60 cursor-wait' : ''}"
						onclick={createAssessment}
						disabled={creating}
					>
						{creating ? 'Creating...' : 'Create Assessment'}
					</button>
				</div>
			</div>
		</Card>
	{/if}
</div>
