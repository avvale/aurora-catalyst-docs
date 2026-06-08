---
title: "Flujo Authorization Code con PKCE"
description: "El hub ahora expone GET /api/o-auth/authorize y acepta el grant authorization_code con PKCE S256 obligatorio, códigos de un solo uso y una cookie de sesión del hub."
date: 2026-06-08
version: "Unreleased"
classification: feature
source_commit: "f7c1e260443c9310e7e7da7677eb370f1ded29c8"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/f7c1e260443c9310e7e7da7677eb370f1ded29c8/openspec/changes/archive/2026-06-08-add-oauth-authorization-code-flow/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- Añade `GET /api/o-auth/authorize` (RFC 6749 §4.1): valida el cliente, compara el `redirect_uri` contra el registrado de forma exacta, exige un `state` no vacío, obliga a PKCE y hace un 302 de vuelta con un `code` de un solo uso y vida corta.
- Amplía `POST /api/o-auth/token` con un tercer grant — `authorization_code` — que se canjea con un `code_verifier` mediante HTTP Basic. Los códigos son de un solo uso (se marcan de forma atómica) y caducan en ~60s; el PKCE S256 se verifica en el canje.
- Añade una cookie `hub_session` (JWT RS256 httpOnly) para que el usuario autenticado no tenga que volver a identificarse; una petición a authorize sin sesión rebota al `/sign-in?continue=…` del hub.

## Por qué importa

El hub es ahora un proveedor OAuth2 Authorization Code completo, así que las apps satélite pueden delegarle el login en lugar de chocar con `404 Cannot GET /api/o-auth/authorize`. El PKCE S256 es obligatorio y el endpoint de authorize falla en cerrado — nunca redirige ante un error de validación, eliminando la superficie de open-redirect. Los grants Password y Refresh Token quedan intactos, de modo que los clientes de token existentes siguen funcionando. La autorización sigue basándose en permisos (`dPermissions` vía `iamMeAccount`); el `scope` de OAuth es un passthrough cosmético y no concede nada.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst/tree/f7c1e260443c9310e7e7da7677eb370f1ded29c8/openspec/changes/archive/2026-06-08-add-oauth-authorization-code-flow/)
