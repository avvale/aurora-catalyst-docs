---
title: "LockFile"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [generator/domain/model](../README.md) / LockFile

# Interface: LockFile

Defined in: [generator/domain/model.ts:340](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L340)

Entry persisted in `cliter/<bc>/.locks/<scope>/<module>.lock.json`.

Records the integrity hash of a generated file so subsequent regenerations
can tell whether the user edited it. The optional `regions` map enables
per-preservation-region hashing — see the `lock-file.ts` utilities.

## Properties

### integrity

> **integrity**: `string`

Defined in: [generator/domain/model.ts:342](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L342)

SHA-1 hash of the skeleton (body of preservation regions excluded), prefixed with `sha1:`.

***

### path

> **path**: `string`

Defined in: [generator/domain/model.ts:344](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L344)

Relative path of the file, using POSIX separators.

***

### regions?

> `optional` **regions?**: `Record`\<`string`, `string`\>

Defined in: [generator/domain/model.ts:351](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L351)

Map of preservation region name → SHA-1 of the normalized body the
template produced on the previous generation. Absence means the entry
predates preservation-regions support; the merge falls back to preserving
all region bodies to stay safe.
