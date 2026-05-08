---
title: "Sticky responsive data-table"
description: "`<au-data-table>` gains horizontal sticky columns, stable layout under pagination, and default truncation with native tooltip."
date: 2026-05-08
version: "Unreleased"
classification: feature
source_commit: "4234c6600ba7a0ba3f3ef173125643e42906ede8"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/4234c6600ba7a0ba3f3ef173125643e42906ede8/openspec/changes/archive/2026-05-08-au-data-table-sticky-responsive/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- `DataTableColumnDef` gains a top-level `sticky?: 'left' | 'right'` flag — coherent with `label` / `sortable` / `filterable`, NOT inside `meta`. Marked columns get `position: sticky` with cumulative offsets computed from preceding sticky columns on the same edge.
- The component switches to `table-layout: fixed` with `width: 100%` and a computed `min-width` summing the rigid + elastic minimums. Rigid columns (`size` only) lock; elastic columns (`size` + `minSize`) absorb the remaining space.
- Default truncation on elastic `<td>` via `overflow: hidden` / `text-overflow: ellipsis` / `white-space: nowrap`, with a native `[attr.title]` tooltip carrying the resolved text. Custom cells can override.
- Sticky offsets recalculate when column visibility changes (toggle).

## Why it matters

Three pains disappeared on narrow viewports and during pagination: (1) `actions` and `select` no longer scroll with the body, (2) horizontal scroll moves only data columns, and (3) the table width stops jittering between pages because `auto` no longer remeasures every cell. The fix is shared in `<au-data-table>` so consumers do not redo the math per list.

---

[View original proposal](https://github.com/avvale/aurora-catalyst/tree/4234c6600ba7a0ba3f3ef173125643e42906ede8/openspec/changes/archive/2026-05-08-au-data-table-sticky-responsive/)
