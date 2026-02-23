<script lang="ts">
	import { page } from '$app/state';

	interface Props {
		fromVersion: number;
		toVersion: number;
	}

	let { fromVersion, toVersion }: Props = $props();

	const exitUrl = $derived(() => {
		const base = `/assessments/${page.params.id}/estimate`;
		const params = new URLSearchParams();
		params.set('v', String(toVersion));
		const tab = page.url.searchParams.get('tab');
		if (tab) params.set('tab', tab);
		return `${base}?${params.toString()}`;
	});
</script>

<div class="brutal-border bg-primary-light border-primary flex items-center justify-between px-4 py-2.5">
	<div class="flex items-center gap-2">
		<span class="text-xs font-extrabold uppercase tracking-wider text-primary">Comparing</span>
		<span class="font-mono font-bold text-sm text-primary">v{fromVersion}</span>
		<span class="text-text-muted text-xs">&rarr;</span>
		<span class="font-mono font-bold text-sm text-primary">v{toVersion}</span>
	</div>
	<a
		href={exitUrl()}
		class="px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 border-brutal
			bg-surface text-text hover:bg-surface-hover transition-colors duration-150
			focus-visible:outline-2 focus-visible:outline-primary"
	>
		Exit Compare
	</a>
</div>
