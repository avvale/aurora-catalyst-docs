---
title: "Pivots sin emisión frontend"
description: "Los pivots auto-derivados de relaciones m2m dejan de recibir componentes de list, detail, form y columns. El data-access se mantiene."
date: 2026-05-06
version: "Unreleased"
classification: breaking
source_commit: "112009585ee2d3415004730e24f914e5f6e4462f"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/112009585ee2d3415004730e24f914e5f6e4462f/openspec/changes/archive/2026-05-06-skip-pivot-frontend-emission/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- BREAKING — los pivots (auto-derivados de relaciones m2m) dejan de emitir los archivos `list / detail / form / form-embed / list-actions-cell / columns / index`. Su representación UI vive en el widget m2m del agregado padre.
- El data-access se mantiene: los pivots siguen emitiendo `list-config`, `detail-config`, `graphql`, `resolvers` y sus type entries — los consume el orchestrator del widget manager.
- Nuevo aviso `[ORPHAN PIVOT FILES]` lista los archivos UI pivot preexistentes marcados como seguros para borrar al regenerar. El codegen nunca borra archivos del usuario; tú haces el `rm` manualmente.
- Nuevo helper `isPivotAggregate(schema)` detecta pivots estructuralmente (toda propiedad no-sistema es many-to-one).

## Por qué importa

Esto codifica al nivel del codegen una regla Aurora de siempre: los pivots nunca son sujetos frontend de primera clase. Existen como almacenamiento backend de un m2m; su UI es el widget sobre el campo m2m del agregado padre. Los proyectos existentes con directorios pivot ya emitidos (`iam/permission-role/`, `iam/role-account/`, `iam/tenant-account/`) necesitan un pase de cleanup manual tras el regen — el codegen avisa pero no borra. Tras el cleanup, el output del regen queda consistente: sin huérfanos, sin tipos rotos, sin `TS2339 row.name` en agregados sin `name`.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst-cli/tree/112009585ee2d3415004730e24f914e5f6e4462f/openspec/changes/archive/2026-05-06-skip-pivot-frontend-emission/)
