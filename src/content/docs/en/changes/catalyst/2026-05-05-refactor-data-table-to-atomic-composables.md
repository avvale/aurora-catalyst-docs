---
title: "Atomic composables + manager rewrite"
description: "Composables go atomic under @aurora/composables/{atoms,presets}/, and grid-select-multiple-elements becomes a many-to-many manager with a new immediate link/unlink contract."
date: 2026-05-05
version: "Unreleased"
classification: breaking
source_commit: "c28bb6027810bc9a05d262ed3b9913cc57d2166b"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/c28bb6027810bc9a05d262ed3b9913cc57d2166b/openspec/changes/archive/2026-05-05-refactor-data-table-to-atomic-composables/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- (Breaking) `grid-select-multiple-elements` is now a many-to-many manager. The Apply/Cancel batch contract is gone — the component renders the linked outer table plus a candidate dialog and emits `linkRequested(ids[])` / `unlinkRequested(ids[])` immediately.
- New atomic layer under `@aurora/composables/{atoms,presets}/`: 9 data-table atoms (`useTableSearch`, `useTableSort`, `useTablePagination`, `useTableSelection`, …), 10 graphql atoms, and presets `usePaginatedDataTable`, `useStaticDataTable`, `usePivotMembership`, `useRelationshipPivot`.
- Three new fetchers (`mutateInsert`, `mutateDeleteByKeys`, `mutateDelete`) and a new reusable `grid-pick-dialog` component for server-paginated single or multi pick.

## Why it matters

The brain layer (composables) now matches the visual layer's atomic philosophy: single-responsibility lego bricks plus opinionated presets for the common server-paginated list. Migration path for the breaking item: any consumer of `<au-grid-select-multiple-elements>` must drop the previous `[value]` / `(valueChange)` Apply/Cancel wiring and instead handle `(linkRequested)` and `(unlinkRequested)` to mutate the pivot and refresh `linkedData`. Imports through the `@aurora` alias root keep resolving — only that component's I/O contract changed.

---

[View original proposal](https://github.com/avvale/aurora-catalyst/tree/c28bb6027810bc9a05d262ed3b9913cc57d2166b/openspec/changes/archive/2026-05-05-refactor-data-table-to-atomic-composables/)
