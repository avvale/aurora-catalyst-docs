---
title: Conceptos
description: Las ideas, decisiones y filosofía detrás de Aurora Catalyst.
---

Las páginas de concepto están **orientadas a la comprensión**: explican el _porqué_ detrás de Aurora, no el cómo usarlo. Léelas cuando quieras formar un modelo mental sólido.

Si quieres _hacer_ algo, usa las [guías](../guides/). Si necesitas datos exactos, usa la [referencia](../reference/).

## Temas

### Backend

- **[Estrategias de autenticación](./backend/authentication-strategies/)** — los tres modos `OAUTH_STRATEGY`, el patrón BFF y cómo fluyen los tokens entre un hub y sus satélites.
- **[Ports entre bounded contexts](./backend/cross-bounded-context-ports/)** — cómo la carpeta `@bridges` desacopla los bounded contexts mediante ports, tokens, adapters y un composition root global.
- **[Scaffolding de un módulo](./backend/module-scaffolding/)** — qué genera la CLI para un módulo de backend y cómo el lockfile vigila las ediciones a mano.

### Frontend

- **[Renderers de celdas](./frontend/cell-renderers/)** — cómo la data-table despacha por tipo de propiedad y cómo sobreescribir el render por columna.
- **[Composables: atoms y presets](./frontend/composables/)** — por qué la lógica del brain se parte en atoms de responsabilidad única y presets opinados conectados a TanStack Table.
- **[Composición vs herencia](./frontend/composition-over-inheritance/)** — por qué el brain extiende en horizontal componiendo funciones en vez de por jerarquías de clases.
- **[Detail mode](./frontend/detail-mode/)** — cómo `front.detailMode` elige entre una página de detalle ruteada y un CRUD lista-con-modal.
- **[Embed mode](./frontend/embed-mode/)** — cómo `front.embedSupport` permite embeber un módulo hijo dentro del detalle de su padre.
- **[Ancho de campos](./frontend/form-field-widths/)** — cómo el grid de 12 columnas, los defaults por tipo, `widget.span` y el pase de auto-expand deciden el ancho de cada campo.
- **[Preservation regions](./frontend/preservation-regions/)** — cómo te apropias de un trozo de un archivo generado y por qué ese trozo sobrevive a la regeneración.
- **[Columnas pinned (TanStack)](./frontend/tanstack-column-pinning/)** — por qué fijar una columna la reordena en vez de moverla, y cómo la data-table escribe pinning y orden a la vez.

### Workflow y gobernanza

- **[Sistema de business rules](./workflow/business-rules-overview/)** — un catálogo de invariantes de dominio junto a los YAML, usado como memoria institucional y detector de incoherencias.
- **[Anatomía de una business rule](./workflow/business-rule-anatomy/)** — los campos, la gramática de IDs, estado/severidad, la tabla de casos y el ciclo de vida de una regla.
- **[Arquitectura del sistema de business rules](./workflow/business-rules-architecture/)** — las piezas técnicas (índice, scripts, slash commands, skill, hooks, CI, extensión OpenSpec) y cómo se relacionan.
- **[Modos de desarrollo](./workflow/development-modes/)** — Framework mode vs Solution mode y el comando `/dev-mode` que cambia entre ellos.
- **[Los cuatro artefactos de gobernanza](./workflow/governance-artifacts/)** — Harness Rules, el hook architecture-checkpoint y las skills de project-structure de backend/frontend: qué te bloquea, qué te aconseja y quién es responsable de qué.
