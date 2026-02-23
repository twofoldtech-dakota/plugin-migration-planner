<script lang="ts">
	interface Props {
		variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted';
		children: import('svelte').Snippet;
	}

	let { variant = 'default', children }: Props = $props();

	const colors: Record<string, string> = {
		default: 'bg-primary-light text-primary border-primary',
		success: 'bg-success-light text-success border-success',
		warning: 'bg-warning-light text-warning border-warning',
		danger:  'bg-danger-light text-danger border-danger',
		info:    'bg-info-light text-info border-info',
		muted:   'bg-surface text-text-muted border-border-light',
	};
</script>

<span
	class="inline-flex items-center rounded-none px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest border-2 {colors[variant]}"
>
	{@render children()}
</span>
