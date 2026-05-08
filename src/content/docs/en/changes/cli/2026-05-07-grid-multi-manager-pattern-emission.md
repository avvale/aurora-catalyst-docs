---
title: "Grid-multi manager pattern"
description: "The `grid-select-multiple-elements` widget re-enables with manager-pattern emission and a `useRelationshipPivot` orchestrator on the detail shell."
date: 2026-05-07
version: "Unreleased"
classification: feature
source_commit: "51ca231bee2c5e5437221f555c40b682b7c4878c"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/51ca231bee2c5e5437221f555c40b682b7c4878c/openspec/changes/archive/2026-05-07-grid-multi-manager-pattern-emission/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- BREAKING — the `grid-select-multiple-elements` widget emits real markup again (the previous deferral stub is reversed). Membership renders via `<au-grid-select-multiple-elements>` gated by `@if (mode() === 'edit')`.
- BREAKING (form contract) — for each grid-multi widget the form gains 6 input signals (`<rel>LinkedData / LinkedColumns / CandidatesData / CandidatesColumns / LinkedIds / Loading`) and 4 outputs (`<rel>LinkedStateChange / CandidatesStateChange / LinkRequested / UnlinkRequested`). The grid-multi property is excluded from `signalForm.controls` — membership lives in the pivot table, mutated by instant API calls outside the form's create/update lifecycle.
- The detail shell instantiates `useRelationshipPivot<TLinked, TCandidate, TPivot>` per grid-multi widget and binds form events to the orchestrator.
- Dialog mode + grid-multi prints a warning and skips the widget; mode `'new'` hides it because membership requires a `parentId` that does not exist yet.

## Why it matters

After sub-changes A (`displayField`) and B (`skip-pivot-frontend-emission`) cleared the path, this closes the m2m loop. `iam/role` regenerates with a fully working permissions manager — link/unlink permissions to a role with instant API calls. Because membership is mutated outside the form's lifecycle, the form does not own a FormControl for the m2m field and the user creates the parent first, then navigates to edit to manage membership. The 10-port form contract is the price of keeping the form a dumb leaf while the shell orchestrates state. Sibling m2m widgets (`multiple-select`, `multiple-search-select`, `async-multiple-search-select`) keep their `string[]` FormControl model — only the grid-multi flavor uses the pivot orchestrator.

---

[View original proposal](https://github.com/avvale/aurora-catalyst-cli/tree/51ca231bee2c5e5437221f555c40b682b7c4878c/openspec/changes/archive/2026-05-07-grid-multi-manager-pattern-emission/)
