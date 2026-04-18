---
title: "ModuleDefinitionSchema"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [generator/domain/model](../README.md) / ModuleDefinitionSchema

# Interface: ModuleDefinitionSchema

Defined in: [generator/domain/model.ts:278](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L278)

Full schema for a generated module. This is the in-memory representation
loaded from `cliter/<bc>/<module>.aurora.yaml`, after validation and
default-filling.

## Properties

### additionalApis?

> `optional` **additionalApis?**: [`AdditionalApi`](AdditionalApi.md)[]

Defined in: [generator/domain/model.ts:279](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L279)

***

### aggregateName

> **aggregateName**: `string`

Defined in: [generator/domain/model.ts:280](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L280)

***

### aggregateProperties

> **aggregateProperties**: [`Property`](Property.md)[]

Defined in: [generator/domain/model.ts:281](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L281)

***

### boundedContextName

> **boundedContextName**: `string`

Defined in: [generator/domain/model.ts:282](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L282)

***

### excludedFiles?

> `optional` **excludedFiles?**: `string`[]

Defined in: [generator/domain/model.ts:284](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L284)

Templates skipped when generating this module.

***

### excludedOperations?

> `optional` **excludedOperations?**: `string`[]

Defined in: [generator/domain/model.ts:286](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L286)

CRUD operations skipped when generating this module.

***

### front?

> `optional` **front?**: `object`

Defined in: [generator/domain/model.ts:288](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L288)

Frontend-only presentation metadata (icon, grammatical gender, ...).

#### gender?

> `optional` **gender?**: [`Gender`](../type-aliases/Gender.md)

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

Defined in: [generator/domain/model.ts:301](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L301)

***

### hasOAuth

> **hasOAuth**: `boolean`

Defined in: [generator/domain/model.ts:302](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L302)

***

### hasTenant

> **hasTenant**: `boolean`

Defined in: [generator/domain/model.ts:303](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L303)

***

### moduleName

> **moduleName**: `string`

Defined in: [generator/domain/model.ts:304](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L304)

***

### moduleNames

> **moduleNames**: `string`

Defined in: [generator/domain/model.ts:305](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L305)
