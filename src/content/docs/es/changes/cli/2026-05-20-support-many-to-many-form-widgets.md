---
title: "Widgets de formulario M2M"
description: "Las relaciones muchos-a-muchos declaradas con un widget de formulario ahora generan un FormControl funcional en vez de lanzar 'Cannot find control' en runtime."
date: 2026-05-20
version: "Unreleased"
classification: feature
source_commit: "9a43677f61bf3fd6a89ce726e9741c7f84a4f3e7"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/9a43677f61bf3fd6a89ce726e9741c7f84a4f3e7/openspec/changes/archive/2026-05-20-support-many-to-many-form-widgets/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- Una relación muchos-a-muchos declarada con un widget de formulario (p. ej. `multiple-select`) ahora genera un `FormControl` funcional llamado `<singular>Ids: string[]`. Antes el control se omitía y Angular lanzaba `Cannot find control with name: <singular>Ids` en runtime.
- Los formularios en modo edición proyectan la forma de lectura denormalizada (`<plural>: T[]`) al control `<singular>Ids` en el reset, y los configs de detalle/lista emiten el `include` correspondiente para que carguen los datos relacionados.

## Por qué importa

El camino de muchos-a-muchos vía formulario funciona de punta a punta: declara un widget en una propiedad m2m en el YAML y el formulario generado funciona — sin editar a mano tras generar, y sin tener que desactivar el widget. Se preserva el contrato de escritura `applicationIds: [ID]` sobre GraphQL; la traducción entre forma de lectura y escritura vive en el formulario, no en el agregado ni en el repositorio.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst-cli/tree/9a43677f61bf3fd6a89ce726e9741c7f84a4f3e7/openspec/changes/archive/2026-05-20-support-many-to-many-form-widgets/)
