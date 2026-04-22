---
title: Backend module scaffolding
description: What the Catalyst CLI generates for a backend module, and how the lockfile keeps hand edits in check.
---

## Why this exists

A Catalyst backend module has the same shape every time: a REST controller, a GraphQL resolver, an application-layer handler, a service, a DTO, a GraphQL schema fragment, a Sequelize model, a repository, a field schema, and a seed — one set per operation. A module with six CRUD operations quickly lands above thirty files, all following strict naming, layering, and decorator conventions. Writing that by hand is repetitive and lets the shape drift across modules.

Catalyst treats the module's `*.aurora.yaml` file as the single source of truth. The CLI reads the YAML and emits the whole tree deterministically. When the module has to evolve, you edit the YAML — not the generated TypeScript — and regenerate.

## How it works

Every module lives at `cliter/<bounded-context>/<module>.aurora.yaml`. Running:

```bash
catalyst load back module --name=<bounded-context>/<module> --force
```

emits files across the backend, grouped by layer:

| Layer                                                 | Files                                                         |
| ----------------------------------------------------- | ------------------------------------------------------------- |
| `@api/<bc>/<mod>/controllers/`                        | One REST controller per operation                             |
| `@api/<bc>/<mod>/resolvers/`                          | One GraphQL resolver per operation                            |
| `@api/<bc>/<mod>/dto/` and `@api/<bc>/<mod>/graphql/` | Input / output DTOs and the module's GraphQL schema fragment  |
| `@app/<bc>/<mod>/application/<op>/`                   | Handler + service per operation                               |
| `@app/<bc>/<mod>/domain/`                             | Entity, value objects, field schema, repository interface     |
| `@app/<bc>/<mod>/infrastructure/`                     | Sequelize model, repository implementation, seed              |

The command also runs `pnpm back:graphql:types` by default, so the generated GraphQL types stay aligned with the YAML. Pass `--noGraphQLTypes` (`-g`) to skip that step. See the [`catalyst load` reference](../../reference/cli-commands/load/) for every flag.

### Operations the CLI recognizes

Each operation maps to a handler + service + resolver + controller set. Anything listed under a module's `operations`, or simply not present in `excludedOperations`, gets emitted.

| Operation             | Generates                                          |
| --------------------- | -------------------------------------------------- |
| `count`               | Count rows matching a filter                       |
| `create`              | Create a single row                                |
| `createBatch`         | Create many rows in one call                       |
| `delete`              | Delete many rows by filter                         |
| `deleteById`          | Delete one row by id                               |
| `find`                | Find one row by filter                             |
| `findById`            | Find one row by id                                 |
| `get`                 | Get many rows by filter                            |
| `getRaw`              | Get many rows with a raw SQL shape (no `@Format`)  |
| `paginate`            | Paginated list                                     |
| `update`              | Update many rows by filter                         |
| `updateAndIncrement`  | Update plus atomic increment of a counter field    |
| `updateById`          | Update one row by id                               |
| `upsert`              | Insert or update based on key presence             |
| `max` / `min` / `sum` | Aggregate over a numeric column                    |

Custom verbs that do not fit the CRUD vocabulary — `activate`, `approve`, `cancel`, `check-unique-<field>` — live in a separate `additionalApis` list in the same YAML and generate a lighter three-file scaffold (controller + resolver + handler) you then refine.

### Lockfile and `.origin` files

Every generated file has a lockfile entry recording the SHA-1 of the content the CLI emitted. On regeneration the CLI compares the current integrity hash of the file on disk against the lockfile:

- **Hashes match** → no hand edits. The CLI overwrites the file with the new output.
- **Hashes differ** → the file has hand edits. The CLI writes the new output to `<file>.origin` next to yours and leaves you to reconcile.

The `--noReview` flag skips the interactive reconciliation prompt at the end of the run.

Editing the body of a handler's `main()` is safe: the scaffold around it stays intact, so the next regeneration produces a `.origin` that is effectively identical to your file. Editing decorators, imports, or method signatures is what produces real `.origin` conflicts.

## When it applies

- You scaffold a new module, add a field, or add an operation — edit the YAML, run `catalyst load …`, commit both the YAML and the generated files.
- You see a `.origin` file after regeneration — a hand edit diverged from the previous scaffold; decide which version wins and delete the `.origin`.
- You want a custom verb — declare it under `additionalApis`, regenerate, and fill in the stub the CLI produced.
- You want to opt out of specific operations or files — see [Exclude CLI-generated APIs from a module](../../guides/backend/exclude-generated-apis/).

## Trade-offs and limits

- **The CLI does not delete orphan files.** Removing an operation from the YAML does not remove the files it already produced — delete them by hand afterwards.
- **Structural hand edits are costly.** Changing decorators, method signatures, or imports on a generated file turns every future regeneration into a `.origin` review. Express the change in YAML when possible.
- **CRUD vocabulary is closed.** The operation table above is the complete set; anything else belongs in `additionalApis`.

## Related

- [Exclude CLI-generated APIs from a module](../../guides/backend/exclude-generated-apis/) — how `excludedOperations` and `excludedFiles` work in practice.
- [`catalyst load` reference](../../reference/cli-commands/load/) — every flag and argument.
- [Preservation regions](../frontend/preservation-regions/) — how to protect custom code inside a generated template file.
