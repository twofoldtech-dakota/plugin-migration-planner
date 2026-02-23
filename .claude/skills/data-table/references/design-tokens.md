# Design Tokens — Neo-Brutalist Data Tables

## Color Tokens (CSS Custom Properties)

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--color-bg` | `#f0ece4` | `#121212` | Page background |
| `--color-surface` | `#ffffff` | `#1e1e1e` | Table container bg |
| `--color-surface-hover` | `#f5f2ec` | `#2a2a2a` | Row hover |
| `--color-border` | `#1a1a1a` | `#e0e0e0` | Brutal thick borders |
| `--color-border-light` | `#e8e4dc` | `#333333` | Cell dividers |
| `--color-text` | `#1a1a1a` | `#f0f0f0` | Primary text |
| `--color-text-secondary` | `#4a4a4a` | `#b0b0b0` | Secondary text |
| `--color-text-muted` | `#8a8a8a` | `#666666` | Muted labels |
| `--color-primary` | `#4f46e5` | `#818cf8` | Selection, active sort |
| `--color-primary-light` | `#ddd8ff` | `#312e81` | Selected row bg |
| `--color-success` | `#16a34a` | `#4ade80` | Positive values |
| `--color-warning` | `#ea580c` | `#fb923c` | Caution states |
| `--color-danger` | `#dc2626` | `#f87171` | Negative values, errors |

## Typography

| Element | Classes |
|---------|---------|
| Column header | `text-xs font-bold uppercase tracking-wider text-text-muted` |
| Cell text | `text-sm text-text` |
| Cell mono (numbers, IDs, code) | `text-sm font-mono text-text` |
| Cell secondary | `text-sm text-text-secondary` |
| Empty state | `text-sm text-text-muted italic` |
| Toolbar label | `text-xs font-bold uppercase tracking-wider` |

## Borders & Shadows

| Pattern | Value |
|---------|-------|
| Table outer | `border: 3px solid var(--color-brutal)` → `brutal-border` |
| Header bottom | `border-b-3 border-brutal` |
| Cell divider | `border-b border-border-light` |
| Column divider (optional) | `border-r border-border-light` |
| Shadow (card mode) | `shadow-md` → `4px 4px 0 var(--color-brutal)` |
| Focus ring | `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary` |

## Spacing

| Element | Padding |
|---------|---------|
| Header cell | `px-3 py-2.5` |
| Body cell | `px-3 py-2` |
| Compact cell | `px-2 py-1.5` |
| Spacious cell | `px-4 py-3` |
| Toolbar | `px-3 py-2` |

## Animations

```css
/* Row entrance — stagger */
.stagger-grid > * {
    animation: brutal-enter 250ms ease-out both;
    animation-delay: calc(var(--stagger-i, 0) * 70ms);
}

/* Sort column highlight */
transition: background-color 150ms ease;

/* Active press */
active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none
```
