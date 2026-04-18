---
title: "GenerateFromTemplate"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [generator/engine/file-manager](../README.md) / generateFromTemplate

# Function: generateFromTemplate()

> **generateFromTemplate**(`logger`, `templateElement`, `relativeTargetBasePath`, `relativeTargetPath`, `options?`, `result?`): `Promise`\<[`GenerationResult`](../interfaces/GenerationResult.md)\>

Defined in: [generator/engine/file-manager.ts:66](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/file-manager.ts#L66)

Generate all files from a template element.
This is the main entry point — equivalent to TemplateGenerator.generateStaticContents().

## Parameters

### logger

[`FileLogger`](../interfaces/FileLogger.md)

### templateElement

[`TemplateElement`](../../../domain/model/type-aliases/TemplateElement.md)

### relativeTargetBasePath

`string`

### relativeTargetPath

`string`

### options?

[`GenerateOptions`](../interfaces/GenerateOptions.md) = `{}`

### result?

[`GenerationResult`](../interfaces/GenerationResult.md) = `...`

## Returns

`Promise`\<[`GenerationResult`](../interfaces/GenerationResult.md)\>
