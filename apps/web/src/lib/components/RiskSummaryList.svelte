<script lang="ts">
	import Badge from './ui/Badge.svelte';
	import Tooltip from './ui/Tooltip.svelte';
	import { severityVariant } from '$lib/utils/migration-stats';

	interface Props {
		risks: any[];
		limit?: number;
		assessmentId: string;
	}

	let { risks, limit = 5, assessmentId }: Props = $props();
</script>

{#if risks.length === 0}
	<p class="text-sm text-text-muted text-center py-4">No risks identified</p>
{:else}
	<div class="space-y-2">
		{#each risks.slice(0, limit) as risk}
			<div class="flex items-center gap-3 px-3 py-2 border border-border-light hover:bg-surface-hover transition-colors">
				<Tooltip text="{risk.likelihood} likelihood | {risk.category}">
					<Badge variant={severityVariant(risk.severity)}>
						{risk.severity}
					</Badge>
				</Tooltip>
				<Tooltip text={risk.mitigation ?? risk.description} position="bottom" block>
					<span class="text-sm block truncate">{risk.description}</span>
				</Tooltip>
				<span class="text-xs font-mono font-bold shrink-0">+{risk.estimated_hours_impact}h</span>
			</div>
		{/each}
		{#if risks.length > limit}
			<p class="text-xs text-text-muted text-center pt-1">
				+{risks.length - limit} more risks — <a href="/assessments/{assessmentId}/analysis" class="text-primary font-bold">View all</a>
			</p>
		{/if}
	</div>
{/if}
