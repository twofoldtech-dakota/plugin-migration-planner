<script lang="ts">
	let { active }: { active: boolean } = $props();

	let wasActive = $state(false);

	$effect(() => {
		if (active) {
			wasActive = true;
		} else if (wasActive) {
			// Keep showing bar briefly for completion animation
			const timeout = setTimeout(() => { wasActive = false; }, 350);
			return () => clearTimeout(timeout);
		}
	});
</script>

{#if active || wasActive}
	<div
		class="fixed top-0 left-0 right-0 z-[100] h-[3px] bg-primary nav-progress-bar"
		class:complete={!active && wasActive}
	></div>
{/if}
