---
title: "IsFileUnmodified"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [generator/engine/lock-file](../README.md) / isFileUnmodified

# Function: isFileUnmodified()

> **isFileUnmodified**(`filePath`, `lockFiles`, `relativePath`): `boolean`

Defined in: [generator/engine/lock-file.ts:339](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/lock-file.ts#L339)

Check if a file's current content matches its lock file integrity hash.
Returns true if the file has NOT been modified by the user.

## Parameters

### filePath

`string`

### lockFiles

[`LockFile`](../../../domain/model/interfaces/LockFile.md)[]

### relativePath

`string`

## Returns

`boolean`
