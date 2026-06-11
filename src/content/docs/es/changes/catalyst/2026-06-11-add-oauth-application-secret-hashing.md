---
title: "Secrets de cliente hasheados"
description: "BREAKING: OAuthApplication.secret se guarda ahora como hash bcrypt, se enmascara en toda lectura y se verifica con bcrypt.compare; los environments del frontend deben llevar el secret en claro."
date: 2026-06-11
version: "Unreleased"
classification: breaking
source_commit: "2a40bd9908012dcab4ec010b5bcc19a4361d2137"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/2a40bd9908012dcab4ec010b5bcc19a4361d2137/openspec/changes/archive/2026-06-11-add-oauth-application-secret-hashing/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- **Breaking:** `OAuthApplication.secret` se persiste ahora como hash bcrypt y se enmascara a `undefined` en toda ruta de lectura; la autenticación de cliente verifica el `client_secret` presentado con `bcrypt.compare` en todos los grants (password, authorization_code, refresh_token).
- **Breaking:** los ficheros `environment*.ts` del frontend deben llevar el secret en claro en `oAuth.applicationSecret` — el antiguo literal con el hash precomputado ya no autentica.
- El seeder de arranque siembra ahora un valor en claro que se hashea al escribir, reconcilia el drift con `bcrypt.compare` para que los reinicios nunca hagan doble hash, y repara en el arranque un secret de bootstrap heredado sin hashear.

## Por qué importa

Los secrets se guardaban como el valor literal enviado por el cliente, así que cualquier lectura de la base de datos, listado de administración o volcado de backup exponía todos los `client_secret` usables de la plataforma. La ruta de migración: actualiza los environments del frontend al secret en claro y, para las apps satélite provisionadas antes de este cambio, sigue la estrategia documentada de re-registro / detect-and-hash — de lo contrario sus logins fallarán la comparación bcrypt. El paquete de credenciales de un solo uso sigue devolviendo el valor en claro; solo cambia la representación en reposo.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst/tree/2a40bd9908012dcab4ec010b5bcc19a4361d2137/openspec/changes/archive/2026-06-11-add-oauth-application-secret-hashing/)
