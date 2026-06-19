---
title: "GenerateContents"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/es/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/es/reference/api/cli/readme/) / [generator/engine/file-manager](/aurora-catalyst-docs/es/reference/api/cli/generator/engine/file-manager/readme/) / generateContents

# Function: generateContents()

> **generateContents**(`logger`, `originPath`, `relativeTargetBasePath`, `relativeTargetPath`, `options?`, `result?`): `Promise`\<`void`\>

Defined in: [generator/engine/file-manager.ts:148](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/file-manager.ts#L148)

Recursively walk a template directory on disk and generate every file
within it into the target location. Applies filename substitution,
exclusion filters (`excludedFiles`, `excludedOperations`) and the
overwrite rules defined in [GenerateOptions](/aurora-catalyst-docs/es/reference/api/cli/generator/engine/file-manager/interfaces/generateoptions/).

Use [generateFromTemplate](/aurora-catalyst-docs/es/reference/api/cli/generator/engine/file-manager/functions/generatefromtemplate/) unless you need to generate from a custom
directory outside the bundled template tree.

## Parameters

### logger

[`FileLogger`](/aurora-catalyst-docs/es/reference/api/cli/generator/engine/file-manager/interfaces/filelogger/)

### originPath

`string`

### relativeTargetBasePath

`string`

### relativeTargetPath

`string`

### options?

[`GenerateOptions`](/aurora-catalyst-docs/es/reference/api/cli/generator/engine/file-manager/interfaces/generateoptions/) = `{}`

### result?

[`GenerationResult`](/aurora-catalyst-docs/es/reference/api/cli/generator/engine/file-manager/interfaces/generationresult/) = `...`

## Returns

`Promise`\<`void`\>
