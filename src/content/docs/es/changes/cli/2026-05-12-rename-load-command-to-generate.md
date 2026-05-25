---
title: "Rename load a generate"
description: "El verbo `catalyst load` desaparece y se reemplaza por `catalyst generate` — sin alias, sin deprecación, corte limpio con subida de major version."
date: 2026-05-12
version: "Unreleased"
classification: breaking
source_commit: "d99213d6d26f3485e0bdcbd1fd53e134392b839f"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/d99213d6d26f3485e0bdcbd1fd53e134392b839f/openspec/changes/archive/2026-05-12-rename-load-command-to-generate/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- BREAKING — `catalyst load <scope> module` desaparece. La invocación canónica pasa a ser `catalyst generate <scope> module --name=<bounded-context>/<module>`. No hay alias, ni warning de deprecación, ni shim; ejecutar `catalyst load …` devuelve el error "command not found" de oclif.
- El mensaje de guía emitido por el generator en `front.handler.ts` — la pista cross-aggregate de los widgets `grid-elements-manager` cuando el target no declara `front.embedSupport: true` — ahora menciona `aurora generate`.
- `docs/load.md` desaparece; `docs/generate.md` lo reemplaza (regenerado por `pnpm prepack`). El nuevo spec `module-generation-cli` codifica el verbo canónico y la gramática del argumento `<bounded-context>/<module>`.

## Por qué importa

`load` describía un paso interno (cargar el YAML en memoria) en lugar de lo que el usuario realmente quiere hacer: producir o regenerar código. El nuevo verbo se alinea con las convenciones del sector (`ng generate`, `nest generate`, `rails generate`) y con los nombres ya existentes de los specs (`frontend-module-generator`, `sequelize-repository-generator`). El codegen de Aurora es idempotente por diseño: las preservation regions, los overwrites guiados por lockfile y el bucle de revisión de `.origin` parten todos de la idea de que vas a re-ejecutar el comando a medida que el YAML evoluciona, y `generate` hace ese contrato visible desde la propia línea de comandos. La migración es un `sed -i 's/catalyst load/catalyst generate/g'` sobre tus scripts y tu docs. La próxima release sube major (`1.0.0` → `2.0.0`).

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst-cli/tree/d99213d6d26f3485e0bdcbd1fd53e134392b839f/openspec/changes/archive/2026-05-12-rename-load-command-to-generate/)
