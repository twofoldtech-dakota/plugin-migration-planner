<script lang="ts">
	import { page } from '$app/state';
	import ThemeToggle from './ThemeToggle.svelte';
</script>

<header class="sticky top-0 z-50 border-b-3 border-brutal bg-surface">
	<div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
		<a href="/" class="flex items-center gap-2.5 no-underline text-text group" aria-label="MigrateIQ home">
			<!-- IQ Mark: standalone, theme-aware via CSS vars -->
			<svg
				width="32"
				height="32"
				viewBox="0 0 32 32"
				fill="none"
				aria-hidden="true"
				class="shrink-0 transition-transform duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:-rotate-6"
			>
				<!-- Q body: offset shadow -->
				<rect x="5" y="5" width="16" height="16" style="fill: var(--color-primary)"/>
				<!-- Q body: front square -->
				<rect x="2" y="2" width="16" height="16" stroke-width="3" style="stroke: var(--color-brutal); fill: var(--color-surface)"/>
				<!-- Q tail: bold diagonal slash -->
				<line x1="14" y1="14" x2="28" y2="28" stroke-width="4" stroke-linecap="square" style="stroke: var(--color-primary)"/>
			</svg>
			<!-- Wordmark -->
			<span class="flex items-baseline gap-1">
				<span class="text-[1.15rem] font-extrabold uppercase tracking-wider leading-none">Migrate</span>
				<span class="text-[1.15rem] font-extrabold leading-none text-white bg-primary px-1.5 py-0.5 border-2 border-brutal tracking-tight">IQ</span>
			</span>
		</a>

		<div class="flex items-center gap-4">
			<nav class="flex items-center gap-1 text-sm font-bold">
				<a
					href="/"
					class="brutal-border-thin px-3 py-1 no-underline transition-all duration-150
						{page.url.pathname === '/'
						? 'bg-primary text-white shadow-sm -translate-x-px -translate-y-px'
						: 'bg-surface text-text-secondary hover:bg-surface-hover hover:-translate-x-px hover:-translate-y-px hover:shadow-sm'}"
				>
					Dashboard
				</a>
				<a
					href="/assessments"
					class="brutal-border-thin px-3 py-1 no-underline transition-all duration-150
						{page.url.pathname.startsWith('/assessments')
						? 'bg-primary text-white shadow-sm -translate-x-px -translate-y-px'
						: 'bg-surface text-text-secondary hover:bg-surface-hover hover:-translate-x-px hover:-translate-y-px hover:shadow-sm'}"
				>
					Assessments
				</a>
				<a
					href="/clients"
					class="brutal-border-thin px-3 py-1 no-underline transition-all duration-150
						{page.url.pathname.startsWith('/clients')
						? 'bg-primary text-white shadow-sm -translate-x-px -translate-y-px'
						: 'bg-surface text-text-secondary hover:bg-surface-hover hover:-translate-x-px hover:-translate-y-px hover:shadow-sm'}"
				>
					Clients
				</a>
				<a
					href="/knowledge"
					class="brutal-border-thin px-3 py-1 no-underline transition-all duration-150
						{page.url.pathname.startsWith('/knowledge')
						? 'bg-primary text-white shadow-sm -translate-x-px -translate-y-px'
						: 'bg-surface text-text-secondary hover:bg-surface-hover hover:-translate-x-px hover:-translate-y-px hover:shadow-sm'}"
				>
					Knowledge
				</a>
				<a
					href="/analytics"
					class="brutal-border-thin px-3 py-1 no-underline transition-all duration-150
						{page.url.pathname.startsWith('/analytics')
						? 'bg-primary text-white shadow-sm -translate-x-px -translate-y-px'
						: 'bg-surface text-text-secondary hover:bg-surface-hover hover:-translate-x-px hover:-translate-y-px hover:shadow-sm'}"
				>
					Analytics
				</a>
				<a
					href="/planning"
					class="brutal-border-thin px-3 py-1 no-underline transition-all duration-150
						{page.url.pathname.startsWith('/planning')
						? 'bg-primary text-white shadow-sm -translate-x-px -translate-y-px'
						: 'bg-surface text-text-secondary hover:bg-surface-hover hover:-translate-x-px hover:-translate-y-px hover:shadow-sm'}"
				>
					Planning
				</a>
			</nav>
			<ThemeToggle />
		</div>
	</div>
</header>
