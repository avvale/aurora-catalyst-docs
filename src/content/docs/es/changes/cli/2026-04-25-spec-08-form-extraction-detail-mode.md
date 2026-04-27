---
title: "Detail mode: view o dialog"
description: "El form del agregado pasa a un *-form.component.ts independiente y un nuevo front.detailMode en el YAML elige entre página enrutada y CRUD modal en la lista."
date: 2026-04-25
version: "Unreleased"
classification: breaking
source_commit: "3cb501aa990280454f628109a15f1f05726fe268"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/3cb501aa990280454f628109a15f1f05726fe268/openspec/changes/archive/2026-04-25-spec-08-form-extraction-detail-mode/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- La región de preservación `AURORA:FORM-FIELDS-START/END` se mueve de `*-detail.component.ts` al nuevo `*-form.component.ts`. **El cuerpo personalizado de la región no migra automáticamente** — cópialo al nuevo fichero antes de regenerar, o el CLI emitirá `[REGION DROPPED]` y tus ediciones se pierden.
- El cuerpo del form se extrae a un `*-form.component.ts` independiente — componente "tonto" con inputs `[initial]` + `[mode]`, outputs `(save)` + `(cancel)` y un método público `submit()`. Sin Apollo, sin chrome.
- Nuevo campo opcional en el YAML: `front.detailMode`. El valor por defecto `view` conserva las rutas `/new` + `/edit/:id`; `dialog` omite la emisión de `*-detail.component.ts` y embebe un `<hlm-dialog>` con el form dentro de la lista.
- Nuevo composable hand-authored `useAggregateShell<T>` en `@aurora/lib/` — `fetchForEdit`, `save`, `loading`, `error` — consumido idéntico por los shells view y dialog.

## Por qué importa

El form pasa a ser embebible en cualquier sitio: detail enrutado en modo view, CRUD modal en modo dialog, y el editor de relación hijo del próximo `grid-elements-manager`. Los módulos en modo por defecto regeneran con comportamiento de runtime idéntico — list, rutas, create, edit y cancel siguen igual. La única diferencia observable es el split de ficheros, que es mecánico.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst-cli/tree/3cb501aa990280454f628109a15f1f05726fe268/openspec/changes/archive/2026-04-25-spec-08-form-extraction-detail-mode/)
