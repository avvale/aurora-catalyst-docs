---
title: "Login GraphQL en local provider"
description: "Una nueva mutation GraphQL oAuthCreateToken (grants Password + Refresh) completa el login local-provider en el navegador, gemela del endpoint REST de tokens."
date: 2026-05-26
version: "Unreleased"
classification: feature
source_commit: "2ba8a72f3e1aff639b3182bfdb5cc4d8aed0a987"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/2ba8a72f3e1aff639b3182bfdb5cc4d8aed0a987/openspec/changes/archive/2026-05-26-add-local-provider-graphql-login/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- Añade la mutation GraphQL `oAuthCreateToken(payload: OAuthCreateTokenInput!): OAuthTokens!` (grants Password y Refresh Token) — gemela del REST `POST /api/o-auth/token`, ambas delegando en el mismo handler compuesto.
- Conecta el formulario de login de Aurora con esa mutation: estado de carga durante la petición, verificación del guard, redirección a `/` al acertar (y permanencia en `/auth/sign-in` al fallar), y `authenticationPasswordGuard` en las rutas protegidas. Los textos del login son traducibles.

## Por qué importa

El backend local-provider traía un endpoint REST de tokens, pero el frontend llamaba a una mutation GraphQL que no existía — así que el formulario de login estaba roto contra él. Ahora el flujo funciona de punta a punta en el navegador. REST queda para clientes externos conformes a RFC 6749; GraphQL sirve a los frontends propios de Aurora — un mismo flujo de negocio sobre dos transportes. Un `grant_type` no soportado devuelve un error conforme a OAuth2.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst/tree/2ba8a72f3e1aff639b3182bfdb5cc4d8aed0a987/openspec/changes/archive/2026-05-26-add-local-provider-graphql-login/)
