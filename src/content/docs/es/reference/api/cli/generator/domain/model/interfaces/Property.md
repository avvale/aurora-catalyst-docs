---
title: "Property"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [generator/domain/model](../README.md) / Property

# Interface: Property

Defined in: [generator/domain/model.ts:190](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L190)

Definition of a single property inside an aggregate. Maps to a SQL column,
a DTO field, a GraphQL field, and optionally a form control.

## Properties

### aggregateName?

> `optional` **aggregateName?**: `string`

Defined in: [generator/domain/model.ts:192](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L192)

Owning aggregate name. Set by the loader; optional at author time.

***

### applyTimezone?

> `optional` **applyTimezone?**: `boolean`

Defined in: [generator/domain/model.ts:194](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L194)

For `timestamp`: store with timezone when true.

***

### arrayOptions?

> `optional` **arrayOptions?**: [`PropertyArrayOptions`](PropertyArrayOptions.md)

Defined in: [generator/domain/model.ts:196](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L196)

Element descriptor for `array` types.

***

### autoIncrement?

> `optional` **autoIncrement?**: `boolean`

Defined in: [generator/domain/model.ts:198](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L198)

SQL `AUTO_INCREMENT` for numeric primary keys.

***

### decimals?

> `optional` **decimals?**: `number`[]

Defined in: [generator/domain/model.ts:200](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L200)

Two-element tuple `[precision, scale]` for `decimal` types.

***

### defaultValue?

> `optional` **defaultValue?**: `string` \| `number`

Defined in: [generator/domain/model.ts:202](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L202)

Literal default value emitted in the DTO / column definition.

***

### enumOptions?

> `optional` **enumOptions?**: `string`[]

Defined in: [generator/domain/model.ts:204](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L204)

Values accepted by a scalar `enum` property.

***

### example?

> `optional` **example?**: `unknown`

Defined in: [generator/domain/model.ts:206](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L206)

Concrete example surfaced in Swagger / GraphQL docs.

***

### faker?

> `optional` **faker?**: `string`

Defined in: [generator/domain/model.ts:211](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L211)

Faker locale method name used by the mocker (e.g. `name.firstName`).
Overrides the default seed picked from [PropertyType](../type-aliases/PropertyType.md).

***

### index?

> `optional` **index?**: [`PropertyIndex`](../type-aliases/PropertyIndex.md)

Defined in: [generator/domain/model.ts:212](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L212)

***

### indexFields?

> `optional` **indexFields?**: `string`[]

Defined in: [generator/domain/model.ts:214](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L214)

Composite index columns when this property owns a multi-column index.

***

### indexName?

> `optional` **indexName?**: `string`

Defined in: [generator/domain/model.ts:215](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L215)

***

### indexUsing?

> `optional` **indexUsing?**: [`PropertyIndexUsing`](../type-aliases/PropertyIndexUsing.md)

Defined in: [generator/domain/model.ts:216](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L216)

***

### isI18n?

> `optional` **isI18n?**: `boolean`

Defined in: [generator/domain/model.ts:218](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L218)

When true, the property participates in i18n table/relation generation.

***

### length?

> `optional` **length?**: `number`

Defined in: [generator/domain/model.ts:219](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L219)

***

### maxLength?

> `optional` **maxLength?**: `number`

Defined in: [generator/domain/model.ts:220](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L220)

***

### minLength?

> `optional` **minLength?**: `number`

Defined in: [generator/domain/model.ts:221](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L221)

***

### modulePath?

> `optional` **modulePath?**: `string`

Defined in: [generator/domain/model.ts:223](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L223)

Module path for relationship properties. Set by the loader.

***

### name

> **name**: `string`

Defined in: [generator/domain/model.ts:225](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L225)

Field name in camelCase (source of truth for every transformation).

***

### nullable?

> `optional` **nullable?**: `boolean`

Defined in: [generator/domain/model.ts:226](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L226)

***

### primaryKey?

> `optional` **primaryKey?**: `boolean`

Defined in: [generator/domain/model.ts:227](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L227)

***

### readonly?

> `optional` **readonly?**: `boolean`

Defined in: [generator/domain/model.ts:228](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L228)

***

### relationship?

> `optional` **relationship?**: [`PropertyRelationship`](PropertyRelationship.md)

Defined in: [generator/domain/model.ts:230](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L230)

Relationship metadata when `type` is `relationship`.

***

### type

> **type**: [`PropertyType`](../type-aliases/PropertyType.md)

Defined in: [generator/domain/model.ts:231](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L231)

***

### unsigned?

> `optional` **unsigned?**: `boolean`

Defined in: [generator/domain/model.ts:233](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L233)

Integer-only: unsigned column when true.

***

### webComponent?

> `optional` **webComponent?**: [`PropertyWebComponent`](PropertyWebComponent.md)

Defined in: [generator/domain/model.ts:235](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L235)

Frontend widget metadata, when the property is rendered in a form.
