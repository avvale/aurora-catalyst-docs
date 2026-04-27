---
title: "Relationship components in @aurora"
description: "Four new standalone Angular components — async-select-search, grid-select-element, grid-select-multiple-elements, grid-elements-manager — ship under @aurora/components."
date: 2026-04-24
version: "Unreleased"
classification: feature
source_commit: "4884bc261337588b0954bac2cf88cb86b4f9353d"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/4884bc261337588b0954bac2cf88cb86b4f9353d/openspec/changes/archive/2026-04-24-add-relationship-components/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- Four new standalone components in `frontend/src/@aurora/components/`: `async-select-search` (many-to-one with lazy search), `grid-select-element` (many-to-one as a table dialog), `grid-select-multiple-elements` (many-to-many table picker), and `grid-elements-manager` (events-only one-to-many CRUD shell).
- Uniform input/output contract — `[value]` in, `(valueChange)` out — without `ControlValueAccessor` and without a `FormControl` as input. Hosts wire the form via `[value]="form.controls.x.value"` + `(valueChange)="form.controls.x.setValue($event)"`. The contract is set up for the upcoming Signal Forms migration.
- Spartan-ng primitives (`hlm-combobox`, `hlm-command`, `hlm-popover`, `hlm-dialog`, `hlm-alert-dialog`, …) provide the UI foundation; the three `grid-*` components compose over the existing `@aurora/components/data-table` instead of reimplementing selection, pagination, or search. A shared `Option<T>` shape ships in `@aurora/components`.

## Why it matters

Until now, any form with a relation needed a hand-rolled dropdown, async search, multi-select, or nested CRUD. These four cover the four cardinalities under one consistent contract and become the building blocks consumed by `spec-09-relationship-webcomponent-dispatch` on the CLI side. Every component has a co-located `*.stories.ts`; `grid-select-element` adds a `*.spec.ts` covering open/close, selection, search propagation, and the disabled state. The change is purely additive — nothing existing breaks.

---

[View original proposal](https://github.com/avvale/aurora-catalyst/tree/4884bc261337588b0954bac2cf88cb86b4f9353d/openspec/changes/archive/2026-04-24-add-relationship-components/)
