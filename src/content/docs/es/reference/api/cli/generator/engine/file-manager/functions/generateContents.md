---
title: "GenerateContents"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [generator/engine/file-manager](../README.md) / generateContents

# Function: generateContents()

> **generateContents**(`logger`, `originPath`, `relativeTargetBasePath`, `relativeTargetPath`, `options?`, `result?`): `Promise`\<`void`\>

Defined in: [generator/engine/file-manager.ts:148](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/file-manager.ts#L148)

Recursively walk a template directory on disk and generate every file
within it into the target location. Applies filename substitution,
exclusion filters (`excludedFiles`, `excludedOperations`) and the
overwrite rules defined in [GenerateOptions](../interfaces/GenerateOptions.md).

Use [generateFromTemplate](generateFromTemplate.md) unless you need to generate from a custom
directory outside the bundled template tree.

## Parameters

### logger

[`FileLogger`](../interfaces/FileLogger.md)

### originPath

`string`

### relativeTargetBasePath

`string`

### relativeTargetPath

`string`

### options?

[`GenerateOptions`](../interfaces/GenerateOptions.md) = `{}`

### result?

[`GenerationResult`](../interfaces/GenerationResult.md) = `...`

## Returns

`Promise`\<`void`\>
