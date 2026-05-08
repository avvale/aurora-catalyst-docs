---
title: "Responsive data-table columns"
description: "Generated columns now declare `size`, `minSize`, and `sticky: 'left'` for actions/select, plus a null-safe cell fallback."
date: 2026-05-08
version: "Unreleased"
classification: feature
source_commit: "a41e3fb048b4c4374b235314d856608a1e6abbeb"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/a41e3fb048b4c4374b235314d856608a1e6abbeb/openspec/changes/archive/2026-05-08-emit-responsive-data-table-columns/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- `<mod>.columns.ts` now emits an explicit `size` (rigid columns) or `size + minSize` (elastic columns) pair for every scalar and FK column, derived from the property type via a closed heuristic table — `boolean → 100`, `varchar/char ≤ 100 → 200/120`, `varchar/char > 100 → 300/160`, `text → 300/160`, FK label → `220/140`.
- The runtime-composed `actions` (size 50) and `select` (size 40) columns gain `sticky: 'left'`, anchoring them to the left edge under horizontal scroll.
- Scalar non-boolean cell renderers now render `null` / `undefined` as empty (`?? ''`) instead of the literal string `"null"`.

## Why it matters

Without explicit `size`/`minSize`, TanStack injects defaults that collapse every column into the elastic-no-minimum bucket — column widths jitter between pages, and there is no anchor for sticky offsets. The new heuristic locks rigid columns to a deterministic width and lets elastic columns absorb space down to a minimum, giving a layout that holds under narrow viewports and stable widths across pagination. The null-safe cell fallback closes a pre-existing visual bug.

---

[View original proposal](https://github.com/avvale/aurora-catalyst-cli/tree/a41e3fb048b4c4374b235314d856608a1e6abbeb/openspec/changes/archive/2026-05-08-emit-responsive-data-table-columns/)
