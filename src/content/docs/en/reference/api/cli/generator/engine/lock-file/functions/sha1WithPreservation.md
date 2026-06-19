---
title: "Sha1WithPreservation"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/en/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/en/reference/api/cli/readme/) / [generator/engine/lock-file](/aurora-catalyst-docs/en/reference/api/cli/generator/engine/lock-file/readme/) / sha1WithPreservation

# Function: sha1WithPreservation()

> **sha1WithPreservation**(`content`): `string`

Defined in: [generator/engine/lock-file.ts:172](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/lock-file.ts#L172)

Compute integrity hash EXCLUDING preservation region bodies.
For files without regions this equals `sha1(content)` (backward compat).

## Parameters

### content

`string`

## Returns

`string`
