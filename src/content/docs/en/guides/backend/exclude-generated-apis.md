---
title: Exclude CLI-generated APIs from a module
description: Skip operations or individual files when regenerating a Catalyst backend module.
---

## Goal

Stop the Catalyst CLI from emitting operations or files you do not want — either an entire CRUD operation across every layer, or one specific file that collides with a hand-written artefact.

## Before you start

- You have a Catalyst project with at least one backend module already scaffolded.
- You know the bounded context and module name (for example, `iam/role`).
- You can run `catalyst load back module --force` locally.

## Steps

1. **Locate the module YAML.** It lives at `cliter/<bounded-context>/<module>.aurora.yaml`. For `iam/role`, that is `cliter/iam/role.aurora.yaml`.

2. **Choose the granularity you need.**

   - To remove a whole operation — no controller, no resolver, no handler, no service, no DTO, no GraphQL fragment — use `excludedOperations`.
   - To keep the operation but skip **one specific file** (because you wrote it by hand or it collides with an `additionalApis` file), use `excludedFiles`.

3. **Edit the YAML at its top level.** Both keys live next to `aggregateProperties` and `additionalApis`. The names you can list under `excludedOperations` are the ones from the [operations table](../../concepts/backend/module-scaffolding/#operations-the-cli-recognizes).

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
   catalyst load back module --name=iam/role --force
   ```

5. **Remove orphan files by hand.** If you just excluded an operation that used to be generated, the files the CLI produced previously stay on disk — the CLI never deletes. Delete them manually, commit, and rerun `catalyst load …` to confirm the output is consistent.

## Verify it worked

- Rerun with `--verbose` and confirm the excluded operation is not among the emitted paths:

  ```bash
  catalyst load back module --name=iam/role --force --verbose
  ```

- For `excludedFiles`: confirm the listed path is not reported in the output log.
- Run your usual backend build (`pnpm back:build` or the equivalent in your project) to catch any dangling imports that referred to the removed artefact.

## Troubleshooting

**The operation did not reappear after I removed it from `excludedOperations`.**
Double-check for typos. Operation names are case-sensitive and must match the [supported set](../../concepts/backend/module-scaffolding/#operations-the-cli-recognizes) exactly. Rerun with `--force --verbose` to see every file the CLI considered.

**`.origin` files appeared for operations I did not touch.**
That means the on-disk files have hand edits whose SHA-1 no longer matches the lockfile. This is unrelated to exclusion — see [Backend module scaffolding → Lockfile and `.origin` files](../../concepts/backend/module-scaffolding/#lockfile-and-origin-files). Reconcile each `.origin`, or pass `--noReview` if you want to handle them later.

**I excluded an operation but the GraphQL schema still references it.**
The GraphQL type exports regenerate after the module load. If you skipped that step with `--noGraphQLTypes`, run `pnpm back:graphql:types` by hand to refresh the exports.

## Related

- [Backend module scaffolding](../../concepts/backend/module-scaffolding/) — the concept behind what gets emitted and why.
- [`catalyst load` reference](../../reference/cli-commands/load/) — every flag and argument.
