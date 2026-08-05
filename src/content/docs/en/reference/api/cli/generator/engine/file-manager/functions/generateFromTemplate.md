---
title: "GenerateFromTemplate"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/en/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/en/reference/api/cli/readme/) / [generator/engine/file-manager](/aurora-catalyst-docs/en/reference/api/cli/generator/engine/file-manager/readme/) / generateFromTemplate

# Function: generateFromTemplate()

> **generateFromTemplate**(`logger`, `templateElement`, `relativeTargetBasePath`, `relativeTargetPath`, `options?`, `result?`): `Promise`\<[`GenerationResult`](/aurora-catalyst-docs/en/reference/api/cli/generator/engine/file-manager/interfaces/generationresult/)\>

Defined in: [generator/engine/file-manager.ts:90](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/engine/file-manager.ts#L90)

Generate every file under a template element into the consumer project.
Main programmatic entry point of the generator engine.

## Parameters

### logger

[`FileLogger`](/aurora-catalyst-docs/en/reference/api/cli/generator/engine/file-manager/interfaces/filelogger/)

Sink for `[FILE CREATED]`, `[FILE OVERWRITE]`, `[IGNORED FILE]` logs.

### templateElement

[`TemplateElement`](/aurora-catalyst-docs/en/reference/api/cli/generator/domain/model/type-aliases/templateelement/)

Which template tree to expand (see [TemplateElement](/aurora-catalyst-docs/en/reference/api/cli/generator/domain/model/type-aliases/templateelement/)).

### relativeTargetBasePath

`string`

Output tree relative to `process.cwd()` (`backend`, `frontend`).

### relativeTargetPath

`string`

Subdirectory under the base.

### options?

[`GenerateOptions`](/aurora-catalyst-docs/en/reference/api/cli/generator/engine/file-manager/interfaces/generateoptions/) = `{}`

See [GenerateOptions](/aurora-catalyst-docs/en/reference/api/cli/generator/engine/file-manager/interfaces/generateoptions/).

### result?

[`GenerationResult`](/aurora-catalyst-docs/en/reference/api/cli/generator/engine/file-manager/interfaces/generationresult/) = `...`

Accumulator. Pass across multiple calls to collect combined lockfile/origin lists.

## Returns

`Promise`\<[`GenerationResult`](/aurora-catalyst-docs/en/reference/api/cli/generator/engine/file-manager/interfaces/generationresult/)\>

The (possibly pre-existing) `result`, for chaining.
