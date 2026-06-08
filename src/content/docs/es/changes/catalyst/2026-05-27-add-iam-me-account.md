---
title: "Query de cuenta autenticada"
description: "Una nueva query iamMeAccount (REST + GraphQL) devuelve la cuenta logueada desde el contexto de la petición — agnóstica a la estrategia y solo autenticada, sin gate de permisos."
date: 2026-05-27
version: "Unreleased"
classification: feature
source_commit: "1447bcf2114d4076395f7fc237d6464c7d1728cf"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/1447bcf2114d4076395f7fc237d6464c7d1728cf/openspec/changes/archive/2026-05-27-add-iam-me-account/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- Añade la query `iamMeAccount` (REST + GraphQL) que devuelve la única cuenta autenticada desde el contexto de la petición — nombre, email, roles, permisos y tenants — sin re-leer la base de datos.
- Es solo-autenticada (JWT válido, sin gate de permiso `iam.account.get`), así que leer tu propio perfil nunca exige permisos de administración de cuentas, y es agnóstica a la estrategia: el mismo contrato funciona bajo `local-provider` y `aurora-hub`.

## Por qué importa

El access token solo lleva `aci` (el id de cuenta), y no había una lectura de "mi cuenta" funcional — la barra lateral del admin mostraba un usuario fijo. Ahora el frontend resuelve al usuario logueado real con una sola query, sea cual sea el `OAUTH_STRATEGY`. Los satélites en modo hub llaman a la misma query `iamMeAccount` contra el hub para hidratar la cuenta.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst/tree/1447bcf2114d4076395f7fc237d6464c7d1728cf/openspec/changes/archive/2026-05-27-add-iam-me-account/)
