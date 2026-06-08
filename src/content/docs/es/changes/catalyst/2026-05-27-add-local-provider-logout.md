---
title: "Logout y revocación de token"
description: "Un nuevo flujo de revocación (POST /api/o-auth/revoke, RFC 7009, más su gemela GraphQL) termina una sesión local-provider en el servidor en vez de solo limpiar el almacenamiento local."
date: 2026-05-27
version: "Unreleased"
classification: feature
source_commit: "1447bcf2114d4076395f7fc237d6464c7d1728cf"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/1447bcf2114d4076395f7fc237d6464c7d1728cf/openspec/changes/archive/2026-05-27-add-local-provider-logout/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- Añade un flujo de revocación de token: `POST /api/o-auth/revoke` (RFC 7009) y su gemela GraphQL `oAuthRevokeToken`. El refresh token presentado y su access token emparejado se marcan como revocados, así que cualquier refresco posterior colapsa a `invalid_grant`.
- La autenticación del cliente es HTTP Basic; la revocación es idempotente y no enumerable (los tokens desconocidos o ya revocados devuelven éxito) y tiene rate limiting a la par de la emisión. El logout del frontend está conectado para dispararla.

## Por qué importa

El login local-provider funcionaba, pero no había logout — el refresh token opaco de un usuario "deslogueado" seguía válido en la base de datos hasta su expiración natural, así que un token capturado seguía emitiendo access tokens después de que la sesión supuestamente terminara. Ahora el logout termina la sesión en el servidor, no solo limpiando el almacenamiento local.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst/tree/1447bcf2114d4076395f7fc237d6464c7d1728cf/openspec/changes/archive/2026-05-27-add-local-provider-logout/)
