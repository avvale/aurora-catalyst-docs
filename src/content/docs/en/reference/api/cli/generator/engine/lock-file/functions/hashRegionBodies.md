---
title: "HashRegionBodies"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/en/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/en/reference/api/cli/readme/) / [generator/engine/lock-file](/aurora-catalyst-docs/en/reference/api/cli/generator/engine/lock-file/readme/) / hashRegionBodies

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
