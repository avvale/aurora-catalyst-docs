---
title: "RenderString"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [generator/engine/template-engine](../README.md) / renderString

# Function: renderString()

> **renderString**(`template`, `data`): `string`

Defined in: [generator/engine/template-engine.ts:136](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/template-engine.ts#L136)

Render a raw template string (not a file) with the same helper namespaces
as [render](render.md).

Used for on-the-fly rendering of snippets stored outside the templates dir
(e.g. a fragment taken from a YAML schema or assembled in memory).

## Parameters

### template

`string`

### data

[`TemplateData`](../interfaces/TemplateData.md)

## Returns

`string`

## Throws

If the template renders to a non-string value.
