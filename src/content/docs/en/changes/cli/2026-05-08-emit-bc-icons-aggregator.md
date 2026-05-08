---
title: "Per-BC sidebar icons aggregator"
description: "Codegen now emits a `<bc>-icons.providers.ts` aggregator and keeps `nav-main.ts` in sync, eliminating silent icon-registration drift."
date: 2026-05-08
version: "Unreleased"
classification: feature
source_commit: "5b4b6cb56ea9cfbf4e7979017ad6c6f95bc647c0"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/5b4b6cb56ea9cfbf4e7979017ad6c6f95bc647c0/openspec/changes/archive/2026-05-08-emit-bc-icons-aggregator/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- New file emitted per bounded context: `<bc>-icons.providers.ts`, exporting `<bcCamel>Icons` — the deduplicated, alphabetical set of `lucide*` icons declared in `<bc>.navigation.ts`. Marked `@aurora-catalyst-generated`, fully overwritten on each regen.
- New idempotent bootstrap mutates `nav-main.ts` exactly once per BC: adds an `import { <bcCamel>Icons }` and a `...<bcCamel>Icons` spread inside `provideIcons({...})`. Existing imports and framework-chrome icons are left untouched.
- The scaffold template `nav-main.ts` is updated to declare only framework icons inline (`lucideSquareTerminal`, `lucideChevronRight`, …); BC-specific icons must live in the aggregator.

## Why it matters

Adding a NavItem with a new icon used to require a manual edit to `nav-main.ts` to register the icon in `provideIcons`. Forgetting the edit produced an empty `<ng-icon>` in the sidebar — a silent visual bug, no runtime error. With the aggregator owning the registration, every front-module regen keeps the sidebar in sync; consumers only edit `nav-main.ts` for framework chrome. When `provideIcons` is invoked with a non-canonical argument (e.g. a custom variable), the bootstrap logs `[NAV-MAIN BOOTSTRAP SKIPPED]` and emits the aggregator anyway, so manual wire-up is still possible.

---

[View original proposal](https://github.com/avvale/aurora-catalyst-cli/tree/5b4b6cb56ea9cfbf4e7979017ad6c6f95bc647c0/openspec/changes/archive/2026-05-08-emit-bc-icons-aggregator/)
