<script lang="ts">
	import { page } from '$app/state';

	const status = $derived(page.status);
	const message = $derived(page.error?.message ?? 'Something went wrong');

	const is404 = $derived(status === 404);

	const headline = $derived(is404 ? 'Page not found' : 'Something broke');
	const description = $derived(
		is404
			? "The page you're looking for doesn't exist or has been moved."
			: 'An unexpected error occurred. Try refreshing the page or head back to the dashboard.'
	);
</script>

<svelte:head>
	<title>{status} — {headline} | MigrateIQ</title>
</svelte:head>

<div class="mx-auto max-w-lg px-6 py-20 text-center animate-enter">
	<!-- Error code — big brutal display -->
	<div class="inline-flex items-center justify-center brutal-border bg-surface shadow-lg px-8 py-5 mb-8">
		<span class="text-7xl font-extrabold font-mono tracking-tighter text-primary leading-none">
			{status}
		</span>
	</div>

	<!-- Headline -->
	<h1 class="text-2xl font-extrabold uppercase tracking-wider mb-3">
		{headline}
	</h1>

	<!-- Description -->
	<p class="text-sm text-text-secondary leading-relaxed max-w-sm mx-auto mb-8">
		{description}
	</p>

	<!-- Error detail (non-404 only) -->
	{#if !is404 && message}
		<div class="brutal-border-thin bg-danger-light text-left px-4 py-3 mb-8 max-w-sm mx-auto">
			<span class="text-[10px] font-extrabold uppercase tracking-wider text-danger block mb-1">Error Detail</span>
			<p class="text-xs font-mono text-text break-words">{message}</p>
		</div>
	{/if}

	<!-- Actions -->
	<div class="flex items-center justify-center gap-3">
		<a
			href="/"
			class="brutal-border-thin px-6 py-3 text-sm font-bold uppercase tracking-wider bg-primary text-white border-primary hover:bg-primary-hover transition-colors no-underline"
		>
			Back to Dashboard
		</a>
		{#if !is404}
			<button
				onclick={() => location.reload()}
				class="brutal-border-thin px-6 py-3 text-sm font-bold uppercase tracking-wider bg-surface text-text hover:bg-surface-hover transition-colors cursor-pointer"
			>
				Retry
			</button>
		{/if}
	</div>
</div>
