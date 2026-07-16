---
title: "Ancho de diálogo configurable"
description: "Nuevo campo opcional front.dialogWidth en el YAML que fija un ancho definido y responsive para los diálogos de crear/editar, y corrige que el diálogo cambiara de tamaño al rellenar el formulario."
date: 2026-07-16
version: "Unreleased"
classification: feature
source_commit: "e62292d9117737e633cd9f5424aa0e8e5104c458"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/e62292d9117737e633cd9f5424aa0e8e5104c458/openspec/changes/archive/2026-07-16-add-configurable-dialog-width/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- Nuevo campo opcional `front.dialogWidth` en el YAML de cada módulo, con efecto solo cuando `front.detailMode: dialog`. Acepta cinco tokens con nombre — `sm`, `md` (por defecto), `lg`, `xl`, `full` — cada uno asociado a un ancho definido y acotado al viewport.
- Regenerar un módulo dialog existente también corrige un bug ya presente: el diálogo deja de cambiar de tamaño visiblemente al elegir distintos valores en los selects, porque ahora cada token renderiza un ancho estable en lugar de uno que dependía del contenido.

## Por qué importa

Los módulos en modo dialog compartían antes un único ancho fijo en el código que, en la práctica, seguía el contenido del diálogo — así que la caja cambiaba de tamaño mientras el usuario rellenaba el formulario. Ahora declaras la intención por módulo: `sm` para un formulario de uno o dos campos, `lg` o `xl` para uno denso o ancho, `full` cuando el formulario necesita casi toda la pantalla. Elijas el token que elijas, se renderiza con un ancho estable desde el primer pintado. Los módulos dialog existentes adoptan la corrección automáticamente la próxima vez que se regeneren por cualquier motivo — sin barrido forzado, y sin necesidad de tocar el YAML salvo que quieras un tamaño distinto del `md` por defecto.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst-cli/tree/e62292d9117737e633cd9f5424aa0e8e5104c458/openspec/changes/archive/2026-07-16-add-configurable-dialog-width/)
