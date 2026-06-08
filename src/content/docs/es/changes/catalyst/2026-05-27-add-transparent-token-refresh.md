---
title: "Refresco de token transparente"
description: "Las llamadas GraphQL con access token expirado ahora refrescan y reintentan en silencio en vez de mandar al usuario a login, manteniendo la sesión viva hasta la vida del refresh token."
date: 2026-05-27
version: "Unreleased"
classification: feature
source_commit: "90c8d83a94124dd7b7f6deba51954e65532a393b"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/90c8d83a94124dd7b7f6deba51954e65532a393b/openspec/changes/archive/2026-05-27-add-transparent-token-refresh/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- Cuando una operación GraphQL en página falla con `UNAUTHENTICATED` porque el access token expiró, el error link de Apollo ahora llama de forma transparente a `signInUsingRefreshToken()` y reintenta la operación original en vez de redirigir a login.
- Los 401 concurrentes comparten un único refresco en vuelo, cada operación se reintenta como máximo una vez, y solo las operaciones de usuario lo disparan. La redirección a login solo ocurre cuando el propio refresco no está disponible o falla (`invalid_grant`).

## Por qué importa

Los access token duran alrededor de una hora y los refresh token alrededor de un mes, pero antes cualquier expiración del access token devolvía al usuario a la pantalla de login en la siguiente navegación — aunque el refresh token siguiera siendo válido — forzando un re-login cada hora aproximadamente sin motivo. Ahora la sesión se mantiene viva en silencio hasta la vida del refresh token.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst/tree/90c8d83a94124dd7b7f6deba51954e65532a393b/openspec/changes/archive/2026-05-27-add-transparent-token-refresh/)
