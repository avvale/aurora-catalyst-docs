---
title: "Instalador Identity backend"
description: "catalyst add backend ahora instala iam + o-auth juntos en modo local-provider, cablea el composition root de bridges y deja un login local funcionando."
date: 2026-06-04
version: "Unreleased"
classification: feature
source_commit: "bc7af6679d2605e11d4d231e2c3f8c05cddf7d61"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/bc7af6679d2605e11d4d231e2c3f8c05cddf7d61/openspec/changes/archive/2026-06-04-add-identity-package-installer/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- `catalyst add backend` ahora ofrece un paquete combinado **Identity (IAM + OAuth)** que instala iam + o-auth juntos en modo local-provider y deja la instalación funcionando de punta a punta.
- El instalador cablea el composition root `@bridges/bridges.module.ts` (solo tokens Symbol), pone `OAUTH_STRATEGY=local-provider` de forma idempotente, instala la unión de las dependencias de runtime de ambos módulos y regenera los tipos GraphQL. Se eliminan los instaladores sueltos y obsoletos de `iam` / `o-auth`.

## Por qué importa

Antes, el único instalador de backend era el de satélite "Authorization Code", y los instaladores `iam` / `o-auth` estaban escritos contra un layout anterior a la reestructuración y reventaban en la primera llamada — un scaffold nuevo no tenía forma de obtener una identidad local real. Ahora un solo comando te da un login local-provider respaldado por IAM. Identity es indivisible (el bridge cross-BC `iam-client-reader` acopla ambos), así que no hay instalación suelta de iam ni de o-auth. El instalador no toca `auth.decorator.ts` ni ejecuta claves/seeders.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst-cli/tree/bc7af6679d2605e11d4d231e2c3f8c05cddf7d61/openspec/changes/archive/2026-06-04-add-identity-package-installer/)
