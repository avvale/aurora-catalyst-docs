---
title: "Grid-multi as shell section"
description: "The m2m manager widget moves out of the form-body into a dedicated full-width `<section hlmCard>` in the detail shell."
date: 2026-05-07
version: "Unreleased"
classification: breaking
source_commit: "e04288f0802e1e23ff6fc017f5ea8d566268a29b"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/e04288f0802e1e23ff6fc017f5ea8d566268a29b/openspec/changes/archive/2026-05-07-grid-multi-render-as-shell-section/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- BREAKING — `grid-select-multiple-elements` no longer renders inside the form. The detail shell emits a separate `<section hlmCard class="mt-4">` per grid-multi widget, gated by `@if (mode() === 'edit')`. The pattern mirrors the existing `grid-elements-manager` (SPEC-15).
- BREAKING (form contract) — the 10-port I/O contract introduced the same day in `grid-multi-manager-pattern-emission` is removed. Form templates no longer emit `<rel>LinkedData / Loading / LinkRequested / ...`; the form returns to a simple dumb leaf.
- The form-body filter unconditionally skips `grid-select-multiple-elements`. The corresponding partial collapses to a stub HTML comment for defensive use only.
- The form template stops importing `GridSelectMultipleElementsComponent`, `DataTableData`, `ManagerLoadingState`, and `ServerTableState`. The detail shell owns these imports.

## Why it matters

The earlier same-day change emitted the manager widget inside the form's `max-w-3xl` card — visually cramped for a paginated table with search, filters, and hundreds of rows. The sister widget `grid-elements-manager` had already established the right pattern: render in the detail shell as its own full-width card below the form. This change aligns `grid-select-multiple-elements` with that pattern. The orchestrator wiring is unchanged (`init()` sequencing, `relationIncludes`, the bundle's three composables); only the rendering location moves. Hand-edited downstream forms that consumed the 10 ports must regenerate — the form returns to its pre-passthrough surface and the shell binds the widget to the orchestrator directly.

---

[View original proposal](https://github.com/avvale/aurora-catalyst-cli/tree/e04288f0802e1e23ff6fc017f5ea8d566268a29b/openspec/changes/archive/2026-05-07-grid-multi-render-as-shell-section/)
