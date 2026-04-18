---
title: "GenerateContents"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [generator/engine/file-manager](../README.md) / generateContents

# Function: generateContents()

> **generateContents**(`logger`, `originPath`, `relativeTargetBasePath`, `relativeTargetPath`, `options?`, `result?`): `Promise`\<`void`\>

Defined in: [generator/engine/file-manager.ts:95](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/file-manager.ts#L95)

Recursively walk a template directory and generate output files.

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
