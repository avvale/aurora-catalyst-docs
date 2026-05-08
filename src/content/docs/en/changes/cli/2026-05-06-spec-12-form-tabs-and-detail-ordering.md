---
title: "Form tabs and detail ordering"
description: "Three previously-dead schema fields now drive form rendering — `widget.tab` groups fields into tabs, `widget.detailSort` orders them, `widget.isDetailHidden` hides them."
date: 2026-05-06
version: "Unreleased"
classification: feature
source_commit: "2576efbf76eda48aa404955ea6844ed739509268"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/2576efbf76eda48aa404955ea6844ed739509268/openspec/changes/archive/2026-05-06-spec-12-form-tabs-and-detail-ordering/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- `widget.tab` now groups fields into tabs. The form-body renders `<hlm-tabs>` with one panel per unique tab id, each panel as its own `<section hlmCard>`. Tab order follows first-field appearance; matching is exact and case-sensitive.
- `widget.detailSort` orders fields ascending within their container (group → tab → form). Default `Infinity` sends fields without a value to the tail; YAML order tiebreaks.
- `widget.isDetailHidden: true` removes a field from the form body — it doesn't render, doesn't get a grid cell, and doesn't count toward the grid-tier calculation. Hidden fields can still live in the FormGroup if listed in `formGroupFields` for round-tripping.
- Tabbed forms gain an `activeTab` signal and `<tabId>HasErrors` computeds. `submit()` jumps to the first tab with errors before marking touched, and the trigger renders an error badge.
- Dialog mode + tabs prints a console warning and renders without tabs (space too tight); ordering and hidden filters still apply.

## Why it matters

The three YAML fields were declared in `aurora-1.4.json` but ignored by the codegen — dead documentation. Connecting them unlocks larger forms with logical groupings, explicit field ordering independent of YAML order, and the ability to keep internal-only fields (system audit, computed) in the aggregate without leaking them to the UI. Modules that don't declare any of the three are byte-identical to before, so the migration is opt-in: declare in YAML, regenerate. Tabbed forms also get error-aware navigation: an invalid submit jumps to the first tab with errors automatically. The list-side counterparts (`listSort`, `isListHidden`) live in different templates and ship in a separate change.

---

[View original proposal](https://github.com/avvale/aurora-catalyst-cli/tree/2576efbf76eda48aa404955ea6844ed739509268/openspec/changes/archive/2026-05-06-spec-12-form-tabs-and-detail-ordering/)
