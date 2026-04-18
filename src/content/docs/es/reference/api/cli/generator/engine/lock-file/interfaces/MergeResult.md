---
title: "MergeResult"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [generator/engine/lock-file](../README.md) / MergeResult

# Interface: MergeResult

Defined in: [generator/engine/lock-file.ts:205](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/lock-file.ts#L205)

Outcome of [mergePreservationRegions](../functions/mergePreservationRegions.md).

The three name arrays are disjoint and together describe what happened to
every region present in either input. Useful for emitting per-region log
lines (`[REGION UPDATED]`, `[REGION PRESERVED]`, `[REGION DROPPED]`).

## Properties

### content

> **content**: `string`

Defined in: [generator/engine/lock-file.ts:207](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/lock-file.ts#L207)

The merged file contents, ready to be written to disk.

***

### dropped

> **dropped**: `string`[]

Defined in: [generator/engine/lock-file.ts:209](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/lock-file.ts#L209)

Regions present in `existingContent` but not in `newContent`. Their body was lost.

***

### preserved

> **preserved**: `string`[]

Defined in: [generator/engine/lock-file.ts:211](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/lock-file.ts#L211)

Regions kept byte-for-byte from `existingContent` because the user had modified them.

***

### updated

> **updated**: `string`[]

Defined in: [generator/engine/lock-file.ts:213](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/lock-file.ts#L213)

Regions whose body was refreshed from `newContent` because `priorHashes` indicated no user edits.
