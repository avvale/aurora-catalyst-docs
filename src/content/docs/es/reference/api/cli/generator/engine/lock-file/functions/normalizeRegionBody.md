---
title: "NormalizeRegionBody"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/es/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/es/reference/api/cli/readme/) / [generator/engine/lock-file](/aurora-catalyst-docs/es/reference/api/cli/generator/engine/lock-file/readme/) / normalizeRegionBody

# Function: normalizeRegionBody()

> **normalizeRegionBody**(`body`): `string`

Defined in: [generator/engine/lock-file.ts:181](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/lock-file.ts#L181)

Normalize a region body for stable hashing: LF line endings and no trailing
whitespace. Applied ONLY to the hash input; the stored body keeps its
original formatting.

## Parameters

### body

`string`

## Returns

`string`
