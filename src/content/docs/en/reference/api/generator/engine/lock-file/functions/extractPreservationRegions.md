---
title: "ExtractPreservationRegions"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [generator/engine/lock-file](../README.md) / extractPreservationRegions

# Function: extractPreservationRegions()

> **extractPreservationRegions**(`content`): `Map`\<`string`, `string`\>

Defined in: [generator/engine/lock-file.ts:131](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/lock-file.ts#L131)

Extract preservation region bodies from content.
Returns a Map<regionName, bodyContent>. Throws on malformed markers.

## Parameters

### content

`string`

## Returns

`Map`\<`string`, `string`\>
