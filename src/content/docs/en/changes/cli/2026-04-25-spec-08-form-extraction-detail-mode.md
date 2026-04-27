---
title: "Detail mode: view or dialog"
description: "Aggregate forms move to a standalone *-form.component.ts and a new front.detailMode YAML field chooses between a routed page and a list-with-modal CRUD."
date: 2026-04-25
version: "Unreleased"
classification: breaking
source_commit: "3cb501aa990280454f628109a15f1f05726fe268"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/3cb501aa990280454f628109a15f1f05726fe268/openspec/changes/archive/2026-04-25-spec-08-form-extraction-detail-mode/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- The `AURORA:FORM-FIELDS-START/END` preservation region moves from `*-detail.component.ts` to the new `*-form.component.ts`. **Custom region bodies do not migrate automatically** — copy yours into the new form file before regenerating, or the CLI emits `[REGION DROPPED]` and your edits are lost.
- Form body extracts into a standalone `*-form.component.ts` — dumb component with `[initial]` + `[mode]` inputs, `(save)` + `(cancel)` outputs, and a public `submit()` method. No Apollo, no chrome.
- New optional YAML field `front.detailMode`. Default `view` keeps the routed `/new` + `/edit/:id` flow; `dialog` skips emitting `*-detail.component.ts` and embeds an `<hlm-dialog>` plus the form inside the list.
- New hand-authored composable `useAggregateShell<T>` in `@aurora/lib/` — `fetchForEdit`, `save`, `loading`, `error` — consumed identically by view-mode and dialog-mode shells.

## Why it matters

The form becomes embeddable anywhere: routed detail in view mode, modal CRUD in dialog mode, and the relational child editor of the upcoming `grid-elements-manager`. Default-mode modules regenerate with identical runtime behaviour — list, routes, create, edit, and cancel flows are unchanged. The only observable difference is the file split, which is mechanical.

---

[View original proposal](https://github.com/avvale/aurora-catalyst-cli/tree/3cb501aa990280454f628109a15f1f05726fe268/openspec/changes/archive/2026-04-25-spec-08-form-extraction-detail-mode/)
