---
title: "Pivots skip frontend emission"
description: "Pivot aggregates derived from m2m relationships no longer receive list, detail, form, or columns components. Data-access stays."
date: 2026-05-06
version: "Unreleased"
classification: breaking
source_commit: "112009585ee2d3415004730e24f914e5f6e4462f"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/112009585ee2d3415004730e24f914e5f6e4462f/openspec/changes/archive/2026-05-06-skip-pivot-frontend-emission/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- BREAKING — pivot aggregates (auto-derived from m2m relationships) no longer emit `list / detail / form / form-embed / list-actions-cell / columns / index` files. Their UI representation lives in the m2m widget on the parent aggregate.
- Data-access stays: pivots keep emitting `list-config`, `detail-config`, `graphql`, `resolvers`, and their type entries — these feed the manager widget's orchestrator.
- New `[ORPHAN PIVOT FILES]` warning lists pre-existing pivot UI files marked safe-to-delete on regen. The codegen never deletes user files; the developer runs `rm` manually.
- New helper `isPivotAggregate(schema)` detects pivots structurally (every non-system property is many-to-one).

## Why it matters

This encodes a longstanding Aurora rule at the codegen level: pivots are never first-class frontend subjects. They exist as backend storage for an m2m; their UI is the widget on the m2m field on the parent aggregate. Existing projects with previously-emitted pivot directories (`iam/permission-role/`, `iam/role-account/`, `iam/tenant-account/`) need a manual cleanup pass after regen — the codegen warns but does not delete. After cleanup, the regen output is consistent: no orphan pivot files, no broken types, no `TS2339 row.name` on aggregates without a `name`.

---

[View original proposal](https://github.com/avvale/aurora-catalyst-cli/tree/112009585ee2d3415004730e24f914e5f6e4462f/openspec/changes/archive/2026-05-06-skip-pivot-frontend-emission/)
