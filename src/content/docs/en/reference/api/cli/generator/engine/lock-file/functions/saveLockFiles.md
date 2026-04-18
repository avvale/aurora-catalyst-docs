---
title: "SaveLockFiles"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [generator/engine/lock-file](../README.md) / saveLockFiles

# Function: saveLockFiles()

> **saveLockFiles**(`boundedContextName`, `moduleName`, `lockFiles`, `scope`, `cwd?`): `void`

Defined in: [generator/engine/lock-file.ts:293](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/lock-file.ts#L293)

Save lock files to `cliter/{boundedContext}/.locks/{scope}/{moduleName}.lock.json`.

## Parameters

### boundedContextName

`string`

### moduleName

`string`

### lockFiles

[`LockFile`](../../../domain/model/interfaces/LockFile.md)[]

### scope

[`Scope`](../../../domain/model/type-aliases/Scope.md)

### cwd?

`string` = `...`

## Returns

`void`
