<script lang="ts">
	import '../app.css';
	import { onNavigate, afterNavigate } from '$app/navigation';
	import { navigating } from '$app/state';
	import { onMount, onDestroy } from 'svelte';
	import AppHeader from '$lib/components/AppHeader.svelte';
	import NavigationProgress from '$lib/components/NavigationProgress.svelte';
	import { tracker } from '$lib/utils/analytics-tracking';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	onMount(() => tracker.init());
	onDestroy(() => tracker.destroy());

	afterNavigate(({ to }) => {
		if (to?.url) {
			const assessmentMatch = to.url.pathname.match(/\/assessments\/([^/]+)/);
			tracker.trackPageView(to.url.pathname, assessmentMatch?.[1]);
		}
	});

	onNavigate((navigation) => {
		document.documentElement.classList.add('has-navigated');

		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<NavigationProgress active={navigating.to !== null} />

<div class="min-h-screen flex flex-col">
	<AppHeader />
	<main class="flex-1">
		{@render children()}
	</main>
</div>
