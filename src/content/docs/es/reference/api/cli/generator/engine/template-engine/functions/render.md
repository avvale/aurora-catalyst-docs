---
title: "Render"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [generator/engine/template-engine](../README.md) / render

# Function: render()

> **render**(`templatePath`, `data`): `string`

Defined in: [generator/engine/template-engine.ts:112](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/template-engine.ts#L112)

Render an `.eta` template file found under the codegen templates directory
with injected utility namespaces. Returns the rendered source as a string.

## Parameters

### templatePath

`string`

Absolute or templates-dir-relative path to the `.eta`
  file. Absolute paths under the codegen templates dir are accepted and
  stripped to the relative form Eta expects.

### data

[`TemplateData`](../interfaces/TemplateData.md)

Values passed to the template. They appear as `it.<key>`
  inside the template, together with the injected helper namespaces.

## Returns

`string`

## Throws

If the template renders to a non-string value (e.g. an
  Eta compile error swallowed by an async helper).

## Example

```eta
<%~ it.gen.importManager({ imports }) %>
<% it.filters.getEnumProperties(it.schema.aggregateProperties).forEach((p) => { -%>
  export const <%= it.fmt.pascal(p.name) %> = '<%= p.name %>';
<% }) -%>
```
