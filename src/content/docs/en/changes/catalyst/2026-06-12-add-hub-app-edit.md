---
title: "Edit Hub apps from the list"
description: "The Hub app list gains an Edit action to change mutable metadata and toggle isActive, with code and applicationId kept immutable end to end."
date: 2026-06-12
version: "Unreleased"
classification: feature
source_commit: "f44716b0d44e6f3f379ba8d2c9f9fd0b3937ef52"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/f44716b0d44e6f3f379ba8d2c9f9fd0b3937ef52/openspec/changes/archive/2026-06-12-add-hub-app-edit/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- The Hub app list now has an Edit action: open a registered app, change its mutable metadata (name, description, url, icon, color, sort), and toggle `isActive` from the UI.
- `code` and `applicationId` are immutable — the form disables `code` in edit mode and the backend strips both fields from the update payload regardless of transport.
- `redirectUri` is create-only: hidden and not required when editing.

## Why it matters

The update pipeline already existed (`hubUpdateAppById`, guarded by the `hub.app.update` permission), but the generated module shipped without the edit UI — so you couldn't activate or deactivate an app, or fix its metadata, without hand-editing. Now an administrator with `hub.app.update` manages registered apps straight from the list. The edit fetch uses the shared `fields` fragment, so it never exposes the OAuth `secret`.

---

[View original proposal](https://github.com/avvale/aurora-catalyst/tree/f44716b0d44e6f3f379ba8d2c9f9fd0b3937ef52/openspec/changes/archive/2026-06-12-add-hub-app-edit/)
