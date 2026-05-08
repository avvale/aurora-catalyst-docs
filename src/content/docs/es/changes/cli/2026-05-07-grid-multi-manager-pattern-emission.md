---
title: "Patrón manager para grid-multi"
description: "El widget `grid-select-multiple-elements` se re-habilita con emisión manager-pattern y un orchestrator `useRelationshipPivot` en el detail shell."
date: 2026-05-07
version: "Unreleased"
classification: feature
source_commit: "51ca231bee2c5e5437221f555c40b682b7c4878c"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/51ca231bee2c5e5437221f555c40b682b7c4878c/openspec/changes/archive/2026-05-07-grid-multi-manager-pattern-emission/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- BREAKING — el widget `grid-select-multiple-elements` vuelve a emitir markup real (queda revertido el stub diferido anterior). La membresía se renderiza con `<au-grid-select-multiple-elements>` envuelto en `@if (mode() === 'edit')`.
- BREAKING (contrato del form) — por cada widget grid-multi el form gana 6 input signals (`<rel>LinkedData / LinkedColumns / CandidatesData / CandidatesColumns / LinkedIds / Loading`) y 4 outputs (`<rel>LinkedStateChange / CandidatesStateChange / LinkRequested / UnlinkRequested`). La propiedad grid-multi queda excluida de `signalForm.controls` — la membresía vive en la tabla pivot, mutada con llamadas API instantáneas fuera del ciclo create/update del form.
- El detail shell instancia `useRelationshipPivot<TLinked, TCandidate, TPivot>` por cada widget grid-multi y conecta los eventos del form al orchestrator.
- Dialog mode + grid-multi imprime un warning y omite el widget; el modo `'new'` lo oculta porque la membresía necesita un `parentId` que aún no existe.

## Por qué importa

Tras los sub-changes A (`displayField`) y B (`skip-pivot-frontend-emission`) que despejaron el camino, este cierra el loop m2m. `iam/role` regenera con un manager de permisos totalmente funcional — link/unlink de permisos al rol con llamadas API instantáneas. Como la membresía se muta fuera del ciclo del form, el form no tiene FormControl para el campo m2m y el usuario crea primero el padre, después navega al edit para gestionar la membresía. El contrato de 10 puertos en el form es el precio de mantenerlo como una hoja tonta mientras el shell orquesta el estado. Los widgets m2m hermanos (`multiple-select`, `multiple-search-select`, `async-multiple-search-select`) conservan su modelo `string[]` en FormControl — solo la variante grid-multi usa el orchestrator pivot.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst-cli/tree/51ca231bee2c5e5437221f555c40b682b7c4878c/openspec/changes/archive/2026-05-07-grid-multi-manager-pattern-emission/)
