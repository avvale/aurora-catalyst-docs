---
title: "Logout RP-initiated del hub"
description: "El cierre de sesión ahora termina la sesión del hub mediante un endpoint navegable y una redirección same-origin, eliminando la re-autenticación silenciosa."
date: 2026-06-09
version: "Unreleased"
classification: feature
source_commit: "2169b75bf56639459517dded70036bba8dfd7255"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/2169b75bf56639459517dded70036bba8dfd7255/openspec/changes/archive/2026-06-09-add-rp-initiated-hub-logout/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- Añade un endpoint navegable del hub `GET /api/o-auth/logout` que borra la cookie `hub_session` y hace un 302 hacia un destino validado, devolviendo `state`; es idempotente cuando no hay sesión.
- Añade una fachada `GET /auth/logout` en el BFF del satélite que reenvía el navegador al hub, y convierte `POST /auth/logout` de un stub vacío en una revocación real del refresh token contra el hub — ambos mantienen la URL del hub y el client secret en el servidor.
- Valida `post_logout_redirect_uri` por same-origin contra el `redirect` registrado del cliente, rechazando destinos de otro origen o no absolutos.

## Por qué importa

Antes, cerrar sesión solo revocaba el par de tokens y limpiaba el almacenamiento local mientras la cookie `httpOnly` `hub_session` sobrevivía — así, la siguiente visita a una ruta protegida re-autenticaba al usuario en silencio: el logout parecía real, pero no lo era. Ahora el cierre de sesión navega a través del BFF hasta el hub, que borra la cookie en su propio dominio, terminando la sesión tanto en topología `local-provider` (mismo origen) como `aurora-hub` (dominio remoto). El frontend nunca conoce la URL del hub — la posee el BFF, de forma simétrica al login. Limitar el destino post-logout al origen registrado evita que el endpoint se convierta en un open redirect.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst/tree/2169b75bf56639459517dded70036bba8dfd7255/openspec/changes/archive/2026-06-09-add-rp-initiated-hub-logout/)
