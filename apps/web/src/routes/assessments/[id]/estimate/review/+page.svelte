<script lang="ts">
	import ChallengeReviewPage from '$lib/components/ChallengeReviewPage.svelte';

	let { data } = $props();
</script>

<ChallengeReviewPage
	step="estimate"
	stepLabel="Estimate"
	reviews={data.reviews}
	assessmentId={data.assessment?.id ?? ''}
/>
