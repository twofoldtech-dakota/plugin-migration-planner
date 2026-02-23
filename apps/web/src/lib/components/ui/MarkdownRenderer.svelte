<script lang="ts">
	import { marked } from 'marked';

	interface Props {
		content: string;
		class?: string;
	}

	let { content, class: className = '' }: Props = $props();

	const html = $derived(
		marked.parse(content, {
			gfm: true,
			breaks: false
		}) as string
	);
</script>

<div class="md-root {className}">
	{@html html}
</div>

<style>
	/* ── Root ──────────────────────────────────────────── */
	.md-root {
		font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
		color: var(--color-text);
		line-height: 1.7;
		font-size: 0.875rem;
	}

	/* ── Headings ─────────────────────────────────────── */
	.md-root :global(h1) {
		font-size: 1.25rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text);
		border-bottom: 3px solid var(--color-brutal);
		padding-bottom: 0.625rem;
		margin: 2rem 0 1rem;
	}

	.md-root :global(h1:first-child) {
		margin-top: 0;
	}

	.md-root :global(h2) {
		font-size: 0.8125rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-primary);
		border-bottom: 2px solid var(--color-border-light);
		padding-bottom: 0.5rem;
		margin: 2rem 0 0.75rem;
	}

	.md-root :global(h3) {
		font-size: 0.8125rem;
		font-weight: 800;
		letter-spacing: 0.03em;
		color: var(--color-text);
		margin: 1.5rem 0 0.5rem;
		padding-left: 0.625rem;
		border-left: 3px solid var(--color-primary);
	}

	.md-root :global(h4) {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-secondary);
		margin: 1.25rem 0 0.5rem;
	}

	/* ── Paragraphs ───────────────────────────────────── */
	.md-root :global(p) {
		margin: 0.5rem 0;
		color: var(--color-text-secondary);
	}

	/* ── Bold & emphasis ──────────────────────────────── */
	.md-root :global(strong) {
		font-weight: 800;
		color: var(--color-text);
	}

	.md-root :global(em) {
		font-style: italic;
		color: var(--color-text-secondary);
	}

	/* ── Links ────────────────────────────────────────── */
	.md-root :global(a) {
		color: var(--color-primary);
		font-weight: 700;
		text-decoration: underline;
		text-decoration-thickness: 2px;
		text-underline-offset: 2px;
	}

	.md-root :global(a:hover) {
		color: var(--color-primary-hover);
	}

	/* ── Tables ───────────────────────────────────────── */
	.md-root :global(table) {
		width: 100%;
		border-collapse: separate;
		border-spacing: 0;
		border: 2px solid var(--color-brutal);
		border-radius: 4px;
		margin: 1rem 0;
		font-size: 0.75rem;
		overflow: hidden;
	}

	.md-root :global(thead) {
		background: #1a1a1a;
		color: #f0f0f0;
	}

	:global(html.dark) .md-root :global(thead) {
		background: #f0f0f0;
		color: #1a1a1a;
	}

	.md-root :global(th) {
		padding: 0.5rem 0.75rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		font-size: 0.625rem;
		text-align: left;
		white-space: nowrap;
	}

	.md-root :global(td) {
		padding: 0.5rem 0.75rem;
		border-top: 1px solid var(--color-border-light);
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 0.6875rem;
		color: var(--color-text-secondary);
	}

	.md-root :global(tbody tr:hover) {
		background: var(--color-surface-hover);
	}

	.md-root :global(tbody tr:nth-child(even)) {
		background: color-mix(in srgb, var(--color-surface-hover) 40%, transparent);
	}

	.md-root :global(tbody tr:nth-child(even):hover) {
		background: var(--color-surface-hover);
	}

	/* ── Lists ────────────────────────────────────────── */
	.md-root :global(ul) {
		margin: 0.5rem 0;
		padding-left: 0;
		list-style: none;
	}

	.md-root :global(ul > li) {
		position: relative;
		padding-left: 1.25rem;
		margin: 0.25rem 0;
		color: var(--color-text-secondary);
	}

	.md-root :global(ul > li::before) {
		content: '';
		position: absolute;
		left: 0;
		top: 0.55em;
		width: 6px;
		height: 6px;
		background: var(--color-primary);
		border: 1.5px solid var(--color-brutal);
	}

	.md-root :global(ol) {
		margin: 0.5rem 0;
		padding-left: 0;
		list-style: none;
		counter-reset: md-ol;
	}

	.md-root :global(ol > li) {
		position: relative;
		padding-left: 2rem;
		margin: 0.25rem 0;
		counter-increment: md-ol;
		color: var(--color-text-secondary);
	}

	.md-root :global(ol > li::before) {
		content: counter(md-ol);
		position: absolute;
		left: 0;
		top: 0.1em;
		width: 1.25rem;
		height: 1.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.625rem;
		font-weight: 800;
		background: var(--color-primary-light);
		color: var(--color-primary);
		border: 1.5px solid var(--color-brutal);
	}

	/* ── Task list checkboxes ─────────────────────────── */
	.md-root :global(li:has(> input[type="checkbox"])) {
		list-style: none;
		padding-left: 0 !important;
	}

	.md-root :global(li:has(> input[type="checkbox"])::before) {
		display: none !important;
	}

	.md-root :global(input[type="checkbox"]) {
		appearance: none;
		width: 1rem;
		height: 1rem;
		border: 2px solid var(--color-brutal);
		background: var(--color-surface);
		vertical-align: middle;
		margin-right: 0.5rem;
		position: relative;
		cursor: default;
	}

	.md-root :global(input[type="checkbox"]:checked) {
		background: var(--color-success);
		border-color: var(--color-brutal);
	}

	.md-root :global(input[type="checkbox"]:checked::after) {
		content: '✓';
		position: absolute;
		top: -1px;
		left: 1px;
		font-size: 0.625rem;
		font-weight: 800;
		color: white;
	}

	/* ── Blockquotes ──────────────────────────────────── */
	.md-root :global(blockquote) {
		margin: 1rem 0;
		padding: 0.75rem 1rem;
		border-left: 4px solid var(--color-primary);
		border-top: 2px solid var(--color-border-light);
		border-right: 2px solid var(--color-border-light);
		border-bottom: 2px solid var(--color-border-light);
		border-radius: 0 4px 4px 0;
		background: var(--color-primary-light);
	}

	.md-root :global(blockquote p) {
		color: var(--color-text);
		font-weight: 600;
		font-size: 0.8125rem;
	}

	/* ── Code ─────────────────────────────────────────── */
	.md-root :global(code) {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 0.75rem;
		background: var(--color-surface-hover);
		border: 1.5px solid var(--color-border-light);
		padding: 0.1em 0.35em;
		border-radius: 2px;
		color: var(--color-primary);
		font-weight: 600;
	}

	.md-root :global(pre) {
		margin: 1rem 0;
		padding: 1rem;
		background: var(--color-brutal);
		border: 2px solid var(--color-brutal);
		border-radius: 4px;
		overflow-x: auto;
	}

	.md-root :global(pre code) {
		background: none;
		border: none;
		padding: 0;
		color: #e0e0e0;
		font-size: 0.75rem;
		font-weight: 400;
	}

	/* ── Horizontal rules ─────────────────────────────── */
	.md-root :global(hr) {
		border: none;
		border-top: 3px solid var(--color-brutal);
		margin: 2rem 0;
	}

	/* ── Images ───────────────────────────────────────── */
	.md-root :global(img) {
		max-width: 100%;
		border: 2px solid var(--color-brutal);
		border-radius: 4px;
		box-shadow: 4px 4px 0 var(--color-brutal);
	}
</style>
