---
title: "RelationshipPivot"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/es/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/es/reference/api/cli/readme/) / [generator/domain/model](/aurora-catalyst-docs/es/reference/api/cli/generator/domain/model/readme/) / RelationshipPivot

# Interface: RelationshipPivot

Defined in: [generator/domain/model.ts:259](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L259)

Pivot table definition used when a property declares a many-to-many
relationship with extra columns. The generator emits a first-class module
for the pivot itself using this metadata.

## Properties

### additionalApis?

> `optional` **additionalApis?**: [`AdditionalApi`](/aurora-catalyst-docs/es/reference/api/cli/generator/domain/model/interfaces/additionalapi/)[]

Defined in: [generator/domain/model.ts:260](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L260)

***

### aggregateName

> **aggregateName**: `string`

Defined in: [generator/domain/model.ts:261](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L261)

***

### aggregateProperties

> **aggregateProperties**: [`Property`](/aurora-catalyst-docs/es/reference/api/cli/generator/domain/model/interfaces/property/)[]

Defined in: [generator/domain/model.ts:263](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L263)

Columns of the pivot table (usually the two foreign keys plus extras).

***

### boundedContextName

> **boundedContextName**: `string`

Defined in: [generator/domain/model.ts:264](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L264)

***

### excludedFiles?

> `optional` **excludedFiles?**: `string`[]

Defined in: [generator/domain/model.ts:266](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L266)

Templates skipped when generating the pivot module.

***

### excludedOperations?

> `optional` **excludedOperations?**: `string`[]

Defined in: [generator/domain/model.ts:268](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L268)

CRUD operations skipped when generating the pivot module.

***

### hasAuditing?

> `optional` **hasAuditing?**: `boolean`

Defined in: [generator/domain/model.ts:269](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L269)

***

### hasOAuth?

> `optional` **hasOAuth?**: `boolean`

Defined in: [generator/domain/model.ts:270](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L270)

***

### hasTenant?

> `optional` **hasTenant?**: `boolean`

Defined in: [generator/domain/model.ts:271](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L271)

***

### moduleName

> **moduleName**: `string`

Defined in: [generator/domain/model.ts:272](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L272)

***

### moduleNames

> **moduleNames**: `string`

Defined in: [generator/domain/model.ts:273](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L273)
