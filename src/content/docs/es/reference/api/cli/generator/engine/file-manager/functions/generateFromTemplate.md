---
title: "GenerateFromTemplate"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [generator/engine/file-manager](../README.md) / generateFromTemplate

# Function: generateFromTemplate()

> **generateFromTemplate**(`logger`, `templateElement`, `relativeTargetBasePath`, `relativeTargetPath`, `options?`, `result?`): `Promise`\<[`GenerationResult`](../interfaces/GenerationResult.md)\>

Defined in: [generator/engine/file-manager.ts:113](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/file-manager.ts#L113)

Generate every file under a template element into the consumer project.

Main programmatic entry point of the generator engine. Commands in
`src/commands/generate/` call this for each element they need to render.

## Parameters

### logger

[`FileLogger`](../interfaces/FileLogger.md)

Sink for `[FILE CREATED]`, `[FILE OVERWRITE]`, `[REGION ...]` logs.

### templateElement

[`TemplateElement`](../../../domain/model/type-aliases/TemplateElement.md)

Which template tree to expand. Known values are
  declared in [TemplateElement](../../../domain/model/type-aliases/TemplateElement.md).

### relativeTargetBasePath

`string`

Where the output tree lives, relative to
  `process.cwd()` (e.g. `backend`, `frontend`).

### relativeTargetPath

`string`

Subdirectory under the base (often derived from
  the aggregate or module being generated).

### options?

[`GenerateOptions`](../interfaces/GenerateOptions.md) = `{}`

See [GenerateOptions](../interfaces/GenerateOptions.md).

### result?

[`GenerationResult`](../interfaces/GenerationResult.md) = `...`

Accumulator. Pass an existing `GenerationResult` across
  multiple calls to collect the combined lockfile/origin list in one run.

## Returns

`Promise`\<[`GenerationResult`](../interfaces/GenerationResult.md)\>

The (possibly pre-existing) `result` object, for chaining.
