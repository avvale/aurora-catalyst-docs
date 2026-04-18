---
title: "GenerationContext"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [generator/domain/model](../README.md) / GenerationContext

# Interface: GenerationContext

Defined in: [generator/domain/model.ts:407](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L407)

Aggregated context passed to the top-level commands and the services they
call. Bundles the schema being generated, its scope (back/front), the
lockfile slice that applies, and the CLI flags that influence behaviour.

## Properties

### baseDir

> **baseDir**: `string`

Defined in: [generator/domain/model.ts:409](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L409)

Directory that anchors every relative path used during this run.

***

### flags

> **flags**: `object`

Defined in: [generator/domain/model.ts:410](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L410)

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

> **lockFiles**: [`LockFile`](LockFile.md)[]

Defined in: [generator/domain/model.ts:423](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L423)

Lockfile entries applicable to the files about to be generated.

***

### overwrittenFiles

> **overwrittenFiles**: `string`[]

Defined in: [generator/domain/model.ts:425](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L425)

Paths of files whose skeleton was detected as user-modified this run.

***

### schema

> **schema**: [`ModuleDefinitionSchema`](ModuleDefinitionSchema.md)

Defined in: [generator/domain/model.ts:426](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L426)

***

### scope

> **scope**: [`Scope`](../type-aliases/Scope.md)

Defined in: [generator/domain/model.ts:427](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L427)
