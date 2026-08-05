---
title: "LockFile"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/en/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/en/reference/api/cli/readme/) / [generator/domain/model](/aurora-catalyst-docs/en/reference/api/cli/generator/domain/model/readme/) / LockFile

# Interface: LockFile

Defined in: [generator/domain/model.ts:399](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L399)

Entry persisted in `cliter/<bc>/.locks/<scope>/<module>.lock.json`.

Records the SHA-1 hash of a generated file's full content so subsequent
regenerations can tell whether the user edited it.

## Properties

### integrity

> **integrity**: `string`

Defined in: [generator/domain/model.ts:401](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L401)

SHA-1 hash of the full file content, prefixed with `sha1:`.

***

### path

> **path**: `string`

Defined in: [generator/domain/model.ts:403](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L403)

Relative path of the file, using POSIX separators.
