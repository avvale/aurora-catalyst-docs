---
title: "Revisión automática en TTY"
description: "catalyst generate ahora abre la revisión interactiva de .origin automáticamente en un terminal, con los nuevos flags --review / --no-review para forzar el modo."
date: 2026-06-09
version: "v1.0.2"
classification: feature
source_commit: "dccd05508c72d48b58dce66dcf65099e3581b91f"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/dccd05508c72d48b58dce66dcf65099e3581b91f/openspec/changes/archive/2026-06-09-auto-review-on-tty/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- `catalyst generate` ahora inicia automáticamente el recorrido interactivo de `.origin` cuando la ejecución produjo origins y stdout es un terminal — la misma sesión que ejecuta `catalyst origin review`.
- Añade dos flags mutuamente excluyentes: `--review` fuerza el recorrido aunque no haya TTY, y `--no-review` (reintroducido) fuerza el comportamiento anterior de omitirlo.
- Las ejecuciones en pipes, CI o agentes (sin TTY) conservan la garantía no interactiva y la línea final que apunta a `catalyst origin list` / `catalyst origin review`.

## Por qué importa

Hasta ahora, cada `generate` que producía propuestas `.origin` te obligaba a teclear un segundo comando para actuar sobre ellas, porque el comando nunca preguntaba. La detección de TTY te da la revisión al instante cuando estás en un terminal, mientras la automatización mantiene su garantía de no bloquearse — sin flags que recordar en ninguno de los dos lados. Si la detección se equivoca, los flags explícitos la anulan. Y si terminas la sesión con origins pendientes, el resumen final te dice cuántos quedan.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst-cli/tree/dccd05508c72d48b58dce66dcf65099e3581b91f/openspec/changes/archive/2026-06-09-auto-review-on-tty/)
