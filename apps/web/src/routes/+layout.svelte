<script lang="ts">
	import '../app.css';
	import { onNavigate } from '$app/navigation';
	import { navigating } from '$app/state';
	import AppHeader from '$lib/components/AppHeader.svelte';
	import NavigationProgress from '$lib/components/NavigationProgress.svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

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

<div class="flex h-screen flex-col overflow-hidden">
	<AppHeader />
	<main class="flex-1 overflow-auto">
		{@render children()}
	</main>
</div>
