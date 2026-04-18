---
title: "TemplateElement"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [generator/domain/model](../README.md) / TemplateElement

# Type Alias: TemplateElement

> **TemplateElement** = `"backend/@api"` \| `"backend/@app"` \| `"backend/additional-@api"` \| `"backend/application"` \| `"backend/bounded-context"` \| `"backend/env"` \| `"backend/i18n-@app"` \| `"backend/package"` \| `"backend/packages"` \| `"backend/pivot"` \| `"backend/postman"` \| `"backend/test"` \| `"backend/types"` \| `"backend/value-object"` \| `"frontend/application"` \| `"frontend/module"` \| `"frontend/module-translations"` \| `"frontend/packages"`

Defined in: [generator/domain/model.ts:107](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L107)

Identifier of a bundled template tree. Each value points to a directory
under `src/templates/codegen/`. Passed to the generator engine's
`generateFromTemplate` (see `src/generator/engine/file-manager.ts`).
