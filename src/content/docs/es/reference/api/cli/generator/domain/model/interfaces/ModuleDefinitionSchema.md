---
title: "ModuleDefinitionSchema"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/es/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/es/reference/api/cli/readme/) / [generator/domain/model](/aurora-catalyst-docs/es/reference/api/cli/generator/domain/model/readme/) / ModuleDefinitionSchema

# Interface: ModuleDefinitionSchema

Defined in: [generator/domain/model.ts:281](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L281)

Full schema for a generated module. This is the in-memory representation
loaded from `cliter/<bc>/<module>.aurora.yaml`, after validation and
default-filling.

## Properties

### additionalApis?

> `optional` **additionalApis?**: [`AdditionalApi`](/aurora-catalyst-docs/es/reference/api/cli/generator/domain/model/interfaces/additionalapi/)[]

Defined in: [generator/domain/model.ts:282](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L282)

***

### aggregateName

> **aggregateName**: `string`

Defined in: [generator/domain/model.ts:283](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L283)

***

### aggregateProperties

> **aggregateProperties**: [`Property`](/aurora-catalyst-docs/es/reference/api/cli/generator/domain/model/interfaces/property/)[]

Defined in: [generator/domain/model.ts:284](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L284)

***

### boundedContextName

> **boundedContextName**: `string`

Defined in: [generator/domain/model.ts:285](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L285)

***

### excludedFiles?

> `optional` **excludedFiles?**: `string`[]

Defined in: [generator/domain/model.ts:287](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L287)

Templates skipped when generating this module.

***

### excludedOperations?

> `optional` **excludedOperations?**: `string`[]

Defined in: [generator/domain/model.ts:289](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L289)

CRUD operations skipped when generating this module.

***

### front?

> `optional` **front?**: `object`

Defined in: [generator/domain/model.ts:291](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L291)

Frontend-only presentation metadata (icon, grammatical gender, ...).

#### detailMode?

> `optional` **detailMode?**: [`DetailMode`](/aurora-catalyst-docs/es/reference/api/cli/generator/domain/model/type-aliases/detailmode/)

How the detail surface is presented. See [DetailMode](/aurora-catalyst-docs/es/reference/api/cli/generator/domain/model/type-aliases/detailmode/).
Default `'view'` (routed page). `'dialog'` embeds the form inside the list.

#### dialogWidth?

> `optional` **dialogWidth?**: [`DialogWidth`](/aurora-catalyst-docs/es/reference/api/cli/generator/domain/model/type-aliases/dialogwidth/)

Named-token width of the create/edit dialog. See [DialogWidth](/aurora-catalyst-docs/es/reference/api/cli/generator/domain/model/type-aliases/dialogwidth/).
Only applies when `detailMode: 'dialog'`; inert (read by no template)
in `'view'` mode. Default `'md'`.

#### displayField?

> `optional` **displayField?**: `string`

Human-readable display label for this aggregate. Accepts two shapes
detected automatically by the codegen:
  - **Identifier shape**: a bare JS identifier (matches
    `/^[a-zA-Z_$][a-zA-Z0-9_$]*$/`) naming a single property —
    e.g. `'email'`. Used directly as a property reference.
  - **Template shape**: an interpolation template containing one or
    more `{<identifier>}` placeholders — e.g. `'{code} - {name}'`.
    The codegen substitutes each placeholder with `<row>.<identifier>`
    at emit time. Anything that doesn't match the placeholder grammar
    (including `{}`, `{not.a.field}`, `{123invalid}`) is emitted
    verbatim.
Consumed by list-component delete-toast text, FK column auto-include
accessors, and FK column header rendering. Defaults to `'name'`
(identifier shape) when unset. See
`openspec/specs/frontend-module-generator/spec.md` →
"Schema — `front.displayField` attribute".

#### embedSupport?

> `optional` **embedSupport?**: `boolean`

SPEC-15: when true, the module generates embed-mode artifacts
(`*-form-embed.component.ts`, `getXEmbedColumns` factory in
`*.columns.ts`, `mode` polymorphic input on the list-component).
Required when another module references this one via
`widget.type: grid-elements-manager`. Default `false`.

#### gender?

> `optional` **gender?**: [`Gender`](/aurora-catalyst-docs/es/reference/api/cli/generator/domain/model/type-aliases/gender/)

Grammatical gender of the module's singular noun. Used by the
generator to pick `F`/`M` variants from the global i18n JSON
(e.g. `New.F` → "Nueva", `New.M` → "Nuevo"). Ignored by languages
without grammatical gender.

#### outlineFontSetIcon?

> `optional` **outlineFontSetIcon?**: `string`

#### outlineIcon?

> `optional` **outlineIcon?**: `string`

#### solidFontSetIcon?

> `optional` **solidFontSetIcon?**: `string`

#### solidIcon?

> `optional` **solidIcon?**: `string`

***

### hasAuditing

> **hasAuditing**: `boolean`

Defined in: [generator/domain/model.ts:342](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L342)

***

### hasCustomFields?

> `optional` **hasCustomFields?**: `boolean`

Defined in: [generator/domain/model.ts:353](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L353)

Emits the `hasCustomFields` satellite value table + wiring (design.md D2,
add-custom-fields change): `<bc>_<module>_custom_field_value`, its
one-to-many Drizzle relation, the per-BC relation whitelist entry, the
GraphQL field + resolver, and the FieldSchema relation entry. Optional
and default-absent — UNLIKE `hasOAuth`/`hasTenant`/`hasAuditing`, it is
NOT in `schema-loader.ts`'s `validateSchema()` required list: every
existing `.aurora.yaml` (in this repo and consumer repos) must keep
working without declaring it (non-breaking opt-in).

***

### hasOAuth

> **hasOAuth**: `boolean`

Defined in: [generator/domain/model.ts:354](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L354)

***

### hasTenant

> **hasTenant**: `boolean`

Defined in: [generator/domain/model.ts:355](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L355)

***

### i18nStrategy?

> `optional` **i18nStrategy?**: `"embedded"` \| `"table"`

Defined in: [generator/domain/model.ts:365](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L365)

How `isI18n: true` properties are persisted (design.md D1,
add-i18n-embedded-codegen change). `'embedded'` (default when absent)
stores the translated map + search text as columns on the aggregate's
own table (design.md D2/D3). `'table'` is recognized but NOT YET emitted
— its companion-table codegen is deferred to a follow-up change
(design.md Non-Goals). Mirrors `hasCustomFields`: optional, default-absent,
non-breaking for every existing `.aurora.yaml`.

***

### moduleName

> **moduleName**: `string`

Defined in: [generator/domain/model.ts:366](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L366)

***

### moduleNames

> **moduleNames**: `string`

Defined in: [generator/domain/model.ts:367](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L367)
