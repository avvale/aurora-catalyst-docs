---
title: "Orquestación iam/account"
description: "`iamCreateAccount` y `iamUpdateAccountById` orquestan unicidad, campos derivados server-side, expansión de tenants, no-escalado y escritura coordinada de IamUser."
date: 2026-05-10
version: "Unreleased"
classification: feature
source_commit: "b9e2580ad11e2388bd4cdecc55ca79cf4a9b51a9"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/b9e2580ad11e2388bd4cdecc55ca79cf4a9b51a9/openspec/changes/archive/2026-05-10-add-iam-account-create-orchestration/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- `IamCreateAccountHandler` y `IamUpdateAccountByIdHandler` se reescriben como orquestadores. Validan unicidad de `email`, `username` y `code` antes del INSERT y lanzan un `ConflictException` localizado (`iam.error.uniqueEmail` / `uniqueUsername` / `uniqueCode`) en lugar de dejar que la base de datos falle con un mensaje opaco.
- Las columnas denormalizadas `dApplicationCodes` y `dPermissions` se calculan ahora server-side desde `client.applications` y `roles.permissions` con el nuevo helper `iamCreatePermissionsFromRoles`. Cualquier valor que envíe el cliente para esos campos se sobrescribe — el servidor es la fuente de verdad.
- Nueva regla anti-escalado: un caller sin `IamPermissions.SUDO` solo puede asignar permisos que ya posee, en otro caso se lanza un `ConflictException` 401 (`iam.error.insufficientPermissions`). `hasAddChildTenants: true` expande `tenantIds` con los descendientes del árbol de tenants.
- Cuando `payload.type === 'USER'`, el handler invoca `IamCreateUserService.main` (y `IamUpdateUserByIdService.main` en update) dentro de la misma operación coordinada, compartiendo un `operationId` para mantener un audit trail coherente. Un `password` vacío en update se elimina del payload del user, así no se sobrescriben passwords sin querer.

## Por qué importa

Antes de este cambio, `IamCreateAccountHandler` era un pass-through fino sobre `repository.create(payload)`. El bloque `user` anidado se ignoraba en silencio, las dos columnas derivadas tenía que inventarlas el frontend (con riesgo de inconsistencia en autorización), la unicidad fallaba en la capa de DB con mensajes no localizados, y cualquier caller autenticado con `iam.account.create` podía escalar privilegios asignando roles que no le correspondían. La nueva orquestación porta la referencia de Aurora monolítico (~225 líneas en `create-account.function.ts`) al patrón canónico de catalyst — el handler orquesta directamente los services inyectados, sin la indirección de `CommandBus`/`QueryBus` — y desbloquea el formulario rico de `iam/account` del cambio dependiente en frontend. A partir de aquí, cualquier proyecto generado con catalyst arranca con una orquestación de iam correcta de extremo a extremo.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst/tree/b9e2580ad11e2388bd4cdecc55ca79cf4a9b51a9/openspec/changes/archive/2026-05-10-add-iam-account-create-orchestration/)
