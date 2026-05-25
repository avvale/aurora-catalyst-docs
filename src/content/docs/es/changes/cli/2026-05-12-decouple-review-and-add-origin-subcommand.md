---
title: "Tema origin con seis verbos"
description: "`catalyst origin` aparece con seis verbos idempotentes y `catalyst generate` deja de ejecutar la revisión interactiva; el flag `--no-review` desaparece."
date: 2026-05-12
version: "Unreleased"
classification: breaking
source_commit: "8f2ee6d3f1450981119949419ed519e25bd52177"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/8f2ee6d3f1450981119949419ed519e25bd52177/openspec/changes/archive/2026-05-12-decouple-review-and-add-origin-subcommand/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- BREAKING — `catalyst generate` ya no dispara la revisión interactiva al terminar la ejecución, y el flag `--no-review` desaparece (oclif lo rechaza como flag desconocido). El log final ahora apunta a `catalyst origin list` y `catalyst origin review`.
- Nuevo tema `catalyst origin` con seis subcomandos: `list`, `diff`, `accept`, `reject`, `ignore`, `review`. Cada verbo distinto a `review` admite un pathspec opcional (cwd recursivo si se omite; fichero o directorio en otro caso) y emite un resumen estructurado con `--json` cuando hace falta.
- Los tres verbos mutadores (`accept`, `reject`, `ignore`) son atómicos e idempotentes — invocarlos sobre una ruta sin `.origin` termina en exit 0 con una entrada `noop`, de modo que agentes IA y scripts pueden reintentarlos sin riesgo.

## Por qué importa

El prompt al final de la ejecución era un muro para los consumidores no humanos: pipelines de CI, automatización y agentes IA no podían conducirlo, y `--no-review` solo lo silenciaba sin ofrecer herramientas para gestionar los origins después. Desacoplar generación de revisión significa que `generate` siempre produce ficheros; la revisión es un verbo aparte al que tú decides entrar. `catalyst origin review` mantiene el recorrido interactivo (con `code --diff` cuando VS Code está en el `PATH`), mientras que los otros cinco verbos exponen las mismas operaciones del dominio como comandos atómicos y scripteables — única fuente de verdad, comportamiento idéntico tanto si lo conduce un humano como un script. Migración: quita `--no-review` de tu automatización e invoca `catalyst origin review` tras `generate` si quieres el flujo humano. La próxima release sube major (`2.0.0` → `3.0.0`).

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst-cli/tree/8f2ee6d3f1450981119949419ed519e25bd52177/openspec/changes/archive/2026-05-12-decouple-review-and-add-origin-subcommand/)
