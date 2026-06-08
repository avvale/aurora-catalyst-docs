---
title: "Emisión de tokens local-provider"
description: "Catalyst ya puede emitir sus propios tokens OAuth2 — grants Password y Refresh de RFC 6749 en POST /api/o-auth/token, firma RS256 y endpoint JWKS — convirtiéndose en autoridad de identidad."
date: 2026-05-26
version: "Unreleased"
classification: feature
source_commit: "d09a8aad9c17a69371d181ee41f89b1a11289662"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/d09a8aad9c17a69371d181ee41f89b1a11289662/openspec/changes/archive/2026-05-26-add-local-provider-oauth2-password-grant/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- Catalyst ya puede **emitir** sus propios tokens mediante la estrategia `local-provider` (`OAUTH_STRATEGY=local-provider`): un nuevo endpoint `POST /api/o-auth/token` que soporta el grant Password (§4.3) y el grant Refresh Token (§6) de RFC 6749, form-urlencoded con autenticación de cliente HTTP Basic.
- Añade firma JWT RS256 con clave local, un endpoint `GET /.well-known/jwks.json` para que otras instancias (en modo `aurora-hub`) verifiquen los tokens, un agregado `OAuthCredential` que registra cada emisión, rate limiting por IP y una purga de retención diaria.

## Por qué importa

Hasta ahora una instalación catalyst solo podía **consumir** tokens de un hub externo — necesitaba una autoridad de identidad aparte a su lado. Con `local-provider`, una sola instalación autentica a sus propios usuarios y se convierte en la autoridad de identidad para los satélites. Los refresh tokens son cadenas opacas aleatorias validadas contra la base de datos, y los access tokens llevan solo el claim mínimo `aci`.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst/tree/d09a8aad9c17a69371d181ee41f89b1a11289662/openspec/changes/archive/2026-05-26-add-local-provider-oauth2-password-grant/)
