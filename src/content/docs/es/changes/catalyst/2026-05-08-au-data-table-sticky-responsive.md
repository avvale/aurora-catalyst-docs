---
title: "Data-table sticky responsive"
description: "`<au-data-table>` gana columnas sticky horizontales, layout estable al paginar, y truncate por defecto con tooltip nativo."
date: 2026-05-08
version: "Unreleased"
classification: feature
source_commit: "4234c6600ba7a0ba3f3ef173125643e42906ede8"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/4234c6600ba7a0ba3f3ef173125643e42906ede8/openspec/changes/archive/2026-05-08-au-data-table-sticky-responsive/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- `DataTableColumnDef` gana un flag top-level `sticky?: 'left' | 'right'` — coherente con `label` / `sortable` / `filterable`, NO dentro de `meta`. Las columnas marcadas reciben `position: sticky` con offsets acumulados calculados a partir de las columnas sticky previas del mismo lado.
- El componente pasa a `table-layout: fixed` con `width: 100%` y un `min-width` computado que suma los mínimos rígidos + elásticos. Las rígidas (`size` solo) se bloquean; las elásticas (`size` + `minSize`) absorben el espacio restante.
- Truncate por defecto en `<td>` elásticos vía `overflow: hidden` / `text-overflow: ellipsis` / `white-space: nowrap`, con tooltip nativo `[attr.title]` que lleva el texto resuelto. Las celdas custom pueden sobreescribir.
- Los offsets sticky se recalculan cuando cambia la visibilidad de columnas (toggle).

## Por qué importa

Tres dolores desaparecen en viewports estrechos y al paginar: (1) `actions` y `select` ya no scrollean con el cuerpo, (2) el scroll horizontal solo mueve las columnas de datos, y (3) el ancho de la tabla deja de saltar entre páginas porque `auto` ya no remide cada celda. El fix vive en `<au-data-table>` compartido para que los consumidores no rehagan los cálculos lista por lista.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst/tree/4234c6600ba7a0ba3f3ef173125643e42906ede8/openspec/changes/archive/2026-05-08-au-data-table-sticky-responsive/)
