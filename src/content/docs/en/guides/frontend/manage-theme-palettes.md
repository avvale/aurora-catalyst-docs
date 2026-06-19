---
title: Manage theme palettes
description: "Use the header palette selector, add a new palette from a tweakcn export, and keep the selector hidden in production builds."
---

## Goal

Work with the **theme manager** in a scaffolded Aurora frontend: switch the active color palette from the header, add a brand-new palette from a [tweakcn.com](https://tweakcn.com) export, and understand why the selector disappears in a production build.

For the *why* behind it — the three-layer resolution chain, the anti-**FOUC** flow, and how palettes propagate to the whole UI including charts — see the concept [Theme palettes](../../../concepts/frontend/theme-palettes/). FOUC (*Flash Of Unstyled — or Incorrect — Content*) is the flicker where, on load, you briefly see the "wrong" look before the correct styling kicks in.

Two terms used throughout this guide:

- **Palette** — the color theme (`theme-neutral`, `theme-amber-minimal`, …), managed by the framework service `ThemePaletteService` (imported from `@aurora`). This is the "theme" you add and switch.
- **Appearance** — the orthogonal light / dark / system mode. A separate selector; changing one never touches the other.

The active palette resolves `localStorage["theme-palette"]` → `environment.appearance.theme` → `'theme-neutral'` (first match wins).

## Switch palettes from the header

The palette selector lives in the header (`frontend/src/app/domains/admin/layout/site-header.ts`) behind the swatch-book icon. It iterates `service.palettes` (the list from `environment.appearance.palettes`), marks the active one with a check, and on click calls `ThemePaletteService.set(id)` — which swaps the class, persists the choice, and updates the signal. It is completely independent of the light/dark selector sitting next to it.

## Add a new palette

Four steps take a palette from a design tool to the selector.

1. **Design and export the palette** at [tweakcn.com](https://tweakcn.com) and save the raw CSS to a file (e.g. `ocean-export.css`).

2. **Adapt the export** to the project convention with the importer, run **from the project root** (where the `pnpm` scripts live), and append it to the stylesheet:

   ```bash
   # print the adapted block to stdout to inspect it first
   pnpm theme:adapt ./ocean-export.css theme-ocean

   # or append it straight to frontend/src/styles.css
   pnpm theme:adapt ./ocean-export.css theme-ocean --append
   ```

   The importer emits two self-contained scoped blocks. Review what landed in `frontend/src/styles.css`:

   ```css
   :root .theme-ocean {
     color-scheme: light;

     --background: oklch(0.98 0 0);
     --primary: oklch(0.55 0.13 240);
     /* …every token from the export's :root… */
     --chart-1: oklch(0.7 0.13 240);
     --chart-2: oklch(0.62 0.15 250);
     /* …--chart-3..5… */
   }

   :root.dark .theme-ocean {
     color-scheme: dark;
     /* …every token from the export's .dark block… */
   }
   ```

3. **Register the palette** in `environment.appearance.palettes` — the list of available palettes, declared per environment in `frontend/src/environments/environment*.ts`. Add the entry to every environment that should offer it. The `id` must match the scoped class name; the `label` is what the selector shows:

   ```ts
   // frontend/src/environments/environment.ts  (repeat in the envs that should offer it)
   appearance: {
     theme: 'theme-neutral',     // build default (must be one of the palettes below)
     layout: '',
     themeSelector: true,        // show the header selector in this build
     palettes: [
       { id: 'theme-neutral', label: 'Neutral' },
       { id: 'theme-amber-minimal', label: 'Amber' },
       { id: 'theme-ocean', label: 'Ocean' }, // ← your new palette
     ],
   },
   ```

4. **Load the web font, if any.** If the palette declares a web font (e.g. Inter for `theme-amber-minimal`), add its `<link>` to `frontend/src/index.html`. `theme-neutral` uses system font stacks and loads nothing.

The palette now appears in the header selector on any build with `themeSelector: true`.

### How the importer transforms the export

`pnpm theme:adapt` is implemented by the pure function `adaptTweakcnExport(css, name)` in `scripts/theme/adapt-tweakcn.ts` (covered by `pnpm test:theme`). It takes a raw tweakcn export — with `:root {}`, `.dark {}`, `@import`, `@theme inline`, and similar — and:

- Emits `:root .theme-<name>` from the export's `:root` block and `:root.dark .theme-<name>` from its `.dark` block.
- **Strips** `@import`, `@custom-variant`, `@layer base`, and `@theme inline` — those are supplied globally by the Spartan preset, so a per-palette copy would be redundant or conflicting.
- Injects the matching `color-scheme: light | dark` into each block.
- **Warns** if the export had no `.dark` block (only the light block is emitted).

## Hide the selector in production

The selector is gated by a build-time flag, `environment.appearance.themeSelector: boolean`. The header renders the button inside `@if (showPaletteSelector)`, where `showPaletteSelector = environment.appearance?.themeSelector ?? false`.

| Environment file                  | `themeSelector` |
| --------------------------------- | --------------- |
| `environment.ts` (base)           | `true`          |
| `environment.dev.ts`              | `true`          |
| `environment.local.ts`            | `true`          |
| `environment.qa.ts`               | `true`          |
| `environment.prod.ts`             | `false`         |

A production build therefore ships **without** the selector; dev / local / qa builds show it. Hiding the button does **not** change the active palette — `environment.appearance.theme` plus `localStorage` still decide what the app renders.

## Notes for developers

- **Color is always a theme token, never hardcoded.** Categorical series → `--chart-1..5`; semantic states (success / error) → semantic tokens such as `--destructive`. A hardcoded hex will not follow palette or light/dark changes.
- **Catalog charts handle theming for you.** `<aurora-chart>` (`@aurora/components/chart`) already reads `--chart-*` and re-renders on every palette or light/dark change — you do not need to do anything special. See [Theme palettes › How charts stay in sync](../../../concepts/frontend/theme-palettes/#how-charts-stay-in-sync) for the mechanism.
- **Anticipated, not yet implemented:** per-tenant runtime theming — calling `service.set(tenantTheme)` from the `provideAuthenticatedInitializer` hook once the session is established. Build the chain assuming this may arrive; nothing in it needs changing today.

## Related

- [Theme palettes](../../../concepts/frontend/theme-palettes/) — the concept: resolution model, anti-FOUC flow, propagation.
- [tweakcn.com](https://tweakcn.com) — the visual theme editor the importer consumes.
