<script lang="ts">
	import Card from './Card.svelte';
	import Badge from './Badge.svelte';
	import ProgressBar from './ProgressBar.svelte';
	import Tooltip from './Tooltip.svelte';

	interface Props {
		label: string;
		value: string | number;
		detail?: string;
		href?: string;
		variant?: 'primary' | 'success' | 'warning' | 'danger';
		progress?: number;
		tooltip?: string;
	}

	let { label, value, detail, href, variant, progress, tooltip }: Props = $props();
</script>

{#snippet labelContent()}
	{#if tooltip}
		<Tooltip text={tooltip} position="bottom">
			<span class="text-xs font-bold uppercase tracking-wider text-text-muted cursor-help">{label}</span>
		</Tooltip>
	{:else}
		<span class="text-xs font-bold uppercase tracking-wider text-text-muted">{label}</span>
	{/if}
{/snippet}

{#if href}
	<a {href} class="no-underline group block">
		<Card hover>
			<div class="space-y-3">
				<div class="flex items-start justify-between gap-2">
					<div>
						{@render labelContent()}
						<p class="text-2xl font-extrabold font-mono mt-0.5">{value}</p>
						{#if detail}
							<p class="text-xs text-text-secondary mt-0.5">{detail}</p>
						{/if}
					</div>
					<span class="text-text-muted group-hover:text-primary transition-colors text-lg">&#8594;</span>
				</div>
				{#if progress !== undefined && variant}
					<ProgressBar value={progress} {variant} />
				{/if}
			</div>
		</Card>
	</a>
{:else}
	<Card>
		<div class="space-y-3">
			<div>
				{@render labelContent()}
				<p class="text-2xl font-extrabold font-mono mt-0.5">{value}</p>
				{#if detail}
					<p class="text-xs text-text-secondary mt-0.5">{detail}</p>
				{/if}
			</div>
			{#if progress !== undefined && variant}
				<ProgressBar value={progress} {variant} />
			{/if}
		</div>
	</Card>
{/if}
