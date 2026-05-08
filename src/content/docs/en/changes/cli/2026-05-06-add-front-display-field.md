---
title: "Display field for aggregates"
description: "New `front.displayField` and `front.templateDisplayField` schema attributes let aggregates without a `name` field declare their display label."
date: 2026-05-06
version: "Unreleased"
classification: feature
source_commit: "f4ddb20e9b220e14ea57d8a52b63fbcd56e4a06f"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/f4ddb20e9b220e14ea57d8a52b63fbcd56e4a06f/openspec/changes/archive/2026-05-06-add-front-display-field/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- New `front.displayField` attribute names which property holds the human-readable label. Defaults to `'name'`. Used by list delete toasts and FK column accessors.
- New `front.templateDisplayField` attribute composes multi-field labels via `{fieldName}` interpolation, e.g. `'{code} - {name}'`. Falls back to `displayField` when unset.
- FK column accessors stop hardcoding `target.name` — they resolve the target's `displayField` cross-schema, so an FK to an aggregate displaying by `email` now reads `target.email`.

## Why it matters

For aggregates without a `name` property — `iam/account` displays by `email`, for example — the generated list and FK columns no longer fail with `TS2339 property 'name' does not exist`. Just declare `front.displayField: email` in the YAML and regenerate. Aggregates that do have a `name` and don't declare anything emit byte-identical code, so the upgrade is zero-risk for the common case. The `templateDisplayField` opens the door to composite labels (`'{code} - {name}'`) for aggregates whose identity is not a single field. The cross-repo `aurora-1.4.json` schema bumps to register both new attributes so YAML validation also picks them up.

---

[View original proposal](https://github.com/avvale/aurora-catalyst-cli/tree/f4ddb20e9b220e14ea57d8a52b63fbcd56e4a06f/openspec/changes/archive/2026-05-06-add-front-display-field/)
