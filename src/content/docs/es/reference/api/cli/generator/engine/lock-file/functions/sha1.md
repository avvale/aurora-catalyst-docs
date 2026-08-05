---
title: "Sha1"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/es/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/es/reference/api/cli/readme/) / [generator/engine/lock-file](/aurora-catalyst-docs/es/reference/api/cli/generator/engine/lock-file/readme/) / sha1

# Function: sha1()

> **sha1**(`content`): `string`

Defined in: [generator/engine/lock-file.ts:17](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/engine/lock-file.ts#L17)

SHA-1 hex digest. Used as the integrity primitive for the lockfile.
Not cryptographically strong — purpose is change detection, not security.

## Parameters

### content

`string`

## Returns

`string`
