---
title: "User-driven column pinning"
description: "`<au-column-toggle>` lock button now pins/unpins columns at runtime via TanStack pinning, with two drag zones and `localStorage` persistence."
date: 2026-05-08
version: "Unreleased"
classification: feature
source_commit: "8c7f3936ef622d7b830b2de3d06776f479bfc821"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/8c7f3936ef622d7b830b2de3d06776f479bfc821/openspec/changes/archive/2026-05-08-au-data-table-user-pinning/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- `<au-column-toggle>` lock button calls `column.pin('left')` / `column.pin(false)`, replacing the dead local signal. The toggle item's sticky state is derived from `column.getIsPinned()`.
- Columns declared with `sticky: 'left' | 'right'` in `DataTableColumnDef` are hard locks: the lock button renders with a badge and is not clickable. The dev's intent is preserved.
- The toggle splits into two `cdkDropList` zones (sticky-left and scroll), separated by an `<hr>` with a label. Drag-and-drop is restricted to the same zone.
- `<au-data-table>` switches from a manual `stickyOffsets` computed to TanStack's native `column.getStart('left')` / `column.getAfter('right')` — the contiguous-sticky invariant is now framework-enforced.
- Pinning + visibility + order persist via `localStorage` keyed by `route + tableId`. Reset clears the entry. A soft warning fires when pinned-column widths exceed 50% of the visible viewport.

## Why it matters

The lock button used to be a stub. Users can now pin columns from the UI, drag-reorder within each zone, and have the layout survive a refresh. The migration to TanStack pinning also makes the "sticky columns are contiguous" invariant a framework guarantee instead of a manual offset computation, removing a class of layout drift bugs that could surface as the table state grew.

---

[View original proposal](https://github.com/avvale/aurora-catalyst/tree/8c7f3936ef622d7b830b2de3d06776f479bfc821/openspec/changes/archive/2026-05-08-au-data-table-user-pinning/)
