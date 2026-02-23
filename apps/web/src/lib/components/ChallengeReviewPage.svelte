<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Stat from '$lib/components/ui/Stat.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import ConfidenceGauge from '$lib/components/ConfidenceGauge.svelte';
	import CollapsibleSection from '$lib/components/ui/CollapsibleSection.svelte';
	import Tooltip from '$lib/components/ui/Tooltip.svelte';

	interface Challenge {
		id: string;
		category: string;
		severity: string;
		description: string;
		data_reference: string;
		status: string;
		resolution: string | null;
		researcher_needed: boolean;
		score_impact: number;
	}

	interface Finding {
		challenge_id: string;
		finding: string;
		source: string;
		source_url: string | null;
		verified_date: string;
		recommendation: string;
		data_update_suggested: boolean;
	}

	interface ReviewRound {
		id: number;
		round: number;
		status: string;
		confidence_score: number;
		score_breakdown: Record<string, number>;
		acceptance_criteria_met: Record<string, boolean>;
		challenges: Challenge[];
		findings: Finding[];
		summary: string;
		created_at: string;
		completed_at: string | null;
	}

	interface Props {
		step: string;
		stepLabel: string;
		reviews: ReviewRound[];
		assessmentId: string;
	}

	let { step, stepLabel, reviews, assessmentId }: Props = $props();

	// Latest review is the last one
	const latest = $derived(reviews.length > 0 ? reviews[reviews.length - 1] : null);
	const score = $derived(latest?.confidence_score ?? 0);
	const breakdown = $derived(latest?.score_breakdown ?? {});
	const challenges = $derived((latest?.challenges ?? []) as Challenge[]);
	const findings = $derived((latest?.findings ?? []) as Finding[]);
	const criteria = $derived(latest?.acceptance_criteria_met ?? {});

	// Aggregate stats
	const openChallenges = $derived(challenges.filter(c => c.status === 'open'));
	const resolvedChallenges = $derived(challenges.filter(c => c.status === 'resolved'));
	const criticalHigh = $derived(challenges.filter(c => c.severity === 'critical' || c.severity === 'high'));
	const webFindings = $derived(findings.filter(f => f.source_url));

	// Tabs
	let activeTab = $state('overview');
	const tabs = $derived([
		{ id: 'overview', label: 'Overview' },
		{ id: 'challenges', label: 'Challenges', count: challenges.length },
		{ id: 'findings', label: 'Research', count: findings.length },
		{ id: 'history', label: 'Rounds', count: reviews.length }
	]);

	// Expanded challenge rows
	let expandedRows = $state<Record<string, boolean>>({});

	const dimensions = ['completeness', 'consistency', 'plausibility', 'currency', 'risk_coverage'];
	const dimensionLabels: Record<string, string> = {
		completeness: 'Completeness',
		consistency: 'Consistency',
		plausibility: 'Plausibility',
		currency: 'Currency',
		risk_coverage: 'Risk Coverage'
	};
	const dimensionWeights: Record<string, number> = {
		completeness: 25,
		consistency: 25,
		plausibility: 20,
		currency: 15,
		risk_coverage: 15
	};

	function severityVariant(severity: string): 'danger' | 'warning' | 'default' | 'success' {
		switch (severity) {
			case 'critical': return 'danger';
			case 'high': return 'danger';
			case 'medium': return 'warning';
			case 'low': return 'default';
			default: return 'default';
		}
	}

	function statusVariant(status: string): 'success' | 'warning' | 'danger' | 'default' | 'info' {
		switch (status) {
			case 'passed': return 'success';
			case 'conditional_pass': return 'warning';
			case 'failed': return 'danger';
			case 'in_progress': return 'info';
			case 'resolved': return 'success';
			case 'open': return 'warning';
			case 'accepted': return 'info';
			case 'deferred': return 'default';
			default: return 'default';
		}
	}

	function barWidth(value: number): string {
		return `${Math.max(0, Math.min(100, value))}%`;
	}

	function barColor(value: number): string {
		if (value >= 80) return 'bg-success';
		if (value >= 65) return 'bg-warning';
		return 'bg-danger';
	}
</script>

<svelte:head>
	<title>{stepLabel} Agent Review</title>
</svelte:head>

<div class="p-6 space-y-6">
	<div>
		<div class="flex items-center gap-2">
			<h1 class="text-xl font-extrabold uppercase tracking-wider">{stepLabel} Agent Review</h1>
			{#if latest}
				<Badge variant={statusVariant(latest.status)}>{latest.status.replace('_', ' ')}</Badge>
			{/if}
		</div>
		<p class="text-sm font-bold text-text-secondary mt-0.5">Agent review quality gate for the {step} step</p>
	</div>

	{#if !latest}
		<Card>
			<div class="py-8 text-center">
				<p class="text-lg font-extrabold uppercase tracking-wider text-text-secondary">No Agent Review Data</p>
				<p class="mt-2 text-sm text-text-muted max-w-md mx-auto">
					Run <code class="brutal-border-thin bg-surface px-1.5 py-0.5 text-xs font-mono">/migrate challenge {step}</code> to generate an agent review.
				</p>
			</div>
		</Card>
	{:else}
		<!-- Summary Cards -->
		<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
			<Card>
				<div class="flex flex-col items-center py-2">
					<ConfidenceGauge score={Math.round(score)} size="sm" />
				</div>
			</Card>
			<Card>
				<Stat label="Challenges" value={challenges.length} detail="{resolvedChallenges.length} resolved, {openChallenges.length} open" />
			</Card>
			<Card>
				<Stat label="Critical/High" value={criticalHigh.length} detail="{criticalHigh.filter(c => c.status === 'open').length} still open" />
			</Card>
			<Card>
				<Stat label="Research Findings" value={findings.length} detail="{webFindings.length} web-verified" />
			</Card>
			<Card>
				<Stat label="Rounds" value={reviews.length} detail="Round {latest.round} is latest" />
			</Card>
		</div>

		<!-- Tabs -->
		<Tabs {tabs} active={activeTab} onchange={(id) => activeTab = id}>
			{#if activeTab === 'overview'}
				<!-- Score Breakdown -->
				<Card padding="p-4">
					<h3 class="text-xs font-extrabold uppercase tracking-wider mb-4 pb-1.5 border-b-3 border-primary text-primary">Score Breakdown</h3>
					<div class="space-y-3">
						{#each dimensions as dim}
							{@const value = breakdown[dim] ?? 0}
							<div class="flex items-center gap-3">
								<span class="w-28 text-xs font-bold text-text-secondary">{dimensionLabels[dim]}</span>
								<span class="w-8 text-[10px] font-mono text-text-muted text-right">w{dimensionWeights[dim]}</span>
								<div class="flex-1 h-5 bg-border-light border-2 border-brutal relative">
									<div class="h-full {barColor(value)} transition-all duration-300" style="width: {barWidth(value)}"></div>
									<span class="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold font-mono {value > 50 ? 'text-white' : 'text-text'}">{Math.round(value)}%</span>
								</div>
							</div>
						{/each}
					</div>
				</Card>

				<!-- Acceptance Criteria -->
				{#if Object.keys(criteria).length > 0}
					<Card padding="p-4">
						<h3 class="text-xs font-extrabold uppercase tracking-wider mb-3 pb-1.5 border-b-3 border-primary text-primary">Acceptance Criteria</h3>
						<div class="grid gap-2 sm:grid-cols-2">
							{#each Object.entries(criteria) as [criterion, met]}
								<div class="flex items-center gap-2 px-3 py-2 border-2 {met ? 'border-success bg-success-light' : 'border-danger bg-danger-light'}">
									<span class="text-xs font-bold {met ? 'text-success' : 'text-danger'}">{met ? '\u2713' : '\u2717'}</span>
									<span class="text-sm font-bold">{criterion}</span>
								</div>
							{/each}
						</div>
					</Card>
				{/if}

				<!-- Summary -->
				{#if latest.summary}
					<Card padding="p-4">
						<h3 class="text-xs font-extrabold uppercase tracking-wider mb-3 pb-1.5 border-b-3 border-primary text-primary">Summary</h3>
						<p class="text-sm text-text-secondary whitespace-pre-wrap">{latest.summary}</p>
					</Card>
				{/if}

			{:else if activeTab === 'challenges'}
				<!-- Challenge List -->
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="bg-[#1a1a1a] text-white text-xs font-extrabold uppercase tracking-wider">
								<th class="text-left px-4 py-2.5">ID</th>
								<th class="text-left px-4 py-2.5">Category</th>
								<th class="text-left px-4 py-2.5">Description</th>
								<th class="text-center px-4 py-2.5 w-24">Severity</th>
								<th class="text-center px-4 py-2.5 w-24">Status</th>
								<th class="text-center px-4 py-2.5 w-16">Impact</th>
								<th class="text-center px-4 py-2.5 w-12"></th>
							</tr>
						</thead>
						<tbody>
							{#each challenges as challenge}
								{@const expanded = expandedRows[challenge.id]}
								<tr
									class="border-b border-border-light hover:bg-surface-hover transition-colors cursor-pointer select-none {expanded ? 'bg-surface-hover' : ''}"
									onclick={() => expandedRows[challenge.id] = !expanded}
									aria-expanded={expanded}
								>
									<td class="px-4 py-2.5 font-mono font-bold text-xs">{challenge.id}</td>
									<td class="px-4 py-2.5 text-text-secondary text-xs uppercase">{challenge.category}</td>
									<td class="px-4 py-2.5 max-w-xs truncate">{challenge.description}</td>
									<td class="px-4 py-2.5 text-center">
										<Badge variant={severityVariant(challenge.severity)}>{challenge.severity}</Badge>
									</td>
									<td class="px-4 py-2.5 text-center">
										<Badge variant={statusVariant(challenge.status)}>{challenge.status}</Badge>
									</td>
									<td class="px-4 py-2.5 text-center font-mono font-bold text-xs">+{challenge.score_impact}</td>
									<td class="px-4 py-2.5 text-center">
										<span class="inline-block text-xs text-text-muted transition-transform duration-200 {expanded ? 'rotate-90' : ''}" aria-hidden="true">&#9654;</span>
									</td>
								</tr>
								{#if expanded}
									<tr>
										<td colspan="7" class="px-4 py-4 bg-surface-hover border-b border-border-light">
											<div class="grid gap-4 sm:grid-cols-2">
												<div>
													<h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-1">Data Reference</h4>
													<p class="text-sm text-text-secondary font-mono">{challenge.data_reference || 'None'}</p>
												</div>
												{#if challenge.resolution}
													<div>
														<h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-1">Resolution</h4>
														<p class="text-sm text-text-secondary">{challenge.resolution}</p>
													</div>
												{/if}
												{#if challenge.researcher_needed}
													<div>
														<h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-1">Researcher</h4>
														<span class="px-2 py-0.5 text-xs font-bold bg-info-light text-info border border-info">Web research needed</span>
													</div>
												{/if}
												<!-- Linked findings -->
												{#if findings.filter(f => f.challenge_id === challenge.id).length > 0}
												{@const linkedFindings = findings.filter(f => f.challenge_id === challenge.id)}
													<div class="sm:col-span-2">
														<h4 class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-2">Research Findings</h4>
														<div class="space-y-2">
															{#each linkedFindings as finding}
																<div class="border-2 border-border-light p-3 bg-bg">
																	<p class="text-sm text-text-secondary">{finding.finding}</p>
																	{#if finding.source_url}
																		<a href={finding.source_url} target="_blank" rel="noopener noreferrer" class="text-xs text-primary font-bold mt-1 inline-block">
																			{finding.source_url}
																		</a>
																	{:else if finding.source}
																		<span class="text-xs text-text-muted font-mono mt-1 block">{finding.source}</span>
																	{/if}
																	<p class="text-xs text-text-muted mt-1">Verified: {finding.verified_date}</p>
																	{#if finding.recommendation}
																		<div class="mt-2 px-2 py-1.5 bg-success-light border border-success">
																			<span class="text-xs font-bold text-success">Recommendation:</span>
																			<p class="text-xs text-text-secondary mt-0.5">{finding.recommendation}</p>
																		</div>
																	{/if}
																	{#if finding.data_update_suggested}
																		<span class="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold bg-warning-light text-warning border border-warning">Knowledge update suggested</span>
																	{/if}
																</div>
															{/each}
														</div>
													</div>
												{/if}
											</div>
										</td>
									</tr>
								{/if}
							{/each}
						</tbody>
					</table>
				</div>

				{#if challenges.length === 0}
					<Card>
						<div class="py-4 text-center text-sm text-text-muted">No challenges recorded</div>
					</Card>
				{/if}

			{:else if activeTab === 'findings'}
				<!-- Research Findings -->
				<div class="space-y-3">
					{#each findings as finding}
						<Card padding="p-4">
							<div class="flex items-start justify-between gap-3">
								<div class="flex-1">
									<div class="flex items-center gap-2 mb-2">
										<span class="text-xs font-mono font-bold text-text-muted">{finding.challenge_id}</span>
										{#if finding.source_url}
											<span class="px-1.5 py-0.5 text-[10px] font-bold bg-info-light text-info border border-info">Web</span>
										{:else}
											<span class="px-1.5 py-0.5 text-[10px] font-bold bg-surface text-text-muted border border-border-light">Local</span>
										{/if}
										{#if finding.data_update_suggested}
											<span class="px-1.5 py-0.5 text-[10px] font-bold bg-warning-light text-warning border border-warning">Update suggested</span>
										{/if}
									</div>
									<p class="text-sm text-text-secondary">{finding.finding}</p>
									{#if finding.recommendation}
										<div class="mt-2 px-2 py-1.5 bg-success-light border border-success">
											<span class="text-xs font-bold text-success">Recommendation:</span>
											<p class="text-xs text-text-secondary mt-0.5">{finding.recommendation}</p>
										</div>
									{/if}
								</div>
								<div class="text-right shrink-0">
									{#if finding.source_url}
										<a href={finding.source_url} target="_blank" rel="noopener noreferrer" class="text-xs text-primary font-bold block truncate max-w-[200px]">
											Source
										</a>
									{:else}
										<span class="text-xs text-text-muted font-mono block truncate max-w-[200px]">{finding.source}</span>
									{/if}
									<span class="text-[10px] text-text-muted block mt-0.5">{finding.verified_date}</span>
								</div>
							</div>
						</Card>
					{/each}
				</div>

				{#if findings.length === 0}
					<Card>
						<div class="py-4 text-center text-sm text-text-muted">No research findings recorded</div>
					</Card>
				{/if}

			{:else if activeTab === 'history'}
				<!-- Round History -->
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="bg-[#1a1a1a] text-white text-xs font-extrabold uppercase tracking-wider">
								<th class="text-center px-4 py-2.5 w-20">Round</th>
								<th class="text-center px-4 py-2.5 w-24">Score</th>
								<th class="text-center px-4 py-2.5 w-24">Delta</th>
								<th class="text-center px-4 py-2.5 w-24">Status</th>
								<th class="text-center px-4 py-2.5 w-24">Challenges</th>
								<th class="text-center px-4 py-2.5 w-24">Findings</th>
								<th class="text-left px-4 py-2.5">Date</th>
							</tr>
						</thead>
						<tbody>
							{#each reviews as review, i}
								{@const prevScore = i > 0 ? reviews[i - 1].confidence_score : 0}
								{@const delta = i > 0 ? review.confidence_score - prevScore : review.confidence_score}
								{@const roundChallenges = (review.challenges ?? []) as Challenge[]}
								{@const roundFindings = (review.findings ?? []) as Finding[]}
								<tr class="border-b border-border-light {review.round === latest?.round ? 'bg-surface-hover' : ''}">
									<td class="px-4 py-2.5 text-center font-mono font-bold">{review.round}</td>
									<td class="px-4 py-2.5 text-center">
										<span class="font-mono font-bold {review.confidence_score >= 80 ? 'text-success' : review.confidence_score >= 65 ? 'text-warning' : 'text-danger'}">
											{Math.round(review.confidence_score)}%
										</span>
									</td>
									<td class="px-4 py-2.5 text-center font-mono text-xs {delta > 0 ? 'text-success font-bold' : delta < 0 ? 'text-danger font-bold' : 'text-text-muted'}">
										{delta > 0 ? '+' : ''}{Math.round(delta)}
									</td>
									<td class="px-4 py-2.5 text-center">
										<Badge variant={statusVariant(review.status)}>{review.status.replace('_', ' ')}</Badge>
									</td>
									<td class="px-4 py-2.5 text-center font-mono text-xs">{roundChallenges.length}</td>
									<td class="px-4 py-2.5 text-center font-mono text-xs">{roundFindings.length}</td>
									<td class="px-4 py-2.5 text-xs text-text-muted">{review.created_at ? new Date(review.created_at).toLocaleDateString() : '-'}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<!-- Score Progression -->
				{#if reviews.length > 1}
					<Card padding="p-4">
						<h3 class="text-xs font-extrabold uppercase tracking-wider mb-3 pb-1.5 border-b-3 border-primary text-primary">Score Progression</h3>
						<div class="flex items-end gap-2 h-32">
							{#each reviews as review, i}
								{@const height = Math.max(4, review.confidence_score)}
								<Tooltip text="Round {review.round}: {Math.round(review.confidence_score)}%" position="top">
									<div class="flex flex-col items-center gap-1 flex-1">
										<span class="text-[10px] font-mono font-bold">{Math.round(review.confidence_score)}%</span>
										<div
											class="w-full min-w-6 border-2 border-brutal transition-all duration-300
												{review.confidence_score >= 80 ? 'bg-success' : review.confidence_score >= 65 ? 'bg-warning' : 'bg-danger'}"
											style="height: {height}%"
										></div>
										<span class="text-[10px] text-text-muted">R{review.round}</span>
									</div>
								</Tooltip>
							{/each}
						</div>
						<!-- Threshold lines -->
						<div class="flex items-center gap-2 mt-2 text-[10px]">
							<span class="w-3 h-0.5 bg-success"></span>
							<span class="text-text-muted">Pass (80%)</span>
							<span class="w-3 h-0.5 bg-warning ml-2"></span>
							<span class="text-text-muted">Conditional (65%)</span>
						</div>
					</Card>
				{/if}
			{/if}
		</Tabs>

		<!-- Actions -->
		<Card padding="p-4">
			<div class="flex items-center justify-between">
				<div class="text-sm text-text-secondary">
					Run <code class="brutal-border-thin bg-surface px-1.5 py-0.5 text-xs font-mono">/migrate challenge {step}</code> to run another agent review round.
				</div>
			</div>
		</Card>
	{/if}
</div>
