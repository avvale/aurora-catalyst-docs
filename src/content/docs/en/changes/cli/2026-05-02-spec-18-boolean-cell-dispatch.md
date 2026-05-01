---
title: "Icon cell for boolean columns"
description: "Boolean columns in generated lists now render an icon via a new shared `BooleanCell` component instead of the literal `true` / `false` text."
date: 2026-05-02
version: "Unreleased"
classification: feature
source_commit: "fb1cc7e512286a20656a11d965aa02029a6fe3a7"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/fb1cc7e512286a20656a11d965aa02029a6fe3a7/openspec/changes/archive/2026-05-02-spec-18-boolean-cell-dispatch/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- The `<mod>.columns.ts` codegen now dispatches by property type: when `type === 'boolean'` (non-relational), the column emits `cell: () => flexRenderComponent(BooleanCell, { inputs: {} })` plus the standard `sortable` / `filterable` / `exportable` flags. No `searchable` flag — text search over `"true"` / `"false"` is not useful.
- The new `BooleanCell` lives at `@aurora/components/data-table/cells/boolean-cell.component.ts`. Defaults: `lucideCheck` + `text-emerald-600` for `true`, `lucideMinus` + `text-muted-foreground/60` for `false`. Override per column with `inputs: { trueIcon, falseIcon, trueClass, falseClass }`.
- The `cells/` folder convention is now documented: read-only formatting components rendered via `flexRenderComponent` live under `cells/`; interactive chrome that mutates table state stays under `components/`. Future renderers (`DateCell`, `BadgeCell`, …) follow the same split.

## Why it matters

The previous codegen emitted plain string-coercion for every non-relational property, so boolean columns rendered the literal `true` / `false` text. The first module that hit this — `iam/tenant` — worked around it with a per-module `tenant-list-active-cell.component.ts` that would have duplicated across every aggregate declaring a boolean. Now the codegen owns the dispatch and the cell. Aggregates with at least one boolean property regenerate with `[FILE OVERWRITE]` on `.columns.ts`; aggregates without booleans regenerate byte-identical.

---

[View original proposal](https://github.com/avvale/aurora-catalyst-cli/tree/fb1cc7e512286a20656a11d965aa02029a6fe3a7/openspec/changes/archive/2026-05-02-spec-18-boolean-cell-dispatch/)
