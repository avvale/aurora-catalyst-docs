---
title: "GenerateFromTemplate"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/en/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/en/reference/api/cli/readme/) / [generator/engine/file-manager](/aurora-catalyst-docs/en/reference/api/cli/generator/engine/file-manager/readme/) / generateFromTemplate

# Function: generateFromTemplate()

> **generateFromTemplate**(`logger`, `templateElement`, `relativeTargetBasePath`, `relativeTargetPath`, `options?`, `result?`): `Promise`\<[`GenerationResult`](/aurora-catalyst-docs/en/reference/api/cli/generator/engine/file-manager/interfaces/generationresult/)\>

Defined in: [generator/engine/file-manager.ts:113](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/file-manager.ts#L113)

Generate every file under a template element into the consumer project.

Main programmatic entry point of the generator engine. Commands in
`src/commands/generate/` call this for each element they need to render.

## Parameters

### logger

[`FileLogger`](/aurora-catalyst-docs/en/reference/api/cli/generator/engine/file-manager/interfaces/filelogger/)

Sink for `[FILE CREATED]`, `[FILE OVERWRITE]`, `[REGION ...]` logs.

### templateElement

[`TemplateElement`](/aurora-catalyst-docs/en/reference/api/cli/generator/domain/model/type-aliases/templateelement/)

Which template tree to expand. Known values are
  declared in [TemplateElement](/aurora-catalyst-docs/en/reference/api/cli/generator/domain/model/type-aliases/templateelement/).

### relativeTargetBasePath

`string`

Where the output tree lives, relative to
  `process.cwd()` (e.g. `backend`, `frontend`).

### relativeTargetPath

`string`

Subdirectory under the base (often derived from
  the aggregate or module being generated).

### options?

[`GenerateOptions`](/aurora-catalyst-docs/en/reference/api/cli/generator/engine/file-manager/interfaces/generateoptions/) = `{}`

See [GenerateOptions](/aurora-catalyst-docs/en/reference/api/cli/generator/engine/file-manager/interfaces/generateoptions/).

### result?

[`GenerationResult`](/aurora-catalyst-docs/en/reference/api/cli/generator/engine/file-manager/interfaces/generationresult/) = `...`

Accumulator. Pass an existing `GenerationResult` across
  multiple calls to collect the combined lockfile/origin list in one run.

## Returns

`Promise`\<[`GenerationResult`](/aurora-catalyst-docs/en/reference/api/cli/generator/engine/file-manager/interfaces/generationresult/)\>

The (possibly pre-existing) `result` object, for chaining.
