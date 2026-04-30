---
title: "Search-select widget family"
description: "Three new sync/multi search-select widgets, the existing component renames to the `au-*` convention, and all four wrappers gain a `touched` output."
date: 2026-04-30
version: "Unreleased"
classification: breaking
source_commit: "a66d99c7b089c5241889331a97e0dc144feaf090"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/a66d99c7b089c5241889331a97e0dc144feaf090/openspec/changes/archive/2026-04-30-spec-16-search-select-widgets/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- BREAKING — `aurora-async-select-search` renames to `<au-async-search-select>`. The folder, class (`AsyncSelectSearchComponent` → `AsyncSearchSelectComponent`), selector, stories, spec, and barrel export all move. Modules with `widget.type: async-search-select` regenerate to emit the new tag — no YAML edit needed.
- Three new YAML widget types — `search-select`, `multiple-search-select`, `async-multiple-search-select` — fill the gap between the 20-option `select` and the 1000+ `async-search-select`. Sync variants preload all options and rely on Spartan's client-side filter; the async-multi adds debounced search and multi-selection.
- All four search-select wrappers gain a `touched: output<void>()` firing on combobox close, fixing the "open + close without selecting" gotcha. The Aurora library also ships a transloco key `Aurora.NoResults` so empty states do not need per-bounded-context translations.

## Why it matters

For YAML-only consumers, regenerating any module with `widget.type: async-search-select` is the whole migration. Manual importers of the renamed class update the symbol (`AsyncSelectSearchComponent` → `AsyncSearchSelectComponent`) and the tag selector (`aurora-async-select-search` → `au-async-search-select`). The async refetch flow now lives at the shell level — the form emits `<relSingular>Search` and the shell hosts an `on<RelPascal>Search` handler that calls `queryPaginate`. Any shell with custom search wiring needs a regen to pick up the new handler. The three new widget types are pure additive: declare in YAML, regenerate, done.

---

[View original proposal](https://github.com/avvale/aurora-catalyst-cli/tree/a66d99c7b089c5241889331a97e0dc144feaf090/openspec/changes/archive/2026-04-30-spec-16-search-select-widgets/)
