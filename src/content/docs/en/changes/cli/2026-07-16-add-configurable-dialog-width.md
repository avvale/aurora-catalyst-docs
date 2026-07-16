---
title: "Configurable dialog width"
description: "New optional front.dialogWidth YAML field sets a definite, responsive width for create/edit dialogs, and fixes the dialog visibly resizing as form contents change."
date: 2026-07-16
version: "Unreleased"
classification: feature
source_commit: "e62292d9117737e633cd9f5424aa0e8e5104c458"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/e62292d9117737e633cd9f5424aa0e8e5104c458/openspec/changes/archive/2026-07-16-add-configurable-dialog-width/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- New optional per-module YAML field `front.dialogWidth`, meaningful only when `front.detailMode: dialog`. Accepts five named tokens — `sm`, `md` (default), `lg`, `xl`, `full` — each mapped to a definite, viewport-bounded width.
- Regenerating an existing dialog module now also fixes a standing bug: the dialog no longer visibly resizes as you pick different values in select fields, because every token renders a stable width instead of a content-driven one.

## Why it matters

Dialog-mode modules used to share one hard-coded width that silently tracked whatever content sat inside the dialog, so the box resized as the user filled the form. Now you declare the intent per module: `sm` for a one- or two-field form, `lg` or `xl` for a dense or wide one, `full` when the form needs most of the screen. Whichever token you pick renders at a stable width from the first paint. Existing dialog modules pick up the fix automatically the next time they are regenerated for any reason — no forced sweep, and no YAML change required unless you want a size other than the default `md`.

---

[View original proposal](https://github.com/avvale/aurora-catalyst-cli/tree/e62292d9117737e633cd9f5424aa0e8e5104c458/openspec/changes/archive/2026-07-16-add-configurable-dialog-width/)
