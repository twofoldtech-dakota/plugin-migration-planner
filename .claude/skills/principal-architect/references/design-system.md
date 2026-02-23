# Design System Reference

## Table of Contents
- [Theme Tokens](#theme-tokens)
- [Utility Classes](#utility-classes)
- [Component Styling Patterns](#component-styling-patterns)
- [Dark Mode](#dark-mode)
- [Typography](#typography)
- [Accessibility](#accessibility)

## Theme Tokens

Defined in `apps/web/src/app.css` via Tailwind v4 `@theme`:

### Colors
```css
--color-brutal: #1a1a1a;       /* Borders, shadows */
--color-bg: #f0ece4;           /* Page background */
--color-surface: #ffffff;       /* Card/panel backgrounds */
--color-text: #1a1a1a;         /* Primary text */
--color-primary: #4f46e5;      /* Electric indigo — brand color */
--color-primary-hover: #4338ca;
--color-success: #16a34a;
--color-warning: #ea580c;
--color-danger: #dc2626;
```

### Shadows (offset, not blurred — brutalist signature)
```css
--shadow-sm: 2px 2px 0 var(--color-brutal);
--shadow-md: 4px 4px 0 var(--color-brutal);
--shadow-lg: 6px 6px 0 var(--color-brutal);
```

### Fonts
```css
--font-sans: 'Inter', system-ui;
--font-mono: 'JetBrains Mono', monospace;
```

## Utility Classes

Defined globally in `app.css`:

```css
.brutal-border     { border: 3px solid var(--color-brutal); border-radius: 4px; }
.brutal-border-thin { border: 2px solid var(--color-brutal); border-radius: 4px; }
.hero-surface      { background: #1a1a1a; color: #ffffff; }
```

Always use these instead of ad-hoc border styles.

## Component Styling Patterns

### Card with hover
```svelte
<div class="brutal-border bg-surface shadow-md overflow-hidden p-6
  transition-all duration-150
  hover:-translate-x-px hover:-translate-y-px hover:shadow-lg
  active:translate-y-[0.5px] active:shadow-none">
  <!-- content -->
</div>
```

### Button (toggle/tab style)
```svelte
<button class="px-4 py-2 border-2 text-xs font-bold uppercase tracking-wider cursor-pointer
  {active
    ? 'bg-primary text-white shadow-md -translate-x-px -translate-y-px'
    : 'bg-transparent text-text-secondary border-border hover:bg-surface-hover'}">
  {label}
</button>
```

### Primary action button
```svelte
<button class="brutal-border bg-primary text-white px-6 py-3 font-bold
  shadow-md hover:-translate-x-px hover:-translate-y-px hover:shadow-lg
  active:translate-y-[0.5px] active:shadow-none transition-all duration-150">
  Action
</button>
```

### Badge/tag
```svelte
<span class="px-2 py-0.5 text-xs font-mono font-bold brutal-border-thin
  {variant === 'success' ? 'bg-success/10 text-success' :
   variant === 'danger' ? 'bg-danger/10 text-danger' :
   'bg-primary/10 text-primary'}">
  {text}
</span>
```

### Section header
```svelte
<h2 class="text-lg font-bold font-mono uppercase tracking-wider text-text">
  {title}
</h2>
```

## Rules

1. **Never use raw hex** in components — always reference theme tokens via Tailwind classes
2. **3px borders** are the signature — use `brutal-border` not `border` for containers
3. **Offset shadows** (not blurred) — `shadow-sm`/`shadow-md`/`shadow-lg` reference the brutalist tokens
4. **Hover = lift** — combine `-translate-x-px -translate-y-px` with `shadow-lg`
5. **Active = press** — `translate-y-[0.5px] shadow-none`
6. **Font hierarchy** — Inter for body/headings, JetBrains Mono for data/labels/code
7. **Uppercase + tracking** — section headers and labels use `uppercase tracking-wider font-mono`
8. **Minimal border-radius** — `border-radius: 4px` (built into `brutal-border`), never rounded-full on containers

## Dark Mode

Toggle via `html.dark` class. CSS custom properties swap:

```css
html.dark {
  --color-bg: #111111;
  --color-surface: #1e1e1e;
  --color-text: #f0f0f0;
  --color-primary: #818cf8;    /* Lighter indigo for dark bg */
  --color-danger: #f87171;
}
```

Components using theme tokens automatically adapt. No conditional dark classes needed in components — the token values change.

## Typography

| Element | Classes |
|---------|---------|
| Page title | `text-2xl font-bold` |
| Section header | `text-lg font-bold font-mono uppercase tracking-wider` |
| Card title | `text-base font-bold` |
| Body text | `text-sm text-text` (default) |
| Data/numbers | `font-mono text-sm` |
| Labels | `text-xs font-mono font-bold uppercase tracking-wider text-text-secondary` |
| Code/technical | `font-mono text-xs` |

## Accessibility

- All interactive elements must be keyboard-navigable
- Use semantic HTML (`<button>`, `<nav>`, `<main>`, `<section>`)
- Color contrast: text on surfaces meets WCAG AA (the theme tokens are pre-validated)
- Status colors always paired with text labels (never color-only indicators)
- Focus states: `focus:outline-2 focus:outline-primary focus:outline-offset-2`
- SVG charts include `role="img"` and `aria-label`
