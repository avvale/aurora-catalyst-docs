---
title: "ExtractPreservationRegions"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/es/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/es/reference/api/cli/readme/) / [generator/engine/lock-file](/aurora-catalyst-docs/es/reference/api/cli/generator/engine/lock-file/readme/) / extractPreservationRegions

# Function: extractPreservationRegions()

> **extractPreservationRegions**(`content`): `Map`\<`string`, `string`\>

Defined in: [generator/engine/lock-file.ts:136](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/lock-file.ts#L136)

Extract preservation region bodies from content.
Returns a Map<regionName, bodyContent>. Throws on malformed markers.

## Parameters

### content

`string`

## Returns

`Map`\<`string`, `string`\>
