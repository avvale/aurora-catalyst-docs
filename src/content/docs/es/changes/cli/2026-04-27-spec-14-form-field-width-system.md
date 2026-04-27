---
title: "Grid de 12 columnas + widget.span"
description: "Los form fields se distribuyen en un grid uniforme de 12 columnas con defaults por tipo, override opcional widget.span y auto-expansión del último campo incompleto."
date: 2026-04-27
version: "Unreleased"
classification: feature
source_commit: "f5e8b7eae51c25bc70e00c17693733d83e253622"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/f5e8b7eae51c25bc70e00c17693733d83e253622/openspec/changes/archive/2026-04-27-spec-14-form-field-width-system/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- Nuevo campo opcional en el YAML: `widget.span` (entero 1–12) para forzar el column-span por property. Los valores fuera de rango fallan la validación de schema antes de que arranque la generación.
- Cada form, grupo y panel de tab se renderiza ahora en un único grid de 12 columnas (`grid-cols-1 md:grid-cols-12`). Los spans por defecto salen de una tabla fija por tipo — `boolean` / `date` / `time` → 3, numéricos → 4, `varchar` por `maxLength` (≤30 → 4, 31–80 → 6, >80 → 12), `text` y relaciones grid → 12.
- El último campo de una fila incompleta se auto-expande para rellenar las columnas que quedan. La pasada se ejecuta por contenedor de forma independiente, así que cada `widget.group` y cada tab balancean su propia fila.

## Por qué importa

Un form regenerado queda más predecible: un único campo `varchar(64)` ya no se renderiza al 50% dentro de un diálogo, dejan de aparecer huecos cuando los campos no suman un total limpio del grid, y el layout deja de saltar de 2 a 6 columnas al añadir el sexto campo. La maquinaria legacy — `SPAN_TABLE`, `pickGridMode`, `lengthToProportion`, los tiers compact/medium/full — desaparece. Los YAMLs existentes no necesitan migración: los módulos sin `span` adoptan los nuevos defaults automáticamente. Regenerar cualquier módulo con form-body produce un markup visualmente distinto por diseño.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst-cli/tree/f5e8b7eae51c25bc70e00c17693733d83e253622/openspec/changes/archive/2026-04-27-spec-14-form-field-width-system/)
