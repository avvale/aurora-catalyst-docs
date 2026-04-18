---
title: "Sha1WithPreservation"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [generator/engine/lock-file](../README.md) / sha1WithPreservation

# Function: sha1WithPreservation()

> **sha1WithPreservation**(`content`): `string`

Defined in: [generator/engine/lock-file.ts:167](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/lock-file.ts#L167)

Compute integrity hash EXCLUDING preservation region bodies.
For files without regions this equals `sha1(content)` (backward compat).

## Parameters

### content

`string`

## Returns

`string`
