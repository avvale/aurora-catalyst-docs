---
title: "Renombrado `webComponent` a `widget`"
description: "BREAKING — el namespace YAML `webComponent` se renombra a `widget` en todas partes. Cutover en duro, sin alias y sin período de deprecación."
date: 2026-04-26
version: "Unreleased"
classification: breaking
source_commit: "773499a5266d7775d98e956ec8e374ba863f42ba"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/773499a5266d7775d98e956ec8e374ba863f42ba/openspec/changes/archive/2026-04-26-rename-web-component-to-widget/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- El namespace top-level del YAML `webComponent` se renombra a `widget` en todo el schema (`aurora-1.4.json`, el modelo TS, cada helper del generador y cada plantilla Eta).
- Las sub-keys mantienen sus nombres: `widget.type`, `widget.group`, `widget.tab`, `widget.detailSort`, `widget.isDetailHidden`, `widget.listSort`, `widget.isListHidden`, `widget.displayFields`, `widget.className`. Solo se mueve el namespace.
- Un YAML que siga declarando `webComponent:` falla el schema loader con un error descriptivo que indica el fichero afectado y el rename requerido.

## Por qué importa

El nombre anterior confundía los controles de UI de Aurora con el estándar W3C "Web Components" (Custom Elements + Shadow DOM); lo que Aurora emite son componentes Angular. `widget` es neutro respecto al stack, libre de colisiones con `@Component` de Angular, `@Injectable` de NestJS, `FormControl` de Reactive Forms o `<input>` de HTML. Actualiza cada `cliter/**/*.aurora.yaml` en el mismo commit del bump del CLI — el cutover es en duro y no hay alias al que caer. El output generado es byte a byte idéntico para los módulos que actualicen sus YAMLs.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst-cli/tree/773499a5266d7775d98e956ec8e374ba863f42ba/openspec/changes/archive/2026-04-26-rename-web-component-to-widget/)
