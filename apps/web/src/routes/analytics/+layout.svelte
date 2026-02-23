<script lang="ts">
	import AnalyticsNav from '$lib/components/analytics/AnalyticsNav.svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="mx-auto max-w-7xl px-6 pt-8 pb-12 animate-enter">
	<div class="mb-6">
		<a href="/" class="text-xs font-bold text-primary hover:text-primary-hover no-underline mb-2 inline-block">
			&larr; Dashboard
		</a>
		<h1 class="text-2xl font-extrabold uppercase tracking-wider">Analytics</h1>
	</div>

	<div class="mb-8">
		<AnalyticsNav />
	</div>

	{@render children()}
</div>
