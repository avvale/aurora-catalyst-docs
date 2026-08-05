---
title: "GenerateContents"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/es/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/es/reference/api/cli/readme/) / [generator/engine/file-manager](/aurora-catalyst-docs/es/reference/api/cli/generator/engine/file-manager/readme/) / generateContents

# Function: generateContents()

> **generateContents**(`logger`, `originPath`, `relativeTargetBasePath`, `relativeTargetPath`, `options?`, `result?`): `Promise`\<`void`\>

Defined in: [generator/engine/file-manager.ts:121](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/engine/file-manager.ts#L121)

Recursively walk a template directory and generate every file into the target.
Applies filename substitution, exclusion filters, and overwrite rules from [GenerateOptions](/aurora-catalyst-docs/es/reference/api/cli/generator/engine/file-manager/interfaces/generateoptions/).
Prefer [generateFromTemplate](/aurora-catalyst-docs/es/reference/api/cli/generator/engine/file-manager/functions/generatefromtemplate/) unless you need a custom directory outside the bundled tree.

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
