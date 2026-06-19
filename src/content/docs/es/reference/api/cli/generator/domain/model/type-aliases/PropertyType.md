---
title: "PropertyType"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/es/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/es/reference/api/cli/readme/) / [generator/domain/model](/aurora-catalyst-docs/es/reference/api/cli/generator/domain/model/readme/) / PropertyType

# Type Alias: PropertyType

> **PropertyType** = `"array"` \| `"bigint"` \| `"blob"` \| `"blob.long"` \| `"blob.medium"` \| `"blob.tiny"` \| `"boolean"` \| `"char"` \| `"date"` \| `"decimal"` \| `"encrypted"` \| `"enum"` \| `"float"` \| `"id"` \| `"int"` \| `"json"` \| `"jsonb"` \| `"password"` \| `"relationship"` \| `"smallint"` \| `"text"` \| `"timestamp"` \| `"varchar"`

Defined in: [generator/domain/model.ts:20](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L20)

Logical type of a domain property. Drives Sequelize types, GraphQL scalars,
DTO types, Swagger decorators, mocking strategy, and the SQL column shape.
