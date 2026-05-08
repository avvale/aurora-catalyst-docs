---
title: "Componente `<au-data-table>` compartido"
description: "Los list components y los widgets m2m consumen ahora un único `<au-data-table>` en vez de duplicar el markup inline de `<table hlmTable>`."
date: 2026-05-07
version: "Unreleased"
classification: feature
source_commit: "e04288f0802e1e23ff6fc017f5ea8d566268a29b"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/e04288f0802e1e23ff6fc017f5ea8d566268a29b/openspec/changes/archive/2026-05-07-extract-shared-data-table-component/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- Nuevo componente runtime `<au-data-table>` en `@aurora/components/data-table` que encapsula el markup de `<table hlmTable>`, el scroll wrapper, el header sticky y la UX de loading/empty. Se importa como `import { DataTableComponent } from '@aurora'`.
- BREAKING — el template del list emite `<au-data-table [table]="paginated.table" [loading]="..." [emptyMessage]="..." />` en lugar de ~50 líneas de markup inline. `HlmTableImports` ya no se necesita a nivel del list.
- Inputs: `table: Table<T>` (requerido), `loading: boolean`, `emptyMessage: string`, `rowClickable: (row) => boolean`. Output: `rowClick: T`.
- Comportamiento "loading mantiene las filas anteriores": durante el refetch las filas previas siguen visibles hasta que llegan las nuevas, así el TBODY no colapsa y el scroll de la página no salta arriba.
- Nueva story `data-table.stories.ts` cubre render estándar, empty, loading-sin-datos y variante con row-click.

## Por qué importa

El list standalone, el widget `<au-grid-select-multiple-elements>` y `<au-grid-pick-dialog>` mantenían cada uno su propia copia del mismo markup `<table hlmTable>`. Bugs pasados — TBODY colapsando durante el refetch, "página N de 1" tras buscar — se arreglaban tres veces. Subir la tabla a un único componente significa que la próxima ronda de mejoras (keyboard navigation, virtual scroll, toolbar sticky) cae una vez, no tres. El output visual para el usuario final es byte-equivalente para los agregados existentes; los templates de list simplemente acortan. Los list components editados a mano disparan revisión `.origin` en la siguiente regen porque el markup cambia de forma.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst-cli/tree/e04288f0802e1e23ff6fc017f5ea8d566268a29b/openspec/changes/archive/2026-05-07-extract-shared-data-table-component/)
