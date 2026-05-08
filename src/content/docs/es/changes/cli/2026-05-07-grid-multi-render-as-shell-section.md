---
title: "Grid-multi como sección del shell"
description: "El widget manager m2m sale del form-body y pasa a renderizarse en una `<section hlmCard>` dedicada y a ancho completo en el detail shell."
date: 2026-05-07
version: "Unreleased"
classification: breaking
source_commit: "e04288f0802e1e23ff6fc017f5ea8d566268a29b"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/e04288f0802e1e23ff6fc017f5ea8d566268a29b/openspec/changes/archive/2026-05-07-grid-multi-render-as-shell-section/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- BREAKING — `grid-select-multiple-elements` deja de renderizar dentro del form. El detail shell emite una `<section hlmCard class="mt-4">` separada por cada widget grid-multi, envuelta en `@if (mode() === 'edit')`. El patrón refleja el del `grid-elements-manager` existente (SPEC-15).
- BREAKING (contrato del form) — el contrato de 10 puertos introducido el mismo día en `grid-multi-manager-pattern-emission` se elimina. El template del form ya no emite `<rel>LinkedData / Loading / LinkRequested / ...`; el form vuelve a ser una hoja tonta simple.
- El filtro del form-body omite incondicionalmente `grid-select-multiple-elements`. El partial correspondiente queda reducido a un comentario HTML defensivo.
- El template del form deja de importar `GridSelectMultipleElementsComponent`, `DataTableData`, `ManagerLoadingState` y `ServerTableState`. El detail shell asume esos imports.

## Por qué importa

El cambio anterior del mismo día emitía el widget manager dentro del card `max-w-3xl` del form — visualmente apretado para una tabla paginada con búsqueda, filtros y cientos de filas. El widget hermano `grid-elements-manager` ya había fijado el patrón correcto: renderizar en el detail shell como su propio card a ancho completo debajo del form. Este cambio alinea `grid-select-multiple-elements` con ese patrón. El cableado del orchestrator no cambia (`init()` secuencial, `relationIncludes`, el bundle de tres composables); solo se mueve el lugar de renderizado. Los forms downstream editados a mano que consumían los 10 puertos hay que regenerarlos — el form vuelve a su superficie pre-passthrough y el shell conecta el widget directamente al orchestrator.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst-cli/tree/e04288f0802e1e23ff6fc017f5ea8d566268a29b/openspec/changes/archive/2026-05-07-grid-multi-render-as-shell-section/)
