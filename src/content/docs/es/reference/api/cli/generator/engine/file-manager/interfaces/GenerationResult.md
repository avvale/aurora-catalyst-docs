---
title: "GenerationResult"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/es/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/es/reference/api/cli/readme/) / [generator/engine/file-manager](/aurora-catalyst-docs/es/reference/api/cli/generator/engine/file-manager/readme/) / GenerationResult

# Interface: GenerationResult

Defined in: [generator/engine/file-manager.ts:67](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/engine/file-manager.ts#L67)

Accumulated state of a generation run, mutated across recursive calls.

## Properties

### lockFiles

> **lockFiles**: [`LockFile`](/aurora-catalyst-docs/es/reference/api/cli/generator/domain/model/interfaces/lockfile/)[]

Defined in: [generator/engine/file-manager.ts:69](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/engine/file-manager.ts#L69)

Lockfile entries captured during the run. Persisted by the caller.

***

### originFiles

> **originFiles**: `string`[]

Defined in: [generator/engine/file-manager.ts:71](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/engine/file-manager.ts#L71)

Paths of `.origin.*` files written because the skeleton was user-modified.
