---
title: "Sha1"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [generator/engine/lock-file](../README.md) / sha1

# Function: sha1()

> **sha1**(`content`): `string`

Defined in: [generator/engine/lock-file.ts:23](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/lock-file.ts#L23)

Compute the SHA-1 hash of a string as a lowercase hex digest.

Used as the integrity primitive for the lockfile. Not cryptographically
strong — the purpose is change detection, not security.

## Parameters

### content

`string`

## Returns

`string`
