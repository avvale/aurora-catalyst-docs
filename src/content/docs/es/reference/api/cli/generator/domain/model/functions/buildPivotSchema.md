---
title: "BuildPivotSchema"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/es/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/es/reference/api/cli/readme/) / [generator/domain/model](/aurora-catalyst-docs/es/reference/api/cli/generator/domain/model/readme/) / buildPivotSchema

# Function: buildPivotSchema()

> **buildPivotSchema**(`pivot`): [`ModuleDefinitionSchema`](/aurora-catalyst-docs/es/reference/api/cli/generator/domain/model/interfaces/moduledefinitionschema/)

Defined in: [generator/domain/model.ts:313](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L313)

Build a complete ModuleDefinitionSchema from a RelationshipPivot.
Every field is explicit — if ModuleDefinitionSchema gains a new required field,
TypeScript will force it to be added here.

## Parameters

### pivot

[`RelationshipPivot`](/aurora-catalyst-docs/es/reference/api/cli/generator/domain/model/interfaces/relationshippivot/)

## Returns

[`ModuleDefinitionSchema`](/aurora-catalyst-docs/es/reference/api/cli/generator/domain/model/interfaces/moduledefinitionschema/)
