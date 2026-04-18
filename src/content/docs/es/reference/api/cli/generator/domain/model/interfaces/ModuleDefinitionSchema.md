---
title: "ModuleDefinitionSchema"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [generator/domain/model](../README.md) / ModuleDefinitionSchema

# Interface: ModuleDefinitionSchema

Defined in: [generator/domain/model.ts:178](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L178)

## Properties

### additionalApis?

> `optional` **additionalApis?**: [`AdditionalApi`](AdditionalApi.md)[]

Defined in: [generator/domain/model.ts:179](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L179)

***

### aggregateName

> **aggregateName**: `string`

Defined in: [generator/domain/model.ts:180](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L180)

***

### aggregateProperties

> **aggregateProperties**: [`Property`](Property.md)[]

Defined in: [generator/domain/model.ts:181](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L181)

***

### boundedContextName

> **boundedContextName**: `string`

Defined in: [generator/domain/model.ts:182](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L182)

***

### excludedFiles?

> `optional` **excludedFiles?**: `string`[]

Defined in: [generator/domain/model.ts:183](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L183)

***

### excludedOperations?

> `optional` **excludedOperations?**: `string`[]

Defined in: [generator/domain/model.ts:184](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L184)

***

### front?

> `optional` **front?**: `object`

Defined in: [generator/domain/model.ts:185](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L185)

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

Defined in: [generator/domain/model.ts:198](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L198)

***

### hasOAuth

> **hasOAuth**: `boolean`

Defined in: [generator/domain/model.ts:199](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L199)

***

### hasTenant

> **hasTenant**: `boolean`

Defined in: [generator/domain/model.ts:200](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L200)

***

### moduleName

> **moduleName**: `string`

Defined in: [generator/domain/model.ts:201](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L201)

***

### moduleNames

> **moduleNames**: `string`

Defined in: [generator/domain/model.ts:202](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L202)
