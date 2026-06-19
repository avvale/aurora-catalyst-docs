---
title: "SaveLockFiles"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/en/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/en/reference/api/cli/readme/) / [generator/engine/lock-file](/aurora-catalyst-docs/en/reference/api/cli/generator/engine/lock-file/readme/) / saveLockFiles

# Function: saveLockFiles()

> **saveLockFiles**(`boundedContextName`, `moduleName`, `lockFiles`, `scope`, `cwd?`): `void`

Defined in: [generator/engine/lock-file.ts:309](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/lock-file.ts#L309)

Save lock files to `cliter/{boundedContext}/.locks/{scope}/{moduleName}.lock.json`.

## Parameters

### boundedContextName

`string`

### moduleName

`string`

### lockFiles

[`LockFile`](/aurora-catalyst-docs/en/reference/api/cli/generator/domain/model/interfaces/lockfile/)[]

### scope

[`Scope`](/aurora-catalyst-docs/en/reference/api/cli/generator/domain/model/type-aliases/scope/)

### cwd?

`string` = `...`

## Returns

`void`
