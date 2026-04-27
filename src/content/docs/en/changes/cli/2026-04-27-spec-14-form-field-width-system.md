---
title: "12-column form grid + widget.span"
description: "Form fields now lay out on a uniform 12-column grid with type-based default spans, an optional widget.span override, and auto-expand of the last incomplete row."
date: 2026-04-27
version: "Unreleased"
classification: feature
source_commit: "f5e8b7eae51c25bc70e00c17693733d83e253622"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/f5e8b7eae51c25bc70e00c17693733d83e253622/openspec/changes/archive/2026-04-27-spec-14-form-field-width-system/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- New optional YAML field `widget.span` (integer 1–12) for a per-property column-span override. Out-of-range values fail schema validation before generation runs.
- Every form, group, and tab panel renders on a single 12-column grid (`grid-cols-1 md:grid-cols-12`). Default spans come from a fixed type table — `boolean` / `date` / `time` → 3, numerics → 4, `varchar` by `maxLength` (≤30 → 4, 31–80 → 6, >80 → 12), `text` and grid relations → 12.
- The last field of an incomplete row auto-expands to fill the remaining columns. The pass runs independently per container, so each `widget.group` and each tab balances its own row math.

## Why it matters

A regenerated form is more predictable: a single `varchar(64)` field no longer renders at 50% inside a dialog, gaps stop appearing when fields don't sum to a clean grid total, and the layout no longer jumps from 2 to 6 columns when you add the sixth field. The legacy machinery — `SPAN_TABLE`, `pickGridMode`, `lengthToProportion`, the compact/medium/full tiers — is gone. Existing YAMLs do not need migration: modules without `span` adopt the new defaults automatically. Regenerating any module that uses form-body produces visually different markup by design.

---

[View original proposal](https://github.com/avvale/aurora-catalyst-cli/tree/f5e8b7eae51c25bc70e00c17693733d83e253622/openspec/changes/archive/2026-04-27-spec-14-form-field-width-system/)
