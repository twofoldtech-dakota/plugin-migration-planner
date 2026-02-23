<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		hover?: boolean;
		padding?: string;
		children: Snippet;
	}

	let { hover = false, padding = 'p-6', children }: Props = $props();
</script>

<div
	class="brutal-border bg-surface shadow-md overflow-hidden {padding} {hover
		? 'transition-all duration-150 hover:-translate-x-px hover:-translate-y-px hover:shadow-lg active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none'
		: ''}"
>
	{@render children()}
</div>
