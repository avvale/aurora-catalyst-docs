---
title: "RelationshipPivot"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [generator/domain/model](../README.md) / RelationshipPivot

# Interface: RelationshipPivot

Defined in: [generator/domain/model.ts:256](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L256)

Pivot table definition used when a property declares a many-to-many
relationship with extra columns. The generator emits a first-class module
for the pivot itself using this metadata.

## Properties

### additionalApis?

> `optional` **additionalApis?**: [`AdditionalApi`](AdditionalApi.md)[]

Defined in: [generator/domain/model.ts:257](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L257)

***

### aggregateName

> **aggregateName**: `string`

Defined in: [generator/domain/model.ts:258](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L258)

***

### aggregateProperties

> **aggregateProperties**: [`Property`](Property.md)[]

Defined in: [generator/domain/model.ts:260](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L260)

Columns of the pivot table (usually the two foreign keys plus extras).

***

### boundedContextName

> **boundedContextName**: `string`

Defined in: [generator/domain/model.ts:261](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L261)

***

### excludedFiles?

> `optional` **excludedFiles?**: `string`[]

Defined in: [generator/domain/model.ts:263](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L263)

Templates skipped when generating the pivot module.

***

### excludedOperations?

> `optional` **excludedOperations?**: `string`[]

Defined in: [generator/domain/model.ts:265](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L265)

CRUD operations skipped when generating the pivot module.

***

### hasAuditing?

> `optional` **hasAuditing?**: `boolean`

Defined in: [generator/domain/model.ts:266](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L266)

***

### hasOAuth?

> `optional` **hasOAuth?**: `boolean`

Defined in: [generator/domain/model.ts:267](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L267)

***

### hasTenant?

> `optional` **hasTenant?**: `boolean`

Defined in: [generator/domain/model.ts:268](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L268)

***

### moduleName

> **moduleName**: `string`

Defined in: [generator/domain/model.ts:269](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L269)

***

### moduleNames

> **moduleNames**: `string`

Defined in: [generator/domain/model.ts:270](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L270)
