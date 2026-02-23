<script lang="ts">
    import type { Snippet } from 'svelte';

    interface Props {
        title: string;
        subtitle?: string;
        open?: boolean;
        badge?: string;
        badgeVariant?: 'default' | 'success' | 'warning' | 'danger';
        headerClass?: string;
        children: Snippet;
    }

    let { title, subtitle, open = false, badge, badgeVariant = 'default', headerClass = '', children }: Props = $props();

    let expanded = $state(false);
    // Track if content has been mounted (lazy-mount on first open, keep in DOM after)
    let mounted = $state(false);

    $effect(() => {
        expanded = open;
        if (open) mounted = true;
    });

    $effect(() => {
        if (expanded) mounted = true;
    });

    const panelId = $derived(`panel-${title.replace(/\s+/g, '-').toLowerCase()}-${Math.random().toString(36).slice(2, 6)}`);

    const badgeColors: Record<string, string> = {
        default: 'bg-primary-light text-primary border-primary',
        success: 'bg-success-light text-success border-success',
        warning: 'bg-warning-light text-warning border-warning',
        danger: 'bg-danger-light text-danger border-danger'
    };
</script>

<div class="brutal-border bg-surface shadow-sm overflow-hidden scroll-mt-20">
    <button
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        class="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150
            hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary
            {headerClass}"
        onclick={() => expanded = !expanded}
    >
        <span
            class="inline-block text-xs transition-transform duration-200 text-text-muted
                {expanded ? 'rotate-90' : 'rotate-0'}"
            aria-hidden="true"
        >&#9654;</span>
        <div class="flex-1 min-w-0">
            <span class="text-sm font-extrabold uppercase tracking-wider">{title}</span>
            {#if subtitle}
                <span class="ml-2 text-xs text-text-muted font-mono">{subtitle}</span>
            {/if}
        </div>
        {#if badge}
            <span class="inline-flex items-center px-2 py-0.5 text-xs font-bold uppercase border-2 {badgeColors[badgeVariant]}">
                {badge}
            </span>
        {/if}
    </button>
    <div
        id={panelId}
        class="grid transition-[grid-template-rows] duration-250 ease-in-out"
        style="grid-template-rows: {expanded ? '1fr' : '0fr'};"
        aria-hidden={!expanded}
    >
        <div class="overflow-hidden">
            {#if mounted}
                <div class="border-t-2 border-brutal px-4 py-4">
                    {@render children()}
                </div>
            {/if}
        </div>
    </div>
</div>
