---
title: "M2M relationship form widgets"
description: "Many-to-many relationships declared with a form widget now generate a working FormControl instead of throwing 'Cannot find control' at runtime."
date: 2026-05-20
version: "Unreleased"
classification: feature
source_commit: "9a43677f61bf3fd6a89ce726e9741c7f84a4f3e7"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/9a43677f61bf3fd6a89ce726e9741c7f84a4f3e7/openspec/changes/archive/2026-05-20-support-many-to-many-form-widgets/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- A many-to-many relationship declared with a form widget (e.g. `multiple-select`) now generates a working `FormControl` named `<singular>Ids: string[]`. Previously the control was omitted and Angular threw `Cannot find control with name: <singular>Ids` at runtime.
- Edit-mode forms project the denormalized read shape (`<plural>: T[]`) into the `<singular>Ids` control on reset, and the detail/list configs emit the matching `include` so the related data loads.

## Why it matters

The many-to-many-via-form pathway is usable end to end: declare a widget on an m2m property in YAML and the generated form just works — no post-generation hand-editing, and no need to disable the widget. The `applicationIds: [ID]` write contract over the GraphQL boundary is preserved; the read/write shape translation lives in the form, not in the aggregate or repository.

---

[View original proposal](https://github.com/avvale/aurora-catalyst-cli/tree/9a43677f61bf3fd6a89ce726e9741c7f84a4f3e7/openspec/changes/archive/2026-05-20-support-many-to-many-form-widgets/)
