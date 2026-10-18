---
title: Exclude CLI-generated APIs from a module
description: Skip operations or individual files when regenerating a Catalyst backend module.
---

## Goal

Stop the Catalyst CLI from emitting operations or files you do not want — either an entire CRUD operation across every layer, or one specific file that collides with a hand-written artefact.

## Before you start

- You have a Catalyst project with at least one backend module already scaffolded.
- You know the bounded context and module name (for example, `iam/role`).
- You can run `catalyst generate back module --force` locally.

## Steps

1. **Locate the module YAML.** It lives at `cliter/<bounded-context>/<module>.aurora.yaml`. For `iam/role`, that is `cliter/iam/role.aurora.yaml`.

2. **Choose the granularity you need.**

   - To remove a whole operation — no controller, no resolver, no handler, no service, no DTO, no GraphQL fragment — use `excludedOperations`.
   - To keep the operation but skip **one specific file** (because you wrote it by hand or it collides with an `additionalApis` file), use `excludedFiles`.

3. **Edit the YAML at its top level.** Both keys live next to `aggregateProperties` and `additionalApis`. The names you can list under `excludedOperations` are the ones from the [operations table](../../../concepts/backend/module-scaffolding/#operations-the-cli-recognizes).

   ```yaml
   # cliter/iam/role.aurora.yaml
   additionalApis:
     - path: iam/role/inherit-permissions-role
       resolverType: mutation
       httpMethod: post
   excludedOperations:
     - count
     - getRaw
     - max
     - min
     - sum
     - updateAndIncrement
     - upsert
   excludedFiles:
     - backend/src/@app/iam/role/application/upsert/iam-upsert-role.handler.ts
   ```

4. **Regenerate.**

   ```bash
   catalyst generate back module --name=iam/role --force
   ```

5. **Remove orphan files by hand.** If you just excluded an operation that used to be generated, the files the CLI produced previously stay on disk — the CLI never deletes. Delete them manually, commit, and rerun `catalyst generate …` to confirm the output is consistent.

## Retire only some layers of an operation

A plain string removes the operation from every layer it has. To keep part of it, list an object with `operation` and `layers` instead. Both forms can share one list.

| Layer | What it removes |
| ----- | --------------- |
| `rest` | The REST controller and, for `create`, the REST DTO. |
| `graphql` | The resolver and its field in the module's GraphQL schema. |
| `api` | Shorthand for `rest` plus `graphql`. |
| `app` | The `@app` handler and service. |
| `ui` | The frontend route, button and GraphQL document. Only `create`, `createBatch`, `update`, `updateById`, `delete`, `deleteById`, `find`, `findById`, `get` and `paginate` have it. |

`count`, `max`, `min`, `sum`, `getRaw` and `upsert` have `rest`, `graphql` and `app`. `updateAndIncrement` has only `app`. Listing a layer the operation does not have fails the generation and names the layers it supports.

Retire only the REST route of an operation that stays live over GraphQL:

```yaml
excludedOperations:
  - operation: paginate
    layers: [rest]
```

Retire the public create (controller, resolver, mutation, `/new` route and button) but keep the `@app` service, so other code in the project can still create records through it:

```yaml
excludedOperations:
  - operation: create
    layers: [api, ui]
```

The `createBatch` REST controller imports the `create` DTO. Excluding `rest` of `create` without `createBatch` leaves a controller importing a missing file and the backend build fails. Exclude them together or keep both.

The generator does not check that the layers you exclude fit together. `[app]` alone leaves a resolver importing a missing handler.

## Verify it worked

- Rerun with `--verbose` and confirm the excluded operation is not among the emitted paths:

  ```bash
  catalyst generate back module --name=iam/role --force --verbose
  ```

- For `excludedFiles`: confirm the listed path is not reported in the output log.
- Run your usual backend build (`pnpm back:build` or the equivalent in your project) to catch any dangling imports that referred to the removed artefact.

## Troubleshooting

**The operation did not reappear after I removed it from `excludedOperations`.**
Double-check for typos. Operation names are case-sensitive and must match the [supported set](../../../concepts/backend/module-scaffolding/#operations-the-cli-recognizes) exactly. Rerun with `--force --verbose` to see every file the CLI considered.

**`.origin` files appeared for operations I did not touch.**
That means the on-disk files have hand edits whose SHA-1 no longer matches the lockfile. This is unrelated to exclusion — see [Backend module scaffolding → Lockfile and `.origin` files](../../../concepts/backend/module-scaffolding/#lockfile-and-origin-files). Reconcile each `.origin` with `catalyst origin review` when you are ready, or run `catalyst origin list` to see what is pending.

**I excluded an operation but the GraphQL schema still references it.**
The GraphQL type exports regenerate after the module load. If you skipped that step with `--noGraphQLTypes`, run `pnpm back:graphql:types` by hand to refresh the exports.

## Related

- [Backend module scaffolding](../../../concepts/backend/module-scaffolding/) — the concept behind what gets emitted and why.
- [`catalyst generate` reference](../../../reference/cli-commands/generate/) — every flag and argument.
