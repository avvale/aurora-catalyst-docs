---
title: "Grid elements manager widget"
description: "The grid-elements-manager widget activates — opt children into embed mode with front.embedSupport: true and the parent's detail shell embeds the child's list."
date: 2026-04-30
version: "Unreleased"
classification: feature
source_commit: "14a603038b0620dfa11a1c5015b404bc99e3d902"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/14a603038b0620dfa11a1c5015b404bc99e3d902/openspec/changes/archive/2026-04-30-spec-15-grid-elements-manager-widget/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- New optional YAML flag `front.embedSupport: true` opts a child module into embed mode. Without the flag, codegen output is identical to today.
- With the flag, the child gains a polymorphic list (`mode: 'standalone' | 'embed'`), a `*-form-embed.component.ts` whose parent FK is injected at `submit()` time (not in the FormGroup), and a `getXEmbedColumns` factory that drops the parent FK column.
- `widget.type: grid-elements-manager` now dispatches in the parent's detail shell. The new partial emits `<au-{child}-list mode="embed">` inside `@if (mode() === 'edit')` and codegen reads the child's YAML to resolve the FK back-reference. Targets without `embedSupport: true` fail fast with an actionable error.

## Why it matters

The widget had been canonized but inert since SPEC-09 — declared in `WidgetType`, skipped at dispatch with `console.warn`. SPEC-15 unblocks it without the backend nested-writes change SPEC-10 would have required: each child CRUD stays an independent mutation, and the embed widget reuses the child's existing list and form templates instead of a hand-rolled CRUD shell. The orphaned `@aurora/components/grid-elements-manager` runtime and the Material legacy partial are removed. Parents with `front.detailMode: dialog` cannot host the widget — codegen warns and omits it to avoid a dialog-in-dialog UX.

---

[View original proposal](https://github.com/avvale/aurora-catalyst-cli/tree/14a603038b0620dfa11a1c5015b404bc99e3d902/openspec/changes/archive/2026-04-30-spec-15-grid-elements-manager-widget/)
