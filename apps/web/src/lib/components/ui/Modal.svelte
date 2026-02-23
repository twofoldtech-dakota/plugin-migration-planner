<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		open: boolean;
		onclose: () => void;
		title: string;
		size?: 'sm' | 'md' | 'lg';
		children: Snippet;
		footer?: Snippet;
	}

	let { open, onclose, title, size = 'md', children, footer }: Props = $props();

	const widths: Record<string, string> = {
		sm: 'max-w-md',
		md: 'max-w-2xl',
		lg: 'max-w-4xl'
	};

	let dialogEl = $state<HTMLDialogElement | null>(null);

	$effect(() => {
		if (!dialogEl) return;
		if (open && !dialogEl.open) {
			dialogEl.showModal();
		} else if (!open && dialogEl.open) {
			dialogEl.close();
		}
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && open) {
			e.preventDefault();
			onclose();
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === dialogEl) onclose();
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog
	bind:this={dialogEl}
	onkeydown={handleKeydown}
	onclick={handleBackdropClick}
	onclose={onclose}
	class="backdrop:bg-black/50 bg-transparent p-0 m-0 max-h-[100dvh] max-w-[100vw] w-full h-full open:flex items-center justify-center"
>
	<div class="brutal-border bg-surface text-text shadow-lg w-[calc(100%-2rem)] {widths[size]} flex flex-col max-h-[85vh]">
		<!-- Header -->
		<div class="flex items-center justify-between border-b-3 border-brutal px-5 py-3.5 shrink-0">
			<h2 class="text-sm font-extrabold uppercase tracking-wider truncate pr-4">{title}</h2>
			<button
				class="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text font-bold text-lg brutal-border-thin hover:bg-surface-hover transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
				onclick={onclose}
				aria-label="Close modal"
			>&times;</button>
		</div>

		<!-- Body -->
		<div class="overflow-y-auto px-5 py-4 flex-1 min-h-0">
			{@render children()}
		</div>

		<!-- Footer (optional) -->
		{#if footer}
			<div class="border-t-3 border-brutal px-5 py-3 shrink-0">
				{@render footer()}
			</div>
		{/if}
	</div>
</dialog>
