---
title: "Auto-include FK columns in lists"
description: "Generated lists show a column per many-to-one FK and wire `getRelationIncludes` plus Sequelize includes into the paginate call automatically."
date: 2026-04-30
version: "Unreleased"
classification: feature
source_commit: "77945962c7228c7a6f92c75ede0a3cbe5119ccc0"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/77945962c7228c7a6f92c75ede0a3cbe5119ccc0/openspec/changes/archive/2026-04-30-spec-17-fk-column-auto-include/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- For every many-to-one relationship, `<mod>.columns.ts` now emits a column with `accessorKey: '<rel>.name'`, `relation: { association: '<rel>' }`, and the standard `sortable` / `searchable` / `filterable` / `exportable` flags. Position follows the FK's declaration order in the YAML.
- The list-component imports `getRelationIncludes` from `@aurora`, declares a `relationIncludes` field, and passes `include` in both `query` and `constraint` of the `paginate()` call. The list resolver wires the same include for the first-page pre-load so the table renders without a flicker.
- Search and filter on FK columns work without any extra codegen — the existing `buildSearchWhere` / `buildFilterWhere` helpers translate `boundedContext.name` to Sequelize `$boundedContext.name$`. Aggregates with no many-to-one FKs regenerate byte-identical.

## Why it matters

Before this, the list of an aggregate with FKs showed the local fields but hid the `<rel>Id` UUIDs — a permissions list did not display the bounded-context each row belonged to, which made it useless as an exploration tool. Devs wrote the FK column by hand and every regen produced a `.origin` to merge. The codegen now owns it end to end: column emission, resolver include for the first-page pre-load, list-component include for runtime paginate, and dot-path translation in search/filter. The label is hardcoded to the target's `name` field; aggregates with composite labels (`{code} - {name}`) or without `name` are deferred to a follow-up.

---

[View original proposal](https://github.com/avvale/aurora-catalyst-cli/tree/77945962c7228c7a6f92c75ede0a3cbe5119ccc0/openspec/changes/archive/2026-04-30-spec-17-fk-column-auto-include/)
