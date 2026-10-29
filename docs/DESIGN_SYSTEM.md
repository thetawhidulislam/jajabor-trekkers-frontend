# Design system

This document records the current public-site design. Keep visual changes consistent with these values and preserve readable contrast in both themes.

## Color

The palette is defined in `src/app/globals.css`. Prefer semantic tokens in component styles; do not introduce hard-coded colors. Both themes must work.

| Token | Light value | Dark value / behavior |
| --- | --- | --- |
| `--forest-900` | `#0f3b22` | Retained for brand/primary surfaces; dark-theme text overrides use `--cream-50` |
| `--forest-800` | `#14502d` | Retained |
| `--forest-700` | `#1b6b3c` | Retained |
| `--forest-100` | `#e6f2ea` | Retained, with dark component surfaces overridden where needed |
| `--sun-500` | `#f5a01b` | Retained for primary actions and focus |
| `--sun-600` | `#e88a0c` | Retained |
| `--sun-400` | `#ffb93f` | Retained |
| `--cream-50` | `#faf7ef` | Retained |
| `--cream-100` | `#f1ebdc` | Retained |
| `--ink-900` | `#0b1a12` | Retained |
| `--ink-500` | `#5b6b61` | Retained |
| `--page` | `--cream-50` | `#07140d` |
| `--surface` | `#fffdf8` | `#0c1d13` |
| `--surface-raised` | `#fff` | `#10251a` |
| `--text` | `--ink-900` | `--cream-50` |
| `--muted` | `--ink-500` | `#b3c1b7` |
| `--line` | `rgba(15, 59, 34, 0.12)` | `rgba(230, 242, 234, 0.13)` |
| `--shadow-soft` | `0 12px 35px rgba(20, 45, 30, 0.08)` | `0 12px 35px rgba(0, 0, 0, 0.2)` |
| `--shadow-card` | `0 18px 50px rgba(15, 42, 26, 0.12)` | `0 18px 50px rgba(0, 0, 0, 0.28)` |

`--background` and `--foreground` alias the page and text tokens. The default theme follows the system color preference; `data-theme="light"` and `data-theme="dark"` provide explicit overrides.

**Rule: semantic tokens only, no hard-coded colors, both themes must work.** Put palette values in design tokens and use those tokens for component colors. Any added semantic role must have a light and dark value.

## Typography

- Body: Inter (`--font-body`), with `"Hind Siliguri", sans-serif` fallbacks for Bengali.
- Headings and display text: Plus Jakarta Sans (`--font-heading`), falling back to the body font.
- Monospace: Geist Mono (`--font-geist-mono`).
- Headings use a heavy weight (typically 800), balanced wrapping, and slightly negative letter spacing. Keep heading tracking moderate and readable.

## Shape, elevation, and spacing

- Compact controls: 10–14px corner radii; primary buttons and theme/language controls use 14px.
- Cards: destination and step cards use 20px; gear panel 26px; gear tiles 16px; gallery images 19px (15px on small screens).
- Pills and difficulty badges use fully rounded corners.
- Use `--shadow-soft` for resting cards and `--shadow-card` for raised/hovered cards. Primary actions use a small warm-tinted shadow.
- The main content shell is capped at 1200px, with 24px desktop, 20px tablet, and 18px narrow-mobile side gutters.
- Sections use generous vertical spacing (92px desktop, 70px tablet, 59px narrow mobile); card and control spacing generally follows 4px increments, with 8–24px common gaps and padding.
- Keep layouts fluid and verify at 360px wide; avoid horizontal overflow.

## Components

- **Buttons:** 48px minimum height, 14px radius, bold compact label. Primary buttons use `--sun-500`; outline buttons use semantic surface, text, and line tokens. Larger CTAs are 55px high. Interactive targets should remain at least 44px.
- **Cards:** Use semantic surface backgrounds, `--line`, and `--shadow-soft`; destination cards lift with `--shadow-card`. Cards use consistent 20px radii.
- **Badges:** Difficulty and featured badges are compact, rounded pills with readable text and an accompanying dot or icon; do not communicate meaning by color alone.
- **Focus:** All interactive controls retain a visible `:focus-visible` outline using `--sun-500`.

## Motion and accessibility

- Keep transitions short (roughly 140–220ms for controls); image hover effects may be slower.
- Scroll-revealed elements start visible. Motion may enhance them when JavaScript runs, but content must never depend on JavaScript or an intersection callback to become visible. Fast scrolling must not strand content in a hidden state.
- Respect `prefers-reduced-motion`: disable smooth scrolling and reduce animation/transition duration. Do not animate scroll-reveal content for users who request reduced motion.
- Maintain keyboard access, visible focus, meaningful labels/alt text, and readable contrast in both themes.
