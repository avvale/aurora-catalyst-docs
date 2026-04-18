---
title: "PropertyRelationship"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [generator/domain/model](../README.md) / PropertyRelationship

# Interface: PropertyRelationship

Defined in: [generator/domain/model.ts:146](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L146)

Relationship metadata for properties of type `relationship`. Fully
describes how the local aggregate connects to a remote one.

## Properties

### aggregateName

> **aggregateName**: `string`

Defined in: [generator/domain/model.ts:148](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L148)

Target aggregate name.

***

### avoidConstraint

> **avoidConstraint**: `boolean`

Defined in: [generator/domain/model.ts:150](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L150)

If true, the generated SQL does not add a foreign key constraint.

***

### field

> **field**: `string`

Defined in: [generator/domain/model.ts:152](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L152)

Field name on the remote aggregate (e.g. the FK column).

***

### isDenormalized?

> `optional` **isDenormalized?**: `boolean`

Defined in: [generator/domain/model.ts:154](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L154)

If true, the target column is denormalized into this aggregate.

***

### key?

> `optional` **key?**: `string`

Defined in: [generator/domain/model.ts:156](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L156)

Local column name when it differs from the property name.

***

### modulePath

> **modulePath**: `string`

Defined in: [generator/domain/model.ts:158](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L158)

Module path of the target aggregate (e.g. `iam/user`).

***

### packageName?

> `optional` **packageName?**: `string`

Defined in: [generator/domain/model.ts:160](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L160)

External package when the target lives outside the current bounded context.

***

### pivot?

> `optional` **pivot?**: [`RelationshipPivot`](RelationshipPivot.md)

Defined in: [generator/domain/model.ts:162](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L162)

Pivot metadata for many-to-many relationships.

***

### singularName?

> `optional` **singularName?**: `string`

Defined in: [generator/domain/model.ts:164](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L164)

Singular form of the target name (used for foreign key column naming).

***

### type

> **type**: [`RelationshipType`](../type-aliases/RelationshipType.md)

Defined in: [generator/domain/model.ts:165](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L165)
