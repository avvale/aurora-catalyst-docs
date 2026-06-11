---
title: "Permisos de acceso por app"
description: "Cada app satélite obtiene ahora su propio permiso IAM <code>.access; el dashboard del HUB muestra a cada usuario solo las apps que sus roles le conceden."
date: 2026-06-11
version: "Unreleased"
classification: feature
source_commit: "a19011dbe0608c483e3027375cd1d56cbd8c344a"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/a19011dbe0608c483e3027375cd1d56cbd8c344a/openspec/changes/archive/2026-06-11-add-hub-per-app-access-permission/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- Registrar una app satélite ahora también crea un bounded context IAM con el nombre del `code` de la app y un permiso dinámico `<code>.access` adjunto al rol Administrator — dentro de la misma transacción atómica de registro. Borrar la app elimina ambos.
- La lectura del dashboard filtra en el servidor: un usuario ve solo las apps cuyo permiso `<code>.access` le conceden sus roles; los administradores las ven todas porque poseen todos los permisos, sin casos especiales.
- Un guard de colisión de namespace hace fallar el registro completo cuando el `code` choca con un bounded context o permiso existente, y un paso idempotente de arranque crea el permiso para las apps registradas antes de este cambio.

## Por qué importa

Hasta ahora, cualquiera que pudiera abrir el dashboard veía todas las apps registradas. Ahora puedes conceder acceso app por app desde la UI estándar de roles de IAM — cada satélite usa la forma habitual `<bc>.access` de la plataforma, igual que `hub.access` protege el propio HUB. Las concesiones llegan al usuario en su siguiente login o renovación de token. Aplicar el permiso en el flujo authorize de OAuth es un follow-up anotado; este cambio controla la visibilidad del dashboard.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst/tree/a19011dbe0608c483e3027375cd1d56cbd8c344a/openspec/changes/archive/2026-06-11-add-hub-per-app-access-permission/)
