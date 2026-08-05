---
title: "GenerateOptions"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/en/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/en/reference/api/cli/readme/) / [generator/engine/file-manager](/aurora-catalyst-docs/en/reference/api/cli/generator/engine/file-manager/readme/) / GenerateOptions

# Interface: GenerateOptions

Defined in: [generator/engine/file-manager.ts:39](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/engine/file-manager.ts#L39)

Options for [generateFromTemplate](/aurora-catalyst-docs/en/reference/api/cli/generator/engine/file-manager/functions/generatefromtemplate/) and [generateContents](/aurora-catalyst-docs/en/reference/api/cli/generator/engine/file-manager/functions/generatecontents/).
Filtering and iteration-context fields are set internally when expanding template groups;
callers typically only set `force`, `lockFiles`, `templateData`, `verbose`, and the BC/module identifiers.

## Properties

### boundedContextName?

> `optional` **boundedContextName?**: `string`

Defined in: [generator/engine/file-manager.ts:41](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/engine/file-manager.ts#L41)

Bounded context name used for filename substitution (e.g. `__bounded_context_name__`).

***

### currentAdditionalApi?

> `optional` **currentAdditionalApi?**: [`AdditionalApi`](/aurora-catalyst-docs/en/reference/api/cli/generator/domain/model/interfaces/additionalapi/)

Defined in: [generator/engine/file-manager.ts:43](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/engine/file-manager.ts#L43)

Currently iterated additional API when expanding additional-@api templates.

***

### currentProperty?

> `optional` **currentProperty?**: [`Property`](/aurora-catalyst-docs/en/reference/api/cli/generator/domain/model/interfaces/property/)

Defined in: [generator/engine/file-manager.ts:45](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/engine/file-manager.ts#L45)

Currently iterated property when expanding per-property templates.

***

### excludedFiles?

> `optional` **excludedFiles?**: `string`[]

Defined in: [generator/engine/file-manager.ts:47](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/engine/file-manager.ts#L47)

File path globs excluded from generation for this module.

***

### excludedOperations?

> `optional` **excludedOperations?**: `string`[]

Defined in: [generator/engine/file-manager.ts:49](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/engine/file-manager.ts#L49)

CRUD operations excluded for this module (e.g. `delete`, `update`).

***

### force?

> `optional` **force?**: `boolean`

Defined in: [generator/engine/file-manager.ts:51](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/engine/file-manager.ts#L51)

If true, overwrite existing files respecting the lockfile integrity check.

***

### lockFiles?

> `optional` **lockFiles?**: [`LockFile`](/aurora-catalyst-docs/en/reference/api/cli/generator/domain/model/interfaces/lockfile/)[]

Defined in: [generator/engine/file-manager.ts:53](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/engine/file-manager.ts#L53)

Existing lockfile entries consulted when a file already exists on disk.

***

### moduleName?

> `optional` **moduleName?**: `string`

Defined in: [generator/engine/file-manager.ts:55](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/engine/file-manager.ts#L55)

Module name used for filename substitution (`__module_name__`).

***

### moduleNames?

> `optional` **moduleNames?**: `string`

Defined in: [generator/engine/file-manager.ts:57](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/engine/file-manager.ts#L57)

Plural form of the module name (`__module_names__`).

***

### templateData?

> `optional` **templateData?**: [`TemplateData`](/aurora-catalyst-docs/en/reference/api/cli/generator/engine/template-engine/interfaces/templatedata/)

Defined in: [generator/engine/file-manager.ts:59](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/engine/file-manager.ts#L59)

Data passed into the Eta renderer as `it`.

***

### useTemplateEngine?

> `optional` **useTemplateEngine?**: `boolean`

Defined in: [generator/engine/file-manager.ts:61](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/engine/file-manager.ts#L61)

If false, skip Eta rendering and copy the template contents verbatim.

***

### verbose?

> `optional` **verbose?**: `boolean`

Defined in: [generator/engine/file-manager.ts:63](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/engine/file-manager.ts#L63)

If true, log per-file detail under INFO/OVERWRITE tags.
