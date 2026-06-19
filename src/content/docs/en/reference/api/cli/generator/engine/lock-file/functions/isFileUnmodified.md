---
title: "IsFileUnmodified"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/en/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/en/reference/api/cli/readme/) / [generator/engine/lock-file](/aurora-catalyst-docs/en/reference/api/cli/generator/engine/lock-file/readme/) / isFileUnmodified

# Function: isFileUnmodified()

> **isFileUnmodified**(`filePath`, `lockFiles`, `relativePath`): `boolean`

Defined in: [generator/engine/lock-file.ts:355](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/lock-file.ts#L355)

Check if a file's current content matches its lock file integrity hash.
Returns true if the file has NOT been modified by the user.

## Parameters

### filePath

`string`

### lockFiles

[`LockFile`](/aurora-catalyst-docs/en/reference/api/cli/generator/domain/model/interfaces/lockfile/)[]

### relativePath

`string`

## Returns

`boolean`
