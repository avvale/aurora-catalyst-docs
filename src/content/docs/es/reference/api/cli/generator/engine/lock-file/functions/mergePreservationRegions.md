---
title: "MergePreservationRegions"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [generator/engine/lock-file](../README.md) / mergePreservationRegions

# Function: mergePreservationRegions()

> **mergePreservationRegions**(`newContent`, `existingContent`, `priorHashes?`): [`MergeResult`](../interfaces/MergeResult.md)

Defined in: [generator/engine/lock-file.ts:225](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/lock-file.ts#L225)

Merge preservation regions: per-region decision based on priorHashes.
- If the existing body hash matches priorHashes[name] → use newContent body
  (user did not modify → template improvement propagates).
- Otherwise → preserve existingContent body byte-for-byte.
- If priorHashes is undefined → preserve all (fallback, legacy lockfile).
- Regions only in newContent keep their new body.
- Regions only in existingContent are dropped (body lost).

## Parameters

### newContent

`string`

### existingContent

`string`

### priorHashes?

`Record`\<`string`, `string`\>

## Returns

[`MergeResult`](../interfaces/MergeResult.md)
