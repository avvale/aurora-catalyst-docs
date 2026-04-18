---
title: "StripPreservationRegions"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [generator/engine/lock-file](../README.md) / stripPreservationRegions

# Function: stripPreservationRegions()

> **stripPreservationRegions**(`content`): `string`

Defined in: [generator/engine/lock-file.ts:148](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/lock-file.ts#L148)

Strip preservation region bodies from content, preserving markers.
Renaming a marker invalidates the hash because the marker name stays in
the stripped string. Files without regions are returned unchanged.

## Parameters

### content

`string`

## Returns

`string`
