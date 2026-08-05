---
title: "GenerationContext"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/en/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/en/reference/api/cli/readme/) / [generator/domain/model](/aurora-catalyst-docs/en/reference/api/cli/generator/domain/model/readme/) / GenerationContext

# Interface: GenerationContext

Defined in: [generator/domain/model.ts:454](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L454)

Aggregated context passed to top-level commands. Bundles the schema being generated,
its scope, the applicable lockfile slice, and CLI flags.

## Properties

### baseDir

> **baseDir**: `string`

Defined in: [generator/domain/model.ts:456](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L456)

Directory that anchors every relative path used during this run.

***

### flags

> **flags**: `object`

Defined in: [generator/domain/model.ts:457](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L457)

#### force?

> `optional` **force?**: `boolean`

Overwrite files whose integrity matches the lockfile.

#### noGraphQLTypes?

> `optional` **noGraphQLTypes?**: `boolean`

Skip emission of GraphQL type definitions.

#### overwriteInterface?

> `optional` **overwriteInterface?**: `boolean`

Force overwrite of interfaces even without `force`.

#### tests?

> `optional` **tests?**: `boolean`

Emit unit/integration tests along with production code.

#### verbose?

> `optional` **verbose?**: `boolean`

Enable per-file / per-region log lines.

***

### lockFiles

> **lockFiles**: [`LockFile`](/aurora-catalyst-docs/en/reference/api/cli/generator/domain/model/interfaces/lockfile/)[]

Defined in: [generator/domain/model.ts:470](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L470)

Lockfile entries applicable to the files about to be generated.

***

### overwrittenFiles

> **overwrittenFiles**: `string`[]

Defined in: [generator/domain/model.ts:472](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L472)

Paths of files whose skeleton was detected as user-modified this run.

***

### schema

> **schema**: [`ModuleDefinitionSchema`](/aurora-catalyst-docs/en/reference/api/cli/generator/domain/model/interfaces/moduledefinitionschema/)

Defined in: [generator/domain/model.ts:473](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L473)

***

### scope

> **scope**: [`Scope`](/aurora-catalyst-docs/en/reference/api/cli/generator/domain/model/type-aliases/scope/)

Defined in: [generator/domain/model.ts:474](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L474)
