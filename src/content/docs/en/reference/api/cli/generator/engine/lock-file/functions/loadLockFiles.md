---
title: "LoadLockFiles"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [generator/engine/lock-file](../README.md) / loadLockFiles

# Function: loadLockFiles()

> **loadLockFiles**(`boundedContextName`, `moduleName`, `scope`, `cwd?`): [`LockFile`](../../../domain/model/interfaces/LockFile.md)[]

Defined in: [generator/engine/lock-file.ts:278](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/lock-file.ts#L278)

Load lock files from `cliter/{boundedContext}/.locks/{scope}/{moduleName}.lock.json`.

## Parameters

### boundedContextName

`string`

### moduleName

`string`

### scope

[`Scope`](../../../domain/model/type-aliases/Scope.md)

### cwd?

`string` = `...`

## Returns

[`LockFile`](../../../domain/model/interfaces/LockFile.md)[]
