---
title: "Pipe ToOptions para labels"
description: "Un nuevo ToOptionsPipe en @aurora mapea listas a Option[] con una plantilla basada en displayField, para que los selects generados muestren el label correcto sin un campo name fijo."
date: 2026-05-19
version: "Unreleased"
classification: feature
source_commit: "9a43677f61bf3fd6a89ce726e9741c7f84a4f3e7"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/9a43677f61bf3fd6a89ce726e9741c7f84a4f3e7/openspec/changes/archive/2026-05-19-introduce-to-options-pipe/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- Añade `ToOptionsPipe` a `@aurora` — un pipe puro que mapea una lista a `Option[]` usando una plantilla `{campo}`, para que los labels de los selects sigan el `front.displayField` de cada agregado en lugar de un `name` fijo.
- Los widgets generados de relación (search-select y multi-select) ahora enlazan a través del pipe en vez de emitir un `…AsOptions` `computed` por componente.

## Por qué importa

Los desplegables de relación cuyo campo de display es `code`, o un compuesto como `{code} - {name}`, muestran el label correcto sin tocar nada — sin editar a mano los formularios generados. Como el binding es un único token declarativo, los componentes de formulario dejan de arrastrar un `computed<Option[]>` duplicado y los imports de `Option` / `computed` que venían con él. También puedes usar el pipe directamente en tus plantillas: `items | toOptions:'{code} — {name}'`.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst-cli/tree/9a43677f61bf3fd6a89ce726e9741c7f84a4f3e7/openspec/changes/archive/2026-05-19-introduce-to-options-pipe/)
