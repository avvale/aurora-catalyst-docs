---
title: "BFF del satélite alineado a PKCE"
description: "Breaking: el BFF del satélite ahora usa el contrato PKCE /token del hub; se eliminan el canje JSON en /credentials y el client_id con UUID."
date: 2026-06-08
version: "Unreleased"
classification: breaking
source_commit: "f7c1e260443c9310e7e7da7677eb370f1ded29c8"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/f7c1e260443c9310e7e7da7677eb370f1ded29c8/openspec/changes/archive/2026-06-08-align-satellite-oauth-authorization-code/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- **Breaking:** el canje del código pasa de `POST {hub}/api/o-auth/credentials` (JSON) a `POST {hub}/api/o-auth/token` (form-urlencoded, HTTP Basic) con `grant_type=authorization_code`. Se elimina la llamada heredada a `/credentials`.
- `/auth/login` ahora añade PKCE (`code_challenge` + `code_challenge_method=S256`) y envía el `client_id` como el `OAuthApplication.code` (p. ej. `aurora`), no el UUID del `OAuthClient`. El `code_verifier` se guarda en el servidor indexado por `state` y nunca llega al navegador.
- `/auth/refresh` pasa al grant de refresh de `/token`; el secret del cliente se queda solo en el backend (se lee de `OAUTH_APPLICATION_SECRET`) y nunca se incluye en el bundle del frontend.

## Por qué importa

Los satélites construidos para el contrato antiguo de `/credentials` + `client_id` con UUID ahora fallan contra el hub actualizado con `invalid_request` (falta PKCE). Para migrar: vuelve a traer el paquete `authorization-code` (`catalyst add --force`), pon `OAUTH_APPLICATION_CODE` con el código de aplicación (`aurora` — renombrada desde `OAUTH_CLIENT_ID`) y `OAUTH_APPLICATION_SECRET` con su secret, y asegúrate de que el redirect registrado en el cliente del hub coincide exactamente con tu callback. La superficie de cara al navegador (`/auth/login`, `/auth/token` y `/callback`) no cambia, así que el ida y vuelta del frontend no necesita ajustes.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst/tree/f7c1e260443c9310e7e7da7677eb370f1ded29c8/openspec/changes/archive/2026-06-08-align-satellite-oauth-authorization-code/)
