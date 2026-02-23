<script lang="ts">
	interface Props {
		value: number;
		max?: number;
		variant?: 'primary' | 'success' | 'warning' | 'danger';
	}

	let { value, max = 100, variant = 'primary' }: Props = $props();

	let percent = $derived(Math.min(100, Math.max(0, (value / max) * 100)));

	const barColors: Record<string, string> = {
		primary: 'bg-primary',
		success: 'bg-success',
		warning: 'bg-warning',
		danger: 'bg-danger'
	};
</script>

<div class="h-3 w-full overflow-hidden rounded brutal-border-thin bg-border-light">
	<div
		class="h-full transition-all duration-300 {barColors[variant]}"
		style="width: {percent}%"
	></div>
</div>
