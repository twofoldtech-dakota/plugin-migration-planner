<script lang="ts">
	import { page } from '$app/state';

	const tabs = [
		{ href: '/analytics', label: 'Overview', exact: true },
		{ href: '/analytics/portfolio', label: 'Portfolio' },
		{ href: '/analytics/estimates', label: 'Estimates' },
		{ href: '/analytics/confidence', label: 'Confidence' },
		{ href: '/analytics/calibration', label: 'Calibration' },
		{ href: '/analytics/knowledge', label: 'Knowledge' },
		{ href: '/analytics/usage', label: 'Usage' },
	];

	function isActive(tab: { href: string; exact?: boolean }): boolean {
		if (tab.exact) return page.url.pathname === tab.href;
		return page.url.pathname.startsWith(tab.href);
	}
</script>

<nav class="flex items-center gap-1 flex-wrap">
	{#each tabs as tab}
		<a
			href={tab.href}
			class="brutal-border-thin px-3 py-1.5 text-xs font-bold uppercase tracking-wider no-underline transition-all duration-150
				{isActive(tab)
				? 'bg-primary text-white shadow-sm -translate-x-px -translate-y-px'
				: 'bg-surface text-text-secondary hover:bg-surface-hover hover:-translate-x-px hover:-translate-y-px hover:shadow-sm'}"
		>
			{tab.label}
		</a>
	{/each}
</nav>
