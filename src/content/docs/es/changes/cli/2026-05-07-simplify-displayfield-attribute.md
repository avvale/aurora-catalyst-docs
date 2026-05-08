---
title: "Schema `displayField` unificado"
description: "`front.templateDisplayField` desaparece — `front.displayField` ahora autodetecta identificador simple vs plantilla `{placeholder}`."
date: 2026-05-07
version: "Unreleased"
classification: breaking
source_commit: "1e43a47739202de45970bf29644cd56709d196fa"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/1e43a47739202de45970bf29644cd56709d196fa/openspec/changes/archive/2026-05-07-simplify-displayfield-attribute/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- BREAKING — `front.templateDisplayField` se elimina del schema YAML y de `ModuleDefinitionSchema['front']`. Los agregados que lo declaraban DEBEN mover el valor a `front.displayField`.
- `front.displayField` acepta ahora las dos formas: un identificador simple (`'email'`) o una plantilla de interpolación (`'{code} - {name}'`). La detección es automática: la presencia de placeholders `{<identifier>}` activa el modo plantilla.
- `getDisplayFieldRef` y `getTemplateDisplayFieldExpr` se reemplazan por un único helper que devuelve la salida correcta en cada call site (accessor key de FK, property del delete-toast, fragment de template literal).

## Por qué importa

Dos atributos para el mismo concepto obligaban a los autores a reaprender la distinción cada vez que tocaban un schema. Colapsarlos en un único atributo autodetectado elimina la redundancia sin perder expresividad — etiquetas compuestas como `'{code} - {name}'` siguen funcionando, pero viven bajo la misma key. La migración es un find/replace por cada declaración antigua de `templateDisplayField`; el código de catalyst tenía cero usuarios en árbol al momento del cambio, así que el impacto real del breaking es vacío.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst-cli/tree/1e43a47739202de45970bf29644cd56709d196fa/openspec/changes/archive/2026-05-07-simplify-displayfield-attribute/)
