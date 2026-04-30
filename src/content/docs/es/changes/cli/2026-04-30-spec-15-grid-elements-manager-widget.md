---
title: "Widget grid-elements-manager"
description: "El widget grid-elements-manager se activa — declaras front.embedSupport: true en el child y el detail shell del padre embebe la lista del hijo."
date: 2026-04-30
version: "Unreleased"
classification: feature
source_commit: "14a603038b0620dfa11a1c5015b404bc99e3d902"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/14a603038b0620dfa11a1c5015b404bc99e3d902/openspec/changes/archive/2026-04-30-spec-15-grid-elements-manager-widget/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- Nuevo flag opcional en el YAML: `front.embedSupport: true` activa el modo embed en un módulo child. Sin el flag, la salida de codegen es idéntica a la de hoy.
- Con el flag, el child gana una lista polimórfica (`mode: 'standalone' | 'embed'`), un `*-form-embed.component.ts` cuyo FK al padre se inyecta en `submit()` (no vive en el FormGroup) y una factory `getXEmbedColumns` que elimina la columna del FK al padre.
- `widget.type: grid-elements-manager` ya hace dispatch en el detail shell del padre. La partial nueva emite `<au-{child}-list mode="embed">` dentro de `@if (mode() === 'edit')` y el codegen lee el YAML del child para resolver la FK de back-reference. Los targets sin `embedSupport: true` fallan rápido con un error accionable.

## Por qué importa

El widget llevaba canonizado pero inerte desde SPEC-09 — declarado en `WidgetType`, saltado en el dispatch con `console.warn`. SPEC-15 lo desbloquea sin el cambio de nested-writes en backend que requería SPEC-10: cada CRUD del hijo sigue siendo una mutation independiente y el widget embed reusa la lista y el form que el child ya tiene, en lugar de levantar un shell CRUD a mano. El runtime huérfano `@aurora/components/grid-elements-manager` y la partial legacy de Material desaparecen. Los padres con `front.detailMode: dialog` no pueden alojar el widget — el codegen avisa y lo omite para evitar UX de diálogo dentro de diálogo.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst-cli/tree/14a603038b0620dfa11a1c5015b404bc99e3d902/openspec/changes/archive/2026-04-30-spec-15-grid-elements-manager-widget/)
