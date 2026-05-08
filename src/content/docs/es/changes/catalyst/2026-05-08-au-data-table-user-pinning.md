---
title: "Pinning de columnas por usuario"
description: "El botón candado de `<au-column-toggle>` pinnea/despinea columnas en runtime vía TanStack pinning, con dos zonas drag y persistencia en `localStorage`."
date: 2026-05-08
version: "Unreleased"
classification: feature
source_commit: "8c7f3936ef622d7b830b2de3d06776f479bfc821"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/8c7f3936ef622d7b830b2de3d06776f479bfc821/openspec/changes/archive/2026-05-08-au-data-table-user-pinning/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- El botón candado de `<au-column-toggle>` llama a `column.pin('left')` / `column.pin(false)`, reemplazando el signal local muerto. El estado sticky del item del toggle se deriva de `column.getIsPinned()`.
- Las columnas declaradas con `sticky: 'left' | 'right'` en `DataTableColumnDef` son lock duro: el candado se renderiza con badge y no es clickable. La intención del dev se preserva.
- El toggle se divide en dos zonas `cdkDropList` (sticky-left y scroll), separadas por un `<hr>` con etiqueta. El drag-and-drop se restringe a la misma zona.
- `<au-data-table>` cambia el computed manual `stickyOffsets` por `column.getStart('left')` / `column.getAfter('right')` nativos de TanStack — el invariante "sticky contiguas" pasa a estar garantizado por el framework.
- Pinning + visibilidad + orden persisten en `localStorage` con clave `route + tableId`. Reset borra la entrada. Soft warning cuando los anchos pinned exceden el 50% del viewport visible.

## Por qué importa

El botón candado era un stub. Ahora el usuario puede pinear columnas desde la UI, reordenar con drag dentro de cada zona, y el layout sobrevive a un refresh. La migración a pinning de TanStack convierte además el invariante "las columnas sticky son contiguas" en garantía del framework en vez de un cómputo manual de offsets, eliminando una clase de bugs de deriva de layout que podían aparecer al crecer el estado de la tabla.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst/tree/8c7f3936ef622d7b830b2de3d06776f479bfc821/openspec/changes/archive/2026-05-08-au-data-table-user-pinning/)
