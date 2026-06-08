---
title: "Modo de autenticación none"
description: "OAUTH_STRATEGY gana un modo none para arranque sin claves, y su default pasa de aurora-hub a none — un cambio breaking para despliegues que dependen del default implícito."
date: 2026-06-02
version: "Unreleased"
classification: breaking
source_commit: "eea7ce68b8e9d26500fe7263b3987bb0d4046ff0"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/eea7ce68b8e9d26500fe7263b3987bb0d4046ff0/openspec/changes/archive/2026-06-02-authentication-none-mode/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- **Breaking:** el `OAUTH_STRATEGY` por defecto pasa de `aurora-hub` a **`none`**. Un despliegue que dependía del default implícito `aurora-hub` arrancará con la autenticación desactivada tras actualizar, salvo que ponga `OAUTH_STRATEGY=aurora-hub` explícitamente.
- Añade `none` como tercera estrategia: las peticiones llegan como una cuenta anónima sin permisos, los endpoints sin permiso declarado pasan a ser públicos, y el backend arranca sin claves OAuth. Se registra un aviso prominente en el boot mientras `none` está activo.

## Por qué importa

Antes un clone limpio no arrancaba — el firmador de JWT lee una clave privada en su construcción con fail-fast, así que sin claves (o sin un proveedor completo) la app moría al arrancar. `none` es un estado de arranque deliberado y transitorio: la app levanta usable y cambias a `local-provider` o `aurora-hub` cuando configuras la identidad. Para migrar, pon `OAUTH_STRATEGY` explícitamente a tu estrategia real. Los endpoints `@Auth('permiso')` siguen devolviendo 403 bajo `none`.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst/tree/eea7ce68b8e9d26500fe7263b3987bb0d4046ff0/openspec/changes/archive/2026-06-02-authentication-none-mode/)
