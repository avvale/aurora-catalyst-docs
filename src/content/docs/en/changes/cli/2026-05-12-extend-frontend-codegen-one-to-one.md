---
title: "One-to-one frontend codegen"
description: "Frontend codegen now emits valid GraphQL, columns, and form output for both HasOne (navigation-only) and BelongsTo (FK-owning) one-to-one relations."
date: 2026-05-12
version: "Unreleased"
classification: feature
source_commit: "b3f40fe16086184a448d2057589a3eb6e9c99332"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/b3f40fe16086184a448d2057589a3eb6e9c99332/openspec/changes/archive/2026-05-12-extend-frontend-codegen-one-to-one/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- `<module>.graphql.ts` emits a subfield block (`<rel> { id rowId ... }`) for one-to-one navigation. The HasOne variant emits only the navigation block — no FK scalar — while BelongsTo emits both the FK scalar and the navigation block, mirroring the existing many-to-one branch.
- `<module>.columns.ts` adds a one-to-one column branch with a null-safe `accessorFn` and a `relation: { association: '<navAlias>' }` hint so `getRelationIncludes` picks it up. Dot-path `accessorKey` is intentionally not used because HasOne navigation can be null at the row level.
- `<module>-form.component.ts` excludes HasOne navigation properties from the `signalForm` `FormGroup` (the FK lives on the other aggregate). BelongsTo one-to-one stays as a regular FK control, identical to many-to-one.

## Why it matters

Until this change, declaring a one-to-one relation in YAML produced invalid GraphQL on edit (`ScalarLeafsRule` violation when the projection contained a bare object leaf), broken column rendering (`accessorKey: '<rel>'` projects an object), and a phantom FormGroup entry on the HasOne side. The codegen had a many-to-one branch but no equivalent for one-to-one, so the only workaround was to hand-patch the three generated files after every regeneration — which the next `catalyst generate` would overwrite. Now both YAML shapes (HasOne navigation-only and BelongsTo FK-owning) are handled correctly out of the box, and projects that shipped manual fixes — for example `o-auth/access-token` with `refreshToken` as HasOne to `OAuthRefreshToken` — will see the codegen catch up instead of clobbering their patches. No migration needed: the new output is strictly correct where the old one failed at runtime.

---

[View original proposal](https://github.com/avvale/aurora-catalyst-cli/tree/b3f40fe16086184a448d2057589a3eb6e9c99332/openspec/changes/archive/2026-05-12-extend-frontend-codegen-one-to-one/)
