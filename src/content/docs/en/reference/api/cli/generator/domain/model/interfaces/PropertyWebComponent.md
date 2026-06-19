---
title: "PropertyWebComponent"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/en/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/en/reference/api/cli/readme/) / [generator/domain/model](/aurora-catalyst-docs/en/reference/api/cli/generator/domain/model/readme/) / PropertyWebComponent

# Interface: PropertyWebComponent

Defined in: [generator/domain/model.ts:172](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L172)

Frontend widget configuration. Added to a property when the detail/list
view should render a specific reusable component.

## Properties

### detailSort?

> `optional` **detailSort?**: `number`

Defined in: [generator/domain/model.ts:174](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L174)

Ordinal position in the detail form (ascending).

***

### isDetailHidden?

> `optional` **isDetailHidden?**: `boolean`

Defined in: [generator/domain/model.ts:176](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L176)

If true, hide the property from the detail form.

***

### isListHidden?

> `optional` **isListHidden?**: `boolean`

Defined in: [generator/domain/model.ts:178](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L178)

If true, hide the property from the list view.

***

### listSort?

> `optional` **listSort?**: `number`

Defined in: [generator/domain/model.ts:180](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L180)

Ordinal position in the list table (ascending).

***

### property

> **property**: [`Property`](/aurora-catalyst-docs/en/reference/api/cli/generator/domain/model/interfaces/property/)

Defined in: [generator/domain/model.ts:182](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L182)

Back-reference to the owning [Property](/aurora-catalyst-docs/en/reference/api/cli/generator/domain/model/interfaces/property/). Used by templates.

***

### type

> **type**: [`WebComponentType`](/aurora-catalyst-docs/en/reference/api/cli/generator/domain/model/type-aliases/webcomponenttype/)

Defined in: [generator/domain/model.ts:183](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L183)
