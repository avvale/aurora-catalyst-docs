---
title: "Composables atómicos y nuevo manager"
description: "Los composables se reorganizan en @aurora/composables/{atoms,presets}/ y grid-select-multiple-elements pasa a manager many-to-many con un contrato inmediato de link/unlink."
date: 2026-05-05
version: "Unreleased"
classification: breaking
source_commit: "c28bb6027810bc9a05d262ed3b9913cc57d2166b"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/c28bb6027810bc9a05d262ed3b9913cc57d2166b/openspec/changes/archive/2026-05-05-refactor-data-table-to-atomic-composables/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- (Breaking) `grid-select-multiple-elements` ahora es un manager many-to-many. El contrato Apply/Cancel desaparece: el componente muestra la tabla outer con los items vinculados, abre un dialog de candidatos y emite `linkRequested(ids[])` / `unlinkRequested(ids[])` de forma inmediata.
- Nueva capa atómica bajo `@aurora/composables/{atoms,presets}/`: 9 atoms de tabla (`useTableSearch`, `useTableSort`, `useTablePagination`, `useTableSelection`, …), 10 atoms graphql y los presets `usePaginatedDataTable`, `useStaticDataTable`, `usePivotMembership`, `useRelationshipPivot`.
- Tres fetchers nuevos (`mutateInsert`, `mutateDeleteByKeys`, `mutateDelete`) y un componente reutilizable `grid-pick-dialog` para listas paginadas en servidor con selección simple o múltiple.

## Por qué importa

La capa cerebro (composables) ahora sigue la misma filosofía atómica que la capa visual: piezas de responsabilidad única más presets opinados para el caso típico de lista paginada en servidor. Migración del cambio breaking: si consumes `<au-grid-select-multiple-elements>`, abandona el cableado `[value]` / `(valueChange)` con Apply/Cancel y pasa a manejar `(linkRequested)` y `(unlinkRequested)` para mutar el pivot y refrescar `linkedData`. Los imports desde el alias raíz `@aurora` siguen resolviendo — solo cambia el contrato I/O de ese componente.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst/tree/c28bb6027810bc9a05d262ed3b9913cc57d2166b/openspec/changes/archive/2026-05-05-refactor-data-table-to-atomic-composables/)
