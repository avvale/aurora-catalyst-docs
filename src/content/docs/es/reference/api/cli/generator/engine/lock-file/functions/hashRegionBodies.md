---
title: "HashRegionBodies"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [generator/engine/lock-file](../README.md) / hashRegionBodies

# Function: hashRegionBodies()

> **hashRegionBodies**(`content`): `Record`\<`string`, `string`\>

Defined in: [generator/engine/lock-file.ts:189](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/lock-file.ts#L189)

Hash each preservation region body in content. Returns a plain object
ready to serialize into the lockfile. Empty input → empty object.

## Parameters

### content

`string`

## Returns

`Record`\<`string`, `string`\>
