---
title: "GenerateOptions"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/es/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/es/reference/api/cli/readme/) / [generator/engine/file-manager](/aurora-catalyst-docs/es/reference/api/cli/generator/engine/file-manager/readme/) / GenerateOptions

# Interface: GenerateOptions

Defined in: [generator/engine/file-manager.ts:49](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/file-manager.ts#L49)

Options accepted by [generateFromTemplate](/aurora-catalyst-docs/es/reference/api/cli/generator/engine/file-manager/functions/generatefromtemplate/) and [generateContents](/aurora-catalyst-docs/es/reference/api/cli/generator/engine/file-manager/functions/generatecontents/).

All fields are optional. The ones related to filtering (`excludedFiles`,
`excludedOperations`) and iteration context (`currentProperty`,
`currentAdditionalApi`) are set internally when the generator expands a
template group; callers typically only set `force`, `lockFiles`,
`templateData`, `verbose` and the bounded-context/module identifiers.

## Properties

### boundedContextName?

> `optional` **boundedContextName?**: `string`

Defined in: [generator/engine/file-manager.ts:51](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/file-manager.ts#L51)

Bounded context name used for filename substitution (e.g. `__bounded_context_name__`).

***

### currentAdditionalApi?

> `optional` **currentAdditionalApi?**: [`AdditionalApi`](/aurora-catalyst-docs/es/reference/api/cli/generator/domain/model/interfaces/additionalapi/)

Defined in: [generator/engine/file-manager.ts:53](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/file-manager.ts#L53)

Currently iterated additional API when expanding additional-@api templates.

***

### currentProperty?

> `optional` **currentProperty?**: [`Property`](/aurora-catalyst-docs/es/reference/api/cli/generator/domain/model/interfaces/property/)

Defined in: [generator/engine/file-manager.ts:55](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/file-manager.ts#L55)

Currently iterated property when expanding per-property templates.

***

### excludedFiles?

> `optional` **excludedFiles?**: `string`[]

Defined in: [generator/engine/file-manager.ts:57](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/file-manager.ts#L57)

File path globs excluded from generation for this module.

***

### excludedOperations?

> `optional` **excludedOperations?**: `string`[]

Defined in: [generator/engine/file-manager.ts:59](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/file-manager.ts#L59)

CRUD operations excluded for this module (e.g. `delete`, `update`).

***

### force?

> `optional` **force?**: `boolean`

Defined in: [generator/engine/file-manager.ts:61](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/file-manager.ts#L61)

If true, overwrite existing files respecting the lockfile integrity check.

***

### lockFiles?

> `optional` **lockFiles?**: [`LockFile`](/aurora-catalyst-docs/es/reference/api/cli/generator/domain/model/interfaces/lockfile/)[]

Defined in: [generator/engine/file-manager.ts:63](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/file-manager.ts#L63)

Existing lockfile entries consulted when a file already exists on disk.

***

### moduleName?

> `optional` **moduleName?**: `string`

Defined in: [generator/engine/file-manager.ts:65](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/file-manager.ts#L65)

Module name used for filename substitution (`__module_name__`).

***

### moduleNames?

> `optional` **moduleNames?**: `string`

Defined in: [generator/engine/file-manager.ts:67](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/file-manager.ts#L67)

Plural form of the module name (`__module_names__`).

***

### templateData?

> `optional` **templateData?**: [`TemplateData`](/aurora-catalyst-docs/es/reference/api/cli/generator/engine/template-engine/interfaces/templatedata/)

Defined in: [generator/engine/file-manager.ts:69](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/file-manager.ts#L69)

Data passed into the Eta renderer as `it`.

***

### useTemplateEngine?

> `optional` **useTemplateEngine?**: `boolean`

Defined in: [generator/engine/file-manager.ts:71](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/file-manager.ts#L71)

If false, skip Eta rendering and copy the template contents verbatim.

***

### verbose?

> `optional` **verbose?**: `boolean`

Defined in: [generator/engine/file-manager.ts:73](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/file-manager.ts#L73)

If true, log per-file and per-region detail under INFO/OVERWRITE/REGION tags.
