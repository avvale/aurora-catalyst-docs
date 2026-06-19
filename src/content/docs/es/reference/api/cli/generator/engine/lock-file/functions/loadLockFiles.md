---
title: "LoadLockFiles"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/es/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/es/reference/api/cli/readme/) / [generator/engine/lock-file](/aurora-catalyst-docs/es/reference/api/cli/generator/engine/lock-file/readme/) / loadLockFiles

# Function: loadLockFiles()

> **loadLockFiles**(`boundedContextName`, `moduleName`, `scope`, `cwd?`): [`LockFile`](/aurora-catalyst-docs/es/reference/api/cli/generator/domain/model/interfaces/lockfile/)[]

Defined in: [generator/engine/lock-file.ts:278](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/lock-file.ts#L278)

Load lock files from `cliter/{boundedContext}/.locks/{scope}/{moduleName}.lock.json`.

## Parameters

### boundedContextName

`string`

### moduleName

`string`

### scope

[`Scope`](/aurora-catalyst-docs/es/reference/api/cli/generator/domain/model/type-aliases/scope/)

### cwd?

`string` = `...`

## Returns

[`LockFile`](/aurora-catalyst-docs/es/reference/api/cli/generator/domain/model/interfaces/lockfile/)[]
