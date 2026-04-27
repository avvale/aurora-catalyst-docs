---
title: "Relational widget dispatch in forms"
description: "The form generator now dispatches every relational widget.type to a Spartan partial, declares per-relation Options inputs, and pre-loads them in the route resolver."
date: 2026-04-26
version: "Unreleased"
classification: feature
source_commit: "bb7e223b54e09d8bd4017dff57715fb9f25b3e99"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/bb7e223b54e09d8bd4017dff57715fb9f25b3e99/openspec/changes/archive/2026-04-26-spec-09-relationship-webcomponent-dispatch/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- `form-body.eta` now dispatches FK properties whose `widget.type` is `select`, `multiple-select`, `async-search-select`, `grid-select-element`, or `grid-select-multiple-elements` to dedicated partials under `partials/relationships/`. The premature `id` filter is relaxed so FK ids that carry a `widget` block reach the dispatch.
- Five Spartan-migrated partials replace the legacy Material ones: `select.eta` and `multiple-select.eta` emit `<hlm-select>`; the other three emit the matching `@aurora/components` (delivered separately by `add-relationship-components`).
- The generated `*-form.component.ts` declares one `<relSingularName>Options = input<Target[]>([])` per relational property — and a `<relSingularName>Columns` input for the two grid selectors. The route resolver pre-loads each option list in parallel via `forkJoin` and the shell forwards the values to the form.

## Why it matters

The relational surface of the generator was effectively dead code: `webComponent.type: select` was discarded by the id filter, and the included partials pointed at files that did not exist. Every CRUD module with FKs is unblocked. Pivot aggregates and modules without `widget` declarations regenerate byte-identical, so adoption is pay-as-you-go — declare `widget.type` in the YAML and the form picks it up on the next regeneration.

---

[View original proposal](https://github.com/avvale/aurora-catalyst-cli/tree/bb7e223b54e09d8bd4017dff57715fb9f25b3e99/openspec/changes/archive/2026-04-26-spec-09-relationship-webcomponent-dispatch/)
