---
title: "StripPreservationRegions"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/es/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/es/reference/api/cli/readme/) / [generator/engine/lock-file](/aurora-catalyst-docs/es/reference/api/cli/generator/engine/lock-file/readme/) / stripPreservationRegions

# Function: stripPreservationRegions()

> **stripPreservationRegions**(`content`): `string`

Defined in: [generator/engine/lock-file.ts:153](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/lock-file.ts#L153)

Strip preservation region bodies from content, preserving markers.
Renaming a marker invalidates the hash because the marker name stays in
the stripped string. Files without regions are returned unchanged.

## Parameters

### content

`string`

## Returns

`string`
