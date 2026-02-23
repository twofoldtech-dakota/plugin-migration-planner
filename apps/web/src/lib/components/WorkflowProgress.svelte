<script lang="ts">
	import Tooltip from './ui/Tooltip.svelte';

	interface Step {
		label: string;
		href: string;
		status: 'complete' | 'in-progress' | 'not-started';
		detail?: string;
	}

	interface ReviewInfo {
		step: string;
		latestRound: number;
		latestStatus: string;
		confidenceScore: number;
	}

	interface Props {
		steps: Step[];
		reviews?: Record<string, ReviewInfo>;
		baseHref?: string;
	}

	let { steps, reviews = {}, baseHref = '' }: Props = $props();

	const stepTooltips: Record<string, string> = {
		'Discovery': 'Gather infrastructure and environment details across all dimensions.',
		'Analysis': 'Identify risks, assumptions, complexity multipliers, and data gaps.',
		'Estimate': 'Calculate hours by phase and component with AI tool savings.',
		'Refine': 'Adjust scope by excluding components and customizing AI tools.',
		'Deliverables': 'Generate migration plan, risk register, runbook, and dashboard.'
	};

	const stepToReviewKey: Record<string, string> = {
		'Discovery': 'discovery',
		'Analysis': 'analysis',
		'Estimate': 'estimate',
		'Refine': 'refine'
	};

	function reviewDiamondColor(review: ReviewInfo | null | undefined): string {
		if (!review) return 'bg-border-light border-border-light';
		if (review.latestStatus === 'passed' || review.confidenceScore >= 80) return 'bg-success border-success';
		if (review.latestStatus === 'conditional_pass' || review.confidenceScore >= 65) return 'bg-warning border-warning';
		return 'bg-danger border-danger';
	}

	function reviewTooltip(review: ReviewInfo | null | undefined, stepLabel: string): string {
		if (!review) return `${stepLabel} agent review not yet run`;
		return `${stepLabel} agent review: ${Math.round(review.confidenceScore)}% (${review.latestStatus.replace('_', ' ')})`;
	}

	function getReview(stepLabel: string): ReviewInfo | null {
		const key = stepToReviewKey[stepLabel];
		if (!key) return null;
		return reviews[key] ?? null;
	}

	function getReviewHref(step: Step): string {
		return step.href + '/review';
	}

	function connectorColor(step: Step): string {
		return step.status === 'complete' ? 'bg-success' : 'bg-border-light';
	}
</script>

<!-- Timeline: nodes + connectors in a single flex row -->
<div class="flex items-start w-full px-[52px]">
	{#each steps as step, i}
		{@const isComplete = step.status === 'complete'}
		{@const isActive = step.status === 'in-progress'}
		{@const isNotStarted = step.status === 'not-started'}

		<!-- Step column -->
		<div class="flex flex-col items-center" style="width: 0; flex: 0 0 auto;">
			<!-- Node -->
			<a href={step.href} class="no-underline group relative z-10" aria-label="{step.label}">
				<Tooltip text={stepTooltips[step.label] ?? ''} position="bottom">
					<div class="
						flex items-center justify-center
						w-11 h-11 border-3 font-extrabold text-sm
						transition-all duration-150
						{isComplete ? 'bg-success border-success text-white' : ''}
						{isActive ? 'bg-primary border-primary text-white' : ''}
						{isNotStarted ? 'bg-surface border-brutal text-text-muted' : ''}
						group-hover:-translate-y-0.5 group-hover:shadow-md
					">
						{#if isComplete}
							<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
								<path d="M3 9.5L7 14L15 4" stroke="white" stroke-width="2.5" stroke-linecap="square" stroke-linejoin="miter"/>
							</svg>
						{:else if isActive}
							<span class="relative flex h-3 w-3">
								<span class="animate-ping absolute inline-flex h-full w-full bg-white opacity-60"></span>
								<span class="relative inline-flex h-3 w-3 bg-white"></span>
							</span>
						{:else}
							<span class="font-mono text-sm">{i + 1}</span>
						{/if}
					</div>
				</Tooltip>
			</a>

			<!-- Label + detail below node -->
			<a href={step.href} class="no-underline flex flex-col items-center mt-2 group">
				<span class="text-[11px] font-extrabold uppercase tracking-wider whitespace-nowrap {isNotStarted ? 'text-text-muted' : 'text-text'} group-hover:text-primary transition-colors">
					{step.label}
				</span>
				{#if step.detail}
					<span class="
						mt-0.5 text-[10px] font-bold font-mono px-1.5 py-0.5 leading-none border
						{isComplete ? 'bg-success-light text-success border-success' : ''}
						{isActive ? 'bg-primary-light text-primary border-primary' : ''}
						{isNotStarted ? 'text-text-muted border-transparent' : ''}
					">
						{step.detail}
					</span>
				{/if}
			</a>
		</div>

		<!-- Connector between steps -->
		{#if i < steps.length - 1}
			{@const review = getReview(step.label)}
			{@const hasReview = !!stepToReviewKey[step.label]}
			<div class="flex items-center flex-1 mt-[18px]">
				<!-- Left segment of connector -->
				<div class="h-[3px] flex-1 {connectorColor(step)}"></div>

				<!-- Review diamond in the middle -->
				{#if hasReview}
					<Tooltip text={reviewTooltip(review, step.label)} position="bottom">
						<a href={getReviewHref(step)} class="no-underline mx-1 relative z-10" aria-label="{step.label} agent review">
							<div class="w-[18px] h-[18px] rotate-45 border-2 {reviewDiamondColor(review)} hover:scale-125 transition-all"></div>
						</a>
					</Tooltip>
				{/if}

				<!-- Right segment of connector -->
				<div class="h-[3px] flex-1 {connectorColor(step)}"></div>
			</div>
		{/if}
	{/each}
</div>
