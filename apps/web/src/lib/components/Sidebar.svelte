<script lang="ts">
	import { page } from '$app/state';

	interface ChallengeReviewInfo {
		step: string;
		latestRound: number;
		latestStatus: string;
		confidenceScore: number;
	}

	interface Summary {
		hasDiscovery: boolean;
		hasAnalysis: boolean;
		hasEstimate: boolean;
		hasRefine: boolean;
		hasDeliverables: boolean;
		challengeReviews?: Record<string, ChallengeReviewInfo>;
	}

	interface Props {
		assessmentId: string;
		projectName: string;
		summary?: Summary;
	}

	let { assessmentId, projectName, summary }: Props = $props();

	const base = $derived(`/assessments/${assessmentId}`);

	const links = [
		{ href: '',              label: 'Overview',        step: '\u2460', key: 'always',          reviewStep: null },
		{ href: '/discovery',    label: 'Discovery',      step: '\u2461', key: 'hasDiscovery',    reviewStep: 'discovery' },
		{ href: '/analysis',     label: 'Analysis',       step: '\u2462', key: 'hasAnalysis',     reviewStep: 'analysis' },
		{ href: '/estimate',     label: 'Estimate',       step: '\u2463', key: 'hasEstimate',     reviewStep: 'estimate' },
		{ href: '/refine',       label: 'Refine',         step: '\u2464', key: 'hasRefine',       reviewStep: 'refine' },
		{ href: '/deliverables', label: 'Deliverables',   step: '\u2465', key: 'hasDeliverables', reviewStep: null }
	];

	function isActive(href: string): boolean {
		const fullPath = base + href;
		if (href === '') return page.url.pathname === base || page.url.pathname === base + '/';
		return page.url.pathname.startsWith(fullPath);
	}

	function isReviewActive(href: string): boolean {
		return page.url.pathname === base + href + '/review';
	}

	function isComplete(key: string): boolean {
		if (key === 'always') return true;
		return summary?.[key as keyof Summary] ?? false;
	}

	function getReview(step: string | null): ChallengeReviewInfo | null {
		if (!step || !summary?.challengeReviews) return null;
		return summary.challengeReviews[step] ?? null;
	}

	function reviewColor(status: string, score: number): string {
		if (status === 'passed' || score >= 80) return 'text-success';
		if (status === 'conditional_pass' || score >= 65) return 'text-warning';
		return 'text-danger';
	}

	function reviewIcon(status: string): string {
		if (status === 'passed') return '\u2713';
		if (status === 'conditional_pass') return '\u26A0';
		return '\u2717';
	}

	function diamondColor(review: ChallengeReviewInfo | null): string {
		if (!review) return 'bg-border-light';
		if (review.latestStatus === 'passed' || review.confidenceScore >= 80) return 'bg-success';
		if (review.latestStatus === 'conditional_pass' || review.confidenceScore >= 65) return 'bg-warning';
		return 'bg-danger';
	}
</script>

<aside class="w-56 shrink-0 border-r-3 border-brutal bg-surface min-h-full">
	<div class="p-4 border-b-3 border-brutal">
		<h2 class="text-sm font-extrabold uppercase tracking-wider text-text break-words">{projectName}</h2>
	</div>
	<nav class="flex flex-col gap-1 p-2">
		{#each links as link}
			<a
				href="{base}{link.href}"
				class="flex items-center gap-2.5 px-3 py-2 text-sm font-bold no-underline transition-all duration-150
					{isActive(link.href) && !isReviewActive(link.href)
					? 'brutal-border-thin bg-primary text-white shadow-sm -translate-x-px -translate-y-px'
					: 'text-text-secondary hover:bg-surface-hover hover:text-text'}"
			>
				<span class="w-6 text-center text-base leading-none">{link.step}</span>
				<span class="flex-1">{link.label}</span>
				{#if isComplete(link.key) && (!isActive(link.href) || isReviewActive(link.href))}
					<span class="text-success text-xs">&#10003;</span>
				{/if}
			</a>
			{#if link.reviewStep && isComplete(link.key)}
				{@const review = getReview(link.reviewStep)}
				<a
					href="{base}{link.href}/review"
					class="flex items-center gap-2 pl-10 pr-3 py-1.5 text-xs font-bold no-underline transition-all duration-150
						{isReviewActive(link.href)
						? 'brutal-border-thin bg-primary text-white shadow-sm -translate-x-px -translate-y-px'
						: 'text-text-muted hover:bg-surface-hover hover:text-text'}"
				>
					<span class="w-1.5 h-1.5 rotate-45 {diamondColor(review)} shrink-0"></span>
					<span class="flex-1">Review</span>
					{#if review}
						<span class="{reviewColor(review.latestStatus, review.confidenceScore)} font-mono text-[10px]">
							{Math.round(review.confidenceScore)}% {reviewIcon(review.latestStatus)}
						</span>
					{/if}
				</a>
			{/if}
		{/each}
	</nav>
</aside>
