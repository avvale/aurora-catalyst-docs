---
title: Compose a QueryStatement
description: Build where/include/order clauses with the Operator enum, forward constraint for tenant scoping, and work around the include → format security gap.
---

## Goal

Compose a typed `QueryStatement` inside a handler — `where`, `include`, `order`, `limit` — using the `Operator` enum instead of string literals, and load relations without leaking masked fields.

## Before you start

- You have a backend handler scaffolded (a read handler is the common case).
- You understand the two `QueryStatement` parameters a catalyst handler receives:
  - `queryStatement` — the **client-facing** filter / sort / pagination payload, from the resolver or controller.
  - `constraint` — the **server-side scope** (tenant id, permission filter), injected upstream by middleware or decorators.

  Treat both as read-only. Merging them is the service layer's job.
- `@aurorajs.dev/core-common` is installed — it ships with every Catalyst backend.

## Steps

1. **Import the typed helpers.** Always type the statement and always use the enum:

   ```typescript
   import { Operator, QueryStatement } from '@aurorajs.dev/core-common';
   ```

2. **Build `where` with `Operator.X` — never string literals.**

   ```typescript
   const queryStatement: QueryStatement = {
     where: {
       [Operator.and]: [
         { isActive: true },
         { name: { [Operator.iLike]: `${query.prefix}%` } },
       ],
     },
     order: [['createdAt', 'DESC']],
     limit: query.limit ?? 50,
   };
   ```

   Why not `'[iLike]'`? A typo like `'[ilike]'` (lowercase `l`) fails silently at runtime: the operator is not recognised and the filter degenerates into a literal value comparison. `Operator.iLike` is type-checked; `Operator.iLikE` is a compile error.

   The full `Operator` catalog covers comparison (`eq`, `ne`, `gt`, `gte`, `lt`, `lte`), inclusion (`in`, `notIn`), text patterns (`like`, `iLike`, `startsWith`, `endsWith`, `substring`, `regexp`, …), ranges (`between`, `notBetween`), logical composition (`and`, `or`, `not`, `is`), PG range / array operators (`overlap`, `contains`, `contained`, …), and quantifiers (`any`, `all`). Import and use the enum — do not hard-code the string form.

3. **Load relations with `include`.** The YAML's relationship `field` (for example, `field: tenant`) becomes the association key:

   ```typescript
   const queryStatement: QueryStatement = {
     where: { id: accountId },
     include: [{ association: 'user' }, { association: 'tenant' }],
   };
   ```

   Nest for graph loading:

   ```typescript
   { include: [{ association: 'user', include: [{ association: 'preferences' }] }] }
   ```

4. **Forward `queryStatement` and `constraint` to the service unchanged.** Build a new object if you need to augment; do not mutate the incoming ones.

   ```typescript
   return await this.getService.main(queryStatement, constraint, handlerMeta);
   ```

### Loading relations safely

`@Format` and `@ApplySchema` apply the FieldSchema only to the **top-level** fields of the returned record. `formatRecord` does not recurse into relations loaded via `include`. Any field with a protective `format()` — `type: 'password'` returns `undefined`, and the same shape applies to tokens, secrets, or signed blobs — is masked on the root entity but passes through untouched on an included relation:

```typescript
// IamAccount with @Format(IamAccountFieldSchema) and include: user
// account.password      → undefined  (correct — top-level mask ran)
// account.user.password → '$2b$10$...' ← LEAKS the bcrypt hash
```

The upstream fix is tracked as **SPEC-07** in `aurora-catalyst-cli/ROADMAP.md` (a recursive `formatRecord` that applies each relation's own schema). Until it lands, two viable patterns:

**Option A — manual format on the related record.** Preferred when the client needs the related entity atomically:

```typescript
import { formatRecord } from '@aurorajs.dev/core-back';
import { IamUserFieldSchema } from '@app/iam/user/domain';

async main(
  id: string,
  constraint?: QueryStatement,
  handlerMeta?: HandlerMeta,
): Promise<IamAccount> {
  const account = await this.findByIdService.main(
    id,
    { ...constraint, include: [{ association: 'user' }] },
    handlerMeta,
  );

  if (account.user) {
    // Temporary workaround for SPEC-07 — formatRecord does not recurse into include.
    account.user = formatRecord(account.user, IamUserFieldSchema, handlerMeta?.timezone);
  }

  return account;
}
```

This is one of the rare cases where calling `formatRecord` directly is justified — the decorator does not know about the included relation. Leave a code comment pointing at SPEC-07 so a future refactor can drop the workaround once the fix lands.

**Option B — avoid `include` for entities with masked fields.** Load the related record on a separate endpoint where it becomes the root entity and `@Format` masks it correctly. Safer default when atomic loading is not strictly required.

## Verify it worked

- Inspect the generated SQL (via Sequelize logs or the database): the predicate uses the right operator (`ILIKE`, `BETWEEN`, `IN`, …) instead of treating the operator key as a column name.
- For `include` with a sensitive relation, confirm the masked field is absent from the returned JSON after applying the workaround.
- Confirm `constraint` is not echoed in the response or in error messages — it carries tenant / permission scope that must stay server-side.

## Troubleshooting

**The filter matches every row or no row.** Usually a string-literal operator typo. Switch to `Operator.X` imports — TypeScript catches the mistake at compile time.

**The service's merge breaks after my handler runs.** You mutated `queryStatement` or `constraint`. Treat them as read-only. If you need a merged criteria object, build a new one from a spread.

**`attributes` used to hide a sensitive column.** `attributes` is a projection (columns to SELECT), not a security boundary. Any consumer who omits `attributes` will leak the column. Mask sensitive fields through the field schema's `format` handler (`@Format` / `@ApplySchema`), enforced on every read regardless of how the query was built.

**Included relation still leaks the hash.** You applied `@Format` but skipped Option A. `formatRecord` does not recurse — call it manually on the related record, or drop the `include`.

## Related

- [Field-schema decorators](../apply-field-schema-decorators/) — the validation / format side of the declarative layer.
- [Backend module scaffolding](../../../concepts/backend/module-scaffolding/) — how relationships are declared in YAML.
