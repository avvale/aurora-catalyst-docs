---
title: "PropertyType"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/en/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/en/reference/api/cli/readme/) / [generator/domain/model](/aurora-catalyst-docs/en/reference/api/cli/generator/domain/model/readme/) / PropertyType

# Type Alias: PropertyType

> **PropertyType** = `"array"` \| `"bigint"` \| `"blob"` \| `"blob.long"` \| `"blob.medium"` \| `"blob.tiny"` \| `"boolean"` \| `"char"` \| `"date"` \| `"dateTime"` \| `"decimal"` \| `"enum"` \| `"float"` \| `"id"` \| `"int"` \| `"json"` \| `"jsonb"` \| `"password"` \| `"relationship"` \| `"secret"` \| `"smallint"` \| `"text"` \| `"timestamp"` \| `"varchar"`

Defined in: [generator/domain/model.ts:11](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L11)

Logical type of a domain property. Drives Sequelize types, GraphQL scalars,
DTO types, Swagger decorators, mocking strategy, and the SQL column shape.
