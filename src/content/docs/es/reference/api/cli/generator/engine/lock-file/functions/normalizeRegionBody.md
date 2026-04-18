---
title: "NormalizeRegionBody"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [generator/engine/lock-file](../README.md) / normalizeRegionBody

# Function: normalizeRegionBody()

> **normalizeRegionBody**(`body`): `string`

Defined in: [generator/engine/lock-file.ts:176](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/lock-file.ts#L176)

Normalize a region body for stable hashing: LF line endings and no trailing
whitespace. Applied ONLY to the hash input; the stored body keeps its
original formatting.

## Parameters

### body

`string`

## Returns

`string`
