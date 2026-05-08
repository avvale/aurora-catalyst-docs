---
title: "Shared `<au-data-table>` component"
description: "List components and m2m widgets now consume a single `<au-data-table>` instead of duplicating inline `<table hlmTable>` markup."
date: 2026-05-07
version: "Unreleased"
classification: feature
source_commit: "e04288f0802e1e23ff6fc017f5ea8d566268a29b"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/e04288f0802e1e23ff6fc017f5ea8d566268a29b/openspec/changes/archive/2026-05-07-extract-shared-data-table-component/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- New runtime component `<au-data-table>` at `@aurora/components/data-table` encapsulates the `<table hlmTable>` markup, scroll wrapper, sticky header, and loading/empty UX. Imported via `import { DataTableComponent } from '@aurora'`.
- BREAKING — the list-component template emits `<au-data-table [table]="paginated.table" [loading]="..." [emptyMessage]="..." />` instead of ~50 lines of inline markup. `HlmTableImports` is no longer required at the list level.
- Inputs: `table: Table<T>` (required), `loading: boolean`, `emptyMessage: string`, `rowClickable: (row) => boolean`. Output: `rowClick: T`.
- Loading-keeps-old-rows behavior: during refetch the previous rows stay visible until the new ones arrive, so the TBODY does not collapse and the page scroll does not yank to top.
- New story `data-table.stories.ts` covers standard render, empty, loading-with-no-data, and row-click variants.

## Why it matters

The standalone list, the `<au-grid-select-multiple-elements>` widget, and `<au-grid-pick-dialog>` were each maintaining their own copy of the same `<table hlmTable>` markup. Past bugs — TBODY collapse during refetch, "page N of 1" after search — had to be fixed in three places. Hoisting the table into a single component means the next round of improvements (keyboard navigation, virtual scroll, sticky toolbar) lands once, not three times. Visual output for end users is byte-identical for existing aggregates; the list templates just shrink. Hand-edited list components trip `.origin` review on the next regen because the markup changes shape.

---

[View original proposal](https://github.com/avvale/aurora-catalyst-cli/tree/e04288f0802e1e23ff6fc017f5ea8d566268a29b/openspec/changes/archive/2026-05-07-extract-shared-data-table-component/)
