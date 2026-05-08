---
title: "Display field para agregados"
description: "Nuevos atributos `front.displayField` y `front.templateDisplayField` para que los agregados sin `name` declaren su etiqueta de display."
date: 2026-05-06
version: "Unreleased"
classification: feature
source_commit: "f4ddb20e9b220e14ea57d8a52b63fbcd56e4a06f"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/f4ddb20e9b220e14ea57d8a52b63fbcd56e4a06f/openspec/changes/archive/2026-05-06-add-front-display-field/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- Nuevo atributo `front.displayField`: nombra la propiedad que contiene la etiqueta legible. Default `'name'`. Lo usan los toasts de delete y los accesors de columnas FK.
- Nuevo atributo `front.templateDisplayField`: compone etiquetas multi-campo con interpolación `{fieldName}`, p.ej. `'{code} - {name}'`. Cae a `displayField` si no se declara.
- Los accesors de columnas FK dejan de hardcodear `target.name` — resuelven el `displayField` del target cross-schema, así que una FK a un agregado que muestra por `email` lee ahora `target.email`.

## Por qué importa

Para agregados sin propiedad `name` — `iam/account` muestra por `email`, por ejemplo — el list y las columnas FK generadas dejan de fallar con `TS2339 property 'name' does not exist`. Basta con declarar `front.displayField: email` en el YAML y regenerar. Los agregados que sí tienen `name` y no declaran nada emiten código byte-equivalente, así que la actualización no tiene riesgo en el caso común. `templateDisplayField` abre la puerta a etiquetas compuestas (`'{code} - {name}'`) para agregados cuya identidad no es un único campo. El `aurora-1.4.json` cross-repo registra ambos atributos para que la validación YAML también los reconozca.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst-cli/tree/f4ddb20e9b220e14ea57d8a52b63fbcd56e4a06f/openspec/changes/archive/2026-05-06-add-front-display-field/)
