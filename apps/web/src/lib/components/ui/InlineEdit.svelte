<script lang="ts">
    interface Props {
        value: string | number;
        type?: 'text' | 'number';
        onsave?: (value: string) => void;
        placeholder?: string;
        size?: 'sm' | 'md';
    }

    let { value, type = 'text', onsave, placeholder = '', size = 'md' }: Props = $props();

    let editing = $state(false);
    let editValue = $state('');
    let inputEl: HTMLInputElement | undefined = $state();

    $effect(() => {
        if (!editing) editValue = String(value);
    });

    function startEdit() {
        editValue = String(value);
        editing = true;
        requestAnimationFrame(() => inputEl?.select());
    }

    function save() {
        editing = false;
        if (editValue !== String(value)) {
            onsave?.(editValue);
        }
    }

    function cancel() {
        editing = false;
        editValue = String(value);
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            e.preventDefault();
            save();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancel();
        }
    }

    const textSize = $derived(size === 'sm' ? 'text-xs' : 'text-sm');
</script>

{#if editing}
    <input
        bind:this={inputEl}
        bind:value={editValue}
        {type}
        {placeholder}
        class="{textSize} font-mono font-bold bg-warning-light border-2 border-warning px-1.5 py-0.5 w-full
            focus:outline-2 focus:outline-primary"
        onblur={save}
        onkeydown={handleKeydown}
    />
{:else}
    <button
        type="button"
        class="{textSize} font-mono font-bold text-left px-1.5 py-0.5 w-full border-2 border-transparent
            hover:border-border-light hover:bg-surface-hover cursor-text transition-colors duration-100
            focus-visible:outline-2 focus-visible:outline-primary"
        onclick={startEdit}
        title="Click to edit"
    >
        {value || placeholder}
    </button>
{/if}
