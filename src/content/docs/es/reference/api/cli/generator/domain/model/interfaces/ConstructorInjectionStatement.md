---
title: "ConstructorInjectionStatement"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [generator/domain/model](../README.md) / ConstructorInjectionStatement

# Interface: ConstructorInjectionStatement

Defined in: [generator/domain/model.ts:376](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L376)

Declaration of a constructor parameter marked for DI (`constructor(private readonly x: X)`).
Consumed by the `constructorInjection` helper in `code-gen`.

## Properties

### className

> **className**: `string`

Defined in: [generator/domain/model.ts:378](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L378)

Type name / class used as the parameter type.

***

### readonly?

> `optional` **readonly?**: `boolean`

Defined in: [generator/domain/model.ts:379](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L379)

***

### scope

> **scope**: `"private"` \| `"protected"` \| `"public"`

Defined in: [generator/domain/model.ts:380](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L380)

***

### variableName

> **variableName**: `string`

Defined in: [generator/domain/model.ts:382](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L382)

Identifier the parameter binds to.
