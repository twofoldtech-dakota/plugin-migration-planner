<script lang="ts">
	import ChallengeReviewPage from '$lib/components/ChallengeReviewPage.svelte';

	let { data } = $props();
</script>

<ChallengeReviewPage
	step="analysis"
	stepLabel="Analysis"
	reviews={data.reviews}
	assessmentId={data.assessment?.id ?? ''}
/>
