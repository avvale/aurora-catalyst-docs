---
title: "ImportStatement"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/es/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/es/reference/api/cli/readme/) / [generator/domain/model](/aurora-catalyst-docs/es/reference/api/cli/generator/domain/model/readme/) / ImportStatement

# Interface: ImportStatement

Defined in: [generator/domain/model.ts:411](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L411)

Declaration of an import statement handled by `code-gen.importManager`.
Allows templates to declare imports at render time and let the helper
de-duplicate, group and sort them consistently.

## Properties

### defaultImport?

> `optional` **defaultImport?**: `boolean`

Defined in: [generator/domain/model.ts:413](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L413)

If true, emitted as a default import (`import X from '...'`).

***

### items

> **items**: `string` \| `string`[]

Defined in: [generator/domain/model.ts:415](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L415)

Named imports, or a single default/namespace identifier.

***

### oneRowByItem?

> `optional` **oneRowByItem?**: `boolean`

Defined in: [generator/domain/model.ts:417](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L417)

If true, each named item goes on its own line.

***

### path

> **path**: `string`

Defined in: [generator/domain/model.ts:419](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L419)

Module specifier (`@nestjs/common`, `./user.model`, ...).
