---
title: "ConstructorInjectionStatement"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/es/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/es/reference/api/cli/readme/) / [generator/domain/model](/aurora-catalyst-docs/es/reference/api/cli/generator/domain/model/readme/) / ConstructorInjectionStatement

# Interface: ConstructorInjectionStatement

Defined in: [generator/domain/model.ts:426](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L426)

Declaration of a constructor parameter marked for DI (`constructor(private readonly x: X)`).
Consumed by the `constructorInjection` helper in `code-gen`.

## Properties

### className

> **className**: `string`

Defined in: [generator/domain/model.ts:428](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L428)

Type name / class used as the parameter type.

***

### readonly?

> `optional` **readonly?**: `boolean`

Defined in: [generator/domain/model.ts:429](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L429)

***

### scope

> **scope**: `"private"` \| `"protected"` \| `"public"`

Defined in: [generator/domain/model.ts:430](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L430)

***

### variableName

> **variableName**: `string`

Defined in: [generator/domain/model.ts:432](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L432)

Identifier the parameter binds to.
