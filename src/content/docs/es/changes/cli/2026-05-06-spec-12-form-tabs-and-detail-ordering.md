---
title: "Pestañas y orden en formularios"
description: "Tres campos del schema que estaban muertos pasan a regir el rendering — `widget.tab` agrupa en pestañas, `widget.detailSort` ordena, `widget.isDetailHidden` oculta."
date: 2026-05-06
version: "Unreleased"
classification: feature
source_commit: "2576efbf76eda48aa404955ea6844ed739509268"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/2576efbf76eda48aa404955ea6844ed739509268/openspec/changes/archive/2026-05-06-spec-12-form-tabs-and-detail-ordering/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- `widget.tab` agrupa campos en pestañas. El form-body renderiza `<hlm-tabs>` con un panel por cada tab id único, cada panel con su propio `<section hlmCard>`. El orden de las pestañas sigue la primera aparición; el match es exacto y case-sensitive.
- `widget.detailSort` ordena los campos ascendentemente dentro de su contenedor (grupo → tab → form). Default `Infinity` manda los campos sin valor al final; el orden YAML rompe empates.
- `widget.isDetailHidden: true` saca un campo del form body — no renderiza, no ocupa celda y no cuenta para el tier de grid. Los campos ocultos pueden seguir viviendo en el FormGroup si están en `formGroupFields` para preservar el round-trip.
- Los forms tabulados ganan signal `activeTab` y computeds `<tabId>HasErrors`. `submit()` salta a la primera pestaña con errores antes de marcar touched, y el trigger pinta un badge de error.
- Dialog mode + tabs imprime un warning en consola y renderiza sin pestañas (espacio insuficiente); el ordering y el hidden sí aplican.

## Por qué importa

Los tres campos YAML estaban declarados en `aurora-1.4.json` pero el codegen los ignoraba — documentación muerta. Conectarlos desbloquea forms grandes con agrupaciones lógicas, ordenado explícito independiente del YAML y la capacidad de mantener campos internos (auditoría, computados) en el agregado sin exponerlos en la UI. Los módulos que no usan ninguno de los tres son byte-equivalentes, así que la migración es opt-in: declaras en YAML, regeneras. Los forms tabulados ganan además navegación consciente de errores: un submit inválido salta automáticamente a la primera pestaña con errores. Los campos equivalentes para el list (`listSort`, `isListHidden`) viven en otros templates y llegan en un cambio aparte.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst-cli/tree/2576efbf76eda48aa404955ea6844ed739509268/openspec/changes/archive/2026-05-06-spec-12-form-tabs-and-detail-ordering/)
