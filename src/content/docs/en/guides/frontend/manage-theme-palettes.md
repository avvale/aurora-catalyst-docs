---
title: Manage theme palettes
description: "Use the header palette selector, add a new palette from a tweakcn export in one command, and keep the selector hidden in production builds."
---

## Goal

Work with the **theme manager** in a scaffolded Aurora frontend: switch the active color palette from the header, add a brand-new palette from a [tweakcn.com](https://tweakcn.com) export in **a single command** (CSS, registration, and font wiring included), and understand why the selector disappears in a production build.

For the *why* behind it — the three-layer resolution chain, the anti-**FOUC** flow, and how palettes propagate to the whole UI including fonts and charts — see the concept [Theme palettes](../../../concepts/frontend/theme-palettes/). FOUC (*Flash Of Unstyled — or Incorrect — Content*) is the flicker where, on load, you briefly see the "wrong" look before the correct styling kicks in.

Two terms used throughout this guide:

- **Palette** — the color theme (`theme-neutral`, `theme-amber-minimal`, …), managed by the framework service `ThemePaletteService` (imported from `@aurora`). This is the "theme" you add and switch.
- **Appearance** — the orthogonal light / dark / system mode. A separate selector; changing one never touches the other.

The active palette resolves `localStorage["theme-palette"]` → `environment.appearance.theme` → `'theme-neutral'` (first match wins).

## Switch palettes from the header

The palette selector lives in the header (`frontend/src/app/domains/admin/layout/site-header.ts`) behind the swatch-book icon. It iterates `service.palettes` (the list from `environment.appearance.palettes`), marks the active one with a check, and on click calls `ThemePaletteService.set(id)` — which swaps the class, loads the palette's font if needed, persists the choice, and updates the signal. It is completely independent of the light/dark selector sitting next to it.

## Add a new palette

Adding a palette is **one command**. It writes the CSS, registers the palette in every environment, and wires up its web font — no manual editing of the service or the env files.

1. **Design and export** the palette at [tweakcn.com](https://tweakcn.com) and save the raw CSS under `themes/` (e.g. `themes/theme-ocean.css`).

2. **Run the importer from the project root** (where the `pnpm` scripts and the `themes/` folder live) with `--append`:

   ```bash
   pnpm theme:adapt themes/theme-ocean.css theme-ocean --name "Ocean" --append
   ```

   That single command:

   - **appends** the two scoped CSS blocks (`:root .theme-ocean` and `:root.dark .theme-ocean`) to `frontend/src/styles.css`;
   - **registers** `{ id, label, fontHref? }` in all five `environment*.ts` files — idempotent, so re-running never duplicates an existing id;
   - **detects the web font** from the export (`--font-sans` / `--font-serif` / `--font-mono`, skipping system stacks) and stores the Google Fonts URL as `fontHref`.

   `--name` is optional; without it the label is derived from the id (`theme-amber-minimal` → "Amber Minimal"). Drop `--append` to print the adapted CSS to stdout without touching any file.

   The resulting registry entry (in each env) looks like:

   ```ts
   // frontend/src/environments/environment.ts  (and the other four envs)
   appearance: {
     theme: 'theme-neutral',     // build default (must be one of the palettes below)
     layout: '',
     themeSelector: true,        // show the header selector in this build
     palettes: [
       { id: 'theme-neutral', label: 'Neutral' },
       {
         id: 'theme-ocean',
         label: 'Ocean',
         fontHref: 'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap',
       },
     ],
   },
   ```

3. **Reload the app.** The palette appears in the header selector (on builds with `themeSelector: true`), and its font loads itself if it declared one.

That is the whole flow: CSS + registration across the five envs + font detection, in one command.

### How the importer transforms the export

`pnpm theme:adapt` is implemented in `scripts/theme/adapt-tweakcn.ts` by pure functions — `adaptTweakcnExport`, `detectFontHref`, `registerPaletteInEnvSource`, `deriveLabelFromId` (tests: `pnpm test:theme`). Signature:

```bash
pnpm theme:adapt <export.css> <theme-id> [-n|--name "Label"] [--append]
```

Given a raw tweakcn export (`:root {}`, `.dark {}`, `@import`, `@theme inline`, …) it:

- Emits `:root .theme-<id>` from the export's `:root` block and `:root.dark .theme-<id>` from its `.dark` block, injecting the matching `color-scheme`.
- **Strips** `@import`, `@custom-variant`, `@layer base`, and `@theme inline` — those are supplied globally by the Spartan preset, so a per-palette copy would be redundant or conflicting.
- **Detects the web font** (first family of each `--font-*`, system stacks filtered out) and builds the `fontHref`.
- **Warns** if the export had no `.dark` block (only the light block is emitted).

With `--append` it writes the CSS to `frontend/src/styles.css` and registers the palette across the five envs; without it, it just prints the CSS to stdout.

## Fonts follow the theme

You normally don't touch fonts by hand — the importer detects them and the framework loads them. Two pieces make that work, both covered in depth in the concept:

- **Applied:** `frontend/src/styles.css` binds `font-family: var(--font-sans, …)` on `<body>`, so typography follows the active palette's token.
- **Loaded:** when a palette declares a `fontHref`, `ThemePaletteService` injects its `<link rel="stylesheet">` into `<head>` on demand — once, and only for the active palette. System-stack palettes carry no `fontHref` and load nothing.

See [Theme palettes › How fonts follow the theme](../../../concepts/frontend/theme-palettes/#how-fonts-follow-the-theme) for the mechanism and the login-page edge case.

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

- [Theme palettes](../../../concepts/frontend/theme-palettes/) — the concept: resolution model, anti-FOUC flow, fonts, propagation.
- [tweakcn.com](https://tweakcn.com) — the visual theme editor the importer consumes.
