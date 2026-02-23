<script lang="ts">
    interface Props {
        checked: boolean;
        onchange?: (checked: boolean) => void;
        disabled?: boolean;
        label?: string;
        size?: 'sm' | 'md';
    }

    let { checked = false, onchange, disabled = false, label, size = 'md' }: Props = $props();

    function handleClick() {
        if (disabled) return;
        onchange?.(!checked);
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        }
    }

    const trackSize = $derived(size === 'sm' ? 'w-8 h-4' : 'w-11 h-6');
    const knobSize = $derived(size === 'sm' ? 'w-3 h-3' : 'w-4.5 h-4.5');
    const knobTranslate = $derived(
        checked
            ? size === 'sm' ? 'translate-x-4' : 'translate-x-5'
            : 'translate-x-0.5'
    );
</script>

<button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    {disabled}
    class="inline-flex items-center gap-2 {disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    onclick={handleClick}
    onkeydown={handleKeydown}
>
    <span
        class="relative inline-flex shrink-0 {trackSize} items-center border-2 border-brutal transition-colors duration-150
            {checked ? 'bg-primary' : 'bg-border-light'}"
    >
        <span
            class="inline-block {knobSize} transform bg-white border border-brutal transition-transform duration-150 {knobTranslate}"
        ></span>
    </span>
    {#if label}
        <span class="text-sm font-bold select-none">{label}</span>
    {/if}
</button>
