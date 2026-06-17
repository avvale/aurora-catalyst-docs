---
title: Concepts
description: The ideas, decisions, and philosophy behind Aurora Catalyst.
---

Concept pages are **understanding-oriented**: they explain the _why_ behind Aurora rather than how to use it. Read these when you want to form a solid mental model.

If you want to _do_ something, use the [how-to guides](../guides/). If you need exact facts, use the [reference](../reference/).

## Topics

### Backend

- **[Authentication strategies](./backend/authentication-strategies/)** — the three `OAUTH_STRATEGY` modes, the BFF pattern, and how tokens flow between a hub and its satellites.
- **[Cross-bounded-context ports](./backend/cross-bounded-context-ports/)** — how the `@bridges` folder decouples bounded contexts through ports, tokens, adapters, and a global composition root.
- **[Backend module scaffolding](./backend/module-scaffolding/)** — what the CLI generates for a backend module, and how the lockfile keeps hand edits in check.

### Frontend

- **[Cell renderers](./frontend/cell-renderers/)** — how the data-table dispatches by property type and how to override rendering per column.
- **[Composables: atoms and presets](./frontend/composables/)** — why brain logic splits into single-responsibility atoms and opinionated presets wired to TanStack Table.
- **[Composition vs inheritance](./frontend/composition-over-inheritance/)** — why the brain layer extends horizontally by composing functions instead of through class hierarchies.
- **[Detail mode](./frontend/detail-mode/)** — how `front.detailMode` chooses between a routed detail page and a list-with-modal CRUD.
- **[Embed mode](./frontend/embed-mode/)** — how `front.embedSupport` opts a child module into being embedded inside its parent's detail view.
- **[Form field widths](./frontend/form-field-widths/)** — how the 12-column grid, type defaults, `widget.span`, and the auto-expand pass decide each field's width.
- **[Preservation regions](./frontend/preservation-regions/)** — how you own a slice of a generated file and why that slice survives regeneration.
- **[Column pinning (TanStack)](./frontend/tanstack-column-pinning/)** — why pinning a column reorders rather than moves it, and how the data-table writes both pinning and order.

### Workflow & governance

- **[Business rules system](./workflow/business-rules-overview/)** — a catalog of domain invariants beside the YAML schemas, used as institutional memory and incoherence detector.
- **[Anatomy of a business rule](./workflow/business-rule-anatomy/)** — the fields, ID grammar, state/severity, case table, and lifecycle of a single rule.
- **[Business rules system architecture](./workflow/business-rules-architecture/)** — the technical pieces (index, scripts, slash commands, skill, hooks, CI, OpenSpec extension) and how they relate.
- **[Development modes](./workflow/development-modes/)** — Framework mode vs Solution mode, and the `/dev-mode` command that switches between them.
- **[The four governance artifacts](./workflow/governance-artifacts/)** — Harness Rules, the architecture-checkpoint hook, and the backend/frontend project-structure skills: what blocks you, what advises you, and who owns what.
