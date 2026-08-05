---
title: "PropertyArrayOptions"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/es/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/es/reference/api/cli/readme/) / [generator/domain/model](/aurora-catalyst-docs/es/reference/api/cli/generator/domain/model/readme/) / PropertyArrayOptions

# Interface: PropertyArrayOptions

Defined in: [generator/domain/model.ts:131](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L131)

Options for `array` properties: element type and (when element is `enum`) allowed values.

## Properties

### enumOptions?

> `optional` **enumOptions?**: `string`[]

Defined in: [generator/domain/model.ts:133](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L133)

Values admitted when the array element is `enum`.

***

### length?

> `optional` **length?**: `number`

Defined in: [generator/domain/model.ts:134](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L134)

***

### maxLength?

> `optional` **maxLength?**: `number`

Defined in: [generator/domain/model.ts:135](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L135)

***

### type

> **type**: [`PropertyType`](/aurora-catalyst-docs/es/reference/api/cli/generator/domain/model/type-aliases/propertytype/)

Defined in: [generator/domain/model.ts:137](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L137)

Element type. Usually a primitive or `enum`.
