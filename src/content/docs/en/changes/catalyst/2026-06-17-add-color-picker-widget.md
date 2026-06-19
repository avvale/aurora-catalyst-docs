---
title: "color-picker widget type"
description: "A scalar field can now declare widget type color-picker and the front-module generator emits an au-color-picker bound to the Signal Form."
date: 2026-06-17
version: "Unreleased"
classification: feature
source_commit: "1e9b764950807a5dffed95b56b298965c3711261"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/1e9b764950807a5dffed95b56b298965c3711261/openspec/changes/archive/2026-06-17-add-color-picker-widget/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- A scalar (`varchar`) field can now declare `widget: { type: color-picker }`, and the front-module generator emits an `<au-color-picker>` bound to the Signal Form via `[formField]`.
- `color-picker` is added to the published JSON schema (`aurora-1.4.json`), so YAML validation and editor autocomplete accept it.

## Why it matters

The `au-color-picker` component already existed but was unreachable from the schema, so any module that wanted a color input — like the HUB app `color` field that tints each launchpad card — had to hand-edit its generated form, breaking the schema-first contract. Now a field declares itself a color input and the generator wires `ColorPickerImports` from the public `@aurora` barrel for you. The change is purely additive: existing widgets and fields are untouched, and a field opts in only by setting the widget.

---

[View original proposal](https://github.com/avvale/aurora-catalyst/tree/1e9b764950807a5dffed95b56b298965c3711261/openspec/changes/archive/2026-06-17-add-color-picker-widget/)
