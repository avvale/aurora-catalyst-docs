---
title: Referencia
description: Referencia técnica autogenerada de Aurora Catalyst.
---

La referencia está **orientada a la información**: exacta, completa, consultable rápido.

La mayor parte de esta sección se **autogenera** desde los repos de Aurora mediante el script `import-from-catalyst` y una GitHub Action programada. No edites las páginas autogeneradas a mano — se sobreescriben en la próxima importación.

## Qué vive aquí

- **Comandos del CLI** — cada `catalyst <comando>` con sus flags, args y ejemplos (generado por `oclif readme`).
- **API** — superficie TypeScript pública de `aurora-catalyst-cli` (generada por TypeDoc).
- **Esquema YAML** — referencia completa de los campos de `{bc}.aurora.yaml`.
- **Lockfile** — estructura de `cliter/{bc}/.locks/{scope}/{module}.lock.json`, incluyendo el campo `regions`.

## Qué NO vive aquí

- Tutoriales → [`/es/tutorials/`](/es/tutorials/)
- Guías → [`/es/guides/`](/es/guides/)
- Fondo conceptual → [`/es/concepts/`](/es/concepts/)
