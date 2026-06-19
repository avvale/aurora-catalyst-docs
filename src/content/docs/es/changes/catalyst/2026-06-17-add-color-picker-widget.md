---
title: "Widget de tipo color-picker"
description: "Un campo escalar puede declarar widget type color-picker y el generador del front-module emite un au-color-picker enlazado al Signal Form."
date: 2026-06-17
version: "Unreleased"
classification: feature
source_commit: "1e9b764950807a5dffed95b56b298965c3711261"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/1e9b764950807a5dffed95b56b298965c3711261/openspec/changes/archive/2026-06-17-add-color-picker-widget/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- Un campo escalar (`varchar`) ahora puede declarar `widget: { type: color-picker }`, y el generador del front-module emite un `<au-color-picker>` enlazado al Signal Form vía `[formField]`.
- Se añade `color-picker` al JSON schema publicado (`aurora-1.4.json`), así que la validación del YAML y el autocompletado del editor lo aceptan.

## Por qué importa

El componente `au-color-picker` ya existía, pero era inalcanzable desde el schema, así que cualquier módulo que quisiera un input de color — como el campo `color` de la app del HUB que tiñe cada tarjeta del launchpad — tenía que editar a mano su formulario generado, rompiendo el contrato schema-first. Ahora un campo se declara a sí mismo como input de color y el generador cablea `ColorPickerImports` desde el barrel público `@aurora` por ti. El cambio es puramente aditivo: los widgets y campos existentes no se tocan, y un campo se apunta solo si declara el widget.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst/tree/1e9b764950807a5dffed95b56b298965c3711261/openspec/changes/archive/2026-06-17-add-color-picker-widget/)
