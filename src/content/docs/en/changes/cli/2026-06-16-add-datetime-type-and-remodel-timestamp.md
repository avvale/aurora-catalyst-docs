---
title: "dateTime type + timestamp remodel"
description: "A new dateTime property type for ISO datetime strings, and a breaking remodel of timestamp into a numeric epoch (TypeScript number, Sequelize BIGINT)."
date: 2026-06-16
version: "Unreleased"
classification: breaking
source_commit: "6c30c60e54a8e951f21c1dd8156dfc7e7c1753ec"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/6c30c60e54a8e951f21c1dd8156dfc7e7c1753ec/openspec/changes/archive/2026-06-16-add-datetime-type-and-remodel-timestamp/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- **Breaking:** `type: timestamp` is re-modeled as a numeric epoch — TypeScript `number`, Sequelize `BIGINT` (was `string` / `DATE`). Any field left on `timestamp` changes its type.
- New `type: dateTime` for ISO datetime strings, with internally consistent mappings (TS `string`, GraphQL `GraphQLISODateTime`, Sequelize `DATE`), timezone awareness, and a date-and-time form widget.
- `type: date` (date-only) is unchanged.

## Why it matters

`timestamp` used to mean "ISO datetime string", but its TypeScript and GraphQL halves disagreed (`string` vs a scalar the frontend mapped to `number`), which broke compilation. Now the types are split cleanly: declare `dateTime` for any date+time field — it is the recommended type for audit fields — and reserve `timestamp` for genuine numeric epochs. To migrate, retype your `type: timestamp` fields to `dateTime`; the on-the-wire GraphQL value is unchanged, so external consumers see nothing different. This change ships the generator capability; the YAML sweep and regeneration happen in your app repo.

---

[View original proposal](https://github.com/avvale/aurora-catalyst-cli/tree/6c30c60e54a8e951f21c1dd8156dfc7e7c1753ec/openspec/changes/archive/2026-06-16-add-datetime-type-and-remodel-timestamp/)
