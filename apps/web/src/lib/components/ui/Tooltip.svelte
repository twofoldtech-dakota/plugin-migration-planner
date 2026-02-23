<script lang="ts">
	import type { Snippet } from 'svelte';
	import { tick, onDestroy } from 'svelte';

	interface Props {
		text: string;
		position?: 'top' | 'bottom' | 'left' | 'right';
		delay?: number;
		block?: boolean;
		children: Snippet;
	}

	let { text, position = 'top', delay = 350, block = false, children }: Props = $props();

	let visible = $state(false);
	let triggerEl: HTMLElement | undefined = $state();
	let panelEl: HTMLDivElement | null = null;
	let showTimer: ReturnType<typeof setTimeout> | null = null;
	let hideTimer: ReturnType<typeof setTimeout> | null = null;

	const GAP = 6;
	const EDGE_PAD = 8;

	function createPanel() {
		if (panelEl) return;
		panelEl = document.createElement('div');
		panelEl.setAttribute('role', 'tooltip');
		panelEl.style.cssText = `
			position: fixed;
			z-index: 9999;
			pointer-events: none;
			max-width: 16rem;
			width: max-content;
			white-space: normal;
			opacity: 0;
			transform: scale(0.96);
			transition: opacity 120ms ease-out, transform 120ms ease-out;
		`;
		panelEl.className = 'brutal-border-thin bg-surface shadow-md text-xs font-mono p-2 text-text-secondary';
		document.body.appendChild(panelEl);
	}

	function removePanel() {
		if (panelEl) {
			panelEl.remove();
			panelEl = null;
		}
	}

	function calcPosition() {
		if (!triggerEl || !panelEl) return;
		panelEl.textContent = text;

		const tr = triggerEl.getBoundingClientRect();
		const pr = panelEl.getBoundingClientRect();
		const vw = window.innerWidth;
		const vh = window.innerHeight;

		let top = 0;
		let left = 0;

		if (position === 'top') {
			top = tr.top - pr.height - GAP;
			left = tr.left + tr.width / 2 - pr.width / 2;
		} else if (position === 'bottom') {
			top = tr.bottom + GAP;
			left = tr.left + tr.width / 2 - pr.width / 2;
		} else if (position === 'left') {
			top = tr.top + tr.height / 2 - pr.height / 2;
			left = tr.left - pr.width - GAP;
		} else {
			top = tr.top + tr.height / 2 - pr.height / 2;
			left = tr.right + GAP;
		}

		// Flip if clipped
		if (position === 'top' && top < EDGE_PAD) {
			top = tr.bottom + GAP;
		} else if (position === 'bottom' && top + pr.height > vh - EDGE_PAD) {
			top = tr.top - pr.height - GAP;
		}

		// Clamp to viewport
		left = Math.max(EDGE_PAD, Math.min(left, vw - pr.width - EDGE_PAD));
		top = Math.max(EDGE_PAD, Math.min(top, vh - pr.height - EDGE_PAD));

		panelEl.style.top = `${top}px`;
		panelEl.style.left = `${left}px`;
		panelEl.style.opacity = '1';
		panelEl.style.transform = 'scale(1)';
	}

	function show() {
		if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
		if (!visible) {
			showTimer = setTimeout(() => {
				visible = true;
				createPanel();
				// Double rAF: one to layout, one to measure
				requestAnimationFrame(() => {
					requestAnimationFrame(calcPosition);
				});
			}, delay);
		}
	}

	function hide() {
		if (showTimer) { clearTimeout(showTimer); showTimer = null; }
		hideTimer = setTimeout(() => {
			visible = false;
			removePanel();
		}, 100);
	}

	onDestroy(() => {
		if (showTimer) clearTimeout(showTimer);
		if (hideTimer) clearTimeout(hideTimer);
		removePanel();
	});
</script>

<span
	role="presentation"
	class="{block ? 'flex min-w-0' : 'inline-flex'}"
	bind:this={triggerEl}
	onmouseenter={show}
	onmouseleave={hide}
	onfocusin={show}
	onfocusout={hide}
>
	{@render children()}
</span>
