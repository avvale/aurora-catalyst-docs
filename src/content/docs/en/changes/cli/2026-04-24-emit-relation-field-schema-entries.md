---
title: "FieldSchema emits relation entries"
description: "The CLI now emits a relation entry per YAML relationship in *.field-schema.ts, activating recursive sanitization and validation of nested aggregates."
date: 2026-04-24
version: "Unreleased"
classification: feature
source_commit: "beba3ac948a4960edadc791f560ad893022de9ea"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/beba3ac948a4960edadc791f560ad893022de9ea/openspec/changes/archive/2026-04-24-emit-relation-field-schema-entries/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- Every YAML property declaring `relationship` now produces a `{ type: 'relation', cardinality, target: () => <Aggregate>FieldSchema }` entry in the generated `*.field-schema.ts`, alongside the existing scalar entries.
- Shape 1 (FK scalar + `relationship` block) keeps its scalar FK entry and adds the relation entry next to it; shape 2 (`type: 'relationship'`) emits a single relation. Cardinality maps `many-to-one`/`one-to-one` owning → `'one'` and `one-to-many`/`many-to-many` → `'many'`. Invalid combinations (one-to-many or many-to-many with a scalar FK, many-to-one declared as shape 2) fail generation with a descriptive error.
- Imports between sibling schemas resolve to the top-level `@app/<modulePath>` barrel (closest-to-root) and the `target` field is wrapped in a thunk so circular references between aggregates load without runtime errors.

## Why it matters

Recursive `formatRecord` and `sanitizeRecord` in `@aurorajs.dev/core-back` now have something to recurse into: nested includes are validated and stripped per the target aggregate's own field schema. The P0 leak that exposed `password` hashes through any `include` of a relation containing a hashed field is closed once you regenerate. Modules that do not regenerate keep the legacy non-recursive pipeline. The CLI bumps its required minimum of `@aurorajs.dev/core-back` to the version that ships the recursive pipeline.

---

[View original proposal](https://github.com/avvale/aurora-catalyst-cli/tree/beba3ac948a4960edadc791f560ad893022de9ea/openspec/changes/archive/2026-04-24-emit-relation-field-schema-entries/)
