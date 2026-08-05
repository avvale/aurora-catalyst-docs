---
title: "TemplateElement"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/en/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/en/reference/api/cli/readme/) / [generator/domain/model](/aurora-catalyst-docs/en/reference/api/cli/generator/domain/model/readme/) / TemplateElement

# Type Alias: TemplateElement

> **TemplateElement** = `"backend/@api"` \| `"backend/@app"` \| `"backend/additional-@api"` \| `"backend/application"` \| `"backend/bounded-context"` \| `"backend/env"` \| `"backend/i18n-@app"` \| `"backend/package"` \| `"backend/packages"` \| `"backend/pivot"` \| `"backend/postman"` \| `"backend/test"` \| `"backend/types"` \| `"backend/value-object"` \| `"frontend/application"` \| `"frontend/module"` \| `"frontend/module-translations"` \| `"frontend/packages"`

Defined in: [generator/domain/model.ts:110](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L110)

Identifier of a bundled template tree. Each value points to a directory under
`src/templates/codegen/`. Passed to the generator engine's `generateFromTemplate`.
