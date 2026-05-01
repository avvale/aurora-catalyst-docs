---
title: "Cell con icono para columnas boolean"
description: "Las columnas boolean en las listas generadas renderizan un icono mediante el nuevo componente compartido `BooleanCell` en lugar del texto literal `true` / `false`."
date: 2026-05-02
version: "Unreleased"
classification: feature
source_commit: "fb1cc7e512286a20656a11d965aa02029a6fe3a7"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/fb1cc7e512286a20656a11d965aa02029a6fe3a7/openspec/changes/archive/2026-05-02-spec-18-boolean-cell-dispatch/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- El codegen de `<mod>.columns.ts` ahora dispatcha por tipo de property: cuando `type === 'boolean'` (no relacional), la columna emite `cell: () => flexRenderComponent(BooleanCell, { inputs: {} })` más los flags estándar `sortable` / `filterable` / `exportable`. Sin flag `searchable` — la búsqueda de texto sobre `"true"` / `"false"` no es útil.
- El nuevo `BooleanCell` vive en `@aurora/components/data-table/cells/boolean-cell.component.ts`. Defaults: `lucideCheck` + `text-emerald-600` para `true`, `lucideMinus` + `text-muted-foreground/60` para `false`. Override por columna con `inputs: { trueIcon, falseIcon, trueClass, falseClass }`.
- La convención de la carpeta `cells/` queda documentada: los componentes de formateo read-only renderizados vía `flexRenderComponent` viven en `cells/`; el chrome interactivo que muta estado de la tabla se queda en `components/`. Los futuros renderers (`DateCell`, `BadgeCell`, …) siguen el mismo split.

## Por qué importa

El codegen anterior emitía coerción a string para cualquier property no relacional, así que las columnas boolean renderizaban el texto literal `true` / `false`. El primer módulo que se topó con esto — `iam/tenant` — lo resolvió con un `tenant-list-active-cell.component.ts` per-module que se habría duplicado en cada aggregate que declarara un boolean. Ahora el codegen se hace cargo del dispatch y del cell. Los aggregates con al menos una property boolean regeneran con `[FILE OVERWRITE]` en `.columns.ts`; los aggregates sin booleans regeneran byte a byte idénticos.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst-cli/tree/fb1cc7e512286a20656a11d965aa02029a6fe3a7/openspec/changes/archive/2026-05-02-spec-18-boolean-cell-dispatch/)
