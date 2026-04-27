---
title: "Componentes de relación en @aurora"
description: "Cuatro nuevos componentes Angular standalone — async-select-search, grid-select-element, grid-select-multiple-elements, grid-elements-manager — bajo @aurora/components."
date: 2026-04-24
version: "Unreleased"
classification: feature
source_commit: "4884bc261337588b0954bac2cf88cb86b4f9353d"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/4884bc261337588b0954bac2cf88cb86b4f9353d/openspec/changes/archive/2026-04-24-add-relationship-components/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- Cuatro componentes standalone nuevos en `frontend/src/@aurora/components/`: `async-select-search` (many-to-one con búsqueda lazy), `grid-select-element` (many-to-one como diálogo tabla), `grid-select-multiple-elements` (selector tabla many-to-many) y `grid-elements-manager` (shell CRUD one-to-many events-only).
- Contrato uniforme de input/output — `[value]` entra, `(valueChange)` sale — sin `ControlValueAccessor` y sin aceptar `FormControl` como input. El host conecta vía `[value]="form.controls.x.value"` + `(valueChange)="form.controls.x.setValue($event)"`. El contrato queda preparado para la próxima migración a Signal Forms.
- Las primitives de Spartan-ng (`hlm-combobox`, `hlm-command`, `hlm-popover`, `hlm-dialog`, `hlm-alert-dialog`, …) son la base de UI; los tres `grid-*` componen sobre el `@aurora/components/data-table` existente en vez de reimplementar selección, paginación o búsqueda. Una shape compartida `Option<T>` se publica desde `@aurora/components`.

## Por qué importa

Hasta ahora, cualquier form con una relación requería un dropdown, una búsqueda async, un multi-select o un CRUD anidado escritos a mano. Estos cuatro cubren las cuatro cardinalidades con un contrato único y son las piezas que consume `spec-09-relationship-webcomponent-dispatch` en el lado del CLI. Cada componente trae su `*.stories.ts` co-located; `grid-select-element` añade un `*.spec.ts` que cubre apertura/cierre, selección, propagación de búsqueda y estado disabled. El cambio es puramente aditivo — no rompe nada existente.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst/tree/4884bc261337588b0954bac2cf88cb86b4f9353d/openspec/changes/archive/2026-04-24-add-relationship-components/)
