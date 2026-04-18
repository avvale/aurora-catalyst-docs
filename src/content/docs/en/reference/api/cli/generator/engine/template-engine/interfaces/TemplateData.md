---
title: "TemplateData"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [generator/engine/template-engine](../README.md) / TemplateData

# Interface: TemplateData

Defined in: [generator/engine/template-engine.ts:39](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/template-engine.ts#L39)

Bag of values passed to an Eta template as `it`. Templates access both
user-provided data (schema, moduleName, etc.) and injected helper
namespaces (`it.filters`, `it.mappers`, `it.fmt`, `it.gen`, `it.mock`,
`it.predicates`, `it.config`, `it.uuid`) — see [render](../functions/render.md).

## Indexable

> \[`key`: `string`\]: `unknown`
