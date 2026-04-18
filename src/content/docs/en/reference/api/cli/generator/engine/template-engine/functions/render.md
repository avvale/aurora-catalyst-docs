---
title: "Render"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [generator/engine/template-engine](../README.md) / render

# Function: render()

> **render**(`templatePath`, `data`): `string`

Defined in: [generator/engine/template-engine.ts:99](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/template-engine.ts#L99)

Render a template file with injected utility namespaces.

In templates:
  - `it.filters.getEnumProperties(it.schema.aggregateProperties)`
  - `it.mappers.getSequelizeType(prop)`
  - `it.predicates.isRelationship(prop)`
  - `it.fmt.pascal(it.moduleName)`
  - `it.config.GRAPHQL_TYPES`
  - `it.gen.importManager({ imports })`
  - `it.mock.mocker({ property, type: 'seed' })`
  - `it.filters.isAllowPath(schema, operation, ...pathSegments)`

## Parameters

### templatePath

`string`

### data

[`TemplateData`](../interfaces/TemplateData.md)

## Returns

`string`
