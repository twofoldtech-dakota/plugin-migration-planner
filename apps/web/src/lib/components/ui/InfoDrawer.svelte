<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		open: boolean;
		onclose: () => void;
		title: string;
		children: Snippet;
	}

	let { open, onclose, title, children }: Props = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && open) onclose();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- Backdrop -->
	<button
		class="fixed inset-0 bg-black/40 z-40 cursor-default"
		onclick={onclose}
		aria-label="Close drawer"
		tabindex="-1"
	></button>
{/if}

<!-- Panel -->
<div
	class="fixed top-0 right-0 bottom-0 w-full max-w-md z-50 bg-surface border-l-3 border-brutal shadow-lg flex flex-col transition-transform duration-200 {open ? 'translate-x-0' : 'translate-x-full'}"
>
	<!-- Header -->
	<div class="flex items-center justify-between border-b-3 border-brutal p-4">
		<h2 class="text-sm font-extrabold uppercase tracking-wider">{title}</h2>
		<button
			class="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text font-bold text-lg brutal-border-thin hover:bg-surface-hover transition-colors"
			onclick={onclose}
			aria-label="Close"
		>&times;</button>
	</div>

	<!-- Body -->
	<div class="overflow-y-auto p-6 flex-1">
		{@render children()}
	</div>
</div>
