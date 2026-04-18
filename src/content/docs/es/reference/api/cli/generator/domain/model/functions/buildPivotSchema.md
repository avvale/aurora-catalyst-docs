---
title: "BuildPivotSchema"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [generator/domain/model](../README.md) / buildPivotSchema

# Function: buildPivotSchema()

> **buildPivotSchema**(`pivot`): [`ModuleDefinitionSchema`](../interfaces/ModuleDefinitionSchema.md)

Defined in: [generator/domain/model.ts:313](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L313)

Build a complete ModuleDefinitionSchema from a RelationshipPivot.
Every field is explicit — if ModuleDefinitionSchema gains a new required field,
TypeScript will force it to be added here.

## Parameters

### pivot

[`RelationshipPivot`](../interfaces/RelationshipPivot.md)

## Returns

[`ModuleDefinitionSchema`](../interfaces/ModuleDefinitionSchema.md)
