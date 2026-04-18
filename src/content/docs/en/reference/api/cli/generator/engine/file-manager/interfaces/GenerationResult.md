---
title: "GenerationResult"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [generator/engine/file-manager](../README.md) / GenerationResult

# Interface: GenerationResult

Defined in: [generator/engine/file-manager.ts:82](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/file-manager.ts#L82)

Accumulated state of a generation run. Mutated across recursive calls so
callers can inspect what was produced.

## Properties

### lockFiles

> **lockFiles**: [`LockFile`](../../../domain/model/interfaces/LockFile.md)[]

Defined in: [generator/engine/file-manager.ts:84](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/file-manager.ts#L84)

Lockfile entries captured during the run. Persisted by the caller.

***

### originFiles

> **originFiles**: `string`[]

Defined in: [generator/engine/file-manager.ts:86](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/file-manager.ts#L86)

Paths of `.origin.*` files written because the skeleton was user-modified.
