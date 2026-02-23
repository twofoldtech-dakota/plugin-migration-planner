<script lang="ts">
	import Tooltip from './ui/Tooltip.svelte';

	interface Props {
		score: number;
		confirmed?: number;
		assumed?: number;
		unknown?: number;
		size?: 'sm' | 'md';
	}

	let { score, confirmed = 0, assumed = 0, unknown = 0, size = 'md' }: Props = $props();

	const angle = $derived((score / 100) * 180);
	const rad = $derived((angle * Math.PI) / 180);
	const endX = $derived(100 - 80 * Math.cos(rad));
	const endY = $derived(100 - 80 * Math.sin(rad));
	const largeArc = $derived(angle > 180 ? 1 : 0);
	const color = $derived(score >= 70 ? 'var(--color-success)' : score >= 40 ? 'var(--color-warning)' : 'var(--color-danger)');

	const width = $derived(size === 'sm' ? 150 : 200);
	const height = $derived(size === 'sm' ? 90 : 120);
</script>

<div class="flex flex-col items-center">
	<svg {width} {height} viewBox="0 0 200 120">
		<path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="var(--color-border-light)" stroke-width="12" stroke-linecap="round" />
		<path
			d="M 20 100 A 80 80 0 {largeArc} 1 {endX} {endY}"
			fill="none"
			stroke={color}
			stroke-width="12"
			stroke-linecap="round"
		/>
		<text x="100" y="90" text-anchor="middle" class="text-3xl font-extrabold font-mono" fill="var(--color-text)">{score}%</text>
		<text x="100" y="108" text-anchor="middle" class="text-xs font-bold" fill="var(--color-text-muted)">CONFIDENCE</text>
	</svg>
	{#if confirmed > 0 || assumed > 0 || unknown > 0}
		<div class="grid grid-cols-3 gap-2 mt-2 text-center text-xs w-full">
			<Tooltip text="Answers verified by the client or evidence" position="bottom">
				<div>
					<span class="font-bold text-success">{confirmed}</span>
					<span class="block text-text-muted cursor-help">Confirmed</span>
				</div>
			</Tooltip>
			<Tooltip text="Answers based on assumptions that need validation" position="bottom">
				<div>
					<span class="font-bold text-warning">{assumed}</span>
					<span class="block text-text-muted cursor-help">Assumed</span>
				</div>
			</Tooltip>
			<Tooltip text="Missing data points that reduce confidence" position="bottom">
				<div>
					<span class="font-bold text-danger">{unknown}</span>
					<span class="block text-text-muted cursor-help">Unknown</span>
				</div>
			</Tooltip>
		</div>
	{/if}
</div>
