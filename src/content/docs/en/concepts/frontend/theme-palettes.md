---
title: Theme palettes
sidebar:
  order: 9
description: "How the frontend resolves the active color palette through a three-layer chain, why light/dark is a separate axis, and how the palette propagates to the whole UI — charts included — without a flash."
---

## Why this exists

A scaffolded Aurora frontend needs three things from its theming that rarely come together: a **default per deployment** (so the same codebase can ship white-labeled to different tenants), a **per-user runtime override** (so a developer — or an end user, in non-prod builds — can switch palette without a rebuild), and **no flash of the wrong colors** on load. On top of that, the light/dark mode has to move independently of the palette.

The theme manager solves all four with one resolution chain and one source of truth (`ThemePaletteService`), so there is never a question of "which value wins" — the order is fixed and validated.

## Two orthogonal axes

Theming splits into two axes that never interfere with each other:

| Axis           | What it controls                       | Where it lives                     | Persisted as              |
| -------------- | -------------------------------------- | ---------------------------------- | ------------------------- |
| **Palette**    | The color theme (`theme-neutral`, …)   | A `theme-*` class on `<body>`      | `localStorage["theme-palette"]` |
| **Appearance** | Light / dark / system mode             | The `.dark` class on `<html>`      | `localStorage["theme"]`   |

Because they are independent, every palette ships **two** scoped blocks — one for each appearance — and switching light/dark re-reads the same palette under a different selector.

## How the active palette is resolved

The active palette comes from a single chain, highest priority first:

| Priority | Source                              | Scope                  | Changing it requires |
| -------- | ----------------------------------- | ---------------------- | -------------------- |
| 1        | `localStorage["theme-palette"]`     | Per browser, runtime   | The user picks one   |
| 2        | `environment.appearance.theme`      | Per build / deploy     | A recompile (this is the white-label knob) |
| 3        | `'theme-neutral'`                   | Hard fallback          | — (always present)   |

The same chain runs twice, at two different moments, for two different reasons:

```
 BUILD          environment.appearance.theme freezes the deploy default;
   │            environment.appearance.palettes lists the available palettes.
   │
 FIRST PAINT    An inline <script> (the FIRST child of <body> in
   │            index.html) reads localStorage → default and adds the
   │            .theme-<name> class to <body> BEFORE the first paint
   │            → no flash of unstyled content (FOUC). It validates only
   │            the SHAPE of the class (^theme-[a-z0-9-]+$), never the
   │            registry — it cannot import the service that early.
   │
 BOOTSTRAP      ThemePaletteService re-resolves the same chain, this time
   │            validating against environment.appearance.palettes, corrects
   │            a stale or unknown value, and exposes the palette() signal as the
   │            single post-bootstrap source of truth.
   │
 RUNTIME        service.set(id) swaps the .theme-* class on <body>, loads the
   │            palette's font if it declares one, persists, updates the signal.
   │
 PROPAGATION    The --* design tokens cascade from <body> to the whole UI.
                Spartan maps --color-* on top of them, so every component
                re-themes by cascade alone — no re-render needed.
```

The inline script exists purely to win the race against the first paint; it is deliberately dumb (shape check only). `ThemePaletteService` is the authority everything else trusts once the app is running. It lives in the **framework layer** at `frontend/src/@aurora/modules/theme/theme-palette.service.ts` and is consumed through the barrel (`import { ThemePaletteService } from '@aurora'`); it is declared with Angular 22's `@Service()` (the alias for `@Injectable({ providedIn: 'root' })`). It exposes three members: the `palette()` signal (active id), the `palettes` list (read straight from `environment.appearance.palettes`), and `set(id)`.

## How a palette is structured

Each palette is two self-contained CSS blocks, scoped by the `<body>` class and the appearance:

```css
:root .theme-amber-minimal {
  color-scheme: light;
  --background: oklch(…);
  --primary: oklch(…);
  --font-sans: Inter, sans-serif;
  --chart-1: oklch(…);
  /* …all the design tokens… */
}

:root.dark .theme-amber-minimal {
  color-scheme: dark;
  /* …the dark variants of the same tokens… */
}
```

Tokens are the only contract. Components never name colors directly — they read `--*` tokens — so a palette swap or a light/dark toggle re-colors everything for free. Categorical data uses `--chart-1..5`; semantic states use tokens like `--destructive`. A palette can also carry a `fontHref` in its registry entry (see below).

## How fonts follow the theme

A token is only half the story: declaring `--font-sans` in a palette does nothing until something *applies* it. Colors were already applied through Spartan's Tailwind utilities; typography was not — until an explicit binding in `styles.css`:

```css
body {
  /* the theme-* class lives on <body>, so --font-sans resolves from the active palette */
  font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif);
}
```

Because the binding reads `--font-sans` off `<body>` — where the palette class lives — switching palette also switches typography, with a safe system fallback when a palette omits the token.

Loading the font *file* is separate and on demand. A palette may carry a `fontHref` (a Google Fonts URL) in its registry entry (`environment.appearance.palettes`); when that palette becomes active, `ThemePaletteService` injects a single `<link rel="stylesheet" data-theme-font="<id>">` into `<head>` — once (idempotent) and only for the active palette, so no build ships a font it isn't using. Palettes that rely on a system stack have no `fontHref` and load nothing.

**Edge case:** the login page does not instantiate `ThemePaletteService`, so a palette's web font is not loaded there — although the anti-FOUC script still applies the palette class.

## How charts stay in sync

Pure CSS cascade covers every component except canvas-rendered charts, which paint to a bitmap and cannot inherit a class change. The catalog chart wrapper (`<aurora-chart>`, `@aurora/components/chart`) closes that gap with a `MutationObserver` on the `class` attribute of `<html>` and `<body>`: any palette swap **or** light/dark toggle triggers a debounced `reinit()`, which re-reads `--chart-1..5` and re-renders.

It also converts `oklch → rgb` internally, because echarts/zrender cannot manipulate `oklch` when deriving hover and emphasis colors. None of this is your concern when you use `<aurora-chart>` — it is the reason charts "just work" across palettes.

## Related

- [Manage theme palettes](../../../guides/frontend/manage-theme-palettes/) — use the selector, add a new palette, hide it in production.
- [tweakcn.com](https://tweakcn.com) — the visual editor palettes are designed in.
