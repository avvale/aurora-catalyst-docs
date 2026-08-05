---
title: "DetailMode"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/en/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/en/reference/api/cli/readme/) / [generator/domain/model](/aurora-catalyst-docs/en/reference/api/cli/generator/domain/model/readme/) / DetailMode

# Type Alias: DetailMode

> **DetailMode** = `"dialog"` \| `"view"`

Defined in: [generator/domain/model.ts:51](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L51)

How the module's detail surface is presented in the UI.
- `view` (default): detail lives as a routed page (`/new`, `/edit/:id`).
- `dialog`: detail lives inside the list as an `<hlm-dialog>` modal;
  no detail component file is emitted.

Custom form bodies are reconciled via `.origin` on regen.
