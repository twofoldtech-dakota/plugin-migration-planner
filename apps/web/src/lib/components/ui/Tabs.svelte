<script lang="ts">
    import type { Snippet } from 'svelte';

    interface Tab {
        id: string;
        label: string;
        count?: number;
    }

    interface Props {
        tabs: Tab[];
        active: string;
        onchange?: (id: string) => void;
        children: Snippet;
    }

    let { tabs, active, onchange, children }: Props = $props();

    function handleKeydown(e: KeyboardEvent, index: number) {
        let newIndex = index;
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            newIndex = (index + 1) % tabs.length;
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            newIndex = (index - 1 + tabs.length) % tabs.length;
        } else if (e.key === 'Home') {
            e.preventDefault();
            newIndex = 0;
        } else if (e.key === 'End') {
            e.preventDefault();
            newIndex = tabs.length - 1;
        } else {
            return;
        }
        onchange?.(tabs[newIndex].id);
        const el = document.querySelector(`[data-tab-id="${tabs[newIndex].id}"]`) as HTMLElement;
        el?.focus();
    }
</script>

<div>
    <div role="tablist" class="flex gap-0 border-b-3 border-brutal mb-4">
        {#each tabs as tab, i}
            <button
                role="tab"
                data-tab-id={tab.id}
                aria-selected={active === tab.id}
                aria-controls="panel-{tab.id}"
                tabindex={active === tab.id ? 0 : -1}
                class="px-4 py-2.5 text-sm font-bold uppercase tracking-wider border-3 border-b-0 border-brutal -mb-[3px] transition-all duration-150
                    {active === tab.id
                    ? 'bg-surface text-text border-b-3 border-b-surface z-10 -translate-y-px'
                    : 'bg-bg text-text-muted hover:text-text hover:bg-surface-hover'}
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                onclick={() => onchange?.(tab.id)}
                onkeydown={(e) => handleKeydown(e, i)}
            >
                {tab.label}
                {#if tab.count !== undefined}
                    <span class="ml-1.5 inline-flex items-center justify-center min-w-5 h-5 px-1 text-xs font-mono font-bold
                        {active === tab.id ? 'bg-primary text-white' : 'bg-border-light text-text-muted'}
                        border border-brutal">{tab.count}</span>
                {/if}
            </button>
        {/each}
    </div>
    {@render children()}
</div>
