---
title: "RenderString"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/en/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/en/reference/api/cli/readme/) / [generator/engine/template-engine](/aurora-catalyst-docs/en/reference/api/cli/generator/engine/template-engine/readme/) / renderString

# Function: renderString()

> **renderString**(`template`, `data`): `string`

Defined in: [generator/engine/template-engine.ts:136](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/template-engine.ts#L136)

Render a raw template string (not a file) with the same helper namespaces
as [render](/aurora-catalyst-docs/en/reference/api/cli/generator/engine/template-engine/functions/render/).

Used for on-the-fly rendering of snippets stored outside the templates dir
(e.g. a fragment taken from a YAML schema or assembled in memory).

## Parameters

### template

`string`

### data

[`TemplateData`](/aurora-catalyst-docs/en/reference/api/cli/generator/engine/template-engine/interfaces/templatedata/)

## Returns

`string`

## Throws

If the template renders to a non-string value.
