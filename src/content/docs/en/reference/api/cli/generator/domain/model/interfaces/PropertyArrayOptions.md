---
title: "PropertyArrayOptions"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/en/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/en/reference/api/cli/readme/) / [generator/domain/model](/aurora-catalyst-docs/en/reference/api/cli/generator/domain/model/readme/) / PropertyArrayOptions

# Interface: PropertyArrayOptions

Defined in: [generator/domain/model.ts:133](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L133)

Options for properties of type `array`. Describes the element type and,
when the element is an enum, the allowed values.

## Properties

### enumOptions?

> `optional` **enumOptions?**: `string`[]

Defined in: [generator/domain/model.ts:135](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L135)

Values admitted when the array element is `enum`.

***

### length?

> `optional` **length?**: `number`

Defined in: [generator/domain/model.ts:136](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L136)

***

### maxLength?

> `optional` **maxLength?**: `number`

Defined in: [generator/domain/model.ts:137](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L137)

***

### type

> **type**: [`PropertyType`](/aurora-catalyst-docs/en/reference/api/cli/generator/domain/model/type-aliases/propertytype/)

Defined in: [generator/domain/model.ts:139](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L139)

Element type. Usually a primitive or `enum`.
