---
title: "IsFileUnmodified"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/en/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/en/reference/api/cli/readme/) / [generator/engine/lock-file](/aurora-catalyst-docs/en/reference/api/cli/generator/engine/lock-file/readme/) / isFileUnmodified

# Function: isFileUnmodified()

> **isFileUnmodified**(`filePath`, `lockFiles`, `relativePath`): `boolean`

Defined in: [generator/engine/lock-file.ts:91](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/engine/lock-file.ts#L91)

True when the file's current content matches its lock entry — i.e. user did NOT modify it.

## Parameters

### filePath

`string`

### lockFiles

[`LockFile`](/aurora-catalyst-docs/en/reference/api/cli/generator/domain/model/interfaces/lockfile/)[]

### relativePath

`string`

## Returns

`boolean`
