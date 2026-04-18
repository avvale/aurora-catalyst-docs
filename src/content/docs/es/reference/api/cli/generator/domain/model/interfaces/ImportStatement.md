---
title: "ImportStatement"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [generator/domain/model](../README.md) / ImportStatement

# Interface: ImportStatement

Defined in: [generator/domain/model.ts:361](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L361)

Declaration of an import statement handled by `code-gen.importManager`.
Allows templates to declare imports at render time and let the helper
de-duplicate, group and sort them consistently.

## Properties

### defaultImport?

> `optional` **defaultImport?**: `boolean`

Defined in: [generator/domain/model.ts:363](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L363)

If true, emitted as a default import (`import X from '...'`).

***

### items

> **items**: `string` \| `string`[]

Defined in: [generator/domain/model.ts:365](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L365)

Named imports, or a single default/namespace identifier.

***

### oneRowByItem?

> `optional` **oneRowByItem?**: `boolean`

Defined in: [generator/domain/model.ts:367](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L367)

If true, each named item goes on its own line.

***

### path

> **path**: `string`

Defined in: [generator/domain/model.ts:369](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L369)

Module specifier (`@nestjs/common`, `./user.model`, ...).
