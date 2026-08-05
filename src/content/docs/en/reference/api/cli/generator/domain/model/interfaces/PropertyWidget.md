---
title: "PropertyWidget"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/en/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/en/reference/api/cli/readme/) / [generator/domain/model](/aurora-catalyst-docs/en/reference/api/cli/generator/domain/model/readme/) / PropertyWidget

# Interface: PropertyWidget

Defined in: [generator/domain/model.ts:170](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L170)

Frontend widget configuration. Added to a property when the detail/list
view should render a specific reusable component.

## Properties

### detailSort?

> `optional` **detailSort?**: `number`

Defined in: [generator/domain/model.ts:172](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L172)

Ordinal position in the detail form (ascending).

***

### group?

> `optional` **group?**: `string`

Defined in: [generator/domain/model.ts:174](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L174)

Logical group identifier — fields sharing a group render together with a header.

***

### isDetailHidden?

> `optional` **isDetailHidden?**: `boolean`

Defined in: [generator/domain/model.ts:176](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L176)

If true, hide the property from the detail form.

***

### isListHidden?

> `optional` **isListHidden?**: `boolean`

Defined in: [generator/domain/model.ts:178](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L178)

If true, hide the property from the list view.

***

### listSort?

> `optional` **listSort?**: `number`

Defined in: [generator/domain/model.ts:180](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L180)

Ordinal position in the list table (ascending).

***

### property

> **property**: [`Property`](/aurora-catalyst-docs/en/reference/api/cli/generator/domain/model/interfaces/property/)

Defined in: [generator/domain/model.ts:182](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L182)

Back-reference to the owning [Property](/aurora-catalyst-docs/en/reference/api/cli/generator/domain/model/interfaces/property/). Used by templates.

***

### span?

> `optional` **span?**: `number`

Defined in: [generator/domain/model.ts:188](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L188)

SPEC-14: per-property column span override on the form's 12-column grid.
Integer 1–12; out-of-range values are clamped at codegen time.
When undefined, `getDefaultSpan(property)` picks a default by type.

***

### tab?

> `optional` **tab?**: `string`

Defined in: [generator/domain/model.ts:190](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L190)

SPEC-12: tab identifier — fields sharing a tab render together in a panel.

***

### type

> **type**: [`WidgetType`](/aurora-catalyst-docs/en/reference/api/cli/generator/domain/model/type-aliases/widgettype/)

Defined in: [generator/domain/model.ts:191](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L191)
