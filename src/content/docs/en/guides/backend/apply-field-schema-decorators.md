---
title: Field-schema decorators
description: Wire @ApplySchema, @Format, or @Sanitize on a handler's main() so payloads get validated and return values get formatted automatically.
---

## Goal

Pick the correct field-schema decorator for the handler you just scaffolded, wire it on `main()`, and let it handle validation, sanitation, and output masking — instead of duplicating those checks by hand.

## Before you start

- You have a backend module scaffolded and its `*.field-schema.ts` file exists on disk. The CLI generated it from the module's YAML `aggregateProperties`; do not hand-edit it.
- You know which role the handler plays: does it receive a payload? does it return the entity?
- `@aurorajs.dev/core-back` and `@aurorajs.dev/core-common` are installed — both ship with every Catalyst backend.

## Steps

1. **Pick the decorator using this decision tree.**

   ```
   Does the handler RECEIVE a payload?
     ├── No  → @Format(schema)
     └── Yes → Does it RETURN the entity?
                ├── Yes → @ApplySchema(schema)
                └── No  → @Sanitize(schema)
   ```

   `@ApplySchema` composes sanitize (input) + format (output). `@Format` only formats the return (reads are idempotent). `@Sanitize` only sanitizes the payload (write-only flows whose return is `void`, a boolean, or a summary type).

2. **Wire `@ApplySchema` on a write handler that returns the entity.** Real example from `iam/tag`:

   ```typescript
   import { ApplySchema, EmitEvent } from '@aurorajs.dev/core-back';
   import { IamTagFieldSchema } from '@app/iam/tag/domain';

   @EmitEvent('iam.tag.created')
   @ApplySchema(IamTagFieldSchema)
   async main(payload: IamCreateTagInput, handlerMeta?: HandlerMeta): Promise<IamTag> {
     await this.createService.main(payload, handlerMeta);
     return await this.findByIdService.main(payload.id, {}, handlerMeta);
   }
   ```

   `sanitize` runs on `payload` BEFORE `main()` — on `iam/user`, for example, that is where `type: 'password'` turns plaintext into a bcrypt hash. `format` runs on the return AFTER `main()` — that is where `password` becomes `undefined` on the way out.

3. **Wire `@Format` on a read handler.**

   ```typescript
   import { Format } from '@aurorajs.dev/core-back';

   @Format(IamTagFieldSchema)
   async main(id: string, constraint?: QueryStatement, handlerMeta?: HandlerMeta): Promise<IamTag> {
     const tag = await this.findByIdService.main(id, constraint, handlerMeta);
     if (!tag) throw new NotFoundException(`IamTag with id: ${id}, not found`);
     return tag;
   }
   ```

   `@Format` detects the return shape automatically — single object, array, or `Pagination` with a `.rows` list — and formats each element.

4. **If the payload is not the first argument, use the object form.**

   ```typescript
   @ApplySchema({ schema: IamTagFieldSchema, payloadIndex: 1 })
   async main(constraint, payload, handlerMeta?) { … }
   ```

   Same option on `@Sanitize`. `@Format` has no `payloadIndex` — it always operates on the return value.

5. **On update handlers, compute the delta with `Obj.diff`.** After sanitation, persist only what changed. Real usage from `iam-update-tag-by-id.handler.ts`:

   ```typescript
   import { Obj } from '@aurorajs.dev/core-common';

   const tag = await this.findByIdService.main(payload.id, constraint, handlerMeta);
   if (!tag) throw new NotFoundException(`IamTag with id: ${payload.id}, not found`);

   const dataToUpdate = Obj.diff(payload, tag);

   await this.updateByIdService.main(
     { ...dataToUpdate, id: payload.id }, // re-add id — diff omits matching keys
     constraint,
     handlerMeta,
   );
   ```

   `Obj.diff` omits keys whose values match between both sides, so the `id` must be re-added explicitly as the target key.

## Verify it worked

- For a `type: 'password'` field, create a user and inspect the row: the column stores a bcrypt hash, never plaintext. Read it back — the `password` key is absent from the response payload.
- For `maxLength`, `enumOptions`, or `nullable`, send a payload that violates the constraint. The decorator throws before `main()` executes.
- Timestamps returned by the handler carry the caller's timezone. That confirms `@Format` / `@ApplySchema` extracted `handlerMeta.timezone` — a direct call to `formatRecord()` would not.

## Troubleshooting

**An included relation leaks a sensitive field.** `formatRecord` does not recurse into relations loaded via `include`. That is a separate concern — see [Compose a QueryStatement](../query-with-querystatement/#loading-relations-safely).

**Validation runs twice** — once by the decorator, once inside `main()`. Remove the in-handler check. `@ApplySchema` already enforced `maxLength`, `nullable`, `enumOptions`, and declared `rules`. Keep only business rules the FieldSchema cannot express (cross-field invariants, domain math).

**You reach for a Value Object to encapsulate validation.** Catalyst has no VO layer — the validation and modification concern is fully delegated to `FieldSchema` + type handlers via `@ApplySchema`. Express the rule in the YAML's `aggregateProperties` and regenerate.

**Direct call to `formatRecord()` or `sanitizeRecord()`.** Avoid it. The decorator wires `handlerMeta.timezone` and other options automatically; a direct call loses that context and produces inconsistent output.

## Related

- [Backend module scaffolding](../../../concepts/backend/module-scaffolding/) — why `*.field-schema.ts` is generated from YAML and never hand-edited.
- [Compose a QueryStatement](../query-with-querystatement/) — the query side of the declarative data-access layer.
