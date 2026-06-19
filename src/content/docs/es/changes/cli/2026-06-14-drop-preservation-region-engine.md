---
title: "Adiós a las preservation regions"
description: "Se elimina la preservation region AURORA:FORM-FIELDS y todo su motor — la reconciliación .origin pasa a ser la única costura para personalizar el código generado."
date: 2026-06-14
version: "Unreleased"
classification: breaking
source_commit: "6434d041cba6acb2d8c43834970361a57fae3fa4"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/6434d041cba6acb2d8c43834970361a57fae3fa4/openspec/changes/archive/2026-06-14-drop-preservation-region-engine/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- **Breaking:** se eliminan la preservation region `AURORA:FORM-FIELDS` — la única que emitía el codegen — y el motor de regiones completo. Los archivos generados ya no llevan markers de región.
- La integridad del archivo pasa a ser un `sha1` plano de todo el contenido, y la reconciliación `.origin` se convierte en la única costura para personalizar el código generado.
- Los campos de tipo scalar-array con widget relacional ahora emiten correctamente su input de opciones.

## Por qué importa

La región pretendía proteger tu HTML personalizado del formulario entre regeneraciones, pero también congelaba ese bloque: cuando el markup de la plantilla mejoraba, el cambio nunca llegaba a los módulos ya existentes. Esa es la trampa de la que sales. A partir de ahora todos los archivos generados siguen una sola regla uniforme, y conservas tus ediciones a través de `catalyst origin diff / accept / reject`. En el primer `catalyst generate` tras actualizar, los formularios existentes producen un `.origin` que revisas — los formularios estándar se aceptan sin más, y cualquier cuerpo personalizado se reaplica desde el diff.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst-cli/tree/6434d041cba6acb2d8c43834970361a57fae3fa4/openspec/changes/archive/2026-06-14-drop-preservation-region-engine/)
