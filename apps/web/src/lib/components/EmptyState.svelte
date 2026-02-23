<script lang="ts">
	import Card from './ui/Card.svelte';
</script>

<div class="mx-auto max-w-lg py-16 text-center">
	<Card>
		<div class="flex flex-col items-center gap-4 py-4">
			<div
				class="flex h-16 w-16 items-center justify-center brutal-border bg-primary-light text-3xl text-primary shadow-sm"
			>
				&#9733;
			</div>
			<h2 class="text-xl font-extrabold uppercase tracking-wider">No assessments yet</h2>
			<p class="text-text-secondary text-sm leading-relaxed max-w-sm">
				Get started by creating your first assessment using the wizard or the CLI.
			</p>
			<a
				href="/new"
				class="brutal-border-thin px-6 py-3 text-sm font-bold uppercase tracking-wider bg-primary text-white border-primary hover:bg-primary-hover transition-colors no-underline"
			>
				Start Your First Assessment
			</a>
			<div class="mt-2 w-full brutal-border-thin bg-bg p-4 text-left">
				<p class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-2">Or use the CLI:</p>
				<ol class="list-decimal list-inside text-sm text-text-secondary space-y-1.5">
					<li>Run <code class="brutal-border-thin bg-surface px-1.5 py-0.5 text-xs font-mono">/migrate-new</code> to create an assessment</li>
					<li>Run <code class="brutal-border-thin bg-surface px-1.5 py-0.5 text-xs font-mono">/migrate-discover</code> to gather project info</li>
					<li>Run <code class="brutal-border-thin bg-surface px-1.5 py-0.5 text-xs font-mono">/migrate-analyze</code> to identify risks</li>
					<li>Run <code class="brutal-border-thin bg-surface px-1.5 py-0.5 text-xs font-mono">/migrate-estimate</code> to generate hours</li>
				</ol>
			</div>
		</div>
	</Card>
</div>
