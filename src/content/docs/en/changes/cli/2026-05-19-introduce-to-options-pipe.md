---
title: "ToOptions pipe for select labels"
description: "A new @aurora ToOptionsPipe maps lists to Option[] using a displayField template, so generated select widgets render the right label without a hardcoded name field."
date: 2026-05-19
version: "Unreleased"
classification: feature
source_commit: "9a43677f61bf3fd6a89ce726e9741c7f84a4f3e7"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/9a43677f61bf3fd6a89ce726e9741c7f84a4f3e7/openspec/changes/archive/2026-05-19-introduce-to-options-pipe/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- Adds `ToOptionsPipe` to `@aurora` — a pure pipe that maps a list to `Option[]` using a `{field}` template, so select labels follow each aggregate's `front.displayField` instead of a hardcoded `name`.
- Generated search-select and multi-select relationship widgets now bind through the pipe instead of emitting a per-component `…AsOptions` computed.

## Why it matters

Relationship dropdowns whose display field is `code`, or a composite like `{code} - {name}`, now render the correct label out of the box — no hand-editing of generated forms. Because the binding is a single declarative token, form components stop carrying a duplicated `computed<Option[]>` and the `Option` / `computed` imports it dragged in. You can use the pipe directly in your own templates too: `items | toOptions:'{code} — {name}'`.

---

[View original proposal](https://github.com/avvale/aurora-catalyst-cli/tree/9a43677f61bf3fd6a89ce726e9741c7f84a4f3e7/openspec/changes/archive/2026-05-19-introduce-to-options-pipe/)
