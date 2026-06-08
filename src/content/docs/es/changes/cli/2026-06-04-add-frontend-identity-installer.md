---
title: "Instalador Identity frontend"
description: "catalyst add frontend ahora instala el paquete combinado Identity (IAM + OAuth), cableando rutas, navegación, iconos y el adaptador de cuenta IAM en un frontend limpio."
date: 2026-06-04
version: "Unreleased"
classification: feature
source_commit: "4550336b34c6769b5a9ec9625d740be70cb909ec"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/4550336b34c6769b5a9ec9625d740be70cb909ec/openspec/changes/archive/2026-06-04-add-frontend-identity-installer/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- `catalyst add frontend` ahora ofrece un paquete combinado **Identity (IAM + OAuth)** que copia los árboles de ambos miembros en un frontend Aurora limpio.
- El instalador registra rutas de admin, navegación de la barra lateral e iconos para ambos módulos, y cambia `aurora.provider.ts` al adaptador de cuenta actual de IAM para que la sesión respaldada por IAM cargue de verdad. Es idempotente y formatea los ficheros que toca con tu Prettier.

## Por qué importa

Hasta ahora `catalyst add frontend` era solo-copia y dejaba intactos los cuatro ficheros compartidos del scaffold (rutas de admin, datos de navegación, barra lateral, `aurora.provider.ts`) — así que una instalación de identidad quedaba sin rutas, ausente de la barra lateral, sin iconos y atada al adaptador de cuenta anónima. Ahora puedes meter una UI de identidad funcional en un frontend limpio con un solo comando, en espejo del instalador de backend. No añade UI de login, ni dependencias, ni toca el i18n de navegación.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst-cli/tree/4550336b34c6769b5a9ec9625d740be70cb909ec/openspec/changes/archive/2026-06-04-add-frontend-identity-installer/)
